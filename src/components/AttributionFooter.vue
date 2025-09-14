<template>
  <div v-if="activeSources.length > 0" class="attribution-footer">
    <div class="attribution-content">
      <span class="attribution-label">Job data provided by:</span>
      <div class="source-links">
        <a
          v-for="source in activeSources"
          :key="source.name"
          :href="source.url"
          target="_blank"
          rel="noopener noreferrer"
          class="source-link"
        >
          {{ source.displayName }}
        </a>
      </div>
      <span class="attribution-note">
        Some sources require attribution. See 
        <router-link to="/settings#job-sources-section" class="sources-link">settings</router-link>
        for data source configuration.
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'

interface SourceInfo {
  name: string
  displayName: string
  url: string
  requiresAttribution: boolean
}

const appStore = useAppStore()

// Comprehensive source attribution data
const SOURCE_ATTRIBUTIONS: Record<string, SourceInfo> = {
  // Public feeds requiring attribution
  'Remotive': {
    name: 'Remotive',
    displayName: 'Remotive',
    url: 'https://remotive.com/',
    requiresAttribution: true
  },
  'Remote OK': {
    name: 'Remote OK',
    displayName: 'Remote OK',
    url: 'https://remoteok.com/',
    requiresAttribution: true
  },
  'We Work Remotely': {
    name: 'We Work Remotely',
    displayName: 'We Work Remotely',
    url: 'https://weworkremotely.com/',
    requiresAttribution: true
  },

  // Job boards
  'Indeed': {
    name: 'Indeed',
    displayName: 'Indeed',
    url: 'https://www.indeed.com/',
    requiresAttribution: false
  },
  'Monster': {
    name: 'Monster',
    displayName: 'Monster',
    url: 'https://www.monster.com/',
    requiresAttribution: false
  },
  'Dice': {
    name: 'Dice',
    displayName: 'Dice',
    url: 'https://www.dice.com/',
    requiresAttribution: false
  },
  'SimplyHired': {
    name: 'SimplyHired',
    displayName: 'SimplyHired',
    url: 'https://www.simplyhired.com/',
    requiresAttribution: false
  },
  'Glassdoor': {
    name: 'Glassdoor',
    displayName: 'Glassdoor',
    url: 'https://www.glassdoor.com/',
    requiresAttribution: false
  },
  'LinkedIn': {
    name: 'LinkedIn',
    displayName: 'LinkedIn',
    url: 'https://www.linkedin.com/jobs',
    requiresAttribution: false
  },
  'InfoJobs': {
    name: 'InfoJobs',
    displayName: 'InfoJobs',
    url: 'https://www.infojobs.net/',
    requiresAttribution: false
  },
  'USAJOBS': {
    name: 'USAJOBS',
    displayName: 'USAJOBS',
    url: 'https://www.usajobs.gov/',
    requiresAttribution: false
  },

  // Government sources
  'CareerOneStop': {
    name: 'CareerOneStop',
    displayName: 'CareerOneStop',
    url: 'https://www.careeronestop.org/',
    requiresAttribution: false
  },
  'NHS Jobs': {
    name: 'NHS Jobs',
    displayName: 'NHS Jobs',
    url: 'https://www.jobs.nhs.uk/',
    requiresAttribution: false
  },
  'UK Apprenticeships': {
    name: 'UK Apprenticeships',
    displayName: 'UK Apprenticeships',
    url: 'https://www.apprenticeships.gov.uk/',
    requiresAttribution: false
  },
  'NYC Government Jobs': {
    name: 'NYC Government Jobs',
    displayName: 'NYC Open Data',
    url: 'https://opendata.cityofnewyork.us/',
    requiresAttribution: false
  },
  'DOL Seasonal Jobs': {
    name: 'DOL Seasonal Jobs',
    displayName: 'DOL Seasonal Jobs',
    url: 'https://seasonaljobs.dol.gov/',
    requiresAttribution: false
  },
  'Bundesagentur für Arbeit': {
    name: 'Bundesagentur für Arbeit',
    displayName: 'Bundesagentur',
    url: 'https://www.arbeitsagentur.de/',
    requiresAttribution: false
  },
  'WorkNet': {
    name: 'WorkNet',
    displayName: 'WorkNet',
    url: 'https://www.work.go.kr/',
    requiresAttribution: false
  },

  // Additional sources
  'Careerjet': {
    name: 'Careerjet',
    displayName: 'Careerjet',
    url: 'https://www.careerjet.com/',
    requiresAttribution: false
  },
  'Jooble': {
    name: 'Jooble',
    displayName: 'Jooble',
    url: 'https://jooble.org/',
    requiresAttribution: false
  },
  'Reed.co.uk': {
    name: 'Reed.co.uk',
    displayName: 'Reed.co.uk',
    url: 'https://www.reed.co.uk/',
    requiresAttribution: false
  },
  'Juju': {
    name: 'Juju',
    displayName: 'Juju',
    url: 'https://www.juju.com/',
    requiresAttribution: false
  }
}

const activeSources = computed(() => {
  const sources = appStore.jobSearchData?.lastSearchSources || []
  return sources
    .map((sourceName: string) => SOURCE_ATTRIBUTIONS[sourceName])
    .filter((source: SourceInfo | undefined): source is SourceInfo => Boolean(source))
    .sort((a: SourceInfo, b: SourceInfo) => a.displayName.localeCompare(b.displayName))
})
</script>

<style scoped>
.attribution-footer {
  margin-top: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.attribution-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.attribution-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
}

.source-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.source-link {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: rgba(59, 130, 246, 0.1);
  color: var(--color-primary-500);
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid rgba(59, 130, 246, 0.2);
  transition: all 0.2s ease;
}

.source-link:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
}

.attribution-note {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.5rem;
}

.sources-link {
  color: var(--color-primary-600);
  text-decoration: underline;
}

.sources-link:hover {
  color: var(--color-primary-500);
}

@media (max-width: 640px) {
  .source-links {
    flex-direction: column;
    align-items: stretch;
  }

  .source-link {
    text-align: center;
  }
}
</style>
