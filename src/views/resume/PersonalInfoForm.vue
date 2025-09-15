<template>
  <v-card 
    variant="outlined" 
    class="mb-4 section-card section-card unified-card"
    :class="theme.getThemeClasses('personal-info-form')"
    class="font-sans"
  >
    <v-card-title 
      class="flex items-center justify-space-between pa-4"
    >
      <div class="flex items-center gap-glass-sm">
        <AppIcon name="IdentificationIcon" size="small" />
        <span class="text-lg font-semibold">Personal Information</span>
      </div>
      <UnifiedButton
        v-if="canUseAI"
        icon-only
        variant="ghost"
        size="sm"
        :loading="loadingAutoFill"
        icon="CommandLineIcon"
        :tooltip="'AI Assist'"
        @click="$emit('request-summary-suggestions')"
      />
    </v-card-title>
    
    <div class="card-content-sm">
      <v-flex flex-wrap>
        <v-flex-1 cols="12" md="6">
          <v-text-field
            v-model="local.personalInfo.name"
            class="glass-input"
            label="Full Name"
            variant="outlined"
            required
            autocomplete="name"
            @blur="commit()"
          />
        </v-flex-1>

        <v-flex-1 cols="12" md="6">
          <v-text-field
            v-model="local.personalInfo.email"
            class="glass-input"
            label="Email"
            type="email"
            variant="outlined"
            required
            autocomplete="email"
            @blur="commit()"
          />
        </v-flex-1>

        <v-flex-1 cols="12" md="6">
          <v-text-field
            v-model="local.personalInfo.phone"
            class="glass-input"
            label="Phone"
            type="tel"
            variant="outlined"
            autocomplete="tel"
            @blur="commit()"
          />
        </v-flex-1>

        <v-flex-1 cols="12" md="6">
          <v-text-field
            v-model="local.personalInfo.location"
            class="glass-input"
            label="Location"
            variant="outlined"
            placeholder="City, State/Country"
            autocomplete="address-level2"
            @blur="commit()"
          />
        </v-flex-1>

        <v-flex-1 cols="12">
          <div class="flex justify-space-between items-center mb-2">
            <v-label class="text-base font-medium font-weight-medium">Professional Summary</v-label>
            <div class="flex items-center gap-glass-sm">
              <UiChip :classes="`chip chip-${getSummaryStatusColor()} chip-compact`">
                {{ summaryWordCount }} words
              </UiChip>
              <UnifiedButton
                v-if="local.personalInfo.summary"
                variant="outline"
                color="secondary"
                size="sm"
                :loading="copying"
                icon-only
                icon="ClipboardIcon"
                @click="$emit('copy-summary')"
              />
            </div>
          </div>
          <v-textarea
            v-model="local.personalInfo.summary"
            class="glass-input"
            label="Professional Summary"
            variant="outlined"
            rows="4"
            placeholder="Brief professional summary highlighting your unique background..."
            @blur="commit()"
          />

          <!-- Suggestions dropdown -->
          <v-menu v-if="summarySuggestions?.length" offset-y>
            <template #activator="{ props }">
              <UnifiedButton
                v-bind="props"
                variant="outline"
                color="info"
                size="sm"
                leading-icon="LightBulbIcon"
                class="mt-2"
              >
                Choose AI Suggestion
              </UnifiedButton>
            </template>
            <v-list max-width="520">
              <v-list-item
                v-for="(suggestion, i) in summarySuggestions"
                :key="i"
                @click="$emit('apply-summary-suggestion', suggestion)"
              >
                <v-list-item-title class="text-wrap">{{ suggestion }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-flex-1>
      </v-flex flex-wrap>
    </div>
  </v-card>
</template>

<script>
import { ClipboardIcon, CommandLineIcon, IdentificationIcon, LightBulbIcon } from '@heroicons/vue/24/outline'

import UnifiedButton from '@/components/ui/UnifiedButton.vue';
import UiChip from '@/components/ui/UiChip.vue';
import AppIcon from '@/components/ui/AppIcon.vue';

import { computed, reactive, watch } from 'vue'
import { useUserProfile } from "@/composables/useUserProfile"
import { useUnifiedTheme } from '@/shared/composables/useUnifiedTheme'

export default {
  name: "PersonalInfoForm",
  components: { AppIcon, UnifiedButton, UiChip },
  props: {
    modelValue: { type: Object, default: () => ({}) },
    canUseAI: { type: Boolean, default: false },
    loadingAutoFill: { type: Boolean, default: false },
    summarySuggestions: { type: Array, default: () => [] },
    copying: { type: Boolean, default: false },
  },
  emits: [
    "update:modelValue",
    "request-summary-suggestions",
    "apply-summary-suggestion",
    "copy-summary",
  ],
  setup(props, { emit }) {
    const { personalInfo, updatePersonalInfo } = useUserProfile()
    const theme = useUnifiedTheme()
    // Initialize with safe defaults to avoid setup crashes
    const local = reactive({
      personalInfo: {
        name: '',
        email: '',
        phone: '',
        location: '',
        summary: '',
        ...(props.modelValue || {})
      }
    });

    // Initialize with profile data if available
    if (personalInfo.value && Object.keys(personalInfo.value).length > 0) {
      Object.assign(local.personalInfo, personalInfo.value);
    }

    watch(
      () => props.modelValue,
      (v) => {
        if (v && typeof v === 'object') {
          Object.assign(local.personalInfo, v);
        }
      },
    );

    // Watch for profile changes and sync with local state
    watch(
      personalInfo,
      (newPersonalInfo) => {
        if (newPersonalInfo && Object.keys(newPersonalInfo).length > 0) {
          Object.assign(local.personalInfo, newPersonalInfo);
        }
      },
      { deep: true }
    );

    const commit = async () => {
      emit("update:modelValue", { ...local.personalInfo });
      // Also update the global profile
      await updatePersonalInfo(local.personalInfo);
    };

    const summaryWordCount = computed(
      () =>
        (local.personalInfo.summary || "").trim().split(/\s+/).filter(Boolean)
          .length,
    );
    const summaryStatus = computed(() => {
      const wc = summaryWordCount.value;
      if (!wc) {
        return "neutral";
      }
      if (wc < 30) {
        return "short";
      }
      if (wc > 80) {
        return "long";
      }
      return "ok";
    });

    const getSummaryStatusColor = () => {
      const status = summaryStatus.value;
      switch (status) {
        case 'short': return 'warning';
        case 'long': return 'error';
        case 'ok': return 'success';
        default: return 'default';
      }
    };

    return { local, commit, summaryWordCount, summaryStatus, getSummaryStatusColor, theme };
  },
};
</script>
