<template>
  <div
    v-if="visible"
    class="modal show d-block"
    style="background-color: var(--modal-backdrop)"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content elevated">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ isEditing ? 'Edit Portfolio Item' : 'Add Portfolio Item' }}
          </h5>
          <UnifiedButton variant="ghost" size="sm" icon-only :icon="'mdi-close'" aria-label="Close" @click="$emit('close')" />
        </div>
        <div class="modal-body unified-container">
          <form @submit.prevent="handleSubmit">
            <!-- Type Selection -->
            <div class="mb-3">
              <label class="form-label">Item Type</label>
              <select
                v-model="formData.type"
                class="form-select"
                required
              >
                <option value="achievement"><AppIcon name="mdi-trophy" color="warning" context="achievement" aria-hidden="true" /> Achievement</option>
                <option value="clip"><AppIcon name="mdi-video" size="small" /> Video Clip</option>
                <option value="tournament">🏅 Tournament</option>
                <option value="leadership"><AppIcon name="mdi-star" color="warning" context="achievement" aria-hidden="true" /> Leadership</option>
                <option value="content"><AppIcon name="mdi-video" size="small" /> Content Creation</option>
                <option value="project"><AppIcon name="mdi-folder" size="small" /> Project</option>
                <option value="stream"><AppIcon name="mdi-television" size="small" /> Stream Highlight</option>
                <option value="collaboration"><AppIcon name="mdi-account-group" size="small" /> Collaboration</option>
              </select>
            </div>

            <!-- Title -->
            <div class="mb-3">
              <label class="form-label">Title</label>
              <input
                v-model="formData.title"
                type="text"
                class="form-control"
                placeholder="Enter achievement title..."
                required
              />
            </div>

            <!-- Description -->
            <div class="mb-3">
              <label class="form-label">Description</label>
              <textarea
                v-model="formData.description"
                class="form-control"
                rows="3"
                placeholder="Describe your achievement..."
                required
              ></textarea>
            </div>

            <!-- Game -->
            <div class="mb-3">
              <label class="form-label">Game (Optional)</label>
              <input
                v-model="formData.game"
                type="text"
                class="form-control"
                placeholder="Enter game name..."
              />
            </div>

            <!-- Skills -->
            <div class="mb-3">
              <label class="form-label">Skills</label>
              <div class="input-group">
                <input
                  v-model="skillInput"
                  type="text"
                  class="form-control"
                  placeholder="Add a skill and press Enter..."
                  @keydown.enter.prevent="addSkill"
                />
                <UnifiedButton type="button" variant="outline" @click="addSkill">Add</UnifiedButton>
              </div>
              <div class="mt-2">
                <span
                  v-for="(skill, index) in formData.skills"
                  :key="index"
                  class="badge bg-secondary me-1 mb-1"
                >
                  {{ skill }}
                  <button
                    type="button"
                    class="btn-close btn-close-white ms-1 ui-btn ui-size-md"
                    style="font-size: 0.5em;"
                    @click="removeSkill(index)"
                  ></button>
                </span>
              </div>
            </div>

            <!-- Date -->
            <div class="mb-3">
              <label class="form-label">Date</label>
              <input
                v-model="formData.date"
                type="month"
                class="form-control"
                required
              />
            </div>

            <!-- Media Upload Section -->
            <div class="mb-4">
              <label class="form-label">Media</label>
              <div class="media-upload-section">
                <!-- Current Media Preview -->
                <div v-if="formData.media" class="current-media mb-3">
                  <div class="media-preview">
                    <img 
                      v-if="formData.media.type === 'image'"
                      :src="formData.media.url" 
                      alt="Preview"
                      class="preview-image"
                    />
                    <video 
                      v-else-if="formData.media.type === 'video'"
                      :src="formData.media.url"
                      class="preview-video"
                      controls
                    ></video>
                    <div class="media-info">
                      <span class="media-type">{{ formData.media.type }}</span>
                      <UnifiedButton type="button" size="sm" variant="danger" appearance="outlined" leading-icon="mdi-delete" @click="removeMedia">Remove</UnifiedButton>
                    </div>
                  </div>
                </div>

                <!-- Media Upload Options -->
                <div v-if="!formData.media" class="upload-options">
                  <div class="upload-tabs">
                    <button 
                      type="button"
                      class="upload-tab"
                      :class="{ active: uploadMode === 'file' }"
                      @click="uploadMode = 'file'"
                    >
                      <AppIcon name="mdi-upload" /> Upload File
                    </button>
                    <button 
                      type="button"
                      class="upload-tab"
                      :class="{ active: uploadMode === 'url' }"
                      @click="uploadMode = 'url'"
                    >
                      <AppIcon name="mdi-link" /> URL
                    </button>
                  </div>

                  <!-- File Upload -->
                  <div v-if="uploadMode === 'file'" class="upload-area">
                    <input 
                      ref="fileInput"
                      type="file" 
                      accept="image/*,video/*"
                      class="d-none"
                      @change="handleFileUpload"
                    />
                    <div class="drop-zone" @click="$refs.fileInput.click()">
                      <AppIcon name="mdi-cloud-upload" class="display-4 text-muted" />
                      <p class="mb-2">Click to upload or drag & drop</p>
                      <small class="text-muted">Images: PNG, JPG, GIF | Videos: MP4, WebM (max 50MB)</small>
                    </div>
                  </div>

                  <!-- URL Input -->
                  <div v-if="uploadMode === 'url'" class="url-input">
                    <div class="input-group">
                      <input
                        v-model="mediaUrl"
                        type="url"
                        class="form-control"
                        placeholder="https://example.com/image.jpg or video URL"
                      />
                      <button 
                        type="button" 
                        class="btn btn-outline-primary v-btn variant-outlined ui-btn ui-size-md"
                        :disabled="!mediaUrl"
                        @click="addMediaFromUrl"
                      >
                        Add
                      </button>
                    </div>
                    <small class="form-text text-muted mt-1">
                      Supports images, YouTube, Twitch, and other video URLs
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Additional Details Based on Type -->
            <div v-if="formData.type === 'achievement'" class="mb-3">
              <label class="form-label">Achievement Details</label>
              <div class="row g-2">
                <div class="col-md-6">
                  <input
                    v-model="formData.achievement.rank"
                    type="text"
                    class="form-control"
                    placeholder="Rank/Position (e.g., 1st Place)"
                  />
                </div>
                <div class="col-md-6">
                  <input
                    v-model="formData.achievement.event"
                    type="text"
                    class="form-control"
                    placeholder="Event/Competition"
                  />
                </div>
              </div>
            </div>

            <!-- Project Stats -->
            <div v-if="formData.type === 'project' || formData.type === 'content'" class="mb-3">
              <label class="form-label">Statistics (Optional)</label>
              <div class="stats-input">
                <div v-for="(stat, index) in formData.stats" :key="index" class="row g-2 mb-2">
                  <div class="col-md-6">
                    <input
                      v-model="stat.label"
                      type="text"
                      class="form-control"
                      placeholder="Stat name (e.g., Views)"
                    />
                  </div>
                  <div class="col-md-5">
                    <input
                      v-model="stat.value"
                      type="text"
                      class="form-control"
                      placeholder="Value (e.g., 10K)"
                    />
                  </div>
                  <div class="col-md-1">
                    <UnifiedButton type="button" size="sm" variant="danger" appearance="outlined" class="w-100" leading-icon="mdi-minus" @click="removeStat(index)" />
                  </div>
                </div>
                <UnifiedButton type="button" size="sm" variant="outline" leading-icon="mdi-plus" @click="addStat">Add Stat</UnifiedButton>
              </div>
            </div>

            <!-- URL -->
            <div class="mb-3">
              <label class="form-label">Link/URL (Optional)</label>
              <input
                v-model="formData.url"
                type="url"
                class="form-control"
                placeholder="https://..."
              />
            </div>

            <!-- Featured -->
            <div class="mb-3">
              <FormControls
                v-model="formData.featured"
                type="checkbox"
                label="Featured (highlight this achievement)"
                help-text="Featured items will be highlighted in your portfolio"
              />
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <UnifiedButton type="button" variant="secondary" @click="$emit('close')">Cancel</UnifiedButton>
          <UnifiedButton type="button" variant="primary" :disabled="!isFormValid" @click="handleSubmit">{{ isEditing ? 'Update' : 'Add' }} Item</UnifiedButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AppIcon from '@/components/ui/AppIcon.vue';

import { ref, computed, watch, defineEmits, defineProps } from 'vue'
import FormControls from '@/components/ui/FormControls.vue';
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  item: {
    type: Object,
    default: null
  },
  quickAddType: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['close', 'save']);

const skillInput = ref('');
const uploadMode = ref('file');
const mediaUrl = ref('');

const formData = ref({
  type: 'achievement',
  title: '',
  description: '',
  game: '',
  skills: [],
  date: new Date().toISOString().slice(0, 7), // YYYY-MM format
  url: '',
  featured: false,
  media: null, // { type: 'image|video', url: 'string' }
  achievement: {
    rank: '',
    event: ''
  },
  stats: [] // [{ label: 'Views', value: '10K' }]
});

const isEditing = computed(() => !!props.item);

const isFormValid = computed(() => {
  return formData.value.title.trim() &&
         formData.value.description.trim() &&
         formData.value.date.trim();
});

// Methods for handling media
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file size (50MB limit)
  if (file.size > 50 * 1024 * 1024) {
    alert('File size must be less than 50MB');
    return;
  }

  // Create object URL for preview
  const url = URL.createObjectURL(file);
  const type = file.type.startsWith('image/') ? 'image' : 'video';
  
  formData.value.media = { type, url, file };
}

function addMediaFromUrl() {
  if (!mediaUrl.value) return;
  
  // Determine media type from URL
  const url = mediaUrl.value;
  let type = 'image';
  
  // Check for video platforms or file extensions
  if (url.includes('youtube.com') || url.includes('youtu.be') || 
      url.includes('twitch.tv') || url.includes('vimeo.com') ||
      /\.(mp4|webm|mov|avi)$/i.test(url)) {
    type = 'video';
  }
  
  formData.value.media = { type, url };
  mediaUrl.value = '';
}

function removeMedia() {
  if (formData.value.media?.file) {
    URL.revokeObjectURL(formData.value.media.url);
  }
  formData.value.media = null;
}

// Methods for handling stats
function addStat() {
  formData.value.stats.push({ label: '', value: '' });
}

function removeStat(index) {
  formData.value.stats.splice(index, 1);
}

// Watch for prop changes to populate form
watch(() => props.item, (newItem) => {
  if (newItem) {
    formData.value = {
      type: newItem.type || 'achievement',
      title: newItem.title || '',
      description: newItem.description || '',
      game: newItem.game || '',
      skills: [...(newItem.skills || [])],
      date: newItem.date ? convertDateToInputFormat(newItem.date) : '',
      url: newItem.url || '',
      featured: newItem.featured || false
    };
  } else {
    resetForm();
  }
}, { immediate: true });

// Watch for quickAddType
watch(() => props.quickAddType, (type) => {
  if (type) {
    resetForm();
    formData.value.type = type;
  }
});

function resetForm() {
  formData.value = {
    type: props.quickAddType || 'achievement',
    title: '',
    description: '',
    game: '',
    skills: [],
    date: new Date().toISOString().slice(0, 7),
    url: '',
    featured: false
  };
  skillInput.value = '';
}

function addSkill() {
  const skill = skillInput.value.trim();
  if (skill && !formData.value.skills.includes(skill)) {
    formData.value.skills.push(skill);
    skillInput.value = '';
  }
}

function removeSkill(index) {
  formData.value.skills.splice(index, 1);
}

function convertDateToInputFormat(dateStr) {
  // Convert "Month YYYY" to "YYYY-MM" format
  const monthMatch = /^(\w+)\s+(\d{4})$/.exec(dateStr.trim());
  if (monthMatch) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const monthIndex = monthNames.indexOf(monthMatch[1]);
    if (monthIndex !== -1) {
      const month = (monthIndex + 1).toString().padStart(2, '0');
      return `${monthMatch[2]}-${month}`;
    }
  }

  // Fallback to current month if parsing fails
  return new Date().toISOString().slice(0, 7);
}

function convertInputFormatToDate(inputDate) {
  // Convert "YYYY-MM" to "Month YYYY" format
  const [year, month] = inputDate.split('-');
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = monthNames[parseInt(month) - 1];
  return `${monthName} ${year}`;
}

function handleSubmit() {
  if (!isFormValid.value) {return;}

  const itemData = {
    ...formData.value,
    date: convertInputFormatToDate(formData.value.date),
    skills: [...formData.value.skills]
  };

  if (isEditing.value) {
    itemData.id = props.item.id;
  }

  emit('save', itemData);
}
</script>

<style scoped>
/* Media Upload Styles */
.media-upload-section {
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-md);
  padding: 1rem;
  background: var(--glass-surface);
}

.current-media {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.media-preview {
  flex: 1;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.preview-image,
.preview-video {
  width: 120px;
  height: 80px;
  object-fit: cover;
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--glass-border);
}

.media-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.media-type {
  background: var(--color-primary-alpha);
  color: var(--color-primary);
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.upload-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 1rem;
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  border: 1px solid var(--glass-border);
}

.upload-tab {
  flex: 1;
  background: var(--glass-elevated);
  border: none;
  padding: 0.5rem 1rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.upload-tab:hover {
  background: var(--glass-surface);
  color: var(--text-primary);
}

.upload-tab.active {
  background: var(--color-primary);
  color: white;
}

.drop-zone {
  border: 2px dashed var(--glass-border);
  border-radius: var(--border-radius-md);
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-smooth);
}

.drop-zone:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-alpha);
}

.drop-zone:hover .display-4 {
  color: var(--color-primary) !important;
}

.url-input .input-group {
  margin-bottom: 0.5rem;
}

/* Stats Input */
.stats-input {
  background: var(--glass-elevated);
  border-radius: var(--border-radius-sm);
  padding: 0.75rem;
}

.stats-input .row + .row {
  margin-top: 0.5rem;
}

/* Enhanced form styling */
.form-label {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

/* Inputs/selects use global glass-input styling */

/* Modal enhancements */
.modal-content {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-lg);
  backdrop-filter: blur(var(--glass-backdrop-blur)) saturate(140%);
  -webkit-backdrop-filter: blur(var(--glass-backdrop-blur)) saturate(140%);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal-header {
  border-bottom: 1px solid var(--glass-border);
  background: var(--glass-elevated);
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
}

.modal-footer {
  border-top: 1px solid var(--glass-border);
  background: var(--glass-elevated);
  border-radius: 0 0 var(--border-radius-lg) var(--border-radius-lg);
}

.modal-title {
  color: var(--text-primary);
  font-weight: 600;
}

/* Responsive design */
@media (max-width: 768px) {
  .modal-dialog {
    margin: 1rem;
  }
  
  .current-media {
    flex-direction: column;
  }
  
  .media-preview {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .preview-image,
  .preview-video {
    width: 100%;
    height: 120px;
  }
  
  .upload-tabs {
    flex-direction: column;
  }
}

/* Dark theme adjustments */
[data-theme="dark"] .modal-content {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

[data-theme="dark"] .drop-zone {
  background: rgba(255, 255, 255, 0.02);
}

[data-theme="dark"] .drop-zone:hover {
  background: var(--color-primary-alpha);
}
</style>
