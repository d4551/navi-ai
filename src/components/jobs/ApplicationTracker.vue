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
                    formatDateBasic(app.appliedDate)
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
import { ref } from 'vue';

import { ref, defineEmits, defineProps } from "vue";
import { formatDateBasic } from "@/utils/date";
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";

const _props = defineProps({
  applications: { type: Array, default: () => [] },
});

const _emit = defineEmits([
  "update-status",
  "add-note",
  "view-details",
  "remove-application",
]);

const noteModalApp = ref(null);
const noteInput = ref("");

function emitStatus(app) {
  emit("update-status", app.id, app.status);
}
function openNoteModal(app) {
  noteModalApp.value = app;
  noteInput.value = "";
}
function closeNoteModal() {
  noteModalApp.value = null;
}
function saveNote() {
  emit("add-note", noteModalApp.value.id, noteInput.value.trim());
  closeNoteModal();
}
function viewDetails(app) {
  try {
    if (!app || !app.id) {
      console.error("ApplicationTracker: Invalid application for view details");
      return;
    }

    // Emit event to parent component for handling details view
    emit("view-details", {
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
    });
  } catch (_error) {
    console.error(
      "ApplicationTracker: Failed to view application details",
      error,
    );
  }
}

function remove(app) {
  try {
    if (!app || !app.id) {
      console.error("ApplicationTracker: Invalid application for removal");
      return;
    }

    // Confirm before removing
    if (
      confirm(
        `Are you sure you want to remove the application for "${app.title}" at ${app.company}?`,
      )
    ) {
      emit("remove-application", {
        id: app.id,
        title: app.title,
        company: app.company,
      });
    }
  } catch (_error) {
    console.error("ApplicationTracker: Failed to remove application", error);
  }
}
</script>

<style scoped>
.table-container {
  overflow: hidden;
  background: linear-gradient(
  );
  box-shadow:
}

.table-wrapper {
  overflow-x: auto;
  scrollbar-width: thin;
}

.table-wrapper::-webkit-scrollbar {
}

.table-wrapper::-webkit-scrollbar-track {
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: linear-gradient(
  );
}

.glassmorphic-table {
  border-collapse: collapse;
  background: transparent;
}

.table-header {
  background: linear-gradient(
  );
}

.th-glassmorphic {
  border: none;
  position: relative;
  background: transparent;
}

.th-glassmorphic.actions-header {
  text-align: center;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  text-transform: uppercase;
  color: var(--text-on-primary);
}

.actions-header .header-content {
  justify-content: center;
}

.table-row {
}

.table-row:hover {
  background: linear-gradient(
  );
  box-shadow:
}

  background: linear-gradient(
  );
}

.td-glassmorphic {
  border: none;
  vertical-align: middle;
  background: transparent;
}

.cell-content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.actions-cell .cell-content {
  justify-content: center;
}

.role-title {
  color: var(--text-on-primary);
}

.company-name {
}

.date-text {
  font-family: "SF Mono", Consolas, monospace;
}

.glassmorphic-select {
  background: linear-gradient(
  );
  color: var(--text-on-primary);
  cursor: pointer;
}

.glassmorphic-select:hover {
  background: linear-gradient(
  );
}

.glassmorphic-select option {
  color: var(--text-on-primary);
}

.notes-container {
}

.notes-list {
  list-style: none;
  overflow-y: auto;
  scrollbar-width: thin;
}

.notes-list::-webkit-scrollbar {
}

.notes-list::-webkit-scrollbar-thumb {
}

.note-item {
  display: flex;
  align-items: flex-start;
}

.note-bullet {
}

.glassmorphic-btn {
  background: linear-gradient(
  );
  color: var(--text-on-primary);
  cursor: pointer;
  box-shadow:
}

.glassmorphic-btn:hover {
  background: linear-gradient(
  );
  box-shadow:
}

.add-note-btn {
  justify-content: center;
  display: flex;
  align-items: center;
}

.action-buttons {
  display: flex;
  justify-content: center;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-btn:hover {
  background: linear-gradient(
  );
  box-shadow:
}

.delete-btn:hover {
  background: linear-gradient(
  );
  box-shadow:
}

.modal-content {
  background: linear-gradient(
  );
  box-shadow:
}

.modal-header {
}

.modal-title {
  color: var(--text-on-primary);
}

.modal-body {
}

.modal-footer {
}

.empty-state i {
  background: linear-gradient(
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@keyframes rgbShift {
  }
  }
  }
}

  .th-glassmorphic,
  .td-glassmorphic {
  }

  .header-content {
  }

  .notes-container {
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-btn {
  }
}
</style>
