<template>
  <div 
    class="portfolio-card" 
    :class="[ `portfolio-card--${layout}`, 
              { 'portfolio-card--featured': item.featured }
    ]"
  >
    <!-- Featured Badge -->
    <div v-if="item.featured" class="featured-badge">
      <AppIcon name="mdi-star" />
    </div>

    <!-- Media Section -->
    <div v-if="item.media" class="card-media">
      <div class="media-container">
        <img 
          v-if="item.media.type === 'image'"
          :src="item.media.url" 
          :alt="item.title"
          class="media-image"
          @error="handleMediaError"
        />
        <video 
          v-else-if="item.media.type === 'video'"
          :src="item.media.url"
          class="media-video"
          muted
          loop
          @mouseenter="playVideo"
          @mouseleave="pauseVideo"
        ></video>
        <div v-else class="media-placeholder">
          <AppIcon :name="getTypeIcon(item.type)" />
        </div>
      </div>
      <div class="media-overlay">
        <button 
          v-if="item.media.type === 'video'"
          class="play-button"
          @click="togglePlay"
        >
          <AppIcon :name="isPlaying ? 'mdi-pause' : 'mdi-play'" />
        </button>
      </div>
    </div>

    <!-- Card Content -->
    <div class="card-content">
      <!-- Header -->
      <div class="card-header section-header-section">
        <div class="type-badge-container">
          <span class="type-badge" :class="`type-badge--${item.type}`">
            <AppIcon :name="getTypeIcon(item.type)" />
            {{ getTypeLabel(item.type) }}
          </span>
        </div>
        <div class="actions-menu" @click.stop>
          <button 
            class="actions-toggle"
            :aria-expanded="showActions"
            @click="showActions = !showActions"
          >
            <AppIcon name="mdi-dots-vertical" />
          </button>
          <div v-if="showActions" class="actions-dropdown">
            <button @click="$emit('edit', item)">
              <AppIcon name="mdi-pencil" />Edit
            </button>
            <button @click="$emit('toggle-featured', item)">
              <AppIcon :name="item.featured ? 'mdi-star' : 'mdi-star-outline'" />
              {{ item.featured ? 'Unfeature' : 'Feature' }}
            </button>
            <button class="text-info" @click="shareItem">
              <AppIcon name="mdi-share" />Share
            </button>
            <hr class="dropdown-divider">
            <button class="text-danger" @click="$emit('delete', item)">
              <AppIcon name="mdi-delete" />Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Title & Description -->
      <div class="card-body section-body-section">
        <h5 class="card-title">{{ item.title || 'Untitled' }}</h5>
        <p v-if="item.description" class="card-description">
          {{ truncateText(item.description, layout === 'list' ? 200 : 120) }}
        </p>
        
        <!-- Game Info -->
        <div v-if="item.game" class="game-info">
          <AppIcon name="mdi-gamepad-variant" />
          <span>{{ item.game }}</span>
        </div>

        <!-- Achievement Details -->
        <div v-if="item.achievement" class="achievement-details">
          <div class="achievement-stat">
            <AppIcon name="mdi-trophy" />
            <span>{{ item.achievement.rank || 'Achievement' }}</span>
          </div>
          <div v-if="item.achievement.date" class="achievement-date">
            <AppIcon name="mdi-calendar" />
            <span>{{ formatDate(item.achievement.date) }}</span>
          </div>
        </div>

        <!-- Project Stats -->
        <div v-if="item.stats" class="project-stats">
          <div v-for="(value, key) in item.stats" :key="key" class="stat-item">
            <span class="stat-value">{{ formatStatValue(value) }}</span>
            <span class="stat-label">{{ formatStatLabel(key) }}</span>
          </div>
        </div>
      </div>

      <!-- Skills & Tags -->
      <div v-if="item.skills?.length" class="card-skills">
        <div class="skills-container">
          <span 
            v-for="skill in (layout === 'list' ? item.skills : item.skills.slice(0, 6))" 
            :key="skill" 
            class="skill-tag"
          >
            {{ skill }}
          </span>
          <span 
            v-if="layout !== 'list' && item.skills.length > 6"
            class="skill-tag skill-tag--more"
          >
            +{{ item.skills.length - 6 }}
          </span>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="card-footer-section">
        <div class="timestamp">
          <AppIcon name="mdi-clock-outline" />
          <span>{{ formatDate(item.createdAt || item.date) }}</span>
        </div>
        <div v-if="showAnalytics" class="analytics-preview">
          <span class="view-count">
            <AppIcon name="mdi-eye" />
            {{ item.views || 0 }}
          </span>
          <span class="like-count">
            <AppIcon name="mdi-heart" />
            {{ item.likes || 0 }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits, defineProps } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const _props = defineProps({
  item: { type: Object, required: true },
  layout: { type: String, default: 'grid' },
  showAnalytics: { type: Boolean, default: false }
})

const emit = defineEmits(['edit', 'delete', 'toggle-featured', 'share'])

// Local state
const showActions = ref(false)
const isPlaying = ref(false)
const mediaError = ref(false)

// Methods
function getTypeIcon(type) {
  const icons = {
    achievement: 'mdi-trophy',
    clip: 'mdi-play-circle',
    tournament: 'mdi-tournament',
    leadership: 'mdi-account-star',
    content: 'mdi-video',
    project: 'mdi-folder-multiple-outline',
    stream: 'mdi-broadcast',
    collaboration: 'mdi-account-group'
  }
  return icons[type] || 'mdi-file'
}

function getTypeLabel(type) {
  const labels = {
    achievement: 'Achievement',
    clip: 'Clip',
    tournament: 'Tournament',
    leadership: 'Leadership',
    content: 'Content',
    project: 'Project',
    stream: 'Stream',
    collaboration: 'Collaboration'
  }
  return labels[type] || 'Item'
}

function truncateText(text, maxLength) {
  if (!text) return ''
  return text.length <= maxLength ? text : text.substring(0, maxLength) + '...'
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function formatStatValue(value) {
  if (typeof value === 'number') {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
    if (value >= 1000) return (value / 1000).toFixed(1) + 'K'
    return value.toLocaleString()
  }
  return value
}

function formatStatLabel(key) {
  const labels = {
    views: 'Views',
    likes: 'Likes',
    downloads: 'Downloads',
    plays: 'Plays',
    wins: 'Wins',
    kills: 'Kills',
    score: 'Score'
  }
  return labels[key] || key.charAt(0).toUpperCase() + key.slice(1)
}

function handleMediaError() {
  mediaError.value = true
}

function playVideo(event) {
  if (props.item.media?.type === 'video') {
    event.target.play()
  }
}

function pauseVideo(event) {
  if (props.item.media?.type === 'video') {
    event.target.pause()
  }
}

function togglePlay(event) {
  const video = event.target.closest('.card-media').querySelector('video')
  if (video) {
    if (video.paused) {
      video.play()
      isPlaying.value = true
    } else {
      video.pause()
      isPlaying.value = false
    }
  }
}

function shareItem() {
  emit('share', props.item)
  showActions.value = false
}

// Close actions menu when clicking outside
function handleClickOutside() {
  showActions.value = false
}

// Add click outside listener
if (typeof document !== 'undefined') {
  document.addEventListener('click', handleClickOutside)
}
</script>

<style scoped>
/* Enhanced Modern Portfolio Card Styles */
.portfolio-card {
  position: relative;
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 1px 0 rgba(255, 255, 255, 0.1) inset;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  isolation: isolate;
}

.portfolio-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.2) 0%, 
    transparent 25%, 
    transparent 75%, 
    rgba(255, 255, 255, 0.1) 100%);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: xor;
  -webkit-mask-composite: xor;
  pointer-events: none;
}

.portfolio-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.15),
    0 8px 32px rgba(var(--color-primary-rgb), 0.1),
    0 1px 0 rgba(255, 255, 255, 0.2) inset;
  border-color: rgba(var(--color-primary-rgb), 0.3);
}

.portfolio-card:hover::before {
  background: linear-gradient(135deg, 
    rgba(var(--color-primary-rgb), 0.3) 0%, 
    rgba(var(--color-success-rgb), 0.2) 50%, 
    rgba(var(--color-warning-rgb), 0.3) 100%);
}

/* Enhanced Featured Card */
.portfolio-card--featured {
  background: linear-gradient(135deg, 
    var(--glass-surface), 
    rgba(255, 193, 7, 0.08)
  );
  border-color: rgba(255, 193, 7, 0.4);
  position: relative;
}

.portfolio-card--featured::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, 
    var(--color-warning), 
    var(--color-warning-alt, #ffc107)
  );
  border-radius: 20px 20px 0 0;
}

.featured-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  background: linear-gradient(135deg, var(--color-warning), var(--color-warning-alt, #ffc107));
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  z-index: 3;
  box-shadow: 
    0 4px 12px rgba(255, 193, 7, 0.4),
    0 1px 0 rgba(255, 255, 255, 0.2) inset;
  animation: featuredPulse 2s ease-in-out infinite;
}

@keyframes featuredPulse {
  0%, 100% { 
    transform: scale(1);
    box-shadow: 
      0 4px 12px rgba(255, 193, 7, 0.4),
      0 1px 0 rgba(255, 255, 255, 0.2) inset;
  }
  50% { 
    transform: scale(1.1);
    box-shadow: 
      0 6px 20px rgba(255, 193, 7, 0.6),
      0 1px 0 rgba(255, 255, 255, 0.3) inset;
  }
}

/* Enhanced Media Section */
.card-media {
  position: relative;
  width: 100%;
  height: 240px;
  overflow: hidden;
  background: linear-gradient(135deg, var(--glass-elevated), var(--glass-surface));
  border-radius: 16px 16px 0 0;
}

.media-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.media-image,
.media-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  filter: contrast(1.1) saturate(1.1);
}

.portfolio-card:hover .media-image,
.portfolio-card:hover .media-video {
  transform: scale(1.08) rotate(0.5deg);
  filter: contrast(1.2) saturate(1.2) brightness(1.05);
}

.media-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    var(--glass-elevated), 
    rgba(var(--color-primary-rgb), 0.1)
  );
  color: var(--text-secondary);
  font-size: 3rem;
  position: relative;
}

.media-placeholder::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, 
    transparent 0%, 
    rgba(var(--color-primary-rgb), 0.05) 50%, 
    transparent 100%);
}

.media-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(0, 0, 0, 0.3) 0%, 
    rgba(0, 0, 0, 0.5) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  backdrop-filter: blur(4px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.portfolio-card:hover .media-overlay {
  opacity: 1;
  backdrop-filter: blur(8px);
}

.play-button {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-alt));
  color: white;
  border: none;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  font-size: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  box-shadow: 
    0 4px 20px rgba(var(--color-primary-rgb), 0.4),
    0 1px 0 rgba(255, 255, 255, 0.2) inset;
  position: relative;
  overflow: hidden;
}

.play-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, 
    rgba(255, 255, 255, 0.2) 0%, 
    transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.play-button:hover {
  transform: scale(1.15);
  box-shadow: 
    0 8px 32px rgba(var(--color-primary-rgb), 0.6),
    0 1px 0 rgba(255, 255, 255, 0.3) inset;
}

.play-button:hover::before {
  opacity: 1;
}

/* Card Content */
.card-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 1rem;
}

/* Header Section */
.card-header-section {
  display: flex;
  justify-content: between;
  align-items: flex-start;
  gap: 1rem;
}

.type-badge-container {
  flex: 1;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.15),
    0 1px 0 rgba(255, 255, 255, 0.2) inset;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.type-badge::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    transparent 50%, 
    rgba(255, 255, 255, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.type-badge:hover::before {
  opacity: 1;
}

.type-badge--achievement {
  background: linear-gradient(135deg, #ffc107 0%, #ff8c00 100%);
  color: white;
  border: 1px solid rgba(255, 193, 7, 0.3);
}

.type-badge--clip {
  background: linear-gradient(135deg, #dc3545 0%, #e91e63 100%);
  color: white;
  border: 1px solid rgba(220, 53, 69, 0.3);
}

.type-badge--tournament {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  border: 1px solid rgba(40, 167, 69, 0.3);
}

.type-badge--leadership {
  background: linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%);
  color: white;
  border: 1px solid rgba(111, 66, 193, 0.3);
}

.type-badge--content {
  background: linear-gradient(135deg, #007bff 0%, #17a2b8 100%);
  color: white;
  border: 1px solid rgba(0, 123, 255, 0.3);
}

.type-badge--project {
  background: linear-gradient(135deg, #fd7e14 0%, #ffc107 100%);
  color: white;
  border: 1px solid rgba(253, 126, 20, 0.3);
}

.type-badge--stream {
  background: linear-gradient(135deg, #9146ff 0%, #6441a4 100%);
  color: white;
  border: 1px solid rgba(145, 70, 255, 0.3);
}

.type-badge--collaboration {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  border: 1px solid rgba(255, 107, 107, 0.3);
}

/* Actions Menu */
.actions-menu {
  position: relative;
}

.actions-toggle {
  background: none;
  border: 1px solid var(--glass-border);
  color: var(--text-secondary);
  width: 32px;
  height: 32px;
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-smooth);
}

.actions-toggle:hover {
  background: var(--glass-elevated);
  color: var(--text-primary);
  border-color: var(--color-primary-alpha);
}

.actions-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 140px;
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-md);
  backdrop-filter: blur(var(--glass-backdrop-blur));
  -webkit-backdrop-filter: blur(var(--glass-backdrop-blur));
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 10;
  padding: 0.5rem 0;
  margin-top: 0.5rem;
}

.actions-dropdown button {
  width: 100%;
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  text-align: left;
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background var(--transition-fast);
}

.actions-dropdown button:hover {
  background: var(--glass-elevated);
}

.dropdown-divider {
  margin: 0.5rem 0;
  border: 0;
  border-top: 1px solid var(--glass-border);
}

/* Body Section */
.card-body-section {
  flex: 1;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0 0 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.game-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0.5rem 0;
}

.achievement-details {
  display: flex;
  gap: 1rem;
  margin: 0.75rem 0;
}

.achievement-stat,
.achievement-date {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.achievement-stat {
  color: var(--color-warning);
  font-weight: 600;
}

.project-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin: 0.75rem 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
}

.stat-value {
  font-weight: 700;
  font-size: 1rem;
  color: var(--color-primary);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Skills */
.card-skills {
  margin-top: auto;
}

.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.skill-tag {
  background: var(--glass-elevated);
  color: var(--text-primary);
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid var(--glass-border);
  transition: all var(--transition-fast);
}

.skill-tag:hover {
  background: var(--color-primary-alpha);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.skill-tag--more {
  background: var(--color-secondary);
  color: white;
  font-weight: 600;
}

/* Footer */
.card-footer-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid var(--glass-border);
  margin-top: auto;
}

.timestamp {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.analytics-preview {
  display: flex;
  gap: 1rem;
}

.view-count,
.like-count {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-secondary);
  font-size: 0.75rem;
}

/* Layout Variations */
.portfolio-card--list {
  flex-direction: row;
  height: auto;
  min-height: 120px;
}

.portfolio-card--list .card-media {
  width: 200px;
  height: 120px;
  flex-shrink: 0;
}

.portfolio-card--list .card-content {
  flex: 1;
  padding: 1rem;
}

.portfolio-card--list .card-title {
  font-size: 1rem;
  -webkit-line-clamp: 1;
}

.portfolio-card--list .card-description {
  -webkit-line-clamp: 2;
}

/* Timeline Layout */
.portfolio-card--timeline {
  position: relative;
  margin-left: 2rem;
}

.portfolio-card--timeline::before {
  content: '';
  position: absolute;
  left: -2rem;
  top: 1rem;
  width: 12px;
  height: 12px;
  background: var(--color-primary);
  border-radius: 50%;
  border: 3px solid var(--glass-surface);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .portfolio-card {
    border-radius: 16px;
  }
  
  .card-media {
    height: 200px;
  }
  
  .type-badge {
    font-size: 0.7rem;
    padding: 0.375rem 0.75rem;
  }
  
  .project-stats {
    gap: 0.75rem;
  }
}

@media (max-width: 992px) {
  .portfolio-card {
    border-radius: 14px;
  }
  
  .card-content {
    padding: 1.125rem;
    gap: 0.875rem;
  }
  
  .card-media {
    height: 180px;
  }
  
  .card-title {
    font-size: 1rem;
  }
  
  .featured-badge {
    width: 28px;
    height: 28px;
    top: 12px;
    right: 12px;
    font-size: 0.8rem;
  }
  
  .play-button {
    width: 48px;
    height: 48px;
    font-size: 1.25rem;
  }
}

@media (max-width: 768px) {
  .portfolio-card {
    border-radius: 12px;
    transform: none !important;
  }
  
  .portfolio-card:hover {
    transform: translateY(-4px) !important;
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.12),
      0 4px 16px rgba(var(--color-primary-rgb), 0.08),
      0 1px 0 rgba(255, 255, 255, 0.15) inset;
  }
  
  .card-content {
    padding: 1rem;
    gap: 0.75rem;
  }
  
  .card-media {
    height: 160px;
  }
  
  .card-header-section {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .type-badge {
    align-self: flex-start;
    font-size: 0.65rem;
    padding: 0.375rem 0.625rem;
  }
  
  .actions-menu {
    align-self: flex-end;
    margin-top: -32px;
  }
  
  .card-title {
    font-size: 0.95rem;
    line-height: 1.2;
  }
  
  .card-description {
    font-size: 0.8rem;
    -webkit-line-clamp: 2;
  }
  
  .project-stats {
    gap: 0.75rem;
    justify-content: space-between;
  }
  
  .stat-item {
    min-width: 60px;
  }
  
  .featured-badge {
    width: 24px;
    height: 24px;
    top: 10px;
    right: 10px;
    font-size: 0.75rem;
  }
  
  .play-button {
    width: 40px;
    height: 40px;
    font-size: 1.1rem;
  }
  
  .portfolio-card--list {
    flex-direction: column;
  }
  
  .portfolio-card--list .card-media {
    width: 100%;
    height: 140px;
    border-radius: 12px 12px 0 0;
  }
  
  .portfolio-card--list .card-content {
    padding: 0.875rem;
  }
  
  .skills-container {
    gap: 0.25rem;
  }
  
  .skill-tag {
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
  }
  
  .card-footer-section {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .analytics-preview {
    align-self: flex-end;
  }
}

@media (max-width: 576px) {
  .portfolio-card {
    border-radius: 10px;
    margin-bottom: 1rem;
  }
  
  .card-content {
    padding: 0.875rem;
    gap: 0.625rem;
  }
  
  .card-media {
    height: 140px;
  }
  
  .card-title {
    font-size: 0.9rem;
    -webkit-line-clamp: 1;
  }
  
  .card-description {
    font-size: 0.75rem;
    -webkit-line-clamp: 2;
  }
  
  .type-badge {
    font-size: 0.6rem;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
  }
  
  .project-stats {
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  
  .stat-item {
    flex: 1;
    min-width: 50px;
  }
  
  .stat-value {
    font-size: 0.875rem;
  }
  
  .stat-label {
    font-size: 0.65rem;
  }
  
  .achievement-details {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .skills-container {
    gap: 0.2rem;
  }
  
  .skill-tag {
    font-size: 0.65rem;
    padding: 0.15rem 0.35rem;
    border-radius: 8px;
  }
  
  .card-footer-section {
    padding-top: 0.5rem;
  }
  
  .timestamp,
  .view-count,
  .like-count {
    font-size: 0.7rem;
  }
  
  .actions-dropdown {
    min-width: 120px;
    font-size: 0.8rem;
  }
  
  .portfolio-card--timeline {
    margin-left: 1.5rem;
  }
  
  .portfolio-card--timeline::before {
    left: -1.5rem;
    width: 10px;
    height: 10px;
  }
}

/* Touch-friendly improvements */
@media (hover: none) and (pointer: coarse) {
  .portfolio-card {
    cursor: default;
  }
  
  .actions-toggle {
    width: 44px;
    height: 44px;
    border-radius: 8px;
  }
  
  .play-button {
    width: 56px;
    height: 56px;
  }
  
  .actions-dropdown button {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
  
  .skill-tag {
    padding: 0.375rem 0.625rem;
    min-height: 32px;
  }
  
  .type-badge {
    min-height: 32px;
  }
}

/* Landscape mobile optimization */
@media (max-width: 896px) and (orientation: landscape) {
  .portfolio-card--list {
    flex-direction: row;
  }
  
  .portfolio-card--list .card-media {
    width: 180px;
    height: 120px;
  }
  
  .card-media {
    height: 120px;
  }
}

/* High density displays */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .portfolio-card::before {
    padding: 0.5px;
  }
}

/* Container query support for modern browsers */
@container (max-width: 300px) {
  .portfolio-card .card-content {
    padding: 0.75rem;
  }
  
  .portfolio-card .card-title {
    font-size: 0.85rem;
  }
  
  .portfolio-card .project-stats {
    flex-direction: column;
    gap: 0.25rem;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .portfolio-card,
  .media-image,
  .media-video,
  .play-button {
    transition: none;
  }
  
  .portfolio-card:hover {
    transform: none;
  }
  
  .portfolio-card:hover .media-image,
  .portfolio-card:hover .media-video {
    transform: none;
  }
}
</style>

import AppIcon from '@/components/ui/AppIcon.vue'
