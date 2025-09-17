<template>
  <v-card variant="outlined" class="mb-4 section-card section-card unified-card font-sans">
    <v-card-title class="flex items-center justify-space-between pa-4">
      <div class="flex items-center gap-glass-sm">
        <AppIcon name="BriefcaseIcon" size="small" color="primary" />
        <span class="text-lg font-semibold">Professional Experience</span>
      </div>
      <UnifiedButton
        variant="primary"
        size="sm"
        leading-icon="PlusIcon"
        @click="add"
      >
        <span class="d-sm-none">Add</span>
        <span class="hidden d-sm-inline">Add Experience</span>
      </UnifiedButton>
    </v-card-title>
    
    <div class="card-content-sm">
      <v-card
        v-for="(exp, index) in localItems"
        :key="index"
        variant="outlined"
        class="mb-3 glass-elevated"
        role="listitem"
        :aria-labelledby="`work-exp-${index}-title`"
        :aria-grabbed="
          (
            dragState.active &&
            dragState.type === 'experience' &&
            dragState.from === index
          ).toString()
        "
        draggable="true"
        :class="{ 'drag-over': dragOver.type === 'experience' && dragOver.index === index,
        }"
        @dragstart="startDrag('experience', index)"
        @dragover.prevent="onDragOver($event, 'experience', index)"
        @drop="onDrop('experience', index)"
        @dragend="endDrag"
      >
        <v-card-title class="flex justify-space-between align-start pa-3">
          <UiChip
            :id="`work-exp-${index}-title`"
            classes="chip chip-primary chip-compact"
          >
            Work Experience #{{ index + 1 }}
          </UiChip>
          <div class="flex items-center ga-1">
            <UnifiedButton
              icon-only
              size="sm"
              variant="outline"
              icon="Bars3Icon"
              aria-label="Drag to reorder"
              class="drag-handle"
            />
            <div class="inline-flex ga-1">
              <UnifiedButton
                :disabled="index === 0"
                icon-only
                size="sm"
                variant="outline"
                icon="ArrowUpIcon"
                aria-label="Move up"
                @click="move(index, index - 1)"
              />
              <UnifiedButton
                :disabled="index === localItems.length - 1"
                icon-only
                size="sm"
                variant="outline"
                icon="ArrowDownIcon"
                aria-label="Move down"
                @click="move(index, index + 1)"
              />
            </div>
            <UnifiedButton
              icon-only
              size="sm"
              variant="outline"
              icon="TrashIcon"
              :aria-label="`Remove work experience ${index + 1}`"
              @click="remove(index)"
            />
          </div>
        </v-card-title>
        
        <div class="pa-3-unified">
          <v-flex flex-wrap>
            <v-flex-1 cols="12" md="6">
              <v-text-field
                v-model="exp.title"
                label="Job Title"
                variant="outlined"
                density="compact"
              />
            </v-flex-1>
            <v-flex-1 cols="12" md="6">
              <v-text-field
                v-model="exp.company"
                label="Company"
                variant="outlined"
                density="compact"
              />
            </v-flex-1>
            <v-flex-1 cols="12" md="6">
              <v-text-field
                v-model="exp.startDate"
                label="Start Date"
                variant="outlined"
                density="compact"
                placeholder="e.g., Jan 2023"
              />
            </v-flex-1>
            <v-flex-1 cols="12" md="6">
              <v-text-field
                v-model="exp.endDate"
                label="End Date"
                variant="outlined"
                density="compact"
                placeholder="e.g., Present"
              />
            </v-flex-1>
            <v-flex-1 cols="12">
              <v-textarea
                v-model="exp.description"
                label="Job Description"
                variant="outlined"
                rows="4"
                placeholder="Job responsibilities and achievements..."
              />
              <div class="flex justify-end mt-2">
                <UnifiedButton
                  v-if="exp.description"
                  variant="outline"
                  color="secondary"
                  size="sm"
                  :loading="copyingIndex === index"
                  :leading-icon="copyingIndex === index ? 'mdi-clipboard-check-outline' : 'mdi-clipboard-outline'"
                  @click="$emit('copy-experience', index)"
                >
                  {{ copyingIndex === index ? "Copied" : "Copy" }}
                </UnifiedButton>
              </div>
            </v-flex-1>
          </v-flex flex-wrap>
        </div>
      </v-card>

      <v-empty-state
        v-if="localItems.length === 0"
        icon="BriefcaseIcon"
        title="No work experience added yet"
        text="Click 'Add Experience' to include your professional background"
      />
    </div>
  </v-card>
</template>

<script>
import { ArrowDownIcon, ArrowUpIcon, Bars3Icon, BriefcaseIcon, PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'

import AppIcon from '@/components/ui/AppIcon.vue';
import UiChip from '@/components/ui/UiChip.vue';
import UnifiedButton from '@/components/ui/UnifiedButton.vue';

import { reactive, watch } from 'vue'
import { useDragReorderList } from "@/composables/useDragReorderList";
import { useUserProfile } from "@/composables/useUserProfile";

export default {
  name: "ExperienceList",
  components: { AppIcon, UnifiedButton, UiChip },
  props: {
    modelValue: { type: Array, default: () => [] },
    copyingIndex: { type: Number, default: null },
  },
  emits: ["update:modelValue", "copy-experience"],
  setup(_props, { emit }) {
    const { experience, updateExperience } = useUserProfile();

    // Prioritize the user profile as the source of truth.
    const localItems = reactive([]);

    // Watch for profile experience changes and sync with local state
    watch(
      experience,
      (newExperience) => {
        const items = Array.isArray(newExperience) ? newExperience : [];
        localItems.splice(0, localItems.length, ...items);
      },
      { deep: true, immediate: true } // immediate: true runs the watcher on component load
    );

    const listResolver = () => localItems;
    const {
      dragState,
      dragOver,
      startDrag,
      onDragOver,
      onDrop,
      endDrag,
      moveItem,
    } = useDragReorderList(listResolver);

    const commit = async () => {
      const experienceData = localItems.map((i) => ({ ...i }));
      emit("update:modelValue", experienceData);
      // Also update the global profile
      await updateExperience(experienceData);
    };

    const add = () => {
      localItems.push({
        title: "",
        company: "",
        startDate: "",
        endDate: "",
        description: "",
      });
      commit();
    };
    const remove = (index) => {
      localItems.splice(index, 1);
      commit();
    };
    const move = (from, to) => {
      moveItem("experience", from, to);
      commit();
    };

    return {
      localItems,
      dragState,
      dragOver,
      startDrag,
      onDragOver,
      onDrop,
      endDrag,
      move,
      add,
      remove,
    };
  },
};
</script>
