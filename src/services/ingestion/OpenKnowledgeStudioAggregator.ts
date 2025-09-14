/**
 * OpenKnowledgeStudioAggregator
 * Aggregates gaming studio intel from open knowledge sources:
 * - Wikidata (SPARQL)
 * - Wikipedia (REST)
 * - DBpedia (SPARQL)
 * - GitHub (public org search; optional token)
 *
 * Note: Designed for browser usage with CORS-friendly requests.
 */

export type OpenStudio = {
  name: string
  sources: string[]
  website?: string
  employees?: number | string
  founded?: string | number
  country?: string
  headquarters?: string
  summary?: string
  links?: Record<string, any>
}

// Lightweight utilities
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))
const safeJson = async (res: Response) => {
  try { return await res.json() } catch { return null }
}

// Wikidata queries
const wikidataQueries = {
  getAllStudios: `
    SELECT DISTINCT ?studio ?studioLabel ?foundedDate ?dissolvedDate ?countryLabel 
                    ?headquartersLabel ?officialWebsite ?employeeCount 
                    ?parentCompanyLabel ?industryLabel WHERE {
      ?studio wdt:P31/wdt:P279* wd:Q210167 .
      OPTIONAL { ?studio wdt:P571 ?foundedDate }
      OPTIONAL { ?studio wdt:P576 ?dissolvedDate }
      OPTIONAL { ?studio wdt:P17 ?country }
      OPTIONAL { ?studio wdt:P159 ?headquarters }
      OPTIONAL { ?studio wdt:P856 ?officialWebsite }
      OPTIONAL { ?studio wdt:P1128 ?employeeCount }
      OPTIONAL { ?studio wdt:P749 ?parentCompany }
      OPTIONAL { ?studio wdt:P452 ?industry }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en" }
    }
    ORDER BY ?studioLabel
    LIMIT 500
  `,
}

async function queryWikidata(query: string) {
  const url = 'https://query.wikidata.org/sparql'
  const params = new URLSearchParams({ query, format: 'json' })
  const res = await fetch(`${url}?${params}`, { headers: { Accept: 'application/sparql-results+json' } })
  const data = await safeJson(res)
  return Array.isArray(data?.results?.bindings) ? data.results.bindings : []
}

// Wikipedia
class WikipediaAPI {
  baseUrl = 'https://en.wikipedia.org/w/api.php'
  async getGameDevelopers() {
    const params = new URLSearchParams({
      action: 'query', list: 'categorymembers', cmtitle: 'Category:Video_game_development_companies',
      cmlimit: '300', format: 'json', origin: '*'
    })
    const res = await fetch(`${this.baseUrl}?${params}`)
    const data = await safeJson(res)
    return data?.query?.categorymembers || []
  }
  async getPageSummary(title: string) {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
    return await safeJson(res)
  }
}

// DBpedia
const dbpediaQueries = {
  getDevelopers: `
    SELECT DISTINCT ?company ?name ?abstract ?founded ?headquarters 
                    ?parentCompany ?website WHERE {
      ?company a dbo:VideoGameDeveloper ;
               rdfs:label ?name ;
               dbo:abstract ?abstract .
      OPTIONAL { ?company dbo:foundingDate ?founded }
      OPTIONAL { ?company dbo:locationCity ?headquarters }
      OPTIONAL { ?company foaf:homepage ?website }
      FILTER (lang(?name) = 'en' && lang(?abstract) = 'en')
    }
    LIMIT 300
  `,
}

async function queryDBpedia(query: string) {
  const url = 'https://dbpedia.org/sparql'
  const params = new URLSearchParams({ query, format: 'application/sparql-results+json' })
  // Use GET for better CORS compatibility
  const res = await fetch(`${url}?${params}`, { headers: { Accept: 'application/sparql-results+json' } })
  const data = await safeJson(res)
  return Array.isArray(data?.results?.bindings) ? data.results.bindings : []
}

// GitHub (optional token)
class GitHubAPI {
  baseUrl = 'https://api.github.com'
  headers: Record<string, string>
  constructor(token?: string | null) {
    this.headers = { Accept: 'application/vnd.github.v3+json' }
    if (token) this.headers['Authorization'] = `token ${token}`
  }
  async searchGameStudios() {
    const queries = [
      'type:org game studio', 'type:org game development', 'type:org gamedev', 'type:org indie game', 'type:org gaming company'
    ]
    const all: any[] = []
    for (const q of queries) {
      try {
        const url = `${this.baseUrl}/search/users?q=${encodeURIComponent(q)}&per_page=30`
        const res = await fetch(url, { headers: this.headers })
        if (res.ok) {
          const data = await safeJson(res)
          if (Array.isArray(data?.items)) all.push(...data.items)
        }
      } catch {}
      await delay(1200)
    }
    return all
  }
  async getOrgDetails(login: string) {
    try {
      const res = await fetch(`${this.baseUrl}/orgs/${login}`, { headers: this.headers })
      return res.ok ? await safeJson(res) : null
    } catch { return null }
  }
}

export class OpenKnowledgeStudioAggregator {
  private gh: GitHubAPI
  private wiki = new WikipediaAPI()
  constructor(githubToken?: string | null) {
    this.gh = new GitHubAPI(githubToken || null)
  }

  async fetchWikidata(): Promise<OpenStudio[]> {
    const rows = await queryWikidata(wikidataQueries.getAllStudios)
    return rows.map((r: any) => ({
      name: r?.studioLabel?.value,
      founded: r?.foundedDate?.value,
      country: r?.countryLabel?.value,
      headquarters: r?.headquartersLabel?.value,
      website: r?.officialWebsite?.value,
      employees: r?.employeeCount?.value,
      sources: ['wikidata'],
      links: { wikidata: r?.studio?.value }
    })).filter(s => !!s.name)
  }

  async fetchWikipedia(): Promise<OpenStudio[]> {
    const devs = await this.wiki.getGameDevelopers()
    const detailed: OpenStudio[] = []
    for (const item of devs.slice(0, 60)) { // cap for UX
      const summary = await this.wiki.getPageSummary(item.title)
      if (summary?.title) {
        detailed.push({ name: summary.title, summary: summary.extract, website: summary?.content_urls?.desktop?.page, sources: ['wikipedia'], links: { wikipedia: summary } })
      }
      await delay(300)
    }
    return detailed
  }

  async fetchDBpedia(): Promise<OpenStudio[]> {
    const rows = await queryDBpedia(dbpediaQueries.getDevelopers)
    return rows.map((r: any) => ({
      name: r?.name?.value,
      summary: r?.abstract?.value,
      founded: r?.founded?.value,
      headquarters: r?.headquarters?.value,
      website: r?.website?.value,
      sources: ['dbpedia']
    })).filter(s => !!s.name)
  }

  async fetchGitHub(): Promise<OpenStudio[]> {
    const orgs = await this.gh.searchGameStudios()
    const result: OpenStudio[] = []
    for (const org of orgs.slice(0, 30)) {
      const details = await this.gh.getOrgDetails(org.login)
      if (!details) continue
      result.push({
        name: details.name || org.login,
        website: details.blog || details.html_url,
        sources: ['github'],
        links: { github: details }
      })
      await delay(400)
    }
    return result
  }

  private normalizeName(name: string) {
    return String(name || '').toLowerCase().replace(/\s+(inc|llc|ltd|limited|corporation|corp|co|studio|studios|games|gaming|entertainment)\.?$/gi, '').replace(/[^\w\s]/g, '').trim()
  }

  private dedupe(studios: OpenStudio[]): OpenStudio[] {
    const map = new Map<string, OpenStudio>()
    for (const s of studios) {
      const key = this.normalizeName(s.name)
      if (!key) continue
      if (map.has(key)) {
        const prev = map.get(key)!
        map.set(key, {
          ...prev,
          ...s,
          sources: Array.from(new Set([...(prev.sources||[]), ...(s.sources||[])])),
          links: { ...(prev.links||{}), ...(s.links||{}) }
        })
      } else {
        map.set(key, s)
      }
    }
    return Array.from(map.values())
  }

  async aggregateAll(options: { githubToken?: string | null, include?: Array<'wikidata'|'wikipedia'|'dbpedia'|'github'> } = {}) {
    const include = options.include || ['wikidata', 'wikipedia', 'dbpedia']
    const tasks: Array<Promise<OpenStudio[]>> = []
    if (include.includes('wikidata')) tasks.push(this.fetchWikidata())
    if (include.includes('wikipedia')) tasks.push(this.fetchWikipedia())
    if (include.includes('dbpedia')) tasks.push(this.fetchDBpedia())
    if (include.includes('github')) tasks.push(this.fetchGitHub())

    const settled = await Promise.allSettled(tasks)
    const chunks = settled.flatMap(s => s.status === 'fulfilled' ? s.value : [])
    const studios = this.dedupe(chunks)
    return { studios, total: studios.length, included: include, fetchedAt: new Date().toISOString() }
  }
}

export default OpenKnowledgeStudioAggregator

