/*
 * Studio deduplication & normalization utilities
 * Extracted from StudioDatabase view so they can be unit tested and reused.
 */
export interface GenericStudioRecord {
  id?: string
  name: string
  description?: string
  games?: string[]
  technologies?: string[]
  dataSource?: string[]
  confidence?: number
  [k: string]: any
}

export function normalizeStudioName(n: string): string {
  return String(n || '')
    .toLowerCase()
    .replace(/\b(inc|llc|ltd|limited|games|gaming|studio|studios|entertainment)\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/**
 * Merge logic prioritizes record with higher score (games count + description length)
 * while unioning sources, games, technologies. Returns new array (does not mutate input).
 */
export function dedupeStudios(records: GenericStudioRecord[]): GenericStudioRecord[] {
  const byKey = new Map<string, GenericStudioRecord>()
  for (const raw of records) {
    if (!raw?.name) continue
    const key = normalizeStudioName(raw.name)
    if (!key) continue
    const existing = byKey.get(key)
    if (!existing) {
      byKey.set(key, { ...raw, dataSource: [...(raw.dataSource || [])] })
      continue
    }
    const existingScore = ((existing.games?.length || 0) * 2) + (existing.description?.length || 0)
    const candidateScore = ((raw.games?.length || 0) * 2) + (raw.description?.length || 0)
    if (candidateScore > existingScore) {
      byKey.set(key, {
        ...existing,
        ...raw,
        dataSource: Array.from(new Set([...(existing.dataSource || []), ...(raw.dataSource || [])])),
        games: Array.from(new Set([...(existing.games || []), ...(raw.games || [])])),
        technologies: Array.from(new Set([...(existing.technologies || []), ...(raw.technologies || [])]))
      })
    } else {
      existing.dataSource = Array.from(new Set([...(existing.dataSource || []), ...(raw.dataSource || [])]))
      existing.games = Array.from(new Set([...(existing.games || []), ...(raw.games || [])]))
      existing.technologies = Array.from(new Set([...(existing.technologies || []), ...(raw.technologies || [])]))
    }
  }
  return Array.from(byKey.values())
}
