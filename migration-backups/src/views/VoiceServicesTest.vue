<template>
  <StandardPageLayout page-type="gaming" content-spacing="normal" max-width="xl">
    <!-- Diagnostics Section -->
    <section class="glass-card">
      <div class="section-header">
        <h2>Voice Services Diagnostics</h2>
        <div class="section-subtitle">Test voice and audio capabilities</div>
      </div>
      <div class="section-body">
        <UnifiedButton 
          :loading="isRunningDiagnostics"
          variant="primary"
          leading-icon="mdi-robot"
          @click="runDiagnostics"
        >
          Run Diagnostics
        </UnifiedButton>
              
        <div v-if="diagnosticsResults" class="diagnostics-results">
          <h3>Results:</h3>
          <div 
            class="alert"
            :class="diagnosticsResults.capabilities.fullSupport ? 'alert-success' : 'alert-warning'"
          >
            {{ getVoiceServicesStatusMessage(diagnosticsResults.capabilities) }}
          </div>

          <div class="capabilities-section">
            <v-expansion-panels>
              <v-expansion-panel>
                <v-expansion-panel-title>Capabilities</v-expansion-panel-title>
                <v-expansion-panel-text>
                  <ul class="capability-list">
                    <li>WebSocket: <AppIcon :name="diagnosticsResults.capabilities.webSocket ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'" /></li>
                    <li>AudioContext: <AppIcon :name="diagnosticsResults.capabilities.audioContext ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'" /></li>
                    <li>getUserMedia: <AppIcon :name="diagnosticsResults.capabilities.getUserMedia ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'" /></li>
                    <li>getDisplayMedia: <AppIcon :name="diagnosticsResults.capabilities.getDisplayMedia ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'" /></li>
                    <li>WebRTC: <AppIcon :name="diagnosticsResults.capabilities.webRTC ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'" /></li>
                    <li>MediaRecorder: <AppIcon :name="diagnosticsResults.capabilities.mediaRecorder ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'" /></li>
                  </ul>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <v-expansion-panel>
                <v-expansion-panel-title>Test Results</v-expansion-panel-title>
                <v-expansion-panel-text>
                  <ul class="capability-list">
                    <li>
                      Audio Context: <AppIcon :name="diagnosticsResults.tests.audioContext.success ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'" /> 
                      <span v-if="diagnosticsResults.tests.audioContext.error" class="error-text">
                        - {{ diagnosticsResults.tests.audioContext.error }}
                      </span>
                    </li>
                    <li>
                      Microphone: <AppIcon :name="diagnosticsResults.tests.microphone.success ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'" />
                      <span v-if="diagnosticsResults.tests.microphone.error" class="error-text">
                        - {{ diagnosticsResults.tests.microphone.error }}
                      </span>
                    </li>
                    <li>
                      Camera: <AppIcon :name="diagnosticsResults.tests.camera.success ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'" />
                      <span v-if="diagnosticsResults.tests.camera.error" class="error-text">
                        - {{ diagnosticsResults.tests.camera.error }}
                      </span>
                    </li>
                    <li>
                      Screen Share: <AppIcon :name="diagnosticsResults.tests.screenShare.success ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'" />
                      <span v-if="diagnosticsResults.tests.screenShare.error" class="error-text">
                        - {{ diagnosticsResults.tests.screenShare.error }}
                      </span>
                    </li>
                  </ul>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>

          <!-- AI Services Test Section -->
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-card class="mb-4">
                  <v-card-title>AI Services Test</v-card-title>
                  <v-card-text>
                    <UnifiedButton 
                      :loading="isInitializingAI"
                      variant="secondary"
                      class="mr-2"
                      leading-icon="mdi-cpu-64-bit"
                      @click="initializeAI"
                    >
                      Initialize AI Services
                    </UnifiedButton>

                    <UiChip 
                      v-if="aiStatus"
                      :classes="`chip ${aiStatus.success ? 'chip-success' : 'chip-danger'} chip-compact ml-2`"
                    >
                      {{ aiStatus.message }}
                    </UiChip>

                    <div v-if="aiInitialized" class="mt-4">
                      <h4>AI Services Initialized <AppIcon name="mdi-check-circle-outline" color="success" context="success" aria-hidden="true" /></h4>
                      <UnifiedButton 
                        :loading="isTestingVoice"
                        variant="info"
                        class="mr-2"
                        leading-icon="mdi-microphone"
                        @click="testVoiceInput"
                      >
                        Test Voice Input
                      </UnifiedButton>
                      <UnifiedButton 
                        :loading="isTestingVideo"
                        variant="warning"
                        class="mr-2"
                        leading-icon="mdi-video"
                        @click="testVideoStreaming"
                      >
                        Test Video Streaming
                      </UnifiedButton>
                      <UnifiedButton 
                        :loading="isTestingScreen"
                        variant="cyber"
                        leading-icon="mdi-monitor"
                        @click="testScreenCapture"
                      >
                        Test Screen Capture
                      </UnifiedButton>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Console Output -->
            <v-row>
              <v-col cols="12">
                <v-card>
                  <v-card-title>Console Output</v-card-title>
                  <v-card-text>
                    <div class="console-output">
                      <div 
                        v-for="(log, index) in consoleOutput" 
                        :key="index"
                        :class="['console-line', `console-${log.level}`]"
                      >
                        <span class="timestamp">{{ formatTime(log.timestamp) }}</span>
                        <span class="level">[{{ log.level.toUpperCase() }}]</span>
                        <span class="message">{{ log.message }}</span>
                      </div>
                    </div>
                    <UnifiedButton size="sm" variant="ghost" class="mt-2" @click="clearConsole">Clear Console</UnifiedButton>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </div>
      </div>
    </section>
  </StandardPageLayout>
</template>

<script>
import AppIcon from '@/components/ui/AppIcon.vue';
import StandardPageLayout from '@/components/layout/StandardPageLayout.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import UiChip from '@/components/ui/UiChip.vue'
import { ref, onMounted } from 'vue';
import { useToast } from '@/composables/useToast';
import { useLiveMultimediaAI } from '@/composables/useLiveMultimediaAI';
import { 
  runVoiceServicesDiagnostics, 
  getVoiceServicesStatusMessage 
} from '@/shared/utils/voiceServicesValidator';

export default {
  name: 'VoiceServicesTest',
  components: { 
    AppIcon,
    StandardPageLayout, 
    UnifiedButton, 
    UiChip 
  },
  setup() {
    const toast = useToast();
    
    // Diagnostics
    const isRunningDiagnostics = ref(false);
    const diagnosticsResults = ref(null);
    
    // AI Services
    const isInitializingAI = ref(false);
    const aiInitialized = ref(false);
    const aiStatus = ref(null);
    const isTestingVoice = ref(false);
    const isTestingVideo = ref(false);
    const isTestingScreen = ref(false);
    
    // Console
    const consoleOutput = ref([]);
    
    // AI Composable
    const {
      state: multimediaState,
      isInitialized: isAIInitialized,
      initialize: initializeMultimediaAI,
      toggleAudioStreaming,
      toggleVideoStreaming,
      captureScreenshot,
      isMultimediaReady,
    } = useLiveMultimediaAI();

    // Helper functions
    function addToConsole(level, message) {
      consoleOutput.value.push({
        timestamp: new Date(),
        level,
        message: typeof message === 'object' ? JSON.stringify(message) : message
      });
      
      // Keep only last 50 entries
      if (consoleOutput.value.length > 50) {
        consoleOutput.value = consoleOutput.value.slice(-50);
      }
    }

    function formatTime(timestamp) {
      return timestamp.toLocaleTimeString();
    }

    function clearConsole() {
      consoleOutput.value = [];
    }

    // Diagnostics
    async function runDiagnostics() {
      isRunningDiagnostics.value = true;
      addToConsole('info', 'Running voice services diagnostics...');
      
      try {
        const results = await runVoiceServicesDiagnostics();
        diagnosticsResults.value = results;
        
        addToConsole('info', 'Diagnostics completed');
        addToConsole('info', `Full support: ${results.capabilities.fullSupport}`);
        
        if (results.errors.missing.length > 0) {
          addToConsole('error', `Missing features: ${results.errors.missing.join(', ')}`);
        }
        
        if (results.errors.warnings.length > 0) {
          addToConsole('warn', `Warnings: ${results.errors.warnings.join(', ')}`);
        }
        
        toast.success('Diagnostics completed');
      } catch (error) {
        addToConsole('error', `Diagnostics failed: ${error.message}`);
        toast.error('Diagnostics failed');
      } finally {
        isRunningDiagnostics.value = false;
      }
    }

    // AI Services
    async function initializeAI() {
      isInitializingAI.value = true;
      addToConsole('info', 'Initializing AI services...');
      
      try {
        const settings = JSON.parse(localStorage.getItem('app-settings') || '{}');
        const apiKey = settings.geminiApiKey;
        
        if (!apiKey) {
          aiStatus.value = { success: false, message: 'No API key configured' };
          addToConsole('error', 'No Gemini API key found in settings');
          toast.error('Please configure your Gemini API key in settings');
          return;
        }

        const success = await initializeMultimediaAI({
          apiKey,
          model: 'gemini-2.5-flash',
          enableAudio: true,
          enableVideo: true,
          enableScreenshot: true,
          maxTokens: 8192,
          temperature: 0.7,
        });

        if (success) {
          aiInitialized.value = true;
          aiStatus.value = { success: true, message: 'AI services ready' };
          addToConsole('info', 'AI services initialized successfully');
          toast.success('AI services initialized successfully');
        } else {
          aiStatus.value = { success: false, message: 'Initialization failed' };
          addToConsole('error', 'AI services initialization failed');
          toast.error('AI services initialization failed');
        }
      } catch (error) {
        aiStatus.value = { success: false, message: error.message };
        addToConsole('error', `AI initialization error: ${error.message}`);
        toast.error(`AI initialization error: ${error.message}`);
      } finally {
        isInitializingAI.value = false;
      }
    }

    // Test functions
    async function testVoiceInput() {
      isTestingVoice.value = true;
      addToConsole('info', 'Testing voice input...');
      
      try {
        if (!isMultimediaReady()) {
          addToConsole('error', 'AI services not ready');
          toast.error('AI services not ready');
          return;
        }

        await toggleAudioStreaming();
        addToConsole('info', `Voice streaming: ${multimediaState.isAudioStreaming ? 'ON' : 'OFF'}`);
        toast.info(`Voice streaming: ${multimediaState.isAudioStreaming ? 'ON' : 'OFF'}`);
      } catch (error) {
        addToConsole('error', `Voice test error: ${error.message}`);
        toast.error(`Voice test error: ${error.message}`);
      } finally {
        isTestingVoice.value = false;
      }
    }

    async function testVideoStreaming() {
      isTestingVideo.value = true;
      addToConsole('info', 'Testing video streaming...');
      
      try {
        if (!isMultimediaReady()) {
          addToConsole('error', 'AI services not ready');
          toast.error('AI services not ready');
          return;
        }

        await toggleVideoStreaming();
        addToConsole('info', `Video streaming: ${multimediaState.isVideoStreaming ? 'ON' : 'OFF'}`);
        toast.info(`Video streaming: ${multimediaState.isVideoStreaming ? 'ON' : 'OFF'}`);
      } catch (error) {
        addToConsole('error', `Video test error: ${error.message}`);
        toast.error(`Video test error: ${error.message}`);
      } finally {
        isTestingVideo.value = false;
      }
    }

    async function testScreenCapture() {
      isTestingScreen.value = true;
      addToConsole('info', 'Testing screen capture...');
      
      try {
        if (!isMultimediaReady()) {
          addToConsole('error', 'AI services not ready');
          toast.error('AI services not ready');
          return;
        }

        const result = await captureScreenshot('Test screenshot analysis');
        if (result) {
          addToConsole('info', `Screen capture successful: ${result.content.substring(0, 100)}...`);
          toast.success('Screen capture test successful');
        } else {
          addToConsole('error', 'Screen capture failed');
          toast.error('Screen capture failed');
        }
      } catch (error) {
        addToConsole('error', `Screen capture error: ${error.message}`);
        toast.error(`Screen capture error: ${error.message}`);
      } finally {
        isTestingScreen.value = false;
      }
    }

    // Lifecycle
    onMounted(() => {
      addToConsole('info', 'Voice Services Test page loaded');
    });

    return {
      // Diagnostics
      isRunningDiagnostics,
      diagnosticsResults,
      runDiagnostics,
      getVoiceServicesStatusMessage,
      
      // AI Services
      isInitializingAI,
      aiInitialized,
      aiStatus,
      initializeAI,
      
      // Tests
      isTestingVoice,
      isTestingVideo,
      isTestingScreen,
      testVoiceInput,
      testVideoStreaming,
      testScreenCapture,
      
      // Console
      consoleOutput,
      formatTime,
      clearConsole,
      
      // AI State
      multimediaState,
      isAIInitialized,
    };
  },
};
</script>

<style scoped>
.voice-test-container {
  padding: var(--spacing-5);
}

.console-output {
  background-color: var(--surface-elevated);
  color: var(--text-primary);
  padding: 15px;
  border-radius: 8px;
  font-family: 'Fira Code', 'JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Menlo', 'Consolas', 'Liberation Mono', 'Courier New', monospace;
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.console-line {
  margin-bottom: 4px;
  display: flex;
  gap: var(--spacing-2);
}

.timestamp {
  color: var(--text-muted);
  min-width: 80px;
}

.level {
  min-width: 60px;
  font-weight: bold;
}

.console-info .level {
  color: var(--color-success-500);
}

.console-warn .level {
  color: var(--color-warning-500);
}

.console-error .level {
  color: var(--color-error-500);
}

.message {
  flex: 1;
  word-break: break-word;
}

.error-text {
  color: var(--color-error-500);
  font-size: 0.9em;
}
</style>
