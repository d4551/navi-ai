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
                <span v-if="!ref.discovered" class="ref-locked"
                  ><AppIcon name="mdi-lock" size="small"
                /></span>
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
import AppIcon from '@/components/ui/AppIcon.vue'
import { logger } from '@/shared/utils/logger'

// @ts-nocheck
import { ref, onMounted, reactive, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Reactive state
const samModeActive = ref(false)
const maxModeActive = ref(false)
const adventureModeActive = ref(false)
const showConsole = ref(false)
const showGamingRefs = ref(false)
const maxEnergy = ref(100)
const selectedTool = ref('talk')
const currentDialog = ref(null)
const randomDialog = ref(null)
const consoleCommand = ref('')
const consoleOutput = ref([])
const consoleInputRef = ref(null)

// Adventure mode tools
const adventureTools = [
  { name: 'Talk', icon: 'mdi-account-voice' },
  { name: 'Look', icon: 'mdi-eye' },
  { name: 'Use', icon: 'mdi-hand-pointing-right' },
  { name: 'Pick Up', icon: 'mdi-hand-back-left' },
  { name: 'Walk', icon: 'mdi-walk' },
  { name: 'Inventory', icon: 'mdi-bag-personal' },
]

// Gaming references data
const gamingReferences = reactive([
  {
    name: 'LucasArts Classics',
    items: [
      {
        name: 'SCUMM Engine',
        icon: '🎮',
        discovered: false,
        description: 'The legendary adventure game engine',
      },
      {
        name: 'Monkey Island',
        icon: '🏴‍☠️',
        discovered: false,
        description: 'Guybrush Threepwood was here',
      },
      {
        name: 'Day of the Tentacle',
        icon: '🐙',
        discovered: false,
        description: "Purple Tentacle's world domination plan",
      },
      {
        name: 'Full Throttle',
        icon: '🏍️',
        discovered: false,
        description: 'Kick stand, kick ass',
      },
    ],
  },
  {
    name: 'Gaming Industry Icons',
    items: [
      {
        name: 'Tim Schafer',
        icon: '👨‍💻',
        discovered: false,
        description: 'Master of adventure games',
      },
      {
        name: 'Ron Gilbert',
        icon: '🧙‍♂️',
        discovered: false,
        description: 'Creator of Monkey Island',
      },
      {
        name: 'Steve Purcell',
        icon: '🎨',
        discovered: false,
        description: 'Creator of Sam & Max',
      },
      {
        name: 'Double Fine',
        icon: '🎭',
        discovered: false,
        description: 'Fine games, doubled',
      },
    ],
  },
  {
    name: 'Career References',
    items: [
      {
        name: 'Freelance Police',
        icon: '🚔',
        discovered: true,
        description: "Sam & Max's profession",
      },
      {
        name: 'Game Developer',
        icon: '👩‍💻',
        discovered: false,
        description: 'Your dream job awaits',
      },
      {
        name: 'QA Tester',
        icon: '🐛',
        discovered: false,
        description: 'Bug hunter extraordinaire',
      },
      {
        name: 'Indie Studio',
        icon: '🏠',
        discovered: false,
        description: 'Start your own adventure',
      },
    ],
  },
])

// Dialog trees
const samDialogs = [
  {
    character: '🐕‍🦺',
    text: 'Max, could you please stop clicking randomly on the job board?',
    options: [
      { id: 1, text: 'But I like the clicking sounds!', next: 'maxResponse1' },
      { id: 2, text: "Sorry Sam, I'll focus on the jobs", next: 'samApproval' },
    ],
  },
  {
    character: '🐕‍🦺',
    text: 'You know, this career website reminds me of our cases. Methodical, organized...',
    options: [
      {
        id: 1,
        text: "Unlike Max's approach to everything",
        next: 'maxOffended',
      },
      {
        id: 2,
        text: 'Should we investigate these job postings?',
        next: 'samInvestigation',
      },
    ],
  },
]

const maxDialogs = [
  {
    character: '🐰⚡',
    text: 'Sam! This job website is BORING! Where are the explosions?!',
    options: [
      {
        id: 1,
        text: "Max, jobs don't usually involve explosions",
        next: 'maxDisappointed',
      },
      { id: 2, text: 'Maybe in game development they do!', next: 'maxExcited' },
    ],
  },
  {
    character: '🐰⚡',
    text: 'I bet I could get ANY job here! Watch me apply to everything!',
    options: [
      {
        id: 1,
        text: "Max, that's not how job applications work",
        next: 'maxConfused',
      },
      {
        id: 2,
        text: 'Let me help you target the right ones',
        next: 'maxCooperation',
      },
    ],
  },
]

// Console commands
const consoleCommands = {
  help: () =>
    'Available commands: sam, max, adventure, references, konami, clear, quit',
  sam: () => {
    activateSamMode()
    return 'Sam mode activated - Professional and organized'
  },
  max: () => {
    activateMaxMode()
    return 'Max mode activated - CHAOS ENGAGED!'
  },
  adventure: () => {
    activateAdventureMode()
    return 'Adventure mode activated - Point and click away!'
  },
  references: () => {
    showGamingRefs.value = true
    return 'Gaming references drawer opened'
  },
  konami: () => {
    activateKonamiEasterEgg()
    return '↑↑↓↓←→←→BA - Classic activated!'
  },
  clear: () => {
    consoleOutput.value = []
    return ''
  },
  quit: () => {
    showConsole.value = false
    return 'Console closed'
  },
  inventory: () =>
    'You have: 1x Resume, 1x Cover Letter, 1x Portfolio, 1x Hope',
  easter: () =>
    Math.random() > 0.5
      ? 'You found a secret!'
      : 'Nothing here... or is there?',
  phone: () => {
    playPhoneEasterEgg()
    return 'Calling the commissioner...'
  },
  soda: () => {
    interactWithSodaMachine()
    return "*CLUNK* Here's your carbonated career fuel!"
  },
}

// Methods
const activateSamMode = () => {
  samModeActive.value = true
  document.body.classList.add('sam-mode')
  setTimeout(() => {
    samModeActive.value = false
    document.body.classList.remove('sam-mode')
  }, 10000)
}

const activateMaxMode = () => {
  maxModeActive.value = true
  document.body.classList.add('max-mode')
  // Max energy animation
  const energyInterval = setInterval(() => {
    maxEnergy.value = Math.random() * 100
  }, 100)

  setTimeout(() => {
    maxModeActive.value = false
    document.body.classList.remove('max-mode')
    clearInterval(energyInterval)
    maxEnergy.value = 100
  }, 8000)
}

const activateAdventureMode = () => {
  adventureModeActive.value = true
  document.body.classList.add('adventure-mode')
  document.body.style.cursor = 'crosshair'
}

const deactivateAdventureMode = () => {
  adventureModeActive.value = false
  document.body.classList.remove('adventure-mode')
  document.body.style.cursor = 'default'
}

const selectTool = (toolName: string) => {
  selectedTool.value = toolName
  // Change cursor based on selected tool
  const cursors = {
    Talk: 'help',
    Look: 'zoom-in',
    Use: 'pointer',
    'Pick Up': 'grab',
    Walk: 'move',
    Inventory: 'copy',
  }
  document.body.style.cursor = cursors[toolName] || 'default'
}

const activateSamDialog = () => {
  currentDialog.value =
    samDialogs[Math.floor(Math.random() * samDialogs.length)]
}

const activateMaxDialog = () => {
  currentDialog.value =
    maxDialogs[Math.floor(Math.random() * maxDialogs.length)]
}

const selectDialogOption = (option: any) => {
  // Handle dialog tree navigation
  logger.debug('Selected dialog option:', option)
  currentDialog.value = null

  // Trigger random response after delay
  setTimeout(() => {
    showRandomDialog()
  }, 2000)
}

const showRandomDialog = () => {
  const responses = [
    { character: '🐕‍🦺', text: 'Interesting choice. Very methodical.' },
    { character: '🐰⚡', text: 'That was AWESOME! Do it again!' },
    {
      character: '🤖',
      text: 'NAVI here - need any assistance with that decision?',
    },
    {
      character: '👮‍♂️',
      text: 'The Commissioner wants to know about your progress...',
    },
  ]

  randomDialog.value = responses[Math.floor(Math.random() * responses.length)]

  setTimeout(() => {
    randomDialog.value = null
  }, 4000)
}

const toggleGamingRefs = () => {
  showGamingRefs.value = !showGamingRefs.value
}

const activateReference = (ref: any) => {
  if (!ref.discovered) {
    ref.discovered = true
    showRandomDialog()

    // Award points for discovering references
    const event = new CustomEvent('easter-egg-found', {
      detail: { type: 'gaming-reference', name: ref.name, points: 50 },
    })
    window.dispatchEvent(event)
  }
}

const playPhoneEasterEgg = () => {
  const phoneMessages = [
    'Commissioner: "Sam, Max, we need you to investigate these job openings..."',
    'Wrong number: "Is this Pizza Palace? No? Well, got any jobs?"',
    'NAVI AI: "Incoming transmission - job match found!"',
    'Mom: "Honey, have you found a nice job yet?"',
  ]

  const message =
    phoneMessages[Math.floor(Math.random() * phoneMessages.length)]
  randomDialog.value = { character: '📞', text: message }

  setTimeout(() => {
    randomDialog.value = null
  }, 5000)
}

const interactWithSodaMachine = () => {
  const sodaResponses = [
    'CLUNK! You got a "Career Cola" - +10 motivation!',
    'BZZT! Machine ate your coins. Try debugging instead.',
    'WHIRR! Here\'s a "Networking Nectar" - social skills +5!',
    'DING! You won the jackpot! ...of empty cans.',
  ]

  const response =
    sodaResponses[Math.floor(Math.random() * sodaResponses.length)]
  randomDialog.value = { character: '🥤', text: response }

  setTimeout(() => {
    randomDialog.value = null
  }, 4000)
}

const executeConsoleCommand = () => {
  const command = consoleCommand.value.toLowerCase().trim()

  const outputLine = {
    id: Date.now(),
    type: 'command',
    text: `> ${consoleCommand.value}`,
  }
  consoleOutput.value.push(outputLine)

  if (consoleCommands[command]) {
    const result = consoleCommands[command]()
    if (result) {
      consoleOutput.value.push({
        id: Date.now() + 1,
        type: 'output',
        text: result,
      })
    }
  } else {
    consoleOutput.value.push({
      id: Date.now() + 1,
      type: 'error',
      text: `Unknown command: ${command}. Type 'help' for available commands.`,
    })
  }

  consoleCommand.value = ''

  // Scroll to bottom
  nextTick(() => {
    const output = document.querySelector('.console-output')
    if (output) {
      output.scrollTop = output.scrollHeight
    }
  })
}

const activateKonamiEasterEgg = () => {
  document.body.classList.add('konami-sam-max-mode')

  // Activate all modes simultaneously for chaos
  activateSamMode()
  setTimeout(() => activateMaxMode(), 1000)
  setTimeout(() => activateAdventureMode(), 2000)
  showGamingRefs.value = true

  setTimeout(() => {
    document.body.classList.remove('konami-sam-max-mode')
    deactivateAdventureMode()
    showGamingRefs.value = false
  }, 15000)
}

// Keyboard shortcuts
const handleKeyPress = (event: KeyboardEvent) => {
  // Ctrl + Shift + C for console
  if (event.ctrlKey && event.shiftKey && event.key === 'C') {
    showConsole.value = !showConsole.value
    if (showConsole.value) {
      nextTick(() => {
        consoleInputRef.value?.focus()
      })
    }
  }

  // Escape to close console
  if (event.key === 'Escape') {
    showConsole.value = false
    currentDialog.value = null
    randomDialog.value = null
  }
}

// Check for easter egg activation from route
onMounted(() => {
  document.addEventListener('keydown', handleKeyPress)

  // Check URL parameters for easter egg activation
  const easter = route.query.easter
  if (easter === 'sam') {
    activateSamMode()
  } else if (easter === 'max') {
    activateMaxMode()
  } else if (easter === 'adventure') {
    activateAdventureMode()
  }

  // Random dialog trigger
  const randomDialogTimer = setInterval(() => {
    if (Math.random() < 0.1) {
      // 10% chance every 30 seconds
      showRandomDialog()
    }
  }, 30000)

  // Cleanup
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyPress)
    clearInterval(randomDialogTimer)
    deactivateAdventureMode()
  })
})

// Expose methods for parent components
defineExpose({
  activateSamMode,
  activateMaxMode,
  activateAdventureMode,
  showConsole: () => {
    showConsole.value = true
  },
})
</script>

<style scoped>
.sam-max-easter-eggs {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
}

/* Sam Mode Overlay */
.sam-mode-overlay {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  pointer-events: auto;
  z-index: 10000;
}

.sam-character {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
}

.speech-bubble {
  background: var(--glass-surface-elevated);
  backdrop-filter: blur(20px) saturate(180%);
  border: 2px solid var(--color-gaming-500);
  border-radius: 20px 20px 4px 20px;
  padding: 1rem 1.5rem;
  max-width: 300px;
  position: relative;
  box-shadow: 0 8px 32px rgba(var(--color-gaming-500-rgb), 0.3);
  transition: all var(--animation-normal) var(--easing-standard);
}

[data-theme='dark'] .speech-bubble {
  background: var(--glass-surface-elevated);
  border-color: var(--color-gaming-400);
  box-shadow: 0 8px 32px rgba(var(--color-gaming-400-rgb), 0.4);
}

@media (prefers-reduced-motion: reduce) {
  .speech-bubble {
    transition: none;
  }
}

@media (prefers-contrast: high) {
  .speech-bubble {
    border-width: 3px;
    background: var(--color-background-primary);
  }
}

.speech-bubble::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 20px;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 8px solid var(--color-gaming-500);
}

[data-theme='dark'] .speech-bubble::after {
  border-top-color: var(--color-gaming-400);
}

.sam-avatar {
  font-size: 4rem;
  animation: samBob 3s ease-in-out infinite;
}

@keyframes samBob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.sam-typing-indicator {
  display: flex;
  gap: 4px;
  margin-top: 0.5rem;
}

.sam-typing-indicator span {
  width: 6px;
  height: 6px;
  background: var(--color-gaming-500);
  border-radius: 50%;
  animation: typingBounce 1.4s infinite;
}

[data-theme='dark'] .sam-typing-indicator span {
  background: var(--color-gaming-400);
}

@media (prefers-reduced-motion: reduce) {
  .sam-typing-indicator span {
    animation: none;
  }
}

.sam-typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}
.sam-typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingBounce {
  0%,
  60%,
  100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

/* Max Mode Overlay */
.max-mode-overlay {
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  pointer-events: auto;
  z-index: 10000;
}

.max-character {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
}

.speech-bubble.max-style {
  border-color: var(--color-accent-500);
  box-shadow: 0 8px 32px rgba(var(--color-accent-500-rgb), 0.3);
  background: linear-gradient(
    135deg,
    var(--glass-surface-elevated),
    rgba(var(--color-accent-500-rgb), 0.1)
  );
  animation: maxBubbleShake 0.5s ease-in-out infinite alternate;
}

[data-theme='dark'] .speech-bubble.max-style {
  border-color: var(--color-accent-400);
  box-shadow: 0 8px 32px rgba(var(--color-accent-400-rgb), 0.4);
  background: linear-gradient(
    135deg,
    var(--glass-surface-elevated),
    rgba(var(--color-accent-400-rgb), 0.15)
  );
}

@media (prefers-reduced-motion: reduce) {
  .speech-bubble.max-style {
    animation: none;
  }
}

@keyframes maxBubbleShake {
  0% {
    transform: rotate(-1deg);
  }
  100% {
    transform: rotate(1deg);
  }
}

.max-avatar {
  font-size: 4rem;
  animation: maxBounce 0.3s ease-in-out infinite alternate;
}

@keyframes maxBounce {
  0% {
    transform: scale(1) rotate(0deg);
  }
  100% {
    transform: scale(1.1) rotate(5deg);
  }
}

.max-energy-bar {
  width: 100%;
  height: 6px;
  background: rgba(var(--color-accent-500-rgb), 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 0.5rem;
}

[data-theme='dark'] .max-energy-bar {
  background: rgba(var(--color-accent-400-rgb), 0.2);
}

.energy-fill {
  height: 100%;
  background: var(--color-accent-500);
  border-radius: 3px;
  transition: width 0.1s ease;
}

[data-theme='dark'] .energy-fill {
  background: var(--color-accent-400);
}

/* Adventure Mode Interface */
.adventure-interface {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  pointer-events: auto;
  z-index: 10000;
}

.adventure-toolbar {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--glass-surface-primary);
  backdrop-filter: blur(20px) saturate(180%);
  border-top: 2px solid var(--color-success-500);
  box-shadow: 0 -8px 32px rgba(var(--color-shadow-rgb), 0.3);
}

[data-theme='dark'] .adventure-toolbar {
  border-top-color: var(--color-success-400);
}

.adventure-tool {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem;
  background: var(--glass-surface-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--duration-normal) var(--easing-standard);
  min-width: 80px;
}

.adventure-tool:hover {
  background: var(--glass-surface-elevated);
  border-color: var(--color-success-500);
  transform: translateY(-2px);
}

[data-theme='dark'] .adventure-tool:hover {
  border-color: var(--color-success-400);
}

.adventure-tool.active {
  background: var(--glass-surface-elevated);
  border-color: var(--color-gaming-500);
  box-shadow: 0 8px 32px rgba(var(--color-gaming-500-rgb), 0.3);
}

[data-theme='dark'] .adventure-tool.active {
  border-color: var(--color-gaming-400);
  box-shadow: 0 8px 32px rgba(var(--color-gaming-400-rgb), 0.4);
}

.adventure-tool i {
  font-size: 1.5rem;
}

.adventure-tool span {
  font-size: 0.75rem;
  font-weight: 600;
}

.adventure-dialog {
  position: fixed; /* Use .center-fixed class from design system */
  background: var(--glass-surface-elevated);
  backdrop-filter: blur(20px) saturate(180%);
  border: 2px solid var(--color-brand-500);
  border-radius: var(--radius-lg);
  padding: 2rem;
  max-width: 500px;
  width: 90vw;
  box-shadow: 0 8px 32px rgba(var(--color-brand-500-rgb), 0.3);
}

[data-theme='dark'] .adventure-dialog {
  border-color: var(--color-brand-400);
  box-shadow: 0 8px 32px rgba(var(--color-brand-400-rgb), 0.4);
}

.dialog-portrait {
  font-size: 3rem;
  text-align: center;
  margin-bottom: 1rem;
}

.dialog-text {
  margin-bottom: 1.5rem;
}

.dialog-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dialog-option {
  padding: 0.75rem;
  background: var(--glass-surface-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--duration-normal) var(--easing-standard);
  text-align: left;
}

.dialog-option:hover {
  background: var(--glass-surface-elevated);
  border-color: var(--color-gaming-500);
  transform: translateX(8px);
}

[data-theme='dark'] .dialog-option:hover {
  border-color: var(--color-gaming-400);
}

/* Hidden Click Zones */
.hidden-click-zones {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.click-zone {
  position: absolute;
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.3s ease;
}

.click-zone:hover {
  background: rgba(var(--color-success-500-rgb), 0.1);
  border: 2px solid var(--color-success-500);
  border-radius: var(--radius-md);
}

[data-theme='dark'] .click-zone:hover {
  background: rgba(var(--color-success-400-rgb), 0.15);
  border-color: var(--color-success-400);
}

.sam-desk {
  top: 20%;
  right: 15%;
  width: 100px;
  height: 80px;
}
.max-corner {
  top: 25%;
  left: 10%;
  width: 120px;
  height: 100px;
}
.office-phone {
  top: 10%;
  right: 25%;
  width: 60px;
  height: 60px;
}
.soda-machine {
  bottom: 30%;
  right: 5%;
  width: 80px;
  height: 120px;
}

/* Random Dialog Popup */
.random-dialog-popup {
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--glass-surface-elevated);
  backdrop-filter: blur(20px) saturate(180%);
  border: 2px solid var(--color-warning-500);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  max-width: 400px;
  pointer-events: auto;
  box-shadow: 0 8px 32px rgba(var(--color-warning-500-rgb), 0.3);
  z-index: 10001;
}

[data-theme='dark'] .random-dialog-popup {
  border-color: var(--color-warning-400);
  box-shadow: 0 8px 32px rgba(var(--color-warning-400-rgb), 0.4);
}

.popup-character {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 0.5rem;
}

.popup-text {
  margin-bottom: 1rem;
  text-align: center;
}

.popup-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-text-primary);
  cursor: pointer;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--duration-fast) var(--easing-standard);
}

.popup-close:hover {
  background: rgba(var(--color-error-500-rgb), 0.2);
}

[data-theme='dark'] .popup-close:hover {
  background: rgba(var(--color-error-400-rgb), 0.2);
}

.popup-slide-enter-active,
.popup-slide-leave-active {
  transition: all 0.3s ease;
}

.popup-slide-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.popup-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* Gaming References Drawer */
.gaming-references-drawer {
  position: fixed;
  right: -350px;
  top: 50%;
  transform: translateY(-50%);
  width: 350px;
  height: 70vh;
  background: var(--glass-surface-elevated);
  backdrop-filter: blur(20px) saturate(180%);
  border: 2px solid var(--color-brand-500);
  border-radius: var(--radius-md) 0 0 var(--radius-md);
  transition: right var(--duration-slow) var(--easing-standard);
  pointer-events: auto;
  z-index: 10000;
  overflow: hidden;
}

[data-theme='dark'] .gaming-references-drawer {
  border-color: var(--color-brand-400);
}

.gaming-references-drawer.open {
  right: 0;
}

.drawer-handle {
  position: absolute;
  left: -60px;
  top: 50%;
  transform: translateY(-50%);
  width: 60px;
  height: 120px;
  background: var(--glass-surface-elevated);
  backdrop-filter: blur(20px) saturate(180%);
  border: 2px solid var(--color-brand-500);
  border-right: none;
  border-radius: var(--radius-md) 0 0 var(--radius-md);
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

[data-theme='dark'] .drawer-handle {
  border-color: var(--color-brand-400);
}

.drawer-handle:hover {
  background: var(--glass-surface-primary);
  box-shadow: 0 8px 32px rgba(var(--color-brand-500-rgb), 0.3);
}

[data-theme='dark'] .drawer-handle:hover {
  box-shadow: 0 8px 32px rgba(var(--color-brand-400-rgb), 0.4);
}

.drawer-content {
  height: 100%;
  overflow-y: auto;
  padding: 1rem;
}

.reference-category {
  margin-bottom: 2rem;
}

.reference-category h4 {
  color: var(--color-brand-500);
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 700;
}

[data-theme='dark'] .reference-category h4 {
  color: var(--color-brand-400);
}

.reference-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.reference-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--glass-surface-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--duration-normal) var(--easing-standard);
  text-align: left;
  width: 100%;
}

.reference-item:hover {
  background: var(--glass-surface-elevated);
  border-color: var(--color-success-500);
  transform: translateX(4px);
}

[data-theme='dark'] .reference-item:hover {
  border-color: var(--color-success-400);
}

.reference-item.discovered {
  border-color: var(--color-success-500);
  background: rgba(var(--color-success-500-rgb), 0.1);
}

[data-theme='dark'] .reference-item.discovered {
  border-color: var(--color-success-400);
  background: rgba(var(--color-success-400-rgb), 0.15);
}

.ref-icon {
  font-size: 1.5rem;
}

.ref-name {
  flex: 1;
  font-weight: 600;
}

.ref-locked {
  font-size: 1rem;
}

/* Console Interface */
.easter-console {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  max-width: 90vw;
  height: 400px;
  background: rgba(var(--color-background-secondary-rgb), 0.95);
  backdrop-filter: blur(20px) saturate(180%);
  border: 2px solid var(--color-success-500);
  border-radius: var(--radius-md);
  font-family: var(--font-mono), 'Courier New', monospace;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  z-index: 10001;
  box-shadow: 0 8px 32px rgba(var(--color-success-500-rgb), 0.3);
}

[data-theme='dark'] .easter-console {
  border-color: var(--color-success-400);
  box-shadow: 0 8px 32px rgba(var(--color-success-400-rgb), 0.4);
  background: rgba(var(--color-background-primary-rgb), 0.95);
}

.console-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: var(--color-success-500);
  color: var(--color-background-primary);
  font-weight: bold;
}

[data-theme='dark'] .console-header {
  background: var(--color-success-400);
  color: var(--color-background-secondary);
}

.console-header button {
  background: none;
  border: none;
  color: var(--color-background-primary);
  font-size: 1.2rem;
  cursor: pointer;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity var(--duration-fast) var(--easing-standard);
}

[data-theme='dark'] .console-header button {
  color: var(--color-background-secondary);
}

.console-header button:hover {
  opacity: 0.7;
}

.console-output {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  background: rgba(var(--color-background-primary-rgb), 0.8);
}

[data-theme='dark'] .console-output {
  background: rgba(var(--color-background-secondary-rgb), 0.8);
}

.console-line {
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.console-line.command {
  color: var(--color-gaming-500);
}

[data-theme='dark'] .console-line.command {
  color: var(--color-gaming-400);
}

.console-line.output {
  color: var(--color-success-500);
}

[data-theme='dark'] .console-line.output {
  color: var(--color-success-400);
}

.console-line.error {
  color: var(--color-error-500);
}

[data-theme='dark'] .console-line.error {
  color: var(--color-error-400);
}

.console-input {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: rgba(var(--color-background-primary-rgb), 0.9);
  border-top: 1px solid var(--color-success-500);
}

[data-theme='dark'] .console-input {
  background: rgba(var(--color-background-secondary-rgb), 0.9);
  border-top-color: var(--color-success-400);
}

.prompt {
  color: var(--color-success-500);
  margin-right: 0.5rem;
  font-weight: bold;
}

[data-theme='dark'] .prompt {
  color: var(--color-success-400);
}

.console-input input {
  flex: 1;
  background: none;
  border: none;
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: 0.9rem;
  outline: none;
}

.console-input input::placeholder {
  color: rgba(var(--color-text-secondary-rgb), 0.7);
}

/* Global Sam & Max Mode Classes */
:global(.sam-mode) {
  filter: sepia(20%) hue-rotate(200deg) brightness(1.1);
}

:global(.max-mode) {
  filter: saturate(150%) contrast(110%) brightness(1.1);
  animation: maxModeShake 0.1s ease-in-out infinite alternate;
}

@keyframes maxModeShake {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(1px);
  }
}

:global(.adventure-mode) {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

:global(.konami-sam-max-mode) {
  animation: konamiRainbow 2s linear infinite;
}

@keyframes konamiRainbow {
  0% {
    filter: hue-rotate(0deg) saturate(150%);
  }
  100% {
    filter: hue-rotate(360deg) saturate(150%);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .sam-mode-overlay,
  .max-mode-overlay {
    position: fixed;
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    justify-content: center;
  }

  .speech-bubble {
    max-width: 250px;
  }

  .gaming-references-drawer {
    width: 100vw;
    right: -100vw;
    border-radius: 0;
    height: 100vh;
    top: 0;
    transform: none;
  }

  .gaming-references-drawer.open {
    right: 0;
  }

  .drawer-handle {
    left: -50px;
    width: 50px;
    height: 100px;
  }

  .easter-console {
    width: 95vw;
    height: 60vh;
  }

  .adventure-toolbar {
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .adventure-tool {
    min-width: 60px;
    padding: 0.5rem;
  }
}

/* Sam & Max Comment Bubble Animations */
@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes wiggle {
  0%,
  7% {
    transform: rotateZ(0);
  }
  15% {
    transform: rotateZ(-2deg);
  }
  20% {
    transform: rotateZ(2deg);
  }
  25% {
    transform: rotateZ(-1deg);
  }
  30% {
    transform: rotateZ(1deg);
  }
  35% {
    transform: rotateZ(0);
  }
  100% {
    transform: rotateZ(0);
  }
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
  100% {
    transform: translateY(0px);
  }
}

.sam-max-comment-bubble {
  font-family: var(--font-family-primary);
  backdrop-filter: var(--glass-backdrop-blur-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
  display: none; /* Hidden by default - shown by easter egg toggle */
}

.sam-max-comment-bubble:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-2xl);
}

/* Show bubbles when easter egg is active */
.sam-max-comment-bubble.visible {
  display: block;
}

/* Mobile responsiveness for comment bubbles */
@media (max-width: 768px) {
  .sam-max-comment-bubble {
    position: fixed !important;
    left: 10px !important;
    right: 10px !important;
    max-width: calc(100vw - 20px) !important;
    font-size: var(--font-size-xs) !important;
  }

  .sam-max-comment-bubble:nth-child(1) {
    top: 10% !important;
  }

  .sam-max-comment-bubble:nth-child(2) {
    top: 30% !important;
  }

  .sam-max-comment-bubble:nth-child(3) {
    bottom: 20% !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sam-max-comment-bubble {
    animation: none !important;
  }
}
</style>
