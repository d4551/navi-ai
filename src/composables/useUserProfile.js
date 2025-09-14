/**
 * User Profile Composable
 * Provides reactive access to user profile data throughout the application
 * with real-time synchronization and validation
 */

import { computed, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { userProfileService } from '@/services/UserProfileService'
import { logger } from '@/shared/utils/logger'

export function useUserProfile() {
  const store = useAppStore()

  // Pinia getters are exposed as properties on the store
  const profile = computed(() => store.getUserProfile)
  const personalInfo = computed(() => store.getPersonalInfo)
  const experience = computed(() => store.getProfessionalExperience)
  const education = computed(() => store.getEducation)
  const skills = computed(() => store.getSkills)
  const gamingExperience = computed(() => store.getGamingExperience)
  const careerGoals = computed(() => store.getCareerGoals)
  const portfolio = computed(() => store.getPortfolio)
  const aiData = computed(() => store.getAIData)

  // Profile metadata
  const profileCompleteness = computed(() => store.getProfileCompleteness)
  const profileMeta = computed(() => store.getProfileMeta)

  // Profile validation status
  const profileValidation = computed(() => {
    const currentProfile = profile.value
    if (!currentProfile) return { isValid: false, errors: [] }
    return userProfileService.validateProfile(currentProfile)
  })

  const isProfileValid = computed(() => profileValidation.value.isValid)
  const profileErrors = computed(() => profileValidation.value.errors)

  // Update methods
  const updatePersonalInfo = async (_data) => {
    try {
      const ok = store.updatePersonalInfo(data)
      if (!ok) throw new Error('Validation failed')
      logger.info('Personal info updated successfully')
      return { success: true }
    } catch (error) {
      logger.error('Failed to update personal info:', error)
      return { success: false, error: error.message }
    }
  }

  const updateExperience = async (experiences) => {
    try {
      const ok = store.updateProfessionalExperience(experiences)
      if (!ok) throw new Error('Validation failed')
      logger.info('Professional experience updated successfully')
      return { success: true }
    } catch (error) {
      logger.error('Failed to update experience:', error)
      return { success: false, error: error.message }
    }
  }

  const updateEducation = async (educationData) => {
    try {
      const ok = store.updateEducation(educationData)
      if (!ok) throw new Error('Validation failed')
      logger.info('Education updated successfully')
      return { success: true }
    } catch (error) {
      logger.error('Failed to update education:', error)
      return { success: false, error: error.message }
    }
  }

  const updateSkills = async (skillsData) => {
    try {
      const ok = store.updateSkills(skillsData)
      if (!ok) throw new Error('Validation failed')
      logger.info('Skills updated successfully')
      return { success: true }
    } catch (error) {
      logger.error('Failed to update skills:', error)
      return { success: false, error: error.message }
    }
  }

  const updateGamingExperience = async (gamingData) => {
    try {
      const ok = store.updateGamingExperience(gamingData)
      if (!ok) throw new Error('Validation failed')
      logger.info('Gaming experience updated successfully')
      return { success: true }
    } catch (error) {
      logger.error('Failed to update gaming experience:', error)
      return { success: false, error: error.message }
    }
  }

  const updateCareerGoals = async (goalsData) => {
    try {
      const ok = store.updateCareerGoals(goalsData)
      if (!ok) throw new Error('Validation failed')
      logger.info('Career goals updated successfully')
      return { success: true }
    } catch (error) {
      logger.error('Failed to update career goals:', error)
      return { success: false, error: error.message }
    }
  }

  const updatePortfolio = async (portfolioData) => {
    try {
      const ok = store.updatePortfolioItems(portfolioData)
      if (!ok) throw new Error('Validation failed')
      logger.info('Portfolio updated successfully')
      return { success: true }
    } catch (error) {
      logger.error('Failed to update portfolio:', error)
      return { success: false, error: error.message }
    }
  }

  // Profile import/export
  const importProfile = async (source, data) => {
    try {
      const result = await userProfileService.importFromSource(source, data)
      if (result.success) {
        // Merge imported data into current profile
        const ok = store.updateUser(result.data)
        if (!ok) throw new Error('Validation failed')
        return { success: true, message: `Profile imported from ${source}` }
      }
      return { success: false, error: result.error }
    } catch (error) {
      logger.error('Failed to import profile:', error)
      return { success: false, error: error.message }
    }
  }

  const exportProfile = async (format) => {
    try {
      const currentProfile = profile.value
      if (!currentProfile) {
        return { success: false, error: 'No profile data to export' }
      }
      
      const result = await userProfileService.exportProfile(currentProfile, format)
      return result
    } catch (error) {
      logger.error('Failed to export profile:', error)
      return { success: false, error: error.message }
    }
  }

  // Profile synchronization
  const syncProfile = async () => {
    try {
      // Best-effort: persist latest state and reload preferences
      await store.saveToStorage?.()
      return { success: true }
    } catch (error) {
      logger.error('Failed to sync profile:', error)
      return { success: false, error: error.message }
    }
  }

  // Profile context extraction for specific use cases
  const getProfileForContext = (context) => {
    const currentProfile = profile.value
    if (!currentProfile) return null
    return userProfileService.extractForContext(currentProfile, context)
  }

  // Batch updates with validation
  const updateProfileSection = async (section, data) => {
    const updateMethods = {
      personalInfo: updatePersonalInfo,
      experience: updateExperience,
      education: updateEducation,
      skills: updateSkills,
      gamingExperience: updateGamingExperience,
      careerGoals: updateCareerGoals,
      portfolio: updatePortfolio
    }

    const updateMethod = updateMethods[section]
    if (!updateMethod) {
      return { success: false, error: `Unknown profile section: ${section}` }
    }

    return await updateMethod(data)
  }

  // Profile completeness calculation
  const calculateCompleteness = () => {
    const currentProfile = profile.value
    if (!currentProfile) return 0
    return userProfileService.calculateCompleteness(currentProfile)
  }

  // Watch for profile changes and auto-calculate completeness
  watch(
    profile,
    (newProfile) => {
      if (newProfile) {
        const completeness = userProfileService.calculateCompleteness(newProfile)
        if (completeness !== newProfile.meta?.profileCompleteness) {
          try {
            // Pinia: mutate state directly or via an action
            store.user.meta.profileCompleteness = completeness
          } catch (e) {
            logger.warn('Failed to update profile completeness in store', e)
          }
        }
      }
    },
    { deep: true }
  )

  return {
    // Reactive data
    profile,
    personalInfo,
    experience,
    education,
    skills,
    gamingExperience,
    careerGoals,
    portfolio,
    aiData,
    profileCompleteness,
    profileMeta,
    
    // Validation
    profileValidation,
    isProfileValid,
    profileErrors,
    
    // Update methods
    updatePersonalInfo,
    updateExperience,
    updateEducation,
    updateSkills,
    updateGamingExperience,
    updateCareerGoals,
    updatePortfolio,
    updateProfileSection,
    
    // Import/Export
    importProfile,
    exportProfile,
    
    // Sync and utilities
    syncProfile,
    getProfileForContext,
    calculateCompleteness
  }
}

export default useUserProfile
