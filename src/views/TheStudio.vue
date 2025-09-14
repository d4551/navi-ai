<template>
  <!-- Wrapper view to keep legacy route/component name -->
  <PortfolioStudio />
  <!-- Note: TheStudio now delegates to PortfolioStudio for the unified studios experience -->
</template>

<script setup lang="ts">
import PortfolioStudio from '@/views/PortfolioStudio.vue'
</script>

<style scoped>
/* No additional styles; uses PortfolioStudio styles */
</style>

