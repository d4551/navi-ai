<template>
  <div
    class="settings-modal-overlay font-sans"
    role="dialog"
    aria-modal="true"
    aria-labelledby="gamification-modal-title"
    @click.self="$emit('close')"
    @keydown.esc.prevent="$emit('close')"
  >
    <div class="settings-modal ultra-glass-card section-card gamification-modal" tabindex="-1" @click.stop>
      <div class="settings-modal-header">
        <h3 id="gamification-modal-title" class="flex items-center gap-glass-sm">
          <AppIcon name="TrophyIcon" />
          Achievements & Challenges
        </h3>
        <button class="glass-btn" aria-label="Close" @click="$emit('close')">
          <AppIcon name="XMarkIcon" />
        </button>
      </div>
      <div class="settings-modal-content">
        <GamificationDashboard />
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['close'])
import AppIcon from '@/components/ui/AppIcon.vue'
import GamificationDashboard from '@/components/GamificationDashboard.vue'
</script>

<style scoped>
.settings-modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--surface-overlay);
  backdrop-filter: var(--glass-backdrop-blur-sm);
  -webkit-backdrop-filter: var(--glass-backdrop-blur-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.settings-modal {
  width: min(96vw, 560px);
  max-height: 90vh;
  overflow: auto;
  border: 1px solid var(--glass-border);
  border-radius: 16px;
}

/* Expand width for gamification dashboard */
.settings-modal.gamification-modal {
  width: min(1100px, 96vw);
}

.settings-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: 1px solid var(--glass-border);
}

.settings-modal-content {
  padding: var(--spacing-4);
}

.gamification-modal {
  max-width: min(1100px, 96vw);
  width: 100%;
  max-height: 90vh;
  overflow: auto;
}
</style>
