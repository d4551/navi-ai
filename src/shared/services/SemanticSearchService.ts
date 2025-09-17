/**
 * Lightweight Semantic Search Service
 * Provides vector-based search using simple embeddings and similarity scoring
 * Optimized for gaming studios and job roles data
 */

import {
  GAMING_STUDIOS,
  ROLE_TYPES,
  TECHNOLOGY_TAGS,
} from '../constants/gaming-studios'
import type { GameStudio, AutocompleteOption } from '../types/interview'
import { logger } from '../utils/logger'

// Simple text vectorization using TF-IDF-like approach
export interface TextVector {
  id: string
  type: 'studio' | 'role' | 'technology' | 'skill'
  vector: number[]
  metadata: any
  searchableText: string
  keywords: string[]
}

export interface SemanticSearchResult {
  item: TextVector
  similarity: number
  matchedTerms: string[]
  relevanceBoost: number
}

export interface SemanticSearchOptions {
  threshold?: number
  maxResults?: number
  boostFactors?: {
    exactMatch?: number
    titleMatch?: number
    descriptionMatch?: number
    skillsMatch?: number
    gameMatch?: number
  }
  filters?: {
    types?: ('studio' | 'role' | 'technology' | 'skill')[]
    categories?: string[]
    regions?: string[]
  }
}

export class SemanticSearchService {
  private vectors: TextVector[] = []
  private vocabulary: Map<string, number> = new Map()
  private idf: Map<string, number> = new Map()
  private isInitialized = false

  constructor() {
    this.initialize()
  }

  /**
   * Initialize the search service with pre-computed vectors
   */
  private async initialize() {
    if (this.isInitialized) return

    try {
      // Build vocabulary and document vectors
      await this.buildVectors()
      await this.computeIDF()
      this.isInitialized = true
      logger.info(
        `SemanticSearchService initialized with ${this.vectors.length} vectors`
      )
    } catch (error) {
      logger.error('Failed to initialize SemanticSearchService:', error)
    }
  }

  /**
   * Build text vectors for all searchable content
   */
  private async buildVectors() {
    this.vectors = []

    // Process gaming studios
    Object.values(GAMING_STUDIOS).forEach(studio => {
      const searchableText = [
        studio.name,
        studio.description,
        ...studio.games,
        ...studio.technologies,
        ...studio.commonRoles,
        studio.headquarters,
        ...studio.culture.values,
        studio.culture.workStyle,
        studio.culture.environment,
      ].join(' ')

      const keywords = this.extractKeywords(searchableText)
      const vector = this.textToVector(searchableText)

      this.vectors.push({
        id: studio.id,
        type: 'studio',
        vector,
        metadata: studio,
        searchableText,
        keywords,
      })
    })

    // Process roles
    ROLE_TYPES.forEach(role => {
      const searchableText = role
      const keywords = this.extractKeywords(searchableText)
      const vector = this.textToVector(searchableText)

      this.vectors.push({
        id: role,
        type: 'role',
        vector,
        metadata: { name: role, category: this.getRoleCategory(role) },
        searchableText,
        keywords,
      })
    })

    // Process technologies
    TECHNOLOGY_TAGS.forEach(tech => {
      const searchableText = tech
      const keywords = this.extractKeywords(searchableText)
      const vector = this.textToVector(searchableText)

      this.vectors.push({
        id: tech,
        type: 'technology',
        vector,
        metadata: { name: tech, category: 'technology' },
        searchableText,
        keywords,
      })
    })
  }

  /**
   * Extract meaningful keywords from text
   */
  private extractKeywords(text: string): string[] {
    const stopWords = new Set([
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'is',
      'are',
      'was',
      'were',
      'be',
      'been',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'could',
      'should',
    ])

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .filter((word, index, array) => array.indexOf(word) === index) // Remove duplicates
  }

  /**
   * Convert text to a simple TF-IDF-like vector
   */
  private textToVector(text: string): number[] {
    const words = this.extractKeywords(text)
    const termFreq = new Map<string, number>()

    // Calculate term frequencies
    words.forEach(word => {
      termFreq.set(word, (termFreq.get(word) || 0) + 1)
    })

    // Build vocabulary
    words.forEach(word => {
      if (!this.vocabulary.has(word)) {
        this.vocabulary.set(word, this.vocabulary.size)
      }
    })

    // Create vector (for now, just term frequencies)
    const vector = new Array(this.vocabulary.size).fill(0)
    termFreq.forEach((freq, word) => {
      const index = this.vocabulary.get(word)
      if (index !== undefined) {
        vector[index] = freq / words.length // Normalized term frequency
      }
    })

    return vector
  }

  /**
   * Compute IDF (Inverse Document Frequency) for vocabulary
   */
  private async computeIDF() {
    const docCount = this.vectors.length
    const termDocCount = new Map<string, number>()

    // Count documents containing each term
    this.vectors.forEach(vector => {
      const uniqueTerms = new Set(vector.keywords)
      uniqueTerms.forEach(term => {
        termDocCount.set(term, (termDocCount.get(term) || 0) + 1)
      })
    })

    // Calculate IDF for each term
    termDocCount.forEach((docFreq, term) => {
      const idf = Math.log(docCount / docFreq)
      this.idf.set(term, idf)
    })

    // Update vectors with TF-IDF weights
    this.vectors.forEach(vector => {
      vector.keywords.forEach(term => {
        const vocabIndex = this.vocabulary.get(term)
        const idfWeight = this.idf.get(term) || 0
        if (vocabIndex !== undefined && vocabIndex < vector.vector.length) {
          vector.vector[vocabIndex] *= idfWeight
        }
      })
    })
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    let dotProduct = 0
    let magnitudeA = 0
    let magnitudeB = 0

    const maxLength = Math.max(vectorA.length, vectorB.length)

    for (let i = 0; i < maxLength; i++) {
      const a = i < vectorA.length ? vectorA[i] : 0
      const b = i < vectorB.length ? vectorB[i] : 0

      dotProduct += a * b
      magnitudeA += a * a
      magnitudeB += b * b
    }

    const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB)
    return magnitude === 0 ? 0 : dotProduct / magnitude
  }

  /**
   * Perform semantic search with ranking
   */
  public async semanticSearch(
    query: string,
    options: SemanticSearchOptions = {}
  ): Promise<SemanticSearchResult[]> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const {
      threshold = 0.1,
      maxResults = 20,
      boostFactors = {},
      filters = {},
    } = options

    const defaultBoosts = {
      exactMatch: 2.0,
      titleMatch: 1.5,
      descriptionMatch: 1.2,
      skillsMatch: 1.3,
      gameMatch: 1.1,
      ...boostFactors,
    }

    // Vectorize the query
    const queryVector = this.textToVector(query)
    const queryKeywords = this.extractKeywords(query)

    const results: SemanticSearchResult[] = []

    // Calculate similarities
    this.vectors.forEach(vector => {
      // Apply type filters
      if (filters.types && !filters.types.includes(vector.type)) {
        return
      }

      const similarity = this.cosineSimilarity(queryVector, vector.vector)

      if (similarity >= threshold) {
        // Calculate relevance boost based on specific matches
        let relevanceBoost = 1.0
        const matchedTerms: string[] = []

        // Exact name match
        if (vector.searchableText.toLowerCase().includes(query.toLowerCase())) {
          relevanceBoost *= defaultBoosts.exactMatch
          matchedTerms.push('exact_match')
        }

        // Keyword matches
        queryKeywords.forEach(keyword => {
          if (vector.keywords.includes(keyword)) {
            matchedTerms.push(keyword)

            // Different boosts for different types of matches
            if (vector.type === 'studio') {
              const studio = vector.metadata as GameStudio
              if (studio.name.toLowerCase().includes(keyword)) {
                relevanceBoost *= defaultBoosts.titleMatch
              } else if (
                studio.games.some(game => game.toLowerCase().includes(keyword))
              ) {
                relevanceBoost *= defaultBoosts.gameMatch
              } else if (
                studio.technologies.some(tech =>
                  tech.toLowerCase().includes(keyword)
                )
              ) {
                relevanceBoost *= defaultBoosts.skillsMatch
              }
            } else if (vector.type === 'role') {
              if (vector.metadata.name.toLowerCase().includes(keyword)) {
                relevanceBoost *= defaultBoosts.titleMatch
              }
            }
          }
        })

        results.push({
          item: vector,
          similarity,
          matchedTerms,
          relevanceBoost,
        })
      }
    })

    // Sort by combined relevance score
    results.sort((a, b) => {
      const scoreA = a.similarity * a.relevanceBoost
      const scoreB = b.similarity * b.relevanceBoost
      return scoreB - scoreA
    })

    return results.slice(0, maxResults)
  }

  /**
   * Get semantic autocomplete suggestions
   */
  public async getSemanticSuggestions(
    query: string,
    maxResults: number = 8
  ): Promise<AutocompleteOption[]> {
    const semanticResults = await this.semanticSearch(query, {
      threshold: 0.05,
      maxResults: maxResults * 2, // Get more to filter down
    })

    return semanticResults.slice(0, maxResults).map(result => {
      const { item } = result

      let label = ''
      let description = ''
      let category = item.type

      if (item.type === 'studio') {
        const studio = item.metadata as GameStudio
        label = studio.name
        description = studio.description
        category = 'studio'
      } else if (item.type === 'role') {
        label = item.metadata.name
        description = `${item.metadata.category || 'Professional'} role`
        category = 'role'
      } else if (item.type === 'technology') {
        label = item.metadata.name
        description = 'Technology/Tool'
        category = 'technology'
      }

      return {
        value: item.id,
        label,
        category,
        description,
      }
    })
  }

  /**
   * Find similar items to a given item
   */
  public async findSimilar(
    itemId: string,
    itemType: 'studio' | 'role' | 'technology',
    maxResults: number = 5
  ): Promise<SemanticSearchResult[]> {
    const targetVector = this.vectors.find(
      v => v.id === itemId && v.type === itemType
    )
    if (!targetVector) return []

    const results: SemanticSearchResult[] = []

    this.vectors.forEach(vector => {
      if (vector.id === itemId && vector.type === itemType) return // Skip self
      if (vector.type !== itemType) return // Only same type

      const similarity = this.cosineSimilarity(
        targetVector.vector,
        vector.vector
      )

      if (similarity > 0.1) {
        results.push({
          item: vector,
          similarity,
          matchedTerms: [],
          relevanceBoost: 1.0,
        })
      }
    })

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxResults)
  }

  /**
   * Get role category for a role name
   */
  private getRoleCategory(roleName: string): string {
    // Import would be circular, so we'll use a simple classification
    const engineeringRoles = ['engineer', 'programmer', 'developer']
    const designRoles = ['designer', 'director']
    const artRoles = ['artist', 'animator']
    const qaRoles = ['qa', 'test', 'quality']

    const lowerRole = roleName.toLowerCase()

    if (engineeringRoles.some(term => lowerRole.includes(term)))
      return 'Engineering'
    if (designRoles.some(term => lowerRole.includes(term))) return 'Design'
    if (artRoles.some(term => lowerRole.includes(term))) return 'Art'
    if (qaRoles.some(term => lowerRole.includes(term))) return 'QA'

    return 'Other'
  }

  /**
   * Get search analytics and suggestions
   */
  public getSearchAnalytics() {
    return {
      totalVectors: this.vectors.length,
      vocabularySize: this.vocabulary.size,
      typeDistribution: this.vectors.reduce(
        (acc, vector) => {
          acc[vector.type] = (acc[vector.type] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      ),
      isInitialized: this.isInitialized,
    }
  }

  /**
   * Refresh vectors (useful when data changes)
   */
  public async refresh() {
    this.vectors = []
    this.vocabulary.clear()
    this.idf.clear()
    this.isInitialized = false
    await this.initialize()
  }
}

// Singleton instance
export const semanticSearchService = new SemanticSearchService()
