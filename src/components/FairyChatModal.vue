<template>
  <Teleport to="body">
    <div v-if="open" class="fairy-modal-overlay bg-glass-bg dark:bg-glass-bg/50 dark:bg-glass-bg dark:bg-glass-bg/70" @click.self="close">
      <div
        :class="[
          'fairy-bubble bg-glass-bg dark:bg-gray-800 border border-glass-border dark:border-glass-border dark:border-glass-border text-glass-primary',
          sizeClass || 'fairy-lg',
          'enhanced-gaming-card',
          'bubble-elevated',
          { 'compact-ui': isCompact }
        ]" role="dialog" aria-modal="true" aria-label="NAVI Assistant Chat"
      >
        <div class="fairy-chat-interface glass-panel glass-panel--compact bg-glass-bg/95 dark:bg-gray-800/95" :class="{ 'compact-ui': isCompact }">
          <!-- Welcome Animation -->
          <transition name="welcome-fade">
            <div v-if="showWelcome" class="welcome-animation">
              <div class="welcome-text">NAVI</div>
              <div class="welcome-sparkles">SparklesIcon</div>
            </div>
          </transition>
          <!-- Header -->
          <div class="chat-header modern-header glass-bg-glass-bg dark:bg-glass-bg-hover/50 border-b border-glass-border dark:border-glass-border dark:border-glass-border" role="heading" aria-level="2">
            <div class="header-shimmer"></div>
            <div class="header-info">
              <div class="header-avatar">
                <AppIcon name="mdi-shimmer" />
                <div class="avatar-glow"></div>
              </div>
              <div class="header-details">
                <h3 class="title-text text-glass-primary">NAVI Assistant</h3>
                <div class="header-status">
                  <span class="status-dot animated-dot" aria-hidden="true"></span>
                  <span class="status-text text-glass-secondary">{{ statusText }} • AI Powered</span>
                </div>
              </div>
            </div>
            <div class="header-actions">
              <IconButton
                variant="glass"
                size="sm"
                icon="CogIcon"
                aria-label="Open voice settings"
                title="Voice & TTS Settings"
                class="modern-header-btn"
                @click="showTTSModal = true"
              />
              <IconButton
                variant="ghost"
                size="sm"
                icon="XMarkIcon"
                aria-label="Close chat"
                title="Close Chat"
                class="modern-header-btn"
                @click="close"
              />
            </div>
          </div>

          <!-- Messages -->
          <div ref="logRef" class="chat-messages enhanced-messages" role="log" aria-live="polite" aria-relevant="additions">
            <a href="#fairy-chat-input" class="visually-hidden-focusable skip-to-input">Skip to message input</a>
            
            <!-- Animated Message Bubbles -->
            <transition-group name="message-slide" tag="div" class="messages-container">
              <div 
                v-for="(msg, index) in normalizedMessages" 
                :key="msg.id" 
                class="chat-message enhanced-message" 
                :class="{ 
                  'message-ai': msg.type === 'ai', 
                  'message-user': msg.type === 'user', 
                  'message-system': msg.type === 'system',
                  'message-latest': index === normalizedMessages.length - 1
                }" 
                role="article" 
                :aria-label="msgLabel(msg)"
                :style="{ '--message-index': index }"
              >
                <div class="message-container">
                  <div class="message-avatar enhanced-avatar" :class="`avatar-${msg.type}`">
                    <div class="avatar-glow"></div>
                    <AppIcon :name="msg.type === 'user' ? 'UserIcon' : msg.type === 'ai' ? 'mdi-robot' : 'InformationCircleIconrmation'" />
                    <div v-if="msg.type === 'ai'" class="avatar-sparkle">SparklesIcon</div>
                  </div>
                  
                  <div class="message-bubble" :class="`bubble-${msg.type}`">
                    <div class="bubble-content">
                      <div class="message-text">{{ msg.content }}</div>
                      <div class="message-footer">
                        <div class="message-timestamp">{{ formatTime(msg.timestamp) }}</div>
                        <div class="message-actions">
                          <IconButton
                            variant="ghost"
                            size="xs"
                            icon="DocumentDuplicateIcon"
                            aria-label="Copy message"
                            title="Copy message text"
                            class="copy-btn enhanced-action"
                            @click="copy(msg.content)"
                          />
                        </div>
                      </div>
                    </div>
                    <div class="bubble-tail" :class="`tail-${msg.type}`"></div>
                  </div>
                </div>
              </div>
            </transition-group>
            
            <!-- Typing Indicator -->
            <transition name="typing-fade">
              <div v-if="isThinking" class="typing-indicator">
                <div class="message-container">
                  <div class="message-avatar enhanced-avatar avatar-ai">
                    <div class="avatar-glow"></div>
                    <AppIcon name="CpuChipIcon" />
                    <div class="avatar-sparkle">SparklesIcon</div>
                  </div>
                  
                  <div class="message-bubble bubble-ai typing-bubble">
                    <div class="bubble-content">
                      <div class="typing-dots">
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                      </div>
                      <div class="typing-text">NAVI is thinking...</div>
                    </div>
                    <div class="bubble-tail tail-ai"></div>
                  </div>
                </div>
              </div>
            </transition>
            
            <!-- Quick Replies -->
            <div v-if="shouldShowSuggestions && quickReplies.length > 0" class="quick-replies modern-suggestions" role="group" aria-label="Quick suggestions">
              <button
                v-for="reply in quickReplies"
                :key="reply.id"
                class="quick-reply modern-chip bg-glass-bg-hover dark:bg-gray-700 text-gray-700 dark:text-glass-secondary dark:text-glass-secondary hover:bg-gray-200 dark:hover:bg-gray-600"
                :aria-label="`Send: ${reply.text}`"
                @click="sendSuggestion(reply.text)"
              >
                <span class="reply-emoji">{{ reply.emoji }}</span>
                <span class="reply-text">{{ reply.text }}</span>
              </button>
            </div>
            
            <!-- AI Suggestion Chips -->
            <div v-if="shouldShowSuggestions && aiSuggestions.length > 0" class="ai-suggestions-container" role="group" aria-label="AI suggestions">
              <div class="suggestions-header text-glass-secondary">
                <AppIcon name="LightBulbIcon-outline" />
                <span class="suggestions-title">Suggested follow-ups</span>
              </div>
              <div class="suggestions-chips">
                <button
                  v-for="suggestion in aiSuggestions"
                  :key="suggestion.id"
                  class="suggestion-chip bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
                  :aria-label="`Send suggestion: ${suggestion.text}`"
                  @click="sendSuggestion(suggestion.text)"
                >
                  <AppIcon :name="suggestion.icon" class="suggestion-icon" />
                  <span class="suggestion-text">{{ suggestion.text }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Input -->
          <div class="chat-input-container enhanced-input-container glass-footer glass-bg-glass-bg dark:bg-glass-bg-hover/50 border-t border-glass-border dark:border-glass-border dark:border-glass-border" role="group" aria-label="Chat input controls">
            <!-- Floating Multimodal Controls -->
            <div class="multimodal-controls enhanced-controls">
              <div class="control-group voice-controls">
                <IconButton
                  :variant="ttsEnabled ? 'glass' : 'ghost'"
                  size="sm"
                  :icon="ttsEnabled ? 'SpeakerWaveIcon' : 'SpeakerXMarkIcon'"
                  :aria-pressed="ttsEnabled ? 'true' : 'false'"
                  title="Toggle text-to-speech"
                  class="enhanced-control-btn"
                  @click="toggleTTS"
                />
                <IconButton
                  :variant="listening ? 'gaming' : 'ghost'"
                  size="sm"
                  :icon="listening ? 'MicrophoneIcon' : 'MicrophoneIcon-outline'"
                  :aria-pressed="listening ? 'true' : 'false'"
                  title="Voice input"
                  class="enhanced-control-btn pulse-on-active"
                  @click="toggleListening"
                />
              </div>
              
              <div class="control-group media-controls">
                <IconButton
                  :variant="video ? 'primary' : 'ghost'"
                  size="sm"
                  :icon="video ? 'VideoCameraIcon' : 'VideoCameraIcon-outline'"
                  :aria-pressed="video ? 'true' : 'false'"
                  title="Video streaming"
                  class="enhanced-control-btn"
                  @click="toggleVideo"
                />
                <IconButton
                  variant="ghost"
                  size="sm"
                  icon="CameraIcon"
                  title="Capture screenshot"
                  class="enhanced-control-btn"
                  @click="captureScreenshot"
                />
                <IconButton
                  variant="ghost"
                  size="sm"
                  icon="PaperClipIcon"
                  title="Upload file"
                  class="enhanced-control-btn"
                  @click="uploadFile"
                />
              </div>
              
              <div class="control-group ai-controls">
                <IconButton
                  variant="outline"
                  size="sm"
                  icon="CpuChipIcon"
                  title="AI quick actions"
                  class="enhanced-control-btn ai-glow"
                  @click="showQuickActions"
                />
              </div>
            </div>

            <!-- Enhanced Text Input -->
            <div class="text-input-group enhanced-input-group">
              <div class="input-wrapper">
                <textarea 
                  id="fairy-chat-input" 
                  ref="inputRef" 
                  v-model.trim="draft" 
                  class="fairy-input enhanced-textarea glass-input fairy-textarea" 
                  rows="1" 
                  placeholder="Ask NAVI anything..." 
                  aria-label="Message input" 
                  autocomplete="off" 
                  enterkeyhint="send" 
                  @input="autoResize" 
                  @keydown.enter.prevent="send"
                  @focus="onInputFocus"
                  @blur="onInputBlur" 
                />
                <div class="input-glow"></div>
                <div v-if="draft.length > 0" class="character-count">{{ draft.length }}/1000</div>
              </div>
              
              <UnifiedButton
                variant="gaming"
                icon-only
                icon="PaperAirplaneIcon"
                :disabled="!draft"
                aria-label="Send message"
                title="Send message (Enter)"
                class="send-btn-unified enhanced-send-btn"
                @click="send"
              >
                <div class="send-ripple"></div>
              </UnifiedButton>
            </div>

            <!-- Quick Actions Menu -->
            <div v-if="showQuickActionsMenu" class="quick-actions-menu glass-surface" role="menu" aria-label="Quick AI actions">
              <div class="quick-actions-grid">
                <button
                  v-for="quickAction in quickActions"
                  :key="quickAction.label"
                  class="quick-action-item"
                  role="menuitem"
                  :aria-label="quickAction.label"
                  @click="executeQuickAction(quickAction.action)"
                >
                  <AppIcon :name="quickAction.icon" />
                  <span>{{ quickAction.label }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- TTS/Voice Settings Modal -->
  <Teleport to="body">
    <div v-if="showTTSModal" class="fairy-modal-overlay" @click.self="showTTSModal = false">
      <div class="fairy-bubble enhanced-gaming-card" role="dialog" aria-modal="true" aria-label="Voice & TTS Settings">
        <div class="chat-header" role="heading" aria-level="2">
          <div class="chat-title">
            <AppIcon name="CogIcon" />
            <span class="title-text">Voice & TTS Settings</span>
          </div>
          <div class="chat-actions">
            <div class="action-buttons">
              <IconButton
                variant="ghost"
                size="sm"
                icon="XMarkIcon"
                aria-label="Close settings"
                title="Close Settings"
                @click="showTTSModal = false"
              />
            </div>
          </div>
        </div>
        <div class="tts-settings-content" style="padding: 16px">
          <div class="settings-flex flex-wrap">
            <label for="tts-provider-select-modal">TTS Provider</label>
            <select id="tts-provider-select-modal" v-model="ttsProvider" class="tts-provider-select">
              <option value="system">System TTS</option>
              <option value="gemini">Google AI (Gemini)</option>
              <option value="kokoro">Kokoro TTS</option>
            </select>
          </div>
          <div class="settings-flex flex-wrap">
            <label>Speech Rate</label>
            <input v-model.number="ttsRate" type="range" min="0.5" max="2" step="0.1" class="tts-slider" aria-label="Speech rate" />
            <span class="setting-value">{{ ttsRate }}x</span>
          </div>
          <div class="settings-flex flex-wrap">
            <label>Voice Volume</label>
            <input v-model.number="ttsVolume" type="range" min="0" max="1" step="0.1" class="tts-slider" aria-label="Voice volume" />
            <span class="setting-value">{{ Math.round(ttsVolume * 100) }}%</span>
          </div>
          <div class="settings-flex flex-wrap" style="justify-content: flex-end">
            <UnifiedButton
              variant="primary"
              @click="showTTSModal = false"
            >
              Done
            </UnifiedButton>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { CameraIcon, CogIcon, CpuChipIcon, DocumentDuplicateIcon, PaperAirplaneIcon, XMarkIcon } from '@heroicons/vue/24/outline'

import { Teleport, computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import IconButton from '@/components/ui/IconButton.vue'
import { useUnifiedUI } from '@/composables/useUnifiedUI'
import { useToast } from '@/composables/useToast'
import { logger } from '@/shared/utils/logger'

const props = defineProps({
  open: { type: Boolean, default: false },
  messages: { type: Array, default: () => [] },
  size: { type: String, default: 'lg' }, // 'md' | 'lg' | 'xl'
})
const emit = defineEmits(['update:open', 'send'])

const ttsEnabled = ref(false)
const listening = ref(false)
const video = ref(false)
const draft = ref('')
const inputRef = ref(null)
const logRef = ref(null)
const showTTSModal = ref(false)
const ttsProvider = ref('system')
const ttsRate = ref(0.9)
const ttsVolume = ref(0.8)

// AI Suggestions state
const aiSuggestions = ref([])
const shouldShowSuggestions = ref(true)

// Enhanced UI state
const isThinking = ref(false)
const inputFocused = ref(false)
const showWelcome = ref(false)

// Quick replies data
const quickReplies = ref([
  { id: 1, emoji: '📝', text: 'Build Resume' },
  { id: 2, emoji: 'MagnifyingGlassIcon', text: 'Find Jobs' },
  { id: 3, emoji: '💼', text: 'Interview Tips' },
  { id: 4, emoji: 'DevicePhoneMobileIcon', text: 'Gaming Skills' }
])

const open = computed(() => props.open)
const sizeClass = computed(() => props.size && ['md','lg','xl'].includes(props.size) ? `fairy-${props.size}` : 'fairy-lg')
const status = computed(() => 'idle')
const statusText = computed(() => 'Ready')
const ui = useUnifiedUI()
const isCompact = computed(() => ui.density.value === 'compact')
const { success: toastSuccess, error: toastError, info: toastInfo } = useToast()

const normalizedMessages = computed(() => props.messages.map(m => ({
  id: m.id ?? `${m.type}-${m.timestamp ?? Date.now()}`,
  type: m.type ?? 'ai',
  content: String(m.content ?? ''),
  timestamp: m.timestamp ?? Date.now(),
})))

function msgLabel(msg) {
  return msg.type === 'user' ? 'User message' : msg.type === 'ai' ? 'Assistant message' : 'System message'
}

function formatTime(ts) {
  try {
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

function autoResize() {
  const el = inputRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 160) + 'px'
}

async function send() {
  if (!draft.value) return
  
  // Show thinking indicator
  isThinking.value = true
  
  emit('send', draft.value)
  draft.value = ''
  
  await nextTick()
  autoResize()
  scrollToBottom()
  
  // Hide thinking indicator after a delay (this would normally be controlled by AI response)
  setTimeout(() => {
    isThinking.value = false
  }, 2000)
}

function copy(text) {
  try { 
    navigator.clipboard?.writeText?.(text)
    toastSuccess('Message copied to clipboard')
  } catch {
    toastError('Failed to copy message')
  }
}

// Enhanced input interactions
function onInputFocus() {
  inputFocused.value = true
}

function onInputBlur() {
  inputFocused.value = false
}

// Enhanced multimodal control functions
function toggleTTS() {
  ttsEnabled.value = !ttsEnabled.value
  toastInfo(ttsEnabled.value ? 'Text-to-speech enabled' : 'Text-to-speech disabled')
}

// Voice recognition state
const recognition = ref(null)
const isRecognitionSupported = ref(false)

// Initialize speech recognition on mount
onMounted(() => {
  if (window.webkitSpeechRecognition || window.SpeechRecognition) {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
    recognition.value = new SpeechRecognition()
    isRecognitionSupported.value = true
    
    recognition.value.continuous = false
    recognition.value.interimResults = false
    recognition.value.lang = 'en-US'
    
    recognition.value.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      draft.value = transcript
      toastSuccess(`Voice input: "${transcript}"`)
      autoResize()
    }
    
    recognition.value.onerror = (event) => {
      logger.error('Speech recognition error:', event.error)
      listening.value = false
      if (event.error === 'no-speech') {
        toastError('No speech detected. Please try again.')
      } else if (event.error === 'network') {
        toastError('Network error. Please check your connection.')
      } else {
        toastError('Voice recognition failed. Please try again.')
      }
    }
    
    recognition.value.onend = () => {
      listening.value = false
    }
  }
})

function toggleListening() {
  if (!isRecognitionSupported.value) {
    toastError('Voice recognition is not supported in this browser')
    return
  }
  
  listening.value = !listening.value
  
  if (listening.value) {
    try {
      recognition.value.start()
      toastInfo('Voice input activated - speak now')
    } catch (error) {
      logger.error('Failed to start speech recognition:', error)
      listening.value = false
      toastError('Failed to start voice input')
    }
  } else {
    try {
      recognition.value.stop()
      toastInfo('Voice input deactivated')
    } catch (error) {
      logger.error('Failed to stop speech recognition:', error)
    }
  }
}

// Video streaming state
const videoStream = ref(null)
const isVideoSupported = ref(true)

function toggleVideo() {
  video.value = !video.value
  
  if (video.value) {
    startVideoStream()
  } else {
    stopVideoStream()
  }
}

async function startVideoStream() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: { ideal: 640 }, 
        height: { ideal: 480 },
        facingMode: 'user'
      }, 
      audio: false 
    })
    
    videoStream.value = stream
    toastSuccess('Video streaming enabled')
    
    // Note: In a real implementation, you would send this stream to your AI service
    // For now, we just capture the stream for potential screenshot functionality
    
  } catch (error) {
    logger.error('Failed to start video stream:', error)
    video.value = false
    
    if (error.name === 'NotAllowedError') {
      toastError('Camera access denied. Please allow camera permissions.')
    } else if (error.name === 'NotFoundError') {
      toastError('No camera found on this device.')
    } else if (error.name === 'NotReadableError') {
      toastError('Camera is already in use by another application.')
    } else {
      toastError('Failed to access camera. Please try again.')
    }
  }
}

function stopVideoStream() {
  if (videoStream.value) {
    videoStream.value.getTracks().forEach(track => track.stop())
    videoStream.value = null
  }
  toastInfo('Video streaming disabled')
}

// Cleanup video stream on unmount
onUnmounted(() => {
  if (videoStream.value) {
    stopVideoStream()
  }
})

async function captureScreenshot() {
  if (videoStream.value) {
    try {
      // Create video element to capture frame from stream
      const video = document.createElement('video')
      video.srcObject = videoStream.value
      video.play()
      
      // Wait for video to be ready
      await new Promise((resolve) => {
        video.addEventListener('loadedmetadata', resolve, { once: true })
      })
      
      // Create canvas to capture frame
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0)
      
      // Convert to blob and create download link
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `screenshot-${Date.now()}.png`
        a.click()
        URL.revokeObjectURL(url)
        toastSuccess('Screenshot captured and saved')
      }, 'image/png')
      
    } catch (error) {
      logger.error('Screenshot capture failed:', error)
      toastError('Failed to capture screenshot')
    }
  } else {
    // Fallback: use screen capture API if available
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
      const video = document.createElement('video')
      video.srcObject = stream
      video.play()
      
      await new Promise((resolve) => {
        video.addEventListener('loadedmetadata', resolve, { once: true })
      })
      
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0)
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `screen-capture-${Date.now()}.png`
        a.click()
        URL.revokeObjectURL(url)
        toastSuccess('Screen capture saved')
      }, 'image/png')
      
      // Stop the screen capture stream
      stream.getTracks().forEach(track => track.stop())
      
    } catch (error) {
      logger.error('Screen capture failed:', error)
      toastError('Screen capture not available or denied')
    }
  }
}

function uploadFile() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*,text/*,.pdf,.doc,.docx,.txt,.md'
  input.multiple = false
  
  input.onchange = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toastError('File size must be less than 10MB')
      return
    }
    
    try {
      toastInfo(`Uploading ${file.name}...`)
      
      // For images, show preview and analyze
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const imageData = e.target.result
          // In a real implementation, you would send this to your AI service for analysis
          emit('send', `[Uploaded image: ${file.name}]`)
          toastSuccess(`Image uploaded: ${file.name}`)
        }
        reader.readAsDataURL(file)
      }
      
      // For text files, read content
      else if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target.result
          // Truncate long content for display
          const truncatedContent = content.length > 500 ? content.substring(0, 500) + '...' : content
          emit('send', `[Uploaded text file: ${file.name}]\n\nContent:\n${truncatedContent}`)
          toastSuccess(`Text file uploaded: ${file.name}`)
        }
        reader.readAsText(file)
      }
      
      // For other files, just show name and type
      else {
        emit('send', `[Uploaded file: ${file.name} (${file.type})]`)
        toastSuccess(`File uploaded: ${file.name}`)
      }
      
    } catch (error) {
      logger.error('File upload failed:', error)
      toastError(`Failed to upload ${file.name}`)
    }
  }
  
  input.click()
}

// Quick actions state
const showQuickActionsMenu = ref(false)

const quickActions = [
  { icon: 'mdi-briefcase-search', label: 'Find Jobs', action: () => emit('send', 'Help me find gaming jobs that match my profile') },
  { icon: 'DocumentIcon-document-edit', label: 'Review Resume', action: () => emit('send', 'Please review my resume and suggest improvements') },
  { icon: 'mdi-school', label: 'Skill Analysis', action: () => emit('send', 'Analyze my skills and suggest areas for growth in game development') },
  { icon: 'LightBulbIcon', label: 'Career Advice', action: () => emit('send', 'Give me career advice for advancing in the gaming industry') },
  { icon: 'mdi-chat-question', label: 'Interview Prep', action: () => emit('send', 'Help me prepare for a game developer interview') },
  { icon: 'RocketLaunchIcon', label: 'Project Ideas', action: () => emit('send', 'Suggest some game development project ideas to build my portfolio') }
]

function showQuickActions() {
  showQuickActionsMenu.value = !showQuickActionsMenu.value
}

function executeQuickAction(action) {
  action()
  showQuickActionsMenu.value = false
  toastSuccess('Quick action executed')
}

// AI Suggestion functions
function generateContextualSuggestions(lastMessage) {
  const suggestions = []
  
  if (!lastMessage || lastMessage.type !== 'ai') return []
  
  const content = lastMessage.content.toLowerCase()
  
  // Context-based suggestions based on AI response content
  if (content.includes('resume') || content.includes('cv')) {
    suggestions.push(
      { id: 'resume-review', text: 'Review my resume', icon: 'DocumentIcon-document-edit' },
      { id: 'resume-tailor', text: 'Tailor for specific job', icon: 'CursorArrowRaysIcon' },
      { id: 'resume-skills', text: 'Improve skills section', icon: 'StarIcon-plus' }
    )
  }
  
  if (content.includes('job') || content.includes('career') || content.includes('position')) {
    suggestions.push(
      { id: 'job-search', text: 'Find similar jobs', icon: 'mdi-briefcase-search' },
      { id: 'job-match', text: 'Check job match', icon: 'mdi-percent' },
      { id: 'salary-info', text: 'Salary information', icon: 'mdi-cash' }
    )
  }
  
  if (content.includes('skill') || content.includes('learn') || content.includes('improve')) {
    suggestions.push(
      { id: 'skill-gap', text: 'Analyze skill gaps', icon: 'ChartBarIcon-line' },
      { id: 'learning-path', text: 'Create learning path', icon: 'mdi-school' },
      { id: 'project-ideas', text: 'Suggest projects', icon: 'LightBulbIcon' }
    )
  }
  
  if (content.includes('interview') || content.includes('preparation')) {
    suggestions.push(
      { id: 'practice-questions', text: 'Practice questions', icon: 'QuestionMarkCircleIcon-circle' },
      { id: 'mock-interview', text: 'Start mock interview', icon: 'UserIcon-voice' },
      { id: 'company-research', text: 'Research company', icon: 'mdi-magnify' }
    )
  }
  
  if (content.includes('portfolio') || content.includes('project')) {
    suggestions.push(
      { id: 'portfolio-review', text: 'Review portfolio', icon: 'FolderIcon-open' },
      { id: 'showcase-tips', text: 'Showcase tips', icon: 'StarIcon' },
      { id: 'github-optimize', text: 'Optimize GitHub', icon: 'mdi-github' }
    )
  }
  
  // Default suggestions if no specific context
  if (suggestions.length === 0) {
    suggestions.push(
      { id: 'explore-more', text: 'Tell me more', icon: 'InformationCircleIconrmation' },
      { id: 'ask-different', text: 'Ask differently', icon: 'ArrowPathIcon' },
      { id: 'get-examples', text: 'Show examples', icon: 'mdi-format-list-bulleted' }
    )
  }
  
  return suggestions.slice(0, 4) // Limit to 4 suggestions
}

function sendSuggestion(suggestionText) {
  emit('send', suggestionText)
  aiSuggestions.value = []
  toastSuccess('Suggestion sent')
}

function updateSuggestionsBasedOnLastMessage() {
  if (normalizedMessages.value.length === 0) return
  
  const lastMessage = normalizedMessages.value[normalizedMessages.value.length - 1]
  if (lastMessage.type === 'ai') {
    // Generate suggestions after a short delay to allow message to render
    setTimeout(() => {
      aiSuggestions.value = generateContextualSuggestions(lastMessage)
    }, 500)
  } else if (lastMessage.type === 'user') {
    // Hide suggestions when user sends a message
    aiSuggestions.value = []
  }
}

function scrollToBottom() {
  try {
    const el = logRef.value
    if (el) el.scrollTop = el.scrollHeight
  } catch {}
}

function close() { emit('update:open', false) }

watch(() => props.open, (v) => { if (v) nextTick(scrollToBottom) })
watch(() => props.messages, () => {
  nextTick(() => {
    updateSuggestionsBasedOnLastMessage()
    scrollToBottom()
  })
}, { deep: true })
onMounted(() => nextTick(scrollToBottom))
// Close on Escape
onMounted(() => {
  const onKey = (e) => { if (e.key === 'Escape') close() }
  window.addEventListener('keydown', onKey)
  onUnmounted(() => window.removeEventListener('keydown', onKey))
})

// Initialize from global app-settings (shared with assistant)
onMounted(() => {
  try {
    const appSettings = JSON.parse(localStorage.getItem('app-settings') || '{}')
    ttsProvider.value = appSettings.ttsProvider || 'system'
    ttsRate.value = appSettings.speechRate ?? 0.9
    ttsVolume.value = appSettings.speechVolume ?? 0.8
  } catch {}
})

// Persist voice settings so all chats share them
watch([ttsProvider, ttsRate, ttsVolume], ([p, r, v]) => {
  try {
    const appSettings = JSON.parse(localStorage.getItem('app-settings') || '{}')
    appSettings.ttsProvider = p
    appSettings.speechRate = r
    appSettings.speechVolume = v
    localStorage.setItem('app-settings', JSON.stringify(appSettings))
  } catch {}
})

// Welcome animation when chat opens
watch(open, (newVal) => {
  if (newVal) {
    // Show welcome animation for new or empty sessions
    if (normalizedMessages.value.length === 0) {
      showWelcome.value = true
      setTimeout(() => {
        showWelcome.value = false
      }, 2000)
    }
    
    nextTick(() => {
      if (inputRef.value) {
        inputRef.value.focus()
        autoResize()
      }
      scrollToBottom()
    })
  }
})
</script>

<style scoped>
/* Enhanced Modal Overlay */
.fairy-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal, 1000);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--overlay-bg, rgba(0, 0, 0, 0.4));
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  animation: overlayFadeIn 0.3s ease-out;
}

@keyframes overlayFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ===== ENHANCED FAIRY CHAT STYLING ===== */

/* Modern Header Design */
.modern-header {
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700));
  padding: var(--spacing-5);
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.header-shimmer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.header-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.header-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--color-gaming-500), var(--color-secondary-500));
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  color: var(--text-inverse);
  position: relative;
  animation: headerPulse 3s ease-in-out infinite;
}

@keyframes headerPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.header-avatar .avatar-glow {
  position: absolute;
  inset: -4px;
  background: linear-gradient(135deg, var(--color-gaming-400), var(--color-secondary-400));
  border-radius: var(--radius-xl);
  opacity: 0.3;
  animation: glowPulse 2s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
}

.header-details h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-inverse);
  margin: 0 0 var(--spacing-1) 0;
}

.header-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-xs);
  color: rgba(255, 255, 255, 0.9);
}

.animated-dot {
  width: 6px;
  height: 6px;
  background: var(--color-success-500);
  border-radius: 50%;
  animation: statusPulse 2s ease-in-out infinite;
}

@keyframes statusPulse {
  0%, 100% { 
    opacity: 1; 
    box-shadow: 0 0 0 0 var(--color-success-500); 
  }
  50% { 
    opacity: 0.7; 
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-success-500) 30%, transparent); 
  }
}

.modern-header-btn {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: var(--text-inverse) !important;
  transition: all var(--duration-fast);
}

.modern-header-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  transform: translateY(-2px);
}

/* Modern Quick Replies */
.quick-replies {
  padding: 0 var(--spacing-4) var(--spacing-3);
  display: flex;
  gap: var(--spacing-2);
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.quick-replies::-webkit-scrollbar {
  display: none;
}

.modern-chip {
  padding: var(--spacing-2) var(--spacing-4);
  background: var(--glass-bg);
  border: 1px solid var(--color-primary-500);
  border-radius: var(--radius-full);
  color: var(--color-primary-500);
  font-size: var(--font-size-sm);
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--duration-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  position: relative;
  overflow: hidden;
}

.modern-chip::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-gaming-500));
  opacity: 0;
  transition: opacity var(--duration-fast);
}

.modern-chip:hover {
  background: var(--color-primary-500);
  color: var(--text-inverse);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px color-mix(in srgb, var(--color-primary-500) 40%, transparent);
}

.modern-chip:hover::before {
  opacity: 1;
}

.reply-emoji,
.reply-text {
  position: relative;
  z-index: 1;
}

/* Enhanced Bubble Styling to match HTML design */
.bubble-ai {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--text-primary-600);
  box-shadow: 0 8px 32px color-mix(in srgb, var(--color-primary-500) 15%, transparent);
  border-radius: var(--radius-xl);
}

.bubble-user {
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700));
  border: none;
  color: var(--text-inverse);
  box-shadow: 0 8px 32px color-mix(in srgb, var(--color-primary-500) 25%, transparent);
  border-radius: var(--radius-xl);
}

/* Enhanced Input Controls to match HTML */
.enhanced-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-3);
  padding: var(--spacing-2);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.enhanced-control-btn {
  width: 36px;
  height: 36px;
  background: var(--surface-elevated) !important;
  border: 1px solid var(--glass-border) !important;
  border-radius: var(--radius-lg) !important;
  color: var(--text-secondary) !important;
  transition: all var(--duration-fast);
  position: relative;
}

.enhanced-control-btn:hover {
  background: var(--color-primary-500) !important;
  color: var(--text-inverse) !important;
  border-color: var(--color-primary-500) !important;
  transform: scale(1.1);
}

.enhanced-control-btn.pulse-on-active {
  background: var(--color-primary-500) !important;
  color: var(--text-inverse) !important;
  border-color: var(--color-primary-500) !important;
}

.enhanced-control-btn.pulse-on-active::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-primary-500) 40%, transparent);
  z-index: -1;
  animation: controlGlow 2s ease-in-out infinite;
}

@keyframes controlGlow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

/* Enhanced Send Button */
.enhanced-send-btn {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700)) !important;
  border: none !important;
  border-radius: var(--radius-full) !important;
  color: var(--text-inverse) !important;
  transition: all var(--duration-fast);
  position: relative;
}

.enhanced-send-btn:hover {
  transform: scale(1.1) rotate(15deg);
  box-shadow: 0 5px 20px color-mix(in srgb, var(--color-primary-500) 40%, transparent);
}

.enhanced-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Floating Effects */
.fairy-bubble {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-2xl);
  box-shadow: 0 25px 50px color-mix(in srgb, black 50%, transparent);
  animation: slideUp 0.5s ease-out;
  position: relative;
  overflow: hidden;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Glowing border effect */
.fairy-bubble::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: var(--radius-2xl);
  padding: 1px;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-secondary-500), var(--color-gaming-500));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0.5;
  animation: borderGlow 3s ease-in-out infinite;
  pointer-events: none;
}

@keyframes borderGlow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}

/* Welcome Animation */
.welcome-animation {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-secondary-500));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-inverse);
  z-index: 1000;
  border-radius: var(--radius-2xl);
}

.welcome-text {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-2);
  animation: welcomeGlow 2s ease-in-out infinite;
}

.welcome-sparkles {
  font-size: var(--font-size-xl);
  animation: sparkleRotate 2s linear infinite;
}

@keyframes welcomeGlow {
  0%, 100% { 
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
    transform: scale(1);
  }
  50% { 
    text-shadow: 0 0 30px rgba(255, 255, 255, 0.8);
    transform: scale(1.05);
  }
}

@keyframes sparkleRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.welcome-fade-enter-active,
.welcome-fade-leave-active {
  transition: all 0.5s ease;
}

.welcome-fade-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.welcome-fade-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

/* Enhanced Messages Container */
.enhanced-messages {
  position: relative;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-primary-300) transparent;
}

.enhanced-messages::-webkit-scrollbar {
  width: 6px;
}

.enhanced-messages::-webkit-scrollbar-track {
  background: transparent;
}

.enhanced-messages::-webkit-scrollbar-thumb {
  background: var(--color-primary-300);
  border-radius: 3px;
}

.messages-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  padding: var(--spacing-2);
}

/* Enhanced Message Bubbles */
.enhanced-message {
  animation: messageSlideIn 0.3s ease-out;
  animation-delay: calc(var(--message-index, 0) * 0.1s);
  animation-fill-mode: both;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.message-container {
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-3);
  position: relative;
}

.message-user .message-container {
  flex-direction: flex flex-wrap-reverse;
}

/* Enhanced Avatars */
.enhanced-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
  transition: all var(--duration-fast);
}

.avatar-glow {
  position: absolute;
  inset: -2px;
  border-radius: var(--radius-full);
  opacity: 0;
  transition: opacity var(--duration-fast);
}

.enhanced-avatar:hover .avatar-glow {
  opacity: 1;
}

.avatar-ai {
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-gaming-500));
  color: var(--text-inverse);
  box-shadow: 0 4px 16px color-mix(in srgb, var(--color-primary-500) 30%, transparent);
}

.avatar-ai .avatar-glow {
  background: linear-gradient(135deg, var(--color-primary-400), var(--color-gaming-400));
}

.avatar-user {
  background: linear-gradient(135deg, var(--color-secondary-500), var(--color-accent-500));
  color: var(--text-inverse);
  box-shadow: 0 4px 16px color-mix(in srgb, var(--color-secondary-500) 30%, transparent);
}

.avatar-user .avatar-glow {
  background: linear-gradient(135deg, var(--color-secondary-400), var(--color-accent-400));
}

.avatar-sparkle {
  position: absolute;
  top: -2px;
  right: -2px;
  font-size: 12px;
  animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.7; }
  50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
}

/* Enhanced Message Bubbles */
.message-bubble {
  max-width: 70%;
  border-radius: var(--radius-xl);
  position: relative;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all var(--duration-fast);
  animation: bubbleIn 0.4s ease-out;
}

@keyframes bubbleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.bubble-ai {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--text-primary-600);
  box-shadow: 0 8px 32px color-mix(in srgb, var(--color-primary-500) 15%, transparent);
}

.bubble-user {
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-gaming-500));
  border: 1px solid var(--color-primary-400);
  color: var(--text-inverse);
  box-shadow: 0 8px 32px color-mix(in srgb, var(--color-primary-500) 25%, transparent);
}

.bubble-content {
  padding: var(--spacing-3) var(--spacing-4);
  position: relative;
  z-index: 1;
}

.message-text {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--spacing-2);
}

.message-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-2);
  font-size: var(--font-size-xs);
  opacity: 0.7;
}

.message-actions {
  display: flex;
  gap: var(--spacing-1);
}

.enhanced-action {
  opacity: 0;
  transition: opacity var(--duration-fast);
}

.message-bubble:hover .enhanced-action {
  opacity: 1;
}

/* Bubble Tails */
.bubble-tail {
  position: absolute;
  bottom: 8px;
  width: 0;
  height: 0;
}

.tail-ai {
  left: -8px;
  border-r: 8px solid var(--glass-bg);
  border-t: 4px solid transparent;
  border-b: 4px solid transparent;
}

.tail-user {
  right: -8px;
  border-l: 8px solid var(--color-primary-500);
  border-t: 4px solid transparent;
  border-b: 4px solid transparent;
}

/* Typing Indicator */
.typing-indicator {
  animation: fadeIn 0.3s ease-out;
}

.typing-bubble {
  animation: pulse 1.5s ease-in-out infinite;
}

.typing-dots {
  display: flex;
  gap: 4px;
  margin-bottom: var(--spacing-1);
}

.typing-dots .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary-400);
  animation: typingDot 1.4s ease-in-out infinite;
}

.typing-dots .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingDot {
  0%, 60%, 100% { transform: scale(1); opacity: 0.5; }
  30% { transform: scale(1.2); opacity: 1; }
}

.typing-text {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-style: italic;
}

/* Transition Effects */
.message-slide-enter-active,
.message-slide-leave-active {
  transition: all 0.3s ease;
}

.message-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.message-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.typing-fade-enter-active,
.typing-fade-leave-active {
  transition: all 0.3s ease;
}

.typing-fade-enter-from,
.typing-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Enhanced Input Container */
.enhanced-input-container {
  background: var(--glass-bg);
  border-t: 1px solid var(--glass-border);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: var(--spacing-4);
  position: relative;
}

.enhanced-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-3);
  padding: var(--spacing-2);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.control-group {
  display: flex;
  gap: var(--spacing-2);
}

.enhanced-control-btn {
  position: relative;
  overflow: hidden;
  transition: all var(--duration-fast);
}

.enhanced-control-btn:hover {
  transform: translateY(-1px);
}

.pulse-on-active {
  animation: pulse 2s ease-in-out infinite;
}

.ai-glow {
  box-shadow: 0 0 20px color-mix(in srgb, var(--color-primary-500) 20%, transparent);
}

/* Enhanced Input Group */
.enhanced-input-group {
  display: flex;
  gap: var(--spacing-3);
  align-items: flex-end;
}

.input-wrapper {
  flex: 1;
  position: relative;
}

.enhanced-textarea {
  background: var(--glass-bg);
  border: 2px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-3) var(--spacing-4);
  resize: none;
  transition: all var(--duration-fast);
  position: relative;
  z-index: 1;
}

.enhanced-textarea:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 20%, transparent);
  outline: none;
}

.input-glow {
  position: absolute;
  inset: 0;
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-gaming-500));
  opacity: 0;
  transition: opacity var(--duration-fast);
  pointer-events: none;
}

.enhanced-textarea:focus + .input-glow {
  opacity: 0.1;
}

.character-count {
  position: absolute;
  bottom: var(--spacing-1);
  right: var(--spacing-3);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  pointer-events: none;
}

.enhanced-send-btn {
  position: relative;
  overflow: hidden;
  transition: all var(--duration-fast);
}

.enhanced-send-btn:hover {
  transform: scale(1.05);
}

.send-ripple {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.enhanced-send-btn:active .send-ripple {
  opacity: 1;
}

/* Responsive Design */
@media (max-width: var(--breakpoint-md)) {
  .message-bubble {
    max-width: 85%;
  }
  
  .enhanced-controls {
    flex-direction: column;
    gap: var(--spacing-2);
  }
  
  .control-group {
    justify-content: center;
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .enhanced-avatar {
    width: 32px;
    height: 32px;
  }
  
  .message-bubble {
    max-width: 90%;
  }
  
  .bubble-content {
    padding: var(--spacing-2) var(--spacing-3);
  }
}

/* Enhanced Fairy Bubble with Master Design */
.fairy-bubble {
  width: min(100%, 600px);
  max-width: 600px;
  height: auto;
  max-height: 90vh;
  border-radius: var(--radius-2xl);
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
  box-shadow: var(--shadow-2xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: bubbleSlideIn 0.4s ease-out;
  position: relative;
}

.fairy-bubble::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--radius-2xl);
  border: 1px solid var(--glass-border-highlight);
  pointer-events: none;
  opacity: 0.6;
}

@keyframes bubbleSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Chat Interface Layout */
.fairy-chat-interface {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  background: var(--surface-base);
  border-radius: var(--radius-2xl);
}

/* Enhanced Header with Master Design */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4);
  background: var(--glass-bg-glass-bg dark:bg-glass-bg-hover);
  border-b: 1px solid var(--glass-border);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
  position: sticky;
  top: 0;
  z-index: 10;
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
}

.chat-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: var(--spacing-4);
  right: var(--spacing-4);
  height: 1px;
  background: var(--gradient-primary-subtle);
  opacity: 0.4;
  pointer-events: none;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-family: var(--font-primary);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-lg);
  color: var(--text-primary-600);
}

.chat-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

/* Status Indicator */
.chat-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-full);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-success);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* Enhanced Messages Area */
.chat-messages {
  flex: 1 1 auto;
  overflow-y: auto;
  min-height: 200px;
  padding: var(--spacing-4);
  padding-bottom: var(--chat-input-offset, 88px);
  scroll-padding-bottom: var(--chat-input-offset, 88px);
  background: var(--surface-base);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  scroll-behavior: smooth;
}

/* Message Styling */
.chat-message {
  display: flex;
  gap: var(--spacing-3);
  align-items: flex-start;
  animation: messageSlideIn 0.3s ease-out;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-user {
  flex-direction: flex flex-wrap-reverse;
}

.message-avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
}

.message-user .message-avatar {
  background: var(--color-primary-bg);
  border-color: var(--color-primary-border);
}

.message-ai .message-avatar {
  background: var(--color-gaming-bg);
  border-color: var(--color-gaming-border);
}

.message-content {
  flex: 1;
  min-width: 0;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-3);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
  box-shadow: var(--shadow-sm);
}

.message-user .message-content {
  background: var(--color-primary-bg);
  border-color: var(--color-primary-border);
  margin-left: var(--spacing-8);
}

.message-ai .message-content {
  background: var(--glass-bg-glass-bg dark:bg-glass-bg-hover);
  margin-right: var(--spacing-8);
}

.message-system .message-content {
  background: var(--surface-muted);
  border-color: var(--border-muted);
  text-align: center;
  font-style: italic;
  color: var(--text-secondary);
}

.message-text {
  font-family: var(--font-primary);
  line-height: var(--line-height-relaxed);
  color: var(--text-primary-600);
  word-wrap: break-word;
  white-space: pre-wrap;
}

.message-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--spacing-2);
  padding-top: var(--spacing-2);
  border-t: 1px solid var(--glass-border);
}

.message-timestamp {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-family: var(--font-mono);
}

/* Enhanced Input Container */
.chat-input-container {
  /* expose input offset for message list */
  --chat-input-offset: calc(var(--spacing-4) * 2 + 56px + env(safe-area-inset-bottom, 0px));
  background: var(--glass-surface);
  border-t: 1px solid var(--glass-border);
  border-radius: 0 0 var(--radius-2xl) var(--radius-2xl);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
  padding: var(--spacing-4) var(--spacing-4) calc(var(--spacing-4) + env(safe-area-inset-bottom, 0px));
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  position: relative;
}
.chat-input-container:focus-within {
  border-t-color: color-mix(in srgb, var(--color-primary-500) 35%, var(--glass-border));
  box-shadow: 0 -6px 20px color-mix(in srgb, var(--color-primary-500) 10%, transparent) inset;
}
.chat-input-container::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: -8px;
  height: 8px;
  pointer-events: none;
  background: linear-gradient(to bottom, rgba(0,0,0,0.08), transparent);
}
[data-theme="dark"] .chat-input-container::before { background: linear-gradient(to bottom, rgba(255,255,255,0.06), transparent); }

/* Multimodal Controls */
.multimodal-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

/* Text Input Group */
.text-input-group {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--spacing-3);
  align-items: end;
}

.fairy-textarea {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-3);
  font-family: var(--font-primary);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  color: var(--text-primary-600);
  resize: none;
  min-height: 44px;
  max-height: 120px;
  transition: all var(--duration-fast) var(--easing-ease);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
}

.fairy-textarea:focus {
  outline: none;
  border-color: var(--color-primary-border);
  box-shadow: var(--shadow-focus);
  background: var(--glass-bg-glass-bg dark:bg-glass-bg-hover);
}

.fairy-textarea::placeholder {
  color: var(--text-placeholder);
}

.send-btn-unified {
  min-width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast) var(--easing-ease);
}

.send-btn-unified:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* TTS Settings Content */
.tts-settings-content {
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.settings-flex flex-wrap {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  font-family: var(--font-primary);
}

.settings-flex flex-wrap label {
  flex: 0 0 120px;
  font-weight: var(--font-weight-medium);
  color: var(--text-primary-600);
}

.tts-provider-select,
.tts-slider {
  flex: 1;
  padding: var(--spacing-2);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  color: var(--text-primary-600);
  font-family: var(--font-primary);
}

.setting-value {
  flex: 0 0 60px;
  text-align: right;
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  font-family: var(--font-mono);
}

/* Responsive Design */
@media (max-width: 768px) {
  .fairy-bubble {
    width: 100%;
    max-width: none;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
  }
  
  .fairy-bubble::before {
    border-radius: 0;
  }
  
  .fairy-chat-interface {
    border-radius: 0;
  }
  
  .chat-header {
    border-radius: 0;
    padding: var(--spacing-3);
  }
  
  .chat-messages {
    padding: var(--spacing-3);
  }
  
  .chat-input-container {
    border-radius: 0;
    padding: var(--spacing-3) var(--spacing-3) calc(var(--spacing-3) + env(safe-area-inset-bottom, 0px));
  }
  
  .multimodal-controls {
    gap: var(--spacing-1);
  }
  
  .text-input-group {
    gap: var(--spacing-2);
  }
  
  .message-content {
    padding: var(--spacing-2);
  }
  
  .message-user .message-content {
    margin-left: var(--spacing-4);
  }
  
  .message-ai .message-content {
    margin-right: var(--spacing-4);
  }
}

@media (max-width: 480px) {
  .chat-header {
    padding: var(--spacing-2);
  }
  
  .chat-messages {
    padding: var(--spacing-2);
    gap: var(--spacing-2);
  }
  
  .chat-input-container {
    padding: var(--spacing-2) var(--spacing-2) calc(var(--spacing-2) + env(safe-area-inset-bottom, 0px));
    gap: var(--spacing-2);
  }
  
  .multimodal-controls {
    justify-content: center;
  }
  
  .settings-flex flex-wrap {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-2);
  }
  
  .settings-flex flex-wrap label {
    flex: none;
  }
}

/* Dark theme enhancements */
[data-theme="dark"] .fairy-bubble {
  background: rgba(15, 15, 15, 0.95);
  border-color: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .chat-header {
  background: rgba(20, 20, 20, 0.8);
  border-color: rgba(255, 255, 255, 0.08);
}

[data-theme="dark"] .chat-messages {
  background: rgba(10, 10, 10, 0.6);
}

[data-theme="dark"] .message-content {
  background: rgba(25, 25, 25, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
}

/* Gaming theme enhancements */
.theme-gaming .fairy-bubble {
  background: linear-gradient(135deg, 
    rgba(15, 15, 15, 0.95) 0%, 
    rgba(20, 35, 25, 0.95) 100%
  );
  border-color: rgba(0, 255, 136, 0.2);
}

.theme-gaming .chat-header {
  background: linear-gradient(135deg, 
    rgba(0, 255, 136, 0.1) 0%, 
    rgba(0, 217, 255, 0.05) 100%
  );
  border-color: rgba(0, 255, 136, 0.15);
}

.theme-gaming .message-ai .message-content {
  background: linear-gradient(135deg, 
    rgba(0, 255, 136, 0.08) 0%, 
    rgba(0, 217, 255, 0.03) 100%
  );
  border-color: rgba(0, 255, 136, 0.2);
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

@media (prefers-contrast: high) {
  .fairy-bubble,
  .message-content,
  .fairy-textarea {
    border-width: 2px;
  }
  
  .chat-status {
    border-width: 2px;
  }
  
  .status-dot {
    border: 2px solid var(--color-success);
  }
}

/* Focus management */
.fairy-modal-overlay:focus-within {
  outline: none;
}

.visually-hidden-focusable:not(:focus) {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

/* Performance optimizations */
.chat-messages {
  contain: layout style paint;
  will-change: scroll-position;
}

.chat-message {
  contain: layout style;
}

.fairy-bubble {
  contain: layout;
}

/* AI Suggestion Chips Styling */
.ai-suggestions-container {
  margin-top: var(--spacing-4);
  padding: var(--spacing-3);
  background: var(--glass-bg-glass-bg dark:bg-glass-bg-hover);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
  box-shadow: var(--shadow-sm);
  animation: suggestionsSlideIn 0.4s ease-out;
}

@keyframes suggestionsSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.suggestions-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-3);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.suggestions-title {
  font-family: var(--font-primary);
}

.suggestions-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.suggestion-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-full);
  color: var(--text-primary-600);
  font-family: var(--font-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-ease);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
  box-shadow: var(--shadow-xs);
}

.suggestion-chip:hover {
  background: var(--color-primary-bg);
  border-color: var(--color-primary-border);
  color: var(--color-primary-text);
  transform: translateY(-1px);
  box-shadow: var(--shadow-glass);
}

.suggestion-chip:active {
  transform: translateY(0);
  box-shadow: var(--shadow-xs);
}

.suggestion-chip:focus {
  outline: none;
  border-color: var(--color-primary-border);
  box-shadow: var(--shadow-focus);
}

.suggestion-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  opacity: 0.8;
}

.suggestion-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

/* Gaming theme enhancements for suggestions */
.theme-gaming .ai-suggestions-container {
  background: linear-gradient(135deg, 
    rgba(0, 255, 136, 0.05) 0%, 
    rgba(0, 217, 255, 0.02) 100%
  );
  border-color: rgba(0, 255, 136, 0.15);
}

.theme-gaming .suggestion-chip:hover {
  background: linear-gradient(135deg, 
    rgba(0, 255, 136, 0.1) 0%, 
    rgba(0, 217, 255, 0.05) 100%
  );
  border-color: rgba(0, 255, 136, 0.3);
  color: rgba(0, 255, 136, 1);
  box-shadow: 0 4px 16px rgba(0, 255, 136, 0.15);
}

/* Dark theme adjustments for suggestions */
[data-theme="dark"] .ai-suggestions-container {
  background: rgba(25, 25, 25, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .suggestion-chip {
  background: rgba(35, 35, 35, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

[data-theme="dark"] .suggestion-chip:hover {
  background: rgba(45, 45, 45, 0.9);
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 1);
}

/* Responsive adjustments for suggestions */
@media (max-width: 480px) {
  .suggestions-chips {
    gap: var(--spacing-1);
  }
  
  .suggestion-chip {
    padding: var(--spacing-1) var(--spacing-2);
    font-size: var(--font-size-xs);
    gap: var(--spacing-1);
  }
  
  .suggestion-icon {
    width: 14px;
    height: 14px;
  }
  
  .suggestion-text {
    max-width: 100px;
  }
  
  .ai-suggestions-container {
    padding: var(--spacing-2);
    margin-top: var(--spacing-2);
  }
  
  .suggestions-header {
    margin-bottom: var(--spacing-2);
  }
}

/* High contrast mode adjustments */
@media (prefers-contrast: high) {
  .suggestion-chip {
    border-width: 2px;
  }
  
  .ai-suggestions-container {
    border-width: 2px;
  }
}

/* Reduced motion adjustments */
@media (prefers-reduced-motion: reduce) {
  .ai-suggestions-container {
    animation: none;
  }
  
  .suggestion-chip:hover {
    transform: none;
  }
}
</style>
