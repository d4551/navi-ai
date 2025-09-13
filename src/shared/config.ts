export function getEnv(key: string, defaultValue = ""): string {
  if (
    typeof process !== "undefined" &&
    process.env &&
    process.env[key] !== undefined
  ) {
    return process.env[key] as string;
  }
  if (
    typeof import.meta !== "undefined" &&
    (import.meta as any).env &&
    (import.meta as any).env[key] !== undefined
  ) {
    return (import.meta as any).env[key] as string;
  }
  if (
    typeof window !== "undefined" &&
    (window as any)._env_ &&
    (window as any)._env_[key] !== undefined
  ) {
    return (window as any)._env_[key];
  }
  return defaultValue;
}

export function getRequiredEnv(key: string): string {
  const value = getEnv(key);
  if (!value) {
    throw new Error(`Missing environment variable ${key}`);
  }
  return value;
}

export const RAWG_API_KEY = getEnv("VITE_RAWG_API_KEY", "");
export const VAPID_PUBLIC_KEY = getEnv("VITE_VAPID_PUBLIC_KEY", "");
