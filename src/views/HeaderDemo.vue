<template>
  <StandardPageLayout
    page-type="gaming"
    max-width="xl"
    title="Enhanced Header Demo"
    subtitle="Showcase of the modern animated header system with dynamic stats and effects"
    :header-context="{ projects: 24, clips: 18, achievements: 32 }"
  >
    <template #header-actions>
      <UnifiedButton variant="primary" leading-icon="mdi-export">
        Export Demo
      </UnifiedButton>
      <UnifiedButton variant="glass" leading-icon="mdi-share-variant">
        Share Demo
      </UnifiedButton>
    </template>

    <!-- Demo Content -->
    <div class="header-demo-content">
      <div class="demo-section">
        <h2>Modern Header Features</h2>
        <div class="features-grid">
          <div class="feature-card">
            <AppIcon name="mdi-animation" class="feature-icon" />
            <h3>Animated Backgrounds</h3>
            <p>
              Dynamic rotating gradients with floating particles and parallax
              effects
            </p>
          </div>

          <div class="feature-card">
            <AppIcon name="mdi-counter" class="feature-icon" />
            <h3>Count-up Animations</h3>
            <p>
              Stats animate from 0 to their final values with smooth transitions
            </p>
          </div>

          <div class="feature-card">
            <AppIcon name="mdi-gesture-tap-button" class="feature-icon" />
            <h3>Interactive Effects</h3>
            <p>Hover effects, ripple animations, and responsive interactions</p>
          </div>

          <div class="feature-card">
            <AppIcon name="mdi-responsive" class="feature-icon" />
            <h3>Responsive Design</h3>
            <p>
              Adapts perfectly to all screen sizes with mobile-first approach
            </p>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h2>Header Variants</h2>
        <p>
          The header system supports multiple variants and configurations for
          different page types.
        </p>

        <div class="variants-grid">
          <div class="variant-card">
            <h4>Gaming Dashboard</h4>
            <p>
              Gaming-themed headers with achievement stats and level indicators
            </p>
          </div>

          <div class="variant-card">
            <h4>Portfolio Showcase</h4>
            <p>
              Project-focused headers with portfolio metrics and social actions
            </p>
          </div>

          <div class="variant-card">
            <h4>Settings & Config</h4>
            <p>Technical headers showing integrations and security status</p>
          </div>

          <div class="variant-card">
            <h4>AI Media Studio</h4>
            <p>
              Media-focused headers with processing capabilities and model info
            </p>
          </div>
        </div>
      </div>
    </div>
  </StandardPageLayout>
</template>

<script setup lang="ts">
import StandardPageLayout from "@/components/layout/StandardPageLayout.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import AppIcon from "@/components/ui/AppIcon.vue";
</script>

<style scoped>
.header-demo-content {
  padding: var(--spacing-lg);
  max-width: var(--page-content-max-width);
  margin: 0 auto;
}

.demo-section {
  margin-bottom: 3rem;
}

.demo-section h2 {
  color: var(--text-primary);
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-align: center;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.feature-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  border-color: var(--color-primary-500);
  box-shadow: 0 10px 30px var(--glow-primary);
}

.feature-icon {
  font-size: 3rem;
  color: var(--color-primary-500);
  margin-bottom: 1rem;
  display: block;
}

.feature-card h3 {
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.feature-card p {
  color: var(--text-secondary);
  line-height: 1.6;
}

.variants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.variant-card {
  background: var(--surface-elevated);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.variant-card:hover {
  background: var(--surface-glass);
  border-color: var(--color-primary-500);
}

.variant-card h4 {
  color: var(--text-primary);
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.variant-card p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .header-demo-content {
    padding: 1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .variants-grid {
    grid-template-columns: 1fr;
  }
}
</style>
