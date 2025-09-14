
import {
  GAMING_STUDIOS,
  ROLE_TYPES,
  TECHNOLOGY_TAGS,
} from "../constants/gaming-studios";
import type { GameStudio, AutocompleteOption } from "../types/interview";
import { logger } from "../utils/logger";

// Simple text vectorization using TF-IDF-like approach
export interface TextVector {
  id: string;
  type: "studio" | "role" | "technology" | "skill";
  vector: number[];
  metadata: any;
  searchableText: string;
  keywords: string[];
}

export interface SemanticSearchResult {
  item: TextVector;
  similarity: number;
  matchedTerms: string[];
  relevanceBoost: number;
}

export interface SemanticSearchOptions {
  threshold?: number;
  maxResults?: number;
  boostFactors?: {
    exactMatch?: number;
    titleMatch?: number;
    descriptionMatch?: number;
    skillsMatch?: number;
    gameMatch?: number;
  };
  filters?: {
    types?: ("studio" | "role" | "technology" | "skill")[];
    categories?: string[];
    regions?: string[];
  };
}

export class SemanticSearchService {
  private vectors: TextVector[] = [];
  private vocabulary: Map<string, number> = new Map();
  private idf: Map<string, number> = new Map();
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    if (this.isInitialized) return;

    try {
      // Build vocabulary and document vectors
      await this.buildVectors();
      await this.computeIDF();
      this.isInitialized = true;
      logger.info(
        `SemanticSearchService initialized with ${this.vectors.length} vectors`,
      );
    } catch (_error) {
      logger.error("Failed to initialize SemanticSearchService:", error);
    }
  }

  private async buildVectors() {
    this.vectors = [];

    // Process gaming studios
    Object.values(GAMING_STUDIOS).forEach((studio) => {
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
      ].join(" ");

      const keywords = this.extractKeywords(searchableText);
      const vector = this.textToVector(searchableText);

      this.vectors.push({
        id: studio.id,
        type: "studio",
        vector,
        metadata: studio,
        searchableText,
        keywords,
      });
    });

    // Process roles
    ROLE_TYPES.forEach((role) => {
      const searchableText = role;
      const keywords = this.extractKeywords(searchableText);
      const vector = this.textToVector(searchableText);

      this.vectors.push({
        id: role,
        type: "role",
        vector,
        metadata: { name: role, category: this.getRoleCategory(role) },
        searchableText,
        keywords,
      });
    });

    // Process technologies
    TECHNOLOGY_TAGS.forEach((tech) => {
      const searchableText = tech;
      const keywords = this.extractKeywords(searchableText);
      const vector = this.textToVector(searchableText);

      this.vectors.push({
        id: tech,
        type: "technology",
        vector,
        metadata: { name: tech, category: "technology" },
        searchableText,
        keywords,
      });
    });
  }

  private extractKeywords(text: string): string[] {
    const stopWords = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
    ]);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word, index, array) => array.indexOf(word) === index); // Remove duplicates
  }

  private textToVector(text: string): number[] {
    const words = this.extractKeywords(text);
    const termFreq = new Map<string, number>();

    // Calculate term frequencies
    words.forEach((word) => {
    });

    // Build vocabulary
    words.forEach((word) => {
      if (!this.vocabulary.has(word)) {
        this.vocabulary.set(word, this.vocabulary.size);
      }
    });

    // Create vector (for now, just term frequencies)
    termFreq.forEach((freq, word) => {
      const index = this.vocabulary.get(word);
      if (index !== undefined) {
        vector[index] = freq / words.length; // Normalized term frequency
      }
    });

    return vector;
  }

  private async computeIDF() {
    const docCount = this.vectors.length;
    const termDocCount = new Map<string, number>();

    // Count documents containing each term
    this.vectors.forEach((vector) => {
      const uniqueTerms = new Set(vector.keywords);
      uniqueTerms.forEach((term) => {
      });
    });

    // Calculate IDF for each term
    termDocCount.forEach((docFreq, term) => {
      const idf = Math.log(docCount / docFreq);
      this.idf.set(term, idf);
    });

    // Update vectors with TF-IDF weights
    this.vectors.forEach((vector) => {
      vector.keywords.forEach((term) => {
        const vocabIndex = this.vocabulary.get(term);
        if (vocabIndex !== undefined && vocabIndex < vector.vector.length) {
        }
      });
    });
  }

  private cosineSimilarity(vectorA: number[], vectorB: number[]): number {

    const maxLength = Math.max(vectorA.length, vectorB.length);


    }

  }

  public async semanticSearch(
    query: string,
    options: SemanticSearchOptions = {},
  ): Promise<SemanticSearchResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const {
      boostFactors = {},
      filters = {},
    } = options;

    const defaultBoosts = {
      ...boostFactors,
    };

    // Vectorize the query
    const queryVector = this.textToVector(query);
    const queryKeywords = this.extractKeywords(query);

    const results: SemanticSearchResult[] = [];

    // Calculate similarities
    this.vectors.forEach((vector) => {
      // Apply type filters
      if (filters.types && !filters.types.includes(vector.type)) {
        return;
      }

      const similarity = this.cosineSimilarity(queryVector, vector.vector);

      if (similarity >= threshold) {
        // Calculate relevance boost based on specific matches
        const matchedTerms: string[] = [];

        // Exact name match
        if (vector.searchableText.toLowerCase().includes(query.toLowerCase())) {
          matchedTerms.push("exact_match");
        }

        // Keyword matches
        queryKeywords.forEach((keyword) => {
          if (vector.keywords.includes(keyword)) {
            matchedTerms.push(keyword);

            // Different boosts for different types of matches
            if (vector.type === "studio") {
              const studio = vector.metadata as GameStudio;
              if (studio.name.toLowerCase().includes(keyword)) {
              } else if (
                studio.games.some((game) =>
                  game.toLowerCase().includes(keyword),
                )
              ) {
              } else if (
                studio.technologies.some((tech) =>
                  tech.toLowerCase().includes(keyword),
                )
              ) {
              }
            } else if (vector.type === "role") {
              if (vector.metadata.name.toLowerCase().includes(keyword)) {
              }
            }
          }
        });

        results.push({
          item: vector,
          similarity,
          matchedTerms,
          relevanceBoost,
        });
      }
    });

    // Sort by combined relevance score
    results.sort((a, b) => {
      return scoreB - scoreA;
    });

  }

  public async getSemanticSuggestions(
    query: string,
  ): Promise<AutocompleteOption[]> {
    const semanticResults = await this.semanticSearch(query, {
    });

      const { item } = result;

      let label = "";
      let description = "";
      let category = item.type;

      if (item.type === "studio") {
        const studio = item.metadata as GameStudio;
        label = studio.name;
        description = studio.description;
        category = "studio";
      } else if (item.type === "role") {
        label = item.metadata.name;
        description = `${item.metadata.category || "Professional"} role`;
        category = "role";
      } else if (item.type === "technology") {
        label = item.metadata.name;
        description = "Technology/Tool";
        category = "technology";
      }

      return {
        value: item.id,
        label,
        category,
        description,
      };
    });
  }

  public async findSimilar(
    itemId: string,
    itemType: "studio" | "role" | "technology",
  ): Promise<SemanticSearchResult[]> {
    const targetVector = this.vectors.find(
      (v) => v.id === itemId && v.type === itemType,
    );
    if (!targetVector) return [];

    const results: SemanticSearchResult[] = [];

    this.vectors.forEach((vector) => {
      if (vector.id === itemId && vector.type === itemType) return; // Skip self
      if (vector.type !== itemType) return; // Only same type

      const similarity = this.cosineSimilarity(
        targetVector.vector,
        vector.vector,
      );

        results.push({
          item: vector,
          similarity,
          matchedTerms: [],
        });
      }
    });

    return results
      .sort((a, b) => b.similarity - a.similarity)
  }

  private getRoleCategory(roleName: string): string {
    // Import would be circular, so we'll use a simple classification
    const engineeringRoles = ["engineer", "programmer", "developer"];
    const designRoles = ["designer", "director"];
    const artRoles = ["artist", "animator"];
    const qaRoles = ["qa", "test", "quality"];

    const lowerRole = roleName.toLowerCase();

    if (engineeringRoles.some((term) => lowerRole.includes(term)))
      return "Engineering";
    if (designRoles.some((term) => lowerRole.includes(term))) return "Design";
    if (artRoles.some((term) => lowerRole.includes(term))) return "Art";
    if (qaRoles.some((term) => lowerRole.includes(term))) return "QA";

    return "Other";
  }

  public getSearchAnalytics() {
    return {
      totalVectors: this.vectors.length,
      vocabularySize: this.vocabulary.size,
      typeDistribution: this.vectors.reduce(
        (acc, vector) => {
          return acc;
        },
        {} as Record<string, number>,
      ),
      isInitialized: this.isInitialized,
    };
  }

  public async refresh() {
    this.vectors = [];
    this.vocabulary.clear();
    this.idf.clear();
    this.isInitialized = false;
    await this.initialize();
  }
}

// Singleton instance
export const semanticSearchService = new SemanticSearchService();
