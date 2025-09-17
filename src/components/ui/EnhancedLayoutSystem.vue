<template>
  <div class="enhanced-layout-system font-sans">
    <!-- Enhanced Grid Layout with TailwindPlus integration -->
    <div class="layout-enhanced-grid glass-card p-6 mb-8">
      <h2 class="text-2xl font-bold text-glass-primary mb-6">
        Enhanced Layout System
      </h2>

      <!-- Responsive Card Grid with Search -->
      <div class="mb-8">
        <div class="flex flex-col md:flex-row gap-4 mb-6">
          <el-autocomplete class="flex-1">
            <input
              v-model="searchQuery"
              placeholder="Search layouts..."
              class="form-input w-full glass-interactive"
            />
            <button type="button" class="glass-interactive p-2 rounded-r">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>

            <el-options
              popover
              anchor="bottom start"
              class="w-[--input-width] glass-surface border border-glass-border rounded-lg shadow-lg"
            >
              <el-option
                value="grid"
                class="px-4 py-2 hover:glass-bg-active cursor-pointer"
                >Grid Layouts</el-option
              >
              <el-option
                value="masonry"
                class="px-4 py-2 hover:glass-bg-active cursor-pointer"
                >Masonry</el-option
              >
              <el-option
                value="dashboard"
                class="px-4 py-2 hover:glass-bg-active cursor-pointer"
                >Dashboard</el-option
              >
            </el-options>
          </el-autocomplete>

          <el-select
            name="viewMode"
            :value="viewMode"
            class="w-auto"
            @change="viewMode = $event.target.value"
          >
            <button
              type="button"
              class="btn btn-secondary flex items-center gap-2"
            >
              <el-selectedcontent>{{
                getViewModeLabel(viewMode)
              }}</el-selectedcontent>
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414L11.414 12l3.293 3.293a1 1 0 01-1.414 1.414L10 13.414l-3.293 3.293a1 1 0 01-1.414-1.414L8.586 12 5.293 8.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
            <el-options
              popover
              anchor="bottom end"
              class="w-48 glass-surface border border-glass-border rounded-lg shadow-lg"
            >
              <el-option
                value="grid"
                class="px-4 py-2 hover:glass-bg-active cursor-pointer"
                >Grid View</el-option
              >
              <el-option
                value="list"
                class="px-4 py-2 hover:glass-bg-active cursor-pointer"
                >List View</el-option
              >
              <el-option
                value="masonry"
                class="px-4 py-2 hover:glass-bg-active cursor-pointer"
                >Masonry</el-option
              >
              <el-option
                value="dense"
                class="px-4 py-2 hover:glass-bg-active cursor-pointer"
                >Dense Grid</el-option
              >
            </el-options>
          </el-select>
        </div>

        <!-- Dynamic Layout Container -->
        <div
          :class="getLayoutClasses(viewMode)"
          class="transition-all duration-300"
        >
          <div
            v-for="item in filteredItems"
            :key="item.id"
            class="layout-item glass-interactive rounded-lg border border-glass-border transition-all hover:border-primary-300 hover:shadow-md"
          >
            <div class="p-4">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center"
                  >
                    <svg
                      class="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-medium text-glass-primary">
                      {{ item.title }}
                    </h3>
                    <p class="text-sm text-glass-secondary">
                      {{ item.category }}
                    </p>
                  </div>
                </div>

                <el-dropdown>
                  <button
                    type="button"
                    class="p-1 hover:glass-bg-active rounded"
                  >
                    <svg
                      class="w-4 h-4 text-glass-secondary"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
                      />
                    </svg>
                  </button>
                  <el-menu
                    anchor="bottom end"
                    popover
                    class="glass-surface border border-glass-border rounded-lg shadow-lg py-1"
                  >
                    <button
                      class="w-full text-left px-4 py-2 hover:glass-bg-active transition-colors"
                      type="button"
                    >
                      View Details
                    </button>
                    <button
                      class="w-full text-left px-4 py-2 hover:glass-bg-active transition-colors"
                      type="button"
                    >
                      Edit
                    </button>
                    <hr class="border-glass-border my-1" />
                    <button
                      class="w-full text-left px-4 py-2 hover:glass-bg-active transition-colors text-red-600"
                      type="button"
                    >
                      Remove
                    </button>
                  </el-menu>
                </el-dropdown>
              </div>

              <p class="text-glass-secondary text-sm mb-4">
                {{ item.description }}
              </p>

              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span
                    :class="getStatusClass(item.status)"
                    class="px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {{ item.status }}
                  </span>
                  <span class="text-xs text-glass-secondary"
                    >{{ item.progress }}%</span
                  >
                </div>
                <button class="btn btn-sm btn-primary">
                  {{ getActionText(item.status) }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Dialog with Form -->
    <div class="glass-card p-6 mb-8">
      <h3 class="text-xl font-semibold text-glass-primary mb-4">
        Enhanced Dialog Forms
      </h3>
      <button
        command="show-modal"
        commandfor="enhanced-form-dialog"
        type="button"
        class="btn btn-primary"
      >
        Open Enhanced Form
      </button>

      <el-dialog>
        <dialog id="enhanced-form-dialog" class="backdrop:bg-transparent">
          <el-dialog-backdrop
            class="pointer-events-none bg-black/60 transition duration-200 data-closed:opacity-0"
          />
          <el-dialog-panel
            class="glass-card max-w-lg mx-auto mt-10 transition duration-200 data-closed:scale-95 data-closed:opacity-0"
          >
            <div class="p-6">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-glass-primary">
                  Create New Project
                </h3>
                <button
                  command="close"
                  commandfor="enhanced-form-dialog"
                  type="button"
                  class="p-1 hover:glass-bg-active rounded"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              <form class="space-y-4" @submit.prevent="handleFormSubmit">
                <div>
                  <label
                    class="block text-sm font-medium text-glass-primary mb-2"
                    >Project Name</label
                  >
                  <input
                    v-model="formData.name"
                    type="text"
                    class="form-input w-full glass-interactive"
                    required
                  />
                </div>

                <div>
                  <label
                    class="block text-sm font-medium text-glass-primary mb-2"
                    >Category</label
                  >
                  <el-select
                    v-model="formData.category"
                    name="category"
                    class="w-full"
                  >
                    <button
                      type="button"
                      class="form-input w-full text-left glass-interactive flex items-center justify-between"
                    >
                      <el-selectedcontent>Select Category</el-selectedcontent>
                      <svg
                        class="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414L11.414 12l3.293 3.293a1 1 0 01-1.414 1.414L10 13.414l-3.293 3.293a1 1 0 01-1.414-1.414L8.586 12 5.293 8.707a1 1 0 010-1.414z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </button>
                    <el-options
                      popover
                      anchor="bottom start"
                      class="w-[--button-width] glass-surface border border-glass-border rounded-lg shadow-lg"
                    >
                      <el-option
                        value="web"
                        class="px-4 py-2 hover:glass-bg-active cursor-pointer"
                        >Web Development</el-option
                      >
                      <el-option
                        value="mobile"
                        class="px-4 py-2 hover:glass-bg-active cursor-pointer"
                        >Mobile App</el-option
                      >
                      <el-option
                        value="desktop"
                        class="px-4 py-2 hover:glass-bg-active cursor-pointer"
                        >Desktop App</el-option
                      >
                      <el-option
                        value="game"
                        class="px-4 py-2 hover:glass-bg-active cursor-pointer"
                        >Game Development</el-option
                      >
                    </el-options>
                  </el-select>
                </div>

                <div>
                  <label
                    class="block text-sm font-medium text-glass-primary mb-2"
                    >Technologies</label
                  >
                  <el-autocomplete class="w-full">
                    <input
                      v-model="formData.tech"
                      placeholder="Add technologies..."
                      class="form-input w-full glass-interactive"
                    />
                    <button
                      type="button"
                      class="glass-interactive p-2 rounded-r"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </button>

                    <el-options
                      popover
                      anchor="bottom start"
                      class="w-[--input-width] glass-surface border border-glass-border rounded-lg shadow-lg"
                    >
                      <el-option
                        value="javascript"
                        class="px-4 py-2 hover:glass-bg-active cursor-pointer"
                        >JavaScript</el-option
                      >
                      <el-option
                        value="typescript"
                        class="px-4 py-2 hover:glass-bg-active cursor-pointer"
                        >TypeScript</el-option
                      >
                      <el-option
                        value="vue"
                        class="px-4 py-2 hover:glass-bg-active cursor-pointer"
                        >Vue.js</el-option
                      >
                      <el-option
                        value="react"
                        class="px-4 py-2 hover:glass-bg-active cursor-pointer"
                        >React</el-option
                      >
                      <el-option
                        value="node"
                        class="px-4 py-2 hover:glass-bg-active cursor-pointer"
                        >Node.js</el-option
                      >
                    </el-options>
                  </el-autocomplete>
                </div>

                <div>
                  <label
                    class="block text-sm font-medium text-glass-primary mb-2"
                    >Description</label
                  >
                  <textarea
                    v-model="formData.description"
                    class="form-input w-full h-24 glass-interactive"
                    placeholder="Describe your project..."
                  ></textarea>
                </div>

                <div class="flex gap-3 justify-end pt-4">
                  <button
                    command="close"
                    commandfor="enhanced-form-dialog"
                    type="button"
                    class="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-primary">
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </el-dialog-panel>
        </dialog>
      </el-dialog>
    </div>

    <!-- Command Palette Integration -->
    <div class="glass-card p-6">
      <h3 class="text-xl font-semibold text-glass-primary mb-4">
        Command Palette
      </h3>
      <p class="text-glass-secondary mb-4">
        Press
        <kbd class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm"
          >Ctrl+K</kbd
        >
        to open the command palette
      </p>

      <el-dialog>
        <dialog id="command-palette-dialog" class="backdrop:bg-transparent">
          <el-dialog-backdrop
            class="pointer-events-none bg-black/60 transition duration-200 data-closed:opacity-0"
          />
          <el-dialog-panel
            class="glass-card max-w-2xl mx-auto mt-20 transition duration-200 data-closed:scale-95 data-closed:opacity-0"
          >
            <el-command-palette>
              <div class="p-4 border-b border-glass-border">
                <input
                  autofocus
                  placeholder="Search commands..."
                  class="w-full bg-transparent text-lg text-glass-primary placeholder-glass-secondary border-0 outline-none"
                />
              </div>

              <el-command-list class="max-h-80 overflow-y-auto">
                <div class="p-2">
                  <div
                    class="px-3 py-2 text-xs font-medium text-glass-secondary uppercase tracking-wider"
                  >
                    Quick Actions
                  </div>
                  <button
                    class="w-full text-left px-3 py-2 rounded hover:glass-bg-active transition-colors flex items-center gap-3"
                    type="button"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"
                      />
                    </svg>
                    <span>View Profile</span>
                  </button>
                  <button
                    class="w-full text-left px-3 py-2 rounded hover:glass-bg-active transition-colors flex items-center gap-3"
                    type="button"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span>Open Settings</span>
                  </button>
                  <button
                    class="w-full text-left px-3 py-2 rounded hover:glass-bg-active transition-colors flex items-center gap-3"
                    type="button"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span>Create New Project</span>
                  </button>
                </div>
              </el-command-list>

              <el-no-results
                hidden
                class="p-8 text-center text-glass-secondary"
              >
                <svg
                  class="w-12 h-12 mx-auto mb-3 text-glass-secondary/50"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clip-rule="evenodd"
                  />
                </svg>
                <p>No results found.</p>
              </el-no-results>
            </el-command-palette>
          </el-dialog-panel>
        </dialog>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Component state
const searchQuery = ref('')
const viewMode = ref('grid')
const formData = ref({
  name: '',
  category: '',
  tech: '',
  description: '',
})

// Sample data
const items = ref([
  {
    id: 1,
    title: 'Personal Website',
    category: 'Web Development',
    description: 'Modern portfolio website with Vue.js and TailwindCSS',
    status: 'completed',
    progress: 100,
  },
  {
    id: 2,
    title: 'Mobile Game App',
    category: 'Game Development',
    description: 'Casual puzzle game for iOS and Android',
    status: 'in-progress',
    progress: 75,
  },
  {
    id: 3,
    title: 'E-commerce Platform',
    category: 'Web Development',
    description: 'Full-stack e-commerce solution with payment integration',
    status: 'planning',
    progress: 25,
  },
  {
    id: 4,
    title: 'Data Visualization Dashboard',
    category: 'Data Science',
    description: 'Interactive dashboard for business analytics',
    status: 'in-progress',
    progress: 60,
  },
  {
    id: 5,
    title: 'Discord Bot',
    category: 'API Development',
    description: 'Gaming community management bot with slash commands',
    status: 'completed',
    progress: 100,
  },
  {
    id: 6,
    title: 'Machine Learning Model',
    category: 'AI/ML',
    description: 'Predictive model for user behavior analysis',
    status: 'planning',
    progress: 15,
  },
])

// Computed properties
const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value
  return items.value.filter(
    item =>
      item.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Methods
const getLayoutClasses = mode => {
  const baseClasses = 'transition-all duration-300'
  switch (mode) {
    case 'list':
      return `${baseClasses} space-y-3`
    case 'masonry':
      return `${baseClasses} columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4`
    case 'dense':
      return `${baseClasses} dense-grid-sm`
    case 'grid':
    default:
      return `${baseClasses} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
  }
}

const getViewModeLabel = mode => {
  switch (mode) {
    case 'list':
      return 'List View'
    case 'masonry':
      return 'Masonry'
    case 'dense':
      return 'Dense Grid'
    case 'grid':
    default:
      return 'Grid View'
  }
}

const getStatusClass = status => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    case 'in-progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    case 'planning':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
  }
}

const getActionText = status => {
  switch (status) {
    case 'completed':
      return 'View'
    case 'in-progress':
      return 'Continue'
    case 'planning':
      return 'Start'
    default:
      return 'View'
  }
}

const handleFormSubmit = () => {
  console.log('Form submitted:', formData.value)
  // Handle form submission logic here
  formData.value = { name: '', category: '', tech: '', description: '' }
}

// Keyboard shortcuts
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      const dialog = document.getElementById('command-palette-dialog')
      if (dialog) {
        dialog.showModal()
      }
    }
  })
}
</script>

<style scoped>
/* Enhanced layout utilities */
.layout-item {
  break-inside: avoid;
  margin-bottom: 0;
}

/* Custom masonry layout for better control */
.enhanced-layout-system :deep(.columns-1) .layout-item,
.enhanced-layout-system :deep(.columns-2) .layout-item,
.enhanced-layout-system :deep(.columns-3) .layout-item {
  margin-bottom: 1rem;
  display: inline-block;
  width: 100%;
}

/* Smooth transitions for layout changes */
.layout-item {
  transition: all 0.3s ease;
}

/* Enhanced form styling */
.form-input:focus-within {
  @apply ring-2 ring-primary-500 border-primary-500;
}

/* Command palette styling */
:deep(.el-command-palette) {
  @apply w-full;
}

/* Ensure proper spacing in different view modes */
.enhanced-layout-system .space-y-3 > * + * {
  margin-top: 0.75rem;
}

/* Dense grid custom styling */
.dense-grid-sm {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

@media (max-width: 768px) {
  .dense-grid-sm {
    grid-template-columns: 1fr;
  }
}
</style>
