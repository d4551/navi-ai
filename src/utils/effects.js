// Optional animations powered by anime.js if available
// - Loads anime.js from CDN lazily
// - Respects prefers-reduced-motion

import { logger } from "@/shared/utils/logger";
import { TIMEOUTS } from "@/utils/config";

let animeLib = null;
let loading = false;
let loadPromise = null;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export async function initEffects() {
  if (animeLib || prefersReducedMotion()) {
    if (animeLib && typeof window !== "undefined") {
      window.anime = animeLib;
    }
    return Promise.resolve();
  }

  if (loading && loadPromise) {
    return loadPromise;
  }

  loading = true;
  loadPromise = (async () => {
    try {
      // Load anime.js from local package
      const mod = await import("animejs");
      animeLib = mod.default || mod;
      if (typeof window !== "undefined") {
        window.anime = animeLib;
        logger.debug("Anime.js loaded successfully");
      }
      return animeLib;
    } catch (e) {
      // Degrade to CSS-only animations but log once to aid diagnostics
      logger.once(
        "effects:init",
        "warn",
        "Anime.js failed to load; CSS-only animations in use.",
        e,
      );
      return null;
    } finally {
      loading = false;
    }
  })();

  return loadPromise;
}

export async function staggerFadeIn(containerEl) {
  if (!containerEl || prefersReducedMotion()) {
    return;
  }

  await ensureAnimeLoaded();

  if (!animeLib || typeof animeLib !== "function") {
    return;
  }

  const els = containerEl.querySelectorAll(
    ".card, h1, h2, h3, .btn, .list-group-item",
  );
  if (!els.length) {
    return;
  }

  animeLib({
    targets: els,
    translateY: [16, 0],
    opacity: [0, 1],
    easing: "easeOutQuad",
    duration: 420,
    delay: animeLib.stagger(50),
  });
}

export async function pulseOnFocus(
  selector = ".btn, .form-control, a.nav-link",
) {
  if (prefersReducedMotion()) {
    return;
  }

  await ensureAnimeLoaded();

  if (!animeLib || typeof animeLib !== "function") {
    return;
  }

  document.addEventListener("focusin", (e) => {
    if (!e.target.matches(selector)) {
      return;
    }
    animeLib({
      targets: e.target,
      scale: [1, 1.02, 1],
      duration: 220,
      easing: "easeOutSine",
    });
  });
}

// Simple confetti burst using anime.js; appends ephemeral elements to body
export async function confettiBurst({
  x = window.innerWidth / 2,
  y = window.innerHeight / 2,
  count = 28,
} = {}) {
  if (prefersReducedMotion()) {
    return;
  }

  await ensureAnimeLoaded();

  if (!animeLib) {
    return;
  }
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "0";
  container.style.top = "0";
  container.style.width = "100%";
  container.style.height = "100%";
  container.style.pointerEvents = "none";
  container.style.zIndex = "10000";
  document.body.appendChild(container);

  // Pull colors from unified tokens (no inline hex)
  const css = getComputedStyle(document.documentElement);
  const token = (name, fallback) =>
    (css.getPropertyValue(name) || fallback || "").trim();
  const colors = [
    token("--color-primary"),
    token("--color-primary-alt", token("--color-info")),
    token("--color-success"),
    token("--color-warning"),
    token("--color-danger"),
  ].filter(Boolean);
  const sprites = [];
  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.style.position = "absolute";
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.width = "8px";
    el.style.height = "8px";
    el.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    el.style.background = colors[i % colors.length];
    el.style.boxShadow = `0 1px 4px ${token("--primary-shadow-medium", "rgba(0,0,0,0.2)")}`;
    container.appendChild(el);
    sprites.push(el);
  }

  animeLib({
    targets: sprites,
    translateX: () => animeLib.random(-180, 180),
    translateY: () => animeLib.random(-240, -60),
    rotate: () => animeLib.random(-180, 180),
    scale: [1, () => 0.6 + Math.random()],
    opacity: [
      { value: 1, duration: 100 },
      { value: 0, duration: 700, delay: 300 },
    ],
    easing: "easeOutCubic",
    duration: 900,
    delay: animeLib.stagger(12),
    complete: () => container.remove(),
  });
}


export async function ensureAnimeLoaded() {
  if (animeLib) {
    return animeLib;
  }

  try {
    await initEffects();
    // If animeLib not set by initEffects but window.anime exists, use it
    if (
      !animeLib &&
      typeof window !== "undefined" &&
      typeof window.anime === "function"
    ) {
      animeLib = window.anime;
    }
    return animeLib;
  } catch (e) {
    logger.debug("Failed to ensure anime loaded", e);
    return null;
  }
}

// Global animation state checker
export function isAnimeAvailable() {
  return !!(animeLib && typeof window !== "undefined" && window.anime);
}

// Enhanced fallback system for when anime.js fails
export function createAnimationFallback() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  // Create a mock anime object for graceful degradation
  if (!window.anime) {
    window.anime = function (options) {
      // Simple fallback: just call complete callback if provided
      if (options && typeof options.complete === "function") {
        setTimeout(options.complete, options.duration || TIMEOUTS.SHORT);
      }
      return {
        // Mock return object for chaining
        add: function () {
          return this;
        },
        timeline: function (opts) {
          if (opts && typeof opts.complete === "function") {
            setTimeout(opts.complete, TIMEOUTS.MEDIUM);
          }
          return {
            add: function () {
              return this;
            },
          };
        },
        stagger: function () {
          return 0;
        },
      };
    };

    // Add stagger and timeline as static methods
    window.anime.stagger = function () {
      return 0;
    };
    window.anime.timeline = function (opts) {
      if (opts && typeof opts.complete === "function") {
        setTimeout(opts.complete, TIMEOUTS.MEDIUM);
      }
      return {
        add: function () {
          return this;
        },
      };
    };

    logger.debug("Created anime.js fallback mock");
  }
}
