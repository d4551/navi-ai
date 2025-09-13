<template>
  <div class="easter-eggs-container">
    <!-- Hidden Gaming References -->
    <div v-if="showSecretMenu" class="secret-menu">
      <div class="secret-menu-content">
        <h3>
          <AppIcon
            name="mdi-gamepad-variant"
            color="gaming"
            context="gaming"
            aria-hidden="true"
          />
          Secret Developer Menu
          <AppIcon
            name="mdi-gamepad-variant"
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
import AppIcon from "@/components/ui/AppIcon.vue";

import {
  ref,
  onMounted,
  onUnmounted,
  defineEmits,
  withDefaults,
  defineProps,
  defineExpose,
} from "vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";

// Props
interface Props {
  enableSounds?: boolean;
  enableVisualEffects?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  enableSounds: true,
  enableVisualEffects: true,
});

// Emits
const emit = defineEmits(["easter-egg-found", "achievement-unlocked"]);

// Reactive state
const showSecretMenu = ref(false);
const floatingIconsActive = ref(false);
const showClickChallenge = ref(false);
const showStudioEggs = ref(false);
const showGamingQuotes = ref(false);
const cursorTrailActive = ref(false);

// Click challenge state
const targetClicks = ref(30);
const currentClicks = ref(0);
const timeLeft = ref(10);
const challengeTimer = ref<NodeJS.Timeout>();

// Floating icons
const floatingIcons = ref<any[]>([]);
// removed unused animation frame ref (was not used)

// Cursor trail
const cursorTrails = ref<any[]>([]);
const trailIndex = ref(0);

// Gaming quotes
const currentQuote = ref({ id: 0, text: "", source: "" });
const quoteTimer = ref<NodeJS.Timeout>();

// Audio
const audioRef = ref<HTMLAudioElement>();


const gamingQuotes = [
  { id: 1, text: "A game is worth a thousand words.", source: "Sid Meier" },
  {
    id: 2,
    text: "The best games are easy to learn and hard to master.",
    source: "Nolan Bushnell",
  },
  {
    id: 3,
    text: "Players are artists who create their own reality within the game.",
    source: "Shigeru Miyamoto",
  },
  {
    id: 4,
    text: "Good games give players meaningful choices.",
    source: "Sid Meier",
  },
  {
    id: 5,
    text: "A game designer is an experience architect.",
    source: "Jesse Schell",
  },
  {
    id: 6,
    text: "Games are the most elevated form of investigation.",
    source: "Albert Einstein",
  },
  {
    id: 7,
    text: "The medium of games is interaction.",
    source: "Chris Crawford",
  },
  {
    id: 8,
    text: "Play is the highest form of research.",
    source: "Albert Einstein",
  },
];

const studioEggs = [
  {
    id: 1,
    hint: "🐍 Hiss... Solid advice",
    studio: "Kojima Productions",
    revealed: false,
  },
  {
    id: 2,
    hint: "⚡ Sparks fly in the city of Rapture",
    studio: "2K Boston",
    revealed: false,
  },
  {
    id: 3,
    hint: "🧊 Winter is coming... for the undead",
    studio: "Naughty Dog",
    revealed: false,
  },
  {
    id: 4,
    hint: "🔫 Remember, no Russian",
    studio: "Infinity Ward",
    revealed: false,
  },
  {
    id: 5,
    hint: "🏰 A man chooses, a slave obeys",
    studio: "Irrational Games",
    revealed: false,
  },
];

// Konami code tracking
const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA
const konamiIndex = ref(0);

// Methods
const activateMatrixMode = () => {
  document.body.classList.add("matrix-mode");
  setTimeout(() => {
    document.body.classList.remove("matrix-mode");
  }, 10000);

  playSound("matrix");
  emit("easter-egg-found", { type: "matrix", points: 100 });
};

const activateRetroMode = () => {
  document.body.classList.add("retro-mode");
  setTimeout(() => {
    document.body.classList.remove("retro-mode");
  }, 15000);

  playSound("retro");
  emit("easter-egg-found", { type: "retro", points: 150 });
};

const activatePartyMode = () => {
  startFloatingIcons();
  startCursorTrail();
  document.body.classList.add("party-mode");

  setTimeout(() => {
    stopFloatingIcons();
    stopCursorTrail();
    document.body.classList.remove("party-mode");
  }, 30000);

  playSound("party");
  emit("easter-egg-found", { type: "party", points: 200 });
};

const startClickChallenge = () => {
  showClickChallenge.value = true;
  currentClicks.value = 0;
  timeLeft.value = 10;

  challengeTimer.value = setInterval(() => {
    timeLeft.value--;
    if (timeLeft.value <= 0) {
      endClickChallenge();
    }
  }, 1000);

  // Add click listener
  document.addEventListener("click", handleChallengeClick);
};

const endClickChallenge = () => {
  showClickChallenge.value = false;
  if (challengeTimer.value) {
    clearInterval(challengeTimer.value);
  }
  document.removeEventListener("click", handleChallengeClick);

  if (currentClicks.value >= targetClicks.value) {
    emit("achievement-unlocked", {
      name: "Speed Clicker",
      description: `Clicked ${targetClicks.value} times in 10 seconds!`,
      points: 300,
    });
  }
};

const handleChallengeClick = () => {
  if (showClickChallenge.value) {
    currentClicks.value++;
    if (currentClicks.value >= targetClicks.value) {
      endClickChallenge();
    }
  }
};

const startFloatingIcons = () => {
  floatingIconsActive.value = true;
  const icons = [
    "mdi mdi-gamepad-variant",
    "mdi mdi-controller-classic",
    "mdi mdi-trophy-variant",
    "mdi mdi-star",
    "mdi mdi-heart",
    "mdi mdi-lightning-bolt",
    "mdi mdi-rocket",
    "mdi mdi-diamond-stone",
  ];

  const createFloatingIcon = () => {
    const icon = {
      id: Date.now() + Math.random(),
      class: icons[Math.floor(Math.random() * icons.length)],
      style: {
        position: "fixed",
        left: Math.random() * window.innerWidth + "px",
        top: Math.random() * window.innerHeight + "px",
        fontSize: "2rem",
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        animation: `floatIcon ${3 + Math.random() * 2}s ease-in-out infinite`,
        zIndex: 1000,
        pointerEvents: "auto",
        cursor: "pointer",
      },
    };

    floatingIcons.value.push(icon);

    // Remove icon after animation
    setTimeout(() => {
      const index = floatingIcons.value.findIndex((i) => i.id === icon.id);
      if (index > -1) {
        floatingIcons.value.splice(index, 1);
      }
    }, 5000);
  };

  // Create icons periodically
  const createIcon = () => {
    if (floatingIconsActive.value) {
      createFloatingIcon();
      setTimeout(createIcon, 500 + Math.random() * 1000);
    }
  };
  createIcon();
};

const stopFloatingIcons = () => {
  floatingIconsActive.value = false;
  floatingIcons.value = [];
};

const collectIcon = (icon: any) => {
  // Remove the collected icon
  const index = floatingIcons.value.findIndex((i) => i.id === icon.id);
  if (index > -1) {
    floatingIcons.value.splice(index, 1);
    playSound("collect");
    emit("easter-egg-found", { type: "icon-collect", points: 25 });
  }
};

const startCursorTrail = () => {
  cursorTrailActive.value = true;

  const updateCursorTrail = (e: MouseEvent) => {
    if (!cursorTrailActive.value) return;

    const trail = {
      style: {
        position: "fixed",
        left: e.clientX + "px",
        top: e.clientY + "px",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 999,
      },
    };

    cursorTrails.value[trailIndex.value] = trail;
    trailIndex.value = (trailIndex.value + 1) % 10;
  };

  document.addEventListener("mousemove", updateCursorTrail);
};

const stopCursorTrail = () => {
  cursorTrailActive.value = false;
  cursorTrails.value = [];
};

const startGamingQuotes = () => {
  showGamingQuotes.value = true;

  const showNextQuote = () => {
    const randomQuote =
      gamingQuotes[Math.floor(Math.random() * gamingQuotes.length)];
    currentQuote.value = randomQuote;
  };

  showNextQuote();
  quoteTimer.value = setInterval(showNextQuote, 8000);
};

const stopGamingQuotes = () => {
  showGamingQuotes.value = false;
  if (quoteTimer.value) {
    clearInterval(quoteTimer.value);
  }
};

const revealStudioEgg = (egg: any) => {
  if (!egg.revealed) {
    egg.revealed = true;
    emit("easter-egg-found", {
      type: "studio-reference",
      studio: egg.studio,
      points: 75,
    });
    playSound("reveal");
  }
};

const handleKonamiCode = (event: KeyboardEvent) => {
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
  showSecretMenu.value = true;
  emit("achievement-unlocked", {
    name: "Konami Master",
    description: "Entered the legendary Konami Code!",
    points: 500,
  });
  playSound("konami");
};

const playSound = (_type: string) => {
  if (!props.enableSounds || !audioRef.value) return;

  // This would play different sounds based on type

  // audioRef.value.play()
};


const randomEasterEggs = () => {

  const random = Math.random();

  if (random < 0.01) {
    const eggs = ["quotes", "studio-eggs", "click-challenge"];
    const randomEgg = eggs[Math.floor(Math.random() * eggs.length)];

    switch (randomEgg) {
      case "quotes":
        startGamingQuotes();
        setTimeout(stopGamingQuotes, 30000);
        break;
      case "studio-eggs":
        showStudioEggs.value = true;
        setTimeout(() => {
          showStudioEggs.value = false;
        }, 20000);
        break;
      case "click-challenge":
        startClickChallenge();
        break;
    }
  }
};


const checkSpecialDates = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();


  if (month === 4 && day === 1) {
    activatePartyMode();
  }

  // Halloween
  if (month === 10 && day === 31) {
    document.body.classList.add("halloween-mode");
  }

  // Game developer appreciation day (would need to be defined)
  // etc.
};

// Initialize
onMounted(() => {
  // Set up event listeners
  document.addEventListener("keydown", handleKonamiCode);


  const randomTimer = setInterval(randomEasterEggs, 30000);

  // Check for special dates
  checkSpecialDates();


  onUnmounted(() => {
    document.removeEventListener("keydown", handleKonamiCode);
    clearInterval(randomTimer);
    if (challengeTimer.value) clearInterval(challengeTimer.value);
    if (quoteTimer.value) clearInterval(quoteTimer.value);
    stopFloatingIcons();
    stopCursorTrail();
  });
});

// Expose methods for parent components
defineExpose({
  activateMatrixMode,
  activateRetroMode,
  activatePartyMode,
  startClickChallenge,
  startGamingQuotes,
  stopGamingQuotes,
});
</script>

<style scoped>
.easter-eggs-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: var(--z-toast);
}

.secret-menu {
  background: var(--glass-ultra-bg);
  border: var(--border-glass);
  backdrop-filter: var(--glass-mega-blur);
  text-align: center;
  pointer-events: auto;
  z-index: var(--z-overlay);
}

  color: var(--clear-gold);
  font-family: var(--font-primary);
}

.secret-options {
  display: grid;
}

.floating-icons {
  position: fixed;
  pointer-events: none;
}

.floating-icon {
  position: absolute;
  pointer-events: auto;
  cursor: pointer;
}

.floating-icon:hover {
}

@keyframes floatIcon {
  }
  }
}

.click-challenge {
  position: fixed;
  background: var(--glass-ultra-bg);
  border: var(--border-glass);
  border-radius: var(--radius-card);
  backdrop-filter: var(--glass-mega-blur);
  pointer-events: auto;
  box-shadow: var(--shadow-lg);
}

  color: var(--clear-orange);
  font-family: var(--font-primary);
}

.challenge-progress {
  background: var(--glass-surface);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-bar {
  border-radius: var(--radius-full);
}

.challenge-stats {
  text-align: center;
  color: var(--text-primary);
  font-family: var(--font-primary);
}

.studio-easter-eggs {
  position: fixed;
  pointer-events: auto;
}

.studio-egg {
  background: var(--glass-ultra-bg);
  border: var(--border-glass);
  border-radius: var(--radius-card);
  backdrop-filter: var(--glass-mega-blur);
  cursor: pointer;
  color: var(--text-secondary);
}

.studio-egg:hover {
  color: var(--text-primary);
  border-color: var(--clear-purple);
}

.gaming-quotes {
  position: fixed;
  background: var(--glass-ultra-bg);
  border: var(--border-glass);
  border-radius: var(--radius-card);
  backdrop-filter: var(--glass-mega-blur);
  pointer-events: auto;
  box-shadow: var(--shadow-md);
}

.quote-container {
  text-align: left;
}

.gaming-quote {
  font-style: italic;
  color: var(--text-primary);
  position: relative;
}

.gaming-quote::before {
  content: '"';
  color: var(--clear-purple);
  position: absolute;
  font-family: serif;
}

.quote-source {
  display: block;
  color: var(--text-secondary);
  text-align: right;
}

.quote-slide-enter-active,
.quote-slide-leave-active {
}

.quote-slide-enter-from {
}

.quote-slide-leave-to {
}

.cursor-trail {
  position: fixed;
  pointer-events: none;
}

.trail-dot {
  position: absolute;
  background: var(--clear-cyan);
}

@keyframes trailFade {
  }
  }
}

:global(.matrix-mode) {
}

  font-family: "Courier New", monospace !important;
}

:global(.retro-mode) {
}

:global(.party-mode) {
}

@keyframes rainbow {
  }
  }
}

:global(.halloween-mode) {
}

  .secret-menu {
  }

  .secret-options {
  }

  .click-challenge {
  }

  .gaming-quotes {
    max-width: none;
  }

  .studio-easter-eggs {
  }
}

@media (prefers-reduced-motion: reduce) {
  .floating-icon,
  .trail-dot,
  :global(.party-mode) {
    animation: none !important;
  }

  .quote-slide-enter-active,
  .quote-slide-leave-active {
  }

  .quote-slide-enter-from,
  .quote-slide-leave-to {
    transform: none;
  }
}
</style>
