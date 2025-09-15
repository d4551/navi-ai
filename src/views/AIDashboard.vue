<template>
  <StandardPageLayout
    title="AI-Powered Gaming Career Dashboard"
    subtitle="Your intelligent command center for conquering the gaming industry"
    title-icon="mdi-view-dashboard"
    page-type="gaming"
    content-spacing="normal"
    max-width="xl"
    class="font-sans "
  >
    <template #header-actions>
      <HeaderActions layout="horizontal" alignment="end" gap="md" priority="primary">
        <AIButton
          action="career_insights"
          variant="gaming"
          text="AI Career Coach"
          icon="mdi-robot-happy"
          :context="{ profile: userProfile, goals: careerGoals }"
          @success="handleCareerInsights"
        />
        <UnifiedButton
          variant="glass"
          leading-icon="PuzzlePieceIcon"
          tooltip="Gaming Mode"
          @click="toggleGamingMode"
        >
          Gaming Mode
        </UnifiedButton>
        <UnifiedButton
          variant="primary"
          leading-icon="RocketLaunchIcon-launch"
          tooltip="Quick Apply"
          @click="openQuickApply"
        >
          Quick Apply
        </UnifiedButton>
      </HeaderActions>
    </template>

    <div class="dashboard-container">
      <!-- Gamification HUD -->
      <section class="gamification-section mb-6">
        <UnifiedCard variant="gaming" class="gamification-hud">
          <div class="hud-content">
            <div class="player-stats">
              <div class="avatar-section">
                <div class="player-avatar">
                  <AppIcon name="UserIcon-circle" size="xl" />
                  <div class="level-badge">{{ userLevel }}</div>
                </div>
                <div class="player-info">
                  <h3 class="player-name">{{ playerName }}</h3>
                  <p class="player-title">{{ playerTitle }}</p>
                </div>
              </div>

              <div class="progress-section">
                <div class="xp-bar-container">
                  <div class="flex justify-space-between items-center mb-2">
                    <span class="text-caption">Level {{ userLevel }}</span>
                    <span class="text-caption">{{ currentXP }} / {{ nextLevelXP }} XP</span>
                  </div>
                  <v-progress-linear
                    :model-value="xpProgress"
                    color="primary"
                    height="12"
                    rounded
                    striped
                    animated
                  />
                </div>

                <div class="stats-grid mt-4">
                  <div class="stat-item">
                    <div class="stat-icon">
                      <AppIcon name="EyeIcon" />
                    </div>
                    <div class="stat-info">
                      <div class="stat-value">{{ jobApplications }}</div>
                      <div class="stat-icon">
                        <AppIcon name="DocumentIcon" />
                      </div>
                      <div class="stat-info">
                        <div class="stat-value">{{ resumeScore }}%</div>
                        <div class="stat-label">Resume Score</div>
                      </div>
                    </div>
                  
                    <div class="stat-item">
                      <div class="stat-icon">
                        <AppIcon name="MicrophoneIcon" />
                      </div>
                      <div class="stat-info">
                        <div class="stat-value">{{ interviewsCompleted }}</div>
                        <div class="stat-label">Mock Interviews</div>
                      </div>
                    </div>
                  
                    <div class="stat-item">
                      <div class="stat-icon">
                        <AppIcon name="TrophyIcon" />
                      </div>
                      <div class="stat-info">
                        <div class="stat-value">{{ achievements.length }}</div>
                        <div class="stat-label">Achievements</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Daily Mission -->
              <div class="daily-mission">
                <h4 class="mission-title flex items-center gap-glass-sm">
                  <AppIcon name="CalendarIcon-star" />
                  Daily Mission
                </h4>
                <div class="mission-content">
                  <div class="mission-description">{{ dailyMission.description }}</div>
                  <div class="mission-progress">
                    <v-progress-linear
                      :model-value="(dailyMission.current / dailyMission.target) * 100"
                      color="warning"
                      height="8"
                      rounded
                    />
                    <span class="progress-text">{{ dailyMission.current }}/{{ dailyMission.target }}</span>
                  </div>
                  <div class="mission-reward flex items-center ga-1">
                    <AppIcon name="StarIcon" size="small" />
                    <span>{{ dailyMission.reward }} XP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </UnifiedCard>
      </section>

      <!-- Quick Actions -->
      <section class="quick-actions-section mb-6">
        <div class="section-header mb-4">
          <h2 class="section-title">Quick Launch</h2>
          <p class="section-subtitle">Jump into your gaming career tools</p>
        </div>
        
        <div class="quick-actions-grid">
          <UnifiedCard
            v-for="action in quickActions"
            :key="action.id"
            :variant="action.variant || 'glass'"
            class="action-card"
            clickable
            @click="navigateTo(action.route)"
          >
            <div class="action-content">
              <div class="action-header">
                <div class="action-icon-wrapper" :class="`bg-${action.color}`">
                  <AppIcon :name="action.icon" class="action-icon" />
                </div>
                <div v-if="action.badge" class="action-badge">
                  <UiChip :label="action.badge" variant="primary" size="xs" />
                </div>
              </div>
              <div class="action-text">
                <h3 class="action-title">{{ action.title }}</h3>
                <p class="action-description">{{ action.description }}</p>
              </div>
              <div v-if="action.status" class="action-footer">
                <div class="action-status flex items-center ga-1">
                  <AppIcon :name="action.statusIcon" size="small" />
                  <span>{{ action.status }}</span>
                </div>
              </div>
            </div>
          </UnifiedCard>
        </div>
      </section>

      <!-- Live Job Feed -->
      <section class="job-feed-section mb-6">
        <div class="section-header mb-4 flex items-center justify-space-between">
          <div>
            <h2 class="section-title">Latest Gaming Opportunities</h2>
            <p class="section-subtitle">{{ liveJobsCount }} new jobs matching your profile</p>
          </div>
          <div class="section-actions flex gap-glass-sm">
            <AIButton
              action="analyze_job_market"
              variant="outline"
              text="Market Analysis"
              icon="ChartBarIcon"
              :context="{ profile: userProfile, location: 'Remote' }"
              @success="handleMarketAnalysis"
            />
            <UnifiedButton
              variant="primary"
              leading-icon="MagnifyingGlassIcon"
              @click="navigateTo('/jobs')"
            >
              Browse All Jobs
            </UnifiedButton>
          </div>
        </div>

        <div class="job-feed-grid">
          <UnifiedCard
            v-for="job in liveJobs"
            :key="job.id"
            variant="glass"
            class="job-card"
            clickable
            @click="viewJobDetails(job)"
          >
            <div class="job-content">
              <div class="job-header flex items-center justify-space-between mb-3">
                <div class="company-info flex items-center gap-glass-sm">
                  <div class="company-logo">
                    <AppIcon :name="job.companyIcon || 'mdi-domain'" />
                  </div>
                  <div>
                    <div class="company-name">{{ job.company }}</div>
                    <div class="job-location text-caption">{{ job.location }}</div>
                  </div>
                </div>
                
                <div class="job-meta">
                  <UiChip :label="job.type" variant="secondary" size="sm" />
                  <div class="match-score" :class="getMatchScoreClass(job.matchScore)">
                    {{ job.matchScore }}% match
                  </div>
                </div>
              </div>

              <div class="job-details">
                <h4 class="job-title">{{ job.title }}</h4>
                <p class="job-summary">{{ job.summary }}</p>
                
                <div class="job-technologies mt-3">
                  <UiChip
                    v-for="tech in job.technologies?.slice(0, 4)"
                    :key="tech"
                    :label="tech"
                    variant="primary"
                    size="xs"
                  />
                  <span v-if="job.technologies?.length > 4" class="text-caption">
                    +{{ job.technologies.length - 4 }} more
                  </span>
                </div>
              </div>

              <div class="job-footer mt-4 flex items-center justify-space-between">
                <div v-if="job.salary" class="salary-range">
                  <AppIcon name="mdi-currency-usd" size="small" />
                  <span>{{ job.salary }}</span>
                </div>
                <div class="posted-time text-caption text-medium-emphasis">
                  Posted {{ job.postedTime }}
                </div>
              </div>
            </div>
          </UnifiedCard>

          <!-- View More Card -->
          <UnifiedCard variant="outline" class="view-more-card" clickable @click="navigateTo('/jobs')">
            <div class="view-more-content text-center">
              <AppIcon name="PlusCircleIcon" size="xl" color="primary" />
              <h4 class="mt-2">View More Jobs</h4>
              <p class="text-body-2 text-medium-emphasis">
                {{ totalJobsCount - liveJobs.length }}+ more opportunities waiting
              </p>
            </div>
          </UnifiedCard>
        </div>
      </section>

      <!-- Career Insights -->
      <section class="insights-section">
        <div class="section-header mb-4">
          <h2 class="section-title">AI Career Insights</h2>
          <p class="section-subtitle">Personalized recommendations to boost your career</p>
        </div>

        <v-flex flex-wrap>
          <v-flex-1 cols="12" md="8">
            <UnifiedCard variant="glass" class="insights-card">
              <div class="insights-content">
                <div class="insight-header mb-4">
                  <AppIcon name="CpuChipIcon" color="primary" class="mr-2" />
                  <h3 class="text-lg font-semibold">Weekly Career Report</h3>
                </div>

                <div class="insight-items">
                  <div
                    v-for="insight in careerInsights"
                    :key="insight.id"
                    class="insight-item mb-3"
                  >
                    <div class="insight-icon-wrapper" :class="`bg-${insight.type}`">
                      <AppIcon :name="insight.icon" size="small" />
                    </div>
                    <div class="insight-content">
                      <h5 class="insight-title">{{ insight.title }}</h5>
                      <p class="insight-description">{{ insight.description }}</p>
                      <UnifiedButton
                        v-if="insight.action"
                        variant="text"
                        size="sm"
                        :text="insight.action.text"
                        @click="executeInsightAction(insight.action)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </UnifiedCard>
          </v-flex-1>

          <v-flex-1 cols="12" md="4">
            <UnifiedCard variant="glass" class="skills-radar-card">
              <div class="skills-header mb-4">
                <h3 class="text-lg font-semibold">Skill Assessment</h3>
                <AIButton
                  action="analyze_skills"
                  variant="ghost"
                  text="AI Analysis"
                  size="sm"
                  :context="{ skills: userSkills }"
                  @success="handleSkillsAnalysis"
                />
              </div>

              <div class="skills-list">
                <div
                  v-for="skill in topSkills"
                  :key="skill.name"
                  class="skill-item flex items-center justify-space-between mb-2"
                >
                  <div class="skill-info">
                    <span class="skill-name">{{ skill.name }}</span>
                    <div class="skill-trend" :class="skill.trend">
                      <AppIcon :name="getTrendIcon(skill.trend)" size="xs" />
                      <span class="trend-text">{{ skill.trendText }}</span>
                    </div>
                  </div>
                  <div class="skill-level">
                    <v-progress-circular
                      :model-value="skill.level"
                      :color="getSkillColor(skill.level)"
                      size="32"
                      width="4"
                    >
                      <span class="text-caption">{{ skill.level }}</span>
                    </v-progress-circular>
                  </div>
                </div>
              </div>

              <div class="skills-footer mt-4">
                <UnifiedButton
                  variant="primary"
                  block
                  @click="navigateTo('/skills')"
                >
                  Skill Development Plan
                </UnifiedButton>
              </div>
            </UnifiedCard>
          </v-flex-1>
        </v-flex flex-wrap>
      </section>
    </div>

    <!-- AI Modal Integration -->
    <AIModalSystem
      context-type="profile"
      context-id="dashboard"
      :target-job="{ title: 'Game Developer', type: 'Full-time' }"
    />
  </StandardPageLayout>
</template>

<script setup lang="ts">
import { ChartBarIcon, CpuChipIcon, DocumentIcon, EyeIcon, MagnifyingGlassIcon, MicrophoneIcon, PlusCircleIcon, PuzzlePieceIcon } from '@heroicons/vue/24/outline'
import { StarIcon, TrophyIcon } from '@heroicons/vue/24/solid'

import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import StandardPageLayout from '@/components/layout/StandardPageLayout.vue';
import HeaderActions from '@/components/ui/HeaderActions.vue';
import UnifiedButton from '@/components/ui/UnifiedButton.vue';
import UnifiedCard from '@/components/ui/StandardCard.vue';
import AppIcon from '@/components/ui/AppIcon.vue';
import UiChip from '@/components/ui/UiChip.vue';
import AIButton from '@/components/ai/AIButton.vue';
import AIModalSystem from '@/components/ai/AIModalSystem.vue';
import { logger } from '@/shared/utils/logger';

const _router = useRouter();

// User gamification data
const playerName = ref('Alex Developer');
const playerTitle = ref('Aspiring Game Developer');
const userLevel = ref(8);
const currentXP = ref(1250);
const nextLevelXP = ref(1500);
const jobApplications = ref(12);
const resumeScore = ref(85);
const interviewsCompleted = ref(5);

// Search
const _searchQuery = ref('');

// Computed properties
const xpProgress = computed(() => (currentXP.value / nextLevelXP.value) * 100);

// User profile data
const userProfile = ref({
  name: playerName.value,
  role: 'Game Developer',
  experience: 'Mid-level',
  skills: ['Unity', 'C#', 'JavaScript', 'Game Design'],
  interests: ['Indie Games', 'Mobile Development', 'VR']
});

const careerGoals = ref(['Land first game dev job', 'Master Unity', 'Build portfolio']);

// Daily mission
const dailyMission = ref({
  description: 'Apply to 3 game development positions',
  current: 1,
  target: 3,
  reward: 150
});

// Quick actions
const quickActions = ref([
  {
    id: 'resume',
    title: 'Resume Builder',
    description: 'Create ATS-optimized gaming industry resume',
    icon: 'DocumentIcon-document-edit',
    route: '/resume-builder',
    color: 'primary',
    variant: 'glass',
    badge: 'AI-Powered',
    status: '85% Complete',
    statusIcon: 'CheckIcon-circle'
  },
  {
    id: 'jobs',
    title: 'Job Search',
    description: 'Find gaming opportunities with AI matching',
    icon: 'mdi-magnify',
    route: '/jobs',
    color: 'success',
    variant: 'glass',
    badge: '12 New',
    status: 'Ready to Apply',
    statusIcon: 'RocketLaunchIcon'
  },
  {
    id: 'interview',
    title: 'Interview Prep',
    description: 'Practice with AI-powered mock interviews',
    icon: 'MicrophoneIcon-variant',
    route: '/interview-prep',
    color: 'warning',
    variant: 'glass',
    status: 'Level Up Skills',
    statusIcon: 'mdi-trending-up'
  },
  {
    id: 'portfolio',
    title: 'Portfolio',
    description: 'Showcase your gaming projects and achievements',
    icon: 'mdi-briefcase-variant',
    route: '/portfolio',
    color: 'info',
    variant: 'glass',
    status: '3 Projects',
    statusIcon: 'StarIcon'
  },
  {
    id: 'cover-letter',
    title: 'Cover Letters',
    description: 'AI-generated personalized cover letters',
    icon: 'mdi-email-edit',
    route: '/cover-letter',
    color: 'secondary',
    variant: 'glass',
    badge: 'Smart AI',
    status: 'Draft Ready',
    statusIcon: 'mdi-pen'
  },
  {
    id: 'skills',
    title: 'Skill Mapper',
    description: 'Identify and develop key gaming skills',
    icon: 'mdi-brain',
    route: '/skills',
    color: 'purple',
    variant: 'glass',
    status: 'Growth Path',
    statusIcon: 'ChartBarIcon-line'
  }
]);

// Live jobs data
const liveJobs = ref([
  {
    id: '1',
    title: 'Unity Game Developer',
    company: 'Indie Studios Inc.',
    location: 'Remote',
    type: 'Full-time',
    salary: '$70k - $90k',
    summary: 'Join our team to create innovative mobile games using Unity and C#...',
    technologies: ['Unity', 'C#', 'Mobile', 'Git', 'Agile'],
    matchScore: 89,
    postedTime: '2 hours ago',
    companyIcon: 'DevicePhoneMobileIcon-variant'
  },
  {
    id: '2',
    title: 'Frontend Developer - Gaming Platform',
    company: 'GameTech Solutions',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$80k - $110k',
    summary: 'Build cutting-edge web applications for our gaming platform...',
    technologies: ['React', 'TypeScript', 'WebGL', 'Node.js'],
    matchScore: 76,
    postedTime: '5 hours ago',
    companyIcon: 'mdi-web'
  },
  {
    id: '3',
    title: 'Game Design Intern',
    company: 'Pixel Perfect Games',
    location: 'Remote',
    type: 'Internship',
    salary: '$25/hour',
    summary: 'Learn game design fundamentals while working on real projects...',
    technologies: ['Game Design', 'Figma', 'Unity', 'Analytics'],
    matchScore: 62,
    postedTime: '1 day ago',
    companyIcon: 'SwatchIcon'
  }
]);

const liveJobsCount = computed(() => liveJobs.value.length);
const totalJobsCount = ref(47);

// Achievements
const achievements = ref([
  { id: 'first_app', title: 'First Application', unlocked: true },
  { id: 'resume_complete', title: 'Resume Master', unlocked: true },
  { id: 'interview_ace', title: 'Interview Ace', unlocked: false }
]);

// Career insights
const careerInsights = ref([
  {
    id: 'skill_gap',
    type: 'warning',
    icon: 'mdi-alert-circle',
    title: 'Skill Gap Identified',
    description: 'Consider learning Unreal Engine to increase your job match rate by 23%',
    action: { text: 'Start Learning', route: '/skills/unreal-engine' }
  },
  {
    id: 'market_trend',
    type: 'info',
    icon: 'mdi-trending-up',
    title: 'Market Opportunity',
    description: 'VR game development roles increased by 45% this month in your area',
    action: { text: 'Explore VR Jobs', route: '/jobs?filter=vr' }
  },
  {
    id: 'resume_boost',
    type: 'success',
    icon: 'RocketLaunchIcon',
    title: 'Resume Optimization',
    description: 'Your resume score improved by 15 points after recent AI suggestions',
    action: { text: 'View Changes', route: '/resume-builder' }
  }
]);

// Skills data
const userSkills = ref(['Unity', 'C#', 'JavaScript', 'Game Design', 'Mobile Dev']);

const topSkills = ref([
  {
    name: 'Unity',
    level: 85,
    trend: 'up',
    trendText: '+5 this week'
  },
  {
    name: 'C# Programming',
    level: 78,
    trend: 'up',
    trendText: '+3 this week'
  },
  {
    name: 'Game Design',
    level: 65,
    trend: 'stable',
    trendText: 'Stable'
  },
  {
    name: 'Mobile Development',
    level: 58,
    trend: 'down',
    trendText: 'Needs focus'
  }
]);

// Methods
const navigateTo = (route: string) => {
  router.push(route);
};

const _performSearch = (query: string) => {
  logger.info('Searching for:', query);
  router.push(`/search?q=${encodeURIComponent(query)}`);
};

const _toggleVoiceCommands = () => {
  logger.info('Voice commands toggled');
};

const toggleGamingMode = () => {
  logger.info('Gaming mode toggled');
  // Toggle gaming UI mode
};

const openQuickApply = () => {
  logger.info('Quick apply opened');
  router.push('/apply');
};

const viewJobDetails = (job: any) => {
  router.push(`/jobs/${job.id}`);
};

const getMatchScoreClass = (score: number) => {
  if (score >= 80) return 'match-excellent';
  if (score >= 60) return 'match-good';
  return 'match-fair';
};

const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
  const icons = {
    up: 'mdi-trending-up',
    down: 'mdi-trending-down',
    stable: 'mdi-trending-neutral'
  };
  return icons[trend];
};

const getSkillColor = (level: number) => {
  if (level >= 80) return 'success';
  if (level >= 60) return 'primary';
  return 'warning';
};

const executeInsightAction = (action: any) => {
  if (action.route) {
    navigateTo(action.route);
  }
};

const handleCareerInsights = (insights: any) => {
  logger.info('Career insights received:', insights);
};

const handleMarketAnalysis = (analysis: any) => {
  logger.info('Market analysis received:', analysis);
};

const handleSkillsAnalysis = (analysis: any) => {
  logger.info('Skills analysis received:', analysis);
};

onMounted(() => {
  logger.info('Enhanced Dashboard mounted - Loading user data');
});
</script>

<style scoped>
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* Gamification HUD */
.gamification-hud {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.1), rgba(var(--v-theme-secondary), 0.1));
  border: 1px solid rgba(var(--v-theme-primary), 0.3);
}

.hud-content {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  align-items: center;
}

.player-stats {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.player-avatar {
  position: relative;
}

.level-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  border: 2px solid rgb(var(--v-theme-surface));
}

.player-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.player-title {
  color: rgb(var(--v-theme-primary));
  margin: 0;
}

.progress-section {
  min-width: 300px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: rgba(var(--v-theme-surface-variant), 0.3);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(var(--v-theme-primary), 0.2);
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

.stat-label {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface-variant));
}

.daily-mission {
  background: rgba(var(--v-theme-warning), 0.1);
  border: 1px solid rgba(var(--v-theme-warning), 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  min-width: 280px;
}

.mission-title {
  color: rgb(var(--v-theme-warning));
  font-weight: 600;
  margin-bottom: 1rem;
}

.mission-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mission-description {
  font-weight: 500;
}

.mission-progress {
  position: relative;
}

.progress-text {
  position: absolute;
  right: 0;
  top: -1.5rem;
  font-size: 0.75rem;
  color: rgb(var(--v-theme-warning));
}

.mission-reward {
  color: rgb(var(--v-theme-warning));
  font-weight: 600;
}

/* Rest of styles remain the same as previous implementation */
/* (All the styles from the previous comprehensive dashboard component) */

/* Responsive design */
@media (max-width: 1200px) {
  .hud-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .header-search {
    width: 100%;
  }

  .quick-actions-grid {
    grid-template-columns: 1fr;
  }

  .player-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .daily-mission {
    min-width: auto;
  }
}
</style>
