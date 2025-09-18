<template>
  <div class="font-sans">
    <div class="search-console noir-glass-card section-card">
      <div class="console-header">
        <span class="console-title">SUSPECT SEARCH CONSOLE</span>
        <div class="console-status">
          <span class="status-dot rgb-green"></span>
          <span class="status-text">ONLINE</span>
        </div>
      </div>
      <div v-if="!hideTextInput" class="search-input-group ui-input ui-size-md">
        <MuiTextField
          :model-value="modelValue"
          placeholder="Enter suspect name, location, or case details..."
          variant="outlined"
          size="medium"
          full-width
          @update:model-value="$emit('update:modelValue', $event)"
          @keydown.enter="$emit('investigate')"
        />
        <UnifiedButton
          color="glass"
          appearance="contained"
          leading-icon="MagnifyingGlassIcon"
          :aria-label="'Investigate'"
          @click="$emit('investigate')"
        >
          INVESTIGATE
        </UnifiedButton>
        <UnifiedButton
          color="gaming"
          :loading="aiLoading"
          leading-icon="CpuChipIcon"
          :disabled="aiLoading"
          aria-label="AI Suggest"
          @click="$emit('aiSuggest')"
        >
          {{ aiLoading ? 'ANALYZING...' : 'AI SUGGEST' }}
        </UnifiedButton>
        <UnifiedButton
          color="cyber"
          :loading="aiRankLoading"
          leading-icon="EyeIcon"
          :disabled="aiRankLoading || !canRank"
          title="Use AI to score visible studios"
          aria-label="AI Rank"
          @click="$emit('aiRank')"
        >
          {{ aiRankLoading ? 'RANKING...' : 'AI RANK' }}
        </UnifiedButton>
        <UnifiedButton
          color="ghost"
          appearance="outlined"
          :class="{ active: sortByAIScore }"
          :aria-label="'Toggle sort by AI score'"
          leading-icon="CursorArrowRaysIcon-variant"
          @click="$emit('update:sortByAIScore', !sortByAIScore)"
        >
          Sort by AI score
        </UnifiedButton>
      </div>
      <div v-else class="search-input-group ui-input ui-size-md">
        <slot name="search"></slot>
        <div class="actions-inline">
          <UnifiedButton
            color="gaming"
            :loading="aiLoading"
            leading-icon="CpuChipIcon"
            :disabled="aiLoading"
            aria-label="AI Suggest"
            @click="$emit('aiSuggest')"
          >
            {{ aiLoading ? 'ANALYZING...' : 'AI SUGGEST' }}
          </UnifiedButton>
          <UnifiedButton
            color="cyber"
            :loading="aiRankLoading"
            leading-icon="EyeIcon"
            :disabled="aiRankLoading || !canRank"
            title="Use AI to score visible studios"
            aria-label="AI Rank"
            @click="$emit('aiRank')"
          >
            {{ aiRankLoading ? 'RANKING...' : 'AI RANK' }}
          </UnifiedButton>
          <UnifiedButton
            color="ghost"
            appearance="outlined"
            :class="{ active: sortByAIScore }"
            :aria-label="'Toggle sort by AI score'"
            leading-icon="CursorArrowRaysIcon-variant"
            @click="$emit('update:sortByAIScore', !sortByAIScore)"
          >
            Sort by AI score
          </UnifiedButton>
        </div>
      </div>
    </div>

    <div class="filter-chips">
      <button
        v-for="(filter, idx) in chips"
        :key="idx"
        class="filter-chip glass-badge glass-badge-primary"
        :class="{ active: activeFilters?.[filter.key] === filter.value }"
        @click="$emit('toggleFilter', filter.key, filter.value)"
      >
        <AppIcon :name="filter.icon" class="filter-icon" />
        <span class="chip-label">{{ filter.label }}</span>
      </button>
    </div>

    <div class="advanced-investigation" :class="{ expanded: showAdvanced }">
      <div class="investigation-grid ultra-wide-grid">
        <div class="investigation-parameter">
          <label class="parameter-label noir-label">OPERATION TYPE</label>
          <select
            :value="filters.type"
            class="parameter-select form-select glass-input"
            @change="
              onFilterChange('type', ($event.target as HTMLSelectElement).value)
            "
          >
            <option value="">ALL OPERATIONS</option>
            <option value="AAA">MAJOR OPERATIONS</option>
            <option value="Indie">UNDERGROUND</option>
            <option value="Mobile">POCKET OPERATIONS</option>
            <option value="Publisher">THE BOSSES</option>
          </select>
        </div>

        <div class="investigation-parameter">
          <label class="parameter-label noir-label">TERRITORY</label>
          <MuiTextField
            :model-value="filters.location"
            placeholder="City, State, Country, or Region..."
            variant="outlined"
            size="medium"
            full-width
            @update:model-value="val => onFilterChange('location', val)"
          />
        </div>

        <div class="investigation-parameter">
          <label class="parameter-label noir-label">ORGANIZATION SIZE</label>
          <select
            :value="filters.size"
            class="parameter-select form-select glass-input"
            @change="
              onFilterChange('size', ($event.target as HTMLSelectElement).value)
            "
          >
            <option value="">ALL SIZES</option>
            <option value="Startup">SMALL OPERATION (1-50)</option>
            <option value="Mid-size">MEDIUM OUTFIT (51-500)</option>
            <option value="Large">MAJOR SYNDICATE (500+)</option>
          </select>
        </div>

        <div class="investigation-parameter">
          <label class="parameter-label noir-label">GHOST OPERATIONS</label>
          <label class="investigation-checkbox noir-checkbox">
            <input
              :checked="filters.remoteWork === true"
              type="checkbox"
              @change="
                onFilterChange(
                  'remoteWork',
                  ($event.target as HTMLInputElement).checked
                )
              "
            />
            <span class="checkbox-indicator rgb-accent-border"></span>
            REMOTE OPERATIVES
          </label>
        </div>
      </div>

      <UnifiedButton
        color="glass"
        appearance="outlined"
        leading-icon="mdi-magnify-expand"
        @click="$emit('update:showAdvanced', !showAdvanced)"
      >
        {{ showAdvanced ? 'BASIC SEARCH' : 'DEEP INVESTIGATION' }}
      </UnifiedButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  CpuChipIcon,
  EyeIcon,
  MagnifyingGlassIcon,
} from '@heroicons/vue/24/outline'

import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import MuiTextField from '@/components/ui/MuiTextField.vue'

interface Chip {
  key: string
  value: any
  label: string
  icon: string
  type: string
}

const props = defineProps<{
  modelValue: string
  filters: Record<string, any>
  showAdvanced: boolean
  aiLoading?: boolean
  aiRankLoading?: boolean
  canRank?: boolean
  sortByAIScore: boolean
  chips: Chip[]
  activeFilters?: Record<string, any>
  hideTextInput?: boolean
}>()

const emit = defineEmits([
  'update:modelValue',
  'update:filters',
  'update:showAdvanced',
  'update:sortByAIScore',
  'investigate',
  'aiSuggest',
  'aiRank',
  'toggleFilter',
])

function onFilterChange(key: string, value: any) {
  const next = { ...props.filters, [key]: value }
  emit('update:filters', next)
  emit('investigate')
}
</script>

<style scoped>
.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.5rem 0 1rem;
}
.filter-chip {
  cursor: pointer;
}
.filter-chip.active {
  border-color: color-mix(in srgb, var(--color-primary-500) 60%, transparent);
}
.sort-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.sort-btn.active {
  color: var(--color-primary-400);
}
</style>
