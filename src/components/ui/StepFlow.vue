<template>
  <div
    class="step-flow"
    :class="[orientationClass, compact ? 'is-compact' : '']"
  >
    <!-- Header / Stepper -->
    <div class="sf-header">
      <div
        class="sf-progress-track"
        role="progressbar"
        :aria-valuenow="progress"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div class="sf-progress-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <div class="sf-steps" :class="orientationClass">
        <button
          v-for="(s, idx) in steps"
          :key="s.key || idx"
          class="sf-step"
          :class="{
            active: currentIndex === idx,
            completed: idx < currentIndex,
            locked: idx > maxIndex,
          }"
          :disabled="idx > maxIndex"
          @click="goTo(idx)"
        >
          <span class="sf-step-circle">
            <AppIcon v-if="idx < currentIndex" name="mdi-check" size="14" />
            <span v-else>{{ idx + 1 }}</span>
          </span>
          <span class="sf-step-info">
            <span class="sf-step-title">{{ s.title }}</span>
            <span v-if="s.subtitle" class="sf-step-subtitle">{{
              s.subtitle
            }}</span>
          </span>
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="sf-content">
      <slot :step="activeStep" :index="currentIndex" />
    </div>

    <!-- Footer / Nav -->
    <div class="sf-footer">
      <div class="left">
        <slot name="left-actions" />
      </div>
      <div class="center">
        <div class="sf-step-text">
          Step {{ currentIndex + 1 }} of {{ steps.length }}
        </div>
      </div>
      <div class="right">
        <UnifiedButton
          variant="ghost"
          size="sm"
          leading-icon="mdi-arrow-left"
          :disabled="currentIndex === 0 || busy"
          @click="prev"
        >
          Previous
        </UnifiedButton>
        <UnifiedButton
          v-if="!isLast"
          :variant="primaryVariant"
          size="sm"
          trailing-icon="mdi-arrow-right"
          :disabled="!canContinue || busy"
          :loading="busy"
          @click="next"
        >
          Next
        </UnifiedButton>
        <UnifiedButton
          v-else
          variant="primary"
          size="sm"
          leading-icon="mdi-check-circle-outline"
          :disabled="!canFinish || busy"
          :loading="busy"
          @click="finish"
        >
          Finish
        </UnifiedButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, toRef } from "vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import AppIcon from "@/components/ui/AppIcon.vue";

export type StepFlowStep = {
  key?: string;
  title: string;
  subtitle?: string;
  canContinue?: () => boolean | Promise<boolean>;
};

interface Props {
  steps: StepFlowStep[];
  modelValue?: number;
  maxReachable?: number;
  compact?: boolean;
  busy?: boolean;
  orientation?: "horizontal" | "vertical";
  primaryVariant?: "primary" | "gaming" | "outline";
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  maxReachable: 0,
  compact: false,
  busy: false,
  orientation: "horizontal",
  primaryVariant: "primary",
});

const emit = defineEmits<{
  (e: "update:modelValue", v: number): void;
  (e: "finish"): void;
  (e: "next", idx: number): void;
  (e: "prev", idx: number): void;
}>();

const currentIndex = computed({
  get: () => props.modelValue,
  set: (v: number) => emit("update:modelValue", v),
});

const steps = toRef(props, "steps");
const maxIndex = computed(() =>
  Math.max(props.maxReachable, currentIndex.value),
);
const activeStep = computed(() => steps.value[currentIndex.value]);
const isLast = computed(() => currentIndex.value >= steps.value.length - 1);
const progress = computed(() =>
  Math.round((currentIndex.value / Math.max(1, steps.value.length - 1)) * 100),
);
const canContinue = computed(() =>
  activeStep.value?.canContinue ? !!activeStep.value.canContinue() : true,
);
const canFinish = computed(() =>
  activeStep.value?.canContinue ? !!activeStep.value.canContinue() : true,
);
const orientationClass = computed(() =>
  props.orientation === "vertical" ? "is-vertical" : "is-horizontal",
);

function goTo(idx: number) {
  currentIndex.value = idx;
}
async function next() {
  const ok = await resolveGuard();
  if (!ok) return;
  if (currentIndex.value < steps.value.length - 1) {
    currentIndex.value += 1;
    emit("next", currentIndex.value);
  }
}
function prev() {
  if (currentIndex.value > 0) {
    currentIndex.value -= 1;
    emit("prev", currentIndex.value);
  }
}
async function finish() {
  const ok = await resolveGuard();
  if (!ok) return;
  emit("finish");
}

async function resolveGuard(): Promise<boolean> {
  try {
    const fn = activeStep.value?.canContinue;
    if (!fn) return true;
    const r = fn();
    return r instanceof Promise ? await r : !!r;
  } catch {
    return false;
  }
}

watch(
  () => props.steps,
  () => {
    if (currentIndex.value > steps.value.length - 1)
      currentIndex.value = steps.value.length - 1;
  },
);
</script>

<style scoped>
.step-flow {
  display: grid;
  gap: var(--spacing-4);
}
.sf-header {
  display: grid;
  gap: var(--spacing-2);
}
.sf-progress-track {
  height: 6px;
  border-radius: 999px;
  background: var(--glass-border);
  overflow: hidden;
}
.sf-progress-fill {
  height: 100%;
  background: var(--gradient-primary);
  border-radius: inherit;
  transition: width 0.25s ease;
}
.sf-steps {
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}
.sf-steps.is-vertical {
  flex-direction: column;
}
.sf-step {
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  background: var(--surface-glass);
  color: var(--text-secondary);
  cursor: pointer;
}
.sf-step:hover {
  border-color: var(--color-primary-300);
}
.sf-step.active {
  background: var(--surface-elevated);
  color: var(--text-primary);
  border-color: var(--color-primary-300);
}
.sf-step.completed {
  opacity: 0.9;
}
.sf-step.locked {
  opacity: 0.55;
  cursor: not-allowed;
}
.sf-step-circle {
  width: 28px;
  height: 28px;
  display: inline-grid;
  place-items: center;
  border-radius: 999px;
  background: var(--surface-base);
  border: 1px solid var(--glass-border);
  font-weight: 700;
}
.sf-step-info {
  display: grid;
}
.sf-step-title {
  font-weight: 600;
  font-size: 0.95rem;
}
.sf-step-subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.sf-content {
  background: var(--surface-base);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-4);
}

.sf-footer {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--spacing-2);
}
.sf-footer .right {
  justify-self: end;
  display: inline-flex;
  gap: var(--spacing-2);
}
.sf-footer .left {
  justify-self: start;
}
.sf-step-text {
  color: var(--text-muted);
  font-size: 0.9rem;
}

@media (max-width: 640px) {
  .sf-step {
    padding: var(--spacing-1) var(--spacing-2);
  }
  .sf-step-title {
    font-size: 0.9rem;
  }
  .sf-step-subtitle {
    display: none;
  }
}
</style>
