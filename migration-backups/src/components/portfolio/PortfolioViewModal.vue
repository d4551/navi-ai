<template>
  <div
    v-if="show && item"
    class="modal-overlay"
    @click="handleOverlayClick"
  >
    <div class="portfolio-modal" @click.stop>
      <!-- Header -->
      <div class="modal-header">
        <div class="header-content">
          <div class="title-section">
            <h2 class="modal-title">{{ item.title || 'Portfolio Item' }}</h2>
            <div class="item-meta">
              <span class="item-type" :class="`type-${item.type}`">
                <AppIcon :name="getTypeIcon(item.type)" size="16" />
                {{ getTypeLabel(item.type) }}
              </span>
              <span v-if="displayDate" class="item-date">
                <AppIcon name="mdi-calendar" size="14" />
                {{ displayDate }}
              </span>
            </div>
          </div>
          <div class="header-actions">
            <UnifiedButton
              v-if="primaryLink"
              variant="glass"
              size="sm"
              leading-icon="mdi-open-in-new"
              :href="primaryLink"
              target="_blank"
            >
              Open
            </UnifiedButton>
            <UnifiedButton
              variant="ghost"
              size="sm"
              leading-icon="mdi-share-variant"
              @click="shareItem"
            >
              Share
            </UnifiedButton>
            <UnifiedButton
              variant="ghost"
              size="sm"
              icon-only
              leading-icon="mdi-close"
              aria-label="Close modal"
              @click="$emit('close')"
            />
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="modal-content">
        <!-- Hero Media -->
        <section v-if="mediaUrl" class="hero-section">
          <div class="hero-media">
            <img
              v-if="isImage"
              :src="mediaUrl"
              :alt="item.title || 'Project media'"
              class="hero-image"
            />
            <video
              v-else-if="isVideo"
              :src="mediaUrl"
              class="hero-video"
              controls
            ></video>
            <div v-else class="hero-placeholder">
              <AppIcon :name="getTypeIcon(item.type)" class="placeholder-icon" />
            </div>
          </div>
        </section>

        <div class="content-grid">
          <!-- Main Content -->
          <div class="main-content">
            <!-- Description -->
            <section v-if="item.description" class="content-section">
              <h3 class="section-title">
                <AppIcon name="mdi-text" />
                Description
              </h3>
              <p class="section-text">{{ item.description }}</p>
            </section>

            <!-- Game Info -->
            <section v-if="item.game" class="content-section">
              <h3 class="section-title">
                <AppIcon name="mdi-gamepad-variant" />
                Game
              </h3>
              <p class="section-text">{{ item.game }}</p>
            </section>

            <!-- Skills/Technologies -->
            <section v-if="skillsOrTech?.length" class="content-section">
              <h3 class="section-title">
                <AppIcon name="mdi-code-tags" />
                {{ item.type === 'project' ? 'Technologies' : 'Skills' }}
              </h3>
              <div class="tech-tags">
                <span
                  v-for="skill in skillsOrTech"
                  :key="skill"
                  class="tech-tag"
                >
                  {{ skill }}
                </span>
              </div>
            </section>

            <!-- Achievement Details -->
            <section v-if="item.type === 'achievement' && (item.achievement?.rank || item.achievement?.event)" class="content-section">
              <h3 class="section-title">
                <AppIcon name="mdi-trophy" />
                Achievement Details
              </h3>
              <div class="achievement-details">
                <div v-if="item.achievement.rank" class="detail-item">
                  <strong>Rank:</strong> {{ item.achievement.rank }}
                </div>
                <div v-if="item.achievement.event" class="detail-item">
                  <strong>Event:</strong> {{ item.achievement.event }}
                </div>
              </div>
            </section>

            <!-- Statistics -->
            <section v-if="statsData?.length" class="content-section">
              <h3 class="section-title">
                <AppIcon name="mdi-chart-line" />
                Statistics
              </h3>
              <div class="stats-grid">
                <div
                  v-for="stat in statsData"
                  :key="stat.label"
                  class="stat-item"
                >
                  <span class="stat-label">{{ stat.label }}</span>
                  <span class="stat-value">{{ stat.value }}</span>
                </div>
              </div>
            </section>

            <!-- Links -->
            <section v-if="links?.length" class="content-section">
              <h3 class="section-title">
                <AppIcon name="mdi-link" />
                Links
              </h3>
              <div class="links-grid">
                <a
                  v-for="link in links"
                  :key="link.url"
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="link-item"
                >
                  <AppIcon :name="getLinkIcon(link.type)" />
                  {{ link.label || formatLinkType(link.type) }}
                  <AppIcon name="mdi-open-in-new" size="14" class="external-icon" />
                </a>
              </div>
            </section>
          </div>

          <!-- Sidebar -->
          <aside class="sidebar-content">
            <div class="sidebar-section">
              <h3 class="sidebar-title">Project Details</h3>
              <dl class="details-list">
                <template v-if="item.type">
                  <dt>Type</dt>
                  <dd>{{ getTypeLabel(item.type) }}</dd>
                </template>
                <template v-if="displayDate">
                  <dt>Date</dt>
                  <dd>{{ displayDate }}</dd>
                </template>
                <template v-if="item.role">
                  <dt>Role</dt>
                  <dd>{{ item.role }}</dd>
                </template>
                <template v-if="item.platforms?.length">
                  <dt>Platforms</dt>
                  <dd>{{ item.platforms.join(', ') }}</dd>
                </template>
              </dl>
            </div>

            <!-- Quick Actions -->
            <div v-if="hasActions" class="sidebar-section">
              <h3 class="sidebar-title">Actions</h3>
              <div class="action-buttons">
                <UnifiedButton
                  v-if="primaryLink"
                  variant="primary"
                  size="sm"
                  leading-icon="mdi-open-in-new"
                  :href="primaryLink"
                  target="_blank"
                  class="action-btn"
                >
                  View Project
                </UnifiedButton>
                <UnifiedButton
                  variant="outline"
                  size="sm"
                  leading-icon="mdi-pencil"
                  class="action-btn"
                  @click="$emit('edit', item)"
                >
                  Edit
                </UnifiedButton>
                <UnifiedButton
                  variant="outline"
                  size="sm"
                  leading-icon="mdi-content-copy"
                  class="action-btn"
                  @click="$emit('duplicate', item)"
                >
                  Duplicate
                </UnifiedButton>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

interface PortfolioItem {
  id: string
  title?: string
  description?: string
  type?: string
  image?: string
  media?: { url: string; type?: string }
  technologies?: string[]
  skills?: string[]
  date?: string
  game?: string
  featured?: boolean
  liveUrl?: string
  githubUrl?: string
  links?: Array<{ url: string; type?: string; label?: string }>
  metrics?: Record<string, any>
  stats?: Array<{ label: string; value: string }>
  role?: string
  platforms?: string[]
  achievement?: { rank?: string; event?: string }
}

interface Props {
  show: boolean
  item: PortfolioItem | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  edit: [item: PortfolioItem]
  duplicate: [item: PortfolioItem]
}>()

// Computed properties
const mediaUrl = computed(() => {
  if (!props.item) return null
  if (props.item.image) return props.item.image
  if (props.item.media?.url) return props.item.media.url
  return null
})

const isImage = computed(() => {
  if (!mediaUrl.value) return false
  if (props.item?.media?.type === 'image') return true
  if (props.item?.image) return true
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(mediaUrl.value)
})

const isVideo = computed(() => {
  if (!mediaUrl.value) return false
  if (props.item?.media?.type === 'video') return true
  return /\.(mp4|webm|mov|avi)$/i.test(mediaUrl.value) || 
         mediaUrl.value.includes('youtube.com') || 
         mediaUrl.value.includes('youtu.be')
})

const displayDate = computed(() => {
  if (!props.item?.date) return null
  return props.item.date
})

const skillsOrTech = computed(() => {
  return props.item?.technologies || props.item?.skills || []
})

const statsData = computed(() => {
  const item = props.item
  if (!item) return []
  
  if (item.stats) return item.stats
  
  if (item.metrics) {
    return Object.entries(item.metrics).map(([key, value]) => ({
      label: formatMetricLabel(key),
      value: formatMetricValue(value)
    }))
  }
  
  return []
})

const links = computed(() => {
  const item = props.item
  if (!item) return []
  
  const arr: any[] = Array.isArray(item.links) ? item.links : []
  const extras: any[] = []
  
  if (item.liveUrl) extras.push({ url: item.liveUrl, label: 'Live Demo', type: 'live' })
  if (item.githubUrl) extras.push({ url: item.githubUrl, label: 'Source Code', type: 'source' })
  if (item.url) extras.push({ url: item.url, label: 'View Project', type: 'external' })
  
  return [...extras, ...arr.filter(l => l?.url)]
})

const primaryLink = computed(() => links.value[0]?.url || '')

const hasActions = computed(() => {
  return primaryLink.value || true // Always show edit/duplicate
})

// Methods
const handleOverlayClick = () => {
  emit('close')
}

const shareItem = async () => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: props.item?.title || 'Portfolio Item',
        text: props.item?.description || '',
        url: window.location.href
      })
    } else {
      // Fallback: copy to clipboard
      const text = `${props.item?.title || 'Portfolio Item'}: ${props.item?.description || ''}`
      await navigator.clipboard?.writeText(text)
    }
  } catch (error) {
    console.warn('Share failed:', error)
  }
}

const formatMetricLabel = (key: string): string => {
  return key.replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/_/g, ' ')
}

const formatMetricValue = (value: any): string => {
  if (typeof value === 'number') {
    return value.toLocaleString()
  }
  return String(value)
}

const formatLinkType = (type?: string): string => {
  const types: Record<string, string> = {
    live: 'Live Demo',
    source: 'Source Code',
    video: 'Video',
    article: 'Article',
    store: 'Store Page',
    docs: 'Documentation',
    external: 'View Project'
  }
  return types[type || ''] || 'Link'
}

const getTypeIcon = (type?: string): string => {
  const icons: Record<string, string> = {
    achievement: 'mdi-trophy',
    tournament: 'mdi-sword-cross',
    project: 'mdi-code-braces',
    content: 'mdi-video',
    leadership: 'mdi-account-group',
    clip: 'mdi-play-circle',
    competition: 'mdi-target',
    game: 'mdi-gamepad-variant',
    web: 'mdi-web',
    mobile: 'mdi-cellphone',
    tool: 'mdi-wrench',
    demo: 'mdi-monitor',
    app: 'mdi-application',
    website: 'mdi-earth'
  }
  return icons[type || ''] || 'mdi-folder'
}

const getTypeLabel = (type?: string): string => {
  const labels: Record<string, string> = {
    achievement: 'Achievement',
    tournament: 'Tournament',
    project: 'Project',
    content: 'Content',
    leadership: 'Leadership',
    clip: 'Highlight',
    competition: 'Competition',
    game: 'Game',
    web: 'Web App',
    mobile: 'Mobile App',
    tool: 'Tool'
  }
  return labels[type || ''] || 'Portfolio Item'
}

const getLinkIcon = (type?: string): string => {
  const icons: Record<string, string> = {
    live: 'mdi-open-in-new',
    source: 'mdi-github',
    video: 'mdi-play',
    article: 'mdi-file-document',
    store: 'mdi-shopping',
    docs: 'mdi-book',
    external: 'mdi-open-in-new'
  }
  return icons[type || ''] || 'mdi-link'
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal, 1050);
  padding: 2rem;
  animation: fadeIn 0.3s ease-out;
}

.portfolio-modal {
  background: var(--surface-background);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideInUp 0.3s ease-out;
}

.modal-header {
  padding: 2rem 2rem 1.5rem;
  border-bottom: 1px solid var(--glass-border);
  background: var(--glass-bg-light);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.title-section {
  flex: 1;
}

.modal-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  line-height: 1.2;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.item-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-primary-100);
  border: 1px solid var(--color-primary-300);
  border-radius: var(--radius-full);
  padding: 0.375rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary-700);
}

.item-date {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.header-actions {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.hero-section {
  position: relative;
  background: var(--glass-bg);
}

.hero-media {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
}

.hero-image,
.hero-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.hero-placeholder {
  width: 100%;
  height: 100%;
  background: var(--glass-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.placeholder-icon {
  font-size: 4rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  padding: 2rem;
}

@media (min-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr 300px;
  }
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.content-section {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  transition: all var(--duration-fast);
}

.content-section:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.section-text {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tech-tag {
  background: var(--color-primary-50);
  border: 1px solid var(--color-primary-200);
  border-radius: var(--radius-full);
  padding: 0.375rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-primary-700);
  transition: all var(--duration-fast);
}

.tech-tag:hover {
  background: var(--color-primary-100);
  transform: translateY(-1px);
}

.achievement-details,
.stats-grid {
  display: grid;
  gap: 1rem;
}

.stats-grid {
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
}

.detail-item {
  color: var(--text-secondary);
  line-height: 1.5;
}

.stat-item {
  background: var(--glass-bg);
  border-radius: var(--radius-md);
  padding: 1rem;
  text-align: center;
  border: 1px solid var(--glass-border);
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

.stat-value {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.links-grid {
  display: grid;
  gap: 0.75rem;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  text-decoration: none;
  transition: all var(--duration-fast);
}

.link-item:hover {
  background: var(--glass-surface);
  border-color: var(--color-primary-300);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.external-icon {
  margin-left: auto;
  opacity: 0.6;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-section {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
}

.sidebar-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.details-list {
  display: grid;
  gap: 0.75rem;
  margin: 0;
}

.details-list dt {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.details-list dd {
  margin: 0;
  color: var(--text-primary);
  font-weight: 500;
}

.action-buttons {
  display: grid;
  gap: 0.75rem;
}

.action-btn {
  width: 100%;
  justify-content: flex-start;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(60px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Scrollbar */
.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: var(--glass-bg);
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: var(--glass-border);
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary-300);
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 1rem;
  }

  .portfolio-modal {
    max-height: 95vh;
  }

  .modal-header {
    padding: 1.5rem 1.5rem 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .modal-title {
    font-size: 1.5rem;
  }

  .content-grid {
    padding: 1.5rem;
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .content-section,
  .sidebar-section {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }
}

/* Dark theme adjustments */
[data-theme="dark"] .portfolio-modal {
  box-shadow: 0 25px 100px rgba(0, 0, 0, 0.6);
}

[data-theme="dark"] .hero-placeholder {
  background: rgba(255, 255, 255, 0.05);
}

[data-theme="dark"] .tech-tag {
  background: rgba(124, 58, 237, 0.15);
  border-color: rgba(124, 58, 237, 0.3);
  color: rgba(124, 58, 237, 0.9);
}

[data-theme="dark"] .tech-tag:hover {
  background: rgba(124, 58, 237, 0.25);
}
</style>