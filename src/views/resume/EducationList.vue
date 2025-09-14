<template>
  <v-card
    variant="outlined"
    class="mb-4 section-card section-card unified-card"
  >
    <v-card-title class="d-flex align-center justify-space-between pa-4">
      <div class="d-flex align-center ga-2">
        <AppIcon name="mdi-school-outline" size="small" color="primary" />
        <span class="text-h6">Education</span>
      </div>
      <UnifiedButton
        variant="primary"
        size="sm"
        leading-icon="mdi-plus"
        @click="add"
      >
        <span class="d-sm-none">Add</span>
        <span class="d-none d-sm-inline">Add Education</span>
      </UnifiedButton>
    </v-card-title>

    <div class="card-content-sm">
      <v-card
        v-for="(edu, index) in localItems"
        :key="index"
        variant="outlined"
        class="mb-3 glass-elevated"
        role="listitem"
        :aria-labelledby="`education-${index}-title`"
        :aria-grabbed="
          (
            dragState.active &&
            dragState.type === 'education' &&
            dragState.from === index
          ).toString()
        "
        draggable="true"
        :class="{
          'drag-over':
            dragOver.type === 'education' && dragOver.index === index,
        }"
        @dragstart="startDrag('education', index)"
        @dragover.prevent="onDragOver($event, 'education', index)"
        @drop="onDrop('education', index)"
        @dragend="endDrag"
      >
        <v-card-title class="d-flex justify-space-between align-start pa-3">
          <UiChip
            :id="`education-${index}-title`"
            classes="chip chip-primary chip-compact"
          >
            Education #{{ index + 1 }}
          </UiChip>
          <div class="d-flex align-center ga-1">
            <UnifiedButton
              icon-only
              size="sm"
              variant="outline"
              icon="mdi-drag-vertical"
              aria-label="Drag to reorder"
              class="drag-handle"
            />
            <div class="d-inline-flex ga-1">
              <UnifiedButton
                :disabled="index === 0"
                icon-only
                size="sm"
                variant="outline"
                icon="mdi-arrow-up"
                aria-label="Move up"
                @click="move(index, index - 1)"
              />
              <UnifiedButton
                :disabled="index === localItems.length - 1"
                icon-only
                size="sm"
                variant="outline"
                icon="mdi-arrow-down"
                aria-label="Move down"
                @click="move(index, index + 1)"
              />
            </div>
            <UnifiedButton
              icon-only
              size="sm"
              variant="outline"
              icon="mdi-trash-can-outline"
              :aria-label="`Remove education ${index + 1}`"
              @click="remove(index)"
            />
          </div>
        </v-card-title>

        <div class="pa-3-unified">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="edu.degree"
                label="Degree"
                variant="outlined"
                density="compact"
                placeholder="e.g., Bachelor of Science"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="edu.school"
                label="School/Institution"
                variant="outlined"
                density="compact"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="edu.year"
                label="Year"
                variant="outlined"
                density="compact"
                placeholder="e.g., 2020"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="edu.gpa"
                label="GPA (Optional)"
                variant="outlined"
                density="compact"
                placeholder="e.g., 3.8"
              />
            </v-col>
          </v-row>
        </div>
      </v-card>

      <v-empty-state
        v-if="localItems.length === 0"
        icon="mdi-school-outline"
        title="No education added yet"
        text="Click 'Add Education' to include your academic background"
      />
    </div>
  </v-card>
</template>

<script>
import { watch, reactive } from 'vue';

import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import UiChip from "@/components/ui/UiChip.vue";

import { reactive, watch } from "vue";
import { useDragReorderList } from "@/composables/useDragReorderList";

export default {
  name: "EducationList",
  components: { AppIcon, UnifiedButton, UiChip },
  props: {
    modelValue: { type: Array, default: () => [] },
  },
  emits: ["update:modelValue"],
  setup(_props, { emit }) {
    const localItems = reactive([...(props.modelValue || [])]);
    watch(
      () => props.modelValue,
      (v) => {
        localItems.splice(0, localItems.length, ...(v || []));
      },
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

    const commit = () =>
      emit(
        "update:modelValue",
        localItems.map((i) => ({ ...i })),
      );
    const add = () => {
      localItems.push({ degree: "", school: "", year: "", gpa: "" });
      commit();
    };
    const remove = (index) => {
      localItems.splice(index, 1);
      commit();
    };
    const move = (from, to) => {
      moveItem("education", from, to);
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
