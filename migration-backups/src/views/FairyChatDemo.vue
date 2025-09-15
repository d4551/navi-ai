<template>
  <StandardPageLayout page-type="gaming" content-spacing="normal" max-width="xl">
    <!-- Enhanced Demo Header -->
    <div class="demo-header enhanced-glass-card neon-hover on-glass">
      <div class="demo-title">
        <AppIcon name="mdi-robot-outline" />
        <h1>NAVI Assistant Chat Demo</h1>
      </div>
      <div class="demo-description">
        Experience our enhanced fairy chat interface with master design system integration.
        Features multimodal controls, responsive design, and glass morphism styling.
      </div>
      
      <!-- Control Panel -->
      <div class="demo-controls">
        <div class="control-group">
          <h3>Chat Controls</h3>
          <div class="control-buttons">
            <UnifiedButton 
              variant="gaming" 
              leading-icon="mdi-robot" 
              @click="open = true"
            >
              Open NAVI Assistant
            </UnifiedButton>
            <UnifiedButton 
              variant="outline" 
              leading-icon="mdi-message-plus"
              @click="addSample()"
            >
              Add Sample Message
            </UnifiedButton>
            <UnifiedButton 
              variant="ghost" 
              leading-icon="mdi-refresh"
              @click="resetChat()"
            >
              Reset Chat
            </UnifiedButton>
          </div>
        </div>
        
        <div class="control-group">
          <h3>Modal Size</h3>
          <div class="size-controls glass-surface neon-hover on-glass">
            <UnifiedButton
              v-for="size in ['md', 'lg', 'xl']"
              :key="size"
              :variant="modalSize === size ? 'glass' : 'ghost'"
              size="sm"
              @click="modalSize = size"
            >
              {{ size.toUpperCase() }}
            </UnifiedButton>
          </div>
        </div>
        
        <div class="control-group">
          <h3>Demo Actions</h3>
          <div class="control-buttons">
            <UnifiedButton 
              variant="outline" 
              leading-icon="mdi-account-plus"
              size="sm"
              @click="simulateUserMessage()"
            >
              Add User Message
            </UnifiedButton>
            <UnifiedButton 
              variant="outline" 
              leading-icon="mdi-robot"
              size="sm"
              @click="simulateAIResponse()"
            >
              Add AI Response
            </UnifiedButton>
            <UnifiedButton 
              variant="outline" 
              leading-icon="mdi-information"
              size="sm"
              @click="addSystemMessage()"
            >
              Add System Message
            </UnifiedButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Feature Showcase -->
    <div class="features-showcase dense-grid dense-grid--auto-fit">
      <div class="feature-card enhanced-glass-card is-interactive neon-hover on-glass">
        <AppIcon name="mdi-palette" />
        <h3>Master Design System</h3>
        <p>Integrated UnifiedButton, IconButton, and glass morphism styling throughout the interface.</p>
      </div>
      <div class="feature-card enhanced-glass-card is-interactive neon-hover on-glass">
        <AppIcon name="mdi-responsive" />
        <h3>Responsive Design</h3>
        <p>Optimized for all screen sizes with touch-friendly controls and mobile-first approach.</p>
      </div>
      <div class="feature-card enhanced-glass-card is-interactive neon-hover on-glass">
        <AppIcon name="mdi-microphone" />
        <h3>Multimodal Controls</h3>
        <p>Voice input, video streaming, screenshot capture, and file upload capabilities.</p>
      </div>
      <div class="feature-card enhanced-glass-card is-interactive neon-hover on-glass">
        <AppIcon name="mdi-animation" />
        <h3>Enhanced Animations</h3>
        <p>Smooth transitions, message slide-ins, and accessibility-aware animations.</p>
      </div>
    </div>

    <!-- Enhanced Chat Modal -->
    <FairyChatModal v-model:open="open" :messages="messages" :size="modalSize" @send="onSend" />
  </StandardPageLayout>
</template>

<script setup>
import { ref } from 'vue'
import StandardPageLayout from '@/components/layout/StandardPageLayout.vue'
import FairyChatModal from '@/components/FairyChatModal.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

const open = ref(false)
const modalSize = ref('lg')
const messages = ref([
  { id: 'm1', type: 'ai', content: "Hi! I'm NAVI, your AI career fairy ✨\nHow can I help with your gaming career today?", timestamp: Date.now() - 120000 },
  { id: 'm2', type: 'user', content: 'Can you review my resume for a gameplay programmer role?', timestamp: Date.now() - 60000 },
  { id: 'm3', type: 'ai', content: 'Absolutely! Upload your resume or paste the text here. I will check for:\n\n• Technical skills alignment\n• ATS compliance\n• Gaming industry keywords\n• Project showcase effectiveness', timestamp: Date.now() - 30000 },
])

const sampleUserMessages = [
  'What skills should I highlight for a game designer role?',
  'How do I make my portfolio stand out?',
  'What are the best game engines to learn?',
  'Can you help me prepare for a Unity developer interview?',
  'What should I include in my game development resume?',
  'How do I transition from web dev to game dev?'
]

const sampleAIResponses = [
  'Great question! For game designers, focus on creativity, systems thinking, and player experience design.',
  'Portfolio is key in game development! Show diverse projects that demonstrate your technical and creative skills.',
  'Unity and Unreal Engine are the top choices. Unity for indie/mobile, Unreal for AAA productions.',
  'Unity interviews often cover C# programming, component systems, and optimization techniques.',
  'Include shipped games, technical projects, collaborative work, and tools you\'ve built.',
  'Leverage your programming skills! Game development values clean code and problem-solving abilities.',
  'I\'d be happy to help! What specific area of game development interests you most?',
  'Let me analyze that for you and provide detailed feedback on improvements.',
  'Here are some resources and next steps to accelerate your learning path.'
]

function onSend(text) {
  const now = Date.now()
  messages.value.push({ id: 'u-' + now, type: 'user', content: text, timestamp: now })
  
  // Simulate realistic AI response delay
  setTimeout(() => {
    const randomResponse = sampleAIResponses[Math.floor(Math.random() * sampleAIResponses.length)]
    messages.value.push({ 
      id: 'a-' + (now + 1), 
      type: 'ai', 
      content: randomResponse, 
      timestamp: now + Math.random() * 2000 + 800 
    })
  }, 600 + Math.random() * 1000)
}

function addSample() {
  const now = Date.now()
  messages.value.push({ 
    id: 's-' + now, 
    type: 'system', 
    content: 'System: Connected to NAVI gaming career services. Enhanced multimodal features available.', 
    timestamp: now 
  })
}

function simulateUserMessage() {
  const randomMessage = sampleUserMessages[Math.floor(Math.random() * sampleUserMessages.length)]
  onSend(randomMessage)
}

function simulateAIResponse() {
  const now = Date.now()
  const randomResponse = sampleAIResponses[Math.floor(Math.random() * sampleAIResponses.length)]
  messages.value.push({ 
    id: 'a-' + now, 
    type: 'ai', 
    content: randomResponse, 
    timestamp: now 
  })
}

function addSystemMessage() {
  const now = Date.now()
  const systemMessages = [
    'System: Voice recognition activated.',
    'System: Screen sharing enabled.',
    'System: File upload ready.',
    'System: Gaming industry database updated.',
    'System: Resume analysis complete.',
    'System: Interview simulation mode activated.'
  ]
  const randomSystemMessage = systemMessages[Math.floor(Math.random() * systemMessages.length)]
  messages.value.push({ 
    id: 's-' + now, 
    type: 'system', 
    content: randomSystemMessage, 
    timestamp: now 
  })
}

function resetChat() {
  messages.value = [
    { id: 'm1', type: 'ai', content: "Hi! I'm NAVI, your AI career fairy ✨\nHow can I help with your gaming career today?", timestamp: Date.now() - 1000 }
  ]
}
</script>

<style scoped>
/* Demo Page Styling */
.demo-header {
  /* enhanced-glass-card handles surface, border, radius, padding */
  margin-bottom: var(--spacing-6);
}

.demo-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-4);
}

.demo-title h1 {
  font-family: var(--font-primary);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-3xl);
  color: var(--text-primary);
  margin: 0;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.demo-description {
  font-family: var(--font-primary);
  font-size: var(--font-size-lg);
  line-height: var(--line-height-relaxed);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-6);
  max-width: 60ch;
}

/* Demo Controls */
.demo-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-6);
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.control-group h3 {
  font-family: var(--font-primary);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-lg);
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.control-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.size-controls {
  display: flex;
  gap: var(--spacing-1);
  padding: var(--spacing-1);
  background: var(--glass-bg-light);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
}

/* Features Showcase */
.features-showcase {
  display: grid; /* dense-grid utilities augment this */
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-6);
}

.feature-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--spacing-3);
  transition: all var(--duration-normal) var(--easing-ease);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--gradient-primary-subtle);
  opacity: 0.6;
}

.feature-card:hover {
  transform: translateY(-4px);
  /* neon-hover provides glow; enhanced card manages border */
}

.feature-card h3 {
  font-family: var(--font-primary);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-xl);
  color: var(--text-primary);
  margin: 0;
}

.feature-card p {
  font-family: var(--font-primary);
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  color: var(--text-secondary);
  margin: 0;
}

.feature-card .app-icon {
  font-size: 2rem;
  color: var(--color-primary);
  background: var(--color-primary-bg);
  padding: var(--spacing-3);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-primary-border);
}

/* Responsive Design */
@media (max-width: 768px) {
  .demo-header {
    padding: var(--spacing-4);
    margin-bottom: var(--spacing-4);
  }
  
  .demo-title h1 {
    font-size: var(--font-size-2xl);
  }
  
  .demo-description {
    font-size: var(--font-size-base);
    margin-bottom: var(--spacing-4);
  }
  
  .demo-controls {
    grid-template-columns: 1fr;
    gap: var(--spacing-4);
  }
  
  .control-buttons {
    justify-content: center;
  }
  
  .features-showcase {
    grid-template-columns: 1fr;
    gap: var(--spacing-3);
    margin-bottom: var(--spacing-4);
  }
  
  .feature-card {
    padding: var(--spacing-4);
  }
}

@media (max-width: 480px) {
  .demo-header {
    padding: var(--spacing-3);
  }
  
  .demo-title {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-2);
  }
  
  .demo-title h1 {
    font-size: var(--font-size-xl);
  }
  
  .control-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .size-controls {
    justify-content: center;
  }
}

/* Dark theme enhancements */
[data-theme="dark"] .demo-header {
  background: rgba(15, 15, 15, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .feature-card {
  background: rgba(20, 20, 20, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .size-controls {
  background: rgba(25, 25, 25, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
}

/* Gaming theme enhancements */
.theme-gaming .demo-header {
  background: linear-gradient(135deg, 
    rgba(15, 15, 15, 0.9) 0%, 
    rgba(20, 35, 25, 0.9) 100%
  );
  border-color: rgba(0, 255, 136, 0.2);
}

.theme-gaming .feature-card {
  background: linear-gradient(135deg, 
    rgba(15, 15, 15, 0.85) 0%, 
    rgba(20, 35, 25, 0.85) 100%
  );
  border-color: rgba(0, 255, 136, 0.15);
}

.theme-gaming .feature-card:hover {
  border-color: rgba(0, 255, 136, 0.3);
  box-shadow: 
    var(--shadow-xl),
    0 0 20px rgba(0, 255, 136, 0.1);
}

.theme-gaming .demo-title h1 {
  background: linear-gradient(135deg, 
    rgb(0, 255, 136) 0%, 
    rgb(0, 217, 255) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Performance optimizations */
.feature-card {
  contain: layout style;
  will-change: transform;
}

.features-showcase {
  contain: layout;
}

.demo-controls {
  contain: layout;
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .feature-card {
    transition: none;
  }
  
  .feature-card:hover {
    transform: none;
  }
}

@media (prefers-contrast: high) {
  .demo-header,
  .feature-card,
  .size-controls {
    border-width: 2px;
  }
  
  .feature-card:hover {
    border-color: var(--color-primary);
  }
}
</style>
