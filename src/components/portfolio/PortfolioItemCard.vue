<template>
  <article
    class="portfolio-item-card"
    :class="[
      `portfolio-item-card--${viewMode}`,
      {
        'portfolio-item-card--featured': item.featured,
        'portfolio-item-card--selected': selected,
      },
    ]"
    @click="handleClick"
  >
    <!-- Selection Overlay -->
    <div v-if="selectionMode" class="selection-overlay">
      <div class="selection-checkbox">
        <Icon :name="selected ? 'check-circle' : 'circle'" />
      </div>
    </div>

    <!-- Featured Badge -->
    <div v-if="item.featured" class="featured-badge">
      <Icon name="star" />
      <span>Featured</span>
    </div>

    <!-- Thumbnail Section - Normalized -->
    <div class="thumbnail-section">
      <div class="thumbnail-container">
        <!-- Media Thumbnail -->
        <img
          v-if="getMediaUrl()"
          :src="getMediaUrl()!"
          :alt="item.title || 'Project thumbnail'"
          class="thumbnail-image"
          @error="handleImageError"
          @load="onImageLoad"
        />
        <!-- Icon Fallback -->
        <div
          v-else
          class="thumbnail-icon-container"
          :class="`thumbnail-type--${item.type || 'project'}`"
        >
          <Icon :name="getTypeIcon(item.type)" class="thumbnail-icon" />
        </div>

        <!-- Hover Overlay -->
        <div class="thumbnail-overlay">
          <div class="overlay-actions">
            <button
              v-if="item.liveUrl || item.links?.find((l) => l.type === 'live')"
              class="overlay-btn"
              :title="'View live project'"
              @click.stop="openLiveLink"
            >
              <Icon name="open-in-new" />
            </button>
            <button
              v-if="
                item.githubUrl || item.links?.find((l) => l.type === 'source')
              "
              class="overlay-btn"
              :title="'View source code'"
              @click.stop="openSourceLink"
            >
              <Icon name="github" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="content-section">
      <!-- Header -->
      <header class="item-header">
        <div class="title-section">
          <h3 class="item-title">{{ item.title || "Untitled Project" }}</h3>
          <div class="item-meta">
            <span class="item-type" :class="`type-${item.type}`">
              <Icon :name="getTypeIcon(item.type)" size="14" />
              {{ getTypeLabel(item.type) }}
            </span>
            <span v-if="item.date" class="item-date">
              {{ formatMonthYear(item.date) }}
            </span>
          </div>
        </div>

        <div class="actions-menu">
          <button
            class="actions-trigger"
            :aria-expanded="showActions"
            :aria-label="'Item actions'"
            @click.stop="toggleActions"
          >
            <Icon name="more-vertical" />
          </button>

          <div v-if="showActions" class="actions-dropdown">
            <button class="action-item" @click.stop="$emit('view', item)">
              <Icon name="open-in-new" size="16" />
              <span>View</span>
            </button>
            <button class="action-item" @click.stop="$emit('edit', item)">
              <Icon name="edit" size="16" />
              <span>Edit</span>
            </button>
            <button class="action-item" @click.stop="$emit('duplicate', item)">
              <Icon name="copy" size="16" />
              <span>Duplicate</span>
            </button>
            <button
              class="action-item"
              @click.stop="$emit('export-onepager', item)"
            >
              <Icon name="file-text" size="16" />
              <span>Export One-Pager</span>
            </button>
            <button
              class="action-item"
              @click.stop="$emit('toggle-featured', item)"
            >
              <Icon :name="item.featured ? 'star' : 'star-outline'" size="16" />
              <span>{{ item.featured ? "Unfeature" : "Feature" }}</span>
            </button>
            <button class="action-item" @click.stop="shareItem">
              <Icon name="share" size="16" />
              <span>Share</span>
            </button>
            <div class="action-divider"></div>
            <button
              class="action-item danger"
              @click.stop="$emit('delete', item)"
            >
              <Icon name="trash" size="16" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Description -->
      <div v-if="item.description" class="item-description">
        <p>{{ truncateText(item.description, descriptionLength) }}</p>
        <button
          v-if="item.description.length > descriptionLength"
          class="read-more-btn"
          @click.stop="toggleExpanded"
        >
          {{ expanded ? "Read less" : "Read more" }}
        </button>
      </div>

      <!-- Technologies/Skills -->
      <div v-if="item.technologies || item.skills" class="tech-tags">
        <span
          v-for="tech in (item.technologies || item.skills || []).slice(
            0,
            maxTechTags,
          )"
          :key="tech"
          class="tech-tag"
        >
          {{ tech }}
        </span>
        <span
          v-if="(item.technologies || item.skills || []).length > maxTechTags"
          class="tech-more"
        >
          +{{
            (item.technologies || item.skills || []).length - maxTechTags
          }}
          more
        </span>
      </div>

      <!-- Game Info -->
      <div v-if="item.game" class="game-info">
        <Icon name="gamepad-2" size="16" />
        <span>{{ item.game }}</span>
      </div>

      <!-- Stats/Metrics -->
      <div v-if="item.metrics || item.stats" class="item-metrics compact-grid">
        <div
          v-for="(value, key) in item.metrics || item.stats || {}"
          :key="key"
          class="metric-item"
        >
          <span class="metric-label">{{ formatMetricLabel(key) }}</span>
          <span class="metric-value">{{ formatMetricValue(value) }}</span>
        </div>
      </div>

      <!-- Footer Actions -->
      <footer class="item-footer">
        <div class="footer-links">
          <a
            v-for="link in (item.links || []).slice(0, 3)"
            :key="link.url"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="footer-link"
            @click.stop
          >
            <Icon :name="getLinkIcon(link.type)" size="16" />
            <span>{{ link.label || formatLinkType(link.type) }}</span>
          </a>
        </div>

        <div class="footer-meta">
          <span v-if="item.role" class="item-role">{{ item.role }}</span>
          <span v-if="viewMode === 'list' && item.platforms" class="platforms">
            {{ item.platforms.join(", ") }}
          </span>
        </div>
      </footer>
    </div>

    <!-- Timeline Connector (for timeline view) -->
    <div v-if="viewMode === 'timeline'" class="timeline-connector">
      <div class="timeline-dot"></div>
      <div class="timeline-line"></div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { formatMonthYear } from "@/utils/date";
import Icon from "@/components/ui/Icon.vue";

interface PortfolioItem {
  id: string;
  title?: string;
  description?: string;
  type?: string;
  image?: string;
  media?: { url: string; type?: string };
  technologies?: string[];
  skills?: string[];
  date?: string;
  game?: string;
  featured?: boolean;
  liveUrl?: string;
  githubUrl?: string;
  links?: Array<{ url: string; type?: string; label?: string }>;
  metrics?: Record<string, any>;
  stats?: Record<string, any>;
  role?: string;
  platforms?: string[];
}

interface Props {
  item: PortfolioItem;
  viewMode?: "grid" | "list" | "masonry" | "timeline";
  selectionMode?: boolean;
  selected?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  viewMode: "grid",
  selectionMode: false,
  selected: false,
});

const emit = defineEmits<{
  edit: [item: PortfolioItem];
  delete: [item: PortfolioItem];
  "toggle-featured": [item: PortfolioItem];
  "export-onepager": [item: PortfolioItem];
  duplicate: [item: PortfolioItem];
  select: [id: string];
  view: [item: PortfolioItem];
}>();

const slug = computed(() => {
  const slugify = (s: string = "") =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);
  return slugify(props.item.title || "project");
});

// Local state
const showActions = ref(false);
const expanded = ref(false);

// Computed properties
const descriptionLength = computed(() => {
  switch (props.viewMode) {
    case "list":
      return 300;
    case "timeline":
      return 200;
    default:
      return 150;
  }
});

const maxTechTags = computed(() => {
  switch (props.viewMode) {
    case "list":
      return 8;
    case "timeline":
      return 5;
    default:
      return 4;
  }
});

// Methods
const handleClick = () => {
  if (props.selectionMode) {
    emit("select", props.item.id);
  } else {
    emit("view", props.item);
  }
};

const toggleActions = () => {
  showActions.value = !showActions.value;
};

const toggleExpanded = () => {
  expanded.value = !expanded.value;
};

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  // Hide the image and let the icon fallback show
  img.style.display = "none";
  const container = img.closest(".thumbnail-container");
  if (container) {
    container.classList.add("image-error");
  }
};

const onImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement;
  const container = img.closest(".thumbnail-container");
  if (container) {
    container.classList.add("image-loaded");
  }
};

const getMediaUrl = (): string | null => {
  // Priority: explicit image > media.url > null
  if (props.item.image) return props.item.image;
  if (props.item.media?.url) return props.item.media.url;
  return null;
};

const openLiveLink = () => {
  const url =
    props.item.liveUrl || props.item.links?.find((l) => l.type === "live")?.url;
  if (url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
};

const openSourceLink = () => {
  const url =
    props.item.githubUrl ||
    props.item.links?.find((l) => l.type === "source")?.url;
  if (url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
};

const shareItem = () => {
  if (navigator.share) {
    navigator.share({
      title: props.item.title,
      text: props.item.description,
      url: window.location.href,
    });
  } else {
    // Fallback: copy to clipboard
    const text = `${props.item.title}: ${props.item.description || ""}`;
    navigator.clipboard?.writeText(text);
  }
};

const truncateText = (text: string, maxLength: number): string => {
  if (expanded.value || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

const formatMetricLabel = (key: string): string => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/_/g, " ");
};

const formatMetricValue = (value: any): string => {
  if (typeof value === "number") {
    return value.toLocaleString();
  }
  return String(value);
};

const formatLinkType = (type?: string): string => {
  const types: Record<string, string> = {
    live: "Live Demo",
    source: "Source Code",
    video: "Video",
    article: "Article",
    store: "Store Page",
    docs: "Documentation",
  };
  return types[type || ""] || "Link";
};

const getTypeIcon = (type?: string): string => {
  const icons: Record<string, string> = {
    achievement: "trophy",
    tournament: "sword-cross",
    project: "code-braces",
    content: "video",
    leadership: "account-group",
    clip: "play-circle",
    competition: "target",
    game: "gamepad-variant",
    web: "web",
    mobile: "cellphone",
    tool: "wrench",
    demo: "monitor",
    app: "application",
    website: "earth",
  };
  return icons[type || ""] || "folder";
};

const getTypeLabel = (type?: string): string => {
  const labels: Record<string, string> = {
    achievement: "Achievement",
    tournament: "Tournament",
    project: "Project",
    content: "Content",
    leadership: "Leadership",
    clip: "Highlight",
    competition: "Competition",
    game: "Game",
    web: "Web App",
    mobile: "Mobile App",
    tool: "Tool",
  };
  return labels[type || ""] || "Portfolio Item";
};

const getLinkIcon = (type?: string): string => {
  const icons: Record<string, string> = {
    live: "external-link",
    source: "github",
    video: "play",
    article: "file-text",
    store: "shopping-cart",
    docs: "book",
    itch: "gamepad",
    steam: "gamepad-2",
  };
  return icons[type || ""] || "link";
};

// Handle click outside to close actions
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".actions-menu")) {
    showActions.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.portfolio-item-card {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.08) 0%,
    rgba(255, 255, 255, 0.03) 100%
  );
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1.25rem;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  cursor: pointer;
  height: fit-content;
  isolation: isolate;
}

.portfolio-item-card:hover {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.12) 0%,
    rgba(124, 58, 237, 0.08) 100%
  );
  border-color: rgba(124, 58, 237, 0.4);
  transform: translateY(-8px) scale(1.02);
  box-shadow:
    0 20px 80px rgba(124, 58, 237, 0.25),
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.portfolio-item-card--featured {
  border-color: rgba(251, 191, 36, 0.6);
  background: linear-gradient(
    135deg,
    rgba(251, 191, 36, 0.08) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  position: relative;
}

.portfolio-item-card--featured::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(
    135deg,
    rgba(251, 191, 36, 0.8) 0%,
    rgba(251, 191, 36, 0.3) 50%,
    transparent 100%
  );
  mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  mask-composite: xor;
  -webkit-mask-composite: xor;
  pointer-events: none;
}

.portfolio-item-card--featured:hover {
  border-color: rgba(251, 191, 36, 0.7);
  box-shadow: 0 16px 64px rgba(251, 191, 36, 0.2);
}

.portfolio-item-card--selected {
  border-color: rgba(124, 58, 237, 0.7);
  background: rgba(124, 58, 237, 0.1);
}

.portfolio-item-card--list {
  display: flex;
  flex-direction: row;
  align-items: stretch;
}

.portfolio-item-card--list .thumbnail-section {
}

.portfolio-item-card--list .content-section {
}

.portfolio-item-card--timeline {
  position: relative;
}

.selection-overlay {
  position: absolute;
}

.selection-checkbox {
}

.featured-badge {
  position: absolute;
  color: white;
  display: flex;
  align-items: center;
  text-transform: uppercase;
  box-shadow:
}

@keyframes featuredPulse {
    box-shadow:
  }
    box-shadow:
  }
}

.media-section {
  position: relative;
  overflow: hidden;
}

.media-container {
  position: relative;
}

.media-image {
  object-fit: cover;
}

.portfolio-item-card:hover .media-image {
}

.media-placeholder {
  background: linear-gradient(
  );
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-overlay {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
}

.portfolio-item-card:hover .media-overlay {
}

.overlay-actions {
  display: flex;
}

.overlay-btn {
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay-btn:hover {
}

.content-section {
  display: flex;
  flex-direction: column;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.title-section {
}

.item-title {
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.item-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.item-type {
  display: flex;
  align-items: center;
  text-transform: uppercase;
}

.item-date {
}

.actions-menu {
  position: relative;
}

.actions-trigger {
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.actions-trigger:hover {
}

.actions-dropdown {
  position: absolute;
}

.action-item {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
}

.action-item:hover {
}

.action-item.danger {
}

.action-item.danger:hover {
}

.action-divider {
}

.item-description {
}

.read-more-btn {
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
}

.tech-tag {
  background: linear-gradient(
  );
}

.tech-tag:hover {
  background: linear-gradient(
  );
}

.tech-more {
  font-style: italic;
}

.game-info {
  display: flex;
  align-items: center;
}

.item-metrics {
  display: grid;
}

.metric-item {
  text-align: center;
}

.metric-label {
  display: block;
  text-transform: uppercase;
}

.metric-value {
  display: block;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.footer-links {
  display: flex;
}

.footer-link {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.footer-link:hover {
}

.footer-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.item-role,
.platforms {
}

.timeline-connector {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timeline-dot {
}

.timeline-line {
}

  .portfolio-item-card {
  }

  .portfolio-item-card:hover {
  }

  .portfolio-item-card--list {
    flex-direction: column;
  }

  .portfolio-item-card--list .thumbnail-section {
    flex: none;
  }

  .portfolio-item-card--list .thumbnail-icon {
  }

  .content-section {
  }

  .item-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .item-title {
  }

  .item-meta {
  }

  .tech-tags {
  }

  .tech-tag {
  }

  .item-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .footer-meta {
    align-items: flex-start;
  }

  .featured-badge {
  }
}
</style>
