/**
 * Conflict Resolution Service
 * Handles deduplication and merging of studio data from multiple sources
 */

import { logger } from "@/shared/utils/logger";
import type { GameStudio } from "@/shared/types/jobs";
import type { RawStudioData, ConflictResolution } from "./DataIngestionService";

export interface StudioMatch {
  existingStudio: GameStudio;
  candidateStudio: GameStudio;
  matchScore: number;
  matchTypes: MatchType[];
  conflicts: FieldConflict[];
  mergeRecommendation: MergeStrategy;
}

export interface FieldConflict {
  field: keyof GameStudio;
  existingValue: any;
  candidateValue: any;
  resolution: "keep_existing" | "use_candidate" | "merge" | "manual_review";
  confidence: number;
}

export interface MergeStrategy {
  action: "skip" | "merge" | "create_new" | "manual_review";
  confidence: number;
  reasoning: string[];
}

export type MatchType =
  | "exact_name"
  | "fuzzy_name"
  | "website_match"
  | "game_overlap"
  | "location_match"
  | "founder_match";

export class ConflictResolutionService {
  private readonly matchThresholds = {
    exact_name: 0.95,
    fuzzy_name: 0.85,
    website_match: 0.9,
    game_overlap: 0.7,
    location_match: 0.6,
    overall_minimum: 0.75,
  };

  async findPotentialMatches(
    candidateStudio: GameStudio,
    existingStudios: GameStudio[],
  ): Promise<StudioMatch[]> {
    const matches: StudioMatch[] = [];

    for (const existingStudio of existingStudios) {
      const matchScore = this.calculateMatchScore(
        candidateStudio,
        existingStudio,
      );

      if (matchScore >= this.matchThresholds.overall_minimum) {
        const matchTypes = this.identifyMatchTypes(
          candidateStudio,
          existingStudio,
        );
        const conflicts = this.identifyConflicts(
          candidateStudio,
          existingStudio,
        );
        const mergeRecommendation = this.recommendMergeStrategy(
          candidateStudio,
          existingStudio,
          matchScore,
          conflicts,
        );

        matches.push({
          existingStudio,
          candidateStudio,
          matchScore,
          matchTypes,
          conflicts,
          mergeRecommendation,
        });
      }
    }

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  private calculateMatchScore(
    candidate: GameStudio,
    existing: GameStudio,
  ): number {
    let totalScore = 0;
    let totalWeight = 0;

    // Name matching (highest weight)
    const nameScore = this.calculateNameSimilarity(
      candidate.name,
      existing.name,
    );
    totalScore += nameScore * 0.4;
    totalWeight += 0.4;

    // Website matching
    if (candidate.website && existing.website) {
      const websiteScore = this.calculateWebsiteSimilarity(
        candidate.website,
        existing.website,
      );
      totalScore += websiteScore * 0.2;
      totalWeight += 0.2;
    }

    // Game portfolio overlap
    const gameScore = this.calculateGameOverlap(
      candidate.games || [],
      existing.games || [],
    );
    totalScore += gameScore * 0.25;
    totalWeight += 0.25;

    // Location matching
    if (candidate.location && existing.location) {
      const locationScore = this.calculateLocationSimilarity(
        candidate.location,
        existing.location,
      );
      totalScore += locationScore * 0.1;
      totalWeight += 0.1;
    }

    // Founded year proximity
    if (candidate.founded && existing.founded) {
      const yearDiff = Math.abs(candidate.founded - existing.founded);
      const yearScore = Math.max(0, 1 - yearDiff / 10); // 10 year tolerance
      totalScore += yearScore * 0.05;
      totalWeight += 0.05;
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  private calculateNameSimilarity(name1: string, name2: string): number {
    const clean1 = this.cleanStudioName(name1);
    const clean2 = this.cleanStudioName(name2);

    // Exact match
    if (clean1.toLowerCase() === clean2.toLowerCase()) {
      return 1.0;
    }

    // Check for common variations
    const variations1 = this.generateNameVariations(clean1);
    const variations2 = this.generateNameVariations(clean2);

    for (const var1 of variations1) {
      for (const var2 of variations2) {
        if (var1.toLowerCase() === var2.toLowerCase()) {
          return 0.95;
        }
      }
    }

    // Fuzzy matching using Levenshtein distance
    const distance = this.levenshteinDistance(
      clean1.toLowerCase(),
      clean2.toLowerCase(),
    );
    const maxLength = Math.max(clean1.length, clean2.length);
    return Math.max(0, 1 - distance / maxLength);
  }

  private calculateWebsiteSimilarity(url1: string, url2: string): number {
    try {
      const domain1 = new URL(url1).hostname.replace("www.", "");
      const domain2 = new URL(url2).hostname.replace("www.", "");
      return domain1 === domain2 ? 1.0 : 0.0;
    } catch {
      return url1.toLowerCase() === url2.toLowerCase() ? 1.0 : 0.0;
    }
  }

  private calculateGameOverlap(games1: string[], games2: string[]): number {
    if (games1.length === 0 && games2.length === 0) return 1.0;
    if (games1.length === 0 || games2.length === 0) return 0.0;

    const cleanGames1 = games1.map((g) => g.toLowerCase().trim());
    const cleanGames2 = games2.map((g) => g.toLowerCase().trim());

    const intersection = cleanGames1.filter((g) => cleanGames2.includes(g));
    const union = new Set([...cleanGames1, ...cleanGames2]);

    return intersection.length / union.size;
  }

  private calculateLocationSimilarity(loc1: string, loc2: string): number {
    const clean1 = loc1.toLowerCase().trim();
    const clean2 = loc2.toLowerCase().trim();

    if (clean1 === clean2) return 1.0;

    // Check if one location contains the other (e.g., "San Francisco, CA" vs "San Francisco")
    if (clean1.includes(clean2) || clean2.includes(clean1)) {
      return 0.8;
    }

    // Extract cities and compare
    const city1 = clean1.split(",")[0].trim();
    const city2 = clean2.split(",")[0].trim();

    return city1 === city2 ? 0.7 : 0.0;
  }

  private identifyMatchTypes(
    candidate: GameStudio,
    existing: GameStudio,
  ): MatchType[] {
    const types: MatchType[] = [];

    const nameScore = this.calculateNameSimilarity(
      candidate.name,
      existing.name,
    );
    if (nameScore >= this.matchThresholds.exact_name) {
      types.push("exact_name");
    } else if (nameScore >= this.matchThresholds.fuzzy_name) {
      types.push("fuzzy_name");
    }

    if (candidate.website && existing.website) {
      const websiteScore = this.calculateWebsiteSimilarity(
        candidate.website,
        existing.website,
      );
      if (websiteScore >= this.matchThresholds.website_match) {
        types.push("website_match");
      }
    }

    const gameScore = this.calculateGameOverlap(
      candidate.games || [],
      existing.games || [],
    );
    if (gameScore >= this.matchThresholds.game_overlap) {
      types.push("game_overlap");
    }

    if (candidate.location && existing.location) {
      const locationScore = this.calculateLocationSimilarity(
        candidate.location,
        existing.location,
      );
      if (locationScore >= this.matchThresholds.location_match) {
        types.push("location_match");
      }
    }

    return types;
  }

  private identifyConflicts(
    candidate: GameStudio,
    existing: GameStudio,
  ): FieldConflict[] {
    const conflicts: FieldConflict[] = [];

    // Check each field for conflicts
    const fieldsToCheck: (keyof GameStudio)[] = [
      "name",
      "location",
      "founded",
      "description",
      "website",
      "size",
      "type",
    ];

    fieldsToCheck.forEach((field) => {
      const candidateValue = candidate[field];
      const existingValue = existing[field];

      if (candidateValue && existingValue && candidateValue !== existingValue) {
        const resolution = this.recommendFieldResolution(
          field,
          candidateValue,
          existingValue,
          candidate,
          existing,
        );
        conflicts.push({
          field,
          existingValue,
          candidateValue,
          resolution,
          confidence: this.calculateFieldConfidence(
            field,
            candidateValue,
            existingValue,
          ),
        });
      }
    });

    return conflicts;
  }

  private recommendFieldResolution(
    field: keyof GameStudio,
    candidateValue: any,
    existingValue: any,
    candidate: GameStudio,
    existing: GameStudio,
  ): FieldConflict["resolution"] {
    // Source priority-based resolution
    const candidateSource = (candidate as any).sourceId || "manual";
    const existingSource = (existing as any).sourceId || "manual";

    const sourcePriority = {
      manual: 10,
      igdb: 9,
      steam: 8,
      mobygames: 7,
    };

    const candidatePriority =
      sourcePriority[candidateSource as keyof typeof sourcePriority] || 5;
    const existingPriority =
      sourcePriority[existingSource as keyof typeof sourcePriority] || 5;

    if (candidatePriority > existingPriority) {
      return "use_candidate";
    } else if (existingPriority > candidatePriority) {
      return "keep_existing";
    }

    // Field-specific resolution logic
    switch (field) {
      case "name":
        // Prefer longer, more complete names
        return candidateValue.length > existingValue.length
          ? "use_candidate"
          : "keep_existing";

      case "description":
        // Prefer longer descriptions
        return candidateValue.length > existingValue.length
          ? "use_candidate"
          : "keep_existing";

      case "founded":
        // Prefer more recent data (assuming it's more accurate)
        return "use_candidate";

      case "website":
        // Prefer HTTPS URLs, then longer URLs
        if (
          candidateValue.startsWith("https://") &&
          !existingValue.startsWith("https://")
        ) {
          return "use_candidate";
        }
        return candidateValue.length > existingValue.length
          ? "use_candidate"
          : "keep_existing";

      default:
        return "manual_review";
    }
  }

  private recommendMergeStrategy(
    candidate: GameStudio,
    existing: GameStudio,
    matchScore: number,
    conflicts: FieldConflict[],
  ): MergeStrategy {
    const reasoning: string[] = [];

    // Very high confidence match
    if (matchScore >= 0.95) {
      const criticalConflicts = conflicts.filter(
        (c) => ["name", "website"].includes(c.field) && c.confidence < 0.7,
      );

      if (criticalConflicts.length === 0) {
        reasoning.push("Very high match score with no critical conflicts");
        return {
          action: "merge",
          confidence: 0.95,
          reasoning,
        };
      }
    }

    // High confidence match
    if (matchScore >= 0.85) {
      const manualReviewConflicts = conflicts.filter(
        (c) => c.resolution === "manual_review",
      );

      if (manualReviewConflicts.length === 0) {
        reasoning.push("High match score with resolvable conflicts");
        return {
          action: "merge",
          confidence: 0.85,
          reasoning,
        };
      } else {
        reasoning.push(
          "High match score but has conflicts requiring manual review",
        );
        return {
          action: "manual_review",
          confidence: 0.75,
          reasoning,
        };
      }
    }

    // Medium confidence
    if (matchScore >= 0.75) {
      reasoning.push("Medium match score requires manual validation");
      return {
        action: "manual_review",
        confidence: 0.6,
        reasoning,
      };
    }

    // Low confidence - create as new studio
    reasoning.push("Low match score - treat as separate studio");
    return {
      action: "create_new",
      confidence: 0.8,
      reasoning,
    };
  }

  private calculateFieldConfidence(
    field: keyof GameStudio,
    candidateValue: any,
    existingValue: any,
  ): number {
    // Base confidence based on field importance
    const fieldWeights: Record<string, number> = {
      name: 0.9,
      website: 0.8,
      location: 0.7,
      founded: 0.6,
      description: 0.5,
    };

    return fieldWeights[field] || 0.5;
  }

  // Utility methods
  private cleanStudioName(name: string): string {
    return name
      .replace(
        /\s+(Games?|Studios?|Entertainment|Interactive|Inc\.?|LLC\.?|Ltd\.?|Corporation|Corp\.?)$/i,
        "",
      )
      .replace(/^(The\s+)/i, "")
      .trim();
  }

  private generateNameVariations(name: string): string[] {
    const variations = [name];
    const clean = this.cleanStudioName(name);

    if (clean !== name) {
      variations.push(clean);
    }

    // Add common abbreviations
    variations.push(name.replace(/\bGames?\b/gi, "Game"));
    variations.push(name.replace(/\bStudios?\b/gi, "Studio"));
    variations.push(name.replace(/\bEntertainment\b/gi, "Ent"));
    variations.push(name.replace(/\bInteractive\b/gi, "Int"));

    return [...new Set(variations)];
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator,
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  async executeMergeStrategy(match: StudioMatch): Promise<GameStudio> {
    const { existingStudio, candidateStudio, conflicts } = match;
    const mergedStudio = { ...existingStudio };

    // Apply conflict resolutions
    conflicts.forEach((conflict) => {
      switch (conflict.resolution) {
        case "use_candidate":
          (mergedStudio as any)[conflict.field] = conflict.candidateValue;
          break;
        case "merge":
          if (
            Array.isArray(conflict.existingValue) &&
            Array.isArray(conflict.candidateValue)
          ) {
            // Merge arrays
            (mergedStudio as any)[conflict.field] = [
              ...new Set([
                ...conflict.existingValue,
                ...conflict.candidateValue,
              ]),
            ];
          }
          break;
        // 'keep_existing' and 'manual_review' don't change the value
      }
    });

    // Merge game portfolios
    const allGames = [
      ...(existingStudio.games || []),
      ...(candidateStudio.games || []),
    ];
    mergedStudio.games = [...new Set(allGames)];

    // Merge technologies
    const allTechnologies = [
      ...(existingStudio.technologies || []),
      ...(candidateStudio.technologies || []),
    ];
    mergedStudio.technologies = [...new Set(allTechnologies)];

    // Update metadata to track merge
    (mergedStudio as any).mergeHistory =
      (mergedStudio as any).mergeHistory || [];
    (mergedStudio as any).mergeHistory.push({
      mergedFrom: candidateStudio.id,
      mergedAt: new Date(),
      conflicts: conflicts.length,
    });

    return mergedStudio;
  }
}

export const conflictResolutionService = new ConflictResolutionService();
export default conflictResolutionService;
