<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div :class="isTabbed ? '' : 'glass-card section-card'" role="region" aria-labelledby="gaming-heading" class="font-sans">
    <div v-if="!isTabbed" class="card-header section-header">
      <h5 id="gaming-heading" class="section-title">
        <AppIcon name="PuzzlePieceIcon" />
        Gaming Profile
      </h5>
    </div>
    <div class="card-body section-body">
      <form novalidate @submit.prevent="$emit('save')">
        <div class="card-grid" style="--card-grid-cols: 2">
          <div>
            <label for="portfolio-url" class="form-label">Portfolio/Website</label>
            <input
              id="portfolio-url"
              v-model="gamingProfile.portfolioUrl"
              type="url"
              class="form-control glass-input"
              placeholder="https://yourportfolio.com"
              autocomplete="url"
              :class="{ 'is-invalid': store.errors.validation?.portfolioUrl }"
              aria-describedby="portfolio-url-help"
            />
            <div id="portfolio-url-help" class="form-text">
              Link to your portfolio, personal website, or GitHub
            </div>
          </div>
          <div>
            <label for="demo-reel-url" class="form-label">Demo Reel</label>
            <input
              id="demo-reel-url"
              v-model="gamingProfile.demoReelUrl"
              type="url"
              class="form-control glass-input"
              placeholder="https://youtube.com/watch?v=..."
              autocomplete="url"
              :class="{ 'is-invalid': store.errors.validation?.demoReelUrl }"
              aria-describedby="demo-reel-help"
            />
            <div id="demo-reel-help" class="form-text">
              Link to your demo reel or video showcase
            </div>
          </div>
        </div>

        <div class="stack mt-3">
          <label for="shipped-titles" class="form-label">Shipped Titles</label>
          <textarea
            id="shipped-titles"
            v-model="gamingProfile.shippedTitles"
            class="form-control glass-input"
            rows="3"
            placeholder="List games you've worked on (e.g., 'Call of Duty: Modern Warfare II - Environment Art', 'Indie Puzzle Game - Solo Developer')"
            aria-describedby="shipped-titles-help"
          ></textarea>
          <div id="shipped-titles-help" class="form-text">
            Include your role and contribution for each title
          </div>
        </div>

        <div class="card-grid mt-3" style="--card-grid-cols: 2">
          <div>
            <label for="game-engines" class="form-label">Game Engines & Tools</label>
            <input
              id="game-engines"
              v-model="gamingProfile.gameEngines"
              type="text"
              class="form-control glass-input"
              placeholder="Unity, Unreal Engine, Blender, Photoshop..."
              aria-describedby="engines-help"
            />
            <div id="engines-help" class="form-text">
              Comma-separated list of engines and tools you're proficient in
            </div>
          </div>
          <div>
            <label for="specialization" class="form-label">Specialization</label>
            <select
              id="specialization"
              v-model="gamingProfile.specialization"
              class="form-select glass-input"
              aria-describedby="specialization-help"
            >
              <option value="">Select your primary specialization</option>
              <option value="design">Game Design</option>
              <option value="art">Art & Visual Design</option>
              <option value="engineering">Programming & Engineering</option>
              <option value="production">Production & Management</option>
              <option value="audio">Audio & Sound Design</option>
              <option value="qa">QA & Testing</option>
              <option value="community">Community & Marketing</option>
              <option value="esports">Esports & Events</option>
            </select>
            <div id="specialization-help" class="form-text">
              Your primary area of expertise in game development
            </div>
          </div>
        </div>

        <div class="form-help">
          <div class="hint-chip">
            <LightbulbIconComponent />
            <span>This information helps tailor job recommendations and resume optimization for gaming industry positions.</span>
          </div>
        </div>

        <div class="form-actions flex items-center gap-glass-sm">
          <UnifiedButton
            type="submit"
            color="gaming"
            :loading="saving"
            :disabled="saving"
            leading-icon="mdi-content-save"
          >
            {{ saving ? 'Saving...' : 'Save Gaming Profile' }}
          </UnifiedButton>
          <div v-if="profileSaved" class="success-message" aria-live="polite">
            <CheckIconComponent />
            <span>Gaming profile saved successfully</span>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { PuzzlePieceIcon } from '@heroicons/vue/24/outline'

import { useAppStore } from '@/stores/app'
import { useLogo } from '@/composables/useLogo'
import { SaveIconComponent, CheckIconComponent, LightbulbIconComponent } from './SettingsIcons.js'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

export default {
  name: 'GamingProfileSection',
  components: {
    SaveIconComponent,
    CheckIconComponent,
    LightbulbIconComponent,
    AppIcon,
    UnifiedButton
  },
  props: {
    gamingProfile: {
      type: Object,
      default: () => ({})
    },
    saving: {
      type: Boolean,
      default: false
    },
    profileSaved: {
      type: Boolean,
      default: false
    },
    isTabbed: {
      type: Boolean,
      default: false
    }
  },
  emits: ['save'],
  setup() {
    const store = useAppStore()
    const { logoSrc } = useLogo(store)
    return { store, logoSrc }
  }
}
</script>

<!-- Styles now handled by design-system.css -->
