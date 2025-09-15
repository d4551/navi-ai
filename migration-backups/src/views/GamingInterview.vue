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
        <p>Master your gaming industry interviews with AI-powered preparation</p>
      </header>

      <!-- Navigation Tabs -->
      <nav class="nav-tabs">
        <button class="nav-tab" :class="{ active: activeTab === 'prep' }" @click="activeTab = 'prep'">
          <span>🎙️</span>
          <span>Interview Prep</span>
        </button>
        <button class="nav-tab" :class="{ active: activeTab === 'studio' }" @click="activeTab = 'studio'">
          <span>🏢</span>
          <span>Target Studio</span>
        </button>
        <button class="nav-tab" :class="{ active: activeTab === 'persona' }" @click="activeTab = 'persona'">
          <span>👤</span>
          <span>Interview Persona</span>
        </button>
        <button class="nav-tab" :class="{ active: activeTab === 'setup' }" @click="activeTab = 'setup'">
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
                <div class="action-icon" :class="option.colorClass">{{ option.emoji }}</div>
                <h3 class="action-title">{{ option.title }}</h3>
                <p class="action-desc">{{ option.description }}</p>
                <button class="btn btn-primary">
                  <span>Start Now</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            <!-- Performance Stats -->
            <div class="card" style="margin-top: 2rem;">
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
                  <div class="stat-value">{{ userStats.questionsMastered }}</div>
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
              >
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
                  <div class="studio-location">{{ studio.location || 'Multiple Locations' }}</div>
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
                  <span v-for="trait in persona.traits" :key="trait" class="trait-tag">
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
                    <option v-for="role in roleOptions" :key="role.value" :value="role.value">
                      {{ role.label }}
                    </option>
                  </select>
                </div>
                <div class="form-field">
                  <label>Experience Level</label>
                  <select v-model="config.experienceLevel" class="form-select">
                    <option v-for="level in experienceOptions" :key="level.value" :value="level.value">
                      {{ level.label }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field">
                  <label>Duration</label>
                  <select v-model="config.duration" class="form-select">
                    <option v-for="duration in durationOptions" :key="duration.value" :value="duration.value">
                      {{ duration.label }}
                    </option>
                  </select>
                </div>
                <div class="form-field">
                  <label>Question Count</label>
                  <select v-model="config.questionCount" class="form-select">
                    <option v-for="count in questionCountOptions" :key="count.value" :value="count.value">
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
              <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
            </div>
            <div class="progress-steps">
              <div 
                v-for="(step, index) in progressSteps" 
                :key="step.id"
                class="progress-step"
                :class="{ 
                  active: currentStep === index, 
                  completed: index < currentStep 
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
              <button class="btn btn-secondary" :disabled="currentStep === 0" @click="goToStep(currentStep - 1)">← Back</button>
              <button class="btn btn-primary" @click="nextStep">Next →</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pro Tip -->
      <div class="pro-tip">
        <span class="pro-tip-icon">💡</span>
        <div class="pro-tip-text">
          <strong>Pro Tip:</strong> Use "Target Studio" to select your company, "Interview Persona" to customize the interviewer style, and "Session Setup" to fine-tune difficulty and question types.
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
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

// Services
import { GAMING_STUDIOS } from '@/shared/constants/gaming-studios'
import aiInterviewService from '@/services/AIInterviewService'

const router = useRouter()

// State
const activeTab = ref('prep')
const isLoading = ref(false)
const loadingMessage = ref('')
const searchQuery = ref('')
const selectedFilter = ref('all')
const currentStep = ref(0)

// Configuration
const config = ref({
  studioId: '',
  studioName: '',
  roleType: 'software-engineer',
  experienceLevel: 'mid',
  duration: 30,
  questionCount: 8,
  personaId: '',
  includeBehavioral: true,
  includeTechnical: true,
  includeStudioSpecific: true,
  enableVoiceMode: true,
  enableRealTimeAnalysis: true
})

// User stats
const userStats = ref({
  sessionsComplete: 12,
  averageScore: 85,
  practiceTime: '4.5h',
  questionsMastered: 47
})

// Progress tracking
const progressSteps = ref([
  {
    id: 'prep',
    title: 'Interview Prep',
    description: 'Overview completed'
  },
  {
    id: 'studio',
    title: 'Target Studio',
    description: 'Select your company'
  },
  {
    id: 'persona', 
    title: 'Interview Persona',
    description: 'Choose interviewer style'
  },
  {
    id: 'setup',
    title: 'Session Setup',
    description: 'Configure settings'
  }
])

// Studio filters
const studioFilters = ref([
  { value: 'all', label: 'All' },
  { value: 'aaa', label: 'AAA' },
  { value: 'indie', label: 'Indie' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'platform', label: 'Platform' }
])

// Interview personas
const interviewPersonas = ref([
  {
    id: 'friendly-senior',
    name: 'Friendly Senior Dev',
    avatar: '😊',
    description: 'Supportive and encouraging, focuses on growth mindset',
    traits: ['Patient', 'Mentoring', 'Collaborative']
  },
  {
    id: 'strict-lead',
    name: 'Strict Tech Lead', 
    avatar: '🧐',
    description: 'Direct and challenging, expects precise technical answers',
    traits: ['Analytical', 'Detail-oriented', 'High Standards']
  },
  {
    id: 'creative-director',
    name: 'Creative Director',
    avatar: '🎨',
    description: 'Vision-focused, interested in creative problem solving',
    traits: ['Innovative', 'Visionary', 'Design-focused']
  },
  {
    id: 'startup-founder',
    name: 'Startup Founder',
    avatar: '🚀',
    description: 'Fast-paced, entrepreneurial mindset, versatility focused',
    traits: ['Agile', 'Risk-taking', 'Multi-skilled']
  }
])

// Quick setup options
const quickSetupOptions = [
  {
    id: 'practice-interview',
    title: 'Practice Interview',
    description: 'Jump straight into a mock interview session with AI feedback',
    emoji: '▶️',
    colorClass: 'purple',
    config: {
      roleType: 'software-engineer',
      experienceLevel: 'mid',
      duration: 30,
      questionCount: 8,
      includeTechnical: true,
      includeBehavioral: true,
      includeStudioSpecific: false
    }
  },
  {
    id: 'generate-questions',
    title: 'Generate Questions',
    description: 'Get personalized questions based on your target role',
    emoji: '🧠',
    colorClass: 'blue',
    config: {
      roleType: 'game-designer',
      experienceLevel: 'mid',
      duration: 0, // Just generate questions
      questionCount: 10,
      includeTechnical: false,
      includeBehavioral: true,
      includeStudioSpecific: true
    }
  },
  {
    id: 'create-persona',
    title: 'Create Persona',
    description: "Design your interviewer's personality and style",
    emoji: '👔',
    colorClass: 'pink',
    config: {
      roleType: 'product-manager',
      experienceLevel: 'senior',
      duration: 45,
      questionCount: 12,
      includeTechnical: false,
      includeBehavioral: true,
      includeStudioSpecific: true
    }
  },
  {
    id: 'view-analytics',
    title: 'View Analytics',
    description: 'Track your progress and improvement areas',
    emoji: '📈',
    colorClass: 'green',
    config: {
      roleType: 'qa-engineer',
      experienceLevel: 'entry',
      duration: 20,
      questionCount: 6,
      includeTechnical: true,
      includeBehavioral: true,
      includeStudioSpecific: false
    }
  }
]

// Options
const roleOptions = [
  { value: 'software-engineer', label: 'Software Engineer' },
  { value: 'game-designer', label: 'Game Designer' },
  { value: 'technical-artist', label: 'Technical Artist' },
  { value: 'product-manager', label: 'Product Manager' },
  { value: 'qa-engineer', label: 'QA Engineer' },
  { value: 'data-analyst', label: 'Data Analyst' },
  { value: 'ui-ux-designer', label: 'UI/UX Designer' },
  { value: 'community-manager', label: 'Community Manager' }
]

const experienceOptions = [
  { value: 'entry', label: 'Entry Level (0-2 years)' },
  { value: 'junior', label: 'Junior (2-4 years)' },
  { value: 'mid', label: 'Mid Level (4-7 years)' },
  { value: 'senior', label: 'Senior (7+ years)' },
  { value: 'principal', label: 'Principal (12+ years)' }
]

const durationOptions = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '60 minutes' }
]

const questionCountOptions = [
  { value: 5, label: '5 questions' },
  { value: 8, label: '8 questions' },
  { value: 10, label: '10 questions' },
  { value: 12, label: '12 questions' },
  { value: 15, label: '15 questions' }
]

// Computed
const filteredStudios = computed(() => {
  let studios = Object.values(GAMING_STUDIOS)
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    studios = studios.filter(studio => 
      studio.name.toLowerCase().includes(query) ||
      studio.description?.toLowerCase().includes(query) ||
      studio.category?.toLowerCase().includes(query)
    )
  }
  
  // Apply category filter
  if (selectedFilter.value !== 'all') {
    studios = studios.filter(studio => 
      studio.category?.toLowerCase() === selectedFilter.value.toLowerCase()
    )
  }
  
  return studios.slice(0, 12)
})

const isConfigValid = computed(() => {
  return config.value.roleType && config.value.experienceLevel && config.value.duration > 0
})

const progressPercent = computed(() => {
  return Math.round(((currentStep.value + 1) / progressSteps.value.length) * 100)
})

// Methods
function selectQuickSetup(option) {
  Object.assign(config.value, option.config)
  
  // Select a default studio
  const studios = Object.values(GAMING_STUDIOS)
  config.value.studioId = studios[0].id
  config.value.studioName = studios[0].name
  
  // Navigate to appropriate tab or start interview
  if (option.id === 'generate-questions') {
    activeTab.value = 'setup'
  } else if (option.id === 'create-persona') {
    activeTab.value = 'persona'
  } else if (option.id === 'view-analytics') {
    // Show analytics modal or navigate to analytics page
    console.log('View analytics')
  } else {
    startInterview()
  }
}

function selectStudio(studio) {
  config.value.studioId = studio.id
  config.value.studioName = studio.name
  
  // Add studio context for enhanced AI generation
  config.value.studioContext = {
    type: studio.category || 'AAA',
    technologies: studio.technologies || [],
    gameGenres: studio.games || [],
    culture: studio.culture || {},
    headquarters: studio.headquarters || studio.location,
    size: studio.size
  }
  
  nextStep()
}

function selectPersona(persona) {
  config.value.personaId = persona.id
  
  // Add persona context for enhanced AI generation
  config.value.persona = {
    id: persona.id,
    name: persona.name,
    archetype: persona.name,
    tone: persona.traits?.[0]?.toLowerCase() || 'professional',
    focusAreas: persona.traits || [],
    interviewStyle: persona.description || 'Professional gaming industry interview'
  }
  
  nextStep()
}

function goToStep(stepIndex) {
  if (stepIndex >= 0 && stepIndex < progressSteps.value.length) {
    currentStep.value = stepIndex
    const tabs = ['prep', 'studio', 'persona', 'setup']
    activeTab.value = tabs[stepIndex]
  }
}

function nextStep() {
  if (currentStep.value < progressSteps.value.length - 1) {
    currentStep.value++
    const tabs = ['prep', 'studio', 'persona', 'setup']
    activeTab.value = tabs[currentStep.value]
  } else {
    // All steps complete, start interview
    startInterview()
  }
}

async function startInterview() {
  if (!isConfigValid.value) {
    console.warn('Interview configuration incomplete')
    return
  }

  isLoading.value = true
  loadingMessage.value = 'Preparing your gaming interview session...'

  try {
    const sessionResult = await aiInterviewService.startInterviewSession({
      ...config.value,
      type: 'studio-interview'
    })

    if (sessionResult.success && sessionResult.session) {
      const sessionId = sessionResult.session.id
      router.push(`/interview-session/${sessionId}`)
    } else {
      throw new Error(sessionResult.error || 'Failed to start interview session')
    }
  } catch (error) {
    console.error('Failed to start interview:', error)
    loadingMessage.value = 'Error: ' + error.message
    setTimeout(() => {
      isLoading.value = false
    }, 2000)
  }
}
// Watch for tab changes to update step
watch(activeTab, (newTab) => {
  const tabIndex = ['prep', 'studio', 'persona', 'setup'].indexOf(newTab)
  if (tabIndex !== -1) {
    currentStep.value = tabIndex
  }
}, { immediate: true })
</script>

<style scoped>
:root {
  --primary: #7C3AED;
  --primary-glow: #A78BFA;
  --secondary: #EC4899;
  --accent: #06B6D4;
  --success: #10B981;
  --warning: #F59E0B;
  --danger: #EF4444;
  --dark: #0F172A;
  --dark-secondary: #1E293B;
  --dark-tertiary: #334155;
  --light: #F8FAFC;
  --text-primary: #F1F5F9;
  --text-secondary: #94A3B8;
  --glass: rgba(30, 41, 59, 0.5);
  --glass-border: rgba(148, 163, 184, 0.1);
  --gradient-purple: linear-gradient(135deg, var(--primary), var(--secondary));
  --gradient-blue: linear-gradient(135deg, var(--accent), #0891b2);
  --gradient-pink: linear-gradient(135deg, var(--secondary), #db2777);
}

.gaming-interview-hub {
  font-family: 'Inter', -apple-system, system-ui, sans-serif;
  background: var(--dark);
  color: var(--text-primary);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* Animated Background */
.bg-particles {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  animation: float 20s infinite ease-in-out;
}

.particle:nth-child(1) {
  width: 500px;
  height: 500px;
  background: var(--primary);
  top: -200px;
  left: -200px;
}

.particle:nth-child(2) {
  width: 400px;
  height: 400px;
  background: var(--secondary);
  bottom: -150px;
  right: -150px;
  animation-delay: -5s;
}

.particle:nth-child(3) {
  width: 300px;
  height: 300px;
  background: var(--accent);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -10s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(50px, -30px) scale(1.1); }
  50% { transform: translate(-30px, 50px) scale(0.9); }
  75% { transform: translate(30px, 30px) scale(1.05); }
}

/* Container */
.container {
  max-width: var(--page-container-max-width);
  margin: 0 auto;
  padding: var(--spacing-lg);
  position: relative;
  z-index: 1;
}

/* Header */
.header {
  text-align: center;
  margin-bottom: 3rem;
  animation: fadeInDown 0.8s ease;
}

/* Logo Section */
.logo-section {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  background: var(--glass);
  border-radius: 1rem;
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(20px);
  transition: all 0.3s ease;
}

.logo-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(124, 58, 237, 0.3);
}

.logo-icon {
  font-size: 2rem;
  filter: drop-shadow(0 0 10px rgba(124, 58, 237, 0.5));
}

.logo-text {
  text-align: left;
}

.logo-title {
  font-size: 1.5rem;
  font-weight: 800;
  background: var(--gradient-purple);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: 0.1em;
}

.logo-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 500;
}

.header h1 {
  font-size: 3.5rem;
  font-weight: 900;
  background: var(--gradient-purple);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  letter-spacing: -0.03em;
}

.header p {
  color: var(--text-secondary);
  font-size: 1.25rem;
  font-weight: 400;
}

/* Navigation Tabs */
.nav-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--glass);
  border-radius: 1.25rem;
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(20px);
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.nav-tab {
  flex: 1;
  padding: 1rem 1.5rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  position: relative;
  overflow: hidden;
}

.nav-tab::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-purple);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.nav-tab:hover {
  color: var(--text-primary);
  background: rgba(30, 41, 59, 0.7);
  transform: translateY(-2px);
}

.nav-tab.active {
  color: white;
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
}

.nav-tab.active::before {
  opacity: 1;
}

.nav-tab span {
  position: relative;
  z-index: 1;
}

/* Main Layout */
.main-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  margin-bottom: 2rem;
}

/* Cards */
.card {
  background: var(--glass);
  border-radius: 1.5rem;
  padding: 2rem;
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-purple);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.card:hover::after {
  transform: scaleX(1);
}

/* Section Titles */
.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

/* Quick Start Grid */
.quick-start-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.action-card {
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 1.25rem;
  padding: 2rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
}

.action-card:hover {
  background: rgba(30, 41, 59, 0.7);
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(124, 58, 237, 0.2);
  border-color: var(--primary-glow);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.action-icon.purple { background: var(--gradient-purple); }
.action-icon.blue { background: var(--gradient-blue); }
.action-icon.pink { background: var(--gradient-pink); }
.action-icon.green { background: linear-gradient(135deg, #10b981, #059669); }

.action-title {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.action-desc {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 2rem;
}

.stat-card {
  padding: 1.25rem;
  background: var(--glass);
  border: 1px solid var(--border);
  border-radius: 1rem;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.stat-card:hover {
  transform: scale(1.05);
  border-color: var(--primary);
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  background: var(--gradient-purple);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  z-index: 1;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.25rem;
  position: relative;
  z-index: 1;
}

/* Section Header */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

/* Search Bar */
.search-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  background: var(--glass);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.search-input::placeholder {
  color: var(--text-secondary);
}

/* Filter Chips */
.filter-chips {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.chip {
  padding: 0.5rem 1rem;
  background: var(--glass);
  border: 1px solid var(--border);
  border-radius: 2rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.chip:hover {
  background: rgba(139, 92, 246, 0.1);
  border-color: var(--primary);
}

.chip.active {
  background: var(--gradient-purple);
  border-color: transparent;
  color: white;
}

/* Studios Grid */
.studios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.studios-section {
  grid-column: 1 / -1;
}

.studio-card {
  background: var(--glass);
  border: 1px solid var(--border);
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
}

.studio-card::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(139, 92, 246, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.studio-card:hover::before {
  width: 400%;
  height: 400%;
}

.studio-card:hover {
  transform: translateY(-3px);
  border-color: var(--primary);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.studio-info {
  position: relative;
  z-index: 1;
}

.studio-name {
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.studio-location {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.studio-action {
  position: relative;
  z-index: 1;
}

/* Persona Grid */
.persona-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.persona-card {
  background: var(--glass);
  border: 1px solid var(--border);
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.persona-card:hover {
  background: var(--glass-hover);
  border-color: var(--primary);
}

.persona-card.selected {
  border-color: var(--primary);
  background: rgba(139, 92, 246, 0.1);
}

.persona-avatar {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.persona-card h3 {
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.persona-card p {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.persona-traits {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.trait-tag {
  background: var(--glass);
  border: 1px solid var(--border);
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
}

/* Setup Form */
.setup-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field label {
  font-weight: 600;
  font-size: 0.875rem;
}

.form-select {
  padding: 0.75rem;
  background: var(--glass);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  color: var(--text-primary);
  font-size: 1rem;
}

.form-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2), transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.6s;
}

.btn:hover::before {
  transform: translateX(100%);
}

.btn-primary {
  background: var(--gradient-purple);
  color: white;
  width: 100%;
  box-shadow: 0 4px 20px rgba(124, 58, 237, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(139, 92, 246, 0.4);
}

.btn-secondary {
  background: var(--glass);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: var(--glass-hover);
  transform: translateY(-2px);
}

/* Progress Overview */
.progress-overview {
  position: sticky;
  top: 2rem;
}

.progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.progress-title {
  font-size: 1.25rem;
  font-weight: 700;
}

.progress-percent {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.progress-bar {
  height: 8px;
  background: var(--glass);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 2rem;
}

.progress-fill {
  height: 100%;
  background: var(--gradient-purple);
  border-radius: 4px;
  transition: width 0.5s ease;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
}

.progress-steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.progress-step {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--glass);
  border-radius: 0.75rem;
  border: 1px solid var(--border);
  transition: all 0.3s ease;
}

.progress-step.active {
  background: rgba(139, 92, 246, 0.1);
  border-color: var(--primary);
}

.progress-step.completed {
  opacity: 0.6;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--gradient-purple);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  color: white;
}

.step-info {
  flex: 1;
}

.step-title {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.step-desc {
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.progress-actions {
  margin-top: 2rem;
  display: flex;
  gap: 0.5rem;
}

.progress-actions .btn {
  flex: 1;
}

/* Pro Tip */
.pro-tip {
  grid-column: 1 / -1;
  padding: 1.5rem;
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 1rem;
  display: flex;
  align-items: start;
  gap: 1rem;
}

.pro-tip-icon {
  font-size: 1.5rem;
}

.pro-tip-text {
  flex: 1;
  line-height: 1.6;
}

/* Loading Modal */
.loading-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.loading-content {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  backdrop-filter: blur(20px);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--glass);
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Animations */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .main-layout {
    grid-template-columns: 1fr;
  }
  
  .progress-overview {
    position: static;
  }
}

@media (max-width: 768px) {
  .container {
    padding: var(--spacing-md);
  }
  
  .header h1 {
    font-size: 2.5rem;
  }
  
  .quick-start-grid {
    grid-template-columns: 1fr;
  }
  
  .nav-tabs {
    flex-direction: column;
  }
  
  .studios-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
