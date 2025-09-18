<template>
  <v-card
    class="glass-card section-card cover-letter-preview-card font-sans"
    elevation="0"
  >
    <v-card-title class="flex items-center pa-4">
      <AppIcon name="DocumentIcon" class="mr-2" />
      Cover Letter Preview
      <v-spacer />
      <div class="flex items-center gap-glass-sm">
        <span class="text-caption">{{ template }} template</span>
        <UnifiedButton
          variant="outline"
          size="sm"
          leading-icon="mdi-printer-outline"
          @click="printCoverLetter"
        >
          Print
        </UnifiedButton>
      </div>
    </v-card-title>

    <v-card-text class="pa-0">
      <div
        ref="previewRef"
        class="cover-letter-preview-content"
        :class="templateClass"
      >
        <!-- Header Section -->
        <div
          v-if="coverLetterData.personal"
          class="cover-letter-header pa-6-unified"
        >
          <div class="header-main">
            <h1 class="applicant-name">
              {{ coverLetterData.personal.fullName || 'Your Name' }}
            </h1>
            <div class="contact-info">
              <div v-if="coverLetterData.personal.email" class="contact-item">
                <AppIcon name="mdi-email-outline" size="16" />
                {{ coverLetterData.personal.email }}
              </div>
              <div v-if="coverLetterData.personal.phone" class="contact-item">
                <AppIcon name="PhoneIcon-outline" size="16" />
                {{ coverLetterData.personal.phone }}
              </div>
              <div
                v-if="coverLetterData.personal.location"
                class="contact-item"
              >
                <AppIcon name="mdi-map-marker-outline" size="16" />
                {{ coverLetterData.personal.location }}
              </div>
              <div
                v-if="coverLetterData.personal.linkedin"
                class="contact-item"
              >
                <AppIcon name="LinkIconedin" size="16" />
                {{ coverLetterData.personal.linkedin }}
              </div>
            </div>
          </div>
        </div>

        <!-- Date and Recipient -->
        <div class="letter-meta pa-6-unified">
          <div class="letter-date">{{ formatDate(new Date()) }}</div>
          <div v-if="coverLetterData.jobInfo" class="recipient-info mt-4">
            <div
              v-if="coverLetterData.jobInfo.hiringManager"
              class="recipient-name"
            >
              {{ coverLetterData.jobInfo.hiringManager }}
            </div>
            <div v-if="coverLetterData.jobInfo.company" class="company-name">
              {{ coverLetterData.jobInfo.company }}
            </div>
            <div
              v-if="coverLetterData.jobInfo.location"
              class="company-location"
            >
              {{ coverLetterData.jobInfo.location }}
            </div>
          </div>
        </div>

        <!-- Letter Content -->
        <div class="letter-body pa-6-unified">
          <!-- Greeting -->
          <div class="greeting mb-4">
            <p>
              <span v-if="coverLetterData.jobInfo?.hiringManager">
                Dear {{ coverLetterData.jobInfo.hiringManager }},
              </span>
              <span v-else-if="coverLetterData.jobInfo?.company">
                Dear {{ coverLetterData.jobInfo.company }} Hiring Team,
              </span>
              <span v-else> Dear Hiring Manager, </span>
            </p>
          </div>

          <!-- Opening Paragraph -->
          <div
            v-if="coverLetterData.content?.opening"
            class="letter-paragraph mb-4"
          >
            <p>{{ coverLetterData.content.opening }}</p>
          </div>

          <!-- Body Paragraphs -->
          <div
            v-if="coverLetterData.content?.body"
            class="letter-paragraph mb-4"
          >
            <p
              v-for="(paragraph, index) in getBodyParagraphs(
                coverLetterData.content.body
              )"
              :key="index"
              class="mb-3"
            >
              {{ paragraph }}
            </p>
          </div>

          <!-- Closing Paragraph -->
          <div
            v-if="coverLetterData.content?.closing"
            class="letter-paragraph mb-4"
          >
            <p>{{ coverLetterData.content.closing }}</p>
          </div>

          <!-- Signature -->
          <div class="signature mt-5">
            <p class="mb-1">Sincerely,</p>
            <p class="signature-name">
              {{ coverLetterData.personal?.fullName || 'Your Name' }}
            </p>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { DocumentIcon } from '@heroicons/vue/24/outline'

import { ref, computed, defineProps } from 'vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

interface CoverLetterData {
  personal?: {
    fullName?: string
    email?: string
    phone?: string
    location?: string
    linkedin?: string
  }
  jobInfo?: {
    company?: string
    position?: string
    hiringManager?: string
    location?: string
  }
  content?: {
    opening?: string
    body?: string
    closing?: string
  }
}

interface Props {
  coverLetterData?: CoverLetterData
  template?: string
}

const _props = withDefaults(defineProps<Props>(), {
  coverLetterData: () => ({}),
  template: 'classic',
})

const previewRef = ref<HTMLElement>()

const templateClass = computed(
  () => `cover-letter-template-${(props.template || 'classic').toLowerCase()}`
)

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getBodyParagraphs = (body: string): string[] => {
  if (!body) return []
  return body.split('\n\n').filter(p => p.trim().length > 0)
}

const printCoverLetter = () => {
  if (previewRef.value) {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Cover Letter</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 8.5in; margin: 0 auto; padding: 1in; }
              .cover-letter-preview-content { background: white; }
              .cover-letter-header { margin-bottom: 2rem; }
              .applicant-name { font-size: 24px; font-weight: bold; margin-bottom: 0.5rem; }
              .contact-info { display: flex; flex-wrap: wrap; gap: 1rem; font-size: 14px; }
              .contact-item { display: flex; align-items: center; gap: 0.25rem; }
              .letter-meta { margin-bottom: 2rem; }
              .letter-date { font-size: 14px; margin-bottom: 1rem; }
              .recipient-info { font-size: 14px; }
              .letter-body { line-height: 1.8; }
              .letter-paragraph { margin-bottom: 1rem; }
              .signature { margin-top: 2rem; }
              .signature-name { font-weight: bold; margin-top: 3rem; }
              @media print { body { margin: 0; padding: 0.5in; } }
            </style>
          </head>
          <body>
            ${previewRef.value.innerHTML}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }
}
</script>

<style scoped>
.cover-letter-preview-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.cover-letter-preview-content {
  background: white;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  min-height: 600px;
  font-family: 'Times New Roman', serif;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

.pa-6-unified {
  padding: 1.5rem;
}

.cover-letter-header {
  border-b: 1px solid var(--border-subtle);
}

.applicant-name {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: var(--text-primary-600);
}

.contact-info {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--text-secondary);
}

.letter-date {
  font-size: 13px;
  color: var(--text-secondary);
}

.recipient-info {
  font-size: 13px;
  line-height: 1.4;
}

.recipient-name {
  font-weight: 600;
}

.company-name {
  font-weight: 500;
}

.letter-body {
  line-height: 1.8;
}

.letter-paragraph p {
  margin-bottom: 1rem;
  text-align: justify;
}

.greeting {
  font-weight: 500;
}

.signature {
  margin-top: 2rem;
}

.signature-name {
  font-weight: 600;
  margin-top: 2rem;
}

/* Template variants */
.cover-letter-template-modern {
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.cover-letter-template-modern .applicant-name {
  color: var(--color-info-500);
  font-size: 22px;
}

.cover-letter-template-modern .cover-letter-header {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--color-info-200) 60%, transparent),
    color-mix(in srgb, var(--color-info-100) 60%, transparent)
  );
  border-b: 2px solid var(--color-info-300);
}

.cover-letter-template-elegant .applicant-name {
  color: var(--color-primary-500);
  font-family: Georgia, serif;
  font-size: 24px;
}

.cover-letter-template-elegant .cover-letter-header {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--color-primary-100) 70%, transparent),
    color-mix(in srgb, var(--color-primary-50) 70%, transparent)
  );
  border-b: 1px solid var(--color-primary-200);
}

.cover-letter-template-compact {
  font-size: 12px;
  line-height: 1.5;
}

.cover-letter-template-compact .cover-letter-header {
  padding: 1rem;
}

.cover-letter-template-compact .pa-6-unified {
  padding: 1rem;
}

.cover-letter-template-compact .applicant-name {
  font-size: 18px;
}
</style>
