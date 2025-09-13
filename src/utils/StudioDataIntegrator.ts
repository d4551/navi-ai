
// Guard against browser environment
if (typeof window !== "undefined") {
  throw new Error(
    "StudioDataIntegrator is not supported in browser environments",
  );
}

import { EnhancedPublicAPIDataSource } from "../services/ingestion/EnhancedPublicAPIDataSource";
import { logger } from "../shared/utils/logger";

interface StudioRecord {
  id?: number;
  name: string;
  description: string;
  location: string;
  websites: string; // JSON string
  source_id: string;
  source_entity_id: string;
  metadata: string; // JSON string
  confidence: number;
  last_updated: string;
  created_at?: string;
}

export class StudioDataIntegrator {
  private db: any;
  private apiSource: EnhancedPublicAPIDataSource;

  constructor(dbPath: string, githubToken?: string) {
    const Driver: any = (Database as any).default ?? (Database as any);
    this.db = new Driver(dbPath);
    this.apiSource = new EnhancedPublicAPIDataSource(githubToken);
    this.initializeDatabase();
  }

  private initializeDatabase() {
    // Create studios table if it doesn't exist
    const createTable = `
      CREATE TABLE IF NOT EXISTS studios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        location TEXT,
        websites TEXT, -- JSON array
        source_id TEXT NOT NULL,
        source_entity_id TEXT NOT NULL,
        metadata TEXT, -- JSON object
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(source_id, source_entity_id)
      )
    `;

    this.db.exec(createTable);

    // Create indexes for better performance
    this.db.exec(
      "CREATE INDEX IF NOT EXISTS idx_studios_name ON studios(name)",
    );
    this.db.exec(
      "CREATE INDEX IF NOT EXISTS idx_studios_source ON studios(source_id)",
    );
    this.db.exec(
      "CREATE INDEX IF NOT EXISTS idx_studios_confidence ON studios(confidence)",
    );

    logger.info("Studio database initialized");
  }

  async fetchAndStoreStudios(
  ): Promise<{ total: number; new: number; updated: number }> {
    logger.info("Starting enhanced studio data fetch and storage...");

    try {
      // Create a mock job for the API source
      const job = {
        id: "enhanced-fetch-" + Date.now(),
        sourceId: "enhanced-public-apis",
        type: "full_sync" as const,
        status: "running" as const,
        errors: [],
        metadata: { maxStudios },
      };

      // Fetch data from enhanced API sources
      const studiosData = await this.apiSource.fetchData(job);

      logger.info(`Fetched ${studiosData.length} studios from enhanced APIs`);

      // Prepare SQL statements
      const insertStmt = this.db.prepare(`
        INSERT OR IGNORE INTO studios (
          name, description, location, websites, source_id, 
          source_entity_id, metadata, confidence, last_updated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `);

      const updateStmt = this.db.prepare(`
        UPDATE studios SET 
          description = ?, location = ?, websites = ?, 
          metadata = ?, confidence = ?, last_updated = datetime('now')
        WHERE source_id = ? AND source_entity_id = ?
      `);

      const selectStmt = this.db.prepare(`
        SELECT id FROM studios WHERE source_id = ? AND source_entity_id = ?
      `);


      // Process each studio
      for (const studio of studiosData) {
        try {
          const websites = JSON.stringify(studio.websites || []);
          const metadata = JSON.stringify(studio.metadata || {});

          // Check if studio already exists
          const existing = selectStmt.get(
            studio.sourceId,
            studio.sourceEntityId,
          );

          if (existing) {
            // Update existing record
            const result = updateStmt.run(
              studio.description,
              studio.location,
              websites,
              metadata,
              studio.confidence,
              studio.sourceId,
              studio.sourceEntityId,
            );

              updatedCount++;
            }
          } else {
            // Insert new record
            const result = insertStmt.run(
              studio.name,
              studio.description,
              studio.location,
              websites,
              studio.sourceId,
              studio.sourceEntityId,
              metadata,
              studio.confidence,
            );

              newCount++;
            }
          }
        } catch (_error) {
          logger.warn(`Failed to process studio ${studio.name}:`, error);
        }
      }

      const total = studiosData.length;
      logger.info(
        `Studio data processing completed: ${total} total, ${newCount} new, ${updatedCount} updated`,
      );

      return { total, new: newCount, updated: updatedCount };
    } catch (_error) {
      logger.error("Failed to fetch and store studio data:", error);
      throw error;
    }
  }

  getStudios(
    filters: {
      limit?: number;
      offset?: number;
      source?: string;
      minConfidence?: number;
      searchTerm?: string;
    } = {},
  ): StudioRecord[] {
    const {
      source,
      searchTerm,
    } = filters;

    let query = `
      SELECT id, name, description, location, websites, source_id, 
             source_entity_id, metadata, confidence, last_updated, created_at
      FROM studios
      WHERE confidence >= ?
    `;

    const params: any[] = [minConfidence];

    if (source) {
      query += ` AND source_id = ?`;
      params.push(source);
    }

    if (searchTerm) {
      query += ` AND (name LIKE ? OR description LIKE ?)`;
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    query += ` ORDER BY confidence DESC, name ASC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const stmt = this.db.prepare(query);
    return stmt.all(...params) as StudioRecord[];
  }

  getStudioStats(): {
    total: number;
    bySource: Record<string, number>;
    avgConfidence: number;
    highConfidence: number;
  } {
    const total = (totalStmt.get() as any).count;

    const sourceStmt = this.db.prepare(`
      FROM studios 
      GROUP BY source_id
    `);
    const sourceResults = sourceStmt.all() as any[];
    const bySource = sourceResults.reduce((acc, row) => {
      acc[row.source_id] = row.count;
      return acc;
    }, {});

    const avgStmt = this.db.prepare(
      "SELECT AVG(confidence) as avg FROM studios",
    );

    const highConfStmt = this.db.prepare(
    );
    const highConfidence = (highConfStmt.get() as any).count;

    return {
      total,
      bySource,
      avgConfidence,
      highConfidence,
    };
  }

    const stmt = this.db.prepare(`
      SELECT id, name, description, location, websites, source_id, 
             source_entity_id, metadata, confidence, last_updated, created_at
      FROM studios
      WHERE name LIKE ? OR description LIKE ?
      ORDER BY confidence DESC, name ASC
      LIMIT ?
    `);

    const searchPattern = `%${query}%`;
    return stmt.all(searchPattern, searchPattern, limit) as StudioRecord[];
  }

  getStudiosByGame(gameName: string): StudioRecord[] {
    const stmt = this.db.prepare(`
      SELECT id, name, description, location, websites, source_id, 
             source_entity_id, metadata, confidence, last_updated, created_at
      FROM studios
      WHERE json_extract(metadata, '$.games') IS NOT NULL
      AND metadata LIKE ?
      ORDER BY confidence DESC
    `);

    return stmt.all(`%${gameName}%`) as StudioRecord[];
  }

  close() {
    this.db.close();
  }
}

// Usage example and CLI interface
  dbPath: string = "./data/navi.db",
  githubToken?: string,
) {
  const integrator = new StudioDataIntegrator(dbPath, githubToken);

  try {
    logger.info("Starting enhanced studio data integration...");

    // Fetch and store data
    const result = await integrator.fetchAndStoreStudios(maxStudios);

    console.log("\n[GAME] Enhanced Studio Data Integration Results:");
    console.log(`   [STATS] Total processed: ${result.total}`);
    console.log(`   [MAGIC] New studios: ${result.new}`);

    // Show some statistics
    const stats = integrator.getStudioStats();

    Object.entries(stats.bySource).forEach(([source, count]) => {
      console.log(`   ${source}: ${count} studios`);
    });

    // Show some sample high-quality studios
    console.log("\n[STAR] Sample High-Quality Studios:");
    samples.forEach((studio) => {
      const metadata = JSON.parse(studio.metadata);
      const sources = metadata.sources?.join(", ") || studio.source_id;
      console.log(
        `   ${studio.name} (${sources}) - Confidence: ${studio.confidence}`,
      );
    });

    integrator.close();

    return result;
  } catch (_error) {
    logger.error("Studio data integration failed:", error);
    integrator.close();
    throw error;
  }
}

// CLI interface
if (typeof globalThis !== "undefined" && (globalThis as any).require) {
  const githubToken = process.env.GITHUB_TOKEN;

  runStudioDataIntegration(dbPath, githubToken, maxStudios)
    .then((_result) => {
    })
    .catch((_error) => {
    });
}

export default StudioDataIntegrator;
