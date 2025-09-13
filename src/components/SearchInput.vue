<template>
  <div
    ref="searchContainer"
    class="position-relative search-input-container ui-input ui-size-md"
  >
    <!-- Main Search Input -->
    <div class="search-input-wrapper ui-input ui-size-md">
      <input
        ref="searchInput"
        :value="modelValue"
        :type="type"
        class="form-control glass-input enhanced-search-input ui-input ui-size-md"
        :class="[
          inputClass,
          {
            'with-tags': selectedTags.length > 0,
            'with-suggestions': showSuggestions,
          },
        ]"
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
            <AppIcon name="mdi-close-circle-outline" context="error" />
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
        <AppIcon name="mdi-close-circle-outline" context="error" />
      </button>
    </div>

    <!-- Fuzzy Search Suggestions -->
    <div
      v-if="
        showSuggestions &&
          (fuzzySuggestions.length > 0 || tagSuggestions.length > 0)
      "
      class="search-suggestions-enhanced"
      role="listbox"
      :aria-label="'Search suggestions'"
    >
      <!-- Fuzzy Match Results -->
      <div v-if="fuzzySuggestions.length > 0" class="suggestion-group">
        <div class="suggestion-group-header">
          <AppIcon name="mdi-magnify" />
          <span>Search Results</span>
        </div>
        <button
          v-for="(suggestion, index) in fuzzySuggestions.slice(0, 5)"
          :key="`fuzzy-${index}`"
          class="suggestion-item fuzzy-suggestion"
          :class="{ highlighted: highlightedIndex === index }"
          type="button"
          role="option"
          :aria-selected="highlightedIndex === index"
          @click="selectFuzzySuggestion(suggestion)"
          @mouseenter="highlightedIndex = index"
        >
          <div class="suggestion-content">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span
              class="suggestion-text"
              v-html="highlightMatch(suggestion.text, modelValue)"
            ></span>
            <span v-if="suggestion.category" class="suggestion-category">{{
              suggestion.category
            }}</span>
          </div>
          <div class="suggestion-score">
            {{ Math.round(suggestion.score * 100) }}%
          </div>
        </button>
      </div>

      <!-- Tag Suggestions -->
      <div v-if="tagSuggestions.length > 0" class="suggestion-group">
        <div class="suggestion-group-header">
          <AppIcon name="mdi-tag-multiple" />
          <span>Add Tags</span>
        </div>
        <button
          v-for="(tag, index) in tagSuggestions.slice(0, 4)"
          :key="`tag-${index}`"
          class="suggestion-item tag-suggestion"
          :class="[
            tag.type,
            {
              highlighted: highlightedIndex === fuzzySuggestions.length + index,
            },
          ]"
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
import {
  ref,
  onMounted,
  computed,
  onBeforeUnmount,
  nextTick,
  defineEmits,
  defineProps,
} from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: "",
  },
  type: {
    type: String,
    default: "text",
  },
  placeholder: {
    type: String,
    default: "Search with fuzzy matching and tags...",
  },
  ariaLabel: {
    type: String,
    default: "Enhanced search input with fuzzy matching",
  },
  icon: {
    type: String,
    default: "mdi mdi-magnify",
  },
  iconClass: {
    type: String,
    default: "text-muted",
  },
  iconStyle: {
    type: String,
    default: "right: 3rem;",
  },
  inputClass: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  // Enhanced fuzzy search props
  searchData: {
    type: Array,
    default: () => [],
  },
  searchKeys: {
    type: Array,
    default: () => ["name", "title", "description", "tags"],
  },
  enableFuzzy: {
    type: Boolean,
    default: true,
  },
  enableTags: {
    type: Boolean,
    default: true,
  },
  fuzzyThreshold: {
    type: Number,
    default: 0.3,
  },
  maxSuggestions: {
    type: Number,
    default: 8,
  },
});

const emit = defineEmits([
  "update:modelValue",
  "enter",
  "focus",
  "blur",
  "search",
  "tag-added",
  "tag-removed",
  "suggestion-selected",
]);

// Reactive state
const searchContainer = ref(null);
const searchInput = ref(null);
const selectedTags = ref([]);
const showSuggestions = ref(false);
const highlightedIndex = ref(-1);
const debounceTimer = ref(null);

// Fuzzy search implementation
const fuzzyMatch = (pattern, str, threshold = props.fuzzyThreshold) => {
  const patternLower = pattern.toLowerCase();
  const strLower = str.toLowerCase();

  // Exact match gets highest score
  if (strLower.includes(patternLower)) {
    return { score: 1.0, matches: [] };
  }

  // Fuzzy matching algorithm
  let score = 0;
  const matches = [];
  let patternIdx = 0;

  for (
    let i = 0;
    i < strLower.length && patternIdx < patternLower.length;
    i++
  ) {
    if (strLower[i] === patternLower[patternIdx]) {
      matches.push(i);
      patternIdx++;
      score += 1;
    }
  }

  if (patternIdx !== patternLower.length) {
    return null;
  }

  // Calculate final score
  score = (score / pattern.length) * (patternIdx / strLower.length);

  return score >= threshold ? { score, matches } : null;
};

// Computed suggestions
const fuzzySuggestions = computed(() => {
  if (!props.enableFuzzy || !props.modelValue || props.modelValue.length < 2) {
    return [];
  }

  const results = [];
  const query = props.modelValue.toString();

  for (const item of props.searchData) {
    for (const key of props.searchKeys) {
      if (item[key]) {
        const match = fuzzyMatch(query, item[key]);
        if (match) {
          results.push({
            ...item,
            text: item[key],
            score: match.score,
            matches: match.matches,
            searchKey: key,
            category: item.category || key,
          });
        }
      }
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, props.maxSuggestions);
});

// Available tag suggestions based on current input
const availableTagTypes = [
  {
    type: "role",
    icon: "mdi-briefcase",
    suggestions: [
      "Developer",
      "Designer",
      "Producer",
      "Artist",
      "QA",
      "Manager",
    ],
  },
  {
    type: "skill",
    icon: "mdi-star",
    suggestions: ["Unity", "Unreal", "C#", "JavaScript", "Python", "Blender"],
  },
  {
    type: "location",
    icon: "mdi-map-marker",
    suggestions: ["Remote", "San Francisco", "New York", "London", "Tokyo"],
  },
  {
    type: "experience",
    icon: "mdi-trending-up",
    suggestions: ["Entry", "Mid", "Senior", "Lead", "Principal"],
  },
  {
    type: "company",
    icon: "mdi-domain",
    suggestions: ["Indie", "AAA", "Startup", "Enterprise"],
  },
];

const tagSuggestions = computed(() => {
  if (!props.enableTags || !props.modelValue || props.modelValue.length < 2) {
    return [];
  }

  const query = props.modelValue.toString().toLowerCase();
  const suggestions = [];

  for (const tagType of availableTagTypes) {
    for (const suggestion of tagType.suggestions) {
      if (suggestion.toLowerCase().includes(query)) {
        // Don't suggest already selected tags
        const alreadySelected = selectedTags.value.some(
          (tag) => tag.label.toLowerCase() === suggestion.toLowerCase(),
        );

        if (!alreadySelected) {
          suggestions.push({
            type: tagType.type,
            label: suggestion,
            icon: tagType.icon,
          });
        }
      }
    }
  }

  return suggestions.slice(0, 4);
});

// Methods
const handleInput = (event) => {
  const value = event.target.value;
  emit("update:modelValue", value);

  // Debounced search
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value);
  }

  debounceTimer.value = setTimeout(() => {
    if (value.length >= 2) {
      showSuggestions.value = true;
      highlightedIndex.value = -1;
    } else {
      showSuggestions.value = false;
    }

    emit("search", {
      query: value,
      tags: selectedTags.value,
      suggestions: fuzzySuggestions.value,
    });
  }, 300);
};

const handleKeyDown = (event) => {
  if (!showSuggestions.value) {
    return;
  }

  const totalSuggestions =
    fuzzySuggestions.value.length + tagSuggestions.value.length;

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      highlightedIndex.value = Math.min(
        highlightedIndex.value + 1,
        totalSuggestions - 1,
      );
      break;
    case "ArrowUp":
      event.preventDefault();
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1);
      break;
    case "Enter":
      event.preventDefault();
      if (highlightedIndex.value >= 0) {
        if (highlightedIndex.value < fuzzySuggestions.value.length) {
          selectFuzzySuggestion(fuzzySuggestions.value[highlightedIndex.value]);
        } else {
          const tagIndex =
            highlightedIndex.value - fuzzySuggestions.value.length;
          addTag(tagSuggestions.value[tagIndex]);
        }
      } else {
        emit("enter", props.modelValue);
      }
      break;
    case "Escape":
      showSuggestions.value = false;
      highlightedIndex.value = -1;
      break;
  }
};

const handleFocus = (event) => {
  emit("focus", event);
  if (props.modelValue && props.modelValue.length >= 2) {
    showSuggestions.value = true;
  }
};

const handleBlur = (event) => {
  // Delay hiding suggestions to allow clicking on them
  setTimeout(() => {
    showSuggestions.value = false;
    highlightedIndex.value = -1;
  }, 150);
  emit("blur", event);
};

const selectFuzzySuggestion = (suggestion) => {
  emit("update:modelValue", suggestion.text);
  emit("suggestion-selected", suggestion);
  showSuggestions.value = false;
  highlightedIndex.value = -1;
};

const addTag = (tag) => {
  selectedTags.value.push(tag);
  emit("tag-added", { tag, tags: selectedTags.value });
  emit("update:modelValue", "");
  showSuggestions.value = false;
  highlightedIndex.value = -1;

  nextTick(() => {
    searchInput.value?.focus();
  });
};

const removeTag = (index) => {
  const removedTag = selectedTags.value.splice(index, 1)[0];
  emit("tag-removed", { tag: removedTag, tags: selectedTags.value });

  nextTick(() => {
    searchInput.value?.focus();
  });
};

const clearAll = () => {
  emit("update:modelValue", "");
  selectedTags.value = [];
  showSuggestions.value = false;
  highlightedIndex.value = -1;

  nextTick(() => {
    searchInput.value?.focus();
  });
};

const getTagIcon = (tagType) => {
  const tagTypeMap = availableTagTypes.find((t) => t.type === tagType);
  return tagTypeMap?.icon || "mdi-tag";
};

const highlightMatch = (text, query) => {
  if (!query) {
    return text;
  }

  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, '<mark class="fuzzy-highlight">$1</mark>');
};

// Cleanup
onBeforeUnmount(() => {
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value);
  }
});
</script>

<style scoped>
.search-input-container {
  position: relative;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
}

.enhanced-search-input {
}

.enhanced-search-input.with-tags {
}

.enhanced-search-input.with-suggestions {
  border-bottom-color: transparent;
}

.enhanced-search-input:focus {
  outline: none;
}

.enhanced-search-input::placeholder {
}

.selected-tags {
  position: absolute;
  display: flex;
  flex-wrap: wrap;
  pointer-events: none;
}

.search-tag {
  display: inline-flex;
  align-items: center;
  pointer-events: auto;
}

.search-tag:hover {
}

.search-tag.role {
  color: var(--color-primary);
}

.search-tag.skill {
  color: var(--color-success);
}

.search-tag.location {
  color: var(--color-info);
}

.search-tag.experience {
  color: var(--color-warning);
}

.search-tag.company {
  color: var(--color-secondary);
}

.tag-remove {
  background: none;
  border: none;
  color: currentColor;
  cursor: pointer;
}

.tag-remove:hover {
}

.search-icon-enhanced {
  position: absolute;
  color: var(--text-muted);
}

.enhanced-search-input:focus + .search-icon-enhanced {
  color: var(--color-primary);
}

.clear-all-btn {
  position: absolute;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
}

.clear-all-btn:hover {
  color: var(--color-danger);
}

.search-suggestions-enhanced {
  position: absolute;
  border-top: none;
  overflow-y: auto;
}

.suggestion-group {
}

.suggestion-group:last-child {
  border-bottom: none;
}

.suggestion-group-header {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.suggestion-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  color: var(--text-primary);
}

.suggestion-item:hover,
.suggestion-item.highlighted {
}

.fuzzy-suggestion {
}

.tag-suggestion {
}

.tag-suggestion.role {
  border-left-color: var(--color-primary);
}

.tag-suggestion.skill {
  border-left-color: var(--color-success);
}

.tag-suggestion.location {
  border-left-color: var(--color-info);
}

.tag-suggestion.experience {
  border-left-color: var(--color-warning);
}

.tag-suggestion.company {
  border-left-color: var(--color-secondary);
}

.suggestion-content {
  display: flex;
  flex-direction: column;
}

.suggestion-text {
}

.suggestion-category {
  color: var(--text-muted);
  text-transform: capitalize;
}

.suggestion-score {
  color: var(--color-primary);
}

.tag-type-label {
  color: var(--text-muted);
  background: var(--glass-surface);
  text-transform: capitalize;
}

.fuzzy-highlight {
  background: linear-gradient(
    var(--color-primary),
  );
  color: white;
}

  .search-suggestions-enhanced {
  }

  .selected-tags {
  }

  .enhanced-search-input {
  }

  .enhanced-search-input.with-tags {
  }
}

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
    background: var(--bg-primary);
    border-color: var(--border-primary);
  }

  .search-tag {
    backdrop-filter: none;
    background: var(--bg-secondary);
  }
}
</style>
