<template>
  <StandardPageLayout
    page-type="gaming"
    content-spacing="normal"
    max-width="xl"
  >
    <template #header>
      <!-- The header content can be unified here if needed -->
    </template>

    <StudioSubNav 
      :database-count="databaseCount"
      :analytics-count="analyticsCount"
      :network-count="networkCount"
    />

    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" @update-counts="updateCounts" />
      </transition>
    </router-view>
  </StandardPageLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { ref } from 'vue';
import StandardPageLayout from "@/components/layout/StandardPageLayout.vue";
import StudioSubNav from "@/components/studio/StudioSubNav.vue";

const databaseCount = ref(0);
const analyticsCount = ref(0);
const networkCount = ref(0);

const updateCounts = (counts: { database?: number; analytics?: number; network?: number }) => {
  if (counts.database !== undefined) {
    databaseCount.value = counts.database;
  }
  if (counts.analytics !== undefined) {
    analyticsCount.value = counts.analytics;
  }
  if (counts.network !== undefined) {
    networkCount.value = counts.network;
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
