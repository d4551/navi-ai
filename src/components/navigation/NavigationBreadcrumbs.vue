<template>
  <nav
    class="navigation-breadcrumbs font-sans"
    :class="{ 'breadcrumbs-compact': compact }"
    role="navigation"
    aria-label="Breadcrumb navigation"
  >
    <ol class="breadcrumb-list" role="list">
      <!-- Home Link -->
      <li class="breadcrumb-item" role="listitem">
        <router-link
          to="/"
          class="breadcrumb-link home-link"
          :aria-label="homeLabel"
          :title="homeLabel"
        >
          <AppIcon :name="homeIcon" size="16" />
          <span v-if="!compact" class="breadcrumb-text">{{ homeText }}</span>
        </router-link>
      </li>

      <!-- Breadcrumb Items -->
      <li
        v-for="(crumb, index) in breadcrumbs"
        :key="index"
        class="breadcrumb-item"
        :class="{ 'breadcrumb-current': crumb.isLast }"
        role="listitem"
      >
        <!-- Separator -->
        <div class="breadcrumb-separator" aria-hidden="true">
          <AppIcon :name="separatorIcon" size="12" />
        </div>

        <!-- Breadcrumb Link or Text -->
        <router-link
          v-if="!crumb.isLast && crumb.path"
          :to="crumb.path"
          class="breadcrumb-link"
          :title="crumb.text"
        >
          <AppIcon
            v-if="crumb.icon && !compact"
            :name="crumb.icon"
            size="14"
            class="mr-1"
          />
          <span class="breadcrumb-text">{{ crumb.text }}</span>
        </router-link>

        <span
          v-else
          class="breadcrumb-current"
          :aria-current="crumb.isLast ? 'page' : undefined"
        >
          <AppIcon
            v-if="crumb.icon && !compact"
            :name="crumb.icon"
            size="14"
            class="mr-1"
          />
          <span class="breadcrumb-text">{{ crumb.text }}</span>
        </span>
      </li>
    </ol>

    <!-- Actions -->
    <div v-if="showActions" class="breadcrumb-actions">
      <!-- Favorite Toggle -->
      <IconButton
        class="breadcrumb-action-btn favorite-btn"
        :variant="'glass'"
        size="sm"
        :icon="isCurrentPageFavorite ? 'HeartIcon' : 'HeartIcon-outline'"
        :aria-label="
          isCurrentPageFavorite ? 'Remove from favorites' : 'Add to favorites'
        "
        :title="
          isCurrentPageFavorite ? 'Remove from favorites' : 'Add to favorites'
        "
        @click="toggleCurrentPageFavorite"
      />

      <!-- Share Button -->
      <IconButton
        v-if="showShare"
        class="breadcrumb-action-btn share-btn"
        :variant="'glass'"
        size="sm"
        icon="ShareIcon"
        aria-label="Share current page"
        title="Share current page"
        @click="shareCurrentPage"
      />

      <!-- Copy URL Button -->
      <IconButton
        v-if="showCopyUrl"
        class="breadcrumb-action-btn copy-btn"
        :variant="'glass'"
        size="sm"
        icon="LinkIcon"
        aria-label="Copy page URL"
        title="Copy page URL"
        @click="copyCurrentUrl"
      />

      <!-- Dropdown Menu for Mobile -->
      <div
        v-if="compact && breadcrumbs.length > maxMobileItems"
        class="breadcrumb-dropdown"
      >
        <IconButton
          class="breadcrumb-action-btn dropdown-btn"
          :variant="'glass'"
          size="sm"
          icon="ChevronDownIcon"
          aria-label="Show full breadcrumb"
          @click="toggleDropdown"
        />

        <div v-if="dropdownOpen" class="dropdown-menu" @click.stop>
          <div class="dropdown-header">Navigation Path</div>
          <div
            v-for="(crumb, index) in breadcrumbs"
            :key="`dropdown-${index}`"
            class="dropdown-item"
          >
            <router-link
              v-if="crumb.path && !crumb.isLast"
              :to="crumb.path"
              class="dropdown-link"
              @click="closeDropdown"
            >
              <AppIcon
                v-if="crumb.icon"
                :name="crumb.icon"
                size="16"
                class="mr-2"
              />
              {{ crumb.text }}
            </router-link>
            <div v-else class="dropdown-current">
              <AppIcon
                v-if="crumb.icon"
                :name="crumb.icon"
                size="16"
                class="mr-2"
              />
              {{ crumb.text }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ChevronDownIcon, ShareIcon } from '@heroicons/vue/24/outline'

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useEnhancedNavigation } from '@/composables/useEnhancedNavigation'
import { useToast } from '@/composables/useToast'
import IconButton from '@/components/ui/IconButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

// Props
const _props = defineProps({
  compact: {
    type: Boolean,
    default: false,
  },
  showActions: {
    type: Boolean,
    default: true,
  },
  showShare: {
    type: Boolean,
    default: true,
  },
  showCopyUrl: {
    type: Boolean,
    default: true,
  },
  homeIcon: {
    type: String,
    default: 'HomeIcon',
  },
  homeText: {
    type: String,
    default: 'Home',
  },
  homeLabel: {
    type: String,
    default: 'Go to homepage',
  },
  separatorIcon: {
    type: String,
    default: 'mdi-chevron-right',
  },
  maxMobileItems: {
    type: Number,
    default: 2,
  },
})

// Composables
const route = useRoute()
const { breadcrumbs, isFavorite, toggleFavorite } = useEnhancedNavigation()
const { toast } = useToast()

// Component state
const dropdownOpen = ref(false)

// Computed properties
const isCurrentPageFavorite = computed(() => {
  return isFavorite(route.path)
})

// Methods
const toggleCurrentPageFavorite = () => {
  toggleFavorite(route.path)
  const action = isCurrentPageFavorite.value ? 'Added to' : 'Removed from'
  toast.success(`${action} favorites`)
}

const shareCurrentPage = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: document.title,
        url: window.location.href,
      })
    } catch (error) {
      if (error.name !== 'AbortError') {
        copyCurrentUrl()
      }
    }
  } else {
    copyCurrentUrl()
  }
}

const copyCurrentUrl = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    toast.success('URL copied to clipboard')
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = window.location.href
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      toast.success('URL copied to clipboard')
    } catch (err) {
      toast.error('Failed to copy URL')
    } finally {
      document.body.removeChild(textArea)
    }
  }
}

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

// Close dropdown when clicking outside
const handleClickOutside = event => {
  if (!event.target.closest('.breadcrumb-dropdown')) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.navigation-breadcrumbs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-4);
  font-family: var(--font-primary);
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-1);
  margin: 0;
  padding: 0;
  list-style: none;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-sm);
}

.breadcrumb-separator {
  color: var(--text-secondary);
  opacity: 0.6;
  display: flex;
  align-items: center;
}

.breadcrumb-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  color: var(--text-secondary);
  text-decoration: none;
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--easing-ease);
  font-weight: var(--font-weight-medium);
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.breadcrumb-link:hover {
  color: var(--color-primary);
  background: var(--color-primary-bg);
  transform: translateY(-1px);
}

.breadcrumb-link.home-link {
  color: var(--text-primary-600);
  font-weight: var(--font-weight-semibold);
}

.breadcrumb-link.home-link:hover {
  color: var(--color-primary);
  background: var(--color-primary-bg);
}

.breadcrumb-current {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  color: var(--text-primary-600);
  font-weight: var(--font-weight-semibold);
  padding: var(--spacing-1) var(--spacing-2);
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.breadcrumb-text {
  line-height: 1.2;
}

/* Compact Mode */
.breadcrumbs-compact .breadcrumb-link,
.breadcrumbs-compact .breadcrumb-current {
  max-width: 120px;
  padding: var(--spacing-0-5) var(--spacing-1);
}

.breadcrumbs-compact .breadcrumb-text {
  font-size: var(--font-size-xs);
}

/* Actions */
.breadcrumb-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  flex-shrink: 0;
}

.breadcrumb-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing-ease);
}

.breadcrumb-action-btn:hover {
  color: var(--color-primary);
  background: var(--color-primary-bg);
  transform: scale(1.05);
}

.favorite-btn.is-favorite {
  color: var(--color-error);
}

.favorite-btn.is-favorite:hover {
  color: var(--color-error);
  background: var(--color-error-bg);
}

/* Dropdown */
.breadcrumb-dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1000;
  min-width: 200px;
  max-width: 300px;
  background: var(--surface-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-glass-lg);
  backdrop-filter: blur(20px);
  padding: var(--spacing-2);
  margin-top: var(--spacing-2);
  animation: dropdownSlideIn 0.2s ease-out;
}

@keyframes dropdownSlideIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-header {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: var(--spacing-2) var(--spacing-3);
  margin-bottom: var(--spacing-1);
  border-b: 1px solid var(--border-subtle);
}

.dropdown-item {
  margin-bottom: var(--spacing-0-5);
}

.dropdown-item:last-child {
  margin-bottom: 0;
}

.dropdown-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--easing-ease);
  font-size: var(--font-size-sm);
}

.dropdown-link:hover {
  color: var(--text-primary-600);
  background: var(--surface-hover);
}

.dropdown-current {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  color: var(--text-primary-600);
  font-weight: var(--font-weight-medium);
  background: var(--color-primary-bg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

/* Responsive Design */
@media (max-width: 768px) {
  .navigation-breadcrumbs {
    gap: var(--spacing-2);
  }

  .breadcrumb-link,
  .breadcrumb-current {
    max-width: 100px;
    font-size: var(--font-size-xs);
  }

  .breadcrumb-actions {
    gap: var(--spacing-0-5);
  }

  .breadcrumb-action-btn {
    width: 28px;
    height: 28px;
  }
}

@media (max-width: 480px) {
  .breadcrumb-list {
    gap: 0;
  }

  .breadcrumb-item:not(:last-child):not(:first-child) {
    display: none;
  }

  .breadcrumb-item:nth-last-child(2) {
    display: flex;
  }

  .breadcrumb-item:nth-last-child(2)::before {
    content: '...';
    color: var(--text-secondary);
    margin-right: var(--spacing-1);
    font-weight: bold;
  }
}

/* Dark theme support */
[data-theme='dark'] .dropdown-menu,
.dark-theme .dropdown-menu {
  background: rgba(15, 15, 15, 0.95);
  border-color: var(--glass-border);
  backdrop-filter: blur(20px) saturate(180%);
}

[data-theme='dark'] .dropdown-link:hover,
.dark-theme .dropdown-link:hover {
  background: var(--glass-bg);
}

[data-theme='dark'] .dropdown-current,
.dark-theme .dropdown-current {
  background: rgba(99, 102, 241, 0.15);
}

/* Gaming theme enhancements */
.theme-gaming .breadcrumb-link:hover {
  background: linear-gradient(
    135deg,
    rgba(0, 255, 136, 0.1),
    rgba(0, 217, 255, 0.05)
  );
  border: 1px solid rgba(0, 255, 136, 0.2);
  transform: translateY(-1px);
}

.theme-gaming .breadcrumb-action-btn:hover {
  background: linear-gradient(
    135deg,
    rgba(0, 255, 136, 0.1),
    rgba(0, 217, 255, 0.05)
  );
  border: 1px solid rgba(0, 255, 136, 0.2);
}
</style>
