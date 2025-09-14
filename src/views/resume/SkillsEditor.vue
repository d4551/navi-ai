<template>
  <div
    class="skills-editor section-card section-card unified-card"
    :class="theme?.getThemeClasses?.('skills-editor')"
  >
    <!-- Header Section -->
    <div
      class="skills-header glass-elevated"
      :style="{
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-gray-200)',
        padding: 'var(--spacing-lg)',
        fontFamily: 'var(--font-family-primary)',
      }"
    >
      <div class="d-flex align-items-center justify-space-between">
        <div class="d-flex align-items-center gap-3">
          <AppIcon name="mdi-brain" size="24" />
          <div>
            <h3
              class="text-h6 mb-1"
              :style="{
                color: 'var(--color-on-surface)',
                fontFamily: 'var(--font-family-primary)',
                fontWeight: 'var(--font-weight-semibold)',
              }"
            >
              Professional Skills
            </h3>
            <p
              class="text-body-2 mb-0"
              :style="{ color: 'var(--color-gray-600)' }"
            >
              Showcase your technical and soft skills from your profile
            </p>
          </div>
        </div>

        <!-- Sync Status Indicator -->
        <UiChip
          :classes="`chip ${isDataSynced ? 'chip-success' : 'chip-warning'} chip-compact`"
        >
          <AppIcon
            :name="isDataSynced ? 'mdi-check-circle-outline' : 'mdi-sync'"
            size="16"
            class="me-2"
          />
          {{ isDataSynced ? "Synced with Profile" : "Syncing..." }}
        </UiChip>
      </div>
    </div>

    <!-- Skills Categories -->
    <div
      class="skills-content"
      :style="{
        padding: 'var(--spacing-lg)',
        backgroundColor: 'var(--color-background)',
      }"
    >
      <!-- Technical Skills -->
      <div class="skills-category mb-4">
        <div class="category-header mb-3">
          <h4
            class="text-subtitle-1 mb-2"
            :style="{
              color: 'var(--color-on-surface)',
              fontFamily: 'var(--font-family-primary)',
              fontWeight: 'var(--font-weight-medium)',
            }"
          >
            <AppIcon name="mdi-code-tags" size="20" class="me-2" />
            Technical Skills
            <UiChip classes="chip chip-primary chip-compact ms-2">
              {{ store.user.skills.technical.length }}
            </UiChip>
          </h4>

          <!-- Add New Technical Skill -->
          <div class="add-skill-input mb-3">
            <v-text-field
              v-model="newTechnicalSkill"
              label="Add Technical Skill"
              placeholder="e.g., JavaScript, Python, Unity"
              variant="outlined"
              density="compact"
              append-inner-icon="mdi-plus"
              :style="{
                '--v-field-input-color': 'var(--color-on-surface)',
                '--v-field-overlay-opacity': '0.04',
                fontFamily: 'var(--font-family-primary)',
              }"
              @click:append-inner="addSkill('technical', newTechnicalSkill)"
              @keyup.enter="addSkill('technical', newTechnicalSkill)"
            />
          </div>
        </div>

        <!-- Technical Skills Display -->
        <div class="skills-chips">
          <UiChip
            v-for="skill in store.user.skills.technical"
            :key="`tech-${skill}`"
            classes="chip chip-secondary chip-compact ma-1"
            closable
            @close="removeSkill('technical', skill)"
          >
            <AppIcon name="mdi-code-braces" size="16" class="me-2" />
            {{ skill }}
          </UiChip>

          <div
            v-if="store.user.skills.technical.length === 0"
            class="empty-state"
          >
            No technical skills added yet. Start by adding your programming
            languages, frameworks, or tools.
          </div>
        </div>
      </div>

      <!-- Soft Skills -->
      <div class="skills-category mb-4">
        <div class="category-header mb-3">
          <h4 class="text-subtitle-1 mb-2">
            <AppIcon name="mdi-account-heart" size="20" class="me-2" />
            Soft Skills
            <UiChip classes="chip chip-success chip-compact ms-2">
              {{ store.user.skills.soft.length }}
            </UiChip>
          </h4>

          <!-- Add New Soft Skill -->
          <div class="add-skill-input mb-3">
            <v-text-field
              v-model="newSoftSkill"
              label="Add Soft Skill"
              placeholder="e.g., Leadership, Communication, Problem Solving"
              variant="outlined"
              density="compact"
              append-inner-icon="mdi-plus"
              class="glass-input"
              @click:append-inner="addSkill('soft', newSoftSkill)"
              @keyup.enter="addSkill('soft', newSoftSkill)"
            />
          </div>
        </div>

        <!-- Soft Skills Display -->
        <div class="skills-chips">
          <UiChip
            v-for="skill in store.user.skills.soft"
            :key="`soft-${skill}`"
            classes="chip chip-success chip-compact ma-1"
            closable
            @close="removeSkill('soft', skill)"
          >
            <AppIcon name="mdi-account-heart" size="16" class="me-2" />
            {{ skill }}
          </UiChip>

          <div v-if="store.user.skills.soft.length === 0" class="empty-state">
            No soft skills added yet. Add interpersonal and professional skills.
          </div>
        </div>
      </div>

      <!-- Gaming Skills -->
      <div class="skills-category mb-4">
        <div class="category-header mb-3">
          <h4 class="text-subtitle-1 mb-2">
            <AppIcon name="mdi-gamepad-variant" size="20" class="me-2" />
            Gaming Skills
            <UiChip classes="chip chip-warning chip-compact ms-2">
              {{ store.user.skills.gaming.length }}
            </UiChip>
          </h4>

          <!-- Add New Gaming Skill -->
          <div class="add-skill-input mb-3">
            <v-text-field
              v-model="newGamingSkill"
              label="Add Gaming Skill"
              placeholder="e.g., Game Design, Esports, Community Management"
              variant="outlined"
              density="compact"
              append-inner-icon="mdi-plus"
              class="glass-input"
              @click:append-inner="addSkill('gaming', newGamingSkill)"
              @keyup.enter="addSkill('gaming', newGamingSkill)"
            />
          </div>
        </div>

        <!-- Gaming Skills Display -->
        <div class="skills-chips">
          <UiChip
            v-for="skill in store.user.skills.gaming"
            :key="`gaming-${skill}`"
            classes="chip chip-warning chip-compact ma-1"
            closable
            @close="removeSkill('gaming', skill)"
          >
            <AppIcon name="mdi-gamepad-variant" start size="16" />
            {{ skill }}
          </UiChip>

          <div v-if="store.user.skills.gaming.length === 0" class="empty-state">
            No gaming skills added yet. Add skills from your gaming experience
            and esports background.
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="skills-actions mt-4">
        <div>
          <UnifiedButton
            variant="outline"
            size="sm"
            leading-icon="mdi-sync"
            @click="syncWithProfile"
          >
            Sync with Profile
          </UnifiedButton>
        </div>

        <div class="skills-stats">
          <span class="text-muted small">
            Total Skills: {{ totalSkillsCount }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

import { ref, computed} from "vue";
import { useAppStore } from "@/stores/app";
import { useUnifiedTheme } from "@/shared/composables/useUnifiedTheme";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import UiChip from "@/components/ui/UiChip.vue";
import AppIcon from "@/components/ui/AppIcon.vue";

// Initialize composables
const store = useAppStore();
const _theme = (() => {
  try {
    return useUnifiedTheme();
  } catch {
    return undefined;
  }
})();

// Local state for new skill inputs
const newTechnicalSkill = ref("");
const newSoftSkill = ref("");
const newGamingSkill = ref("");

// Computed properties
const totalSkillsCount = computed(() => {
  return (
    store.user.skills.technical.length +
    store.user.skills.soft.length +
    store.user.skills.gaming.length +
    store.user.skills.tools.length +
    store.user.skills.frameworks.length +
    store.user.skills.languages.length
  );
});

const isDataSynced = computed(() => {
  // In a real implementation, this would check if the data has been saved to backend
  return true;
});

// Methods
const addSkill = (category, skill) => {
  if (!skill || !skill.trim()) return;

  const trimmedSkill = skill.trim();
  const skills = { ...store.user.skills };

  if (!skills[category].includes(trimmedSkill)) {
    skills[category].push(trimmedSkill);
    store.updateSkills(skills);

    // Clear input based on category
    switch (category) {
      case "technical":
        newTechnicalSkill.value = "";
        break;
      case "soft":
        newSoftSkill.value = "";
        break;
      case "gaming":
        newGamingSkill.value = "";
        break;
    }
  }
};

const removeSkill = (category, skill) => {
  const skills = { ...store.user.skills };
  const index = skills[category].indexOf(skill);

  if (index > -1) {
    skills[category].splice(index, 1);
    store.updateSkills(skills);
  }
};

const syncWithProfile = () => {
  // Force sync with profile data
  store.loadUserData();
};

// Initialize on mount
onMounted(() => {
  store.loadUserData();
});
</script>

<style scoped>
.skills-editor {
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  background: var(--color-surface);
}

.skills-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--glass-border);
}

.skills-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  min-height: 40px;
  align-items: flex-start;
}

.empty-state {
  width: 100%;
  border: 2px dashed var(--color-gray-300);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  text-align: center;
}

.skills-category {
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-gray-200);
  padding: var(--spacing-lg);
  background: var(--color-surface);
}

.skills-content {
  padding: var(--spacing-lg);
}

.add-skill-input {
  max-width: calc(var(--page-narrow-width) * 0.42);
}

[data-theme="dark"] .skills-editor {
  background: var(--color-surface);
}

[data-theme="dark"] .empty-state {
}

[data-theme="dark"] .skills-category {
  background: var(--color-surface-variant);
}

.skills-actions {
  padding-top: var(--spacing-lg);
  display: flex;
  gap: var(--spacing-md);
  justify-content: space-between;
}
</style>
