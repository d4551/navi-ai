<template>
  <div class="enhanced-job-table">
    <table class="table glassmorphic w-100">
      <thead>
        <tr>
          <th>Job</th>
          <th>Company</th>
          <th>Location</th>
          <th style="width: 120px"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="4">
            <LoadingSkeletons variant="table" :table-row-count="4" />
          </td>
        </tr>
        <tr v-for="job in jobs" :key="job.id" class="row-click" @click="select(job)">
          <td>{{ job.title }}</td>
          <td>{{ job.company }}</td>
          <td>{{ job.location }}</td>
          <td class="text-right">
            <UnifiedButton size="xs" variant="primary" @click.stop="apply(job)">Apply</UnifiedButton>
          </td>
        </tr>
        <tr v-if="!loading && (!jobs || jobs.length === 0)">
          <td colspan="4" class="text-muted">No jobs available</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import LoadingSkeletons from '@/components/LoadingSkeletons.vue'

interface JobItem { id?: string; title?: string; company?: string; location?: string; [k: string]: any }

const props = defineProps<{ jobs: JobItem[]; loading?: boolean; selectedJobs?: any[]; gamingFocus?: boolean }>()
const emit = defineEmits<{
  (e: 'job-selected', job: JobItem): void
  (e: 'job-applied', job: JobItem): void
  (e: 'job-saved', job: JobItem): void
  (e: 'view-details', job: JobItem): void
  (e: 'open-studio-modal', job: JobItem): void
}>()

function select(job: JobItem) { emit('job-selected', job) }
function apply(job: JobItem) { emit('job-applied', job) }
</script>

<style scoped>
.table {
  border-collapse: collapse;
}
.table th, .table td { padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--border-subtle); }
.row-click { cursor: pointer; }
</style>

