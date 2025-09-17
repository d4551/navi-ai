<template>
  <section class="mb-4 font-sans">
    <div
      class="section-header flex items-center justify-between mb-3"
    >
      <div class="flex items-center">
        <AppIcon name="StarIcon" color="primary" aria-hidden="true" />
        <h2 class="h6 text-primary-600 mb-0 font-semibold">Additional Experience</h2>
      </div>
      <div class="flex gap-glass-sm flex-wrap">
        <select
          class="form-select form-select-sm glass-input select-auto-width"
          :value="typeSelection"
          @change="$emit('update:typeSelection', $event.target.value)"
        >
          <option value="projects">Projects</option>
          <option value="volunteer">Volunteer Work</option>
          <option value="certifications">Certifications</option>
          <option value="awards">Awards & Honors</option>
          <option value="publications">Publications</option>
          <option value="custom">Custom</option>
        </select>
        <button
          class="btn btn-sm btn-primary ui-btn ui-size-md"
          aria-label="Add new additional experience entry"
          @click="add()"
        >
          <AppIcon name="PlusIcon" class="mr-1" />
          <span class="hidden d-sm-inline">Add</span>
        </button>
      </div>
    </div>

    <div class="mb-3">
      <small class="text-secondary">Choose experience type above, then add relevant entries below</small>
    </div>

    <div
      v-for="(exp, index) in localItems"
      :key="index"
      class="surface-glass border rounded p-glass-md mb-3"
      role="listitem"
      :aria-labelledby="`additional-exp-${index}-title`"
      :aria-grabbed="
        (
          dragState.active &&
          dragState.type === 'additional' &&
          dragState.from === index
        ).toString()
      "
      draggable="true"
      :class="{ 'drag-over': dragOver.type === 'additional' && dragOver.index === index,
      }"
      @dragstart="startDrag('additional', index)"
      @dragover.prevent="onDragOver($event, 'additional', index)"
      @drop="onDrop('additional', index)"
      @dragend="endDrag"
    >
      <div class="flex justify-between items-start mb-3">
        <small
          :id="`additional-exp-${index}-title`"
          class="badge badge-secondary"
        >{{ exp.type || "Experience" }} #{{ index + 1 }}</small>
        <div class="flex items-center gap-glass-xs">
          <button
            class="btn btn-sm btn-outline-secondary drag-handle ui-btn ui-size-md"
            type="button"
            title="Drag to reorder"
            aria-label="Drag to reorder additional experience"
          >
            <AppIcon name="Bars3Icon" />
          </button>
          <div class="btn-group btn-group-sm" role="group">
            <button
              class="btn btn-outline-secondary"
              :disabled="index === 0"
              title="Move up"
              aria-label="Move up"
              @click="move(index, index - 1)"
            >
              <AppIcon name="ArrowUpIcon" />
            </button>
            <button
              class="btn btn-outline-secondary"
              :disabled="index === localItems.length - 1"
              title="Move down"
              aria-label="Move down"
              @click="move(index, index + 1)"
            >
              <AppIcon name="ArrowDownIcon" />
            </button>
          </div>
          <button
            class="btn btn-sm btn-outline-danger ui-btn ui-size-md"
            :aria-label="`Remove additional experience ${index + 1}`"
            @click="remove(index)"
          >
            <AppIcon name="TrashIcon" />
          </button>
        </div>
      </div>
      <div class="flex flex-wrap g-3">
        <div class="flex-1-md-6">
          <div class="form-floating">
            <input
              v-model="exp.title"
              type="text"
              class="form-control glass-input"
              :placeholder="ph(exp.type, 'title')"
            />
            <label>Title</label>
          </div>
        </div>
        <div class="flex-1-md-6">
          <div class="form-floating">
            <input
              v-model="exp.organization"
              type="text"
              class="form-control glass-input"
              :placeholder="ph(exp.type, 'organization')"
            />
            <label>Organization</label>
          </div>
        </div>
        <div class="flex-1-md-6">
          <div class="form-floating">
            <input
              v-model="exp.startDate"
              type="text"
              class="form-control glass-input"
              :placeholder="ph(exp.type, 'startDate')"
            />
            <label>Start Date</label>
          </div>
        </div>
        <div class="flex-1-md-6">
          <div class="form-floating">
            <input
              v-model="exp.endDate"
              type="text"
              class="form-control glass-input"
              :placeholder="ph(exp.type, 'endDate')"
            />
            <label>End Date</label>
          </div>
        </div>
        <div class="flex-1-12">
          <div class="form-floating">
            <textarea
              v-model="exp.description"
              class="form-control glass-input u-min-h-80"
              rows="3"
              :placeholder="ph(exp.type, 'description')"
            />
            <label>Description</label>
          </div>
        </div>
      </div>
    </div>

    <div v-if="localItems.length === 0" class="text-center py-4">
      <AppIcon name="FolderIcon" class="display-4 mb-3 opacity-50 text-secondary" />
      <p class="text-secondary mb-2">No additional experience added yet</p>
      <small class="text-secondary">Click "Add" to showcase your projects, certifications, and more</small>
    </div>
  </section>
</template>

<script>
import { ArrowDownIcon, ArrowUpIcon, Bars3Icon, FolderIcon, PlusIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { StarIcon } from '@heroicons/vue/24/solid'

import { reactive, watch } from 'vue'
import { useDragReorderList } from "@/composables/useDragReorderList";
import AppIcon from '@/components/ui/AppIcon.vue'

export default {
  name: "AdditionalExperienceList",
  components: {
    AppIcon
  },
  props: {
    modelValue: { type: Array, default: () => [] },
    typeSelection: { type: String, default: "projects" },
  },
  emits: ["update:modelValue", "update:typeSelection"],
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
      localItems.push({
        type: props.typeSelection,
        title: "",
        organization: "",
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
      moveItem("additional", from, to);
      commit();
    };

    const placeholders = {
      projects: {
        title: "Project Name",
        organization: "Company/Organization",
        startDate: "Start Date",
        endDate: "End Date",
        description: "Project description and your contributions...",
      },
      volunteer: {
        title: "Role/Position",
        organization: "Organization",
        startDate: "Start Date",
        endDate: "End Date",
        description: "Your volunteer work and impact...",
      },
      certifications: {
        title: "Certification Name",
        organization: "Issuing Organization",
        startDate: "Issue Date",
        endDate: "Expiry Date (optional)",
        description: "Certification details and relevance...",
      },
      awards: {
        title: "Award Name",
        organization: "Issuing Organization",
        startDate: "Date Received",
        endDate: "N/A",
        description: "Award details and significance...",
      },
      publications: {
        title: "Publication Title",
        organization: "Publisher/Venue",
        startDate: "Publication Date",
        endDate: "N/A",
        description: "Publication summary and your contribution...",
      },
      custom: {
        title: "Entry Title",
        organization: "Organization/Entity",
        startDate: "Start Date",
        endDate: "End Date",
        description: "Description and details...",
      },
    };
    const ph = (type, field) =>
      (placeholders[type] || placeholders.custom)[field];

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
      ph,
    };
  },
};
</script>
