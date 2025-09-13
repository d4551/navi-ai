<template>
  <div class="interactive-job-discovery">
    <!-- Discovery Header -->
    <div class="discovery-header ultra-glass-card gaming-card mb-6">
      <div class="d-flex align-items-center justify-content-between">
        <div class="discovery-title-section">
          <h2 class="heading-gaming mb-2">
            <AppIcon name="mdi-radar" class="icon-cyber me-3" />
            AI Job Discovery
          </h2>
          <p class="text-muted">
            Intelligent job matching powered by your gaming profile and career
            goals
          </p>
        </div>
        <div class="discovery-actions">
          <UnifiedButton
            variant="gaming"
            size="sm"
            leading-icon="mdi-brain"
            :loading="isAnalyzing"
            @click="runAIAnalysis"
          >
            Analyze Profile
          </UnifiedButton>
          <UnifiedButton
            variant="cyber"
            size="sm"
            leading-icon="mdi-target"
            @click="startTargetedSearch"
          >
            Targeted Search
          </UnifiedButton>
        </div>
      </div>
    </div>

    <!-- AI Recommendations Dashboard -->
    <div class="recommendations-dashboard mb-6">
      <div
        class="recommendation-cards enhanced-recommendations-grid settings-grid ultra-dense-cards"
      >
        <!-- Skill Match Recommendation -->
        <div
          class="recommendation-card ultra-glass-card gaming-card ai-feature-card"
        >
          <div class="recommendation-header">
            <div class="rec-icon-wrapper">
              <AppIcon name="mdi-account-star" class="rec-icon text-success" />
            </div>
            <div class="rec-meta">
              <h3 class="rec-title">Perfect Skill Match</h3>
              <div class="rec-stats">
                <span class="match-percentage">{{ aiRecommendations.skillMatch }}%</span>
                <span class="match-label">compatibility</span>
              </div>
            </div>
          </div>
          <div class="recommendation-content">
            <p class="rec-description">
              Based on your Unity and C# expertise, we found
              {{ aiRecommendations.skillBasedJobs }} positions that align with
              your technical skills.
            </p>
            <div class="rec-tags">
              <span
                v-for="skill in topSkills.slice(0, 3)"
                :key="skill"
                class="skill-badge blue"
              >
                {{ skill }}
              </span>
            </div>
            <UnifiedButton
              variant="success"
              size="sm"
              full-width
              @click="viewSkillMatches"
            >
              View {{ aiRecommendations.skillBasedJobs }} Matches
            </UnifiedButton>
          </div>
        </div>

        <!-- Career Growth Recommendation -->
        <div
          class="recommendation-card ultra-glass-card gaming-card ai-feature-card"
        >
          <div class="recommendation-header">
            <div class="rec-icon-wrapper">
              <AppIcon name="mdi-trending-up" color="warning" />
            </div>
            <div class="rec-meta">
              <h3 class="rec-title">Career Advancement</h3>
              <div class="rec-stats">
                <span class="match-percentage">+{{ aiRecommendations.salaryIncrease }}%</span>
                <span class="match-label">potential increase</span>
              </div>
            </div>
          </div>
          <div class="recommendation-content">
            <p class="rec-description">
              Senior roles at
              {{ aiRecommendations.topStudios.join(", ") }} could increase your
              earning potential significantly.
            </p>
            <div class="rec-progress">
              <div class="progress-label">Career Readiness</div>
              <div class="progress progress--xs">
                <div
                  class="progress-bar"
                  :style="{ width: aiRecommendations.careerReadiness + '%' }"
                ></div>
              </div>
            </div>
            <UnifiedButton
              variant="warning"
              size="sm"
              full-width
              @click="viewCareerPath"
            >
              Explore Growth Path
            </UnifiedButton>
          </div>
        </div>

        <!-- Location-Based Recommendation -->
        <div
          class="recommendation-card ultra-glass-card gaming-card ai-feature-card"
        >
          <div class="recommendation-header">
            <div class="rec-icon-wrapper">
              <AppIcon
                name="mdi-map-marker-radius"
                class="rec-icon text-primary"
              />
            </div>
            <div class="rec-meta">
              <h3 class="rec-title">Local Opportunities</h3>
              <div class="rec-stats">
                <span class="match-percentage">{{
                  aiRecommendations.localJobs
                }}</span>
                <span class="match-label">nearby jobs</span>
              </div>
            </div>
          </div>
          <div class="recommendation-content">
            <p class="rec-description">
              Discover gaming opportunities in your area, including
              {{ aiRecommendations.remoteJobs }} remote positions.
            </p>
            <div class="location-chips">
              <UiChip
                v-for="location in nearbyLocations"
                :key="location"
                classes="chip chip-info chip-compact"
              >
                {{ location }}
              </UiChip>
            </div>
            <UnifiedButton
              variant="primary"
              size="sm"
              full-width
              @click="viewLocationJobs"
            >
              Browse Local Jobs
            </UnifiedButton>
          </div>
        </div>

        <!-- AI-Powered Insights -->
        <div
          class="recommendation-card ultra-glass-card gaming-card ai-feature-card insight-card"
        >
          <div class="recommendation-header">
            <div class="rec-icon-wrapper">
              <AppIcon name="mdi-lightbulb-on" class="rec-icon text-cyber" />
            </div>
            <div class="rec-meta">
              <h3 class="rec-title">AI Insights</h3>
              <UiChip classes="chip chip-info chip-compact">
                <AppIcon name="mdi-brain" class="me-1" />
                Powered by AI
              </UiChip>
            </div>
          </div>
          <div class="recommendation-content">
            <div class="insight-text">
              <p>{{ currentInsight.text }}</p>
            </div>
            <div class="insight-actions">
              <UnifiedButton variant="ghost" size="sm" @click="nextInsight">
                <AppIcon name="mdi-refresh" class="me-2" />
                Next Insight
              </UnifiedButton>
              <UnifiedButton variant="cyber" size="sm" @click="applyInsight">
                <AppIcon name="mdi-check" />
                Apply
              </UnifiedButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Interactive Job Filters with AI Enhancement -->
    <div class="smart-filters-section mb-6">
      <div class="filters-header ultra-glass-card gaming-card p-4 mb-4">
        <h3 class="heading-unified mb-2">
          <AppIcon name="mdi-filter-variant" class="icon-primary me-2" />
          Smart Job Filters
        </h3>
        <p class="text-muted mb-0">
          AI-enhanced filtering based on your profile and preferences
        </p>
      </div>

      <div
        class="smart-filters-grid enhanced-filters-grid responsive-grid--cards-md ultra-dense-cards"
      >
        <!-- Experience Level Filter -->
        <div class="filter-card ultra-glass-card gaming-card">
          <div class="filter-header">
            <h4 class="filter-title">Experience Level</h4>
            <UiChip
              v-if="suggestedFilters.experienceLevel"
              classes="chip chip-success chip-compact"
            >
              <AppIcon name="mdi-brain" class="text-xs me-1" />
              AI Suggested
            </UiChip>
          </div>
          <div class="filter-content">
            <v-radio-group v-model="filters.experienceLevel" density="compact">
              <v-radio
                v-for="level in experienceLevels"
                :key="level.value"
                :value="level.value"
                :label="level.label"
                :class="{
                  'ai-recommended':
                    suggestedFilters.experienceLevel === level.value,
                }"
              />
            </v-radio-group>
          </div>
        </div>

        <!-- Role Type Filter -->
        <div class="filter-card ultra-glass-card gaming-card">
          <div class="filter-header">
            <h4 class="filter-title">Role Type</h4>
            <UnifiedButton
              variant="ghost"
              size="xs"
              @click="analyzeRolePreferences"
            >
              <AppIcon name="mdi-brain" class="me-1" />
              Analyze
            </UnifiedButton>
          </div>
          <div class="filter-content">
            <div class="role-chips">
              <div
                v-for="role in gameRoles"
                :key="role.value"
                class="role-chip"
                :class="{
                  active: filters.roles.includes(role.value),
                  'ai-recommended': suggestedFilters.roles.includes(role.value),
                }"
                @click="toggleRole(role.value)"
              >
                <AppIcon :name="role.icon" class="role-icon me-2" />
                {{ role.label }}
                <span
                  v-if="role.demand === 'high'"
                  class="demand-indicator high"
                ><AppIcon name="mdi-fire" size="small" color="warning" /></span>
                <span
                  v-if="role.demand === 'growing'"
                  class="demand-indicator growing"
                ><AppIcon
                  name="mdi-trending-up"
                  color="success"
                  aria-hidden="true"
                /></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Technology Stack Filter -->
        <div class="filter-card ultra-glass-card gaming-card">
          <div class="filter-header">
            <h4 class="filter-title">Tech Stack</h4>
            <UiChip classes="chip chip-info chip-compact">
              Match: {{ techStackMatch }}%
            </UiChip>
          </div>
          <div class="filter-content">
            <div class="tech-categories">
              <div
                v-for="category in techCategories"
                :key="category.name"
                class="tech-category"
              >
                <h5 class="category-name">{{ category.name }}</h5>
                <div class="tech-chips">
                  <div
                    v-for="tech in category.technologies"
                    :key="tech.name"
                    class="tech-chip"
                    :class="{
                      active: filters.technologies.includes(tech.name),
                      'user-skill': userSkills.includes(tech.name),
                    }"
                    @click="toggleTechnology(tech.name)"
                  >
                    <AppIcon
                      v-if="tech.icon"
                      :name="tech.icon"
                      class="tech-icon me-1"
                    />
                    {{ tech.name }}
                    <span
                      v-if="userSkills.includes(tech.name)"
                      class="skill-match-indicator"
                    ><AppIcon name="mdi-check" size="small" color="success" /></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Company Culture Filter -->
        <div class="filter-card ultra-glass-card gaming-card">
          <div class="filter-header">
            <h4 class="filter-title">Company Culture</h4>
          </div>
          <div class="filter-content">
            <div class="culture-preferences">
              <div
                v-for="culture in cultureTypes"
                :key="culture.value"
                class="culture-item"
                :class="{ active: filters.culture.includes(culture.value) }"
                @click="toggleCulture(culture.value)"
              >
                <div class="culture-icon">
                  <i :class="culture.icon"></i>
                </div>
                <div class="culture-info">
                  <div class="culture-name">{{ culture.name }}</div>
                  <div class="culture-description">
                    {{ culture.description }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Real-time Job Results with AI Scoring -->
    <div class="job-results-section">
      <div class="results-header ultra-glass-card gaming-card p-4 mb-4">
        <div class="d-flex align-items-center justify-content-between">
          <div>
            <h3 class="heading-unified mb-1">
              {{ filteredJobs.length }} Matching Opportunities
            </h3>
            <p class="text-muted mb-0">Sorted by AI compatibility score</p>
          </div>
          <div class="view-options">
            <UnifiedButton
              variant="glass"
              size="sm"
              leading-icon="mdi-sort"
              @click="showSortOptions = !showSortOptions"
            >
              Sort Options
            </UnifiedButton>
          </div>
        </div>

        <Transition name="slide-down">
          <div v-if="showSortOptions" class="sort-options mt-3">
            <v-radio-group v-model="sortBy" inline density="compact">
              <v-radio value="ai-score" label="AI Match Score" />
              <v-radio value="salary" label="Salary" />
              <v-radio value="date" label="Date Posted" />
              <v-radio value="experience" label="Experience Level" />
            </v-radio-group>
          </div>
        </Transition>
      </div>

      <div class="job-cards enhanced-job-grid portfolio-grid ultra-dense-cards">
        <JobDiscoveryCard
          v-for="job in displayedJobs"
          :key="job.id"
          :job="job"
          :ai-score="job.aiScore"
          :match-reasons="job.matchReasons"
          @apply="handleJobApplication"
          @save="handleJobSave"
          @view-details="handleJobDetails"
          @request-interview-prep="handleInterviewPrep"
        />
      </div>

      <!-- Load More Results -->
      <div v-if="hasMoreJobs" class="load-more-section text-center mt-6">
        <UnifiedButton
          variant="gaming"
          size="lg"
          :loading="isLoadingMore"
          @click="loadMoreJobs"
        >
          <AppIcon name="mdi-plus-circle" class="me-2" />
          Load More Opportunities
        </UnifiedButton>
      </div>
    </div>

    <!-- AI Chat Integration -->
    <div class="ai-chat-overlay" :class="{ active: showAIChat }">
      <div class="ai-chat-container">
        <div class="ai-chat-header">
          <h4>Job Discovery Assistant</h4>
          <UnifiedButton
            variant="ghost"
            size="sm"
            icon-only
            icon="mdi-close"
            @click="showAIChat = false"
          />
        </div>
        <div class="ai-chat-content">
          <!-- AI Chat component would be integrated here -->
          <div class="chat-messages">
            <div
              v-for="message in chatMessages"
              :key="message.id"
              class="chat-message"
              :class="[
                message.type,
                {
                  'message-user': message.type === 'user',
                  'message-ai': message.type === 'ai',
                },
              ]"
            >
              <div class="message-avatar">
                <AppIcon
                  :name="
                    message.type === 'user'
                      ? 'mdi-account'
                      : message.type === 'ai'
                        ? 'mdi-robot'
                        : 'mdi-information'
                  "
                />
              </div>
              <div class="message-content">
                <div class="message-text">{{ message.content }}</div>
              </div>
            </div>
          </div>
          <div class="chat-input">
            <v-text-field
              v-model="chatInput"
              placeholder="Ask about job opportunities..."
              variant="outlined"
              density="compact"
              @keyup.enter="sendChatMessage"
            >
              <template #append-inner>
                <UnifiedButton
                  variant="ghost"
                  size="sm"
                  @click="sendChatMessage"
                >
                  <AppIcon name="mdi-send" />
                </UnifiedButton>
              </template>
            </v-text-field>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppIcon from "@/components/ui/AppIcon.vue";
import UiChip from "@/components/ui/UiChip.vue";

import { ref, onMounted, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import JobDiscoveryCard from "@/components/ui/JobDiscoveryCard.vue";

const router = useRouter();

// Reactive state
const isAnalyzing = ref(false);
const isLoadingMore = ref(false);
const showSortOptions = ref(false);
const showAIChat = ref(false);
const sortBy = ref("ai-score");
const chatInput = ref("");
const currentInsightIndex = ref(0);

// Filters
const filters = reactive({
  experienceLevel: "",
  roles: [] as string[],
  technologies: [] as string[],
  culture: [] as string[],
  salaryRange: [50000, 200000],
  location: "",
  remote: false,
});

// AI Recommendations
const aiRecommendations = reactive({
  skillMatch: 87,
  skillBasedJobs: 24,
  salaryIncrease: 35,
  careerReadiness: 78,
  localJobs: 12,
  remoteJobs: 156,
  topStudios: ["Epic Games", "Riot Games", "Valve"],
});

// Suggested filters based on AI analysis
const suggestedFilters = reactive({
  experienceLevel: "senior",
  roles: ["game-developer", "technical-lead"],
  technologies: ["Unity", "C#", "Unreal Engine"],
});

// Mock data
const topSkills = ["Unity", "C#", "Unreal Engine", "JavaScript", "Python"];
const userSkills = ["Unity", "C#", "Blender", "JavaScript", "Git"];
const nearbyLocations = ["San Francisco", "Los Angeles", "Seattle"];

const experienceLevels = [
  { label: "Entry Level (0-2 years)", value: "entry" },
  { label: "Mid Level (2-5 years)", value: "mid" },
  { label: "Senior (5+ years)", value: "senior" },
  { label: "Lead/Principal", value: "lead" },
];

const gameRoles = [
  {
    label: "Game Developer",
    value: "game-developer",
    icon: "mdi-code-braces",
    demand: "high",
  },
  {
    label: "Game Designer",
    value: "game-designer",
    icon: "mdi-palette",
    demand: "growing",
  },
  {
    label: "Technical Artist",
    value: "technical-artist",
    icon: "mdi-brush",
    demand: "high",
  },
  {
    label: "QA Engineer",
    value: "qa-engineer",
    icon: "mdi-bug",
    demand: "growing",
  },
  {
    label: "Producer",
    value: "producer",
    icon: "mdi-account-tie",
    demand: "moderate",
  },
  {
    label: "UI/UX Designer",
    value: "ui-designer",
    icon: "mdi-monitor-dashboard",
    demand: "high",
  },
];

const techCategories = [
  {
    name: "Game Engines",
    technologies: [
      { name: "Unity", icon: "mdi-unity" },
      { name: "Unreal Engine", icon: "mdi-unreal" },
      { name: "Godot", icon: "mdi-gamepad-variant" },
    ],
  },
  {
    name: "Programming Languages",
    technologies: [
      { name: "C#", icon: "mdi-language-csharp" },
      { name: "C++", icon: "mdi-language-cpp" },
      { name: "JavaScript", icon: "mdi-language-javascript" },
      { name: "Python", icon: "mdi-language-python" },
    ],
  },
  {
    name: "Art & Design",
    technologies: [
      { name: "Blender", icon: "mdi-blender-software" },
      { name: "Maya", icon: "mdi-cube-outline" },
      { name: "Photoshop", icon: "mdi-image-edit" },
    ],
  },
];

const cultureTypes = [
  {
    name: "Innovative",
    value: "innovative",
    icon: "mdi-lightbulb",
    description: "Cutting-edge projects and creative freedom",
  },
  {
    name: "Collaborative",
    value: "collaborative",
    icon: "mdi-account-group",
    description: "Team-focused with open communication",
  },
  {
    name: "Work-Life Balance",
    value: "work-life-balance",
    icon: "mdi-scale-balance",
    description: "Flexible hours and remote work options",
  },
  {
    name: "Growth-Oriented",
    value: "growth-oriented",
    icon: "mdi-trending-up",
    description: "Learning opportunities and career advancement",
  },
];

const aiInsights = [
  {
    text: "Your Unity skills are in high demand. Consider highlighting your multiplayer game development experience.",
    actionable: true,
  },
  {
    text: "Remote positions in game development have increased by 40% this year. Expand your search radius.",
    actionable: true,
  },
  {
    text: "Companies are seeking developers with both technical and creative skills. Your art background is an advantage.",
    actionable: false,
  },
  {
    text: "Consider learning Unreal Engine - it's featured in 60% of AAA studio job postings.",
    actionable: true,
  },
];

const currentInsight = computed(() => aiInsights[currentInsightIndex.value]);

// Mock jobs data
const filteredJobs = ref([
  {
    id: "1",
    title: "Senior Unity Developer",
    company: "Epic Games",
    location: "Remote",
    description:
      "Lead Unity development on high-profile titles and mentor junior engineers.",
    experienceLevel: "Senior",
    type: "Full-time",
    postedDate: new Date().toISOString(),
    aiScore: 95,
    matchReasons: ["Unity expertise", "C# proficiency", "AAA experience"],
  },
  // More job data would be here
]);

const displayedJobs = computed(() => filteredJobs.value.slice(0, 20));
const hasMoreJobs = computed(() => filteredJobs.value.length > 20);

const techStackMatch = computed(() => {
  const matchingTechs = filters.technologies.filter((tech) =>
    userSkills.includes(tech),
  );
  return Math.round(
    (matchingTechs.length / Math.max(filters.technologies.length, 1)) * 100,
  );
});

const chatMessages = ref([
  {
    id: 1,
    type: "ai",
    content:
      "Hi! I can help you discover the perfect gaming job opportunities. What are you looking for?",
  },
]);

// Methods
const runAIAnalysis = async () => {
  isAnalyzing.value = true;
  // Simulate AI analysis
  setTimeout(() => {
    isAnalyzing.value = false;
    // Update recommendations with fresh data
  }, 2000);
};

const startTargetedSearch = () => {
  showAIChat.value = true;
};

const viewSkillMatches = () => {
  router.push("/jobs?filter=skill-match");
};

const viewCareerPath = () => {
  router.push("/career-path");
};

const viewLocationJobs = () => {
  router.push("/jobs?filter=location");
};

const nextInsight = () => {
  currentInsightIndex.value =
    (currentInsightIndex.value + 1) % aiInsights.length;
};

const applyInsight = () => {
  if (currentInsight.value.actionable) {
    // Apply the insight as a filter or action
  }
};

const toggleRole = (role: string) => {
  const index = filters.roles.indexOf(role);
  if (index > -1) {
    filters.roles.splice(index, 1);
  } else {
    filters.roles.push(role);
  }
};

const toggleTechnology = (tech: string) => {
  const index = filters.technologies.indexOf(tech);
  if (index > -1) {
    filters.technologies.splice(index, 1);
  } else {
    filters.technologies.push(tech);
  }
};

const toggleCulture = (culture: string) => {
  const index = filters.culture.indexOf(culture);
  if (index > -1) {
    filters.culture.splice(index, 1);
  } else {
    filters.culture.push(culture);
  }
};

const analyzeRolePreferences = () => {
  // AI analysis of user's role preferences based on profile
};

const loadMoreJobs = () => {
  isLoadingMore.value = true;
  setTimeout(() => {
    isLoadingMore.value = false;
  }, 1000);
};

const sendChatMessage = () => {
  if (!chatInput.value.trim()) return;

  chatMessages.value.push({
    id: Date.now(),
    type: "user",
    content: chatInput.value,
  });

  // Simulate AI response
  setTimeout(() => {
    chatMessages.value.push({
      id: Date.now(),
      type: "ai",
      content: "Let me analyze the job market for that specific requirement...",
    });
  }, 1000);

  chatInput.value = "";
};

const handleJobApplication = (job: any) => {
  router.push(`/jobs/${job.id}/apply`);
};

const handleJobSave = (_job: any) => {
  // Save job logic
};

const handleJobDetails = (job: any) => {
  router.push(`/jobs/${job.id}`);
};

const handleInterviewPrep = (job: any) => {
  router.push(`/interview-prep?job=${job.id}`);
};

onMounted(() => {
  runAIAnalysis();
});
</script>

<style scoped>
.interactive-job-discovery {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-6);
}

.discovery-header {
  padding: var(--spacing-6);
  border-radius: var(--radius-2xl);
}

.recommendations-dashboard {
  margin-bottom: var(--spacing-8);
}

.enhanced-recommendations-grid {
  display: grid;
  gap: clamp(1rem, 2.5vw, 1.5rem);
}

.recommendation-card {
  padding: var(--spacing-6);
  border-radius: var(--radius-card);
  min-height: 280px;
  display: flex;
  flex-direction: column;
}

.recommendation-header {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
}

.rec-icon-wrapper {
  background: var(--glass-surface-strong);
  padding: var(--spacing-3);
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.rec-icon {
  font-size: 1.5rem;
}

.rec-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  margin-bottom: var(--spacing-1);
}

.rec-stats {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-2);
}

.match-percentage {
  font-size: var(--font-size-xl);
  font-weight: 800;
  color: var(--clear-cyan);
  font-family: var(--font-primary);
}

.match-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.recommendation-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.rec-description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-4);
}

.rec-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-4);
}

.rec-progress {
  margin-bottom: var(--spacing-4);
}

.progress-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-2);
}

.progress-bar-container {
  height: 6px;
  background: var(--glass-surface);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--clear-warning),
    var(--clear-success)
  );
  border-radius: var(--radius-full);
  transition: width var(--duration-normal) ease;
}

.location-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-4);
}

.location-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1-5);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-full);
  font-size: var(--badge-font-size);
  font-weight: var(--badge-font-weight);
  color: var(--text-secondary);
}

.insight-card {
  border-left: 4px solid var(--clear-purple);
}

.insight-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1-5);
  background: var(--glass-bg);
  border: 1px solid
    color-mix(
      in srgb,
      var(--color-info-500, var(--color-info)) 60%,
      transparent
    );
  color: var(--color-info-500, var(--color-info));
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-full);
  font-size: var(--badge-font-size);
  font-weight: var(--badge-font-weight);
}

.insight-text {
  flex: 1;
  margin-bottom: var(--spacing-4);
}

.insight-actions {
  display: flex;
  gap: var(--spacing-2);
}

.enhanced-filters-grid {
  display: grid;
  gap: clamp(1rem, 2.5vw, 1.5rem);
}

.filter-card {
  padding: var(--spacing-6);
  border-radius: var(--radius-card);
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-4);
}

.filter-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin: 0;
}

.ai-suggestion-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1-5);
  background: var(--glass-bg);
  border: 1px solid
    color-mix(
      in srgb,
      var(--color-success-500, var(--color-success)) 60%,
      transparent
    );
  color: var(--color-success-500, var(--color-success));
  padding: 2px 6px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: var(--badge-font-weight);
}

.ai-recommended {
  background: var(--glass-success) !important;
}

.role-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.role-chip {
  display: flex;
  align-items: center;
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--glass-surface);
  border: var(--border-glass);
  border-radius: var(--radius-card);
  cursor: pointer;
  transition: all var(--duration-normal) ease;
  position: relative;
}

.role-chip:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.role-chip.active {
  background: var(--glass-primary);
  border-color: var(--clear-cyan);
  color: var(--clear-cyan);
}

.role-chip.ai-recommended::after {
  content: "✨";
  position: absolute;
  top: -5px;
  right: -5px;
  font-size: 0.875rem;
}

.demand-indicator {
  margin-left: var(--spacing-1);
  font-size: 0.875rem;
}

.tech-categories {
  space-y: var(--spacing-4);
}

.category-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tech-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.tech-chip {
  display: flex;
  align-items: center;
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--glass-surface);
  border: var(--border-glass);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-normal) ease;
  position: relative;
}

.tech-chip.active {
  background: var(--glass-cyber);
  border-color: var(--clear-cyan);
  color: var(--clear-cyan);
}

.tech-chip.user-skill {
  border-color: var(--clear-success);
}

.skill-match-indicator {
  color: var(--clear-success);
  margin-left: var(--spacing-1);
}

.stack-match-score {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1-5);
  background: var(--glass-bg);
  border: 1px solid
    color-mix(
      in srgb,
      var(--color-info-500, var(--color-info)) 60%,
      transparent
    );
  color: var(--color-info-500, var(--color-info));
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: var(--badge-font-weight);
}

.culture-preferences {
  space-y: var(--spacing-3);
}

.culture-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background: var(--glass-surface);
  border: var(--border-glass);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-normal) ease;
}

.culture-item:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.culture-item.active {
  background: var(--glass-gaming);
  border-color: var(--clear-pink);
  color: var(--clear-pink);
}

.culture-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-surface-strong);
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.culture-name {
  font-weight: 600;
  margin-bottom: var(--spacing-1);
}

.culture-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.enhanced-job-grid {
  display: grid;
  gap: clamp(1rem, 2.5vw, 1.5rem);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all var(--duration-normal) ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.ai-chat-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  z-index: var(--z-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: all var(--duration-normal) ease;
}

.ai-chat-overlay.active {
  opacity: 1;
  pointer-events: auto;
}

.ai-chat-container {
  width: 90vw;
  max-width: 600px;
  max-height: 80vh;
  background: var(--glass-ultra-bg);
  border: var(--border-glass);
  border-radius: var(--radius-2xl);
  backdrop-filter: var(--glass-mega-blur);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.ai-chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--glass-surface);
  border-bottom: 1px solid var(--glass-border);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
  position: sticky;
  top: 0;
  z-index: 2;
}

.ai-chat-header::before {
  content: "";
  position: absolute;
  background: linear-gradient(
    transparent,
    transparent
  );
  pointer-events: none;
}

.ai-chat-content {
  display: flex;
  flex-direction: column;
}

.chat-messages {
  overflow-y: auto;
  background: var(--glass-surface);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(var(--glass-backdrop-blur));
  -webkit-backdrop-filter: blur(var(--glass-backdrop-blur));
}

.chat-message {
  border-radius: var(--radius-card);
  display: flex;
}

.chat-message.user,
.chat-message.message-user {
  background: var(--glass-primary);
  margin-left: auto;
  color: var(--clear-cyan);
}

.chat-message.ai,
.chat-message.message-ai {
  background: var(--glass-surface);
  margin-right: auto;
}

.message-avatar {
  background: var(--glass-bg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.message-content {
  overflow-wrap: anywhere;
}
.message-text {
  white-space: pre-wrap;
}
.message-text a {
  text-decoration: underline;
}
.message-text code {
  font-family: var(
    --font-mono,
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    "Liberation Mono",
    "Courier New",
    monospace
  );
  background: var(--surface-elevated);
}
.message-text pre {
  font-family: var(
    --font-mono,
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    "Liberation Mono",
    "Courier New",
    monospace
  );
  background: var(--surface-elevated);
  overflow: auto;
  white-space: pre;
}

.chat-input {
  background: linear-gradient(
    to top,
    var(--glass-bg)
  );
  backdrop-filter: var(--glass-backdrop-blur-md);
  -webkit-backdrop-filter: var(--glass-backdrop-blur-md);
}

  .interactive-job-discovery {
  }

  .discovery-actions {
    flex-direction: column;
  }

  .enhanced-recommendations-grid,
  .enhanced-filters-grid {
  }

  .enhanced-job-grid {
  }

  .role-chips,
  .tech-chips {
    flex-direction: column;
  }

  .ai-chat-container {
  }
}
</style>
