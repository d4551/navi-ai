<template>
  <div class="unified-game-experience" class="font-sans">
    <!-- Canonical theme styles handled globally to prevent CORB issues -->
    
    <!-- Sam & Max Easter Eggs -->
    <SamMaxEasterEggs 
      ref="easterEggsRef"
      @easter-egg-found="handleEasterEgg"
      @achievement-unlocked="handleAchievement"
    />
    
    <!-- Gamification Effects System -->
    <GamificationEffects 
      ref="gamificationRef"
      :user-id="userId"
      @achievement-unlocked="handleAchievement"
      @level-up="handleLevelUp"
      @xp-gained="handleXPGain"
    />
    
    <!-- Enhanced Easter Eggs -->
    <EasterEggs
      ref="advancedEasterEggsRef"
      :enable-sounds="enableSounds"
      :enable-visual-effects="enableVisualEffects"
      @easter-egg-found="handleEasterEgg"
      @achievement-unlocked="handleAchievement"
    />
    
    <!-- Interactive Job Discovery -->
    <Teleport to="body">
      <InteractiveJobDiscovery
        v-if="showJobDiscovery"
        @close="showJobDiscovery = false"
      />
    </Teleport>
    
    <!-- Global RGB Accent System -->
    <div class="rgb-accent-system">
      <div class="rgb-glow-effects" :class="{ active: rgbEffectsActive }">
        <div v-for="n in 20" :key="n" class="rgb-particle" :style="getParticleStyle(n)"></div>
      </div>
    </div>
    
    <!-- Global Navigation Enhancement -->
    <nav v-if="enhanceNavigation" class="enhanced-navi-system">
      <div class="navi-quick-actions">
        <button 
          v-for="action in quickActions" 
          :key="action.name"
          class="razer-btn rgb-accent quick-action-btn"
          :title="action.description"
          @click="triggerQuickAction(action)"
        >
          <AppIcon :name="action.icon" />
          <span>{{ action.name }}</span>
        </button>
      </div>
    </nav>
    
    <!-- Global Notifications System -->
    <div class="global-notifications">
      <Transition name="notification-slide" appear>
        <div v-if="currentNotification" class="game-notification razer-glass-card section-card rgb-accent">
          <div class="notification-icon">
            <AppIcon :name="currentNotification.icon" />
          </div>
          <div class="notification-content">
            <h4>{{ currentNotification.title }}</h4>
            <p>{{ currentNotification.message }}</p>
          </div>
          <button class="notification-close" @click="dismissNotification">×</button>
        </div>
      </Transition>
    </div>
    
    <!-- Console Command Interface -->
    <div v-if="showConsole" class="global-console razer-glass-card section-card">
      <div class="console-header">
        <span>NAVI Debug Console - Sam & Max Mode</span>
        <button @click="toggleConsole">×</button>
      </div>
      <div class="console-output">
        <div v-for="line in consoleHistory" :key="line.id" class="console-line" :class="line.type">
          {{ line.text }}
        </div>
      </div>
      <div class="console-input">
        <span class="prompt">NAVI> </span>
        <input 
          ref="consoleInputRef" 
          v-model="consoleCommand"
          placeholder="Enter command... (type 'help' for commands)"
          @keyup.enter="executeCommand"
        />
      </div>
    </div>
    
    <!-- Background Ambience -->
    <audio ref="ambiencePlayer" loop :volume="ambienceVolume">
      <source src="/sounds/navi-office-ambience.mp3" type="audio/mpeg">
      <source src="/sounds/sam-max-office.wav" type="audio/wav">
    </audio>
  </div>
</template>

<script setup lang="ts">
import { UserIcon, StarIcon, TrophyIcon, BoltIcon, RocketLaunchIcon } from '@heroicons/vue/24/outline'

import AppIcon from '@/components/ui/AppIcon.vue';

import { ref, reactive, computed, nextTick, onMounted, onUnmounted, defineEmits } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SamMaxEasterEggs from './SamMaxEasterEggs.vue'
import GamificationEffects from './GamificationEffects.vue'
import EasterEggs from './EasterEggs.vue'
import InteractiveJobDiscovery from './InteractiveJobDiscovery.vue'

const __router = useRouter()
const __route = useRoute()

// Props
interface Props {
  userId?: string
  enableSounds?: boolean
  enableVisualEffects?: boolean
  enhanceNavigation?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  userId: 'default-user',
  enableSounds: true,
  enableVisualEffects: true,
  enhanceNavigation: true
})

// Emits
const emit = defineEmits(['theme-changed', 'easter-egg-activated', 'command-executed'])

// Reactive state
const showJobDiscovery = ref(false)
const showConsole = ref(false)
const rgbEffectsActive = ref(true)
const currentNotification = ref(null)
const consoleCommand = ref('')
const consoleHistory = ref([])
const ambienceVolume = ref(0.3)

// Component refs
const easterEggsRef = ref()
const gamificationRef = ref()
const advancedEasterEggsRef = ref()
const consoleInputRef = ref()
const ambiencePlayer = ref()

// Theme styles handled globally to prevent CORB issues

// Quick actions for enhanced navigation
const quickActions = reactive([
  { name: 'The Board', icon: 'mdi-clipboard-search', action: 'navigate', route: '/jobs', description: 'Browse gaming jobs' },
  { name: 'The Profile', icon: 'mdi-briefcase-variant', action: 'navigate', route: '/portfolio', description: 'Manage your gaming portfolio' },
  { name: 'NAVI Chat', icon: 'mdi-robot-excited', action: 'toggle-chat', description: 'Talk with NAVI AI' },
  { name: 'Easter Eggs', icon: 'mdi-egg-easter', action: 'show-easter-eggs', description: 'Discover hidden features' },
  { name: 'Sam Mode', icon: 'UserIcon-tie', action: 'activate-sam', description: 'Activate Sam mode' },
  { name: 'Max Mode', icon: 'BoltIcon', action: 'activate-max', description: 'Activate Max mode' },
])

// Console commands
const consoleCommands = {
  'help': () => 'Commands: theme, sam, max, adventure, jobs, profile, navi, konami, matrix, party, reset, clear',
  'theme': (args: string[]) => {
    const mode = args[0] || 'toggle'
    if (mode === 'dark') {
      setTheme('dark')
      return 'Theme set to dark mode'
    } else if (mode === 'light') {
      setTheme('light')
      return 'Theme set to light mode'
    } else {
      toggleTheme()
      return 'Theme toggled'
    }
  },
  'sam': () => {
    easterEggsRef.value?.activateSamMode()
    return 'Sam mode activated - "We better solve this case professionally..."'
  },
  'max': () => {
    easterEggsRef.value?.activateMaxMode()
    return 'Max mode activated - "Let\'s destroy something! For justice!"'
  },
  'adventure': () => {
    easterEggsRef.value?.activateAdventureMode()
    return 'Adventure mode activated - Point and click your way to success!'
  },
  'jobs': () => {
    __router.push('/jobs')
    return 'Navigating to The Board...'
  },
  'profile': () => {
    __router.push('/portfolio')
    return 'Opening The Profile...'
  },
  'navi': () => {
    showNotification({
      title: 'NAVI Online',
      message: 'Hey! Listen! I\'m here to help with your gaming career!',
      icon: 'mdi-face-woman-shimmer'
    })
    return 'NAVI is ready to assist!'
  },
  'konami': () => {
    activateKonamiMode()
    return '↑↑↓↓←→←→BA - Ultimate cheat code activated!'
  },
  'matrix': () => {
    activateMatrixMode()
    return 'Welcome to the Matrix... of gaming careers'
  },
  'party': () => {
    activatePartyMode()
    return '[SUCCESS] PARTY TIME! RGB effects at maximum!'
  },
  'reset': () => {
    resetAllEffects()
    return 'All effects reset to default'
  },
  'clear': () => {
    consoleHistory.value = []
    return ''
  },
  'discover': () => {
    showJobDiscovery.value = true
    return 'Opening Interactive Job Discovery...'
  },
  'stats': () => {
    return `User: ${props.userId} | Easter Eggs Found: ${getEasterEggCount()} | Level: ${getUserLevel()}`
  }
}

// Methods
const triggerQuickAction = (action: any) => {
  switch (action.action) {
    case 'navigate':
      __router.push(action.route)
      break
    case 'toggle-chat':
      // Toggle NAVI chat
      emit('theme-changed', { action: 'toggle-chat' })
      break
    case 'show-easter-eggs':
      advancedEasterEggsRef.value?.startGamingQuotes()
      break
    case 'activate-sam':
      easterEggsRef.value?.activateSamMode()
      break
    case 'activate-max':
      easterEggsRef.value?.activateMaxMode()
      break
  }
}

const executeCommand = () => {
  const fullCommand = consoleCommand.value.trim()
  const [command, ...args] = fullCommand.toLowerCase().split(' ')
  
  // Add command to history
  addToConsoleHistory(`> ${fullCommand}`, 'command')
  
  if (consoleCommands[command]) {
    try {
      const result = consoleCommands[command](args)
      if (result) {
        addToConsoleHistory(result, 'output')
      }
    } catch (error) {
      addToConsoleHistory(`Error: ${error.message}`, 'error')
    }
  } else {
    addToConsoleHistory(`Unknown command: ${command}. Type 'help' for available commands.`, 'error')
  }
  
  consoleCommand.value = ''
  emit('command-executed', { command, args, timestamp: Date.now() })
  
  // Scroll console to bottom
  nextTick(() => {
    const output = document.querySelector('.console-output')
    if (output) {
      output.scrollTop = output.scrollHeight
    }
  })
}

const addToConsoleHistory = (text: string, type: 'command' | 'output' | 'error') => {
  consoleHistory.value.push({
    id: Date.now(),
    text,
    type,
    timestamp: new Date().toLocaleTimeString()
  })
  
  // Limit history to last 100 entries
  if (consoleHistory.value.length > 100) {
    consoleHistory.value = consoleHistory.value.slice(-100)
  }
}

const toggleConsole = () => {
  showConsole.value = !showConsole.value
  if (showConsole.value) {
    nextTick(() => {
      consoleInputRef.value?.focus()
    })
  }
}

const handleEasterEgg = (event: any) => {
  showNotification({
    title: 'Easter Egg Found!',
    message: `You discovered: ${event.name || event.type}! (+${event.points || 50} XP)`,
    icon: '🥚'
  })
  
  // Trigger XP gain in gamification system
  gamificationRef.value?.triggerXPGain(event.points || 50, `Found ${event.name || event.type}`, 'bonus')
  
  emit('easter-egg-activated', event)
}

const handleAchievement = (achievement: any) => {
  showNotification({
    title: 'Achievement Unlocked!',
    message: achievement.description || achievement.name,
    icon: 'TrophyIcon'
  })
}

const handleLevelUp = (levelData: any) => {
  showNotification({
    title: `Level Up! Level ${levelData.level}`,
    message: 'Your gaming career skills are evolving!',
    icon: 'StarIcon'
  })
}

const handleXPGain = (xpData: any) => {
  // Handle XP notifications if needed
}

const showNotification = (notification: any) => {
  currentNotification.value = notification
  setTimeout(() => {
    currentNotification.value = null
  }, 5000)
}

const dismissNotification = () => {
  currentNotification.value = null
}

const getParticleStyle = (index: number) => {
  const colors = ['#00ff88', '#00d9ff', '#a855f7', '#ff006e', '#ff5722', '#ffee00']
  const color = colors[index % colors.length]
  const delay = (index * 0.2) + 's'
  const duration = (2 + Math.random() * 3) + 's'
  const x = Math.random() * 100 + '%'
  const y = Math.random() * 100 + '%'
  
  return {
    '--particle-color': color,
    '--animation-delay': delay,
    '--animation-duration': duration,
    left: x,
    top: y
  }
}

const setTheme = (theme: 'light' | 'dark') => {
  document.documentElement.setAttribute('data-theme', theme)
  emit('theme-changed', { theme })
}

const toggleTheme = () => {
  const current = document.documentElement.getAttribute('data-theme') || 'light'
  const newTheme = current === 'light' ? 'dark' : 'light'
  setTheme(newTheme)
}

const activateKonamiMode = () => {
  document.body.classList.add('konami-ultimate-mode')
  rgbEffectsActive.value = true
  
  // Trigger all easter egg modes
  easterEggsRef.value?.activateSamMode()
  setTimeout(() => easterEggsRef.value?.activateMaxMode(), 1000)
  setTimeout(() => easterEggsRef.value?.activateAdventureMode(), 2000)
  
  // Play special sound
  if (props.enableSounds && ambiencePlayer.value) {
    ambiencePlayer.value.volume = 0.1
    ambiencePlayer.value.play().catch(() => {})
  }
  
  setTimeout(() => {
    document.body.classList.remove('konami-ultimate-mode')
    resetAllEffects()
  }, 15000)
}

const activateMatrixMode = () => {
  document.body.classList.add('matrix-career-mode')
  setTimeout(() => {
    document.body.classList.remove('matrix-career-mode')
  }, 10000)
}

const activatePartyMode = () => {
  document.body.classList.add('rgb-party-mode')
  rgbEffectsActive.value = true
  
  setTimeout(() => {
    document.body.classList.remove('rgb-party-mode')
  }, 20000)
}

const resetAllEffects = () => {
  const classes = [
    'konami-ultimate-mode', 'matrix-career-mode', 'rgb-party-mode',
    'sam-mode', 'max-mode', 'adventure-mode'
  ]
  
  classes.forEach(className => {
    document.body.classList.remove(className)
  })
  
  rgbEffectsActive.value = true
  
  if (ambiencePlayer.value) {
    ambiencePlayer.value.pause()
  }
}

const getEasterEggCount = () => {
  // Return stored easter egg count
  return parseInt(localStorage.getItem('navi-easter-eggs') || '0')
}

const getUserLevel = () => {
  // Return stored user level
  return parseInt(localStorage.getItem('navi-user-level') || '1')
}

// Keyboard shortcuts
const handleGlobalKeypress = (event: KeyboardEvent) => {
  // Ctrl + Shift + ~ for console
  if (event.ctrlKey && event.shiftKey && event.key === '~') {
    event.preventDefault()
    toggleConsole()
  }
  
  // Ctrl + Shift + D for job discovery
  if (event.ctrlKey && event.shiftKey && event.key === 'D') {
    event.preventDefault()
    showJobDiscovery.value = true
  }
  
  // Escape to close modals
  if (event.key === 'Escape') {
    showConsole.value = false
    showJobDiscovery.value = false
    currentNotification.value = null
  }
}

// Initialize
onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeypress)
  
  // Welcome message
  setTimeout(() => {
    showNotification({
      title: '[GAME] Welcome to NAVI Gaming Career Hub!',
      message: 'Press Ctrl+Shift+~ for console, discover easter eggs, and level up your career!',
      icon: 'RocketLaunchIcon'
    })
  }, 2000)
  
  // Initialize theme
  const savedTheme = localStorage.getItem('navi-theme') || 'dark'
  setTheme(savedTheme as 'light' | 'dark')
  
  // Initialize RGB effects based on user preference
  const rgbPreference = localStorage.getItem('navi-rgb-effects')
  if (rgbPreference !== null) {
    rgbEffectsActive.value = rgbPreference === 'true'
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeypress)
  resetAllEffects()
})

// Expose methods for parent components
defineExpose({
  toggleConsole,
  showJobDiscovery: () => { showJobDiscovery.value = true },
  activateKonamiMode,
  activateMatrixMode,
  activatePartyMode,
  resetAllEffects,
  showNotification
})
</script>

<style scoped>
.unified-game-experience {
  position: relative;
  z-index: 1;
}

/* RGB Accent System */
.rgb-accent-system {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.rgb-glow-effects {
  position: absolute;
  inset: 0;
  overflow: hidden;
  opacity: 0;
  transition: opacity 1s ease;
}

.rgb-glow-effects.active {
  opacity: 0.6;
}

.rgb-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--particle-color, var(--razer-green));
  border-radius: 50%;
  animation: floatParticle var(--animation-duration, 3s) ease-in-out infinite;
  animation-delay: var(--animation-delay, 0s);
}

@keyframes floatParticle {
  0%, 100% { 
    transform: translateY(0) scale(0.5); 
    opacity: 0; 
  }
  50% { 
    transform: translateY(-20px) scale(1); 
    opacity: 1; 
  }
}

/* Enhanced Navigation */
.enhanced-navi-system {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  pointer-events: auto;
}

.navi-quick-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  min-width: auto;
  transition: all var(--animation-normal) var(--easing-standard);
}

.quick-action-btn:hover {
  transform: translateY(-2px) scale(1.05);
}

.quick-action-btn i {
  font-size: 1rem;
}

/* Global Notifications */
.global-notifications {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 10000;
  pointer-events: none;
}

.game-notification {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  max-width: 400px;
  box-shadow: var(--shadow-glass-lg);
  border-l: 4px solid var(--razer-green);
  pointer-events: auto;
}

.notification-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
}

.notification-content h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary-600);
}

.notification-content p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.notification-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all var(--animation-normal) var(--easing-standard);
}

.notification-close:hover {
  background: rgba(255, 0, 0, 0.1);
  color: var(--text-primary-600);
}

.notification-slide-enter-active,
.notification-slide-leave-active {
  transition: all 0.5s var(--easing-bounce);
}

.notification-slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-slide-leave-to {
  transform: translateX(100%) scale(0.8);
  opacity: 0;
}

/* Global Console */
.global-console {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  max-width: 90vw;
  height: 400px;
  display: flex;
  flex-direction: column;
  font-family: 'Courier New', monospace;
  z-index: 10001;
  border: 2px solid var(--razer-green);
  background: rgba(0, 0, 0, 0.95);
  box-shadow: 
    0 0 30px var(--razer-green),
    var(--shadow-2xl);
}

.console-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: var(--razer-green);
  color: black;
  font-weight: bold;
  font-size: 0.9rem;
}

.console-header button {
  background: none;
  border: none;
  color: black;
  font-size: 1.2rem;
  cursor: pointer;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
}

.console-output {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.9);
  scrollbar-width: thin;
  scrollbar-color: var(--razer-green) transparent;
}

.console-output::-webkit-scrollbar {
  width: 6px;
}

.console-output::-webkit-scrollbar-track {
  background: transparent;
}

.console-output::-webkit-scrollbar-thumb {
  background: var(--razer-green);
  border-radius: 3px;
}

.console-line {
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
  line-height: 1.4;
}

.console-line.command {
  color: var(--razer-blue);
}

.console-line.output {
  color: var(--razer-green);
}

.console-line.error {
  color: var(--razer-pink);
}

.console-input {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.9);
  border-t: 1px solid var(--razer-green);
}

.prompt {
  color: var(--razer-green);
  margin-right: 0.5rem;
  font-weight: bold;
  font-size: 0.9rem;
}

.console-input input {
  flex: 1;
  background: none;
  border: none;
  color: var(--razer-green);
  font-family: inherit;
  font-size: 0.85rem;
  outline: none;
}

.console-input input::placeholder {
  color: rgba(0, 255, 136, 0.5);
}

/* Global Mode Classes */
:global(.konami-ultimate-mode) {
  animation: ultimateRainbow 1s linear infinite;
}

@keyframes ultimateRainbow {
  0% { filter: hue-rotate(0deg) saturate(150%) brightness(1.1); }
  25% { filter: hue-rotate(90deg) saturate(200%) brightness(1.2); }
  50% { filter: hue-rotate(180deg) saturate(250%) brightness(1.3); }
  75% { filter: hue-rotate(270deg) saturate(200%) brightness(1.2); }
  100% { filter: hue-rotate(360deg) saturate(150%) brightness(1.1); }
}

:global(.matrix-career-mode) {
  background: radial-gradient(circle at center, rgba(0, 255, 136, 0.1) 0%, rgba(0, 0, 0, 0.9) 100%);
  color: var(--razer-green);
}

:global(.matrix-career-mode *) {
  text-shadow: 0 0 10px var(--razer-green);
}

:global(.rgb-party-mode) {
  animation: partyMode 2s ease-in-out infinite alternate;
}

@keyframes partyMode {
  0% { filter: hue-rotate(0deg) saturate(150%) brightness(1.1); }
  100% { filter: hue-rotate(180deg) saturate(200%) brightness(1.2); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .enhanced-navi-system {
    top: auto;
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
  }

  .navi-quick-actions {
    justify-content: center;
  }

  .quick-action-btn span {
    display: none;
  }

  .global-notifications {
    top: 1rem;
    right: 1rem;
    left: 1rem;
  }

  .game-notification {
    margin: 0;
  }

  .global-console {
    width: 95vw;
    height: 60vh;
    bottom: 1rem;
  }

  .console-header {
    font-size: 0.8rem;
  }

  .console-line {
    font-size: 0.75rem;
  }

  .console-input input {
    font-size: 0.8rem;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .rgb-particle,
  :global(.konami-ultimate-mode),
  :global(.rgb-party-mode) {
    animation: none !important;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .global-console {
    border-width: 3px;
    background: black;
  }

  .game-notification {
    border-width: 3px;
  }
}
</style>
