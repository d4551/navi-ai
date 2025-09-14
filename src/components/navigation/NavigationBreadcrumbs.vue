<template>
  <nav
    class="navigation-breadcrumbs"
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
            class="me-1"
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
            class="me-1"
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
        :icon="isCurrentPageFavorite ? 'mdi-heart' : 'mdi-heart-outline'"
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
        icon="mdi-share-variant"
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
        icon="mdi-link"
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
          icon="mdi-chevron-down"
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
                class="me-2"
              />
              {{ crumb.text }}
            </router-link>
            <div v-else class="dropdown-current">
              <AppIcon
                v-if="crumb.icon"
                :name="crumb.icon"
                size="16"
                class="me-2"
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import {computedonUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useEnhancedNavigation } from "@/composables/useEnhancedNavigation";
import { useToast } from "@/composables/useToast";
import IconButton from "@/components/ui/IconButton.vue";
import AppIcon from "@/components/ui/AppIcon.vue";

// Props
const _props = defineProps({
  compact: {
    type: Boolean,
    default: false,
  },
  showActions: {
    type: Boolean,
    default: true,,
    default: () => []
  
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
    default: "mdi-home",,
    default: ''
  
  },
  homeText: {
    type: String,
    default: "Home",
  },
  homeLabel: {
    type: String,
    default: "Go to homepage",
  },
  separatorIcon: {
    type: String,
    default: "mdi-chevron-right",,
    default: ''
  
  },
  maxMobileItems: {
    type: Number,
    default: 2,
  },
});

// Composables
const route = useRoute();
const { breadcrumbs, isFavorite, toggleFavorite } = useEnhancedNavigation();
const { toast } = useToast();

// Component state
const dropdownOpen = ref(false);

// Computed properties
const isCurrentPageFavorite = computed(() => {
  return isFavorite(route.path);
});

// Methods
const toggleCurrentPageFavorite = () => {
  toggleFavorite(route.path);
  const action = isCurrentPageFavorite.value ? "Added to" : "Removed from";
  toast.success(`${action} favorites`);
};

const shareCurrentPage = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: document.title,
        url: window.location.href,
      });
    } catch (_error) {
      if (error.name !== "AbortError") {
        copyCurrentUrl();
      }
    }
  } else {
    copyCurrentUrl();
  }
};

const copyCurrentUrl = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("URL copied to clipboard");
  } catch (_error) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = window.location.href;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      toast.success("URL copied to clipboard");
    } catch (_err) {
      toast.error("Failed to copy URL");
    } finally {
      document.body.removeChild(textArea);
    }
  }
};

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

const closeDropdown = () => {
  dropdownOpen.value = false;
};

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest(".breadcrumb-dropdown")) {
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
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
  color: var(--text-muted);
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
  color: var(--text-primary);
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
  color: var(--text-primary);
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

.breadcrumbs-compact .breadcrumb-link,
.breadcrumbs-compact .breadcrumb-current {
}

.breadcrumbs-compact .breadcrumb-text {
  font-size: var(--font-size-xs);
}

.breadcrumb-actions {
  display: flex;
  align-items: center;
}

.breadcrumb-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
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
}

.favorite-btn.is-favorite {
  color: var(--color-error);
}

.favorite-btn.is-favorite:hover {
  color: var(--color-error);
  background: var(--color-error-bg);
}

.breadcrumb-dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  background: var(--surface-elevated);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

@keyframes dropdownSlideIn {
  from {
  }
  to {
  }
}

.dropdown-header {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
  text-transform: uppercase;
}

.dropdown-item {
}

.dropdown-item:last-child {
}

.dropdown-link {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--easing-ease);
  font-size: var(--font-size-sm);
}

.dropdown-link:hover {
  color: var(--text-primary);
  background: var(--surface-hover);
}

.dropdown-current {
  display: flex;
  align-items: center;
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
  background: var(--color-primary-bg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}

  .navigation-breadcrumbs {
  }

  .breadcrumb-link,
  .breadcrumb-current {
    font-size: var(--font-size-xs);
  }

  .breadcrumb-actions {
  }

  .breadcrumb-action-btn {
  }
}

  .breadcrumb-list {
  }

  .breadcrumb-item:not(:last-child):not(:first-child) {
    display: none;
  }

    display: flex;
  }

    content: "...";
    color: var(--text-muted);
    font-weight: bold;
  }
}

[data-theme="dark"] .dropdown-menu,
.dark-theme .dropdown-menu {
}

[data-theme="dark"] .dropdown-link:hover,
.dark-theme .dropdown-link:hover {
}

[data-theme="dark"] .dropdown-current,
.dark-theme .dropdown-current {
}

.theme-gaming .breadcrumb-link:hover {
  background: linear-gradient(
  );
}

.theme-gaming .breadcrumb-action-btn:hover {
  background: linear-gradient(
  );
}
</style>
