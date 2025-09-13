// Toast service: thin proxy over the canonical useToast composable.
// Keeps named helpers used across the app while centralizing styling/options.
import { useToast } from "@/composables/useToast";

type ToastOptions = Record<string, any>;

// Basic helpers (backward-compatible names)
export function toastInfo(message: string, options: ToastOptions = {}): void {
  const { info } = useToast();
  info(message, options);
}

export function toastSuccess(
  message: string,
  options: ToastOptions = {},
): void {
  const { success } = useToast();
  success(message, options);
}

export function toastError(message: string, options: ToastOptions = {}): void {
  const { error } = useToast();
  error(message, options);
}

export function toastWarning(
  message: string,
  options: ToastOptions = {},
): void {
  const { warning } = useToast();
  warning(message, options);
}

// Advanced helpers (optional but useful)
export function toastLoading(
  message = "Loading...",
  options: ToastOptions = {},
) {
  const { loading } = useToast();
  return loading(message, options);
}

export function toastProgress(
  message: string,
  initial = 0,
  options: ToastOptions = {},
) {
  const { progress } = useToast();
  return progress(message, initial, options);
}

export function toastConfirm(message: string, options: ToastOptions = {}) {
  const { confirm } = useToast();
  return confirm(message, options);
}

export function toastClear(): void {
  const { clear } = useToast();
  clear();
}

export function toastHandleApiResponse(
  response: any,
  successMessage: string,
  errorMessage = "Operation failed",
) {
  const { handleApiResponse } = useToast();
  return handleApiResponse(response, successMessage, errorMessage);
}

export function toastHandlePromise<T>(
  promise: Promise<T>,
  messages: { loading?: string; success?: string; error?: string } = {},
) {
  const { handlePromise } = useToast();
  return handlePromise(promise, messages);
}

export function toastBatch(
  operations: Array<() => Promise<any>>,
  messages: { loading?: string; success?: string; error?: string } = {},
) {
  const { batch } = useToast();
  return batch(operations, messages);
}

// Create a concrete service object so we can export both named and default
const service = {
  info: toastInfo,
  success: toastSuccess,
  error: toastError,
  warning: toastWarning,
  loading: toastLoading,
  progress: toastProgress,
  confirm: toastConfirm,
  clear: toastClear,
  handleApiResponse: toastHandleApiResponse,
  handlePromise: toastHandlePromise,
  batch: toastBatch,
};

// Named export expected across the app
export const toastService = service;

// Optional default export for convenience
export default service;
