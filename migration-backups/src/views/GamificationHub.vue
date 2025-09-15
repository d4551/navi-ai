<template>
  <StandardPageLayout page-type="gaming" content-spacing="normal" max-width="xl">
    <div class="hub-grid">
      <!-- Achievements -->
      <section class="glass p-4 gap-4 rounded-lg">
        <div class="card-header section-header">
          <h3><Icon name="award" /> Achievements</h3>
          <div class="card-badge">{{ earnedAchievements.length }}/{{ allAchievements.length }}</div>
        </div>
        <div class="achievements">
          <div v-for="a in allAchievements" :key="a.id" class="achievement" :class="{ earned: isEarned(a.id) }">
            <div class="achievement-icon"><i :class="a.icon"></i></div>
            <div class="achievement-content">
              <div class="achievement-title">{{ a.name }}</div>
              <div class="achievement-desc">{{ a.description }}</div>
              <div class="achievement-meta">
                <span class="xp">+{{ a.xp }} XP</span>
                <span class="status">{{ isEarned(a.id) ? 'Unlocked' : Math.round(getAchievementProgress(a)) + '%' }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Quests -->
      <section class="glass p-4 gap-4 rounded-lg">
        <div class="card-header section-header">
          <h3><Icon name="calendar" /> Quests</h3>
          <div class="card-badge">Weekly</div>
        </div>
        <div class="quests">
          <div v-for="q in weeklyQuests" :key="q.id" class="quest" :class="{ completed: q.completed }">
            <div class="quest-content">
              <div class="quest-title">{{ q.name }}</div>
              <div class="quest-desc">{{ q.description }}</div>
              <div class="progress progress--xs">
                <div class="progress-bar" :style="{ width: q.progress + '%' }"></div>
              </div>
            </div>
            <div class="quest-actions">
              <UnifiedButton v-if="!q.completed && q.progress >= 100" size="sm" variant="primary" @click="claim(q.id)">Claim +{{ q.xp }} XP</UnifiedButton>
              <UnifiedButton v-else size="sm" variant="ghost" :disabled="q.completed">{{ q.completed ? 'Completed' : 'In Progress' }}</UnifiedButton>
            </div>
          </div>
        </div>
      </section>

      <!-- Leaderboard -->
      <section class="glass p-4 gap-4 rounded-lg">
        <div class="card-header section-header">
          <h3><Icon name="bar-chart-3" /> Leaderboard</h3>
          <div class="card-badge">Local</div>
        </div>
        <div class="leaderboard">
          <div class="xp-summary">
            <div class="level">Level {{ levelInfo.level }} — {{ levelInfo.title }}</div>
            <div class="xp">{{ levelInfo.currentXP }} XP ({{ levelInfo.progress }}%)</div>
            <div class="bar">
              <div class="fill" :style="{ width: levelInfo.progress + '%' }"></div>
            </div>
            <div class="next">{{ levelInfo.xpForNext }} XP to next level</div>
          </div>
          <div class="milestones">
            <div v-for="(m, i) in levelMilestones" :key="i" class="milestone" :class="{ reached: userXP >= m.min }">
              <div class="name">Lv {{ i + 1 }} • {{ m.title }}</div>
              <div class="req">{{ m.min }} XP</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </StandardPageLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import GamificationService, { ACHIEVEMENTS, XP_LEVELS } from '@/utils/gamification'
import StandardPageLayout from '@/components/layout/StandardPageLayout.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import Icon from '@/components/ui/Icon.vue'

const store = useAppStore()
// Theme is globally applied; no per-page theme binding needed
const g = new GamificationService(store)

const userXP = computed(() => store.user?.xp || 0)
const levelInfo = computed(() => g.getLevelInfo(userXP.value))
const allAchievements = computed(() => Object.values(ACHIEVEMENTS))
const earnedAchievements = computed(() => store.user?.achievements || [])
const weeklyQuests = computed(() => g.getWeeklyQuests())

const isEarned = (id) => earnedAchievements.value.includes(id)
const getAchievementProgress = (a) => {
  if (isEarned(a.id)) return 100
  const stats = g.getUserStats()
  const req = a.requirements || {}
  const vals = Object.entries(req).map(([k, v]) => Math.min(((stats[k] || 0) / v) * 100, 100))
  return vals.length ? vals.reduce((x, y) => x + y, 0) / vals.length : 0
}

const claim = (id) => {
  try { g.completeWeeklyQuest(id) } catch {}
}

const levelMilestones = computed(() => {
  const list = []
  for (const [k, v] of Object.entries(XP_LEVELS)) {
    list.push({ min: v.min, title: v.title })
  }
  return list
})
</script>

<style scoped>
.gamification-hub { max-width: var(--page-content-max-width); margin: 0 auto; }
.hub-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; padding: 1rem; }
.card-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
.section-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; }
.achievements, .quests, .leaderboard { padding: 1rem; }
.achievement { display: flex; gap: 1rem; padding: 0.75rem; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; margin-bottom: 0.75rem; background: rgba(255,255,255,0.04); }
.achievement.earned { background: rgba(34,197,94,0.08); border-color: rgba(34,197,94,0.25); }
.achievement-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.08); border-radius: 8px; }
.achievement-title { font-weight: 600; color: var(--text-primary); }
.achievement-desc { color: rgba(255,255,255,0.7); font-size: var(--font-size-sm); margin-top: 0.15rem; }
.achievement-meta { display: flex; gap: 1rem; font-size: var(--font-size-xs); margin-top: 0.25rem; color: rgba(255,255,255,0.75); }
.xp { color: #fbbf24; font-weight: 600; }
.quests .quest { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.75rem; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; margin-bottom: 0.75rem; background: rgba(255,255,255,0.04); }
.quest.completed { background: rgba(34,197,94,0.08); border-color: rgba(34,197,94,0.25); }
.quest-title { font-weight: 600; color: var(--text-primary); }
.quest-desc { color: rgba(255,255,255,0.7); font-size: var(--font-size-sm); margin-bottom: 0.35rem; }
.leaderboard .xp-summary { padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 1rem; }
.leaderboard .level { font-weight: 700; color: var(--text-primary); }
.leaderboard .xp { color: rgba(255,255,255,0.85); margin-top: 0.25rem; }
.leaderboard .bar { height: 10px; background: rgba(255,255,255,0.08); border-radius: 6px; overflow: hidden; margin-top: 0.5rem; }
.leaderboard .bar .fill { height: 100%; background: linear-gradient(90deg, #7c3aed, #ec4899); }
.leaderboard .next { color: rgba(255,255,255,0.7); font-size: var(--font-size-sm); margin-top: 0.35rem; }
.milestones { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 0.5rem; }
.milestone { padding: 0.5rem; border: 1px dashed rgba(255,255,255,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: space-between; }
.milestone.reached { border-color: rgba(124,58,237,0.45); background: rgba(124,58,237,0.08); }

@media (min-width: 960px) {
  .hub-grid { grid-template-columns: 1fr 1fr; }
  .hub-grid > :last-child { grid-column: 1 / -1; }
}
</style>
