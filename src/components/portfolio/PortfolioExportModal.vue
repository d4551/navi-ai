import { defineEmits, defineProps } from 'vue'
<template>
  <div
    v-if="show"
    class="modal show d-block"
    style="background-color: rgba(0, 0, 0, 0.5)"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <AppIcon name="mdi-download-outline" class="me-2" />Export Portfolio
          </h5>
          <UnifiedButton
            variant="ghost"
            size="sm"
            icon-only
            :icon="'mdi-close'"
            aria-label="Close"
            @click="$emit('close')"
          />
        </div>
        <div class="modal-body">
          <p class="text-muted mb-4">
            Choose an export format for
            {{ (portfolio && portfolio.length) || 0 }} portfolio items.
          </p>

          <div class="export-options">
            <!-- HTML Standalone -->
            <div class="export-option" @click="emitExport('html')">
              <div class="export-icon">
                <AppIcon name="mdi-web" />
              </div>
              <div class="export-content">
                <h6 class="export-title">Standalone HTML Site</h6>
                <p class="export-description">
                  Complete portfolio as a single HTML file with embedded CSS and
                  JavaScript. Perfect for sharing or hosting.
                </p>
                <div class="export-badges">
                  <span class="badge bg-primary">Recommended</span>
                  <span class="badge bg-success">Self-contained</span>
                </div>
              </div>
              <AppIcon name="mdi-chevron-right" class="export-arrow" />
            </div>

            <!-- Website ZIP -->
            <div class="export-option" @click="emitExport('website')">
              <div class="export-icon">
                <AppIcon name="mdi-folder-zip" />
              </div>
              <div class="export-content">
                <h6 class="export-title">Complete Website (ZIP)</h6>
                <p class="export-description">
                  Full website structure with separate CSS, JS, and image files.
                  Ideal for hosting on web servers.
                </p>
                <div class="export-badges">
                  <span class="badge bg-info">Pro</span>
                </div>
              </div>
              <AppIcon name="mdi-chevron-right" class="export-arrow" />
            </div>

            <!-- PDF -->
            <div class="export-option" @click="emitExport('pdf')">
              <div class="export-icon">
                <AppIcon name="mdi-file-pdf" />
              </div>
              <div class="export-content">
                <h6 class="export-title">PDF Document</h6>
                <p class="export-description">
                  Professional PDF portfolio document for printing or email
                  attachments.
                </p>
              </div>
              <AppIcon name="mdi-chevron-right" class="export-arrow" />
            </div>

            <!-- JSON Data -->
            <div class="export-option" @click="emitExport('json')">
              <div class="export-icon">
                <AppIcon name="mdi-code-json" />
              </div>
              <div class="export-content">
                <h6 class="export-title">JSON Data</h6>
                <p class="export-description">
                  Raw portfolio data for importing into other applications or
                  custom processing.
                </p>
                <div class="export-badges">
                  <span class="badge bg-secondary">Developer</span>
                </div>
              </div>
              <AppIcon name="mdi-chevron-right" class="export-arrow" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <UnifiedButton variant="secondary" @click="$emit('close')">
            Close
          </UnifiedButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
const props = defineProps({
  show: { type: Boolean, default: false },
  portfolio: { type: Array, default: () => [] },
});
const emit = defineEmits(["export", "close"]);

function emitExport(fmt) {
  emit("export", fmt);
}
</script>

<style scoped>
.modal-content {
  border-radius: 12px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
}

.modal-header {
  border-bottom: 1px solid var(--glass-border);
  background: var(--surface-elevated);
}

.modal-title {
  display: flex;
  align-items: center;
  font-weight: 600;
}

.export-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.export-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  background: var(--surface-elevated);
  cursor: pointer;
  transition: all 0.2s ease;
}

.export-option:hover {
  border-color: var(--color-primary-500);
  background: var(--glass-bg-light);
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.export-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--color-primary-100);
  color: var(--color-primary-600);
  font-size: 1.5rem;
}

.export-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.export-title {
  margin: 0;
  font-weight: 600;
  color: var(--text-primary);
}

.export-description {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.export-badges {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}

.badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.bg-primary {
  background: var(--color-primary-500);
  color: white;
}
.bg-success {
  background: var(--color-success-500);
  color: white;
}
.bg-info {
  background: var(--color-info-500);
  color: white;
}
.bg-secondary {
  background: var(--color-secondary-500);
  color: white;
}

.export-arrow {
  color: var(--text-tertiary);
  font-size: 1.2rem;
}

.export-option:hover .export-arrow {
  color: var(--color-primary-600);
  transform: translateX(2px);
}

.modal-footer {
  border-top: 1px solid var(--glass-border);
  background: var(--surface-elevated);
}
</style>
