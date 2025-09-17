<!--
NAVI Notification System
========================
Gaming-themed notification system with RGB effects
Sam & Max inspired messaging and achievement notifications
-->

<template>
  <Teleport to="body">
    <!-- Notification Container -->
    <div class="notification-system" :class="{ 'noir-theme': true }">
      <!-- Active Notifications -->
      <TransitionGroup
        name="notification"
        tag="div"
        class="notifications-stack"
      >
        <div
          v-for="notification in activeNotifications"
          :key="notification.id"
          class="notification-item"
          :class="[
            `notification-${notification.type}`,
            { 'notification-persistent': notification.persistent },
            { 'notification-interactive': notification.actions?.length > 0 },
          ]"
          @click="handleNotificationClick(notification)"
          @mouseenter="pauseTimer(notification.id)"
          @mouseleave="resumeTimer(notification.id)"
        >
          <!-- Notification Content -->
          <div class="notification-content">
            <!-- Icon -->
            <div class="notification-icon">
              <i
                :class="getNotificationIcon(notification)"
                class="notification-icon-element"
              ></i>
              <div class="icon-glow" :class="`glow-${notification.type}`"></div>
            </div>

            <!-- Message -->
            <div class="notification-message">
              <div class="notification-title">{{ notification.title }}</div>
              <div v-if="notification.message" class="notification-text">
                {{ notification.message }}
              </div>

              <!-- Progress bar for timed notifications -->
              <div
                v-if="notification.duration && !notification.persistent"
                class="notification-progress"
              >
                <div
                  class="progress-bar"
                  :class="`progress-${notification.type}`"
                  :style="{
                    width: `${getProgressPercent(notification)}%`,
                    animationDuration: `${notification.duration}ms`,
                  }"
                ></div>
              </div>
            </div>

            <!-- Actions -->
            <div
              v-if="notification.actions?.length"
              class="notification-actions"
            >
              <button
                v-for="action in notification.actions"
                :key="action.id"
                class="notification-action-btn"
                :class="`btn-${action.type || 'primary'}`"
                @click.stop="handleAction(notification, action)"
              >
                <i
                  v-if="action.icon"
                  :class="action.icon"
                  class="action-icon"
                ></i>
                {{ action.label }}
              </button>
            </div>

            <!-- Close button -->
            <button
              v-if="
                !notification.persistent || notification.dismissible !== false
              "
              class="notification-close"
              aria-label="Dismiss notification"
              @click.stop="dismissNotification(notification.id)"
            >
              <AppIcon name="mdi-close-circle-outline" />
            </button>
          </div>

          <!-- Special effects for achievements -->
          <div
            v-if="notification.type === 'achievement'"
            class="achievement-effects"
          >
            <div class="achievement-sparkles">
              <div v-for="i in 6" :key="i" class="sparkle"></div>
            </div>
          </div>
        </div>
      </TransitionGroup>

      <!-- Sam & Max Quote Overlay -->
      <div
        v-if="samMaxQuote"
        class="sam-max-overlay"
        @click="dismissSamMaxQuote"
      >
        <div class="sam-max-bubble">
          <div class="quote-character">
            <img
              :src="samMaxQuote.character.avatar"
              :alt="samMaxQuote.character.name"
            />
          </div>
          <div class="quote-content">
            <p class="quote-text">{{ samMaxQuote.text }}</p>
            <div class="quote-author">- {{ samMaxQuote.character.name }}</div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import AppIcon from '@/components/ui/AppIcon.vue'

import { ref, onMounted, computed, onUnmounted, defineExpose } from 'vue'
import { useNotificationStore } from '@/stores/notifications'
import { easterEggs } from '@/utils/easterEggs'

// Store
const notificationStore = useNotificationStore()

// Local state
const timers = new Map()
const pausedTimers = new Map()
const samMaxQuote = ref(null)

// Computed
const activeNotifications = computed(() => notificationStore.notifications)

// Methods
function getNotificationIcon(notification) {
  const iconMap = {
    success: 'mdi-check-circle-outline',
    error: 'mdi-alert-circle-outline',
    warning: 'mdi-alert',
    info: 'mdi-information',
    achievement: 'mdi-trophy',
    job: 'mdi-briefcase',
    ai: 'mdi-robot',
    system: 'mdi-cog',
    gaming: 'mdi-gamepad-variant',
  }

  return notification.icon || iconMap[notification.type] || 'mdi-bell'
}

function getProgressPercent(notification) {
  if (!notification.startTime || !notification.duration) return 100

  const elapsed = Date.now() - notification.startTime
  const percent = Math.max(0, 100 - (elapsed / notification.duration) * 100)
  return percent
}

function handleNotificationClick(notification) {
  if (notification.onClick) {
    notification.onClick(notification)
  }

  // Auto-dismiss non-persistent notifications on click
  if (!notification.persistent) {
    dismissNotification(notification.id)
  }
}

function handleAction(notification, action) {
  if (action.onClick) {
    action.onClick(notification, action)
  }

  // Dismiss notification unless action specifies otherwise
  if (action.dismissOnClick !== false) {
    dismissNotification(notification.id)
  }
}

function dismissNotification(id) {
  notificationStore.dismiss(id)
  clearTimer(id)
}

function pauseTimer(id) {
  if (timers.has(id)) {
    const timer = timers.get(id)
    clearTimeout(timer.timeout)

    pausedTimers.set(id, {
      remainingTime: timer.remainingTime - (Date.now() - timer.startTime),
    })
  }
}

function resumeTimer(id) {
  if (pausedTimers.has(id)) {
    const pausedTimer = pausedTimers.get(id)
    pausedTimers.delete(id)

    if (pausedTimer.remainingTime > 0) {
      startTimer(id, pausedTimer.remainingTime)
    }
  }
}

function startTimer(id, duration) {
  clearTimer(id)

  const timeout = setTimeout(() => {
    dismissNotification(id)
  }, duration)

  timers.set(id, {
    timeout,
    startTime: Date.now(),
    remainingTime: duration,
  })
}

function clearTimer(id) {
  if (timers.has(id)) {
    clearTimeout(timers.get(id).timeout)
    timers.delete(id)
  }
  pausedTimers.delete(id)
}

function showSamMaxQuote(quote) {
  samMaxQuote.value = quote

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    samMaxQuote.value = null
  }, 5000)
}

function dismissSamMaxQuote() {
  samMaxQuote.value = null
}

// Notification lifecycle management
function manageNotificationTimers() {
  activeNotifications.value.forEach(notification => {
    if (
      notification.duration &&
      !notification.persistent &&
      !timers.has(notification.id)
    ) {
      startTimer(notification.id, notification.duration)
    }
  })
}

// Gaming-themed notification presets
const presets = {
  jobMatch: (job, matchScore) => ({
    type: 'job',
    title: '[TARGET] Perfect Match Found!',
    message: `${job.title} at ${job.company} (${matchScore}% match)`,
    duration: 8000,
    icon: 'mdi-target',
    actions: [
      {
        id: 'view',
        label: 'View Job',
        type: 'primary',
        icon: 'mdi-eye',
        onClick: () => {
          // Navigate to job details
        },
      },
      {
        id: 'apply',
        label: 'Quick Apply',
        type: 'success',
        icon: 'mdi-send',
        onClick: () => {
          // Quick apply logic
        },
      },
    ],
  }),

  achievement: (title, description, icon) => ({
    type: 'achievement',
    title: title,
    message: description,
    duration: 6000,
    icon: icon,
    persistent: false,
  }),

  aiAnalysis: (analysisType, result) => ({
    type: 'ai',
    title: `AI Analysis Complete`,
    message: `Your ${analysisType} has been analyzed. ${result.summary}`,
    duration: 10000,
    actions: [
      {
        id: 'view',
        label: 'View Results',
        type: 'primary',
        onClick: () => {
          // Show analysis results
        },
      },
    ],
  }),

  systemUpdate: (component, status) => ({
    type: 'system',
    title: '[CONFIG] System Update',
    message: `${component} is now ${status}`,
    duration: 4000,
  }),
}

// Watchers and lifecycle
onMounted(() => {
  // Set up timer management
  const timerInterval = setInterval(manageNotificationTimers, 100)

  // Listen for Sam & Max easter egg notifications
  document.addEventListener('sam-max-quote', event => {
    showSamMaxQuote(event.detail)
  })

  onUnmounted(() => {
    clearInterval(timerInterval)
    timers.forEach(timer => clearTimeout(timer.timeout))
    document.removeEventListener('sam-max-quote', showSamMaxQuote)
  })
})

// Expose presets and methods to parent components
defineExpose({
  presets,
  showSamMaxQuote,
})
</script>

<style scoped>
.notification-system {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 10000;
  pointer-events: none;
}

.notifications-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
  max-width: 400px;
  width: 100vw;
}

.notification-item {
  pointer-events: auto;
  background: var(--glass-primary);
  backdrop-filter: blur(20px);
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s var(--transition-gaming);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.notification-success {
  border-color: rgba(0, 255, 135, 0.3);
  box-shadow: 0 8px 32px rgba(0, 255, 135, 0.1);
}

.notification-error {
  border-color: rgba(255, 0, 128, 0.3);
  box-shadow: 0 8px 32px rgba(255, 0, 128, 0.1);
}

.notification-warning {
  border-color: rgba(255, 170, 0, 0.3);
  box-shadow: 0 8px 32px rgba(255, 170, 0, 0.1);
}

.notification-info {
  border-color: rgba(96, 239, 255, 0.3);
  box-shadow: 0 8px 32px rgba(96, 239, 255, 0.1);
}

.notification-achievement {
  border-color: rgba(255, 215, 0, 0.4);
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  box-shadow: 0 8px 32px rgba(255, 215, 0, 0.2);
  animation: achievementGlow 2s ease-in-out infinite alternate;
}

.notification-item:hover {
  transform: translateX(-5px) scale(1.02);
  box-shadow: 0 12px 48px rgba(0, 255, 135, 0.2);
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  position: relative;
}

.notification-icon {
  position: relative;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-icon-element {
  font-size: 1.5rem;
  color: var(--text-primary);
  z-index: 2;
  position: relative;
}

.icon-glow {
  position: absolute; /* Use .center-absolute class from design system */
  width: 40px;
  height: 40px;
  border-radius: 50%;
  opacity: 0.3;
  animation: pulse 2s ease-in-out infinite;
}

.glow-success {
  background: radial-gradient(
    circle,
    rgba(0, 255, 135, 0.4) 0%,
    transparent 70%
  );
}
.glow-error {
  background: radial-gradient(
    circle,
    rgba(255, 0, 128, 0.4) 0%,
    transparent 70%
  );
}
.glow-warning {
  background: radial-gradient(
    circle,
    rgba(255, 170, 0, 0.4) 0%,
    transparent 70%
  );
}
.glow-info {
  background: radial-gradient(
    circle,
    rgba(96, 239, 255, 0.4) 0%,
    transparent 70%
  );
}
.glow-achievement {
  background: radial-gradient(
    circle,
    rgba(255, 215, 0, 0.6) 0%,
    transparent 70%
  );
}

.notification-message {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-family: var(--font-primary);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.notification-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.notification-progress {
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1px;
  overflow: hidden;
  margin-top: 0.5rem;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--rgb-primary), var(--rgb-secondary));
  border-radius: 1px;
  animation: progressShrink linear forwards;
}

.notification-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.notification-action-btn {
  background: transparent;
  border: 1px solid var(--rgb-primary);
  color: var(--rgb-primary);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.notification-action-btn:hover {
  background: var(--rgb-primary);
  color: var(--text-on-primary);
}

.btn-success {
  border-color: var(--rgb-secondary);
  color: var(--rgb-secondary);
}

.btn-success:hover {
  background: var(--rgb-secondary);
  color: var(--text-on-primary);
}

.notification-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.notification-close:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.1);
}

.achievement-effects {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
  border-radius: 12px;
}

.achievement-sparkles {
  position: relative;
  width: 100%;
  height: 100%;
}

.sparkle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--color-warning-400);
  border-radius: 50%;
  animation: sparkleFloat 3s ease-in-out infinite;
}

.sparkle:nth-child(1) {
  top: 20%;
  left: 20%;
  animation-delay: 0s;
}
.sparkle:nth-child(2) {
  top: 80%;
  left: 30%;
  animation-delay: 0.5s;
}
.sparkle:nth-child(3) {
  top: 60%;
  right: 20%;
  animation-delay: 1s;
}
.sparkle:nth-child(4) {
  top: 40%;
  right: 40%;
  animation-delay: 1.5s;
}
.sparkle:nth-child(5) {
  bottom: 20%;
  left: 60%;
  animation-delay: 2s;
}
.sparkle:nth-child(6) {
  bottom: 60%;
  right: 60%;
  animation-delay: 2.5s;
}

.sam-max-overlay {
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  max-width: 400px;
  background: var(--glass-primary);
  backdrop-filter: blur(16px);
  border: 2px solid var(--rgb-primary);
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  animation: samMaxEntry 0.5s ease-out;
  pointer-events: auto;
}

.sam-max-bubble {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.quote-character img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid var(--rgb-primary);
}

.quote-content {
  flex: 1;
}

.quote-text {
  font-style: italic;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.quote-author {
  font-size: 0.9rem;
  color: var(--rgb-primary);
  font-weight: 600;
}

/* Animations */
@keyframes achievementGlow {
  0% {
    box-shadow: 0 8px 32px rgba(255, 215, 0, 0.2);
  }
  100% {
    box-shadow:
      0 8px 32px rgba(255, 215, 0, 0.4),
      0 0 20px rgba(255, 215, 0, 0.3);
  }
}

@keyframes sparkleFloat {
  0%,
  100% {
    opacity: 0;
    transform: translateY(0) scale(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-20px) scale(1);
  }
}

@keyframes samMaxEntry {
  from {
    opacity: 0;
    transform: translateX(-100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes progressShrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100px) scale(0.8);
}

/* Responsive */
@media (max-width: 768px) {
  .notifications-stack {
    padding: 1rem;
    max-width: calc(100vw - 2rem);
  }

  .sam-max-overlay {
    left: 1rem;
    right: 1rem;
    max-width: none;
  }

  .notification-content {
    flex-direction: column;
    gap: 0.75rem;
  }

  .notification-actions {
    justify-content: center;
  }
}
</style>
