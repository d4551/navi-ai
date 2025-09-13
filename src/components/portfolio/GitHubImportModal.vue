<template>
  <div v-if="visible" class="modal-overlay" @click="closeModal">
    <div class="modal-dialog glass-card" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <AppIcon name="mdi-github" />
          Import from GitHub
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
          <div class="form-group">
            <label for="github-url" class="form-label required">GitHub Repository URL</label>
            <input
              id="github-url"
              v-model="githubUrl"
              type="url"
              class="form-control glass-input"
              placeholder="https://github.com/username/repository"
              required
              autofocus
            />
            <small class="form-hint">Enter the full GitHub repository URL to import project
              details</small>
          </div>

          <div v-if="isValidUrl" class="preview-info">
            <div class="info-item">
              <strong>Repository:</strong> {{ repoInfo.name }}
            </div>
            <div v-if="repoInfo.owner" class="info-item">
              <strong>Owner:</strong> {{ repoInfo.owner }}
            </div>
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
          :disabled="!isValidUrl"
          @click="handleSubmit"
        >
          <AppIcon name="mdi-download" />
          Import Repository
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

interface Props {
  visible: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  submit: [githubUrl: string];
}>();

const { toast } = useToast();

const githubUrl = ref("");
const isSubmitting = ref(false);

const isValidUrl = computed(() => {
  try {
    const url = new URL(githubUrl.value);
    return url.hostname === "github.com" && url.pathname.split("/").length >= 3;
  } catch {
    return false;
  }
});

const repoInfo = computed(() => {
  if (!isValidUrl.value) return { name: "", owner: "" };

  try {
    const url = new URL(githubUrl.value);
    const pathParts = url.pathname.split("/").filter(Boolean);
    return {
      owner: pathParts[0],
      name: pathParts[1],
    };
  } catch {
    return { name: "", owner: "" };
  }
});

const closeModal = () => {
  emit("close");
  githubUrl.value = "";
  isSubmitting.value = false;
};

const handleSubmit = async () => {
  if (!isValidUrl.value) {
    toast.error("Please enter a valid GitHub repository URL");
    return;
  }

  isSubmitting.value = true;

  try {
    emit("submit", githubUrl.value);
    toast.success("GitHub repository imported successfully!");
    closeModal();
  } catch (error) {
    console.error("Error importing GitHub repository:", error);
    toast.error("Failed to import repository");
  } finally {
    isSubmitting.value = false;
  }
};

// Reset form when modal closes
watch(
  () => props.visible,
  (visible) => {
    if (!visible) {
      githubUrl.value = "";
      isSubmitting.value = false;
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
  max-width: 500px;
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

.preview-info {
  margin-top: var(--spacing-4);
  padding: var(--spacing-3);
  background: var(--glass-elevated);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
}

.info-item {
  margin-bottom: var(--spacing-1);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.info-item:last-child {
  margin-bottom: 0;
}

  .modal-overlay {
  }

  .modal-header,
  .modal-body,
  .modal-footer {
  }
}
</style>
