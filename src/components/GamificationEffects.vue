<template>
  <div class="gamification-effects">
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
                <span class="reward-xp">+{{ achievementData.xpReward }} XP</span>
                <span v-if="achievementData.badgeReward" class="reward-badge">{{
                  achievementData.badgeReward
                }}</span>
              </div>
            </div>
          </div>
          <div class="achievement-actions">
            <UnifiedButton variant="gaming" @click="shareAchievement">
              <AppIcon name="mdi-share-variant" class="me-2" />
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
                <AppIcon name="mdi-star" context="achievement" />
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
              name="mdi-gamepad-variant"
              color="gaming"
              context="gaming"
              aria-hidden="true"
            />
            Developer Mode Activated
            <AppIcon
              name="mdi-gamepad-variant"
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
import { ref, onMounted, reactive } from 'vue';

import { refreactive, onUnmounted } from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";

// Props
interface Props {
  userId?: string;
}
withDefaults(defineProps<Props>(), {
  userId: "default-user",
});

// Emits
const _emit = defineEmits(["achievement-unlocked", "level-up", "xp-gained"]);

// Reactive data
const showXPGain = ref(false);
const showAchievement = ref(false);
const showLevelUp = ref(false);
const showCombo = ref(false);
const konamiActivated = ref(false);
const clickStreak = ref(0);

const xpData = reactive({
  amount: 0,
  reason: "",
  type: "normal", // normal, bonus, critical
  icon: "mdi-star-outline",
});

const achievementData = reactive({
  name: "",
  description: "",
  icon: "mdi-trophy-variant",
  color: "#FFD700",
  xpReward: 100,
  badgeReward: null as string | null,
});

const levelUpData = reactive({
  newLevel: 1,
  message: "You've reached a new level!",
  unlocks: [] as string[],
});

const comboData = reactive({
  multiplier: 1,
  label: "Combo",
  tier: "normal", // normal, good, great, perfect
  progress: 0,
});

const streakData = reactive({
  active: false,
  count: 0,
});


const matrixChars = "01ゲームデベロッパー";
const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // Up Up Down Down Left Right Left Right B A
const konamiIndex = ref(0);

// Methods
const triggerXPGain = (
  amount: number,
  reason: string,
  type: "normal" | "bonus" | "critical" = "normal",
) => {
  xpData.amount = amount;
  xpData.reason = reason;
  xpData.type = type;
  xpData.icon =
    type === "critical"
      ? "mdi mdi-lightning-bolt"
      : type === "bonus"
        ? "mdi mdi-star"
        : "mdi mdi-star-outline";

  showXPGain.value = true;
  setTimeout(() => {
    showXPGain.value = false;
  }, 3000);

  emit("xp-gained", { amount, reason, type });
};

const triggerAchievement = (achievement: any) => {
  Object.assign(achievementData, achievement);
  showAchievement.value = true;
  emit("achievement-unlocked", achievement);
};

const triggerLevelUp = (level: number, unlocks: string[] = []) => {
  levelUpData.newLevel = level;
  levelUpData.unlocks = unlocks;
  levelUpData.message = getRandomLevelUpMessage();
  showLevelUp.value = true;

  setTimeout(() => {
    showLevelUp.value = false;
  }, 5000);

  emit("level-up", { level, unlocks });
};

const triggerCombo = (multiplier: number, progress: number = 100) => {
  comboData.multiplier = multiplier;
  comboData.progress = progress;
  comboData.tier = getTierFromMultiplier(multiplier);
  comboData.label = getComboLabel(multiplier);

  showCombo.value = true;
  setTimeout(() => {
    showCombo.value = false;
  }, 2000);
};

const getRandomLevelUpMessage = () => {
  const messages = [
    "Your gaming skills are evolving!",
    "Ready for bigger challenges!",
    "Achievement unlocked: Career Growth!",
    "Next level gaming professional!",
    "Boss fight preparation complete!",
    "Skill tree expanded!",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

const getTierFromMultiplier = (multiplier: number) => {
  if (multiplier >= 5) return "perfect";
  if (multiplier >= 3) return "great";
  if (multiplier >= 2) return "good";
  return "normal";
};

const getComboLabel = (multiplier: number) => {
  const labels = {
    1: "Combo",
    2: "Nice!",
    3: "Great!",
    4: "Awesome!",
    5: "Perfect!",
    6: "Incredible!",
    7: "Legendary!",
  };
  return labels[Math.min(multiplier, 7) as keyof typeof labels] || "Godlike!";
};

const getParticleStyle = (index: number) => {
  const angle = (360 / 12) * index;
  const delay = index * 0.1;
  return {
    "--angle": `${angle}deg`,
    "--delay": `${delay}s`,
  };
};

const getBurstStyle = (index: number) => {
  const angle = (360 / 16) * index;
  return {
    transform: `rotate(${angle}deg)`,
    animationDelay: `${index * 0.05}s`,
  };
};

const getMatrixStyle = (index: number) => {
  return {
    left: `${index * 5}%`,
    animationDelay: `${index * 0.1}s`,
    animationDuration: `${2 + Math.random() * 2}s`,
  };
};

const getClickParticleStyle = (index: number) => {
  const angle = (360 / 8) * index;
  return {
    transform: `rotate(${angle}deg) translateX(50px)`,
    animationDelay: `${index * 0.05}s`,
  };
};

const shareAchievement = () => {
  if (navigator.share) {
    navigator.share({
      title: "Achievement Unlocked!",
      text: `I just unlocked the "${achievementData.name}" achievement in GeminiCV!`,
      url: window.location.href,
    });
  }
};

const closeAchievement = () => {
  showAchievement.value = false;
};

// Konami code handler
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.keyCode === konamiCode[konamiIndex.value]) {
    konamiIndex.value++;
    if (konamiIndex.value === konamiCode.length) {
      activateKonamiCode();
      konamiIndex.value = 0;
    }
  } else {
    konamiIndex.value = 0;
  }
};

const activateKonamiCode = () => {
  konamiActivated.value = true;
  triggerAchievement({
    name: "Code Breaker",
    description: "Discovered the legendary Konami Code!",
    icon: "mdi-code-braces",
    color: "#00FF00",
    xpReward: 500,
    badgeReward: "Secret Developer",
  });

  setTimeout(() => {
    konamiActivated.value = false;
  }, 10000);
};

// Click streak handler
const handleClick = () => {
  clickStreak.value++;
  if (clickStreak.value === 50) {
    triggerAchievement({
      name: "Click Master",
      description: "Clicked 50 times in a row! Your dedication is admirable.",
      icon: "mdi-cursor-default-click",
      color: "#FF6B6B",
      xpReward: 200,
    });
  }

  setTimeout(() => {
    if (clickStreak.value > 0) clickStreak.value--;
  }, 1000);
};

// Expose methods for parent components
defineExpose({
  triggerXPGain,
  triggerAchievement,
  triggerLevelUp,
  triggerCombo,
});

onMounted(() => {
  document.addEventListener("keydown", handleKeyPress);
  document.addEventListener("click", handleClick);

  // Initialize streak data (would come from API)
  streakData.active = true;
  streakData.count = 3;
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyPress);
  document.removeEventListener("click", handleClick);
});
</script>

<style scoped>
.gamification-effects {
  position: relative;
  pointer-events: none;
  z-index: var(--z-toast);
}

.xp-popup {
  position: fixed;
  background: var(--glass-ultra-bg);
  border: var(--border-glass);
  border-radius: var(--radius-card);
  backdrop-filter: var(--glass-mega-blur);
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
  z-index: var(--z-toast);
}

.xp-popup.xp-critical {
  background: linear-gradient(
    var(--glass-ultra-bg),
  );
}

.xp-popup.xp-bonus {
  background: linear-gradient(
    var(--glass-ultra-bg),
  );
}

.xp-content {
  display: flex;
  align-items: center;
}

.xp-icon {
  color: var(--clear-cyan);
}

.xp-text {
  display: flex;
  flex-direction: column;
}

.xp-amount {
  color: var(--clear-green);
  font-family: var(--font-primary);
}

.xp-reason {
  color: var(--text-secondary);
}

.xp-popup-enter-active,
.xp-popup-leave-active {
}

.xp-popup-enter-from {
}

.xp-popup-leave-to {
}

.achievement-unlock-modal {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-overlay);
  pointer-events: auto;
}

.achievement-unlock-content {
  background: var(--glass-ultra-bg);
  border: var(--border-glass);
  backdrop-filter: var(--glass-mega-blur);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.achievement-header {
  position: relative;
}

.achievement-title {
  color: var(--clear-gold);
  font-family: var(--font-primary);
}

.achievement-particles {
}

.particle {
  position: absolute;
  background: var(--clear-gold);
  animation-delay: var(--delay);
}

@keyframes particleFloat {
  }
  }
  }
}

.achievement-icon-wrapper {
  position: relative;
  display: inline-block;
}

.achievement-icon {
}

.achievement-glow {
  position: absolute;
  background: radial-gradient(
    circle,
  );
}

@keyframes pulse {
  }
  }
}

.achievement-name {
  color: var(--text-primary);
}

.achievement-description {
  color: var(--text-secondary);
}

.achievement-rewards {
  display: flex;
  justify-content: center;
}

.reward-xp {
  background: var(--glass-success);
  color: var(--clear-green);
  border-radius: var(--radius-full);
}

.reward-badge {
  background: var(--glass-gaming);
  color: var(--clear-pink);
  border-radius: var(--radius-full);
}

.achievement-actions {
  display: flex;
  justify-content: center;
}

.achievement-unlock-enter-active {
}

.achievement-unlock-enter-from {
}

.level-up-celebration {
  position: fixed;
  background: radial-gradient(
    circle at center,
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
  color: var(--text-primary);
}

.level-up-burst {
}

.burst-ray {
  position: absolute;
  background: linear-gradient(
    to top,
    transparent,
    var(--clear-cyan),
    transparent
  );
}

@keyframes burstRay {
  }
  }
  }
}

.level-up-title {
  color: var(--clear-cyan);
  font-family: var(--font-primary);
}

.level-display {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.level-number {
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: var(--font-primary);
}

.level-label {
  color: var(--text-secondary);
  text-transform: uppercase;
}

.level-up-message {
  color: var(--text-primary);
}

.level-up-rewards {
  background: var(--glass-ultra-bg);
  border: var(--border-glass);
  border-radius: var(--radius-card);
  backdrop-filter: var(--glass-mega-blur);
}

.unlock-list {
  list-style: none;
}

.unlock-item {
  display: flex;
  align-items: center;
  color: var(--text-primary);
}

.unlock-icon {
  color: var(--clear-gold);
}

.level-up-enter-active {
}

.level-up-enter-from {
}

.combo-counter {
  position: fixed;
  background: var(--glass-ultra-bg);
  border: var(--border-glass);
  border-radius: var(--radius-card);
  backdrop-filter: var(--glass-mega-blur);
  text-align: center;
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
  z-index: var(--z-toast);
}

.combo-counter.combo-perfect {
  border-color: var(--clear-gold);
}

.combo-multiplier {
  color: var(--clear-cyan);
  font-family: var(--font-primary);
}

.combo-label {
  display: block;
  color: var(--text-primary);
}

.combo-progress {
  background: var(--glass-surface);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.combo-bar {
  border-radius: var(--radius-full);
}

.combo-counter-enter-active,
.combo-counter-leave-active {
}

.combo-counter-enter-from {
}

.combo-counter-leave-to {
}

.matrix-rain {
  position: absolute;
  overflow: hidden;
}

.matrix-column {
  position: absolute;
  color: var(--clear-green);
  font-family: "Courier New", monospace;
  animation: matrixFall linear infinite;
}

@keyframes matrixFall {
  }
  }
}

.konami-message {
  position: relative;
  background: var(--glass-ultra-bg);
  border: var(--border-glass);
  border-radius: var(--radius-card);
  backdrop-filter: var(--glass-mega-blur);
  text-align: center;
}

.click-streak-effect {
  position: fixed;
  z-index: var(--z-toast);
}

.streak-counter {
  background: var(--glass-ultra-bg);
  border: var(--border-glass);
  border-radius: var(--radius-card);
  backdrop-filter: var(--glass-mega-blur);
  color: var(--clear-orange);
  text-align: center;
}

.click-particles {
  position: relative;
}

.click-particle {
  position: absolute;
  background: var(--clear-orange);
}

@keyframes clickParticleExplode {
  }
  }
}

.streak-indicator {
  position: fixed;
  top: auto;
  background: var(--glass-ultra-bg);
  border: var(--border-glass);
  border-radius: var(--radius-card);
  backdrop-filter: var(--glass-mega-blur);
  display: flex;
  align-items: center;
}

.streak-fire {
  color: var(--clear-orange);
}

@keyframes flicker {
  }
  }
}

.streak-count {
  color: var(--clear-orange);
  font-family: var(--font-primary);
}

.streak-label {
  color: var(--text-secondary);
}

  .xp-popup {
  }

  .achievement-unlock-content {
  }

  .level-up-title {
  }

  .level-number {
  }

  .combo-counter {
    transform: none;
  }

  .streak-indicator {
  }
}

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
  }
}
</style>
