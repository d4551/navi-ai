// User Repository - Database operations for user profile and preferences
// Centralized user data persistence and settings management

import { unifiedStorage } from '@/utils/storage'

export interface UserProfile {
  id: string
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    location?: {
      city: string
      state?: string
      country: string
      timezone?: string
    }
    avatar?: string
  }
  careerInfo: {
    currentTitle?: string
    experienceLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
    specializations: string[]
    industries: string[]
    salaryExpectation?: {
      min: number
      max: number
      currency: string
    }
    workPreferences: {
      remote: boolean
      hybrid: boolean
      onsite: boolean
      relocation: boolean
      travelWillingness?: number // 0-100%
    }
  }
  skills: {
    technical: Array<{
      name: string
      level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
      yearsOfExperience?: number
    }>
    soft: string[]
    languages: Array<{
      language: string
      proficiency: 'basic' | 'conversational' | 'fluent' | 'native'
    }>
  }
  preferences: {
    jobAlerts: {
      enabled: boolean
      frequency: 'daily' | 'weekly' | 'monthly'
      criteria: {
        keywords: string[]
        locations: string[]
        remote: boolean
        salaryMin?: number
      }
    }
    privacy: {
      profileVisibility: 'public' | 'private' | 'recruiters-only'
      showSalaryExpectation: boolean
      showContactInfo: boolean
    }
    notifications: {
      email: boolean
      push: boolean
      jobMatches: boolean
      applicationUpdates: boolean
      marketingEmails: boolean
    }
  }
  integrations: {
    linkedin?: {
      connected: boolean
      profileUrl?: string
      lastSync?: Date
    }
    github?: {
      connected: boolean
      username?: string
      lastSync?: Date
    }
    portfolio?: {
      connected: boolean
      url?: string
      lastSync?: Date
    }
  }
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
  currency: string
  dashboard: {
    layout: 'compact' | 'comfortable'
    showWelcomeMessage: boolean
    defaultView: 'jobs' | 'applications' | 'profile'
    quickActions: string[]
  }
  search: {
    saveHistory: boolean
    defaultFilters: Record<string, any>
    resultsPerPage: number
  }
  ai: {
    enableSuggestions: boolean
    autoImproveProfile: boolean
    preferredProvider: 'gemini' | 'openai' | 'auto'
  }
}

export class UserRepository {
  private static readonly PROFILE_KEY = 'userProfile'
  private static readonly SETTINGS_KEY = 'userSettings'
  private static readonly ACTIVITY_KEY = 'userActivity'

  static async getProfile(): Promise<UserProfile | null> {
    const profile = await unifiedStorage.get(this.PROFILE_KEY)
    return profile || null
  }

  static async createProfile(
    profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<UserProfile> {
    // Generate ID using crypto or fallback
    const getCrypto = () => {
      if (typeof crypto !== 'undefined') {
        return crypto
      }
      if (typeof window !== 'undefined' && window.crypto) {
        return window.crypto
      }
      // Fallback for environments without crypto
      return {
        randomUUID: () =>
          'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = (Math.random() * 16) | 0
            const v = c === 'x' ? r : (r & 0x3) | 0x8
            return v.toString(16)
          }),
      }
    }

    const profile: UserProfile = {
      ...profileData,
      id: getCrypto().randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await unifiedStorage.set(this.PROFILE_KEY, profile)
    return profile
  }

  static async updateProfile(
    updates: Partial<UserProfile>
  ): Promise<UserProfile | null> {
    const current = await this.getProfile()
    if (!current) return null

    const updated: UserProfile = {
      ...current,
      ...updates,
      updatedAt: new Date(),
    }

    await unifiedStorage.set(this.PROFILE_KEY, updated)
    return updated
  }

  static async deleteProfile(): Promise<boolean> {
    await unifiedStorage.remove(this.PROFILE_KEY)
    await unifiedStorage.remove(this.SETTINGS_KEY)
    await unifiedStorage.remove(this.ACTIVITY_KEY)
    return true
  }

  // Settings management
  static async getSettings(): Promise<UserSettings> {
    const settings = await unifiedStorage.get(this.SETTINGS_KEY)
    return settings || this.getDefaultSettings()
  }

  static async updateSettings(
    updates: Partial<UserSettings>
  ): Promise<UserSettings> {
    const current = await this.getSettings()
    const updated = { ...current, ...updates }

    await unifiedStorage.set(this.SETTINGS_KEY, updated)
    return updated
  }

  private static getDefaultSettings(): UserSettings {
    return {
      theme: 'auto',
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
      dashboard: {
        layout: 'comfortable',
        showWelcomeMessage: true,
        defaultView: 'jobs',
        quickActions: ['search', 'applications', 'profile', 'resume'],
      },
      search: {
        saveHistory: true,
        defaultFilters: {},
        resultsPerPage: 25,
      },
      ai: {
        enableSuggestions: true,
        autoImproveProfile: false,
        preferredProvider: 'auto',
      },
    }
  }

  // Activity tracking
  static async recordActivity(activity: {
    type: string
    details: Record<string, any>
    timestamp?: Date
  }): Promise<void> {
    const activities = await this.getActivity()

    // Generate ID using crypto or fallback
    const getCrypto = () => {
      if (typeof crypto !== 'undefined') {
        return crypto
      }
      if (typeof window !== 'undefined' && window.crypto) {
        return window.crypto
      }
      // Fallback for environments without crypto
      return {
        randomUUID: () =>
          'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = (Math.random() * 16) | 0
            const v = c === 'x' ? r : (r & 0x3) | 0x8
            return v.toString(16)
          }),
      }
    }

    activities.push({
      ...activity,
      id: getCrypto().randomUUID(),
      timestamp: activity.timestamp || new Date(),
    })

    // Keep only last 1000 activities
    const recentActivities = activities.slice(-1000)
    await unifiedStorage.set(this.ACTIVITY_KEY, recentActivities)
  }

  static async getActivity(limit?: number): Promise<
    Array<{
      id: string
      type: string
      details: Record<string, any>
      timestamp: Date
    }>
  > {
    const activities = await unifiedStorage.get(this.ACTIVITY_KEY)
    const allActivities = Array.isArray(activities) ? activities : []

    if (limit) {
      return allActivities.slice(-limit)
    }

    return allActivities
  }

  static async clearActivity(): Promise<void> {
    await unifiedStorage.remove(this.ACTIVITY_KEY)
  }

  // Integration management
  static async connectIntegration(
    integration: 'linkedin' | 'github' | 'portfolio',
    data: Record<string, any>
  ): Promise<UserProfile | null> {
    const profile = await this.getProfile()
    if (!profile) return null

    const integrations = {
      ...profile.integrations,
      [integration]: {
        ...profile.integrations[integration],
        ...data,
        connected: true,
        lastSync: new Date(),
      },
    }

    return this.updateProfile({ integrations })
  }

  static async disconnectIntegration(
    integration: 'linkedin' | 'github' | 'portfolio'
  ): Promise<UserProfile | null> {
    const profile = await this.getProfile()
    if (!profile) return null

    const integrations = {
      ...profile.integrations,
      [integration]: {
        ...profile.integrations[integration],
        connected: false,
        lastSync: undefined,
      },
    }

    return this.updateProfile({ integrations })
  }

  // Quick access methods
  static async updateLastLogin(): Promise<void> {
    await this.updateProfile({ lastLoginAt: new Date() })
  }

  static async isFirstTimeUser(): Promise<boolean> {
    const profile = await this.getProfile()
    return !profile
  }

  static async getSkillsByCategory(): Promise<{
    technical: string[]
    soft: string[]
    languages: string[]
  }> {
    const profile = await this.getProfile()
    if (!profile) return { technical: [], soft: [], languages: [] }

    return {
      technical: profile.skills.technical.map(skill => skill.name),
      soft: profile.skills.soft,
      languages: profile.skills.languages.map(lang => lang.language),
    }
  }
}
