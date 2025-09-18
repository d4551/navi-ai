<template>
  <div ref="container" class="multi-select" :class="{ open: isOpen }">
    <div class="multi-select-trigger" @click="toggleDropdown">
      <div class="selected-items">
        <span v-if="selectedItems.length === 0" class="placeholder">
          {{ placeholder }}
        </span>
        <div v-else class="selected-tags">
          <span
            v-for="item in selectedItems.slice(0, maxDisplay)"
            :key="item.value"
            class="selected-tag"
          >
            {{ item.label }}
            <button
              :aria-label="`Remove ${item.label}`"
              class="remove-btn"
              @click.stop="removeItem(item)"
            >
              <Icon name="close" size="12" />
            </button>
          </span>
          <span v-if="selectedItems.length > maxDisplay" class="more-count">
            +{{ selectedItems.length - maxDisplay }} more
          </span>
        </div>
      </div>
      <Icon name="chevron-down" class="dropdown-icon" />
    </div>

    <div v-if="isOpen" class="multi-select-dropdown">
      <div v-if="searchable" class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search options..."
          class="search-input"
          @click.stop
        />
      </div>
      <div class="options-list">
        <label
          v-for="option in filteredOptions"
          :key="option.value"
          class="option-item"
          :class="{ selected: isSelected(option) }"
        >
          <input
            :checked="isSelected(option)"
            type="checkbox"
            class="option-checkbox"
            @change="toggleOption(option)"
          />
          <span class="option-label">{{ option.label }}</span>
        </label>
        <div v-if="filteredOptions.length === 0" class="no-options">
          No options found
        </div>
      </div>
      <div v-if="selectedItems.length > 0" class="dropdown-actions">
        <button class="clear-all-btn" @click="clearAll">Clear All</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Icon from './Icon.vue'

interface Option {
  label: string
  value: string | number
}

interface Props {
  modelValue: (string | number)[]
  options: Option[]
  placeholder?: string
  searchable?: boolean
  maxDisplay?: number
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select options...',
  searchable: true,
  maxDisplay: 3,
})

const emit = defineEmits<{
  'update:modelValue': [value: (string | number)[]]
}>()

const isOpen = ref(false)
const searchQuery = ref('')
const container = ref<HTMLElement>()

const selectedItems = computed(() =>
  props.options.filter(option => props.modelValue.includes(option.value))
)

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) {
    return props.options
  }
  return props.options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const isSelected = (option: Option) => {
  return props.modelValue.includes(option.value)
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
  }
}

const toggleOption = (option: Option) => {
  const newValue = [...props.modelValue]
  const index = newValue.indexOf(option.value)

  if (index > -1) {
    newValue.splice(index, 1)
  } else {
    newValue.push(option.value)
  }

  emit('update:modelValue', newValue)
}

const removeItem = (option: Option) => {
  const newValue = props.modelValue.filter(value => value !== option.value)
  emit('update:modelValue', newValue)
}

const clearAll = () => {
  emit('update:modelValue', [])
}

const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (container.value && target && !container.value.contains(target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.multi-select {
  position: relative;
  width: 100%;
}

.multi-select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 2.5rem;
}

.multi-select-trigger:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.multi-select.open .multi-select-trigger {
  border-color: rgba(124, 58, 237, 0.5);
  background: rgba(255, 255, 255, 0.08);
}

.selected-items {
  flex: 1;
  display: flex;
  align-items: center;
}

.placeholder {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
}

.selected-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.selected-tag {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(124, 58, 237, 0.2);
  border: 1px solid rgba(124, 58, 237, 0.3);
  border-radius: 1rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  color: var(--text-primary, #ffffff);
}

.remove-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.remove-btn:hover {
  color: var(--text-on-primary);
}

.more-count {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
}

.dropdown-icon {
  color: rgba(255, 255, 255, 0.5);
  transition: transform 0.2s ease;
}

.multi-select.open .dropdown-icon {
  transform: rotate(180deg);
}

.multi-select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  margin-top: 0.25rem;
  z-index: 50;
  max-height: 300px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.search-container {
  padding: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.search-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.25rem;
  padding: 0.5rem;
  color: var(--text-primary, #ffffff);
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
  border-color: rgba(124, 58, 237, 0.5);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.options-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.option-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.option-item.selected {
  background: rgba(124, 58, 237, 0.1);
  color: rgba(124, 58, 237, 1);
}

.option-checkbox {
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  cursor: pointer;
}

.option-checkbox:checked {
  background: #7c3aed;
  border-color: var(--color-primary-600);
}

.option-label {
  flex: 1;
  font-size: 0.875rem;
  color: var(--text-primary, #ffffff);
}

.no-options {
  padding: 1rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
}

.dropdown-actions {
  padding: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.clear-all-btn {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.25rem;
  padding: 0.5rem 1rem;
  color: var(--color-danger-500);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-all-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
}
</style>
