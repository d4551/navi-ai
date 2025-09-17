import { ref } from 'vue'
import { useAppStore } from '@/stores/app'

export function useAudioSettings() {
  const store = useAppStore()
  const mics = ref([])
  const speakers = ref([])
  const supportsOutputSelection =
    typeof HTMLMediaElement !== 'undefined' &&
    typeof HTMLMediaElement.prototype.setSinkId === 'function'

  async function refreshDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      mics.value = devices.filter(d => d.kind === 'audioinput')
      speakers.value = devices.filter(d => d.kind === 'audiooutput')
    } catch (_) {
      mics.value = []
      speakers.value = []
    }
  }

  function setMicDevice(deviceId) {
    store.updateSettings({ selectedMicId: deviceId || '' })
  }

  function setSpeakerDevice(deviceId) {
    store.updateSettings({ selectedSpeakerId: deviceId || '' })
  }

  function setProviders({ ttsProvider, sttProvider }) {
    const patch = {}
    if (ttsProvider) {
      patch.ttsProvider = ttsProvider
    }
    if (sttProvider) {
      patch.sttProvider = sttProvider
    }
    store.updateSettings(patch)
  }

  return {
    mics,
    speakers,
    supportsOutputSelection,
    refreshDevices,
    setMicDevice,
    setSpeakerDevice,
    setProviders,
  }
}
