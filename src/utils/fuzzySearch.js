/**
 * Enhanced Fuzzy Search Utility with Levenshtein Distance
 * Provides tunable thresholds and sophisticated matching algorithms
 */

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} - Edit distance
 */
export function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array(b.length + 1).fill().map(() => Array(a.length + 1).fill(0));

  // Initialize first column and row
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j - 1][i] + 1,     // deletion
        matrix[j][i - 1] + 1,     // insertion
        matrix[j - 1][i - 1] + cost // substitution
      );
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate similarity score based on Levenshtein distance
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} - Similarity score (0-100)
 */
export function levenshteinSimilarity(a, b) {
  const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase());
  const maxLength = Math.max(a.length, b.length);
  if (maxLength === 0) return 100;
  return Math.round(((maxLength - distance) / maxLength) * 100);
}

/**
 * Enhanced fuzzy matching with multiple scoring algorithms
 * @param {string} query - Search query
 * @param {string} target - Target string to match against
 * @param {Object} options - Matching options
 * @returns {Object} - Match result with score and algorithm used
 */
export function enhancedFuzzyMatch(query, target, options = {}) {
  const {
    caseSensitive = false,
    substringWeight = 0.4,
    levenshteinWeight = 0.3,
    prefixWeight = 0.2,
    wordOrderWeight = 0.1,
    minScore = 50
  } = options;

  const normalizedQuery = caseSensitive ? query : query.toLowerCase();
  const normalizedTarget = caseSensitive ? target : target.toLowerCase();

  // Algorithm 1: Substring matching
  let substringScore = 0;
  if (normalizedTarget.includes(normalizedQuery)) {
    const position = normalizedTarget.indexOf(normalizedQuery);
    substringScore = 100 - (position / normalizedTarget.length) * 20; // Earlier matches score higher
  }

  // Algorithm 2: Levenshtein similarity
  const levenshteinScore = levenshteinSimilarity(normalizedQuery, normalizedTarget);

  // Algorithm 3: Prefix matching
  let prefixScore = 0;
  if (normalizedTarget.startsWith(normalizedQuery)) {
    prefixScore = 100;
  } else {
    // Partial prefix matching
    let commonPrefix = 0;
    const minLength = Math.min(normalizedQuery.length, normalizedTarget.length);
    for (let i = 0; i < minLength; i++) {
      if (normalizedQuery[i] === normalizedTarget[i]) {
        commonPrefix++;
      } else {
        break;
      }
    }
    prefixScore = (commonPrefix / normalizedQuery.length) * 100;
  }

  // Algorithm 4: Word order matching
  let wordOrderScore = 0;
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 0);
  const targetWords = normalizedTarget.split(/\s+/).filter(w => w.length > 0);
  
  if (queryWords.length > 0) {
    let matchedWords = 0;
    let orderBonus = 0;
    let lastFoundIndex = -1;

    for (const queryWord of queryWords) {
      for (let i = 0; i < targetWords.length; i++) {
        if (targetWords[i].includes(queryWord) || queryWord.includes(targetWords[i])) {
          matchedWords++;
          if (i > lastFoundIndex) {
            orderBonus += 10; // Bonus for maintaining order
            lastFoundIndex = i;
          }
          break;
        }
      }
    }
    
    wordOrderScore = (matchedWords / queryWords.length) * 100 + orderBonus;
    wordOrderScore = Math.min(wordOrderScore, 100);
  }

  // Weighted composite score
  const compositeScore = Math.round(
    (substringScore * substringWeight) +
    (levenshteinScore * levenshteinWeight) +
    (prefixScore * prefixWeight) +
    (wordOrderScore * wordOrderWeight)
  );

  return {
    score: compositeScore,
    minScoreMet: compositeScore >= minScore,
    breakdown: {
      substring: Math.round(substringScore),
      levenshtein: Math.round(levenshteinScore),
      prefix: Math.round(prefixScore),
      wordOrder: Math.round(wordOrderScore),
      composite: compositeScore
    },
    algorithm: 'enhanced-fuzzy'
  };
}

/**
 * Fuzzy search through a collection of items
 * @param {string} query - Search query
 * @param {Array} items - Array of items to search
 * @param {Object} options - Search options
 * @returns {Array} - Sorted array of matching items with scores
 */
export function fuzzySearch(query, items, options = {}) {
  const {
    keys = ['name'], // Fields to search in
    threshold = 60,   // Minimum score threshold
    limit = 10,       // Maximum results to return
    tieBreaker = 'levenshtein' // 'levenshtein' or 'length' or 'alphabetical'
  } = options;

  if (!query || !Array.isArray(items)) {
    return [];
  }

  const results = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    let bestMatch = { score: 0, field: null };

    // Check all specified keys/fields
    for (const key of keys) {
      const value = typeof item === 'string' ? item : item[key];
      if (!value) continue;

      const match = enhancedFuzzyMatch(query, String(value), options);
      if (match.score > bestMatch.score) {
        bestMatch = {
          score: match.score,
          field: key,
          breakdown: match.breakdown
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
        index: i
      });
    }
  }

  // Sort by score (descending) with tie-breakers
  results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    // Tie-breaker logic
    if (tieBreaker === 'levenshtein') {
      // Use Levenshtein distance as tie-breaker (lower is better)
      const aValue = typeof a.item === 'string' ? a.item : a.item[a.field];
      const bValue = typeof b.item === 'string' ? b.item : b.item[b.field];
      const aDistance = levenshteinDistance(query.toLowerCase(), String(aValue).toLowerCase());
      const bDistance = levenshteinDistance(query.toLowerCase(), String(bValue).toLowerCase());
      return aDistance - bDistance;
    } else if (tieBreaker === 'length') {
      // Shorter strings win ties (more precise matches)
      const aValue = typeof a.item === 'string' ? a.item : a.item[a.field];
      const bValue = typeof b.item === 'string' ? b.item : b.item[b.field];
      return String(aValue).length - String(bValue).length;
    } else if (tieBreaker === 'alphabetical') {
      // Alphabetical order as tie-breaker
      const aValue = typeof a.item === 'string' ? a.item : a.item[a.field];
      const bValue = typeof b.item === 'string' ? b.item : b.item[b.field];
      return String(aValue).localeCompare(String(bValue));
    }

    return 0;
  });

  // Apply limit
  return results.slice(0, limit);
}

/**
 * Configuration presets for different use cases
 */
export const FUZZY_PRESETS = {
  // Strict matching for exact searches
  strict: {
    threshold: 80,
    substringWeight: 0.5,
    levenshteinWeight: 0.3,
    prefixWeight: 0.2,
    wordOrderWeight: 0.0,
    tieBreaker: 'levenshtein'
  },

  // Balanced matching for general search
  balanced: {
    threshold: 60,
    substringWeight: 0.4,
    levenshteinWeight: 0.3,
    prefixWeight: 0.2,
    wordOrderWeight: 0.1,
    tieBreaker: 'levenshtein'
  },

  // Lenient matching for typo-tolerant search
  lenient: {
    threshold: 40,
    substringWeight: 0.3,
    levenshteinWeight: 0.4,
    prefixWeight: 0.1,
    wordOrderWeight: 0.2,
    tieBreaker: 'levenshtein'
  },

  // Company name matching optimized
  company: {
    threshold: 50,
    substringWeight: 0.5,
    levenshteinWeight: 0.2,
    prefixWeight: 0.3,
    wordOrderWeight: 0.0,
    tieBreaker: 'length',
    caseSensitive: false
  }
};

/**
 * Quick search function with preset configurations
 * @param {string} query - Search query
 * @param {Array} items - Items to search
 * @param {string} preset - Preset name from FUZZY_PRESETS
 * @param {Object} overrides - Option overrides
 * @returns {Array} - Search results
 */
export function quickFuzzySearch(query, items, preset = 'balanced', overrides = {}) {
  const config = { ...FUZZY_PRESETS[preset], ...overrides };
  return fuzzySearch(query, items, config);
}

export default {
  levenshteinDistance,
  levenshteinSimilarity,
  enhancedFuzzyMatch,
  fuzzySearch,
  quickFuzzySearch,
  FUZZY_PRESETS
};