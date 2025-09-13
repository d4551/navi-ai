<template>
  <div class="skill-picker">
    <div class="skill-input-container">
      <input
        ref="inputRef"
        v-model="inputValue"
        type="text"
        class="skill-input"
        :placeholder="placeholder"
        @input="handleInput"
        @keydown="handleKeydown"
        @focus="showSuggestions = true"
      />
      <button
        v-if="inputValue"
        :aria-label="'Clear input'"
        class="clear-input-btn"
        @click="clearInput"
      >
        <Icon name="close" size="14" />
      </button>
    </div>

    <!-- Selected Skills -->
    <div v-if="selectedSkills.length > 0" class="selected-skills">
      <span v-for="skill in selectedSkills" :key="skill" class="skill-tag">
        {{ skill }}
        <button
          :aria-label="`Remove ${skill}`"
          class="remove-skill-btn"
          @click="removeSkill(skill)"
        >
          <Icon name="close" size="12" />
        </button>
      </span>
    </div>

    <!-- Suggestions Dropdown -->
    <div
      v-if="showSuggestions && (filteredSuggestions.length > 0 || canAddCustom)"
      class="suggestions-dropdown"
    >
      <div class="suggestions-list">
        <!-- Existing Skills -->
        <button
          v-for="skill in filteredSuggestions"
          :key="skill"
          class="suggestion-item"
          :class="{
            highlighted:
              highlightedIndex === filteredSuggestions.indexOf(skill),
          }"
          @click="selectSkill(skill)"
        >
          <Icon name="tag" size="14" />
          <span>{{ skill }}</span>
          <span class="suggestion-type">existing</span>
        </button>

        <!-- Add Custom Skill -->
        <button
          v-if="canAddCustom"
          class="suggestion-item custom-skill"
          :class="{
            highlighted: highlightedIndex === filteredSuggestions.length,
          }"
          @click="selectSkill(inputValue.trim())"
        >
          <Icon name="plus" size="14" />
          <span>Add "{{ inputValue.trim() }}"</span>
          <span class="suggestion-type">new</span>
        </button>
      </div>

      <div
        v-if="maxSelections && selectedSkills.length >= maxSelections"
        class="max-reached"
      >
        Maximum {{ maxSelections }} skills allowed
      </div>
    </div>

    <!-- Popular Skills (when no input) -->
    <div
      v-if="!inputValue && !showSuggestions && popularSkills.length > 0"
      class="popular-skills"
    >
      <div class="popular-skills-label">Popular skills:</div>
      <div class="popular-skills-list">
        <button
          v-for="skill in popularSkills.slice(0, 8)"
          :key="skill"
          :disabled="
            selectedSkills.includes(skill) ||
              Boolean(maxSelections && selectedSkills.length >= maxSelections)
          "
          class="popular-skill-btn"
          @click="selectSkill(skill)"
        >
          {{ skill }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from "vue";
import Icon from "./Icon.vue";

interface Props {
  modelValue: string[];
  availableSkills?: string[];
  placeholder?: string;
  maxSelections?: number;
  allowCustom?: boolean;
  popularSkills?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  availableSkills: () => [],
  placeholder: "Type to add skills...",
  maxSelections: undefined,
  allowCustom: true,
  popularSkills: () => [
    "JavaScript",
    "TypeScript",
    "Python",
    "React",
    "Vue.js",
    "Node.js",
    "Unity",
    "C#",
    "Game Design",
    "UI/UX",
  ],
});

const emit = defineEmits<{
  "update:modelValue": [value: string[]];
}>();

const inputRef = ref<HTMLInputElement>();
const inputValue = ref("");
const showSuggestions = ref(false);
const highlightedIndex = ref(-1);

const selectedSkills = computed(() => props.modelValue);

const filteredSuggestions = computed(() => {
  if (!inputValue.value.trim()) return [];

  const query = inputValue.value.toLowerCase().trim();
  return props.availableSkills
    .filter(
      (skill) =>
        skill.toLowerCase().includes(query) &&
        !selectedSkills.value.includes(skill),
    )
    .slice(0, 5);
});

const canAddCustom = computed(() => {
  if (!props.allowCustom || !inputValue.value.trim()) return false;

  const trimmedValue = inputValue.value.trim();
  return (
    !selectedSkills.value.includes(trimmedValue) &&
    !props.availableSkills.includes(trimmedValue) &&
    (!props.maxSelections || selectedSkills.value.length < props.maxSelections)
  );
});

const totalSuggestions = computed(() => {
  return filteredSuggestions.value.length + (canAddCustom.value ? 1 : 0);
});

const handleInput = () => {
  highlightedIndex.value = -1;
  showSuggestions.value = true;
};

const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      highlightedIndex.value = Math.min(
        highlightedIndex.value + 1,
        totalSuggestions.value - 1,
      );
      break;
    case "ArrowUp":
      event.preventDefault();
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1);
      break;
    case "Enter":
      event.preventDefault();
      if (highlightedIndex.value >= 0) {
        if (highlightedIndex.value < filteredSuggestions.value.length) {
          selectSkill(filteredSuggestions.value[highlightedIndex.value]);
        } else if (canAddCustom.value) {
          selectSkill(inputValue.value.trim());
        }
      } else if (canAddCustom.value) {
        selectSkill(inputValue.value.trim());
      }
      break;
    case "Escape":
      showSuggestions.value = false;
      highlightedIndex.value = -1;
      break;
    case "Backspace":
      if (!inputValue.value && selectedSkills.value.length > 0) {
        removeSkill(selectedSkills.value[selectedSkills.value.length - 1]);
      }
      break;
  }
};

const selectSkill = (skill: string) => {
  if (!skill || selectedSkills.value.includes(skill)) return;
  if (props.maxSelections && selectedSkills.value.length >= props.maxSelections)
    return;

  const newSkills = [...selectedSkills.value, skill];
  emit("update:modelValue", newSkills);

  inputValue.value = "";
  showSuggestions.value = false;
  highlightedIndex.value = -1;

  nextTick(() => {
    inputRef.value?.focus();
  });
};

const removeSkill = (skill: string) => {
  const newSkills = selectedSkills.value.filter((s) => s !== skill);
  emit("update:modelValue", newSkills);
};

const clearInput = () => {
  inputValue.value = "";
  showSuggestions.value = false;
  inputRef.value?.focus();
};

const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".skill-picker")) {
    showSuggestions.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.skill-picker {
  position: relative;
  width: 100%;
}

.skill-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.skill-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 0.75rem;
  padding-right: 2.5rem;
  color: var(--text-primary, #ffffff);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.skill-input:focus {
  outline: none;
  border-color: rgba(124, 58, 237, 0.5);
  background: rgba(255, 255, 255, 0.08);
}

.skill-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.clear-input-btn {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.clear-input-btn:hover {
  color: var(--text-primary, #ffffff);
}

.selected-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.skill-tag {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(124, 58, 237, 0.2);
  border: 1px solid rgba(124, 58, 237, 0.3);
  border-radius: 1rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  color: var(--text-primary, #ffffff);
  animation: skillFadeIn 0.2s ease;
}

.remove-skill-btn {
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

.remove-skill-btn:hover {
  color: var(--text-primary, #ffffff);
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  margin-top: 0.25rem;
  z-index: 50;
  overflow: hidden;
}

.suggestions-list {
  max-height: 200px;
  overflow-y: auto;
}

.suggestion-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: none;
  border: none;
  color: var(--text-primary, #ffffff);
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.suggestion-item:hover,
.suggestion-item.highlighted {
  background: rgba(255, 255, 255, 0.05);
}

.suggestion-item.custom-skill {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(124, 58, 237, 1);
}

.suggestion-type {
  margin-left: auto;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.max-reached {
  padding: 0.75rem;
  text-align: center;
  color: rgba(255, 165, 0, 0.8);
  font-size: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.popular-skills {
  margin-top: 1rem;
}

.popular-skills-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.popular-skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.popular-skill-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 0.375rem 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.popular-skill-btn:hover:not(:disabled) {
  background: rgba(124, 58, 237, 0.2);
  border-color: rgba(124, 58, 237, 0.3);
  color: var(--text-primary, #ffffff);
}

.popular-skill-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes skillFadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
