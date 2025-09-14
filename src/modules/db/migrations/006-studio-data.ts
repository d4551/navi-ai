/**
 * Studio Data Migration - Ensures gaming studios are properly loaded into the database
 */

import type { Migration } from './index';
import { logger } from '@/shared/utils/logger';
import { studioDatabaseInitializer } from '@/modules/studio/StudioDatabaseInitializer';

export const studioDataMigration: Migration = {
  id: '006-initialize-studio-data',
  name: 'Initialize Gaming Studio Data',
  version: 6,
  description: 'Load and organize gaming studio data into the database',
  
  up: async () => {
    try {
      logger.info('Running studio data migration...');
      
      const result = await studioDatabaseInitializer.initializeStudios();
      
      if (result.success) {
        logger.info(`✅ Studio data migration completed: ${result.loaded} studios loaded`);
      } else {
        logger.warn(`[WARNING] Studio data migration completed with issues: ${result.errors.join(', ')}`);
      }
      
      // Validate the data after loading
      const validation = await studioDatabaseInitializer.validateStudioData();
      
      if (validation.valid) {
        logger.info(`[STATS] Studio data validation passed: ${validation.totalStudios} studios available`);
      } else {
        logger.warn(`[WARNING] Studio data validation issues: ${validation.issues.join(', ')}`);
      }
      
    } catch (error) {
      logger.error('Studio data migration failed:', error);
      throw error;
    }
  },
  
  down: async () => {
    logger.info('Rolling back studio data migration...');
    // In a real database, we would remove the studio data here
    // For now, we'll just log the rollback since we're using static data
    logger.info('Studio data migration rolled back (data preserved)');
  }
};
