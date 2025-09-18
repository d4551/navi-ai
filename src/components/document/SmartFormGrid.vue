<template>
  <div
    class="smart-form-grid font-sans"
    :class="{ 'has-suggestions': showSuggestions }"
  >
    <!-- Personal Information Section -->
    <div v-if="section === 'personal'" class="form-grid">
      <!-- Full Name with Smart Detection -->
      <div class="form-field full-width">
        <label class="field-label">
          <AppIcon name="UserIcon" />
          Full Name
          <span class="required-mark">*</span>
        </label>
        <div class="smart-input-wrapper">
          <input
            v-model="localData.name"
            type="text"
            class="field-input smart-input"
            placeholder="John Doe"
            :class="{ 'has-suggestions': nameSuggestions.length > 0 }"
            @input="handleNameInput"
            @focus="focusedField = 'name'"
            @blur="handleBlur"
          />
          <div
            v-if="nameSuggestions.length > 0 && focusedField === 'name'"
            class="suggestions-dropdown"
          >
            <div
              v-for="suggestion in nameSuggestions"
              :key="suggestion"
              class="suggestion-item"
              @click="applyNameSuggestion(suggestion)"
            >
              <AppIcon name="UserIcon" />
              {{ suggestion }}
            </div>
          </div>
        </div>
      </div>

      <!-- Professional Title with AI Suggestions -->
      <div class="form-field full-width">
        <label class="field-label">
          <AppIcon name="BriefcaseIcon" />
          Professional Title
        </label>
        <div class="smart-input-wrapper">
          <input
            v-model="localData.title"
            type="text"
            class="field-input smart-input"
            placeholder="Software Engineer"
            @input="handleTitleInput"
            @focus="focusedField = 'title'"
            @blur="handleBlur"
          />
          <UnifiedButton
            v-if="aiEnabled && !localData.title"
            variant="ghost"
            size="xs"
            leading-icon="CpuChipIcon"
            class="ai-suggest-btn"
            @click="generateTitleSuggestions"
          >
            AI Suggest
          </UnifiedButton>
        </div>
        <div
          v-if="titleSuggestions.length > 0 && focusedField === 'title'"
          class="suggestions-dropdown"
        >
          <div class="suggestion-header">
            <AppIcon name="CpuChipIcon" />
            AI Suggestions
          </div>
          <div
            v-for="suggestion in titleSuggestions"
            :key="suggestion"
            class="suggestion-item ai-suggestion"
            @click="applyTitleSuggestion(suggestion)"
          >
            {{ suggestion }}
          </div>
        </div>
      </div>

      <!-- Contact Information Row -->
      <div class="form-field">
        <label class="field-label">
          <AppIcon name="mdi-email-outline" />
          Email Address
          <span class="required-mark">*</span>
        </label>
        <input
          v-model="localData.email"
          type="email"
          class="field-input"
          placeholder="john.doe@example.com"
          :class="{
            'is-valid': isValidEmail,
            'is-invalid': localData.email && !isValidEmail,
          }"
          @input="validateEmail"
        />
        <div v-if="emailSuggestion" class="inline-suggestion">
          <AppIcon name="LightBulbIcon-outline" />
          Did you mean:
          <button class="suggestion-link" @click="applyEmailSuggestion">
            {{ emailSuggestion }}</button
          >?
        </div>
      </div>

      <div class="form-field">
        <label class="field-label">
          <AppIcon name="PhoneIcon-outline" />
          Phone Number
          <span class="required-mark">*</span>
        </label>
        <input
          v-model="localData.phone"
          type="tel"
          class="field-input"
          placeholder="(555) 123-4567"
          @input="formatPhone"
        />
      </div>

      <!-- Location with Smart Autocomplete -->
      <div class="form-field">
        <label class="field-label">
          <AppIcon name="mdi-map-marker-outline" />
          Location
        </label>
        <div class="smart-input-wrapper">
          <input
            v-model="localData.location"
            type="text"
            class="field-input smart-input"
            placeholder="San Francisco, CA"
            @input="handleLocationInput"
            @focus="focusedField = 'location'"
            @blur="handleBlur"
          />
          <div
            v-if="locationSuggestions.length > 0 && focusedField === 'location'"
            class="suggestions-dropdown"
          >
            <div
              v-for="suggestion in locationSuggestions"
              :key="suggestion.place_id || suggestion"
              class="suggestion-item location-suggestion"
              @click="applyLocationSuggestion(suggestion)"
            >
              <AppIcon name="MapPinIcon" />
              <div>
                <div class="location-name">
                  {{ suggestion.main_text || suggestion }}
                </div>
                <div v-if="suggestion.secondary_text" class="location-detail">
                  {{ suggestion.secondary_text }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Social Links -->
      <div class="form-field">
        <label class="field-label">
          <AppIcon name="LinkIconedin" />
          LinkedIn Profile
        </label>
        <input
          v-model="localData.linkedin"
          type="url"
          class="field-input"
          placeholder="linkedin.com/in/johndoe"
          @input="formatLinkedIn"
        />
      </div>

      <div class="form-field">
        <label class="field-label">
          <AppIcon name="mdi-github" />
          GitHub Profile
        </label>
        <input
          v-model="localData.github"
          type="url"
          class="field-input"
          placeholder="github.com/johndoe"
          @input="formatGitHub"
        />
      </div>

      <div class="form-field">
        <label class="field-label">
          <AppIcon name="GlobeAmericasIcon" />
          Portfolio Website
        </label>
        <input
          v-model="localData.website"
          type="url"
          class="field-input"
          placeholder="johndoe.com"
        />
      </div>
    </div>

    <!-- Summary Section -->
    <div v-else-if="section === 'summary'" class="summary-section">
      <div class="smart-textarea-wrapper">
        <label class="field-label">
          <AppIcon name="mdi-text-box-outline" />
          Professional Summary
        </label>
        <div class="textarea-container">
          <textarea
            v-model="localData.summary"
            class="field-input enhanced-textarea"
            rows="4"
            placeholder="Write a compelling professional summary that highlights your key strengths, experience, and career objectives..."
            @input="handleSummaryInput"
            @focus="focusedField = 'summary'"
          ></textarea>
          <div class="textarea-tools">
            <div class="word-count">
              <span>{{ summaryWordCount }}</span> words
            </div>
            <UnifiedButton
              v-if="aiEnabled"
              variant="ghost"
              size="xs"
              leading-icon="CpuChipIcon"
              :loading="generatingSummary"
              @click="generateSummary"
            >
              AI Generate
            </UnifiedButton>
          </div>
        </div>
        <div v-if="summaryTips.length > 0" class="writing-tips">
          <div class="tips-header">
            <AppIcon name="LightBulbIcon" />
            Writing Tips
          </div>
          <ul class="tips-list">
            <li v-for="tip in summaryTips" :key="tip.id" class="tip-item">
              <AppIcon :name="tip.icon" />
              {{ tip.text }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Import Profile Data Helper -->
    <div
      v-if="section === 'personal' && showProfileImport"
      class="profile-import-card"
    >
      <div class="import-header">
        <AppIcon name="UserIcon-import" />
        <span>Import from Profile</span>
      </div>
      <p>Quickly populate fields using your saved profile information.</p>
      <UnifiedButton
        variant="primary"
        size="sm"
        leading-icon="ArrowDownTrayIcon"
        @click="importFromProfile"
      >
        Import Profile Data
      </UnifiedButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowDownTrayIcon,
  BriefcaseIcon,
  CpuChipIcon,
  GlobeAmericasIcon,
  LightBulbIcon,
  UserIcon,
} from '@heroicons/vue/24/outline'
import { MapPinIcon } from '@heroicons/vue/24/solid'

import { ref, computed, watch, nextTick } from 'vue'
import { useAppStore } from '@/stores/app'
import { debounce } from 'lodash-es'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

interface SmartFormData {
  name: string
  title: string
  email: string
  phone: string
  location: string
  linkedin: string
  github: string
  website: string
  summary: string
}

const props = defineProps<{
  modelValue: SmartFormData
  section: 'personal' | 'summary'
  aiEnabled?: boolean
  showProfileImport?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: SmartFormData]
  'import-profile': []
  'ai-generate': [type: string, data: any]
}>()

const store = useAppStore()

// Local reactive data
const localData = ref<SmartFormData>({ ...props.modelValue })
const focusedField = ref<string>('')

// Suggestions state
const nameSuggestions = ref<string[]>([])
const titleSuggestions = ref<string[]>([])
const locationSuggestions = ref<any[]>([])
const emailSuggestion = ref<string>('')
const summaryTips = ref<Array<{ id: string; icon: string; text: string }>>([])

// Loading states
const generatingSummary = ref(false)

// Validation
const isValidEmail = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(localData.value.email)
})

const summaryWordCount = computed(() => {
  return (localData.value.summary || '').trim().split(/\s+/).filter(Boolean)
    .length
})

const showSuggestions = computed(() => {
  return (
    nameSuggestions.value.length > 0 ||
    titleSuggestions.value.length > 0 ||
    locationSuggestions.value.length > 0
  )
})

// Watch for changes and emit
watch(
  localData,
  newValue => {
    emit('update:modelValue', newValue)
  },
  { deep: true }
)

// Watch for prop changes
watch(
  () => props.modelValue,
  newValue => {
    localData.value = { ...newValue }
  },
  { deep: true }
)

// Smart input handlers
const handleNameInput = debounce(() => {
  // Generate name suggestions based on common patterns
  const currentName = localData.value.name.toLowerCase()
  if (currentName.length > 2) {
    // This would typically call an API or use a names database
    nameSuggestions.value = generateNameSuggestions(currentName)
  } else {
    nameSuggestions.value = []
  }
}, 300)

const handleTitleInput = debounce(() => {
  // Generate title suggestions based on input and profile data
  if (props.aiEnabled && localData.value.title.length > 2) {
    generateTitleSuggestions()
  }
}, 500)

const handleLocationInput = debounce(async () => {
  const query = localData.value.location
  if (query.length > 2) {
    // This would typically call Google Places API or similar
    locationSuggestions.value = await mockLocationSearch(query)
  } else {
    locationSuggestions.value = []
  }
}, 300)

const handleSummaryInput = debounce(() => {
  updateSummaryTips()
}, 500)

const handleBlur = () => {
  // Delay hiding suggestions to allow clicks
  setTimeout(() => {
    focusedField.value = ''
  }, 200)
}

// Validation and formatting
const validateEmail = () => {
  if (localData.value.email && !isValidEmail.value) {
    emailSuggestion.value = suggestEmailCorrection(localData.value.email)
  } else {
    emailSuggestion.value = ''
  }
}

const formatPhone = () => {
  // Auto-format phone number
  let phone = localData.value.phone.replace(/\D/g, '')
  if (phone.length >= 6) {
    phone = phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
  } else if (phone.length >= 3) {
    phone = phone.replace(/(\d{3})(\d{0,3})/, '($1) $2')
  }
  localData.value.phone = phone
}

const formatLinkedIn = () => {
  let url = localData.value.linkedin
  if (url && !url.includes('linkedin.com') && !url.startsWith('http')) {
    localData.value.linkedin = `linkedin.com/in/${url}`
  }
}

const formatGitHub = () => {
  let url = localData.value.github
  if (url && !url.includes('github.com') && !url.startsWith('http')) {
    localData.value.github = `github.com/${url}`
  }
}

// Suggestion handlers
const applyNameSuggestion = (suggestion: string) => {
  localData.value.name = suggestion
  nameSuggestions.value = []
}

const applyTitleSuggestion = (suggestion: string) => {
  localData.value.title = suggestion
  titleSuggestions.value = []
}

const applyLocationSuggestion = (suggestion: any) => {
  localData.value.location =
    typeof suggestion === 'string' ? suggestion : suggestion.description
  locationSuggestions.value = []
}

const applyEmailSuggestion = () => {
  localData.value.email = emailSuggestion.value
  emailSuggestion.value = ''
}

// AI Generation
const generateTitleSuggestions = async () => {
  if (!props.aiEnabled) return

  try {
    // This would integrate with your AI service
    titleSuggestions.value = [
      'Senior Software Engineer',
      'Full-Stack Developer',
      'Frontend Engineer',
      'Software Development Manager',
    ]
  } catch (error) {
    console.warn('Failed to generate title suggestions:', error)
  }
}

const generateSummary = async () => {
  if (!props.aiEnabled) return

  generatingSummary.value = true
  try {
    emit('ai-generate', 'summary', localData.value)
  } finally {
    generatingSummary.value = false
  }
}

// Helper functions
const generateNameSuggestions = (name: string): string[] => {
  // Mock implementation - would typically use a names database
  const commonNames = [
    'John Doe',
    'Jane Smith',
    'Michael Johnson',
    'Sarah Wilson',
    'David Brown',
    'Lisa Davis',
    'Robert Miller',
    'Emily Garcia',
  ]
  return commonNames
    .filter(
      n =>
        n.toLowerCase().includes(name) ||
        name.split(' ').some(part => n.toLowerCase().includes(part))
    )
    .slice(0, 5)
}

const mockLocationSearch = async (query: string) => {
  // Mock location search - would typically use Google Places API
  const locations = [
    { main_text: 'San Francisco', secondary_text: 'CA, USA', place_id: 'sf' },
    { main_text: 'New York', secondary_text: 'NY, USA', place_id: 'ny' },
    { main_text: 'Los Angeles', secondary_text: 'CA, USA', place_id: 'la' },
    { main_text: 'Chicago', secondary_text: 'IL, USA', place_id: 'chi' },
    { main_text: 'Seattle', secondary_text: 'WA, USA', place_id: 'sea' },
  ]

  return locations
    .filter(
      loc =>
        loc.main_text.toLowerCase().includes(query.toLowerCase()) ||
        loc.secondary_text.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 5)
}

const suggestEmailCorrection = (email: string): string => {
  // Common email domain corrections
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
  const parts = email.split('@')
  if (parts.length === 2) {
    const domain = parts[1]
    const suggestion = domains.find(
      d => d.includes(domain) || domain.includes(d.split('.')[0])
    )
    if (suggestion && suggestion !== domain) {
      return `${parts[0]}@${suggestion}`
    }
  }
  return ''
}

const updateSummaryTips = () => {
  const summary = localData.value.summary || ''
  const tips = []

  if (summary.length < 50) {
    tips.push({
      id: 'length',
      icon: 'mdi-text-short',
      text: 'Consider expanding your summary to 2-3 sentences for better impact',
    })
  }

  if (!summary.includes('experience') && !summary.includes('skilled')) {
    tips.push({
      id: 'keywords',
      icon: 'KeyIcon',
      text: 'Include relevant keywords like "experience", "skilled", or industry terms',
    })
  }

  if (summaryWordCount.value > 100) {
    tips.push({
      id: 'concise',
      icon: 'mdi-scissors-cutting',
      text: 'Keep your summary concise - aim for 80-100 words for optimal impact',
    })
  }

  summaryTips.value = tips
}

const importFromProfile = () => {
  emit('import-profile')
}
</script>

<style scoped>
.smart-form-grid {
  position: relative;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field.full-width {
  grid-column: span 2;
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.required-mark {
  color: #ef4444;
}

.field-input {
  padding: 12px 16px;
  border: 2px solid var(--glass-border);
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: rgba(var(--surface-base-rgb), 0.8);
  backdrop-filter: blur(8px);
}

.field-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 4px rgba(var(--color-primary-500-rgb), 0.1);
}

.field-input.is-valid {
  border-color: #10b981;
}

.field-input.is-invalid {
  border-color: #ef4444;
}

/* Smart Input Components */
.smart-input-wrapper {
  position: relative;
}

.smart-input {
  padding-right: 40px;
}

.ai-suggest-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
}

.suggestion-header {
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
  border-b: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  gap: 4px;
}

.suggestion-item {
  padding: 10px 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.suggestion-item:hover {
  background: rgba(var(--color-primary-500-rgb), 0.05);
}

.ai-suggestion {
  background: rgba(var(--color-primary-500-rgb), 0.02);
}

.location-suggestion {
  flex-direction: flex flex-wrap;
  align-items: flex-start;
  padding: 12px;
}

.location-name {
  font-weight: 500;
  color: var(--text-primary-600);
}

.location-detail {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 2px;
}

.inline-suggestion {
  font-size: 12px;
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}

.suggestion-link {
  background: none;
  border: none;
  color: var(--color-primary-500);
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
}

/* Summary Section */
.summary-section {
  max-width: 100%;
}

.smart-textarea-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.textarea-container {
  position: relative;
}

.enhanced-textarea {
  width: 100%;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
}

.textarea-tools {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.word-count {
  font-size: 12px;
  color: var(--text-tertiary);
}

.writing-tips {
  margin-top: 16px;
  padding: 16px;
  background: rgba(var(--color-primary-500-rgb), 0.03);
  border-radius: 8px;
  border: 1px solid rgba(var(--color-primary-500-rgb), 0.1);
}

.tips-header {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary-600);
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

/* Profile Import Card */
.profile-import-card {
  grid-column: span 2;
  padding: 20px;
  background: linear-gradient(
    135deg,
    rgba(var(--color-primary-500-rgb), 0.05),
    rgba(var(--color-gaming-500-rgb), 0.05)
  );
  border: 1px solid rgba(var(--color-primary-500-rgb), 0.2);
  border-radius: 12px;
  text-align: center;
}

.import-header {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary-600);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.profile-import-card p {
  color: var(--text-secondary);
  margin-bottom: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .form-field.full-width {
    grid-column: span 1;
  }

  .profile-import-card {
    grid-column: span 1;
  }
}
</style>
