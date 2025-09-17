/**
 * Search Utilities
 * Helper functions for searching and fuzzy matching
 */

export interface FuzzyMatchResult {
  id: string
  score: number
}

/**
 * Build token index for fuzzy matching
 */
export function buildTokenIndex(
  studios: Record<string, any>
): Record<string, Set<string>> {
  const index: Record<string, Set<string>> = {}

  Object.entries(studios).forEach(([id, studio]) => {
    const tokens = new Set<string>()

    // Add name tokens
    if (studio.name) {
      const nameTokens = studio.name.toLowerCase().split(/\s+/)
      nameTokens.forEach((token: string) => tokens.add(token))
    }

    // Add location tokens
    if (studio.location) {
      const locationTokens = studio.location.toLowerCase().split(/\s+/)
      locationTokens.forEach((token: string) => tokens.add(token))
    }

    // Add game tokens
    if (studio.games) {
      studio.games.forEach((game: string) => {
        const gameTokens = game.toLowerCase().split(/\s+/)
        gameTokens.forEach(token => tokens.add(token))
      })
    }

    index[id] = tokens
  })

  return index
}

/**
 * Fuzzy match studios using token-based search
 */
export function fuzzyMatchStudios(
  query: string,
  tokenIndex: Record<string, Set<string>>,
  _studios: Record<string, any>
): FuzzyMatchResult[] {
  if (!query || !tokenIndex) return []

  const queryTokens = query
    .toLowerCase()
    .split(/\s+/)
    .filter((token: string) => token.length > 1)
  const results: FuzzyMatchResult[] = []

  Object.entries(tokenIndex).forEach(([id, tokens]) => {
    let score = 0
    let matches = 0

    queryTokens.forEach((queryToken: string) => {
      let bestMatch = 0

      tokens.forEach((token: string) => {
        // Exact match
        if (token === queryToken) {
          bestMatch = 100
        }
        // Partial match
        else if (token.includes(queryToken) || queryToken.includes(token)) {
          bestMatch = Math.max(bestMatch, 75)
        }
        // Fuzzy match (simple Levenshtein-like)
        else {
          const distance = levenshteinDistance(token, queryToken)
          const maxLength = Math.max(token.length, queryToken.length)
          const similarity = (maxLength - distance) / maxLength
          if (similarity > 0.6) {
            bestMatch = Math.max(bestMatch, similarity * 60)
          }
        }
      })

      if (bestMatch > 0) {
        score += bestMatch
        matches++
      }
    })

    if (matches > 0) {
      // Average score weighted by number of matches
      const avgScore = score / queryTokens.length
      const matchBonus = (matches / queryTokens.length) * 20
      const finalScore = Math.min(avgScore + matchBonus, 100)

      results.push({ id, score: finalScore })
    }
  })

  // Sort by score descending
  results.sort((a, b) => b.score - a.score)

  return results
}

/**
 * Simple Levenshtein distance calculation
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        )
      }
    }
  }

  return matrix[b.length][a.length]
}
