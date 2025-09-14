/**
 * Unified Push Notification Service
 * Handles push subscription lifecycle and validation using VAPID keys.
 */

import { VAPID_PUBLIC_KEY } from '@/shared/config';
import { logger } from '@/shared/utils/logger';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function keysMatch(a: ArrayBuffer | null, b: Uint8Array): boolean {
  if (!a) return false;
  const aView = new Uint8Array(a);
  if (aView.length !== b.length) return false;
  for (let i = 0; i < aView.length; i++) {
    if (aView[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Get a push subscription validated against the configured VAPID key.
 * Returns null if the key is missing or misconfigured.
 */
export async function getValidPushSubscription(): Promise<PushSubscription | null> {
  if (!VAPID_PUBLIC_KEY) {
    logger.error('VAPID_PUBLIC_KEY is not configured', null, 'PushService');
    return null;
  }

  if (!('serviceWorker' in navigator)) {
    logger.error('Service workers are not supported in this environment', null, 'PushService');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const expectedKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    let subscription = await registration.pushManager.getSubscription();

    if (subscription && !keysMatch(subscription.options.applicationServerKey, expectedKey)) {
      await subscription.unsubscribe();
      subscription = null;
      logger.warn('Existing push subscription used mismatched VAPID key and was removed', null, 'PushService');
    }

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: expectedKey
      });
    }

    return subscription;
  } catch (err) {
    logger.error('Failed to establish push subscription', err, 'PushService');
    return null;
  }
}
