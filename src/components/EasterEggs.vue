<template>
  <div class="easter-eggs-container font-sans">
    <!-- Hidden Gaming References -->
    <div v-if="showSecretMenu" class="secret-menu">
      <div class="secret-menu-content">
        <h3>
          <AppIcon
            name="PuzzlePieceIcon"
            color="gaming"
            context="gaming"
            aria-hidden="true"
          />
          Secret Developer Menu
          <AppIcon
            name="PuzzlePieceIcon"
            color="gaming"
            context="gaming"
            aria-hidden="true"
          />
        </h3>
        <div class="secret-options">
          <UnifiedButton variant="gaming" size="sm" @click="activateMatrixMode">
            Matrix Mode
          </UnifiedButton>
          <UnifiedButton variant="cyber" size="sm" @click="activateRetroMode">
            Retro Mode
          </UnifiedButton>
          <UnifiedButton variant="glass" size="sm" @click="activatePartyMode">
            Party Mode
          </UnifiedButton>
          <UnifiedButton
            variant="ghost"
            size="sm"
            @click="showSecretMenu = false"
          >
            Close
          </UnifiedButton>
        </div>
      </div>
    </div>

    <!-- Floating Gaming Icons (Easter Egg) -->
    <div v-if="floatingIconsActive" class="floating-icons">
      <div
        v-for="icon in floatingIcons"
        :key="icon.id"
        class="floating-icon"
        :style="icon.style"
        @click="collectIcon(icon)"
      >
        <AppIcon :name="icon.class" />
      </div>
    </div>

    <!-- Click Counter Easter Egg -->
    <div v-if="showClickChallenge" class="click-challenge">
      <div class="challenge-content">
        <h4>[TARGET] Click Challenge!</h4>
        <p>Can you click {{ targetClicks }} times in {{ timeLeft }}s?</p>
        <div class="challenge-progress">
          <div
            class="progress-bar"
            :style="{ width: `${(currentClicks / targetClicks) * 100}%` }"
          ></div>
        </div>
        <div class="challenge-stats">
          {{ currentClicks }} / {{ targetClicks }}
        </div>
      </div>
    </div>

    <!-- Hidden Studio References -->
    <div v-if="showStudioEggs" class="studio-easter-eggs">
      <div
        v-for="egg in studioEggs"
        :key="egg.id"
        class="studio-egg"
        @click="revealStudioEgg(egg)"
      >
        {{ egg.hint }}
      </div>
    </div>

    <!-- Gaming Quotes Carousel -->
    <div v-if="showGamingQuotes" class="gaming-quotes">
      <Transition name="quote-slide" mode="out-in">
        <div :key="currentQuote.id" class="quote-container">
          <blockquote class="gaming-quote">
            "{{ currentQuote.text }}"
          </blockquote>
          <cite class="quote-source">- {{ currentQuote.source }}</cite>
        </div>
      </Transition>
    </div>

    <!-- Cursor Trail Effect -->
    <div v-if="cursorTrailActive" class="cursor-trail">
      <div
        v-for="(trail, index) in cursorTrails"
        :key="index"
        class="trail-dot"
        :style="trail.style"
      ></div>
    </div>

    <!-- Sound Effects -->
    <audio ref="audioRef" preload="auto">
      <source src="/sounds/achievement.mp3" type="audio/mpeg" />
      <source src="/sounds/level-up.wav" type="audio/wav" />
    </audio>
  </div>
</template>

<script lang="ts">
import { PuzzlePieceIcon } from '@heroicons/vue/24/outline'

import AppIcon from '@/components/ui/AppIcon.vue'

import {
  ref,
  onMounted,
  onUnmounted,
  defineEmits,
  withDefaults,
  defineProps,
  defineExpose,
} from 'vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

// Props
interface Props {
  enableSounds?: boolean
  enableVisualEffects?: boolean
}

const _props = withDefaults(defineProps<Props>(), {
  enableSounds: true,
  enableVisualEffects: true,
})

// Emits
const emit = defineEmits(['easter-egg-found', 'achievement-unlocked'])

// Reactive state
const showSecretMenu = ref(false)
const floatingIconsActive = ref(false)
const showClickChallenge = ref(false)
const showStudioEggs = ref(false)
const showGamingQuotes = ref(false)
const cursorTrailActive = ref(false)

// Click challenge state
const targetClicks = ref(30)
const currentClicks = ref(0)
const timeLeft = ref(10)
const challengeTimer = ref<NodeJS.Timeout>()

// Floating icons
const floatingIcons = ref<any[]>([])
// removed unused animation frame ref (was not used)

// Cursor trail
const cursorTrails = ref<any[]>([])
const trailIndex = ref(0)

// Gaming quotes
const currentQuote = ref({ id: 0, text: '', source: '' })
const quoteTimer = ref<NodeJS.Timeout>()

// Audio
const audioRef = ref<HTMLAudioElement>()

// Easter egg data
const gamingQuotes = [
  { id: 1, text: 'A game is worth a thousand words.', source: 'Sid Meier' },
  {
    id: 2,
    text: 'The best games are easy to learn and hard to master.',
    source: 'Nolan Bushnell',
  },
  {
    id: 3,
    text: 'Players are artists who create their own reality within the game.',
    source: 'Shigeru Miyamoto',
  },
  {
    id: 4,
    text: 'Good games give players meaningful choices.',
    source: 'Sid Meier',
  },
  {
    id: 5,
    text: 'A game designer is an experience architect.',
    source: 'Jesse Schell',
  },
  {
    id: 6,
    text: 'Games are the most elevated form of investigation.',
    source: 'Albert Einstein',
  },
  {
    id: 7,
    text: 'The medium of games is interaction.',
    source: 'Chris Crawford',
  },
  {
    id: 8,
    text: 'Play is the highest form of research.',
    source: 'Albert Einstein',
  },
]

const studioEggs = [
  {
    id: 1,
    hint: '🐍 Hiss... Solid advice',
    studio: 'Kojima Productions',
    revealed: false,
  },
  {
    id: 2,
    hint: 'BoltIcon Sparks fly in the city of Rapture',
    studio: '2K Boston',
    revealed: false,
  },
  {
    id: 3,
    hint: '🧊 Winter is coming... for the undead',
    studio: 'Naughty Dog',
    revealed: false,
  },
  {
    id: 4,
    hint: '🔫 Remember, no Russian',
    studio: 'Infinity Ward',
    revealed: false,
  },
  {
    id: 5,
    hint: '🏰 A man chooses, a slave obeys',
    studio: 'Irrational Games',
    revealed: false,
  },
]

// Konami code tracking
const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65] // ↑↑↓↓←→←→BA
const konamiIndex = ref(0)

// Methods
const activateMatrixMode = () => {
  document.body.classList.add('matrix-mode')
  setTimeout(() => {
    document.body.classList.remove('matrix-mode')
  }, 10000)

  playSound('matrix')
  emit('easter-egg-found', { type: 'matrix', points: 100 })
}

const activateRetroMode = () => {
  document.body.classList.add('retro-mode')
  setTimeout(() => {
    document.body.classList.remove('retro-mode')
  }, 15000)

  playSound('retro')
  emit('easter-egg-found', { type: 'retro', points: 150 })
}

const activatePartyMode = () => {
  startFloatingIcons()
  startCursorTrail()
  document.body.classList.add('party-mode')

  setTimeout(() => {
    stopFloatingIcons()
    stopCursorTrail()
    document.body.classList.remove('party-mode')
  }, 30000)

  playSound('party')
  emit('easter-egg-found', { type: 'party', points: 200 })
}

const startClickChallenge = () => {
  showClickChallenge.value = true
  currentClicks.value = 0
  timeLeft.value = 10

  challengeTimer.value = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      endClickChallenge()
    }
  }, 1000)

  // Add click listener
  document.addEventListener('click', handleChallengeClick)
}

const endClickChallenge = () => {
  showClickChallenge.value = false
  if (challengeTimer.value) {
    clearInterval(challengeTimer.value)
  }
  document.removeEventListener('click', handleChallengeClick)

  if (currentClicks.value >= targetClicks.value) {
    emit('achievement-unlocked', {
      name: 'Speed Clicker',
      description: `Clicked ${targetClicks.value} times in 10 seconds!`,
      points: 300,
    })
  }
}

const handleChallengeClick = () => {
  if (showClickChallenge.value) {
    currentClicks.value++
    if (currentClicks.value >= targetClicks.value) {
      endClickChallenge()
    }
  }
}

const startFloatingIcons = () => {
  floatingIconsActive.value = true
  const icons = [
    'mdi DevicePhoneMobileIcon-variant',
    'mdi DevicePhoneMobileIcon-classic',
    'mdi TrophyIcon-variant',
    'mdi StarIcon',
    'mdi HeartIcon',
    'mdi BoltIcon-bolt',
    'mdi RocketLaunchIcon',
    'mdi mdi-diamond-stone',
  ]

  const createFloatingIcon = () => {
    const icon = {
      id: Date.now() + Math.random(),
      class: icons[Math.floor(Math.random() * icons.length)],
      style: {
        position: 'fixed',
        left: Math.random() * window.innerWidth + 'px',
        top: Math.random() * window.innerHeight + 'px',
        fontSize: '2rem',
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        animation: `floatIcon ${3 + Math.random() * 2}s ease-in-out infinite`,
        zIndex: 1000,
        pointerEvents: 'auto',
        cursor: 'pointer',
      },
    }

    floatingIcons.value.push(icon)

    // Remove icon after animation
    setTimeout(() => {
      const index = floatingIcons.value.findIndex(i => i.id === icon.id)
      if (index > -1) {
        floatingIcons.value.splice(index, 1)
      }
    }, 5000)
  }

  // Create icons periodically
  const createIcon = () => {
    if (floatingIconsActive.value) {
      createFloatingIcon()
      setTimeout(createIcon, 500 + Math.random() * 1000)
    }
  }
  createIcon()
}

const stopFloatingIcons = () => {
  floatingIconsActive.value = false
  floatingIcons.value = []
}

const collectIcon = (icon: any) => {
  // Remove the collected icon
  const index = floatingIcons.value.findIndex(i => i.id === icon.id)
  if (index > -1) {
    floatingIcons.value.splice(index, 1)
    playSound('collect')
    emit('easter-egg-found', { type: 'icon-collect', points: 25 })
  }
}

const startCursorTrail = () => {
  cursorTrailActive.value = true

  const updateCursorTrail = (e: MouseEvent) => {
    if (!cursorTrailActive.value) return

    const trail = {
      style: {
        position: 'fixed',
        left: e.clientX + 'px',
        top: e.clientY + 'px',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 999,
      },
    }

    cursorTrails.value[trailIndex.value] = trail
    trailIndex.value = (trailIndex.value + 1) % 10
  }

  document.addEventListener('mousemove', updateCursorTrail)
}

const stopCursorTrail = () => {
  cursorTrailActive.value = false
  cursorTrails.value = []
}

const startGamingQuotes = () => {
  showGamingQuotes.value = true

  const showNextQuote = () => {
    const randomQuote =
      gamingQuotes[Math.floor(Math.random() * gamingQuotes.length)]
    currentQuote.value = randomQuote
  }

  showNextQuote()
  quoteTimer.value = setInterval(showNextQuote, 8000)
}

const stopGamingQuotes = () => {
  showGamingQuotes.value = false
  if (quoteTimer.value) {
    clearInterval(quoteTimer.value)
  }
}

const revealStudioEgg = (egg: any) => {
  if (!egg.revealed) {
    egg.revealed = true
    emit('easter-egg-found', {
      type: 'studio-reference',
      studio: egg.studio,
      points: 75,
    })
    playSound('reveal')
  }
}

const handleKonamiCode = (event: KeyboardEvent) => {
  if (event.keyCode === konamiCode[konamiIndex.value]) {
    konamiIndex.value++
    if (konamiIndex.value === konamiCode.length) {
      activateKonamiCode()
      konamiIndex.value = 0
    }
  } else {
    konamiIndex.value = 0
  }
}

const activateKonamiCode = () => {
  showSecretMenu.value = true
  emit('achievement-unlocked', {
    name: 'Konami Master',
    description: 'Entered the legendary Konami Code!',
    points: 500,
  })
  playSound('konami')
}

const playSound = (_type: string) => {
  if (!props.enableSounds || !audioRef.value) return

  // This would play different sounds based on type
  // audioRef.value.src = `/sounds/${type}.mp3`
  // audioRef.value.play()
}

// Random easter egg activators
const randomEasterEggs = () => {
  // 1% chance every 30 seconds to show a random easter egg
  const random = Math.random()

  if (random < 0.01) {
    const eggs = ['quotes', 'studio-eggs', 'click-challenge']
    const randomEgg = eggs[Math.floor(Math.random() * eggs.length)]

    switch (randomEgg) {
      case 'quotes':
        startGamingQuotes()
        setTimeout(stopGamingQuotes, 30000)
        break
      case 'studio-eggs':
        showStudioEggs.value = true
        setTimeout(() => {
          showStudioEggs.value = false
        }, 20000)
        break
      case 'click-challenge':
        startClickChallenge()
        break
    }
  }
}

// Special date easter eggs
const checkSpecialDates = () => {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()

  // April 1st - April Fool's
  if (month === 4 && day === 1) {
    activatePartyMode()
  }

  // Halloween
  if (month === 10 && day === 31) {
    document.body.classList.add('halloween-mode')
  }

  // Game developer appreciation day (would need to be defined)
  // etc.
}

// Initialize
onMounted(() => {
  // Set up event listeners
  document.addEventListener('keydown', handleKonamiCode)

  // Random easter eggs timer
  const randomTimer = setInterval(randomEasterEggs, 30000)

  // Check for special dates
  checkSpecialDates()

  // Cleanup function
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKonamiCode)
    clearInterval(randomTimer)
    if (challengeTimer.value) clearInterval(challengeTimer.value)
    if (quoteTimer.value) clearInterval(quoteTimer.value)
    stopFloatingIcons()
    stopCursorTrail()
  })
})

// Expose methods for parent components
defineExpose({
  activateMatrixMode,
  activateRetroMode,
  activatePartyMode,
  startClickChallenge,
  startGamingQuotes,
  stopGamingQuotes,
})
</script>

<style scoped>
.easter-eggs-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: var(--z-notification);
}

/* Secret Menu */
.secret-menu {
  position: fixed; /* Use .center-fixed class from design system */
  background: var(--glass-ultra-bg);
  border: var(--border-glass);
  border-radius: var(--radius-2xl);
  backdrop-filter: var(--glass-mega-blur);
  padding: 2rem;
  text-align: center;
  pointer-events: auto;
  z-index: var(--z-overlay);
  box-shadow: 0 20px 80px rgba(0, 0, 0, 0.3);
}

.secret-menu h3 {
  color: var(--clear-gold);
  font-family: var(--font-primary);
  margin-bottom: 1.5rem;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.secret-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

/* Floating Icons */
.floating-icons {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1000;
}

.floating-icon {
  position: absolute;
  pointer-events: auto;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.floating-icon:hover {
  transform: scale(1.2);
}

@keyframes floatIcon {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 1;
  }
}

/* Click Challenge */
.click-challenge {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: var(--glass-ultra-bg);
  border: var(--border-glass);
  border-radius: var(--radius-card);
  backdrop-filter: var(--glass-mega-blur);
  padding: 1.5rem;
  pointer-events: auto;
  min-width: 250px;
  box-shadow: var(--shadow-glass-lg);
}

.challenge-content h4 {
  color: var(--clear-orange);
  margin-bottom: 0.5rem;
  font-family: var(--font-primary);
}

.challenge-progress {
  width: 100%;
  height: 8px;
  background: var(--glass-surface);
  border-radius: var(--radius-full);
  margin: 1rem 0;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--clear-orange), var(--clear-red));
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.challenge-stats {
  text-align: center;
  font-weight: 700;
  color: var(--text-primary-600);
  font-family: var(--font-primary);
}

/* Studio Easter Eggs */
.studio-easter-eggs {
  position: fixed;
  left: 2rem;
  bottom: 2rem;
  pointer-events: auto;
}

.studio-egg {
  background: var(--glass-ultra-bg);
  border: var(--border-glass);
  border-radius: var(--radius-card);
  backdrop-filter: var(--glass-mega-blur);
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.studio-egg:hover {
  transform: translateX(5px);
  color: var(--text-primary-600);
  border-color: var(--clear-purple);
}

/* Gaming Quotes */
.gaming-quotes {
  position: fixed;
  top: 2rem;
  left: 2rem;
  max-width: 350px;
  background: var(--glass-ultra-bg);
  border: var(--border-glass);
  border-radius: var(--radius-card);
  backdrop-filter: var(--glass-mega-blur);
  padding: 1.5rem;
  pointer-events: auto;
  box-shadow: var(--shadow-glass);
}

.quote-container {
  text-align: left;
}

.gaming-quote {
  font-size: 1rem;
  font-style: italic;
  color: var(--text-primary-600);
  margin: 0 0 1rem 0;
  line-height: 1.6;
  position: relative;
}

.gaming-quote::before {
  content: '"';
  font-size: 3rem;
  color: var(--clear-purple);
  position: absolute;
  left: -1.5rem;
  top: -0.5rem;
  font-family: serif;
}

.quote-source {
  display: block;
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-align: right;
}

.quote-slide-enter-active,
.quote-slide-leave-active {
  transition: all 0.5s ease;
}

.quote-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.quote-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Cursor Trail */
.cursor-trail {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 999;
}

.trail-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--clear-cyan);
  border-radius: 50%;
  animation: trailFade 0.5s ease-out forwards;
}

@keyframes trailFade {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
}

/* Global Easter Egg Modes */
:global(.matrix-mode) {
  filter: hue-rotate(120deg) saturate(2);
}

:global(.matrix-mode *) {
  font-family: 'Courier New', monospace !important;
}

:global(.retro-mode) {
  filter: sepia(50%) hue-rotate(300deg) saturate(1.5);
}

:global(.party-mode) {
  animation: rainbow 2s linear infinite;
}

@keyframes rainbow {
  0% {
    filter: hue-rotate(0deg);
  }
  100% {
    filter: hue-rotate(360deg);
  }
}

:global(.halloween-mode) {
  filter: hue-rotate(30deg) saturate(1.5) contrast(1.2);
}

/* Responsive Design */
@media (max-width: 768px) {
  .secret-menu {
    margin: 1rem;
    padding: 1.5rem;
  }

  .secret-options {
    grid-template-columns: 1fr;
  }

  .click-challenge {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
  }

  .gaming-quotes {
    top: 1rem;
    left: 1rem;
    right: 1rem;
    max-width: none;
  }

  .studio-easter-eggs {
    left: 1rem;
    bottom: 1rem;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .floating-icon,
  .trail-dot,
  :global(.party-mode) {
    animation: none !important;
  }

  .quote-slide-enter-active,
  .quote-slide-leave-active {
    transition: opacity 0.3s ease;
  }

  .quote-slide-enter-from,
  .quote-slide-leave-to {
    transform: none;
  }
}
</style>
