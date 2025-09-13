<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div
    class="card glass-card section-card h-100"
    role="complementary"
    aria-labelledby="usage-stats-title"
  >
    <div class="card-header section-header card-header--dense">
      <h6 id="usage-stats-title" class="mb-0">
        <BarChartIconComponent class="me-2 icon-sm" />Usage Statistics
      </h6>
    </div>
    <div class="card-body section-body card-body--dense">
      <div class="stats-grid">
        <!-- Sessions Today -->
        <div class="stat-item">
          <div class="stat-icon">
            <CalendarIconComponent />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.sessionsToday }}</div>
            <div class="stat-label">Sessions Today</div>
          </div>
        </div>

        <!-- Total Sessions -->
        <div class="stat-item">
          <div class="stat-icon">
            <ActivityIconComponent />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalSessions }}</div>
            <div class="stat-label">Total Sessions</div>
          </div>
        </div>

        <!-- Messages Sent -->
        <div class="stat-item">
          <div class="stat-icon">
            <MessageSquareIconComponent />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.messagesSent }}</div>
            <div class="stat-label">Messages Sent</div>
          </div>
        </div>

        <!-- AI Responses -->
        <div class="stat-item">
          <div class="stat-icon">
            <BotIconComponent />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.aiResponses }}</div>
            <div class="stat-label">AI Responses</div>
          </div>
        </div>

        <!-- Interview Hours -->
        <div class="stat-item">
          <div class="stat-icon">
            <ClockIconComponent />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.interviewHours }}</div>
            <div class="stat-label">Interview Hours</div>
          </div>
        </div>

        <!-- Portfolio Items -->
        <div class="stat-item">
          <div class="stat-icon">
            <BriefcaseIconComponent />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.portfolioItems }}</div>
            <div class="stat-label">Portfolio Items</div>
          </div>
        </div>
      </div>

      <!-- Progress Indicators -->
      <div class="mt-4">
        <div class="progress-item mb-3">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="progress-label">Profile Completion</span>
            <span class="progress-value">{{ stats.profileCompletion }}%</span>
          </div>
          <div class="progress progress--md">
            <div
              class="progress-bar progress-bar--var"
              role="progressbar"
              :style="{ '--progress-width': stats.profileCompletion + '%' }"
              :aria-valuenow="stats.profileCompletion"
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
        </div>

        <div class="progress-item mb-3">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="progress-label">Skills Assessment</span>
            <span class="progress-value">{{ stats.skillsAssessment }}%</span>
          </div>
          <div class="progress progress--md">
            <div
              class="progress-bar bg-info progress-bar--var"
              role="progressbar"
              :style="{ '--progress-width': stats.skillsAssessment + '%' }"
              :aria-valuenow="stats.skillsAssessment"
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
        </div>

        <div class="progress-item">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="progress-label">Interview Readiness</span>
            <span class="progress-value">{{ stats.interviewReadiness }}%</span>
          </div>
          <div class="progress progress--md">
            <div
              class="progress-bar bg-success progress-bar--var"
              role="progressbar"
              :style="{ '--progress-width': stats.interviewReadiness + '%' }"
              :aria-valuenow="stats.interviewReadiness"
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mt-4 pt-3 border-top">
        <div class="d-grid gap-2">
          <UnifiedButton
            type="button"
            variant="outline"
            size="sm"
            leading-icon="mdi-chart-bar"
            @click="$emit('view-detailed-stats')"
          >
            View Detailed Stats
          </UnifiedButton>
          <UnifiedButton
            type="button"
            variant="ghost"
            size="sm"
            leading-icon="mdi-rotate-ccw"
            @click="$emit('reset-stats')"
          >
            Reset Statistics
          </UnifiedButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  BarChartIconComponent,
  CalendarIconComponent,
  ActivityIconComponent,
  MessageSquareIconComponent,
  BotIconComponent,
  ClockIconComponent,
  BriefcaseIconComponent,
  RotateCcwIconComponent,
} from "./SettingsIcons.js";

export default {
  name: "UsageStatisticsCard",
  components: {
    BarChartIconComponent,
    CalendarIconComponent,
    ActivityIconComponent,
    MessageSquareIconComponent,
    BotIconComponent,
    ClockIconComponent,
    BriefcaseIconComponent,
    RotateCcwIconComponent,
    UnifiedButton: () => import("@/components/ui/UnifiedButton.vue"),
  },
  props: {
    stats: {
      type: Object,
      required: true,
      default: () => ({
        sessionsToday: 0,
        totalSessions: 0,
        messagesSent: 0,
        aiResponses: 0,
        interviewHours: 0,
        portfolioItems: 0,
        profileCompletion: 0,
        skillsAssessment: 0,
        interviewReadiness: 0,
      }),
    },
  },
  emits: ["view-detailed-stats", "reset-stats"],
};
</script>

<style scoped>
.progress--md {
  height: 8px;
}
.progress-bar--var {
  width: var(--progress-width);
}
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.stat-item:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.stat-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-bg);
  border-radius: 8px;
  color: var(--primary-color);
  margin-right: 0.75rem;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.125rem;
}

.progress-item {
  margin-bottom: 1rem;
}

.progress-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.progress-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
}
</style>
