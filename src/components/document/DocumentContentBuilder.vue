<template>
  <div class="document-content-builder">
    <!-- Resume Builder -->
    <ResumeContentBuilder
      v-if="documentType === 'resume'"
      :document-data="resumeData"
      :current-step="currentStep"
      :ai-enabled="aiEnabled"
      @update-data="handleDataUpdate"
      @step-change="$emit('step-change', $event)"
      @ai-request="$emit('ai-request', $event)"
    />

    <!-- Cover Letter Builder -->
    <CoverLetterContentBuilder
      v-else-if="documentType === 'cover-letter'"
      :document-data="coverLetterData"
      :current-step="currentStep"
      :ai-enabled="aiEnabled"
      @update-data="handleDataUpdate"
      @step-change="$emit('step-change', $event)"
      @ai-request="$emit('ai-request', $event)"
    />

    <!-- Fallback for unsupported types -->
    <div v-else class="unsupported-type">
      <div class="error-message">
        <AppIcon name="mdi-alert-circle-outline" size="48" class="error-icon" />
        <h3>Unsupported Document Type</h3>
        <p>
          The document type "{{ documentType }}" is not currently supported.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { computed } from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import ResumeContentBuilder from "./ResumeContentBuilder.vue";
import CoverLetterContentBuilder from "./CoverLetterContentBuilder.vue";
import type {
  ResumeData,
  CoverLetterData,
} from "@/composables/useDocumentManager";

// Props
const _props = defineProps<{
  documentData: ResumeData | CoverLetterData;
  documentType: "resume" | "cover-letter";
  currentStep: number;
  aiEnabled: boolean;
}>();

// Emits
const _emit = defineEmits<{
  "update-data": [data: ResumeData | CoverLetterData];
  "step-change": [step: number];
  "ai-request": [payload: any];
}>();

// Computed properties for type-safe access
const resumeData = computed((): ResumeData => {
  return props.documentData as ResumeData;
});

const coverLetterData = computed((): CoverLetterData => {
  return props.documentData as CoverLetterData;
});

// Methods
const handleDataUpdate = (data: ResumeData | CoverLetterData) => {
  emit("update-data", data);
};
</script>

<style scoped>
.document-content-builder {
  width: 100%;
  height: 100%;
}

.unsupported-type {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: var(--spacing-4);
}

.error-message {
  text-align: center;
  color: var(--text-secondary);
}

.error-message h3 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-2);
}

.error-icon {
  color: var(--color-error-500);
  margin-bottom: var(--spacing-4);
}
</style>
