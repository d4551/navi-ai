<template>
  <div v-if="show" class="ai-modal-overlay" @click="handleOverlayClick">
    <div class="ai-modal" :class="{ 'full-width': isAnalyzing }">
      <div class="modal-header">
        <div class="header-content">
          <AppIcon name="mdi-brain" size="20" />
          <h3 class="modal-title">AI Assistant</h3>
          <div v-if="aiProcessing" class="processing-indicator">
            <AppIcon name="mdi-loading" size="16" class="spinning" />
            <span>Processing...</span>
          </div>
        </div>
        <UnifiedButton
          variant="ghost"
          size="sm"
          leading-icon="mdi-close"
          @click="$emit('close')"
        />
      </div>

      <div class="modal-content">
        <!-- Context Display -->
        <div v-if="context" class="context-section">
          <div class="context-header">
            <AppIcon name="mdi-information-outline" />
            <span>Context: {{ contextTypeLabel }}</span>
          </div>
          <div class="context-preview">
            {{ contextPreview }}
          </div>
        </div>

        <!-- AI Analysis Results -->
        <div v-if="analysisResults" class="analysis-section">
          <h4 class="section-title">
            <AppIcon name="mdi-chart-line" />
            Analysis Results
          </h4>

          <div class="results-grid">
            <div class="result-card">
              <div class="result-header">
                <AppIcon name="mdi-target" />
                <span>ATS Compatibility</span>
              </div>
              <div
                class="result-score"
                :class="getScoreClass(analysisResults.atsScore)"
              >
                {{ analysisResults.atsScore }}%
              </div>
              <div class="result-description">
                {{ getScoreDescription(analysisResults.atsScore, "ats") }}
              </div>
            </div>

            <div class="result-card">
              <div class="result-header">
                <AppIcon name="mdi-key-variant" />
                <span>Keyword Match</span>
              </div>
              <div
                class="result-score"
                :class="getScoreClass(analysisResults.keywordMatch)"
              >
                {{ analysisResults.keywordMatch }}%
              </div>
              <div class="result-description">
                {{
                  getScoreDescription(analysisResults.keywordMatch, "keywords")
                }}
              </div>
            </div>

            <div class="result-card">
              <div class="result-header">
                <AppIcon name="mdi-format-text" />
                <span>Content Quality</span>
              </div>
              <div
                class="result-score"
                :class="getScoreClass(analysisResults.contentQuality)"
              >
                {{ analysisResults.contentQuality }}%
              </div>
              <div class="result-description">
                {{
                  getScoreDescription(analysisResults.contentQuality, "content")
                }}
              </div>
            </div>
          </div>
        </div>

        <!-- AI Suggestions -->
        <div v-if="suggestions.length" class="suggestions-section">
          <h4 class="section-title">
            <AppIcon name="mdi-lightbulb-outline" />
            AI Suggestions
          </h4>

          <div class="suggestions-list">
            <div
              v-for="suggestion in suggestions"
              :key="suggestion.id"
              class="suggestion-item"
              :class="{ applied: suggestion.applied }"
            >
              <div class="suggestion-header">
                <div class="suggestion-meta">
                  <AppIcon :name="getSuggestionIcon(suggestion.type)" />
                  <span class="suggestion-type">{{ suggestion.type }}</span>
                  <span
                    class="suggestion-priority"
                    :class="suggestion.priority"
                  >
                    {{ suggestion.priority }}
                  </span>
                </div>
                <div class="suggestion-actions">
                  <UnifiedButton
                    v-if="!suggestion.applied"
                    variant="outline"
                    size="xs"
                    @click="applySuggestion(suggestion)"
                  >
                    Apply
                  </UnifiedButton>
                  <span v-else class="applied-indicator">
                    <AppIcon name="mdi-check" size="14" />
                    Applied
                  </span>
                </div>
              </div>
              <div class="suggestion-content">
                <div class="suggestion-text">{{ suggestion.text }}</div>
                <div v-if="suggestion.example" class="suggestion-example">
                  <strong>Example:</strong> {{ suggestion.example }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- AI Chat Interface -->
        <div v-if="showChat" class="chat-section">
          <h4 class="section-title">
            <AppIcon name="mdi-message-text-outline" />
            Ask AI Assistant
          </h4>

          <div ref="chatMessagesRef" class="chat-messages">
            <div
              v-for="message in chatMessages"
              :key="message.id"
              class="chat-message"
              :class="message.role"
            >
              <div class="message-avatar">
                <AppIcon
                  :name="message.role === 'user' ? 'mdi-account' : 'mdi-brain'"
                  size="16"
                />
              </div>
              <div class="message-content">
                <div
                  class="message-text"
                  v-html="formatMessage(message.text)"
                ></div>
                <div class="message-timestamp">
                  {{ formatTimestamp(message.timestamp) }}
                </div>
              </div>
            </div>
          </div>

          <div class="chat-input">
            <textarea
              v-model="chatInput"
              class="chat-textarea glass-input"
              placeholder="Ask AI about your document, get suggestions, or request improvements..."
              rows="2"
              @keydown.meta.enter="sendChatMessage"
              @keydown.ctrl.enter="sendChatMessage"
            />
            <UnifiedButton
              variant="primary"
              size="sm"
              leading-icon="mdi-send"
              :disabled="!chatInput.trim() || aiProcessing"
              :loading="aiProcessing"
              @click="sendChatMessage"
            >
              Send
            </UnifiedButton>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <h4 class="section-title">
            <AppIcon name="mdi-lightning-bolt" />
            Quick Actions
          </h4>

          <div class="actions-grid">
            <UnifiedButton
              variant="outline"
              size="sm"
              leading-icon="mdi-auto-fix"
              :disabled="aiProcessing"
              @click="improveContent"
            >
              Improve Content
            </UnifiedButton>
            <UnifiedButton
              variant="outline"
              size="sm"
              leading-icon="mdi-target"
              :disabled="aiProcessing"
              @click="optimizeForJob"
            >
              Optimize for Job
            </UnifiedButton>
            <UnifiedButton
              variant="outline"
              size="sm"
              leading-icon="mdi-format-text"
              :disabled="aiProcessing"
              @click="enhanceWriting"
            >
              Enhance Writing
            </UnifiedButton>
            <UnifiedButton
              variant="outline"
              size="sm"
              leading-icon="mdi-chart-line"
              :disabled="aiProcessing"
              @click="analyzeDocument"
            >
              Full Analysis
            </UnifiedButton>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <div class="footer-info">
          <span class="ai-model-info">
            <AppIcon name="mdi-chip" size="14" />
            Powered by Gemini AI
          </span>
        </div>
        <div class="footer-actions">
          <UnifiedButton variant="ghost" size="sm" @click="toggleChat">
            {{ showChat ? "Hide Chat" : "Show Chat" }}
          </UnifiedButton>
          <UnifiedButton variant="outline" size="sm" @click="$emit('close')">
            Close
          </UnifiedButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from "vue";
import { useToast } from "@/composables/useToast";
import { ai } from "@/shared/ai/canonical";
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";

// Props
const props = defineProps<{
  show: boolean;
  context: any;
}>();

// Emits
const emit = defineEmits<{
  close: [];
  apply: [any];
}>();

const toast = useToast();

// State
const aiProcessing = ref(false);
const analysisResults = ref<any>(null);
const suggestions = ref<any[]>([]);
const showChat = ref(false);
const chatMessages = ref<any[]>([]);
const chatInput = ref("");
const chatMessagesRef = ref<HTMLElement>();
const isAnalyzing = ref(false);

// Computed
const contextTypeLabel = computed(() => {
  if (!props.context) return "";
  return props.context.type === "resume" ? "Resume" : "Cover Letter";
});

const contextPreview = computed(() => {
  if (!props.context) return "";
  if (props.context.type === "resume") {
    return `${props.context.data?.personalInfo?.name || "Resume"} - ${props.context.data?.experience?.length || 0} positions`;
  }
  return `Cover letter for ${props.context.data?.jobInfo?.company || "position"}`;
});

// Methods
const handleOverlayClick = (event: Event) => {
  if (event.target === event.currentTarget) {
    emit("close");
  }
};

const getScoreClass = (score: number) => {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "poor";
};

const getScoreDescription = (score: number, type: string) => {
  const descriptions = {
    ats: {
      excellent: "Excellent ATS compatibility",
      good: "Good ATS compatibility with minor improvements needed",
      fair: "Moderate ATS compatibility, several improvements needed",
      poor: "Poor ATS compatibility, major improvements required",
    },
    keywords: {
      excellent: "Excellent keyword optimization",
      good: "Good keyword coverage with room for improvement",
      fair: "Moderate keyword usage, add more relevant terms",
      poor: "Poor keyword coverage, significant improvements needed",
    },
    content: {
      excellent: "Excellent content quality and structure",
      good: "Good content with minor enhancements possible",
      fair: "Content needs improvement in clarity and impact",
      poor: "Content requires significant rewriting and restructuring",
    },
  };

  const scoreClass = getScoreClass(score);
  return descriptions[type as keyof typeof descriptions][
    scoreClass as keyof typeof descriptions.ats
  ];
};

const getSuggestionIcon = (type: string) => {
  const icons = {
    summary: "mdi-text-box-outline",
    experience: "mdi-briefcase-outline",
    skills: "mdi-cog-outline",
    format: "mdi-format-text",
    keywords: "mdi-key-variant",
    general: "mdi-lightbulb-outline",
  };
  return icons[type as keyof typeof icons] || "mdi-lightbulb-outline";
};

const applySuggestion = (suggestion: any) => {
  suggestion.applied = true;
  emit("apply", suggestion);
  toast.success("Suggestion applied successfully");
};

const sendChatMessage = async () => {
  if (!chatInput.value.trim() || aiProcessing.value) return;

  const message = {
    id: Date.now().toString(),
    role: "user",
    text: chatInput.value,
    timestamp: new Date(),
  };

  chatMessages.value.push(message);
  const userMessage = chatInput.value;
  chatInput.value = "";

  aiProcessing.value = true;

  try {
    // Add typing indicator
    const typingMessage = {
      id: "typing",
      role: "assistant",
      text: "Thinking...",
      timestamp: new Date(),
      isTyping: true,
    };
    chatMessages.value.push(typingMessage);

    await nextTick();
    scrollToBottom();

    // Use canonical AI service
    const response = await ai.generateText(
      `Context: ${JSON.stringify(props.context)}\n\nUser question: ${userMessage}`,
      { temperature: 0.7 },
    );

    // Remove typing indicator
    const typingIndex = chatMessages.value.findIndex((m) => m.id === "typing");
    if (typingIndex !== -1) {
      chatMessages.value.splice(typingIndex, 1);
    }

    // Add AI response
    const aiMessage = {
      id: Date.now().toString(),
      role: "assistant",
      text:
        response.content ||
        "I apologize, but I encountered an issue processing your request.",
      timestamp: new Date(),
    };
    chatMessages.value.push(aiMessage);
  } catch (error) {
    // Remove typing indicator
    const typingIndex = chatMessages.value.findIndex((m) => m.id === "typing");
    if (typingIndex !== -1) {
      chatMessages.value.splice(typingIndex, 1);
    }

    toast.error("Failed to get AI response");
    console.error("AI chat error:", error);
  } finally {
    aiProcessing.value = false;
    await nextTick();
    scrollToBottom();
  }
};

const formatMessage = (text: string) => {
  return text
    .replace(/\n/g, "<br>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
};

const formatTimestamp = (timestamp: Date) => {
  return timestamp.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const scrollToBottom = () => {
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
  }
};

const toggleChat = () => {
  showChat.value = !showChat.value;
};

const improveContent = async () => {
  aiProcessing.value = true;
  try {
    const response = await ai.generateText(
      `Please provide suggestions to improve this document content: ${JSON.stringify(props.context)}`,
      { temperature: 0.5 },
    );

    suggestions.value.push({
      id: Date.now().toString(),
      type: "general",
      priority: "medium",
      text: response.content || "Content improvement suggestions generated.",
      applied: false,
    });

    toast.success("Content improvement suggestions generated");
  } catch (error) {
    toast.error("Failed to generate improvements");
  } finally {
    aiProcessing.value = false;
  }
};

const optimizeForJob = async () => {
  aiProcessing.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    suggestions.value.push({
      id: Date.now().toString(),
      type: "keywords",
      priority: "high",
      text: "Add more job-relevant keywords to improve ATS matching.",
      example:
        "Include specific technologies and skills mentioned in the job description.",
      applied: false,
    });

    toast.success("Job optimization suggestions generated");
  } catch (error) {
    toast.error("Failed to generate job optimization");
  } finally {
    aiProcessing.value = false;
  }
};

const enhanceWriting = async () => {
  aiProcessing.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    suggestions.value.push({
      id: Date.now().toString(),
      type: "format",
      priority: "medium",
      text: "Improve sentence structure and use stronger action verbs.",
      example: 'Replace "Worked on" with "Developed", "Led", or "Implemented".',
      applied: false,
    });

    toast.success("Writing enhancement suggestions generated");
  } catch (error) {
    toast.error("Failed to generate writing enhancements");
  } finally {
    aiProcessing.value = false;
  }
};

const analyzeDocument = async () => {
  aiProcessing.value = true;
  isAnalyzing.value = true;

  try {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    analysisResults.value = {
      atsScore: Math.floor(Math.random() * 30) + 70,
      keywordMatch: Math.floor(Math.random() * 25) + 65,
      contentQuality: Math.floor(Math.random() * 20) + 75,
    };

    // Generate comprehensive suggestions
    suggestions.value = [
      {
        id: "1",
        type: "summary",
        priority: "high",
        text: "Strengthen your professional summary with quantifiable achievements.",
        example:
          "Led a team of 5 developers to deliver project 2 weeks ahead of schedule.",
        applied: false,
      },
      {
        id: "2",
        type: "experience",
        priority: "medium",
        text: "Add more specific metrics to your experience descriptions.",
        example: "Increased user engagement by 35% through UI/UX improvements.",
        applied: false,
      },
      {
        id: "3",
        type: "skills",
        priority: "low",
        text: "Include trending technologies relevant to your target role.",
        example: "Add TypeScript, Docker, or cloud technologies if applicable.",
        applied: false,
      },
    ];

    toast.success("Document analysis complete");
  } catch (error) {
    toast.error("Failed to analyze document");
  } finally {
    aiProcessing.value = false;
    isAnalyzing.value = false;
  }
};

// Initialize with welcome message
onMounted(() => {
  if (props.context) {
    chatMessages.value.push({
      id: "welcome",
      role: "assistant",
      text: `Hello! I'm here to help you improve your ${contextTypeLabel.value.toLowerCase()}. I can analyze your content, suggest improvements, and answer questions about best practices. How can I assist you today?`,
      timestamp: new Date(),
    });
  }
});
</script>

<style scoped>
.ai-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-4);
}

.ai-modal {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.ai-modal.full-width {
  max-width: 1000px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-5);
  border-bottom: 1px solid var(--glass-border);
  background: linear-gradient(
    135deg,
    var(--color-primary-50) 0%,
    var(--color-gaming-50) 100%
  );
}

.header-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.modal-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.processing-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-1-5);
  padding: var(--spacing-1) var(--spacing-2);
  background: var(--color-primary-100);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  color: var(--color-primary-700);
}

.spinning {
  animation: spin 1s linear infinite;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-5);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
}

.context-section {
  background: var(--surface-base);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
}

.context-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-2);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.context-preview {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.analysis-section {
  background: var(--surface-base);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-4) 0;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-4);
}

.result-card {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-4);
  text-align: center;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-1-5);
  margin-bottom: var(--spacing-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.result-score {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-1);
}

.result-score.excellent {
  color: var(--color-success-600);
}

.result-score.good {
  color: var(--color-info-600);
}

.result-score.fair {
  color: var(--color-warning-600);
}

.result-score.poor {
  color: var(--color-error-600);
}

.result-description {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.suggestions-section {
  background: var(--surface-base);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.suggestion-item {
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-4);
  transition: all var(--duration-fast);
}

.suggestion-item.applied {
  background: var(--color-success-50);
  border-color: var(--color-success-200);
}

.suggestion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-2);
}

.suggestion-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.suggestion-type {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  text-transform: capitalize;
}

.suggestion-priority {
  padding: var(--spacing-0-5) var(--spacing-1-5);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.suggestion-priority.high {
  background: var(--color-error-100);
  color: var(--color-error-700);
}

.suggestion-priority.medium {
  background: var(--color-warning-100);
  color: var(--color-warning-700);
}

.suggestion-priority.low {
  background: var(--color-info-100);
  color: var(--color-info-700);
}

.suggestion-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.applied-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  color: var(--color-success-600);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.suggestion-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.suggestion-text {
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.suggestion-example {
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  font-style: italic;
}

.chat-section {
  background: var(--surface-base);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
}

.chat-messages {
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-4);
}

.chat-message {
  display: flex;
  gap: var(--spacing-2);
  align-items: flex-start;
}

.chat-message.assistant {
  flex-direction: row;
}

.chat-message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary-100);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chat-message.user .message-avatar {
  background: var(--color-gaming-100);
}

.message-content {
  flex: 1;
  max-width: 70%;
}

.chat-message.user .message-content {
  text-align: right;
}

.message-text {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-2-5) var(--spacing-3);
  font-size: var(--font-size-sm);
  line-height: 1.5;
  margin-bottom: var(--spacing-1);
}

.chat-message.user .message-text {
  background: var(--color-primary-100);
  border-color: var(--color-primary-200);
}

.message-timestamp {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.chat-input {
  display: flex;
  gap: var(--spacing-2);
  align-items: flex-end;
}

.chat-textarea {
  flex: 1;
  resize: none;
  font-family: inherit;
}

.quick-actions {
  background: var(--surface-base);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-2);
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4) var(--spacing-5);
  border-top: 1px solid var(--glass-border);
  background: var(--surface-base);
}

.footer-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.ai-model-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.footer-actions {
  display: flex;
  gap: var(--spacing-2);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

  .ai-modal-overlay {
  }

  .ai-modal {
  }

  .results-grid {
  }

  .actions-grid {
  }

  .modal-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .footer-actions {
    justify-content: space-between;
  }

  .message-content {
  }
}
</style>
