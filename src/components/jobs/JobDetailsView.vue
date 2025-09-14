<template>
  <div class="job-details-view" :class="{ 'sidebar-view': isSidebarView }">
    <div v-if="job" class="job-details-content">
      <!-- Job Header -->
      <div class="job-header glass-card section-card">
        <div class="job-header-main">
          <div class="job-company-info">
            <div v-if="job.company?.logo" class="company-logo">
              <img :src="job.company.logo" :alt="`${job.company.name} logo`" />
            </div>
            <div v-else class="company-logo-placeholder">
              <AppIcon name="mdi-domain" />
            </div>
            <div class="job-title-section">
              <h1 class="job-title">
                {{ job.title }}
                <span
                  v-if="job.matchScore !== undefined && job.matchScore !== null"
                  class="match-badge match-badge-sm ms-2 align-middle"
                  :class="getMatchBadgeClass(job.matchScore)"
                  title="Match score"
                  aria-label="Match score"
                >
                  <AppIcon
                    name="mdi-target-variant"
                    class="me-1"
                    aria-hidden="true"
                  />
                  <span class="match-pct">{{ Math.round(job.matchScore) }}%</span>
                </span>
              </h1>
              <div class="company-details">
                <h2 class="company-name">
                  {{ job.company?.name || job.company }}
                </h2>
                <div class="job-meta">
                  <span v-if="job.location" class="job-location">
                    <AppIcon name="mdi-map-marker" />
                    {{ job.location }}
                  </span>
                  <span v-if="job.remote" class="job-remote">
                    <AppIcon name="mdi-home-variant" />
                    Remote
                  </span>
                  <span v-if="job.type" class="job-type">
                    <AppIcon name="mdi-clock-outline" />
                    {{ formatJobType(job.type) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="job-actions">
            <div class="action-buttons">
              <UnifiedButton
                variant="outline"
                :leading-icon="isSaved ? 'mdi-heart' : 'mdi-heart-outline'"
                :class="{ active: isSaved }"
                @click="toggleSaved"
              >
                {{ isSaved ? "Saved" : "Save" }}
              </UnifiedButton>
              <UnifiedButton
                variant="primary"
                :disabled="isApplying"
                :loading="isApplying"
                leading-icon="mdi-send"
                @click="applyToJob"
              >
                {{ isApplying ? "Applying..." : "Apply Now" }}
              </UnifiedButton>
            </div>
          </div>
        </div>

        <!-- Job Tags -->
        <div v-if="job.tags && job.tags.length > 0" class="job-tags">
          <span
            v-for="tag in job.tags.slice(0, 8)"
            :key="tag"
            class="job-tag"
            :class="getTagClass(tag)"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- Job Details Grid -->
      <div class="job-details-grid split-layout--main-sidebar">
        <!-- Main Content -->
        <div class="job-main-content v-main">
          <!-- Description -->
          <section class="job-section">
            <h3 class="section-title">
              <AppIcon name="mdi-text-box-outline" />
              Job Description
            </h3>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div
              class="job-description"
              v-html="formatDescription(job.description)"
            ></div>
          </section>

          <!-- Requirements -->
          <section
            v-if="job.requirements && job.requirements.length > 0"
            class="job-section"
          >
            <h3 class="section-title">
              <AppIcon name="mdi-check-circle-outline-outline" />
              Requirements
            </h3>
            <ul class="requirements-list">
              <li v-for="requirement in job.requirements" :key="requirement">
                {{ requirement }}
              </li>
            </ul>
          </section>

          <!-- Skills & Technologies -->
          <section
            v-if="job.skills && job.skills.length > 0"
            class="job-section"
          >
            <h3 class="section-title">
              <AppIcon name="mdi-cog-outline" />
              Required Skills
            </h3>
            <div class="skills-grid compact-grid">
              <span
                v-for="skill in job.skills"
                :key="skill"
                class="skill-badge"
                :class="getSkillLevel(skill)"
              >
                {{ skill }}
              </span>
            </div>
          </section>

          <!-- Game Engines -->
          <section
            v-if="job.engines && job.engines.length > 0"
            class="job-section"
          >
            <h3 class="section-title">
              <AppIcon name="mdi-gamepad-variant-outline" />
              Game Engines
            </h3>
            <div class="engines-grid compact-grid">
              <span
                v-for="engine in job.engines"
                :key="engine"
                class="engine-badge"
              >
                <AppIcon :name="getEngineIcon(engine)" />
                {{ engine }}
              </span>
            </div>
          </section>

          <!-- Benefits -->
          <section
            v-if="job.benefits && job.benefits.length > 0"
            class="job-section"
          >
            <h3 class="section-title">
              <AppIcon name="mdi-gift-outline" />
              Benefits & Perks
            </h3>
            <div class="benefits-grid tool-grid">
              <div
                v-for="benefit in job.benefits"
                :key="benefit"
                class="benefit-item"
              >
                <AppIcon name="mdi-check-circle-outline" context="success" />
                <span>{{ benefit }}</span>
              </div>
            </div>
          </section>
        </div>

        <!-- Sidebar -->
        <div class="job-sidebar">
          <!-- Quick Info Card -->
          <div class="info-card glass-card section-card">
            <h4 class="card-title">Job Information</h4>
            <div class="info-list">
              <div v-if="job.experience" class="info-item">
                <span class="info-label">Experience Level</span>
                <span class="info-value">{{
                  formatExperience(job.experience)
                }}</span>
              </div>
              <div v-if="job.salary" class="info-item">
                <span class="info-label">Salary Range</span>
                <span class="info-value">{{ formatSalary(job.salary) }}</span>
              </div>
              <div v-if="job.posted" class="info-item">
                <span class="info-label">Posted</span>
                <span class="info-value">{{
                  formatRelativeDate(job.posted)
                }}</span>
              </div>
              <div v-if="job.applicants" class="info-item">
                <span class="info-label">Applicants</span>
                <span class="info-value">{{ job.applicants }} candidates</span>
              </div>
            </div>
          </div>

          <!-- Company Card -->
          <div
            v-if="job.company && typeof job.company === 'object'"
            class="company-card glass-card section-card"
          >
            <h4 class="card-title">About {{ job.company.name }}</h4>
            <div class="company-info">
              <p v-if="job.company.description" class="company-description">
                {{ job.company.description }}
              </p>
              <div class="company-stats">
                <div v-if="job.company.size" class="stat-item">
                  <AppIcon name="mdi-account-group" />
                  <span>{{ job.company.size }}</span>
                </div>
                <div v-if="job.company.founded" class="stat-item">
                  <AppIcon name="mdi-calendar" />
                  <span>Founded {{ job.company.founded }}</span>
                </div>
                <div v-if="job.company.website" class="stat-item">
                  <AppIcon name="mdi-web" />
                  <a :href="job.company.website" target="_blank" rel="noopener">
                    Website
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Similar Jobs -->
          <div
            v-if="similarJobs.length > 0"
            class="similar-jobs-card glass-card section-card"
          >
            <h4 class="card-title">Similar Jobs</h4>
            <div class="similar-jobs-list">
              <div
                v-for="similarJob in similarJobs.slice(0, 3)"
                :key="similarJob.id"
                class="similar-job-item"
                @click="$emit('select-job', similarJob)"
              >
                <div class="similar-job-title">{{ similarJob.title }}</div>
                <div class="similar-job-company">
                  {{ similarJob.company?.name || similarJob.company }}
                </div>
                <div class="similar-job-location">
                  {{ similarJob.location }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <AppIcon name="mdi-briefcase-search-outline" />
      <h3>Select a job to view details</h3>
      <p>
        Choose a job from the list to see detailed information, requirements,
        and application options.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

import { ref, watch, defineEmits, defineProps } from "vue";
import { formatRelativeDate } from "@/utils/date";
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";

const _props = defineProps({
  job: {
    type: Object,
    default: null,
  },
  similarJobs: {
    type: Array,
    default: () => [],
  },
  isSidebarView: {
    type: Boolean,
    default: false,
  },
});

const _emit = defineEmits(["select-job", "save-job", "apply-job"]);

// Reactive state
const isSaved = ref(false);

function getMatchBadgeClass(score) {
  const s = Number(score) || 0;
  if (s >= 90) return "match-excellent";
  if (s >= 80) return "match-very-good";
  if (s >= 70) return "match-good";
  if (s >= 60) return "match-fair";
  return "match-poor";
}
const isApplying = ref(false);

// Methods
const toggleSaved = () => {
  isSaved.value = !isSaved.value;
  emit("save-job", { job: props.job, saved: isSaved.value });
};

const applyToJob = async () => {
  isApplying.value = true;
  try {
    emit("apply-job", props.job);
  } finally {
    setTimeout(() => {
      isApplying.value = false;
    }, 2000);
  }
};

const formatJobType = (type) => {
  const typeMap = {
    "full-time": "Full-time",
    "part-time": "Part-time",
    contract: "Contract",
    internship: "Internship",
    freelance: "Freelance",
  };
  return typeMap[type] || type;
};

const formatExperience = (experience) => {
  const expMap = {
    entry: "Entry Level",
    mid: "Mid Level",
    senior: "Senior Level",
    lead: "Lead",
    principal: "Principal",
  };
  return expMap[experience] || experience;
};

const formatSalary = (salary) => {
  if (typeof salary === "object") {
    const { min, max, currency = "USD" } = salary;
    const symbol =
      currency === "USD" ? "$" : currency === "EUR" ? "€" : currency;
    if (min && max) {
      return `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()}`;
    }
  }
  return salary;
};

const formatDescription = (description) => {
  if (!description) {
    return "";
  }
  // Simple HTML formatting for line breaks
  return description
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
};

const getTagClass = (tag) => {
  const gamingTags = ["unity", "unreal", "gamedev", "gaming", "game"];
  const skillTags = ["javascript", "python", "c#", "react", "vue"];

  if (gamingTags.some((t) => tag.toLowerCase().includes(t))) {
    return "tag-gaming";
  }
  if (skillTags.some((t) => tag.toLowerCase().includes(t))) {
    return "tag-skill";
  }
  return "tag-default";
};

const getSkillLevel = (skill) => {
  // Simple skill level detection based on common patterns
  const advanced = ["senior", "expert", "lead", "architect"];
  const intermediate = ["mid", "intermediate", "experienced"];

  if (advanced.some((level) => skill.toLowerCase().includes(level))) {
    return "skill-advanced";
  }
  if (intermediate.some((level) => skill.toLowerCase().includes(level))) {
    return "skill-intermediate";
  }
  return "skill-basic";
};

const getEngineIcon = (engine) => {
  const iconMap = {
    unity: "mdi-unity",
    unreal: "mdi-unity", // Using unity icon as fallback
    godot: "mdi-gamepad-variant",
    construct: "mdi-puzzle",
  };
  return iconMap[engine.toLowerCase()] || "mdi-cog";
};

// Watch for job changes to reset state
watch(
  () => props.job,
  (newJob) => {
    if (newJob) {
      // Check if job is already saved (would normally check against saved jobs list)
      isSaved.value = false;
      isApplying.value = false;
    }
  },
);
</script>

<style scoped>
.job-details-view {
  height: 100%;
  overflow-y: auto;
  padding: 1rem;
}

.job-details-view.sidebar-view {
  padding: 0.5rem;
}

.job-header {
}

.job-header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.job-company-info {
  display: flex;
  align-items: flex-start;
}

.company-logo,
.company-logo-placeholder {
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.company-logo img {
  object-fit: cover;
}

.company-logo-placeholder i {
  color: var(--text-muted);
}

.job-title {
  color: var(--text-primary);
}

.company-name {
  color: var(--color-primary);
}

.job-meta {
  display: flex;
  flex-wrap: wrap;
  color: var(--text-secondary);
}

.job-meta span {
  display: flex;
  align-items: center;
}

.job-meta i {
}

.job-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}


.action-buttons {
  display: flex;
}

.action-buttons .btn {
}

.action-buttons .btn.active {
  background: var(--color-danger);
  border-color: var(--color-danger);
  color: white;
}

.job-tags {
  display: flex;
  flex-wrap: wrap;
}

.job-tag {
  background: var(--glass-elevated);
  color: var(--text-secondary);
}

.job-tag.tag-gaming {
  color: var(--color-primary);
}

.job-tag.tag-skill {
  color: var(--color-success);
}

.job-details-grid {
  display: grid;
  align-items: start;
}

.job-section {
  background: var(--glass-surface);
}

.section-title {
  display: flex;
  align-items: center;
  color: var(--text-primary);
}

.section-title i {
  color: var(--color-primary);
}

.job-description {
  color: var(--text-secondary);
}

.requirements-list {
  list-style: none;
}

.requirements-list li {
  position: relative;
  color: var(--text-secondary);
}

.requirements-list li::before {
  content: "✓";
  position: absolute;
  color: var(--color-success);
  font-weight: bold;
}

.skills-grid,
.engines-grid {
  display: grid;
}

.skill-badge,
.engine-badge {
  text-align: center;
  background: var(--glass-elevated);
  color: var(--text-primary);
}

.skill-badge:hover,
.engine-badge:hover {
}

.skill-badge.skill-advanced {
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.skill-badge.skill-intermediate {
  border-color: var(--color-warning);
  color: var(--color-warning);
}

.skill-badge.skill-basic {
  border-color: var(--color-success);
  color: var(--color-success);
}

.engine-badge {
  display: flex;
  align-items: center;
  justify-content: center;
}

.benefits-grid {
  display: grid;
}

.benefit-item {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
}

.benefit-icon {
  color: var(--color-success);
}

.info-card,
.company-card,
.similar-jobs-card {
}

.card-title {
  color: var(--text-primary);
}

.info-list {
  display: flex;
  flex-direction: column;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: var(--text-muted);
}

.info-value {
  color: var(--text-primary);
  text-align: right;
}

.company-description {
  color: var(--text-secondary);
}

.company-stats {
  display: flex;
  flex-direction: column;
}

.stat-item {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
}

.stat-item a {
  color: var(--color-primary);
  text-decoration: none;
}

.stat-item a:hover {
  text-decoration: underline;
}

.similar-jobs-list {
  display: flex;
  flex-direction: column;
}

.similar-job-item {
  background: var(--glass-elevated);
  cursor: pointer;
}

.similar-job-item:hover {
  border-color: var(--color-primary);
}

.similar-job-title {
  color: var(--text-primary);
}

.similar-job-company,
.similar-job-location {
  color: var(--text-muted);
}

.empty-state {
  text-align: center;
  color: var(--text-muted);
}

.empty-state i {
}

  color: var(--text-secondary);
}


  .job-header {
  }

  .job-title {
  }
}

  .job-header-main {
    flex-direction: column;
  }

  .job-actions {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .action-buttons {
    justify-content: flex-end;
  }

  .job-company-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .job-title {
  }


  .job-section {
  }
}

[data-theme="dark"] .job-description,
[data-theme="dark"] .requirements-list li,
[data-theme="dark"] .company-description {
  color: var(--text-secondary);
}

[data-theme="dark"] .match-score-circle::before {
  background: var(--glass-surface);
}
</style>
