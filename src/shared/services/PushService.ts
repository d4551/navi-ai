
/// <reference types="vite/client" />
import { VAPID_PUBLIC_KEY } from "@/shared/config";
import { logger } from "@/shared/utils/logger";

    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

  if (!a) return false;
  if (aView.length !== b.length) return false;
    if (aView[i] !== b[i]) return false;
  }
  return true;
}

  if (!VAPID_PUBLIC_KEY) {
    logger.error("VAPID_PUBLIC_KEY is not configured", null, "PushService");
    return null;
  }

  if (!("serviceWorker" in navigator)) {
    logger.error(
      "Service workers are not supported in this environment",
      null,
      "PushService",
    );
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (
      subscription &&
      !keysMatch(subscription.options.applicationServerKey, expectedKey)
    ) {
      await subscription.unsubscribe();
      subscription = null;
      logger.warn(
        "Existing push subscription used mismatched VAPID key and was removed",
        null,
        "PushService",
      );
    }

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: expectedKey,
      });
    }

    return subscription;
  } catch (_err) {
    logger.error("Failed to establish push subscription", err, "PushService");
    return null;
  }
}
