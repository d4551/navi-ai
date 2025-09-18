<template>
  <div
    class="compact-gamify-hud glass-card section-card font-sans"
    role="region"
    aria-label="Gamification"
  >
    <div class="hud-flex flex-wrap">
      <div class="hud-level">
        <AppIcon name="TrophyIcon" />
        <span class="lvl">Lv {{ levelInfo.level }}</span>
        <span class="title">{{ levelInfo.title }}</span>
      </div>
      <div class="hud-streak" title="Daily streak">
        <AppIcon name="FireIcon" />
        <span>{{ streak }}</span>
      </div>
    </div>
    <div
      class="hud-bar"
      :title="`${levelInfo.xpInLevel}/${levelInfo.xpRequiredForLevel} XP`"
    >
      <div class="fill" :style="{ width: levelInfo.progress + '%' }"></div>
    </div>
    <div class="hud-actions">
      <UnifiedButton
        size="sm"
        variant="ghost"
        leading-icon="EyeIcon"
        @click="openQuests"
        >Quests</UnifiedButton
      >
      <UnifiedButton
        size="sm"
        variant="glass"
        leading-icon="CalendarIcon-check"
        @click="openDaily"
        >Daily</UnifiedButton
      >
    </div>
  </div>
</template>

<script setup>
import { EyeIcon } from '@heroicons/vue/24/outline'
import { TrophyIcon } from '@heroicons/vue/24/solid'

import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import GamificationService from '@/utils/gamification'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const router = useRouter()
const store = useAppStore()
const g = new GamificationService(store)

const userXP = computed(() => store.user?.xp || 0)
const levelInfo = computed(() => g.getLevelInfo(userXP.value))
const streak = computed(() => g.getStreak().current)

function openQuests() {
  router.push('/dashboard')
}
function openDaily() {
  router.push('/dashboard')
}
</script>

<style scoped>
.compact-gamify-hud {
  display: grid;
  gap: 8px;
  padding: 10px;
  border: 1px solid var(--glass-border);
}
.hud-flex flex-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.hud-level {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
}
.hud-level .lvl {
  font-weight: 800;
}
.hud-level .title {
  font-size: 0.85rem;
  opacity: 0.8;
}
.hud-streak {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  opacity: 0.9;
}
.hud-bar {
  height: 8px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  overflow: hidden;
}
.hud-bar .fill {
  height: 100%;
  background: var(--gradient-accent-primary);
  transition: width 0.3s ease;
}
.hud-actions {
  display: inline-flex;
  gap: 6px;
  justify-content: flex-end;
}
</style>
