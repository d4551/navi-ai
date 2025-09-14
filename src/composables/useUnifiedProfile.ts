/**
 * Unified Profile Management System
 * 
 * This composable provides a single source of truth for user profile data
 * that is automatically synchronized across:
 * - Job board and matching
 * - AI settings and preferences  
 * - Studio matching and recommendations
 * - Portfolio generation
 * - Resume and cover letter builders
 * - Settings and preferences
 * 
 * Write once, use everywhere principle - user edits profile in one place,
 * changes are reflected across the entire application.
 */

import { computed, watch, ref, reactive } from 'vue'
import { useAppStore } from '@/stores/app'
import { useUserProfile } from '@/composables/useUserProfile'
import { logger } from '@/shared/utils/logger'
import { userProfileService } from '@/services/UserProfileService'

export interface ProfileContext {
  jobs: 'job-search' | 'job-matching' | 'applications' | 'alerts'
  ai: 'training' | 'recommendations' | 'analysis' | 'insights'
  studios: 'matching' | 'research' | 'networking' | 'applications'
  portfolio: 'generation' | 'showcase' | 'templates' | 'export'
  resume: 'builder' | 'tailoring' | 'templates' | 'analysis'
  settings: 'preferences' | 'privacy' | 'integrations' | 'sync'
}

export interface UnifiedProfileState {
  isLoading: boolean
  lastSync: Date | null
  syncStatus: 'idle' | 'syncing' | 'success' | 'error'
  contextData: Record<keyof ProfileContext, any>
  autoSyncEnabled: boolean
}

export function useUnifiedProfile() {
  const store = useAppStore()
  const userProfile = useUserProfile()
  
  // Unified state management
  const state = reactive<UnifiedProfileState>({
    isLoading: false,
    lastSync: null,
    syncStatus: 'idle',
    contextData: {
      jobs: {},
      ai: {},
      studios: {},
      portfolio: {},
      resume: {},
      settings: {}
    },
    autoSyncEnabled: true
  })

  // Core profile data with automatic validation
  const profile = computed(() => userProfile.profile.value)
  const personalInfo = computed(() => userProfile.personalInfo.value)
  const skills = computed(() => userProfile.skills.value)
  const experience = computed(() => userProfile.experience.value)
  const education = computed(() => userProfile.education.value)
  const gamingExperience = computed(() => userProfile.gamingExperience.value)
  const careerGoals = computed(() => userProfile.careerGoals.value)
  const portfolio = computed(() => userProfile.portfolio.value)

  // Profile completeness and validation
  const completeness = computed(() => userProfile.profileCompleteness.value)
  const isValid = computed(() => userProfile.isProfileValid.value)
  const errors = computed(() => userProfile.profileErrors.value)

  // Context-specific data extractors
  const getJobSearchProfile = computed(() => {
    if (!profile.value) return null
    return {
      personalInfo: personalInfo.value,
      skills: skills.value,
      experience: experience.value,
      careerGoals: careerGoals.value,
      location: personalInfo.value?.location,
      workPreferences: careerGoals.value?.workPreferences,
      salaryExpectations: careerGoals.value?.salaryExpectations,
      preferredRoles: careerGoals.value?.targetRoles || [],
      preferredIndustries: careerGoals.value?.targetIndustries || [],
      searchRadius: careerGoals.value?.locationPreferences?.searchRadius || 50,
      remotePreference: careerGoals.value?.workPreferences?.remote || false
    }
  })

  const getAITrainingProfile = computed(() => {
    if (!profile.value) return null
    return {
      technicalSkills: skills.value?.technical || [],
      softSkills: skills.value?.soft || [],
      gamingSkills: skills.value?.gaming || [],
      languages: skills.value?.languages || [],
      tools: skills.value?.tools || [],
      frameworks: skills.value?.frameworks || [],
      experience: experience.value || [],
      education: education.value || [],
      gamingBackground: gamingExperience.value,
      careerGoals: careerGoals.value,
      communicationStyle: personalInfo.value?.communicationPreferences || 'professional',
      learningPreferences: careerGoals.value?.learningPreferences || []
    }
  })

  const getStudioMatchingProfile = computed(() => {
    if (!profile.value) return null
    return {
      personalInfo: personalInfo.value,
      skills: skills.value,
      experience: experience.value,
      gamingExperience: gamingExperience.value,
      careerGoals: careerGoals.value,
      studioPreferences: {
        size: careerGoals.value?.companyPreferences?.size || 'any',
        culture: careerGoals.value?.companyPreferences?.culture || [],
        projects: careerGoals.value?.projectPreferences || [],
        technologies: skills.value?.frameworks || [],
        workEnvironment: careerGoals.value?.workPreferences || {}
      },
      portfolioItems: portfolio.value || [],
      achievements: gamingExperience.value?.achievements || []
    }
  })

  const getPortfolioProfile = computed(() => {
    if (!profile.value) return null
    return {
      personalInfo: personalInfo.value,
      experience: experience.value,
      education: education.value,
      skills: skills.value,
      portfolioItems: portfolio.value || [],
      achievements: [
        ...(experience.value?.flatMap(exp => exp.achievements) || []),
        ...(gamingExperience.value?.achievements || [])
      ],
      projects: portfolio.value?.filter(item => item.type === 'project') || [],
      certifications: profile.value.certifications || [],
      testimonials: profile.value.testimonials || []
    }
  })

  const getResumeProfile = computed(() => {
    if (!profile.value) return null
    return {
      personalInfo: personalInfo.value,
      experience: experience.value,
      education: education.value,
      skills: skills.value,
      certifications: profile.value.certifications || [],
      achievements: profile.value.achievements || [],
      languages: skills.value?.languages || [],
      templatePreferences: profile.value.meta?.resumePreferences || {}
    }
  })

  const getSettingsProfile = computed(() => {
    if (!profile.value) return null
    return {
      personalInfo: personalInfo.value,
      preferences: profile.value.meta?.preferences || {},
      privacySettings: profile.value.meta?.privacySettings || {},
      notifications: profile.value.meta?.notifications || {},
      integrations: profile.value.meta?.integrations || {},
      dataConsent: profile.value.meta?.dataConsent || false
    }
  })

  // Unified update methods with cross-system sync
  const updateProfileSection = async (section: string, data: any, options = {}) => {
    const { syncAcross = true, validateFirst = true } = options
    
    try {
      state.isLoading = true
      state.syncStatus = 'syncing'

      // Validate if requested
      if (validateFirst) {
        const validation = userProfileService.validateProfile({ ...profile.value, [section]: data })
        if (!validation.isValid) {
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
        }
      }

      // Update the specific section
      const result = await userProfile.updateProfileSection(section, data)
      
      if (!result.success) {
        throw new Error(result.error || 'Update failed')
      }

      // Sync across systems if enabled
      if (syncAcross && state.autoSyncEnabled) {
        await syncProfileAcrossSystems(section, data)
      }

      state.syncStatus = 'success'
      state.lastSync = new Date()
      
      logger.info(`Profile section '${section}' updated successfully`)
      return { success: true }

    } catch (error) {
      state.syncStatus = 'error'
      logger.error(`Failed to update profile section '${section}':`, error)
      return { success: false, error: error.message }
    } finally {
      state.isLoading = false
    }
  }

  // Cross-system sync function
  const syncProfileAcrossSystems = async (section: string, data: any) => {
    try {
      // Determine which systems need updates based on the section changed
      const systemsToUpdate = getSyncTargets(section)
      
      for (const system of systemsToUpdate) {
        await updateSystemSpecificData(system, section, data)
      }

      // Emit custom events for reactive systems
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('profile-updated', {
          detail: { section, data, systems: systemsToUpdate }
        }))
      }

      // Update context data
      updateContextData(section, data)
      
    } catch (error) {
      logger.warn('Some cross-system syncs failed:', error)
    }
  }

  // Determine which systems need updates based on changed section
  const getSyncTargets = (section: string): string[] => {
    const sectionSyncMap: Record<string, string[]> = {
      personalInfo: ['jobs', 'ai', 'studios', 'portfolio', 'resume', 'settings'],
      skills: ['jobs', 'ai', 'studios', 'portfolio', 'resume'],
      experience: ['jobs', 'ai', 'studios', 'portfolio', 'resume'],
      education: ['jobs', 'ai', 'studios', 'portfolio', 'resume'],
      gamingExperience: ['ai', 'studios', 'portfolio'],
      careerGoals: ['jobs', 'ai', 'studios'],
      portfolio: ['studios', 'portfolio', 'resume'],
      preferences: ['settings', 'ai'],
      privacy: ['settings', 'ai', 'jobs']
    }

    return sectionSyncMap[section] || []
  }

  // Update system-specific cached data
  const updateSystemSpecificData = async (system: string, section: string, data: any) => {
    switch (system) {
      case 'jobs':
        state.contextData.jobs = {
          ...state.contextData.jobs,
          lastProfileUpdate: new Date(),
          matchingCacheInvalidated: true
        }
        break
        
      case 'ai':
        state.contextData.ai = {
          ...state.contextData.ai,
          trainingDataUpdated: true,
          lastSync: new Date(),
          needsRetraining: ['skills', 'experience', 'careerGoals'].includes(section)
        }
        break
        
      case 'studios':
        state.contextData.studios = {
          ...state.contextData.studios,
          matchingProfileUpdated: true,
          lastSync: new Date()
        }
        break
        
      case 'portfolio':
        state.contextData.portfolio = {
          ...state.contextData.portfolio,
          regenerateRequired: true,
          lastSync: new Date()
        }
        break
        
      case 'resume':
        state.contextData.resume = {
          ...state.contextData.resume,
          templatesNeedUpdate: true,
          lastSync: new Date()
        }
        break
        
      case 'settings':
        state.contextData.settings = {
          ...state.contextData.settings,
          preferencesUpdated: true,
          lastSync: new Date()
        }
        break
    }
  }

  const updateContextData = (section: string, data: any) => {
    // This function can be used to store system-specific computed data
    // that doesn't need to trigger full re-sync but helps with performance
  }

  // Batch update functionality
  const batchUpdateProfile = async (updates: Record<string, any>, options = {}) => {
    const { validateAll = true, syncAfterAll = true } = options
    const results: Record<string, any> = {}
    
    try {
      state.isLoading = true
      state.syncStatus = 'syncing'

      // Disable auto-sync temporarily for batch updates
      const originalAutoSync = state.autoSyncEnabled
      state.autoSyncEnabled = false

      // Process all updates
      for (const [section, data] of Object.entries(updates)) {
        const result = await updateProfileSection(section, data, { 
          syncAcross: false, 
          validateFirst: validateAll 
        })
        results[section] = result
      }

      // Re-enable auto-sync and perform one comprehensive sync
      state.autoSyncEnabled = originalAutoSync
      
      if (syncAfterAll && state.autoSyncEnabled) {
        for (const section of Object.keys(updates)) {
          await syncProfileAcrossSystems(section, updates[section])
        }
      }

      state.syncStatus = 'success'
      state.lastSync = new Date()
      
      return { success: true, results }
      
    } catch (error) {
      state.syncStatus = 'error'
      return { success: false, error: error.message, results }
    } finally {
      state.isLoading = false
    }
  }

  // Export profile for specific contexts
  const getContextualProfile = (context: keyof ProfileContext, subContext?: string) => {
    const contextData = {
      jobs: getJobSearchProfile.value,
      ai: getAITrainingProfile.value,
      studios: getStudioMatchingProfile.value,
      portfolio: getPortfolioProfile.value,
      resume: getResumeProfile.value,
      settings: getSettingsProfile.value
    }

    const data = contextData[context]
    
    // Apply sub-context filtering if specified
    if (subContext && data) {
      return userProfileService.extractForContext(data, `${context}-${subContext}`)
    }
    
    return data
  }

  // Import profile with intelligent merging
  const importProfile = async (source: 'linkedin' | 'github' | 'resume' | 'json', data: any, options = {}) => {
    const { mergeStrategy = 'smart', backupFirst = true } = options
    
    try {
      state.isLoading = true
      
      // Create backup if requested
      let backup = null
      if (backupFirst && profile.value) {
        backup = JSON.parse(JSON.stringify(profile.value))
      }

      const importResult = await userProfile.importProfile(source, data)
      
      if (!importResult.success) {
        throw new Error(importResult.error)
      }

      // Trigger cross-system sync
      if (state.autoSyncEnabled) {
        await syncProfileAcrossSystems('all', importResult.data)
      }

      return { 
        success: true, 
        backup,
        imported: importResult.data,
        message: `Profile imported from ${source}` 
      }
      
    } catch (error) {
      logger.error(`Profile import from ${source} failed:`, error)
      return { success: false, error: error.message }
    } finally {
      state.isLoading = false
    }
  }

  // Auto-sync watcher
  watch(
    () => profile.value,
    async (newProfile, oldProfile) => {
      if (state.autoSyncEnabled && newProfile && oldProfile) {
        // Detect which sections changed
        const changedSections = detectProfileChanges(oldProfile, newProfile)
        
        for (const section of changedSections) {
          await syncProfileAcrossSystems(section, newProfile[section])
        }
      }
    },
    { deep: true }
  )

  const detectProfileChanges = (oldProfile: any, newProfile: any): string[] => {
    if (!oldProfile || !newProfile) return []
    
    const sections = ['personalInfo', 'skills', 'experience', 'education', 'gamingExperience', 'careerGoals', 'portfolio']
    const changed: string[] = []
    
    for (const section of sections) {
      if (JSON.stringify(oldProfile[section]) !== JSON.stringify(newProfile[section])) {
        changed.push(section)
      }
    }
    
    return changed
  }

  // Manual sync trigger
  const forceSync = async () => {
    if (!profile.value) return { success: false, error: 'No profile data' }
    
    try {
      state.syncStatus = 'syncing'
      
      // Sync all sections
      const sections = ['personalInfo', 'skills', 'experience', 'education', 'gamingExperience', 'careerGoals', 'portfolio']
      
      for (const section of sections) {
        if (profile.value[section]) {
          await syncProfileAcrossSystems(section, profile.value[section])
        }
      }
      
      state.syncStatus = 'success'
      state.lastSync = new Date()
      
      return { success: true }
      
    } catch (error) {
      state.syncStatus = 'error'
      return { success: false, error: error.message }
    }
  }

  return {
    // State
    state,
    isLoading: computed(() => state.isLoading),
    syncStatus: computed(() => state.syncStatus),
    lastSync: computed(() => state.lastSync),
    
    // Core profile data
    profile,
    personalInfo,
    skills,
    experience,
    education,
    gamingExperience,
    careerGoals,
    portfolio,
    
    // Validation
    completeness,
    isValid,
    errors,
    
    // Context-specific profiles
    jobSearchProfile: getJobSearchProfile,
    aiTrainingProfile: getAITrainingProfile,
    studioMatchingProfile: getStudioMatchingProfile,
    portfolioProfile: getPortfolioProfile,
    resumeProfile: getResumeProfile,
    settingsProfile: getSettingsProfile,
    
    // Update methods
    updateProfileSection,
    batchUpdateProfile,
    
    // Context methods
    getContextualProfile,
    
    // Import/Export
    importProfile,
    exportProfile: userProfile.exportProfile,
    
    // Sync methods
    forceSync,
    enableAutoSync: () => { state.autoSyncEnabled = true },
    disableAutoSync: () => { state.autoSyncEnabled = false }
  }
}

export default useUnifiedProfile