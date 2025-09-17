import pkg from '../../package.json'

/**
 * Retrieves the application version from environment variables or package.json.
 */
export function getAppVersion(): string {
  const envVersion =
    (typeof process !== 'undefined' && process.env.APP_VERSION) ||
    // @ts-ignore - import.meta may not have env in some contexts
    (typeof import.meta !== 'undefined' &&
      (import.meta as any).env?.APP_VERSION)

  return envVersion || pkg.version
}
