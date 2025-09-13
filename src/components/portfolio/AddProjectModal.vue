<template>
  <div v-if="visible" class="modal-overlay" @click="closeModal">
    <div class="modal-dialog glass-card" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <AppIcon name="mdi-plus-circle" />
          Add New Project
        </h3>
        <UnifiedButton
          variant="ghost"
          size="sm"
          icon="mdi-close"
          @click="closeModal"
        />
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <!-- Project Title -->
          <div class="form-group">
            <label for="project-title" class="form-label required">Project Title</label>
            <input
              id="project-title"
              v-model="formData.title"
              type="text"
              class="form-control glass-input"
              placeholder="e.g., Indie Puzzle Game, Portfolio Website"
              required
              autofocus
            />
          </div>

          <!-- Project Description -->
          <div class="form-group">
            <label for="project-description" class="form-label">Description</label>
            <textarea
              id="project-description"
              v-model="formData.description"
              class="form-control glass-input"
              rows="3"
              placeholder="Brief description of your project..."
            ></textarea>
          </div>

          <!-- Project Type -->
          <div class="form-group">
            <label for="project-type" class="form-label">Project Type</label>
            <select
              id="project-type"
              v-model="formData.type"
              class="form-control glass-input"
            >
              <option value="">Select project type</option>
              <option value="game">Game Project</option>
              <option value="website">Website</option>
              <option value="application">Application</option>
              <option value="mod">Game Mod</option>
              <option value="artwork">Artwork</option>
              <option value="music">Music/Audio</option>
              <option value="writing">Writing</option>
              <option value="other">Other</option>
            </select>
          </div>

          <!-- Links -->
          <div class="form-group">
            <label for="project-url" class="form-label">Project URL</label>
            <input
              id="project-url"
              v-model="formData.url"
              type="url"
              class="form-control glass-input"
              placeholder="https://..."
            />
            <small class="form-hint">Link to live demo, Steam page, itch.io, etc.</small>
          </div>

          <div class="form-group">
            <label for="github-url" class="form-label">GitHub Repository</label>
            <input
              id="github-url"
              v-model="formData.githubUrl"
              type="url"
              class="form-control glass-input"
              placeholder="https://github.com/username/repository"
            />
          </div>

          <!-- Engine and Platform -->
          <div class="form-row">
            <div class="form-group">
              <label for="project-engine" class="form-label">Engine/Technology</label>
              <select
                id="project-engine"
                v-model="formData.engine"
                class="form-control glass-input"
              >
                <option value="">Select engine</option>
                <option value="Unity">Unity</option>
                <option value="Unreal">Unreal Engine</option>
                <option value="Godot">Godot</option>
                <option value="JavaScript">JavaScript</option>
                <option value="React">React</option>
                <option value="Vue">Vue.js</option>
                <option value="Python">Python</option>
                <option value="C#">C#</option>
                <option value="C++">C++</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div class="form-group">
              <label for="project-platform" class="form-label">Platform</label>
              <select
                id="project-platform"
                v-model="formData.platform"
                class="form-control glass-input"
              >
                <option value="">Select platform</option>
                <option value="PC">PC</option>
                <option value="Console">Console</option>
                <option value="Mobile">Mobile</option>
                <option value="Web">Web</option>
                <option value="VR">VR</option>
                <option value="AR">AR</option>
              </select>
            </div>
          </div>

          <!-- Tags -->
          <div class="form-group">
            <label for="project-tags" class="form-label">Tags</label>
            <input
              id="project-tags"
              v-model="tagsInput"
              type="text"
              class="form-control glass-input"
              placeholder="e.g., puzzle, multiplayer, 2D (comma-separated)"
            />
            <small class="form-hint">Separate tags with commas</small>
          </div>

          <!-- Featured Toggle -->
          <div class="form-group">
            <label class="form-checkbox">
              <input v-model="formData.featured" type="checkbox" />
              <span class="checkmark"></span>
              Feature this project in my portfolio
            </label>
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <UnifiedButton variant="ghost" @click="closeModal">
          Cancel
        </UnifiedButton>
        <UnifiedButton
          variant="primary"
          :loading="isSubmitting"
          @click="handleSubmit"
        >
          <AppIcon name="mdi-plus" />
          Add Project
        </UnifiedButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import { useToast } from "@/composables/useToast";
import { PortfolioService } from "@/shared/services/PortfolioService";

interface ProjectFormData {
  title: string;
  description: string;
  type: string;
  url: string;
  githubUrl: string;
  engine: string;
  platform: string;
  featured: boolean;
}

interface Props {
  visible: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  submit: [project: any];
}>();

const { toast } = useToast();

const formData = ref<ProjectFormData>({
  title: "",
  description: "",
  type: "",
  url: "",
  githubUrl: "",
  engine: "",
  platform: "",
  featured: false,
});

const tagsInput = ref("");
const isSubmitting = ref(false);

// Parse tags from comma-separated input
const tags = computed(() => {
  return tagsInput.value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
});

// Auto-fetch metadata when URL changes
watch(
  () => formData.value.url,
  async (newUrl) => {
    if (newUrl && !formData.value.description) {
      try {
        const metadata = await PortfolioService.fetchLinkMetadata(newUrl);
        if (metadata.description) {
          formData.value.description = metadata.description;
        }
      } catch (error) {
        // Silently fail - user can enter description manually
      }
    }
  },
);

const closeModal = () => {
  emit("close");
  resetForm();
};

const resetForm = () => {
  formData.value = {
    title: "",
    description: "",
    type: "",
    url: "",
    githubUrl: "",
    engine: "",
    platform: "",
    featured: false,
  };
  tagsInput.value = "";
  isSubmitting.value = false;
};

const handleSubmit = async () => {
  if (!formData.value.title.trim()) {
    toast.error("Project title is required");
    return;
  }

  isSubmitting.value = true;

  try {
    const project = {
      ...formData.value,
      title: formData.value.title.trim(),
      description: formData.value.description.trim(),
      tags: tags.value,
      engines: formData.value.engine ? [formData.value.engine] : [],
      platforms: formData.value.platform ? [formData.value.platform] : [],
      date: new Date().toISOString().split("T")[0], // Current date as YYYY-MM-DD
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    emit("submit", project);
    toast.success("Project added successfully!");
    closeModal();
  } catch (error) {
    console.error("Error adding project:", error);
    toast.error("Failed to add project");
  } finally {
    isSubmitting.value = false;
  }
};

// Reset form when modal closes
watch(
  () => props.visible,
  (visible) => {
    if (!visible) {
      resetForm();
    }
  },
);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--spacing-4);
}

.modal-dialog {
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--glass-border);
}

.modal-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  color: var(--text-primary);
}

.modal-body {
  padding: var(--spacing-6);
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-3);
  padding: var(--spacing-6);
  border-top: 1px solid var(--glass-border);
}

.form-group {
  margin-bottom: var(--spacing-4);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-4);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-2);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.form-label.required::after {
  content: " *";
  color: var(--color-error);
}

.form-control {
  width: 100%;
  padding: var(--spacing-3);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--glass-surface);
  backdrop-filter: var(--glass-backdrop-blur);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  transition: all var(--duration-fast);
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px
    color-mix(in srgb, var(--color-primary-500) 20%, transparent);
  background: var(--glass-elevated);
}

.form-control::placeholder {
  color: var(--text-tertiary);
}

.form-hint {
  display: block;
  margin-top: var(--spacing-1);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.form-checkbox {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.form-checkbox input[type="checkbox"] {
  margin: 0;
  width: 18px;
  height: 18px;
  accent-color: var(--color-primary-500);
}

  .modal-overlay {
  }

  .modal-dialog {
  }

  .form-row {
  }

  .modal-header,
  .modal-body,
  .modal-footer {
  }
}
</style>
