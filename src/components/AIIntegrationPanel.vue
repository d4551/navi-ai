<template>
  <div class="ai-integration-panel">
    <!-- AI Status Header -->
    <div class="ai-status-header">
      <div class="status-indicator">
        <div
          class="status-dot"
          :class="[`status-${aiStatus.statusIndicator.color}`]"
          :title="aiStatus.statusMessage"
        >
          <AppIcon :name="aiStatus.statusIndicator.icon" size="sm" />
        </div>
        <div class="status-info">
          <h3 class="status-title">AI Services</h3>
          <p class="status-text">{{ aiStatus.statusMessage }}</p>
        </div>
      </div>

      <div class="status-actions">
        <UnifiedButton
          variant="ghost"
          size="sm"
          icon="mdi-refresh"
          :loading="aiStatus.isConnecting"
          @click="aiStatus.checkHealth"
        >
          Check Status
        </UnifiedButton>

        <UnifiedButton
          v-if="!aiIntegration.isAIInitialized"
          variant="primary"
          size="sm"
          icon="mdi-power"
          :loading="aiIntegration.aiInitializing"
          @click="initializeAI"
        >
          Initialize AI
        </UnifiedButton>
      </div>
    </div>

    <!-- AI Capabilities Panel -->
    <div v-if="aiIntegration.isAIInitialized" class="ai-capabilities">
      <h4 class="capabilities-title">Available Capabilities</h4>
      <div class="capabilities-grid">
        <div
          v-for="(enabled, capability) in aiIntegration.aiCapabilities"
          :key="capability"
          class="capability-item"
          :class="{ 'capability-enabled': enabled }"
        >
          <AppIcon :name="getCapabilityIcon(capability)" />
          <span class="capability-name">{{
            formatCapabilityName(capability)
          }}</span>
          <span class="capability-status">
            <AppIcon
              :name="enabled ? 'mdi-check-circle' : 'mdi-close-circle'"
              size="sm"
            />
          </span>
        </div>
      </div>
    </div>

    <!-- AI Features Control Panel -->
    <div v-if="aiIntegration.isAIInitialized" class="ai-features">
      <h4 class="features-title">AI Features</h4>
      <div class="features-grid">
        <div
          v-for="(feature, featureName) in aiIntegration.aiFeatures"
          :key="featureName"
          class="feature-card"
          :class="{
            'feature-enabled': feature.enabled,
            'feature-active': feature.active,
          }"
        >
          <div class="feature-header">
            <AppIcon :name="getFeatureIcon(featureName)" />
            <span class="feature-name">{{
              formatFeatureName(featureName)
            }}</span>
          </div>

          <div class="feature-status">
            <span class="status-badge" :class="getFeatureStatusClass(feature)">
              {{ getFeatureStatusText(feature) }}
            </span>
          </div>

          <div class="feature-actions">
            <UnifiedButton
              v-if="feature.enabled && !feature.active"
              variant="outline"
              size="xs"
              @click="navigateToFeature(featureName)"
            >
              Open
            </UnifiedButton>

            <UnifiedButton
              v-if="feature.enabled"
              variant="ghost"
              size="xs"
              icon="mdi-test-tube"
              @click="testFeature(featureName)"
            >
              Test
            </UnifiedButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick AI Actions -->
    <div v-if="aiIntegration.isAIInitialized" class="quick-actions">
      <h4 class="actions-title">Quick Actions</h4>
      <div class="actions-grid">
        <UnifiedButton
          v-for="action in quickActions"
          :key="action.id"
          :variant="action.variant || 'outline'"
          :icon="action.icon"
          size="sm"
          :loading="processingAction === action.id"
          @click="executeQuickAction(action)"
        >
          {{ action.label }}
        </UnifiedButton>
      </div>
    </div>

    <!-- AI Configuration -->
    <div class="ai-configuration">
      <h4 class="config-title">Configuration</h4>

      <div class="config-item">
        <label class="config-label">Primary Provider</label>
        <div class="config-value">
          {{ aiStatus.providerStatus || "Not set" }}
          <UnifiedButton
            variant="ghost"
            size="xs"
            icon="mdi-cog"
            @click="openSettings"
          >
            Configure
          </UnifiedButton>
        </div>
      </div>

      <div class="config-item">
        <label class="config-label">Response Time</label>
        <div class="config-value">
          {{ aiStatus.responseTime ? `${aiStatus.responseTime}ms` : "Unknown" }}
        </div>
      </div>

      <div class="config-item">
        <label class="config-label">Health Score</label>
        <div class="config-value">
          <div class="health-score">
            <div class="health-bar">
              <div
                class="health-fill"
                :style="{ width: `${aiStatus.healthScore}%` }"
                :class="getHealthScoreClass(aiStatus.healthScore)"
              ></div>
            </div>
            <span class="health-text">{{ aiStatus.healthScore }}%</span>
          </div>
        </div>
      </div>

      <div class="config-item">
        <label class="config-label">Last Check</label>
        <div class="config-value">
          {{ aiStatus.lastCheck ? formatTime(aiStatus.lastCheck) : "Never" }}
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="aiStatus.lastError" class="error-display">
      <h4 class="error-title">
        <AppIcon name="mdi-alert-circle" />
        Current Error
      </h4>
      <div class="error-content">
        <code class="error-message">{{ aiStatus.lastError }}</code>
        <UnifiedButton
          variant="outline"
          size="sm"
          icon="mdi-help-circle"
          @click="showTroubleshooting = !showTroubleshooting"
        >
          {{ showTroubleshooting ? "Hide" : "Show" }} Help
        </UnifiedButton>
      </div>

      <div v-if="showTroubleshooting" class="troubleshooting">
        <h5>Troubleshooting Steps:</h5>
        <ul class="troubleshooting-list">
          <li
            v-for="step in getTroubleshootingSteps(aiStatus.lastError)"
            :key="step"
          >
            {{ step }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import { useAIIntegration } from "@/composables/aiIntegration.js";
import { useAIStatus } from "@/composables/useAIStatus";
import { useToast } from "@/composables/useToast";
import { logger } from "@/shared/utils/logger";

const router = useRouter();
const toast = useToast();
const aiIntegration = useAIIntegration();
const aiStatus = useAIStatus();

// State
const processingAction = ref(null);
const showTroubleshooting = ref(false);

// Quick actions configuration
const quickActions = [
  {
    id: "test_connection",
    label: "Test Connection",
    icon: "mdi-connection",
    variant: "outline",
  },
  {
    id: "generate_sample",
    label: "Generate Sample",
    icon: "mdi-auto-fix",
    variant: "primary",
  },
  {
    id: "analyze_text",
    label: "Analyze Text",
    icon: "mdi-text-search",
    variant: "outline",
  },
  {
    id: "open_fairy_chat",
    label: "Open Fairy Chat",
    icon: "mdi-robot",
    variant: "gaming",
  },
];

// Methods
async function initializeAI() {
  try {
    const success = await aiIntegration.initializeAI(true);
    if (success) {
      toast.success("AI services initialized successfully!");
    }
  } catch (error) {
    toast.error(`Failed to initialize AI: ${error.message}`);
  }
}

async function executeQuickAction(action) {
  try {
    processingAction.value = action.id;

    switch (action.id) {
      case "test_connection": {
        await aiStatus.checkHealth();
        toast.success("Connection test completed");
        break;
      }

      case "generate_sample": {
        const result = await aiIntegration.triggerAIAction(
          "generate_resume_content",
          {
            prompt: "Generate a brief sample text to test AI functionality",
          },
        );
        if (result) {
          toast.success("Sample content generated successfully");
          logger.info("Sample generation result:", result);
        }
        break;
      }

      case "analyze_text": {
        const analysis = await aiIntegration.triggerAIAction("analyze_resume", {
          text: "This is a sample text for analysis testing.",
        });
        if (analysis) {
          toast.success("Text analysis completed");
          logger.info("Analysis result:", analysis);
        }
        break;
      }

      case "open_fairy_chat": {
        // Trigger fairy chat opening
        window.dispatchEvent(new CustomEvent("open-fairy-chat"));
        break;
      }
    }
  } catch (error) {
    toast.error(`Action failed: ${error.message}`);
    logger.error(`Quick action ${action.id} failed:`, error);
  } finally {
    processingAction.value = null;
  }
}

function testFeature(featureName) {
  try {
    // Navigate to feature or trigger test
    const testActions = {
      resumeBuilder: () =>
        aiIntegration.triggerAIAction("generate_resume_content", {
          test: true,
        }),
      coverLetterBuilder: () =>
        aiIntegration.triggerAIAction("generate_cover_letter", { test: true }),
      jobSearch: () =>
        aiIntegration.triggerAIAction("search_jobs", { query: "test" }),
      skillsMapper: () =>
        aiIntegration.triggerAIAction("map_skills", {
          text: "JavaScript React Node.js",
        }),
      interviewPrep: () =>
        aiIntegration.triggerAIAction("conduct_interview", {
          role: "Developer",
        }),
      realtimeChat: () =>
        aiIntegration.triggerAIAction("realtime_chat", { message: "Hello" }),
    };

    const testAction = testActions[featureName];
    if (testAction) {
      testAction();
      toast.info(`Testing ${formatFeatureName(featureName)}...`);
    } else {
      toast.warning(`No test available for ${formatFeatureName(featureName)}`);
    }
  } catch (error) {
    toast.error(`Feature test failed: ${error.message}`);
  }
}

function navigateToFeature(featureName) {
  aiIntegration.navigateToAIFeature(featureName);
}

function openSettings() {
  router.push("/settings?tab=ai");
}


function getCapabilityIcon(capability) {
  const icons = {
    textGeneration: "mdi-text",
    imageAnalysis: "mdi-image-search",
    voiceInput: "mdi-microphone",
    realtimeChat: "mdi-chat",
    documentAnalysis: "mdi-file-document-outline",
  };
  return icons[capability] || "mdi-help-circle";
}

function formatCapabilityName(capability) {
  return capability
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
}

function getFeatureIcon(featureName) {
  const icons = {
    resumeBuilder: "mdi-file-document-edit",
    coverLetterBuilder: "mdi-email-edit",
    portfolio: "mdi-folder-multiple",
    portfolioGenerator: "mdi-folder-multiple",
    skillsMapper: "mdi-map-marker",
    jobSearch: "mdi-briefcase-search",
    interviewPrep: "mdi-account-voice",
    realtimeChat: "mdi-chat",
  };
  return icons[featureName] || "mdi-cog";
}

function formatFeatureName(featureName) {
  const names = {
    resumeBuilder: "Resume Builder",
    coverLetterBuilder: "Cover Letter Builder",
    portfolio: "Portfolio",
    portfolioGenerator: "Portfolio Generator",
    skillsMapper: "Skills Mapper",
    jobSearch: "Job Search",
    interviewPrep: "Interview Prep",
    realtimeChat: "Realtime Chat",
  };
  return (
    names[featureName] ||
    featureName
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
  );
}

function getFeatureStatusClass(feature) {
  if (!feature.enabled) return "status-disabled";
  if (feature.active) return "status-active";
  return "status-available";
}

function getFeatureStatusText(feature) {
  if (!feature.enabled) return "Disabled";
  if (feature.active) return "Active";
  return "Available";
}

function getHealthScoreClass(score) {
  if (score >= 80) return "health-excellent";
  if (score >= 60) return "health-good";
  if (score >= 40) return "health-fair";
  return "health-poor";
}

function formatTime(date) {
  try {
    return new Date(date).toLocaleTimeString();
  } catch {
    return "Invalid time";
  }
}

function getTroubleshootingSteps(error) {
  const errorLower = (error || "").toLowerCase();

  if (errorLower.includes("api key")) {
    return [
      "Check that your API key is correctly configured in Settings",
      "Verify the API key is valid and has not expired",
      "Ensure you have sufficient API quota/credits",
      "Try regenerating your API key from the provider",
    ];
  } else if (
    errorLower.includes("network") ||
    errorLower.includes("connection")
  ) {
    return [
      "Check your internet connection",
      "Verify firewall settings allow AI service access",
      "Try again in a few moments",
      "Check if the AI service provider is experiencing outages",
    ];
  } else if (errorLower.includes("quota") || errorLower.includes("limit")) {
    return [
      "You have reached your API usage limit",
      "Wait for your quota to reset (usually monthly)",
      "Consider upgrading your API plan",
      "Try using a different AI provider",
    ];
  } else {
    return [
      "Try refreshing the page",
      "Check your API key configuration",
      "Verify your internet connection",
      "Contact support if the problem persists",
    ];
  }
}

// Lifecycle
onMounted(() => {
  // Auto-check health on mount
  if (aiIntegration.isAIInitialized.value) {
    aiStatus.checkHealth();
  }
});
</script>

<style scoped>
.ai-integration-panel {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.ai-status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--glass-bg);
  border-radius: var(--radius-lg);
  backdrop-filter: var(--glass-backdrop-blur);
}

.status-indicator {
  display: flex;
  align-items: center;
}

.status-dot {
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-fast);
}

.status-dot.status-success {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.status-dot.status-warning {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.status-dot.status-error {
  background: var(--color-error-bg);
  color: var(--color-error);
}

.status-dot.status-secondary {
  background: var(--surface-muted);
  color: var(--text-muted);
}

.status-info {
}

.status-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.status-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.status-actions {
  display: flex;
}

.ai-capabilities {
  background: var(--surface-elevated);
  border-radius: var(--radius-lg);
}

.capabilities-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.capabilities-grid {
  display: grid;
}

.capability-item {
  display: flex;
  align-items: center;
  border-radius: var(--radius-md);
  background: var(--surface-base);
  transition: all var(--duration-fast);
}

.capability-item.capability-enabled {
  background: var(--color-success-bg);
  border-color: var(--color-success-border);
}

.capability-name {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.ai-features {
  background: var(--surface-elevated);
  border-radius: var(--radius-lg);
}

.features-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.features-grid {
  display: grid;
}

.feature-card {
  background: var(--glass-bg);
  border-radius: var(--radius-md);
  backdrop-filter: var(--glass-backdrop-blur);
  transition: all var(--duration-fast);
}

.feature-card.feature-active {
  background: var(--color-primary-bg);
  border-color: var(--color-primary-border);
}

.feature-header {
  display: flex;
  align-items: center;
}

.feature-name {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.feature-status {
}

.status-badge {
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.status-badge.status-disabled {
  background: var(--surface-muted);
  color: var(--text-muted);
}

.status-badge.status-available {
  background: var(--color-info-bg);
  color: var(--color-info);
}

.status-badge.status-active {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.feature-actions {
  display: flex;
}

.quick-actions {
  background: var(--surface-elevated);
  border-radius: var(--radius-lg);
}

.actions-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.actions-grid {
  display: grid;
}

.ai-configuration {
  background: var(--surface-elevated);
  border-radius: var(--radius-lg);
}

.config-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-item:last-child {
  border-bottom: none;
}

.config-label {
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.config-value {
  display: flex;
  align-items: center;
  color: var(--text-primary);
}

.health-score {
  display: flex;
  align-items: center;
}

.health-bar {
  background: var(--surface-muted);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.health-fill {
  transition: width var(--duration-normal);
  border-radius: inherit;
}

.health-fill.health-excellent {
  background: var(--color-success);
}

.health-fill.health-good {
  background: var(--color-info);
}

.health-fill.health-fair {
  background: var(--color-warning);
}

.health-fill.health-poor {
  background: var(--color-error);
}

.health-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.error-display {
  background: var(--color-error-bg);
  border-radius: var(--radius-lg);
}

.error-title {
  display: flex;
  align-items: center;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-error);
}

.error-content {
  display: flex;
  justify-content: space-between;
  align-items: start;
}

.error-message {
  background: var(--surface-base);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  color: var(--color-error);
  word-break: break-word;
}

.troubleshooting {
  background: var(--surface-elevated);
  border-radius: var(--radius-md);
}

  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.troubleshooting-list {
  color: var(--text-secondary);
}

.troubleshooting-list li {
}

@keyframes pulse {
  }
  }
}

  .ai-integration-panel {
  }

  .ai-status-header {
    flex-direction: column;
    align-items: stretch;
  }

  .status-actions {
    justify-content: center;
  }

  .capabilities-grid,
  .features-grid,
  .actions-grid {
  }

  .config-item {
    flex-direction: column;
    align-items: stretch;
  }

  .error-content {
    flex-direction: column;
  }
}
</style>
