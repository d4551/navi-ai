

    .fill()

  // Initialize first column and row

      matrix[j][i] = Math.min(
      );
    }
  }

  return matrix[b.length][a.length];
}

  const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase());
  const maxLength = Math.max(a.length, b.length);
}

  const {
    caseSensitive = false,
  } = options;

  const normalizedQuery = caseSensitive ? query : query.toLowerCase();
  const normalizedTarget = caseSensitive ? target : target.toLowerCase();

  if (normalizedTarget.includes(normalizedQuery)) {
    const position = normalizedTarget.indexOf(normalizedQuery);
  }

  const levenshteinScore = levenshteinSimilarity(
    normalizedQuery,
    normalizedTarget,
  );

  if (normalizedTarget.startsWith(normalizedQuery)) {
  } else {
    // Partial prefix matching
    const minLength = Math.min(normalizedQuery.length, normalizedTarget.length);
      if (normalizedQuery[i] === normalizedTarget[i]) {
        commonPrefix++;
      } else {
        break;
      }
    }
  }



    for (const queryWord of queryWords) {
        if (
          targetWords[i].includes(queryWord) ||
          queryWord.includes(targetWords[i])
        ) {
          matchedWords++;
          if (i > lastFoundIndex) {
            lastFoundIndex = i;
          }
          break;
        }
      }
    }

  }

  // Weighted composite score
  const compositeScore = Math.round(
  );

  return {
    score: compositeScore,
    minScoreMet: compositeScore >= minScore,
    breakdown: {
      substring: Math.round(substringScore),
      levenshtein: Math.round(levenshteinScore),
      prefix: Math.round(prefixScore),
      wordOrder: Math.round(wordOrderScore),
      composite: compositeScore,
    },
    algorithm: "enhanced-fuzzy",
  };
}

  const {
    keys = ["name"], // Fields to search in
    tieBreaker = "levenshtein", // 'levenshtein' or 'length' or 'alphabetical'
  } = options;

  if (!query || !Array.isArray(items)) {
    return [];
  }

  const results = [];

    const item = items[i];

    // Check all specified keys/fields
    for (const key of keys) {
      const value = typeof item === "string" ? item : item[key];
      if (!value) continue;

      const match = enhancedFuzzyMatch(query, String(value), options);
      if (match.score > bestMatch.score) {
        bestMatch = {
          score: match.score,
          field: key,
          breakdown: match.breakdown,
        };
      }
    }

    // Only include results above threshold
    if (bestMatch.score >= threshold) {
      results.push({
        item,
        score: bestMatch.score,
        field: bestMatch.field,
        breakdown: bestMatch.breakdown,
        index: i,
      });
    }
  }

  // Sort by score (descending) with tie-breakers
  results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    // Tie-breaker logic
    if (tieBreaker === "levenshtein") {
      // Use Levenshtein distance as tie-breaker (lower is better)
      const aValue = typeof a.item === "string" ? a.item : a.item[a.field];
      const bValue = typeof b.item === "string" ? b.item : b.item[b.field];
      const aDistance = levenshteinDistance(
        query.toLowerCase(),
        String(aValue).toLowerCase(),
      );
      const bDistance = levenshteinDistance(
        query.toLowerCase(),
        String(bValue).toLowerCase(),
      );
      return aDistance - bDistance;
    } else if (tieBreaker === "length") {
      // Shorter strings win ties (more precise matches)
      const aValue = typeof a.item === "string" ? a.item : a.item[a.field];
      const bValue = typeof b.item === "string" ? b.item : b.item[b.field];
      return String(aValue).length - String(bValue).length;
    } else if (tieBreaker === "alphabetical") {
      // Alphabetical order as tie-breaker
      const aValue = typeof a.item === "string" ? a.item : a.item[a.field];
      const bValue = typeof b.item === "string" ? b.item : b.item[b.field];
      return String(aValue).localeCompare(String(bValue));
    }

  });

  // Apply limit
}

export const FUZZY_PRESETS = {
  // Strict matching for exact searches
  strict: {
    tieBreaker: "levenshtein",
  },

  // Balanced matching for general search
  balanced: {
    tieBreaker: "levenshtein",
  },

  // Lenient matching for typo-tolerant search
  lenient: {
    tieBreaker: "levenshtein",
  },

  // Company name matching optimized
  company: {
    tieBreaker: "length",
    caseSensitive: false,
  },
};

  query,
  items,
  preset = "balanced",
  overrides = {},
) {
  const config = { ...FUZZY_PRESETS[preset], ...overrides };
  return fuzzySearch(query, items, config);
}

export default {
  levenshteinDistance,
  levenshteinSimilarity,
  enhancedFuzzyMatch,
  fuzzySearch,
  quickFuzzySearch,
  FUZZY_PRESETS,
};
