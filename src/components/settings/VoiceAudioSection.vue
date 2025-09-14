<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="settings-card mb-4" role="region" aria-labelledby="voice-audio-title">
    <div class="card-header section-header card-header--dense">
      <h5 id="voice-audio-title" class="mb-0">
        <SoundwaveIconComponent class="me-2 icon-sm" />Voice & Audio Settings
      </h5>
    </div>
    <div class="card-body section-body card-body--dense">
      <!-- Voice Mode Toggle -->
      <div class="mb-3 p-3 border rounded-3 glass-input">
        <div class="form-check form-switch mb-2">
          <input
            id="voice-mode"
            v-model="settings.voiceMode"
            class="form-check-input"
            type="checkbox"
          />
          <label class="form-check-label fw-medium" for="voice-mode">
            Voice Mode (auto‑play assistant responses)
          </label>
        </div>
        <div class="form-text hint-chip" role="note">
          <SoundwaveIconComponent />
          <span>Requires browser speech synthesis support</span>
        </div>
      </div>
      <!-- Gemini / Google AI API Key -->
      <div id="gemini-api-key-section" class="mb-3 p-3 border rounded-3 glass-input">
        <label for="gemini-api-key" class="form-label fw-medium mb-2">Google AI (Gemini) API Key</label>
        <div class="input-group">
          <input
            id="gemini-api-key"
            v-model="settings.geminiApiKey"
            :type="revealApiKey ? 'text' : 'password'"
            class="form-control glass-input"
            autocomplete="off"
            :placeholder="settings.geminiApiKey ? '••••••••••••' : 'Enter your Gemini API key'"
            @change="persistVoiceSettings"
          />
          <button
            v-if="settings.geminiApiKey"
            type="button"
            class="btn btn-outline-secondary"
            @click="revealApiKey = !revealApiKey"
          >
            {{ revealApiKey ? 'Hide' : 'Show' }}
          </button>
        </div>
        <div class="form-text api-key-hint" :class="settings.geminiApiKey ? 'text-success' : 'text-warning'">
          <template v-if="settings.geminiApiKey">API key connected – Gemini real‑time features enabled.</template>
          <template v-else>
            Required to enable Navi AI real‑time voice (TTS / STT). Hot Tip: Get your FREE key at
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener" class="link-primary">Google AI Studio</a>.
          </template>
        </div>
      </div>

      <!-- TTS Mode Selection -->
      <div class="mb-3 p-3 border rounded-3 glass-input">
        <label class="form-label fw-medium mb-3">Text-to-Speech Engine</label>
        <div class="row g-2">
          <div class="col-sm-6">
            <div class="form-check">
              <input
                id="tts-system"
                v-model="settings.ttsProvider"
                class="form-check-input"
                type="radio"
                value="system"
              />
              <label class="form-check-label" for="tts-system">
                <strong>System TTS</strong>
                <br /><small class="text-muted">Fast, reliable browser voices</small>
              </label>
            </div>
          </div>
          <div class="col-sm-6">
            <div class="form-check">
              <input
                id="tts-gemini"
                v-model="settings.ttsProvider"
                class="form-check-input"
                type="radio"
                value="gemini"
                :disabled="!settings.geminiApiKey"
              />
              <label class="form-check-label" for="tts-gemini">
                <strong>Navi AI Real-time</strong>
                <br /><small :class="settings.geminiApiKey ? 'text-success' : 'text-muted'">
                  {{ settings.geminiApiKey ? (window.api?.audio?.ttsSpeak ? 'Natural AI voice (API key connected)' : 'Browser mode - falls back to system TTS') : 'Natural AI voice (requires API key)' }}
                </small>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- STT Mode Selection -->
      <div class="mb-3 p-3 border rounded-3 glass-input">
        <label class="form-label fw-medium mb-3">Speech-to-Text Engine</label>
        <div class="row g-2">
          <div class="col-sm-6">
            <div class="form-check">
              <input
                id="stt-system"
                v-model="settings.sttProvider"
                class="form-check-input"
                type="radio"
                value="system"
              />
              <label class="form-check-label" for="stt-system">
                <strong>System STT</strong>
                <br /><small class="text-muted">Built‑in browser recognition</small>
              </label>
            </div>
          </div>
          <div class="col-sm-6">
            <div class="form-check">
              <input
                id="stt-gemini"
                v-model="settings.sttProvider"
                class="form-check-input"
                type="radio"
                value="gemini"
                :disabled="!settings.geminiApiKey"
              />
              <label class="form-check-label" for="stt-gemini">
                <strong>Navi AI Realtime</strong>
                <br /><small :class="settings.geminiApiKey ? 'text-success' : 'text-muted'">
                  {{ settings.geminiApiKey ? (window.api?.audio?.sttTranscribe ? 'Cloud transcription (API key connected)' : 'Browser mode - using system STT') : 'Cloud transcription (requires API key)' }}
                </small>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Audio Device Configuration -->
      <div class="row g-3">
        <div class="col-lg-6">
          <label for="microphone-device" class="form-label fw-medium">Microphone Device</label>
          <div class="input-group">
            <select
              id="microphone-device"
              v-model="settings.selectedMicId"
              class="form-select glass-input"
              :disabled="!audioDevices.length"
              aria-describedby="microphone-help"
            >
              <option value="">System Default</option>
              <option
                v-for="device in audioDevices"
                :key="device.deviceId"
                :value="device.deviceId"
              >
                {{
                  device.label ||
                    `Microphone ${device.deviceId.slice(0, 8)}...`
                }}
              </option>
            </select>
            <IconButton
              :disabled="loadingDevices"
              aria-label="Refresh microphone list"
              variant="outline"
              size="sm"
              icon="mdi-refresh"
              @click="$emit('load-audio-devices')"
            />
          </div>
          <div
            id="microphone-help"
            class="form-text hint-chip"
            role="note"
          >
            <MicIconComponent />
            <span>Select your preferred microphone for voice input and
              interview recordings.</span>
          </div>
        </div>

        <div class="col-lg-6">
          <label for="voice-lang" class="form-label fw-medium">Speech Recognition Language</label>
          <select
            id="voice-lang"
            v-model="settings.voiceLang"
            class="form-select glass-input"
            aria-describedby="voice-lang-help"
          >
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="en-CA">English (CA)</option>
            <option value="en-AU">English (AU)</option>
          </select>
          <div id="voice-lang-help" class="form-text">
            Used for speech recognition in chat.
          </div>
        </div>

        <div
          v-show="settings.ttsProvider === 'system'"
          class="col-12"
        >
          <label for="tts-voice" class="form-label fw-medium">System Voice</label>
          <select
            id="tts-voice"
            v-model="settings.ttsVoice"
            class="form-select glass-input"
            :disabled="!voices.length"
            aria-describedby="voice-tts-help"
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
            Used for spoken responses. Populated from your system
            voices.
          </div>
        </div>
      </div>

      <!-- Advanced Voice Settings -->
      <div class="mt-3">
        <div class="row g-3">
          <div class="col-sm-6">
            <div class="form-check form-switch">
              <input
                id="voice-ptt"
                v-model="settings.pushToTalk"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label" for="voice-ptt">
                Enable Push‑to‑Talk (hold Space)
              </label>
            </div>
            <div class="form-text">
              Hold the Space bar to speak, release to stop. Works in fairy chat and live voice.
            </div>
          </div>

          <div class="col-sm-6">
            <div class="form-check form-switch">
              <input
                id="voice-handsfree"
                v-model="settings.voiceHandsFree"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label" for="voice-handsfree">
                Hands‑free mode (auto‑listen after responses)
              </label>
            </div>
            <div class="form-text">
              When enabled, chat will re‑arm the mic after NAVI
              finishes speaking.
            </div>
          </div>

          <div class="col-sm-6">
            <div class="form-check form-switch">
              <input
                id="chat-cues-muted-audio"
                v-model="settings.chatCuesMuted"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label" for="chat-cues-muted-audio">
                Mute chat cues (vibration/sound)
              </label>
            </div>
            <div class="form-text hint-chip" role="note">
              <SlashIconComponent />
              <span>Independent of notifications; respects reduced-motion
                preference</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { watch } from 'vue';

import {
  SoundwaveIconComponent,
  MicIconComponent,
  SlashIconComponent
} from './SettingsIcons.js'

export default {
  name: 'VoiceAudioSection',
  components: {
    SoundwaveIconComponent,
    MicIconComponent,
  // RefreshIconComponent, // not used
    SlashIconComponent,
    IconButton: () => import('@/components/ui/IconButton.vue')
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
  emits: ['load-audio-devices']
  ,data() {
    return { revealApiKey: false }
  },
  watch: {
    'settings.geminiApiKey': function () { this._persistVoiceSettingsDebounced() },
    'settings.ttsProvider': function () { this._persistVoiceSettingsDebounced() },
    'settings.sttProvider': function () { this._persistVoiceSettingsDebounced() },
    'settings.selectedMicId': function () { this._persistVoiceSettingsDebounced() },
    'settings.voiceLang': function () { this._persistVoiceSettingsDebounced() },
    'settings.ttsVoice': function () { this._persistVoiceSettingsDebounced() }
  },
  methods: {
    _persistVoiceSettingsDebounced: function() {
      if (!this._persistTimer) {
        this._persistTimer = setTimeout(() => {
          this._persistTimer = null;
          this.persistVoiceSettings();
        }, 300); // 300ms debounce
      }
    },
    persistVoiceSettings() {
      try {
        const appSettings = JSON.parse(localStorage.getItem('app-settings') || '{}')
        appSettings.geminiApiKey = this.settings.geminiApiKey || ''
        appSettings.ttsProvider = this.settings.ttsProvider
        appSettings.sttProvider = this.settings.sttProvider
        appSettings.selectedMicId = this.settings.selectedMicId
        appSettings.voiceLang = this.settings.voiceLang
        appSettings.ttsVoice = this.settings.ttsVoice
        localStorage.setItem('app-settings', JSON.stringify(appSettings))
  // Notify rest of app (AI fairy, etc.)
  try { window.dispatchEvent(new CustomEvent('app-settings-updated', { detail: { geminiApiKey: appSettings.geminiApiKey } })) } catch {}
  } catch {
        // silent
      }
    }
  }
}
</script>
