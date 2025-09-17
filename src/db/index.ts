// Enhanced RxDB-compatible database layer
import { createRxDatabase, addRxPlugin } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';

let dbPromise: Promise<any> | null = null;

export async function getDB() {
  if (!dbPromise) {
    dbPromise = createRxDatabase({
      name: 'appdb',
      storage: getRxStorageDexie(),
    });

    // Initialize collections when database is ready
    const db = await dbPromise;

    // Add collections with schemas
    // await db.addCollections({
    //   users: { schema: userSchema },
    //   jobs: { schema: jobSchema },
    //   resumes: { schema: resumeSchema }
    // });
  }
  return dbPromise;
}

// Re-export existing unified storage for backwards compatibility
export { unifiedStorage as db } from '@/utils/storage';
export { unifiedStorage } from '@/utils/storage';

// Repository exports for direct access
export { JobRepository } from '@/modules/db/repositories/jobs';
export { ResumeRepository } from '@/modules/db/repositories/resume';
export { PortfolioRepository } from '@/modules/db/repositories/portfolio';
export { UserRepository } from '@/modules/db/repositories/user';
export { StudioRepository } from '@/modules/db/repositories/studios';

// Enhanced database utilities
export * from '@/modules/db/models';
export * from '@/modules/db/queries';
export * from '@/modules/db/migrations';

// Schema exports
export type { Resume } from '@/modules/db/repositories/resume';
export type { Portfolio, PortfolioProject } from '@/modules/db/repositories/portfolio';
export type { UserProfile, UserSettings } from '@/modules/db/repositories/user';
export type { StudioData } from '@/modules/db/repositories/studios';
