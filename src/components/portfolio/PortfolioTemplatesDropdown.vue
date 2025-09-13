<template>
  <div class="dropdown">
    <button
      class="btn btn-outline-secondary dropdown-toggle btn-sm glass-elevated v-btn variant-outlined ui-btn ui-size-md"
      data-bs-toggle="dropdown"
      style="
        min-height: var(--minimum-target);
        border-radius: var(--border-radius-md);
      "
    >
      <AppIcon
        name="mdi-auto-fix"
        class="icon-sm"
        style="margin-right: var(--spacing-xs)"
      />
      Templates
    </button>
    <ul class="dropdown-menu">
      <li>
        <a
          class="dropdown-item"
          href="#"
          @click="$emit('applyTemplate', 'esports')"
        >
          <AppIcon name="mdi-trophy-outline" class="me-2" />Esports
        </a>
      </li>
      <li>
        <a
          class="dropdown-item"
          href="#"
          @click="$emit('applyTemplate', 'content-creator')"
        >
          <AppIcon name="mdi-video" />Content Creator
        </a>
      </li>
      <li>
        <a
          class="dropdown-item"
          href="#"
          @click="$emit('applyTemplate', 'developer')"
        >
          <AppIcon name="mdi-code-braces" class="me-2" />Game Developer
        </a>
      </li>
      <li>
        <a
          class="dropdown-item"
          href="#"
          @click="$emit('applyTemplate', 'community')"
        >
          <AppIcon name="mdi-account-group" />Community Manager
        </a>
      </li>
      <li><hr class="dropdown-divider" /></li>
      <li>
        <button
          class="dropdown-item d-flex align-items-center"
          role="menuitem"
          :disabled="store.loading.ai"
          @click="$emit('showAISuggestions')"
        >
          <AppIcon name="mdi-robot" color="info" />
          <span class="flex-grow-1">AI Suggestions</span>
          <small v-if="store.loading.ai" class="text-muted ms-2">...</small>
        </button>
      </li>
      <li>
        <button
          class="dropdown-item d-flex align-items-center"
          role="menuitem"
          :disabled="store.user.portfolio.length === 0 || optimizing"
          @click="$emit('optimizePortfolio')"
        >
          <AppIcon name="mdi-chart-bar" color="info" />
          <span class="flex-grow-1">Optimize</span>
          <small v-if="optimizing" class="text-muted ms-2">...</small>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import AppIcon from "@/components/ui/AppIcon.vue";
defineProps({
  store: {
    type: Object,
    required: true,
  },
  optimizing: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["applyTemplate", "showAISuggestions", "optimizePortfolio"]);
</script>
