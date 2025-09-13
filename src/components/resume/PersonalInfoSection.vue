<template>
  <div class="personal-info-section">
    <div class="section-description">
      <p>Provide your basic contact information and professional details.</p>
    </div>

    <form class="info-form" @submit.prevent="handleSubmit">
      <!-- Profile Photo -->
      <div class="form-group photo-upload">
        <label class="form-label">Profile Photo (Optional)</label>
        <div class="photo-container">
          <div v-if="formData.photo" class="photo-preview">
            <img :src="formData.photo" alt="Profile photo" />
            <button type="button" class="remove-photo" @click="removePhoto">
              <AppIcon name="mdi-close-circle-outline" />
            </button>
          </div>
          <div v-else class="photo-placeholder" @click="triggerPhotoUpload">
            <AppIcon name="mdi-camera-plus" />
            <span>Add Photo</span>
          </div>
          <input
            ref="photoInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handlePhotoUpload"
          />
        </div>
      </div>

      <!-- Name Fields -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label required">First Name</label>
          <input
            v-model="formData.firstName"
            type="text"
            class="form-input"
            :class="{ error: errors.firstName }"
            placeholder="Enter your first name"
            required
          />
          <div v-if="errors.firstName" class="error-message">
            {{ errors.firstName }}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label required">Last Name</label>
          <input
            v-model="formData.lastName"
            type="text"
            class="form-input"
            :class="{ error: errors.lastName }"
            placeholder="Enter your last name"
            required
          />
          <div v-if="errors.lastName" class="error-message">
            {{ errors.lastName }}
          </div>
        </div>
      </div>

      <!-- Professional Title -->
      <div class="form-group">
        <label class="form-label">Professional Title</label>
        <input
          v-model="formData.title"
          type="text"
          class="form-input"
          placeholder="e.g., Software Engineer, Marketing Manager"
        />
        <div class="form-help">
          This will appear below your name on the resume
        </div>
      </div>

      <!-- Contact Information -->
      <div class="form-section">
        <h3 class="section-title">Contact Information</h3>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">Email</label>
            <input
              v-model="formData.email"
              type="email"
              class="form-input"
              :class="{ error: errors.email }"
              placeholder="your.email@example.com"
              required
            />
            <div v-if="errors.email" class="error-message">
              {{ errors.email }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label required">Phone</label>
            <input
              v-model="formData.phone"
              type="tel"
              class="form-input"
              :class="{ error: errors.phone }"
              placeholder="(555) 123-4567"
              required
            />
            <div v-if="errors.phone" class="error-message">
              {{ errors.phone }}
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Address</label>
          <input
            v-model="formData.address"
            type="text"
            class="form-input"
            placeholder="City, State/Province, Country"
          />
          <div class="form-help">
            You can include just your city and country for privacy
          </div>
        </div>
      </div>

      <!-- Online Presence -->
      <div class="form-section">
        <h3 class="section-title">Online Presence</h3>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">LinkedIn Profile</label>
            <div class="input-with-icon">
              <AppIcon name="mdi-linkedin" class="input-icon" />
              <input
                v-model="formData.linkedin"
                type="url"
                class="form-input with-icon"
                placeholder="linkedin.com/in/yourprofile"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Portfolio/Website</label>
            <div class="input-with-icon">
              <AppIcon name="mdi-web" class="input-icon" />
              <input
                v-model="formData.website"
                type="url"
                class="form-input with-icon"
                placeholder="yourportfolio.com"
              />
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">GitHub Profile</label>
            <div class="input-with-icon">
              <AppIcon name="mdi-github" class="input-icon" />
              <input
                v-model="formData.github"
                type="url"
                class="form-input with-icon"
                placeholder="github.com/yourusername"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Other Profile</label>
            <input
              v-model="formData.other"
              type="url"
              class="form-input"
              placeholder="Any other relevant profile URL"
            />
          </div>
        </div>
      </div>

      <!-- AI Enhancement Button -->
      <div class="ai-section">
        <button type="button" class="ai-enhance-btn" @click="enhanceWithAI">
          <AppIcon name="mdi-robot" />
          Enhance with AI
        </button>
        <p class="ai-description">
          Get AI suggestions to optimize your professional title and summary
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="form-actions">
        <UnifiedButton variant="glass" @click="saveDraft">
          Save Draft
        </UnifiedButton>
        <UnifiedButton variant="primary" type="submit">
          Continue to Summary
        </UnifiedButton>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, reactive, watch } from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";

export default {
  name: "PersonalInfoSection",
  components: {
    AppIcon,
    UnifiedButton,
  },
  props: {
    modelValue: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["update:modelValue", "continue", "save-draft", "ai-enhance"],
  setup(props, { emit }) {
    const photoInput = ref(null);

    const formData = reactive({
      firstName: "",
      lastName: "",
      title: "",
      email: "",
      phone: "",
      address: "",
      linkedin: "",
      website: "",
      github: "",
      other: "",
      photo: null,
      ...props.modelValue,
    });

    const errors = reactive({});

    const validateForm = () => {
      const newErrors = {};

      if (!formData.firstName?.trim()) {
        newErrors.firstName = "First name is required";
      }

      if (!formData.lastName?.trim()) {
        newErrors.lastName = "Last name is required";
      }

      if (!formData.email?.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }

      if (!formData.phone?.trim()) {
        newErrors.phone = "Phone number is required";
      }

      Object.assign(errors, newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
      if (validateForm()) {
        emit("update:modelValue", { ...formData });
        emit("continue", "summary");
      }
    };

    const saveDraft = () => {
      emit("update:modelValue", { ...formData });
      emit("save-draft");
    };

    const triggerPhotoUpload = () => {
      photoInput.value?.click();
    };

    const handlePhotoUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          formData.photo = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    };

    const removePhoto = () => {
      formData.photo = null;
      if (photoInput.value) {
        photoInput.value.value = "";
      }
    };

    const enhanceWithAI = () => {
      emit("ai-enhance", {
        section: "personal",
        data: { ...formData },
      });
    };

    // Watch for changes and emit updates
    watch(formData, (newData) => {
      emit("update:modelValue", { ...newData });
    });

    // Clear errors when user starts typing
    watch(
      () => formData.firstName,
      () => delete errors.firstName,
    );
    watch(
      () => formData.lastName,
      () => delete errors.lastName,
    );
    watch(
      () => formData.email,
      () => delete errors.email,
    );
    watch(
      () => formData.phone,
      () => delete errors.phone,
    );

    return {
      formData,
      errors,
      photoInput,
      handleSubmit,
      saveDraft,
      triggerPhotoUpload,
      handlePhotoUpload,
      removePhoto,
      enhanceWithAI,
    };
  },
};
</script>

<style scoped>
.personal-info-section {
  max-width: 800px;
  margin: 0 auto;
}

.section-description {
  margin-bottom: var(--spacing-6);
}

.section-description p {
  font: var(--md-sys-typescale-body-medium-font);
  color: var(--md-sys-color-on-surface-variant);
  margin: 0;
}

.info-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-4);
}

.form-label {
  font: var(--md-sys-typescale-label-large-font);
  color: var(--md-sys-color-on-surface);
  font-weight: 500;
}

.form-label.required::after {
  content: " *";
  color: var(--md-sys-color-error);
}

.form-input {
  padding: var(--spacing-4);
  border: 1px solid var(--md-sys-color-outline);
  border-radius: 8px;
  font: var(--md-sys-typescale-body-large-font);
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--md-sys-color-primary);
  box-shadow: 0 0 0 2px var(--md-sys-color-primary-container);
}

.form-input.error {
  border-color: var(--md-sys-color-error);
}

.form-input::placeholder {
  color: var(--md-sys-color-on-surface-variant);
}

.input-with-icon {
  position: relative;
}

.input-icon {
  position: absolute;
  left: var(--spacing-4);
  top: 50%;
  transform: translateY(-50%);
  color: var(--md-sys-color-on-surface-variant);
  font-size: 20px;
  z-index: 1;
}

.form-input.with-icon {
  padding-left: var(--spacing-12);
}

.form-help {
  font: var(--md-sys-typescale-body-small-font);
  color: var(--md-sys-color-on-surface-variant);
  margin-top: var(--spacing-1);
}

.error-message {
  font: var(--md-sys-typescale-body-small-font);
  color: var(--md-sys-color-error);
  margin-top: var(--spacing-1);
}

.form-section {
  padding: var(--spacing-6) 0;
  border-top: 1px solid var(--md-sys-color-outline-variant);
}

.form-section:first-child {
  border-top: none;
  padding-top: 0;
}

.section-title {
  font: var(--md-sys-typescale-title-medium-font);
  color: var(--md-sys-color-on-surface);
  margin: 0 0 var(--spacing-4) 0;
}

.photo-upload {
  align-items: center;
  margin-bottom: var(--spacing-4);
}

.photo-container {
  width: 120px;
  height: 120px;
  margin-top: var(--spacing-2);
}

.photo-preview {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 60px;
  overflow: hidden;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-photo {
  position: absolute;
  top: var(--spacing-2);
  right: var(--spacing-2);
  width: 24px;
  height: 24px;
  border-radius: 12px;
  border: none;
  background-color: var(--md-sys-color-error);
  color: var(--md-sys-color-on-error);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  border: 2px dashed var(--md-sys-color-outline);
  border-radius: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
  transition: all 0.2s ease;
}

.photo-placeholder:hover {
  border-color: var(--md-sys-color-primary);
  background-color: var(--md-sys-color-primary-container);
}

.photo-placeholder i {
  font-size: 24px;
  margin-bottom: var(--spacing-2);
}

.photo-placeholder span {
  font: var(--md-sys-typescale-label-small-font);
  text-align: center;
}

.ai-section {
  padding: var(--spacing-5);
  background-color: var(--md-sys-color-primary-container);
  border-radius: 12px;
  text-align: center;
}

.ai-enhance-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-6);
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  border: none;
  border-radius: 20px;
  font: var(--md-sys-typescale-label-large-font);
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: var(--spacing-2);
}

.ai-enhance-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.ai-description {
  font: var(--md-sys-typescale-body-small-font);
  color: var(--md-sys-color-on-primary-container);
  margin: 0;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  padding-top: var(--spacing-6);
  border-top: 1px solid var(--md-sys-color-outline-variant);
}


  .form-row {
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
  }
}
</style>
