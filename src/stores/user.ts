import { defineStore } from 'pinia'
import { logger } from '@/shared/utils/logger'
import { validateEmail, validateRequired } from '@/utils/validation'
import { userProfileService } from '@/services/UserProfileService'

// Import types from main store for now, will move later
import type {
  PersonalInfo,
  Experience,
  Education,
  Achievement,
  Certification,
  Skills,
  GamingExperience,
  CareerGoals,
  AIData,
  ProfileMeta,
  User,
} from './app'

export interface UserState {
  user: User
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: {
      // Legacy fields for compatibility
      name: '',
      email: '',
      portfolio: [],

      // New comprehensive profile structure
      personalInfo: {
        name: '',
        email: '',
        phone: '',
        location: '',
        website: '',
        linkedIn: '',
        github: '',
        portfolio: '',
        summary: '',
        profilePicture: null,
        currentRole: '',
        currentCompany: '',
        yearsExperience: null,
      },

      experience: [],
      education: [],
      certifications: [],

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
        salaryExpectations: {
          min: null,
          max: null,
          currency: 'USD',
        },
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
        profileCompleteness: 0,
        lastUpdated: null,
        createdAt: null,
        version: '1.0',
        dataConsent: false,
        privacySettings: {
          publicProfile: false,
          shareWithRecruiters: false,
          allowAnalytics: true,
        },
      },

      // Gamification data
      xp: 0,
      previousXP: 0,
      achievements: [],
      dailyChallenges: {},
      weeklyQuests: {},
      longestStreak: 0,
      resumesGenerated: 0,
      level: 1,

      // Enhanced gamification tracking
      interviewsCompleted: 0,
      skillAssessmentsCompleted: 0,
      totalTimeSpent: 0,
      featureUsage: {},
    },
  }),

  getters: {
    hasValidEmail: (state): boolean => {
      const email = state.user.personalInfo?.email || state.user.email
      return validateEmail(email)
    },

    profileCompleteness: (state): number => {
      const completeness = userProfileService.calculateCompleteness(state.user)
      if (state.user.meta.profileCompleteness !== completeness) {
        state.user.meta.profileCompleteness = completeness
      }
      return completeness
    },

    userProfile: (state): User => state.user,

    personalInfo: (state): PersonalInfo => {
      return (
        state.user.personalInfo || {
          name: state.user.name || '',
          email: state.user.email || '',
          phone: '',
          location: '',
          website: '',
          linkedIn: '',
          github: '',
          portfolio: '',
          summary: '',
          profilePicture: null,
          currentRole: '',
          currentCompany: '',
          yearsExperience: null,
        }
      )
    },

    allSkills: (state): Skills => state.user.skills,
    gamingBackground: (state): GamingExperience => state.user.gamingExperience,
    careerObjectives: (state): CareerGoals => state.user.careerGoals,
    aiEnhancements: (state): AIData => state.user.aiData,
    profileMetadata: (state): ProfileMeta => state.user.meta,

    // Gamification getters
    userLevel: (state): number => {
      const xp = state.user.xp || 0
      return Math.floor(xp / 100) + 1
    },

    xpForNextLevel: (state): number => {
      const currentLevel = Math.floor((state.user.xp || 0) / 100) + 1
      return currentLevel * 100 - (state.user.xp || 0)
    },

    earnedAchievements: (state): number =>
      (state.user.achievements || []).length,

    currentStreak: (state): number => {
      const dailyChallenges = state.user.dailyChallenges || {}
      let streak = 0
      const currentDate = new Date()

      while (true) {
        const dateString = currentDate.toDateString()
        const challengesForDay = dailyChallenges[dateString] || []

        if (challengesForDay.length === 0) {
          break
        }

        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      }

      return streak
    },

    // Interview statistics getter
    getInterviewStats: state => ({
      totalInterviews: state.user.interviewsCompleted || 0,
      totalSessions: state.user.interviewsCompleted || 0,
      completedInterviews: state.user.interviewsCompleted || 0,
      averageScore: 8.5,
      totalTimeSpent: state.user.totalTimeSpent || 0,
      mockInterviewUsage: state.user.featureUsage?.mockInterview || 0,
    }),
  },

  actions: {
    // Enhanced update user with validation and comprehensive profile management
    updateUser(userData: Partial<User>): boolean {
      try {
        // Handle both legacy and new profile structure
        const isLegacyUpdate =
          userData.name !== undefined || userData.email !== undefined

        if (isLegacyUpdate) {
          return this.updateLegacyUser(userData)
        }

        // Use profile service for comprehensive updates
        const updatedProfile = userProfileService.mergeProfileData(
          this.user,
          userData,
          'form'
        )

        // Validate the merged profile
        const validation = userProfileService.validateProfile(updatedProfile)
        if (!validation.isValid) {
          logger.error('User profile validation failed:', validation.errors)
          return false
        }

        this.user = updatedProfile
        userProfileService.notifyProfileSync(this.user, userData)

        logger.info('User profile updated successfully')
        return true
      } catch (error: any) {
        logger.error('Failed to update user:', error)
        return false
      }
    },

    // Legacy user update for backward compatibility
    updateLegacyUser(userData: Partial<User>): boolean {
      try {
        if (userData.email && !validateEmail(userData.email)) {
          logger.error('Invalid email address')
          return false
        }

        if (userData.name !== undefined && !validateRequired(userData.name)) {
          logger.error('Name is required')
          return false
        }

        if (userData.name !== undefined) {
          this.user.name = userData.name
          this.user.personalInfo.name = userData.name
        }
        if (userData.email !== undefined) {
          this.user.email = userData.email
          this.user.personalInfo.email = userData.email
        }

        if (userData.gamingExperience !== undefined) {
          this.user.gamingExperience = userData.gamingExperience as any
        }
        if (userData.skills !== undefined) {
          this.user.skills = userData.skills as any
        }
        if (userData.portfolio !== undefined) {
          this.user.portfolio = userData.portfolio
        }

        this.user.meta.lastUpdated = new Date().toISOString()
        return true
      } catch (error: any) {
        logger.error('Failed to update legacy user:', error)
        return false
      }
    },

    // New comprehensive profile update methods
    updatePersonalInfo(personalInfo: PersonalInfo): boolean {
      const userData = { personalInfo }
      return this.updateUser(userData)
    },

    updateProfessionalExperience(experience: Experience[]): boolean {
      const userData = { experience }
      return this.updateUser(userData)
    },

    updateEducation(education: Education[]): boolean {
      const userData = { education }
      return this.updateUser(userData)
    },

    updateSkills(skills: Skills): boolean {
      const userData = { skills }
      return this.updateUser(userData)
    },

    updateGamingExperience(gamingExperience: GamingExperience): boolean {
      const userData = { gamingExperience }
      return this.updateUser(userData)
    },

    updateCareerGoals(careerGoals: CareerGoals): boolean {
      const userData = { careerGoals }
      return this.updateUser(userData)
    },

    updatePortfolioItems(portfolio: any[]): boolean {
      const userData = { portfolio }
      return this.updateUser(userData)
    },

    updateAIData(aiData: AIData): boolean {
      const userData = { aiData }
      return this.updateUser(userData)
    },

    // Initialize complete profile for new users
    initializeUserProfile(basicInfo: any = {}): boolean {
      try {
        const newProfile = userProfileService.initializeProfile(basicInfo)
        this.user = newProfile
        logger.info('User profile initialized')
        return true
      } catch (error: any) {
        logger.error('Failed to initialize user profile:', error)
        return false
      }
    },
  },
})
