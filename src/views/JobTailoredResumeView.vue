<template>
  <div class="unified-job-tailoring-wrapper font-sans">
    <!-- This legacy view is unified into DocumentBuilder -->
    <DocumentBuilder />
  </div>
</template>

<script setup>
// Thin wrapper to the unified DocumentBuilder to remove duplication
import DocumentBuilder from '@/views/DocumentBuilder.vue'
</script>

<style scoped></style>
