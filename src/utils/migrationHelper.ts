/**
 * Migration Helper Utilities
 * Helps migrate from legacy JavaScript implementations to new TypeScript services
 */

import { logger } from '@/shared/utils/logger'
import { unifiedDataService } from '@/services/UnifiedDataService'
import { ai } from '@/shared/ai/canonical'
import { jobApplicationTrackingService } from '@/modules/api/job-application-tracking'
import type { ApplicationStatus } from '@/modules/api/job-application-tracking'

export interface MigrationResult {
  success: boolean
  message: string
  migratedItems: number
  errors: string[]
}

export class MigrationHelper {
  private static instance: MigrationHelper

  static getInstance(): MigrationHelper {
    if (!MigrationHelper.instance) {
      MigrationHelper.instance = new MigrationHelper()
    }
    return MigrationHelper.instance
  }

  /**
   * Migrate from localStorage to UnifiedDataService
   */
  async migrateToUnifiedData(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      message: '',
      migratedItems: 0,
      errors: []
    }

    try {
      // Get all localStorage keys that look like app data
      const legacyKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('navicv-') || 
        key.startsWith('gd_') ||
        key.includes('resume') ||
        key.includes('job') ||
        key.includes('portfolio')
      )

      for (const key of legacyKeys) {
        try {
          const value = localStorage.getItem(key)
          if (value) {
            let parsedValue
            try {
              parsedValue = JSON.parse(value)
            } catch {
              parsedValue = value // Keep as string if not JSON
            }

            // Determine namespace based on key
            let namespace: keyof typeof unifiedDataService.NAMESPACES = 'user'
            if (key.includes('job')) namespace = 'jobs'
            else if (key.includes('resume')) namespace = 'resume'
            else if (key.includes('portfolio')) namespace = 'portfolio'
            else if (key.includes('settings')) namespace = 'settings'
            else if (key.includes('ai')) namespace = 'ai'

            // Migrate to UnifiedDataService
            await unifiedDataService.set(namespace, key, parsedValue)
            result.migratedItems++
          }
        } catch (error) {
          const errorMsg = `Failed to migrate ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`
          result.errors.push(errorMsg)
          logger.warn(errorMsg)
        }
      }

      result.message = `Successfully migrated ${result.migratedItems} items to UnifiedDataService`
      logger.info(result.message)

    } catch (error) {
      result.success = false
      result.message = `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      result.errors.push(result.message)
      logger.error('Data migration failed:', error)
    }

    return result
  }

  /**
   * Migrate job applications from old format to new tracking system
   */
  async migrateJobApplications(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      message: '',
      migratedItems: 0,
      errors: []
    }

    try {
      // Look for old job applications in localStorage
      const appData = localStorage.getItem('navicv-data')
      if (appData) {
        const parsed = JSON.parse(appData)
        const oldApplications = parsed?.jobSearchData?.applications || []

        for (const oldApp of oldApplications) {
          try {
            // Convert to new format
            const newApplication = {
              title: oldApp.title || oldApp.position || 'Unknown Position',
              company: oldApp.company || 'Unknown Company',
              location: oldApp.location || '',
              appliedDate: new Date(oldApp.appliedAt || oldApp.date || Date.now()),
              status: this.convertOldStatus(oldApp.status || 'applied'),
              source: oldApp.source || 'manual',
              notes: oldApp.notes || '',
              jobUrl: oldApp.url || oldApp.link || '',
              salary: oldApp.salary ? {
                min: oldApp.salary.min,
                max: oldApp.salary.max,
                currency: oldApp.salary.currency || 'USD',
                type: 'annual' as const
              } : undefined,
              tags: oldApp.tags || [],
              priority: oldApp.priority || 'medium' as const,
              archived: oldApp.archived || false
            }
d
            await jobApplicationTrackingService.createApplication(newApplication)
            result.migratedItems++

          } catch (error) {
            const errorMsg = `Failed to migrate application for ${oldApp.company}: ${error instanceof Error ? error.message : 'Unknown error'}`
            result.errors.push(errorMsg)
            logger.warn(errorMsg)
          }
        }
      }

      result.message = `Successfully migrated ${result.migratedItems} job applications`
      logger.info(result.message)

    } catch (error) {
      result.success = false
      result.message = `Job application migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      result.errors.push(result.message)
      logger.error('Job application migration failed:', error)
    }

    return result
  }

  /**
   * Test new AI service compatibility
   */
  async testAIServiceMigration(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      message: '',
      migratedItems: 0,
      errors: []
    }

    try {
      // Test if AI service is ready
      const status = ai.getStatus()
      const isReady = status.initialized
      
      if (!isReady) {
        result.success = false
        result.message = 'AI service is not configured. Please set up your API key first.'
        result.errors.push('API key not configured')
        return result
      }

      // Test basic functionality
      try {
        const testResponse = await ai.generateText('Hello, this is a test')

        if (testResponse.content) {
          result.message = 'AI service is working correctly'
          result.migratedItems = 1
        } else {
          result.success = false
          result.message = 'AI service returned an empty response'
          result.errors.push('Empty AI response')
        }
      } catch (error) {
        result.success = false
        result.message = `AI service test error: ${error instanceof Error ? error.message : 'Unknown error'}`
        result.errors.push(result.message)
      }

    } catch (error) {
      result.success = false
      result.message = `AI service migration test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      result.errors.push(result.message)
      logger.error('AI service test failed:', error)
    }

    return result
  }

  /**
   * Run all migrations
   */
  async runAllMigrations(): Promise<MigrationResult[]> {
    const results: MigrationResult[] = []

    logger.info('Starting comprehensive migration process...')

    // 1. Migrate data storage
    const dataResult = await this.migrateToUnifiedData()
    results.push(dataResult)

    // 2. Migrate job applications
    const jobsResult = await this.migrateJobApplications()
    results.push(jobsResult)

    // 3. Test AI service
    const aiResult = await this.testAIServiceMigration()
    results.push(aiResult)

    // Summary
    const totalMigrated = results.reduce((sum, r) => sum + r.migratedItems, 0)
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0)
    const allSuccessful = results.every(r => r.success)

    logger.info(`Migration complete: ${totalMigrated} items migrated, ${totalErrors} errors, success: ${allSuccessful}`)

    return results
  }

  /**
   * Clean up old data after successful migration
   */
  async cleanupOldData(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      message: '',
      migratedItems: 0,
      errors: []
    }

    try {
      // List of old keys to remove after migration
      const keysToRemove = [
        'navicv-legacy-jobs',
        'navicv-old-applications',
        'navicv-deprecated-data'
        // Add more specific keys as needed
      ]

      for (const key of keysToRemove) {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key)
          result.migratedItems++
        }
      }

      result.message = `Cleaned up ${result.migratedItems} legacy data items`
      logger.info(result.message)

    } catch (error) {
      result.success = false
      result.message = `Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      result.errors.push(result.message)
      logger.error('Data cleanup failed:', error)
    }

    return result
  }

  /**
   * Get migration status for UI display
   */
  async getMigrationStatus(): Promise<{
    needsMigration: boolean
    dataVersion: string
    recommendations: string[]
  }> {
    const status = {
      needsMigration: false,
      dataVersion: '1.0.0',
      recommendations: [] as string[]
    }

    try {
      // Check for old localStorage data
      const hasOldData = Object.keys(localStorage).some(key => 
        key.startsWith('navicv-') && !key.includes('theme')
      )

      if (hasOldData) {
        status.needsMigration = true
        status.recommendations.push('Migrate localStorage data to new UnifiedDataService')
      }

      // Check for old job application format
      const appData = localStorage.getItem('navicv-data')
      if (appData) {
        const parsed = JSON.parse(appData)
        if (parsed?.jobSearchData?.applications?.length > 0) {
          status.needsMigration = true
          status.recommendations.push('Migrate job applications to new tracking system')
        }
      }

      // Check AI service configuration
      const aiStatus = ai.getStatus()
      const aiReady = aiStatus.initialized
      if (!aiReady) {
        status.recommendations.push('Configure AI service API key for enhanced features')
      }

    } catch (error) {
      logger.warn('Error checking migration status:', error)
      status.recommendations.push('Check system configuration for any issues')
    }

    return status
  }

  /**
   * Convert old application status to new format
   */
  private convertOldStatus(oldStatus: string): ApplicationStatus {
    const statusMap: Record<string, ApplicationStatus> = {
      'applied': 'applied',
      'pending': 'applied', 
      'reviewing': 'screening',
      'interview': 'phone_interview',
      'phone': 'phone_interview',
      'onsite': 'onsite_interview',
      'technical': 'technical_interview',
      'offer': 'offer_received',
      'accepted': 'offer_accepted',
      'declined': 'offer_declined',
      'rejected': 'rejected',
      'withdrawn': 'withdrawn'
    }

    return statusMap[oldStatus.toLowerCase()] || 'applied'
  }

  /**
   * Validate data integrity after migration
   */
  async validateMigration(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      message: '',
      migratedItems: 0,
      errors: []
    }

    try {
      // Test UnifiedDataService
      await unifiedDataService.set('user', 'migration-test', { test: true })
      const testData = await unifiedDataService.get('user', 'migration-test')
      if (!testData) {
        result.errors.push('UnifiedDataService validation failed')
      } else {
        result.migratedItems++
        await unifiedDataService.delete('user', 'migration-test')
      }

      // Test JobApplicationTrackingService
      const testApp = await jobApplicationTrackingService.createApplication({
        title: 'Test Position',
        company: 'Test Company',
        location: 'Test Location'
      })
      if (testApp.id) {
        result.migratedItems++
        await jobApplicationTrackingService.deleteApplication(testApp.id)
      } else {
        result.errors.push('JobApplicationTrackingService validation failed')
      }

      // Test AI Service
      const aiStatus = ai.getStatus()
      const aiReady = aiStatus.initialized
      if (aiReady) {
        result.migratedItems++
      } else {
        result.errors.push('AI Service not ready (may need configuration)')
      }

      if (result.errors.length > 0) {
        result.success = false
        result.message = `Validation completed with ${result.errors.length} issues`
      } else {
        result.message = `All ${result.migratedItems} services validated successfully`
      }

    } catch (error) {
      result.success = false
      result.message = `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      result.errors.push(result.message)
      logger.error('Migration validation failed:', error)
    }

    return result
  }
}

// Export singleton instance
export const migrationHelper = MigrationHelper.getInstance()

// Export convenience functions
export const runMigration = () => migrationHelper.runAllMigrations()
export const getMigrationStatus = () => migrationHelper.getMigrationStatus()
export const validateMigration = () => migrationHelper.validateMigration()
export const cleanupOldData = () => migrationHelper.cleanupOldData()