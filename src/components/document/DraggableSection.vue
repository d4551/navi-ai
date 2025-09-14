<template>
  <div
    class="draggable-section"
    :class="{
      'is-dragging': isDragging,
      'is-drag-over': isDragOver,
      'is-disabled': disabled
    }"
    :draggable="!disabled"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @dragover="handleDragOver"
    @dragenter="handleDragEnter"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <!-- Drag Handle -->
    <div v-if="!disabled" class="drag-handle" @mousedown="initDrag">
      <div class="drag-dots">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    </div>

    <!-- Section Header -->
    <div class="section-header">
      <div class="section-title-container">
        <AppIcon :name="sectionIcon" class="section-icon" />
        <h3 class="section-title">{{ sectionTitle }}</h3>
        <div v-if="itemCount > 0" class="item-count">{{ itemCount }}</div>
      </div>
      
      <div class="section-actions">
        <!-- AI Optimize Button -->
        <UnifiedButton
          v-if="aiEnabled && canOptimize"
          variant="ghost"
          size="xs"
          leading-icon="mdi-brain"
          :loading="isOptimizing"
          @click="optimizeSection"
        >
          AI Optimize
        </UnifiedButton>
        
        <!-- Add Item Button -->
        <UnifiedButton
          v-if="canAddItem"
          variant="ghost"
          size="xs"
          leading-icon="mdi-plus"
          @click="addItem"
        >
          Add {{ itemTypeName }}
        </UnifiedButton>
        
        <!-- Section Options -->
        <div class="section-options">
          <UnifiedButton
            variant="ghost"
            size="xs"
            leading-icon="mdi-dots-vertical"
            @click="showOptions = !showOptions"
          />
          <div v-if="showOptions" class="options-dropdown">
            <button class="option-item" @click="duplicateSection">
              <AppIcon name="mdi-content-copy" />
              Duplicate Section
            </button>
            <button class="option-item" @click="toggleCollapse">
              <AppIcon :name="isCollapsed ? 'mdi-chevron-down' : 'mdi-chevron-up'" />
              {{ isCollapsed ? 'Expand' : 'Collapse' }}
            </button>
            <button v-if="canDelete" class="option-item danger" @click="confirmDelete">
              <AppIcon name="mdi-delete" />
              Delete Section
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Section Content -->
    <div v-if="!isCollapsed" class="section-content">
      <slot></slot>
      
      <!-- Empty State -->
      <div v-if="itemCount === 0 && showEmptyState" class="empty-state">
        <AppIcon :name="sectionIcon" />
        <p>{{ emptyStateText }}</p>
        <UnifiedButton
          v-if="canAddItem"
          variant="primary"
          size="sm"
          :leading-icon="'mdi-plus'"
          @click="addItem"
        >
          Add {{ itemTypeName }}
        </UnifiedButton>
      </div>
    </div>

    <!-- Drag Preview -->
    <div v-if="isDragging" class="drag-preview">
      <AppIcon :name="sectionIcon" />
      <span>{{ sectionTitle }}</span>
    </div>

    <!-- Drop Indicator -->
    <div v-if="isDragOver" class="drop-indicator">
      <div class="drop-line"></div>
      <div class="drop-message">Drop here to reorder</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from '@/composables/useToast'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

interface SectionData {
  id: string
  type: string
  title: string
  items: any[]
  order: number
}

const props = defineProps<{
  sectionData: SectionData
  sectionTitle: string
  sectionIcon: string
  itemCount: number
  itemTypeName: string
  disabled?: boolean
  canDelete?: boolean
  canAddItem?: boolean
  canOptimize?: boolean
  aiEnabled?: boolean
  showEmptyState?: boolean
  emptyStateText?: string
}>()

const emit = defineEmits<{
  'drag-start': [sectionId: string, data: SectionData]
  'drag-end': []
  'drop': [targetSectionId: string, sourceData: SectionData]
  'add-item': [sectionId: string]
  'optimize': [sectionId: string]
  'duplicate': [sectionId: string]
  'delete': [sectionId: string]
  'toggle-collapse': [sectionId: string]
}>()

const toast = useToast()

// State
const isDragging = ref(false)
const isDragOver = ref(false)
const showOptions = ref(false)
const isCollapsed = ref(false)
const isOptimizing = ref(false)

// Computed
const sectionId = computed(() => props.sectionData.id)

// Drag and Drop Handlers
function handleDragStart(event: DragEvent) {
  if (props.disabled) return
  
  isDragging.value = true
  
  // Set drag data
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/json', JSON.stringify(props.sectionData))
    
    // Create custom drag image
    const dragImage = createDragImage()
    event.dataTransfer.setDragImage(dragImage, 0, 0)
  }
  
  emit('drag-start', sectionId.value, props.sectionData)
}

function handleDragEnd() {
  isDragging.value = false
  emit('drag-end')
}

function handleDragOver(event: DragEvent) {
  if (props.disabled) return
  
  event.preventDefault()
  event.stopPropagation()
  
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

function handleDragEnter(event: DragEvent) {
  if (props.disabled) return
  
  event.preventDefault()
  isDragOver.value = true
}

function handleDragLeave(event: DragEvent) {
  if (props.disabled) return
  
  // Only hide indicator if leaving the entire section
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = event.clientX
  const y = event.clientY
  
  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    isDragOver.value = false
  }
}

function handleDrop(event: DragEvent) {
  if (props.disabled) return
  
  event.preventDefault()
  event.stopPropagation()
  
  isDragOver.value = false
  
  try {
    const draggedData = JSON.parse(event.dataTransfer?.getData('application/json') || '{}')
    
    if (draggedData.id && draggedData.id !== sectionId.value) {
      emit('drop', sectionId.value, draggedData)
      toast.success('Section reordered successfully')
    }
  } catch (error) {
    console.error('Failed to parse drag data:', error)
  }
}

// Helper Functions
function createDragImage(): HTMLElement {
  const dragImage = document.createElement('div')
  dragImage.className = 'drag-image'
  dragImage.innerHTML = `
    <div style="
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: 8px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: var(--text-primary);
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      backdrop-filter: blur(10px);
    ">
      <i class="mdi ${props.sectionIcon}"></i>
      <span>${props.sectionTitle}</span>
    </div>
  `
  
  document.body.appendChild(dragImage)
  setTimeout(() => document.body.removeChild(dragImage), 0)
  
  return dragImage
}

function initDrag() {
  // Visual feedback for drag initiation
  const handle = document.querySelector('.drag-handle') as HTMLElement
  if (handle) {
    handle.style.transform = 'scale(1.1)'
    setTimeout(() => {
      if (handle) handle.style.transform = 'scale(1)'
    }, 150)
  }
}

// Action Handlers
function addItem() {
  emit('add-item', sectionId.value)
}

async function optimizeSection() {
  isOptimizing.value = true
  try {
    emit('optimize', sectionId.value)
    // The parent component will handle the actual optimization
  } finally {
    setTimeout(() => {
      isOptimizing.value = false
    }, 2000) // Show loading for 2 seconds minimum
  }
}

function duplicateSection() {
  emit('duplicate', sectionId.value)
  showOptions.value = false
  toast.success('Section duplicated')
}

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
  emit('toggle-collapse', sectionId.value)
  showOptions.value = false
}

function confirmDelete() {
  if (confirm('Are you sure you want to delete this section? This action cannot be undone.')) {
    emit('delete', sectionId.value)
    toast.success('Section deleted')
  }
  showOptions.value = false
}

// Close options when clicking outside
function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement
  if (!target.closest('.section-options')) {
    showOptions.value = false
  }
}

document.addEventListener('click', handleClickOutside)
</script>

<style scoped>
.draggable-section {
  position: relative;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.draggable-section:hover {
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.draggable-section.is-dragging {
  opacity: 0.5;
  transform: rotate(2deg) scale(0.95);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
}

.draggable-section.is-drag-over {
  border-color: var(--color-primary-500);
  background: rgba(var(--color-primary-500-rgb), 0.05);
  transform: scale(1.02);
}

.draggable-section.is-disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Drag Handle */
.drag-handle {
  position: absolute;
  left: -2px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 40px;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s ease;
  background: rgba(var(--color-primary-500-rgb), 0.1);
  border-radius: 0 8px 8px 0;
}

.drag-handle:active {
  cursor: grabbing;
}

.draggable-section:hover .drag-handle {
  opacity: 1;
  left: 0;
}

.drag-dots {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
}

.dot {
  width: 3px;
  height: 3px;
  background: var(--color-primary-500);
  border-radius: 50%;
}

/* Section Header */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgba(var(--glass-border-rgb), 0.5);
}

.section-title-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-icon {
  font-size: 20px;
  color: var(--color-primary-500);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.item-count {
  background: rgba(var(--color-primary-500-rgb), 0.1);
  color: var(--color-primary-500);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Section Options */
.section-options {
  position: relative;
}

.options-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1000;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  min-width: 160px;
  margin-top: 4px;
}

.option-item {
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-item:hover {
  background: rgba(var(--color-primary-500-rgb), 0.05);
}

.option-item.danger {
  color: #ef4444;
}

.option-item.danger:hover {
  background: rgba(239, 68, 68, 0.05);
}

/* Section Content */
.section-content {
  padding: 20px 24px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-tertiary);
}

.empty-state svg {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state p {
  margin-bottom: 16px;
  font-size: 14px;
}

/* Drag Preview */
.drag-preview {
  position: fixed;
  top: -1000px;
  left: -1000px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-primary);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  pointer-events: none;
  z-index: 9999;
}

/* Drop Indicator */
.drop-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(var(--color-primary-500-rgb), 0.1);
  border: 2px dashed var(--color-primary-500);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  pointer-events: none;
}

.drop-line {
  width: 60px;
  height: 3px;
  background: var(--color-primary-500);
  border-radius: 2px;
}

.drop-message {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary-500);
}

/* Animations */
@keyframes pulse-glow {
  0% { box-shadow: 0 0 0 0 rgba(var(--color-primary-500-rgb), 0.4); }
  50% { box-shadow: 0 0 0 10px rgba(var(--color-primary-500-rgb), 0); }
  100% { box-shadow: 0 0 0 0 rgba(var(--color-primary-500-rgb), 0); }
}

.draggable-section.is-drag-over {
  animation: pulse-glow 1.5s infinite;
}

/* Responsive */
@media (max-width: 768px) {
  .section-header {
    padding: 16px 20px 12px;
  }
  
  .section-content {
    padding: 16px 20px;
  }
  
  .section-actions {
    gap: 4px;
  }
  
  .drag-handle {
    display: none; /* Hide on mobile, use touch drag instead */
  }
}
</style>