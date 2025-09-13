<template>
  <div class="model-selector">
    <!-- Model Category Tabs -->
    <div class="model-categories mb-4">
      <nav class="nav nav-pills nav-fill" role="tablist">
        <button
          v-for="category in categories"
          :key="category.key"
          class="nav-link"
          :class="{ active: activeCategory === category.key }"
          @click="activeCategory = category.key"
        >
          <AppIcon :name="category.icon" class="me-2" />
          {{ category.label }}
          <span
            v-if="category.count > 0"
            class="badge badge-compact bg-primary ms-2"
          >{{ category.count }}</span>
        </button>
      </nav>
    </div>
    <!-- Real-Time Chat Filter -->
    <div class="filter-section mb-3">
      <div class="form-check form-switch">
        <input
          id="realTimeChatFilter"
          v-model="showOnlyRealTimeChat"
          class="form-check-input"
          type="checkbox"
        />
        <label class="form-check-label" for="realTimeChatFilter">
          <AppIcon name="mdi-chat-processing" class="text-success me-1" />
          Show only Real-Time Chat capable models
        </label>
      </div>
    </div>
    <!-- Model List -->
    <div v-if="models.length" class="models-grid">
      <div
        v-for="model in filteredModels"
        :key="model.id"
        class="model-card"
        :class="{
          selected: selectedModel === model.id,
          recommended: model.isRecommended,
          experimental: model.isExperimental,
        }"
        @click="selectModel(model)"
      >
        <!-- Model Header -->
        <div class="model-header">
          <div class="model-title">
            <h6 class="mb-1">{{ model.displayName }}</h6>
            <div class="model-badges">
              <span
                v-if="model.isRecommended"
                class="badge badge-compact bg-success"
              >Recommended</span>
              <span
                v-if="model.isDefault"
                class="badge badge-compact bg-primary"
              >Default</span>
              <span
                v-if="model.isExperimental"
                class="badge badge-compact bg-warning"
              >Experimental</span>
              <span
                v-if="model.supportsRealTimeChat"
                class="badge badge-compact bg-info"
              >
                <AppIcon name="mdi-chat-processing" class="me-1" />Real-Time
                Chat
              </span>
            </div>
          </div>
          <div v-if="model.capabilities?.score" class="model-score">
            <div
              class="score-circle"
              :class="getScoreClass(model.capabilities.score)"
            >
              {{ model.capabilities.score }}
            </div>
          </div>
        </div>

        <!-- Model Info -->
        <p class="model-description text-muted small mb-2">
          {{ model.description }}
        </p>

        <!-- Capabilities Grid -->
        <div class="capabilities-grid mb-3">
          <div class="capability" :class="{ active: model.supportsStreaming }">
            <AppIcon name="mdi-flash" />
            <span>Streaming</span>
          </div>
          <div
            class="capability"
            :class="{ active: model.supportsRealTimeChat }"
          >
            <AppIcon name="mdi-chat-processing" />
            <span>Real-Time</span>
          </div>
          <div class="capability" :class="{ active: model.isMultimodal }">
            <AppIcon name="mdi-image-multiple" />
            <span>Multimodal</span>
          </div>
          <div
            class="capability"
            :class="{ active: model.capabilities?.codeGeneration }"
          >
            <AppIcon name="mdi-code-tags" />
            <span>Coding</span>
          </div>
          <div
            class="capability"
            :class="{ active: model.capabilities?.reasoning }"
          >
            <AppIcon name="mdi-brain" />
            <span>Reasoning</span>
          </div>
          <div
            class="capability"
            :class="{ active: model.capabilities?.complexAnalysis }"
          >
            <AppIcon name="mdi-chart-tree" />
            <span>Analysis</span>
          </div>
        </div>

        <!-- Performance Metrics -->
        <div class="performance-metrics">
          <div class="metric">
            <span class="metric-label">Speed:</span>
            <span class="metric-value" :class="getSpeedClass(model.speed)">
              {{ formatSpeed(model.speed) }}
            </span>
          </div>
          <div class="metric">
            <span class="metric-label">Quality:</span>
            <span class="metric-value" :class="getQualityClass(model.quality)">
              {{ formatQuality(model.quality) }}
            </span>
          </div>
          <div class="metric">
            <span class="metric-label">Context:</span>
            <span class="metric-value">{{
              formatTokens(model.contextLength)
            }}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Pricing:</span>
            <span class="metric-value" :class="getPricingClass(model.pricing)">
              {{ formatPricing(model.pricing) }}
            </span>
          </div>
        </div>

        <!-- Rate Limits -->
        <div class="rate-limits small text-muted mt-2">
          <span>{{ model.limits?.requestsPerMinute || "N/A" }} RPM</span>
          <span class="mx-2">•</span>
          <span>{{ model.limits?.requestsPerDay || "N/A" }} RPD</span>
        </div>
      </div>
    </div>
    <div v-else class="alert alert-warning small" role="status">
      No models loaded yet. Load models from Settings to populate this list.
    </div>

    <!-- Real-Time Chat Information Panel -->
    <div
      v-if="showOnlyRealTimeChat || activeCategory === 'realTimeChat'"
      class="info-panel mt-4"
    >
      <div class="alert alert-info">
        <h6>
          <AppIcon name="mdi-information" class="me-2" />Real-Time Chat
          Capabilities
        </h6>
        <p class="mb-2">Models with real-time chat support can:</p>
        <ul class="mb-0">
          <li><strong>Stream responses</strong> as they're generated</li>
          <li><strong>Handle conversational context</strong> efficiently</li>
          <li><strong>Support interruption</strong> and continuation</li>
          <li>
            <strong>Provide low-latency responses</strong> for interactive
            experiences
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineEmits, defineProps } from "vue";
import { useToast } from "@/composables/useToast";
import { useAppStore } from "@/stores/app";
import AppIcon from "@/components/ui/AppIcon.vue";

const _props = defineProps({
  selectedModel: {
    type: String,
    default: "gemini-2.5-flash",
  },
});

const emit = defineEmits(["model-selected", "models-loaded"]);

const _toast = useToast();
const activeCategory = ref("recommended");
const showOnlyRealTimeChat = ref(false);
const store = useAppStore();
// Always derive models from global store (single source of truth)
const models = computed(() =>
  Array.isArray(store.availableModels) ? store.availableModels : [],
);
const _loading = ref(false); // retained for potential future use

// Categories for organization
const categories = computed(() => {
  const modelsByCategory = getModelsByCategory();
  return [
    {
      key: "recommended",
      label: "Recommended",
      icon: "mdi-star",
      count: modelsByCategory.recommended?.length || 0,
    },
    {
      key: "realTimeChat",
      label: "Real-Time Chat",
      icon: "mdi-chat-processing",
      count: modelsByCategory.realTimeChat?.length || 0,
    },
    {
      key: "fast",
      label: "Fast",
      icon: "mdi-lightning-bolt",
      count: modelsByCategory.fast?.length || 0,
    },
    {
      key: "advanced",
      label: "Advanced",
      icon: "mdi-brain",
      count: modelsByCategory.advanced?.length || 0,
    },
    {
      key: "experimental",
      label: "Experimental",
      icon: "mdi-test-tube",
      count: modelsByCategory.experimental?.length || 0,
    },
  ];
});

// Get models organized by category
const getModelsByCategory = () => {
  if (!models.value.length) return {};

  return {
    recommended: models.value.filter((m) => m.isRecommended),
    realTimeChat: models.value.filter((m) => m.supportsRealTimeChat),
    fast: models.value.filter((m) => m.category === "fast"),
    advanced: models.value.filter((m) => m.category === "advanced"),
    efficient: models.value.filter((m) => m.category === "efficient"),
    stable: models.value.filter((m) => m.category === "stable"),
    experimental: models.value.filter((m) => m.category === "experimental"),
    multimodal: models.value.filter((m) => m.isMultimodal),
    legacy: models.value.filter((m) => m.category === "legacy"),
  };
};

// Filtered models based on current category and filters
const filteredModels = computed(() => {
  let filtered = models.value;

  // Filter by category
  if (activeCategory.value !== "all") {
    const categoryModels = getModelsByCategory()[activeCategory.value] || [];
    filtered = categoryModels;
  }

  // Filter by real-time chat capability
  if (showOnlyRealTimeChat.value) {
    filtered = filtered.filter((m) => m.supportsRealTimeChat);
  }

  return filtered;
});

// No internal fetching: parent/settings should populate store.availableModels
// Emit once if models already present (for backwards compatibility)
if (models.value.length) emit("models-loaded", models.value);

// Select a model
const selectModel = (model) => {
  emit("model-selected", model.id, model);
};

// Utility methods for display
const getScoreClass = (score) => {
  if (score >= 95) return "score-excellent";
  if (score >= 85) return "score-good";
  if (score >= 70) return "score-fair";
  return "score-basic";
};

const getSpeedClass = (speed) => {
  if (speed === "extremely-fast") return "text-success";
  if (speed === "very-fast") return "text-info";
  if (speed === "fast") return "text-primary";
  return "text-muted";
};

const getQualityClass = (quality) => {
  if (quality === "very-high") return "text-success";
  if (quality === "high") return "text-info";
  if (quality === "good") return "text-primary";
  return "text-muted";
};

const getPricingClass = (pricing) => {
  if (pricing === "free-preview") return "text-success";
  if (pricing === "very-low") return "text-info";
  if (pricing === "low") return "text-primary";
  if (pricing === "medium") return "text-warning";
  return "text-danger";
};

const formatSpeed = (speed) => {
  const speedMap = {
    "extremely-fast": "Extremely Fast",
    "very-fast": "Very Fast",
    fast: "Fast",
    medium: "Medium",
    variable: "Variable",
  };
  return speedMap[speed] || speed;
};

const formatQuality = (quality) => {
  const qualityMap = {
    "very-high": "Very High",
    high: "High",
    good: "Good",
    fair: "Fair",
    experimental: "Experimental",
  };
  return qualityMap[quality] || quality;
};

const formatPricing = (pricing) => {
  const pricingMap = {
    "free-preview": "Free Preview",
    "very-low": "Very Low",
    low: "Low",
    medium: "Medium",
    high: "High",
  };
  return pricingMap[pricing] || pricing;
};

const formatTokens = (tokens) => {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }
  if (tokens >= 1000) {
    return `${Math.floor(tokens / 1000)}K`;
  }
  return tokens?.toString() || "N/A";
};

// If empty, component shows guidance message; optionally could trigger cache load here
</script>

<style scoped>
.model-selector {
  max-width: 100%;
}

.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1rem;
}

.model-card {
  background: var(--glass-surface);
  border: 2px solid var(--glass-border);
  border-radius: var(--border-radius-lg);
  padding: 1rem;
  transition: all var(--transition-smooth);
  cursor: pointer;
  position: relative;
}

.model-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--glass-shadow);
  transform: translateY(-2px);
}

.model-card.selected {
  border-color: var(--color-primary);
  background: var(--primary-gradient-bg);
}

.model-card.recommended {
  border-color: var(--color-success);
}

.model-card.experimental {
  border-color: var(--color-warning);
}

.model-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.model-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.25rem;
}

.badge {
}

.score-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
}

.score-excellent {
  background: var(--color-success);
}
.score-good {
  background: var(--color-info);
}
.score-fair {
  background: var(--color-warning);
}
.score-basic {
  background: var(--color-secondary);
}

.capabilities-grid {
  display: grid;
}

.capability {
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: var(--border-radius-sm);
  background: var(--glass-elevated);
  transition: all var(--transition-fast);
}

.capability.active {
  background: var(--primary-gradient-bg);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.capability i {
}

.performance-metrics {
  display: grid;
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-label {
  color: var(--text-secondary);
}

.metric-value {
}

.rate-limits {
  text-align: center;
}

.info-panel .alert {
  background: var(--info-gradient-bg);
  color: var(--text-primary);
}

  .models-grid {
  }

  .capabilities-grid {
  }

  .model-categories .nav {
    flex-direction: column;
  }

  .nav-link {
  }
}

[data-theme="dark"] .model-card {
  background: var(--glass-surface-dark);
  border-color: var(--glass-border-dark);
}

[data-theme="dark"] .model-card.selected {
  background: var(--primary-gradient-bg-dark);
}

[data-theme="dark"] .capability {
  background: var(--glass-elevated-dark);
  border-color: var(--glass-border-dark);
}

[data-theme="dark"] .capability.active {
  background: var(--primary-gradient-bg-dark);
  border-color: var(--color-primary-dark);
  color: var(--color-primary-dark);
}
</style>
