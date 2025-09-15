<template>
  <div class="glass-card font-sans">
    <!-- Header Section -->
    <header v-if="showHeader" class="flex items-center justify-between p-glass-lg border-b border-glass-border">
      <div class="flex items-center space-x-glass-sm">
        <component
          :is="headerIcon"
          v-if="headerIcon"
          class="w-5 h-5 text-glass-primary"
        />
        <h2 class="text-lg font-medium text-glass-primary">
          {{ headerTitle }}
        </h2>
      </div>

      <div v-if="$slots.headerActions" class="flex items-center space-x-glass-sm">
        <slot name="headerActions" />
      </div>
    </header>

    <!-- Main Content -->
    <main class="p-glass-lg space-y-glass-md">
      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-glass-xl">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-neon-blue border-opacity-25 border-t-neon-blue"></div>
        <span class="ml-3 text-glass-secondary">{{ loadingText }}</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-error-50 border border-error-200 rounded-md p-glass-md">
        <div class="flex items-center">
          <ExclamationTriangleIcon class="w-5 h-5 text-error-500 mr-2" />
          <span class="text-error-700 font-medium">{{ errorTitle }}</span>
        </div>
        <p class="text-error-600 text-sm mt-1">{{ error }}</p>
        <button
          v-if="showRetry"
          class="mt-3 text-sm font-medium text-error-600 hover:text-error-700 underline"
          @click="$emit('retry')"
        >
          Try Again
        </button>
      </div>

      <!-- Content Slot -->
      <div v-else>
        <slot />
      </div>
    </main>

    <!-- Footer Section -->
    <footer v-if="showFooter || $slots.footer" class="flex items-center justify-end p-glass-lg border-t border-glass-border space-x-glass-sm">
      <slot name="footer">
        <button
          v-if="showCancelButton"
          :class="themeClasses.btnSecondary"
          @click="$emit('cancel')"
        >
          {{ cancelText }}
        </button>
        <button
          v-if="showSaveButton"
          :class="themeClasses.btnPrimary"
          :disabled="loading"
          @click="$emit('save')"
        >
          {{ saveText }}
        </button>
      </slot>
    </footer>
  </div>
</template>

<script>
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import { useThemeUtils } from '@/composables/useThemeUtils'
import { useStores } from '@/composables/useStores'

export default {
  name: 'StandardComponent',
  components: {
    ExclamationTriangleIcon
  },
  props: {
    // Header props
    showHeader: {
      type: Boolean,
      default: true
    },
    headerTitle: {
      type: String,
      default: ''
    },
    headerIcon: {
      type: [String, Object],
      default: null
    },

    // State props
    loading: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: 'Loading...'
    },
    error: {
      type: String,
      default: null
    },
    errorTitle: {
      type: String,
      default: 'Error'
    },
    showRetry: {
      type: Boolean,
      default: true
    },

    // Footer props
    showFooter: {
      type: Boolean,
      default: false
    },
    showCancelButton: {
      type: Boolean,
      default: false
    },
    showSaveButton: {
      type: Boolean,
      default: false
    },
    cancelText: {
      type: String,
      default: 'Cancel'
    },
    saveText: {
      type: String,
      default: 'Save'
    }
  },
  emits: ['cancel', 'save', 'retry'],
  setup() {
    const { themeClasses } = useThemeUtils()
    const stores = useStores()

    return {
      themeClasses,
      stores
    }
  }
}
</script>
