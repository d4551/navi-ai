<template>
  <div class="gamification-effects font-sans">
    <!-- XP Pop-up Notifications -->
    <Transition name="xp-popup" appear>
      <div v-if="showXPGain" class="xp-popup" :class="`xp-${xpData.type}`">
        <div class="xp-content">
          <AppIcon :name="xpData.icon" class="xp-icon" />
          <div class="xp-text">
            <span class="xp-amount">+{{ xpData.amount }} XP</span>
            <span class="xp-reason">{{ xpData.reason }}</span>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Achievement Unlocked Animation -->
    <Transition name="achievement-unlock">
      <div v-if="showAchievement" class="achievement-unlock-modal">
        <div class="achievement-unlock-content">
          <div class="achievement-header">
            <h2 class="achievement-title">Achievement Unlocked!</h2>
            <div class="achievement-particles">
              <div
                v-for="i in 12"
                :key="i"
                class="particle"
                :style="getParticleStyle(i)"
              ></div>
            </div>
          </div>
          <div class="achievement-body">
            <div class="achievement-icon-wrapper">
              <AppIcon
                :name="achievementData.icon"
                class="achievement-icon"
                :style="{ color: achievementData.color }"
              />
              <div class="achievement-glow"></div>
            </div>
            <div class="achievement-info">
              <h3 class="achievement-name">{{ achievementData.name }}</h3>
              <p class="achievement-description">
                {{ achievementData.description }}
              </p>
              <div class="achievement-rewards">
                <span class="reward-xp"
                  >+{{ achievementData.xpReward }} XP</span
                >
                <span v-if="achievementData.badgeReward" class="reward-badge">{{
                  achievementData.badgeReward
                }}</span>
              </div>
            </div>
          </div>
          <div class="achievement-actions">
            <UnifiedButton variant="gaming" @click="shareAchievement">
              <AppIcon name="ShareIcon" class="mr-2" />
              Share
            </UnifiedButton>
            <UnifiedButton variant="glass" @click="closeAchievement">
              Continue
            </UnifiedButton>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Level Up Celebration -->
    <Transition name="level-up">
      <div v-if="showLevelUp" class="level-up-celebration">
        <div class="level-up-content">
          <div class="level-up-burst">
            <div
              v-for="i in 16"
              :key="i"
              class="burst-ray"
              :style="getBurstStyle(i)"
            ></div>
          </div>
          <div class="level-up-text">
            <h2 class="level-up-title">LEVEL UP!</h2>
            <div class="level-display">
              <span class="level-number">{{ levelUpData.newLevel }}</span>
              <span class="level-label">Level</span>
            </div>
            <p class="level-up-message">{{ levelUpData.message }}</p>
          </div>
          <div class="level-up-rewards">
            <h4>New Unlocks:</h4>
            <ul class="unlock-list">
              <li
                v-for="unlock in levelUpData.unlocks"
                :key="unlock"
                class="unlock-item"
              >
                <AppIcon name="StarIcon" context="achievement" />
                {{ unlock }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Combo Counter -->
    <Transition name="combo-counter">
      <div
        v-if="showCombo"
        class="combo-counter"
        :class="`combo-${comboData.tier}`"
      >
        <div class="combo-content">
          <span class="combo-multiplier">{{ comboData.multiplier }}x</span>
          <span class="combo-label">{{ comboData.label }}</span>
        </div>
        <div class="combo-progress">
          <div
            class="combo-bar"
            :style="{ width: `${comboData.progress}%` }"
          ></div>
        </div>
      </div>
    </Transition>

    <!-- Easter Egg Discoveries -->
    <div class="easter-eggs">
      <!-- Konami Code Easter Egg -->
      <div v-if="konamiActivated" class="konami-effect">
        <div class="matrix-rain">
          <div
            v-for="i in 20"
            :key="i"
            class="matrix-column"
            :style="getMatrixStyle(i)"
          >
            {{ matrixChars }}
          </div>
        </div>
        <div class="konami-message">
          <h3>
            <AppIcon
              name="PuzzlePieceIcon"
              color="gaming"
              context="gaming"
              aria-hidden="true"
            />
            Developer Mode Activated
            <AppIcon
              name="PuzzlePieceIcon"
              color="gaming"
              context="gaming"
              aria-hidden="true"
            />
          </h3>
          <p>You found the Konami Code! Enjoy the Matrix effect!</p>
        </div>
      </div>

      <!-- Click Counter Easter Egg -->
      <div v-if="clickStreak > 10" class="click-streak-effect">
        <div class="streak-counter">{{ clickStreak }} clicks!</div>
        <div class="click-particles">
          <div
            v-for="i in 8"
            :key="i"
            class="click-particle"
            :style="getClickParticleStyle(i)"
          ></div>
        </div>
      </div>
    </div>

    <!-- Progress Streaks (temporarily removed) -->
  </div>
</template>

<script setup lang="ts">
import { PuzzlePieceIcon, ShareIcon } from '@heroicons/vue/24/outline'
import { StarIcon } from '@heroicons/vue/24/solid'

import { ref, onMounted, reactive, onUnmounted, defineEmits } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

// Props
interface Props {
  userId?: string
}
withDefaults(defineProps<Props>(), {
  userId: 'default-user',
})

// Emits
const emit = defineEmits(['achievement-unlocked', 'level-up', 'xp-gained'])

// Reactive data
const showXPGain = ref(false)
const showAchievement = ref(false)
const showLevelUp = ref(false)
const showCombo = ref(false)
const konamiActivated = ref(false)
const clickStreak = ref(0)

const xpData = reactive({
  amount: 0,
  reason: '',
  type: 'normal', // normal, bonus, critical
  icon: 'StarIcon-outline',
})

const achievementData = reactive({
  name: '',
  description: '',
  icon: 'TrophyIcon-variant',
  color: '#FFD700',
  xpReward: 100,
  badgeReward: null as string | null,
})

const levelUpData = reactive({
  newLevel: 1,
  message: "You've reached a new level!",
  unlocks: [] as string[],
})

const comboData = reactive({
  multiplier: 1,
  label: 'Combo',
  tier: 'normal', // normal, good, great, perfect
  progress: 0,
})

const streakData = reactive({
  active: false,
  count: 0,
})

// Easter egg data
const matrixChars = '01ゲームデベロッパー'
const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65] // Up Up Down Down Left Right Left Right B A
const konamiIndex = ref(0)

// Methods
const triggerXPGain = (
  amount: number,
  reason: string,
  type: 'normal' | 'bonus' | 'critical' = 'normal'
) => {
  xpData.amount = amount
  xpData.reason = reason
  xpData.type = type
  xpData.icon =
    type === 'critical'
      ? 'mdi BoltIcon-bolt'
      : type === 'bonus'
        ? 'mdi StarIcon'
        : 'mdi StarIcon-outline'

  showXPGain.value = true
  setTimeout(() => {
    showXPGain.value = false
  }, 3000)

  emit('xp-gained', { amount, reason, type })
}

const triggerAchievement = (achievement: any) => {
  Object.assign(achievementData, achievement)
  showAchievement.value = true
  emit('achievement-unlocked', achievement)
}

const triggerLevelUp = (level: number, unlocks: string[] = []) => {
  levelUpData.newLevel = level
  levelUpData.unlocks = unlocks
  levelUpData.message = getRandomLevelUpMessage()
  showLevelUp.value = true

  setTimeout(() => {
    showLevelUp.value = false
  }, 5000)

  emit('level-up', { level, unlocks })
}

const triggerCombo = (multiplier: number, progress: number = 100) => {
  comboData.multiplier = multiplier
  comboData.progress = progress
  comboData.tier = getTierFromMultiplier(multiplier)
  comboData.label = getComboLabel(multiplier)

  showCombo.value = true
  setTimeout(() => {
    showCombo.value = false
  }, 2000)
}

const getRandomLevelUpMessage = () => {
  const messages = [
    'Your gaming skills are evolving!',
    'Ready for bigger challenges!',
    'Achievement unlocked: Career Growth!',
    'Next level gaming professional!',
    'Boss fight preparation complete!',
    'Skill tree expanded!',
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}

const getTierFromMultiplier = (multiplier: number) => {
  if (multiplier >= 5) return 'perfect'
  if (multiplier >= 3) return 'great'
  if (multiplier >= 2) return 'good'
  return 'normal'
}

const getComboLabel = (multiplier: number) => {
  const labels = {
    1: 'Combo',
    2: 'Nice!',
    3: 'Great!',
    4: 'Awesome!',
    5: 'Perfect!',
    6: 'Incredible!',
    7: 'Legendary!',
  }
  return labels[Math.min(multiplier, 7) as keyof typeof labels] || 'Godlike!'
}

const getParticleStyle = (index: number) => {
  const angle = (360 / 12) * index
  const delay = index * 0.1
  return {
    '--angle': `${angle}deg`,
    '--delay': `${delay}s`,
  }
}

const getBurstStyle = (index: number) => {
  const angle = (360 / 16) * index
  return {
    transform: `rotate(${angle}deg)`,
    animationDelay: `${index * 0.05}s`,
  }
}

const getMatrixStyle = (index: number) => {
  return {
    left: `${index * 5}%`,
    animationDelay: `${index * 0.1}s`,
    animationDuration: `${2 + Math.random() * 2}s`,
  }
}

const getClickParticleStyle = (index: number) => {
  const angle = (360 / 8) * index
  return {
    transform: `rotate(${angle}deg) translateX(50px)`,
    animationDelay: `${index * 0.05}s`,
  }
}

const shareAchievement = () => {
  if (navigator.share) {
    navigator.share({
      title: 'Achievement Unlocked!',
      text: `I just unlocked the "${achievementData.name}" achievement in GeminiCV!`,
      url: window.location.href,
    })
  }
}

const closeAchievement = () => {
  showAchievement.value = false
}

// Konami code handler
const handleKeyPress = (event: KeyboardEvent) => {
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
  konamiActivated.value = true
  triggerAchievement({
    name: 'Code Breaker',
    description: 'Discovered the legendary Konami Code!',
    icon: 'mdi-code-braces',
    color: '#00FF00',
    xpReward: 500,
    badgeReward: 'Secret Developer',
  })

  setTimeout(() => {
    konamiActivated.value = false
  }, 10000)
}

// Click streak handler
const handleClick = () => {
  clickStreak.value++
  if (clickStreak.value === 50) {
    triggerAchievement({
      name: 'Click Master',
      description:
        'Clicked 50 times in a flex flex-wrap! Your dedication is admirable.',
      icon: 'mdi-cursor-default-click',
      color: '#FF6B6B',
      xpReward: 200,
    })
  }

  setTimeout(() => {
    if (clickStreak.value > 0) clickStreak.value--
  }, 1000)
}

// Expose methods for parent components
defineExpose({
  triggerXPGain,
  triggerAchievement,
  triggerLevelUp,
  triggerCombo,
})

onMounted(() => {
  document.addEventListener('keydown', handleKeyPress)
  document.addEventListener('click', handleClick)

  // Initialize streak data (would come from API)
  streakData.active = true
  streakData.count = 3
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyPress)
  document.removeEventListener('click', handleClick)
})
</script>

<style scoped>
.gamification-effects {
  position: relative;
  pointer-events: none;
  z-index: var(--z-toast);
}

/* XP Popup */
.xp-popup {
  position: fixed;
  top: 20%;
  right: 2rem;
  background: var(--glass-ultra-bg);
  border: var(--border-glass);
  border-radius: var(--radius-card);
  backdrop-filter: var(--glass-mega-blur);
  padding: 1rem 1.5rem;
  box-shadow: var(--shadow-glass-lg);
  pointer-events: auto;
  z-index: var(--z-toast);
}

.xp-popup.xp-critical {
  border-l: 4px solid var(--clear-orange);
  background: linear-gradient(
    135deg,
    var(--glass-ultra-bg),
    rgba(255, 140, 0, 0.1)
  );
}

.xp-popup.xp-bonus {
  border-l: 4px solid var(--clear-purple);
  background: linear-gradient(
    135deg,
    var(--glass-ultra-bg),
    rgba(128, 0, 255, 0.1)
  );
}

.xp-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.xp-icon {
  font-size: 1.5rem;
  color: var(--clear-cyan);
}

.xp-text {
  display: flex;
  flex-direction: column;
}

.xp-amount {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--clear-green);
  font-family: var(--font-primary);
}

.xp-reason {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* XP Popup Animation */
.xp-popup-enter-active,
.xp-popup-leave-active {
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.xp-popup-enter-from {
  transform: translateX(100%) scale(0.8);
  opacity: 0;
}

.xp-popup-leave-to {
  transform: translateY(-20px) scale(0.95);
  opacity: 0;
}

/* Achievement Unlock Modal */
.achievement-unlock-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-overlay);
  pointer-events: auto;
}

.achievement-unlock-content {
  background: var(--glass-ultra-bg);
  border: var(--border-glass);
  border-radius: var(--radius-2xl);
  backdrop-filter: var(--glass-mega-blur);
  padding: 2rem;
  max-width: 500px;
  text-align: center;
  box-shadow: var(--shadow-2xl);
  position: relative;
  overflow: hidden;
}

.achievement-header {
  position: relative;
  margin-bottom: 2rem;
}

.achievement-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--clear-gold);
  font-family: var(--font-primary);
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  margin-bottom: 1rem;
}

.achievement-particles {
  position: absolute; /* Use .center-absolute class from design system */
  width: 200px;
  height: 200px;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--clear-gold);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  animation: particleFloat 2s ease-out infinite;
  animation-delay: var(--delay);
}

@keyframes particleFloat {
  0% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0) scale(0);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateX(80px)
      scale(1);
    opacity: 0;
  }
}

.achievement-icon-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 1rem;
}

.achievement-icon {
  font-size: 4rem;
  filter: drop-shadow(0 0 20px currentColor);
}

.achievement-glow {
  position: absolute;
  inset: -20px;
  background: radial-gradient(
    circle,
    rgba(255, 215, 0, 0.3) 0%,
    transparent 70%
  );
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

.achievement-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary-600);
  margin-bottom: 0.5rem;
}

.achievement-description {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.achievement-rewards {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.reward-xp {
  background: var(--glass-success);
  color: var(--clear-green);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-full);
  font-weight: 600;
}

.reward-badge {
  background: var(--glass-gaming);
  color: var(--clear-pink);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-full);
  font-weight: 600;
}

.achievement-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

/* Achievement Animation */
.achievement-unlock-enter-active {
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.achievement-unlock-enter-from {
  transform: scale(0.7) translateY(50px);
  opacity: 0;
}

/* Level Up Celebration */
.level-up-celebration {
  position: fixed;
  inset: 0;
  background: radial-gradient(
    circle at center,
    rgba(0, 255, 255, 0.1) 0%,
    rgba(0, 0, 0, 0.8) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-overlay);
  pointer-events: auto;
}

.level-up-content {
  position: relative;
  text-align: center;
  color: var(--text-primary-600);
}

.level-up-burst {
  position: absolute; /* Use .center-absolute class from design system */
}

.burst-ray {
  position: absolute;
  width: 4px;
  height: 120px;
  background: linear-gradient(
    to top,
    transparent,
    var(--clear-cyan),
    transparent
  );
  animation: burstRay 1s ease-out;
}

@keyframes burstRay {
  0% {
    height: 0;
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    height: 120px;
    opacity: 0;
  }
}

.level-up-title {
  font-size: 4rem;
  font-weight: 900;
  color: var(--clear-cyan);
  text-shadow: 0 0 30px var(--clear-cyan);
  font-family: var(--font-primary);
  margin-bottom: 1rem;
}

.level-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
}

.level-number {
  font-size: 6rem;
  font-weight: 900;
  background: linear-gradient(45deg, var(--clear-gold), var(--clear-orange));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: var(--font-primary);
}

.level-label {
  font-size: 1.2rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.2em;
}

.level-up-message {
  font-size: 1.2rem;
  color: var(--text-primary-600);
  margin-bottom: 2rem;
}

.level-up-rewards {
  background: var(--glass-ultra-bg);
  border: var(--border-glass);
  border-radius: var(--radius-card);
  backdrop-filter: var(--glass-mega-blur);
  padding: 1.5rem;
  max-width: 400px;
}

.unlock-list {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0 0;
}

.unlock-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  color: var(--text-primary-600);
}

.unlock-icon {
  color: var(--clear-gold);
}

/* Level Up Animation */
.level-up-enter-active {
  transition: all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.level-up-enter-from {
  transform: scale(0.3);
  opacity: 0;
}

/* Combo Counter */
.combo-counter {
  position: fixed;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--glass-ultra-bg);
  border: var(--border-glass);
  border-radius: var(--radius-card);
  backdrop-filter: var(--glass-mega-blur);
  padding: 1rem 2rem;
  text-align: center;
  box-shadow: var(--shadow-glass-lg);
  pointer-events: auto;
  z-index: var(--z-toast);
}

.combo-counter.combo-perfect {
  border-color: var(--clear-gold);
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
}

.combo-multiplier {
  font-size: 2rem;
  font-weight: 900;
  color: var(--clear-cyan);
  font-family: var(--font-primary);
}

.combo-label {
  display: block;
  font-size: 1rem;
  color: var(--text-primary-600);
  margin-top: 0.25rem;
}

.combo-progress {
  width: 100%;
  height: 4px;
  background: var(--glass-surface);
  border-radius: var(--radius-full);
  margin-top: 0.5rem;
  overflow: hidden;
}

.combo-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--clear-cyan), var(--clear-purple));
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

/* Combo Animation */
.combo-counter-enter-active,
.combo-counter-leave-active {
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.combo-counter-enter-from {
  transform: translateX(-50%) scale(0.5);
  opacity: 0;
}

.combo-counter-leave-to {
  transform: translateX(-50%) scale(0.8);
  opacity: 0;
}

/* Matrix Rain Easter Egg */
.matrix-rain {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.9);
  z-index: -1;
}

.matrix-column {
  position: absolute;
  top: -100%;
  color: var(--clear-green);
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  animation: matrixFall linear infinite;
  opacity: 0.8;
}

@keyframes matrixFall {
  0% {
    top: -100%;
  }
  100% {
    top: 100%;
  }
}

.konami-message {
  position: relative;
  z-index: 1;
  background: var(--glass-ultra-bg);
  border: var(--border-glass);
  border-radius: var(--radius-card);
  backdrop-filter: var(--glass-mega-blur);
  padding: 2rem;
  text-align: center;
  margin: 2rem auto;
  max-width: 400px;
}

/* Click Streak Effect */
.click-streak-effect {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-toast);
}

.streak-counter {
  background: var(--glass-ultra-bg);
  border: var(--border-glass);
  border-radius: var(--radius-card);
  backdrop-filter: var(--glass-mega-blur);
  padding: 0.5rem 1rem;
  font-weight: 700;
  color: var(--clear-orange);
  text-align: center;
  margin-bottom: 1rem;
}

.click-particles {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto;
}

.click-particle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6px;
  height: 6px;
  background: var(--clear-orange);
  border-radius: 50%;
  animation: clickParticleExplode 0.6s ease-out;
}

@keyframes clickParticleExplode {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
}

/* Streak Indicator */
.streak-indicator {
  position: fixed;
  /* move away from header actions: default bottom-right */
  top: auto;
  bottom: 1rem;
  right: 1rem;
  background: var(--glass-ultra-bg);
  border: var(--border-glass);
  border-radius: var(--radius-card);
  backdrop-filter: var(--glass-mega-blur);
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  pointer-events: none; /* avoid obstructing clicks */
  z-index: var(--z-floating); /* below headers/toolbars */
}

.streak-fire {
  color: var(--clear-orange);
  font-size: 1.2rem;
  animation: flicker 1s ease-in-out infinite alternate;
}

@keyframes flicker {
  0% {
    opacity: 0.7;
    transform: scale(1);
  }
  100% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.streak-count {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--clear-orange);
  font-family: var(--font-primary);
}

.streak-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Responsive Design */
@media (max-width: 768px) {
  .xp-popup {
    right: 1rem;
    left: 1rem;
  }

  .achievement-unlock-content {
    margin: 1rem;
    padding: 1.5rem;
  }

  .level-up-title {
    font-size: 2.5rem;
  }

  .level-number {
    font-size: 4rem;
  }

  .combo-counter {
    left: 1rem;
    right: 1rem;
    transform: none;
  }

  .streak-indicator {
    bottom: 0.75rem;
    right: 0.75rem;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .particle,
  .burst-ray,
  .streak-fire,
  .click-particle,
  .matrix-column {
    animation: none !important;
  }

  .achievement-glow {
    animation: none !important;
    opacity: 0.6;
  }
}
</style>
