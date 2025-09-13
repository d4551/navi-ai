<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div
    role="region"
    aria-labelledby="profile-heading"
    class="profile-section enhanced-glass-section"
    :class="{ 'is-tabbed': isTabbed }"
  >
    <!-- Enhanced Header -->
    <div v-if="!isTabbed" class="section-header">
      <div class="header-content">
        <div class="header-info">
          <h3 id="profile-heading" class="section-title">
            <AppIcon name="mdi-account-card-details" />
            Personal Profile
          </h3>
          <p class="section-subtitle">
            Essential information for your gaming career profile
          </p>
        </div>
        <div class="profile-completion-badge">
          <div
            class="completion-ring"
            :style="{ '--completion': completionPercentage + '%' }"
          >
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
            <AppIcon name="mdi-account-circle" class="section-icon" />
            <span class="section-title-small">Essential Information</span>
            <div class="divider-line"></div>
          </div>
          <div class="form-grid essential-grid">
            <div class="form-field required">
              <label for="profile-name" class="form-label">
                <AppIcon name="mdi-account" class="label-icon" />
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
                  :class="{
                    'is-invalid': store.errors.validation?.name,
                    'has-value': userProfile.personalInfo.name,
                  }"
                  aria-describedby="profile-name-error"
                  required
                  @focus="focusedField = 'name'"
                  @blur="focusedField = null"
                />
                <div class="input-status">
                  <AppIcon
                    v-if="userProfile.personalInfo.name"
                    name="mdi-check"
                    class="success-icon"
                  />
                </div>
              </div>
              <div
                v-if="store.errors.validation?.name"
                id="profile-name-error"
                class="form-error"
              >
                <AppIcon name="mdi-alert-circle" />
                {{ store.errors.validation?.name }}
              </div>
              <div v-else-if="focusedField === 'name'" class="form-hint">
                <AppIcon name="mdi-information" />
                Used across NAVI and in your resume
              </div>
            </div>

            <div class="form-field required">
              <label for="profile-email" class="form-label">
                <AppIcon name="mdi-email" class="label-icon" />
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
                  :class="{
                    'is-invalid': store.errors.validation?.email,
                    'has-value': userProfile.personalInfo.email,
                  }"
                  aria-describedby="profile-email-error"
                  required
                  @focus="focusedField = 'email'"
                  @blur="focusedField = null"
                />
                <div class="input-status">
                  <AppIcon
                    v-if="
                      userProfile.personalInfo.email &&
                        isValidEmail(userProfile.personalInfo.email)
                    "
                    name="mdi-check"
                    class="success-icon"
                  />
                </div>
              </div>
              <div
                v-if="store.errors.validation?.email"
                id="profile-email-error"
                class="form-error"
              >
                <AppIcon name="mdi-alert-circle" />
                {{ store.errors.validation?.email }}
              </div>
              <div v-else-if="focusedField === 'email'" class="form-hint">
                <AppIcon name="mdi-information" />
                Primary contact for job opportunities
              </div>
            </div>

            <div class="form-field">
              <label for="profile-phone" class="form-label">
                <AppIcon name="mdi-phone" class="label-icon" />
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
                  <AppIcon
                    v-if="userProfile.personalInfo.phone"
                    name="mdi-check"
                    class="success-icon"
                  />
                </div>
              </div>
              <div v-if="focusedField === 'phone'" class="form-hint">
                <AppIcon name="mdi-information" />
                Optional - for recruiters to contact you
              </div>
            </div>

            <div class="form-field">
              <label for="profile-location" class="form-label">
                <AppIcon name="mdi-map-marker" class="label-icon" />
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
                  <AppIcon
                    v-if="userProfile.personalInfo.location"
                    name="mdi-check"
                    class="success-icon"
                  />
                </div>
              </div>
              <div v-if="focusedField === 'location'" class="form-hint">
                <AppIcon name="mdi-information" />
                Helps match you with local or remote opportunities
              </div>
            </div>
          </div>

          <!-- Professional Information Section -->
          <div class="form-section">
            <div class="section-divider">
              <AppIcon name="mdi-briefcase" class="section-icon" />
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
                    :class="{
                      'has-value': userProfile.personalInfo.currentRole,
                    }"
                    @focus="focusedField = 'role'"
                    @blur="focusedField = null"
                  />
                  <div class="input-status">
                    <AppIcon
                      v-if="userProfile.personalInfo.currentRole"
                      name="mdi-check"
                      class="success-icon"
                    />
                  </div>
                </div>
                <div v-if="focusedField === 'role'" class="form-hint">
                  <AppIcon name="mdi-information" />
                  Your current or most recent job title
                </div>
              </div>

              <div class="form-field">
                <label for="profile-company" class="form-label">
                  <AppIcon name="mdi-domain" class="label-icon" />
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
                    :class="{
                      'has-value': userProfile.personalInfo.currentCompany,
                    }"
                    @focus="focusedField = 'company'"
                    @blur="focusedField = null"
                  />
                  <div class="input-status">
                    <AppIcon
                      v-if="userProfile.personalInfo.currentCompany"
                      name="mdi-check"
                      class="success-icon"
                    />
                  </div>
                </div>
                <div v-if="focusedField === 'company'" class="form-hint">
                  <AppIcon name="mdi-information" />
                  Studio or company you work for
                </div>
              </div>

              <div class="form-field">
                <label for="profile-years" class="form-label">
                  <AppIcon name="mdi-calendar-clock" class="label-icon" />
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
                    :class="{
                      'has-value': userProfile.personalInfo.yearsExperience,
                    }"
                    @focus="focusedField = 'years'"
                    @blur="focusedField = null"
                  />
                  <div class="input-status">
                    <AppIcon
                      v-if="userProfile.personalInfo.yearsExperience"
                      name="mdi-check"
                      class="success-icon"
                    />
                  </div>
                </div>
                <div v-if="focusedField === 'years'" class="form-hint">
                  <AppIcon name="mdi-information" />
                  Total years in gaming industry
                </div>
              </div>
            </div>
          </div>

          <!-- Online Presence Section -->
          <div class="form-section">
            <div class="section-divider">
              <AppIcon name="mdi-web" class="section-icon" />
              <span class="section-title-small">Online Presence</span>
              <div class="divider-line"></div>
            </div>
            <div class="form-grid online-grid">
              <div class="form-field">
                <label for="profile-website" class="form-label">
                  <AppIcon name="mdi-web" class="label-icon" />
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
                    <AppIcon
                      v-if="userProfile.personalInfo.website"
                      name="mdi-check"
                      class="success-icon"
                    />
                  </div>
                </div>
                <div v-if="focusedField === 'website'" class="form-hint">
                  <AppIcon name="mdi-information" />
                  Your personal or professional website
                </div>
              </div>

              <div class="form-field">
                <label for="profile-linkedin" class="form-label">
                  <AppIcon name="mdi-linkedin" class="label-icon" />
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
                    <AppIcon
                      v-if="userProfile.personalInfo.linkedIn"
                      name="mdi-check"
                      class="success-icon"
                    />
                  </div>
                </div>
                <div v-if="focusedField === 'linkedin'" class="form-hint">
                  <AppIcon name="mdi-information" />
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
                    <AppIcon
                      v-if="userProfile.personalInfo.github"
                      name="mdi-check"
                      class="success-icon"
                    />
                  </div>
                </div>
                <div v-if="focusedField === 'github'" class="form-hint">
                  <AppIcon name="mdi-information" />
                  Code portfolio and open source contributions
                </div>
              </div>

              <div class="form-field">
                <label for="profile-portfolio" class="form-label">
                  <AppIcon name="mdi-folder-image" class="label-icon" />
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
                    <AppIcon
                      v-if="userProfile.personalInfo.portfolio"
                      name="mdi-check"
                      class="success-icon"
                    />
                  </div>
                </div>
                <div v-if="focusedField === 'portfolio'" class="form-hint">
                  <AppIcon name="mdi-information" />
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
                  {{ (userProfile.personalInfo.summary || "").length }}/500
                </div>
              </div>
              <div v-if="focusedField === 'summary'" class="form-hint">
                <AppIcon name="mdi-information" />
                <span>This appears on your resume and helps match you with relevant
                  opportunities. Aim for 2-3 sentences.</span>
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
                  leading-icon="mdi-auto-fix"
                  :disabled="saving"
                  @click="autoFillSuggestions"
                >
                  Smart Fill
                </UnifiedButton>
                <UnifiedButton
                  variant="glass"
                  size="sm"
                  leading-icon="mdi-eye-outline"
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
                  :leading-icon="saving ? 'mdi-loading' : 'mdi-content-save'"
                  :class="{ 'is-loading': saving }"
                >
                  {{ saving ? "Saving Profile..." : "Save Profile" }}
                </UnifiedButton>
              </div>
            </div>

            <!-- Success/Error Messages -->
            <Transition name="message-fade">
              <div
                v-if="profileSaved"
                class="success-message"
                aria-live="polite"
              >
                <AppIcon name="mdi-check-circle" />
                <span>Profile saved successfully! Your changes are now live.</span>
              </div>
            </Transition>

            <!-- Profile Completion Tips -->
            <div v-if="!isProfileComplete" class="completion-tips">
              <div class="tip-header">
                <AppIcon name="mdi-lightbulb-outline" />
                <span>Complete your profile to improve job matching</span>
              </div>
              <div class="tip-list">
                <div
                  v-for="tip in incompleteTips"
                  :key="tip.field"
                  class="tip-item"
                  @click="focusField(tip.field)"
                >
                  <AppIcon name="mdi-plus-circle-outline" />
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
import { computed, ref, watch } from "vue";
import { useAppStore } from "@/stores/app";
import { useToast } from "@/composables/useToast";
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";

// Props
const props = defineProps({
  userProfile: {
    type: Object,
    default: () => ({
      personalInfo: {},
    }),
  },
  saving: {
    type: Boolean,
    default: false,
  },
  isTabbed: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(["save", "profile-preview", "profile-update", "profile-reset"]);

// Store
const store = useAppStore();
const toast = useToast();

// Local state
const profileSaved = ref(false);
const focusedField = ref(null);

// Computed properties
const completionPercentage = computed(() => {
  const fields = [
    "name",
    "email",
    "location",
    "currentRole",
    "currentCompany",
    "yearsExperience",
    "summary",
  ];
  const completed = fields.filter((field) => {
    const value = props.userProfile.personalInfo?.[field];
    return value && String(value).trim().length > 0;
  });
  return Math.round((completed.length / fields.length) * 100);
});

const isProfileComplete = computed(() => completionPercentage.value >= 80);

const hasRequiredFields = computed(() => {
  const name = props.userProfile.personalInfo?.name;
  const email = props.userProfile.personalInfo?.email;
  return name && email && name.trim().length > 0 && email.trim().length > 0;
});

const incompleteTips = computed(() => {
  const tips = [];
  const info = props.userProfile.personalInfo || {};

  if (!info.currentRole) {
    tips.push({
      field: "role",
      message: "Add your current role to improve job matching",
    });
  }
  if (!info.summary) {
    tips.push({
      field: "summary",
      message: "Write a professional summary to stand out",
    });
  }
  if (!info.linkedIn && !info.github && !info.portfolio) {
    tips.push({
      field: "linkedin",
      message: "Add your LinkedIn or GitHub to showcase experience",
    });
  }
  if (!info.location) {
    tips.push({
      field: "location",
      message: "Add location for better job opportunities",
    });
  }

  return tips.slice(0, 3);
});

// Methods
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const focusField = (fieldName) => {
  const fieldId = `profile-${fieldName}`;
  const element = document.getElementById(fieldId);
  if (element) {
    element.focus();
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }
};

const autoFillSuggestions = async () => {
  try {
    const { useAIService } = await import("@/composables/useAIService");
    const aiService = useAIService();

    if (!aiService.isReady.value) {
      toast.error(
        "AI service not available. Please configure your API key in settings.",
      );
      return;
    }

    const suggestions = await aiService.generateProfileSuggestions({
      currentData: props.userProfile,
      context: "gaming_industry",
    });

    if (suggestions) {
      // Emit event to parent to update profile with suggestions
      emit("profile-update", suggestions);
      toast.success("Profile suggestions applied");
    }
  } catch (error) {
    console.error("Auto-fill failed:", error);
    toast.error("Failed to generate profile suggestions");
  }
};

const previewProfile = () => {
  // Create a preview modal or dialog showing formatted profile data
  const formattedProfile = {
    ...props.userProfile,
    skills: Array.isArray(props.userProfile.skills)
      ? props.userProfile.skills
      : props.userProfile.skills
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean) || [],
  };

  // Emit event to parent or show modal
  emit("profile-preview", formattedProfile);

  // Alternative: Show in-place preview
  toast.info("Profile preview - check console for formatted data");
  console.info("Profile Preview:", JSON.stringify(formattedProfile, null, 2));
};

const resetForm = () => {
  if (
    confirm(
      "Are you sure you want to reset all fields? This will clear any unsaved changes.",
    )
  ) {
    // Emit event to parent to reset profile
    emit("profile-reset");
  }
};

// Watch for successful save
watch(
  () => props.saving,
  (newSaving, oldSaving) => {
    if (oldSaving && !newSaving) {
      profileSaved.value = true;
      setTimeout(() => {
        profileSaved.value = false;
      }, 4000);
    }
  },
);

// Watch for completion changes
watch(completionPercentage, (newPercentage) => {
  if (newPercentage === 100 && !profileSaved.value) {
    // Show profile completion celebration
    profileSaved.value = true;
    // Could add achievement notification here in the future
  }
});
</script>

<style scoped>
.profile-section {
  background: var(--glass-bg);
  color: var(--text-primary);
  transition:
    background-color var(--duration-normal),
    color var(--duration-normal);
}

.profile-section:not(.is-tabbed) {
  padding: var(--card-padding);
}

.section-header {
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  transition: color var(--duration-normal);
}

.section-subtitle {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  transition: color var(--duration-normal);
}

.profile-completion-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.completion-ring {
  position: relative;
  background: conic-gradient(
  );
  display: flex;
  align-items: center;
  justify-content: center;
}

.completion-ring::before {
  content: "";
  position: absolute;
  background: var(--background-secondary);
}

.completion-text {
  position: relative;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  transition: color var(--duration-normal);
}

.completion-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  transition: color var(--duration-normal);
}

.form-section {
  margin-bottom: var(--section-spacing);
}

.section-divider {
  display: flex;
  align-items: center;
}

.section-icon {
  font-size: var(--font-size-lg);
}

.section-title-small {
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  white-space: nowrap;
  transition: color var(--duration-normal);
}

.divider-line {
}

.form-grid {
  display: grid;
  gap: var(--field-spacing);
}

.essential-grid {
}

.professional-grid {
}

.online-grid {
}

.form-field {
  display: flex;
  flex-direction: column;
}

.form-field.full-width {
}

.form-field.required .required-asterisk {
}

.form-label {
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  transition: color var(--duration-normal);
}

.label-icon {
  font-size: var(--font-size-base);
  color: var(--text-tertiary);
  transition: color var(--duration-normal);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.enhanced-input,
.glass-input-field {
  background: var(--glass-bg);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  transition: all var(--duration-normal);
  box-shadow: var(--glass-shadow);
}

.enhanced-input::placeholder,
.glass-input-field::placeholder {
  color: var(--text-muted);
  transition: color var(--duration-normal);
}

.enhanced-input:focus,
.glass-input-field:focus {
  outline: none;
  background: var(--glass-hover-bg);
  box-shadow:
    var(--glass-shadow),
}

.enhanced-input.has-value,
.glass-input-field.has-value {
  box-shadow:
}

.enhanced-input.is-invalid {
}

.input-status {
  position: absolute;
  display: flex;
  align-items: center;
  pointer-events: none;
}

.success-icon {
  font-size: var(--font-size-lg);
  transition: color var(--duration-normal);
  filter: drop-shadow(
  );
}

.textarea-wrapper {
  position: relative;
}

.enhanced-textarea {
  background: var(--glass-bg);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  resize: vertical;
  transition: all var(--duration-normal);
  backdrop-filter: var(--glass-backdrop-filter);
  -webkit-backdrop-filter: var(--glass-backdrop-filter);
  box-shadow: var(--glass-shadow);
}

.enhanced-textarea::placeholder {
  color: var(--text-muted);
  transition: color var(--duration-normal);
}

.enhanced-textarea:focus {
  outline: none;
  background: var(--glass-hover-bg);
  box-shadow:
    var(--glass-shadow),
}

.enhanced-textarea.has-value {
}

.character-count {
  position: absolute;
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  -webkit-backdrop-filter: var(--glass-backdrop-filter);
  border-radius: var(--radius-sm);
  box-shadow: var(--glass-shadow);
  transition: all var(--duration-normal);
}

.form-error {
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  transition: color var(--duration-normal);
}

.form-hint {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  display: flex;
  align-items: flex-start;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  -webkit-backdrop-filter: var(--glass-backdrop-filter);
  border-radius: var(--radius-md);
  box-shadow: var(--glass-shadow);
  transition: all var(--duration-normal);
}

.form-actions-section {
  margin-top: var(--section-spacing);
}

.actions-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quick-actions,
.primary-actions {
  display: flex;
  align-items: center;
}

.success-message {
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  -webkit-backdrop-filter: var(--glass-backdrop-filter);
  border-radius: var(--radius-lg);
  box-shadow:
    var(--glass-shadow),
  transition: all var(--duration-normal);
}

.completion-tips {
  background: var(--glass-bg);
  border-radius: var(--radius-lg);
}

.tip-header {
  display: flex;
  align-items: center;
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
  transition: color var(--duration-normal);
}

.tip-list {
  display: flex;
  flex-direction: column;
}

.tip-item {
  display: flex;
  align-items: center;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--duration-normal);
}

.tip-item:hover {
  background: var(--glass-hover-bg);
  color: var(--text-primary);
  border-color: var(--glass-border);
  backdrop-filter: var(--glass-backdrop-filter);
  -webkit-backdrop-filter: var(--glass-backdrop-filter);
  box-shadow: var(--glass-shadow);
}

.is-loading {
  cursor: wait;
}

.is-loading .mdi-loading {
}

.message-fade-enter-active,
.message-fade-leave-active {
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.message-fade-enter-from,
.message-fade-leave-to {
}

.enhanced-glass-section {
  background: var(--glass-bg);
  box-shadow: var(--glass-shadow);
  transition: all var(--duration-normal);
}

.enhanced-glass-section:hover {
  box-shadow:
    var(--glass-shadow),
}

.enhanced-glass-section .section-divider {
  border-radius: var(--radius-lg);
}

.enhanced-glass-section .input-status {
  background: var(--glass-bg);
  justify-content: center;
  transition: all var(--duration-fast);
}

.enhanced-glass-section .success-icon {
  font-size: var(--font-size-sm);
  filter: drop-shadow(
  );
}

.enhanced-glass-section .completion-tips {
  background: var(--glass-bg);
  box-shadow: var(--glass-shadow);
}


[data-theme="dark"] .enhanced-glass-section {
  background: var(--glass-bg);
  border-color: var(--glass-border);
  box-shadow: var(--glass-shadow);
}

[data-theme="dark"] .glass-input-field {
  background: var(--glass-bg);
  border-color: var(--glass-border);
  color: var(--text-primary);
}

[data-theme="dark"] .glass-input-field:focus {
  background: var(--glass-hover-bg);
  box-shadow:
    var(--glass-shadow);
}

[data-theme="dark"] .enhanced-glass-section .section-divider {
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
  box-shadow:
    var(--glass-shadow);
}

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
    backdrop-filter: none;
  }

  .enhanced-glass-section .completion-tips {
    backdrop-filter: none;
  }
}

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .completion-ring {
  }

  .completion-ring::before {
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
  }
}

@keyframes spin {
  from {
  }
  to {
  }
}
</style>
