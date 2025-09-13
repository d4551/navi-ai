<template>
  <div
    class="settings-modal-overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="gamification-modal-title"
    @click.self="$emit('close')"
    @keydown.esc.prevent="$emit('close')"
  >
    <div
      class="settings-modal ultra-glass-card section-card gamification-modal"
      tabindex="-1"
      @click.stop
    >
      <div class="settings-modal-header">
        <h3
          id="gamification-modal-title"
          class="d-flex align-items-center gap-2"
        >
          <AppIcon name="mdi-trophy" />
          Achievements & Challenges
        </h3>
        <button class="glass-btn" aria-label="Close" @click="$emit('close')">
          <AppIcon name="mdi-close" />
        </button>
      </div>
      <div class="settings-modal-content">
        <GamificationDashboard />
      </div>
    </div>
  </div>
</template>

<script setup>
import AppIcon from "@/components/ui/AppIcon.vue";
import GamificationDashboard from "@/components/GamificationDashboard.vue";
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

.settings-modal.gamification-modal {
}

.settings-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.settings-modal-content {
}

.gamification-modal {
  overflow: auto;
}
</style>
