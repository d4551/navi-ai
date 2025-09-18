<template>
  <div class="compact-gamification-dashboard font-sans">
    <!-- Achievements Overview -->
    <div class="unified-grid g-3 mb-4">
      <!-- Level Status -->
      <div class="flex-1-md-6">
        <UnifiedCard
          variant="glass"
          size="medium"
          elevated
          :title="`Level ${userLevel.level}`"
          :subtitle="userLevel.title"
          title-icon="StarIcon-circle"
          icon-color="primary"
        >
          <div class="text-center">
            <div class="level-avatar mb-3" :class="`level-${userLevel.level}`">
              <span class="level-number">{{ userLevel.level }}</span>
            </div>
            <p class="text-secondary small">{{ userLevel.currentXP }} XP</p>
            <div class="progress progress--sm mt-2">
              <div
                class="progress-bar bg-primary-500"
                :style="{ width: userLevel.progress + '%' }"
                role="progressbar"
              />
            </div>
            <small class="text-secondary mt-1 block"
              >{{ userLevel.xpForNext }} XP to next level</small
            >
          </div>
        </UnifiedCard>
      </div>

      <!-- Quick Stats -->
      <div class="flex-1-md-6">
        <div class="unified-card glass-card section-card h-100">
          <div class="card-body section-body">
            <h6 class="card-title mb-3">
              <AppIcon name="ChartBarSquareIcon" class="mr-2" />
              Progress Summary
            </h6>
            <div class="stats-list">
              <div class="stat-flex flex-wrap">
                <span class="stat-label">Achievements</span>
                <span class="stat-value"
                  >{{ earnedAchievements.length }}/{{ totalAchievements }}</span
                >
                <div class="stat-progress">
                  <div class="progress progress--xs">
                    <div
                      class="progress-bar bg-success-500"
                      :style="{
                        width:
                          (earnedAchievements.length / totalAchievements) *
                            100 +
                          '%',
                      }"
                    />
                  </div>
                </div>
              </div>
              <div class="stat-flex flex-wrap">
                <span class="stat-label">Daily Streak</span>
                <span class="stat-value">
                  {{ streak.current }}
                  <AppIcon
                    name="FireIcon"
                    :size="getIconSize('small')"
                    :color="getIconColor('warning')"
                  />
                </span>
              </div>
              <div class="stat-flex flex-wrap">
                <span class="stat-label">Challenges</span>
                <span class="stat-value"
                  >{{ completedChallenges }}/{{ dailyChallenges.length }}</span
                >
                <div class="stat-progress">
                  <div class="progress progress--xs">
                    <div
                      class="progress-bar bg-warning-500"
                      :style="{ width: challengeProgress + '%' }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Daily Challenges -->
    <div class="unified-card glass-card section-card mb-4">
      <div class="card-header section-header">
        <h6 class="card-title mb-0">
          <AppIcon name="CalendarIcon-check" class="mr-2" />
          Daily Challenges
        </h6>
        <UiChip classes="chip chip-primary chip-compact"
          >{{ completedChallenges }}/{{ dailyChallenges.length }}</UiChip
        >
      </div>
      <div class="card-body section-body">
        <div class="challenges-grid">
          <div
            v-for="challenge in dailyChallenges.slice(0, 4)"
            :key="challenge.id"
            class="challenge-item"
            :class="{ completed: challenge.completed }"
          >
            <div class="challenge-icon">
              <AppIcon
                :name="getIcon(challenge.icon, 'CursorArrowRaysIcon')"
                :size="getIconSize('small')"
                :color="
                  challenge.completed ? getIconColor('success') : undefined
                "
              />
              <div v-if="challenge.completed" class="completion-check">
                <AppIcon
                  name="CheckIcon"
                  :size="getIconSize('small')"
                  color="white"
                />
              </div>
            </div>
            <div class="challenge-content">
              <div class="challenge-name">{{ challenge.name }}</div>
              <div class="challenge-xp">+{{ challenge.xp }} XP</div>
            </div>
            <UnifiedButton
              v-if="!challenge.completed"
              size="xs"
              variant="primary"
              @click="$emit('start-challenge', challenge.id)"
            >
              Start
            </UnifiedButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Achievements -->
    <div class="unified-card glass-card section-card">
      <div class="card-header section-header">
        <h6 class="card-title mb-0">
          <AppIcon name="TrophyIcon" class="mr-2" />
          Recent Achievements
        </h6>
        <UnifiedButton
          size="sm"
          variant="ghost"
          @click="$emit('view-all-achievements')"
        >
          View All
        </UnifiedButton>
      </div>
      <div class="card-body section-body">
        <div v-if="recentAchievements.length === 0" class="text-center py-4">
          <AppIcon name="TrophyIcon" />
          <p class="text-secondary mt-2 mb-0">
            Start completing challenges to earn achievements!
          </p>
        </div>
        <div v-else class="achievements-list">
          <div
            v-for="achievement in recentAchievements.slice(0, 3)"
            :key="achievement.id"
            class="achievement-item"
            :class="{ earned: isAchievementEarned(achievement.id) }"
          >
            <div class="achievement-icon">
              <AppIcon
                :name="getIcon(achievement.icon, 'StarIcon')"
                :color="
                  isAchievementEarned(achievement.id)
                    ? getIconColor('success')
                    : undefined
                "
              />
            </div>
            <div class="achievement-info">
              <div class="achievement-name">{{ achievement.name }}</div>
              <div class="achievement-description">
                {{ achievement.description }}
              </div>
              <div class="achievement-xp">+{{ achievement.xp }} XP</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  ChartBarSquareIcon,
  CheckIcon,
  TrophyIcon,
} from '@heroicons/vue/24/outline'
import { TrophyIcon } from '@heroicons/vue/24/solid'

import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import AppIcon from '@/components/ui/AppIcon.vue'
import GamificationService, { ACHIEVEMENTS } from '@/utils/gamification'
import UnifiedCard from '@/components/UnifiedCard.vue'
import { useIconReplacement } from '@/composables/useIconReplacement'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import UiChip from '@/components/ui/UiChip.vue'

export default {
  name: 'CompactGamificationDashboard',
  components: {
    AppIcon,
    UnifiedButton,
    UiChip,
  },
  emits: ['start-challenge', 'view-all-achievements', 'achievement-clicked'],
  setup(props, { emit }) {
    const store = useAppStore()
    const gamificationService = new GamificationService(store)
    const { getIcon, getIconSize, getIconColor } = useIconReplacement()

    // Computed properties
    const userLevel = computed(() => {
      const xp = store.user?.xp || 0
      return gamificationService.getLevelInfo(xp)
    })

    const dailyChallenges = computed(() => {
      return gamificationService.getTodaysChallenges()
    })

    const completedChallenges = computed(() => {
      return dailyChallenges.value.filter(c => c.completed).length
    })

    const challengeProgress = computed(() => {
      return dailyChallenges.value.length > 0
        ? (completedChallenges.value / dailyChallenges.value.length) * 100
        : 0
    })

    const streak = computed(() => {
      return gamificationService.getStreak()
    })

    const allAchievements = computed(() => {
      return Object.values(ACHIEVEMENTS)
    })

    const earnedAchievements = computed(() => {
      return store.user?.achievements || []
    })

    const totalAchievements = computed(() => {
      return allAchievements.value.length
    })

    const recentAchievements = computed(() => {
      return allAchievements.value
        .filter(achievement => {
          const progress = getAchievementProgress(achievement)
          return progress > 0 // Show achievements with any progress
        })
        .sort((a, b) => {
          const aEarned = isAchievementEarned(a.id)
          const bEarned = isAchievementEarned(b.id)
          if (aEarned && !bEarned) return -1
          if (!aEarned && bEarned) return 1
          return getAchievementProgress(b) - getAchievementProgress(a)
        })
        .slice(0, 6)
    })

    // Methods
    const isAchievementEarned = achievementId => {
      return earnedAchievements.value.includes(achievementId)
    }

    const getAchievementProgress = achievement => {
      if (isAchievementEarned(achievement.id)) return 100

      const userStats = gamificationService.getUserStats()
      const requirements = achievement.requirements || {}

      const progressValues = Object.entries(requirements).map(
        ([key, value]) => {
          const current = userStats[key] || 0
          return Math.min((current / value) * 100, 100)
        }
      )

      return progressValues.length > 0
        ? progressValues.reduce((sum, val) => sum + val, 0) /
            progressValues.length
        : 0
    }

    return {
      userLevel,
      dailyChallenges,
      completedChallenges,
      challengeProgress,
      streak,
      allAchievements,
      earnedAchievements,
      totalAchievements,
      recentAchievements,
      isAchievementEarned,
      getAchievementProgress,
      getIcon,
      getIconSize,
      getIconColor,
    }
  },
}
</script>

<style scoped>
.compact-gamification-dashboard {
  max-width: 100%;
}

.level-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    var(--color-primary-500) 0%,
    var(--color-primary-700) 100%
  );
  color: var(--text-on-primary);
  font-weight: var(--font-weight-bold);
  margin: 0 auto;
  position: relative;
  box-shadow: var(--shadow-glass);
}

.level-avatar.level-1,
.level-avatar.level-2 {
  background: linear-gradient(
    135deg,
    var(--color-gray-400) 0%,
    var(--color-gray-600) 100%
  );
}
.level-avatar.level-3,
.level-avatar.level-4 {
  background: linear-gradient(
    135deg,
    var(--color-success-500) 0%,
    var(--color-success-600) 100%
  );
}
.level-avatar.level-5,
.level-avatar.level-6 {
  background: linear-gradient(
    135deg,
    var(--color-primary-400) 0%,
    var(--color-primary-700) 100%
  );
}
.level-avatar.level-7,
.level-avatar.level-8 {
  background: linear-gradient(
    135deg,
    var(--color-warning-500) 0%,
    var(--color-warning-600) 100%
  );
}
.level-avatar.level-9,
.level-avatar.level-10 {
  background: linear-gradient(
    135deg,
    var(--color-primary-500) 0%,
    var(--color-primary-800) 100%
  );
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.stat-flex flex-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-label {
  flex: 1;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.stat-value {
  font-weight: 600;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stat-progress {
  width: 60px;
  margin-left: auto;
}

.challenges-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.challenge-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-3);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-md);
  background: var(--glass-surface);
  transition: all var(--duration-fast) var(--easing-ease-out);
}

.challenge-item:hover {
  background: var(--glass-hover-bg);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.challenge-item.completed {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
}

.challenge-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-right: 0.75rem;
}

.completion-check {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  background: var(--color-success-500);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--surface-base);
}

.challenge-content {
  flex: 1;
}

.challenge-name {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-primary-600);
}

.challenge-xp {
  font-size: 0.75rem;
  color: var(--color-primary-500);
  font-weight: var(--font-weight-semibold);
}

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.achievement-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-3);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-md);
  background: var(--glass-surface);
  transition: all var(--duration-fast) var(--easing-ease-out);
}

.achievement-item:hover {
  background: var(--glass-hover-bg);
  transform: translateY(-1px);
}

.achievement-item.earned {
  background: var(--warning-gradient-bg);
  border-color: var(--color-warning);
}

.achievement-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--glass-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-primary-600);
  margin-bottom: 0.25rem;
}

.achievement-description {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.achievement-xp {
  font-size: 0.75rem;
  color: var(--color-warning-500);
  font-weight: var(--font-weight-semibold);
}

/* Dark theme support */
[data-theme='dark'] .challenge-item,
[data-theme='dark'] .achievement-item {
  background: var(--glass-surface);
  border-color: var(--border-base);
}

[data-theme='dark'] .challenge-item:hover,
[data-theme='dark'] .achievement-item:hover {
  background: var(--glass-hover-bg);
}

[data-theme='dark'] .challenge-icon,
[data-theme='dark'] .achievement-icon {
  background: var(--glass-surface);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .level-avatar {
    width: 50px;
    height: 50px;
  }

  .challenge-item,
  .achievement-item {
    padding: var(--spacing-2);
  }

  .challenge-icon,
  .achievement-icon {
    width: 32px;
    height: 32px;
    margin-right: 0.5rem;
  }
}
</style>
