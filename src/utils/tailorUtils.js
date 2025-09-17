/**
 * Shared utility functions for resume tailoring functionality
 * Consolidates duplicate logic between ResumeBuilder and JobSearch components
 */

import { useAppStore } from '@/stores/app'

export function useTailorActions() {
  const store = useAppStore()

  /**
   * Apply tailored summary to resume data
   * @param {string} summary - The tailored summary text
   */
  const applyTailoredSummary = summary => {
    if (!summary?.trim()) {
      return false
    }
    store.resumeData.personalInfo.summary = summary.trim()
    return true
  }

  /**
   * Apply selected bullet points to resume experience
   * @param {Array} selectedBullets - Array of selected bullet point texts
   * @param {number} experienceIndex - Index of experience to update (optional, defaults to first)
   */
  const applySelectedBullets = (selectedBullets, experienceIndex = 0) => {
    if (!selectedBullets?.length) {
      return false
    }

    const experiences = store.resumeData.experience
    if (experiences[experienceIndex]) {
      const currentBullets =
        experiences[experienceIndex].description.split('\n')
      const newBullets = [...currentBullets, ...selectedBullets]
      experiences[experienceIndex].description = newBullets.join('\n')
      return true
    }
    return false
  }

  /**
   * Insert keywords into skills section
   * @param {Array} keywords - Array of keyword strings to add
   * @param {string} skillType - Type of skill: 'technical' or 'soft'
   */
  const insertKeywordsToSkills = (keywords, skillType = 'technical') => {
    if (!keywords?.length) {
      return false
    }

    if (!store.resumeData) {
      store.resumeData = {
        personalInfo: {},
        experience: [],
        education: [],
        skills: { technical: [], soft: [] },
        achievements: [],
        portfolio: [],
      }
    }
    if (!store.resumeData.skills) {
      store.resumeData.skills = { technical: [], soft: [] }
    }
    const skillsSection = store.resumeData.skills[skillType] || []
    const existingSkills = new Set(
      skillsSection.map(skill => skill.toLowerCase())
    )

    const newSkills = keywords
      .filter(
        keyword =>
          keyword?.trim() && !existingSkills.has(keyword.trim().toLowerCase())
      )
      .map(keyword => keyword.trim())

    if (newSkills.length > 0) {
      store.resumeData.skills[skillType] = [...skillsSection, ...newSkills]
      return true
    }
    return false
  }

  /**
   * Validate tailor modal data
   * @param {Object} tailorData - The tailor data object
   * @returns {boolean} Whether the data is valid
   */
  const validateTailorData = tailorData => {
    return (
      tailorData &&
      (tailorData.revisedSummary?.trim() ||
        tailorData.bulletSuggestions?.length > 0 ||
        tailorData.keywords?.length > 0)
    )
  }

  return {
    applyTailoredSummary,
    applySelectedBullets,
    insertKeywordsToSkills,
    validateTailorData,
  }
}
