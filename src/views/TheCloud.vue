<!--
THE CLOUD - Gaming Industry Intelligence Network
Modern cloud intelligence and data syndication with unified design
-->
<template>
  <div class="unified-container the-cloud font-sans">
    <StandardPageLayout
      page-type="gaming"
      :title="'THE CLOUD'"
      :subtitle="'Information flows like fog through the city. We control the weather.'"
      :title-icon="'mdi-weather-fog'"
      max-width="xl"
      :hero-stats="[
        { label: cloudStatus.connected ? 'Connected' : 'Disconnected' },
        { label: cloudStatus.region || 'No Connection' }
      ]"
    >
      <!-- Services Grid -->
      <section class="services-section">
        <div class="section-header">
          <h2 class="section-title">
            <AppIcon name="CloudIcon" class="section-icon" />
            Azure Services
          </h2>
          <p class="section-description">Manage and monitor your cloud services</p>
        </div>
        <div class="responsive-grid responsive-grid--cards-lg">
          <!-- OpenAI Service -->
          <div class="service-card glass p-glass-md gap-glass-md rounded-lg neon-interactive" :class="{ active: services.openai.enabled }">
            <div class="service-header">
              <div class="service-meta">
                <div class="service-icon">
                  <AppIcon name="CpuChipIcon" />
                </div>
                <div class="service-info">
                  <h3 class="card-title">Azure OpenAI</h3>
                  <p class="card-description">GPT models and AI completions</p>
                </div>
              </div>
              <div class="service-toggle">
                <label class="switch">
                  <input v-model="services.openai.enabled" type="checkbox" @change="toggleService('openai')">
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          
            <div v-if="services.openai.enabled" class="service-metrics">
              <div class="stats-grid">
                <div class="metric-item">
                  <div class="metric-content">
                    <span class="metric-label">Requests</span>
                    <span class="metric-value">{{ services.openai?.metrics?.requests || 0 }}</span>
                  </div>
                  <AppIcon name="ChartBarIcon" class="metric-icon" />
                </div>
                <div class="metric-item">
                  <div class="metric-content">
                    <span class="metric-label">Tokens</span>
                    <span class="metric-value">{{ formatNumber(services.openai?.metrics?.tokens) }}</span>
                  </div>
                  <AppIcon name="CircleStackIcon" class="metric-icon" />
                </div>
                <div class="metric-item">
                  <div class="metric-content">
                    <span class="metric-label">Uptime</span>
                    <span class="metric-value">{{ services.openai?.metrics?.uptime || 0 }}%</span>
                  </div>
                  <AppIcon name="CheckCircleIcon" class="metric-icon" />
                </div>
              </div>
            </div>
          
            <div class="service-actions">
              <UnifiedButton variant="outline" leading-icon="CogIcon" size="sm" @click="configureService('openai')">
                Configure
              </UnifiedButton>
              <UnifiedButton variant="gaming" leading-icon="PlayIcon" size="sm" :disabled="!services.openai.enabled" @click="testService('openai')">
                Test API
              </UnifiedButton>
            </div>
          </div>

          <!-- Cognitive Services -->
          <div class="service-card glass p-glass-md gap-glass-md rounded-lg neon-interactive" :class="{ active: services.cognitive.enabled }">
            <div class="service-header">
              <div class="service-meta">
                <div class="service-icon">
                  <AppIcon name="CpuChipIcon" />
                </div>
                <div class="service-info">
                  <h3 class="card-title">Cognitive Services</h3>
                  <p class="card-description">Text analysis, sentiment, entities</p>
                </div>
              </div>
              <div class="service-toggle">
                <label class="switch">
                  <input v-model="services.cognitive.enabled" type="checkbox" @change="toggleService('cognitive')">
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          
            <div v-if="services.cognitive.enabled" class="service-metrics">
              <div class="stats-grid">
                <div class="metric-item">
                  <div class="metric-content">
                    <span class="metric-label">Analyses</span>
                    <span class="metric-value">{{ services.cognitive?.metrics?.analyses || 0 }}</span>
                  </div>
                </div>
                <div class="metric-item">
                  <div class="metric-content">
                    <span class="metric-label">Languages</span>
                    <span class="metric-value">{{ services.cognitive?.metrics?.languages || 0 }}</span>
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
              <UnifiedButton variant="outline" leading-icon="CogIcon" size="sm" @click="configureService('cognitive')">Configure</UnifiedButton>
              <UnifiedButton variant="gaming" leading-icon="PlayIcon" size="sm" :disabled="!services.cognitive.enabled" @click="testService('cognitive')">Test API</UnifiedButton>
            </div>
          </div>

          <!-- Storage Account -->
          <div class="service-card glass p-glass-md gap-glass-md rounded-lg neon-interactive" :class="{ active: services.storage.enabled }">
            <div class="service-header">
              <div class="service-meta">
                <div class="service-icon">
                  <AppIcon name="CircleStackIcon" />
                </div>
                <div class="service-info">
                  <h3 class="card-title">Blob Storage</h3>
                  <p class="card-description">Document and file storage</p>
                </div>
              </div>
              <div class="service-toggle">
                <label class="switch">
                  <input v-model="services.storage.enabled" type="checkbox" @change="toggleService('storage')">
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          
            <div v-if="services.storage.enabled" class="service-metrics">
              <div class="stats-grid">
                <div class="metric-item">
                  <div class="metric-content">
                    <span class="metric-label">Files</span>
                    <span class="metric-value">{{ services.storage?.metrics?.files || 0 }}</span>
                  </div>
                </div>
                <div class="metric-item">
                  <div class="metric-content">
                    <span class="metric-label">Storage</span>
                    <span class="metric-value">{{ formatStorage(services.storage?.metrics?.size) }}</span>
                  </div>
                </div>
                <div class="metric-item">
                  <div class="metric-content">
                    <span class="metric-label">Bandwidth</span>
                    <span class="metric-value">{{ formatStorage(services.storage?.metrics?.bandwidth) }}/mo</span>
                  </div>
                </div>
              </div>
            </div>
          
            <div class="service-actions">
              <UnifiedButton variant="outline" leading-icon="CogIcon" size="sm" @click="configureService('storage')">Configure</UnifiedButton>
              <UnifiedButton variant="gaming" leading-icon="PlayIcon" size="sm" :disabled="!services.storage.enabled" @click="testService('storage')">Test API</UnifiedButton>
            </div>
          </div>

          <!-- Event Hub -->
          <div class="service-card glass p-glass-md gap-glass-md rounded-lg neon-interactive" :class="{ active: services.eventhub.enabled }">
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
                  <input v-model="services.eventhub.enabled" type="checkbox" @change="toggleService('eventhub')">
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          
            <div v-if="services.eventhub.enabled" class="service-metrics">
              <div class="stats-grid">
                <div class="metric-item">
                  <div class="metric-content">
                    <span class="metric-label">Events</span>
                    <span class="metric-value">{{ formatNumber(services.eventhub?.metrics?.events) }}</span>
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
                    <span class="metric-value">{{ services.eventhub?.metrics?.partitions || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>
          
            <div class="service-actions">
              <UnifiedButton variant="outline" leading-icon="CogIcon" size="sm" @click="configureService('eventhub')">Configure</UnifiedButton>
              <UnifiedButton variant="gaming" leading-icon="PlayIcon" size="sm" :disabled="!services.eventhub.enabled" @click="testService('eventhub')">Test API</UnifiedButton>
            </div>
          </div>

          <!-- Key Vault -->
          <div class="service-card glass p-glass-md gap-glass-md rounded-lg neon-interactive" :class="{ active: services.keyvault.enabled }">
            <div class="service-header">
              <div class="service-meta">
                <div class="service-icon">
                  <AppIcon name="LockClosedIcon" />
                </div>
                <div class="service-info">
                  <h3 class="card-title">Key Vault</h3>
                  <p class="card-description">Secure key and secret management</p>
                </div>
              </div>
              <div class="service-toggle">
                <label class="switch">
                  <input v-model="services.keyvault.enabled" type="checkbox" @change="toggleService('keyvault')">
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          
            <div v-if="services.keyvault.enabled" class="service-metrics">
              <div class="stats-grid">
                <div class="metric-item">
                  <div class="metric-content">
                    <span class="metric-label">Secrets</span>
                    <span class="metric-value">{{ services.keyvault?.metrics?.secrets || 0 }}</span>
                  </div>
                </div>
                <div class="metric-item">
                  <div class="metric-content">
                    <span class="metric-label">Keys</span>
                    <span class="metric-value">{{ services.keyvault?.metrics?.keys || 0 }}</span>
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
              <UnifiedButton variant="outline" leading-icon="CogIcon" size="sm" @click="configureService('keyvault')">Configure</UnifiedButton>
              <UnifiedButton variant="gaming" leading-icon="PlayIcon" size="sm" :disabled="!services.keyvault.enabled" @click="testService('keyvault')">Test API</UnifiedButton>
            </div>
          </div>

          <!-- IoT Hub -->
          <div class="service-card glass p-glass-md gap-glass-md rounded-lg neon-interactive" :class="{ active: services.iothub.enabled }">
            <div class="service-header">
              <div class="service-meta">
                <div class="service-icon">
                  <AppIcon name="mdi-chip" />
                </div>
                <div class="service-info">
                  <h3 class="card-title">IoT Hub</h3>
                  <p class="card-description">Device connectivity and management</p>
                </div>
              </div>
              <div class="service-toggle">
                <label class="switch">
                  <input v-model="services.iothub.enabled" type="checkbox" @change="toggleService('iothub')">
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          
            <div v-if="services.iothub.enabled" class="service-metrics">
              <div class="stats-grid">
                <div class="metric-item">
                  <div class="metric-content">
                    <span class="metric-label">Devices</span>
                    <span class="metric-value">{{ services.iothub?.metrics?.devices || 0 }}</span>
                  </div>
                </div>
                <div class="metric-item">
                  <div class="metric-content">
                    <span class="metric-label">Messages</span>
                    <span class="metric-value">{{ formatNumber(services.iothub?.metrics?.messages) }}</span>
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
              <UnifiedButton variant="outline" leading-icon="CogIcon" size="sm" @click="configureService('iothub')">Configure</UnifiedButton>
              <UnifiedButton variant="gaming" leading-icon="PlayIcon" size="sm" :disabled="!services.iothub.enabled" @click="testService('iothub')">Test API</UnifiedButton>
            </div>
          </div>
        </div>
      </section>

      <!-- Cloud Analytics Dashboard -->
      <section class="analytics-section">
        <div class="section-header">
          <div class="header-content">
            <h2 class="section-title">
              <AppIcon name="ChartBarIcon" class="section-icon" />
              Cloud Analytics
            </h2>
            <p class="section-description">Monitor performance and costs across your services</p>
          </div>
          <div class="header-actions">
            <div class="time-filter">
              <label class="filter-label">Time Range:</label>
              <select v-model="analyticsTimeframe" class="glass-input" @change="updateAnalytics">
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
            <UnifiedButton variant="outline" leading-icon="ArrowPathIcon" size="sm" @click="updateAnalytics">
              Refresh
            </UnifiedButton>
          </div>
        </div>
      
        <div class="responsive-grid responsive-grid--cards-md">
          <!-- Cost Overview -->
          <div class="analytics-card glass p-glass-md gap-glass-md rounded-lg">
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
          <div class="analytics-card glass p-glass-md gap-glass-md rounded-lg">
            <div class="card-header">
              <h3 class="card-title">
                <AppIcon name="ChartBarSquareIcon" />
                Performance
              </h3>
              <div class="trend-indicator positive">
                <AppIcon name="ArrowTrendingUpIcon" />
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
                  <div class="progress-bar bg-success-500" :style="{ width: '99%' }"></div>
                </div>
              </div>
              <div class="perf-item">
                <div class="perf-label">Availability</div>
                <div class="perf-value">99.9%</div>
                <div class="progress progress--xs">
                  <div class="progress-bar bg-success-500" :style="{ width: '100%' }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Security Status -->
          <div class="analytics-card glass p-glass-md gap-glass-md rounded-lg">
            <div class="card-header">
              <h3 class="card-title">
                <AppIcon name="ShieldCheckIcon" />
                Security Status
              </h3>
              <div class="trend-indicator neutral">
                <AppIcon name="ShieldCheckIcon" />
                Secure
              </div>
            </div>
            <div class="security-status">
              <div class="security-item">
                <AppIcon name="CheckCircleIcon" />
                <span>SSL/TLS Enabled</span>
              </div>
              <div class="security-item">
                <AppIcon name="CheckCircleIcon" />
                <span>Key Vault Configured</span>
              </div>
              <div class="security-item">
                <AppIcon name="CheckCircleIcon" />
                <span>Access Policies Active</span>
              </div>
              <div class="security-item">
                <AppIcon name="ExclamationCircleIcon" class="security-icon warning" />
                <span>MFA Recommended</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Service Configuration Modal -->
      <Teleport to="body">
        <div v-if="configModal.show" class="config-modal-overlay" @click="closeConfigModal">
          <div class="config-modal glass p-glass-lg gap-glass-md rounded-xl" @click.stop>
            <div class="modal-header">
              <h2 class="card-title">Configure {{ configModal.serviceName }}</h2>
              <UnifiedButton variant="ghost" icon-only icon="XMarkIcon" aria-label="Close" @click="closeConfigModal" />
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
                  >
                </div>
              
                <div class="form-group">
                  <label class="form-label">API Key</label>
                  <input 
                    v-model="configModal.config.apiKey" 
                    type="password"
                    class="glass-input"
                    placeholder="••••••••••••••••"
                  >
                </div>
              
                <div v-if="configModal.service === 'openai'" class="form-group">
                  <label class="form-label">Deployment Name</label>
                  <input 
                    v-model="configModal.config.deploymentName" 
                    type="text"
                    class="glass-input"
                    placeholder="gpt-35-turbo"
                  >
                </div>
              
                <div class="form-group">
                  <label class="form-label">Region</label>
                  <select v-model="configModal.config.region" class="glass-input">
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
              <UnifiedButton variant="outline" @click="closeConfigModal">Cancel</UnifiedButton>
              <UnifiedButton variant="gaming" leading-icon="mdi-content-save" @click="saveConfiguration">Save Configuration</UnifiedButton>
            </div>
          </div>
        </div>
      </Teleport>
    </StandardPageLayout>
  </div>
</template>

<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'

import { ref, reactive, onMounted } from 'vue'
import StandardPageLayout from '@/components/layout/StandardPageLayout.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

// Types
interface ServiceMetrics {
  [key: string]: number | undefined
}

interface Service {
  enabled: boolean
  configured: boolean
  metrics: ServiceMetrics
}

interface Services {
  [key: string]: Service
  openai: Service
  cognitive: Service
  storage: Service
  eventhub: Service
  keyvault: Service
  iothub: Service
}

// Import the Azure service (mock import for now)
// import { azureService } from '@/modules/integration/AzureService'

// State
const loading = ref(false)
const analyticsTimeframe = ref('7d')

// Safe access handled directly in template with optional chaining

// Cloud connection status
const cloudStatus = reactive({
  connected: true,
  region: 'East US',
  lastCheck: new Date(),
  health: 'healthy'
})

// Services configuration
const services: Services = reactive({
  openai: {
    enabled: true,
    configured: true,
    metrics: {
      requests: 1247,
      tokens: 892140,
      uptime: 99.9
    }
  },
  cognitive: {
    enabled: true,
    configured: true,
    metrics: {
      analyses: 324,
      languages: 12,
      accuracy: 96.8
    }
  },
  storage: {
    enabled: true,
    configured: true,
    metrics: {
      files: 2856,
      size: 15728640, // bytes
      bandwidth: 52428800 // bytes
    }
  },
  eventhub: {
    enabled: false,
    configured: false,
    metrics: {
      events: 0,
      throughput: 0,
      partitions: 4
    }
  },
  keyvault: {
    enabled: true,
    configured: true,
    metrics: {
      secrets: 8,
      keys: 3,
      access: 100
    }
  },
  iothub: {
    enabled: false,
    configured: false,
    metrics: {
      devices: 0,
      messages: 0,
      online: 0
    }
  }
})

// Configuration modal state
const configModal = reactive({
  show: false,
  service: '',
  serviceName: '',
  config: {
    endpoint: '',
    apiKey: '',
    region: '',
    deploymentName: ''
  }
})

// Methods
const initializeAzure = async () => {
  try {
    loading.value = true
    // await azureService.initialize()
    cloudStatus.connected = true
    console.log('Azure services initialized')
  } catch (error) {
    console.error('Failed to initialize Azure services:', error)
    cloudStatus.connected = false
  } finally {
    loading.value = false
  }
}

const toggleService = async (serviceName: string) => {
  try {
    const service = services[serviceName]
    if (!service) {
      console.error(`Service ${serviceName} not found`)
      return
    }
    
    console.log(`${service.enabled ? 'Enabling' : 'Disabling'} ${serviceName}`)
    
    // In real implementation, would call Azure service
    // if (service.enabled) {
    //   await azureService.enableService(serviceName)
    // } else {
    //   await azureService.disableService(serviceName)
    // }
    
  } catch (error) {
    console.error(`Failed to toggle ${serviceName}:`, error)
    // Revert the toggle on error
    if (services[serviceName]) {
      services[serviceName].enabled = !services[serviceName].enabled
    }
  }
}

const configureService = (serviceName: string) => {
  try {
    const service = services[serviceName]
    if (!service) {
      console.error(`Service ${serviceName} not found`)
      return
    }
    
    configModal.service = serviceName
    configModal.serviceName = formatServiceName(serviceName)
    configModal.show = true
    
    // Load existing configuration if available
    if (service.configured) {
      // In real implementation, would load from Azure service
      configModal.config = {
        endpoint: 'https://example.azure.com',
        apiKey: '••••••••••••••••',
        region: 'eastus',
        deploymentName: serviceName === 'openai' ? 'gpt-35-turbo' : ''
      }
    } else {
      // Reset config for new services
      configModal.config = {
        endpoint: '',
        apiKey: '',
        region: '',
        deploymentName: ''
      }
    }
  } catch (error) {
    console.error('Error configuring service:', error)
  }
}

const closeConfigModal = () => {
  configModal.show = false
  configModal.service = ''
  configModal.serviceName = ''
  configModal.config = {
    endpoint: '',
    apiKey: '',
    region: '',
    deploymentName: ''
  }
}

const saveConfiguration = async () => {
  try {
    console.log('Saving configuration for', configModal.service, configModal.config)
    
    // In real implementation, would save to Azure service
    // await azureService.configureService(configModal.service, configModal.config)
    
    services[configModal.service].configured = true
    closeConfigModal()
  } catch (error) {
    console.error('Failed to save configuration:', error)
  }
}

const testService = async (serviceName: string) => {
  try {
    const service = services[serviceName]
    if (!service) {
      console.error(`Service ${serviceName} not found`)
      alert(`Service ${serviceName} not found`)
      return
    }
    
    if (!service.enabled) {
      alert(`${formatServiceName(serviceName)} service is not enabled. Please enable it first.`)
      return
    }
    
    console.log('Testing service:', serviceName)
    
    // Simulate a delay for testing
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In real implementation, would test Azure service
    // const result = await azureService.testService(serviceName)
    // console.log('Service test result:', result)
    
    alert(`${formatServiceName(serviceName)} service is working correctly!`)
  } catch (error) {
    console.error('Service test failed:', error)
    alert(`${formatServiceName(serviceName)} service test failed: ${error}`)
  }
}

const updateAnalytics = () => {
  console.log('Updating analytics for timeframe:', analyticsTimeframe.value)
  // In real implementation, would fetch new analytics data
}

// Utility functions
const formatServiceName = (serviceName: string) => {
  const names: { [key: string]: string } = {
    openai: 'Azure OpenAI',
    cognitive: 'Cognitive Services',
    storage: 'Blob Storage',
    eventhub: 'Event Hub',
    keyvault: 'Key Vault',
    iothub: 'IoT Hub'
  }
  return names[serviceName] || serviceName
}

const formatNumber = (num: number | undefined | null) => {
  if (!num && num !== 0) return '0'
  if (typeof num !== 'number') return '0'
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

const formatStorage = (bytes: number | undefined | null) => {
  if (!bytes && bytes !== 0) return '0B'
  if (typeof bytes !== 'number') return '0B'
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + 'GB'
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + 'MB'
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + 'KB'
  return bytes + 'B'
}

// Initialize
onMounted(() => {
  initializeAzure()
})
</script>

<style scoped>
/* THE CLOUD - Modern design with unified system */

.the-cloud {
  min-height: 100vh;
}

/* Header Content Layout */
.header-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

@media (min-width: 768px) {
  .header-content {
    flex-direction: flex flex-wrap;
    justify-content: space-between;
    align-items: center;
  }
}

/* Services Section */
.services-section {
  margin-bottom: var(--spacing-12);
}

.section-header {
  margin-bottom: var(--spacing-8);
  text-align: center;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3);
}

.section-icon {
  color: var(--color-primary-500);
  font-size: 1.5em;
}

/* Service Cards */
.service-card.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary-500), var(--color-secondary-500));
  opacity: 1;
}

.service-meta {
  display: flex;
  gap: var(--spacing-4);
  flex: 1;
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-4);
}

.service-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  background: var(--surface-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-primary-500);
  font-size: var(--font-size-xl);
}

.service-info {
  flex: 1;
}

/* Modern Toggle Switch */
.service-toggle {
  flex-shrink: 0;
}

.switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--surface-muted);
  transition: all var(--duration-normal);
  border-radius: 28px;
  border: 1px solid var(--border-base);
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 3px;
  background-color: var(--surface-base);
  transition: all var(--duration-normal);
  border-radius: 50%;
  box-shadow: var(--shadow-sm);
}

input:checked + .slider {
  background: linear-gradient(45deg, var(--color-primary-500), var(--color-gaming-500, #00ff88));
  border-color: var(--color-primary-500);
}

input:checked + .slider:before {
  transform: translateX(20px);
}

/* Service Metrics */
.service-metrics {
  padding: var(--spacing-4) 0;
  border-top: 1px solid var(--border-base);
  border-bottom: 1px solid var(--border-base);
  margin: var(--spacing-4) 0;
}

.metric-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3);
  background: var(--surface-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast);
}

.metric-item:hover {
  background: var(--surface-hover);
  transform: translateY(-1px);
}

.metric-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.metric-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary-600);
}

.metric-icon {
  color: var(--color-primary-400);
  opacity: 0.7;
  transition: opacity var(--duration-fast);
}

.metric-item:hover .metric-icon {
  opacity: 1;
}

/* Service Actions */
.service-actions {
  display: flex;
  gap: var(--spacing-3);
}

/* Analytics Section */
.analytics-section {
  margin-top: var(--spacing-12);
  padding: var(--spacing-8);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-2xl);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.time-filter {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
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
  margin-bottom: var(--spacing-4);
}

.trend-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1-5) var(--spacing-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  backdrop-filter: var(--glass-backdrop-blur);
}

.trend-indicator.positive {
  background: color-mix(in srgb, var(--color-success-500) 20%, var(--glass-bg));
  color: var(--color-success-600);
  border: 1px solid color-mix(in srgb, var(--color-success-500) 30%, transparent);
}

.trend-indicator.neutral {
  background: var(--glass-bg);
  color: var(--text-secondary);
  border: 1px solid var(--glass-border);
}

/* Cost Breakdown */
.cost-breakdown {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.cost-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-2) 0;
}

.cost-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-3) 0;
  border-top: 1px solid var(--border-base);
  font-weight: var(--font-weight-semibold);
}

/* Performance Metrics */
.performance-metrics {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.perf-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.perf-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.perf-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
}

/* Security Status */
.security-status {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.security-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-2) 0;
}

.security-icon.warning {
  color: var(--color-warning-500);
}

/* Configuration Modal */
.config-modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--modal-backdrop);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--spacing-4);
}

.config-modal {
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--border-base);
}

.modal-content {
  padding: var(--spacing-6);
  max-height: 60vh;
  overflow-y: auto;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.modal-actions {
  display: flex;
  gap: var(--spacing-3);
  padding: var(--spacing-6);
  border-top: 1px solid var(--border-base);
}

/* Responsive Design */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-4);
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
    gap: var(--spacing-4);
  }
  
  .service-toggle {
    align-self: flex-start;
  }
}
</style>
