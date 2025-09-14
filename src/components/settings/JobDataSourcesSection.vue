<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="job-data-sources-section">
    <!-- Accordion Header -->
    <div
      class="settings-card mb-4"
      role="region"
      aria-labelledby="job-sources-title"
    >
      <div
        class="card-header section-header card-header--dense accordion-header"
        role="button"
        tabindex="0"
        @click="toggleAccordion"
        @keydown.enter="toggleAccordion"
        @keydown.space="toggleAccordion"
      >
        <div class="d-flex align-items-center justify-content-between w-100">
          <div>
            <h5 id="job-sources-title" class="mb-0">
              <AppIcon name="mdi-database-search" class="me-2 icon-sm" />
              Job Data Sources
            </h5>
            <p class="text-muted small mb-0 mt-1">
              Configure job board APIs and data source preferences
            </p>
          </div>
          <div class="accordion-toggle">
            <AppIcon
              name="mdi-chevron-down"
              class="accordion-icon"
              :class="{ rotated: isExpanded }"
            />
          </div>
        </div>

        <!-- Provider Health (canonical registry) -->
        <div class="provider-health glass-input p-3 mb-4">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <div class="d-flex align-items-center gap-2">
              <AppIcon name="mdi-stethoscope" class="text-primary" />
              <strong>Provider Health</strong>
            </div>
            <div class="d-flex gap-2 flex-wrap">
              <button
                class="btn btn-sm btn-outline-secondary v-btn variant-outlined ui-btn ui-size-md"
                title="Enable gaming-focused sources"
                @click="enableGamingSources"
              >
                <AppIcon name="mdi-gamepad-variant" class="me-1" />
                Enable Gaming Sources
              </button>
              <button
                class="btn btn-sm btn-outline-secondary v-btn variant-outlined ui-btn ui-size-md"
                title="Add a studio board (Greenhouse, Lever, Recruitee, Workable, Ashby)"
                @click="addCompanyBoard"
              >
                <AppIcon name="mdi-domain-plus" class="me-1" />
                Add Studio Board
              </button>
              <button
                class="btn btn-sm btn-outline-primary v-btn variant-outlined ui-btn ui-size-md"
                :disabled="checkingHealth"
                @click="checkProviderHealth"
              >
                <AppIcon
                  :name="checkingHealth ? 'mdi-loading' : 'mdi-heart-pulse'"
                  :class="{ spin: checkingHealth }"
                  class="me-1"
                />
                {{ checkingHealth ? "Checking..." : "Check Health" }}
              </button>
              <button
                class="btn btn-sm btn-outline-secondary v-btn variant-outlined ui-btn ui-size-md"
                @click="toggleDisabledBoards"
              >
                <AppIcon name="mdi-eye" class="me-1" />
                {{ showDisabledBoards ? "Hide Disabled" : "Show Disabled" }}
              </button>
              <button
                class="btn btn-sm btn-outline-warning v-btn variant-outlined ui-btn ui-size-md"
                :disabled="disabledBoards.length === 0"
                @click="reenableAllBoards"
              >
                <AppIcon name="mdi-restore" class="me-1" />
                Re-enable All
              </button>
              <button
                class="btn btn-sm btn-outline-info v-btn variant-outlined ui-btn ui-size-md"
                @click="reverifyCompanyBoards"
              >
                <AppIcon name="mdi-refresh" class="me-1" />
                Re-verify Boards
              </button>
            </div>
          </div>
          <div v-if="providerHealth" class="small text-muted">
            <span class="me-3">
              <AppIcon
                name="mdi-check-circle-outline"
                class="text-success me-1"
              />
              {{ Object.values(providerHealth).filter(Boolean).length }} healthy
            </span>
            <span>
              <AppIcon
                name="mdi-alert-circle-outline"
                class="text-warning me-1"
              />
              {{
                Object.values(providerHealth).filter((v) => v === false).length
              }}
              issues
            </span>
          </div>
          <div v-else class="small text-secondary">
            Click "Check Health" to probe provider availability.
          </div>

          <!-- Disabled company boards (auto-managed) -->
          <div v-if="showDisabledBoards" class="mt-2 small">
            <template v-if="disabledBoards.length">
              <div class="mb-1 fw-semibold">Disabled Boards:</div>
              <div class="d-flex flex-wrap gap-2">
                <div
                  v-for="b in disabledBoards"
                  :key="b.type + ':' + b.token"
                  class="disabled-board-chip d-inline-flex align-items-center gap-2 px-2 py-1 rounded-pill"
                >
                  <span class="chip-text">{{ b.type }}: {{ b.token }}</span>
                  <UnifiedButton
                    type="button"
                    size="chip"
                    variant="success"
                    appearance="outlined"
                    leading-icon="mdi-check"
                    @click="enableDisabledBoard(b.type, b.token)"
                  >
                    Enable
                  </UnifiedButton>
                </div>
              </div>
            </template>
            <div v-else class="text-secondary">No disabled boards.</div>
          </div>
        </div>
      </div>

      <div
        v-show="isExpanded"
        class="card-body section-body card-body--dense accordion-content"
      >
        <!-- Quick Stats -->
        <div class="row g-3 mb-4">
          <div class="col-md-3">
            <div class="stat-card glass-input text-center p-3">
              <div class="stat-value h4 mb-1 text-primary">
                {{ enabledSources.length }}
              </div>
              <div class="stat-label small text-muted">Active Sources</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card glass-input text-center p-3">
              <div class="stat-value h4 mb-1 text-success">
                {{ publicSources.length }}
              </div>
              <div class="stat-label small text-muted">Public APIs</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card glass-input text-center p-3">
              <div class="stat-value h4 mb-1 text-info">
                {{ configuredSources.length }}
              </div>
              <div class="stat-label small text-muted">Configured</div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card glass-input text-center p-3">
              <div class="stat-value h4 mb-1 text-warning">
                {{ selectedRegions.length }}
              </div>
              <div class="stat-label small text-muted">Regions</div>
            </div>
          </div>
        </div>

        <!-- Region & Category Filters -->
        <div class="row g-4 mb-4">
          <div class="col-md-6">
            <div class="filter-section p-3 border rounded-3 glass-input">
              <label class="form-label fw-medium mb-3">
                <AppIcon name="mdi-earth" class="me-2" />
                Preferred Regions
              </label>
              <div class="region-filters">
                <div class="d-flex flex-wrap gap-2">
                  <button
                    v-for="region in availableRegions"
                    :key="region"
                    type="button"
                    class="btn btn-sm region-filter-btn ui-btn ui-size-md"
                    :class="
                      selectedRegions.includes(region)
                        ? 'btn-primary'
                        : 'btn-outline-secondary'
                    "
                    @click="toggleRegion(region)"
                  >
                    <AppIcon
                      v-if="selectedRegions.includes(region)"
                      name="mdi-check"
                      class="me-1"
                    />
                    {{ region }}
                  </button>
                </div>
                <div class="form-text mt-2">
                  Select regions to prioritize in job searches
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="filter-section p-3 border rounded-3 glass-input">
              <label class="form-label fw-medium mb-3">
                <AppIcon name="mdi-tag-multiple" class="me-2" />
                Job Categories
              </label>
              <div class="category-filters">
                <div class="d-flex flex-wrap gap-2">
                  <button
                    v-for="category in availableCategories"
                    :key="category"
                    type="button"
                    class="btn btn-sm category-filter-btn ui-btn ui-size-md"
                    :class="
                      selectedCategories.includes(category)
                        ? 'btn-success'
                        : 'btn-outline-secondary'
                    "
                    @click="toggleCategory(category)"
                  >
                    <AppIcon
                      v-if="selectedCategories.includes(category)"
                      name="mdi-check"
                      class="me-1"
                    />
                    {{ category }}
                  </button>
                </div>
                <div class="form-text mt-2">
                  Focus on specific job categories and industries
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Job Sources Grid -->
        <div class="job-sources-grid job-grid">
          <div
            v-for="source in jobSources"
            :key="source.id"
            class="source-card glass-input"
            :class="{
              'source-enabled': source.enabled,
              'source-configured': isSourceConfigured(source),
              'source-public': !source.requiresAuth,
            }"
          >
            <!-- Source Header -->
            <div
              class="source-header d-flex align-items-start justify-content-between mb-3"
            >
              <div class="source-info d-flex align-items-center">
                <div
                  class="source-icon me-3"
                  :style="{ '--source-color': source.color }"
                >
                  <AppIcon :name="source.icon" class="fs-4" />
                </div>
                <div>
                  <h6 class="source-name mb-1">{{ source.name }}</h6>
                  <p class="source-description text-muted small mb-0">
                    {{ source.description }}
                  </p>
                </div>
              </div>
              <div class="source-toggle">
                <div class="form-check form-switch">
                  <input
                    :id="`source-${source.id}`"
                    v-model="source.enabled"
                    class="form-check-input"
                    type="checkbox"
                    @change="
                      updateSourceConfig(source.id, { enabled: source.enabled })
                    "
                  />
                  <label
                    :for="`source-${source.id}`"
                    class="form-check-label visually-hidden"
                  >
                    Toggle {{ source.name }}
                  </label>
                </div>
              </div>
            </div>

            <!-- Source Details -->
            <div class="source-details mb-3">
              <div class="row g-2">
                <div class="col-6">
                  <div class="detail-item small">
                    <AppIcon name="mdi-speedometer" class="text-muted me-1" />
                    {{ source.rateLimit }}
                  </div>
                </div>
                <div class="col-6">
                  <div class="detail-item small">
                    <AppIcon name="mdi-earth" class="text-muted me-1" />
                    {{ source.regions.slice(0, 2).join(", ") }}
                    <span v-if="source.regions.length > 2">+{{ source.regions.length - 2 }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Features -->
            <div class="source-features mb-3">
              <div class="d-flex flex-wrap gap-1">
                <span
                  v-for="feature in source.features.slice(0, 3)"
                  :key="feature"
                  class="badge bg-light text-dark feature-badge"
                >
                  {{ feature }}
                </span>
                <span
                  v-if="source.features.length > 3"
                  class="badge bg-light text-muted feature-badge"
                  :title="source.features.slice(3).join(', ')"
                >
                  +{{ source.features.length - 3 }}
                </span>
              </div>
            </div>

            <!-- API Configuration -->
            <div v-if="source.enabled" class="source-config">
              <!-- Public API Notice -->
              <div
                v-if="!source.requiresAuth"
                class="public-api-notice mb-2 p-2 bg-success-subtle text-success rounded"
              >
                <AppIcon name="mdi-check-circle-outline" />
                <small><strong>Public API</strong> - Ready to use</small>
              </div>

              <!-- API Key Input -->
              <div
                v-else-if="source.apiKeyRequired"
                class="api-key-section mb-2"
              >
                <div class="input-group input-group-sm">
                  <span class="input-group-text">
                    <AppIcon name="mdi-key" class="text-muted" />
                  </span>
                  <input
                    v-model="source.apiKey"
                    type="password"
                    class="form-control"
                    :placeholder="`Enter ${source.name} API key`"
                    @change="
                      updateSourceConfig(source.id, { apiKey: source.apiKey })
                    "
                  />
                  <button
                    class="btn btn-outline-secondary v-btn variant-outlined ui-btn ui-size-md"
                    type="button"
                    @click="viewApiDocs(source.id)"
                  >
                    <AppIcon name="mdi-help-circle-outline" />
                  </button>
                </div>
              </div>

              <!-- Actions -->
              <div class="source-actions d-flex gap-2">
                <button
                  class="btn btn-outline-primary btn-sm flex-fill v-btn variant-outlined ui-btn ui-size-md"
                  :disabled="
                    testingSource === source.id ||
                      (source.requiresAuth && !source.apiKey)
                  "
                  @click="testSource(source.id)"
                >
                  <span v-if="testingSource === source.id">
                    <AppIcon name="mdi-loading" class="spin me-1" />
                    Testing...
                  </span>
                  <span v-else>
                    <AppIcon name="mdi-transit-connection" class="me-1" />
                    Test
                  </span>
                </button>
                <button
                  v-if="source.requiresAuth"
                  class="btn btn-outline-info btn-sm v-btn variant-outlined ui-btn ui-size-md"
                  @click="viewApiDocs(source.id)"
                >
                  <AppIcon name="mdi-book-open-variant" />
                </button>
              </div>

              <!-- Test Results -->
              <div
                v-if="testResults[source.id]"
                class="test-result mt-2 p-2 rounded small"
                :class="
                  testResults[source.id].success
                    ? 'bg-success-subtle text-success'
                    : 'bg-danger-subtle text-danger'
                "
              >
                <AppIcon
                  name="mdi-check-circle-outline'"
                  class="testResults[source.id].success ? 'mdi : 'mdi mdi-alert-circle-outline' me-1"
                />
                {{ testResults[source.id].message }}
                <span
                  v-if="
                    testResults[source.id].success &&
                      testResults[source.id].jobCount !== undefined
                  "
                >
                  ({{ testResults[source.id].jobCount }} jobs available)
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bulk Actions -->
        <div class="bulk-actions mt-4 p-3 border rounded-3 glass-input">
          <h6 class="mb-3">
            <AppIcon name="mdi-cog-outline" class="me-2" />
            Quick Actions
          </h6>
          <div class="d-flex flex-wrap gap-2">
            <UnifiedButton
              variant="success"
              appearance="outlined"
              size="sm"
              leading-icon="mdi-check-all"
              @click="enablePublicSources"
            >
              Enable Gaming Sources
            </UnifiedButton>
            <UnifiedButton
              variant="info"
              appearance="outlined"
              size="sm"
              leading-icon="mdi-refresh"
              @click="refreshJobSources"
            >
              Refresh Sources
            </UnifiedButton>
            <UnifiedButton
              variant="outline"
              size="sm"
              leading-icon="mdi-close-circle-outline"
              @click="disableAllSources"
            >
              Disable All
            </UnifiedButton>
            <UnifiedButton
              variant="info"
              appearance="outlined"
              size="sm"
              leading-icon="mdi-play-circle-outline"
              @click="testAllEnabled"
            >
              Test All Enabled
            </UnifiedButton>
            <UnifiedButton
              variant="warning"
              appearance="outlined"
              size="sm"
              leading-icon="mdi-restore"
              @click="resetToDefaults"
            >
              Reset Defaults
            </UnifiedButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';

import {
  refwatch,
  computed,
  onUnmounted,
  defineEmits,
  defineProps,
} from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import { jobSourceManager } from "@/services/JobSourceManager";
import { canonicalJobService as refactoredJobAPIService } from "@/services/CanonicalJobService";
import { COMPANY_BOARDS } from "@/services/providers/companyBoards";
import {
  getJobSources,
  getAllRegions,
  getAllCategories,
  updateJobSourceConfig,
  testJobSource,
} from "@/services/jobService";

const _props = defineProps({
  settings: {
    type: Object,
    default: () => ({}),
  },
  // When true, expand the accordion automatically (e.g., deep links)
  autoExpand: {
    type: Boolean,
    default: false,
  },
});

const _emit = defineEmits(["update:settings", "test-source"]);

// Reactive state
const isExpanded = ref(false); // Default closed
const jobSources = ref([]);
const selectedRegions = ref(
  props.settings && props.settings.preferredRegions
    ? props.settings.preferredRegions
    : [],
);
const selectedCategories = ref(
  props.settings && props.settings.preferredCategories
    ? props.settings.preferredCategories
    : [],
);
const testingSource = ref(null);
const testResults = ref({});
const checkingHealth = ref(false);
const providerHealth = ref(null);
const showDisabledBoards = ref(false);
const disabledBoards = ref([]);

// Available options
const availableRegions = ref([]);
const availableCategories = ref([]);

// Computed properties
const enabledSources = computed(() =>
  jobSources.value.filter((source) => source.enabled),
);

const publicSources = computed(() =>
  jobSources.value.filter((source) => !source.requiresAuth),
);

const configuredSources = computed(() =>
  jobSources.value.filter((source) => isSourceConfigured(source)),
);

// Methods
function toggleAccordion() {
  isExpanded.value = !isExpanded.value;
}

function isSourceConfigured(source) {
  if (!source.requiresAuth) {
    return true;
  }
  return source.apiKey && source.apiKey.trim().length > 0;
}

function toggleRegion(region) {
  const index = selectedRegions.value.indexOf(region);
  if (index > -1) {
    selectedRegions.value.splice(index, 1);
  } else {
    selectedRegions.value.push(region);
  }
  updateSettings();
}

function toggleCategory(category) {
  const index = selectedCategories.value.indexOf(category);
  if (index > -1) {
    selectedCategories.value.splice(index, 1);
  } else {
    selectedCategories.value.push(category);
  }
  updateSettings();
}

function updateSourceConfig(sourceId, config) {
  const success = jobSourceManager.updateSourceConfig(sourceId, config);
  if (success) {
    console.log(`Updated ${sourceId} config:`, config);
    updateSettings();
  }
}

async function testSource(sourceId) {
  const source = jobSources.value.find((s) => s.id === sourceId);
  if (!source) {
    return;
  }

  console.log(`[SEARCH] Testing ${source.name}...`);
  testingSource.value = sourceId;

  // Clear previous results
  if (testResults.value[sourceId]) {
    delete testResults.value[sourceId];
  }

  try {
    const result = await testJobSource(sourceId);
    testResults.value[sourceId] = result;

    console.log(
      `${result.success ? "✅" : "❌"} Test result for ${source.name}:`,
      result,
    );
    emit("test-source", { sourceId, result });
  } catch (_error) {
    console.error(`[✗] Test failed for ${source.name}:`, error);
    testResults.value[sourceId] = {
      success: false,
      message: `Connection failed: ${error.message}`,
    };
  } finally {
    testingSource.value = null;
  }
}

function viewApiDocs(sourceId) {
  // This would open documentation for the specific API
  console.log(`Opening API docs for ${sourceId}`);
  // Could implement actual doc URLs per source
}

function enablePublicSources() {
  // Enable gaming-focused and public sources using the manager
  const gamingSources = jobSourceManager.getSourcesBy({ gamingFocus: 0.3 });
  const publicSources = jobSourceManager.getSourcesBy({ requiresAuth: false });

  // Combine and deduplicate
  const sourcesToEnable = new Set([
    ...gamingSources.map((s) => s.id),
    ...publicSources.map((s) => s.id),
  ]);

  jobSources.value.forEach((source) => {
    if (sourcesToEnable.has(source.id)) {
      source.enabled = true;
      jobSourceManager.updateSourceConfig(source.id, { enabled: true });
    }
  });
  updateSettings();

  console.log(
    `[GAME] Enabled ${sourcesToEnable.size} gaming and public job sources`,
  );
}

function disableAllSources() {
  jobSources.value.forEach((source) => {
    source.enabled = false;
    jobSourceManager.updateSourceConfig(source.id, { enabled: false });
  });
  updateSettings();
}

async function testAllEnabled() {
  for (const source of enabledSources.value) {
    if (isSourceConfigured(source)) {
      await testSource(source.id);
      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}

function resetToDefaults() {
  // Reset to default configuration
  selectedRegions.value = [];
  selectedCategories.value = [];

  // Get gaming and public sources for defaults
  const gamingSources = jobSourceManager.getSourcesBy({ gamingFocus: 0.3 });
  const publicSources = jobSourceManager.getSourcesBy({ requiresAuth: false });
  const defaultEnabledIds = new Set([
    ...gamingSources.slice(0, 4).map((s) => s.id),
    ...publicSources.slice(0, 4).map((s) => s.id),
  ]);

  jobSources.value.forEach((source) => {
    const defaultEnabled = defaultEnabledIds.has(source.id);
    source.enabled = defaultEnabled;
    jobSourceManager.updateSourceConfig(source.id, { enabled: defaultEnabled });
  });

  updateSettings();
}

function refreshJobSources() {
  try {
    // Use the job source manager to get updated sources
    jobSourceManager.forceRefresh();
    jobSources.value = jobSourceManager.getAllSources();

    updateSettings();
    console.log(`🔄 Refreshed ${jobSources.value.length} job sources`);
  } catch (_error) {
    console.error("Failed to refresh job sources:", error);
  }
}

function updateSettings() {
  const base =
    props.settings && typeof props.settings === "object" ? props.settings : {};
  const newSettings = {
    ...base,
    preferredRegions: [...selectedRegions.value],
    preferredCategories: [...selectedCategories.value],
    enabledJobSources: enabledSources.value.map((s) => s.id),
    jobSourcesConfig: Object.fromEntries(
      jobSources.value.map((source) => [
        source.id,
        {
          enabled: source.enabled,
          apiKey: source.apiKey || "",
        },
      ]),
    ),
  };

  emit("update:settings", newSettings);
}

// Provider health (canonical registry)
async function checkProviderHealth() {
  try {
    checkingHealth.value = true;
    providerHealth.value = await refactoredJobAPIService.checkProviderHealth();
  } catch (_e) {
    console.error("Failed to check provider health:", e);
    providerHealth.value = null;
  } finally {
    checkingHealth.value = false;
  }
}

// Quick-enable gaming-focused providers (priority already tuned in code)
function enableGamingSources() {
  const gaming = jobSourceManager.getSourcesBy({ gamingFocus: 0.5 });
  gaming.forEach((s) => {
    s.enabled = true;
    jobSourceManager.updateSourceConfig(s.id, { enabled: true });
  });
  updateSettings();
}

// Quick add for company ATS boards
function addCompanyBoard() {
  try {
    const name = window.prompt("Studio name (e.g., Riot Games)")?.trim();
    if (!name) return;
    const token = window.prompt("Board token (e.g., riotgames)")?.trim();
    if (!token) return;
    const type = window
      .prompt("ATS type: greenhouse | lever | recruitee | workable | ashby")
      ?.trim()
      ?.toLowerCase();
    const allowed = ["greenhouse", "lever", "recruitee", "workable", "ashby"];
    if (!type || !allowed.includes(type)) {
      alert("Invalid ATS type. Use one of: " + allowed.join(", "));
      return;
    }

    const userBoards = getUserCompanyBoards();
    if (!userBoards.some((b) => b.type === type && b.token === token)) {
      userBoards.push({ name, token, type });
      saveUserCompanyBoards(userBoards);
    }

    // If previously disabled, re-enable now
    const raw = window?.localStorage?.getItem("navi-disabled-company-boards");
    let disabled = [];
    try {
      disabled = raw ? JSON.parse(raw) || [] : [];
    } catch {
      disabled = [];
    }
    const filtered = disabled.filter(
      (x) => !(x && x.type === type && x.token === token),
    );
    if (filtered.length !== disabled.length) {
      window?.localStorage?.setItem(
        "navi-disabled-company-boards",
        JSON.stringify(filtered),
      );
    }

    // Reload providers with merged list and verify
    const merged = getMergedCompanyBoards();
    refactoredJobAPIService.reloadCompanyProviders(merged);
    jobSourceManager.forceRefresh();
    jobSources.value = jobSourceManager.getAllSources();
    updateSettings();
    alert(`Added ${name} (${type})`);
  } catch (_e) {
    console.error("Failed to add company board:", e);
    alert("Failed to add board; see console");
  }
}

// Initialize
onMounted(() => {
  // Load job sources from the job source manager
  try {
    jobSources.value = jobSourceManager.getAllSources();
    console.log(
      `[TARGET] Loaded ${jobSources.value.length} job sources from manager`,
    );
  } catch (_error) {
    console.error("Failed to load job sources from manager:", error);
    // Fallback to legacy method
    jobSources.value = getJobSources();
  }

  // Load available options
  availableRegions.value = getAllRegions();
  availableCategories.value = getAllCategories();

  // Load disabled company boards
  loadDisabledBoards();

  // Apply saved settings
  if (props.settings && props.settings.jobSourcesConfig) {
    jobSources.value.forEach((source) => {
      const savedConfig = props.settings.jobSourcesConfig[source.id];
      if (savedConfig) {
        source.enabled =
          savedConfig.enabled !== undefined
            ? savedConfig.enabled
            : source.enabled;
        source.apiKey = savedConfig.apiKey || "";
      }
    });
  }

  console.log("[LAUNCH] Job Data Sources initialized:", {
    totalSources: jobSources.value.length,
    enabledSources: enabledSources.value.length,
    publicSources: publicSources.value.length,
    gamingSources: jobSources.value.filter(
      (s) => s.gamingFocus && s.gamingFocus > 0.5,
    ).length,
    regions: availableRegions.value.length,
    categories: availableCategories.value.length,
  });

  // Auto-expand when deep-linked or when prop requests it
  try {
    const hash = window?.location?.hash || "";
    if (props.autoExpand || hash.includes("job-sources-section")) {
      isExpanded.value = true;
    }
  } catch (_e) {
    // non-blocking
  }

  // Also respond to hash changes dynamically without prop
  const onHashChange = () => {
    try {
      const hash = window?.location?.hash || "";
      if (hash.includes("job-sources-section")) {
        isExpanded.value = true;
      }
    } catch {}
  };
  window.addEventListener("hashchange", onHashChange);
  // Clean up
  onUnmounted(() => window.removeEventListener("hashchange", onHashChange));
});


function formatRateLimit(rateLimit) {
  if (!rateLimit) return "Unlimited";
  if (typeof rateLimit === "string") return rateLimit;
  if (rateLimit.requests && rateLimit.period) {
    const hours = Math.round(rateLimit.period / 3600000);
    return `${rateLimit.requests}/${hours}h`;
  }
  return "Limited";
}

function loadDisabledBoards() {
  try {
    const raw = window?.localStorage?.getItem("navi-disabled-company-boards");
    disabledBoards.value = raw ? JSON.parse(raw) || [] : [];
  } catch {
    disabledBoards.value = [];
  }
}

function toggleDisabledBoards() {
  showDisabledBoards.value = !showDisabledBoards.value;
  if (showDisabledBoards.value) loadDisabledBoards();
}

function getUserCompanyBoards() {
  try {
    const raw = window?.localStorage?.getItem("navi-company-boards");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((b) => b && b.name && b.type && b.token)
      : [];
  } catch {
    return [];
  }
}

async function reenableAllBoards() {
  try {
    window?.localStorage?.removeItem("navi-disabled-company-boards");
    disabledBoards.value = [];
    const merged = [
      ...(Array.isArray(COMPANY_BOARDS) ? COMPANY_BOARDS : []),
      ...getUserCompanyBoards(),
    ];
    refactoredJobAPIService.reloadCompanyProviders(merged);
    refreshJobSources();
    await checkProviderHealth();
  } catch (_e) {
    console.error("Failed to re-enable boards:", e);
  }
}

async function reverifyCompanyBoards() {
  try {
    const merged = [
      ...(Array.isArray(COMPANY_BOARDS) ? COMPANY_BOARDS : []),
      ...getUserCompanyBoards(),
    ];
    refactoredJobAPIService.reloadCompanyProviders(merged);
    loadDisabledBoards();
  } catch (_e) {
    console.error("Failed to re-verify boards:", e);
  }
}

function saveUserCompanyBoards(list) {
  try {
    window?.localStorage?.setItem(
      "navi-company-boards",
      JSON.stringify(list || []),
    );
  } catch {}
}

function getMergedCompanyBoards() {
  return [
    ...(Array.isArray(COMPANY_BOARDS) ? COMPANY_BOARDS : []),
    ...getUserCompanyBoards(),
  ];
}

async function enableDisabledBoard(type, token) {
  try {
    // Remove from disabled list
    const raw = window?.localStorage?.getItem("navi-disabled-company-boards");
    let list = [];
    try {
      list = raw ? JSON.parse(raw) || [] : [];
    } catch {
      list = [];
    }
    list = list.filter((x) => !(x && x.type === type && x.token === token));
    window?.localStorage?.setItem(
      "navi-disabled-company-boards",
      JSON.stringify(list),
    );
    loadDisabledBoards();

    // Reload providers with merged list
    const merged = getMergedCompanyBoards();
    refactoredJobAPIService.reloadCompanyProviders(merged);
    refreshJobSources();
    await checkProviderHealth();
  } catch (_e) {
    console.error("Failed to enable board:", e);
  }
}

// (removed duplicate addCompanyBoard; unified above)

// If the prop flips to true later (e.g., navigation within app), expand
watch(
  () => props.autoExpand,
  (val) => {
    if (val) {
      isExpanded.value = true;
    }
  },
);
</script>

<style scoped>
.job-data-sources-section {
  max-width: 100%;
}

.accordion-header {
  cursor: pointer;
  user-select: none;
}

.accordion-header:hover {
  background: var(--glass-elevated);
}

.accordion-header:focus-visible {
}

.accordion-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-surface);
}

.accordion-icon {
  color: var(--text-secondary);
}

.accordion-icon.rotated {
}

.accordion-content {
}

.stat-card {
}

.stat-card:hover {
}

.job-sources-grid {
}

.source-card {
  position: relative;
}

.source-card.source-enabled {
  border-left-color: var(--color-primary);
}

.source-card.source-public {
  border-left-color: var(--color-success);
}

.source-card:hover {
}

.source-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.source-name {
  color: var(--text-primary);
}

.source-description {
}

.detail-item {
  color: var(--text-secondary);
}

.feature-badge {
}

.region-filter-btn,
.category-filter-btn {
}

.region-filter-btn:hover,
.category-filter-btn:hover {
}

.public-api-notice {
}

.test-result {
  border-left-color: inherit;
}

@keyframes fadeInUp {
  from {
  }
  to {
  }
}

@keyframes spin {
  from {
  }
  to {
  }
}

.spin {
}

.disabled-board-chip {
}

.btn.btn-xs {
}

.form-check-input:checked {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

  .job-sources-grid {
  }

  .source-card {
  }

  .bulk-actions .btn {
  }
}

[data-theme="dark"] .source-card {
  background: var(--glass-surface-dark);
  border-color: var(--glass-border-dark);
}

[data-theme="dark"] .feature-badge {
  background-color: var(--glass-surface-dark) !important;
  color: var(--dark-text-primary) !important;
}

@media (prefers-reduced-motion: reduce) {
  .source-card,
  .stat-card,
  .region-filter-btn,
  .category-filter-btn {
    transition: none;
  }

  .source-card:hover,
  .stat-card:hover,
  .region-filter-btn:hover,
  .category-filter-btn:hover {
    transform: none;
  }

  .spin {
    animation: none;
  }

  .test-result {
    animation: none;
  }
}
</style>
