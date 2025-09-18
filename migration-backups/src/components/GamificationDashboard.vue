<template>
  <div class="gamification-dashboard">
    <!-- Top Stats Row -->
    <div class="row g-3 mb-4">
      <!-- User Level Card - Compact -->
      <div class="col-md-6">
        <div class="card gaming-card elevated h-100">
          <div class="card-body section-body text-center">
            <div class="d-flex align-items-center justify-content-center mb-3">
              <div
                class="level-avatar-compact"
                :class="`level-${userLevel.level}`"
              >
                <span class="level-number">{{ userLevel.level }}</span>
              </div>
              <div class="ms-3 text-start">
                <h6 class="mb-1 fw-bold text-gradient">
                  Level {{ userLevel.level }} {{ userLevel.title }}
                </h6>
                <small class="text-muted">{{ userLevel.currentXP }} XP</small>
              </div>
            </div>

            <!-- XP Progress Bar - Compact -->
            <div class="xp-progress-container">
              <div
                class="d-flex justify-content-between align-items-center mb-1"
              >
                <small class="text-muted">Next Level</small>
                <small class="text-primary fw-bold"
                  >{{ userLevel.xpForNext }} XP needed</small
                >
              </div>
              <div class="progress xp-progress-compact">
                <div
                  class="progress-bar"
                  :style="{ width: userLevel.progress + '%' }"
                  role="progressbar"
                  :aria-valuenow="userLevel.progress"
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Summary Card -->
      <div class="col-md-6">
        <div class="card gaming-card elevated h-100">
          <div class="card-body section-body">
            <h6 class="card-title mb-3">
              <AppIcon name="mdi-chart-bar" />Career Readiness
            </h6>
            <div class="stats-grid split-layout">
              <div class="stat-item">
                <div class="stat-value">
                  {{
                    Math.round(
                      (earnedAchievements.length / totalAchievements) * 100
                    )
                  }}%
                </div>
                <div class="stat-label">Achievement Progress</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">
                  {{ streak.current }}
                  <AppIcon
                    v-if="streak.current > 0"
                    name="mdi-fire"
                    class="text-warning ms-1"
                  />
                </div>
                <div class="stat-label">Day Streak</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Daily Challenges -->
    <div class="daily-challenges mb-4">
      <div class="card gaming-card elevated glass-surface">
        <div
          class="card-header section-header bg-gradient text-inverse border-0"
        >
          <div class="d-flex justify-content-between align-items-center">
            <h6 id="daily-challenges-title" class="mb-0">
              <AppIcon
                name="mdi-calendar-check-outline"
                class="me-2"
                aria-hidden="true"
              />
              Daily Challenges
            </h6>
            <div class="d-flex gap-2 align-items-center">
              <span class="badge badge-gaming"
                >{{ completedChallenges }}/{{
                  dailyChallenges.length
                }}
                completed</span
              >
            </div>
          </div>
        </div>
        <div
          class="card-body section-body"
          role="region"
          aria-labelledby="daily-challenges-title"
        >
          <!-- Challenges Grid - Compact -->
          <div class="row g-2">
            <div
              v-for="challenge in dailyChallenges.slice(0, 4)"
              :key="challenge.id"
              class="col-md-6"
            >
              <div
                class="challenge-item-compact glass-elevated hover-lift"
                :class="{ completed: challenge.completed }"
                role="listitem"
              >
                <div class="d-flex align-items-center">
                  <div class="challenge-icon-compact me-3">
                    <i
                      :class="challenge.icon"
                      :style="{
                        color: challenge.completed
                          ? 'var(--color-success)'
                          : 'var(--color-primary)',
                      }"
                    />
                    <div
                      v-if="challenge.completed"
                      class="completion-checkmark-compact"
                    >
                      <AppIcon name="mdi-check" />
                    </div>
                  </div>
                  <div class="flex-grow-1">
                    <div class="challenge-name-compact fw-semibold">
                      {{ challenge.name }}
                    </div>
                    <div class="challenge-reward-compact">
                      <AppIcon name="mdi-flash" class="me-1" />{{
                        challenge.xp
                      }}
                      XP
                    </div>
                  </div>
                  <button
                    v-if="!challenge.completed"
                    class="btn btn-sm btn-primary ui-btn ui-size-md"
                    @click="handleStartChallenge(challenge.id)"
                  >
                    Start
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- AI Recommendation -->
          <div
            v-if="aiChallengeSuggestion"
            class="ai-suggestion-compact mt-3 p-3 glass-elevated"
          >
            <div class="d-flex align-items-center">
              <AppIcon name="mdi-star-four-points" class="text-primary me-2" />
              <div class="flex-grow-1">
                <strong>AI Recommendation</strong>
                <p class="mb-2 small text-muted">
                  {{ aiChallengeSuggestion.description }}
                </p>
                <small class="text-muted">Confidence Level: 87% match</small>
              </div>
            </div>
          </div>

          <!-- Daily Progress - Compact -->
          <div class="daily-progress-compact mt-3">
            <div class="progress gaming-progress" style="height: 8px">
              <div
                class="progress-bar bg-gradient"
                :style="{
                  width:
                    (completedChallenges / dailyChallenges.length) * 100 + '%',
                }"
              />
            </div>
            <div class="d-flex justify-content-between mt-1">
              <small class="text-muted">Today's Progress</small>
              <small class="text-primary"
                >{{
                  Math.round(
                    (completedChallenges / dailyChallenges.length) * 100
                  )
                }}% completed</small
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity & Achievement Summary -->
    <div class="row g-3 mb-4">
      <!-- Quick Achievement Overview -->
      <div class="col-lg-8">
        <div class="card gaming-card elevated glass-surface h-100">
          <div
            class="card-header section-header bg-gradient text-inverse border-0"
          >
            <h6 class="mb-0">
              <AppIcon name="mdi-trophy-outline" class="me-2" />
              Recent Achievements & Progress
            </h6>
          </div>
          <div class="card-body section-body">
            <!-- Achievement Progress -->
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span>Achievement Progress</span>
              <span class="badge badge-gaming"
                >{{ earnedAchievements.length }}/{{ totalAchievements }}</span
              >
            </div>
            <div class="progress gaming-progress mb-3" style="height: 8px">
              <div
                class="progress-bar bg-gradient"
                :style="{
                  width:
                    (earnedAchievements.length / totalAchievements) * 100 + '%',
                }"
              />
            </div>

            <!-- Latest Achievements -->
            <div class="row g-2">
              <div
                v-for="achievement in allAchievements.slice(0, 3)"
                :key="achievement.id"
                class="col-md-4"
              >
                <div
                  class="achievement-item-compact p-2 glass-elevated"
                  :class="{ earned: isAchievementEarned(achievement.id) }"
                >
                  <div class="text-center">
                    <div class="achievement-icon-compact mb-1">
                      <i
                        :class="achievement.icon"
                        :style="{ color: getAchievementColor(achievement) }"
                      />
                    </div>
                    <div class="achievement-name-compact small fw-semibold">
                      {{ achievement.name }}
                    </div>
                    <div class="achievement-reward-compact small text-muted">
                      +{{ achievement.xp }} XP
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="text-center mt-3">
              <button
                class="btn btn-sm btn-outline-primary ui-btn ui-size-md"
                @click="showAllAchievements = !showAllAchievements"
              >
                View All Achievements
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity Summary -->
      <div class="col-lg-4">
        <div class="card gaming-card elevated glass-surface h-100">
          <div
            class="card-header section-header bg-gradient text-inverse border-0"
          >
            <h6 class="mb-0">
              <AppIcon name="mdi-pulse" class="me-2" />
              Activity Summary
            </h6>
          </div>
          <div class="card-body section-body">
            <!-- Recent XP Gains -->
            <div v-if="recentXPGains.length > 0" class="mb-3">
              <small class="text-muted d-block mb-2">Recent XP Gains</small>
              <div class="d-flex flex-wrap gap-1">
                <div
                  v-for="gain in recentXPGains.slice(0, 3)"
                  :key="gain.id"
                  class="xp-gain-badge-compact"
                >
                  +{{ gain.amount }} XP
                </div>
              </div>
            </div>

            <!-- AI Insight -->
            <div
              v-if="achievementInsights"
              class="ai-insight-compact p-2 glass-elevated"
            >
              <div class="d-flex align-items-start">
                <AppIcon name="mdi-lightbulb" class="text-warning me-2 mt-1" />
                <div>
                  <strong class="small"
                    >Personalized for your career path</strong
                  >
                  <p class="small text-muted mb-1">
                    {{ achievementInsights.suggestion }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Level Up Modal -->
    <div
      v-if="showLevelUpModal"
      class="modal show d-block"
      @click="closeLevelUpModal"
    >
      <div class="modal-backdrop show" />
      <div class="modal-dialog modal-dialog-centered" @click.stop>
        <div class="modal-content level-up-modal">
          <div class="modal-body text-center">
            <div class="level-up-animation">
              <div class="level-up-icon">
                <AppIcon name="mdi-star" />
              </div>
              <h4 class="fw-bold text-gradient mt-3">Level Up!</h4>
              <p class="lead">You've reached Level {{ newLevel.level }}!</p>
              <p class="text-muted">
                {{ newLevel.title }}
              </p>

              <!-- New Features Unlocked -->
              <div v-if="newFeatures.length > 0" class="mt-4">
                <h6>New Features Unlocked:</h6>
                <ul class="list-unstyled">
                  <li
                    v-for="feature in newFeatures"
                    :key="feature"
                    class="text-success"
                  >
                    <AppIcon name="mdi-check-circle-outline" class="me-2" />{{
                      feature
                    }}
                  </li>
                </ul>
              </div>

              <button
                class="btn btn-primary mt-3 v-btn ui-btn ui-size-md"
                @click="closeLevelUpModal"
              >
                Awesome!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Achievement Details Modal -->
    <div
      v-if="selectedAchievement"
      class="modal show d-block"
      @click="closeAchievementModal"
    >
      <div class="modal-backdrop show" />
      <div class="modal-dialog modal-dialog-centered" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ selectedAchievement.icon }} {{ selectedAchievement.name }}
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeAchievementModal"
            />
          </div>
          <div class="modal-body">
            <p>{{ selectedAchievement.description }}</p>
            <div class="achievement-details">
              <div class="row">
                <div class="col-6">
                  <strong>Reward:</strong><br />
                  <span class="text-primary"
                    >+{{ selectedAchievement.xp }} XP</span
                  >
                </div>
                <div class="col-6">
                  <strong>Status:</strong><br />
                  <span
                    :class="
                      isAchievementEarned(selectedAchievement.id)
                        ? 'text-success'
                        : 'text-warning'
                    "
                  >
                    {{
                      isAchievementEarned(selectedAchievement.id)
                        ? 'Earned'
                        : 'In Progress'
                    }}
                  </span>
                </div>
              </div>

              <!-- Requirements Progress -->
              <div
                v-if="!isAchievementEarned(selectedAchievement.id)"
                class="mt-3"
              >
                <strong>Requirements:</strong>
                <div class="mt-2">
                  <div
                    v-for="(value, key) in selectedAchievement.requirements"
                    :key="key"
                    class="mb-2"
                  >
                    <div class="d-flex justify-content-between">
                      <span>{{ formatRequirement(key, value) }}</span>
                      <span>{{ getUserStat(key) }}/{{ value }}</span>
                    </div>
                    <div class="progress">
                      <div
                        class="progress-bar"
                        :style="{
                          width:
                            Math.min((getUserStat(key) / value) * 100, 100) +
                            '%',
                        }"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { useAppStore } from '@/stores/app'
import AppIcon from '@/components/ui/AppIcon.vue'
import GamificationService, { ACHIEVEMENTS } from '@/utils/gamification'
import { getBestAIClient, initializeAI } from '@/utils/aiClient'

export default {
  name: 'GamificationDashboard',
  components: {
    AppIcon,
  },
  emits: ['start-challenge', 'achievement-earned', 'level-up', 'navigate'],
  setup(_props, { emit }) {
    const store = useAppStore()
    const gamificationService = new GamificationService(store)
    const { success: toastSuccess } = useToast()

    // State
    const showAllAchievements = ref(false)
    const showAllActivity = ref(false)
    const showLevelUpModal = ref(false)
    const selectedAchievement = ref(null)
    const recentXPGains = ref([])
    const newLevel = ref(null)
    const newFeatures = ref([])

    // AI Integration - Enhanced with deeper analysis
    const aiChallengeSuggestion = ref(null)
    const dynamicChallenges = ref([])
    const aiInsights = ref(null)
    const achievementInsights = ref(null)
    const activityInsights = ref(null)
    let aiService
    try {
      aiService = getBestAIClient()
    } catch (error) {
      console.warn('AI service not available:', error)
      aiService = null
    }

    const generateAISuggestion = async () => {
      try {
        if (!store.settings.geminiApiKey) {
          // Provide basic suggestions without AI
          const userStats = gamificationService.getUserStats()
          const incompleteChallenge = dailyChallenges.value.find(
            c => !c.completed
          )

          if (incompleteChallenge) {
            aiChallengeSuggestion.value = {
              description: `Based on your current progress, "${incompleteChallenge.name}" could be your next step to advance your career.`,
              actions: [
                {
                  id: 'start_challenge',
                  text: 'Start Challenge',
                  icon: 'mdi-rocket-launch',
                  label: `Start the ${incompleteChallenge.name} challenge`,
                  challengeId: incompleteChallenge.id,
                },
              ],
            }
          }
          return
        }

        const userStats = gamificationService.getUserStats()
        const userProfile = {
          level: userLevel.value.level,
          xp: store.user.xp || 0,
          completedChallenges: completedChallenges.value,
          totalChallenges: dailyChallenges.value.length,
          profileCompleteness: userStats.profileComplete || 0,
          skills: store.user.skills || [],
          gamingExperience: store.user.gamingExperience || {},
          recentActivity: recentActivity.value.slice(0, 3),
        }

        // Generate AI-powered challenge recommendation
        if (!aiService) {
          throw new Error('AI service not available')
        }

        const result = await aiService.getContextualSuggestions(
          'daily-challenges',
          {
            challenges: dailyChallenges.value,
            userProgress: userProfile,
            streak: streak.value,
          },
          userProfile
        )

        if (result.suggestions && result.suggestions.length > 0) {
          const topSuggestion = result.suggestions[0]

          aiChallengeSuggestion.value = {
            description: topSuggestion.description,
            actions: [
              {
                id: 'ai_recommended',
                text: topSuggestion.action,
                icon: 'mdi-stars',
                label: `AI Recommended: ${topSuggestion.title}`,
                priority: topSuggestion.priority,
              },
            ],
          }

          // Store insights for other components
          aiInsights.value = {
            insights: result.insights || [],
            nextSteps: result.nextSteps || [],
            timestamp: Date.now(),
          }
        }
      } catch (_error) {
        console.warn('AI suggestion generation failed:', error)
        // Fallback to basic suggestion
        const incompleteChallenge = dailyChallenges.value.find(
          c => !c.completed
        )
        if (incompleteChallenge) {
          aiChallengeSuggestion.value = {
            description: `Continue your progress with "${incompleteChallenge.name}" to advance your career development.`,
            actions: [
              {
                id: 'start_challenge',
                text: 'Continue Progress',
                icon: 'mdi-arrow-right-circle',
                label: `Continue with ${incompleteChallenge.name}`,
                challengeId: incompleteChallenge.id,
              },
            ],
          }
        }
      }
    }

    // Generate dynamic AI challenges based on user progress
    const generateDynamicChallenges = async () => {
      try {
        if (!store.settings.geminiApiKey) {
          return
        }

        const userStats = gamificationService.getUserStats()
        const context = {
          profileCompleteness: userStats.profileComplete || 0,
          skillsCount: (store.user.skills || []).length,
          recentActivityCount: recentActivity.value.length,
          currentLevel: userLevel.value.level,
          completedChallengesCount: completedChallenges.value,
          streakDays: streak.value.current,
        }

        const prompt = `Generate 2-3 personalized daily challenges for a gaming career transition app user with this profile:
        
${JSON.stringify(_context)}
        
Challenges should be:
- Specific and actionable
- Appropriate for their skill level
- Focus on career development gaps
- Worth 15-25 XP each
- Completable in 10-30 minutes
        
Return JSON array with: {"name": "", "description": "", "xp": 0, "icon": "bi bi-...", "category": "profile|skills|networking|application"}`

        if (!aiService) {
          return
        }

        const result = await aiService.generateSmartContent(
          'dynamic_challenges',
          'personalized daily challenges',
          context
        )

        try {
          const challenges = JSON.parse(_result)
          if (Array.isArray(challenges)) {
            dynamicChallenges.value = challenges.map((challenge, index) => ({
              ...challenge,
              id: `ai_${Date.now()}_${index}`,
              completed: false,
              dynamic: true,
            }))
          }
        } catch (_parseError) {
          console.warn('Failed to parse dynamic challenges:', parseError)
        }
      } catch (_error) {
        console.warn('Dynamic challenge generation failed:', error)
      }
    }

    // Generate AI-powered achievement insights
    const generateAchievementInsights = async () => {
      try {
        if (!store.settings.geminiApiKey) {
          return
        }

        const _userStats = gamificationService.getUserStats()
        const nearestAchievements = allAchievements.value
          .filter(achievement => !isAchievementEarned(achievement.id))
          .map(achievement => {
            const progress = Object.entries(achievement.requirements).map(
              ([key, value]) => {
                const current = getUserStat(key)
                return {
                  key,
                  current,
                  required: value,
                  percentage: Math.min((current / value) * 100, 100),
                }
              }
            )
            const avgProgress =
              progress.reduce((sum, p) => sum + p.percentage, 0) /
              progress.length
            return { ...achievement, progress, avgProgress }
          })
          .sort((a, b) => b.avgProgress - a.avgProgress)
          .slice(0, 5)

        const context = {
          earnedCount: earnedAchievements.value.length,
          totalCount: totalAchievements.value,
          completionRate: Math.round(
            (earnedAchievements.value.length / totalAchievements.value) * 100
          ),
          nearestAchievements: nearestAchievements.map(a => ({
            name: a.name,
            progress: Math.round(a.avgProgress),
            requirements: a.requirements,
          })),
          userLevel: userLevel.value.level,
          recentActivity: recentActivity.value.length,
        }

        if (!aiService) {
          return
        }

        const result = await aiService.getContextualSuggestions(
          'achievements',
          context,
          { level: userLevel.value.level, xp: store.user.xp }
        )

        if (result.suggestions && result.suggestions.length > 0) {
          const topSuggestion = result.suggestions[0]

          achievementInsights.value = {
            suggestion: topSuggestion.description,
            nextAchievements: nearestAchievements.slice(0, 3),
            strategy: topSuggestion.action,
            priority: topSuggestion.priority,
            timestamp: Date.now(),
          }
        }
      } catch (_error) {
        console.warn('Achievement insights generation failed:', error)
      }
    }

    // Generate AI-powered activity insights
    const generateActivityInsights = async () => {
      try {
        if (!store.settings.geminiApiKey || recentActivity.value.length === 0) {
          return
        }

        const activityData = recentActivity.value
          .slice(0, 10)
          .map(activity => ({
            type: activity.type || 'general',
            description: activity.description,
            xp: activity.xp || 0,
            timestamp: activity.timestamp,
            category: activity.icon?.includes('trophy')
              ? 'achievement'
              : activity.icon?.includes('star')
                ? 'xp-gain'
                : activity.icon?.includes('check')
                  ? 'completion'
                  : 'other',
          }))

        const context = {
          totalActivities: recentActivity.value.length,
          totalXPGained: activityData.reduce((sum, a) => sum + (a.xp || 0), 0),
          activityTypes: [...new Set(activityData.map(a => a.category))],
          recentTrends: activityData.slice(0, 5),
          userLevel: userLevel.value.level,
          streak: streak.value.current,
          completionRate: Math.round(
            (completedChallenges.value / dailyChallenges.value.length) * 100
          ),
        }

        if (!aiService) {
          return
        }

        const result = await aiService.getContextualSuggestions(
          'activity-analysis',
          context,
          { level: userLevel.value.level, activities: activityData }
        )

        if (result.insights && result.insights.length > 0) {
          activityInsights.value = {
            summary:
              result.insights[0] ||
              'Your recent activity shows consistent engagement with career development.',
            trends: result.insights.slice(1) || [],
            nextActions: (result.suggestions || []).map(s => ({
              id: s.type || 'general',
              text: s.title || s.action,
              icon:
                s.type === 'add'
                  ? 'mdi mdi-plus-circle'
                  : s.type === 'improve'
                    ? 'mdi mdi-arrow-up-circle'
                    : s.type === 'optimize'
                      ? 'mdi mdi-cog-outline'
                      : 'mdi mdi-flash',
              action: s.action,
              priority: s.priority,
            })),
            timestamp: Date.now(),
          }
        }
      } catch (_error) {
        console.warn('Activity insights generation failed:', error)
      }
    }

    // Handle activity insights actions
    const handleActivityAction = async action => {
      try {
        switch (action.id) {
          case 'add':
            toastSuccess(
              `<AppIcon name="mdi-rocket" /> Suggestion: ${action.action}`,
              { duration: 4000 }
            )
            break
          case 'improve':
            toastSuccess(
              `<AppIcon name="mdi-sparkles" class="sparkles" /> Improvement: ${action.action}`,
              {
                duration: 4000,
              }
            )
            break
          case 'optimize':
            toastSuccess(
              `<AppIcon name="mdi-cog" /> Optimization: ${action.action}`,
              {
                duration: 4000,
              }
            )
            break
          default:
            toastSuccess(
              `<AppIcon name="mdi-lightbulb" /> ${action.text}: ${action.action}`,
              {
                duration: 4000,
              }
            )
        }
      } catch (_error) {
        console.warn('Activity action handling failed:', error)
        toastSuccess('Action noted! Keep up the great work.', {
          duration: 3000,
        })
      }
    }

    // Computed properties
    const userLevel = computed(() => {
      try {
        const xp = store?.user?.xp || 0
        return gamificationService.getLevelInfo(xp)
      } catch (error) {
        console.warn('Failed to get user level info:', error)
        return {
          level: 1,
          title: 'Rookie',
          currentXP: 0,
          xpForNext: 100,
          xpInLevel: 0,
          xpRequiredForLevel: 100,
          progress: 0,
        }
      }
    })

    const dailyChallenges = computed(() => {
      try {
        const baseChallenges = gamificationService.getTodaysChallenges() || []
        // Merge base challenges with AI-generated dynamic challenges
        const dynamicChalls = Array.isArray(dynamicChallenges.value)
          ? dynamicChallenges.value
          : []
        return [...baseChallenges, ...dynamicChalls]
      } catch (error) {
        console.warn('Failed to get daily challenges:', error)
        return []
      }
    })

    // Toast on newly completed challenges
    const knownCompleted = ref(new Set())
    watch(
      dailyChallenges,
      items => {
        const current = new Set(items.filter(c => c.completed).map(c => c.id))
        if (knownCompleted.value.size === 0) {
          // Initialize without toasting existing completed
          knownCompleted.value = current
          return
        }
        items.forEach(c => {
          if (c.completed && !knownCompleted.value.has(c.id)) {
            toastSuccess(`Challenge completed: ${c.name} (+${c.xp} XP)`, {
              duration: 4000,
            })
          }
        })
        knownCompleted.value = current
      },
      { deep: true, immediate: true }
    )

    const completedChallenges = computed(() => {
      return dailyChallenges.value.filter(c => c.completed).length
    })

    const streak = computed(() => {
      return gamificationService.getStreak()
    })

    const allAchievements = computed(() => {
      return Object.values(ACHIEVEMENTS)
    })

    const earnedAchievements = computed(() => {
      try {
        return Array.isArray(store?.user?.achievements)
          ? store.user.achievements
          : []
      } catch (error) {
        console.warn('Failed to get earned achievements:', error)
        return []
      }
    })

    const totalAchievements = computed(() => {
      return allAchievements.value.length
    })

    const displayedAchievements = computed(() => {
      if (showAllAchievements.value) {
        return allAchievements.value
      }
      return allAchievements.value.slice(0, 6)
    })

    const recentActivity = computed(() => {
      const activities = []

      // Add recent achievements
      if (earnedAchievements.value.length > 0) {
        earnedAchievements.value.slice(-3).forEach(achievementId => {
          const achievement = allAchievements.value.find(
            a => a.id === achievementId
          )
          if (achievement) {
            activities.push({
              id: `achievement-${achievementId}`,
              icon: 'mdi-trophy',
              color: 'var(--color-warning)',
              description: `Earned "${achievement.name}" achievement`,
              xp: achievement.xp,
              timestamp: Date.now() - Math.random() * 86400000, // Random time in last 24h
            })
          }
        })
      }

      // Add recent XP gains
      recentXPGains.value.forEach(gain => {
        activities.push({
          id: `xp-${gain.id}`,
          icon: 'mdi-star',
          color: 'var(--color-primary)',
          description: `Earned XP for ${gain.action}`,
          xp: gain.amount,
          timestamp: gain.timestamp,
        })
      })

      return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10)
    })

    // Methods
    const handleStartChallenge = challengeId => {
      emit('start-challenge', challengeId)
      // Clear AI suggestion after action
      if (
        aiChallengeSuggestion.value?.actions.some(
          a => a.challengeId === challengeId
        )
      ) {
        aiChallengeSuggestion.value = null
      }
    }

    const handleAISuggestion = async action => {
      try {
        if (action.route) {
          emit('navigate', action.route)
        } else if (action.challengeId) {
          handleStartChallenge(action.challengeId)
        } else if (action.id === 'get_tips') {
          // Generate AI-powered contextual tips
          if (store.settings.geminiApiKey && aiService) {
            const userStats = gamificationService.getUserStats()
            const tip = await aiService.generateSmartContent(
              'career_tip',
              'profile improvement advice',
              { profileCompleteness: userStats.profileComplete }
            )
            toastSuccess(`AI Tip: ${tip}`, { duration: 6000 })
          } else {
            toastSuccess(
              'Tip: Complete your profile to unlock personalized job recommendations!',
              { duration: 5000 }
            )
          }
        } else if (action.id === 'ai_recommended') {
          // Handle AI-recommended actions
          if (aiInsights.value && aiInsights.value.nextSteps.length > 0) {
            const nextStep = aiInsights.value.nextSteps[0]
            toastSuccess(`Next Step: ${nextStep}`, { duration: 5000 })
          }
        }

        // Clear suggestion after action
        aiChallengeSuggestion.value = null
      } catch (_error) {
        console.warn('AI suggestion handling failed:', error)
        toastSuccess(
          'Action noted! Continue working on your career development.',
          { duration: 3000 }
        )
        aiChallengeSuggestion.value = null
      }
    }

    const isAchievementEarned = achievementId => {
      return earnedAchievements.value.includes(achievementId)
    }

    const getAchievementColor = achievement => {
      if (isAchievementEarned(achievement.id)) {
        return 'var(--color-warning)' // Gold for earned
      } else if (isAchievementAvailable(achievement)) {
        return 'var(--color-primary)' // Primary blue for available
      } else {
        return 'var(--text-muted)' // Muted for locked
      }
    }

    const getAchievementAriaLabel = achievement => {
      const status = isAchievementEarned(achievement.id)
        ? 'earned'
        : isAchievementAvailable(achievement)
          ? 'available'
          : 'locked'
      const progress = !isAchievementEarned(achievement.id)
        ? Object.entries(achievement.requirements)
            .map(
              ([key, value]) =>
                `${getUserStat(key)} of ${value} ${formatRequirement(key, value).toLowerCase()}`
            )
            .join(', ')
        : ''
      return `Achievement ${achievement.name}, ${status}. ${achievement.description}. Reward: ${achievement.xp} XP. ${progress}`.trim()
    }

    const getActivityAriaLabel = activity => {
      const xpText = activity.xp ? ` Earned ${activity.xp} XP.` : ''
      const typeText = activity.type ? ` Type: ${activity.type}.` : ''
      return `${activity.description} ${formatTime(activity.timestamp)}.${xpText}${typeText}`
    }

    const isAchievementAvailable = achievement => {
      const userStats = gamificationService.getUserStats()
      return Object.entries(achievement.requirements).some(([key, value]) => {
        return userStats[key] >= value * 0.5 // Available when 50% progress
      })
    }

    const getUserStat = statKey => {
      const userStats = gamificationService.getUserStats()
      return userStats[statKey] || 0
    }

    const formatRequirement = (key, value) => {
      const labels = {
        profileComplete: 'Profile completion',
        skillsMapped: 'Skills mapped',
        portfolioItems: 'Portfolio items',
        jobApplications: 'Job applications',
        chatSessions: 'Chat sessions',
        resumesGenerated: 'Resumes generated',
        savedJobs: 'Saved jobs',
      }

      const label = labels[key] || key
      return `${label}: ${value}${key === 'profileComplete' ? '%' : ''}`
    }

    const formatTime = timestamp => {
      const now = Date.now()
      const diff = now - timestamp
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)

      if (days > 0) {
        return `${days}d ago`
      }
      if (hours > 0) {
        return `${hours}h ago`
      }
      if (minutes > 0) {
        return `${minutes}m ago`
      }
      return 'Just now'
    }

    const showAchievementDetails = achievement => {
      selectedAchievement.value = achievement
    }

    const closeAchievementModal = () => {
      selectedAchievement.value = null
    }

    const closeLevelUpModal = () => {
      showLevelUpModal.value = false
      newLevel.value = null
      newFeatures.value = []
    }

    const addXPGain = (amount, action) => {
      const gain = {
        id: Date.now(),
        amount,
        action,
        timestamp: Date.now(),
      }

      recentXPGains.value.unshift(gain)

      // Keep only recent gains
      if (recentXPGains.value.length > 10) {
        recentXPGains.value = recentXPGains.value.slice(0, 10)
      }

      // Auto-remove after 30 seconds
      setTimeout(() => {
        const index = recentXPGains.value.findIndex(g => g.id === gain.id)
        if (index !== -1) {
          recentXPGains.value.splice(index, 1)
        }
      }, 30000)
    }

    const checkForLevelUp = () => {
      const currentXP = store.user.xp || 0
      const currentLevel = gamificationService.calculateLevel(currentXP)
      const previousXP = store.user.previousXP || 0
      const previousLevel = gamificationService.calculateLevel(previousXP)

      if (currentLevel.level > previousLevel.level) {
        newLevel.value = currentLevel

        // Add features unlocked at this level
        const features = []
        if (currentLevel.level >= 3) {
          features.push('Advanced skill mapping')
        }
        if (currentLevel.level >= 5) {
          features.push('Premium job recommendations')
        }
        if (currentLevel.level >= 7) {
          features.push('Portfolio analytics')
        }
        if (currentLevel.level >= 10) {
          features.push('Expert career coaching')
        }

        newFeatures.value = features
        showLevelUpModal.value = true

        emit('level-up', currentLevel)
      }

      // Update previous XP for next comparison
      store.updateUser({ previousXP: currentXP })
    }

    const processAchievements = () => {
      const newAchievements = gamificationService.processAchievements()
      newAchievements.forEach(achievement => {
        emit('achievement-earned', achievement)
        addXPGain(achievement.xp, `achievement: ${achievement.name}`)
      })
    }

    // Watch for XP changes to trigger level up check
    watch(
      () => store.user.xp,
      () => {
        checkForLevelUp()
        processAchievements()
      }
    )

    // Lifecycle
    onMounted(() => {
      // Process any achievements on component mount
      processAchievements()
      // Generate AI suggestions, dynamic challenges, achievement insights, and activity insights
      generateAISuggestion()
      generateDynamicChallenges()
      generateAchievementInsights()
      // Delay activity insights to allow activity data to load
      setTimeout(generateActivityInsights, 1000)
    })

    // Watch for changes to regenerate AI suggestions and challenges
    watch(
      () => [store.user.xp, store.profileCompleteness],
      () => {
        setTimeout(() => {
          generateAISuggestion()
          // Regenerate dynamic challenges less frequently
          if (Math.random() < 0.3) {
            // 30% chance on profile/XP changes
            generateDynamicChallenges()
          }
          // Regenerate achievement insights when significant progress is made
          if (Math.random() < 0.4) {
            // 40% chance
            generateAchievementInsights()
          }
          // Regenerate activity insights periodically
          if (Math.random() < 0.2) {
            // 20% chance
            generateActivityInsights()
          }
        }, 500) // Debounce
      }
    )

    // Watch completed challenges to trigger new dynamic challenges
    watch(completedChallenges, (newCount, oldCount) => {
      if (newCount > oldCount && newCount % 3 === 0) {
        // Every 3 completed challenges
        setTimeout(generateDynamicChallenges, 1000)
      }
    })

    // Watch for new achievements to regenerate insights
    watch(earnedAchievements, (newAchievements, oldAchievements) => {
      if (newAchievements.length > (oldAchievements?.length || 0)) {
        setTimeout(generateAchievementInsights, 1500)
      }
    })

    // Watch activity changes to regenerate insights
    watch(
      recentActivity,
      (newActivity, oldActivity) => {
        if (newActivity.length > (oldActivity?.length || 0)) {
          setTimeout(generateActivityInsights, 2000)
        }
      },
      { deep: true }
    )

    return {
      // State
      showAllAchievements,
      showAllActivity,
      showLevelUpModal,
      selectedAchievement,
      recentXPGains,
      newLevel,
      newFeatures,
      aiChallengeSuggestion,
      dynamicChallenges,
      aiInsights,
      achievementInsights,
      activityInsights,
      handleActivityAction,

      // Computed
      userLevel,
      dailyChallenges,
      completedChallenges,
      streak,
      allAchievements,
      earnedAchievements,
      totalAchievements,
      displayedAchievements,
      recentActivity,

      // Methods
      handleStartChallenge,
      handleAISuggestion,
      isAchievementEarned,
      isAchievementAvailable,
      getAchievementColor,
      getAchievementAriaLabel,
      getActivityAriaLabel,
      getUserStat,
      formatRequirement,
      formatTime,
      showAchievementDetails,
      closeAchievementModal,
      closeLevelUpModal,
      addXPGain,
    }
  },
}
</script>

<style scoped>
/* Enhanced Gamification Dashboard */
.gamification-dashboard {
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

/* Compact Layout Styles */
.level-avatar-compact {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--text-on-primary);
  background: var(--primary-gradient);
  box-shadow: 0 2px 12px var(--primary-glow-medium);
  border: 2px solid white;
  flex-shrink: 0;
}

.xp-progress-compact {
  height: 12px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.stats-grid {
  display: grid;
  gap: var(--spacing-md);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.challenge-item-compact {
  padding: var(--spacing-sm);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-normal);
  background: var(--glass-surface);
}

.challenge-item-compact:hover {
  background: var(--primary-gradient-bg);
  border-color: var(--primary-border-subtle);
  transform: translateY(-1px);
}

.challenge-item-compact.completed {
  background: var(--success-bg);
  border-color: var(--success-border);
}

.challenge-icon-compact {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  position: relative;
  flex-shrink: 0;
}

.completion-checkmark-compact {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: var(--color-success);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.6rem;
  border: 1px solid white;
}

.challenge-name-compact {
  font-size: 0.9rem;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.challenge-reward-compact {
  font-size: 0.75rem;
  color: var(--color-primary);
  font-weight: bold;
}

.achievement-item-compact {
  border-radius: var(--border-radius-md);
  transition: all var(--transition-fast);
  cursor: pointer;
  background: var(--glass-elevated);
  border: 1px solid var(--glass-border);
}

.achievement-item-compact:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}

.achievement-item-compact.earned {
  background: var(--success-gradient-bg);
  border-color: var(--color-success);
}

.achievement-icon-compact {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  margin: 0 auto;
}

.achievement-name-compact {
  font-size: 0.8rem;
  margin-bottom: 2px;
}

.achievement-reward-compact {
  font-size: 0.7rem;
}

.xp-gain-badge-compact {
  background: var(--success-gradient);
  color: white;
  padding: 2px 6px;
  border-radius: var(--border-radius-sm);
  font-size: 0.7rem;
  font-weight: bold;
}

.ai-suggestion-compact,
.ai-insight-compact {
  border-radius: var(--border-radius-md);
  background: var(--glass-elevated);
  border: 1px solid var(--glass-border);
}

.daily-progress-compact .progress {
  margin-bottom: 0;
}

/* Glass Surface Effects - using centralized theme tokens */
.glass-surface {
  background: var(--glass-surface);
  backdrop-filter: blur(var(--glass-backdrop-blur)) saturate(140%);
  -webkit-backdrop-filter: blur(var(--glass-backdrop-blur)) saturate(140%);
  border: 1px solid var(--glass-border);
}

/* Dark mode glass surface - handled by centralized theme system */
[data-theme='dark'] .glass-surface {
  background: var(--glass-surface-dark);
  border-color: var(--glass-border-dark);
}

.glass-elevated {
  background: var(--glass-elevated);
  backdrop-filter: blur(calc(var(--glass-backdrop-blur) * 1.1)) saturate(150%);
  -webkit-backdrop-filter: blur(calc(var(--glass-backdrop-blur) * 1.1))
    saturate(150%);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

/* Dark mode elevated glass effects - using centralized tokens */
[data-theme='dark'] .glass-elevated {
  background: var(--glass-elevated-dark);
  border-color: var(--glass-border-dark);
  box-shadow: var(--glass-shadow-dark);
}

.glass-button {
  background: var(--glass-surface);
  backdrop-filter: blur(calc(var(--glass-backdrop-blur) * 0.8)) saturate(130%);
  -webkit-backdrop-filter: blur(calc(var(--glass-backdrop-blur) * 0.8))
    saturate(130%);
  border: 1px solid var(--glass-border);
  transition: all var(--transition-fast);
}

.glass-button:hover {
  background: var(--glass-elevated);
  border-color: var(--primary-border-subtle);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.glass-button:focus-visible {
  outline: var(--focus-ring-size) solid var(--color-focus-ring);
  outline-offset: var(--focus-ring-offset);
  background: var(--glass-elevated);
  border-color: var(--color-focus-ring);
  transform: translateY(-1px);
}

[data-theme='dark'] .glass-button:focus-visible {
  background: var(--glass-elevated-dark);
  border-color: var(--color-focus-ring);
}

/* Dark mode glass buttons - using centralized theme system */
[data-theme='dark'] .glass-button {
  background: var(--glass-surface-dark);
  border-color: var(--glass-border-dark);
}

[data-theme='dark'] .glass-button:hover {
  background: var(--glass-elevated-dark);
  border-color: var(--primary-border-subtle-dark);
  box-shadow: var(--glass-shadow-dark);
}

.user-level-card .level-avatar-container {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-md);
}

.level-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-on-primary);
  position: relative;
  background: var(--primary-gradient);
  box-shadow: 0 4px 20px var(--primary-glow-medium);
  border: 3px solid white;
}

.level-avatar.level-1,
.level-avatar.level-2 {
  background: linear-gradient(135deg, var(--text-secondary), var(--text-muted));
}
.level-avatar.level-3,
.level-avatar.level-4 {
  background: var(--success-gradient);
}
.level-avatar.level-5,
.level-avatar.level-6 {
  background: var(--primary-gradient);
}
.level-avatar.level-7,
.level-avatar.level-8 {
  background: var(--warning-gradient);
}
.level-avatar.level-9,
.level-avatar.level-10 {
  background: var(--gaming-accent);
}

.level-glow {
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border-radius: 50%;
  background: inherit;
  opacity: 0.3;
  animation: levelGlow 2s ease-in-out infinite alternate;
}

@keyframes levelGlow {
  from {
    transform: scale(1);
    opacity: 0.3;
  }
  to {
    transform: scale(1.1);
    opacity: 0.1;
  }
}

.xp-progress {
  height: 20px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.xp-progress .progress-bar {
  background: var(--primary-gradient);
  position: relative;
  overflow: hidden;
}

.xp-progress .progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.progress-text {
  position: absolute;
  width: 100%;
  text-align: center;
  font-size: 0.75rem;
  font-weight: bold;
  color: var(--text-on-primary);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.xp-gain-badge {
  background: var(--success-gradient);
  backdrop-filter: blur(6px) saturate(140%);
  -webkit-backdrop-filter: blur(6px) saturate(140%);
  border: 1px solid var(--glass-border);
  color: var(--text-on-primary);
  padding: 2px 8px;
  border-radius: var(--border-radius-lg);
  font-size: 0.75rem;
  font-weight: bold;
  animation: xpGain 0.5s ease-out;
  box-shadow: 0 2px 8px var(--success-gradient-bg);
}

@keyframes xpGain {
  from {
    transform: translateY(-10px) scale(0.8);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.streak-indicator {
  background: var(--glass-elevated);
  backdrop-filter: blur(8px) saturate(130%);
  -webkit-backdrop-filter: blur(8px) saturate(130%);
  border: 1px solid var(--glass-border);
  padding: 4px 8px;
  border-radius: var(--border-radius-lg);
  font-size: 0.75rem;
  font-weight: bold;
  pointer-events: none; /* do not block UI */
}

/* Dark mode streak indicator - using centralized system */
[data-theme='dark'] .streak-indicator {
  background: var(--glass-elevated-dark);
  border-color: var(--glass-border-dark);
}

.challenges-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.challenge-item {
  display: flex;
  align-items: center;
  justify-content: between;
  padding: var(--spacing-sm);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-normal);
  background: var(--glass-surface);
}

/* Dark mode challenge items - using centralized theme */
[data-theme='dark'] .challenge-item {
  background: var(--glass-surface-dark);
  border-color: var(--glass-border-dark);
  color: var(--text-primary);
}

.challenge-item:hover {
  background: var(--primary-gradient-bg);
  border-color: var(--primary-border-subtle);
  transform: translateY(-1px);
}

.challenge-item:focus-visible {
  outline: var(--focus-ring-size) solid var(--color-focus-ring);
  outline-offset: var(--focus-ring-offset);
  background: var(--primary-gradient-bg);
  border-color: var(--color-focus-ring);
  transform: translateY(-1px);
}

[data-theme='dark'] .challenge-item:hover {
  background: var(--primary-gradient-bg-dark);
  border-color: var(--primary-border-subtle-dark);
}

[data-theme='dark'] .challenge-item:focus-visible {
  background: var(--primary-gradient-bg-dark);
  border-color: var(--color-focus-ring);
}

.challenge-item.completed {
  background: var(--success-bg);
  border-color: var(--success-border);
}

/* Dark mode completed challenges */
[data-theme='dark'] .challenge-item.completed {
  background: var(--success-gradient-bg-dark);
  border-color: var(--success-border);
}

.challenge-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.challenge-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  margin-right: var(--spacing-md);
  position: relative;
}

.completion-checkmark {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  background: var(--color-success);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-on-primary);
  font-size: 0.7rem;
  border: 2px solid white;
}

.challenge-info {
  flex: 1;
}

.challenge-name {
  font-weight: 600;
  color: var(--text-primary);
}

.challenge-description {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 2px 0;
}

.challenge-reward {
  font-size: 0.75rem;
  color: var(--primary-color);
  font-weight: bold;
}

.achievements-grid {
  display: grid;
  gap: var(--spacing-md);
}

.achievement-item {
  display: flex;
  padding: var(--spacing-lg);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-xl);
  transition: all var(--transition-fast);
  cursor: pointer;
  background: var(--glass-elevated);
  backdrop-filter: blur(var(--glass-backdrop-blur)) saturate(140%);
  -webkit-backdrop-filter: blur(var(--glass-backdrop-blur)) saturate(140%);
  box-shadow: var(--shadow-sm);
  min-height: var(--minimum-target);
}

.achievement-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary);
}

.achievement-item:focus-visible {
  outline: var(--focus-ring-size) solid var(--color-focus-ring);
  outline-offset: var(--focus-ring-offset);
}

.achievement-item.earned {
  background: var(--success-gradient-bg);
  border-color: var(--color-success);
  box-shadow: 0 4px 15px var(--success-gradient-bg);
}

.achievement-item.available {
  border-color: var(--color-primary);
  background: var(--primary-gradient-bg);
  box-shadow: 0 4px 15px var(--primary-glow-subtle);
}

.achievement-item.locked {
  opacity: 0.6;
  background: var(--glass-surface);
  border-color: var(--glass-border);
  cursor: not-allowed;
  pointer-events: none;
}

/* Dark mode support - using centralized theme system */
[data-theme='dark'] .achievement-item {
  background: var(--glass-elevated-dark);
  border-color: var(--glass-border-dark);
  box-shadow: var(--glass-shadow-dark);
}

[data-theme='dark'] .achievement-item:hover {
  box-shadow: var(--glass-shadow-elevated-dark);
  border-color: var(--color-primary);
}

[data-theme='dark'] .achievement-item.available {
  background: var(--primary-gradient-bg-dark);
  box-shadow: 0 4px 15px var(--primary-glow-subtle-dark);
}

[data-theme='dark'] .achievement-item.locked {
  background: var(--glass-surface-dark);
  border-color: var(--glass-border-dark);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .achievement-item {
    background: var(--bg-primary) !important;
    border: 2px solid var(--text-primary) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

  .achievement-item.earned {
    background: var(--color-success) !important;
    border-color: var(--color-success) !important;
    color: white !important;
  }

  .achievement-item.available {
    border-color: var(--color-primary) !important;
    background: var(--bg-secondary) !important;
  }

  .achievement-item.locked {
    background: var(--bg-tertiary) !important;
    border-color: var(--text-secondary) !important;
  }

  [data-theme='dark'] .achievement-item {
    background: var(--bg-primary) !important;
    border-color: var(--text-primary) !important;
  }

  [data-theme='dark'] .achievement-item.earned {
    background: var(--color-success) !important;
  }

  [data-theme='dark'] .achievement-item.available {
    background: var(--bg-secondary) !important;
  }
}

/* Reduced transparency support */
@media (prefers-reduced-transparency: reduce) {
  .achievement-item {
    background: var(--bg-secondary) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

  .achievement-item.earned {
    background: rgba(40, 167, 69, 0.2) !important;
  }

  .achievement-item.available {
    background: rgba(102, 126, 234, 0.1) !important;
  }

  .achievement-item.locked {
    background: var(--bg-tertiary) !important;
  }

  [data-theme='dark'] .achievement-item {
    background: var(--dark-bg-secondary) !important;
  }

  [data-theme='dark'] .achievement-item.earned {
    background: rgba(40, 167, 69, 0.3) !important;
  }

  [data-theme='dark'] .achievement-item.available {
    background: rgba(102, 126, 234, 0.2) !important;
  }

  [data-theme='dark'] .achievement-item.locked {
    background: var(--dark-bg-tertiary) !important;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .achievement-item,
  .achievement-item:hover {
    transition: none !important;
    transform: none !important;
  }
}

.achievement-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-right: var(--spacing-md);
  flex-shrink: 0;
  position: relative;
}

.achievement-item.earned .achievement-icon {
  background: var(--success-gradient);
}

.achievement-glow {
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: var(--success-gradient);
  opacity: 0.3;
  animation: achievementGlow 2s ease-in-out infinite alternate;
}

@keyframes achievementGlow {
  from {
    transform: scale(1);
    opacity: 0.3;
  }
  to {
    transform: scale(1.2);
    opacity: 0.1;
  }
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.achievement-description {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.achievement-xp {
  font-size: 0.75rem;
  color: var(--primary-color);
  font-weight: bold;
}

.achievement-progress {
  margin-top: var(--spacing-sm);
}

.requirement-progress {
  margin-bottom: var(--spacing-xs);
}

.progress-sm {
  height: 4px;
}

.activity-list {
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--bg-tertiary);
}

/* Dark mode activity items */
[data-theme='dark'] .activity-item,
:root:not([data-theme]) .activity-item {
  border-bottom-color: var(--dark-bg-tertiary);
  color: var(--text-primary);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--glass-elevated);
  backdrop-filter: blur(4px) saturate(130%);
  -webkit-backdrop-filter: blur(4px) saturate(130%);
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

/* Dark mode activity icons - using centralized system */
[data-theme='dark'] .activity-icon {
  background: var(--glass-elevated-dark);
  border-color: var(--glass-border-dark);
  box-shadow: var(--glass-shadow-dark);
}

.activity-description {
  font-weight: 500;
  color: var(--text-primary);
}

.activity-xp {
  color: var(--primary-color);
  font-weight: bold;
  font-size: 0.85rem;
}

.level-up-modal {
  background: var(--primary-gradient);
  color: var(--text-on-primary);
  border: none;
}

.level-up-animation {
  animation: levelUpBounce 0.6s ease-out;
}

@keyframes levelUpBounce {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.level-up-icon {
  font-size: 4rem;
  animation: starSpin 1s ease-in-out;
}

@keyframes starSpin {
  from {
    transform: rotate(0deg) scale(0);
  }
  to {
    transform: rotate(360deg) scale(1);
  }
}

/* Enhanced mobile accessibility and WCAG compliance */
@media (max-width: 768px) {
  .achievements-grid {
    /* Responsive grid handled by utility class */
  }

  .challenge-item,
  .achievement-item {
    flex-direction: column;
    text-align: center;
    min-height: calc(var(--minimum-target) * 1.5);
    padding: var(--spacing-md);
  }

  .challenge-content {
    flex-direction: column;
    margin-bottom: var(--spacing-sm);
  }

  .challenge-icon,
  .achievement-icon {
    margin-right: 0;
    margin-bottom: var(--spacing-sm);
    width: 60px;
    height: 60px;
    font-size: 1.8rem;
  }

  .btn.btn-sm {
    min-height: var(--minimum-target);
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }

  .btn.btn-xs {
    min-height: calc(var(--minimum-target) * 0.9);
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
  }

  /* Increase spacing for better touch interaction */
  .challenge-item,
  .achievement-item,
  .activity-item {
    margin-bottom: var(--spacing-md);
  }
}

/* Additional WCAG 2.2 compliance improvements */
.btn,
button,
[role='button'],
[tabindex='0']:not(input):not(textarea) {
  min-height: var(--minimum-target);
  min-width: var(--minimum-target);
}

.badge {
  min-height: calc(var(--minimum-target) * 0.7);
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
}

.cursor-pointer {
  cursor: pointer;
  min-height: var(--minimum-target);
}

.cursor-pointer:hover {
  transform: scale(1.05);
  transition: transform var(--transition-fast);
}

.cursor-pointer:focus-visible {
  outline: var(--focus-ring-size) solid var(--color-focus-ring);
  outline-offset: var(--focus-ring-offset);
}

.activity-item {
  min-height: var(--minimum-target);
  transition: all var(--transition-fast);
}

.activity-item:hover {
  background: rgba(102, 126, 234, 0.03);
  transform: translateX(2px);
}

.activity-item:focus-visible {
  outline: var(--focus-ring-size) solid var(--color-focus-ring);
  outline-offset: var(--focus-ring-offset);
  background: rgba(102, 126, 234, 0.05);
}

[data-theme='dark'] .activity-item:hover,
:root:not([data-theme]) .activity-item:hover {
  background: rgba(102, 126, 234, 0.08);
}

[data-theme='dark'] .activity-item:focus-visible,
:root:not([data-theme]) .activity-item:focus-visible {
  background: rgba(102, 126, 234, 0.1);
}

/* Enhanced contrast for high contrast mode */
@media (prefers-contrast: high) {
  .glass-button,
  .challenge-item,
  .achievement-item,
  .activity-item {
    border-width: 2px !important;
    background: var(--bg-primary) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

  .badge {
    border-width: 2px !important;
    font-weight: bold !important;
  }

  .text-gradient {
    background: none !important;
    color: var(--text-primary) !important;
    font-weight: bold;
  }

  [data-theme='dark'] .text-gradient {
    color: var(--text-primary) !important;
  }
}

/* Comprehensive reduced transparency fallbacks for glassmorphic design */
@media (prefers-reduced-transparency: reduce) {
  .glass-surface,
  .glass-elevated,
  .glass-button,
  .streak-indicator,
  .xp-gain-badge,
  .activity-icon {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

  .glass-surface {
    background: var(--bg-secondary) !important;
  }

  .glass-elevated {
    background: var(--bg-primary) !important;
    border: 2px solid var(--bg-tertiary) !important;
  }

  .glass-button {
    background: var(--bg-secondary) !important;
    border: 1px solid var(--bg-tertiary) !important;
  }

  .streak-indicator {
    background: var(--color-success) !important;
    border: 1px solid var(--color-success) !important;
    color: white !important;
  }

  .xp-gain-badge {
    background: var(--color-success) !important;
    border: 1px solid var(--color-success) !important;
  }

  .activity-icon {
    background: var(--bg-secondary) !important;
    border: 1px solid var(--bg-tertiary) !important;
  }

  /* Dark mode fallbacks for reduced transparency */
  [data-theme='dark'] .glass-surface,
  :root:not([data-theme]) .glass-surface {
    background: var(--dark-bg-secondary) !important;
  }

  [data-theme='dark'] .glass-elevated,
  :root:not([data-theme]) .glass-elevated {
    background: var(--dark-bg-primary) !important;
    border-color: var(--dark-bg-tertiary) !important;
  }

  [data-theme='dark'] .glass-button,
  :root:not([data-theme]) .glass-button {
    background: var(--dark-bg-secondary) !important;
    border-color: var(--dark-bg-tertiary) !important;
  }

  [data-theme='dark'] .activity-icon,
  :root:not([data-theme]) .activity-icon {
    background: var(--dark-bg-secondary) !important;
    border-color: var(--dark-bg-tertiary) !important;
  }
}

/* Dark Theme Support */
[data-theme='dark'] .level-avatar {
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    var(--color-primary-alt) 100%
  );
  box-shadow: 0 8px 32px rgba(144, 180, 255, 0.3);
}

[data-theme='dark'] .level-glow {
  background: radial-gradient(
    circle,
    rgba(144, 180, 255, 0.4) 0%,
    transparent 70%
  );
}

[data-theme='dark'] .xp-gain-badge {
  background: var(--color-warning-dark);
  color: var(--text-primary);
}

[data-theme='dark'] .challenge-item.completed {
  background: rgba(52, 211, 153, 0.1);
  border-color: var(--color-success-dark);
}

[data-theme='dark'] .challenge-item.available {
  background: var(--glass-elevated-dark);
  border-color: var(--glass-border-dark);
}

[data-theme='dark'] .challenge-item.available:hover {
  background: var(--glass-solid-dark);
  border-color: var(--glass-border-accent-dark);
  transform: translateY(-2px);
  box-shadow: var(--glass-shadow-elevated-dark);
}

[data-theme='dark'] .achievement-item .mdi.text-warning {
  color: var(--color-warning-dark) !important;
}

[data-theme='dark'] .achievement-item .mdi.text-muted {
  color: var(--text-tertiary) !important;
}
[data-theme='dark'] .progress.xp-progress .progress-bar {
  background: linear-gradient(
    90deg,
    var(--color-warning) 0%,
    var(--color-warning-dark) 100%
  );
}

[data-theme='dark'] .streak-indicator {
  background: var(--glass-elevated-dark);
  border-color: var(--glass-border-dark);
}

[data-theme='dark'] .gaming-card {
  background: var(--glass-surface-dark);
  border-color: var(--glass-border-dark);
}

[data-theme='dark'] .gaming-card:hover {
  background: var(--glass-elevated-dark);
  border-color: var(--glass-border-accent-dark);
  transform: translateY(-2px);
  box-shadow: var(--glass-shadow-elevated-dark);
}

/* Ensure proper progressive enhancement for glassmorphic effects */
@supports not (backdrop-filter: blur(1px)) {
  .glass-surface {
    background: var(--bg-secondary) !important;
  }

  .glass-elevated {
    background: var(--bg-primary) !important;
    box-shadow: var(--shadow-lg) !important;
  }

  .glass-button {
    background: var(--bg-secondary) !important;
  }

  [data-theme='dark'] .glass-surface,
  :root:not([data-theme]) .glass-surface {
    background: var(--dark-bg-secondary) !important;
  }

  [data-theme='dark'] .glass-elevated,
  :root:not([data-theme]) .glass-elevated {
    background: var(--dark-bg-primary) !important;
    box-shadow: var(--dark-shadow-lg) !important;
  }

  [data-theme='dark'] .glass-button,
  :root:not([data-theme]) .glass-button {
    background: var(--dark-bg-secondary) !important;
  }
}
</style>
