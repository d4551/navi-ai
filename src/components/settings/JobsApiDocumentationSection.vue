<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="settings-card glass-card section-card mb-4" role="region" aria-labelledby="jobs-api-title" class="font-sans">
    <div class="card-header section-header card-header--dense">
      <h5 id="jobs-api-title" class="mb-0">
        <CodeTagsIconComponent class="mr-2 icon-sm" />Jobs API Documentation
        <span class="badge bg-glass-bg dark:bg-glass-bg-hover text-glass-primary ml-2">v{{ apiDocumentation.version }}</span>
      </h5>
    </div>
    <div class="card-body section-body card-body--dense">
      <!-- API Status Overview -->
      <div class="mb-4 p-glass-md border rounded-3 glass-input">
        <label class="form-label font-medium mb-3">
          <PulseIconComponent class="mr-2" />API Status
        </label>
        <div class="status-metrics">
          <div
            v-for="(status, source) in apiMonitoring"
            :key="source"
            class="status-item flex justify-between items-center mb-2"
          >
            <span class="source-name font-medium">{{ status.name }}</span>
            <div class="flex items-center">
              <span
                class="status-indicator mr-2"
                :class="{ 'status-operational': status.status === 'operational',
                          'status-degraded': status.status === 'degraded',
                          'status-down': status.status === 'down',
                          'status-unknown': status.status === 'unknown',
                }"
                :title="`${status.uptime}% uptime`"
                role="img"
                :aria-label="`${status.name} status: ${status.status}, ${status.uptime}% uptime`"
              ></span>
              <small class="text-secondary">{{ status.uptime }}%</small>
            </div>
          </div>
        </div>
      </div>

      <!-- API Endpoints -->
      <div class="mb-4 p-glass-md border rounded-3 glass-input">
        <label class="form-label font-medium mb-3">
          <ListIconComponent class="mr-2" />Available Endpoints
        </label>
        <div class="endpoints-list">
          <div
            v-for="(endpoint, path) in apiDocumentation.endpoints"
            :key="path"
            class="endpoint-item mb-3 p-glass-md rounded bg-glass-bg dark:bg-glass-bg-hover"
          >
            <div class="endpoint-header flex items-center mb-2">
              <span
                class="badge method-badge mr-2"
                :class="{ 'bg-success-500': endpoint.method === 'GET',
                          'bg-primary-500': endpoint.method === 'POST',
                          'bg-warning-500': endpoint.method === 'PUT',
                          'bg-error-500': endpoint.method === 'DELETE',
                }"
              >{{ endpoint.method }}</span>
              <code class="endpoint-path">{{ path }}</code>
            </div>
            <p class="endpoint-description small text-secondary mb-0">
              {{ endpoint.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- API Examples -->
      <div class="mb-3 p-glass-md border rounded-3 glass-input">
        <label class="form-label font-medium mb-3">
          <CodeBracesIconComponent class="mr-2" />Usage Examples
        </label>
        <div class="examples-container">
          <div
            v-for="(example, index) in apiDocumentation.examples.searchRequests.slice(0, 2)"
            :key="index"
            class="example-item mb-3"
          >
            <div class="example-header mb-2">
              <h6 class="example-title mb-1 font-medium">{{ example.title }}</h6>
              <p class="example-description small text-secondary mb-2">
                {{ example.description }}
              </p>
            </div>
            <div class="example-code">
              <pre class="bg-glass-bg dark:bg-glass-bg dark:bg-gray-800 text-glass-primary dark:text-glass-primary p-glass-md rounded"><code>{{ JSON.stringify(example.request, null, 2) }}</code></pre>
            </div>
          </div>
        </div>
      </div>

      <!-- API Actions -->
      <div class="p-glass-md border rounded-3 glass-input">
        <label class="form-label font-medium mb-3">API Actions</label>
        <div class="flex flex-wrap g-3">
          <div class="flex-1-sm-6">
            <UnifiedButton
              type="button"
              variant="outline"
              size="md"
              class="w-100"
              leading-icon="CommandLineIcon"
              @click="$emit('view-full-documentation')"
            >
              View Full Documentation
            </UnifiedButton>
            <div class="form-text">
              Open complete API documentation with all endpoints.
            </div>
          </div>

          <div class="flex-1-sm-6">
            <UnifiedButton
              type="button"
              variant="outline"
              size="md"
              class="w-100"
              leading-icon="SignalIcon"
              @click="$emit('test-api-connection')"
            >
              Test API Connection
            </UnifiedButton>
            <div class="form-text">
              Test connectivity to job search API endpoints.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { CommandLineIcon, SignalIcon } from '@heroicons/vue/24/outline'

import {
  CodeTagsIconComponent,
  PulseIconComponent,
  ListIconComponent,
  CodeBracesIconComponent
} from './SettingsIcons.js'

export default {
  name: 'JobsApiDocumentationSection',
  components: {
    CodeTagsIconComponent,
    PulseIconComponent,
    ListIconComponent,
    CodeBracesIconComponent,
    UnifiedButton: () => import('@/components/ui/UnifiedButton.vue')
  },
  props: {
    apiDocumentation: {
      type: Object,
      required: true
    },
    apiMonitoring: {
      type: Object,
      required: true
    }
  },
  emits: ['view-full-documentation', 'test-api-connection']
}
</script>

<style scoped>
.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.status-operational {
  background-color: var(--color-success-500);
}

.status-degraded {
  background-color: var(--color-warning-500);
}

.status-down {
  background-color: var(--color-danger-500);
}

.status-unknown {
  background-color: var(--color-muted-500);
}

.method-badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
}

.endpoint-path {
  background: rgba(108, 117, 125, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.example-code pre {
  font-size: 0.8rem;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--border-base);
}

.status-item {
  padding: 0.5rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.5);
}

.endpoint-item {
  border: 1px solid var(--border-base);
}

.source-name {
  color: var(--text-primary-600);
}
</style>
