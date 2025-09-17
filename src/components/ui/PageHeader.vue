<template>
  <header
    class="unified-page-header glass-strong font-sans"
    :class="[
      `header-${variant}`,
      `header-size-${size}`,
      {
        'header-centered': centered,
        'header-stacked': stacked,
        'header-with-gradient': useGradient
      }
    ]"
  >
    <!-- Simplified glassmorphic background -->
    <div v-if="showParticles || enableModernEffects" class="header-effects" aria-hidden="true">
      <div class="neon-glow"></div>
    </div>

    <!-- Header Content Container -->
    <div
      class="container-xl p-glass-lg flex items-start justify-between gap-glass-lg"
      :class="{ 'flex-flex-1 items-center text-center': stacked }"
    >
      <!-- Main Title Section -->
      <div class="header-title-section flex-1">
        <!-- Icon above title when stacked layout is used -->
        <div v-if="icon && stacked" class="flex justify-center mb-4">
          <AppIcon :name="icon" class="text-4xl text-glass-enhanced" />
        </div>

        <div class="title-content">
          <!-- Title with optional inline icon -->
          <component
            :is="titleTag"
            :class="titleClasses"
            class="text-glass-enhanced font-bold mb-2 flex items-center gap-glass-md"
          >
            <!-- Inline icon when not stacked -->
            <AppIcon v-if="icon && !stacked" :name="icon" class="text-2xl" />
            {{ title }}
          </component>

          <!-- Subtitle -->
          <p
            v-if="subtitle"
            class="text-glass-enhanced opacity-80 text-lg"
          >
            {{ subtitle }}
          </p>
        </div>

        <!-- Enhanced Stats Section -->
        <div v-if="stats && stats.length" class="header-stats flex flex-wrap gap-glass-md mt-6">
          <div
            v-for="stat in stats"
            :key="stat.label || stat.key"
            class="glass p-glass-md rounded-lg flex items-center gap-glass-md neon-interactive"
          >
            <div v-if="stat.icon" class="stat-icon-wrapper">
              <AppIcon :name="stat.icon" class="text-xl" :style="{ color: stat.color }" />
            </div>
            <div v-if="stat.value && stat.label" class="stat-info">
              <div class="text-2xl font-bold text-glass-enhanced">{{ stat.value }}</div>
              <div class="text-sm text-glass-enhanced opacity-70">{{ stat.label }}</div>
            </div>
            <span v-else-if="stat.text" class="text-glass-enhanced font-medium">{{ stat.text }}</span>
          </div>
        </div>
      </div>
      
      <!-- Actions Section -->
      <div v-if="$slots.actions || actions?.length" class="header-actions flex items-center gap-glass-md">
        <slot name="actions">
          <component
            :is="action.component || 'UnifiedButton'"
            v-for="(action, index) in actions"
            :key="action.key || index"
            v-bind="action.props"
            @click="handleActionClick(action, index)"
          >
            {{ action.text }}
          </component>
        </slot>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted, nextTick } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'

export interface HeaderStat {
  key?: string
  label?: string
  value?: string | number
  text?: string
  icon?: string
  color?: string
  success?: boolean
  warning?: boolean
}

export interface HeaderAction {
  key?: string
  text: string
  component?: string
  props?: Record<string, any>
  handler?: Function
}

interface Props {
  // Content Props
  title: string
  subtitle?: string
  icon?: string
  
  // Layout Props
  variant?: 'default' | 'gaming' | 'dashboard' | 'settings' | 'glass' | 'hero'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  centered?: boolean
  stacked?: boolean
  
  // Styling Props
  useGradient?: boolean
  gradientFrom?: string
  gradientTo?: string
  backgroundColor?: string
  textColor?: string
  
  // Title Props
  titleTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  titleSize?: 'sm' | 'md' | 'lg' | 'xl'
  
  // Interactive Props
  stats?: HeaderStat[]
  actions?: HeaderAction[]
  
  // Effect Props
  showShimmer?: boolean
  showParticles?: boolean
  showSwirls?: boolean
  
  // Enhanced modern effects
  enableModernEffects?: boolean
  enableCountUpAnimation?: boolean
  enableParallax?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  centered: false,
  stacked: false,
  useGradient: true,
  gradientFrom: 'var(--color-primary-500)',
  gradientTo: 'var(--color-secondary-500)',
  titleTag: 'h1',
  titleSize: 'lg',
  showShimmer: false,
  showParticles: false,
  showSwirls: true,
  enableModernEffects: true,
  enableCountUpAnimation: true,
  enableParallax: true
})

const emit = defineEmits<{
  actionClick: [action: HeaderAction, index: number]
}>()

// Computed Styles
const headerStyles = computed(() => {
  const styles: Record<string, string> = {}
  // Prefer CSS variables so theme can control defaults and transitions
  if (props.useGradient) {
    styles['--header-gradient-from'] = props.gradientFrom
    styles['--header-gradient-to'] = props.gradientTo
  } else if (props.backgroundColor) {
    styles['--header-bg'] = props.backgroundColor
  }
  if (props.textColor) {
    styles['--header-text-color'] = props.textColor
  }
  return styles
})

const titleClasses = computed(() => [
  'header-title',
  `header-title-${props.titleSize}`,
  `header-title-${props.variant}`,
  {
    'text-center': props.centered
  }
])

// Event Handlers
const handleActionClick = (action: HeaderAction, index: number) => {
  if (action.handler) {
    action.handler(action, index)
  }
  emit('actionClick', action, index)
}

// Modern Effects and Animations
onMounted(async () => {
  await nextTick()
  
  // Animate stat values counting up
  const statValues = document.querySelectorAll('.stat-value[data-value]')
  statValues.forEach((stat, index) => {
    setTimeout(() => {
      const finalValue = parseInt((stat as HTMLElement).dataset.value || '0')
      if (finalValue && !isNaN(finalValue)) {
        let currentValue = 0
        const increment = Math.max(1, finalValue / 30)
        
        const counter = setInterval(() => {
          currentValue += increment
          if (currentValue >= finalValue) {
            currentValue = finalValue
            clearInterval(counter)
          }
          stat.textContent = Math.floor(currentValue).toString()
        }, 50)
      }
    }, index * 200)
  })
  
  // Add click ripple effect to stat cards
  const statCards = document.querySelectorAll('.modern-stat-card')
  statCards.forEach(card => {
    card.addEventListener('click', function(e: Event) {
      const ripple = document.createElement('span')
      const rect = (this as HTMLElement).getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = (e as MouseEvent).clientX - rect.left - size / 2
      const y = (e as MouseEvent).clientY - rect.top - size / 2
      
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255,255,255,0.3);
        width: ${size}px;
        height: ${size}px;
        top: ${y}px;
        left: ${x}px;
        animation: ripple 0.6s ease-out;
        pointer-events: none;
        z-index: 1000;
      `
      
      ;(this as HTMLElement).appendChild(ripple)
      setTimeout(() => ripple.remove(), 600)
    })
  })
  
  // Add parallax effect to background animation
  if (typeof window !== 'undefined' && props.enableParallax) {
    document.addEventListener('mousemove', (e) => {
      const header = document.querySelector('.unified-page-header')
      if (header) {
        const x = e.clientX / window.innerWidth
        const y = e.clientY / window.innerHeight
        
        const background = header.querySelector('.header-background-animation')
        if (background) {
          ;(background as HTMLElement).style.transform = `translate(${x * 20 - 10}px, ${y * 20 - 10}px)`
        }
        
        // Enhanced parallax for particles
        const particles = header.querySelectorAll('.particle')
        particles.forEach((particle, index) => {
          const speed = (index + 1) * 0.5
          ;(particle as HTMLElement).style.transform = `translate(${x * speed - speed/2}px, ${y * speed - speed/2}px)`
        })
      }
    })
  }
})
</script>

<style scoped>
/* ============================================
   UNIFIED PAGE HEADER COMPONENT SYSTEM
   ============================================ */

/* Modern Header CSS Variables */
:root {
  --primary: #8B5CF6;
  --primary-dark: #7C3AED;
  --primary-light: #A78BFA;
  --secondary: #06B6D4;
  --accent: #F59E0B;
  --success: #10B981;
  --danger: #EF4444;
  --dark: #0F172A;
  --dark-secondary: #1E293B;
  --dark-tertiary: #334155;
  --light: #F8FAFC;
  --text-primary-600: #F1F5F9;
  --text-secondary: #94A3B8;
  --glass: rgba(30, 41, 59, 0.7);
  --glass-light: rgba(148, 163, 184, 0.1);
  --border: rgba(148, 163, 184, 0.2);
  --glow: rgba(139, 92, 246, 0.4);
}

.unified-page-header {
  position: relative;
  padding: 4rem 2rem 3rem;
  margin-bottom: var(--spacing-lg);
  border-radius: 0 0 var(--border-radius-xl) var(--border-radius-xl);
  box-shadow: var(--shadow-glass-lg);
  overflow: hidden;
  /* Modern gradient background */
  background: linear-gradient(135deg, var(--dark) 0%, var(--dark-secondary) 50%, var(--dark) 100%);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
  border: 1px solid var(--glass-border);
  border-b: 1px solid var(--border-base);
  color: var(--header-text-color, var(--text-primary-600));
}

/* Size Variants */
.header-size-sm {
  padding: var(--spacing-md) var(--spacing-md);
}

.header-size-md {
  padding: var(--spacing-lg) var(--spacing-lg);
}

.header-size-lg {
  padding: var(--spacing-xl) var(--spacing-lg);
}

.header-size-xl {
  padding: var(--spacing-2xl) var(--spacing-xl);
}

/* Layout Variants */
.header-centered .header-container {
  text-align: center;
  justify-content: center;
}

.header-stacked .title-wrapper {
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* Modern Background Effects */
.header-background-animation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.3;
  pointer-events: none;
}

.header-background-animation::before {
  content: '';
  position: absolute;
  width: 200%;
  height: 200%;
  top: -50%;
  left: -50%;
  background-image: 
    radial-gradient(circle at 20% 50%, var(--primary) 0%, transparent 50%),
    radial-gradient(circle at 80% 30%, var(--secondary) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, var(--accent) 0%, transparent 50%);
  animation: rotateBackground 30s linear infinite;
}

@keyframes rotateBackground {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Floating Particles */
.header-floating-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  background: var(--primary-light);
  border-radius: 50%;
  opacity: 0.6;
}

.particle.p1 {
  width: 4px;
  height: 4px;
  top: 20%;
  left: 10%;
  animation: floatParticle 15s linear infinite;
}

.particle.p2 {
  width: 6px;
  height: 6px;
  top: 60%;
  left: 70%;
  animation: floatParticle 20s linear infinite reverse;
  animation-delay: 2s;
}

.particle.p3 {
  width: 3px;
  height: 3px;
  top: 40%;
  left: 40%;
  animation: floatParticle 18s linear infinite;
  animation-delay: 4s;
}

.particle.p4 {
  width: 5px;
  height: 5px;
  top: 80%;
  left: 90%;
  animation: floatParticle 22s linear infinite reverse;
  animation-delay: 1s;
}

.particle.p5 {
  width: 4px;
  height: 4px;
  top: 10%;
  left: 50%;
  animation: floatParticle 17s linear infinite;
  animation-delay: 3s;
}

@keyframes floatParticle {
  from {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  to {
    transform: translateY(-100vh) rotate(720deg);
    opacity: 0;
  }
}

/* Glowing Border Effect */
.header-gradient-border {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--primary), var(--secondary), var(--accent), transparent);
  animation: borderGlow 3s ease-in-out infinite;
}

@keyframes borderGlow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* Legacy Background Effects */
.header-shimmer {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  animation: shimmer 3s ease-in-out infinite;
  pointer-events: none;
}

@keyframes shimmer {
  0%, 100% { transform: translateX(-100%) translateY(-100%) rotate(30deg); }
  50% { transform: translateX(100%) translateY(100%) rotate(30deg); }
}

/* Swirling glass light effects */
.header-swirls { position: absolute; inset: -20%; overflow: hidden; pointer-events: none; z-index: 0; }
.header-swirls .swirl {
  position: absolute;
  width: 40vmin; height: 40vmin;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.22;
  mix-blend-mode: screen;
  background: radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--color-primary-500) 40%, transparent), transparent 60%);
  animation: swirl-float 24s ease-in-out infinite;
}
.header-swirls .swirl.s1 { top: 10%; left: 0%; animation-delay: 0s }
.header-swirls .swirl.s2 { bottom: -5%; right: 5%; animation-delay: 4s; background: radial-gradient(circle at 70% 40%, color-mix(in srgb, var(--color-cyber-500, #00d9ff) 40%, transparent), transparent 60%); }
.header-swirls .swirl.s3 { top: -10%; right: 20%; animation-delay: 8s; background: radial-gradient(circle at 40% 60%, color-mix(in srgb, var(--color-gaming-500, #00ff88) 35%, transparent), transparent 60%); }
.header-swirls .swirl.s4 { bottom: 10%; left: 25%; animation-delay: 12s; background: radial-gradient(circle at 60% 40%, color-mix(in srgb, var(--color-accent-500, #ff6ad5) 28%, transparent), transparent 60%); }

@keyframes swirl-float {
  0% { transform: translate3d(0,0,0) scale(1) rotate(0deg); }
  25% { transform: translate3d(5%, -4%, 0) scale(1.05) rotate(20deg); }
  50% { transform: translate3d(-6%, 5%, 0) scale(0.95) rotate(45deg); }
  75% { transform: translate3d(4%, 6%, 0) scale(1.03) rotate(20deg); }
  100% { transform: translate3d(0,0,0) scale(1) rotate(0deg); }
}

/* Container */
.header-container {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-lg);
  max-width: var(--container-max-width);
  margin: 0 auto;
}

/* Title Section */
.header-title-section {
  flex: 1;
  min-width: 0;
}

.title-wrapper {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.title-content {
  flex: 1;
}

/* Icon Styling */
.header-icon-wrapper.stacked {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
  backdrop-filter: var(--glass-backdrop-blur);
  margin-bottom: var(--spacing-sm);
}

.header-icon-large {
  font-size: 2rem;
  color: white;
}

.header-icon-inline {
  margin-right: var(--spacing-sm);
  font-size: 1.5rem;
}

/* Enhanced Title Styling */
.header-title {
  margin: 0 0 var(--spacing-sm) 0;
  font-weight: 900;
  line-height: 1;
  display: flex;
  align-items: center;
  /* Modern gradient text effect */
  background: linear-gradient(135deg, var(--primary-light), var(--secondary), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientShift 4s ease infinite;
  background-size: 200% 200%;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Standardised Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

/* Normalise action button sizing inside headers */
.header-actions :deep(.btn-unified) {
  min-height: 36px; /* align to btn-sm */
  min-width: 36px;
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-sm);
  border-radius: var(--radius-md);
}

.header-actions :deep(.btn-unified.btn-icon-only) {
  padding: var(--spacing-2-5);
  aspect-ratio: 1 / 1;
}

/* Normalise chips and badges in headers */
.header-actions :deep(.ui-chip),
.header-actions :deep(.glass-badge) {
  font-size: var(--font-size-sm);
  padding: var(--spacing-1-5) var(--spacing-3);
  border-radius: var(--radius-full);
}

/* Keep view toggles tight */
.header-actions :deep(.view-toggle-group) {
  display: inline-flex;
  gap: var(--spacing-1);
}

.header-title-sm {
  font-size: var(--font-size-xl);
}

.header-title-md {
  font-size: 1.75rem;
}

.header-title-lg {
  font-size: var(--font-size-2xl);
}

.header-title-xl {
  font-size: var(--font-size-3xl);
}

/* Variant-specific title styling (master style) */
.header-title-gaming {
  /* Maintain strong contrast over gradients */
  color: var(--text-on-primary);
  text-shadow: 0 2px 8px color-mix(in srgb, var(--color-gaming-500) 35%, transparent);
}

.header-title-default {
  color: var(--text-on-primary);
}

/* Subtitle */
.header-subtitle {
  margin: 0;
  color: var(--text-secondary);
  text-shadow: none;
  font-size: var(--font-size-lg);
  line-height: 1.4;
}

/* Enhanced Modern Stats Section */
.header-stats.modern-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-top: var(--spacing-md);
}

.modern-stat-card {
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-width: 120px;
}

.modern-stat-card.animate-in {
  animation: slideInLeft 0.8s ease-out;
  animation-delay: var(--animation-delay, 0s);
  animation-fill-mode: both;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.modern-stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--primary), transparent);
  transform: translateX(-100%);
  animation: shimmerStat 3s infinite;
}

@keyframes shimmerStat {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.modern-stat-card:hover {
  transform: translateY(-3px);
  border-color: var(--primary);
  box-shadow: 0 10px 30px var(--glow);
}

.modern-stat-card.stat-success {
  border-color: var(--success);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.modern-stat-card.stat-warning {
  border-color: var(--accent);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.stat-icon {
  font-size: 1.5rem;
  color: white;
}

.stat-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary-600);
  line-height: 1;
  position: relative;
}

.stat-value[data-value] {
  counter-reset: stat-counter 0;
  animation: countUp 1s ease-out;
  animation-delay: var(--animation-delay, 0s);
  animation-fill-mode: both;
}

@keyframes countUp {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.stat-text {
  color: var(--text-primary-600);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.stat-shimmer {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
  pointer-events: none;
}

.modern-stat-card:hover .stat-shimmer {
  width: 200px;
  height: 200px;
  opacity: 0;
}

/* Legacy stat styles for backwards compatibility */
.stat-chip {
  background: var(--glass-bg-medium);
  backdrop-filter: var(--glass-backdrop-blur);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-sm) var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  border: 1px solid var(--glass-border);
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
  color: var(--text-on-primary);
}

.stat-chip:hover {
  transform: translateY(-2px);
  background: var(--glass-hover-bg);
}

.stat-chip-success {
  background: rgba(74, 222, 128, 0.2);
  border-color: rgba(74, 222, 128, 0.3);
}

.stat-chip-warning {
  background: rgba(251, 191, 36, 0.2);
  border-color: rgba(251, 191, 36, 0.3);
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* Actions Section */
.header-actions {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

/* Variant-Specific Styles */
.header-gaming {
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.9) 0%, 
    rgba(118, 75, 162, 0.9) 50%,
    rgba(255, 107, 107, 0.8) 100%
  );
}

.header-gaming::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  pointer-events: none;
  opacity: 0.3;
}

.header-dashboard {
  background: linear-gradient(135deg, 
    var(--color-primary-600) 0%, 
    var(--color-primary-500) 100%
  );
}

.header-settings {
  background: linear-gradient(135deg, 
    var(--color-secondary-600) 0%, 
    var(--color-secondary-500) 100%
  );
}

.header-glass { /* keep as alias for glass styling */ }

.header-glass .header-subtitle {
  color: var(--text-secondary);
}

.header-glass .stat-chip {
  background: var(--glass-elevated);
  border-color: var(--glass-border);
  color: var(--text-primary-600);
}

.header-glass .stat-value {
  color: var(--text-primary-600);
}

.header-glass .stat-label {
  color: var(--text-secondary);
}

.header-hero {
  background: linear-gradient(135deg, 
    rgba(59, 130, 246, 0.95) 0%,
    rgba(147, 51, 234, 0.9) 50%,
    rgba(236, 72, 153, 0.85) 100%
  );
  padding: var(--spacing-2xl) var(--spacing-xl);
}

/* Dark Theme Support */
[data-theme="dark"] .unified-page-header { box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
[data-theme="dark"] .header-swirls .swirl { opacity: 0.28; filter: blur(48px); }

/* Responsive Design */
@media (max-width: 768px) {
  .unified-page-header {
    padding: var(--spacing-lg) var(--spacing-md);
  }
  
  .header-container {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
  }
  
  .header-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .header-stats {
    justify-content: center;
  }
  
  .header-title-lg {
    font-size: 1.75rem;
  }
  
  .header-title-xl {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .unified-page-header {
    padding: var(--spacing-md) var(--spacing-sm);
  }
  
.header-title-md {
  font-size: var(--font-size-xl);
}
  
  .stat-chip {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-xs);
  }
}

/* Ripple Effect Animation */
@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .header-shimmer,
  .header-background-animation::before,
  .particle,
  .header-gradient-border,
  .header-title,
  .modern-stat-card.animate-in,
  .stat-icon-wrapper,
  .stat-value[data-value] {
    animation: none !important;
  }
  
  .modern-stat-card:hover {
    transform: none;
  }
  
  .stat-chip:hover {
    transform: none;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .unified-page-header {
    border: 2px solid var(--text-primary-600);
  }
  
  .stat-chip {
    border-width: 2px;
  }
}
</style>
