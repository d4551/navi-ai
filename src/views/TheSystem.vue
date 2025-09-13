<!--
THE SYSTEM - Gaming Ecosystem Command Center
Noir-themed system management and performance monitoring
RGB-enhanced controls with ultra-wide gaming analytics dashboard
-->
<template>
  <StandardPageLayout
    page-type="gaming"
    title="THE SYSTEM"
    subtitle="Every operation needs muscle. Welcome to the machine room."
    :title-icon="'mdi-server-network'"
    content-spacing="normal"
    max-width="xl"
  >
    <!-- Quick Stats Bar -->
    <section class="stats-bar">
      <div class="stat-card">
        <div class="stat-icon power">
          <AppIcon name="mdi-power" />
        </div>
        <div class="stat-info">
          <div class="stat-value">
            {{ systemPower.mainSystem ? "Active" : "Inactive" }}
          </div>
          <div class="stat-label">System Status</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon devices">
          <AppIcon name="mdi-devices" />
        </div>
        <div class="stat-info">
          <div class="stat-value">
            {{ connectedDevices.filter((d) => d.status === "active").length }}
          </div>
          <div class="stat-label">Connected Devices</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon health">
          <AppIcon name="mdi-heart-pulse" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ systemHealth.score }}%</div>
          <div class="stat-label">System Health</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon network">
          <AppIcon name="mdi-wifi" />
        </div>
        <div class="stat-info">
          <div class="stat-value">
            {{ connections.filter((c) => c.status === "connected").length }}/{{
              connections.length
            }}
          </div>
          <div class="stat-label">Network Status</div>
        </div>
      </div>
    </section>

    <!-- Quick Controls -->
    <section class="controls-section section-card">
      <div class="section-header">
        <h2>System Controls</h2>
        <div class="section-subtitle">
          Manage power, lighting, audio, and connectivity
        </div>
      </div>
      <div class="controls-grid responsive-grid--cards-sm">
        <!-- System Power -->
        <div class="control-card section-card">
          <div class="control-header">
            <div class="control-icon">
              <AppIcon name="mdi-power" class="rgb-icon" />
            </div>
            <div class="control-info">
              <h3>System Power</h3>
              <p>Manage device power states</p>
            </div>
          </div>
          <div class="control-actions">
            <UnifiedButton
              size="sm"
              :variant="systemPower.mainSystem ? 'primary' : 'glass'"
              @click="toggleMainSystem"
            >
              Main System
            </UnifiedButton>
            <UnifiedButton
              size="sm"
              :variant="systemPower.peripherals ? 'primary' : 'glass'"
              @click="togglePeripherals"
            >
              Peripherals
            </UnifiedButton>
          </div>
        </div>

        <!-- Lighting Control -->
        <div class="control-card section-card">
          <div class="control-header">
            <div class="control-icon">
              <AppIcon name="mdi-lightbulb-multiple" class="rgb-icon" />
            </div>
            <div class="control-info">
              <h3>RGB Lighting</h3>
              <p>Control system lighting effects</p>
            </div>
          </div>
          <div class="lighting-controls">
            <div class="lighting-preset-grid">
              <button
                v-for="preset in lightingPresets"
                :key="preset.id"
                class="preset-btn"
                :class="{ active: currentLightingPreset === preset.id }"
                @click="setLightingPreset(preset.id)"
              >
                <div
                  class="preset-color"
                  :style="{ background: preset.gradient }"
                >
                  <div class="preset-shimmer"></div>
                </div>
                <span class="preset-name">{{ preset.name }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Audio Control -->
        <div class="control-card section-card">
          <div class="control-header">
            <div class="control-icon">
              <AppIcon name="mdi-volume-high" />
            </div>
            <div class="control-info">
              <h3>Audio System</h3>
              <p>Sound devices and levels</p>
            </div>
          </div>
          <div class="audio-controls">
            <div class="volume-control">
              <label>Master Volume</label>
              <input
                v-model="audioSettings.masterVolume"
                type="range"
                min="0"
                max="100"
                class="volume-slider"
                @input="updateMasterVolume"
              />
              <span class="volume-value">{{ audioSettings.masterVolume }}%</span>
            </div>
            <div class="audio-devices">
              <select
                v-model="audioSettings.selectedDevice"
                class="device-select glass-input"
              >
                <option
                  v-for="device in audioDevices"
                  :key="device.id"
                  :value="device.id"
                >
                  {{ device.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Connection Status -->
        <div class="control-card section-card">
          <div class="control-header">
            <div class="control-icon">
              <AppIcon name="mdi-transit-connection" class="rgb-icon" />
            </div>
            <div class="control-info">
              <h3>Connections</h3>
              <p>Device connectivity status</p>
            </div>
          </div>
          <div class="connection-list">
            <div
              v-for="connection in connections"
              :key="connection.type"
              class="connection-item"
              :class="{ connected: connection.status === 'connected' }"
            >
              <i :class="connection.icon" class="connection-icon"></i>
              <span class="connection-label">{{ connection.type }}</span>
              <div class="connection-status">
                <div class="status-dot"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Device Management -->
    <section class="devices-section section-card">
      <div class="section-header">
        <h2>Connected Devices</h2>
        <div class="section-subtitle">Monitor and manage system hardware</div>
        <div class="section-controls">
          <UnifiedButton
            color="glass"
            appearance="outlined"
            leading-icon="mdi-refresh"
            :class="{ spinning: scanning }"
            @click="scanDevices"
          >
            Scan Devices
          </UnifiedButton>
          <UnifiedButton
            color="gaming"
            leading-icon="mdi-tune-vertical"
            @click="startCalibration"
          >
            Calibrate
          </UnifiedButton>
        </div>
      </div>

      <div class="devices-grid responsive-grid--cards-lg">
        <div
          v-for="device in connectedDevices"
          :key="device.id"
          class="device-card section-card"
          :class="{
            active: device.status === 'active',
            error: device.status === 'error',
          }"
        >
          <!-- Device Header -->
          <div class="device-header">
            <div class="device-icon">
              <i
                :class="getDeviceIcon(device.type)"
                class="device-type-icon"
              ></i>
            </div>

            <div class="device-info">
              <h3 class="device-name">{{ device.name }}</h3>
              <p class="device-type">{{ device.type }}</p>
              <div
                class="device-status-badge"
                :class="`status-${device.status}`"
              >
                {{ device.status }}
              </div>
            </div>

            <div class="device-controls">
              <UnifiedButton
                size="sm"
                :variant="device.status === 'active' ? 'primary' : 'glass'"
                icon-only
                :leading-icon="
                  device.status === 'active' ? 'mdi-pause' : 'mdi-play'
                "
                @click="toggleDevice(device.id)"
              />
            </div>
          </div>

          <!-- Device Metrics -->
          <div v-if="device.metrics" class="device-metrics">
            <div class="metrics-grid">
              <div class="metric-item">
                <div class="metric-label">Signal</div>
                <div class="signal-bars">
                  <div
                    v-for="i in 4"
                    :key="i"
                    class="signal-bar"
                    :class="{ active: i <= device.metrics.signalStrength }"
                  ></div>
                </div>
              </div>

              <div
                v-if="device.metrics.batteryLevel !== undefined"
                class="metric-item"
              >
                <div class="metric-label">Battery</div>
                <div class="metric-value">
                  {{ device.metrics.batteryLevel }}%
                </div>
                <div class="battery-bar">
                  <div
                    class="battery-fill"
                    :class="{
                      low: device.metrics.batteryLevel < 30,
                      medium:
                        device.metrics.batteryLevel >= 30 &&
                        device.metrics.batteryLevel < 70,
                    }"
                    :style="{ width: device.metrics.batteryLevel + '%' }"
                  ></div>
                </div>
              </div>

              <div v-if="device.metrics.temperature" class="metric-item">
                <div class="metric-label">Temp</div>
                <div class="metric-value">
                  {{ device.metrics.temperature }}°C
                </div>
              </div>
            </div>
          </div>

          <!-- Device Actions -->
          <div class="device-actions">
            <UnifiedButton
              color="glass"
              appearance="outlined"
              leading-icon="mdi-cog"
              @click="configureDevice(device)"
            >
              Config
            </UnifiedButton>
            <UnifiedButton
              color="glass"
              appearance="outlined"
              leading-icon="mdi-play"
              @click="testDevice(device)"
            >
              Test
            </UnifiedButton>
            <UnifiedButton
              color="glass"
              appearance="outlined"
              leading-icon="mdi-file-document-outline"
              @click="viewDeviceLogs(device)"
            >
              Logs
            </UnifiedButton>
          </div>
        </div>
      </div>
    </section>

    <!-- System Analytics -->
    <section class="analytics-section section-card">
      <div class="section-header">
        <h2>System Analytics</h2>
        <div class="section-subtitle">
          Performance metrics and system health monitoring
        </div>
        <div class="section-controls">
          <div class="time-filter">
            <select v-model="analyticsTimeframe" class="unified-input">
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>
        </div>
      </div>

      <div class="analytics-grid responsive-grid--cards-md">
        <!-- Performance Chart -->
        <div class="analytics-card section-card analytics-card--large">
          <div class="card-header section-header">
            <h3>
              <AppIcon name="mdi-chart-bar" />
              Performance
            </h3>
            <div class="chart-legend">
              <div class="legend-item">
                <div class="legend-color cpu"></div>
                <span>CPU</span>
              </div>
              <div class="legend-item">
                <div class="legend-color memory"></div>
                <span>Memory</span>
              </div>
              <div class="legend-item">
                <div class="legend-color network"></div>
                <span>Network</span>
              </div>
            </div>
          </div>
          <div class="chart-container">
            <!-- Simple chart visualization -->
            <div class="chart-area">
              <div class="chart-line cpu-line"></div>
              <div class="chart-line memory-line"></div>
              <div class="chart-line network-line"></div>
            </div>
            <div class="chart-labels">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
          </div>
        </div>

        <!-- Device Status Overview -->
        <div class="analytics-card section-card">
          <div class="card-header section-header">
            <h3>
              <AppIcon name="mdi-devices" />
              Device Overview
            </h3>
          </div>
          <div class="device-overview">
            <div class="overview-item">
              <div class="overview-icon">
                <AppIcon name="mdi-usb" class="overview-device-icon" />
              </div>
              <div class="overview-info">
                <div class="overview-label">USB Devices</div>
                <div class="overview-count">{{ deviceCounts.usb }}</div>
              </div>
            </div>

            <div class="overview-item">
              <div class="overview-icon">
                <AppIcon name="mdi-bluetooth" class="overview-device-icon" />
              </div>
              <div class="overview-info">
                <div class="overview-label">Bluetooth</div>
                <div class="overview-count">{{ deviceCounts.bluetooth }}</div>
              </div>
            </div>

            <div class="overview-item">
              <div class="overview-icon">
                <AppIcon name="mdi-ethernet" class="overview-device-icon" />
              </div>
              <div class="overview-info">
                <div class="overview-label">Network</div>
                <div class="overview-count">{{ deviceCounts.network }}</div>
              </div>
            </div>

            <div class="overview-item">
              <div class="overview-icon">
                <AppIcon name="mdi-speaker" class="overview-device-icon" />
              </div>
              <div class="overview-info">
                <div class="overview-label">Audio</div>
                <div class="overview-count">{{ deviceCounts.audio }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- System Health -->
        <div class="analytics-card section-card">
          <div class="card-header section-header">
            <h3>
              <AppIcon name="mdi-heart-pulse" />
              System Health
            </h3>
            <div
              class="health-score"
              :class="getHealthClass(systemHealth.score)"
            >
              {{ systemHealth.score }}/100
            </div>
          </div>
          <div class="health-breakdown">
            <div class="health-item">
              <div class="health-label">Hardware</div>
              <div class="progress progress--xs">
                <div
                  class="progress-bar"
                  :style="{ width: systemHealth.hardware + '%' }"
                ></div>
              </div>
              <span class="health-value">{{ systemHealth.hardware }}%</span>
            </div>

            <div class="health-item">
              <div class="health-label">Connectivity</div>
              <div class="progress progress--xs">
                <div
                  class="progress-bar"
                  :style="{ width: systemHealth.connectivity + '%' }"
                ></div>
              </div>
              <span class="health-value">{{ systemHealth.connectivity }}%</span>
            </div>

            <div class="health-item">
              <div class="health-label">Performance</div>
              <div class="progress progress--xs">
                <div
                  class="progress-bar"
                  :style="{ width: systemHealth.performance + '%' }"
                ></div>
              </div>
              <span class="health-value">{{ systemHealth.performance }}%</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Calibration Modal -->
    <Teleport to="body">
      <div
        v-if="calibrationModal.show"
        class="calibration-modal-overlay"
        @click="closeCalibration"
      >
        <div class="calibration-modal unified-modal" @click.stop>
          <div class="modal-header">
            <h2>System Calibration</h2>
            <button class="close-btn" @click="closeCalibration">
              <AppIcon name="mdi-close" />
            </button>
          </div>

          <div class="modal-content">
            <div class="calibration-steps">
              <div
                v-for="(step, index) in calibrationSteps"
                :key="index"
                class="calibration-step"
                :class="{
                  active: calibrationModal.currentStep === index,
                  completed: calibrationModal.currentStep > index,
                }"
              >
                <div class="step-indicator">
                  <AppIcon
                    :name="
                      calibrationModal.currentStep > index
                        ? 'mdi-check'
                        : `mdi-numeric-${index + 1}`
                    "
                  />
                </div>
                <div class="step-content">
                  <h4>{{ step.title }}</h4>
                  <p>{{ step.description }}</p>
                </div>
              </div>
            </div>

            <div
              v-if="calibrationModal.currentStep < calibrationSteps.length"
              class="calibration-progress"
            >
              <div class="progress progress--sm">
                <div
                  class="progress-bar"
                  :style="{
                    width:
                      (calibrationModal.currentStep / calibrationSteps.length) *
                      100 +
                      '%',
                  }"
                ></div>
              </div>
              <div class="progress-text">
                Step {{ calibrationModal.currentStep + 1 }} of
                {{ calibrationSteps.length }}
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <UnifiedButton
              color="glass"
              appearance="outlined"
              :disabled="calibrationModal.inProgress"
              @click="closeCalibration"
            >
              Cancel
            </UnifiedButton>
            <UnifiedButton
              v-if="calibrationModal.currentStep < calibrationSteps.length"
              color="gaming"
              :disabled="calibrationModal.inProgress"
              :loading="calibrationModal.inProgress"
              leading-icon="mdi-arrow-right"
              @click="nextCalibrationStep"
            >
              {{ calibrationModal.inProgress ? "Processing..." : "Next" }}
            </UnifiedButton>
            <UnifiedButton
              v-else
              color="gaming"
              leading-icon="mdi-check"
              @click="completeCalibration"
            >
              Complete
            </UnifiedButton>
          </div>
        </div>
      </div>
    </Teleport>
  </StandardPageLayout>
</template>

<script setup lang="ts">
import AppIcon from "@/components/ui/AppIcon.vue";

import { ref, reactive, onMounted, onUnmounted } from "vue";
import StandardPageLayout from "@/components/layout/StandardPageLayout.vue";
import { useRouter } from "vue-router";
import { useResponsive } from "@/composables/useResponsive";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";

// Composables
const __router = useRouter();
// Theme is globally applied; no per-page theme binding needed
const _responsive = useResponsive();

// State
const scanning = ref(false);
const analyticsTimeframe = ref("24h");

// System power states
const systemPower = reactive({
  mainSystem: true,
  peripherals: true,
});

// Audio settings
const audioSettings = reactive({
  masterVolume: 75,
  selectedDevice: "speakers",
});

const audioDevices = [
  { id: "speakers", name: "Gaming Speakers" },
  { id: "headphones", name: "Wireless Headphones" },
  { id: "usb-mic", name: "USB Microphone" },
];

// Lighting presets
const currentLightingPreset = ref("gaming");
const lightingPresets = [
  { id: "off", name: "Off", gradient: "#000000" },
  {
    id: "gaming",
    name: "Gaming",
    gradient: "linear-gradient(45deg, #ff0080, #00ff80, #8000ff)",
  },
  {
    id: "work",
    name: "Work",
    gradient: "linear-gradient(45deg, #4f46e5, #06b6d4)",
  },
  {
    id: "relax",
    name: "Relax",
    gradient: "linear-gradient(45deg, #8b5cf6, #ec4899)",
  },
  {
    id: "focus",
    name: "Focus",
    gradient: "linear-gradient(45deg, #10b981, #3b82f6)",
  },
];

// Connection types
const connections = reactive([
  { type: "USB", icon: "mdi-usb", status: "connected" },
  { type: "Bluetooth", icon: "mdi-bluetooth", status: "connected" },
  { type: "WiFi", icon: "mdi-wifi", status: "connected" },
  { type: "Ethernet", icon: "mdi-ethernet", status: "disconnected" },
]);

// Connected devices
const connectedDevices = reactive([
  {
    id: "mouse-001",
    name: "Gaming Mouse Pro",
    type: "Mouse",
    status: "active",
    metrics: {
      signalStrength: 4,
      batteryLevel: 87,
      temperature: 32,
    },
  },
  {
    id: "keyboard-001",
    name: "Mechanical Keyboard",
    type: "Keyboard",
    status: "active",
    metrics: {
      signalStrength: 3,
      batteryLevel: undefined,
      temperature: 28,
    },
  },
  {
    id: "headset-001",
    name: "Wireless Gaming Headset",
    type: "Audio",
    status: "active",
    metrics: {
      signalStrength: 3,
      batteryLevel: 62,
      temperature: 25,
    },
  },
  {
    id: "webcam-001",
    name: "HD Webcam",
    type: "Camera",
    status: "inactive",
    metrics: {
      signalStrength: 4,
      batteryLevel: undefined,
      temperature: 30,
    },
  },
]);

// System health
const systemHealth = reactive({
  overall: "healthy",
  score: 94,
  hardware: 96,
  connectivity: 92,
  performance: 94,
  connectedDevices: 3,
  totalDevices: 4,
});

// Device counts
const deviceCounts = reactive({
  usb: 2,
  bluetooth: 3,
  network: 1,
  audio: 2,
});

// Calibration modal
const calibrationModal = reactive({
  show: false,
  currentStep: 0,
  inProgress: false,
});

const calibrationSteps = [
  {
    title: "Initialize Hardware",
    description: "Detecting and initializing all connected devices",
  },
  {
    title: "Test Connections",
    description: "Verifying communication with each device",
  },
  {
    title: "Audio Calibration",
    description: "Calibrating audio levels and testing microphone",
  },
  {
    title: "Input Devices",
    description: "Testing mouse sensitivity and keyboard response",
  },
  {
    title: "Final Verification",
    description: "Running comprehensive system check",
  },
];

// Methods
const toggleMainSystem = () => {
  systemPower.mainSystem = !systemPower.mainSystem;
  console.log("Main system:", systemPower.mainSystem ? "ON" : "OFF");
};

const togglePeripherals = () => {
  systemPower.peripherals = !systemPower.peripherals;
  console.log("Peripherals:", systemPower.peripherals ? "ON" : "OFF");
};

const setLightingPreset = (presetId: string) => {
  currentLightingPreset.value = presetId;
  console.log("Lighting preset changed to:", presetId);
};

const updateMasterVolume = () => {
  console.log("Master volume:", audioSettings.masterVolume);
};

const scanDevices = async () => {
  scanning.value = true;
  try {
    // Simulate device scanning
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Device scan completed");
  } finally {
    scanning.value = false;
  }
};

const toggleDevice = (deviceId: string) => {
  const device = connectedDevices.find((d) => d.id === deviceId);
  if (device) {
    device.status = device.status === "active" ? "inactive" : "active";
    console.log(`Device ${deviceId} is now ${device.status}`);
  }
};

const configureDevice = (device: any) => {
  console.log("Configuring device:", device.name);
  // In real implementation, would open device configuration
};

const testDevice = (device: any) => {
  console.log("Testing device:", device.name);
  // In real implementation, would run device test
};

const viewDeviceLogs = (device: any) => {
  console.log("Viewing logs for:", device.name);
  // In real implementation, would show device logs
};

const startCalibration = () => {
  calibrationModal.show = true;
  calibrationModal.currentStep = 0;
};

const closeCalibration = () => {
  calibrationModal.show = false;
  calibrationModal.currentStep = 0;
  calibrationModal.inProgress = false;
};

const nextCalibrationStep = async () => {
  calibrationModal.inProgress = true;

  try {
    // Simulate calibration step
    await new Promise((resolve) => setTimeout(resolve, 1500));
    calibrationModal.currentStep++;
  } finally {
    calibrationModal.inProgress = false;
  }
};

const completeCalibration = () => {
  console.log("Calibration completed");
  closeCalibration();
};


const _getHealthIcon = (health: string) => {
  const icons = {
    healthy: "mdi-check-circle-outline",
    warning: "mdi-alert-circle-outline",
    error: "mdi-close-circle-outline",
  };
  return icons[health] || "mdi-help-circle";
};

const getHealthClass = (score: number) => {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 50) return "fair";
  return "poor";
};

const getDeviceIcon = (type: string) => {
  const icons = {
    Mouse: "mdi-mouse",
    Keyboard: "mdi-keyboard",
    Audio: "mdi-headphones",
    Camera: "mdi-camera",
    Storage: "mdi-harddisk",
    Network: "mdi-ethernet",
  };
  return icons[type] || "mdi-devices";
};

// Initialize system monitoring
let healthCheckInterval: NodeJS.Timeout;

onMounted(() => {
  // Start health monitoring
  healthCheckInterval = setInterval(() => {
    // In real implementation, would check actual system health
    console.log("System health check...");
  }, 30000);
});

onUnmounted(() => {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }
});
</script>

<style scoped>

.stats-bar {
  display: grid;
}

.stat-card {
  background: var(--glass-bg);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  transition: all var(--duration-normal);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: "";
  position: absolute;
  background: linear-gradient(
  );
  transition: opacity var(--duration-normal);
  pointer-events: none;
}

.stat-card:hover {
  border-color: var(--glass-border-hover);
}

.stat-card:hover::before {
}

.stat-icon {
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  position: relative;
}

.stat-icon.power {
  background: linear-gradient(
  );
  color: white;
}

.stat-icon.devices {
  background: linear-gradient(
  );
  color: white;
}

.stat-icon.health {
  color: white;
}

.stat-icon.network {
  color: white;
}

.stat-info {
  position: relative;
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.the-system {
  background: var(--glass-bg);
}


.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

  font-weight: var(--font-weight-bold);
  display: flex;
  align-items: center;
}

.rgb-icon {
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.text-gradient-rgb {
  background: linear-gradient(
    var(--text-primary),
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle-glass {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
}

.system-status {
  display: flex;
  align-items: center;
  background: var(--surface-glass);
  border-radius: var(--radius-xl);
  position: relative;
  transition: all var(--duration-normal);
}

.system-status.connected {
  box-shadow: var(--shadow-glow-gaming);
}

.status-ring {
  position: relative;
  border-radius: var(--radius-full);
  background: var(--surface-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
}

.system-status.connected .status-ring {
}

.status-pulse {
  @apply position-absolute;
  border-radius: var(--radius-full);
}

.status-label {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  font-size: var(--font-size-lg);
}

.status-detail {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.controls-section {
  background: var(--glass-bg);
}

.controls-grid {
}

.control-card {
  background: var(--glass-bg);
  transition: all var(--duration-normal);
  position: relative;
  overflow: hidden;
}

.control-card::before {
  content: "";
  position: absolute;
  background: linear-gradient(
  );
  transition: opacity var(--duration-normal);
  pointer-events: none;
}

.control-card:hover {
  border-color: var(--glass-border-hover);
}

.control-card:hover::before {
}

.control-header {
  display: flex;
  align-items: flex-start;
}

.control-icon {
  border-radius: var(--radius-xl);
  background: var(--glass-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  position: relative;
  overflow: hidden;
}

.control-icon::before {
  content: "";
  position: absolute;
  background: linear-gradient(
  );
  transition: opacity var(--duration-normal);
}

.control-card:hover .control-icon::before {
}

  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.control-info p {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.control-actions {
  display: flex;
}

.control-btn {
  background: var(--control-bg);
  border-radius: var(--radius-md);
  color: var(--control-fg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.control-btn:hover {
  background: var(--control-hover-bg);
  color: var(--control-hover-fg);
  border-color: var(--control-border);
  filter: drop-shadow(
  );
}

.control-btn.active {
  background: var(--control-active-bg);
  color: var(--control-active-fg);
  border-color: color-mix(
    in srgb,
    var(--control-border)
  );
}

.lighting-preset-grid {
  display: grid;
}

.preset-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--glass-bg);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  position: relative;
  overflow: hidden;
}

.preset-btn::before {
  content: "";
  position: absolute;
  background: linear-gradient(
  );
  transition: opacity var(--duration-fast);
}

.preset-btn:hover {
  border-color: var(--glass-border-hover);
}

.preset-btn:hover::before {
}

.preset-btn.active {
  box-shadow:
}

.preset-btn.active::before {
}

.preset-color {
  border-radius: var(--radius-full);
  position: relative;
  overflow: hidden;
}

.preset-shimmer {
  position: absolute;
  transition: all var(--duration-normal);
}

.preset-btn:hover .preset-shimmer {
}

.preset-name {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  text-align: center;
}

.audio-controls {
  display: flex;
  flex-direction: column;
}

.volume-control {
  display: flex;
  flex-direction: column;
}

.volume-control label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.volume-slider {
  background: var(--glass-bg);
  border-radius: var(--radius-sm);
  outline: none;
  appearance: none;
  position: relative;
}

.volume-slider::-webkit-slider-track {
  background: transparent;
  border-radius: var(--radius-sm);
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
  background: linear-gradient(
  );
  border-radius: var(--radius-full);
  cursor: pointer;
  box-shadow:
  transition: all var(--duration-fast);
}

.volume-slider::-webkit-slider-thumb:hover {
}

.volume-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  text-align: center;
}

.device-select {
  background: var(--glass-bg);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  transition: all var(--duration-fast);
  position: relative;
}

.device-select:focus {
  outline: none;
}

.device-select:hover {
  border-color: var(--glass-border-hover);
}

.connection-list {
  display: flex;
  flex-direction: column;
}

.connection-item {
  display: flex;
  align-items: center;
  border-radius: var(--radius-md);
  transition: all var(--duration-fast);
}

.connection-item.connected {
}

.connection-icon {
  font-size: var(--font-size-lg);
  color: var(--text-tertiary);
}

.connection-item.connected .connection-icon {
}

.connection-label {
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.connection-status {
  display: flex;
  align-items: center;
}

.status-dot {
  border-radius: var(--radius-full);
  background: var(--text-tertiary);
  position: relative;
}

.connection-item.connected .status-dot {
}

.connection-item.connected .status-dot::before {
  content: "";
  position: absolute;
}

@keyframes pulse-green {
    box-shadow:
  }
    box-shadow:
  }
}

@keyframes pulse-ring {
  }
  }
}

.devices-section {
  background: var(--glass-bg);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.section-subtitle {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.section-header > div:first-child {
}

.section-controls {
  display: flex;
}

.refresh-btn,
.calibrate-btn {
  display: flex;
  align-items: center;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.refresh-btn {
  background: transparent;
  color: var(--text-primary);
}

.refresh-btn:hover {
  background: var(--surface-glass);
}

.calibrate-btn {
  color: white;
}

.calibrate-btn:hover {
}

.spinning {
}

.devices-grid {
}

.device-card {
  background: var(--glass-bg);
  transition: all var(--duration-normal);
  position: relative;
  overflow: hidden;
}

.device-card:hover {
  border-color: var(--glass-border-hover);
}

.device-card::before {
  content: "";
  @apply position-absolute;
  transition: opacity var(--duration-normal);
}

.device-card.active::before {
  background: linear-gradient(
  );
}

.device-card.error::before {
}

.device-header {
  display: flex;
  align-items: flex-start;
}

.device-icon {
  border-radius: var(--radius-xl);
  background: var(--glass-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.device-icon::before {
  content: "";
  position: absolute;
  background: linear-gradient(
  );
  transition: opacity var(--duration-normal);
}

.device-card:hover .device-icon::before {
}

.device-type-icon {
  font-size: var(--font-size-xl);
}

.device-info {
}

.device-name {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.device-type {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.device-status-badge {
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.status-active {
  color: var(--text-success);
}

.status-inactive {
  background: var(--surface-elevated);
  color: var(--text-tertiary);
}

.status-error {
  color: var(--text-error);
}

:global([data-theme="dark"]) .status-active {
  color: var(--text-success);
}

:global([data-theme="dark"]) .status-error {
  color: var(--text-error);
}

.device-metrics {
}

.metrics-grid {
  display: grid;
}

.metric-item {
  text-align: center;
}

.battery-bar {
  background: var(--glass-bg);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.metric-label {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.metric-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.signal-bars {
  display: flex;
  align-items: flex-end;
}

.signal-bar {
  background: var(--glass-bg);
  transition: all var(--duration-fast);
  position: relative;
  overflow: hidden;
}

}
}
}
}

.signal-bar.active {
  background: linear-gradient(
    to top,
  );
  box-shadow:
}

.signal-bar.active::before {
  content: "";
  position: absolute;
  background: linear-gradient(
    to top,
    transparent,
  );
}

.battery-indicator {
  position: relative;
  background: var(--glass-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.battery-indicator::after {
  content: "";
  position: absolute;
  background: var(--glass-border);
}

.battery-fill {
  background: linear-gradient(
  );
  border-radius: var(--radius-sm);
  transition: width var(--duration-normal);
  box-shadow:
  position: relative;
}

.battery-fill.low {
  box-shadow:
}

.battery-fill.medium {
  box-shadow:
}

.battery-fill::before {
  content: "";
  position: absolute;
  background: linear-gradient(
    transparent,
  );
  border-radius: inherit;
}

.battery-text {
  position: absolute;
  color: var(--text-primary);
  font-weight: var(--font-weight-bold);
}

.device-actions {
  display: flex;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.action-btn:hover {
  background: var(--surface-glass);
}

.analytics-section {
  background: var(--glass-bg);
}

.analytics-grid {
}

.analytics-card {
  background: var(--glass-bg);
  position: relative;
  overflow: hidden;
  transition: all var(--duration-normal);
}

.analytics-card::before {
  content: "";
  position: absolute;
  background: linear-gradient(
  );
  transition: opacity var(--duration-normal);
  pointer-events: none;
}

.analytics-card:hover {
  border-color: var(--glass-border-hover);
}

.analytics-card:hover::before {
}

.analytics-card--large {
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

  display: flex;
  align-items: center;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.chart-legend {
  display: flex;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.legend-color {
  border-radius: var(--radius-sm);
}

.legend-color.cpu {
}
.legend-color.memory {
}
.legend-color.network {
}

.chart-container {
  position: relative;
}

.chart-area {
  position: relative;
  background: var(--glass-bg);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.chart-line {
  @apply position-absolute;
}

.cpu-line {
}

.memory-line {
}

.network-line {
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.device-overview {
  display: grid;
}

.overview-item {
  display: flex;
  align-items: center;
  background: var(--glass-bg);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast);
  position: relative;
  overflow: hidden;
}

.overview-item::before {
  content: "";
  position: absolute;
  background: linear-gradient(
  );
  transition: opacity var(--duration-fast);
}

.overview-item:hover {
  border-color: var(--glass-border-hover);
}

.overview-item:hover::before {
}

.overview-icon {
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.overview-device-icon {
  font-size: var(--font-size-lg);
}

.overview-info {
}

.overview-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.overview-count {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.health-score {
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
}

.health-score.excellent {
}

.health-score.good {
}

.health-score.fair {
}

.health-score.poor {
}

:global([data-theme="dark"]) .health-score.excellent {
}

:global([data-theme="dark"]) .health-score.good {
}

:global([data-theme="dark"]) .health-score.fair {
}

:global([data-theme="dark"]) .health-score.poor {
}

.health-breakdown {
  display: flex;
  flex-direction: column;
}

.health-item {
  display: flex;
  align-items: center;
}

.health-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}


.health-value {
  text-align: right;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.calibration-modal-overlay {
  position: fixed;
  background: var(--modal-backdrop);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
}

.calibration-modal {
  background: var(--glass-bg);
  max-width: var(--page-narrow-width);
  overflow: hidden;
  box-shadow:
  position: relative;
}

.calibration-modal::before {
  content: "";
  position: absolute;
  background: linear-gradient(
  );
  pointer-events: none;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-tertiary);
  font-size: var(--font-size-xl);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all var(--duration-fast);
}

.close-btn:hover {
  background: var(--surface-glass);
  color: var(--text-primary);
}

.modal-content {
  overflow-y: auto;
}

.calibration-steps {
  display: flex;
  flex-direction: column;
}

.calibration-step {
  display: flex;
  border-radius: var(--radius-xl);
  transition: all var(--duration-normal);
}

.calibration-step.active {
  background: var(--surface-glass);
}

.calibration-step.completed {
}

.step-indicator {
  border-radius: var(--radius-full);
  background: var(--surface-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
}

.calibration-step.active .step-indicator {
  color: white;
}

.calibration-step.completed .step-indicator {
  color: white;
}

  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.step-content p {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.calibration-progress {
  display: flex;
  flex-direction: column;
}

.progress {
  background: var(--glass-bg);
  border-radius: var(--radius-sm);
  overflow: hidden;
  position: relative;
}

.progress--xs {
}

.progress--sm {
}

.progress-bar {
  background: linear-gradient(
  );
  border-radius: var(--radius-sm);
  transition: width var(--duration-normal);
  position: relative;
}

.progress-bar::before {
  content: "";
  position: absolute;
  background: linear-gradient(
  );
  border-radius: inherit;
}

.progress-bar::after {
  content: "";
  position: absolute;
  background: linear-gradient(
    transparent,
  );
  border-radius: inherit;
}

@keyframes shimmer {
  }
  }
}

.progress-text {
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.modal-actions {
  display: flex;
}

.modal-actions .glass-button-outline,
.modal-actions .glass-button-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-fast);
  cursor: pointer;
}

.modal-actions .glass-button-outline {
  background: transparent;
  color: var(--text-primary);
}

.modal-actions .glass-button-primary {
  color: white;
}

.modal-actions .glass-button-primary:disabled {
  cursor: not-allowed;
}

@keyframes rgbPulse {
  }
  }
  }
}

@keyframes pulse-ring {
  }
  }
}

@keyframes spin {
  from {
  }
  to {
  }
}

@keyframes mdi-spin {
  }
  }
}

@media (max-width: var(--breakpoint-md)) {
  .stats-bar {
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .section-controls {
    justify-content: flex-start;
  }

  .device-actions {
    flex-direction: column;
  }

  .metrics-grid {
  }

  .device-overview {
  }

  .lighting-preset-grid {
  }

  .calibration-modal {
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .stats-bar {
  }

  .modal-actions {
    flex-direction: column;
  }

  .overview-item {
    flex-direction: column;
    text-align: center;
  }

  .control-actions {
    flex-direction: column;
  }

  .metrics-grid {
  }

  .lighting-preset-grid {
  }
}

.unified-input {
  background: var(--glass-bg);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  transition: all var(--duration-fast);
  position: relative;
}

.unified-input:focus {
  outline: none;
  box-shadow:
}

.unified-input:hover {
  border-color: var(--glass-border-hover);
}

.glass-section {
}
</style>
