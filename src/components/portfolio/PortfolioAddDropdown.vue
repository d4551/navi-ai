<template>
  <div class="dropdown">
    <UnifiedButton
      variant="outline"
      size="sm"
      data-bs-toggle="dropdown"
      leading-icon="mdi-plus"
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
          <AppIcon name="mdi-trophy-outline" class="me-2" />Achievement
        </a>
      </li>
      <li>
        <a class="dropdown-item" href="#" @click="$emit('quickAdd', 'clip')">
          <AppIcon name="mdi-play-circle" class="me-2" />Video Clip
        </a>
      </li>
      <li>
        <a
          class="dropdown-item"
          href="#"
          @click="$emit('quickAdd', 'tournament')"
        >
          <AppIcon name="mdi-medal-outline" class="me-2" />Tournament
        </a>
      </li>
      <li>
        <a
          class="dropdown-item"
          href="#"
          @click="$emit('quickAdd', 'leadership')"
        >
          <AppIcon name="mdi-account-group" />Leadership Role
        </a>
      </li>
      <li>
        <a class="dropdown-item" href="#" @click="$emit('quickAdd', 'content')">
          <AppIcon name="mdi-video" />Content Creation
        </a>
      </li>
      <li><hr class="dropdown-divider" /></li>
      <li>
        <a class="dropdown-item" href="#" @click="$emit('quickAdd', 'custom')">
          <AppIcon name="mdi-cog-outline" class="me-2" />Custom Item
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup>
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";

defineEmits(["quickAdd"]);
</script>
