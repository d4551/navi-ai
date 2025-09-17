<template>
  <div class="application-tracker">
    <div v-if="applications.length === 0" class="empty-state text-center py-5">
      <AppIcon
        name="mdi-clipboard-text-outline"
        class="display-6 text-muted d-block mb-3"
      />
      <h6 class="mb-2">No applications tracked yet</h6>
      <p class="text-muted small mb-0">
        Apply to jobs and they will appear here for progress tracking.
      </p>
    </div>

    <div v-else class="table-container">
      <div class="table-wrapper">
        <table class="glassmorphic-table">
          <thead>
            <tr class="table-header">
              <th class="th-glassmorphic">
                <div class="header-content">
                  <AppIcon name="mdi-briefcase-variant" class="me-2" />
                  Role
                </div>
              </th>
              <th class="th-glassmorphic">
                <div class="header-content">
                  <AppIcon name="mdi-domain" class="me-2" />
                  Company
                </div>
              </th>
              <th class="th-glassmorphic">
                <div class="header-content">
                  <AppIcon name="mdi-calendar" class="me-2" />
                  Date
                </div>
              </th>
              <th class="th-glassmorphic">
                <div class="header-content">
                  <AppIcon name="mdi-chart-bar" color="info" />
                  Status
                </div>
              </th>
              <th class="th-glassmorphic">
                <div class="header-content">
                  <AppIcon name="mdi-note-text" class="me-2" />
                  Notes
                </div>
              </th>
              <th class="th-glassmorphic actions-header">
                <div class="header-content">
                  <AppIcon name="mdi-cog" />
                  Actions
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="table-body">
            <tr
              v-for="(app, index) in applications"
              :key="app.id"
              class="table-row"
              :class="`row-${index % 2}`"
            >
              <td class="td-glassmorphic role-cell">
                <div class="cell-content">
                  <span class="role-title">{{ app.title }}</span>
                </div>
              </td>
              <td class="td-glassmorphic company-cell">
                <div class="cell-content">
                  <span class="company-name">{{ app.company }}</span>
                </div>
              </td>
              <td class="td-glassmorphic date-cell">
                <div class="cell-content">
                  <span class="date-text">{{
                    formatDate(app.appliedDate)
                  }}</span>
                </div>
              </td>
              <td class="td-glassmorphic status-cell">
                <div class="cell-content">
                  <select
                    v-model="app.status"
                    class="status-select glassmorphic-select"
                    @change="emitStatus(app)"
                  >
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </td>
              <td class="td-glassmorphic notes-cell">
                <div class="cell-content">
                  <div class="notes-container">
                    <ul class="notes-list">
                      <li
                        v-for="note in app.notes"
                        :key="note.id"
                        class="note-item"
                      >
                        <AppIcon name="mdi-chevron-right" class="note-bullet" />
                        {{ note.text }}
                      </li>
                    </ul>
                    <button
                      class="add-note-btn glassmorphic-btn"
                      @click="openNoteModal(app)"
                    >
                      <AppIcon name="mdi-note-plus-outline" class="me-1" />
                      Add Note
                    </button>
                  </div>
                </div>
              </td>
              <td class="td-glassmorphic actions-cell">
                <div class="cell-content">
                  <div class="action-buttons">
                    <button
                      class="action-btn view-btn glassmorphic-btn"
                      title="View details"
                      @click="viewDetails(app)"
                    >
                      <AppIcon name="mdi-eye" />
                    </button>
                    <button
                      class="action-btn delete-btn glassmorphic-btn"
                      title="Remove"
                      @click="remove(app)"
                    >
                      <AppIcon name="mdi-delete-outline" />
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Note Modal -->
    <Teleport to="body">
      <div
        v-if="noteModalApp"
        class="modal fade show d-block"
        tabindex="-1"
        aria-modal="true"
        role="dialog"
      >
        <div class="modal-dialog">
          <div class="modal-content glass-card section-card-subtle">
            <div class="modal-header">
              <h5 class="modal-title">Add Note - {{ noteModalApp.title }}</h5>
              <UnifiedButton
                variant="ghost"
                size="sm"
                icon-only
                :icon="'mdi-close'"
                aria-label="Close"
                @click="closeNoteModal"
              />
            </div>
            <div class="modal-body">
              <textarea
                v-model="noteInput"
                class="unified-input ui-input"
                rows="4"
                placeholder="Interview scheduled, recruiter feedback, etc."
              ></textarea>
            </div>
            <div class="modal-footer">
              <button
                class="unified-btn btn-secondary ui-btn ui-size-md v-btn"
                @click="closeNoteModal"
              >
                Cancel
              </button>
              <button
                class="unified-btn btn-primary v-btn ui-btn ui-size-md"
                :disabled="!noteInput.trim()"
                @click="saveNote"
              >
                <AppIcon name="mdi-content-save-outline" class="me-1" />
                Save Note
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, defineEmits, defineProps } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

const props = defineProps({
  applications: { type: Array, default: () => [] },
})

const emit = defineEmits([
  'update-status',
  'add-note',
  'view-details',
  'remove-application',
])

const noteModalApp = ref(null)
const noteInput = ref('')

function formatDate(date) {
  if (!date) {
    return '-'
  }
  try {
    return new Date(date).toLocaleDateString()
  } catch {
    return '-'
  }
}
function emitStatus(app) {
  emit('update-status', app.id, app.status)
}
function openNoteModal(app) {
  noteModalApp.value = app
  noteInput.value = ''
}
function closeNoteModal() {
  noteModalApp.value = null
}
function saveNote() {
  emit('add-note', noteModalApp.value.id, noteInput.value.trim())
  closeNoteModal()
}
function viewDetails(app) {
  try {
    if (!app || !app.id) {
      console.error('ApplicationTracker: Invalid application for view details')
      return
    }

    // Emit event to parent component for handling details view
    emit('view-details', {
      id: app.id,
      title: app.title,
      company: app.company,
      status: app.status,
      appliedDate: app.appliedDate,
      notes: app.notes || [],
      jobUrl: app.jobUrl,
      salary: app.salary,
      location: app.location,
      description: app.description,
    })
  } catch (error) {
    console.error(
      'ApplicationTracker: Failed to view application details',
      error
    )
  }
}

function remove(app) {
  try {
    if (!app || !app.id) {
      console.error('ApplicationTracker: Invalid application for removal')
      return
    }

    // Confirm before removing
    if (
      confirm(
        `Are you sure you want to remove the application for "${app.title}" at ${app.company}?`
      )
    ) {
      emit('remove-application', {
        id: app.id,
        title: app.title,
        company: app.company,
      })
    }
  } catch (error) {
    console.error('ApplicationTracker: Failed to remove application', error)
  }
}
</script>

<style scoped>
/* Enhanced Glassmorphic Table Container */
.table-container {
  border-radius: 24px;
  overflow: hidden;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.08) 0%,
    rgba(255, 255, 255, 0.03) 100%
  );
  backdrop-filter: blur(20px) saturate(1.8);
  -webkit-backdrop-filter: blur(20px) saturate(1.8);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  margin: 1rem 0;
}

.table-wrapper {
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 255, 136, 0.3) transparent;
}

.table-wrapper::-webkit-scrollbar {
  height: 6px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: linear-gradient(
    45deg,
    rgba(0, 255, 136, 0.6),
    rgba(0, 217, 255, 0.6)
  );
  border-radius: 3px;
}

.glassmorphic-table {
  width: 100%;
  border-collapse: collapse;
  background: transparent;
}

/* Enhanced Header Styling */
.table-header {
  background: linear-gradient(
    135deg,
    rgba(0, 255, 136, 0.1) 0%,
    rgba(0, 217, 255, 0.08) 50%,
    rgba(184, 71, 255, 0.1) 100%
  );
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.th-glassmorphic {
  padding: 1.25rem 1rem;
  border: none;
  position: relative;
  background: transparent;
}

.th-glassmorphic.actions-header {
  width: 140px;
  text-align: center;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-on-primary);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.actions-header .header-content {
  justify-content: center;
}

/* Enhanced Row Styling */
.table-row {
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.table-row:hover {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.02) 100%
  );
  transform: scale(1.01);
  box-shadow:
    0 4px 20px rgba(0, 255, 136, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.table-row.row-0 {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.03) 0%,
    rgba(255, 255, 255, 0.01) 100%
  );
}

.td-glassmorphic {
  padding: 1rem;
  border: none;
  vertical-align: middle;
  background: transparent;
}

.cell-content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-height: 40px;
}

.actions-cell .cell-content {
  justify-content: center;
}

/* Enhanced Content Styling */
.role-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-on-primary);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.company-name {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.date-text {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  font-family: 'SF Mono', Consolas, monospace;
}

/* Enhanced Select Dropdown */
.glassmorphic-select {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 0.5rem 0.75rem;
  color: var(--text-on-primary);
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
}

.glassmorphic-select:hover {
  background: linear-gradient(
    135deg,
    rgba(0, 255, 136, 0.2) 0%,
    rgba(0, 217, 255, 0.15) 100%
  );
  border-color: rgba(0, 255, 136, 0.4);
  box-shadow: 0 0 15px rgba(0, 255, 136, 0.2);
}

.glassmorphic-select option {
  background: rgba(20, 20, 20, 0.95);
  color: var(--text-on-primary);
  padding: 0.5rem;
}

/* Enhanced Notes Section */
.notes-container {
  width: 100%;
  max-width: 200px;
}

.notes-list {
  list-style: none;
  padding: 0;
  margin: 0 0 0.75rem 0;
  max-height: 80px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 255, 136, 0.3) transparent;
}

.notes-list::-webkit-scrollbar {
  width: 4px;
}

.notes-list::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 136, 0.4);
  border-radius: 2px;
}

.note-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
}

.note-bullet {
  color: rgba(0, 255, 136, 0.8);
  font-size: 0.6rem;
  margin-top: 0.2rem;
  flex-shrink: 0;
}

/* Enhanced Button Styling */
.glassmorphic-btn {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: var(--text-on-primary);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.5rem 0.75rem;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  cursor: pointer;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.glassmorphic-btn:hover {
  transform: translateY(-2px) scale(1.05);
  background: linear-gradient(
    135deg,
    rgba(0, 255, 136, 0.2) 0%,
    rgba(0, 217, 255, 0.15) 100%
  );
  border-color: rgba(0, 255, 136, 0.4);
  box-shadow:
    0 4px 15px rgba(0, 255, 136, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.add-note-btn {
  width: 100%;
  justify-content: center;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.action-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.view-btn:hover {
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.2) 0%,
    rgba(99, 102, 241, 0.15) 100%
  );
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow:
    0 4px 15px rgba(59, 130, 246, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.delete-btn:hover {
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.2) 0%,
    rgba(220, 38, 38, 0.15) 100%
  );
  border-color: rgba(239, 68, 68, 0.4);
  box-shadow:
    0 4px 15px rgba(239, 68, 68, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

/* Enhanced Modal */
.modal-content {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  backdrop-filter: blur(25px) saturate(1.8);
  -webkit-backdrop-filter: blur(25px) saturate(1.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.modal-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
}

.modal-title {
  color: var(--text-on-primary);
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  gap: 1rem;
}

/* Empty State */
.empty-state i {
  opacity: 0.3;
  background: linear-gradient(
    45deg,
    rgba(0, 255, 136, 0.6),
    rgba(0, 217, 255, 0.6),
    rgba(184, 71, 255, 0.6)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: rgbShift 3s infinite;
}

@keyframes rgbShift {
  0%,
  100% {
    filter: hue-rotate(0deg);
  }
  33% {
    filter: hue-rotate(120deg);
  }
  66% {
    filter: hue-rotate(240deg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .th-glassmorphic,
  .td-glassmorphic {
    padding: 0.75rem 0.5rem;
  }

  .header-content {
    font-size: 0.65rem;
  }

  .notes-container {
    max-width: 150px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.25rem;
  }

  .action-btn {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
  }
}
</style>
