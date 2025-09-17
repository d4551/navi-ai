/**
 * Studio Normalization Utilities
 * - Standardizes size buckets, region inference, technology/tag mapping, role dedupe
 * - Prepares data for indexing & persistence
 */
import { GAMING_STUDIOS } from '@/shared/constants/gaming-studios'
import type { GameStudio } from '@/shared/types/interview'

export interface NormalizedStudio extends GameStudio {
  normalized: {
    region: string
    sizeBucket: 'Indie' | 'Small' | 'Mid' | 'Large' | 'Enterprise'
    categories: string[]
    techTags: string[]
    roleCategories: string[]
    searchTokens: string[]
  }
}

// Region heuristics
export function inferRegion(headquarters: string): string {
  const hq = (headquarters || '').toLowerCase()
  if (
    /seattle|los angeles|irvine|austin|new york|san francisco|usa|u\.s\.|united states|california|washington|texas/.test(
      hq
    )
  )
    return 'North America'
  if (/montreal|vancouver|canada/.test(hq)) return 'North America'
  if (
    /london|paris|berlin|france|germany|poland|sweden|helsinki|copenhagen|europe|amsterdam|netherlands|finland|denmark/.test(
      hq
    )
  )
    return 'Europe'
  if (
    /tokyo|kyoto|osaka|japan|seoul|korea|shanghai|beijing|china|singapore|asia/.test(
      hq
    )
  )
    return 'Asia'
  return 'Other'
}

// Size description -> bucket
export function sizeToBucket(
  sizeDesc: string
): NormalizedStudio['normalized']['sizeBucket'] {
  const s = (sizeDesc || '').toLowerCase()
  if (/^\s*(1-10|11-50|under 50|< ?50)/.test(s) || /indie|startup/.test(s))
    return 'Indie'
  if (/50-199|50-200|small|100-199/.test(s)) return 'Small'
  if (/200-499|200-500|mid|medium/.test(s)) return 'Mid'
  if (/500-1999|500-2000|large/.test(s)) return 'Large'
  if (/2000|3000|4000|5000|enterprise|\+/.test(s)) return 'Enterprise'
  return 'Mid'
}

// Optional categories (fallback empty if not available)
const STUDIO_CATEGORIES: Record<string, string[]> = {}
// Build reverse category map for quick lookup
const categoryIndex: Record<string, string[]> = {}
for (const [cat, ids] of Object.entries(STUDIO_CATEGORIES)) {
  for (const id of ids) {
    if (!categoryIndex[id]) categoryIndex[id] = []
    categoryIndex[id].push(cat)
  }
}

// Technology canonicalization (derived from data)
const ALL_TECHS = Array.from(
  new Set(Object.values(GAMING_STUDIOS).flatMap(s => s.technologies || []))
)
const techCanonical = ALL_TECHS.reduce<Record<string, string>>((map, t) => {
  if (t && typeof t === 'string') {
    map[t.toLowerCase()] = t
  }
  return map
}, {})

// Role -> category map (heuristic fallback)
const roleCategoryMap: Record<string, string> = {}
const mapRoleToCategory = (role: string): string => {
  const r = role.toLowerCase()
  if (
    /engineer|programmer|developer|architect|devops|platform|graphics|backend|frontend|full\s*stack/.test(
      r
    )
  )
    return 'ENGINEERING'
  if (/designer|design|ux|ui|quest|level|systems|narrative/.test(r))
    return 'DESIGN'
  if (
    /artist|art|animator|vfx|concept|technical artist|modeler|environment/.test(
      r
    )
  )
    return 'ART'
  if (/producer|product|project|scrum|manager|director/.test(r))
    return 'PRODUCTION'
  if (/audio|sound|music|voice/.test(r)) return 'AUDIO'
  if (/data|analytics|scientist|analyst|research/.test(r))
    return 'DATA_ANALYTICS'
  if (/community|relations|marketing|social|content/.test(r)) return 'COMMUNITY'
  return 'OTHER'
}
Object.values(GAMING_STUDIOS).forEach(s => {
  ;(s.commonRoles || []).forEach(r => {
    roleCategoryMap[r.toLowerCase()] = mapRoleToCategory(r)
  })
})

export function normalizeStudio(studio: GameStudio): NormalizedStudio {
  const region = studio.region || inferRegion(studio.headquarters)
  const sizeBucket = sizeToBucket(studio.size)
  const categories = categoryIndex[studio.id] || []
  const techTags = Array.from(
    new Set(
      (studio.technologies || []).map(t => techCanonical[t.toLowerCase()] || t)
    )
  ).sort()
  const roleCategories = Array.from(
    new Set(
      (studio.commonRoles || [])
        .map(r => roleCategoryMap[r.toLowerCase()])
        .filter(Boolean)
    )
  ).sort()
  const searchTokens = buildSearchTokens(studio, {
    region,
    sizeBucket,
    categories,
    techTags,
    roleCategories,
  })
  return {
    ...studio,
    normalized: {
      region,
      sizeBucket,
      categories,
      techTags,
      roleCategories,
      searchTokens,
    },
  }
}

export function buildSearchTokens(
  studio: GameStudio,
  extras: {
    region: string
    sizeBucket: string
    categories: string[]
    techTags: string[]
    roleCategories: string[]
  }
): string[] {
  const base = [studio.name, studio.description, studio.headquarters].concat(
    studio.games,
    studio.technologies,
    studio.commonRoles
  )
  base.push(
    extras.region,
    extras.sizeBucket,
    ...extras.categories,
    ...extras.techTags,
    ...extras.roleCategories
  )
  return Array.from(new Set(base.filter(Boolean).map(s => s.toLowerCase())))
}

export function buildNormalizedStudios(
  source: Record<string, GameStudio> = GAMING_STUDIOS
) {
  return Object.values(source).map(normalizeStudio)
}

// Lightweight in-memory index for fuzzy search (token prefix map)
export function buildTokenIndex(list: NormalizedStudio[]) {
  const index: Record<string, Set<string>> = {}
  for (const s of list) {
    for (const token of s.normalized.searchTokens) {
      const key = token.slice(0, 3) // prefix
      if (!index[key]) index[key] = new Set()
      index[key].add(s.id)
    }
  }
  return index
}

// Levenshtein distance for tie-breaking (optimized for short strings)
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  const matrix = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(null))

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      )
    }
  }

  return matrix[b.length][a.length]
}

export function fuzzyMatchStudios(
  query: string,
  index: Record<string, Set<string>>,
  studios: Record<string, NormalizedStudio>
) {
  if (!query.trim()) return []
  const q = query.toLowerCase()
  const qLen = q.length

  // Enhanced prefix matching for better coverage
  const prefixes = new Set<string>()
  if (qLen >= 1) prefixes.add(q.slice(0, 1))
  if (qLen >= 2) prefixes.add(q.slice(0, 2))
  if (qLen >= 3) prefixes.add(q.slice(0, 3))
  if (qLen >= 4) prefixes.add(q.slice(0, 4))

  const candidateIds = new Set<string>()
  for (const prefix of prefixes) {
    const matches = index[prefix]
    if (matches) {
      for (const id of matches) candidateIds.add(id)
    }
  }

  // Enhanced scoring with multiple criteria and tie-breakers
  return Array.from(candidateIds)
    .map(id => {
      const s = studios[id]
      if (!s) return null

      const tokens = s.normalized.searchTokens || []
      const name = s.name.toLowerCase()
      let score = 0
      let bestDistance = Infinity
      let matchType = ''

      // Exact matches get highest priority
      if (tokens.some(t => t === q)) {
        score = 100
        matchType = 'exact'
        bestDistance = 0
      }
      // Studio name exact match
      else if (name === q) {
        score = 95
        matchType = 'name-exact'
        bestDistance = 0
      }
      // Studio name starts with query
      else if (name.startsWith(q)) {
        score = 85
        matchType = 'name-prefix'
        bestDistance = levenshteinDistance(q, name.slice(0, q.length))
      }
      // Token prefix matches
      else if (tokens.some(t => t.startsWith(q))) {
        score = 75
        matchType = 'token-prefix'
        const prefixTokens = tokens.filter(t => t.startsWith(q))
        bestDistance = Math.min(
          ...prefixTokens.map(t => levenshteinDistance(q, t.slice(0, q.length)))
        )
      }
      // Studio name contains query
      else if (name.includes(q)) {
        score = 65
        matchType = 'name-contains'
        // Find best substring match position
        const pos = name.indexOf(q)
        bestDistance = levenshteinDistance(q, name.slice(pos, pos + q.length))
      }
      // Token contains query
      else if (tokens.some(t => t.includes(q))) {
        score = 55
        matchType = 'token-contains'
        const containingTokens = tokens.filter(t => t.includes(q))
        bestDistance = Math.min(
          ...containingTokens.map(t => {
            const pos = t.indexOf(q)
            return levenshteinDistance(q, t.slice(pos, pos + q.length))
          })
        )
      }
      // Fuzzy match based on Levenshtein distance (for typos)
      else {
        // Check name and top tokens for close matches
        const nameDistance = levenshteinDistance(q, name)
        const tokenDistances = tokens
          .slice(0, 5)
          .map(t => levenshteinDistance(q, t))
        const minDistance = Math.min(nameDistance, ...tokenDistances)

        // Threshold based on query length (more lenient for longer queries)
        const threshold = Math.max(1, Math.floor(qLen * 0.4))

        if (minDistance <= threshold) {
          score = Math.max(10, 45 - minDistance * 10)
          matchType = 'fuzzy'
          bestDistance = minDistance
        }
      }

      if (score === 0) return null

      return {
        id,
        score,
        distance: bestDistance,
        matchType,
        studio: s,
      }
    })
    .filter(Boolean)
    .sort((a, b) => {
      // Primary sort: score (higher is better)
      if (a && b && a.score !== b.score) return b.score - a.score

      // Secondary sort: distance (lower is better)
      if (a && b && a.distance !== b.distance) return a.distance - b.distance

      // Tertiary sort: studio name length (shorter is better for exact matches)
      if (a && b) return a.studio.name.length - b.studio.name.length

      return 0
    })
}

export default {
  inferRegion,
  sizeToBucket,
  normalizeStudio,
  buildNormalizedStudios,
  buildTokenIndex,
  fuzzyMatchStudios,
}
