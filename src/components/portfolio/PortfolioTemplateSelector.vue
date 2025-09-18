<template>
  <div class="template-selector font-sans">
    <!-- Header -->
    <div class="template-header">
      <h5 class="mb-0">Choose a Template</h5>
      <p class="text-secondary mb-4">
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
          <AppIcon name="CheckCircleIcon" />
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="template-actions">
      <UnifiedButton variant="outline" @click="$emit('close')"
        >Cancel</UnifiedButton
      >
      <UnifiedButton
        variant="primary"
        :disabled="!selectedTemplate"
        leading-icon="CheckIcon"
        @click="applyTemplate"
      >
        Apply Template
      </UnifiedButton>
    </div>
  </div>
</template>

<script setup>
import { CheckCircleIcon, CheckIcon } from '@heroicons/vue/24/outline'

import { ref, defineEmits } from 'vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const emit = defineEmits(['close', 'apply'])

const selectedTemplate = ref(null)

const templates = ref([
  {
    id: 'gaming-pro',
    name: 'Gaming Professional',
    description: 'Perfect for esports players and competitive gamers',
    primaryColor: '#667eea',
    accentColor: '#764ba2',
    features: [
      'Tournament Focus',
      'Stat Highlights',
      'Team History',
      'Achievement Timeline',
    ],
    items: [
      {
        type: 'tournament',
        title: 'Regional Championship Winner',
        description:
          'First place in the Spring Regional Tournament with Team Phoenix.',
        game: 'Valorant',
        skills: ['Team Leadership', 'Strategic Planning', 'Communication'],
        achievement: { rank: '1st Place', event: 'Spring Regional' },
      },
      {
        type: 'achievement',
        title: 'Rank Achievement',
        description: 'Reached Radiant rank in competitive matchmaking.',
        game: 'Valorant',
        skills: ['Aim', 'Game Sense', 'Consistency'],
      },
      {
        type: 'leadership',
        title: 'Team Captain',
        description:
          'Led team to multiple tournament victories as In-Game Leader.',
        game: 'Valorant',
        skills: ['Leadership', 'Strategy', 'Communication'],
      },
    ],
  },
  {
    id: 'content-creator',
    name: 'Content Creator',
    description: 'Showcase your content creation and streaming achievements',
    primaryColor: '#f093fb',
    accentColor: '#f5576c',
    features: [
      'View Analytics',
      'Platform Integration',
      'Content Showcase',
      'Growth Metrics',
    ],
    items: [
      {
        type: 'content',
        title: 'YouTube Gaming Channel',
        description:
          'Gaming content channel with focus on tutorials and gameplay.',
        stats: { subscribers: '50K', views: '2.5M', videos: '200+' },
        skills: ['Video Editing', 'Content Strategy', 'Community Management'],
      },
      {
        type: 'stream',
        title: 'Twitch Partner',
        description:
          'Achieved Twitch Partner status with consistent streaming schedule.',
        stats: { followers: '15K', avg_viewers: '500', hours: '1200+' },
        skills: ['Live Streaming', 'Audience Engagement', 'Entertainment'],
      },
      {
        type: 'collaboration',
        title: 'Brand Partnerships',
        description:
          'Worked with gaming brands on sponsored content and reviews.',
        skills: ['Marketing', 'Brand Relations', 'Content Creation'],
      },
    ],
  },
  {
    id: 'game-dev',
    name: 'Game Developer',
    description:
      'Perfect for showcasing development projects and technical skills',
    primaryColor: '#4facfe',
    accentColor: '#00f2fe',
    features: [
      'Project Showcase',
      'Technical Skills',
      'Code Samples',
      'Development Process',
    ],
    items: [
      {
        type: 'project',
        title: 'Indie Game Release',
        description: 'Solo-developed platformer game released on Steam.',
        stats: { downloads: '10K+', rating: '4.8/5', dev_time: '18 months' },
        skills: ['Unity', 'C#', 'Game Design', 'Art Direction'],
      },
      {
        type: 'project',
        title: 'Game Jam Winner',
        description: 'First place in 48-hour game development competition.',
        skills: [
          'Rapid Prototyping',
          'Team Collaboration',
          'Creative Problem Solving',
        ],
      },
      {
        type: 'project',
        title: 'Open Source Contribution',
        description: 'Contributed features to popular game engine plugins.',
        skills: ['Version Control', 'Documentation', 'Community Collaboration'],
      },
    ],
  },
  {
    id: 'industry-pro',
    name: 'Industry Professional',
    description: 'For gaming industry professionals and business roles',
    primaryColor: '#fa709a',
    accentColor: '#fee140',
    features: [
      'Career Timeline',
      'Company Highlights',
      'Project Impact',
      'Leadership Experience',
    ],
    items: [
      {
        type: 'leadership',
        title: 'Product Manager - AAA Studio',
        description: 'Led development team of 50+ on blockbuster action game.',
        stats: { team_size: '50+', budget: '$10M+', release_date: '2023' },
        skills: ['Project Management', 'Team Leadership', 'Strategic Planning'],
      },
      {
        type: 'project',
        title: 'Game Launch Success',
        description:
          'Coordinated successful launch reaching 1M+ players in first month.',
        stats: { players: '1M+', revenue: '$5M+', metacritic: '85/100' },
        skills: ['Launch Strategy', 'Marketing Coordination', 'Analytics'],
      },
      {
        type: 'achievement',
        title: 'Industry Recognition',
        description:
          'Received Game Developer Award for Excellence in Production.',
        skills: ['Industry Leadership', 'Innovation', 'Quality Delivery'],
      },
    ],
  },
])

function selectTemplate(template) {
  selectedTemplate.value = template
}

function applyTemplate() {
  if (selectedTemplate.value) {
    emit('apply', selectedTemplate.value)
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

/* Template Card */
.template-card {
  position: relative;
  background: var(--glass-surface);
  border: 2px solid var(--glass-border);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-smooth);
}

.template-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-color: var(--color-primary-alpha);
}

.template-card--selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-alpha);
}

/* Template Preview */
.template-preview {
  height: 200px;
  position: relative;
  overflow: hidden;
}

.preview-header {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0.75rem;
  gap: 0.75rem;
  position: relative;
}

.preview-header::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05)
  );
}

.preview-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
  z-index: 1;
}

.preview-info {
  flex: 1;
  z-index: 1;
}

.preview-name {
  width: 80px;
  height: 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  margin-bottom: 0.25rem;
}

.preview-title {
  width: 60px;
  height: 8px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 4px;
}

.preview-content {
  padding: 0.75rem;
  background: var(--glass-elevated);
  height: 140px;
  overflow: hidden;
}

.preview-section {
  margin-bottom: 0.75rem;
}

.preview-item {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.item-badge {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 2px;
}

.item-content {
  flex: 1;
}

.item-title {
  width: 120px;
  height: 8px;
  background: var(--text-secondary);
  opacity: 0.3;
  border-radius: 4px;
  margin-bottom: 0.25rem;
}

.item-description {
  width: 180px;
  height: 6px;
  background: var(--text-secondary);
  opacity: 0.2;
  border-radius: 3px;
  margin-bottom: 0.375rem;
}

.item-tags {
  display: flex;
  gap: 0.25rem;
}

.tag {
  width: 24px;
  height: 4px;
  background: var(--text-secondary);
  opacity: 0.15;
  border-radius: 2px;
}

/* Template Info */
.template-info {
  padding: 1rem;
}

.template-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary-600);
  margin-bottom: 0.25rem;
}

.template-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.template-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.feature-badge {
  background: var(--color-primary-alpha);
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.125rem 0.375rem;
  border-radius: var(--border-radius-sm);
}

/* Selection Indicator */
.selection-indicator {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  color: var(--color-primary);
  font-size: 1.25rem;
  background: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Template Actions */
.template-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-t: 1px solid var(--glass-border);
}

/* Responsive Design */
@media (max-width: 768px) {
  .template-grid {
    gap: 1rem;
  }

  .template-selector {
    padding: 1rem;
  }

  .template-actions {
    flex-direction: column-reverse;
  }

  .template-actions .btn {
    width: 100%;
  }
}

/* Dark theme */
[data-theme='dark'] .selection-indicator {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
}

[data-theme='dark'] .preview-content {
  background: rgba(255, 255, 255, 0.02);
}
</style>
