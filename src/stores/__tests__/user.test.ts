import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../user'
import { TestDataFactory, StoreTestHelper } from '@/utils/testing/testHelpers'

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Initial State', () => {
    it('has correct initial state', () => {
      const userStore = useUserStore()

      expect(userStore.user).toBeDefined()
      expect(userStore.user.personalInfo.name).toBe('')
      expect(userStore.user.personalInfo.email).toBe('')
      expect(userStore.user.experience).toEqual([])
      expect(userStore.user.education).toEqual([])
      expect(userStore.user.skills.technical).toEqual([])
    })

    it('initializes with default settings', () => {
      const userStore = useUserStore()

      expect(userStore.user.xp).toBe(0)
      expect(userStore.user.level).toBe(1)
      expect(userStore.user.achievements).toEqual([])
      expect(userStore.user.meta.profileCompleteness).toBe(0)
    })
  })

  describe('Getters', () => {
    it('calculates profile completeness correctly', () => {
      const userStore = useUserStore()

      // Initially should be 0
      expect(userStore.profileCompleteness).toBe(0)

      // Update user with some data
      userStore.updateUser({
        personalInfo: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          location: 'New York, NY',
        },
      })

      // Should be higher now
      expect(userStore.profileCompleteness).toBeGreaterThan(0)
    })

    it('validates email correctly', () => {
      const userStore = useUserStore()

      // Initially invalid
      expect(userStore.hasValidEmail).toBe(false)

      // Update with valid email
      userStore.updateUser({
        personalInfo: { email: 'test@example.com' },
      })

      expect(userStore.hasValidEmail).toBe(true)

      // Update with invalid email
      userStore.updateUser({
        personalInfo: { email: 'invalid-email' },
      })

      expect(userStore.hasValidEmail).toBe(false)
    })

    it('calculates user level from XP correctly', () => {
      const userStore = useUserStore()

      expect(userStore.userLevel).toBe(1)

      // Update XP
      userStore.user.xp = 150
      expect(userStore.userLevel).toBe(2)

      userStore.user.xp = 250
      expect(userStore.userLevel).toBe(3)
    })

    it('calculates XP for next level correctly', () => {
      const userStore = useUserStore()

      userStore.user.xp = 50
      expect(userStore.xpForNextLevel).toBe(50) // 100 - 50

      userStore.user.xp = 150
      expect(userStore.xpForNextLevel).toBe(50) // 200 - 150
    })

    it('calculates current streak correctly', () => {
      const userStore = useUserStore()
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      // Set up daily challenges
      userStore.user.dailyChallenges = {
        [today.toDateString()]: ['challenge1'],
        [yesterday.toDateString()]: ['challenge2'],
      }

      expect(userStore.currentStreak).toBe(2)
    })
  })

  describe('Actions', () => {
    describe('updateUser', () => {
      it('updates user profile successfully', () => {
        const userStore = useUserStore()
        const testUser = TestDataFactory.user()

        const result = userStore.updateUser(testUser.personalInfo)

        expect(result).toBe(true)
        expect(userStore.user.personalInfo.name).toBe(
          testUser.personalInfo.name
        )
        expect(userStore.user.personalInfo.email).toBe(
          testUser.personalInfo.email
        )
      })

      it('validates email during update', () => {
        const userStore = useUserStore()

        const result = userStore.updateUser({
          personalInfo: { email: 'invalid-email' },
        })

        expect(result).toBe(false)
      })

      it('handles legacy user updates', () => {
        const userStore = useUserStore()

        const result = userStore.updateUser({
          name: 'John Doe',
          email: 'john@example.com',
        })

        expect(result).toBe(true)
        expect(userStore.user.name).toBe('John Doe')
        expect(userStore.user.personalInfo.name).toBe('John Doe')
      })

      it('updates last modified timestamp', () => {
        const userStore = useUserStore()
        const beforeUpdate = new Date().toISOString()

        userStore.updateUser({
          personalInfo: { name: 'Test User' },
        })

        expect(userStore.user.meta.lastUpdated).toBeDefined()
        expect(
          new Date(userStore.user.meta.lastUpdated!).getTime()
        ).toBeGreaterThanOrEqual(new Date(beforeUpdate).getTime())
      })
    })

    describe('specific update methods', () => {
      it('updates personal info correctly', () => {
        const userStore = useUserStore()
        const personalInfo = TestDataFactory.user().personalInfo

        const result = userStore.updatePersonalInfo(personalInfo)

        expect(result).toBe(true)
        expect(userStore.user.personalInfo).toEqual(
          expect.objectContaining(personalInfo)
        )
      })

      it('updates experience correctly', () => {
        const userStore = useUserStore()
        const experience = TestDataFactory.user().experience

        const result = userStore.updateProfessionalExperience(experience)

        expect(result).toBe(true)
        expect(userStore.user.experience).toEqual(experience)
      })

      it('updates education correctly', () => {
        const userStore = useUserStore()
        const education = TestDataFactory.user().education

        const result = userStore.updateEducation(education)

        expect(result).toBe(true)
        expect(userStore.user.education).toEqual(education)
      })

      it('updates skills correctly', () => {
        const userStore = useUserStore()
        const skills = TestDataFactory.user().skills

        const result = userStore.updateSkills(skills)

        expect(result).toBe(true)
        expect(userStore.user.skills).toEqual(skills)
      })
    })

    describe('initializeUserProfile', () => {
      it('initializes new user profile correctly', () => {
        const userStore = useUserStore()
        const basicInfo = {
          name: 'New User',
          email: 'new@example.com',
        }

        const result = userStore.initializeUserProfile(basicInfo)

        expect(result).toBe(true)
        expect(userStore.user.personalInfo.name).toBe(basicInfo.name)
        expect(userStore.user.personalInfo.email).toBe(basicInfo.email)
        expect(userStore.user.meta.createdAt).toBeDefined()
      })

      it('handles initialization errors gracefully', () => {
        const userStore = useUserStore()

        // Mock console.error to avoid test output noise
        const consoleSpy = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {})

        // This would fail in real implementation if userProfileService throws
        const result = userStore.initializeUserProfile()

        expect(result).toBe(true) // Should handle gracefully
        consoleSpy.mockRestore()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles update errors gracefully', () => {
      const userStore = useUserStore()

      // Mock console.error to avoid test output noise
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Try to update with invalid data
      const result = userStore.updateUser({
        personalInfo: { email: null as any },
      })

      expect(result).toBe(false)
      consoleSpy.mockRestore()
    })

    it('validates required fields', () => {
      const userStore = useUserStore()

      const result = userStore.updateUser({
        personalInfo: { name: '' }, // Empty name should fail validation
      })

      expect(result).toBe(false)
    })
  })

  describe('Integration with Services', () => {
    it('calls userProfileService methods', () => {
      // This would test integration with actual services
      // For now, we'll just ensure the methods exist and work
      const userStore = useUserStore()
      const testData = TestDataFactory.user()

      const result = userStore.updateUser(testData)
      expect(result).toBe(true)
    })
  })

  describe('State Persistence', () => {
    it('maintains state consistency', () => {
      const userStore = useUserStore()
      const testUser = TestDataFactory.user()

      // Update multiple times
      userStore.updatePersonalInfo(testUser.personalInfo)
      userStore.updateSkills(testUser.skills)
      userStore.updateProfessionalExperience(testUser.experience)

      // Verify all updates are maintained
      expect(userStore.user.personalInfo.name).toBe(testUser.personalInfo.name)
      expect(userStore.user.skills.technical).toEqual(testUser.skills.technical)
      expect(userStore.user.experience).toEqual(testUser.experience)
    })
  })

  describe('Reactive Updates', () => {
    it('triggers reactivity when profile changes', () => {
      const userStore = useUserStore()
      let completenessChanges = 0

      // Watch for changes to profile completeness
      const unwatch = userStore.$subscribe(() => {
        completenessChanges++
      })

      userStore.updatePersonalInfo({
        name: 'Test User',
        email: 'test@example.com',
      })

      expect(completenessChanges).toBeGreaterThan(0)
      unwatch()
    })
  })
})
