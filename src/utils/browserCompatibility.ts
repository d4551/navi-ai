
export interface BrowserCapabilities {
  // AI and Speech APIs
  speechSynthesis: boolean;
  speechRecognition: boolean;
  webkitSpeechRecognition: boolean;

  // Media APIs
  mediaDevices: boolean;
  getUserMedia: boolean;
  getDisplayMedia: boolean;
  mediaRecorder: boolean;

  // Core Web APIs
  fetch: boolean;
  websocket: boolean;
  webAssembly: boolean;
  webWorkers: boolean;
  serviceWorker: boolean;

  // Modern JavaScript Features
  asyncIterators: boolean;
  dynamicImport: boolean;
  modules: boolean;

  // Storage APIs
  localStorage: boolean;
  indexedDB: boolean;
  webSQL: boolean;

  // Graphics and Canvas
  canvas: boolean;
  webGL: boolean;

  // Network and Performance
  intersectionObserver: boolean;
  performanceObserver: boolean;
  beaconAPI: boolean;
}

  const capabilities: BrowserCapabilities = {
    // AI and Speech APIs
    speechSynthesis: "speechSynthesis" in window,
    speechRecognition: "SpeechRecognition" in window,
    webkitSpeechRecognition: "webkitSpeechRecognition" in window,

    // Media APIs
    mediaDevices: !!navigator?.mediaDevices,
    getUserMedia: !!navigator?.mediaDevices?.getUserMedia,
    getDisplayMedia: !!navigator?.mediaDevices?.getDisplayMedia,
    mediaRecorder: "MediaRecorder" in window,

    // Core Web APIs
    fetch: "fetch" in window,
    websocket: "WebSocket" in window,
    webAssembly: "WebAssembly" in window,
    webWorkers: "Worker" in window,
    serviceWorker: "serviceWorker" in navigator,

    // Modern JavaScript Features
    asyncIterators:
      typeof Symbol !== "undefined" && Symbol.asyncIterator != null,
    dynamicImport: true, // Assume modern bundlers support this
    modules: "noModule" in document.createElement("script"),

    // Storage APIs
    localStorage: (() => {
      try {
        return "localStorage" in window && window.localStorage !== null;
      } catch {
        return false;
      }
    })(),
    indexedDB: "indexedDB" in window,
    webSQL: "openDatabase" in window,

    // Graphics and Canvas
    canvas: (() => {
      try {
      } catch {
        return false;
      }
    })(),
    webGL: (() => {
      try {
        const canvas = document.createElement("canvas");
        return !!(
          canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
        );
      } catch {
        return false;
      }
    })(),
    webGL2: (() => {
      try {
        const canvas = document.createElement("canvas");
        return !!canvas.getContext("webgl2");
      } catch {
        return false;
      }
    })(),

    // Network and Performance
    intersectionObserver: "IntersectionObserver" in window,
    performanceObserver: "PerformanceObserver" in window,
    beaconAPI: "sendBeacon" in navigator,
  };

  return capabilities;
}

  isCompatible: boolean;
  missingFeatures: string[];
  warnings: string[];
} {
  const caps = detectBrowserCapabilities();
  const missingFeatures: string[] = [];
  const warnings: string[] = [];

  if (!caps.fetch) missingFeatures.push("Fetch API");
  if (!caps.websocket) missingFeatures.push("WebSocket API");
  if (!caps.localStorage) missingFeatures.push("Local Storage");

  // Speech features
  if (!caps.speechSynthesis)
    warnings.push("Speech Synthesis (text-to-speech will be limited)");
  if (!caps.speechRecognition && !caps.webkitSpeechRecognition) {
    warnings.push("Speech Recognition (voice input will be limited)");
  }

  // Media features for multimedia AI
  if (!caps.mediaDevices)
    warnings.push("Media Devices API (camera/microphone features limited)");
  if (!caps.getUserMedia)
    warnings.push("getUserMedia (microphone access limited)");
  if (!caps.getDisplayMedia)
    warnings.push("getDisplayMedia (screen sharing limited)");
  if (!caps.mediaRecorder)
    warnings.push("MediaRecorder (audio recording limited)");

  return {
    missingFeatures,
    warnings,
  };
}

  isCompatible: boolean;
  missingFeatures: string[];
  supportLevel: "full" | "partial" | "minimal" | "none";
} {
  const caps = detectBrowserCapabilities();
  const missingFeatures: string[] = [];

  if (!caps.mediaDevices) missingFeatures.push("Media Devices API");
  if (!caps.getUserMedia) missingFeatures.push("getUserMedia");
  if (!caps.getDisplayMedia) missingFeatures.push("getDisplayMedia");
  if (!caps.mediaRecorder) missingFeatures.push("MediaRecorder");
  if (!caps.canvas) missingFeatures.push("Canvas API");

  let supportLevel: "full" | "partial" | "minimal" | "none";

    supportLevel = "full";
  } else if (caps.mediaDevices && caps.getUserMedia) {
    supportLevel = "partial";
  } else if (caps.canvas) {
    supportLevel = "minimal";
  } else {
    supportLevel = "none";
  }

  return {
    isCompatible: supportLevel !== "none",
    missingFeatures,
    supportLevel,
  };
}

  userAgent: string;
  platform: string;
  language: string;
  cookieEnabled: boolean;
  onLine: boolean;
  hardwareConcurrency: number;
  deviceMemory?: number;
  connection?: any;
} {
  // Safely serialize connection object to prevent Promise display issues
  const connection = (navigator as any).connection;
  let connectionInfo = null;
  if (connection) {
    try {
      connectionInfo = {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      };
    } catch {
      connectionInfo = "[Connection API not fully supported]";
    }
  }

  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    // Experimental APIs with proper typing
    deviceMemory: (navigator as any).deviceMemory,
    connection: connectionInfo,
  };
}

  missingFeatures: string[],
): string {

  const browserSuggestion =

  if (missingFeatures.includes("Fetch API")) {
    return `Your browser doesn't support essential web technologies. ${browserSuggestion}`;
  }

  if (missingFeatures.includes("Media Devices API")) {
    return `Camera and microphone features require a modern browser. ${browserSuggestion}`;
  }

  return `Some features may not work properly due to browser limitations: ${missingFeatures.join(", ")}. ${browserSuggestion}`;
}

  const caps = detectBrowserCapabilities();
  const aiCompat = checkAICompatibility();
  const mmCompat = checkMultimediaCompatibility();
  const browserInfo = getBrowserInfo();

  console.log("Browser Info:", browserInfo);
  console.log(
    "AI Compatibility:",
  );
  console.log("Multimedia Support:", mmCompat.supportLevel.toUpperCase());

    console.warn("Missing AI Features:", aiCompat.missingFeatures);
  }

    console.warn("AI Warnings:", aiCompat.warnings);
  }

    console.warn("Missing Multimedia Features:", mmCompat.missingFeatures);
  }

  console.log("Full Capabilities:", caps);
  console.groupEnd();
}

// Note: Do not auto-log on import. `logBrowserCompatibility()` is called explicitly from main.js in dev.
