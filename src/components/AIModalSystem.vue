<template>
  <div class="ai-modal-system">
    <!-- AI Helper Modal -->
    <Teleport to="body">
      <div
        v-if="showHelperModal"
        class="modal fade show"
        :style="{ display: showHelperModal ? 'block' : 'none' }"
        @click.self="closeModal"
      >
        <div class="modal-dialog modal-lg">
          <div class="modal-content zelda-modal-content">
            <div class="modal-header zelda-modal-header glass-elevated">
              <h5 class="modal-title zelda-title">
                <div class="title-decoration">
                  <AppIcon name="mdi-triforce" class="zelda-triforce-header" />
                  <AppIcon name="mdi-brain" class="magical-brain me-2" />
                </div>
                <span class="title-text">{{
                  helperTitle || "AI Assistant"
                }}</span>
                <div class="title-subtitle">Your magical companion</div>
              </h5>
              <div class="d-flex align-items-center gap-2">
                <UnifiedButton
                  variant="ghost"
                  size="sm"
                  icon-only
                  :icon="'mdi-close'"
                  class="zelda-close-btn"
                  aria-label="Close"
                  @click="closeModal"
                />
              </div>
            </div>
            <div class="modal-body">
              <!-- Context Awareness Tabs -->
              <div class="nav nav-tabs mb-4" role="tablist">
                <button
                  v-for="tab in contextTabs"
                  :key="tab.id"
                  class="nav-link"
                  :class="{ active: activeTab === tab.id }"
                  @click="activeTab = tab.id"
                >
                  <i :class="tab.icon" class="me-1"></i>
                  {{ tab.label }}
                  <span
                    v-if="tab.count !== undefined"
                    class="badge bg-info ms-1"
                  >{{ tab.count }}</span>
                </button>
              </div>

              <!-- Tab Content -->
              <div class="tab-content">
                <!-- Suggestions Tab -->
                <div
                  v-if="activeTab === 'suggestions'"
                  class="tab-pane fade show active"
                >
                  <div class="unified-grid g-3 mb-3">
                    <div
                      v-for="suggestion in filteredSuggestions"
                      :key="suggestion.id"
                      class="suggestion-card col-md-6"
                      :class="getPriorityClass(suggestion.priority)"
                    >
                      <div
                        class="card h-100"
                        :class="getPriorityCardClass(suggestion.priority)"
                      >
                        <div class="card-body section-body card-body--dense">
                          <div class="d-flex align-items-start">
                            <div class="flex-grow-1">
                              <div class="d-flex align-items-center mb-2">
                                <span
                                  :class="`badge me-2 ${getBadgeClass(suggestion.type)}`"
                                >{{ suggestion.type }}</span>
                                <small class="text-muted">{{
                                  getPriorityLabel(suggestion.priority)
                                }}</small>
                              </div>
                              <h6 class="mb-2">{{ suggestion.title }}</h6>
                              <p class="text-muted small mb-3">
                                {{ suggestion.description }}
                              </p>

                              <div
                                v-if="!suggestion.appliedAt"
                                class="d-flex gap-2"
                              >
                                <button
                                  class="unified-btn btn-sm ui-btn ui-size-md v-btn"
                                  :class="getActionButtonClass(suggestion)"
                                  :disabled="
                                    processingSuggestion === suggestion.id ||
                                      isProcessing
                                  "
                                  @click="applySuggestion(suggestion.id)"
                                >
                                  <AppIcon name="mdi-auto-fix" class="me-1" />
                                  {{
                                    processingSuggestion === suggestion.id
                                      ? "Applying..."
                                      : getActionText(suggestion)
                                  }}
                                </button>
                                <button
                                  class="unified-btn btn-outline-secondary btn-sm v-btn variant-outlined ui-btn ui-size-md"
                                  :disabled="
                                    processingSuggestion === suggestion.id ||
                                      isProcessing
                                  "
                                  @click="dismissSuggestion(suggestion.id)"
                                >
                                  <AppIcon name="mdi-close-circle-outline" />
                                  Dismiss
                                </button>
                              </div>

                              <small
                                v-if="suggestion.appliedAt"
                                class="text-success"
                              >
                                <AppIcon name="mdi-check-circle-outline" />
                                Applied
                                {{ formatDateTime(suggestion.appliedAt) }}
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="filteredSuggestions.length === 0"
                    class="text-center text-muted py-4"
                  >
                    <AppIcon name="mdi-lightbulb" />
                    <h6>No Suggestions Available</h6>
                    <p>
                      AI assistant will provide suggestions when you make
                      changes to your content.
                    </p>
                  </div>
                </div>

                <!-- Analysis Tab -->
                <div
                  v-if="activeTab === 'analysis'"
                  class="tab-pane fade show active"
                >
                  <div class="analysis-section">
                    <div
                      class="d-flex gap-3 mb-3"
                      role="group"
                      aria-label="Analysis actions"
                    >
                      <button
                        class="unified-btn btn-primary btn-sm v-btn ui-btn ui-size-md"
                        :disabled="!currentEntity || isProcessing"
                        @click="requestAnalysis"
                      >
                        <AppIcon name="mdi-brain" class="me-2" />
                        {{ isProcessing ? "Analyzing..." : "Analyze Content" }}
                      </button>
                      <button
                        class="unified-btn btn-outline-info btn-sm v-btn variant-outlined ui-btn ui-size-md"
                        :disabled="!currentEntity || isProcessing"
                        @click="runATSCalculations"
                      >
                        <AppIcon
                          name="mdi-check-circle-outline-outline"
                          class="me-2"
                        />
                        ATS Compatibility Check
                      </button>
                    </div>

                    <!-- Analysis Results -->
                    <div v-if="analysisResults">
                      <div class="unified-grid g-3">
                        <!-- Overall Score -->
                        <div class="col-md-4">
                          <div
                            class="unified-card glass-card section-card text-center"
                          >
                            <div class="card-body section-body">
                              <div
                                class="score-circle"
                                :class="
                                  getScoreClass(analysisResults.overallScore)
                                "
                              >
                                <div class="score-number">
                                  {{ analysisResults.overallScore || 0 }}
                                </div>
                                <div class="score-label">Score</div>
                              </div>
                              <h6 class="mt-3 mb-3">Quality Score</h6>
                              <div class="score-description">
                                {{
                                  getScoreDescription(
                                    analysisResults.overallScore || 0,
                                  )
                                }}
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Analysis Metrics -->
                        <div
                          v-for="(metric, index) in analysisMetrics"
                          :key="index"
                          class="col-md-4"
                        >
                          <div class="unified-card glass-card section-card">
                            <div
                              class="card-header section-header card-header--dense"
                            >
                              <h6 class="mb-0">
                                <i :class="metric.icon" class="me-2"></i>
                                {{ metric.title }}
                              </h6>
                            </div>
                            <div
                              class="card-body section-body card-body--dense"
                            >
                              <div class="d-flex align-items-center">
                                <div class="flex-grow-1">
                                  <div class="metric-value">
                                    {{ metric.value }}
                                  </div>
                                  <small class="text-muted">{{
                                    metric.description
                                  }}</small>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Recommendations -->
                        <div
                          v-if="analysisResults.recommendations?.length"
                          class="col-12"
                        >
                          <div class="unified-card glass-card section-card">
                            <div class="card-header section-header">
                              <h6 class="mb-0">
                                <AppIcon name="mdi-lightbulb" />
                                Recommendations
                              </h6>
                            </div>
                            <div class="card-body section-body">
                              <ul class="list-unstyled mb-0">
                                <li
                                  v-for="(
                                    recommendation, index
                                  ) in analysisResults.recommendations"
                                  :key="index"
                                  class="mb-2 d-flex align-items-start"
                                >
                                  <AppIcon
                                    name="mdi-check-circle-outline"
                                    color="success"
                                  />
                                  <span class="small">{{
                                    recommendation
                                  }}</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      v-else-if="!isProcessing"
                      class="text-center text-muted py-4"
                    >
                      <AppIcon name="mdi-brain" class="mdi-48px mb-3" />
                      <h6 class="mb-2">Ready for Analysis</h6>
                      <p class="mb-3">
                        Click "Analyze Content" to get AI insights about your
                        {{ currentEntityType }}
                      </p>
                      <small class="text-info">
                        <AppIcon name="mdi-information-outline" class="me-1" />
                        Analysis includes keyword optimization, ATS
                        compatibility, and improvement suggestions
                      </small>
                    </div>

                    <!-- Loading State -->
                    <div v-if="isProcessing" class="text-center py-4">
                      <AppIcon
                        name="mdi-brain"
                        class="spin mdi-48px mb-3 text-primary"
                      />
                      <h6 class="mb-2">Analyzing Your Content</h6>
                      <p class="text-muted">
                        AI is evaluating your {{ currentEntityType }} and
                        generating personalized recommendations...
                      </p>
                      <div
                        class="progress mt-3"
                        style="max-width: 300px; margin: 0 auto"
                      >
                        <div
                          class="progress-bar progress-bar-striped progress-bar-animated"
                          style="width: 75%"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Chat Tab -->
                <div
                  v-if="activeTab === 'chat'"
                  class="tab-pane fade show active"
                >
                  <div class="chat-interface mb-3">
                    <div ref="chatContainer" class="chat-messages">
                      <div
                        v-for="message in chatMessages"
                        :key="message.id"
                        class="message mb-3"
                        :class="{ 'message-own': message.sender === 'user' }"
                      >
                        <div
                          class="d-flex"
                          :class="{
                            'justify-content-end': message.sender === 'user',
                          }"
                        >
                          <!-- Left-side avatar for AI/System -->
                          <div
                            v-if="message.sender !== 'user'"
                            class="message-avatar me-2"
                          >
                            <AppIcon
                              :name="
                                message.sender === 'ai'
                                  ? 'mdi-robot'
                                  : 'mdi-information'
                              "
                            />
                          </div>

                          <div
                            class="message-bubble"
                            :class="{
                              'message-bubble-own': message.sender === 'user',
                              'message-bubble-ai': message.sender === 'ai',
                            }"
                          >
                            <div class="message-content">
                              <p class="mb-0 message-text">
                                {{ message.content }}
                              </p>
                              <small class="text-muted message-timestamp">{{
                                formatTime(message.timestamp)
                              }}</small>
                            </div>
                          </div>

                          <!-- Right-side avatar for User -->
                          <div
                            v-if="message.sender === 'user'"
                            class="message-avatar ms-2"
                          >
                            <AppIcon name="mdi-account" />
                          </div>
                        </div>
                      </div>
                      <div v-if="isProcessing" class="message">
                        <div class="d-flex">
                          <div class="message-bubble">
                            <div class="message-content">
                              <div class="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <form
                      class="chat-input-section"
                      @submit.prevent="sendChatMessage"
                    >
                      <div class="input-group">
                        <input
                          v-model="chatInput"
                          type="text"
                          class="unified-input ui-input"
                          placeholder="Ask me anything about your application materials..."
                          :disabled="isProcessing"
                          @keydown.enter.prevent="sendChatMessage"
                        />
                        <button
                          type="submit"
                          class="unified-btn btn-primary v-btn ui-btn ui-size-md"
                          :disabled="!chatInput.trim() || isProcessing"
                        >
                          <AppIcon name="mdi-send" />
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="unified-btn btn-secondary ui-btn ui-size-md v-btn"
                @click="closeModal"
              >
                <AppIcon name="mdi-close-circle-outline" />
                Close
              </button>
              <div v-if="recentActions.length > 0" class="ms-auto">
                <small class="text-muted">
                  {{ recentActions.length }} actions taken
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Backdrop -->
    <Teleport to="body">
      <div
        v-if="showHelperModal"
        class="modal-backdrop fade show"
        @click="closeModal"
      ></div>
    </Teleport>

    <!-- Floating AI Button - Zelda Style -->
    <div
      v-if="!showHelperModal && showFloatingButton"
      class="ai-floating-button zelda-style"
    >
      <button
        class="unified-btn btn-primary btn-lg rounded-circle zelda-assistant-btn v-btn ui-btn ui-size-md"
        :class="{
          pulse: newSuggestionsAvailable,
          'magical-glow': newSuggestionsAvailable,
        }"
        title="Hey! Listen! - AI Assistant"
        @click="openModal"
      >
        <AppIcon name="mdi-brain" class="magical-icon" />
        <span
          v-if="newSuggestionsAvailable"
          class="notification-badge magical-badge"
        >{{ activeSuggestions.length }}</span>
        <!-- Magical particles -->
        <div class="magical-particles">
          <span v-for="i in 6" :key="i" class="particle"></span>
        </div>
      </button>

      <!-- Enhanced Zelda-style tooltip -->
      <div
        v-if="activeSuggestions.length > 0"
        class="ai-tooltip zelda-dialogue"
      >
        <div class="tooltip-arrow zelda-arrow"></div>
        <div class="tooltip-content zelda-content">
          <div class="zelda-header">
            <AppIcon name="mdi-triforce" class="zelda-triforce" />
            <span class="zelda-greeting">Hey! Listen!</span>
          </div>
          <div class="zelda-message">
            I have {{ activeSuggestions.length }} suggestions to help improve
            your {{ currentEntityType }}!
          </div>
          <ul class="zelda-suggestions mb-0 small">
            <li
              v-for="suggestion in activeSuggestions.slice(0, 3)"
              :key="suggestion.id"
              class="zelda-suggestion-item"
            >
              <AppIcon name="mdi-chevron-right" class="zelda-arrow-icon" />
              {{ suggestion.title }}
            </li>
          </ul>
          <div class="zelda-footer">
            <small class="text-muted">Click to open the assistant!</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted, nextTick } from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import { useAIContext } from "@/composables/useAIContext";
import { formatDateTime } from "@/utils/date";

// Props
interface Props {
  entityType?: "resume" | "cover-letter" | "job" | "interview" | "portfolio";
  entityId?: string;
  entityData?: Record<string, any>;
  targetJob?: any;
  show?: boolean;
  showFloatingButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  entityType: undefined,
  entityId: undefined,
  entityData: () => ({}),
  targetJob: undefined,
  show: false,
  showFloatingButton: true,
});

// Emits
const emit = defineEmits<{
  modalToggled: [show: boolean];
  suggestionApplied: [suggestionId: string, success: boolean];
  analysisCompleted: [results: any];
}>();

// Composables
const aiContext = useAIContext();
const isProcessing = ref(false);

// Reactive state
const showHelperModal = ref(false);
const activeTab = ref("suggestions");
const analysisResults = ref<any>(null);
const chatMessages = ref<any[]>([]);
const chatInput = ref("");
const processingSuggestion = ref<string | null>(null);
const lastAnalysisTime = ref<Date>(new Date());

// Computed properties
const filteredSuggestions = computed(() =>
  aiContext.activeSuggestions.value.filter((s) => !s.appliedAt),
);

const recentActions = computed(() => aiContext.recentActions.value.slice(0, 5));

const activeSuggestions = computed(() => aiContext.activeSuggestions.value);

const contextTabs = computed(() => {
  const tabs = [
    {
      id: "suggestions",
      label: "Suggestions",
      icon: "mdi-lightbulb",
      count: filteredSuggestions.value.length,
    },
    {
      id: "analysis",
      label: "Analysis",
      icon: "mdi-magnify-scan",
    },
    {
      id: "chat",
      label: "Chat",
      icon: "mdi-chat-question",
    },
  ];

  return tabs;
});

const helperTitle = computed(() => {
  const entityPrefix = props.entityType
    ? `${props.entityType.charAt(0).toUpperCase() + props.entityType.slice(1)} - `
    : "";
  return `${entityPrefix}AI Assistant`;
});

const newSuggestionsAvailable = computed(
  () => activeSuggestions.value.length > 0,
);

const currentEntity = computed(
  () => props.entityData || aiContext.state.currentContext?.entities?.[0]?.data,
);

const currentEntityType = computed(
  () =>
    props.entityType || aiContext.state.currentContext?.entityType || "content",
);

const analysisMetrics = computed(() => {
  if (!analysisResults.value) return [];

  return [
    {
      title: "Keywords Matched",
      value: analysisResults.value.keywordScore || "75%",
      icon: "mdi-tag-text",
      description: "Resume keywords matching job requirements",
    },
    {
      title: "ATS Score",
      value: analysisResults.value.atsScore || "82%",
      icon: "mdi-check-decagram",
      description: "Applicants Tracking System compatibility",
    },
    {
      title: "Strength Score",
      value: analysisResults.value.strengthScore || "78%",
      icon: "mdi-trending-up",
      description: "Overall content quality assessment",
    },
  ];
});

// Methods
const openModal = async (): Promise<void> => {
  if (props.entityType && props.entityId) {
    await aiContext.initializeContext(
      props.entityType,
      props.entityId,
      props.targetJob,
    );
  }

  showHelperModal.value = true;
  activeTab.value = "suggestions";
  emit("modalToggled", true);
};

const closeModal = (): void => {
  showHelperModal.value = false;
  emit("modalToggled", false);
};

const applySuggestion = async (suggestionId: string): Promise<void> => {
  try {
    processingSuggestion.value = suggestionId;
    await aiContext.applySuggestion(suggestionId);
    emit("suggestionApplied", suggestionId, true);
  } catch (error) {
    console.error("Failed to apply suggestion:", error);
    emit("suggestionApplied", suggestionId, false);
  } finally {
    processingSuggestion.value = null;
  }
};

const dismissSuggestion = (suggestionId: string): void => {
  aiContext.dismissSuggestion(suggestionId);
};

const requestAnalysis = async (): Promise<void> => {
  try {
    analysisResults.value = null;
    const results = await performAnalysis();
    analysisResults.value = results;
    lastAnalysisTime.value = new Date();
    emit("analysisCompleted", results);
  } catch (error) {
    console.error("Analysis failed:", error);
    analysisResults.value = { error: "Analysis failed. Please try again." };
  }
};

const runATSCalculations = async (): Promise<void> => {
  try {
    const atsResults = await performATSAnalysis();
    analysisResults.value = {
      ...analysisResults.value,
      atsScore: atsResults.score,
      atsIssues: atsResults.issues,
      atsSuggestions: atsResults.suggestions,
    };
  } catch (error) {
    console.error("ATS analysis failed:", error);
  }
};

const performAnalysis = async (): Promise<any> => {
  if (!currentEntity.value) {
    throw new Error("No entity data available for analysis");
  }

  // Mock analysis results - in real implementation, this would call the AI service
  const analysis = {
    overallScore: Math.floor(Math.random() * 30) + 70,
    keywordScore: `${Math.floor(Math.random() * 30) + 70}%`,
    atsScore: `${Math.floor(Math.random() * 30) + 70}%`,
    strengthScore: `${Math.floor(Math.random() * 30) + 70}%`,
    recommendations: [
      "Add more quantifiable achievements to demonstrate impact",
      "Include relevant technical skills matching the job requirements",
      "Strengthen the summary section with specific accomplishments",
    ],
  };

  return analysis;
};

const performATSAnalysis = async (): Promise<any> => {
  // Mock ATS analysis
  return {
    score: `${Math.floor(Math.random() * 20) + 75}%`,
    issues: [],
    suggestions: [
      "Use standard section headings (Skills, Experience, Education)",
      "Incorporate keywords from the job description naturally",
      "Use plain text formatting and avoid complex layouts",
    ],
  };
};

const sendChatMessage = async (): Promise<void> => {
  if (!chatInput.value.trim() || isProcessing.value) return;

  const userMessage = {
    id: Date.now(),
    content: chatInput.value.trim(),
    sender: "user",
    timestamp: new Date(),
  };

  chatMessages.value.push(userMessage);
  chatInput.value = "";

  try {
    isProcessing.value = true;

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate processing time

    const aiResponse = {
      id: Date.now() + 1,
      content: `Thank you for your question about "${userMessage.content}". Based on your content, I recommend focusing on quantifiable achievements and relevant keywords. Would you like me to help you refine any specific section?`,
      sender: "ai",
      timestamp: new Date(),
    };

    chatMessages.value.push(aiResponse);
    isProcessing.value = false;

    // Scroll to bottom
    await nextTick(() => {
      scrollToBottom();
    });
  } catch (error) {
    console.error("Chat message failed:", error);
    isProcessing.value = false;
  }
};

// Utility methods
const getPriorityClass = (priority: string): string => {
  switch (priority) {
    case "high":
      return "priority-high";
    case "urgent":
      return "priority-urgent";
    default:
      return "priority-normal";
  }
};

const getPriorityCardClass = (priority: string): string => {
  switch (priority) {
    case "high":
      return "border-warning";
    case "urgent":
      return "border-danger bg-light-danger";
    default:
      return "border-secondary";
  }
};

const getBadgeClass = (type: string): string => {
  switch (type) {
    case "enhancement":
      return "bg-primary";
    case "correction":
      return "bg-danger";
    case "analysis":
      return "bg-info";
    default:
      return "bg-secondary";
  }
};

const getPriorityLabel = (priority: string): string => {
  switch (priority) {
    case "high":
      return "High Priority";
    case "urgent":
      return "Urgent";
    case "low":
      return "Low Priority";
    default:
      return "Normal";
  }
};

const getActionText = (suggestion: any): string => {
  switch (suggestion.type) {
    case "enhancement":
      return "Apply";
    case "correction":
      return "Fix";
    case "analysis":
      return "Analyze";
    default:
      return "Action";
  }
};

const getActionButtonClass = (suggestion: any): string => {
  switch (suggestion.priority) {
    case "urgent":
      return "btn-danger";
    case "high":
      return "btn-warning";
    default:
      return "btn-primary";
  }
};

const getScoreClass = (score: number): string => {
  if (score >= 90) return "score-excellent";
  if (score >= 80) return "score-good";
  if (score >= 70) return "score-average";
  return "score-poor";
};

const getScoreDescription = (score: number): string => {
  if (score >= 90) return "Excellent quality";
  if (score >= 80) return "Good quality with minor improvements";
  if (score >= 70)
    return "Average quality - significant improvements recommended";
  return "Needs substantial improvement";
};

const formatTime = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const scrollToBottom = (): void => {
  if (document.querySelector(".chat-messages")) {
    document.querySelector(".chat-messages")!.scrollTop =
      document.querySelector(".chat-messages")!.scrollHeight;
  }
};

// Lifecycle
onMounted(async () => {
  if (props.show) {
    await openModal();
  }

  // Watch for prop changes
  watch(
    () => props.show,
    async (newShow) => {
      if (newShow && !showHelperModal.value) {
        await openModal();
      } else if (!newShow && showHelperModal.value) {
        closeModal();
      }
    },
  );
});

// Handle escape key
const handleKeyDown = (event: KeyboardEvent): void => {
  if (event.key === "Escape" && showHelperModal.value) {
    closeModal();
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown);
  aiContext.stopContextPolling();
});
</script>

<style scoped>
.ai-modal-system {
  position: relative;
}

.suggestion-card.priority-high .card {
}

.suggestion-card.priority-urgent .card {
}

@keyframes pulseWarn {
  }
  }
}

.ai-floating-button {
  position: fixed;
  bottom: var(--spacing-xl);
  right: var(--spacing-xl);
  z-index: var(--z-popover);
}

  border-radius: var(--radius-full);
  box-shadow: var(--shadow-lg), var(--glass-shadow);
  transition: all var(--duration-smooth) var(--easing-bounce);
  position: relative;
  background: var(--gradient-primary);
  overflow: visible;
}

  box-shadow: var(--shadow-xl), var(--shadow-glow-primary);
}

  animation:
  box-shadow:
}

  color: white;
}

  pointer-events: none;
}

.particle {
  position: absolute;
  background: radial-gradient(
    circle,
  );
}

}
}
}
}
}
}

  }
  }
}

@keyframes gentleFloat {
  }
  }
}

@keyframes iconGlow {
    text-shadow:
  }
    text-shadow:
  }
}

@keyframes particleOrbit {
  }
  }
  }
}

.notification-badge {
  position: absolute;
  background: var(--color-danger);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

  background: linear-gradient(
  );
  box-shadow:
}

@keyframes badgeBounce {
  }
  }
}

.ai-tooltip {
  position: absolute;
  visibility: hidden;
  transition: all var(--duration-smooth) var(--easing-bounce);
}

.ai-floating-button:hover .ai-tooltip {
  visibility: visible;
}

}

  position: absolute;
}

  background: var(--glass-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md) var(--spacing-lg);
  box-shadow: var(--glass-shadow);
  font-size: var(--font-size-sm);
  position: relative;
  backdrop-filter: var(--glass-backdrop-blur);
}

  display: flex;
  align-items: center;
}

}

}

  color: var(--text-primary);
}

}

  display: flex;
  align-items: center;
}

}

}

  text-align: center;
}

@keyframes dialogueEntrance {
  }
  }
  }
}

@keyframes triforceGlow {
    text-shadow:
  }
    text-shadow:
  }
}

.score-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.score-number {
}

.score-label {
}

.score-description {
}

.score-excellent {
  background: linear-gradient(
    var(--color-success),
    var(--color-success-light)
  );
  color: white;
}

.score-good {
  background: linear-gradient(
  );
  color: white;
}

.score-average {
  background: linear-gradient(
  );
  color: white;
}

.score-poor {
  background: linear-gradient(
  );
  color: white;
}

.chat-messages {
  overflow-y: auto;
  border-radius: var(--radius-lg);
  background: var(--glass-surface);
  backdrop-filter: blur(var(--glass-backdrop-blur));
  -webkit-backdrop-filter: blur(var(--glass-backdrop-blur));
}

.chat-messages .message-text {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.chat-messages .message-content a {
  text-decoration: underline;
}
.chat-messages .message-content code {
  font-family: var(
    --font-mono,
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    "Liberation Mono",
    "Courier New",
    monospace
  );
  background: var(--surface-elevated);
}
.chat-messages .message-content pre {
  font-family: var(
    --font-mono,
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    "Liberation Mono",
    "Courier New",
    monospace
  );
  background: var(--surface-elevated);
  overflow: auto;
  white-space: pre;
}

.message-own {
  flex-direction: row-reverse;
}

.message-bubble {
  background: white;
}

.message-bubble-ai {
}

.message-bubble-own {
  background: var(--color-primary);
  color: white;
  margin-left: auto;
}

.message-content p {
}

.message-content small {
}

.message-avatar {
  background: var(--glass-bg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.typing-indicator {
  display: flex;
}

.typing-indicator span {
  background: var(--color-primary);
}

}
}
}

@keyframes typingDot {
  }
  }
}

  background: linear-gradient(
  );
  color: white;
  position: relative;
  overflow: hidden;
}

  content: "";
  position: absolute;
}

  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.title-decoration {
  display: flex;
  align-items: center;
}

}

  color: white;
}

.title-text {
}

.title-subtitle {
  font-style: italic;
}

  display: flex;
  align-items: center;
  justify-content: center;
}

}

  color: white;
}

@keyframes patternFlow {
  }
  }
}

@keyframes triforceHeaderGlow {
    text-shadow:
  }
    text-shadow:
  }
}

@keyframes brainPulse {
  }
    text-shadow:
  }
}

[data-theme="dark"] .ai-tooltip .tooltip-content {
  background: var(--glass-surface);
  border-color: var(--glass-border);
  color: var(--text-primary);
}

[data-theme="dark"] .message-bubble {
  background: var(--glass-surface);
  border-color: var(--glass-border);
}

[data-theme="dark"] .chat-messages {
  background: var(--glass-surface);
  border-color: var(--glass-border);
}

  background: linear-gradient(
  );
}

  color: var(--text-muted);
}

  background: linear-gradient(
  );
  box-shadow:
  overflow: hidden;
}

  background: transparent;
}

}

  border: none;
}

  border: none;
  background: transparent;
  color: var(--text-secondary);
  position: relative;
}

  background: linear-gradient(
  );
  color: white;
}

}

}

}

}

}

  background: linear-gradient(
  );
}

}

}

}

}

@keyframes spin {
  from {
  }
  to {
  }
}

.spin {
}

  .ai-floating-button {
  }

  .ai-floating-button .unified-btn {
  }

  .notification-badge {
  }

  .score-circle {
  }

  .score-number {
  }
}

  .modal-dialog {
  }

  .modal-content {
  }

  .modal-body {
    overflow-y: auto;
  }

  .chat-messages {
  }
}
</style>
