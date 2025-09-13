
import { logger } from "@/shared/utils/logger";
import { unifiedStorage } from "@/utils/storage";

export interface DataProvenance {
  studioId: string;
  sources: SourceMetadata[];
  mergeHistory: MergeEvent[];
  lastUpdated: Date;
  dataQuality: QualityMetrics;
}

export interface SourceMetadata {
  sourceId: string;
  sourceEntityId: string;
  firstSeen: Date;
  lastSeen: Date;
  confidence: number;
  fields: FieldProvenance[];
  version: number;
  checksum: string;
}

export interface FieldProvenance {
  fieldName: string;
  value: any;
  sourceId: string;
  timestamp: Date;
  confidence: number;
  validated: boolean;
}

export interface MergeEvent {
  id: string;
  timestamp: Date;
  mergedFromSourceId: string;
  mergedIntoStudioId: string;
  conflictsResolved: number;
  mergeStrategy: string;
  reviewedBy?: string;
}

export interface QualityMetrics {
  overallScore: number;
}

export interface DataLineage {
  studioId: string;
  originalSources: string[];
  transformations: TransformationStep[];
  currentState: {
    fields: Record<string, FieldProvenance>;
    lastValidated: Date;
    validationErrors: string[];
  };
}

export interface TransformationStep {
  id: string;
  type: "normalization" | "merge" | "enrichment" | "validation";
  timestamp: Date;
  description: string;
  inputSources: string[];
  outputFields: string[];
  metadata: Record<string, any>;
}

export class DataSourceTracker {
  private readonly PROVENANCE_KEY = "studio_provenance";
  private readonly LINEAGE_KEY = "studio_lineage";

  async trackStudioData(
    studioId: string,
    sourceId: string,
    data: any,
    confidence: number,
  ): Promise<void> {
    try {
      const provenance =
        (await this.getProvenance(studioId)) ||
        this.createNewProvenance(studioId);

      // Update or add source metadata
      let sourceMetadata = provenance.sources.find(
        (s) => s.sourceId === sourceId,
      );
      if (!sourceMetadata) {
        sourceMetadata = {
          sourceId,
          sourceEntityId: data.id || data.sourceEntityId || studioId,
          firstSeen: new Date(),
          lastSeen: new Date(),
          confidence,
          fields: [],
          checksum: this.generateChecksum(data),
        };
        provenance.sources.push(sourceMetadata);
      } else {
        sourceMetadata.lastSeen = new Date();
        sourceMetadata.confidence = confidence;
        sourceMetadata.version++;
        sourceMetadata.checksum = this.generateChecksum(data);
      }

      // Track individual fields
      await this.trackFields(sourceMetadata, data, sourceId);

      // Update quality metrics
      provenance.dataQuality = this.calculateQualityMetrics(provenance);
      provenance.lastUpdated = new Date();

      await this.saveProvenance(studioId, provenance);

      logger.debug(
        `Updated provenance for studio ${studioId} from source ${sourceId}`,
      );
    } catch (error) {
      logger.error(`Failed to track studio data for ${studioId}:`, error);
    }
  }

  async recordMergeEvent(
    fromStudioId: string,
    toStudioId: string,
    conflictsCount: number,
    strategy: string,
  ): Promise<void> {
    const mergeEvent: MergeEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      mergedFromSourceId: fromStudioId,
      mergedIntoStudioId: toStudioId,
      conflictsResolved: conflictsCount,
      mergeStrategy: strategy,
    };

    const provenance = await this.getProvenance(toStudioId);
    if (provenance) {
      provenance.mergeHistory.push(mergeEvent);
      await this.saveProvenance(toStudioId, provenance);
    }

    logger.info(`Recorded merge event: ${fromStudioId} -> ${toStudioId}`);
  }

  async getProvenance(studioId: string): Promise<DataProvenance | null> {
    try {
      const allProvenance =
        (await unifiedStorage.get(this.PROVENANCE_KEY)) || {};
      return allProvenance[studioId] || null;
    } catch (error) {
      logger.error(`Failed to get provenance for ${studioId}:`, error);
      return null;
    }
  }

  async getAllProvenance(): Promise<Record<string, DataProvenance>> {
    try {
      return (await unifiedStorage.get(this.PROVENANCE_KEY)) || {};
    } catch (error) {
      logger.error("Failed to get all provenance:", error);
      return {};
    }
  }

  async getDataLineage(studioId: string): Promise<DataLineage | null> {
    try {
      const allLineage = (await unifiedStorage.get(this.LINEAGE_KEY)) || {};
      return allLineage[studioId] || null;
    } catch (error) {
      logger.error(`Failed to get lineage for ${studioId}:`, error);
      return null;
    }
  }

  async validateDataIntegrity(studioId: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    lastValidated: Date;
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const provenance = await this.getProvenance(studioId);
      if (!provenance) {
        errors.push("No provenance data found");
        return { isValid: false, errors, warnings, lastValidated: new Date() };
      }

      // Check for conflicting data across sources
      const fieldConflicts = this.findFieldConflicts(provenance);
        warnings.push(
          `Found ${fieldConflicts.length} field conflicts across sources`,
        );
      }

      // Check data freshness
      const oldestUpdate = Math.min(
        ...provenance.sources.map((s) => s.lastSeen.getTime()),
      );
      const daysSinceUpdate =
        warnings.push(`Data is ${Math.floor(daysSinceUpdate)} days old`);
      }

      // Check completeness
        warnings.push("Low data completeness score");
      }

      // Check consistency
        warnings.push("Low data consistency across sources");
      }

      return {
        errors,
        warnings,
        lastValidated: new Date(),
      };
    } catch (error: any) {
      errors.push(`Validation failed: ${error.message}`);
      return { isValid: false, errors, warnings, lastValidated: new Date() };
    }
  }

  async generateDataReport(studioId?: string): Promise<{
    studiosTracked: number;
    sourcesActive: number;
    totalMerges: number;
    qualityDistribution: Record<string, number>;
    sourceBreakdown: Record<string, number>;
    recentActivity: Array<{
      studioId: string;
      action: string;
      timestamp: Date;
      source: string;
    }>;
  }> {
    const allProvenance = await this.getAllProvenance();
    const studios = studioId
      ? [allProvenance[studioId]].filter(Boolean)
      : Object.values(allProvenance);

    const activeSources = new Set<string>();
    const sourceBreakdown: Record<string, number> = {};
    const recentActivity: Array<any> = [];

    studios.forEach((provenance) => {
      if (!provenance) return;

      provenance.sources.forEach((source) => {
        activeSources.add(source.sourceId);
        sourceBreakdown[source.sourceId] =
      });

      totalMerges += provenance.mergeHistory.length;

      // Quality distribution
      const quality = provenance.dataQuality.overallScore;
      else qualityBuckets.low++;

      provenance.sources.forEach((source) => {
        if (source.lastSeen.getTime() > thirtyDaysAgo) {
          recentActivity.push({
            studioId: provenance.studioId,
            action: "data_update",
            timestamp: source.lastSeen,
            source: source.sourceId,
          });
        }
      });
    });

    // Sort recent activity by timestamp
    recentActivity.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );

    return {
      studiosTracked: studios.length,
      sourcesActive: activeSources.size,
      totalMerges,
      qualityDistribution: qualityBuckets,
      sourceBreakdown,
    };
  }

  private createNewProvenance(studioId: string): DataProvenance {
    return {
      studioId,
      sources: [],
      mergeHistory: [],
      lastUpdated: new Date(),
      dataQuality: {
      },
    };
  }

  private async trackFields(
    sourceMetadata: SourceMetadata,
    data: any,
    sourceId: string,
  ): Promise<void> {
    const fields: FieldProvenance[] = [];

    Object.entries(data).forEach(([fieldName, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        fields.push({
          fieldName,
          value,
          sourceId,
          timestamp: new Date(),
          confidence: sourceMetadata.confidence,
          validated: false,
        });
      }
    });

    sourceMetadata.fields = fields;
  }

  private calculateQualityMetrics(provenance: DataProvenance): QualityMetrics {
    const sources = provenance.sources;
      return {
      };
    }

    // Completeness: percentage of expected fields that have data
    const expectedFields = [
      "name",
      "location",
      "founded",
      "description",
      "games",
      "technologies",
    ];
    const allFields = new Set(
      sources.flatMap((s) => s.fields.map((f) => f.fieldName)),
    );
    const completeness =
      expectedFields.filter((f) => allFields.has(f)).length /
      expectedFields.length;

    // Consistency: agreement between sources on common fields
      const conflicts = this.findFieldConflicts(provenance);
      const totalComparableFields = this.countComparableFields(sources);
      consistency =
    }

    // Freshness: how recent the newest data is
    const newestUpdate = Math.max(...sources.map((s) => s.lastSeen.getTime()));

    // Accuracy: weighted average of source confidences
    const accuracy = totalConfidence / sources.length;

    // Overall score
    const overallScore =

    return {
      completeness,
      consistency,
      freshness,
      accuracy,
      overallScore,
    };
  }

  private findFieldConflicts(provenance: DataProvenance): Array<{
    field: string;
    values: Array<{ sourceId: string; value: any }>;
  }> {
    const fieldMap = new Map<string, Array<{ sourceId: string; value: any }>>();

    // Collect all field values by field name
    provenance.sources.forEach((source) => {
      source.fields.forEach((field) => {
        if (!fieldMap.has(field.fieldName)) {
          fieldMap.set(field.fieldName, []);
        }
        fieldMap.get(field.fieldName)!.push({
          sourceId: source.sourceId,
          value: field.value,
        });
      });
    });

    // Find conflicts (different values for the same field)
    const conflicts: Array<{
      field: string;
      values: Array<{ sourceId: string; value: any }>;
    }> = [];

    fieldMap.forEach((values, fieldName) => {
        const uniqueValues = new Set(
          values.map((v) => JSON.stringify(v.value)),
        );
          conflicts.push({
            field: fieldName,
            values,
          });
        }
      }
    });

    return conflicts;
  }

  private countComparableFields(sources: SourceMetadata[]): number {
    const fieldCounts = new Map<string, number>();

    sources.forEach((source) => {
      source.fields.forEach((field) => {
        fieldCounts.set(
          field.fieldName,
        );
      });
    });

    // Count fields that appear in multiple sources (comparable fields)
  }

  private generateChecksum(data: any): string {
    // Simple checksum based on JSON string
    const jsonStr = JSON.stringify(data, Object.keys(data).sort());
      const char = jsonStr.charCodeAt(i);
    }
  }

  private async saveProvenance(
    studioId: string,
    provenance: DataProvenance,
  ): Promise<void> {
    const allProvenance = (await unifiedStorage.get(this.PROVENANCE_KEY)) || {};
    allProvenance[studioId] = provenance;
    await unifiedStorage.set(this.PROVENANCE_KEY, allProvenance);
  }
}

export const dataSourceTracker = new DataSourceTracker();
export default dataSourceTracker;
