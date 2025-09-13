<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="card h-100" role="complementary" aria-labelledby="tips-title">
    <div class="card-header section-header card-header--dense">
      <h6 id="tips-title" class="mb-0">
        <LightbulbIconComponent class="me-2 icon-sm" />Tips & Recommendations
      </h6>
    </div>
    <div class="card-body section-body card-body--dense">
      <!-- Current Tip -->
      <div v-if="currentTip" class="current-tip mb-4">
        <div class="tip-header d-flex align-items-start">
          <div class="tip-icon me-3">
            <component :is="currentTip.icon" />
          </div>
          <div class="tip-content flex-grow-1">
            <h6 class="tip-title mb-2">{{ currentTip.title }}</h6>
            <p class="tip-description mb-0">{{ currentTip.description }}</p>
          </div>
        </div>

        <div v-if="currentTip.action" class="tip-action mt-3">
          <UnifiedButton
            type="button"
            variant="primary"
            size="sm"
            class="w-100"
            @click="$emit('tip-action', currentTip.action)"
          >
            {{ currentTip.action.label }}
          </UnifiedButton>
        </div>
      </div>

      <!-- Tip Navigation -->
      <div
        class="tip-navigation d-flex justify-content-between align-items-center mb-4"
      >
        <IconButton
          type="button"
          :disabled="currentTipIndex === 0"
          aria-label="Previous tip"
          icon="mdi-chevron-left"
          variant="outline"
          size="sm"
          @click="previousTip"
        />

        <div class="tip-indicators">
          <span
            v-for="(tip, index) in tips"
            :key="index"
            class="tip-indicator"
            :class="{ active: index === currentTipIndex }"
            role="button"
            tabindex="0"
            :aria-label="`Go to tip ${index + 1}`"
            @click="setCurrentTip(index)"
          ></span>
        </div>

        <IconButton
          type="button"
          :disabled="currentTipIndex === tips.length - 1"
          aria-label="Next tip"
          icon="mdi-chevron-right"
          variant="outline"
          size="sm"
          @click="nextTip"
        />
      </div>

      <!-- Quick Tips List -->
      <div class="quick-tips">
        <h6 class="section-title mb-3">Quick Tips</h6>
        <div class="tips-list">
          <div
            v-for="(tip, index) in quickTips"
            :key="index"
            class="quick-tip-item"
            @click="setCurrentTip(tips.findIndex((t) => t.id === tip.id))"
          >
            <div class="quick-tip-icon">
              <component :is="tip.icon" />
            </div>
            <div class="quick-tip-content">
              <div class="quick-tip-title">{{ tip.title }}</div>
              <div class="quick-tip-description">{{ tip.description }}</div>
            </div>
            <ChevronRightIconComponent class="quick-tip-arrow" />
          </div>
        </div>
      </div>

      <!-- Recommendations -->
      <div class="recommendations mt-4 pt-3 border-top">
        <h6 class="section-title mb-3">Recommendations</h6>
        <div class="recommendations-list">
          <div
            v-for="(rec, index) in recommendations"
            :key="index"
            class="recommendation-item"
            :class="{ 'recommendation-item--completed': rec.completed }"
          >
            <div class="recommendation-icon">
              <CheckCircleIconComponent v-if="rec.completed" />
              <CircleIconComponent v-else />
            </div>
            <div class="recommendation-content">
              <div class="recommendation-title">{{ rec.title }}</div>
              <div class="recommendation-description">
                {{ rec.description }}
              </div>
            </div>
            <UnifiedButton
              v-if="!rec.completed"
              type="button"
              variant="outline"
              size="sm"
              class="recommendation-action"
              @click="$emit('complete-recommendation', rec.id)"
            >
              Complete
            </UnifiedButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

import {
  LightbulbIconComponent,
  ChevronLeftIconComponent,
  ChevronRightIconComponent,
  CheckCircleIconComponent,
  CircleIconComponent,
} from "./SettingsIcons.js";

export default {
  name: "TipsRecommendationsCard",
  components: {
    LightbulbIconComponent,
    ChevronLeftIconComponent,
    ChevronRightIconComponent,
    CheckCircleIconComponent,
    CircleIconComponent,
    UnifiedButton: () => import("@/components/ui/UnifiedButton.vue"),
    IconButton: () => import("@/components/ui/IconButton.vue"),
  },
  props: {
    tips: {
      type: Array,
      default: () => [],
    },
    recommendations: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["tip-action", "complete-recommendation"],
  data() {
    return {
      currentTipIndex: 0,
    };
  },
  computed: {
    currentTip() {
      return this.tips[this.currentTipIndex] || null;
    },
    quickTips() {

      return this.tips.slice(0, 3);
    },
  },
  methods: {
    previousTip() {
      if (this.currentTipIndex > 0) {
        this.currentTipIndex--;
      }
    },
    nextTip() {
      if (this.currentTipIndex < this.tips.length - 1) {
        this.currentTipIndex++;
      }
    },
    setCurrentTip(index) {
      if (index >= 0 && index < this.tips.length) {
        this.currentTipIndex = index;
      }
    },
  },
};
</script>

<style scoped>
.current-tip {
  padding: 1rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
}

.tip-header {
  margin-bottom: 0.5rem;
}

.tip-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-bg);
  border-radius: 12px;
  color: var(--primary-color);
}

.tip-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.tip-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.tip-navigation {
  padding: 0.5rem;
  background: var(--glass-bg);
  border-radius: 8px;
}

.tip-indicators {
  display: flex;
  gap: 0.5rem;
}

.tip-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tip-indicator.active {
  background: var(--primary-color);
  transform: scale(1.2);
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.quick-tip-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-tip-item:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.quick-tip-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--secondary-bg);
  border-radius: 8px;
  color: var(--secondary-color);
  margin-right: 0.75rem;
}

.quick-tip-content {
  flex: 1;
  min-width: 0;
}

.quick-tip-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.125rem;
}

.quick-tip-description {
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.quick-tip-arrow {
  flex-shrink: 0;
  color: var(--text-muted);
  margin-left: 0.5rem;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.recommendation-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.recommendation-item--completed {
  background: var(--success-bg);
  border-color: var(--success-border);
}

.recommendation-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
}

.recommendation-item--completed .recommendation-icon {
  color: var(--success-color);
}

.recommendation-content {
  flex: 1;
  min-width: 0;
}

.recommendation-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.125rem;
}

.recommendation-description {
  font-size: 0.75rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.recommendation-action {
  flex-shrink: 0;
  margin-left: 0.75rem;
}
</style>
