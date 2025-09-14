<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div role="region" aria-labelledby="audio-hardware-title" class="enhanced-hardware-section">
    <!-- Section Header -->
    <div class="section-header glass-section-header">
      <div class="header-content">
        <div class="header-icon">
          <AppIcon name="mdi-speaker" />
        </div>
        <div class="header-text">
          <h3 class="header-title">Audio Hardware Configuration</h3>
          <p class="header-description">Configure audio devices, voice settings, and hardware preferences</p>
        </div>
      </div>
      <div class="header-actions">
        <UnifiedButton
          type="button"
          variant="glass"
          size="sm"
          :disabled="loadingDevices"
          leading-icon="mdi-refresh"
          @click="$emit('load-audio-devices')"
        >
          <span v-if="loadingDevices" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
          Refresh Devices
        </UnifiedButton>
      </div>
    </div>
    <div>
      <div class="row g-4">
        <div class="col-lg-6">
          <label for="microphone-device" class="form-label fw-medium">Microphone</label>
          <select
            id="microphone-device"
            :value="settings.selectedMicId"
            class="form-select glass-input"
            :disabled="!audioDevices.length"
            aria-describedby="microphone-help"
            @change="updateSetting('selectedMicId', $event.target.value)"
          >
            <option value="">System Default</option>
            <option
              v-for="device in audioDevices"
              :key="device.deviceId"
              :value="device.deviceId"
            >
              {{ device.label || `Microphone ${device.deviceId.slice(0, 8)}...` }}
            </option>
          </select>
          <div id="microphone-help" class="form-text">
            Select preferred input device for interviews & real-time chat.
          </div>
          <div class="d-flex align-items-center gap-2 mt-2">
            <UnifiedButton
              type="button"
              size="sm"
              :variant="micTestActive ? 'outline-danger' : 'outline'"
              leading-icon="mdi-microphone"
              @click="toggleMicTest"
            >
              {{ micTestActive ? 'Stop Mic Test' : 'Test Mic' }}
            </UnifiedButton>
            <div v-if="micTestActive" class="mic-meter" aria-label="Microphone level">
              <div class="mic-meter-fill" :style="{ width: `${Math.min(micTestLevel * 100, 100)}%` }"></div>
            </div>
          </div>
        </div>

        <div class="col-lg-6">
          <label for="voice-lang" class="form-label fw-medium">Recognition Language</label>
          <select
            id="voice-lang"
            :value="settings.voiceLang"
            class="form-select glass-input"
            aria-describedby="voice-lang-help"
            @change="updateSetting('voiceLang', $event.target.value)"
          >
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="en-CA">English (CA)</option>
            <option value="en-AU">English (AU)</option>
          </select>
          <div id="voice-lang-help" class="form-text">
            Determines transcription & voice analysis language.
          </div>
        </div>

        <div v-show="settings.ttsProvider === 'system'" class="col-12">
          <label for="tts-voice" class="form-label fw-medium">System TTS Voice</label>
          <select
            id="tts-voice"
            :value="settings.ttsVoice"
            class="form-select glass-input"
            :disabled="!voices.length"
            aria-describedby="voice-tts-help"
            @change="updateSetting('ttsVoice', $event.target.value)"
          >
            <option value="">System Default</option>
            <option
              v-for="v in voices"
              :key="v.name + v.lang"
              :value="v.name"
            >
              {{ v.name }} ({{ v.lang }})
            </option>
          </select>
          <div id="voice-tts-help" class="form-text">
            Voice used for spoken responses (System TTS provider).
          </div>
          <div class="mt-2 d-flex align-items-center gap-2">
            <UnifiedButton
              type="button"
              size="sm"
              leading-icon="mdi-volume-high"
              :disabled="isSpeakingTest"
              @click="testVoice"
            >
              {{ isSpeakingTest ? 'Testing…' : 'Test Voice' }}
            </UnifiedButton>
            <UnifiedButton
              v-if="isSpeakingTest"
              type="button"
              variant="outline-danger"
              size="sm"
              leading-icon="mdi-stop"
              @click="stopVoiceTest"
            >
              Stop
            </UnifiedButton>
          </div>
        </div>

        <!-- Enhanced Audio Hardware Settings -->
        <div class="col-lg-6">
          <label for="speaker-device" class="form-label fw-medium">Speaker/Headphones</label>
          <select
            id="speaker-device"
            :value="settings.selectedSpeakerId"
            class="form-select glass-input"
            aria-describedby="speaker-help"
            @change="updateSetting('selectedSpeakerId', $event.target.value)"
          >
            <option value="">System Default</option>
            <option value="speakers">Speakers</option>
            <option value="headphones">Headphones</option>
            <option value="bluetooth">Bluetooth Audio</option>
          </select>
          <div id="speaker-help" class="form-text">
            Select preferred output device for audio playback.
          </div>
        </div>

        <div class="col-lg-6">
          <label for="audio-quality" class="form-label fw-medium">Audio Quality</label>
          <select
            id="audio-quality"
            :value="settings.audioQuality"
            class="form-select glass-input"
            aria-describedby="quality-help"
            @change="updateSetting('audioQuality', $event.target.value)"
          >
            <option value="low">Low (8kHz - Data Saver)</option>
            <option value="medium">Medium (16kHz - Balanced)</option>
            <option value="high">High (44.1kHz - Best Quality)</option>
            <option value="studio">Studio (48kHz - Professional)</option>
          </select>
          <div id="quality-help" class="form-text">
            Higher quality uses more bandwidth but provides better audio.
          </div>
        </div>

        <!-- Audio Processing Settings -->
        <div class="col-12">
          <div class="enhanced-audio-processing glass-section">
            <h4 class="section-title">
              <AppIcon name="mdi-tune-vertical" />
              Audio Processing
            </h4>
            
            <div class="row g-3">
              <div class="col-md-6">
                <label for="noise-suppression" class="form-label fw-medium">Noise Suppression</label>
                <div class="d-flex align-items-center gap-3">
                  <input
                    id="noise-suppression"
                    type="checkbox"
                    :checked="settings.noiseSuppression"
                    class="glass-toggle"
                    @change="updateSetting('noiseSuppression', $event.target.checked)"
                  />
                  <label for="noise-suppression" class="toggle-label">
                    Reduce background noise during voice input
                  </label>
                </div>
              </div>

              <div class="col-md-6">
                <label for="echo-cancellation" class="form-label fw-medium">Echo Cancellation</label>
                <div class="d-flex align-items-center gap-3">
                  <input
                    id="echo-cancellation"
                    type="checkbox"
                    :checked="settings.echoCancellation"
                    class="glass-toggle"
                    @change="updateSetting('echoCancellation', $event.target.checked)"
                  />
                  <label for="echo-cancellation" class="toggle-label">
                    Prevent audio feedback loops
                  </label>
                </div>
              </div>

              <div class="col-md-6">
                <label for="auto-gain" class="form-label fw-medium">Auto Gain Control</label>
                <div class="d-flex align-items-center gap-3">
                  <input
                    id="auto-gain"
                    type="checkbox"
                    :checked="settings.autoGainControl"
                    class="glass-toggle"
                    @change="updateSetting('autoGainControl', $event.target.checked)"
                  />
                  <label for="auto-gain" class="toggle-label">
                    Automatically adjust microphone volume
                  </label>
                </div>
              </div>

              <div class="col-md-6">
                <label for="push-to-talk" class="form-label fw-medium">Push-to-Talk Mode</label>
                <div class="d-flex align-items-center gap-3">
                  <input
                    id="push-to-talk"
                    type="checkbox"
                    :checked="settings.pushToTalkMode"
                    class="glass-toggle"
                    @change="updateSetting('pushToTalkMode', $event.target.checked)"
                  />
                  <label for="push-to-talk" class="toggle-label">
                    Require key press to activate microphone
                  </label>
                </div>
              </div>
            </div>

            <!-- Push-to-Talk Key Configuration -->
            <div v-if="settings.pushToTalkMode" class="push-to-talk-config mt-3">
              <label for="ptt-key" class="form-label fw-medium">Push-to-Talk Key</label>
              <div class="d-flex align-items-center gap-2">
                <input
                  id="ptt-key"
                  :value="settings.pushToTalkKey || 'Space'"
                  type="text"
                  class="form-control glass-input"
                  readonly
                  style="max-width: 120px;"
                />
                <UnifiedButton
                  variant="outline"
                  size="sm"
                  leading-icon="mdi-keyboard"
                  @click="configurePTTKey"
                >
                  {{ configuringPTT ? 'Press a key...' : 'Set Key' }}
                </UnifiedButton>
              </div>
              <div class="form-text">
                Click "Set Key" then press the key you want to use for push-to-talk.
              </div>
            </div>
          </div>
        </div>

        <div v-show="settings.ttsProvider === 'gemini'" class="col-12">
          <label for="gemini-voice" class="form-label fw-medium">Gemini Voice</label>
          <input
            id="gemini-voice"
            :value="settings.geminiVoice"
            type="text"
            class="form-control glass-input"
            placeholder="e.g. warm female, calm male, narrator"
            aria-describedby="gemini-voice-help"
            @input="updateSetting('geminiVoice', $event.target.value)"
          />
          <div id="gemini-voice-help" class="form-text">
            Optional style or voice hint for Gemini TTS (not all voices available in all regions).
          </div>
          <div class="mt-2 d-flex align-items-center gap-2">
            <label for="gemini-voice-preset" class="form-label mb-0 small text-muted">Presets</label>
            <select
              id="gemini-voice-preset"
              :value="selectedGeminiPreset"
              class="form-select form-select-sm w-auto"
              @change="selectedGeminiPreset = $event.target.value; applyGeminiPreset()"
            >
              <option value="">Select a preset…</option>
              <option v-for="p in geminiVoicePresets" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
          <div class="mt-2 d-flex align-items-center gap-2">
            <UnifiedButton
              type="button"
              size="sm"
              leading-icon="mdi-volume-high"
              :disabled="isSpeakingTest"
              @click="testVoice"
            >
              {{ isSpeakingTest ? 'Testing…' : 'Test Voice' }}
            </UnifiedButton>
            <UnifiedButton
              v-if="isSpeakingTest"
              type="button"
              variant="outline-danger"
              size="sm"
              leading-icon="mdi-stop"
              @click="stopVoiceTest"
            >
              Stop
            </UnifiedButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Removed unused icon components
import { audioService } from '@/shared/services/AudioService'
import { speak, stopSpeaking } from '@/utils/voice'

export default {
  name: 'AudioHardwareSection',
  components: {
    UnifiedButton: () => import('@/components/ui/UnifiedButton.vue'),
    AppIcon: () => import('@/components/ui/AppIcon.vue')
  },
  props: {
    settings: {
      type: Object,
      required: true
    },
    voices: {
      type: Array,
      default: () => []
    },
    audioDevices: {
      type: Array,
      default: () => []
    },
    loadingDevices: {
      type: Boolean,
      default: false
    }
  },
  emits: ['load-audio-devices', 'update:settings'],
  data() {
    return {
      micTestActive: false,
      micTestLevel: 0,
      isSpeakingTest: false,
      selectedGeminiPreset: '',
      configuringPTT: false,
      geminiVoicePresets: [
        'Warm female',
        'Calm male',
        'Friendly narrator',
        'Energetic announcer',
        'Neutral professional',
        'Conversational',
        'Soft-spoken',
        'Upbeat',
        'Deep male',
        'Bright female',
        'Newsreader'
      ]
    }
  },
  watch: {
    'settings.selectedMicId'(newVal) {
      // If testing, restart monitoring on device change
      if (this.micTestActive) {
        try {
          audioService.stopMonitoring()
          const id = newVal || undefined
          audioService.startMonitoring(id, (level) => { this.micTestLevel = level })
        } catch {}
      }
    },
    'settings.geminiVoice': {
      immediate: true,
      handler(newVal) {
        if (this.geminiVoicePresets.includes(newVal || '')) {
          this.selectedGeminiPreset = newVal
        } else {
          this.selectedGeminiPreset = ''
        }
      }
    }
  },
  beforeUnmount() {
    try { audioService.stopMonitoring() } catch {}
    try { stopSpeaking() } catch {}
  },
  methods: {
    async toggleMicTest() {
      try {
        if (this.micTestActive) {
          audioService.stopMonitoring()
          this.micTestActive = false
          this.micTestLevel = 0
          return
        }
        const id = this.settings?.selectedMicId || undefined
        await audioService.startMonitoring(id, (level) => { this.micTestLevel = level })
        this.micTestActive = true
      } catch {
        // swallow errors to keep settings UX smooth
      }
    }
    ,
    updateSetting(key, value) {
      this.$emit('update:settings', { ...this.settings, [key]: value })
    },
    applyGeminiPreset() {
      if (this.selectedGeminiPreset) {
        this.updateSetting('geminiVoice', this.selectedGeminiPreset)
      }
    },
    async testVoice() {
      try {
        this.isSpeakingTest = true
        const text = 'This is your selected voice for Navi. Hello!';
        const opts = {
          provider: this.settings.ttsProvider || 'system',
          language: this.settings.voiceLang || 'en-US',
          rate: this.settings.speechRate ?? 0.85,
          pitch: this.settings.speechPitch ?? 1.0,
          volume: this.settings.speechVolume ?? 0.9
        }
        if (opts.provider === 'system' && this.settings.ttsVoice) { opts.voice = this.settings.ttsVoice }
        if (opts.provider === 'gemini' && this.settings.geminiVoice) { opts.voice = this.settings.geminiVoice }
        await speak(text, opts)
      } catch {/* ignore */}
      finally {
        this.isSpeakingTest = false
      }
    },
    stopVoiceTest() {
      try { stopSpeaking() } catch {}
      this.isSpeakingTest = false
    },
    
    configurePTTKey() {
      if (this.configuringPTT) return
      
      this.configuringPTT = true
      
      const handleKeyPress = (event) => {
        event.preventDefault()
        const key = event.code || event.key
        this.updateSetting('pushToTalkKey', key)
        this.configuringPTT = false
        window.removeEventListener('keydown', handleKeyPress, true)
      }
      
      window.addEventListener('keydown', handleKeyPress, true)
      
      // Auto-cancel after 10 seconds
      setTimeout(() => {
        if (this.configuringPTT) {
          this.configuringPTT = false
          window.removeEventListener('keydown', handleKeyPress, true)
        }
      }, 10000)
    }
  }
}
</script>

<style scoped>
.mic-meter {
  flex: 1;
  height: 6px;
  min-width: 120px;
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: 4px;
  overflow: hidden;
}
.mic-meter-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-success) 0%, var(--color-warning) 70%, var(--color-danger) 100%);
  transition: width 0.1s ease;
}

/* Enhanced Audio Hardware Styles */
.enhanced-hardware-section {
  padding: var(--spacing-6);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: between;
  margin-bottom: var(--spacing-6);
  padding-bottom: var(--spacing-4);
  border-bottom: 1px solid var(--glass-border);
}

.header-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  flex: 1;
}

.header-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    color-mix(in srgb, var(--color-primary-500) 10%, transparent) 0%,
    color-mix(in srgb, var(--color-primary-500) 5%, transparent) 100%);
  border: 1px solid color-mix(in srgb, var(--color-primary-500) 20%, transparent);
  border-radius: var(--radius-xl);
  color: var(--color-primary-500);
  font-size: 1.25rem;
  backdrop-filter: blur(8px);
}

.header-text {
  flex: 1;
}

.header-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-1) 0;
}

.header-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

.header-actions {
  margin-left: auto;
}

.enhanced-audio-processing {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-5);
  margin-top: var(--spacing-4);
}

.section-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-4);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.glass-toggle {
  appearance: none;
  width: 44px;
  height: 24px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-full);
  position: relative;
  cursor: pointer;
  transition: all var(--duration-normal);
  backdrop-filter: blur(8px);
}

.glass-toggle::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  transition: all var(--duration-normal);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.glass-toggle:checked {
  background: var(--color-primary-500);
  border-color: var(--color-primary-500);
}

.glass-toggle:checked::before {
  transform: translateX(20px);
}

.toggle-label {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  flex: 1;
}

.push-to-talk-config {
  background: color-mix(in srgb, var(--glass-bg) 50%, transparent);
  border: 1px solid color-mix(in srgb, var(--glass-border) 60%, transparent);
  border-radius: var(--radius-md);
  padding: var(--spacing-4);
  backdrop-filter: blur(4px);
}

.glass-section {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-5);
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .section-header {
    flex-direction: column;
    gap: var(--spacing-3);
  }
  
  .enhanced-audio-processing {
    padding: var(--spacing-4);
  }
}
</style>
