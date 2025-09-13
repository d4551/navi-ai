<template>
  <div class="unified-game-experience">
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
        <div
          v-for="n in 20"
          :key="n"
          class="rgb-particle"
          :style="getParticleStyle(n)"
        ></div>
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
        <div
          v-if="currentNotification"
          class="game-notification razer-glass-card section-card rgb-accent"
        >
          <div class="notification-icon">
            <AppIcon :name="currentNotification.icon" />
          </div>
          <div class="notification-content">
            <h4>{{ currentNotification.title }}</h4>
            <p>{{ currentNotification.message }}</p>
          </div>
          <button class="notification-close" @click="dismissNotification">
            ×
          </button>
        </div>
      </Transition>
    </div>

    <!-- Console Command Interface -->
    <div
      v-if="showConsole"
      class="global-console razer-glass-card section-card"
    >
      <div class="console-header">
        <span>NAVI Debug Console - Sam & Max Mode</span>
        <button @click="toggleConsole">×</button>
      </div>
      <div class="console-output">
        <div
          v-for="line in consoleHistory"
          :key="line.id"
          class="console-line"
          :class="line.type"
        >
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
      <source src="/sounds/navi-office-ambience.mp3" type="audio/mpeg" />
      <source src="/sounds/sam-max-office.wav" type="audio/wav" />
    </audio>
  </div>
</template>

<script setup lang="ts">
import AppIcon from "@/components/ui/AppIcon.vue";

import {
  ref,
  reactive,
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  defineEmits,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import SamMaxEasterEggs from "./SamMaxEasterEggs.vue";
import GamificationEffects from "./GamificationEffects.vue";
import EasterEggs from "./EasterEggs.vue";
import InteractiveJobDiscovery from "./InteractiveJobDiscovery.vue";

const __router = useRouter();
const __route = useRoute();

// Props
interface Props {
  userId?: string;
  enableSounds?: boolean;
  enableVisualEffects?: boolean;
  enhanceNavigation?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  userId: "default-user",
  enableSounds: true,
  enableVisualEffects: true,
  enhanceNavigation: true,
});

// Emits
const emit = defineEmits([
  "theme-changed",
  "easter-egg-activated",
  "command-executed",
]);

// Reactive state
const showJobDiscovery = ref(false);
const showConsole = ref(false);
const rgbEffectsActive = ref(true);
const currentNotification = ref(null);
const consoleCommand = ref("");
const consoleHistory = ref([]);
const ambienceVolume = ref(0.3);

// Component refs
const easterEggsRef = ref();
const gamificationRef = ref();
const advancedEasterEggsRef = ref();
const consoleInputRef = ref();
const ambiencePlayer = ref();

// Theme styles handled globally to prevent CORB issues

// Quick actions for enhanced navigation
const quickActions = reactive([
  {
    name: "The Board",
    icon: "mdi-clipboard-search",
    action: "navigate",
    route: "/jobs",
    description: "Browse gaming jobs",
  },
  {
    name: "The Profile",
    icon: "mdi-briefcase-variant",
    action: "navigate",
    route: "/portfolio",
    description: "Manage your gaming portfolio",
  },
  {
    name: "NAVI Chat",
    icon: "mdi-robot-excited",
    action: "toggle-chat",
    description: "Talk with NAVI AI",
  },
  {
    name: "Easter Eggs",
    icon: "mdi-egg-easter",
    action: "show-easter-eggs",
    description: "Discover hidden features",
  },
  {
    name: "Sam Mode",
    icon: "mdi-account-tie",
    action: "activate-sam",
    description: "Activate Sam mode",
  },
  {
    name: "Max Mode",
    icon: "mdi-flash",
    action: "activate-max",
    description: "Activate Max mode",
  },
]);

// Console commands
const consoleCommands = {
  help: () =>
    "Commands: theme, sam, max, adventure, jobs, profile, navi, konami, matrix, party, reset, clear",
  theme: (args: string[]) => {
    const mode = args[0] || "toggle";
    if (mode === "dark") {
      setTheme("dark");
      return "Theme set to dark mode";
    } else if (mode === "light") {
      setTheme("light");
      return "Theme set to light mode";
    } else {
      toggleTheme();
      return "Theme toggled";
    }
  },
  sam: () => {
    easterEggsRef.value?.activateSamMode();
    return 'Sam mode activated - "We better solve this case professionally..."';
  },
  max: () => {
    easterEggsRef.value?.activateMaxMode();
    return 'Max mode activated - "Let\'s destroy something! For justice!"';
  },
  adventure: () => {
    easterEggsRef.value?.activateAdventureMode();
    return "Adventure mode activated - Point and click your way to success!";
  },
  jobs: () => {
    __router.push("/jobs");
    return "Navigating to The Board...";
  },
  profile: () => {
    __router.push("/portfolio");
    return "Opening The Profile...";
  },
  navi: () => {
    showNotification({
      title: "NAVI Online",
      message: "Hey! Listen! I'm here to help with your gaming career!",
      icon: "mdi-face-woman-shimmer",
    });
    return "NAVI is ready to assist!";
  },
  konami: () => {
    activateKonamiMode();
    return "↑↑↓↓←→←→BA - Ultimate cheat code activated!";
  },
  matrix: () => {
    activateMatrixMode();
    return "Welcome to the Matrix... of gaming careers";
  },
  party: () => {
    activatePartyMode();
    return "[SUCCESS] PARTY TIME! RGB effects at maximum!";
  },
  reset: () => {
    resetAllEffects();
    return "All effects reset to default";
  },
  clear: () => {
    consoleHistory.value = [];
    return "";
  },
  discover: () => {
    showJobDiscovery.value = true;
    return "Opening Interactive Job Discovery...";
  },
  stats: () => {
    return `User: ${props.userId} | Easter Eggs Found: ${getEasterEggCount()} | Level: ${getUserLevel()}`;
  },
};

// Methods
const triggerQuickAction = (action: any) => {
  switch (action.action) {
    case "navigate":
      __router.push(action.route);
      break;
    case "toggle-chat":
      // Toggle NAVI chat
      emit("theme-changed", { action: "toggle-chat" });
      break;
    case "show-easter-eggs":
      advancedEasterEggsRef.value?.startGamingQuotes();
      break;
    case "activate-sam":
      easterEggsRef.value?.activateSamMode();
      break;
    case "activate-max":
      easterEggsRef.value?.activateMaxMode();
      break;
  }
};

const executeCommand = () => {
  const fullCommand = consoleCommand.value.trim();
  const [command, ...args] = fullCommand.toLowerCase().split(" ");

  // Add command to history
  addToConsoleHistory(`> ${fullCommand}`, "command");

  if (consoleCommands[command]) {
    try {
      const result = consoleCommands[command](args);
      if (result) {
        addToConsoleHistory(result, "output");
      }
    } catch (error) {
      addToConsoleHistory(`Error: ${error.message}`, "error");
    }
  } else {
    addToConsoleHistory(
      `Unknown command: ${command}. Type 'help' for available commands.`,
      "error",
    );
  }

  consoleCommand.value = "";
  emit("command-executed", { command, args, timestamp: Date.now() });

  // Scroll console to bottom
  nextTick(() => {
    const output = document.querySelector(".console-output");
    if (output) {
      output.scrollTop = output.scrollHeight;
    }
  });
};

const addToConsoleHistory = (
  text: string,
  type: "command" | "output" | "error",
) => {
  consoleHistory.value.push({
    id: Date.now(),
    text,
    type,
    timestamp: new Date().toLocaleTimeString(),
  });


  if (consoleHistory.value.length > 100) {
    consoleHistory.value = consoleHistory.value.slice(-100);
  }
};

const toggleConsole = () => {
  showConsole.value = !showConsole.value;
  if (showConsole.value) {
    nextTick(() => {
      consoleInputRef.value?.focus();
    });
  }
};

const handleEasterEgg = (event: any) => {
  showNotification({
    title: "Easter Egg Found!",
    message: `You discovered: ${event.name || event.type}! (+${event.points || 50} XP)`,
    icon: "🥚",
  });

  // Trigger XP gain in gamification system
  gamificationRef.value?.triggerXPGain(
    event.points || 50,
    `Found ${event.name || event.type}`,
    "bonus",
  );

  emit("easter-egg-activated", event);
};

const handleAchievement = (achievement: any) => {
  showNotification({
    title: "Achievement Unlocked!",
    message: achievement.description || achievement.name,
    icon: "mdi-trophy",
  });
};

const handleLevelUp = (levelData: any) => {
  showNotification({
    title: `Level Up! Level ${levelData.level}`,
    message: "Your gaming career skills are evolving!",
    icon: "mdi-star",
  });
};

const handleXPGain = (xpData: any) => {
  // Handle XP notifications if needed
};

const showNotification = (notification: any) => {
  currentNotification.value = notification;
  setTimeout(() => {
    currentNotification.value = null;
  }, 5000);
};

const dismissNotification = () => {
  currentNotification.value = null;
};

const getParticleStyle = (index: number) => {
  const colors = [
    "#00ff88",
    "#00d9ff",
    "#a855f7",
    "#ff006e",
    "#ff5722",
    "#ffee00",
  ];
  const color = colors[index % colors.length];
  const delay = index * 0.2 + "s";
  const duration = 2 + Math.random() * 3 + "s";
  const x = Math.random() * 100 + "%";
  const y = Math.random() * 100 + "%";

  return {
    "--particle-color": color,
    "--animation-delay": delay,
    "--animation-duration": duration,
    left: x,
    top: y,
  };
};

const setTheme = (theme: "light" | "dark") => {
  document.documentElement.setAttribute("data-theme", theme);
  emit("theme-changed", { theme });
};

const toggleTheme = () => {
  const current =
    document.documentElement.getAttribute("data-theme") || "light";
  const newTheme = current === "light" ? "dark" : "light";
  setTheme(newTheme);
};

const activateKonamiMode = () => {
  document.body.classList.add("konami-ultimate-mode");
  rgbEffectsActive.value = true;


  easterEggsRef.value?.activateSamMode();
  setTimeout(() => easterEggsRef.value?.activateMaxMode(), 1000);
  setTimeout(() => easterEggsRef.value?.activateAdventureMode(), 2000);

  // Play special sound
  if (props.enableSounds && ambiencePlayer.value) {
    ambiencePlayer.value.volume = 0.1;
    ambiencePlayer.value.play().catch(() => {});
  }

  setTimeout(() => {
    document.body.classList.remove("konami-ultimate-mode");
    resetAllEffects();
  }, 15000);
};

const activateMatrixMode = () => {
  document.body.classList.add("matrix-career-mode");
  setTimeout(() => {
    document.body.classList.remove("matrix-career-mode");
  }, 10000);
};

const activatePartyMode = () => {
  document.body.classList.add("rgb-party-mode");
  rgbEffectsActive.value = true;

  setTimeout(() => {
    document.body.classList.remove("rgb-party-mode");
  }, 20000);
};

const resetAllEffects = () => {
  const classes = [
    "konami-ultimate-mode",
    "matrix-career-mode",
    "rgb-party-mode",
    "sam-mode",
    "max-mode",
    "adventure-mode",
  ];

  classes.forEach((className) => {
    document.body.classList.remove(className);
  });

  rgbEffectsActive.value = true;

  if (ambiencePlayer.value) {
    ambiencePlayer.value.pause();
  }
};

const getEasterEggCount = () => {

  return parseInt(localStorage.getItem("navi-easter-eggs") || "0");
};

const getUserLevel = () => {
  // Return stored user level
  return parseInt(localStorage.getItem("navi-user-level") || "1");
};

// Keyboard shortcuts
const handleGlobalKeypress = (event: KeyboardEvent) => {
  // Ctrl + Shift + ~ for console
  if (event.ctrlKey && event.shiftKey && event.key === "~") {
    event.preventDefault();
    toggleConsole();
  }

  // Ctrl + Shift + D for job discovery
  if (event.ctrlKey && event.shiftKey && event.key === "D") {
    event.preventDefault();
    showJobDiscovery.value = true;
  }

  // Escape to close modals
  if (event.key === "Escape") {
    showConsole.value = false;
    showJobDiscovery.value = false;
    currentNotification.value = null;
  }
};

// Initialize
onMounted(() => {
  document.addEventListener("keydown", handleGlobalKeypress);

  // Welcome message
  setTimeout(() => {
    showNotification({
      title: "[GAME] Welcome to NAVI Gaming Career Hub!",
      message:
        "Press Ctrl+Shift+~ for console, discover easter eggs, and level up your career!",
      icon: "🚀",
    });
  }, 2000);

  // Initialize theme
  const savedTheme = localStorage.getItem("navi-theme") || "dark";
  setTheme(savedTheme as "light" | "dark");

  // Initialize RGB effects based on user preference
  const rgbPreference = localStorage.getItem("navi-rgb-effects");
  if (rgbPreference !== null) {
    rgbEffectsActive.value = rgbPreference === "true";
  }
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleGlobalKeypress);
  resetAllEffects();
});

// Expose methods for parent components
defineExpose({
  toggleConsole,
  showJobDiscovery: () => {
    showJobDiscovery.value = true;
  },
  activateKonamiMode,
  activateMatrixMode,
  activatePartyMode,
  resetAllEffects,
  showNotification,
});
</script>

<style scoped>
.unified-game-experience {
  position: relative;
  z-index: 1;
}

.rgb-accent-system {
  position: fixed;
  pointer-events: none;
}

.rgb-glow-effects {
  position: absolute;
  overflow: hidden;
}

.rgb-glow-effects.active {
}

.rgb-particle {
  position: absolute;
  background: var(--particle-color, var(--razer-green));
}

@keyframes floatParticle {
  }
  }
}

.enhanced-navi-system {
  position: fixed;
  pointer-events: auto;
}

.navi-quick-actions {
  display: flex;
  flex-wrap: wrap;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  min-width: auto;
  transition: all var(--animation-normal) var(--easing-standard);
}

.quick-action-btn:hover {
}

.quick-action-btn i {
}

.global-notifications {
  position: fixed;
  pointer-events: none;
}

.game-notification {
  display: flex;
  align-items: center;
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
}

.notification-icon {
}

.notification-content {
}

  color: var(--text-primary);
}

.notification-content p {
  color: var(--text-secondary);
}

.notification-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--animation-normal) var(--easing-standard);
}

.notification-close:hover {
  color: var(--text-primary);
}

.notification-slide-enter-active,
.notification-slide-leave-active {
}

.notification-slide-enter-from {
}

.notification-slide-leave-to {
}

.global-console {
  position: fixed;
  display: flex;
  flex-direction: column;
  font-family: "Courier New", monospace;
  box-shadow:
}

.console-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--razer-green);
  color: black;
  font-weight: bold;
}

.console-header button {
  background: none;
  border: none;
  color: black;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
}

.console-output {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--razer-green) transparent;
}

.console-output::-webkit-scrollbar {
}

.console-output::-webkit-scrollbar-track {
  background: transparent;
}

.console-output::-webkit-scrollbar-thumb {
  background: var(--razer-green);
}

.console-line {
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
}

.prompt {
  color: var(--razer-green);
  font-weight: bold;
}

.console-input input {
  background: none;
  border: none;
  color: var(--razer-green);
  font-family: inherit;
  outline: none;
}

.console-input input::placeholder {
}

:global(.konami-ultimate-mode) {
}

@keyframes ultimateRainbow {
  }
  }
  }
  }
  }
}

:global(.matrix-career-mode) {
  background: radial-gradient(
    circle at center,
  );
  color: var(--razer-green);
}

}

:global(.rgb-party-mode) {
}

@keyframes partyMode {
  }
  }
}

  .enhanced-navi-system {
    top: auto;
  }

  .navi-quick-actions {
    justify-content: center;
  }

  .quick-action-btn span {
    display: none;
  }

  .global-notifications {
  }

  .game-notification {
  }

  .global-console {
  }

  .console-header {
  }

  .console-line {
  }

  .console-input input {
  }
}

@media (prefers-reduced-motion: reduce) {
  .rgb-particle,
  :global(.konami-ultimate-mode),
  :global(.rgb-party-mode) {
    animation: none !important;
  }
}

@media (prefers-contrast: high) {
  .global-console {
    background: black;
  }

  .game-notification {
  }
}
</style>
