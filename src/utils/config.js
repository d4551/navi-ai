// Centralized configuration & constants
// Brand rename: GeminiCV -> Navi CV (email retained until new domain confirmed)
// Canonical support contact (update domain centrally when changed)
export const SUPPORT_EMAIL = "support@geminicv.com";
export const GEMINI_API_BASE = "https://generativelanguage.googleapis.com";
export const FALLBACK_MODELS = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-1.5-flash", "gemini-1.5-pro"];

// Centralized timeouts to avoid magic numbers
export const TIMEOUTS = {
  TINY: 50,
  QUICK: 150,
  SHORT: 300,
  MEDIUM: 400,
  LONG: 1000,
  XLONG: 2000,
  SLOW: 3000,
  OVERLAY: 10000,
  TOAST: 1200,
};

export function buildSupportMailto(subject, body) {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default {
  SUPPORT_EMAIL,
  GEMINI_API_BASE,
  FALLBACK_MODELS,
  TIMEOUTS,
  buildSupportMailto,
};
