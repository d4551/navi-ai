<!--
THE CLOUD - Gaming Industry Intelligence Network
Modern cloud intelligence and data syndication with unified design
-->
<template>
  <div class="unified-container the-cloud">
    <StandardPageLayout
      page-type="gaming"
      :title="'THE CLOUD'"
      :subtitle="'Information flows like fog through the city. We control the weather.'"
      :title-icon="'mdi-weather-fog'"
      max-width="xl"
      :hero-stats="[
        { label: cloudStatus.connected ? 'Connected' : 'Disconnected' },
        { label: cloudStatus.region || 'No Connection' },
      ]"
    >
      <!-- Services Grid -->
      <section class="services-section">
        <div class="section-header">
          <h2 class="section-title">
            <AppIcon name="mdi-cloud" class="section-icon" />
            Azure Services
          </h2>
          <p class="section-description">
            Manage and monitor your cloud services
          </p>
        </div>
        <div class="responsive-grid responsive-grid--cards-lg">
          <!-- OpenAI Service -->
          <div
            class="service-card section-card"
            :class="{ active: services.openai.enabled }"
          >
            <div class="service-header">
              <div class="service-meta">
                <div class="service-icon">
                  <AppIcon name="mdi-robot" />
                </div>
                <div class="service-info">
                  <h3 class="card-title">Azure OpenAI</h3>
                  <p class="card-description">GPT models and AI completions</p>
                </div>
              </div>
              <div class="service-toggle">
                <label class="switch">
                  <input
                    v-model="services.openai.enabled"
                    type="checkbox"
                    @change="toggleService('openai')"
                  />
                  <span class="slider"></span>
                </label>
              </div>
            </div>

            <div v-if="services.openai.enabled" class="service-metrics">
              <div class="stats-grid">
                <div class="metric-item">
                  <div class="metric-content">
                    <span class="metric-label">Requests</span>
                    <span class="metric-value">{{
                      services.openai?.metrics?.requests || 0
                    }}</span>
                  </div>
                  <AppIcon name="mdi-chart-line" class="metric-icon" />
                </div>
                <div class="metric-item">
                  <div class="metric-content">
                    <span class="metric-label">Tokens</span>
                    <span class="metric-value">{{
                      formatNumber(services.openai?.metrics?.tokens)
                    }}</span>
                  </div>
                  <AppIcon name="mdi-database" class="metric-icon" />
                </div>
                <div class="metric-item">
                  <div class="metric-content">
                    <span class="metric-label">Uptime</span>
                    <span class="metric-value">{{ services.openai?.metrics?.uptime || 0 }}%</span>
                  </div>
                  <AppIcon name="mdi-check-circle" class="metric-icon" />
                </div>
              </div>
            </div>

            <div class="service-actions">
              <UnifiedButton
                variant="outline"
                leading-icon="mdi-cog"
                size="sm"
                @click="configureService('openai')"
              >
                Configure
              </UnifiedButton>
              <UnifiedButton
                variant="gaming"
                leading-icon="mdi-play"
                size="sm"
                :disabled="!services.openai.enabled"
                @click="testService('openai')"
              >
                Test API
              </UnifiedButton>
            </div>
          </div>

          <!-- Cognitive Services -->
          <div
            class="service-card section-card"
            :class="{ active: services.cognitive.enabled }"
          >
            <div class="service-header">
              <div class="service-meta">
                <div class="service-icon">
                  <AppIcon name="mdi-brain" />
                </div>
                <div class="service-info">
                  <h3 class="card-title">Cognitive Services</h3>
                  <p class="card-description">
                    Text analysis, sentiment, entities
                  </p>
                </div>
              </div>
              <div class="service-toggle">
                <label class="switch">
                  <input
                    v-model="services.cognitive.enabled"
                    type="checkbox"
                    @change="toggleService('cognitive')"
                  />
                  <span class="slider"></span>
                </label>
              </div>
            </div>

            <div v-if="services.cognitive.enabled" class="service-metrics">
              <div class="stats-grid">
                <div class="metric-item">
                  <div class="metric-content">
                    <span class="metric-label">Analyses</span>
                    <span class="metric-value">{{
                      services.cognitive?.metrics?.analyses || 0
                    }}</span>
                  </div>
                </div>
                <div class="metric-item">
                  <div class="metric-content">
                    <span class="metric-label">Languages</span>
                    <span class="metric-value">{{
                      services.cognitive?.metrics?.languages || 0
                    }}</span>
                  </div>
                </div>
                <div class="metric-item">
                  <div class="metric-content">
                    <span class="metric-label">Accuracy</span>
                    <span class="metric-value">{{ services.cognitive?.metrics?.accuracy || 0 }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="service-actions">
              <UnifiedButton
                variant="outline"
                leading-icon="mdi-cog"
                size="sm"
                @click="configureService('cognitive')"
              >
                Configure
              </UnifiedButton>
              <UnifiedButton
                variant="gaming"
                leading-icon="mdi-play"
                size="sm"
                :disabled="!services.cognitive.enabled"
                @click="testService('cognitive')"
              >
                Test API
              </UnifiedButton>
            </div>
          </div>

          <!-- Storage Account -->
          <div
            class="service-card section-card"
            :class="{ active: services.storage.enabled }"
          >
            <div class="service-header">
              <div class="service-meta">
                <div class="service-icon">
                  <AppIcon name="mdi-database" />
                </div>
                <div class="service-info">
                  <h3 class="card-title">Blob Storage</h3>
                  <p class="card-description">Document and file storage</p>
                </div>
              </div>
              <div class="service-toggle">
                <label class="switch">
                  <input
                    v-model="services.storage.enabled"
                    type="checkbox"
                    @change="toggleService('storage')"
                  />
                  <span class="slider"></span>
                </label>
              </div>
            </div>

            <div v-if="services.storage.enabled" class="service-metrics">
              <div class="stats-grid">
                <div class="metric-item">
                  <div class="metric-content">
                    <span class="metric-label">Files</span>
                    <span class="metric-value">{{
                      services.storage?.metrics?.files || 0
                    }}</span>
                  </div>
                </div>
                <div class="metric-item">
                  <div class="metric-content">
                    <span class="metric-label">Storage</span>
                    <span class="metric-value">{{
                      formatStorage(services.storage?.metrics?.size)
                    }}</span>
                  </div>
                </div>
                <div class="metric-item">
                  <div class="metric-content">
                    <span class="metric-label">Bandwidth</span>
                    <span class="metric-value">{{
                      formatStorage(services.storage?.metrics?.bandwidth)
                    }}/mo</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="service-actions">
              <UnifiedButton
                variant="outline"
                leading-icon="mdi-cog"
                size="sm"
                @click="configureService('storage')"
              >
                Configure
              </UnifiedButton>
              <UnifiedButton
                variant="gaming"
                leading-icon="mdi-play"
                size="sm"
                :disabled="!services.storage.enabled"
                @click="testService('storage')"
              >
                Test API
              </UnifiedButton>
            </div>
          </div>

          <!-- Event Hub -->
          <div
            class="service-card section-card"
            :class="{ active: services.eventhub.enabled }"
          >
            <div class="service-header">
              <div class="service-meta">
                <div class="service-icon">
                  <AppIcon name="mdi-transit-connection" />
                </div>
                <div class="service-info">
                  <h3 class="card-title">Event Hub</h3>
                  <p class="card-description">Real-time event streaming</p>
                </div>
              </div>
              <div class="service-toggle">
                <label class="switch">
                  <input
                    v-model="services.eventhub.enabled"
                    type="checkbox"
                    @change="toggleService('eventhub')"
                  />
                  <span class="slider"></span>
                </label>
              </div>
            </div>

            <div v-if="services.eventhub.enabled" class="service-metrics">
              <div class="stats-grid">
                <div class="metric-item">
                  <div class="metric-content">
                    <span class="metric-label">Events</span>
                    <span class="metric-value">{{
                      formatNumber(services.eventhub?.metrics?.events)
                    }}</span>
                  </div>
                </div>
                <div class="metric-item">
                  <div class="metric-content">
                    <span class="metric-label">Throughput</span>
                    <span class="metric-value">{{ services.eventhub?.metrics?.throughput || 0 }}/s</span>
                  </div>
                </div>
                <div class="metric-item">
                  <div class="metric-content">
                    <span class="metric-label">Partitions</span>
                    <span class="metric-value">{{
                      services.eventhub?.metrics?.partitions || 0
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="service-actions">
              <UnifiedButton
                variant="outline"
                leading-icon="mdi-cog"
                size="sm"
                @click="configureService('eventhub')"
              >
                Configure
              </UnifiedButton>
              <UnifiedButton
                variant="gaming"
                leading-icon="mdi-play"
                size="sm"
                :disabled="!services.eventhub.enabled"
                @click="testService('eventhub')"
              >
                Test API
              </UnifiedButton>
            </div>
          </div>

          <!-- Key Vault -->
          <div
            class="service-card section-card"
            :class="{ active: services.keyvault.enabled }"
          >
            <div class="service-header">
              <div class="service-meta">
                <div class="service-icon">
                  <AppIcon name="mdi-lock" />
                </div>
                <div class="service-info">
                  <h3 class="card-title">Key Vault</h3>
                  <p class="card-description">
                    Secure key and secret management
                  </p>
                </div>
              </div>
              <div class="service-toggle">
                <label class="switch">
                  <input
                    v-model="services.keyvault.enabled"
                    type="checkbox"
                    @change="toggleService('keyvault')"
                  />
                  <span class="slider"></span>
                </label>
              </div>
            </div>

            <div v-if="services.keyvault.enabled" class="service-metrics">
              <div class="stats-grid">
                <div class="metric-item">
                  <div class="metric-content">
                    <span class="metric-label">Secrets</span>
                    <span class="metric-value">{{
                      services.keyvault?.metrics?.secrets || 0
                    }}</span>
                  </div>
                </div>
                <div class="metric-item">
                  <div class="metric-content">
                    <span class="metric-label">Keys</span>
                    <span class="metric-value">{{
                      services.keyvault?.metrics?.keys || 0
                    }}</span>
                  </div>
                </div>
                <div class="metric-item">
                  <div class="metric-content">
                    <span class="metric-label">Access</span>
                    <span class="metric-value">{{ services.keyvault?.metrics?.access || 0 }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="service-actions">
              <UnifiedButton
                variant="outline"
                leading-icon="mdi-cog"
                size="sm"
                @click="configureService('keyvault')"
              >
                Configure
              </UnifiedButton>
              <UnifiedButton
                variant="gaming"
                leading-icon="mdi-play"
                size="sm"
                :disabled="!services.keyvault.enabled"
                @click="testService('keyvault')"
              >
                Test API
              </UnifiedButton>
            </div>
          </div>

          <!-- IoT Hub -->
          <div
            class="service-card section-card"
            :class="{ active: services.iothub.enabled }"
          >
            <div class="service-header">
              <div class="service-meta">
                <div class="service-icon">
                  <AppIcon name="mdi-chip" />
                </div>
                <div class="service-info">
                  <h3 class="card-title">IoT Hub</h3>
                  <p class="card-description">
                    Device connectivity and management
                  </p>
                </div>
              </div>
              <div class="service-toggle">
                <label class="switch">
                  <input
                    v-model="services.iothub.enabled"
                    type="checkbox"
                    @change="toggleService('iothub')"
                  />
                  <span class="slider"></span>
                </label>
              </div>
            </div>

            <div v-if="services.iothub.enabled" class="service-metrics">
              <div class="stats-grid">
                <div class="metric-item">
                  <div class="metric-content">
                    <span class="metric-label">Devices</span>
                    <span class="metric-value">{{
                      services.iothub?.metrics?.devices || 0
                    }}</span>
                  </div>
                </div>
                <div class="metric-item">
                  <div class="metric-content">
                    <span class="metric-label">Messages</span>
                    <span class="metric-value">{{
                      formatNumber(services.iothub?.metrics?.messages)
                    }}</span>
                  </div>
                </div>
                <div class="metric-item">
                  <div class="metric-content">
                    <span class="metric-label">Online</span>
                    <span class="metric-value">{{ services.iothub?.metrics?.online || 0 }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="service-actions">
              <UnifiedButton
                variant="outline"
                leading-icon="mdi-cog"
                size="sm"
                @click="configureService('iothub')"
              >
                Configure
              </UnifiedButton>
              <UnifiedButton
                variant="gaming"
                leading-icon="mdi-play"
                size="sm"
                :disabled="!services.iothub.enabled"
                @click="testService('iothub')"
              >
                Test API
              </UnifiedButton>
            </div>
          </div>
        </div>
      </section>

      <!-- Cloud Analytics Dashboard -->
      <section class="analytics-section">
        <div class="section-header">
          <div class="header-content">
            <h2 class="section-title">
              <AppIcon name="mdi-chart-line" class="section-icon" />
              Cloud Analytics
            </h2>
            <p class="section-description">
              Monitor performance and costs across your services
            </p>
          </div>
          <div class="header-actions">
            <div class="time-filter">
              <label class="filter-label">Time Range:</label>
              <select
                v-model="analyticsTimeframe"
                class="glass-input"
                @change="updateAnalytics"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
            <UnifiedButton
              variant="outline"
              leading-icon="mdi-refresh"
              size="sm"
              @click="updateAnalytics"
            >
              Refresh
            </UnifiedButton>
          </div>
        </div>

        <div class="responsive-grid responsive-grid--cards-md">
          <!-- Cost Overview -->
          <div class="analytics-card section-card">
            <div class="card-header">
              <h3 class="card-title">
                <AppIcon name="mdi-currency-usd" />
                Cost Overview
              </h3>
              <div class="trend-indicator positive">
                <AppIcon name="mdi-trending-down" />
                -12%
              </div>
            </div>
            <div class="cost-breakdown">
              <div class="cost-item">
                <span class="service-name">OpenAI</span>
                <span class="cost-amount">$24.50</span>
              </div>
              <div class="cost-item">
                <span class="service-name">Storage</span>
                <span class="cost-amount">$8.20</span>
              </div>
              <div class="cost-item">
                <span class="service-name">Cognitive</span>
                <span class="cost-amount">$15.80</span>
              </div>
              <div class="cost-total">
                <span class="service-name">Total</span>
                <span class="cost-amount">$48.50</span>
              </div>
            </div>
          </div>

          <!-- Performance Metrics -->
          <div class="analytics-card section-card">
            <div class="card-header">
              <h3 class="card-title">
                <AppIcon name="mdi-chart-bar" />
                Performance
              </h3>
              <div class="trend-indicator positive">
                <AppIcon name="mdi-trending-up" />
                +8%
              </div>
            </div>
            <div class="performance-metrics">
              <div class="perf-item">
                <div class="perf-label">Avg Response</div>
                <div class="perf-value">142ms</div>
                <div class="progress progress--xs">
                  <div class="progress-bar" :style="{ width: '85%' }"></div>
                </div>
              </div>
              <div class="perf-item">
                <div class="perf-label">Success Rate</div>
                <div class="perf-value">99.2%</div>
                <div class="progress progress--xs">
                  <div
                    class="progress-bar bg-success"
                    :style="{ width: '99%' }"
                  ></div>
                </div>
              </div>
              <div class="perf-item">
                <div class="perf-label">Availability</div>
                <div class="perf-value">99.9%</div>
                <div class="progress progress--xs">
                  <div
                    class="progress-bar bg-success"
                    :style="{ width: '100%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Security Status -->
          <div class="analytics-card section-card">
            <div class="card-header">
              <h3 class="card-title">
                <AppIcon name="mdi-shield-check" />
                Security Status
              </h3>
              <div class="trend-indicator neutral">
                <AppIcon name="mdi-shield" />
                Secure
              </div>
            </div>
            <div class="security-status">
              <div class="security-item">
                <AppIcon name="mdi-check-circle-outline" />
                <span>SSL/TLS Enabled</span>
              </div>
              <div class="security-item">
                <AppIcon name="mdi-check-circle-outline" />
                <span>Key Vault Configured</span>
              </div>
              <div class="security-item">
                <AppIcon name="mdi-check-circle-outline" />
                <span>Access Policies Active</span>
              </div>
              <div class="security-item">
                <AppIcon
                  name="mdi-alert-circle-outline"
                  class="security-icon warning"
                />
                <span>MFA Recommended</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Service Configuration Modal -->
      <Teleport to="body">
        <div
          v-if="configModal.show"
          class="config-modal-overlay"
          @click="closeConfigModal"
        >
          <div class="config-modal section-card" @click.stop>
            <div class="modal-header">
              <h2 class="card-title">
                Configure {{ configModal.serviceName }}
              </h2>
              <UnifiedButton
                variant="ghost"
                icon-only
                icon="mdi-close"
                aria-label="Close"
                @click="closeConfigModal"
              />
            </div>

            <div class="modal-content">
              <div class="form-grid">
                <!-- Dynamic configuration based on service type -->
                <div class="form-group">
                  <label class="form-label">API Endpoint</label>
                  <input
                    v-model="configModal.config.endpoint"
                    type="text"
                    class="glass-input"
                    placeholder="https://your-service.azure.com"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">API Key</label>
                  <input
                    v-model="configModal.config.apiKey"
                    type="password"
                    class="glass-input"
                    placeholder="••••••••••••••••"
                  />
                </div>

                <div v-if="configModal.service === 'openai'" class="form-group">
                  <label class="form-label">Deployment Name</label>
                  <input
                    v-model="configModal.config.deploymentName"
                    type="text"
                    class="glass-input"
                    placeholder="gpt-35-turbo"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Region</label>
                  <select
                    v-model="configModal.config.region"
                    class="glass-input"
                  >
                    <option value="">Select Region</option>
                    <option value="eastus">East US</option>
                    <option value="westus2">West US 2</option>
                    <option value="northeurope">North Europe</option>
                    <option value="westeurope">West Europe</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <UnifiedButton variant="outline" @click="closeConfigModal">
                Cancel
              </UnifiedButton>
              <UnifiedButton
                variant="gaming"
                leading-icon="mdi-content-save"
                @click="saveConfiguration"
              >
                Save Configuration
              </UnifiedButton>
            </div>
          </div>
        </div>
      </Teleport>
    </StandardPageLayout>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';

import AppIcon from "@/components/ui/AppIcon.vue";

import { ref, reactive} from "vue";
import StandardPageLayout from "@/components/layout/StandardPageLayout.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";

// Types
interface ServiceMetrics {
  [key: string]: number | undefined;
}

interface Service {
  enabled: boolean;
  configured: boolean;
  metrics: ServiceMetrics;
}

interface Services {
  [key: string]: Service;
  openai: Service;
  cognitive: Service;
  storage: Service;
  eventhub: Service;
  keyvault: Service;
  iothub: Service;
}

// Import the Azure service (mock import for now)
// import { azureService } from '@/modules/integration/AzureService'

// State
const loading = ref(false);
const analyticsTimeframe = ref("7d");

// Safe access handled directly in template with optional chaining

// Cloud connection status
const cloudStatus = reactive({
  connected: true,
  region: "East US",
  lastCheck: new Date(),
  health: "healthy",
});

// Services configuration
const services: Services = reactive({
  openai: {
    enabled: true,
    configured: true,
    metrics: {
      requests: 1247,
      tokens: 892140,
      uptime: 99.9,
    },
  },
  cognitive: {
    enabled: true,
    configured: true,
    metrics: {
      analyses: 324,
      languages: 12,
      accuracy: 96.8,
    },
  },
  storage: {
    enabled: true,
    configured: true,
    metrics: {
      files: 2856,
      size: 15728640, // bytes
      bandwidth: 52428800, // bytes
    },
  },
  eventhub: {
    enabled: false,
    configured: false,
    metrics: {
      events: 0,
      throughput: 0,
      partitions: 4,
    },
  },
  keyvault: {
    enabled: true,
    configured: true,
    metrics: {
      secrets: 8,
      keys: 3,
      access: 100,
    },
  },
  iothub: {
    enabled: false,
    configured: false,
    metrics: {
      devices: 0,
      messages: 0,
      online: 0,
    },
  },
});

// Configuration modal state
const configModal = reactive({
  show: false,
  service: "",
  serviceName: "",
  config: {
    endpoint: "",
    apiKey: "",
    region: "",
    deploymentName: "",
  },
});

// Methods
const initializeAzure = async () => {
  try {
    loading.value = true;
    // await azureService.initialize()
    cloudStatus.connected = true;
    console.log("Azure services initialized");
  } catch (_error) {
    console.error("Failed to initialize Azure services:", error);
    cloudStatus.connected = false;
  } finally {
    loading.value = false;
  }
};

const toggleService = async (serviceName: string) => {
  try {
    const service = services[serviceName];
    if (!service) {
      console.error(`Service ${serviceName} not found`);
      return;
    }

    console.log(`${service.enabled ? "Enabling" : "Disabling"} ${serviceName}`);

    // In real implementation, would call Azure service
    // if (service.enabled) {
    //   await azureService.enableService(serviceName)
    // } else {
    //   await azureService.disableService(serviceName)
    // }
  } catch (_error) {
    console.error(`Failed to toggle ${serviceName}:`, error);
    // Revert the toggle on error
    if (services[serviceName]) {
      services[serviceName].enabled = !services[serviceName].enabled;
    }
  }
};

const configureService = (serviceName: string) => {
  try {
    const service = services[serviceName];
    if (!service) {
      console.error(`Service ${serviceName} not found`);
      return;
    }

    configModal.service = serviceName;
    configModal.serviceName = formatServiceName(serviceName);
    configModal.show = true;

    // Load existing configuration if available
    if (service.configured) {
      // In real implementation, would load from Azure service
      configModal.config = {
        endpoint: "https://example.azure.com",
        apiKey: "••••••••••••••••",
        region: "eastus",
        deploymentName: serviceName === "openai" ? "gpt-35-turbo" : "",
      };
    } else {
      // Reset config for new services
      configModal.config = {
        endpoint: "",
        apiKey: "",
        region: "",
        deploymentName: "",
      };
    }
  } catch (_error) {
    console.error("Error configuring service:", error);
  }
};

const closeConfigModal = () => {
  configModal.show = false;
  configModal.service = "";
  configModal.serviceName = "";
  configModal.config = {
    endpoint: "",
    apiKey: "",
    region: "",
    deploymentName: "",
  };
};

const saveConfiguration = async () => {
  try {
    console.log(
      "Saving configuration for",
      configModal.service,
      configModal.config,
    );

    // In real implementation, would save to Azure service
    // await azureService.configureService(configModal.service, configModal.config)

    services[configModal.service].configured = true;
    closeConfigModal();
  } catch (_error) {
    console.error("Failed to save configuration:", error);
  }
};

const testService = async (serviceName: string) => {
  try {
    const service = services[serviceName];
    if (!service) {
      console.error(`Service ${serviceName} not found`);
      alert(`Service ${serviceName} not found`);
      return;
    }

    if (!service.enabled) {
      alert(
        `${formatServiceName(serviceName)} service is not enabled. Please enable it first.`,
      );
      return;
    }

    console.log("Testing service:", serviceName);

    // Simulate a delay for testing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In real implementation, would test Azure service
    // const result = await azureService.testService(serviceName)
    // console.log('Service test result:', result)

    alert(`${formatServiceName(serviceName)} service is working correctly!`);
  } catch (_error) {
    console.error("Service test failed:", error);
    alert(`${formatServiceName(serviceName)} service test failed: ${_error}`);
  }
};

const updateAnalytics = () => {
  console.log("Updating analytics for timeframe:", analyticsTimeframe.value);
  // In real implementation, would fetch new analytics data
};


const formatServiceName = (serviceName: string) => {
  const names: { [key: string]: string } = {
    openai: "Azure OpenAI",
    cognitive: "Cognitive Services",
    storage: "Blob Storage",
    eventhub: "Event Hub",
    keyvault: "Key Vault",
    iothub: "IoT Hub",
  };
  return names[serviceName] || serviceName;
};

const formatNumber = (num: number | undefined | null) => {
  if (!num && num !== 0) return "0";
  if (typeof num !== "number") return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

const formatStorage = (bytes: number | undefined | null) => {
  if (!bytes && bytes !== 0) return "0B";
  if (typeof bytes !== "number") return "0B";
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + "GB";
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + "MB";
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + "KB";
  return bytes + "B";
};

// Initialize
onMounted(() => {
  initializeAzure();
});
</script>

<style scoped>

.the-cloud {
}

.header-content {
  display: flex;
  flex-direction: column;
}

  .header-content {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.services-section {
}

.section-header {
  text-align: center;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-icon {
}

.service-card.active::before {
  content: "";
  position: absolute;
  background: linear-gradient(
  );
}

.service-meta {
  display: flex;
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.service-icon {
  border-radius: var(--radius-lg);
  background: var(--surface-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
}

.service-info {
}

.service-toggle {
}

.switch {
  position: relative;
  display: inline-block;
}

.switch input {
}

.slider {
  position: absolute;
  cursor: pointer;
  background-color: var(--surface-muted);
  transition: all var(--duration-normal);
}

.slider:before {
  position: absolute;
  content: "";
  background-color: var(--surface-base);
  transition: all var(--duration-normal);
  box-shadow: var(--shadow-sm);
}

input:checked + .slider {
  background: linear-gradient(
  );
}

input:checked + .slider:before {
}

.service-metrics {
}

.metric-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--surface-elevated);
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast);
}

.metric-item:hover {
  background: var(--surface-hover);
}

.metric-content {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.metric-value {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.metric-icon {
  transition: opacity var(--duration-fast);
}

.metric-item:hover .metric-icon {
}

.service-actions {
  display: flex;
}

.analytics-section {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
}

.header-actions {
  display: flex;
  align-items: center;
}

.time-filter {
  display: flex;
  align-items: center;
}

.filter-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trend-indicator {
  display: flex;
  align-items: center;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  backdrop-filter: var(--glass-backdrop-blur);
}

.trend-indicator.positive {
}

.trend-indicator.neutral {
  background: var(--glass-bg);
  color: var(--text-secondary);
}

.cost-breakdown {
  display: flex;
  flex-direction: column;
}

.cost-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cost-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: var(--font-weight-semibold);
}

.performance-metrics {
  display: flex;
  flex-direction: column;
}

.perf-item {
  display: flex;
  flex-direction: column;
}

.perf-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.perf-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.security-status {
  display: flex;
  flex-direction: column;
}

.security-item {
  display: flex;
  align-items: center;
}

.security-icon.warning {
}

.config-modal-overlay {
  position: fixed;
  background: var(--modal-backdrop);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
}

.config-modal {
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-content {
  overflow-y: auto;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.modal-actions {
  display: flex;
}

  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    justify-content: space-between;
  }

  .service-actions,
  .modal-actions {
    flex-direction: column;
  }

  .service-header {
    flex-direction: column;
  }

  .service-toggle {
    align-self: flex-start;
  }
}
</style>
