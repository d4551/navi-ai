<template>
  <div class="dropdown font-sans">
    <UnifiedButton
      variant="outline"
      size="sm"
      data-bs-toggle="dropdown"
      leading-icon="PlusIcon"
    >
      Add Item
    </UnifiedButton>
    <ul class="dropdown-menu">
      <li>
        <a
          class="dropdown-item"
          href="#"
          @click="$emit('quickAdd', 'achievement')"
        >
          <AppIcon name="TrophyIcon" class="mr-2" />Achievement
        </a>
      </li>
      <li>
        <a class="dropdown-item" href="#" @click="$emit('quickAdd', 'clip')">
          <AppIcon name="PlayIcon-circle" class="mr-2" />Video Clip
        </a>
      </li>
      <li>
        <a
          class="dropdown-item"
          href="#"
          @click="$emit('quickAdd', 'tournament')"
        >
          <AppIcon name="TrophyIcon-outline" class="mr-2" />Tournament
        </a>
      </li>
      <li>
        <a
          class="dropdown-item"
          href="#"
          @click="$emit('quickAdd', 'leadership')"
        >
          <AppIcon name="UsersIcon" />Leadership Role
        </a>
      </li>
      <li>
        <a class="dropdown-item" href="#" @click="$emit('quickAdd', 'content')">
          <AppIcon name="VideoCameraIcon" />Content Creation
        </a>
      </li>
      <li><hr class="dropdown-divider" /></li>
      <li>
        <a class="dropdown-item" href="#" @click="$emit('quickAdd', 'custom')">
          <AppIcon name="mdi-cog-outline" class="mr-2" />Custom Item
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup>
import {
  PlusIcon,
  TrophyIcon,
  UsersIcon,
  VideoCameraIcon,
} from '@heroicons/vue/24/outline'

import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

defineEmits(['quickAdd'])
</script>
