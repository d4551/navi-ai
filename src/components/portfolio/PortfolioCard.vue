<template>
  <div
    class="portfolio-card"
    :class="[
      `portfolio-card--${layout}`,
      { 'portfolio-card--featured': item.featured },
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
              <AppIcon
                :name="item.featured ? 'mdi-star' : 'mdi-star-outline'"
              />
              {{ item.featured ? "Unfeature" : "Feature" }}
            </button>
            <button class="text-info" @click="shareItem">
              <AppIcon name="mdi-share" />Share
            </button>
            <hr class="dropdown-divider" />
            <button class="text-danger" @click="$emit('delete', item)">
              <AppIcon name="mdi-delete" />Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Title & Description -->
      <div class="card-body section-body-section">
        <h5 class="card-title">{{ item.title || "Untitled" }}</h5>
        <p v-if="item.description" class="card-description">
          {{ truncateText(item.description, layout === "list" ? 200 : 120) }}
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
            <span>{{ item.achievement.rank || "Achievement" }}</span>
          </div>
          <div v-if="item.achievement.date" class="achievement-date">
            <AppIcon name="mdi-calendar" />
            <span>{{ formatDateShort(item.achievement.date) }}</span>
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
            v-for="skill in layout === 'list'
              ? item.skills
              : item.skills.slice(0, 6)"
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
          <span>{{ formatDateShort(item.createdAt || item.date) }}</span>
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
import { ref, defineEmits, defineProps } from "vue";
import { formatDateShort } from "@/utils/date";
import AppIcon from "@/components/ui/AppIcon.vue";

const props = defineProps({
  item: { type: Object, required: true },
  layout: { type: String, default: "grid" },
  showAnalytics: { type: Boolean, default: false },
});

const emit = defineEmits(["edit", "delete", "toggle-featured", "share"]);

// Local state
const showActions = ref(false);
const isPlaying = ref(false);
const mediaError = ref(false);

// Methods
function getTypeIcon(type) {
  const icons = {
    achievement: "mdi-trophy",
    clip: "mdi-play-circle",
    tournament: "mdi-tournament",
    leadership: "mdi-account-star",
    content: "mdi-video",
    project: "mdi-folder-multiple-outline",
    stream: "mdi-broadcast",
    collaboration: "mdi-account-group",
  };
  return icons[type] || "mdi-file";
}

function getTypeLabel(type) {
  const labels = {
    achievement: "Achievement",
    clip: "Clip",
    tournament: "Tournament",
    leadership: "Leadership",
    content: "Content",
    project: "Project",
    stream: "Stream",
    collaboration: "Collaboration",
  };
  return labels[type] || "Item";
}

function truncateText(text, maxLength) {
  if (!text) return "";
  return text.length <= maxLength ? text : text.substring(0, maxLength) + "...";
}

function formatStatValue(value) {
  if (typeof value === "number") {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + "M";
    if (value >= 1000) return (value / 1000).toFixed(1) + "K";
    return value.toLocaleString();
  }
  return value;
}

function formatStatLabel(key) {
  const labels = {
    views: "Views",
    likes: "Likes",
    downloads: "Downloads",
    plays: "Plays",
    wins: "Wins",
    kills: "Kills",
    score: "Score",
  };
  return labels[key] || key.charAt(0).toUpperCase() + key.slice(1);
}

function handleMediaError() {
  mediaError.value = true;
}

function playVideo(event) {
  if (props.item.media?.type === "video") {
    event.target.play();
  }
}

function pauseVideo(event) {
  if (props.item.media?.type === "video") {
    event.target.pause();
  }
}

function togglePlay(event) {
  const video = event.target.closest(".card-media").querySelector("video");
  if (video) {
    if (video.paused) {
      video.play();
      isPlaying.value = true;
    } else {
      video.pause();
      isPlaying.value = false;
    }
  }
}

function shareItem() {
  emit("share", props.item);
  showActions.value = false;
}

// Close actions menu when clicking outside
function handleClickOutside() {
  showActions.value = false;
}

// Add click outside listener
if (typeof document !== "undefined") {
  document.addEventListener("click", handleClickOutside);
}
</script>

<style scoped>
.portfolio-card {
  position: relative;
  background: var(--glass-surface);
  box-shadow:
  cursor: pointer;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  isolation: isolate;
}

.portfolio-card::before {
  content: "";
  position: absolute;
  border-radius: inherit;
  background: linear-gradient(
  );
  mask:
  mask-composite: xor;
  -webkit-mask-composite: xor;
  pointer-events: none;
}

.portfolio-card:hover {
  box-shadow:
}

.portfolio-card:hover::before {
  background: linear-gradient(
  );
}

.portfolio-card--featured {
  background: linear-gradient(
    var(--glass-surface),
  );
  position: relative;
}

.portfolio-card--featured::after {
  content: "";
  position: absolute;
  background: linear-gradient(
    var(--color-warning),
  );
}

.featured-badge {
  position: absolute;
  background: linear-gradient(
    var(--color-warning),
  );
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
}

@keyframes featuredPulse {
    box-shadow:
  }
    box-shadow:
  }
}

.card-media {
  position: relative;
  overflow: hidden;
  background: linear-gradient(
    var(--glass-elevated),
    var(--glass-surface)
  );
}

.media-container {
  position: relative;
  overflow: hidden;
}

.media-image,
.media-video {
  object-fit: cover;
}

.portfolio-card:hover .media-image,
.portfolio-card:hover .media-video {
}

.media-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    var(--glass-elevated),
  );
  color: var(--text-secondary);
  position: relative;
}

.media-placeholder::before {
  content: "";
  position: absolute;
  background: radial-gradient(
    circle at center,
  );
}

.media-overlay {
  position: absolute;
  background: linear-gradient(
  );
  display: flex;
  align-items: center;
  justify-content: center;
}

.portfolio-card:hover .media-overlay {
}

.play-button {
  background: linear-gradient(
    var(--color-primary),
    var(--color-primary-alt)
  );
  color: white;
  border: none;
  cursor: pointer;
  box-shadow:
  position: relative;
  overflow: hidden;
}

.play-button::before {
  content: "";
  position: absolute;
  background: radial-gradient(
    circle at center,
  );
}

.play-button:hover {
  box-shadow:
}

.play-button:hover::before {
}

.card-content {
  display: flex;
  flex-direction: column;
}

.card-header-section {
  display: flex;
  justify-content: between;
  align-items: flex-start;
}

.type-badge-container {
}

.type-badge {
  display: inline-flex;
  align-items: center;
  text-transform: uppercase;
  box-shadow:
  position: relative;
  overflow: hidden;
}

.type-badge::before {
  content: "";
  position: absolute;
  background: linear-gradient(
  );
}

.type-badge:hover::before {
}

.type-badge--achievement {
  color: white;
}

.type-badge--clip {
  color: white;
}

.type-badge--tournament {
  color: white;
}

.type-badge--leadership {
  color: white;
}

.type-badge--content {
  color: white;
}

.type-badge--project {
  color: white;
}

.type-badge--stream {
  color: white;
}

.type-badge--collaboration {
  color: white;
}

.actions-menu {
  position: relative;
}

.actions-toggle {
  background: none;
  color: var(--text-secondary);
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
  background: var(--glass-surface);
  border-radius: var(--border-radius-md);
  backdrop-filter: blur(var(--glass-backdrop-blur));
  -webkit-backdrop-filter: blur(var(--glass-backdrop-blur));
}

.actions-dropdown button {
  background: none;
  border: none;
  text-align: left;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background var(--transition-fast);
}

.actions-dropdown button:hover {
  background: var(--glass-elevated);
}

.dropdown-divider {
}

.card-body-section {
}

.card-title {
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-description {
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.game-info {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
}

.achievement-details {
  display: flex;
}

.achievement-stat,
.achievement-date {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
}

.achievement-stat {
  color: var(--color-warning);
}

.project-stats {
  display: flex;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  color: var(--color-primary);
}

.stat-label {
  color: var(--text-secondary);
  text-transform: uppercase;
}

.card-skills {
  margin-top: auto;
}

.skills-container {
  display: flex;
  flex-wrap: wrap;
}

.skill-tag {
  background: var(--glass-elevated);
  color: var(--text-primary);
  border-radius: var(--border-radius-sm);
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
}

.card-footer-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.timestamp {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
}

.analytics-preview {
  display: flex;
}

.view-count,
.like-count {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
}

.portfolio-card--list {
  flex-direction: row;
  height: auto;
}

.portfolio-card--list .card-media {
}

.portfolio-card--list .card-content {
}

.portfolio-card--list .card-title {
}

.portfolio-card--list .card-description {
}

.portfolio-card--timeline {
  position: relative;
}

.portfolio-card--timeline::before {
  content: "";
  position: absolute;
  background: var(--color-primary);
}

  .portfolio-card {
  }

  .card-media {
  }

  .type-badge {
  }

  .project-stats {
  }
}

  .portfolio-card {
  }

  .card-content {
  }

  .card-media {
  }

  .card-title {
  }

  .featured-badge {
  }

  .play-button {
  }
}

  .portfolio-card {
    transform: none !important;
  }

  .portfolio-card:hover {
    box-shadow:
  }

  .card-content {
  }

  .card-media {
  }

  .card-header-section {
    flex-direction: column;
    align-items: stretch;
  }

  .type-badge {
    align-self: flex-start;
  }

  .actions-menu {
    align-self: flex-end;
  }

  .card-title {
  }

  .card-description {
  }

  .project-stats {
    justify-content: space-between;
  }

  .stat-item {
  }

  .featured-badge {
  }

  .play-button {
  }

  .portfolio-card--list {
    flex-direction: column;
  }

  .portfolio-card--list .card-media {
  }

  .portfolio-card--list .card-content {
  }

  .skills-container {
  }

  .skill-tag {
  }

  .card-footer-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .analytics-preview {
    align-self: flex-end;
  }
}

  .portfolio-card {
  }

  .card-content {
  }

  .card-media {
  }

  .card-title {
  }

  .card-description {
  }

  .type-badge {
  }

  .project-stats {
    flex-wrap: wrap;
  }

  .stat-item {
  }

  .stat-value {
  }

  .stat-label {
  }

  .achievement-details {
    flex-direction: column;
  }

  .skills-container {
  }

  .skill-tag {
  }

  .card-footer-section {
  }

  .timestamp,
  .view-count,
  .like-count {
  }

  .actions-dropdown {
  }

  .portfolio-card--timeline {
  }

  .portfolio-card--timeline::before {
  }
}

@media (hover: none) and (pointer: coarse) {
  .portfolio-card {
    cursor: default;
  }

  .actions-toggle {
  }

  .play-button {
  }

  .actions-dropdown button {
  }

  .skill-tag {
  }

  .type-badge {
  }
}

  .portfolio-card--list {
    flex-direction: row;
  }

  .portfolio-card--list .card-media {
  }

  .card-media {
  }
}

  .portfolio-card::before {
  }
}

  .portfolio-card .card-content {
  }

  .portfolio-card .card-title {
  }

  .portfolio-card .project-stats {
    flex-direction: column;
  }
}

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
