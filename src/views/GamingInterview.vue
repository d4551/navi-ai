<template>
  <div class="gaming-interview-hub">
    <!-- Animated Background -->
    <div class="bg-particles">
      <div class="particle"></div>
      <div class="particle"></div>
      <div class="particle"></div>
    </div>

    <div class="container">
      <!-- Header with Logo -->
      <header class="header">
        <div class="logo-section">
          <div class="logo-container">
            <div class="logo-icon">🎮</div>
            <div class="logo-text">
              <h2 class="logo-title">NAVI</h2>
              <p class="logo-subtitle">Interview Prep</p>
            </div>
          </div>
        </div>
        <h1>Interview Preparation Hub</h1>
        <p>
          Master your gaming industry interviews with AI-powered preparation
        </p>
      </header>

      <!-- Navigation Tabs -->
      <nav class="nav-tabs">
        <button
          class="nav-tab"
          :class="{ active: activeTab === 'prep' }"
          @click="activeTab = 'prep'"
        >
          <span>🎙️</span>
          <span>Interview Prep</span>
        </button>
        <button
          class="nav-tab"
          :class="{ active: activeTab === 'studio' }"
          @click="activeTab = 'studio'"
        >
          <span>🏢</span>
          <span>Target Studio</span>
        </button>
        <button
          class="nav-tab"
          :class="{ active: activeTab === 'persona' }"
          @click="activeTab = 'persona'"
        >
          <span>👤</span>
          <span>Interview Persona</span>
        </button>
        <button
          class="nav-tab"
          :class="{ active: activeTab === 'setup' }"
          @click="activeTab = 'setup'"
        >
          <span>⚙️</span>
          <span>Session Setup</span>
        </button>
      </nav>

      <!-- Main Layout -->
      <div class="main-layout">
        <!-- Left Content -->
        <div class="content-area">
          <!-- Interview Prep Tab -->
          <div v-if="activeTab === 'prep'" class="card">
            <h2 class="section-title">
              <span>🚀</span>
              Quick Start
            </h2>
            <div class="quick-start-grid">
              <div
                v-for="option in quickSetupOptions"
                :key="option.id"
                class="action-card"
                @click="selectQuickSetup(option)"
              >
                <div class="action-icon" :class="option.colorClass">
                  {{ option.emoji }}
                </div>
                <h3 class="action-title">{{ option.title }}</h3>
                <p class="action-desc">{{ option.description }}</p>
                <button class="btn btn-primary">
                  <span>Start Now</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            <!-- Performance Stats -->
            <div class="card" style="margin-top: 2rem">
              <h2 class="section-title">
                <span>📈</span>
                Your Performance
              </h2>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-value">{{ userStats.sessionsComplete }}</div>
                  <div class="stat-label">Sessions Complete</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">{{ userStats.averageScore }}%</div>
                  <div class="stat-label">Average Score</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">{{ userStats.practiceTime }}</div>
                  <div class="stat-label">Practice Time</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">
                    {{ userStats.questionsMastered }}
                  </div>
                  <div class="stat-label">Questions Mastered</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Studio Selection Tab -->
          <div v-if="activeTab === 'studio'" class="card studios-section">
            <div class="section-header">
              <h2 class="section-title">
                <span>🏢</span>
                Select Target Studio
              </h2>
              <button class="btn btn-secondary">
                <span>🤖</span>
                <span>AI Recommend</span>
              </button>
            </div>

            <div class="search-bar">
              <input
                v-model="searchQuery"
                type="text"
                class="search-input"
                placeholder="Search studios (e.g., Riot, Epic, Ubisoft)"
              />
              <button class="btn btn-secondary">Search</button>
            </div>

            <div class="filter-chips">
              <div
                v-for="filter in studioFilters"
                :key="filter.value"
                class="chip"
                :class="{ active: selectedFilter === filter.value }"
                @click="selectedFilter = filter.value"
              >
                {{ filter.label }}
              </div>
            </div>

            <div class="studios-grid">
              <div
                v-for="studio in filteredStudios"
                :key="studio.id"
                class="studio-card"
                @click="selectStudio(studio)"
              >
                <div class="studio-info">
                  <div class="studio-name">{{ studio.name }}</div>
                  <div class="studio-location">
                    {{ studio.location || "Multiple Locations" }}
                  </div>
                </div>
                <div class="studio-action">
                  <button class="btn btn-secondary">Choose</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Interview Persona Tab -->
          <div v-if="activeTab === 'persona'" class="card">
            <h2 class="section-title">
              <span>👤</span>
              Interview Persona
            </h2>
            <div class="persona-grid">
              <div
                v-for="persona in interviewPersonas"
                :key="persona.id"
                class="persona-card"
                :class="{ selected: config.personaId === persona.id }"
                @click="selectPersona(persona)"
              >
                <div class="persona-avatar">{{ persona.avatar }}</div>
                <h3>{{ persona.name }}</h3>
                <p>{{ persona.description }}</p>
                <div class="persona-traits">
                  <span
                    v-for="trait in persona.traits"
                    :key="trait"
                    class="trait-tag"
                  >
                    {{ trait }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Session Setup Tab -->
          <div v-if="activeTab === 'setup'" class="card">
            <h2 class="section-title">
              <span>⚙️</span>
              Session Configuration
            </h2>
            <div class="setup-form">
              <div class="form-row">
                <div class="form-field">
                  <label>Target Role</label>
                  <select v-model="config.roleType" class="form-select">
                    <option
                      v-for="role in roleOptions"
                      :key="role.value"
                      :value="role.value"
                    >
                      {{ role.label }}
                    </option>
                  </select>
                </div>
                <div class="form-field">
                  <label>Experience Level</label>
                  <select v-model="config.experienceLevel" class="form-select">
                    <option
                      v-for="level in experienceOptions"
                      :key="level.value"
                      :value="level.value"
                    >
                      {{ level.label }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field">
                  <label>Duration</label>
                  <select v-model="config.duration" class="form-select">
                    <option
                      v-for="duration in durationOptions"
                      :key="duration.value"
                      :value="duration.value"
                    >
                      {{ duration.label }}
                    </option>
                  </select>
                </div>
                <div class="form-field">
                  <label>Question Count</label>
                  <select v-model="config.questionCount" class="form-select">
                    <option
                      v-for="count in questionCountOptions"
                      :key="count.value"
                      :value="count.value"
                    >
                      {{ count.label }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Sidebar - Progress Overview -->
        <div class="progress-overview">
          <div class="card">
            <div class="progress-header">
              <h3 class="progress-title">Prep Progress</h3>
              <span class="progress-percent">{{ progressPercent }}%</span>
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: progressPercent + '%' }"
              ></div>
            </div>
            <div class="progress-steps">
              <div
                v-for="(step, index) in progressSteps"
                :key="step.id"
                class="progress-step"
                :class="{
                  active: currentStep === index,
                  completed: index < currentStep,
                }"
              >
                <div class="step-number">
                  <span v-if="index < currentStep">✓</span>
                  <span v-else>{{ index + 1 }}</span>
                </div>
                <div class="step-info">
                  <div class="step-title">{{ step.title }}</div>
                  <div class="step-desc">{{ step.description }}</div>
                </div>
              </div>
            </div>
            <div class="progress-actions">
              <button
                class="btn btn-secondary"
                :disabled="currentStep === 0"
                @click="goToStep(currentStep - 1)"
              >
                ← Back
              </button>
              <button class="btn btn-primary" @click="nextStep">Next →</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pro Tip -->
      <div class="pro-tip">
        <span class="pro-tip-icon">💡</span>
        <div class="pro-tip-text">
          <strong>Pro Tip:</strong> Use "Target Studio" to select your company,
          "Interview Persona" to customize the interviewer style, and "Session
          Setup" to fine-tune difficulty and question types.
        </div>
      </div>
    </div>

    <!-- Loading Modal -->
    <div v-if="isLoading" class="loading-modal">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p>{{ loadingMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { GAMING_STUDIOS } from '@/data/gaming-studios';
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';

import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";

// Services
import { GAMING_STUDIOS } from "@/shared/constants/gaming-studios";
import aiInterviewService from "@/services/AIInterviewService";

const _router = useRouter();

// State
const activeTab = ref("prep");
const isLoading = ref(false);
const loadingMessage = ref("");
const searchQuery = ref("");
const selectedFilter = ref("all");
const currentStep = ref(0);

// Configuration
const config = ref({
  studioId: "",
  studioName: "",
  roleType: "software-engineer",
  experienceLevel: "mid",
  duration: 30,
  questionCount: 8,
  personaId: "",
  includeBehavioral: true,
  includeTechnical: true,
  includeStudioSpecific: true,
  enableVoiceMode: true,
  enableRealTimeAnalysis: true,
});

// User stats
const userStats = ref({
  sessionsComplete: 12,
  averageScore: 85,
  practiceTime: "4.5h",
  questionsMastered: 47,
});

// Progress tracking
const progressSteps = ref([
  {
    id: "prep",
    title: "Interview Prep",
    description: "Overview completed",
  },
  {
    id: "studio",
    title: "Target Studio",
    description: "Select your company",
  },
  {
    id: "persona",
    title: "Interview Persona",
    description: "Choose interviewer style",
  },
  {
    id: "setup",
    title: "Session Setup",
    description: "Configure settings",
  },
]);

// Studio filters
const studioFilters = ref([
  { value: "all", label: "All" },
  { value: "aaa", label: "AAA" },
  { value: "indie", label: "Indie" },
  { value: "mobile", label: "Mobile" },
  { value: "platform", label: "Platform" },
]);

// Interview personas
const interviewPersonas = ref([
  {
    id: "friendly-senior",
    name: "Friendly Senior Dev",
    avatar: "😊",
    description: "Supportive and encouraging, focuses on growth mindset",
    traits: ["Patient", "Mentoring", "Collaborative"],
  },
  {
    id: "strict-lead",
    name: "Strict Tech Lead",
    avatar: "🧐",
    description: "Direct and challenging, expects precise technical answers",
    traits: ["Analytical", "Detail-oriented", "High Standards"],
  },
  {
    id: "creative-director",
    name: "Creative Director",
    avatar: "🎨",
    description: "Vision-focused, interested in creative problem solving",
    traits: ["Innovative", "Visionary", "Design-focused"],
  },
  {
    id: "startup-founder",
    name: "Startup Founder",
    avatar: "🚀",
    description: "Fast-paced, entrepreneurial mindset, versatility focused",
    traits: ["Agile", "Risk-taking", "Multi-skilled"],
  },
]);

// Quick setup options
const quickSetupOptions = [
  {
    id: "practice-interview",
    title: "Practice Interview",
    description: "Jump straight into a mock interview session with AI feedback",
    emoji: "▶️",
    colorClass: "purple",
    config: {
      roleType: "software-engineer",
      experienceLevel: "mid",
      duration: 30,
      questionCount: 8,
      includeTechnical: true,
      includeBehavioral: true,
      includeStudioSpecific: false,
    },
  },
  {
    id: "generate-questions",
    title: "Generate Questions",
    description: "Get personalized questions based on your target role",
    emoji: "🧠",
    colorClass: "blue",
    config: {
      roleType: "game-designer",
      experienceLevel: "mid",
      duration: 0, // Just generate questions
      questionCount: 10,
      includeTechnical: false,
      includeBehavioral: true,
      includeStudioSpecific: true,
    },
  },
  {
    id: "create-persona",
    title: "Create Persona",
    description: "Design your interviewer's personality and style",
    emoji: "👔",
    colorClass: "pink",
    config: {
      roleType: "product-manager",
      experienceLevel: "senior",
      duration: 45,
      questionCount: 12,
      includeTechnical: false,
      includeBehavioral: true,
      includeStudioSpecific: true,
    },
  },
  {
    id: "view-analytics",
    title: "View Analytics",
    description: "Track your progress and improvement areas",
    emoji: "📈",
    colorClass: "green",
    config: {
      roleType: "qa-engineer",
      experienceLevel: "entry",
      duration: 20,
      questionCount: 6,
      includeTechnical: true,
      includeBehavioral: true,
      includeStudioSpecific: false,
    },
  },
];

// Options
const roleOptions = [
  { value: "software-engineer", label: "Software Engineer" },
  { value: "game-designer", label: "Game Designer" },
  { value: "technical-artist", label: "Technical Artist" },
  { value: "product-manager", label: "Product Manager" },
  { value: "qa-engineer", label: "QA Engineer" },
  { value: "data-analyst", label: "Data Analyst" },
  { value: "ui-ux-designer", label: "UI/UX Designer" },
  { value: "community-manager", label: "Community Manager" },
];

const experienceOptions = [
  { value: "entry", label: "Entry Level (0-2 years)" },
  { value: "junior", label: "Junior (2-4 years)" },
  { value: "mid", label: "Mid Level (4-7 years)" },
  { value: "senior", label: "Senior (7+ years)" },
  { value: "principal", label: "Principal (12+ years)" },
];

const durationOptions = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "60 minutes" },
];

const questionCountOptions = [
  { value: 5, label: "5 questions" },
  { value: 8, label: "8 questions" },
  { value: 10, label: "10 questions" },
  { value: 12, label: "12 questions" },
  { value: 15, label: "15 questions" },
];

// Computed
const filteredStudios = computed(() => {
  let studios = Object.values(GAMING_STUDIOS);

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    studios = studios.filter(
      (studio) =>
        studio.name.toLowerCase().includes(query) ||
        studio.description?.toLowerCase().includes(query) ||
        studio.category?.toLowerCase().includes(query),
    );
  }

  // Apply category filter
  if (selectedFilter.value !== "all") {
    studios = studios.filter(
      (studio) =>
        studio.category?.toLowerCase() === selectedFilter.value.toLowerCase(),
    );
  }

  return studios.slice(0, 12);
});

const isConfigValid = computed(() => {
  return (
    config.value.roleType &&
    config.value.experienceLevel &&
    config.value.duration > 0
  );
});

const progressPercent = computed(() => {
  return Math.round(
    ((currentStep.value + 1) / progressSteps.value.length) * 100,
  );
});

// Methods
function selectQuickSetup(option) {
  Object.assign(config.value, option.config);

  // Select a default studio
  const studios = Object.values(GAMING_STUDIOS);
  config.value.studioId = studios[0].id;
  config.value.studioName = studios[0].name;

  // Navigate to appropriate tab or start interview
  if (option.id === "generate-questions") {
    activeTab.value = "setup";
  } else if (option.id === "create-persona") {
    activeTab.value = "persona";
  } else if (option.id === "view-analytics") {
    // Show analytics modal or navigate to analytics page
    console.log("View analytics");
  } else {
    startInterview();
  }
}

function selectStudio(studio) {
  config.value.studioId = studio.id;
  config.value.studioName = studio.name;

  // Add studio context for enhanced AI generation
  config.value.studioContext = {
    type: studio.category || "AAA",
    technologies: studio.technologies || [],
    gameGenres: studio.games || [],
    culture: studio.culture || {},
    headquarters: studio.headquarters || studio.location,
    size: studio.size,
  };

  nextStep();
}

function selectPersona(persona) {
  config.value.personaId = persona.id;

  // Add persona context for enhanced AI generation
  config.value.persona = {
    id: persona.id,
    name: persona.name,
    archetype: persona.name,
    tone: persona.traits?.[0]?.toLowerCase() || "professional",
    focusAreas: persona.traits || [],
    interviewStyle:
      persona.description || "Professional gaming industry interview",
  };

  nextStep();
}

function goToStep(stepIndex) {
  if (stepIndex >= 0 && stepIndex < progressSteps.value.length) {
    currentStep.value = stepIndex;
    const tabs = ["prep", "studio", "persona", "setup"];
    activeTab.value = tabs[stepIndex];
  }
}

function nextStep() {
  if (currentStep.value < progressSteps.value.length - 1) {
    currentStep.value++;
    const tabs = ["prep", "studio", "persona", "setup"];
    activeTab.value = tabs[currentStep.value];
  } else {
    // All steps complete, start interview
    startInterview();
  }
}

async function startInterview() {
  if (!isConfigValid.value) {
    console.warn("Interview configuration incomplete");
    return;
  }

  isLoading.value = true;
  loadingMessage.value = "Preparing your gaming interview session...";

  try {
    const sessionResult = await aiInterviewService.startInterviewSession({
      ...config.value,
      type: "studio-interview",
    });

    if (sessionResult.success && sessionResult.session) {
      const sessionId = sessionResult.session.id;
      router.push(`/interview-session/${sessionId}`);
    } else {
      throw new Error(
        sessionResult.error || "Failed to start interview session",
      );
    }
  } catch (_error) {
    console.error("Failed to start interview:", error);
    loadingMessage.value = "Error: " + error.message;
    setTimeout(() => {
      isLoading.value = false;
    }, 2000);
  }
}
// Watch for tab changes to update step
watch(
  activeTab,
  (newTab) => {
    const tabIndex = ["prep", "studio", "persona", "setup"].indexOf(newTab);
    if (tabIndex !== -1) {
      currentStep.value = tabIndex;
    }
  },
  { immediate: true },
);
</script>

<style scoped>
:root {
  --primary: #7c3aed;
  --primary-glow: #a78bfa;
  --secondary: #ec4899;
  --accent: #06b6d4;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --dark: #0f172a;
  --dark-secondary: #1e293b;
  --dark-tertiary: #334155;
  --light: #f8fafc;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --glass: rgba(30, 41, 59, 0.5);
  --glass-border: rgba(148, 163, 184, 0.1);
  --gradient-purple: linear-gradient(135deg, var(--primary), var(--secondary));
  --gradient-blue: linear-gradient(135deg, var(--accent), #0891b2);
  --gradient-pink: linear-gradient(135deg, var(--secondary), #db2777);
}

.gaming-interview-hub {
  font-family:
    "Inter",
    -apple-system,
    system-ui,
    sans-serif;
  background: var(--dark);
  color: var(--text-primary);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.bg-particles {
  position: fixed;
  pointer-events: none;
}

.particle {
  position: absolute;
}

  background: var(--primary);
}

  background: var(--secondary);
}

  background: var(--accent);
}

@keyframes float {
  }
  }
  }
  }
}

.container {
  max-width: var(--page-container-max-width);
  padding: var(--spacing-lg);
  position: relative;
}

.header {
  text-align: center;
}

.logo-section {
  display: flex;
  justify-content: center;
}

.logo-container {
  display: flex;
  align-items: center;
  background: var(--glass);
}

.logo-container:hover {
}

.logo-icon {
}

.logo-text {
  text-align: left;
}

.logo-title {
  background: var(--gradient-purple);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-subtitle {
  color: var(--text-secondary);
}

  background: var(--gradient-purple);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header p {
  color: var(--text-secondary);
}

.nav-tabs {
  display: flex;
  background: var(--glass);
}

.nav-tab {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.nav-tab::before {
  content: "";
  position: absolute;
  background: var(--gradient-purple);
}

.nav-tab:hover {
  color: var(--text-primary);
}

.nav-tab.active {
  color: white;
}

.nav-tab.active::before {
}

.nav-tab span {
  position: relative;
}

.main-layout {
  display: grid;
}

.card {
  background: var(--glass);
  position: relative;
  overflow: hidden;
}

.card::after {
  content: "";
  position: absolute;
  background: var(--gradient-purple);
}

.card:hover {
}

.card:hover::after {
}

.section-title {
  display: flex;
  align-items: center;
}

.quick-start-grid {
  display: grid;
}

.action-card {
  background: var(--glass);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.action-card:hover {
  border-color: var(--primary-glow);
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon.purple {
  background: var(--gradient-purple);
}
.action-icon.blue {
  background: var(--gradient-blue);
}
.action-icon.pink {
  background: var(--gradient-pink);
}
.action-icon.green {
}

.action-title {
}

.action-desc {
  color: var(--text-secondary);
}

.stats-grid {
  display: grid;
}

.stat-card {
  background: var(--glass);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: "";
  position: absolute;
  background: radial-gradient(
    circle,
  );
}

@keyframes rotate {
  }
  }
}

.stat-card:hover {
  border-color: var(--primary);
}

.stat-value {
  background: var(--gradient-purple);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

.stat-label {
  color: var(--text-secondary);
  text-transform: uppercase;
  position: relative;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.search-bar {
  display: flex;
}

.search-input {
  background: var(--glass);
  color: var(--text-primary);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
}

.chip {
  background: var(--glass);
  cursor: pointer;
}

.chip:hover {
  border-color: var(--primary);
}

.chip.active {
  background: var(--gradient-purple);
  border-color: transparent;
  color: white;
}

.studios-grid {
  display: grid;
}

.studios-section {
}

.studio-card {
  background: var(--glass);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.studio-card::before {
  content: "";
  position: absolute;
  transition:
}

.studio-card:hover::before {
}

.studio-card:hover {
  border-color: var(--primary);
}

.studio-info {
  position: relative;
}

.studio-name {
}

.studio-location {
  color: var(--text-secondary);
}

.studio-action {
  position: relative;
}

.persona-grid {
  display: grid;
}

.persona-card {
  background: var(--glass);
  text-align: center;
  cursor: pointer;
}

.persona-card:hover {
  background: var(--glass-hover);
  border-color: var(--primary);
}

.persona-card.selected {
  border-color: var(--primary);
}

.persona-avatar {
}

}

.persona-card p {
  color: var(--text-secondary);
}

.persona-traits {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.trait-tag {
  background: var(--glass);
}

.setup-form {
  display: flex;
  flex-direction: column;
}

.form-row {
  display: grid;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.form-field label {
}

.form-select {
  background: var(--glass);
  color: var(--text-primary);
}

.form-select:focus {
  outline: none;
  border-color: var(--primary);
}

.btn {
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: "";
  position: absolute;
  background: linear-gradient(
  );
}

.btn:hover::before {
}

.btn-primary {
  background: var(--gradient-purple);
  color: white;
}

.btn-primary:hover {
}

.btn-secondary {
  background: var(--glass);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: var(--glass-hover);
}

.progress-overview {
  position: sticky;
}

.progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.progress-title {
}

.progress-percent {
  color: var(--text-secondary);
}

.progress-bar {
  background: var(--glass);
  overflow: hidden;
}

.progress-fill {
  background: var(--gradient-purple);
}

.progress-steps {
  display: flex;
  flex-direction: column;
}

.progress-step {
  display: flex;
  align-items: center;
  background: var(--glass);
}

.progress-step.active {
  border-color: var(--primary);
}

.progress-step.completed {
}

.step-number {
  background: var(--gradient-purple);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.step-info {
}

.step-title {
}

.step-desc {
  color: var(--text-secondary);
}

.progress-actions {
  display: flex;
}

.progress-actions .btn {
}

.pro-tip {
  display: flex;
  align-items: start;
}

.pro-tip-icon {
}

.pro-tip-text {
}

.loading-modal {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  background: var(--card-bg);
  text-align: center;
}

.loading-spinner {
}

@keyframes spin {
  }
  }
}

@keyframes fadeInDown {
  from {
  }
  to {
  }
}

@keyframes fadeInUp {
  from {
  }
  to {
  }
}

  .main-layout {
  }

  .progress-overview {
    position: static;
  }
}

  .container {
    padding: var(--spacing-md);
  }

  }

  .quick-start-grid {
  }

  .nav-tabs {
    flex-direction: column;
  }

  .studios-grid {
  }

  .stats-grid {
  }

  .form-row {
  }
}
</style>
