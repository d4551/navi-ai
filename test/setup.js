// Test setup file
import { vi } from "vitest";
import { config } from "@vue/test-utils";

// Mock global objects that may not be available in test environment
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

global.performance = {
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn(() => []),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
  now: vi.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 100000000,
  },
};

global.navigator = {
  ...global.navigator,
  userAgent: "test-agent",
};

// Ensure window object exists (jsdom provides it) and just extend without overwriting methods like addEventListener
if (typeof global.window !== "undefined") {
  if (!("api" in global.window)) {
    global.window.api = null;
  }
}

// Ensure location object exists for libraries expecting window.location.href
if (typeof global.window.location === "undefined") {
  global.window.location = { href: "http://localhost/" };
}
if (typeof global.location === "undefined") {
  global.location = global.window.location;
}

// Patch location only if jsdom didn't define necessary properties
if (global.window && global.window.location) {
  const loc = global.window.location;
  try {
    if (!loc.reload) {
      loc.reload = vi.fn();
    }
  } catch {}
  try {
    if (!loc.replace) {
      loc.replace = vi.fn();
    }
  } catch {}
  try {
    if (!loc.assign) {
      loc.assign = vi.fn();
    }
  } catch {}
  global.location = loc;
}

// Mock performance for Vue
global.perf = {
  now: () => Date.now(),
};

// Register lightweight stubs for common Vuetify components so tests

// These render a simple wrapper and forward slots.
const vuetifyStubs = [
  "v-app",
  "v-card",
  "v-card-title",
  "v-card-text",
  "v-btn",
  "v-icon",
  "v-avatar",
  "v-container",
  "v-row",
  "v-col",
  "v-text-field",
  "v-select",
  "v-chip",
  "v-badge",
  "v-toolbar",
  "v-menu",
  "v-list",
  "v-list-item",
  "v-tooltip",
  "v-dialog",
];

vuetifyStubs.forEach((name) => {
  // simple stub that preserves children/slots and a class for selectors
  config.global.components[name] = {
    template: `<div class="stub-${name}"><slot/></div>`,
  };
});

