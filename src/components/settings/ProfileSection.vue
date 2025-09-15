<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div role="region" aria-labelledby="profile-heading" class="profile-section enhanced-glass-section" :class="{ 'is-tabbed': isTabbed }" class="font-sans">
    <!-- Enhanced Header -->
    <div v-if="!isTabbed" class="section-header">
      <div class="header-content">
        <div class="header-info">
          <h3 id="profile-heading" class="section-title">
            <AppIcon name="UserIcon-card-details" />
            Personal Profile
          </h3>
          <p class="section-subtitle">Essential information for your gaming career profile</p>
        </div>
        <div class="profile-completion-badge">
          <div class="completion-ring" :style="{ '--completion': completionPercentage + '%' }">
            <span class="completion-text">{{ completionPercentage }}%</span>
          </div>
          <span class="completion-label">Complete</span>
        </div>
      </div>
    </div>

    <!-- Profile Form -->
    <div class="section-body">
      <form novalidate class="profile-form" @submit.prevent="$emit('save')">
        <!-- Essential Information Section -->
        <div class="form-section">
          <div class="section-divider">
            <AppIcon name="UserIcon-circle" class="section-icon" />
            <span class="section-title-small">Essential Information</span>
            <div class="divider-line"></div>
          </div>
          <div class="form-grid essential-grid">
            <div class="form-field required">
              <label for="profile-name" class="form-label">
                <AppIcon name="UserIcon" class="label-icon" />
                Full Name
                <span class="required-asterisk">*</span>
              </label>
              <div class="input-wrapper">
                <input
                  id="profile-name"
                  v-model="userProfile.personalInfo.name"
                  type="text"
                  class="enhanced-input glass-input-field"
                  placeholder="Your full name"
                  autocomplete="name"
                  :class="{ 'is-invalid': store.errors?.validation?.name, 'has-value': userProfile.personalInfo.name }"
                  aria-describedby="profile-name-error"
                  required
                  @focus="focusedField = 'name'"
                  @blur="focusedField = null"
                />
                <div class="input-status">
                  <AppIcon v-if="userProfile.personalInfo.name" name="CheckIcon" class="success-icon" />
                </div>
              </div>
              <div v-if="store.errors?.validation?.name" id="profile-name-error" class="form-error">
                <AppIcon name="ExclamationCircleIcon" />
                {{ store.errors?.validation?.name }}
              </div>
              <div v-else-if="focusedField === 'name'" class="form-hint">
                <AppIcon name="InformationCircleIcon" />
                Used across NAVI and in your resume
              </div>
            </div>
            
            <div class="form-field required">
              <label for="profile-email" class="form-label">
                <AppIcon name="EnvelopeIcon" class="label-icon" />
                Email Address
                <span class="required-asterisk">*</span>
              </label>
              <div class="input-wrapper">
                <input
                  id="profile-email"
                  v-model="userProfile.personalInfo.email"
                  type="email"
                  class="enhanced-input glass-input-field"
                  placeholder="you@example.com"
                  autocomplete="email"
                  :class="{ 'is-invalid': store.errors?.validation?.email, 'has-value': userProfile.personalInfo.email }"
                  aria-describedby="profile-email-error"
                  required
                  @focus="focusedField = 'email'"
                  @blur="focusedField = null"
                />
                <div class="input-status">
                  <AppIcon v-if="userProfile.personalInfo.email && isValidEmail(userProfile.personalInfo.email)" name="CheckIcon" class="success-icon" />
                </div>
              </div>
              <div v-if="store.errors?.validation?.email" id="profile-email-error" class="form-error">
                <AppIcon name="ExclamationCircleIcon" />
                {{ store.errors?.validation?.email }}
              </div>
              <div v-else-if="focusedField === 'email'" class="form-hint">
                <AppIcon name="InformationCircleIcon" />
                Primary contact for job opportunities
              </div>
            </div>
            
            <div class="form-field">
              <label for="profile-phone" class="form-label">
                <AppIcon name="PhoneIcon" class="label-icon" />
                Phone Number
              </label>
              <div class="input-wrapper">
                <input
                  id="profile-phone"
                  v-model="userProfile.personalInfo.phone"
                  type="tel"
                  class="enhanced-input"
                  placeholder="+1 (555) 000-0000"
                  autocomplete="tel"
                  :class="{ 'has-value': userProfile.personalInfo.phone }"
                  @focus="focusedField = 'phone'"
                  @blur="focusedField = null"
                />
                <div class="input-status">
                  <AppIcon v-if="userProfile.personalInfo.phone" name="CheckIcon" class="success-icon" />
                </div>
              </div>
              <div v-if="focusedField === 'phone'" class="form-hint">
                <AppIcon name="InformationCircleIcon" />
                Optional - for recruiters to contact you
              </div>
            </div>
            
            <div class="form-field">
              <label for="profile-location" class="form-label">
                <AppIcon name="MapPinIcon" class="label-icon" />
                Location
              </label>
              <div class="input-wrapper">
                <input
                  id="profile-location"
                  v-model="userProfile.personalInfo.location"
                  type="text"
                  class="enhanced-input"
                  placeholder="City, Country"
                  autocomplete="address-level2"
                  :class="{ 'has-value': userProfile.personalInfo.location }"
                  @focus="focusedField = 'location'"
                  @blur="focusedField = null"
                />
                <div class="input-status">
                  <AppIcon v-if="userProfile.personalInfo.location" name="CheckIcon" class="success-icon" />
                </div>
              </div>
              <div v-if="focusedField === 'location'" class="form-hint">
                <AppIcon name="InformationCircleIcon" />
                Helps match you with local or remote opportunities
              </div>
            </div>
          </div>
        
          <!-- Professional Information Section -->
          <div class="form-section">
            <div class="section-divider">
              <AppIcon name="BriefcaseIcon" class="section-icon" />
              <span class="section-title-small">Professional Information</span>
              <div class="divider-line"></div>
            </div>
            <div class="form-grid professional-grid">
              <div class="form-field">
                <label for="profile-role" class="form-label">
                  <AppIcon name="mdi-badge-account" class="label-icon" />
                  Current Role
                </label>
                <div class="input-wrapper">
                  <input
                    id="profile-role"
                    v-model="userProfile.personalInfo.currentRole"
                    type="text"
                    class="enhanced-input"
                    placeholder="e.g., Senior Gameplay Engineer"
                    autocomplete="organization-title"
                    :class="{ 'has-value': userProfile.personalInfo.currentRole }"
                    @focus="focusedField = 'role'"
                    @blur="focusedField = null"
                  />
                  <div class="input-status">
                    <AppIcon v-if="userProfile.personalInfo.currentRole" name="CheckIcon" class="success-icon" />
                  </div>
                </div>
                <div v-if="focusedField === 'role'" class="form-hint">
                  <AppIcon name="InformationCircleIcon" />
                  Your current or most recent job title
                </div>
              </div>
            
              <div class="form-field">
                <label for="profile-company" class="form-label">
                  <AppIcon name="BuildingOfficeIcon" class="label-icon" />
                  Current Company
                </label>
                <div class="input-wrapper">
                  <input
                    id="profile-company"
                    v-model="userProfile.personalInfo.currentCompany"
                    type="text"
                    class="enhanced-input"
                    placeholder="e.g., Epic Games"
                    autocomplete="organization"
                    :class="{ 'has-value': userProfile.personalInfo.currentCompany }"
                    @focus="focusedField = 'company'"
                    @blur="focusedField = null"
                  />
                  <div class="input-status">
                    <AppIcon v-if="userProfile.personalInfo.currentCompany" name="CheckIcon" class="success-icon" />
                  </div>
                </div>
                <div v-if="focusedField === 'company'" class="form-hint">
                  <AppIcon name="InformationCircleIcon" />
                  Studio or company you work for
                </div>
              </div>
            
              <div class="form-field">
                <label for="profile-years" class="form-label">
                  <AppIcon name="CalendarIcon-clock" class="label-icon" />
                  Years of Experience
                </label>
                <div class="input-wrapper">
                  <input
                    id="profile-years"
                    v-model.number="userProfile.personalInfo.yearsExperience"
                    type="number"
                    step="0.5"
                    min="0"
                    class="enhanced-input"
                    placeholder="e.g., 5"
                    inputmode="decimal"
                    :class="{ 'has-value': userProfile.personalInfo.yearsExperience }"
                    @focus="focusedField = 'years'"
                    @blur="focusedField = null"
                  />
                  <div class="input-status">
                    <AppIcon v-if="userProfile.personalInfo.yearsExperience" name="CheckIcon" class="success-icon" />
                  </div>
                </div>
                <div v-if="focusedField === 'years'" class="form-hint">
                  <AppIcon name="InformationCircleIcon" />
                  Total years in gaming industry
                </div>
              </div>
            </div>
          </div>
        
          <!-- Online Presence Section -->
          <div class="form-section">
            <div class="section-divider">
              <AppIcon name="GlobeAltIcon" class="section-icon" />
              <span class="section-title-small">Online Presence</span>
              <div class="divider-line"></div>
            </div>
            <div class="form-grid online-grid">
              <div class="form-field">
                <label for="profile-website" class="form-label">
                  <AppIcon name="GlobeAltIcon" class="label-icon" />
                  Personal Website
                </label>
                <div class="input-wrapper">
                  <input
                    id="profile-website"
                    v-model="userProfile.personalInfo.website"
                    type="url"
                    class="enhanced-input"
                    placeholder="https://your-site.com"
                    autocomplete="url"
                    :class="{ 'has-value': userProfile.personalInfo.website }"
                    @focus="focusedField = 'website'"
                    @blur="focusedField = null"
                  />
                  <div class="input-status">
                    <AppIcon v-if="userProfile.personalInfo.website" name="CheckIcon" class="success-icon" />
                  </div>
                </div>
                <div v-if="focusedField === 'website'" class="form-hint">
                  <AppIcon name="InformationCircleIcon" />
                  Your personal or professional website
                </div>
              </div>
            
              <div class="form-field">
                <label for="profile-linkedin" class="form-label">
                  <AppIcon name="LinkIconedin" class="label-icon" />
                  LinkedIn Profile
                </label>
                <div class="input-wrapper">
                  <input
                    id="profile-linkedin"
                    v-model="userProfile.personalInfo.linkedIn"
                    type="url"
                    class="enhanced-input"
                    placeholder="https://linkedin.com/in/username"
                    :class="{ 'has-value': userProfile.personalInfo.linkedIn }"
                    @focus="focusedField = 'linkedin'"
                    @blur="focusedField = null"
                  />
                  <div class="input-status">
                    <AppIcon v-if="userProfile.personalInfo.linkedIn" name="CheckIcon" class="success-icon" />
                  </div>
                </div>
                <div v-if="focusedField === 'linkedin'" class="form-hint">
                  <AppIcon name="InformationCircleIcon" />
                  Professional networking profile
                </div>
              </div>
            
              <div class="form-field">
                <label for="profile-github" class="form-label">
                  <AppIcon name="mdi-github" class="label-icon" />
                  GitHub Profile
                </label>
                <div class="input-wrapper">
                  <input
                    id="profile-github"
                    v-model="userProfile.personalInfo.github"
                    type="url"
                    class="enhanced-input"
                    placeholder="https://github.com/username"
                    :class="{ 'has-value': userProfile.personalInfo.github }"
                    @focus="focusedField = 'github'"
                    @blur="focusedField = null"
                  />
                  <div class="input-status">
                    <AppIcon v-if="userProfile.personalInfo.github" name="CheckIcon" class="success-icon" />
                  </div>
                </div>
                <div v-if="focusedField === 'github'" class="form-hint">
                  <AppIcon name="InformationCircleIcon" />
                  Code portfolio and open source contributions
                </div>
              </div>
            
              <div class="form-field">
                <label for="profile-portfolio" class="form-label">
                  <AppIcon name="FolderIcon-image" class="label-icon" />
                  Portfolio
                </label>
                <div class="input-wrapper">
                  <input
                    id="profile-portfolio"
                    v-model="userProfile.personalInfo.portfolio"
                    type="url"
                    class="enhanced-input"
                    placeholder="https://portfolio.com/you"
                    :class="{ 'has-value': userProfile.personalInfo.portfolio }"
                    @focus="focusedField = 'portfolio'"
                    @blur="focusedField = null"
                  />
                  <div class="input-status">
                    <AppIcon v-if="userProfile.personalInfo.portfolio" name="CheckIcon" class="success-icon" />
                  </div>
                </div>
                <div v-if="focusedField === 'portfolio'" class="form-hint">
                  <AppIcon name="InformationCircleIcon" />
                  Showcase of your games and projects
                </div>
              </div>
            </div>
          </div>
        
          <!-- Professional Summary Section -->
          <div class="form-section">
            <div class="section-divider">
              <AppIcon name="mdi-text-box" class="section-icon" />
              <span class="section-title-small">Professional Summary</span>
              <div class="divider-line"></div>
            </div>
            <div class="form-field full-width">
              <label for="profile-summary" class="form-label">
                <AppIcon name="mdi-text-box-outline" class="label-icon" />
                About Yourself
              </label>
              <div class="textarea-wrapper">
                <textarea
                  id="profile-summary"
                  v-model="userProfile.personalInfo.summary"
                  class="enhanced-textarea"
                  rows="4"
                  placeholder="Briefly summarize your experience, strengths, and career goals in gaming..."
                  :class="{ 'has-value': userProfile.personalInfo.summary }"
                  @focus="focusedField = 'summary'"
                  @blur="focusedField = null"
                />
                <div class="character-count">
                  {{ (userProfile.personalInfo.summary || '').length }}/500
                </div>
              </div>
              <div v-if="focusedField === 'summary'" class="form-hint">
                <AppIcon name="InformationCircleIcon" />
                <span>This appears on your resume and helps match you with relevant opportunities. Aim for 2-3 sentences.</span>
              </div>
            </div>
          </div>
        
          <!-- Form Actions -->
          <div class="form-actions-section">
            <div class="actions-content">
              <div class="quick-actions">
                <UnifiedButton
                  variant="glass"
                  size="sm"
                  leading-icon="SparklesIcon"
                  :disabled="saving"
                  @click="autoFillSuggestions"
                >
                  Smart Fill
                </UnifiedButton>
                <UnifiedButton
                  variant="glass"
                  size="sm"
                  leading-icon="EyeIcon-outline"
                  :disabled="saving"
                  @click="previewProfile"
                >
                  Preview
                </UnifiedButton>
              </div>
              <div class="primary-actions">
                <UnifiedButton
                  type="button"
                  variant="glass"
                  :disabled="saving"
                  leading-icon="mdi-backup-restore"
                  @click="resetForm"
                >
                  Reset
                </UnifiedButton>
                <UnifiedButton
                  type="submit"
                  variant="primary"
                  :disabled="saving || !hasRequiredFields"
                  :leading-icon="saving ? 'ArrowPathIcon' : 'mdi-content-save'"
                  :class="{ 'is-loading': saving }"
                >
                  {{ saving ? 'Saving Profile...' : 'Save Profile' }}
                </UnifiedButton>
              </div>
            </div>
          
            <!-- Success/Error Messages -->
            <Transition name="message-fade">
              <div v-if="profileSaved" class="success-message" aria-live="polite">
                <AppIcon name="CheckCircleIcon" />
                <span>Profile saved successfully! Your changes are now live.</span>
              </div>
            </Transition>
          
            <!-- Profile Completion Tips -->
            <div v-if="!isProfileComplete" class="completion-tips">
              <div class="tip-header">
                <AppIcon name="LightBulbIcon-outline" />
                <span>Complete your profile to improve job matching</span>
              </div>
              <div class="tip-list">
                <div v-for="tip in incompleteTips" :key="tip.field" class="tip-item" @click="focusField(tip.field)">
                  <AppIcon name="PlusIcon-circle-outline" />
                  <span>{{ tip.message }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { BriefcaseIcon, BuildingOfficeIcon, CheckIcon, EnvelopeIcon, ExclamationCircleIcon, GlobeAltIcon, InformationCircleIcon, PhoneIcon, SparklesIcon, UserIcon } from '@heroicons/vue/24/outline'
import { CheckCircleIcon, MapPinIcon } from '@heroicons/vue/24/solid'

import { computed, ref, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { useToast } from '@/composables/useToast'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

// Props
const props = defineProps({
  userProfile: {
    type: Object,
    default: () => ({
      personalInfo: {}
    })
  },
  saving: {
    type: Boolean,
    default: false
  },
  isTabbed: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['save', 'profile-preview'])

// Store
const store = useAppStore()
const toast = useToast()

// Local state
const profileSaved = ref(false)
const focusedField = ref(null)

// Computed properties
const completionPercentage = computed(() => {
  const fields = [
    'name', 'email', 'location', 'currentRole', 
    'currentCompany', 'yearsExperience', 'summary'
  ]
  const completed = fields.filter(field => {
    const value = props.userProfile.personalInfo?.[field]
    return value && String(value).trim().length > 0
  })
  return Math.round((completed.length / fields.length) * 100)
})

const isProfileComplete = computed(() => completionPercentage.value >= 80)

const hasRequiredFields = computed(() => {
  const name = props.userProfile.personalInfo?.name
  const email = props.userProfile.personalInfo?.email
  return name && email && name.trim().length > 0 && email.trim().length > 0
})

const incompleteTips = computed(() => {
  const tips = []
  const info = props.userProfile.personalInfo || {}
  
  if (!info.currentRole) {
    tips.push({ field: 'role', message: 'Add your current role to improve job matching' })
  }
  if (!info.summary) {
    tips.push({ field: 'summary', message: 'Write a professional summary to stand out' })
  }
  if (!info.linkedIn && !info.github && !info.portfolio) {
    tips.push({ field: 'linkedin', message: 'Add your LinkedIn or GitHub to showcase experience' })
  }
  if (!info.location) {
    tips.push({ field: 'location', message: 'Add location for better job opportunities' })
  }
  
  return tips.slice(0, 3) // Show max 3 tips
})

// Methods
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const focusField = (fieldName) => {
  const fieldId = `profile-${fieldName}`
  const element = document.getElementById(fieldId)
  if (element) {
    element.focus()
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

const autoFillSuggestions = async () => {
  try {
    const { useAIService } = await import('@/composables/useAIService')
    const aiService = useAIService()
    
    if (!aiService.isReady.value) {
      toast.error('AI service not available. Please configure your API key in settings.')
      return
    }
    
    const suggestions = await aiService.generateProfileSuggestions({
      currentData: profile.value,
      context: 'gaming_industry'
    })
    
    if (suggestions) {
      // Apply suggestions to profile fields
      Object.keys(suggestions).forEach(key => {
        if (profile.value[key] && !profile.value[key].trim()) {
          profile.value[key] = suggestions[key]
        }
      })
      toast.success('Profile suggestions applied')
    }
  } catch (error) {
    console.error('Auto-fill failed:', error)
    toast.error('Failed to generate profile suggestions')
  }
}

const previewProfile = () => {
  // Create a preview modal or dialog showing formatted profile data
  const formattedProfile = {
    ...profile.value,
    skills: Array.isArray(profile.value.skills) ? profile.value.skills : profile.value.skills?.split(',').map(s => s.trim()).filter(Boolean) || []
  }
  
  // Emit event to parent or show modal
  emit('profile-preview', formattedProfile)
  
  // Alternative: Show in-place preview
  toast.info('Profile preview - check console for formatted data')
  console.info('Profile Preview:', JSON.stringify(formattedProfile, null, 2))
}

const resetForm = () => {
  if (confirm('Are you sure you want to reset all fields? This will clear any unsaved changes.')) {
    // Reset to empty state
    Object.keys(props.userProfile.personalInfo).forEach(key => {
      props.userProfile.personalInfo[key] = ''
    })
  }
}

// Watch for successful save
watch(() => props.saving, (newSaving, oldSaving) => {
  if (oldSaving && !newSaving) {
    profileSaved.value = true
    setTimeout(() => {
      profileSaved.value = false
    }, 4000)
  }
})

// Watch for completion changes
watch(completionPercentage, (newPercentage) => {
  if (newPercentage === 100 && !profileSaved.value) {
    // Show profile completion celebration
    profileSaved.value = true
    // Could add achievement notification here in the future
  }
})
</script>

<style scoped>
/* Enhanced Profile Section Styles with Master Theme Integration */
.profile-section {
  --field-spacing: var(--spacing-5);
  --section-spacing: var(--spacing-8);
  background: var(--glass-bg);
  color: var(--text-primary-600);
  transition: background-color var(--duration-normal), color var(--duration-normal);
}

.profile-section:not(.is-tabbed) {
  padding: var(--card-padding);
}

/* Enhanced Header */
.section-header {
  margin-bottom: var(--spacing-6);
  padding-bottom: var(--spacing-4);
  border-b: 1px solid var(--glass-border);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-4);
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary-600);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin: 0;
  transition: color var(--duration-normal);
}

.section-subtitle {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin: var(--spacing-1) 0 0;
  transition: color var(--duration-normal);
}

/* Profile Completion Badge */
.profile-completion-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-1);
}

.completion-ring {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: conic-gradient(
    var(--color-primary-500) 0deg, 
    var(--color-primary-500) calc(var(--completion) * 3.6deg),
    var(--glass-border) calc(var(--completion) * 3.6deg),
    var(--glass-border) 360deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
}

.completion-ring::before {
  content: '';
  position: absolute;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--background-secondary);
}

.completion-text {
  position: relative;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary-600);
  transition: color var(--duration-normal);
}

.completion-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  transition: color var(--duration-normal);
}

/* Form Sections */
.form-section {
  margin-bottom: var(--section-spacing);
}

.section-divider {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-5);
}

.section-icon {
  color: var(--color-primary-500);
  font-size: var(--font-size-lg);
}

.section-title-small {
  color: var(--text-primary-600);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  white-space: nowrap;
  transition: color var(--duration-normal);
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, var(--glass-border), transparent);
}

/* Form Grids */
.form-grid {
  display: grid;
  gap: var(--field-spacing);
}

.essential-grid {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.professional-grid {
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.online-grid {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

/* Enhanced Form Fields */
.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.form-field.required .required-asterisk {
  color: var(--color-error-400);
  margin-left: var(--spacing-1);
}

.form-label {
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  margin-bottom: var(--spacing-1);
  transition: color var(--duration-normal);
}

.label-icon {
  font-size: var(--font-size-base);
  color: var(--text-tertiary);
  transition: color var(--duration-normal);
}

/* Enhanced Inputs */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.enhanced-input,
.glass-input-field {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter, blur(16px));
  -webkit-backdrop-filter: var(--glass-backdrop-filter, blur(16px));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-3) var(--spacing-4);
  color: var(--text-primary-600);
  font-size: var(--font-size-base);
  width: 100%;
  transition: all var(--duration-normal);
  box-shadow: var(--glass-shadow);
}

.enhanced-input::placeholder,
.glass-input-field::placeholder {
  color: var(--text-secondary);
  transition: color var(--duration-normal);
}

.enhanced-input:focus,
.glass-input-field:focus {
  outline: none;
  border-color: var(--color-primary-500);
  background: var(--glass-hover-bg);
  box-shadow: 
    var(--glass-shadow),
    0 0 0 3px rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.15);
}

.enhanced-input.has-value,
.glass-input-field.has-value {
  border-color: rgba(var(--color-success-500-rgb, 34, 197, 94), 0.5);
  box-shadow: 
    inset 0 1px 3px rgba(0, 0, 0, 0.1),
    0 0 8px rgba(var(--color-success-500-rgb, 34, 197, 94), 0.1);
}

.enhanced-input.is-invalid {
  border-color: var(--color-error-500);
  background: color-mix(in srgb, var(--color-error-500) 5%, var(--glass-bg));
}

.input-status {
  position: absolute;
  right: var(--spacing-3);
  display: flex;
  align-items: center;
  pointer-events: none;
}

.success-icon {
  color: var(--color-success-500);
  font-size: var(--font-size-lg);
  transition: color var(--duration-normal);
  filter: drop-shadow(0 0 4px rgba(var(--color-success-500-rgb, 34, 197, 94), 0.3));
}

/* Enhanced Textarea */
.textarea-wrapper {
  position: relative;
}

.enhanced-textarea {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  color: var(--text-primary-600);
  font-size: var(--font-size-base);
  width: 100%;
  resize: vertical;
  min-height: 100px;
  line-height: 1.5;
  transition: all var(--duration-normal);
  backdrop-filter: var(--glass-backdrop-filter);
  -webkit-backdrop-filter: var(--glass-backdrop-filter);
  box-shadow: var(--glass-shadow);
}

.enhanced-textarea::placeholder {
  color: var(--text-secondary);
  transition: color var(--duration-normal);
}

.enhanced-textarea:focus {
  outline: none;
  border-color: var(--color-primary-500);
  background: var(--glass-hover-bg);
  box-shadow: 
    var(--glass-shadow),
    0 0 0 3px rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.15);
}

.enhanced-textarea.has-value {
  border-color: var(--color-success-400);
}

.character-count {
  position: absolute;
  bottom: var(--spacing-2);
  right: var(--spacing-3);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  -webkit-backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--glass-border);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  box-shadow: var(--glass-shadow);
  transition: all var(--duration-normal);
}

/* Form Messages */
.form-error {
  color: var(--color-error-500);
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  margin-top: var(--spacing-1);
  transition: color var(--duration-normal);
}

.form-hint {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  -webkit-backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  margin-top: var(--spacing-1);
  box-shadow: var(--glass-shadow);
  transition: all var(--duration-normal);
}

/* Form Actions */
.form-actions-section {
  margin-top: var(--section-spacing);
  padding-top: var(--spacing-5);
  border-t: 1px solid var(--glass-border);
}

.actions-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
}

.quick-actions,
.primary-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.success-message {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  color: var(--color-success-500);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  -webkit-backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--color-success-500);
  border-radius: var(--radius-lg);
  box-shadow: 
    var(--glass-shadow),
    0 0 12px rgba(var(--color-success-500-rgb, 34, 197, 94), 0.15);
  transition: all var(--duration-normal);
}

/* Profile Completion Tips */
.completion-tips {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  margin-top: var(--spacing-4);
}

.tip-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  color: var(--text-primary-600);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-3);
  transition: color var(--duration-normal);
}

.tip-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.tip-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--duration-normal);
  border: 1px solid transparent;
}

.tip-item:hover {
  background: var(--glass-hover-bg);
  color: var(--text-primary-600);
  border-color: var(--glass-border);
  backdrop-filter: var(--glass-backdrop-filter);
  -webkit-backdrop-filter: var(--glass-backdrop-filter);
  box-shadow: var(--glass-shadow);
}

/* Loading States */
.is-loading {
  cursor: wait;
}

.is-loading .ArrowPathIcon {
  animation: spin 1s linear infinite;
}

/* Transitions */
.message-fade-enter-active,
.message-fade-leave-active {
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.message-fade-enter-from,
.message-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Enhanced Glass Section Styling with Master Theme */
.enhanced-glass-section {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter, blur(16px));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-2xl);
  box-shadow: var(--glass-shadow);
  transition: all var(--duration-normal);
}

.enhanced-glass-section:hover {
  border-color: rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.2);
  box-shadow: 
    var(--glass-shadow),
    0 8px 25px rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.05);
}

.enhanced-glass-section .section-divider {
  background: rgba(var(--glass-border-rgb, 255, 255, 255), 0.02);
  border-radius: var(--radius-lg);
  padding: var(--spacing-3);
  border: 1px solid rgba(var(--glass-border-rgb, 255, 255, 255), 0.05);
}

.enhanced-glass-section .input-status {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter, blur(8px));
  border-radius: 50%;
  width: 24px;
  height: 24px;
  justify-content: center;
  border: 1px solid var(--glass-border);
  transition: all var(--duration-fast);
}

.enhanced-glass-section .success-icon {
  font-size: var(--font-size-sm);
  filter: drop-shadow(0 0 4px rgba(var(--color-success-500-rgb, 34, 197, 94), 0.3));
}

/* Enhanced completion tips with glass theme */
.enhanced-glass-section .completion-tips {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter, blur(12px));
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}

/* Enhanced Light/Dark Mode Integration for Profile Settings */

/* Dark Theme Enhancements */
[data-theme="dark"] .enhanced-glass-section {
  background: var(--glass-bg);
  border-color: var(--glass-border);
  box-shadow: var(--glass-shadow);
}

[data-theme="dark"] .glass-input-field {
  background: var(--glass-bg);
  border-color: var(--glass-border);
  color: var(--text-primary-600);
}

[data-theme="dark"] .glass-input-field:focus {
  background: var(--glass-hover-bg);
  border-color: var(--color-primary-500);
  box-shadow: 
    inset 0 1px 3px rgba(0, 0, 0, 0.1),
    0 0 0 3px rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.15),
    var(--glass-shadow);
}

[data-theme="dark"] .enhanced-glass-section .section-divider {
  background: rgba(var(--glass-border-rgb, 255, 255, 255), 0.02);
  border-color: rgba(var(--glass-border-rgb, 255, 255, 255), 0.05);
}

[data-theme="dark"] .enhanced-glass-section .input-status {
  background: var(--glass-bg);
  border-color: var(--glass-border);
}

[data-theme="dark"] .enhanced-glass-section .completion-tips {
  background: var(--glass-bg);
  border-color: var(--glass-border);
  box-shadow: var(--glass-shadow);
}

/* Light Theme Enhancements */
[data-theme="light"] .enhanced-glass-section {
  background: var(--glass-bg);
  border-color: var(--glass-border);
  box-shadow: var(--glass-shadow);
}

[data-theme="light"] .glass-input-field {
  background: var(--glass-bg);
  border-color: var(--glass-border);
}

[data-theme="light"] .glass-input-field:focus {
  background: var(--glass-hover-bg);
  border-color: var(--color-primary-500);
  box-shadow: 
    inset 0 1px 3px rgba(0, 0, 0, 0.1),
    0 0 0 3px rgba(var(--color-primary-500-rgb, 99, 102, 241), 0.15),
    var(--glass-shadow);
}

/* Smooth Theme Transitions */
.enhanced-glass-section,
.glass-input-field,
.enhanced-glass-section .section-divider,
.enhanced-glass-section .input-status,
.enhanced-glass-section .completion-tips {
  transition: 
    background-color var(--duration-normal),
    border-color var(--duration-normal),
    color var(--duration-normal),
    box-shadow var(--duration-normal),
    backdrop-filter var(--duration-normal);
}

/* Accessibility Improvements */
@media (prefers-reduced-motion: reduce) {
  .enhanced-glass-section,
  .glass-input-field {
    transition: none;
  }
  
  .enhanced-glass-section:hover {
    transform: none;
  }
}

@media (prefers-contrast: high) {
  .enhanced-glass-section,
  .glass-input-field {
    border-width: 2px;
    backdrop-filter: none;
  }
  
  .enhanced-glass-section .completion-tips {
    border-width: 2px;
    backdrop-filter: none;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-3);
  }
  
  .completion-ring {
    width: 50px;
    height: 50px;
  }
  
  .completion-ring::before {
    width: 36px;
    height: 36px;
  }
  
  .actions-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .quick-actions,
  .primary-actions {
    justify-content: center;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
