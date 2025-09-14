
import { ref, onUnmounted, getCurrentInstance } from "vue";

export interface UseMediaStreamResult {
  type: "webcam" | "screen";
  start: (_constraints?: {
    video?: MediaTrackConstraints | boolean;
    audio?: MediaTrackConstraints | boolean;
  }) => Promise<MediaStream>;
  stop: () => void;
  isStreaming: ReturnType<typeof ref<boolean>>;
  stream: ReturnType<typeof ref<MediaStream | null>>;
}

export function useWebcam(): UseMediaStreamResult {
  const stream = ref<MediaStream | null>(null);
  const isStreaming = ref(false);

  const handleStreamEnded = () => {
    isStreaming.value = false;
    stream.value = null;
  };

  const start = async (constraints?: {
    video?: MediaTrackConstraints | boolean;
    audio?: MediaTrackConstraints | boolean;
  }): Promise<MediaStream> => {
    try {
      const mediaConstraints = {
        video:
          typeof constraints?.video !== "undefined" ? constraints?.video : true,
        audio:
          typeof constraints?.audio !== "undefined" ? constraints?.audio : true,
      };

      const mediaStream =
        await navigator.mediaDevices.getUserMedia(mediaConstraints);

      // Add event listeners for stream end
      mediaStream
        .getTracks()
        .forEach((track) => track.addEventListener("ended", handleStreamEnded));

      stream.value = mediaStream;
      isStreaming.value = true;
      return mediaStream;
    } catch (_error) {
      console.error("Failed to access webcam:", error);

      // Handle specific constraint errors and try fallback constraints
      if (error instanceof Error && (error as any).name === "OverconstrainedError") {
        console.warn("Camera constraints too restrictive, trying fallback");
        try {
          // Try with minimal constraints
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: false, // Remove audio requirement for fallback
          });

          fallbackStream
            .getTracks()
            .forEach((track) =>
              track.addEventListener("ended", handleStreamEnded),
            );

          stream.value = fallbackStream;
          isStreaming.value = true;
          return fallbackStream;
        } catch (fallbackError) {
          console.error("Fallback camera access also failed:", fallbackError);
          // Try video-only as last resort
          try {
            const videoOnlyStream = await navigator.mediaDevices.getUserMedia(
              {
                video: true,
                audio: false,
              },
            );

            videoOnlyStream
              .getTracks()
              .forEach((track) =>
                track.addEventListener("ended", handleStreamEnded),
              );

            stream.value = videoOnlyStream;
            isStreaming.value = true;
            return videoOnlyStream;
          } catch (finalError) {
            console.error("All camera access attempts failed:", finalError);
            throw new Error("Camera unavailable or access denied");
          }
        }
      } else if (error instanceof Error && (error as any).name === "NotAllowedError") {
        throw new Error("Camera access denied by user");
      } else if (error instanceof Error && (error as any).name === "NotFoundError") {
        throw new Error("No camera device found");
      } else if (error instanceof Error && (error as any).name === "NotReadableError") {
        throw new Error("Camera is being used by another application");
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
    type: "webcam",
    start,
    stop,
    isStreaming,
    stream,
  };
}
