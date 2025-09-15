<template>
  <div ref="searchContainer" class="position-relative search-input-container ui-input ui-size-md" class="font-sans">
    <!-- Main Search Input -->
    <div class="search-input-wrapper ui-input ui-size-md">
      <input
        ref="searchInput"
        :value="modelValue"
        :type="type"
        class="form-control glass-input enhanced-search-input ui-input ui-size-md"
        :class="[inputClass, { 'with-tags': selectedTags.length > 0, 'with-suggestions': showSuggestions }]"
        :placeholder="placeholder"
        :aria-label="ariaLabel"
        :disabled="disabled"
        @input="handleInput"
        @keydown="handleKeyDown"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <!-- Tags Display -->
      <div v-if="selectedTags.length > 0" class="selected-tags">
        <span
          v-for="(tag, index) in selectedTags"
          :key="`tag-${index}`"
          class="search-tag"
          :class="tag.type"
        >
          <i :class="getTagIcon(tag.type)"></i>
          {{ tag.label }}
          <button
            class="tag-remove"
            :aria-label="`Remove ${tag.label} tag`"
            type="button"
            @click="removeTag(index)"
          >
            <AppIcon name="XMarkIcon-circle-outline" context="error" />
          </button>
        </span>
      </div>

      <!-- Search Icon -->
      <i
        :class="[icon, 'search-icon-enhanced', iconClass]"
        :style="iconStyle"
        aria-hidden="true"
      ></i>

      <!-- Clear Button -->
      <button
        v-if="modelValue || selectedTags.length > 0"
        class="clear-all-btn"
        :aria-label="'Clear search and tags'"
        type="button"
        @click="clearAll"
      >
        <AppIcon name="XMarkIcon-circle-outline" context="error" />
      </button>
    </div>

    <!-- Fuzzy Search Suggestions -->
    <div
      v-if="showSuggestions && (fuzzySuggestions.length > 0 || tagSuggestions.length > 0)"
      class="search-suggestions-enhanced"
      role="listbox"
      :aria-label="'Search suggestions'"
    >
      <!-- Fuzzy Match Results -->
      <div v-if="fuzzySuggestions.length > 0" class="suggestion-group">
        <div class="suggestion-group-header">
          <AppIcon name="MagnifyingGlassIcon" />
          <span>Search Results</span>
        </div>
        <button
          v-for="(suggestion, index) in fuzzySuggestions.slice(0, 5)"
          :key="`fuzzy-${index}`"
          class="suggestion-item fuzzy-suggestion"
          :class="{ 'highlighted': highlightedIndex === index }"
          type="button"
          role="option"
          :aria-selected="highlightedIndex === index"
          @click="selectFuzzySuggestion(suggestion)"
          @mouseenter="highlightedIndex = index"
        >
          <div class="suggestion-content">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span class="suggestion-text" v-html="highlightMatch(suggestion.text, modelValue)"></span>
            <span v-if="suggestion.category" class="suggestion-category">{{ suggestion.category }}</span>
          </div>
          <div class="suggestion-score">{{ Math.round(suggestion.score * 100) }}%</div>
        </button>
      </div>

      <!-- Tag Suggestions -->
      <div v-if="tagSuggestions.length > 0" class="suggestion-group">
        <div class="suggestion-group-header">
          <AppIcon name="TagIcon-multiple" />
          <span>Add Tags</span>
        </div>
        <button
          v-for="(tag, index) in tagSuggestions.slice(0, 4)"
          :key="`tag-${index}`"
          class="suggestion-item tag-suggestion"
          :class="[tag.type, { 'highlighted': highlightedIndex === fuzzySuggestions.length + index }]"
          type="button"
          role="option"
          :aria-selected="highlightedIndex === fuzzySuggestions.length + index"
          @click="addTag(tag)"
          @mouseenter="highlightedIndex = fuzzySuggestions.length + index"
        >
          <i :class="getTagIcon(tag.type)"></i>
          <span>{{ tag.label }}</span>
          <span class="tag-type-label">{{ tag.type }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

import { ref, onMounted, computed, onBeforeUnmount, nextTick, defineEmits, defineProps } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const _props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: 'Search with fuzzy matching and tags...'
  },
  ariaLabel: {
    type: String,
    default: 'Enhanced search input with fuzzy matching'
  },
  icon: {
    type: String,
    default: 'mdi mdi-magnify'
  },
  iconClass: {
    type: String,
    default: 'text-secondary'
  },
  iconStyle: {
    type: String,
    default: 'right: 3rem;'
  },
  inputClass: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  // Enhanced fuzzy search props
  searchData: {
    type: Array,
    default: () => []
  },
  searchKeys: {
    type: Array,
    default: () => ['name', 'title', 'description', 'tags']
  },
  enableFuzzy: {
    type: Boolean,
    default: true
  },
  enableTags: {
    type: Boolean,
    default: true
  },
  fuzzyThreshold: {
    type: Number,
    default: 0.3
  },
  maxSuggestions: {
    type: Number,
    default: 8
  }
})

const emit = defineEmits(['update:modelValue', 'enter', 'focus', 'blur', 'search', 'tag-added', 'tag-removed', 'suggestion-selected'])

// Reactive state
const searchContainer = ref(null)
const searchInput = ref(null)
const selectedTags = ref([])
const showSuggestions = ref(false)
const highlightedIndex = ref(-1)
const debounceTimer = ref(null)

// Fuzzy search implementation
const fuzzyMatch = (pattern, str, threshold = props.fuzzyThreshold) => {
  const patternLower = pattern.toLowerCase()
  const strLower = str.toLowerCase()

  // Exact match gets highest score
  if (strLower.includes(patternLower)) {
    return { score: 1.0, matches: [] }
  }

  // Fuzzy matching algorithm
  let score = 0
  const matches = []
  let patternIdx = 0

  for (let i = 0; i < strLower.length && patternIdx < patternLower.length; i++) {
    if (strLower[i] === patternLower[patternIdx]) {
      matches.push(i)
      patternIdx++
      score += 1
    }
  }

  if (patternIdx !== patternLower.length) {return null}

  // Calculate final score
  score = (score / pattern.length) * (patternIdx / strLower.length)

  return score >= threshold ? { score, matches } : null
}

// Computed suggestions
const fuzzySuggestions = computed(() => {
  if (!props.enableFuzzy || !props.modelValue || props.modelValue.length < 2) {return []}

  const results = []
  const query = props.modelValue.toString()

  for (const item of props.searchData) {
    for (const key of props.searchKeys) {
      if (item[key]) {
        const match = fuzzyMatch(query, item[key])
        if (match) {
          results.push({
            ...item,
            text: item[key],
            score: match.score,
            matches: match.matches,
            searchKey: key,
            category: item.category || key
          })
        }
      }
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, props.maxSuggestions)
})

// Available tag suggestions based on current input
const availableTagTypes = [
  { type: 'role', icon: 'mdi-briefcase', suggestions: ['Developer', 'Designer', 'Producer', 'Artist', 'QA', 'Manager'] },
  { type: 'skill', icon: 'StarIcon', suggestions: ['Unity', 'Unreal', 'C#', 'JavaScript', 'Python', 'Blender'] },
  { type: 'location', icon: 'mdi-map-marker', suggestions: ['Remote', 'San Francisco', 'New York', 'London', 'Tokyo'] },
  { type: 'experience', icon: 'mdi-trending-up', suggestions: ['Entry', 'Mid', 'Senior', 'Lead', 'Principal'] },
  { type: 'company', icon: 'mdi-domain', suggestions: ['Indie', 'AAA', 'Startup', 'Enterprise'] }
]

const tagSuggestions = computed(() => {
  if (!props.enableTags || !props.modelValue || props.modelValue.length < 2) {return []}

  const query = props.modelValue.toString().toLowerCase()
  const suggestions = []

  for (const tagType of availableTagTypes) {
    for (const suggestion of tagType.suggestions) {
      if (suggestion.toLowerCase().includes(query)) {
        // Don't suggest already selected tags
        const alreadySelected = selectedTags.value.some(
          tag => tag.label.toLowerCase() === suggestion.toLowerCase()
        )

        if (!alreadySelected) {
          suggestions.push({
            type: tagType.type,
            label: suggestion,
            icon: tagType.icon
          })
        }
      }
    }
  }

  return suggestions.slice(0, 4)
})

// Methods
const handleInput = (event) => {
  const value = event.target.value
  emit('update:modelValue', value)

  // Debounced search
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
  }

  debounceTimer.value = setTimeout(() => {
    if (value.length >= 2) {
      showSuggestions.value = true
      highlightedIndex.value = -1
    } else {
      showSuggestions.value = false
    }

    emit('search', {
      query: value,
      tags: selectedTags.value,
      suggestions: fuzzySuggestions.value
    })
  }, 300)
}

const handleKeyDown = (event) => {
  if (!showSuggestions.value) {return}

  const totalSuggestions = fuzzySuggestions.value.length + tagSuggestions.value.length

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      highlightedIndex.value = Math.min(highlightedIndex.value + 1, totalSuggestions - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (highlightedIndex.value >= 0) {
        if (highlightedIndex.value < fuzzySuggestions.value.length) {
          selectFuzzySuggestion(fuzzySuggestions.value[highlightedIndex.value])
        } else {
          const tagIndex = highlightedIndex.value - fuzzySuggestions.value.length
          addTag(tagSuggestions.value[tagIndex])
        }
      } else {
        emit('enter', props.modelValue)
      }
      break
    case 'Escape':
      showSuggestions.value = false
      highlightedIndex.value = -1
      break
  }
}

const handleFocus = (event) => {
  emit('focus', event)
  if (props.modelValue && props.modelValue.length >= 2) {
    showSuggestions.value = true
  }
}

const handleBlur = (event) => {
  // Delay hiding suggestions to allow clicking on them
  setTimeout(() => {
    showSuggestions.value = false
    highlightedIndex.value = -1
  }, 150)
  emit('blur', event)
}

const selectFuzzySuggestion = (suggestion) => {
  emit('update:modelValue', suggestion.text)
  emit('suggestion-selected', suggestion)
  showSuggestions.value = false
  highlightedIndex.value = -1
}

const addTag = (tag) => {
  selectedTags.value.push(tag)
  emit('tag-added', { tag, tags: selectedTags.value })
  emit('update:modelValue', '')
  showSuggestions.value = false
  highlightedIndex.value = -1

  nextTick(() => {
    searchInput.value?.focus()
  })
}

const removeTag = (index) => {
  const removedTag = selectedTags.value.splice(index, 1)[0]
  emit('tag-removed', { tag: removedTag, tags: selectedTags.value })

  nextTick(() => {
    searchInput.value?.focus()
  })
}

const clearAll = () => {
  emit('update:modelValue', '')
  selectedTags.value = []
  showSuggestions.value = false
  highlightedIndex.value = -1

  nextTick(() => {
    searchInput.value?.focus()
  })
}

const getTagIcon = (tagType) => {
  const tagTypeMap = availableTagTypes.find(t => t.type === tagType)
  return tagTypeMap?.icon || 'TagIcon'
}

const highlightMatch = (text, query) => {
  if (!query) {return text}

  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark class="fuzzy-highlight">$1</mark>')
}

// Cleanup
onBeforeUnmount(() => {
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value)
  }
})
</script>

<style scoped>
/* Enhanced Search Input Container */
.search-input-container {
  width: 100%;
  position: relative;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Enhanced Glass Input */
.enhanced-search-input {
  background: var(--glass-surface, rgba(255, 255, 255, 0.1));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.2));
  border-radius: var(--border-radius-md, 8px);
  backdrop-filter: blur(var(--glass-backdrop-blur, 10px));
  -webkit-backdrop-filter: blur(var(--glass-backdrop-blur, 10px));
  color: var(--text-primary-600, #18181b);
  padding: 0.75rem 4rem 0.75rem 1rem;
  min-height: 2.75rem;
  transition: all var(--transition-smooth, 0.3s ease);
  font-size: 0.95rem;
}

.enhanced-search-input.with-tags {
  padding-top: 0.5rem;
  min-height: 3.5rem;
}

.enhanced-search-input.with-suggestions {
  border-b-left-radius: 0;
  border-b-right-radius: 0;
  border-b-color: transparent;
}

.enhanced-search-input:focus {
  outline: none;
  border-color: var(--color-primary, #6366f1);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary, #6366f1) 20%, transparent);
  transform: translateY(-1px);
}

.enhanced-search-input::placeholder {
  color: var(--text-secondary, #6b7280);
  opacity: 0.8;
}

/* Selected Tags */
.selected-tags {
  position: absolute;
  top: 0.5rem;
  left: 1rem;
  right: 4rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  z-index: 2;
  pointer-events: none;
}

.search-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.15rem 0.5rem;
  background: var(--glass-elevated, rgba(255, 255, 255, 0.15));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.3));
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  backdrop-filter: blur(8px);
  pointer-events: auto;
  transition: all 0.2s ease;
}

.search-tag:hover {
  background: var(--glass-elevated-light, rgba(255, 255, 255, 0.2));
  transform: translateY(-1px);
}

.search-tag.role {
  color: var(--color-primary);
  border-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
}

.search-tag.skill {
  color: var(--color-success);
  border-color: color-mix(in srgb, var(--color-success) 30%, transparent);
  background: color-mix(in srgb, var(--color-success) 10%, transparent);
}

.search-tag.location {
  color: var(--color-info);
  border-color: color-mix(in srgb, var(--color-info) 30%, transparent);
  background: color-mix(in srgb, var(--color-info) 10%, transparent);
}

.search-tag.experience {
  color: var(--color-warning);
  border-color: color-mix(in srgb, var(--color-warning) 30%, transparent);
  background: color-mix(in srgb, var(--color-warning) 10%, transparent);
}

.search-tag.company {
  color: var(--color-secondary);
  border-color: color-mix(in srgb, var(--color-secondary) 30%, transparent);
  background: color-mix(in srgb, var(--color-secondary) 10%, transparent);
}

.tag-remove {
  background: none;
  border: none;
  color: currentColor;
  opacity: 0.7;
  font-size: 0.7rem;
  padding: 0.1rem;
  margin-left: 0.2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 50%;
}

.tag-remove:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.2);
}

/* Icons */
.search-icon-enhanced {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: 1.2rem;
  z-index: 3;
  transition: all 0.2s ease;
}

.enhanced-search-input:focus + .search-icon-enhanced {
  color: var(--color-primary);
  transform: translateY(-50%) scale(1.1);
}

.clear-all-btn {
  position: absolute;
  top: 50%;
  right: 2.5rem;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1rem;
  cursor: pointer;
  padding: 0.2rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  z-index: 3;
}

.clear-all-btn:hover {
  color: var(--color-danger);
  background: rgba(239, 68, 68, 0.1);
  transform: translateY(-50%) scale(1.1);
}

/* Enhanced Suggestions Dropdown */
.search-suggestions-enhanced {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--glass-surface, rgba(255, 255, 255, 0.95));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.2));
  border-t: none;
  border-radius: 0 0 var(--border-radius-md, 8px) var(--border-radius-md, 8px);
  backdrop-filter: blur(var(--glass-backdrop-blur, 20px));
  -webkit-backdrop-filter: blur(var(--glass-backdrop-blur, 20px));
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 24rem;
  overflow-y: auto;
}

.suggestion-group {
  border-b: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
}

.suggestion-group:last-child {
  border-b: none;
}

.suggestion-group-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: var(--glass-elevated, rgba(255, 255, 255, 0.05));
}

.suggestion-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-primary-600);
  font-size: 0.9rem;
}

.suggestion-item:hover,
.suggestion-item.highlighted {
  background: var(--glass-elevated-light, rgba(255, 255, 255, 0.1));
  transform: translateX(2px);
}

.fuzzy-suggestion {
  border-l: 3px solid var(--color-primary);
}

.tag-suggestion {
  border-l: 3px solid var(--color-success);
}

.tag-suggestion.role {
  border-l-color: var(--color-primary);
}

.tag-suggestion.skill {
  border-l-color: var(--color-success);
}

.tag-suggestion.location {
  border-l-color: var(--color-info);
}

.tag-suggestion.experience {
  border-l-color: var(--color-warning);
}

.tag-suggestion.company {
  border-l-color: var(--color-secondary);
}

.suggestion-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.suggestion-text {
  font-weight: 500;
}

.suggestion-category {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: capitalize;
}

.suggestion-score {
  font-size: 0.75rem;
  color: var(--color-primary);
  font-weight: 600;
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
}

.tag-type-label {
  font-size: 0.7rem;
  color: var(--text-secondary);
  background: var(--glass-surface);
  padding: 0.15rem 0.4rem;
  border-radius: 8px;
  text-transform: capitalize;
}

/* Fuzzy Highlighting */
.fuzzy-highlight {
  background: linear-gradient(135deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 80%, white));
  color: white;
  padding: 0.1rem 0.2rem;
  border-radius: 3px;
  font-weight: 600;
}

/* Responsive Design */
@media (max-width: 768px) {
  .search-suggestions-enhanced {
    max-height: 20rem;
  }

  .selected-tags {
    right: 3rem;
  }

  .enhanced-search-input {
    padding: 0.6rem 3rem 0.6rem 0.8rem;
  }

  .enhanced-search-input.with-tags {
    min-height: 3rem;
  }
}

/* Accessibility and reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .enhanced-search-input,
  .search-tag,
  .suggestion-item,
  .tag-remove,
  .clear-all-btn {
    transition: none;
  }

  .enhanced-search-input:focus,
  .search-tag:hover,
  .suggestion-item:hover,
  .clear-all-btn:hover {
    transform: none;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .enhanced-search-input,
  .search-suggestions-enhanced {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background: var(--bg-primary-500);
    border-color: var(--border-primary);
  }

  .search-tag {
    backdrop-filter: none;
    background: var(--bg-secondary-500);
  }
}
</style>
