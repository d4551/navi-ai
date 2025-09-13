import { ref, computed } from "vue";

// Global (per app instance) reactive state for media device locking
const audioLocked = ref(false);
const videoLocked = ref(false);
const screenLocked = ref(false);

const audioLockReasonRef = ref<string | null>(null);
const videoLockReasonRef = ref<string | null>(null);
const screenLockReasonRef = ref<string | null>(null);

export function useMediaLock() {
  function lockAudio(reason?: string) {
    audioLocked.value = true;
    if (reason) audioLockReasonRef.value = reason;
  }
  function unlockAudio() {
    audioLocked.value = false;
    audioLockReasonRef.value = null;
  }
  function lockVideo(reason?: string) {
    videoLocked.value = true;
    if (reason) videoLockReasonRef.value = reason;
  }
  function unlockVideo() {
    videoLocked.value = false;
    videoLockReasonRef.value = null;
  }
  function lockScreen(reason?: string) {
    screenLocked.value = true;
    if (reason) screenLockReasonRef.value = reason;
  }
  function unlockScreen() {
    screenLocked.value = false;
    screenLockReasonRef.value = null;
  }

  return {
    // state
    audioLocked,
    videoLocked,
    screenLocked,
    audioLockReason: computed(() => audioLockReasonRef.value),
    videoLockReason: computed(() => videoLockReasonRef.value),
    screenLockReason: computed(() => screenLockReasonRef.value),
    // actions
    lockAudio,
    unlockAudio,
    lockVideo,
    unlockVideo,
    lockScreen,
    unlockScreen,
  };
}

export default useMediaLock;
