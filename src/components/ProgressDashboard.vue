<template>
  <div class="progress-dashboard font-sans">
    <!-- Compact Progress Grid -->
    <div class="progress-grid">
      <!-- Row 1: Level & XP + Daily Challenges -->
      <div class="progress-flex flex-wrap">
        <div class="level-card compact-card">
          <div class="card-header section-header">
            <div class="icon-badge level-badge">
              <AppIcon name="StarIcon" />
            </div>
            <div class="card-info">
              <h6 class="card-title">Level {{ userLevel || 1 }}</h6>
              <span class="card-subtitle">{{ userXP || 25 }} XP</span>
            </div>
            <div class="level-indicator">
              <span class="level-text">Gaming Professional</span>
            </div>
          </div>
          <div class="card-content">
            <div class="xp-progress">
              <div class="progress progress-sm">
                <div class="progress-bar bg-gradient-primary" :style="{ width: xpProgress + '%' }"></div>
              </div>
              <span class="progress-label">{{ xpNeeded }} XP to Level {{ (userLevel || 1) + 1 }}</span>
            </div>
          </div>
        </div>

        <div class="challenges-card compact-card">
          <div class="card-header section-header">
            <div class="icon-badge challenges-badge">
              <AppIcon name="BoltIcon" />
            </div>
            <div class="card-info">
              <h6 class="card-title">Daily Challenges</h6>
              <span class="card-subtitle">{{ completedChallenges }}/{{ totalChallenges }} completed</span>
            </div>
            <div class="streak-badge">
              <AppIcon name="FireIcon" color="warning" />
              <span class="streak-number">{{ dailyStreak || 1 }}</span>
            </div>
          </div>
          <div class="card-content">
            <div class="challenge-list">
              <div v-for="challenge in challenges.slice(0, 3)" :key="challenge.id" class="challenge-item">
                <span class="challenge-name">{{ challenge.name }}</span>
                <div class="challenge-reward">
                  <span class="xp-badge">{{ challenge.xp }} XP</span>
                  <AppIcon name="CheckCircleIcon" class="text-success-600" />
                </div>
              </div>
            </div>
            <div class="progress-summary">
              <div class="progress progress-sm">
                <div class="progress-bar bg-gradient-success" :style="{ width: challengeProgress + '%' }"></div>
              </div>
              <span class="progress-label">{{ Math.round(challengeProgress) }}% Complete</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 2: Career Readiness + AI Recommendation -->
      <div class="progress-flex flex-wrap">
        <div class="readiness-card compact-card">
          <div class="card-header section-header">
            <div class="icon-badge readiness-badge">
              <AppIcon name="UserIcon-check" />
            </div>
            <div class="card-info">
              <h6 class="card-title">Career Readiness</h6>
              <span class="card-subtitle">{{ careerReadinessPercent }}% Complete</span>
            </div>
          </div>
          <div class="card-content">
            <div class="readiness-visual">
              <div class="circular-progress">
                <svg width="50" height="50">
                  <circle cx="25" cy="25" r="20" stroke="#e5e7eb" stroke-width="3" fill="none" />
                  <circle
                    cx="25" cy="25" r="20" stroke="#22c55e" stroke-width="3" fill="none" 
                    stroke-dasharray="126" 
                    :stroke-dashoffset="126 - (126 * careerReadinessPercent / 100)" 
                    class="progress-circle"
                  />
                </svg>
                <div class="progress-center">
                  <span class="progress-percentage">{{ careerReadinessPercent }}%</span>
                </div>
              </div>
              <div class="readiness-factors">
                <div class="factor">
                  <span class="factor-name">Profile</span>
                  <div class="factor-progress">
                    <div class="progress progress-xs">
                      <div class="progress-bar bg-primary-500" style="width: 75%"></div>
                    </div>
                  </div>
                </div>
                <div class="factor">
                  <span class="factor-name">Skills</span>
                  <div class="factor-progress">
                    <div class="progress progress-xs">
                      <div class="progress-bar bg-warning-500" style="width: 60%"></div>
                    </div>
                  </div>
                </div>
                <div class="factor">
                  <span class="factor-name">Portfolio</span>
                  <div class="factor-progress">
                    <div class="progress progress-xs">
                      <div class="progress-bar bg-success-500" style="width: 80%"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="ai-card compact-card">
          <div class="card-header section-header">
            <div class="icon-badge ai-badge">
              <AppIcon name="CpuChipIcon" />
            </div>
            <div class="card-info">
              <h6 class="card-title">AI Recommendation</h6>
              <span class="card-subtitle">Personalized guidance</span>
            </div>
            <div class="confidence-badge">
              <span class="confidence-text">87% match</span>
            </div>
          </div>
          <div class="card-content">
            <p class="ai-recommendation">{{ aiRecommendation }}</p>
            <div class="ai-actions">
              <UnifiedButton variant="primary" size="sm" leading-icon="PlayIcon" @click="$emit('takeAction')">Take Action</UnifiedButton>
              <span class="ai-powered">
                <AppIcon name="SparklesIcon" />
                Powered by AI
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { CheckCircleIcon, CpuChipIcon, SparklesIcon } from '@heroicons/vue/24/outline'
import { PlayIcon, StarIcon } from '@heroicons/vue/24/solid'

import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
export default {
  name: 'ProgressDashboard',
  components: {
    AppIcon,
    UnifiedButton
  },
  props: {
    userLevel: { type: Number, default: 1 },
    userXP: { type: Number, default: 25 },
    xpNeeded: { type: Number, default: 75 },
    dailyStreak: { type: Number, default: 1 },
    completedChallenges: { type: Number, default: 0 },
    totalChallenges: { type: Number, default: 5 },
    challenges: { type: Array, default: () => [] },
    careerReadinessPercent: { type: Number, default: 25 },
    aiRecommendation: { type: String, default: 'Continue your progress with "Profile Polish" to advance your career development.' }
  },
  emits: ['takeAction'],
  computed: {
    xpProgress() {
      return Math.min(100, ((this.userXP || 25) % 100))
    },
    challengeProgress() {
      return this.totalChallenges > 0 ? (this.completedChallenges / this.totalChallenges) * 100 : 0
    }
  }
}
</script>

<style scoped>
.progress-dashboard {
  width: 100%;
}

.progress-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.progress-flex flex-wrap {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.compact-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all 0.3s ease;
  min-height: 120px;
}

.compact-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.icon-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.level-badge {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.challenges-badge {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.readiness-badge {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
}

.ai-badge {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 2px 0;
  color: #1f2937;
}

.card-subtitle {
  font-size: 12px;
  color: #6b7280;
}

.level-indicator {
  font-size: 10px;
  color: #9ca3af;
}

.streak-badge, .confidence-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #f59e0b;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress {
  height: 4px;
  background: #f3f4f6;
  border-radius: 2px;
  overflow: hidden;
}

.progress-xs {
  height: 2px;
}

.progress-sm {
  height: 4px;
}

.progress-bar {
  transition: width 0.6s ease;
}

.progress-label {
  font-size: 10px;
  color: #6b7280;
  margin-top: 4px;
}

.challenge-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.challenge-item {
  display: flex;
  justify-content: between;
  align-items: center;
  font-size: 11px;
}

.challenge-name {
  flex: 1;
  color: #374151;
  font-weight: 500;
}

.challenge-reward {
  display: flex;
  align-items: center;
  gap: 4px;
}

.xp-badge {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
}

.progress-summary {
  margin-top: auto;
}

.readiness-visual {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.circular-progress {
  position: relative;
  flex-shrink: 0;
}

.progress-circle {
  transition: stroke-dashoffset 0.6s ease;
  transform: rotate(-90deg);
  transform-origin: center;
}

.progress-center {
  position: absolute; /* Use .center-absolute class from design system */
}

.progress-percentage {
  font-size: 11px;
  font-weight: 600;
  color: #1f2937;
}

.readiness-factors {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.factor {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.factor-name {
  font-size: 10px;
  color: #6b7280;
  width: 40px;
  text-align: right;
}

.factor-progress {
  flex: 1;
}

.ai-recommendation {
  font-size: 12px;
  color: #374151;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
  flex: 1;
}

.ai-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ai-powered {
  font-size: 10px;
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 11px;
  border-radius: 6px;
}

/* Dark theme support */
[data-bs-theme="dark"] .compact-card {
  background: rgba(30, 41, 59, 0.95);
  border-color: rgba(71, 85, 105, 0.3);
}

[data-bs-theme="dark"] .card-title {
  color: #f8fafc;
}

[data-bs-theme="dark"] .card-subtitle,
[data-bs-theme="dark"] .progress-label,
[data-bs-theme="dark"] .factor-name {
  color: #94a3b8;
}

[data-bs-theme="dark"] .ai-recommendation,
[data-bs-theme="dark"] .challenge-name {
  color: #e2e8f0;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .progress-flex flex-wrap {
    grid-template-columns: 1fr;
  }
  
  .compact-card {
    min-height: 100px;
    padding: 0.75rem;
  }
  
  .readiness-visual {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .ai-actions {
    flex-direction: column;
    gap: 0.25rem;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .card-header {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .icon-badge {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
}
</style>
