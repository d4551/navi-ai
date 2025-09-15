<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="card glass-card section-card h-100" role="complementary" aria-labelledby="about-title" class="font-sans">
    <div class="card-header section-header card-header--dense">
      <h6 id="about-title" class="mb-0">
        <InfoIconComponent class="mr-2 icon-sm" />About NAVI
      </h6>
    </div>
    <div class="card-body section-body card-body--dense">
      <!-- App Info -->
      <div class="app-info mb-4">
        <div class="app-logo mb-3">
          <img
            :src="logoSrc"
            alt="NAVI Logo"
            class="img-fluid logo-max-60"
          />
        </div>

        <div class="app-details">
          <h6 class="app-name mb-1">NAVI - AI Career Assistant</h6>
          <p class="app-version mb-2">Version {{ appVersion }}</p>
          <p class="app-description mb-0">
            Your intelligent companion for gaming career development,
            interview preparation, and professional growth.
          </p>
        </div>
      </div>

      <!-- Key Features -->
      <div class="features mb-4">
        <h6 class="section-title mb-3">Key Features</h6>
        <ul class="features-list">
          <li class="feature-item">
            <BotIconComponent class="feature-icon" />
            <span>AI-powered interview coaching</span>
          </li>
          <li class="feature-item">
            <BriefcaseIconComponent class="feature-icon" />
            <span>Portfolio management & showcase</span>
          </li>
          <li class="feature-item">
            <MessageSquareIconComponent class="feature-icon" />
            <span>Real-time chat assistance</span>
          </li>
          <li class="feature-item">
            <GameIconComponent class="feature-icon" />
            <span>Gaming industry focus</span>
          </li>
          <li class="feature-item">
            <FileTextIconComponent class="feature-icon" />
            <span>Resume optimization</span>
          </li>
          <li class="feature-item">
            <BarChartIconComponent class="feature-icon" />
            <span>Career progress tracking</span>
          </li>
        </ul>
      </div>

      <!-- Quick Links -->
      <div class="quick-links mb-4">
        <h6 class="section-title mb-3">Quick Links</h6>
        <div class="d-grid gap-glass-sm">
          <a
            href="https://github.com/donnellybrandon/NaviCV"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-outline-secondary btn-sm flex items-center v-btn variant-outlined ui-btn ui-size-md"
          >
            <GithubIconComponent class="mr-2" />
            View on GitHub
            <ExternalLinkIconComponent class="ms-auto" />
          </a>

          <a
            href="https://github.com/donnellybrandon/NaviCV/wiki"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-outline-secondary btn-sm flex items-center v-btn variant-outlined ui-btn ui-size-md"
          >
            <BookIconComponent class="mr-2" />
            Documentation
            <ExternalLinkIconComponent class="ms-auto" />
          </a>

          <a
            href="https://github.com/donnellybrandon/NaviCV/discussions"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-outline-secondary btn-sm flex items-center v-btn variant-outlined ui-btn ui-size-md"
          >
            <MessageCircleIconComponent class="mr-2" />
            Community Discord
            <ExternalLinkIconComponent class="ms-auto" />
          </a>

          <UnifiedButton variant="outline" size="sm" leading-icon="mdi-history" @click="$emit('show-changelog')">Changelog</UnifiedButton>
        </div>
      </div>

      <!-- Support & Feedback -->
      <div class="support-feedback">
        <h6 class="section-title mb-3">Support & Feedback</h6>
        <div class="d-grid gap-glass-sm">
          <UnifiedButton type="button" variant="outline" size="sm" leading-icon="ExclamationTriangleIcon" @click="$emit('report-issue')">Report Issue</UnifiedButton>

          <UnifiedButton type="button" variant="outline" size="sm" leading-icon="LightBulbIcon" @click="$emit('request-feature')">Request Feature</UnifiedButton>

          <UnifiedButton type="button" variant="outline" size="sm" leading-icon="EnvelopeIcon" @click="$emit('contact-support')">Contact Support</UnifiedButton>
        </div>
      </div>

      <!-- Footer -->
      <div class="about-footer mt-4 pt-3 border-t">
        <div class="copyright text-center">
          <small :class="{ 'text-secondary': colorScheme === 'light', 'text-secondary-dark': colorScheme === 'dark' }">
            © {{ currentYear }} NAVI CV. All rights by
            <a
              href="https://www.linkedin.com/in/stracos"
              target="_blank"
              rel="noopener noreferrer"
              class="legal-link"
            >
              <GraduationCapIconComponent class="professor-icon mr-1" :class="{ 'text-warning-600': colorScheme === 'light', 'text-warning-600-dark': colorScheme === 'dark' }" />
              Dr. Brandon Donnelly
            </a>. Made with
            <HeartIconComponent class="heart-icon" /> for gamers.
          </small>
        </div>

        <div class="legal-links mt-2 text-center">
          <a
            href="#"
            class="legal-link"
            @click.prevent="$emit('show-privacy')"
          >
            Privacy Policy
          </a>
          <span class="mx-2 text-secondary">•</span>
          <a
            href="#"
            class="legal-link"
            @click.prevent="$emit('show-terms')"
          >
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { EnvelopeIcon, ExclamationTriangleIcon, LightBulbIcon } from '@heroicons/vue/24/outline'

import { useUnifiedTheme } from '@/shared/composables/useUnifiedTheme'
import {
  InfoIconComponent,
  BotIconComponent,
  BriefcaseIconComponent,
  MessageSquareIconComponent,
  GameIconComponent,
  FileTextIconComponent,
  BarChartIconComponent,
  GithubIconComponent,
  ExternalLinkIconComponent,
  BookIconComponent,
  MessageCircleIconComponent,
  ClockIconComponent,
  AlertTriangleIconComponent,
  LightbulbIconComponent,
  MailIconComponent,
  HeartIconComponent,
  GraduationCapIconComponent
} from './UnifiedIcons.js'
import { getAppVersion } from '@/utils/version'

export default {
  name: 'AboutCard',
  components: {
    InfoIconComponent,
    BotIconComponent,
    BriefcaseIconComponent,
    MessageSquareIconComponent,
    GameIconComponent,
    FileTextIconComponent,
    BarChartIconComponent,
    GithubIconComponent,
    ExternalLinkIconComponent,
    BookIconComponent,
    MessageCircleIconComponent,
    ClockIconComponent,
    AlertTriangleIconComponent,
    LightbulbIconComponent,
    MailIconComponent,
    HeartIconComponent,
    GraduationCapIconComponent,
    UnifiedButton: () => import('@/components/ui/UnifiedButton.vue')
  },
  props: {
    appVersion: {
      type: String,
      default: getAppVersion()
    },
    logoSrc: {
      type: String,
      default: '/logoDark.svg'
    }
  },
  emits: [
    'show-changelog',
    'report-issue',
    'request-feature',
    'contact-support',
    'show-privacy',
    'show-terms'
  ],
  setup() {
    const { colorScheme } = useUnifiedTheme()
    return { 
      colorScheme: colorScheme || 'light' // Provide fallback
    }
  },
  computed: {
    currentYear() {
      return new Date().getFullYear()
    }
  }
}
</script>

<style scoped>
.logo-max-60 { max-height: 60px; }
.app-info {
  text-align: center;
}

.app-logo {
  display: flex;
  justify-content: center;
}

.app-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary-600);
}

.app-version {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.app-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feature-item {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.feature-icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  margin-right: 0.5rem;
  color: var(--primary-color);
}

.quick-links .btn {
  justify-content: flex-start;
}

.support-feedback .btn {
  justify-content: flex-start;
}

.legal-links {
  font-size: 0.75rem;
}

.legal-link {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.legal-link:hover {
  color: var(--primary-color);
  text-decoration: underline;
}

.heart-icon {
  color: var(--color-danger-500);
  width: 12px;
  height: 12px;
  display: inline-block;
  margin: 0 0.125rem;
}
</style>
