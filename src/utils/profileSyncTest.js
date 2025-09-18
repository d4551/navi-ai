/**
 * Profile Synchronization Test Utility
 *
 * Tests the unified profile system to ensure user profile data
 * is properly synchronized across all application systems:
 * - Jobs board and matching
 * - AI settings and training
 * - Studio matching
 * - Portfolio generation
 * - Resume building
 * - Settings and preferences
 */

import { useUnifiedProfile } from '@/composables/useUnifiedProfile'
import { profileSyncService } from '@/services/ProfileSyncService'
import { logger } from '@/shared/utils/logger'

export class ProfileSyncTester {
  constructor() {
    this.testResults = []
    this.unifiedProfile = null
  }

  async runAllTests() {
    logger.info('Starting profile synchronization tests...')

    try {
      // Initialize unified profile system
      this.unifiedProfile = useUnifiedProfile()

      const tests = [
        this.testProfileDataSync,
        this.testJobsBoardIntegration,
        this.testAISystemIntegration,
        this.testStudioMatchingIntegration,
        this.testPortfolioIntegration,
        this.testResumeBuilderIntegration,
        this.testSettingsIntegration,
        this.testCrossSystemEvents,
        this.testBatchUpdates,
        this.testErrorHandling,
      ]

      for (const test of tests) {
        try {
          await test.call(this)
        } catch (error) {
          this.addTestResult(test.name, false, error.message)
        }
      }

      this.printTestResults()
      return this.getTestSummary()
    } catch (error) {
      logger.error('Profile sync tests failed to initialize:', error)
      return { success: false, error: error.message }
    }
  }

  async testProfileDataSync() {
    const testName = 'Profile Data Synchronization'

    try {
      // Test updating personal info
      const personalInfoUpdate = {
        name: 'Test User',
        email: 'test@example.com',
        location: 'San Francisco, CA',
        phone: '555-123-4567',
      }

      const result = await this.unifiedProfile.updateProfileSection(
        'personalInfo',
        personalInfoUpdate
      )

      if (!result.success) {
        throw new Error('Failed to update personal info: ' + result.error)
      }

      // Wait for sync to complete
      await this.waitForSync()

      // Verify data is reflected in context-specific profiles
      const jobProfile = this.unifiedProfile.jobSearchProfile.value
      const aiProfile = this.unifiedProfile.aiTrainingProfile.value
      const studioProfile = this.unifiedProfile.studioMatchingProfile.value

      if (jobProfile.personalInfo.name !== personalInfoUpdate.name) {
        throw new Error('Personal info not synced to job search profile')
      }

      if (aiProfile.personalInfo?.name !== personalInfoUpdate.name) {
        throw new Error('Personal info not synced to AI training profile')
      }

      if (studioProfile.personalInfo.name !== personalInfoUpdate.name) {
        throw new Error('Personal info not synced to studio matching profile')
      }

      this.addTestResult(
        testName,
        true,
        'Personal info successfully synced across all contexts'
      )
    } catch (error) {
      this.addTestResult(testName, false, error.message)
    }
  }

  async testJobsBoardIntegration() {
    const testName = 'Jobs Board Integration'

    try {
      // Test updating skills that should reflect in job search
      const skillsUpdate = {
        technical: ['JavaScript', 'React', 'Node.js', 'Python'],
        gaming: ['Unity', 'Unreal Engine', 'Game Design'],
        tools: ['Git', 'Docker', 'AWS'],
      }

      const result = await this.unifiedProfile.updateProfileSection(
        'skills',
        skillsUpdate
      )

      if (!result.success) {
        throw new Error('Failed to update skills: ' + result.error)
      }

      await this.waitForSync()

      // Verify job search profile has updated skills
      const jobProfile = this.unifiedProfile.jobSearchProfile.value

      if (!jobProfile.skills.technical.includes('JavaScript')) {
        throw new Error('Technical skills not synced to job search profile')
      }

      // Check if sync event was triggered for jobs system
      const syncTargets = profileSyncService.getSyncTargets()
      const jobsTarget = syncTargets.find(target => target.id === 'jobs')

      if (!jobsTarget) {
        throw new Error('Jobs sync target not registered')
      }

      this.addTestResult(
        testName,
        true,
        'Skills successfully synced to jobs board system'
      )
    } catch (error) {
      this.addTestResult(testName, false, error.message)
    }
  }

  async testAISystemIntegration() {
    const testName = 'AI System Integration'

    try {
      // Test updating career goals that should reflect in AI training
      const careerGoalsUpdate = {
        targetRoles: ['Senior Game Developer', 'Technical Lead'],
        targetIndustries: ['Gaming', 'Entertainment Technology'],
        targetCompanies: ['Epic Games', 'Riot Games', 'Blizzard'],
        workPreferences: {
          remote: true,
          hybrid: false,
          onsite: false,
        },
      }

      const result = await this.unifiedProfile.updateProfileSection(
        'careerGoals',
        careerGoalsUpdate
      )

      if (!result.success) {
        throw new Error('Failed to update career goals: ' + result.error)
      }

      await this.waitForSync()

      // Verify AI training profile has updated goals
      const aiProfile = this.unifiedProfile.aiTrainingProfile.value

      if (
        !aiProfile.careerGoals.targetRoles.includes('Senior Game Developer')
      ) {
        throw new Error('Career goals not synced to AI training profile')
      }

      if (aiProfile.careerGoals.workPreferences.remote !== true) {
        throw new Error('Work preferences not synced to AI profile')
      }

      this.addTestResult(
        testName,
        true,
        'Career goals successfully synced to AI system'
      )
    } catch (error) {
      this.addTestResult(testName, false, error.message)
    }
  }

  async testStudioMatchingIntegration() {
    const testName = 'Studio Matching Integration'

    try {
      // Test updating gaming experience
      const gamingExperienceUpdate = {
        competitiveGaming: ['Overwatch', 'League of Legends'],
        achievements: ['Tournament Winner', 'Community Leader'],
        platforms: ['PC', 'PlayStation', 'Xbox'],
        guildsTeams: ['Team Alpha', 'Beta Squad'],
      }

      const result = await this.unifiedProfile.updateProfileSection(
        'gamingExperience',
        gamingExperienceUpdate
      )

      if (!result.success) {
        throw new Error('Failed to update gaming experience: ' + result.error)
      }

      await this.waitForSync()

      // Verify studio matching profile has updated gaming data
      const studioProfile = this.unifiedProfile.studioMatchingProfile.value

      if (
        !studioProfile.gamingExperience.competitiveGaming.includes('Overwatch')
      ) {
        throw new Error(
          'Gaming experience not synced to studio matching profile'
        )
      }

      this.addTestResult(
        testName,
        true,
        'Gaming experience successfully synced to studio matching'
      )
    } catch (error) {
      this.addTestResult(testName, false, error.message)
    }
  }

  async testPortfolioIntegration() {
    const testName = 'Portfolio Integration'

    try {
      // Test updating portfolio items
      const portfolioUpdate = [
        {
          id: 'portfolio-1',
          type: 'project',
          title: 'Indie Game Demo',
          description: 'A platformer game built with Unity',
          technologies: ['Unity', 'C#', 'Blender'],
          media: { type: 'video', url: 'demo.mp4' },
        },
      ]

      const result = await this.unifiedProfile.updateProfileSection(
        'portfolio',
        portfolioUpdate
      )

      if (!result.success) {
        throw new Error('Failed to update portfolio: ' + result.error)
      }

      await this.waitForSync()

      // Verify portfolio profile has updated items
      const portfolioProfile = this.unifiedProfile.portfolioProfile.value

      if (
        !portfolioProfile.portfolioItems.some(
          item => item.title === 'Indie Game Demo'
        )
      ) {
        throw new Error('Portfolio items not synced correctly')
      }

      this.addTestResult(testName, true, 'Portfolio items successfully synced')
    } catch (error) {
      this.addTestResult(testName, false, error.message)
    }
  }

  async testResumeBuilderIntegration() {
    const testName = 'Resume Builder Integration'

    try {
      // Test updating education that should reflect in resume
      const educationUpdate = [
        {
          id: 'edu-1',
          institution: 'University of California',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startDate: '2018-09-01',
          endDate: '2022-05-15',
          gpa: 3.8,
        },
      ]

      const result = await this.unifiedProfile.updateProfileSection(
        'education',
        educationUpdate
      )

      if (!result.success) {
        throw new Error('Failed to update education: ' + result.error)
      }

      await this.waitForSync()

      // Verify resume profile has updated education
      const resumeProfile = this.unifiedProfile.resumeProfile.value

      if (
        !resumeProfile.education.some(
          edu => edu.institution === 'University of California'
        )
      ) {
        throw new Error('Education not synced to resume profile')
      }

      this.addTestResult(
        testName,
        true,
        'Education successfully synced to resume builder'
      )
    } catch (error) {
      this.addTestResult(testName, false, error.message)
    }
  }

  async testSettingsIntegration() {
    const testName = 'Settings Integration'

    try {
      // Test updating preferences through profile update
      const profileUpdate = {
        meta: {
          ...this.unifiedProfile.profile.value?.meta,
          privacySettings: {
            publicProfile: false,
            shareWithRecruiters: true,
            allowAnalytics: false,
          },
        },
      }

      // This would typically be done through settings, but we test the sync path
      await this.unifiedProfile.batchUpdateProfile({ meta: profileUpdate.meta })

      await this.waitForSync()

      // Verify settings profile has updated preferences
      const settingsProfile = this.unifiedProfile.settingsProfile.value

      if (settingsProfile.privacySettings.shareWithRecruiters !== true) {
        throw new Error('Privacy settings not synced correctly')
      }

      this.addTestResult(
        testName,
        true,
        'Settings preferences successfully synced'
      )
    } catch (error) {
      this.addTestResult(testName, false, error.message)
    }
  }

  async testCrossSystemEvents() {
    const testName = 'Cross-System Events'

    try {
      let eventsReceived = 0

      // Listen for sync events
      const eventListener = () => {
        eventsReceived++
      }
      profileSyncService.on('sync-complete', eventListener)

      // Trigger a profile update
      await this.unifiedProfile.updateProfileSection('personalInfo', {
        name: 'Updated Test User',
      })

      await this.waitForSync()

      // Clean up listener
      profileSyncService.off('sync-complete', eventListener)

      if (eventsReceived === 0) {
        throw new Error('No sync events received')
      }

      this.addTestResult(
        testName,
        true,
        `Received ${eventsReceived} sync events`
      )
    } catch (error) {
      this.addTestResult(testName, false, error.message)
    }
  }

  async testBatchUpdates() {
    const testName = 'Batch Updates'

    try {
      const batchUpdates = {
        personalInfo: { name: 'Batch Test User' },
        skills: { technical: ['React', 'Vue', 'Angular'] },
        experience: [
          {
            id: 'exp-1',
            company: 'Test Company',
            title: 'Developer',
            startDate: '2023-01-01',
            current: true,
            description: 'Test role',
          },
        ],
      }

      const result = await this.unifiedProfile.batchUpdateProfile(batchUpdates)

      if (!result.success) {
        throw new Error('Batch update failed: ' + result.error)
      }

      await this.waitForSync()

      // Verify all updates were applied
      if (this.unifiedProfile.personalInfo.value.name !== 'Batch Test User') {
        throw new Error('Personal info not updated in batch')
      }

      if (!this.unifiedProfile.skills.value.technical.includes('React')) {
        throw new Error('Skills not updated in batch')
      }

      this.addTestResult(testName, true, 'Batch updates successfully processed')
    } catch (error) {
      this.addTestResult(testName, false, error.message)
    }
  }

  async testErrorHandling() {
    const testName = 'Error Handling'

    try {
      // Test invalid data update
      const invalidUpdate = {
        email: 'invalid-email', // Invalid email format
      }

      const result = await this.unifiedProfile.updateProfileSection(
        'personalInfo',
        invalidUpdate
      )

      // Should fail validation
      if (result.success) {
        throw new Error('Invalid data was accepted (validation failed)')
      }

      // Verify error was handled gracefully
      if (!result.error) {
        throw new Error('No error message provided for invalid data')
      }

      this.addTestResult(testName, true, 'Error handling working correctly')
    } catch (error) {
      this.addTestResult(testName, false, error.message)
    }
  }

  async waitForSync(timeout = 2000) {
    return new Promise(resolve => {
      const checkSync = () => {
        if (this.unifiedProfile.syncStatus.value !== 'syncing') {
          resolve()
        }
      }

      const interval = setInterval(checkSync, 100)
      setTimeout(() => {
        clearInterval(interval)
        resolve()
      }, timeout)
    })
  }

  addTestResult(testName, success, message) {
    this.testResults.push({
      test: testName,
      success,
      message,
      timestamp: new Date(),
    })

    const status = success ? '✅ PASS' : '❌ FAIL'
    logger.info(`${status} - ${testName}: ${message}`)
  }

  printTestResults() {
    console.log('\n=== Profile Synchronization Test Results ===')

    const passed = this.testResults.filter(r => r.success).length
    const total = this.testResults.length

    console.log(`Results: ${passed}/${total} tests passed\n`)

    this.testResults.forEach(result => {
      const status = result.success ? '✅ PASS' : '❌ FAIL'
      console.log(`${status} ${result.test}`)
      console.log(`   ${result.message}`)
      console.log('')
    })

    console.log('=== End Test Results ===\n')
  }

  getTestSummary() {
    const passed = this.testResults.filter(r => r.success).length
    const total = this.testResults.length
    const failedTests = this.testResults.filter(r => !r.success)

    return {
      success: passed === total,
      passed,
      total,
      passRate: Math.round((passed / total) * 100),
      failedTests: failedTests.map(test => ({
        name: test.test,
        error: test.message,
      })),
      results: this.testResults,
    }
  }
}

// Export convenience function for running tests
export const runProfileSyncTests = async () => {
  const tester = new ProfileSyncTester()
  return await tester.runAllTests()
}

export default ProfileSyncTester
