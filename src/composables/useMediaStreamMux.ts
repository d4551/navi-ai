
import { ref, computed, onUnmounted, getCurrentInstance } from "vue";
import { useWebcam } from "./useWebcam";
import { useScreenCapture } from "./useScreenCapture";

export interface UseMediaStreamMuxResult {
  // Current active stream
  activeStream: ReturnType<typeof computed<MediaStream | null>>;
  activeType: ReturnType<typeof computed<"webcam" | "screen" | null>>;
  isStreaming: ReturnType<typeof computed<boolean>>;

  // Individual stream controls
  webcam: ReturnType<typeof useWebcam>;
  screenCapture: ReturnType<typeof useScreenCapture>;

  // Unified controls
  startWebcam: (constraints?: {
    video?: MediaTrackConstraints | boolean;
    audio?: MediaTrackConstraints | boolean;
  }) => Promise<MediaStream>;
  startScreenCapture: (options?: {
    audio?: boolean;
    constraints?: DisplayMediaStreamOptions;
  }) => Promise<MediaStream>;
  stopAll: () => void;
  switchTo: (type: "webcam" | "screen") => Promise<MediaStream>;

  // Audio controls
  toggleMicrophone: () => void;
  isMicrophoneEnabled: ReturnType<typeof ref<boolean>>;
}

export function useMediaStreamMux(): UseMediaStreamMuxResult {
  const webcam = useWebcam();
  const screenCapture = useScreenCapture();
  const isMicrophoneEnabled = ref(true);

  const activeType = computed(() => {
    if (webcam.isStreaming) return "webcam";
    if (screenCapture.isStreaming) return "screen";
    return null;
  });

  const activeStream = computed(() => {
    if (webcam.stream && webcam.isStreaming) return webcam.stream;
    if (screenCapture.stream && screenCapture.isStreaming)
      return screenCapture.stream;
    return null;
  });

  const isStreaming = computed(() => {
    return webcam.isStreaming || screenCapture.isStreaming;
  });

  const startWebcam = async (constraints?: {
    video?: MediaTrackConstraints | boolean;
    audio?: MediaTrackConstraints | boolean;
  }): Promise<MediaStream> => {
    // Stop screen capture if active
    if (screenCapture.isStreaming) {
      screenCapture.stop();
    }
    return await webcam.start(constraints);
  };

  const startScreenCapture = async (options?: {
    audio?: boolean;
    constraints?: DisplayMediaStreamOptions;
  }): Promise<MediaStream> => {
    // Stop webcam if active
    if (webcam.isStreaming) {
      webcam.stop();
    }
    return await screenCapture.start(_options);
  };

  const stopAll = () => {
    webcam.stop();
    screenCapture.stop();
  };

  const switchTo = async (type: "webcam" | "screen"): Promise<MediaStream> => {
    if (type === "webcam") {
      return await startWebcam();
    } else {
      return await startScreenCapture();
    }
  };

  const toggleMicrophone = () => {
    const stream = activeStream.value;
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      isMicrophoneEnabled.value =
        audioTracks.length > 0 ? audioTracks[0].enabled : false;
    }
  };

  // Cleanup on unmount
  const instance = getCurrentInstance();
  if (instance) {
    onUnmounted(() => {
      stopAll();
    });
  }

  return {
    activeStream,
    activeType,
    isStreaming,

    webcam,
    screenCapture,

    startWebcam,
    startScreenCapture,
    stopAll,
    switchTo,

    toggleMicrophone,
    isMicrophoneEnabled,
  };
}
