<template>
  <div class="portfolio-project page-glass-container" :data-theme="themeName">
    <StandardPageLayout
      page-type="gaming"
      :title="item?.title || 'Project'"
      :subtitle="item?.type || 'Portfolio Project'"
      :hero-stats="headerStats"
      max-width="xl"
    >
      <template #header-actions>
        <UnifiedButton
          variant="ghost"
          leading-icon="mdi-arrow-left"
          @click="goBack"
          >Back</UnifiedButton
        >
        <UnifiedButton
          v-if="primaryLink"
          variant="glass"
          leading-icon="mdi-open-in-new"
          :href="primaryLink"
          target="_blank"
          >Open</UnifiedButton
        >
        <UnifiedButton
          variant="outline"
          leading-icon="mdi-share-variant"
          @click="share"
          >Share</UnifiedButton
        >
      </template>

      <!-- Hero image -->
      <section v-if="imageUrl" class="hero unified-container">
        <div class="hero-media glass p-4 gap-4 rounded-lg unified-card">
          <img :src="imageUrl" :alt="item?.title || 'Project'" />
        </div>
      </section>

      <div v-if="item" class="unified-container project-body">
        <div class="grid">
          <!-- Left: Main content -->
          <div class="col main">
            <article
              v-if="item.description"
              class="glass p-4 gap-4 rounded-lg unified-card is-interactive neon-hover ripple-soft"
            >
              <h2 class="section-title">Summary</h2>
              <p>{{ item.description }}</p>
            </article>

            <article
              v-if="item.responsibilities?.length"
              class="glass p-4 gap-4 rounded-lg unified-card is-interactive neon-hover ripple-soft"
            >
              <h2 class="section-title">Responsibilities</h2>
              <ul>
                <li v-for="r in item.responsibilities" :key="r">{{ r }}</li>
              </ul>
            </article>

            <article
              v-if="item.outcomes?.length"
              class="glass p-4 gap-4 rounded-lg unified-card is-interactive neon-hover ripple-soft"
            >
              <h2 class="section-title">Outcomes & Impact</h2>
              <ul>
                <li v-for="o in item.outcomes" :key="o">{{ o }}</li>
              </ul>
            </article>

            <article
              v-if="item.skills?.length"
              class="glass p-4 gap-4 rounded-lg unified-card is-interactive neon-hover ripple-soft"
            >
              <h2 class="section-title">Skills</h2>
              <div class="tags">
                <span v-for="s in item.skills" :key="s" class="tag">{{
                  s
                }}</span>
              </div>
            </article>

            <div class="mt-lg">
              <UnifiedButton
                variant="ghost"
                leading-icon="mdi-arrow-left"
                @click="goBack"
                >Back to Portfolio</UnifiedButton
              >
            </div>
          </div>

          <!-- Right: Details -->
          <aside class="col side">
            <div class="glass p-4 gap-4 rounded-lg unified-card details">
              <h3 class="section-title">Project Details</h3>
              <dl class="meta-list">
                <template v-if="item.type">
                  <dt>Type</dt>
                  <dd>{{ item.type }}</dd>
                </template>
                <template v-if="displayDate">
                  <dt>Date</dt>
                  <dd>{{ displayDate }}</dd>
                </template>
                <template v-if="item.engine">
                  <dt>Engine</dt>
                  <dd>{{ item.engine }}</dd>
                </template>
                <template v-if="item.platform">
                  <dt>Platform</dt>
                  <dd>{{ item.platform }}</dd>
                </template>
              </dl>
              <div v-if="(item.tags || item.skills)?.length" class="divider" />
              <div v-if="(item.tags || item.skills)?.length" class="tags">
                <span
                  v-for="t in item.tags || item.skills"
                  :key="t"
                  class="tag"
                  >{{ t }}</span
                >
              </div>
              <div v-if="links.length" class="divider" />
              <div v-if="links.length" class="links">
                <a
                  v-for="l in links"
                  :key="l.url"
                  :href="l.url"
                  target="_blank"
                  rel="noopener"
                  class="link"
                >
                  <AppIcon :name="l.icon" /> {{ l.label || l.type || 'Link' }}
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div v-else class="unified-container">
        <div class="glass p-6 gap-4 rounded-lg unified-card empty text-center">
          <p>Project not found.</p>
          <UnifiedButton
            variant="primary"
            leading-icon="mdi-arrow-left"
            @click="goBack"
            >Back to Portfolio</UnifiedButton
          >
        </div>
      </div>
    </StandardPageLayout>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUnifiedTheme } from '@/shared/composables/useUnifiedTheme'
import StandardPageLayout from '@/components/layout/StandardPageLayout.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const route = useRoute()
const router = useRouter()
const store = useAppStore()
const theme = (() => {
  try {
    return useUnifiedTheme()
  } catch {
    return undefined as any
  }
})()
const themeName = computed(() => {
  try {
    return theme?.colorScheme?.value || 'light'
  } catch {
    return 'light'
  }
})

const slugify = (s: string = '') =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)

const item = computed<any | null>(() => {
  const slug = String(route.params.slug || '').toLowerCase()
  const items = (store.user?.portfolio || []) as any[]
  return items.find(i => slugify(i?.title || '') === slug) || null
})

const imageUrl = computed(() => {
  const it: any = item.value
  if (!it) return null
  if (it.image) return it.image
  if (Array.isArray(it.media)) {
    const img = it.media.find((m: any) => m?.type?.startsWith?.('image'))
    return img?.url || null
  }
  return null
})

const displayDate = computed(() => {
  const it: any = item.value
  const d = it?.date || it?.year
  return d ? String(d) : ''
})

const links = computed(() => {
  const it: any = item.value
  const arr: any[] = Array.isArray(it?.links) ? it.links : []
  const extras: any[] = []
  if (it?.url)
    extras.push({
      url: it.url,
      label: 'Open',
      type: 'url',
      icon: 'mdi-open-in-new',
    })
  if (it?.demoUrl)
    extras.push({
      url: it.demoUrl,
      label: 'Play',
      type: 'demo',
      icon: 'mdi-play',
    })
  const list = [...extras, ...arr.filter(l => l?.url)]
  return list
})

const primaryLink = computed(() => links.value[0]?.url || '')

const headerStats = computed(() => {
  const it: any = item.value || {}
  const year = String(it?.year || '').slice(0, 4) || ''
  const engine = it?.engine || ''
  const platform = it?.platform || ''
  return [
    year ? { label: year, icon: 'mdi-calendar', color: 'info' } : null,
    engine ? { label: engine, icon: 'mdi-engine', color: 'primary' } : null,
    platform
      ? { label: platform, icon: 'mdi-gamepad-variant', color: 'success' }
      : null,
  ].filter(Boolean) as Array<{ label: string; icon: string; color: string }>
})

function goBack() {
  router.push('/portfolio')
}

async function share() {
  try {
    const slug = String(route.params.slug || '')
    const url = `${window.location.origin}${window.location.pathname}#/portfolio/project/${slug}`
    if (navigator.share)
      await navigator.share({ title: item.value?.title || 'Project', url })
    else await navigator.clipboard.writeText(url)
  } catch {}
}
</script>

<style scoped>
.hero-media {
  overflow: hidden;
}
.hero-media img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: var(--radius-lg);
}

.project-body .grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}
.project-body .main {
  display: grid;
  gap: var(--spacing-3);
}
.project-body .side {
  display: grid;
  gap: var(--spacing-3);
}

@media (min-width: 992px) {
  .project-body .grid {
    grid-template-columns: 1fr 340px;
  }
}

.section-title {
  font-weight: 700;
  margin-bottom: 8px;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1-5);
}
.tag {
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  border-radius: 999px;
  padding: var(--spacing-0-5) var(--spacing-2);
  font-size: 12px;
}

.details .meta-list {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: var(--spacing-2-5);
  row-gap: var(--spacing-1-5);
}
.details dt {
  color: var(--text-secondary);
  font-size: 0.85rem;
}
.details dd {
  margin: 0;
  font-weight: 600;
}
.details .divider {
  height: 1px;
  background: var(--glass-border);
  margin: var(--spacing-2-5) 0;
}
.details .links {
  display: grid;
  gap: var(--spacing-1-5);
}
.details .link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  color: var(--text-primary);
  text-decoration: none;
  padding: var(--spacing-1-5) var(--spacing-2);
  border-radius: var(--spacing-2);
  border: 1px solid var(--glass-border);
  background: var(--surface-glass);
}
.details .link:hover {
  border-color: var(--color-primary-300);
}

.empty {
  padding: var(--spacing-6);
}
</style>
