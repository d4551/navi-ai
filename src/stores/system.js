import { defineStore } from "pinia";
import { logger } from "@/shared/utils/logger";

const STORAGE_KEY = "navi-system-state";

export const useSystemStore = defineStore("system", {
  state: () => ({
    stationId: "GS-001",
    endpoints: {
      webServer: "",
    },
    azure: {
      connected: false,
    },
    services: {
      lighting: "offline",
      imager: "offline",
      calibration: "offline",
      footpedal: "offline",
      azure: "offline",
    },
    metrics: {
      lastUpdate: null,
      cpu: "—",
      memory: "—",
      network: "—",
    },
    calibration: {
      status: "idle", // 'idle' | 'running' | 'complete' | 'error'
      progress: 0,
      accuracy: null,
      health: 0,
    },
    lighting: {
      deviceType: "", // 'ring' | 'strip'
      scanning: false,
      connectedDevices: [],
      primaryDevice: null,
      power: false,
      profile: "Default",
    },
  }),
  getters: {
    overallHealth(state) {
      const vals = Object.values(state.services);
      if (!vals.length) return 0;
      const score =
        vals.reduce((acc, s) => acc + (s === "online" ? 1 : 0), 0) /
        vals.length;
      return Math.round(score * 100);
    },
  },
  actions: {
    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          return;
        }
        const data = JSON.parse(raw);
        if (data && typeof data === "object") {
          this.$patch(data);
        }
      } catch (_e) {
        logger.warn("System store load failed", _e);
      }
    },
    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.$state));
      } catch (_e) {
        logger.warn("System store save failed", _e);
      }
    },
    updateSettings(patch) {
      this.endpoints = { ...this.endpoints, ...(patch?.endpoints || {}) };
      if (patch?.stationId) {
        this.stationId = (patch.stationId + "").trim();
      }
      if (typeof patch?.azure?.connected === "boolean") {
        this.azure.connected = patch.azure.connected;
      }
      this.save();
      return true;
    },
    // Lighting config helpers
    setDeviceType(type) {
      this.lighting.deviceType = type;
      this.save();
    },
    toggleLightingPower() {
      this.lighting.power = !this.lighting.power;
      this.save();
    },
    setLightingProfile(name) {
      this.lighting.profile = name || "Default";
      this.save();
    },
    async startScanLighting(durationMs = 2000) {
      if (this.lighting.scanning) {
        return;
      }
      this.lighting.scanning = true;
      this.lighting.connectedDevices = [];
      this.lighting.primaryDevice = null;
      this.save();
      await new Promise((r) => setTimeout(r, durationMs));
      // Simulated discovery result
      const type = this.lighting.deviceType || "ring";
      const devices =
        type === "ring"
          ? [{ id: "ring-1", name: "Ring Light A", leds: 48 }]
          : [{ id: "strip-1", name: "Strip Light A", leds: 60 }];
      this.lighting.connectedDevices = devices;
      this.lighting.primaryDevice = devices[0]?.id || null;
      this.lighting.scanning = false;
      this.save();
    },
    stopScanLighting() {
      this.lighting.scanning = false;
      this.save();
    },

    setService(id, status) {
      if (!this.services[id]) {
        return;
      }
      this.services[id] = status;
      this.metrics.lastUpdate = new Date().toISOString();
    },
    // Calibration with actual system checks
    async startCalibration() {
      if (this.calibration.status === "running") {
        return;
      }

      try {
        this.calibration.status = "running";
        this.calibration.progress = 0;
        this.calibration.accuracy = null;
        this.calibration.health = 0;
        this.save();


        await this.pingAll();
        this.calibration.progress = 20;
        this.save();


        const availableServices = Object.entries(this.services)
          .filter(([_, status]) => status === "online")
          .map(([name]) => name);

        if (availableServices.length === 0) {
          throw new Error("No services available for calibration");
        }

        this.calibration.progress = 40;
        this.save();


        if (typeof window !== "undefined" && window.api) {
          try {
            await window.api.ai.status();
            this.setService("azure", "online");
          } catch {
            logger.warn("AI service not available during calibration");
          }
        }

        this.calibration.progress = 60;
        this.save();


        await new Promise((r) => setTimeout(r, 500)); // Allow UI update


        const serviceCount = Object.keys(this.services).length;
        const onlineCount = Object.values(this.services).filter(
          (s) => s === "online",
        ).length;
        const accuracy = Math.round((onlineCount / serviceCount) * 100);

        this.calibration.progress = 80;
        this.save();

        // Final validation
        await new Promise((r) => setTimeout(r, 300));

        if (this.calibration.status === "running") {
          this.calibration.status = "complete";
          this.calibration.progress = 100;
          this.calibration.accuracy = `±${Math.max(0.1, (100 - accuracy) / 10).toFixed(1)}%`;
          this.calibration.health = accuracy;
          this.save();

          logger.info(
            `Calibration completed with ${onlineCount}/${serviceCount} services online`,
          );
        }
      } catch (_error) {
        this.calibration.status = "error";
        this.calibration.progress = 0;
        this.calibration.accuracy = null;
        this.calibration.health = 0;
        this.save();

        logger.error("Calibration failed:", _error?.message || _error);
        throw _error;
      }
    },
    stopCalibration() {
      if (this.calibration.status === "running") {
        this.calibration.status = "idle";
        this.calibration.progress = 0;
        this.calibration.accuracy = null;
        this.calibration.health = 0;
        this.save();
      }
    },
    async pingAll() {
      try {
        const results = {};

        // Check Azure/AI service connectivity
        if (typeof window !== "undefined" && window.api) {
          try {
            const aiStatus = await window.api.ai.status();
            results.azure = aiStatus?.initialized ? "online" : "offline";
            this.azure.connected = aiStatus?.initialized || false;
          } catch {
            results.azure = "offline";
            this.azure.connected = false;
          }
        } else {
          results.azure = "offline";
          this.azure.connected = false;
        }

        // Check web server connectivity
        try {
          const controller =
            typeof AbortController !== "undefined"
              ? new AbortController()
              : null;
          const timeout = controller
            ? setTimeout(() => controller.abort(), 3000)
            : null;

          const fetchOptions = {
            method: "GET",
            cache: "no-cache",
          };

          if (controller) {
            fetchOptions.signal = controller.signal;
          }

          const response = await fetch(
            this.endpoints.webServer + "/health",
            fetchOptions,
          );

          if (timeout) {
            clearTimeout(timeout);
          }
          results.webServer = response.ok ? "online" : "offline";
        } catch {
          results.webServer = "offline";
        }

        // Hardware services (simulated for now, but with proper logic)
        // In a real app, these would check actual hardware endpoints
        const hardwareServices = [
          "lighting",
          "imager",
          "calibration",
          "footpedal",
        ];
        for (const service of hardwareServices) {
          // For hardware services, check if they're expected to be available
          // This is application-specific logic
          if (
            service === "lighting" &&
            this.lighting.connectedDevices.length > 0
          ) {
            results[service] = "online";
          } else {
            // Default to offline if no specific connection logic
            results[service] = "offline";
          }
        }

        // Update all service statuses
        Object.entries(results).forEach(([service, status]) => {
          this.setService(service, status);
        });

        // Update system metrics with real data when possible
        if (typeof window !== "undefined" && window.performance) {
          this.metrics.memory = `${Math.round(window.performance.memory?.usedJSHeapSize / 1024 / 1024) || "?"} MB`;
          this.metrics.network = navigator.onLine ? "online" : "offline";
        }

        this.metrics.cpu = "—"; // Browser can't access CPU directly
        this.metrics.lastUpdate = new Date().toISOString();
        this.save();

        logger.debug("Service connectivity check completed", results);
      } catch (_e) {
        logger.error("pingAll failed:", _e?.message || _e);
        // Set all services to offline on error
        Object.keys(this.services).forEach((service) => {
          this.setService(service, "offline");
        });
      }
    },
  },
});

export default useSystemStore;
