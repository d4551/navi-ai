<template>
  <div class="job-discovery-card ultra-glass-card section-card gaming-card">
    <!-- Job Header with Company Branding -->
    <div class="job-header">
      <div class="company-branding">
        <div class="company-logo-wrapper">
          <img
            v-if="job.companyLogo"
            :src="job.companyLogo"
            :alt="`${job.company} logo`"
            class="company-logo"
            @error="onLogoError"
          />
          <div v-else class="company-logo-placeholder">
            {{ getCompanyInitials(job.company) }}
          </div>
        </div>
        <div class="company-info">
          <h3 class="job-title">{{ job.title }}</h3>
          <div class="company-details">
            <span class="company-name">{{ job.company }}</span>
            <span class="job-location">
              <AppIcon name="mdi-map-marker-outline" />
              {{ job.location }}
              <span v-if="job.remote" class="glass-badge glass-badge-success">Remote</span>
              <span v-if="job.hybrid" class="glass-badge glass-badge-info">Hybrid</span>
            </span>
          </div>
        </div>
      </div>

      <!-- AI Match Score -->
      <div class="ai-match-score" :class="getMatchScoreClass(aiScore)">
        <div class="score-circle">
          <svg class="score-progress" viewBox="0 0 36 36">
            <path
              class="score-track"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              stroke-width="2"
            />
            <path
              class="score-bar"
              :stroke-dasharray="`${aiScore}, 100`"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              :stroke="getScoreColor(aiScore)"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          <div class="score-text">
            <span class="score-value">{{ aiScore }}</span>
            <span class="score-label">%</span>
          </div>
        </div>
        <div class="match-label">AI Match</div>
      </div>
    </div>

    <!-- Salary & Experience Level -->
    <div class="job-meta">
      <div v-if="job.salary" class="salary-range">
        <AppIcon name="mdi-cash-multiple" class="text-success" />
        <span>{{ formatSalary(job.salary) }}</span>
      </div>
      <div
        class="experience-level"
        :class="getExperienceLevelClass(job.experienceLevel)"
      >
        <AppIcon name="mdi-account-star" />
        <span>{{ job.experienceLevel }}</span>
      </div>
      <div class="job-type">
        <AppIcon name="mdi-clock-outline" />
        <span>{{ job.type }}</span>
      </div>
    </div>

    <!-- Job Description -->
    <div class="job-description">
      <p>{{ truncateDescription(job.description) }}</p>
    </div>

    <!-- Technologies & Skills -->
    <div
      v-if="job.technologies && job.technologies.length"
      class="job-technologies"
    >
      <h5 class="tech-section-title">Tech Stack</h5>
      <div class="tech-tags">
        <span
          v-for="tech in job.technologies.slice(0, 5)"
          :key="tech"
          class="tech-tag"
          :class="getUserSkillClass(tech)"
        >
          {{ tech }}
          <AppIcon
            v-if="isUserSkill(tech)"
            name="mdi-check-circle-outline"
            class="skill-match-icon"
          />
        </span>
        <span
          v-if="job.technologies.length > 5"
          class="tech-tag overflow-indicator"
        >
          +{{ job.technologies.length - 5 }} more
        </span>
      </div>
    </div>

    <!-- Match Reasons (AI Insights) -->
    <div v-if="matchReasons && matchReasons.length" class="match-reasons">
      <h5 class="match-section-title">
        <AppIcon name="mdi-brain" class="text-cyber" />
        Why This Matches You
      </h5>
      <ul class="match-reasons-list">
        <li
          v-for="reason in matchReasons.slice(0, 3)"
          :key="reason"
          class="match-reason"
        >
          <AppIcon
            name="mdi-check-circle-outline"
            color="success"
            context="success"
          />
          {{ reason }}
        </li>
      </ul>
    </div>

    <!-- Gaming Skills Connection -->
    <div
      v-if="job.gamingTitles && job.gamingTitles.length"
      class="gaming-skills-connection"
    >
      <h5 class="gaming-section-title">
        <AppIcon name="mdi-gamepad-variant" context="gaming" />
        Gaming Skills Applied
      </h5>
      <div class="gaming-titles">
        <div
          v-for="titleId in job.gamingTitles.slice(0, 3)"
          :key="titleId"
          class="gaming-title-chip"
        >
          <span class="game-emoji"><AppIcon
            name="mdi-gamepad-variant"
            color="gaming"
            context="gaming"
            aria-hidden="true"
          /></span>
          {{ getGameTitle(titleId) }}
        </div>
      </div>
    </div>

    <!-- Job Actions -->
    <div class="job-actions">
      <UnifiedButton
        variant="gaming"
        size="sm"
        :loading="applyingJob"
        @click="handleApply"
      >
        <AppIcon name="mdi-send" class="me-2" />
        Quick Apply
      </UnifiedButton>

      <UnifiedButton variant="cyber" size="sm" @click="handleViewDetails">
        <AppIcon name="mdi-eye" class="me-2" />
        View Details
      </UnifiedButton>

      <UnifiedButton
        variant="glass"
        size="sm"
        icon-only
        :class="{ active: isSaved }"
        :title="isSaved ? 'Remove from saved' : 'Save job'"
        @click="handleSave"
      >
        <AppIcon :name="isSaved ? 'mdi-heart' : 'mdi-heart-outline'" />
      </UnifiedButton>

      <UnifiedButton
        variant="glass"
        size="sm"
        icon-only
        title="AI Interview Prep"
        @click="handleInterviewPrep"
      >
        <AppIcon name="mdi-account-voice" />
      </UnifiedButton>
    </div>

    <!-- Job Footer with Posted Date and Applicants -->
    <div class="job-footer">
      <div class="job-posted-date">
        <AppIcon name="mdi-clock-outline" />
        Posted {{ getRelativeTime(job.postedDate) }}
      </div>
      <div v-if="job.applicants" class="job-applicants">
        <AppIcon name="mdi-account-group" />
        {{ job.applicants }} applicants
      </div>
    </div>

    <!-- Hover Effects Overlay -->
    <div class="job-card-overlay"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineEmits } from "vue";
import UnifiedButton from "./UnifiedButton.vue";
import AppIcon from "@/components/ui/AppIcon.vue";

// Props
interface JobData {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  remote?: boolean;
  hybrid?: boolean;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  technologies?: string[];
  experienceLevel: string;
  type: string;
  postedDate: string;
  applicants?: number;
  gamingTitles?: string[];
}

interface Props {
  job: JobData;
  aiScore: number;
  matchReasons?: string[];
  userSkills?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  userSkills: () => [],
});

// Emits
const emit = defineEmits([
  "apply",
  "save",
  "view-details",
  "request-interview-prep",
]);

// Reactive state
const applyingJob = ref(false);
const isSaved = ref(false);

// Gaming titles mapping (simplified - would import from actual data)
const gamingTitlesMap = {
  fortnite: "Fortnite",
  valorant: "VALORANT",
  "apex-legends": "Apex Legends",
  "league-of-legends": "League of Legends",
  "counter-strike-2": "Counter-Strike 2",
  "dota-2": "Dota 2",
};

// Computed properties
const __truncatedDescription = computed(() => {
  return truncateDescription(props.job.description);
});

// Methods
const getCompanyInitials = (companyName: string) => {
  return companyName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .substring(0, 2);
};

const onLogoError = (event: Event) => {
  // Hide broken image and show placeholder
  const target = event.target as HTMLImageElement;
  target.style.display = "none";
};

const getMatchScoreClass = (score: number) => {
  if (score >= 90) return "score-excellent";
  if (score >= 75) return "score-good";
  if (score >= 60) return "score-fair";
  return "score-low";
};

const getScoreColor = (score: number) => {
  if (score >= 90) return "#00ff88";
  if (score >= 75) return "#00d9ff";
  if (score >= 60) return "#ffee00";
  return "#ff006e";
};

const formatSalary = (salary: any) => {
  if (!salary) return "Salary not disclosed";

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: salary.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
};

const getExperienceLevelClass = (level: string) => {
  return {
    entry: level.toLowerCase().includes("entry"),
    mid: level.toLowerCase().includes("mid"),
    senior: level.toLowerCase().includes("senior"),
    lead: level.toLowerCase().includes("lead"),
  };
};

const truncateDescription = (description: string) => {
  if (description.length <= 150) return description;
  return description.substring(0, 150) + "...";
};

const isUserSkill = (tech: string) => {
  return props.userSkills.some(
    (skill) => skill.toLowerCase() === tech.toLowerCase(),
  );
};

const getUserSkillClass = (tech: string) => {
  return isUserSkill(tech) ? "user-skill" : "";
};

const getGameTitle = (titleId: string) => {
  return gamingTitlesMap[titleId as keyof typeof gamingTitlesMap] || titleId;
};

const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60),
  );

  if (diffInHours < 1) return "Less than an hour ago";
  if (diffInHours < 24) return `${diffInHours} hours ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} days ago`;

  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks} weeks ago`;
};

// Event handlers
const handleApply = async () => {
  applyingJob.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
    emit("apply", props.job);
  } finally {
    applyingJob.value = false;
  }
};

const handleSave = () => {
  isSaved.value = !isSaved.value;
  emit("save", { job: props.job, saved: isSaved.value });
};

const handleViewDetails = () => {
  emit("view-details", props.job);
};

const handleInterviewPrep = () => {
  emit("request-interview-prep", props.job);
};
</script>

<style scoped>
.job-discovery-card {
  padding: 1.5rem;
  border-radius: var(--border-radius-large);
  transition: all var(--animation-normal) var(--easing-standard);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border-left: 4px solid var(--razer-blue);
}

.job-discovery-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow:
    var(--glass-shadow-strong),
    0 0 30px rgba(0, 217, 255, 0.3);
}

.job-discovery-card:hover .job-card-overlay {
  opacity: 1;
}

.job-card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 217, 255, 0.05) 0%,
    rgba(168, 85, 247, 0.05) 100%
  );
  opacity: 0;
  transition: opacity var(--animation-normal) ease;
  pointer-events: none;
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.company-branding {
  display: flex;
}

.company-logo-wrapper {
}

.company-logo {
  border-radius: var(--border-radius);
  object-fit: cover;
}

.company-logo-placeholder {
  border-radius: var(--border-radius);
  background: var(--glass-primary-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
}

.company-info {
}

.job-title {
  color: var(--text-primary);
}

.company-details {
  display: flex;
  flex-direction: column;
}

.company-name {
  color: var(--razer-blue);
}

.job-location {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
}

.glass-badge {
  display: inline-flex;
  align-items: center;
  background: var(--glass-bg);
  color: var(--text-secondary);
  text-transform: uppercase;
}
.glass-badge-success {
  color: var(--color-success);
}
.glass-badge-info {
  color: var(--color-info);
}

.ai-match-score {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-circle {
  position: relative;
}

.score-progress {
}

.score-text {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: var(--font-primary);
}

.score-value {
  color: var(--text-primary);
}

.score-label {
  color: var(--text-secondary);
}

.match-label {
  color: var(--text-secondary);
  text-align: center;
}

.score-excellent .match-label {
  color: var(--razer-green);
}
.score-good .match-label {
  color: var(--razer-blue);
}
.score-fair .match-label {
  color: var(--razer-yellow);
}
.score-low .match-label {
  color: var(--razer-pink);
}

.job-meta {
  display: flex;
  flex-wrap: wrap;
}

.salary-range,
.experience-level,
.job-type {
  display: flex;
  align-items: center;
  background: var(--glass-secondary-bg);
  border-radius: var(--border-radius);
}

.experience-level.entry {
}
.experience-level.mid {
}
.experience-level.senior {
}
.experience-level.lead {
}

.job-description {
}

.job-description p {
  color: var(--text-secondary);
}

.job-technologies {
}

.tech-section-title {
  color: var(--text-primary);
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
}

.tech-tag {
  display: flex;
  align-items: center;
  background: var(--glass-bg);
  color: var(--text-primary);
  border-radius: var(--radius-full);
  transition: all var(--animation-normal) ease;
}

.tech-tag.user-skill {
  background: var(--glass-success);
  color: var(--razer-green);
  border-color: var(--razer-green);
}

.skill-match-icon {
}

.overflow-indicator {
  background: var(--glass-tertiary-bg);
  color: var(--text-tertiary);
  font-style: italic;
}

.match-reasons {
}

.match-section-title {
  display: flex;
  align-items: center;
  color: var(--text-primary);
}

.match-reasons-list {
  list-style: none;
}

.match-reason {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
}

.gaming-skills-connection {
}

.gaming-section-title {
  display: flex;
  align-items: center;
  color: var(--razer-pink);
}

.gaming-titles {
  display: flex;
  flex-wrap: wrap;
}

.gaming-title-chip {
  display: flex;
  align-items: center;
  background: var(--glass-gaming);
  color: var(--razer-pink);
  border-radius: var(--border-radius);
}

.game-emoji {
}

.job-actions {
  display: flex;
  flex-wrap: wrap;
}

.job-actions .unified-button {
  min-width: auto;
}

.job-actions .unified-button:last-child:not(:first-child) {
}

.job-actions .unified-button.active {
  background: var(--glass-success);
  color: var(--razer-green);
  border-color: var(--razer-green);
}

.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-tertiary);
}

.job-posted-date,
.job-applicants {
  display: flex;
  align-items: center;
}

  .job-discovery-card {
  }

  .job-header {
    flex-direction: column;
  }

  .company-branding {
    align-items: center;
  }

  .ai-match-score {
    align-self: flex-end;
  }

  .job-meta {
    flex-direction: column;
  }

  .job-actions {
    flex-direction: column;
  }

  .job-actions .unified-button {
    flex: none;
  }

  .job-footer {
    flex-direction: column;
    text-align: center;
  }
}

@keyframes scoreProgress {
  from {
  }
  to {
  }
}

.score-progress .score-bar {
}

@media (prefers-reduced-motion: reduce) {
  .job-discovery-card,
  .job-card-overlay,
  .tech-tag {
    transition: none;
  }

  .job-discovery-card:hover {
    transform: none;
  }

  .score-progress .score-bar {
    animation: none;
  }
}

@media (prefers-contrast: high) {
  .job-discovery-card {
  }

  .tech-tag,
  .gaming-title-chip {
  }
}
</style>
