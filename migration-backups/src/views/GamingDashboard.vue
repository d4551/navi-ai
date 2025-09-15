<template>
  <div class="gaming-dashboard">
    <!-- Animated Background -->
    <div class="background-animation"></div>
    
    <!-- Dashboard Container -->
    <div class="container-xl p-4 gap-6">
      <!-- Dashboard Header -->
      <header class="dashboard-header">
        <h1 class="main-title">Gaming Career Hub</h1>
        <p class="subtitle">Your complete gaming industry career platform</p>
      </header>

      <!-- Gamification HUD -->
      <section class="glass-strong p-6 rounded-lg mb-6">
        <div class="flex items-center justify-between gap-6 flex-wrap">
          <div class="level-info">
            <div class="level-badge">🏆</div>
            <div class="level-text">
              <div class="level-number">Level {{ userLevel }}</div>
              <div class="level-title">{{ levelTitle }}</div>
            </div>
          </div>
          
          <div class="xp-bar">
            <div class="xp-bar-bg">
              <div class="xp-bar-fill" :style="{ width: xpPercentage + '%' }"></div>
            </div>
            <div class="xp-text">{{ currentXP }} / {{ requiredXP }} XP</div>
          </div>

          <div class="streak-counter">
            <span class="streak-icon">🔥</span>
            <span>{{ streakDays }} Day Streak</span>
          </div>

          <div class="hud-actions">
            <UnifiedButton variant="gaming" size="sm" leading-icon="mdi-target" @click="showQuests = true">
              Daily Quests
            </UnifiedButton>
            <UnifiedButton variant="gaming" size="sm" leading-icon="mdi-trophy" @click="showAchievements = true">
              Achievements
            </UnifiedButton>
          </div>
        </div>
      </section>

      <!-- Quick Actions Grid -->
      <section class="quick-actions">
        <div 
          v-for="action in quickActions" 
          :key="action.id"
          class="glass p-6 rounded-lg neon-interactive"
          @click="handleQuickAction(action)"
        >
          <div class="action-icon">{{ action.icon }}</div>
          <h3 class="action-title">{{ action.title }}</h3>
          <p class="action-description">{{ action.description }}</p>
          <UnifiedButton variant="primary" class="action-btn">
            {{ action.buttonText }}
          </UnifiedButton>
        </div>
      </section>

      <!-- Content Grid -->
      <div class="content-grid">
        <!-- Left Column -->
        <div class="left-column">
          <!-- AI Assistant Panel -->
          <div class="glass-strong p-6 rounded-lg">
            <div class="panel-header">
              <div class="panel-title-group">
                <div class="panel-icon">💬</div>
                <div class="panel-info">
                  <div class="panel-title">AI Assistant</div>
                  <div class="panel-subtitle">Get instant help and guidance</div>
                </div>
              </div>
              <UnifiedButton variant="ghost" size="sm" icon-only leading-icon="mdi-fullscreen" />
            </div>
            <div class="ai-assistant-content">
              <div class="ai-avatar">🤖</div>
              <p class="ai-message">AI Assistant ready to help with your gaming career!</p>
              <UnifiedButton variant="primary" @click="startAIConversation">
                Start Conversation
              </UnifiedButton>
            </div>
          </div>

          <!-- Activity Timeline -->
          <div class="glass p-6 rounded-lg mt-4">
            <div class="panel-header">
              <div class="panel-title-group">
                <div class="panel-icon">⏰</div>
                <div class="panel-info">
                  <div class="panel-title">Recent Activity</div>
                  <div class="panel-subtitle">Your latest career actions</div>
                </div>
              </div>
              <UnifiedButton variant="ghost" size="sm" icon-only leading-icon="mdi-refresh" @click="refreshActivity" />
            </div>
            <div class="activity-list">
              <div 
                v-for="activity in recentActivity" 
                :key="activity.id"
                class="activity-item"
                :class="{ 'animate-in': activity.isNew }"
              >
                <div class="activity-icon-wrapper">
                  <AppIcon :name="activity.icon" />
                </div>
                <div class="activity-details">
                  <div class="activity-description">{{ activity.description }}</div>
                  <div class="activity-timestamp">{{ formatTimeAgo(activity.timestamp) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="right-column">
          <!-- Gaming Skills Panel -->
          <div class="panel skills-panel">
            <div class="panel-header">
              <div class="panel-title-group">
                <div class="panel-icon">⭐</div>
                <div class="panel-info">
                  <div class="panel-title">Gaming Skills</div>
                  <div class="panel-subtitle">Your technical expertise</div>
                </div>
              </div>
              <UnifiedButton variant="ghost" size="sm" icon-only leading-icon="mdi-plus" @click="addSkill" />
            </div>
            <div class="skills-content">
              <div class="skills-grid">
                <div 
                  v-for="skill in topSkills" 
                  :key="skill.name"
                  class="skill-chip"
                  :class="{ active: skill.isActive }"
                  @click="toggleSkill(skill)"
                >
                  {{ skill.name }}
                  <span v-if="skill.level" class="skill-level">{{ skill.level }}</span>
                </div>
              </div>
              <UnifiedButton variant="glass" class="manage-skills-btn" @click="openSkillManager">
                Manage All Skills
              </UnifiedButton>
            </div>
          </div>

          <!-- Top Gaming Studios Panel -->
          <div class="panel studios-panel">
            <div class="panel-header">
              <div class="panel-title-group">
                <div class="panel-icon">🏢</div>
                <div class="panel-info">
                  <div class="panel-title">Top Gaming Studios</div>
                  <div class="panel-subtitle">Industry leaders to watch</div>
                </div>
              </div>
              <UnifiedButton variant="ghost" size="sm" icon-only leading-icon="mdi-heart" @click="toggleFavorites" />
            </div>
            <div class="studios-list">
              <div 
                v-for="studio in featuredStudios" 
                :key="studio.id"
                class="studio-item"
                @click="exploreStudio(studio)"
              >
                <div class="studio-name">{{ studio.name }}</div>
                <div class="studio-description">{{ studio.description }}</div>
                <div class="studio-meta">
                  <span class="studio-badge">{{ studio.location }}</span>
                  <span class="studio-badge">{{ studio.employeeCount }}+ employees</span>
                </div>
              </div>
            </div>
            <UnifiedButton variant="glass" class="explore-studios-btn" @click="openStudioExplorer">
              Explore All Studios
            </UnifiedButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <div v-if="showQuests" class="modal-overlay" @click.self="showQuests = false">
      <div class="quest-modal">
        <div class="modal-header">
          <h2>Daily Quests</h2>
          <UnifiedButton variant="ghost" size="sm" icon-only leading-icon="mdi-close" @click="showQuests = false" />
        </div>
        <div class="quest-list">
          <div v-for="quest in dailyQuests" :key="quest.id" class="quest-item">
            <div class="quest-info">
              <div class="quest-title">{{ quest.title }}</div>
              <div class="quest-description">{{ quest.description }}</div>
              <div class="quest-reward">Reward: {{ quest.xpReward }} XP</div>
            </div>
            <div class="quest-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: (quest.progress / quest.total * 100) + '%' }"></div>
              </div>
              <span class="progress-text">{{ quest.progress }}/{{ quest.total }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAchievements" class="modal-overlay" @click.self="showAchievements = false">
      <div class="achievements-modal">
        <div class="modal-header">
          <h2>Achievements</h2>
          <UnifiedButton variant="ghost" size="sm" icon-only leading-icon="mdi-close" @click="showAchievements = false" />
        </div>
        <div class="achievements-grid">
          <div v-for="achievement in achievements" :key="achievement.id" class="achievement-item" :class="{ unlocked: achievement.unlocked }">
            <div class="achievement-icon">{{ achievement.icon }}</div>
            <div class="achievement-info">
              <div class="achievement-title">{{ achievement.title }}</div>
              <div class="achievement-description">{{ achievement.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI Conversation Modal -->
    <div v-if="showAIConversation" class="modal-overlay" @click.self="showAIConversation = false">
      <div class="ai-conversation-modal">
        <div class="modal-header">
          <h2>AI Career Assistant</h2>
          <UnifiedButton variant="ghost" size="sm" icon-only leading-icon="mdi-close" @click="showAIConversation = false" />
        </div>
        <div class="conversation-content">
          <div class="conversation-messages">
            <div
              v-for="(message, index) in conversationMessages"
              :key="index"
              :class="['message', message.role]"
            >
              <div class="message-avatar">
                {{ message.role === 'user' ? '👤' : '🤖' }}
              </div>
              <div class="message-content">
                <div class="message-text">{{ message.content }}</div>
                <div class="message-time">{{ formatMessageTime(message.timestamp) }}</div>
              </div>
            </div>
            <div v-if="isLoading" class="message ai">
              <div class="message-avatar">🤖</div>
              <div class="message-content">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
          <div class="conversation-input">
            <input
              v-model="userInput"
              type="text"
              placeholder="Ask about gaming careers, resume tips, or interview advice..."
              :disabled="isLoading"
              @keypress.enter="sendMessage"
            />
            <UnifiedButton 
              variant="primary" 
              :disabled="!userInput.trim() || isLoading"
              leading-icon="mdi-send"
              @click="sendMessage"
            >
              Send
            </UnifiedButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '@/composables/useToast'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { initializeAI, chatWithAI } from '@/shared/services/AIService'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
  buttonText: string
  route?: string
  action?: () => void
}

interface Activity {
  id: string
  description: string
  icon: string
  timestamp: Date
  isNew?: boolean
}

interface Skill {
  name: string
  level?: number
  isActive?: boolean
}

interface Studio {
  id: string
  name: string
  description: string
  location: string
  employeeCount: number
}

interface Quest {
  id: string
  title: string
  description: string
  progress: number
  total: number
  xpReward: number
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
}

const router = useRouter()
const toast = useToast()

// Reactive data
const showQuests = ref(false)
const showAchievements = ref(false)
const showAIConversation = ref(false)
const conversationMessages = ref<Array<{ role: 'user' | 'ai' | 'system'; content: string; timestamp: Date }>>([])
const userInput = ref('')
const isLoading = ref(false)
const aiSessionId = ref<string>('dashboard-ai-session')
const aiInitialized = ref(false)

// User progression
const userLevel = ref(1)
const levelTitle = computed(() => {
  if (userLevel.value < 5) return 'Rookie Developer'
  if (userLevel.value < 10) return 'Junior Game Dev'
  if (userLevel.value < 20) return 'Senior Game Dev'
  return 'Game Dev Master'
})
const currentXP = ref(350)
const requiredXP = ref(1000)
const xpPercentage = computed(() => (currentXP.value / requiredXP.value) * 100)
const streakDays = ref(3)

// Quick Actions
const quickActions: QuickAction[] = [
  {
    id: 'resume',
    title: 'Resume Builder',
    description: 'AI-powered resume optimization for gaming industry roles',
    icon: '📝',
    buttonText: 'Build Resume',
    route: '/documents'
  },
  {
    id: 'jobs',
    title: 'Job Search',
    description: 'Find gaming opportunities worldwide',
    icon: '🔍',
    buttonText: 'Search Jobs',
    route: '/jobs'
  },
  {
    id: 'studios',
    title: 'Studios Explorer',
    description: 'Discover gaming companies and culture',
    icon: '🏢',
    buttonText: 'Explore Studios',
    route: '/studios/network'
  },
  {
    id: 'interview',
    title: 'AI Interview',
    description: 'Practice with AI-powered scenarios',
    icon: '🎤',
    buttonText: 'Start Practice',
    route: '/interview-prep'
  }
]

// Recent Activity
const recentActivity = ref<Activity[]>([
  {
    id: '1',
    description: 'Resume updated with Unity experience',
    icon: 'mdi-file-document-edit',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    id: '2',
    description: 'Applied to 3 Game Developer positions',
    icon: 'mdi-send',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
  },
  {
    id: '3',
    description: 'Achievement unlocked: Portfolio Master',
    icon: 'mdi-trophy',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
  }
])

// Skills
const topSkills = ref<Skill[]>([
  { name: 'Unity', level: 4, isActive: true },
  { name: 'Unreal Engine', level: 3, isActive: false },
  { name: 'Godot', level: 2, isActive: false },
  { name: 'Blender', level: 3, isActive: true },
  { name: 'Maya', level: 2, isActive: false },
  { name: 'C#', level: 4, isActive: true },
  { name: 'Game Design', level: 3, isActive: true },
  { name: 'Level Design', level: 2, isActive: false }
])

// Featured Studios
const featuredStudios = ref<Studio[]>([
  {
    id: '1',
    name: 'Riot Games',
    description: 'Creators of League of Legends and VALORANT',
    location: 'Los Angeles, CA',
    employeeCount: 5000
  },
  {
    id: '2',
    name: 'Electronic Arts',
    description: 'Publisher of FIFA, The Sims, and Battlefield',
    location: 'Redwood City, CA',
    employeeCount: 10000
  },
  {
    id: '3',
    name: 'Ubisoft',
    description: 'Developer of Assassin\'s Creed and Far Cry',
    location: 'Montreal, Canada',
    employeeCount: 20000
  }
])

// Daily Quests
const dailyQuests = ref<Quest[]>([
  {
    id: '1',
    title: 'Complete Your Profile',
    description: 'Add skills and experience to your profile',
    progress: 2,
    total: 5,
    xpReward: 50
  },
  {
    id: '2',
    title: 'Apply to Jobs',
    description: 'Submit applications to gaming positions',
    progress: 1,
    total: 3,
    xpReward: 75
  },
  {
    id: '3',
    title: 'Network Building',
    description: 'Connect with industry professionals',
    progress: 0,
    total: 2,
    xpReward: 100
  }
])

// Achievements
const achievements = ref<Achievement[]>([
  {
    id: '1',
    title: 'First Steps',
    description: 'Created your first resume',
    icon: '🚀',
    unlocked: true
  },
  {
    id: '2',
    title: 'Job Hunter',
    description: 'Applied to 10 positions',
    icon: '🎯',
    unlocked: true
  },
  {
    id: '3',
    title: 'Portfolio Master',
    description: 'Completed your portfolio',
    icon: '🏆',
    unlocked: true
  },
  {
    id: '4',
    title: 'Network Builder',
    description: 'Connected with 25 professionals',
    icon: '🤝',
    unlocked: false
  },
  {
    id: '5',
    title: 'Interview Ace',
    description: 'Completed 5 AI interview sessions',
    icon: '⭐',
    unlocked: false
  }
])

// Methods
function handleQuickAction(action: QuickAction) {
  if (action.route) {
    router.push(action.route)
  } else if (action.action) {
    action.action()
  }
}

function startAIConversation() {
  showAIConversation.value = true
  // Add welcome message if this is the first conversation
  if (conversationMessages.value.length === 0) {
    conversationMessages.value.push({
      role: 'ai',
      content: 'Hello! I\'m your AI Career Assistant. I can help you with gaming industry career advice, resume tips, interview preparation, and more. What would you like to discuss today?',
      timestamp: new Date()
    })
  }
}

async function sendMessage() {
  if (!userInput.value.trim() || isLoading.value) return
  
  const message = userInput.value.trim()
  userInput.value = ''
  
  // Add user message to conversation
  conversationMessages.value.push({
    role: 'user',
    content: message,
    timestamp: new Date()
  })
  
  isLoading.value = true
  
  try {
    // Ensure AI is initialized
    if (!aiInitialized.value) {
      const result = await initializeAI()
      if (!result.success) {
        throw new Error(result.message || 'Failed to initialize AI')
      }
      aiInitialized.value = true
    }

    // Build minimal context from last few messages
    const recent = conversationMessages.value.slice(-6)
    const context = recent
      .map(m => `${m.role === 'user' ? 'User' : m.role === 'ai' ? 'Assistant' : 'System'}: ${m.content}`)
      .join('\n')

    // Call canonical AI service
    const response = await chatWithAI({
      message,
      context,
      type: 'chat',
      sessionId: aiSessionId.value,
    })

    const aiText = response?.content || 'Sorry, I could not generate a response.'
    conversationMessages.value.push({
      role: 'ai',
      content: aiText,
      timestamp: new Date()
    })
    
    // Add XP for using AI assistant
    currentXP.value += 10
    toast.success('+10 XP for using AI Assistant!')
    
  } catch (error) {
    console.error('AI conversation error:', error)
    toast.error(error instanceof Error ? error.message : 'Failed to get AI response. Please try again.')
  } finally {
    isLoading.value = false
  }
}

// removed simulated generateAIResponse; using real AI service

function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function refreshActivity() {
  // Add a new activity for demo
  const newActivity: Activity = {
    id: Date.now().toString(),
    description: 'Refreshed activity feed',
    icon: 'mdi-refresh',
    timestamp: new Date(),
    isNew: true
  }
  recentActivity.value.unshift(newActivity)
  
  setTimeout(() => {
    const index = recentActivity.value.findIndex(a => a.id === newActivity.id)
    if (index >= 0) {
      recentActivity.value[index].isNew = false
    }
  }, 1000)
}

function toggleSkill(skill: Skill) {
  skill.isActive = !skill.isActive
  toast.success(`${skill.name} ${skill.isActive ? 'activated' : 'deactivated'}`)
}

function addSkill() {
  router.push('/skill-mapper')
}

function openSkillManager() {
  router.push('/skill-mapper')
}

function exploreStudio(studio: Studio) {
  toast.info(`Exploring ${studio.name}...`)
  router.push('/studio-networking')
}

function openStudioExplorer() {
  router.push('/studio-networking')
}

function toggleFavorites() {
  // Navigate to Studios view with networking tab if available
  router.push('/studios/network')
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInHours / 24)
  
  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours} hours ago`
  if (diffInDays === 1) return '1 day ago'
  return `${diffInDays} days ago`
}

onMounted(() => {
  // Animate XP bar on load
  setTimeout(() => {
    const xpBar = document.querySelector('.xp-bar-fill') as HTMLElement
    if (xpBar) {
      xpBar.style.transition = 'width 1s ease-out'
    }
  }, 500)

  // Lazy-init AI in background so first message is fast
  ;(async () => {
    try {
      const result = await initializeAI()
      aiInitialized.value = !!result?.success
    } catch (e) {
      // Non-fatal: user can still use rest of dashboard
      console.warn('AI pre-initialization failed:', e)
    }
  })()
})
</script>

<style scoped>
/* CSS Variables */
:root {
  --primary: #7C3AED;
  --primary-dark: #6D28D9;
  --primary-light: #A78BFA;
  --secondary: #06B6D4;
  --accent: #F59E0B;
  --success: #10B981;
  --danger: #EF4444;
  --glow: rgba(124, 58, 237, 0.4);
}

/* Main Layout */
.gaming-dashboard {
  min-height: 100vh;
  background: var(--dark);
  color: var(--text-primary);
  position: relative;
  overflow-x: hidden;
}

/* Animated Background */
.background-animation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.background-animation::before,
.background-animation::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
}

.background-animation::before {
  width: 500px;
  height: 500px;
  background: var(--primary);
  top: -150px;
  right: -150px;
  animation: float 20s ease-in-out infinite;
}

.background-animation::after {
  width: 600px;
  height: 600px;
  background: var(--secondary);
  bottom: -200px;
  left: -200px;
  animation: float 25s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(30px, -30px) rotate(120deg); }
  66% { transform: translate(-20px, 20px) rotate(240deg); }
}

.dashboard-container {
  max-width: var(--page-container-max-width);
  margin: 0 auto;
  padding: var(--spacing-lg);
  position: relative;
  z-index: 1;
}

/* Header */
.dashboard-header {
  text-align: center;
  margin-bottom: 3rem;
}

.main-title {
  font-size: 3rem;
  font-weight: 900;
  background: linear-gradient(135deg, var(--primary-light), var(--secondary), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  animation: gradientShift 4s ease infinite;
  background-size: 200% 200%;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1.125rem;
  margin: 0;
}

/* Gamification HUD */
.gamification-hud {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-blur);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
}

.gamification-hud::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--primary), var(--secondary), transparent);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.hud-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.level-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.level-badge {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 10px 30px var(--glow);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 10px 30px var(--glow); }
  50% { transform: scale(1.05); box-shadow: 0 15px 40px var(--glow); }
}

.level-text {
  display: flex;
  flex-direction: column;
}

.level-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.level-title {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.xp-bar {
  flex: 1;
  min-width: 200px;
}

.xp-bar-bg {
  height: 12px;
  background: var(--dark-tertiary);
  border-radius: 20px;
  overflow: hidden;
  position: relative;
}

.xp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  transition: width 1s ease-out;
}

.xp-bar-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shimmer 2s infinite;
}

.xp-text {
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.streak-counter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, var(--accent), var(--danger));
  border-radius: 12px;
  color: white;
  font-weight: 600;
}

.streak-icon {
  font-size: 1.25rem;
  animation: flicker 2s ease-in-out infinite;
}

@keyframes flicker {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.1) rotate(-5deg); }
  75% { transform: scale(1.1) rotate(5deg); }
}

.hud-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

/* Quick Actions Grid */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.action-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-blur);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, var(--primary) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.action-card:hover {
  transform: translateY(-5px) scale(1.02);
  border-color: var(--primary);
  box-shadow: 0 20px 40px rgba(124, 58, 237, 0.3);
}

.action-card:hover::before {
  opacity: 0.1;
}

.action-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.action-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.action-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.action-btn {
  width: 100%;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* Panels */
.panel {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-blur);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--glass-border);
}

.panel-title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.panel-icon {
  width: 40px;
  height: 40px;
  background: var(--dark-tertiary);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

/* removed legacy panel-title/panel-subtitle to use Tailwind plugin mappings */

/* AI Assistant */
.ai-assistant-content {
  background: var(--dark-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.ai-avatar {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.ai-message {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

/* Activity Timeline */
.activity-list {
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--glass-border);
  transition: all 0.3s ease;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-item.animate-in {
  animation: slideInLeft 0.5s ease-out;
}

@keyframes slideInLeft {
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.activity-icon-wrapper {
  width: 40px;
  height: 40px;
  background: var(--dark-tertiary);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-details {
  flex: 1;
}

.activity-description {
  color: var(--text-primary);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.activity-timestamp {
  color: var(--text-muted);
  font-size: 0.75rem;
}

/* Skills */
.skills-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skills-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.skill-chip {
  padding: 0.5rem 1rem;
  background: var(--dark-tertiary);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  font-size: 0.875rem;
  color: var(--text-primary);
  transition: all 0.3s;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.skill-chip:hover {
  background: var(--primary);
  border-color: var(--primary);
  transform: scale(1.05);
}

.skill-chip.active {
  background: var(--primary);
  border-color: var(--primary);
}

.skill-level {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 0.125rem 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.manage-skills-btn,
.explore-studios-btn {
  width: 100%;
  margin-top: 1rem;
}

/* Studios */
.studios-list {
  max-height: 300px;
  overflow-y: auto;
}

.studio-item {
  padding: 1rem;
  background: var(--dark-secondary);
  border-radius: 12px;
  margin-bottom: 1rem;
  transition: all 0.3s;
  cursor: pointer;
}

.studio-item:hover {
  background: var(--dark-tertiary);
  transform: translateX(5px);
}

.studio-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.studio-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 0.5rem;
}

.studio-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.studio-badge {
  padding: 0.25rem 0.75rem;
  background: var(--glass-surface);
  border-radius: 12px;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-4);
}

.quest-modal,
.achievements-modal {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  backdrop-filter: var(--glass-backdrop-blur);
  width: 100%;
  max-width: var(--page-narrow-width);
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--glass-border);
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.quest-list {
  padding: 1.5rem;
}

.quest-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--dark-secondary);
  border-radius: 12px;
  margin-bottom: 1rem;
}

.quest-info {
  flex: 1;
}

.quest-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.quest-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.quest-reward {
  color: var(--accent);
  font-size: 0.75rem;
  font-weight: 600;
}

.quest-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 100px;
}

.progress-bar {
  width: 80px;
  height: 6px;
  background: var(--dark-tertiary);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.achievements-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  padding: 1.5rem;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--dark-secondary);
  border-radius: 12px;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.achievement-item.unlocked {
  opacity: 1;
  border: 1px solid var(--accent);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
}

.achievement-icon {
  font-size: 2rem;
}

.achievement-info {
  flex: 1;
}

.achievement-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.achievement-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* AI Conversation Modal */
.ai-conversation-modal {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  backdrop-filter: var(--glass-backdrop-blur);
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.conversation-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 400px;
}

.conversation-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
  gap: 0.75rem;
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: var(--secondary);
}

.message-content {
  max-width: 70%;
  background: var(--dark-secondary);
  border-radius: 18px;
  padding: 0.75rem 1rem;
  position: relative;
}

.message.user .message-content {
  background: var(--primary);
  color: white;
}

.message-text {
  margin-bottom: 0.25rem;
  line-height: 1.4;
}

.message-time {
  font-size: 0.75rem;
  color: var(--text-muted);
  opacity: 0.7;
}

.message.user .message-time {
  color: rgba(255, 255, 255, 0.7);
}

.typing-indicator {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-secondary);
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.conversation-input {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--glass-border);
  background: var(--dark-tertiary);
}

.conversation-input input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  background: var(--dark);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.conversation-input input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
}

.conversation-input input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }

  .main-title {
    font-size: 2rem;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }

  .hud-content {
    flex-direction: column;
    align-items: stretch;
  }

  .modal-overlay {
    padding: 1rem;
  }

  .achievements-grid {
    grid-template-columns: 1fr;
  }
}
</style>
