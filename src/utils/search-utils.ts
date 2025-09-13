
export interface FuzzyMatchResult {
  id: string;
  score: number;
}

  studios: Record<string, any>,
): Record<string, Set<string>> {
  const index: Record<string, Set<string>> = {};

  Object.entries(studios).forEach(([id, studio]) => {
    const tokens = new Set<string>();

    // Add name tokens
    if (studio.name) {
      const nameTokens = studio.name.toLowerCase().split(/\s+/);
      nameTokens.forEach((token: string) => tokens.add(token));
    }

    // Add location tokens
    if (studio.location) {
      const locationTokens = studio.location.toLowerCase().split(/\s+/);
      locationTokens.forEach((token: string) => tokens.add(token));
    }

    // Add game tokens
    if (studio.games) {
      studio.games.forEach((game: string) => {
        const gameTokens = game.toLowerCase().split(/\s+/);
        gameTokens.forEach((token) => tokens.add(token));
      });
    }

    index[id] = tokens;
  });

  return index;
}

  query: string,
  tokenIndex: Record<string, Set<string>>,
  _studios: Record<string, any>,
): FuzzyMatchResult[] {
  if (!query || !tokenIndex) return [];

  const queryTokens = query
    .toLowerCase()
    .split(/\s+/)
  const results: FuzzyMatchResult[] = [];

  Object.entries(tokenIndex).forEach(([id, tokens]) => {

    queryTokens.forEach((queryToken: string) => {

      tokens.forEach((token: string) => {
        // Exact match
        if (token === queryToken) {
        }
        // Partial match
        else if (token.includes(queryToken) || queryToken.includes(token)) {
        }
        // Fuzzy match (simple Levenshtein-like)
        else {
          const distance = levenshteinDistance(token, queryToken);
          const maxLength = Math.max(token.length, queryToken.length);
          const similarity = (maxLength - distance) / maxLength;
          }
        }
      });

        score += bestMatch;
        matches++;
      }
    });

      // Average score weighted by number of matches
      const avgScore = score / queryTokens.length;

      results.push({ id, score: finalScore });
    }
  });

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}

  const matrix = [];

    matrix[i] = [i];
  }

  }

      } else {
        matrix[i][j] = Math.min(
        );
      }
    }
  }

  return matrix[b.length][a.length];
}
