<template>
  <div class="ai-modal-system">
    <!-- Floating AI Assistant Button -->
    <Teleport to="body">
      <div
        v-if="!isModalVisible"
        class="ai-float-button"
        :class="{ 'has-suggestions': hasPendingSuggestions }"
      >
        <UnifiedButton
          variant="gaming"
          size="lg"
          icon-only
          :icon="aiStatus.isProcessing ? 'mdi-loading' : 'mdi-robot-happy'"
          :class="{ spinning: aiStatus.isProcessing }"
          :tooltip="
            hasPendingSuggestions
              ? `AI Assistant - ${activeSuggestions.length} suggestions available`
              : 'AI Assistant'
          "
          @click="toggleModal"
        />

        <!-- Suggestion Badge -->
        <div v-if="hasPendingSuggestions" class="suggestion-badge">
          {{ activeSuggestions.length }}
        </div>
      </div>
    </Teleport>

    <!-- AI Modal Dialog -->
    <v-dialog
      v-model="isModalVisible"
      max-width="900"
      persistent
      :transition="false"
    >
      <v-card class="ai-modal glass-elevated">
        <!-- Modal Header -->
        <v-card-title class="d-flex align-center justify-space-between pa-4">
          <div class="d-flex align-center ga-2">
            <AppIcon
              :name="aiStatus.isProcessing ? 'mdi-loading' : 'mdi-robot-happy'"
              :class="{ spinning: aiStatus.isProcessing }"
              size="small"
              color="primary"
            />
            <span class="text-h6">AI Career Assistant</span>
            <UiChip
              v-if="currentContext"
              :label="getContextDisplayName(currentContext.entityType)"
              variant="secondary"
              size="small"
            />
          </div>

          <div class="d-flex align-center ga-2">
            <!-- AI Status Indicator -->
            <div class="ai-status-indicator" :class="getStatusClass()">
              <div class="status-dot"></div>
              <span class="status-text">{{ getStatusText() }}</span>
            </div>

            <UnifiedButton
              variant="ghost"
              icon-only
              icon="mdi-close"
              @click="closeModal"
            />
          </div>
        </v-card-title>

        <!-- Tab Navigation -->
        <v-tabs
          v-model="activeTab"
          class="ai-modal-tabs"
          centered
          color="primary"
        >
          <v-tab value="suggestions">
            <AppIcon name="mdi-lightbulb" size="small" class="mr-2" />
            Suggestions
            <UiChip
              v-if="activeSuggestions.length > 0"
              :label="activeSuggestions.length.toString()"
              variant="primary"
              size="xs"
              class="ml-2"
            />
          </v-tab>
          <v-tab value="analysis">
            <AppIcon name="mdi-chart-line" size="small" class="mr-2" />
            Analysis
          </v-tab>
          <v-tab value="chat">
            <AppIcon name="mdi-chat" size="small" class="mr-2" />
            Chat
          </v-tab>
        </v-tabs>

        <!-- Tab Content -->
        <v-card-text class="pa-0">
          <v-window v-model="activeTab" class="ai-modal-content">
            <!-- Suggestions Tab -->
            <v-window-item value="suggestions">
              <div class="suggestions-panel pa-4">
                <div
                  v-if="activeSuggestions.length === 0"
                  class="empty-state text-center pa-8"
                >
                  <AppIcon
                    name="mdi-lightbulb-outline"
                    size="xl"
                    color="muted"
                  />
                  <h3 class="text-h6 mt-4 mb-2">No Suggestions Available</h3>
                  <p class="text-body-2 text-medium-emphasis">
                    Start working on your
                    {{
                      getContextDisplayName(
                        currentContext?.entityType || "resume",
                      )
                    }}
                    to get AI-powered suggestions.
                  </p>
                </div>

                <div v-else class="suggestions-list">
                  <div
                    v-for="suggestion in prioritizedSuggestions"
                    :key="suggestion.id"
                    class="suggestion-card mb-3"
                    :class="getPriorityClass(suggestion.priority)"
                  >
                    <div
                      class="suggestion-header d-flex align-center justify-space-between mb-2"
                    >
                      <div class="d-flex align-center ga-2">
                        <AppIcon
                          :name="getSuggestionIcon(suggestion.type)"
                          size="small"
                        />
                        <span class="text-subtitle-1 font-weight-medium">{{
                          suggestion.title
                        }}</span>
                        <UiChip
                          :label="suggestion.priority"
                          :variant="getPriorityVariant(suggestion.priority)"
                          size="xs"
                        />
                      </div>

                      <div class="suggestion-actions d-flex ga-1">
                        <UnifiedButton
                          variant="primary"
                          size="sm"
                          :loading="processingAction === suggestion.id"
                          @click="applySuggestion(suggestion.id)"
                        >
                          Apply
                        </UnifiedButton>
                        <UnifiedButton
                          variant="ghost"
                          size="sm"
                          icon="mdi-close"
                          @click="dismissSuggestion(suggestion.id)"
                        />
                      </div>
                    </div>

                    <p class="text-body-2 mb-2">{{ suggestion.description }}</p>

                    <div
                      v-if="suggestion.originalText && suggestion.suggestedText"
                      class="suggestion-comparison"
                    >
                      <div class="comparison-section mb-2">
                        <span class="text-caption text-medium-emphasis">Original:</span>
                        <div class="original-text pa-2 rounded">
                          {{ suggestion.originalText }}
                        </div>
                      </div>
                      <div class="comparison-section">
                        <span class="text-caption text-medium-emphasis">Suggested:</span>
                        <div class="suggested-text pa-2 rounded">
                          {{ suggestion.suggestedText }}
                        </div>
                      </div>
                    </div>

                    <div
                      class="reasoning text-caption mt-2 pa-2 rounded bg-surface-variant"
                    >
                      <strong>Why:</strong> {{ suggestion.reasoning }}
                    </div>
                  </div>
                </div>
              </div>
            </v-window-item>

            <!-- Analysis Tab -->
            <v-window-item value="analysis">
              <div class="analysis-panel pa-4">
                <div v-if="!lastAnalysis" class="empty-state text-center pa-8">
                  <AppIcon name="mdi-chart-line" size="xl" color="muted" />
                  <h3 class="text-h6 mt-4 mb-2">No Analysis Available</h3>
                  <p class="text-body-2 text-medium-emphasis mb-4">
                    Generate an analysis of your
                    {{
                      getContextDisplayName(
                        currentContext?.entityType || "resume",
                      )
                    }}.
                  </p>
                  <UnifiedButton
                    variant="primary"
                    :loading="aiStatus.isProcessing"
                    @click="generateAnalysis"
                  >
                    Generate Analysis
                  </UnifiedButton>
                </div>

                <div v-else class="analysis-content">
                  <!-- Overall Score -->
                  <div class="score-card mb-4 pa-4 rounded glass-elevated">
                    <div class="d-flex align-center justify-space-between mb-2">
                      <h3 class="text-h6">Overall Score</h3>
                      <div
                        class="score-circle"
                        :class="getScoreClass(lastAnalysis.score)"
                      >
                        {{ lastAnalysis.score }}/100
                      </div>
                    </div>
                    <v-progress-linear
                      :model-value="lastAnalysis.score"
                      :color="getScoreColor(lastAnalysis.score)"
                      height="8"
                      rounded
                    />
                  </div>

                  <!-- Strengths and Improvements -->
                  <div class="insights-grid">
                    <div class="strengths-section">
                      <h4 class="text-subtitle-1 mb-3 d-flex align-center ga-2">
                        <AppIcon name="mdi-check-circle" color="success" />
                        Strengths
                      </h4>
                      <div class="insight-list">
                        <div
                          v-for="strength in lastAnalysis.strengths"
                          :key="strength"
                          class="insight-item success pa-2 mb-2 rounded"
                        >
                          {{ strength }}
                        </div>
                      </div>
                    </div>

                    <div class="improvements-section">
                      <h4 class="text-subtitle-1 mb-3 d-flex align-center ga-2">
                        <AppIcon name="mdi-alert-circle" color="warning" />
                        Areas for Improvement
                      </h4>
                      <div class="insight-list">
                        <div
                          v-for="improvement in lastAnalysis.improvements"
                          :key="improvement"
                          class="insight-item warning pa-2 mb-2 rounded"
                        >
                          {{ improvement }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Keywords -->
                  <div
                    v-if="lastAnalysis.keywords?.length"
                    class="keywords-section mt-4"
                  >
                    <h4 class="text-subtitle-1 mb-3">Relevant Keywords</h4>
                    <div class="keywords-list d-flex flex-wrap ga-2">
                      <UiChip
                        v-for="keyword in lastAnalysis.keywords"
                        :key="keyword"
                        :label="keyword"
                        variant="primary"
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </v-window-item>

            <!-- Chat Tab -->
            <v-window-item value="chat">
              <div class="chat-panel">
                <div
                  ref="chatContainer"
                  class="chat-messages pa-4"
                  style="height: 400px; overflow-y: auto"
                >
                  <div
                    v-if="chatHistory.length === 0"
                    class="empty-chat text-center pa-8"
                  >
                    <AppIcon name="mdi-chat-outline" size="xl" color="muted" />
                    <h3 class="text-h6 mt-4 mb-2">Start a Conversation</h3>
                    <p class="text-body-2 text-medium-emphasis">
                      Ask me anything about your career, resume, or job search
                      strategy.
                    </p>
                  </div>

                  <div
                    v-for="message in chatHistory"
                    :key="message.id"
                    class="chat-message mb-4"
                    :class="{
                      'user-message': message.role === 'user',
                      'ai-message': message.role === 'assistant',
                    }"
                  >
                    <div class="message-header d-flex align-center ga-2 mb-2">
                      <AppIcon
                        :name="
                          message.role === 'user' ? 'mdi-account' : 'mdi-robot'
                        "
                        size="small"
                      />
                      <span class="text-caption">
                        {{ message.role === "user" ? "You" : "AI Assistant" }}
                      </span>
                      <span class="text-caption text-medium-emphasis">
                        {{ formatMessageTime(message.timestamp) }}
                      </span>
                    </div>
                    <div
                      class="message-content pa-3 rounded"
                      v-html="formatMessage(message.content)"
                    ></div>
                  </div>

                  <div v-if="isTyping" class="typing-indicator mb-4">
                    <div class="d-flex align-center ga-2">
                      <AppIcon name="mdi-robot" size="small" />
                      <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Chat Input -->
                <div class="chat-input pa-4 border-t">
                  <div class="d-flex align-center ga-2">
                    <v-text-field
                      v-model="chatInput"
                      placeholder="Ask me anything about your career..."
                      variant="outlined"
                      density="compact"
                      hide-details
                      @keyup.enter="sendMessage"
                      @keydown.meta.enter="sendMessage"
                      @keydown.ctrl.enter="sendMessage"
                    />
                    <UnifiedButton
                      variant="primary"
                      icon="mdi-send"
                      :disabled="!chatInput.trim() || isSendingMessage"
                      :loading="isSendingMessage"
                      @click="sendMessage"
                    />
                  </div>
                </div>
              </div>
            </v-window-item>
          </v-window>
        </v-card-text>

        <!-- Modal Footer -->
        <v-card-actions class="pa-4 border-t">
          <div class="d-flex align-center justify-space-between w-100">
            <div class="session-stats">
              <span class="text-caption text-medium-emphasis">
                Session: {{ contextStats.appliedActions }} applied,
                {{ contextStats.dismissedActions }} dismissed
              </span>
            </div>
            <div class="modal-actions d-flex ga-2">
              <UnifiedButton
                variant="outline"
                :loading="aiStatus.isProcessing"
                @click="refreshSuggestions"
              >
                Refresh
              </UnifiedButton>
              <UnifiedButton variant="ghost" @click="closeModal">
                Close
              </UnifiedButton>
            </div>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from "vue";
import { useAIContext } from "@/composables/useAIContext";
import { useAIIntegration } from "@/composables/aiIntegration.js";
import { logger } from "@/shared/utils/logger";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import UiChip from "@/components/ui/UiChip.vue";

interface Props {
  contextType?: "resume" | "cover-letter" | "job" | "interview" | "portfolio";
  contextId?: string;
  targetJob?: any;
}

const props = withDefaults(defineProps<Props>(), {
  contextType: "resume",
});

const emit = defineEmits<{
  suggestionApplied: [suggestion: any];
  suggestionDismissed: [suggestionId: string];
  analysisGenerated: [analysis: any];
  chatMessage: [message: any];
}>();

// Composables
const aiContext = useAIContext();
const aiIntegration = useAIIntegration();

// State
const isModalVisible = ref(false);
const activeTab = ref("suggestions");
const chatInput = ref("");
const chatHistory = ref<any[]>([]);
const isTyping = ref(false);
const isSendingMessage = ref(false);
const processingAction = ref<string | null>(null);
const chatContainer = ref<HTMLElement>();

// Computed properties
const currentContext = computed(() => aiContext.state.currentContext);
const activeSuggestions = computed(() => aiContext.activeSuggestions.value);
const contextStats = computed(() => aiContext.contextStats.value);
const lastAnalysis = computed(() => aiContext.state.lastAnalysis);
const aiStatus = computed(() => ({
  isProcessing: aiContext.state.isProcessing,
  error: aiContext.state.error,
}));

const hasPendingSuggestions = computed(
  () => activeSuggestions.value.length > 0,
);

const prioritizedSuggestions = computed(() => {
  return [...activeSuggestions.value].sort((a, b) => {
    const priorities = { urgent: 4, high: 3, medium: 2, low: 1 };
    return priorities[b.priority] - priorities[a.priority];
  });
});

// Methods
const toggleModal = () => {
  isModalVisible.value = !isModalVisible.value;
  if (isModalVisible.value) {
    initializeContext();
  }
};

const closeModal = () => {
  isModalVisible.value = false;
};

const initializeContext = async () => {
  if (!currentContext.value && props.contextType && props.contextId) {
    try {
      await aiContext.initializeContext(
        props.contextType,
        props.contextId,
        props.targetJob,
      );
    } catch (error) {
      logger.error("Failed to initialize AI context:", error);
    }
  }
};

const applySuggestion = async (suggestionId: string) => {
  try {
    processingAction.value = suggestionId;
    await aiContext.applySuggestion(suggestionId);
    emit(
      "suggestionApplied",
      activeSuggestions.value.find((s) => s.id === suggestionId),
    );
  } catch (error) {
    logger.error("Failed to apply suggestion:", error);
  } finally {
    processingAction.value = null;
  }
};

const dismissSuggestion = (suggestionId: string) => {
  aiContext.dismissSuggestion(suggestionId);
  emit("suggestionDismissed", suggestionId);
};

const generateAnalysis = async () => {
  if (!currentContext.value) return;

  try {
    await aiContext.generateContextActions(currentContext.value);
  } catch (error) {
    logger.error("Failed to generate analysis:", error);
  }
};

const refreshSuggestions = async () => {
  if (!currentContext.value) return;

  try {
    await aiContext.generateContextActions(currentContext.value);
  } catch (error) {
    logger.error("Failed to refresh suggestions:", error);
  }
};

const sendMessage = async () => {
  if (!chatInput.value.trim() || isSendingMessage.value) return;

  const userMessage = {
    id: Date.now().toString(),
    role: "user",
    content: chatInput.value.trim(),
    timestamp: new Date(),
  };

  chatHistory.value.push(userMessage);
  const messageContent = chatInput.value.trim();
  chatInput.value = "";

  // Scroll to bottom
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });

  try {
    isSendingMessage.value = true;
    isTyping.value = true;

    // Mock AI response - in real implementation, use the AI service
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I understand you're asking about "${messageContent}". Based on your current context (${props.contextType}), here are some suggestions...`,
        timestamp: new Date(),
      };

      chatHistory.value.push(aiMessage);
      emit("chatMessage", aiMessage);
      isTyping.value = false;
      isSendingMessage.value = false;

      nextTick(() => {
        if (chatContainer.value) {
          chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
        }
      });
    }, 2000);
  } catch (error) {
    logger.error("Failed to send message:", error);
    isTyping.value = false;
    isSendingMessage.value = false;
  }
};

// Utility methods
const getContextDisplayName = (type?: string) => {
  const names = {
    resume: "Resume",
    "cover-letter": "Cover Letter",
    job: "Job Analysis",
    interview: "Interview Prep",
    portfolio: "Portfolio",
  };
  return names[type] || "Document";
};

const getSuggestionIcon = (type: string) => {
  const icons = {
    suggestion: "mdi-lightbulb",
    correction: "mdi-pencil",
    enhancement: "mdi-trending-up",
    analysis: "mdi-chart-line",
    generation: "mdi-auto-fix",
  };
  return icons[type] || "mdi-lightbulb";
};

const getPriorityClass = (priority: string) => {
  return `priority-${priority}`;
};

const getPriorityVariant = (priority: string) => {
  const variants = {
    urgent: "error",
    high: "warning",
    medium: "primary",
    low: "secondary",
  };
  return variants[priority] || "secondary";
};

const getStatusClass = () => {
  if (aiStatus.value.error) return "status-error";
  if (aiStatus.value.isProcessing) return "status-processing";
  return "status-ready";
};

const getStatusText = () => {
  if (aiStatus.value.error) return "Error";
  if (aiStatus.value.isProcessing) return "Processing";
  return "Ready";
};

const getScoreClass = (score: number) => {
  if (score >= 80) return "score-excellent";
  if (score >= 60) return "score-good";
  if (score >= 40) return "score-fair";
  return "score-poor";
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "success";
  if (score >= 60) return "primary";
  if (score >= 40) return "warning";
  return "error";
};

const formatMessage = (content: string) => {
  return content.replace(/\n/g, "<br>");
};

const formatMessageTime = (timestamp: Date) => {
  return timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Lifecycle
onMounted(() => {
  if (props.contextType && props.contextId) {
    initializeContext();
  }
});

// Watch for context changes
watch(
  () => props.contextType,
  () => {
    if (isModalVisible.value) {
      initializeContext();
    }
  },
);
</script>

<style scoped>
.ai-float-button {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  transition: all 0.3s ease;
}

.ai-float-button.has-suggestions {
  animation: pulse 2s infinite;
}

.suggestion-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: rgb(var(--v-theme-error));
  color: rgb(var(--v-theme-on-error));
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.ai-modal {
  background: rgba(var(--v-theme-surface), 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
}

.ai-modal-tabs {
  background: rgba(var(--v-theme-surface-variant), 0.3);
}

.ai-modal-content {
  min-height: 500px;
}

.suggestion-card {
  background: rgba(var(--v-theme-surface), 0.8);
  border: 1px solid rgba(var(--v-theme-outline), 0.12);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
}

.suggestion-card.priority-urgent {
  border-color: rgb(var(--v-theme-error));
  background: rgba(var(--v-theme-error), 0.05);
}

.suggestion-card.priority-high {
  border-color: rgb(var(--v-theme-warning));
  background: rgba(var(--v-theme-warning), 0.05);
}

.suggestion-card.priority-medium {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.05);
}

.suggestion-comparison {
  margin-top: 12px;
}

.original-text {
  background: rgba(var(--v-theme-error), 0.1);
  border: 1px solid rgba(var(--v-theme-error), 0.2);
}

.suggested-text {
  background: rgba(var(--v-theme-success), 0.1);
  border: 1px solid rgba(var(--v-theme-success), 0.2);
}

.score-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  font-weight: 600;
  font-size: 18px;
}

.score-excellent {
  background: rgba(var(--v-theme-success), 0.2);
  color: rgb(var(--v-theme-success));
}

.score-good {
  background: rgba(var(--v-theme-primary), 0.2);
  color: rgb(var(--v-theme-primary));
}

.score-fair {
  background: rgba(var(--v-theme-warning), 0.2);
  color: rgb(var(--v-theme-warning));
}

.score-poor {
  background: rgba(var(--v-theme-error), 0.2);
  color: rgb(var(--v-theme-error));
}

.insights-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 24px;
}

.insight-item.success {
  background: rgba(var(--v-theme-success), 0.1);
  border-left: 4px solid rgb(var(--v-theme-success));
}

.insight-item.warning {
  background: rgba(var(--v-theme-warning), 0.1);
  border-left: 4px solid rgb(var(--v-theme-warning));
}

.chat-message.user-message .message-content {
  background: rgba(var(--v-theme-primary), 0.1);
  margin-left: 48px;
}

.chat-message.ai-message .message-content {
  background: rgba(var(--v-theme-surface-variant), 0.5);
  margin-right: 48px;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgb(var(--v-theme-primary));
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}
.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

.ai-status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 16px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-ready .status-dot {
  background: rgb(var(--v-theme-success));
}

.status-processing .status-dot {
  background: rgb(var(--v-theme-warning));
  animation: pulse 1s infinite;
}

.status-error .status-dot {
  background: rgb(var(--v-theme-error));
}

.status-text {
  font-size: 12px;
  text-transform: uppercase;
  font-weight: 500;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

@keyframes typing {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

@keyframes spinning {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinning {
  animation: spinning 1s linear infinite;
}

@media (max-width: 768px) {
  .ai-float-button {
    bottom: 16px;
    right: 16px;
  }

  .insights-grid {
    grid-template-columns: 1fr;
  }

  .chat-message.user-message .message-content,
  .chat-message.ai-message .message-content {
    margin-left: 0;
    margin-right: 0;
  }
}
</style>
