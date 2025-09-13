<template>
  <div class="sam-max-easter-eggs">
    <!-- Sample Sam & Max Comment Bubbles (Hidden by default, shown by easter egg) -->
    <div
      class="sam-max-comment-bubble sam-bubble"
      :style="{
        position: 'fixed',
        top: '20%',
        right: '20px',
        zIndex: 9999,
        backgroundColor: 'var(--surface-elevated)',
        border: '2px solid var(--color-gaming-500)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--spacing-4)',
        maxWidth: '300px',
        boxShadow: 'var(--shadow-glow-gaming)',
        animation: 'bounce 2s infinite',
      }"
    >
      <div
        :style="{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-3)',
          marginBottom: 'var(--spacing-2)',
        }"
      >
        <span :style="{ fontSize: '1.5rem' }">🐶</span>
        <strong :style="{ color: 'var(--color-gaming-500)' }">Sam:</strong>
      </div>
      <p
        :style="{
          margin: 0,
          fontSize: 'var(--font-size-sm)',
          color: 'var(--text-primary)',
        }"
      >
        "Nice settings page! Very... settingsy. I bet Max is already trying to
        hack into the AI configuration."
      </p>
    </div>

    <div
      class="sam-max-comment-bubble max-bubble"
      :style="{
        position: 'fixed',
        top: '40%',
        left: '20px',
        zIndex: 9999,
        backgroundColor: 'var(--surface-elevated)',
        border: '2px solid var(--color-cyber-500)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--spacing-4)',
        maxWidth: '280px',
        boxShadow: 'var(--shadow-glow-cyber)',
        animation: 'wiggle 3s infinite',
      }"
    >
      <div
        :style="{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-3)',
          marginBottom: 'var(--spacing-2)',
        }"
      >
        <span :style="{ fontSize: '1.5rem' }">🐰</span>
        <strong :style="{ color: 'var(--color-cyber-500)' }">Max:</strong>
      </div>
      <p
        :style="{
          margin: 0,
          fontSize: 'var(--font-size-sm)',
          color: 'var(--text-primary)',
        }"
      >
        "Ooh, shiny buttons! Can I break them? Please? I promise I'll only
        destroy the non-essential ones!"
      </p>
    </div>

    <div
      class="sam-max-comment-bubble sam-bubble"
      :style="{
        position: 'fixed',
        bottom: '30%',
        right: '40px',
        zIndex: 9999,
        backgroundColor: 'var(--surface-elevated)',
        border: '2px solid var(--color-gaming-500)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--spacing-4)',
        maxWidth: '320px',
        boxShadow: 'var(--shadow-glow-gaming)',
        animation: 'float 4s ease-in-out infinite',
      }"
    >
      <div
        :style="{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-3)',
          marginBottom: 'var(--spacing-2)',
        }"
      >
        <span :style="{ fontSize: '1.5rem' }">🐶</span>
        <strong :style="{ color: 'var(--color-gaming-500)' }">Sam:</strong>
      </div>
      <p
        :style="{
          margin: 0,
          fontSize: 'var(--font-size-sm)',
          color: 'var(--text-primary)',
        }"
      >
        "Dr. Donnelly sure knows his way around a design system. This unified
        styling is more organized than my desk!"
      </p>
    </div>
    <!-- Sam Mode Activation -->
    <div v-if="samModeActive" class="sam-mode-overlay">
      <div class="sam-character">
        <div class="speech-bubble">
          <p>
            "Well, I suppose we better help you find a job before Max breaks
            something else..."
          </p>
          <div class="sam-typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
        <div class="sam-avatar">🐕‍🦺</div>
      </div>
    </div>

    <!-- Max Mode Activation -->
    <div v-if="maxModeActive" class="max-mode-overlay">
      <div class="max-character">
        <div class="speech-bubble max-style">
          <p>"Let's DESTROY the job market! In a good way! I think!"</p>
          <div class="max-energy-bar">
            <div class="energy-fill" :style="{ width: maxEnergy + '%' }"></div>
          </div>
        </div>
        <div class="max-avatar">
          🐰<AppIcon name="mdi-lightning-bolt" size="small" color="warning" />
        </div>
      </div>
    </div>

    <!-- Adventure Mode Interface -->
    <div v-if="adventureModeActive" class="adventure-interface">
      <div class="adventure-toolbar">
        <button
          v-for="tool in adventureTools"
          :key="tool.name"
          class="adventure-tool"
          :class="{ active: selectedTool === tool.name }"
          @click="selectTool(tool.name)"
        >
          <i :class="tool.icon"></i>
          <span>{{ tool.name }}</span>
        </button>
      </div>

      <div v-if="currentDialog" class="adventure-dialog">
        <div class="dialog-portrait">
          {{ currentDialog.character }}
        </div>
        <div class="dialog-text">
          <p>{{ currentDialog.text }}</p>
          <div class="dialog-options">
            <button
              v-for="option in currentDialog.options"
              :key="option.id"
              class="dialog-option"
              @click="selectDialogOption(option)"
            >
              {{ option.text }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Hidden Click Zones -->
    <div class="hidden-click-zones">
      <!-- Sam's Desk -->
      <div
        class="click-zone sam-desk"
        title="Sam's organized desk"
        @click="activateSamDialog"
      ></div>

      <!-- Max's Chaos Corner -->
      <div
        class="click-zone max-corner"
        title="Max's chaos corner"
        @click="activateMaxDialog"
      ></div>

      <!-- The Office Phone -->
      <div
        class="click-zone office-phone"
        title="The office phone"
        @click="playPhoneEasterEgg"
      ></div>

      <!-- Soda Machine -->
      <div
        class="click-zone soda-machine"
        title="Mysterious soda machine"
        @click="interactWithSodaMachine"
      ></div>
    </div>

    <!-- Random Dialog Popups -->
    <Transition name="popup-slide">
      <div v-if="randomDialog" class="random-dialog-popup">
        <div class="popup-character">{{ randomDialog.character }}</div>
        <div class="popup-text">{{ randomDialog.text }}</div>
        <button class="popup-close" @click="randomDialog = null">×</button>
      </div>
    </Transition>

    <!-- Gaming References Drawer -->
    <div class="gaming-references-drawer" :class="{ open: showGamingRefs }">
      <div class="drawer-handle" @click="toggleGamingRefs">
        <AppIcon name="mdi-gamepad-variant" context="gaming" />
        <span>Gaming References</span>
      </div>
      <div class="drawer-content">
        <div class="reference-categories">
          <div
            v-for="category in gamingReferences"
            :key="category.name"
            class="reference-category"
          >
            <h4>{{ category.name }}</h4>
            <div class="reference-items">
              <button
                v-for="ref in category.items"
                :key="ref.name"
                class="reference-item"
                :class="{ discovered: ref.discovered }"
                @click="activateReference(ref)"
              >
                <span class="ref-icon">{{ ref.icon }}</span>
                <span class="ref-name">{{ ref.name }}</span>
                <span v-if="!ref.discovered" class="ref-locked"><AppIcon name="mdi-lock" size="small" /></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Console Commands Interface -->
    <div v-if="showConsole" class="easter-console">
      <div class="console-header">
        <span>Sam & Max Debug Console</span>
        <button @click="showConsole = false">×</button>
      </div>
      <div class="console-output">
        <div
          v-for="line in consoleOutput"
          :key="line.id"
          class="console-line"
          :class="line.type"
        >
          {{ line.text }}
        </div>
      </div>
      <div class="console-input">
        <span class="prompt">> </span>
        <input
          ref="consoleInputRef"
          v-model="consoleCommand"
          placeholder="Enter command..."
          @keyup.enter="executeConsoleCommand"
        />
      </div>
    </div>

    <!-- Background Ambience -->
    <!-- <audio ref="ambienceAudio" loop>
      <source src="/sounds/sam-max-office-ambience.mp3" type="audio/mpeg">
    </audio> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, reactive } from 'vue';
import { useRouter } from 'vue-router';

import AppIcon from "@/components/ui/AppIcon.vue";
import { logger } from "@/shared/utils/logger";

// @ts-nocheck
import { refreactive, onUnmounted, nextTick } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

// Reactive state
const samModeActive = ref(false);
const maxModeActive = ref(false);
const adventureModeActive = ref(false);
const showConsole = ref(false);
const showGamingRefs = ref(false);
const maxEnergy = ref(100);
const selectedTool = ref("talk");
const currentDialog = ref(null);
const randomDialog = ref(null);
const consoleCommand = ref("");
const consoleOutput = ref([]);
const consoleInputRef = ref(null);

// Adventure mode tools
const adventureTools = [
  { name: "Talk", icon: "mdi-account-voice" },
  { name: "Look", icon: "mdi-eye" },
  { name: "Use", icon: "mdi-hand-pointing-right" },
  { name: "Pick Up", icon: "mdi-hand-back-left" },
  { name: "Walk", icon: "mdi-walk" },
  { name: "Inventory", icon: "mdi-bag-personal" },
];

// Gaming references data
const gamingReferences = reactive([
  {
    name: "LucasArts Classics",
    items: [
      {
        name: "SCUMM Engine",
        icon: "🎮",
        discovered: false,
        description: "The legendary adventure game engine",
      },
      {
        name: "Monkey Island",
        icon: "🏴‍☠️",
        discovered: false,
        description: "Guybrush Threepwood was here",
      },
      {
        name: "Day of the Tentacle",
        icon: "🐙",
        discovered: false,
        description: "Purple Tentacle's world domination plan",
      },
      {
        name: "Full Throttle",
        icon: "🏍️",
        discovered: false,
        description: "Kick stand, kick ass",
      },
    ],
  },
  {
    name: "Gaming Industry Icons",
    items: [
      {
        name: "Tim Schafer",
        icon: "👨‍💻",
        discovered: false,
        description: "Master of adventure games",
      },
      {
        name: "Ron Gilbert",
        icon: "🧙‍♂️",
        discovered: false,
        description: "Creator of Monkey Island",
      },
      {
        name: "Steve Purcell",
        icon: "🎨",
        discovered: false,
        description: "Creator of Sam & Max",
      },
      {
        name: "Double Fine",
        icon: "🎭",
        discovered: false,
        description: "Fine games, doubled",
      },
    ],
  },
  {
    name: "Career References",
    items: [
      {
        name: "Freelance Police",
        icon: "🚔",
        discovered: true,
        description: "Sam & Max's profession",
      },
      {
        name: "Game Developer",
        icon: "👩‍💻",
        discovered: false,
        description: "Your dream job awaits",
      },
      {
        name: "QA Tester",
        icon: "🐛",
        discovered: false,
        description: "Bug hunter extraordinaire",
      },
      {
        name: "Indie Studio",
        icon: "🏠",
        discovered: false,
        description: "Start your own adventure",
      },
    ],
  },
]);

// Dialog trees
const samDialogs = [
  {
    character: "🐕‍🦺",
    text: "Max, could you please stop clicking randomly on the job board?",
    options: [
      { id: 1, text: "But I like the clicking sounds!", next: "maxResponse1" },
      { id: 2, text: "Sorry Sam, I'll focus on the jobs", next: "samApproval" },
    ],
  },
  {
    character: "🐕‍🦺",
    text: "You know, this career website reminds me of our cases. Methodical, organized...",
    options: [
      {
        id: 1,
        text: "Unlike Max's approach to everything",
        next: "maxOffended",
      },
      {
        id: 2,
        text: "Should we investigate these job postings?",
        next: "samInvestigation",
      },
    ],
  },
];

const maxDialogs = [
  {
    character: "🐰⚡",
    text: "Sam! This job website is BORING! Where are the explosions?!",
    options: [
      {
        id: 1,
        text: "Max, jobs don't usually involve explosions",
        next: "maxDisappointed",
      },
      { id: 2, text: "Maybe in game development they do!", next: "maxExcited" },
    ],
  },
  {
    character: "🐰⚡",
    text: "I bet I could get ANY job here! Watch me apply to everything!",
    options: [
      {
        id: 1,
        text: "Max, that's not how job applications work",
        next: "maxConfused",
      },
      {
        id: 2,
        text: "Let me help you target the right ones",
        next: "maxCooperation",
      },
    ],
  },
];

// Console commands
const consoleCommands = {
  help: () =>
    "Available commands: sam, max, adventure, references, konami, clear, quit",
  sam: () => {
    activateSamMode();
    return "Sam mode activated - Professional and organized";
  },
  max: () => {
    activateMaxMode();
    return "Max mode activated - CHAOS ENGAGED!";
  },
  adventure: () => {
    activateAdventureMode();
    return "Adventure mode activated - Point and click away!";
  },
  references: () => {
    showGamingRefs.value = true;
    return "Gaming references drawer opened";
  },
  konami: () => {
    activateKonamiEasterEgg();
    return "↑↑↓↓←→←→BA - Classic activated!";
  },
  clear: () => {
    consoleOutput.value = [];
    return "";
  },
  quit: () => {
    showConsole.value = false;
    return "Console closed";
  },
  inventory: () =>
    "You have: 1x Resume, 1x Cover Letter, 1x Portfolio, 1x Hope",
  easter: () =>
    Math.random() > 0.5
      ? "You found a secret!"
      : "Nothing here... or is there?",
  phone: () => {
    playPhoneEasterEgg();
    return "Calling the commissioner...";
  },
  soda: () => {
    interactWithSodaMachine();
    return "*CLUNK* Here's your carbonated career fuel!";
  },
};

// Methods
const activateSamMode = () => {
  samModeActive.value = true;
  document.body.classList.add("sam-mode");
  setTimeout(() => {
    samModeActive.value = false;
    document.body.classList.remove("sam-mode");
  }, 10000);
};

const activateMaxMode = () => {
  maxModeActive.value = true;
  document.body.classList.add("max-mode");
  // Max energy animation
  const energyInterval = setInterval(() => {
    maxEnergy.value = Math.random() * 100;
  }, 100);

  setTimeout(() => {
    maxModeActive.value = false;
    document.body.classList.remove("max-mode");
    clearInterval(energyInterval);
    maxEnergy.value = 100;
  }, 8000);
};

const activateAdventureMode = () => {
  adventureModeActive.value = true;
  document.body.classList.add("adventure-mode");
  document.body.style.cursor = "crosshair";
};

const deactivateAdventureMode = () => {
  adventureModeActive.value = false;
  document.body.classList.remove("adventure-mode");
  document.body.style.cursor = "default";
};

const selectTool = (toolName: string) => {
  selectedTool.value = toolName;
  // Change cursor based on selected tool
  const cursors = {
    Talk: "help",
    Look: "zoom-in",
    Use: "pointer",
    "Pick Up": "grab",
    Walk: "move",
    Inventory: "copy",
  };
  document.body.style.cursor = cursors[toolName] || "default";
};

const activateSamDialog = () => {
  currentDialog.value =
    samDialogs[Math.floor(Math.random() * samDialogs.length)];
};

const activateMaxDialog = () => {
  currentDialog.value =
    maxDialogs[Math.floor(Math.random() * maxDialogs.length)];
};

const selectDialogOption = (option: any) => {
  // Handle dialog tree navigation
  logger.debug("Selected dialog option:", option);
  currentDialog.value = null;

  // Trigger random response after delay
  setTimeout(() => {
    showRandomDialog();
  }, 2000);
};

const showRandomDialog = () => {
  const responses = [
    { character: "🐕‍🦺", text: "Interesting choice. Very methodical." },
    { character: "🐰⚡", text: "That was AWESOME! Do it again!" },
    {
      character: "🤖",
      text: "NAVI here - need any assistance with that decision?",
    },
    {
      character: "👮‍♂️",
      text: "The Commissioner wants to know about your progress...",
    },
  ];

  randomDialog.value = responses[Math.floor(Math.random() * responses.length)];

  setTimeout(() => {
    randomDialog.value = null;
  }, 4000);
};

const toggleGamingRefs = () => {
  showGamingRefs.value = !showGamingRefs.value;
};

const activateReference = (ref: any) => {
  if (!ref.discovered) {
    ref.discovered = true;
    showRandomDialog();

    // Award points for discovering references
    const event = new CustomEvent("easter-egg-found", {
      detail: { type: "gaming-reference", name: ref.name, points: 50 },
    });
    window.dispatchEvent(event);
  }
};

const playPhoneEasterEgg = () => {
  const phoneMessages = [
    'Commissioner: "Sam, Max, we need you to investigate these job openings..."',
    'Wrong number: "Is this Pizza Palace? No? Well, got any jobs?"',
    'NAVI AI: "Incoming transmission - job match found!"',
    'Mom: "Honey, have you found a nice job yet?"',
  ];

  const message =
    phoneMessages[Math.floor(Math.random() * phoneMessages.length)];
  randomDialog.value = { character: "📞", text: message };

  setTimeout(() => {
    randomDialog.value = null;
  }, 5000);
};

const interactWithSodaMachine = () => {
  const sodaResponses = [
    'CLUNK! You got a "Career Cola" - +10 motivation!',
    "BZZT! Machine ate your coins. Try debugging instead.",
    'WHIRR! Here\'s a "Networking Nectar" - social skills +5!',
    "DING! You won the jackpot! ...of empty cans.",
  ];

  const response =
    sodaResponses[Math.floor(Math.random() * sodaResponses.length)];
  randomDialog.value = { character: "🥤", text: response };

  setTimeout(() => {
    randomDialog.value = null;
  }, 4000);
};

const executeConsoleCommand = () => {
  const command = consoleCommand.value.toLowerCase().trim();

  const outputLine = {
    id: Date.now(),
    type: "command",
    text: `> ${consoleCommand.value}`,
  };
  consoleOutput.value.push(outputLine);

  if (consoleCommands[command]) {
    const result = consoleCommands[command]();
    if (_result) {
      consoleOutput.value.push({
        id: Date.now() + 1,
        type: "output",
        text: result,
      });
    }
  } else {
    consoleOutput.value.push({
      id: Date.now() + 1,
      type: "error",
      text: `Unknown command: ${command}. Type 'help' for available commands.`,
    });
  }

  consoleCommand.value = "";

  // Scroll to bottom
  nextTick(() => {
    const output = document.querySelector(".console-output");
    if (output) {
      output.scrollTop = output.scrollHeight;
    }
  });
};

const activateKonamiEasterEgg = () => {
  document.body.classList.add("konami-sam-max-mode");

  // Activate all modes simultaneously for chaos
  activateSamMode();
  setTimeout(() => activateMaxMode(), 1000);
  setTimeout(() => activateAdventureMode(), 2000);
  showGamingRefs.value = true;

  setTimeout(() => {
    document.body.classList.remove("konami-sam-max-mode");
    deactivateAdventureMode();
    showGamingRefs.value = false;
  }, 15000);
};

// Keyboard shortcuts
const handleKeyPress = (event: KeyboardEvent) => {
  // Ctrl + Shift + C for console
  if (event.ctrlKey && event.shiftKey && event.key === "C") {
    showConsole.value = !showConsole.value;
    if (showConsole.value) {
      nextTick(() => {
        consoleInputRef.value?.focus();
      });
    }
  }

  // Escape to close console
  if (event.key === "Escape") {
    showConsole.value = false;
    currentDialog.value = null;
    randomDialog.value = null;
  }
};


onMounted(() => {
  document.addEventListener("keydown", handleKeyPress);


  const easter = route.query.easter;
  if (easter === "sam") {
    activateSamMode();
  } else if (easter === "max") {
    activateMaxMode();
  } else if (easter === "adventure") {
    activateAdventureMode();
  }

  // Random dialog trigger
  const randomDialogTimer = setInterval(() => {
    if (Math.random() < 0.1) {

      showRandomDialog();
    }
  }, 30000);

  // Cleanup
  onUnmounted(() => {
    document.removeEventListener("keydown", handleKeyPress);
    clearInterval(randomDialogTimer);
    deactivateAdventureMode();
  });
});

// Expose methods for parent components
defineExpose({
  activateSamMode,
  activateMaxMode,
  activateAdventureMode,
  showConsole: () => {
    showConsole.value = true;
  },
});
</script>

<style scoped>
.sam-max-easter-eggs {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
}

.sam-mode-overlay {
  position: fixed;
  display: flex;
  align-items: flex-end;
  pointer-events: auto;
}

.sam-character {
  display: flex;
  align-items: flex-end;
}

.speech-bubble {
  background: var(--glass-surface-elevated);
  position: relative;
  transition: all var(--animation-normal) var(--easing-standard);
}

[data-theme="dark"] .speech-bubble {
  background: var(--glass-surface-elevated);
}

@media (prefers-reduced-motion: reduce) {
  .speech-bubble {
    transition: none;
  }
}

@media (prefers-contrast: high) {
  .speech-bubble {
    background: var(--color-background-primary);
  }
}

.speech-bubble::after {
  content: "";
  position: absolute;
}

[data-theme="dark"] .speech-bubble::after {
}

.sam-avatar {
}

@keyframes samBob {
  }
  }
}

.sam-typing-indicator {
  display: flex;
}

.sam-typing-indicator span {
}

[data-theme="dark"] .sam-typing-indicator span {
}

@media (prefers-reduced-motion: reduce) {
  .sam-typing-indicator span {
    animation: none;
  }
}

}
}

@keyframes typingBounce {
  }
  }
}

.max-mode-overlay {
  position: fixed;
  display: flex;
  align-items: flex-end;
  pointer-events: auto;
}

.max-character {
  display: flex;
  align-items: flex-end;
}

.speech-bubble.max-style {
  background: linear-gradient(
    var(--glass-surface-elevated),
  );
}

[data-theme="dark"] .speech-bubble.max-style {
  background: linear-gradient(
    var(--glass-surface-elevated),
  );
}

@media (prefers-reduced-motion: reduce) {
  .speech-bubble.max-style {
    animation: none;
  }
}

@keyframes maxBubbleShake {
  }
  }
}

.max-avatar {
}

@keyframes maxBounce {
  }
  }
}

.max-energy-bar {
  overflow: hidden;
}

[data-theme="dark"] .max-energy-bar {
}

.energy-fill {
}

[data-theme="dark"] .energy-fill {
}

.adventure-interface {
  position: fixed;
  pointer-events: auto;
}

.adventure-toolbar {
  display: flex;
  justify-content: center;
  background: var(--glass-surface-primary);
}

[data-theme="dark"] .adventure-toolbar {
}

.adventure-tool {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--glass-surface-secondary);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--duration-normal) var(--easing-standard);
}

.adventure-tool:hover {
  background: var(--glass-surface-elevated);
}

[data-theme="dark"] .adventure-tool:hover {
}

.adventure-tool.active {
  background: var(--glass-surface-elevated);
}

[data-theme="dark"] .adventure-tool.active {
}

.adventure-tool i {
}

.adventure-tool span {
}

.adventure-dialog {
  background: var(--glass-surface-elevated);
  border-radius: var(--radius-lg);
}

[data-theme="dark"] .adventure-dialog {
}

.dialog-portrait {
  text-align: center;
}

.dialog-text {
}

.dialog-options {
  display: flex;
  flex-direction: column;
}

.dialog-option {
  background: var(--glass-surface-secondary);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--duration-normal) var(--easing-standard);
  text-align: left;
}

.dialog-option:hover {
  background: var(--glass-surface-elevated);
}

[data-theme="dark"] .dialog-option:hover {
}

.hidden-click-zones {
  position: absolute;
  pointer-events: none;
}

.click-zone {
  position: absolute;
  pointer-events: auto;
  cursor: pointer;
}

.click-zone:hover {
  border-radius: var(--radius-md);
}

[data-theme="dark"] .click-zone:hover {
}

.sam-desk {
}
.max-corner {
}
.office-phone {
}
.soda-machine {
}

.random-dialog-popup {
  position: fixed;
  background: var(--glass-surface-elevated);
  border-radius: var(--radius-md);
  pointer-events: auto;
}

[data-theme="dark"] .random-dialog-popup {
}

.popup-character {
  text-align: center;
}

.popup-text {
  text-align: center;
}

.popup-close {
  position: absolute;
  background: none;
  border: none;
  color: var(--color-text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--duration-fast) var(--easing-standard);
}

.popup-close:hover {
}

[data-theme="dark"] .popup-close:hover {
}

.popup-slide-enter-active,
.popup-slide-leave-active {
}

.popup-slide-enter-from {
}

.popup-slide-leave-to {
}

.gaming-references-drawer {
  position: fixed;
  background: var(--glass-surface-elevated);
  transition: right var(--duration-slow) var(--easing-standard);
  pointer-events: auto;
  overflow: hidden;
}

[data-theme="dark"] .gaming-references-drawer {
}

.gaming-references-drawer.open {
}

.drawer-handle {
  position: absolute;
  background: var(--glass-surface-elevated);
  border-right: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--duration-normal) var(--easing-standard);
  writing-mode: vertical-rl;
  text-orientation: mixed;
  color: var(--color-text-primary);
}

[data-theme="dark"] .drawer-handle {
}

.drawer-handle:hover {
  background: var(--glass-surface-primary);
}

[data-theme="dark"] .drawer-handle:hover {
}

.drawer-content {
  overflow-y: auto;
}

.reference-category {
}

}

}

.reference-items {
  display: flex;
  flex-direction: column;
}

.reference-item {
  display: flex;
  align-items: center;
  background: var(--glass-surface-secondary);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--duration-normal) var(--easing-standard);
  text-align: left;
}

.reference-item:hover {
  background: var(--glass-surface-elevated);
}

[data-theme="dark"] .reference-item:hover {
}

.reference-item.discovered {
}

[data-theme="dark"] .reference-item.discovered {
}

.ref-icon {
}

.ref-name {
}

.ref-locked {
}

.easter-console {
  position: fixed;
  border-radius: var(--radius-md);
  font-family: var(--font-mono), "Courier New", monospace;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
}

[data-theme="dark"] .easter-console {
}

.console-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--color-background-primary);
  font-weight: bold;
}

[data-theme="dark"] .console-header {
  color: var(--color-background-secondary);
}

.console-header button {
  background: none;
  border: none;
  color: var(--color-background-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity var(--duration-fast) var(--easing-standard);
}

[data-theme="dark"] .console-header button {
  color: var(--color-background-secondary);
}

.console-header button:hover {
}

.console-output {
  overflow-y: auto;
}

[data-theme="dark"] .console-output {
}

.console-line {
}

.console-line.command {
}

[data-theme="dark"] .console-line.command {
}

.console-line.output {
}

[data-theme="dark"] .console-line.output {
}

.console-line.error {
}

[data-theme="dark"] .console-line.error {
}

.console-input {
  display: flex;
  align-items: center;
}

[data-theme="dark"] .console-input {
}

.prompt {
  font-weight: bold;
}

[data-theme="dark"] .prompt {
}

.console-input input {
  background: none;
  border: none;
  color: var(--color-text-primary);
  font-family: inherit;
  outline: none;
}

.console-input input::placeholder {
}

:global(.sam-mode) {
}

:global(.max-mode) {
}

@keyframes maxModeShake {
  }
  }
}

:global(.adventure-mode) {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

:global(.konami-sam-max-mode) {
}

@keyframes konamiRainbow {
  }
  }
}

  .sam-mode-overlay,
  .max-mode-overlay {
    position: fixed;
    justify-content: center;
  }

  .speech-bubble {
  }

  .gaming-references-drawer {
    transform: none;
  }

  .gaming-references-drawer.open {
  }

  .drawer-handle {
  }

  .easter-console {
  }

  .adventure-toolbar {
    flex-wrap: wrap;
  }

  .adventure-tool {
  }
}

@keyframes bounce {
  }
  }
  }
}

@keyframes wiggle {
  }
  }
  }
  }
  }
  }
  }
}

@keyframes float {
  }
  }
  }
}

.sam-max-comment-bubble {
  font-family: var(--font-family-primary);
  backdrop-filter: var(--glass-backdrop-blur-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.sam-max-comment-bubble:hover {
}

.sam-max-comment-bubble.visible {
  display: block;
}

  .sam-max-comment-bubble {
    position: fixed !important;
    font-size: var(--font-size-xs) !important;
  }

  }

  }

  }
}

@media (prefers-reduced-motion: reduce) {
  .sam-max-comment-bubble {
    animation: none !important;
  }
}
</style>
