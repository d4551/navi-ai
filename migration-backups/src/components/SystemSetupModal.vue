<template>
  <div v-if="open" class="modal show d-block" role="dialog" aria-modal="true">
    <div class="modal-backdrop show"></div>
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content glass-surface">
        <div class="modal-header bg-gradient text-inverse">
          <h5 class="modal-title">
            <AppIcon name="mdi-cog-outline" class="me-2" /> System Setup
          </h5>
          <button
            type="button"
            class="btn-close btn-close-white ui-btn ui-size-md"
            aria-label="Close"
            @click="$emit('close')"
          ></button>
        </div>
        <div class="modal-body">
          <ul class="nav nav-tabs mb-3">
            <li v-for="(tab, i) in tabs" :key="tab.id" class="nav-item">
              <button
                class="nav-link"
                :class="{ active: step === i }"
                @click="step = i"
              >
                {{ tab.label }}
              </button>
            </li>
          </ul>

          <!-- Device Setup -->
          <div v-if="step === 0">
            <h6 class="mb-2">Lighting Device Setup</h6>
            <div class="small text-muted mb-2">
              System Status:
              {{
                store.lighting?.scanning
                  ? 'Scanning...'
                  : store.lighting?.connectedDevices?.length
                    ? 'Connected'
                    : 'Idle'
              }}
              | Connected Devices:
              {{ store.lighting?.connectedDevices?.length || 0 }} | Primary
              Device: {{ store.lighting?.primaryDevice || 'None Selected' }}
            </div>

            <div class="mb-3">
              <label class="form-label">LED Device Type</label>
              <div class="d-flex gap-2 flex-wrap">
                <UnifiedButton
                  :variant="
                    store.lighting?.deviceType === 'ring'
                      ? 'primary'
                      : 'outline'
                  "
                  @click="setType('ring')"
                >
                  <div class="fw-semibold">Ring Light</div>
                  <small class="text-muted d-block"
                    >WS2812B/WS2815 Circular LED Array</small
                  >
                </UnifiedButton>
                <UnifiedButton
                  :variant="
                    store.lighting?.deviceType === 'strip'
                      ? 'primary'
                      : 'outline'
                  "
                  @click="setType('strip')"
                >
                  <div class="fw-semibold">Addressable LED Strip</div>
                  <small class="text-muted d-block"
                    >WS2812B/WS2815 Linear Strip</small
                  >
                </UnifiedButton>
              </div>
            </div>

            <div class="d-flex gap-2">
              <UnifiedButton
                variant="outline"
                :disabled="!!store.lighting?.scanning"
                @click="scan"
                >{{
                  store.lighting?.scanning ? 'Scanning...' : 'Scan'
                }}</UnifiedButton
              >
              <UnifiedButton
                variant="outline"
                :disabled="!store.lighting?.connectedDevices?.length"
                @click="next"
                >Next</UnifiedButton
              >
            </div>
          </div>

          <!-- Configuration -->
          <div v-else-if="step === 1">
            <h6 class="mb-2">Configuration</h6>
            <div class="row g-3">
              <div class="col-sm-6">
                <label class="form-label">Primary Device</label>
                <select v-model="primary" class="form-select glass-input">
                  <option :value="null">None</option>
                  <option
                    v-for="d in store.lighting?.connectedDevices || []"
                    :key="d.id"
                    :value="d.id"
                  >
                    {{ d.name }} ({{ d.leds }} LEDs)
                  </option>
                </select>
              </div>
              <div class="col-sm-6">
                <label class="form-label">Profile</label>
                <select v-model="profile" class="form-select glass-input">
                  <option>Default</option>
                  <option>Cool White</option>
                  <option>Warm White</option>
                  <option>Photography</option>
                </select>
              </div>
            </div>
            <div class="mt-3 d-flex gap-2">
              <UnifiedButton variant="outline" @click="prev"
                >Back</UnifiedButton
              >
              <UnifiedButton variant="outline" @click="next"
                >Next</UnifiedButton
              >
            </div>
          </div>

          <!-- Profiles -->
          <div v-else-if="step === 2">
            <h6 class="mb-2">Quick Controls</h6>
            <div class="d-flex gap-2 align-items-center mb-3">
              <div class="form-check form-switch">
                <input
                  id="powerToggle"
                  class="form-check-input"
                  type="checkbox"
                  :checked="!!store.lighting?.power"
                  @change="togglePower"
                />
                <label class="form-check-label" for="powerToggle"
                  >Power: {{ store.lighting?.power ? 'On' : 'Off' }}</label
                >
              </div>
              <span
                class="badge"
                :class="store.lighting?.power ? 'bg-success' : 'bg-secondary'"
                >{{ store.lighting?.power ? 'On' : 'Off' }}</span
              >
            </div>
            <div class="mb-3">
              <label class="form-label">Preset</label>
              <div class="d-flex gap-2 flex-wrap">
                <UnifiedButton variant="outline" @click="apply('Default')"
                  >Default</UnifiedButton
                >
                <UnifiedButton variant="outline" @click="apply('Cool White')"
                  >Cool White</UnifiedButton
                >
                <UnifiedButton variant="outline" @click="apply('Warm White')"
                  >Warm White</UnifiedButton
                >
                <UnifiedButton variant="outline" @click="apply('Photography')"
                  >Photography</UnifiedButton
                >
              </div>
            </div>
            <div class="mt-2 d-flex gap-2">
              <UnifiedButton variant="outline" @click="prev"
                >Back</UnifiedButton
              >
              <UnifiedButton variant="outline" @click="next"
                >Next</UnifiedButton
              >
            </div>
          </div>

          <!-- Complete -->
          <div v-else>
            <h6 class="mb-2">Complete</h6>
            <p class="small text-muted">
              Setup finished. You can revisit settings anytime in System
              Settings.
            </p>
            <div class="d-flex gap-2">
              <UnifiedButton variant="primary" @click="$emit('close')"
                >Done</UnifiedButton
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineEmits, defineProps } from 'vue'
import { useSystemStore } from '@/stores/system'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

const props = defineProps({ open: { type: Boolean, default: false } })
const emit = defineEmits(['close'])

const store = useSystemStore()
const step = ref(0)
const primary = ref(null)
const profile = ref('Default')

const tabs = [
  { id: 'device', label: 'Device Setup' },
  { id: 'config', label: 'Configuration' },
  { id: 'profiles', label: 'Profiles' },
  { id: 'complete', label: 'Complete' },
]

function setType(t) {
  store.setDeviceType(t)
}
async function scan() {
  await store.startScanLighting()
}
function next() {
  step.value = Math.min(step.value + 1, tabs.length - 1)
}
function prev() {
  step.value = Math.max(step.value - 1, 0)
}
function togglePower() {
  store.toggleLightingPower()
}
function apply(p) {
  profile.value = p
  store.setLightingProfile(p)
}

watch(primary, val => {
  store.lighting.primaryDevice = val
  store.save()
})
watch(profile, val => store.setLightingProfile(val))
</script>

<style scoped>
.modal-content.glass-surface {
  border: 1px solid var(--glass-border);
}
.nav-link {
  cursor: pointer;
}
</style>
