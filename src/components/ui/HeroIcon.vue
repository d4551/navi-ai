<template>
  <component
    :is="iconComponent"
    v-bind="$attrs"
    :class="iconClasses"
    :aria-hidden="!ariaLabel"
    :aria-label="ariaLabel"
  />
</template>

<script setup lang="ts">
import { computed, defineComponent } from 'vue';
import * as OutlineIcons from '@heroicons/vue/24/outline';
import * as SolidIcons from '@heroicons/vue/24/solid';
import type { Component } from 'vue';

interface Props {
  name: string;
  variant?: 'outline' | 'solid';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'outline',
  size: 'md',
  ariaLabel: '',
});

// Map common icon names to Heroicons
const iconMap: Record<string, string> = {
  // Common aliases
  search: 'MagnifyingGlassIcon',
  settings: 'Cog6ToothIcon',
  config: 'Cog6ToothIcon',
  delete: 'TrashIcon',
  remove: 'TrashIcon',
  home: 'HomeIcon',
  dashboard: 'Squares2X2Icon',
  notification: 'BellIcon',
  notifications: 'BellIcon',
  alert: 'ExclamationTriangleIcon',
  warning: 'ExclamationTriangleIcon',
  error: 'XCircleIcon',
  success: 'CheckCircleIcon',
  info: 'InformationCircleIcon',
  user: 'UserIcon',
  users: 'UsersIcon',
  profile: 'UserCircleIcon',
  logout: 'ArrowRightOnRectangleIcon',
  login: 'ArrowLeftOnRectangleIcon',
  menu: 'Bars3Icon',
  close: 'XMarkIcon',
};

const iconComponent = computed((): Component => {
  const iconSet = props.variant === 'solid' ? SolidIcons : OutlineIcons;
  const iconName = iconMap[props.name] || normalizeIconName(props.name);

  if (iconSet[iconName as keyof typeof iconSet]) {
    return iconSet[iconName as keyof typeof iconSet];
  }

  // Fallback to outline if not found in solid
  if (props.variant === 'solid' && OutlineIcons[iconName as keyof typeof OutlineIcons]) {
    return OutlineIcons[iconName as keyof typeof OutlineIcons];
  }

  // Return a fallback component
  return 'div';
});

const iconClasses = computed(() => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };
  return sizes[props.size] || sizes.md;
});

function normalizeIconName(name: string): string {
  // Convert kebab-case to PascalCase and append 'Icon'
  const cleaned =
    name
      .replace(/[^a-z0-9\-]/gi, '')
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('') + 'Icon';
  return cleaned;
}
</script>
