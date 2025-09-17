/**
 * Profile Synchronization Service
 *
 * Manages cross-system profile data synchronization ensuring
 * user profile changes are reflected across all application areas:
 * - Job board and matching algorithms
 * - AI training and personalization
 * - Studio matching and recommendations
 * - Portfolio generation and templates
 * - Resume and cover letter builders
 * - Settings and preferences
 */

import { EventEmitter } from 'events'
import { logger } from '@/shared/utils/logger'
import { unifiedStorage } from '@/utils/storage'

export interface SyncEvent {
  type:
    | 'profile-updated'
    | 'section-changed'
    | 'batch-update'
    | 'import-complete'
  source: string
  data: any
  timestamp: Date
  affectedSystems: string[]
}

export interface SyncTarget {
  id: string
  name: string
  handler: (event: SyncEvent) => Promise<void>
  priority: number
  dependencies: string[]
}

export class ProfileSyncService extends EventEmitter {
  private static instance: ProfileSyncService
  private syncTargets: Map<string, SyncTarget> = new Map()
  private syncQueue: SyncEvent[] = []
  private isProcessing = false
  private syncHistory: SyncEvent[] = []
  private maxHistorySize = 100

  static getInstance(): ProfileSyncService {
    if (!ProfileSyncService.instance) {
      ProfileSyncService.instance = new ProfileSyncService()
    }
    return ProfileSyncService.instance
  }

  constructor() {
    super()
    this.registerBuiltInTargets()
  }

  /**
   * Register a system to receive profile sync events
   */
  registerSyncTarget(target: SyncTarget): void {
    this.syncTargets.set(target.id, target)
    logger.info(`Registered sync target: ${target.name}`)
  }

  /**
   * Unregister a sync target
   */
  unregisterSyncTarget(targetId: string): void {
    this.syncTargets.delete(targetId)
    logger.info(`Unregistered sync target: ${targetId}`)
  }

  /**
   * Trigger profile synchronization across all registered systems
   */
  async syncProfile(event: Omit<SyncEvent, 'timestamp'>): Promise<void> {
    const fullEvent: SyncEvent = {
      ...event,
      timestamp: new Date(),
    }

    this.syncQueue.push(fullEvent)
    this.addToHistory(fullEvent)

    if (!this.isProcessing) {
      await this.processQueue()
    }
  }

  /**
   * Process the sync queue with proper error handling and retry logic
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.syncQueue.length === 0) {
      return
    }

    this.isProcessing = true

    try {
      while (this.syncQueue.length > 0) {
        const event = this.syncQueue.shift()!
        await this.processSyncEvent(event)
      }
    } catch (error) {
      logger.error('Error processing sync queue:', error)
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Process a single sync event
   */
  private async processSyncEvent(event: SyncEvent): Promise<void> {
    const targetIds = this.getTargetsForEvent(event)
    const sortedTargets = this.sortTargetsByPriority(targetIds)

    logger.info(
      `Processing sync event: ${event.type} affecting ${targetIds.length} targets`
    )

    // Process targets in priority order with dependency resolution
    for (const targetId of sortedTargets) {
      const target = this.syncTargets.get(targetId)
      if (!target) continue

      try {
        await this.processSingleTarget(target, event)
      } catch (error) {
        logger.error(`Sync failed for target ${target.name}:`, error)
        this.emit('sync-error', { target: target.id, event, error })
      }
    }

    this.emit('sync-complete', { event, processedTargets: targetIds })
  }

  /**
   * Process sync for a single target
   */
  private async processSingleTarget(
    target: SyncTarget,
    event: SyncEvent
  ): Promise<void> {
    const startTime = Date.now()

    try {
      await target.handler(event)

      const duration = Date.now() - startTime
      logger.debug(`Sync completed for ${target.name} in ${duration}ms`)

      this.emit('target-synced', {
        target: target.id,
        event: event.type,
        duration,
      })
    } catch (error) {
      logger.error(`Failed to sync ${target.name}:`, error)
      throw error
    }
  }

  /**
   * Determine which targets should receive this sync event
   */
  private getTargetsForEvent(event: SyncEvent): string[] {
    if (event.affectedSystems?.length > 0) {
      return event.affectedSystems
    }

    // Default mapping based on event type and data
    const allTargets = Array.from(this.syncTargets.keys())

    switch (event.type) {
      case 'profile-updated':
        return allTargets
      case 'section-changed':
        return this.getTargetsForSection(event.data?.section)
      case 'batch-update':
        return allTargets
      case 'import-complete':
        return allTargets
      default:
        return allTargets
    }
  }

  /**
   * Get targets that should be notified for a specific profile section change
   */
  private getTargetsForSection(section: string): string[] {
    const sectionTargetMap: Record<string, string[]> = {
      personalInfo: [
        'jobs',
        'ai',
        'studios',
        'portfolio',
        'resume',
        'settings',
      ],
      skills: ['jobs', 'ai', 'studios', 'portfolio', 'resume'],
      experience: ['jobs', 'ai', 'studios', 'portfolio', 'resume'],
      education: ['jobs', 'ai', 'studios', 'portfolio', 'resume'],
      gamingExperience: ['ai', 'studios', 'portfolio'],
      careerGoals: ['jobs', 'ai', 'studios'],
      portfolio: ['studios', 'portfolio', 'resume'],
      preferences: ['settings', 'ai'],
      privacy: ['settings', 'ai', 'jobs'],
    }

    return sectionTargetMap[section] || Array.from(this.syncTargets.keys())
  }

  /**
   * Sort targets by priority and resolve dependencies
   */
  private sortTargetsByPriority(targetIds: string[]): string[] {
    const targets = targetIds
      .map(id => this.syncTargets.get(id))
      .filter(Boolean) as SyncTarget[]

    // Simple priority sort for now - could be enhanced with dependency resolution
    return targets
      .sort((a, b) => b.priority - a.priority)
      .map(target => target.id)
  }

  /**
   * Register built-in sync targets for core application systems
   */
  private registerBuiltInTargets(): void {
    // Job Search & Matching System
    this.registerSyncTarget({
      id: 'jobs',
      name: 'Job Search & Matching',
      priority: 10,
      dependencies: [],
      handler: async (event: SyncEvent) => {
        try {
          // Clear job matching caches
          if (
            typeof window !== 'undefined' &&
            (window as any).jobMatchingCache
          ) {
            ;(window as any).jobMatchingCache.clear()
          }

          // Update job search preferences
          const jobPrefs = this.extractJobPreferences(event.data)
          await unifiedStorage.setItem('job-search-preferences', jobPrefs)

          // Trigger re-matching for saved jobs
          this.emit('jobs-profile-updated', { preferences: jobPrefs })
        } catch (error) {
          logger.error('Job system sync failed:', error)
          throw error
        }
      },
    })

    // AI Training & Personalization System
    this.registerSyncTarget({
      id: 'ai',
      name: 'AI Training & Personalization',
      priority: 9,
      dependencies: [],
      handler: async (event: SyncEvent) => {
        try {
          // Update AI training context
          const aiContext = this.extractAIContext(event.data)
          await unifiedStorage.setItem('ai-training-context', aiContext)

          // Mark AI models for retraining if skills/experience changed
          if (
            ['skills', 'experience', 'careerGoals'].includes(
              event.data?.section
            )
          ) {
            await unifiedStorage.setItem('ai-needs-retraining', true)
          }

          this.emit('ai-profile-updated', { context: aiContext })
        } catch (error) {
          logger.error('AI system sync failed:', error)
          throw error
        }
      },
    })

    // Studio Matching & Research System
    this.registerSyncTarget({
      id: 'studios',
      name: 'Studio Matching & Research',
      priority: 8,
      dependencies: [],
      handler: async (event: SyncEvent) => {
        try {
          // Update studio matching criteria
          const studioPrefs = this.extractStudioPreferences(event.data)
          await unifiedStorage.setItem('studio-preferences', studioPrefs)

          // Invalidate studio match caches
          if (
            typeof window !== 'undefined' &&
            (window as any).studioMatchingCache
          ) {
            ;(window as any).studioMatchingCache.clear()
          }

          this.emit('studios-profile-updated', { preferences: studioPrefs })
        } catch (error) {
          logger.error('Studio system sync failed:', error)
          throw error
        }
      },
    })

    // Portfolio & Showcase System
    this.registerSyncTarget({
      id: 'portfolio',
      name: 'Portfolio & Showcase',
      priority: 7,
      dependencies: [],
      handler: async (event: SyncEvent) => {
        try {
          // Update portfolio generation context
          const portfolioData = this.extractPortfolioData(event.data)
          await unifiedStorage.setItem('portfolio-context', portfolioData)

          // Mark templates for regeneration
          await unifiedStorage.setItem('portfolio-needs-regeneration', true)

          this.emit('portfolio-profile-updated', { data: portfolioData })
        } catch (error) {
          logger.error('Portfolio system sync failed:', error)
          throw error
        }
      },
    })

    // Resume & Cover Letter System
    this.registerSyncTarget({
      id: 'resume',
      name: 'Resume & Cover Letter',
      priority: 6,
      dependencies: [],
      handler: async (event: SyncEvent) => {
        try {
          // Update resume builder context
          const resumeData = this.extractResumeData(event.data)
          await unifiedStorage.setItem('resume-context', resumeData)

          // Invalidate generated resumes and templates
          await unifiedStorage.setItem('resume-templates-outdated', true)

          this.emit('resume-profile-updated', { data: resumeData })
        } catch (error) {
          logger.error('Resume system sync failed:', error)
          throw error
        }
      },
    })

    // Settings & Preferences System
    this.registerSyncTarget({
      id: 'settings',
      name: 'Settings & Preferences',
      priority: 5,
      dependencies: [],
      handler: async (event: SyncEvent) => {
        try {
          // Update user preferences
          const preferences = this.extractUserPreferences(event.data)
          await unifiedStorage.setItem('user-preferences', preferences)

          this.emit('settings-profile-updated', { preferences })
        } catch (error) {
          logger.error('Settings system sync failed:', error)
          throw error
        }
      },
    })
  }

  /**
   * Extract job search preferences from profile data
   */
  private extractJobPreferences(profileData: any): any {
    return {
      skills: profileData?.skills || {},
      experience: profileData?.experience || [],
      careerGoals: profileData?.careerGoals || {},
      location: profileData?.personalInfo?.location || '',
      workPreferences: profileData?.careerGoals?.workPreferences || {},
      salaryExpectations: profileData?.careerGoals?.salaryExpectations || {},
      lastUpdated: new Date().toISOString(),
    }
  }

  /**
   * Extract AI training context from profile data
   */
  private extractAIContext(profileData: any): any {
    return {
      technicalSkills: profileData?.skills?.technical || [],
      softSkills: profileData?.skills?.soft || [],
      gamingSkills: profileData?.skills?.gaming || [],
      experience: profileData?.experience || [],
      gamingExperience: profileData?.gamingExperience || {},
      careerGoals: profileData?.careerGoals || {},
      communicationStyle:
        profileData?.preferences?.communicationStyle || 'professional',
      lastUpdated: new Date().toISOString(),
    }
  }

  /**
   * Extract studio matching preferences from profile data
   */
  private extractStudioPreferences(profileData: any): any {
    return {
      skills: profileData?.skills || {},
      gamingExperience: profileData?.gamingExperience || {},
      careerGoals: profileData?.careerGoals || {},
      portfolioItems: profileData?.portfolio || [],
      achievements: profileData?.achievements || [],
      lastUpdated: new Date().toISOString(),
    }
  }

  /**
   * Extract portfolio generation data from profile data
   */
  private extractPortfolioData(profileData: any): any {
    return {
      personalInfo: profileData?.personalInfo || {},
      experience: profileData?.experience || [],
      education: profileData?.education || [],
      skills: profileData?.skills || {},
      portfolioItems: profileData?.portfolio || [],
      achievements: profileData?.achievements || [],
      certifications: profileData?.certifications || [],
      lastUpdated: new Date().toISOString(),
    }
  }

  /**
   * Extract resume building data from profile data
   */
  private extractResumeData(profileData: any): any {
    return {
      personalInfo: profileData?.personalInfo || {},
      experience: profileData?.experience || [],
      education: profileData?.education || [],
      skills: profileData?.skills || {},
      certifications: profileData?.certifications || [],
      achievements: profileData?.achievements || [],
      lastUpdated: new Date().toISOString(),
    }
  }

  /**
   * Extract user preferences from profile data
   */
  private extractUserPreferences(profileData: any): any {
    return {
      personalInfo: profileData?.personalInfo || {},
      privacy: profileData?.meta?.privacySettings || {},
      notifications: profileData?.meta?.notifications || {},
      integrations: profileData?.meta?.integrations || {},
      dataConsent: profileData?.meta?.dataConsent || false,
      lastUpdated: new Date().toISOString(),
    }
  }

  /**
   * Add event to sync history
   */
  private addToHistory(event: SyncEvent): void {
    this.syncHistory.unshift(event)

    if (this.syncHistory.length > this.maxHistorySize) {
      this.syncHistory = this.syncHistory.slice(0, this.maxHistorySize)
    }
  }

  /**
   * Get sync history
   */
  getSyncHistory(): SyncEvent[] {
    return [...this.syncHistory]
  }

  /**
   * Get registered sync targets
   */
  getSyncTargets(): SyncTarget[] {
    return Array.from(this.syncTargets.values())
  }

  /**
   * Check if sync is currently in progress
   */
  isProcessingSync(): boolean {
    return this.isProcessing
  }

  /**
   * Get sync queue length
   */
  getQueueLength(): number {
    return this.syncQueue.length
  }
}

// Export singleton instance
export const profileSyncService = ProfileSyncService.getInstance()
export default profileSyncService
