<template>
  <div class="template-selector">
    <!-- Header -->
    <div class="template-header">
      <h5 class="mb-0">Choose a Template</h5>
      <p class="text-muted mb-4">
        Select a professional template to get started quickly
      </p>
    </div>

    <!-- Template Grid -->
    <div class="template-grid settings-grid">
      <div
        v-for="template in templates"
        :key="template.id"
        class="template-card"
        :class="{
          'template-card--selected': selectedTemplate?.id === template.id,
        }"
        @click="selectTemplate(template)"
      >
        <!-- Template Preview -->
        <div class="template-preview">
          <div
            class="preview-header"
            :style="{ background: template.primaryColor }"
          >
            <div class="preview-avatar"></div>
            <div class="preview-info">
              <div class="preview-name"></div>
              <div class="preview-title"></div>
            </div>
          </div>
          <div class="preview-content">
            <div v-for="i in 3" :key="i" class="preview-section">
              <div class="preview-item">
                <div
                  class="item-badge"
                  :style="{ background: template.accentColor }"
                ></div>
                <div class="item-content">
                  <div class="item-title"></div>
                  <div class="item-description"></div>
                  <div class="item-tags">
                    <span v-for="j in 3" :key="j" class="tag"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Template Info -->
        <div class="template-info">
          <div class="template-name">{{ template.name }}</div>
          <div class="template-description">{{ template.description }}</div>
          <div class="template-features">
            <span
              v-for="feature in template.features.slice(0, 3)"
              :key="feature"
              class="feature-badge"
            >
              {{ feature }}
            </span>
          </div>
        </div>

        <!-- Selection Indicator -->
        <div
          v-if="selectedTemplate?.id === template.id"
          class="selection-indicator"
        >
          <AppIcon name="mdi-check-circle-outline" />
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="template-actions">
      <UnifiedButton variant="outline" @click="$emit('close')">
        Cancel
      </UnifiedButton>
      <UnifiedButton
        variant="primary"
        :disabled="!selectedTemplate"
        leading-icon="mdi-check"
        @click="applyTemplate"
      >
        Apply Template
      </UnifiedButton>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

import { ref, defineEmits } from "vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import AppIcon from "@/components/ui/AppIcon.vue";

const _emit = defineEmits(["close", "apply"]);

const selectedTemplate = ref(null);

const templates = ref([
  {
    id: "gaming-pro",
    name: "Gaming Professional",
    description: "Perfect for esports players and competitive gamers",
    primaryColor: "#667eea",
    accentColor: "#764ba2",
    features: [
      "Tournament Focus",
      "Stat Highlights",
      "Team History",
      "Achievement Timeline",
    ],
    items: [
      {
        type: "tournament",
        title: "Regional Championship Winner",
        description:
          "First place in the Spring Regional Tournament with Team Phoenix.",
        game: "Valorant",
        skills: ["Team Leadership", "Strategic Planning", "Communication"],
        achievement: { rank: "1st Place", event: "Spring Regional" },
      },
      {
        type: "achievement",
        title: "Rank Achievement",
        description: "Reached Radiant rank in competitive matchmaking.",
        game: "Valorant",
        skills: ["Aim", "Game Sense", "Consistency"],
      },
      {
        type: "leadership",
        title: "Team Captain",
        description:
          "Led team to multiple tournament victories as In-Game Leader.",
        game: "Valorant",
        skills: ["Leadership", "Strategy", "Communication"],
      },
    ],
  },
  {
    id: "content-creator",
    name: "Content Creator",
    description: "Showcase your content creation and streaming achievements",
    primaryColor: "#f093fb",
    accentColor: "#f5576c",
    features: [
      "View Analytics",
      "Platform Integration",
      "Content Showcase",
      "Growth Metrics",
    ],
    items: [
      {
        type: "content",
        title: "YouTube Gaming Channel",
        description:
          "Gaming content channel with focus on tutorials and gameplay.",
        stats: { subscribers: "50K", views: "2.5M", videos: "200+" },
        skills: ["Video Editing", "Content Strategy", "Community Management"],
      },
      {
        type: "stream",
        title: "Twitch Partner",
        description:
          "Achieved Twitch Partner status with consistent streaming schedule.",
        stats: { followers: "15K", avg_viewers: "500", hours: "1200+" },
        skills: ["Live Streaming", "Audience Engagement", "Entertainment"],
      },
      {
        type: "collaboration",
        title: "Brand Partnerships",
        description:
          "Worked with gaming brands on sponsored content and reviews.",
        skills: ["Marketing", "Brand Relations", "Content Creation"],
      },
    ],
  },
  {
    id: "game-dev",
    name: "Game Developer",
    description:
      "Perfect for showcasing development projects and technical skills",
    primaryColor: "#4facfe",
    accentColor: "#00f2fe",
    features: [
      "Project Showcase",
      "Technical Skills",
      "Code Samples",
      "Development Process",
    ],
    items: [
      {
        type: "project",
        title: "Indie Game Release",
        description: "Solo-developed platformer game released on Steam.",
        stats: { downloads: "10K+", rating: "4.8/5", dev_time: "18 months" },
        skills: ["Unity", "C#", "Game Design", "Art Direction"],
      },
      {
        type: "project",
        title: "Game Jam Winner",
        description: "First place in 48-hour game development competition.",
        skills: [
          "Rapid Prototyping",
          "Team Collaboration",
          "Creative Problem Solving",
        ],
      },
      {
        type: "project",
        title: "Open Source Contribution",
        description: "Contributed features to popular game engine plugins.",
        skills: ["Version Control", "Documentation", "Community Collaboration"],
      },
    ],
  },
  {
    id: "industry-pro",
    name: "Industry Professional",
    description: "For gaming industry professionals and business roles",
    primaryColor: "#fa709a",
    accentColor: "#fee140",
    features: [
      "Career Timeline",
      "Company Highlights",
      "Project Impact",
      "Leadership Experience",
    ],
    items: [
      {
        type: "leadership",
        title: "Product Manager - AAA Studio",
        description: "Led development team of 50+ on blockbuster action game.",
        stats: { team_size: "50+", budget: "$10M+", release_date: "2023" },
        skills: ["Project Management", "Team Leadership", "Strategic Planning"],
      },
      {
        type: "project",
        title: "Game Launch Success",
        description:
          "Coordinated successful launch reaching 1M+ players in first month.",
        stats: { players: "1M+", revenue: "$5M+", metacritic: "85/100" },
        skills: ["Launch Strategy", "Marketing Coordination", "Analytics"],
      },
      {
        type: "achievement",
        title: "Industry Recognition",
        description:
          "Received Game Developer Award for Excellence in Production.",
        skills: ["Industry Leadership", "Innovation", "Quality Delivery"],
      },
    ],
  },
]);

function selectTemplate(template) {
  selectedTemplate.value = template;
}

function applyTemplate() {
  if (selectedTemplate.value) {
    emit("apply", selectedTemplate.value);
  }
}
</script>

<style scoped>
.template-selector {
  padding: 1.5rem;
}

.template-header {
  text-align: center;
  margin-bottom: 2rem;
}

.template-grid {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.template-card {
  position: relative;
  background: var(--glass-surface);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-smooth);
}

.template-card:hover {
  border-color: var(--color-primary-alpha);
}

.template-card--selected {
  border-color: var(--color-primary);
}

.template-preview {
  position: relative;
  overflow: hidden;
}

.preview-header {
  display: flex;
  align-items: center;
  position: relative;
}

.preview-header::after {
  content: "";
  position: absolute;
  background: linear-gradient(
  );
}

.preview-avatar {
}

.preview-info {
}

.preview-name {
}

.preview-title {
}

.preview-content {
  background: var(--glass-elevated);
  overflow: hidden;
}

.preview-section {
}

.preview-item {
  display: flex;
  align-items: flex-start;
}

.item-badge {
}

.item-content {
}

.item-title {
  background: var(--text-secondary);
}

.item-description {
  background: var(--text-secondary);
}

.item-tags {
  display: flex;
}

.tag {
  background: var(--text-secondary);
}

.template-info {
}

.template-name {
  color: var(--text-primary);
}

.template-description {
  color: var(--text-secondary);
}

.template-features {
  display: flex;
  flex-wrap: wrap;
}

.feature-badge {
  background: var(--color-primary-alpha);
  color: var(--color-primary);
  border-radius: var(--border-radius-sm);
}

.selection-indicator {
  position: absolute;
  color: var(--color-primary);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-actions {
  display: flex;
  justify-content: flex-end;
}

  .template-grid {
  }

  .template-selector {
  }

  .template-actions {
    flex-direction: column-reverse;
  }

  .template-actions .btn {
  }
}

[data-theme="dark"] .selection-indicator {
  background: var(--glass-surface);
}

[data-theme="dark"] .preview-content {
}
</style>
