import { logger } from '@/shared/utils/logger'

export interface UserValidationResult {
  isValid: boolean
  errors: string[]
}

export interface ProfileExtractionResult {
  [key: string]: any
}

export class UserProfileService {
  private static instance: UserProfileService
  private profileCache = new Map<string, any>()

  static getInstance(): UserProfileService {
    if (!UserProfileService.instance) {
      UserProfileService.instance = new UserProfileService()
    }
    return UserProfileService.instance
  }

  calculateCompleteness(user: any): number {
    if (!user) return 0

    const requiredFields = [
      'personalInfo.name',
      'personalInfo.email',
      'experience',
      'education',
      'skills.technical',
    ]

    let requiredComplete = 0
    const totalRequired = requiredFields.length

    // Check required fields
    for (const field of requiredFields) {
      const value = this.getNestedValue(user, field)
      if (this.isFieldComplete(value)) {
        requiredComplete++
      }
    }

    if (!user.gamingExperience?.competitiveGaming?.length) {
      requiredComplete += 0.5 // Half credit for gaming experience
    }

    return Math.round((requiredComplete / totalRequired) * 100)
  }

  validateProfile(user: any): UserValidationResult {
    const errors: string[] = []

    if (!user) {
      errors.push('Profile data is required')
      return { isValid: false, errors }
    }

    if (!user.personalInfo?.name?.trim()) {
      errors.push('Name is required')
    }

    if (!user.personalInfo?.email?.trim()) {
      errors.push('Email is required')
    } else if (!this.isValidEmail(user.personalInfo.email)) {
      errors.push('Invalid email format')
    }

    if (!Array.isArray(user.experience) || user.experience.length === 0) {
      errors.push('At least one work experience entry is required')
    }

    if (!user.skills || typeof user.skills !== 'object') {
      errors.push('Skills data is required')
    } else if (
      !Array.isArray(user.skills.technical) ||
      user.skills.technical.length === 0
    ) {
      errors.push('At least one technical skill is required')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  mergeProfileData(
    user: any,
    newData: any,
    source: 'form' | 'ai' | 'import' = 'form'
  ): any {
    const merged = { ...user }

    if (newData.personalInfo) {
      merged.personalInfo = {
        ...merged.personalInfo,
        ...newData.personalInfo,
      }
    }

    if (Array.isArray(newData.experience)) {
      merged.experience = newData.experience
    }

    if (Array.isArray(newData.education)) {
      merged.education = newData.education
    }

    if (newData.skills && typeof newData.skills === 'object') {
      merged.skills = {
        technical: newData.skills.technical || merged.skills?.technical || [],
        soft: newData.skills.soft || merged.skills?.soft || [],
        languages: newData.skills.languages || merged.skills?.languages || [],
        tools: newData.skills.tools || merged.skills?.tools || [],
        frameworks:
          newData.skills.frameworks || merged.skills?.frameworks || [],
        gaming: newData.skills.gaming || merged.skills?.gaming || [],
      }
    }

    if (newData.gamingExperience) {
      merged.gamingExperience = newData.gamingExperience
    }

    if (newData.careerGoals) {
      merged.careerGoals = newData.careerGoals
    }

    if (Array.isArray(newData.portfolio)) {
      merged.portfolio = newData.portfolio
    }

    merged.meta = {
      ...merged.meta,
      lastUpdated: new Date().toISOString(),
      version: merged.meta?.version || '1.0',
    }

    return merged
  }

  initializeProfile(basicInfo: any = {}): any {
    const now = new Date().toISOString()

    return {
      name: basicInfo.name || '',
      email: basicInfo.email || '',
      personalInfo: {
        name: basicInfo.name || '',
        email: basicInfo.email || '',
        phone: '',
        location: '',
        website: '',
        linkedIn: '',
        github: '',
        portfolio: '',
        summary: '',
        profilePicture: null,
      },
      experience: [],
      education: [],
      certifications: [],
      achievements: [],
      skills: {
        technical: [],
        soft: [],
        languages: [],
        tools: [],
        frameworks: [],
        gaming: [],
      },
      gamingExperience: {
        competitiveGaming: [],
        teamLeadership: [],
        communityInvolvement: [],
        contentCreation: [],
        tournaments: [],
        achievements: [],
        preferredGames: [],
        platforms: [],
        guildsTeams: [],
      },
      careerGoals: {
        targetRoles: [],
        targetIndustries: [],
        targetCompanies: [],
        salaryExpectations: { min: null, max: null, currency: 'USD' },
        workPreferences: {
          remote: false,
          hybrid: false,
          onsite: false,
          relocationWillingness: false,
        },
        timeframe: '',
      },
      aiData: {
        skillMappings: [],
        resumeOptimizations: [],
        coverLetterDrafts: [],
        interviewPractice: [],
        careerInsights: [],
        marketAnalysis: {},
      },
      meta: {
        profileCompleteness: basicInfo.name && basicInfo.email ? 10 : 0,
        lastUpdated: now,
        createdAt: now,
        version: '1.0',
        dataConsent: false,
        privacySettings: {
          publicProfile: false,
          shareWithRecruiters: false,
          allowAnalytics: true,
        },
      },
      xp: 0,
      level: 1,
      totalTimeSpent: 0,
      interviewsCompleted: 0,
      resumesGenerated: 0,
    }
  }

  extractForContext(user: any, context: string): ProfileExtractionResult {
    const contextMap: Record<string, ProfileExtractionResult> = {
      resume: {
        personalInfo: user.personalInfo,
        experience: user.experience || [],
        education: user.education || [],
        skills: user.skills?.technical || [],
        certifications: user.certifications || [],
      },
      'cover-letter': {
        personalInfo: user.personalInfo,
        recentExperience: user.experience?.[0],
        careerGoals: user.careerGoals,
        gamingExperience: user.gamingExperience?.competitiveGaming || [],
      },
      'job-search': {
        skills: user.skills,
        location: user.personalInfo?.location,
        experience: user.experience,
        careerGoals: user.careerGoals,
      },
      'ai-training': {
        technicalSkills: user.skills?.technical || [],
        gamingSkills: user.skills?.gaming || [],
        professionalExperience: user.experience || [],
        careerGoals: user.careerGoals,
      },
    }

    return contextMap[context] || { user }
  }

  notifyProfileSync(profile: any, changes: any): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('profile-sync', {
          detail: { profile, changes },
        })
      )
    }
  }

  private getNestedValue(obj: any, path: string): any {
    try {
      return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : undefined
      }, obj)
    } catch {
      return undefined
    }
  }

  private isFieldComplete(value: any): boolean {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim().length > 0
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'object') return Object.keys(value).length > 0
    return true
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

// Export singleton instance
export const userProfileService = UserProfileService.getInstance()
