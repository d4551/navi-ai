
import { ref, onUnmounted, getCurrentInstance } from "vue";

export interface UseMediaStreamResult {
  type: "webcam" | "screen";
  start: (options?: {
    audio?: boolean;
    constraints?: DisplayMediaStreamOptions;
  }) => Promise<MediaStream>;
  stop: () => void;
  isStreaming: ReturnType<typeof ref<boolean>>;
  stream: ReturnType<typeof ref<MediaStream | null>>;
}

export function useScreenCapture(): UseMediaStreamResult {
  const stream = ref<MediaStream | null>(null);
  const isStreaming = ref(false);

  const handleStreamEnded = () => {
    isStreaming.value = false;
    stream.value = null;
  };

  const start = async (options?: {
    audio?: boolean;
    constraints?: DisplayMediaStreamOptions;
  }): Promise<MediaStream> => {
    // Check for browser support
    if (!navigator?.mediaDevices?.getDisplayMedia) {
      throw new Error(
        "Screen capture is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Edge.",
      );
    }

    try {
      const base: DisplayMediaStreamOptions = options?.constraints || {
        video: {
          // @ts-ignore non-standard but widely implemented
          mediaSource: "screen",
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
        },
        audio: Boolean(options?.audio),
      };
      // Enhanced options for better screen capture
      const mediaStream = await navigator.mediaDevices.getDisplayMedia(base);

      // Add event listeners for stream end
      mediaStream
        .getTracks()
        .forEach((track) => track.addEventListener("ended", handleStreamEnded));

      stream.value = mediaStream;
      isStreaming.value = true;
      return mediaStream;
    } catch (_error) {
      console.error("Failed to capture screen:", error);
      // Provide user-friendly error messages
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          throw new Error(
            "Screen capture permission was denied. Please allow screen sharing and try again.",
          );
        } else if (error.name === "NotSupportedError") {
          throw new Error(
            "Screen capture is not supported on this device or browser.",
          );
        } else if (error.name === "NotFoundError") {
          throw new Error("No screen sharing source available.");
        }
      }
      throw error;
    }
  };

  const stop = () => {
    if (stream.value) {
      stream.value.getTracks().forEach((track) => {
        track.removeEventListener("ended", handleStreamEnded);
        track.stop();
      });
      stream.value = null;
      isStreaming.value = false;
    }
  };

  // Cleanup on unmount
  const instance = getCurrentInstance();
  if (instance) {
    onUnmounted(() => {
      stop();
    });
  }

  return {
    type: "screen",
    start,
    stop,
    isStreaming,
    stream,
  };
}
