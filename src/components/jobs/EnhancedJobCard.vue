<template>
  <article
    class="enhanced-job-card glass-card"
    :class="{ 'top-match': isTopMatch, 'has-insights': hasAIInsights }"
    tabindex="0"
    role="article"
    @click="$emit('select', job)"
    @keydown.enter="$emit('select', job)"
    @keydown.space.prevent="$emit('select', job)"
  >
    <!-- Top Match Ribbon -->
    <div v-if="isTopMatch" class="top-match-ribbon">TOP MATCH</div>

    <!-- Main Content -->
    <div class="job-card-content">
      <!-- Header Section -->
      <header class="job-header">
        <!-- Badge Row -->
        <div class="badge-row">
          <div class="time-badge">
            <AppIcon name="mdi-fire" />
            <span>{{ timeText }} • {{ timeBadgeText }}</span>
          </div>
          <div
            v-if="job.matchScore !== undefined"
            class="match-score"
            :style="{ '--match': job.matchScore }"
            :title="`${Math.round(job.matchScore)}% match`"
          >
            <div class="match-score-inner">
              <span class="match-percentage">{{ Math.round(job.matchScore) }}%</span>
              <span class="match-label">Match</span>
            </div>
          </div>
        </div>

        <!-- Main Header Content -->
        <div class="header-content">
          <div
            class="company-logo"
            :style="{ backgroundColor: companyColorHex }"
          >
            <img
              v-if="job.company?.logo"
              :src="job.company.logo"
              :alt="`${companyName} logo`"
            />
            <span v-else class="logo-text">{{ companyInitial }}</span>
          </div>

          <div class="job-info">
            <h3 class="job-title">{{ job.title }}</h3>
            <div class="company-line">
              <span class="company-name">{{ companyName }}</span>
              <div v-if="job.company?.verified" class="verified-badge">
                <AppIcon name="mdi-check-circle" />
                Verified
              </div>
            </div>
            <div class="location-line">
              <AppIcon name="mdi-map-marker" />
              <span>{{ locationText }}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="header-actions">
          <UnifiedButton
            variant="primary"
            size="sm"
            :disabled="isApplying"
            :loading="isApplying"
            leading-icon="mdi-send"
            @click.stop="handleApply"
          >
            {{ isApplying ? "Applying..." : "Apply Now" }}
          </UnifiedButton>
          <button
            class="btn-icon control-btn"
            :class="{ saved: isSaved }"
            :title="isSaved ? 'Saved' : 'Save job'"
            @click.stop="handleSave"
          >
            <AppIcon
              :name="isSaved ? 'mdi-bookmark' : 'mdi-bookmark-outline'"
            />
          </button>
          <button
            class="btn-icon control-btn"
            title="View details"
            @click.stop="$emit('view-details', job)"
          >
            <AppIcon name="mdi-eye" />
          </button>
        </div>
      </header>

      <!-- Metrics Section -->
      <div v-if="showMetrics" class="job-metrics">
        <div class="metric-item">
          <div class="metric-icon">
            <AppIcon name="mdi-briefcase" />
          </div>
          <div class="metric-details">
            <span class="metric-label">Type</span>
            <span class="metric-value">{{ formatJobType(job.type) }}</span>
          </div>
        </div>
        <div v-if="job.salary" class="metric-item">
          <div class="metric-icon">
            <AppIcon name="mdi-currency-usd" />
          </div>
          <div class="metric-details">
            <span class="metric-label">Salary</span>
            <span class="metric-value">{{ formatSalary(job.salary) }}</span>
          </div>
        </div>
        <div v-if="job.duration" class="metric-item">
          <div class="metric-icon">
            <AppIcon name="mdi-calendar-range" />
          </div>
          <div class="metric-details">
            <span class="metric-label">Duration</span>
            <span class="metric-value">{{ job.duration }}</span>
          </div>
        </div>
        <div v-if="job.applicants" class="metric-item">
          <div class="metric-icon">
            <AppIcon name="mdi-account-group" />
          </div>
          <div class="metric-details">
            <span class="metric-label">Applicants</span>
            <span class="metric-value">{{ job.applicants }} applied</span>
          </div>
        </div>
      </div>

      <!-- Description Section -->
      <div class="job-description">
        <p
          class="description-text"
          :class="{ 'description-expanded': isDescriptionExpanded }"
        >
          {{ job.description || job.summary || "No description available." }}
        </p>
        <button
          v-if="shouldShowReadMore"
          class="read-more"
          @click.stop="toggleDescription"
        >
          {{ isDescriptionExpanded ? "Show less ←" : "Read more →" }}
        </button>
      </div>

      <!-- Skills Section -->
      <div v-if="displaySkills.length > 0" class="skills-section">
        <span
          v-for="skill in displaySkills"
          :key="skill"
          class="skill-tag"
          :class="getSkillClass(skill)"
        >
          {{ skill }}
        </span>
      </div>

      <!-- AI Insights Panel -->
      <div
        v-if="hasAIInsights"
        class="ai-insights"
        :class="{ 'insights-expanded': isInsightsExpanded }"
      >
        <header class="insights-header" @click.stop="toggleInsights">
          <div class="insights-title">
            <AppIcon name="mdi-brain" />
            AI Career Insights
          </div>
          <div class="insights-controls">
            <span class="insights-badge">{{ aiInsights.length }} insights</span>
            <AppIcon
              name="mdi-chevron-down"
              class="expand-icon"
              :class="{ expanded: isInsightsExpanded }"
            />
          </div>
        </header>
        <div class="insights-content">
          <div class="insight-items">
            <div
              v-for="(insight, index) in aiInsights"
              :key="index"
              class="insight-item"
            >
              <div class="insight-icon" :style="{ color: insight.color }">
                {{ insight.icon }}
              </div>
              <span class="insight-text">{{ insight.text }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="job-footer">
      <div class="source-info">
        <AppIcon name="mdi-source-branch" />
        via {{ job.source || "Direct" }}
        <span v-if="job.company?.ats">({{ job.company.ats }})</span>
      </div>
      <div class="footer-actions">
        <button
          class="footer-btn control-btn"
          title="Add to compare"
          @click.stop="$emit('add-to-compare', job)"
        >
          <AppIcon name="mdi-compare" />
        </button>
        <button
          class="footer-btn control-btn"
          title="Share"
          @click.stop="$emit('share', job)"
        >
          <AppIcon name="mdi-share-variant" />
        </button>
        <button
          class="footer-btn control-btn"
          title="Report"
          @click.stop="$emit('report', job)"
        >
          <AppIcon name="mdi-flag-outline" />
        </button>
      </div>
    </footer>
  </article>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

import { ref, computed, watch } from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";

const _props = defineProps({
  job: {
    type: Object,
    required: true,
  },
  showMetrics: {
    type: Boolean,
    default: true,
  },
  maxSkills: {
    type: Number,
    default: 6,
  },
  aiInsights: {
    type: Array,
    default: () => [],
  },
});

const _emit = defineEmits([
  "select",
  "apply",
  "save",
  "view-details",
  "add-to-compare",
  "share",
  "report",
]);

// State
const isSaved = ref(false);
const isApplying = ref(false);
const isDescriptionExpanded = ref(false);
const isInsightsExpanded = ref(false);

// Computed
const isTopMatch = computed(
  () => props.job.matchScore !== undefined && props.job.matchScore >= 85,
);

const hasAIInsights = computed(
  () => props.aiInsights && props.aiInsights.length > 0,
);

const companyName = computed(() =>
  typeof props.job.company === "object"
    ? props.job.company.name
    : props.job.company || "Unknown Company",
);

const companyInitial = computed(() =>
  companyName.value.charAt(0).toUpperCase(),
);

const companyColorHex = computed(() => {
  // Generate a consistent color based on company name
  const colors = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  ];
  const hash = companyName.value.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
  return colors[Math.abs(hash) % colors.length];
});

const locationText = computed(() => {
  const parts = [];
  if (props.job.location) parts.push(props.job.location);
  if (props.job.remote) parts.push("Remote");
  return parts.join(", ") || "Location not specified";
});

const timeText = computed(() => {
  if (!props.job.posted) return "NEW";
  const now = new Date();
  const postDate = new Date(props.job.posted);
  const diffHours = Math.floor((now - postDate) / (1000 * 60 * 60));

  if (diffHours < 1) return "NEW";
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 7)}w ago`;
});

const timeBadgeText = computed(() => {
  if (timeText.value === "NEW") return "JUST POSTED";
  return timeText.value.includes("h") ? "TODAY" : "RECENT";
});

const displaySkills = computed(() => {
  const skills = props.job.skills || props.job.tags || [];
  return skills.slice(0, props.maxSkills);
});

const shouldShowReadMore = computed(() => {
  const desc = props.job.description || props.job.summary || "";
  return desc.length > 200;
});

// Methods
const handleSave = () => {
  isSaved.value = !isSaved.value;
  emit("save", { job: props.job, saved: isSaved.value });
};

const handleApply = async () => {
  isApplying.value = true;
  try {
    emit("apply", props.job);
  } finally {
    setTimeout(() => {
      isApplying.value = false;
    }, 2000);
  }
};

const toggleDescription = () => {
  isDescriptionExpanded.value = !isDescriptionExpanded.value;
};

const toggleInsights = () => {
  isInsightsExpanded.value = !isInsightsExpanded.value;
};

const formatJobType = (type) => {
  const typeMap = {
    "full-time": "Full-time",
    "part-time": "Part-time",
    contract: "Contract",
    internship: "Internship",
    freelance: "Freelance",
  };
  return typeMap[type?.toLowerCase()] || type || "Not specified";
};

const formatSalary = (salary) => {
  if (typeof salary === "object") {
    const { min, max, currency = "USD" } = salary;
    const symbol =
      currency === "USD" ? "$" : currency === "EUR" ? "€" : currency;
    if (min && max) {
      return `${symbol}${min.toLocaleString()}-${symbol}${max.toLocaleString()}`;
    }
    if (min) return `${symbol}${min.toLocaleString()}+`;
  }
  return salary || "Not specified";
};

const getSkillClass = (skill) => {
  const gamingSkills = ["unity", "unreal", "godot", "gamedev", "c#", "c++"];
  const webSkills = ["javascript", "typescript", "react", "vue", "node"];
  const dataSkills = ["python", "sql", "mongodb", "postgresql"];

  const skillLower = skill.toLowerCase();
  if (gamingSkills.some((gs) => skillLower.includes(gs))) return "skill-gaming";
  if (webSkills.some((ws) => skillLower.includes(ws))) return "skill-web";
  if (dataSkills.some((ds) => skillLower.includes(ds))) return "skill-data";
  return "skill-default";
};

// Watch for job changes
watch(
  () => props.job?.id,
  () => {
    isSaved.value = false;
    isApplying.value = false;
    isDescriptionExpanded.value = false;
    isInsightsExpanded.value = false;
  },
);
</script>

<style scoped>
.enhanced-job-card {
  width: 100%;
  max-width: 800px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow);
  transition: all var(--duration-normal) var(--easing-ease-out);
  position: relative;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 320px;
}

.enhanced-job-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border-color: color-mix(in srgb, var(--color-primary-500) 40%, transparent);
}

.enhanced-job-card:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px var(--color-primary-500),
    var(--glass-shadow);
}

.job-card-content {
  display: flex;
  flex-direction: column;
}

.top-match-ribbon {
  position: absolute;
  background: linear-gradient(
  );
  color: white;
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--letter-spacing-wide);
}

.job-header {
  background: linear-gradient(
  );
  position: relative;
}

.badge-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.time-badge {
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-semibold);
  display: flex;
  align-items: center;
  min-width: fit-content;
}

@keyframes fadeInLeft {
  from {
  }
  to {
  }
}

.match-score {
  background: conic-gradient(
  );
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes fadeInRight {
  from {
  }
  to {
  }
}

.match-score-inner {
  background: var(--surface-base);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.match-percentage {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.match-label {
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

.header-content {
  display: flex;
  align-items: flex-start;
}

.company-logo {
  border-radius: var(--radius-lg);
  background: linear-gradient(
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  transition: all var(--duration-fast) ease;
  overflow: hidden;
}

.company-logo img {
  object-fit: cover;
}

.company-logo .logo-text {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.company-logo:hover {
}

.job-info {
  display: flex;
  flex-direction: column;
}

.job-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  line-height: var(--line-height-heading);
}

.company-line {
  display: flex;
  align-items: center;
}

.company-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
}

.verified-badge {
  display: flex;
  align-items: center;
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-medium);
}

.location-line {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.btn-icon:hover {
  background: var(--glass-hover-bg);
  color: var(--text-primary);
}

.btn-icon.saved {
  color: white;
}

.header-actions {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.btn-icon {
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-surface);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast) ease;
  font-size: var(--font-size-base);
}

.job-metrics {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
}

.metric-item {
  display: flex;
  align-items: center;
}

.metric-icon {
  border-radius: var(--radius-md);
  background: var(--surface-base);
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-details {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
  font-weight: var(--font-weight-medium);
}

.metric-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.job-description {
}

.description-text {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-body);
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.description-text.description-expanded {
  -webkit-line-clamp: unset;
}

.read-more {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  display: inline-block;
  transition: all var(--duration-fast) ease;
  background: none;
  border: none;
}

.read-more:hover {
}

.skills-section {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}

.skill-tag {
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-fast) ease;
  display: inline-flex;
  align-items: center;
  min-width: fit-content;
}

.skill-tag:hover {
}

.skill-tag.skill-gaming {
  background: color-mix(
    in srgb,
    transparent
  );
  border-color: color-mix(
    in srgb,
    transparent
  );
}

.skill-tag.skill-web {
}

.skill-tag.skill-data {
}

.ai-insights {
  background: linear-gradient(
  );
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.insights-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  transition: background-color var(--duration-fast) ease;
}

.insights-header:hover {
}

.insights-title {
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.insights-title i {
}

@keyframes pulse-glow {
  }
  }
}

.insights-controls {
  display: flex;
  align-items: center;
}

.insights-badge {
  color: white;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
}

.expand-icon {
  transition: transform var(--duration-fast) ease;
  color: var(--text-muted);
}

.expand-icon.expanded {
}

.insights-content {
  overflow: hidden;
  transition: max-height var(--duration-normal) ease;
}

.ai-insights.insights-expanded .insights-content {
}

.insight-items {
  display: flex;
  flex-direction: column;
}

.insight-item {
  display: flex;
  align-items: flex-start;
}

.insight-icon {
  background: var(--surface-base);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-semibold);
}

.insight-text {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-body);
  color: var(--text-secondary);
}

.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.source-info {
  display: flex;
  align-items: center;
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.footer-actions {
  display: flex;
}

.footer-btn {
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--duration-fast) ease;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.footer-btn:hover {
  color: var(--text-primary);
  background: var(--glass-hover-bg);
}

  .header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .header-actions {
    justify-content: center;
  }

  .job-metrics {
  }

  .badge-row {
    flex-direction: column;
  }

  .time-badge {
  }

  .match-score {
  }

  .match-score-inner {
  }

  .match-percentage {
    font-size: var(--font-size-xs);
  }

  .company-logo {
  }

  .job-title {
    font-size: var(--font-size-base);
  }
}

  .enhanced-job-card {
  }

  .job-header,
  .job-metrics,
  .job-description,
  .skills-section,
  .job-footer {
  }

  .header-actions {
    flex-wrap: wrap;
  }

  .btn-icon {
  }
}

.enhanced-job-card:focus-within {
  box-shadow:
    var(--glass-shadow);
}

.enhanced-job-card.top-match {
}

.enhanced-job-card.has-insights .job-footer {
  border-top-color: color-mix(
    in srgb,
    transparent
  );
}
</style>
