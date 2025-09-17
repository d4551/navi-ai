<template>
  <div class="job-target-form font-sans">
    <div class="unified-card glass-card section-card">
      <div class="card-header section-header card-header--dense bg-gradient text-inverse">
        <h4 class="h5 mb-0">
          <AppIcon name="EyeIcon" size="default" />
          Target Position Information
        </h4>
      </div>
      <div class="card-body section-body card-body--dense">
        <div class="unified-grid g-3">
          <div class="flex-1-md-6">
            <label class="form-label small font-medium">Position Title</label>
            <input
              v-model="jobTarget.title"
              type="text"
              class="unified-input ui-input"
              placeholder="e.g. Unity Game Developer, Technical Artist"
              @input="$emit('update', jobTarget)"
            />
          </div>
          <div class="flex-1-md-6">
            <label class="form-label small font-medium">Company Name</label>
            <input
              v-model="jobTarget.company"
              type="text"
              class="unified-input ui-input"
              placeholder="e.g. Epic Games, Blizzard Entertainment"
              @input="$emit('update', jobTarget)"
            />
          </div>
          <div class="flex-1-12">
            <label class="form-label small font-medium">Job Description</label>
            <textarea
              v-model="jobTarget.description"
              class="unified-input ui-input"
              rows="6"
              placeholder="Paste the job description to enable AI-powered optimizations and keyword matching..."
              @input="$emit('update', jobTarget)"
            ></textarea>
            <small class="text-secondary mt-1 block">
              <AppIcon name="InformationCircleIcon" class="mr-1" />
              AI will analyze this to suggest relevant skills and tailor your resume
            </small>
          </div>
          <div class="flex-1-12">
            <label class="form-label small font-medium">Job Requirements (Optional)</label>
            <div class="flex gap-glass-sm mb-2">
              <input
                v-model="newRequirement"
                type="text"
                class="unified-input ui-input"
                placeholder="e.g. 3+ years Unity experience"
                @keyup.enter="addRequirement"
              />
              <button
                class="unified-btn btn-secondary btn-sm ui-btn ui-size-md v-btn"
                type="button"
                @click="addRequirement"
              >
                <AppIcon name="PlusIcon" />
              </button>
            </div>
            <div class="requirements-list">
              <span
                v-for="(req, index) in jobTarget.requirements"
                :key="index"
                class="badge badge-compact bg-glass-bg dark:bg-glass-bg-hover text-glass-primary mr-2 mb-2"
              >
                {{ req }}
                <button
                  class="btn-close btn-close-sm ml-1 ui-btn ui-size-md"
                  type="button"
                  @click="removeRequirement(index)"
                ></button>
              </span>
            </div>
          </div>
          <div class="flex-1-12">
            <label class="form-label small font-medium">Key Skills Needed (Optional)</label>
            <div class="flex gap-glass-sm mb-2">
              <input
                v-model="newKeyword"
                type="text"
                class="unified-input ui-input"
                placeholder="e.g. C#, Game Development"
                @keyup.enter="addKeyword"
              />
              <button
                class="unified-btn btn-secondary btn-sm ui-btn ui-size-md v-btn"
                type="button"
                @click="addKeyword"
              >
                <AppIcon name="PlusIcon" />
              </button>
            </div>
            <div class="keywords-list">
              <span
                v-for="(keyword, index) in jobTarget.keywords"
                :key="index"
                class="badge badge-compact bg-primary-500-subtle text-primary-600 mr-2 mb-2"
              >
                {{ keyword }}
                <button
                  class="btn-close btn-close-sm ml-1 ui-btn ui-size-md"
                  type="button"
                  @click="removeKeyword(index)"
                ></button>
              </span>
            </div>
            <small class="text-secondary mt-1 block">
              <AppIcon name="CpuChipIcon" class="mr-1" />
              These keywords will be used to optimize your resume content
            </small>
          </div>
        </div>

        <!-- Skills Analysis Section -->
        <div v-if="loading && jobTarget.description" class="mt-4">
          <div class="alert alert-info">
            <AppIcon name="CpuChipIcon" class="spin mr-2" />
            Analyzing job description for optimal skill matching...
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-glass-md justify-end mt-4 pt-3 border-t">
          <button
            class="unified-btn btn-outline-primary v-btn variant-outlined ui-btn ui-size-md"
            :disabled="!jobTarget.title || loading"
            @click="$emit('ai-analyze')"
          >
            <AppIcon v-if="canUseAi" name="CpuChipIcon" class="mr-2" />
            Analyze Job Match
          </button>
          <button
            class="unified-btn btn-primary v-btn ui-btn ui-size-md"
            @click="$emit('update', jobTarget)"
          >
            <AppIcon name="mdi-content-save" class="mr-2" />
            Save Target Job
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CpuChipIcon, EyeIcon, InformationCircleIcon, PlusIcon } from '@heroicons/vue/24/outline'

import AppIcon from '@/components/ui/AppIcon.vue'
import { ref, watch } from 'vue'

interface JobTarget {
  title: string
  company: string
  description: string
  requirements: string[]
  keywords: string[]
}

interface Props {
  modelValue: JobTarget
  canUseAi: boolean
  loading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [value: JobTarget]
  'ai-analyze': []
}>()

const jobTarget = ref<JobTarget>({ ...props.modelValue })
const newRequirement = ref('')
const newKeyword = ref('')

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  jobTarget.value = { ...newValue }
}, { deep: true })

const addRequirement = () => {
  if (newRequirement.value.trim()) {
    jobTarget.value.requirements.push(newRequirement.value.trim())
    newRequirement.value = ''
    emit('update', jobTarget.value)
  }
}

const removeRequirement = (index: number) => {
  jobTarget.value.requirements.splice(index, 1)
  emit('update', jobTarget.value)
}

const addKeyword = () => {
  if (newKeyword.value.trim()) {
    jobTarget.value.keywords.push(newKeyword.value.trim())
    newKeyword.value = ''
    emit('update', jobTarget.value)
  }
}

const removeKeyword = (index: number) => {
  jobTarget.value.keywords.splice(index, 1)
  emit('update', jobTarget.value)
}
</script>

<style scoped>
.job-target-form {
  /* Component styles */
}

.requirements-list,
.keywords-list {
  min-height: 2rem;
}

.badge {
  transition: all 0.2s ease;
}

.badge:hover {
  transform: translateY(-1px);
}

.btn-close {
  font-size: 0.5rem;
}

/* Spin animation for loading icon */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spin {
  animation: spin 1s linear infinite;
}

/* Responsive adjustments */
@media (max-width: 576px) {
  .requirements-list,
  .keywords-list .badge {
    font-size: 0.75rem;
  }
}

/* Dark theme support */
[data-theme="dark"] .badge.bg-glass-bg dark:bg-glass-bg-hover {
  background-color: var(--glass-surface) !important;
  border-color: var(--glass-border) !important;
  color: var(--text-primary-600);
}
</style>
