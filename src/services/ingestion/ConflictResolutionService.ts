
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

    // Name matching (highest weight)
    const nameScore = this.calculateNameSimilarity(
      candidate.name,
      existing.name,
    );

    // Website matching
    if (candidate.website && existing.website) {
      const websiteScore = this.calculateWebsiteSimilarity(
        candidate.website,
        existing.website,
      );
    }

    // Game portfolio overlap
    const gameScore = this.calculateGameOverlap(
      candidate.games || [],
      existing.games || [],
    );

    // Location matching
    if (candidate.location && existing.location) {
      const locationScore = this.calculateLocationSimilarity(
        candidate.location,
        existing.location,
      );
    }

    // Founded year proximity
    if (candidate.founded && existing.founded) {
      const yearDiff = Math.abs(candidate.founded - existing.founded);
    }

  }


    // Exact match
    }

    // Check for common variations

        }
      }
    }

    // Fuzzy matching using Levenshtein distance
    const distance = this.levenshteinDistance(
    );
  }

    try {
    } catch {
    }
  }




    return intersection.length / union.size;
  }



    // Check if one location contains the other (e.g., "San Francisco, CA" vs "San Francisco")
    }

    // Extract cities and compare

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
    };

    const candidatePriority =
    const existingPriority =

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
      const criticalConflicts = conflicts.filter(
      );

        reasoning.push("Very high match score with no critical conflicts");
        return {
          action: "merge",
          reasoning,
        };
      }
    }

    // High confidence match
      const manualReviewConflicts = conflicts.filter(
        (c) => c.resolution === "manual_review",
      );

        reasoning.push("High match score with resolvable conflicts");
        return {
          action: "merge",
          reasoning,
        };
      } else {
        reasoning.push(
          "High match score but has conflicts requiring manual review",
        );
        return {
          action: "manual_review",
          reasoning,
        };
      }
    }

    // Medium confidence
      reasoning.push("Medium match score requires manual validation");
      return {
        action: "manual_review",
        reasoning,
      };
    }

    // Low confidence - create as new studio
    reasoning.push("Low match score - treat as separate studio");
    return {
      action: "create_new",
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
    };

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

      .fill(null)


        matrix[j][i] = Math.min(
        );
      }
    }

  }

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
