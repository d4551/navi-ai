<!--
Live Job Board Component

Displays live jobs from multiple API sources with:
- Real-time job fetching from APIs
- Profile-based personalization
- Advanced filtering and search
- Gaming industry focus
- Auto-refresh and caching
-->
<template>
  <div class="live-job-board">
    <!-- Header with Live Stats -->
    <div class="job-board-header glass-card section-card mb-4">
      <div
        class="section-header d-flex justify-content-between align-items-center"
      >
        <div class="header-info">
          <h2 class="mb-1">
            <AppIcon name="mdi-briefcase-search" class="text-primary me-2" />
            Live Job Board
            <span v-if="isSearching" class="loading-indicator ms-2">
              <AppIcon name="mdi-loading" class="mdi-spin" />
            </span>
          </h2>
          <p class="text-muted mb-0">
            Real-time opportunities from {{ providerCount }} job sources
            <span v-if="lastUpdated" class="ms-2">
              • Updated {{ getRelativeTime(lastUpdated) }}
            </span>
          </p>
        </div>

        <div class="header-stats d-flex gap-3">
          <div class="stat-card">
            <div class="stat-number">{{ totalJobs.toLocaleString() }}</div>
            <div class="stat-label">Total Jobs</div>
          </div>
          <div class="stat-card gaming">
            <div class="stat-number">{{ gamingJobsCount }}</div>
            <div class="stat-label">Gaming</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ topMatches.length }}</div>
            <div class="stat-label">Top Matches</div>
          </div>
          <div v-if="averageSalary > 0" class="stat-card">
            <div class="stat-number">
              ${{ Math.round(averageSalary / 1000) }}K
            </div>
            <div class="stat-label">Avg Salary</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="search-filters-section glass-card section-card mb-4">
      <div class="search-header section-header">
        <h5 class="mb-0">
          <AppIcon name="mdi-filter-variant" class="me-2" />
          Search & Filter Jobs
        </h5>
        <div v-if="profileSuggestions.length" class="search-suggestions">
          <span class="text-muted small me-2">Quick searches:</span>
          <UnifiedButton
            v-for="suggestion in profileSuggestions"
            :key="suggestion"
            variant="outline"
            size="chip"
            class="me-2 mb-1"
            @click="setQuickSearch(suggestion)"
          >
            {{ suggestion }}
          </UnifiedButton>
        </div>
      </div>
      <div class="search-form section-body">
        <div class="filters-grid settings-grid">
          <!-- Search -->
          <div class="filter-item">
            <label class="form-label small">
              <AppIcon name="mdi-magnify" class="me-1" />
              Search Jobs
            </label>
            <input
              v-model="searchForm.query"
              type="text"
              class="form-control filter-input"
              placeholder="Job title, skills, company..."
              @keyup.enter="searchJobs"
            />
          </div>

          <!-- Location -->
          <div class="filter-item">
            <label class="form-label small">
              <AppIcon name="mdi-map-marker" class="me-1" />
              Location
            </label>
            <select
              v-model="searchForm.location"
              class="form-select filter-input"
            >
              <option value="">All Locations</option>
              <option value="remote">Remote</option>
              <option value="San Francisco, CA">San Francisco</option>
              <option value="New York, NY">New York</option>
              <option value="London, UK">London</option>
              <option value="Berlin, DE">Berlin</option>
              <option value="Toronto, CA">Toronto</option>
            </select>
          </div>

          <!-- Job Type -->
          <div class="filter-item">
            <label class="form-label small">
              <AppIcon name="mdi-briefcase" class="me-1" />
              Type
            </label>
            <select v-model="searchForm.type" class="form-select filter-input">
              <option value="">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>

          <!-- Posted -->
          <div class="filter-item">
            <label class="form-label small">
              <AppIcon name="mdi-calendar" class="me-1" />
              Posted
            </label>
            <select
              v-model="searchForm.datePosted"
              class="form-select filter-input"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <!-- Action -->
          <div class="filter-actions">
            <UnifiedButton
              variant="primary"
              size="sm"
              leading-icon="mdi-magnify"
              :disabled="isSearching"
              @click="searchJobs"
            >
              {{ isSearching ? "Searching..." : "Search" }}
            </UnifiedButton>
          </div>
        </div>

        <!-- Collapsible Filter Sections -->
        <div class="mt-3">
          <!-- Quick Filters -->
          <div class="filter-section">
            <div
              class="filter-section-header"
              role="button"
              tabindex="0"
              :aria-expanded="showQuickFilters ? 'true' : 'false'"
              @click="showQuickFilters = !showQuickFilters"
              @keydown.enter.prevent="showQuickFilters = !showQuickFilters"
              @keydown.space.prevent="showQuickFilters = !showQuickFilters"
            >
              <div class="header-left">
                <AppIcon name="mdi-flash" />
                <span>Quick Filters</span>
              </div>
              <div class="header-actions">
                <UnifiedButton
                  variant="outline"
                  size="chip"
                  leading-icon="mdi-close-circle-outline"
                  @click.stop="clearAllQuickFilters"
                >
                  Clear
                </UnifiedButton>
                <AppIcon
                  class="toggle-icon"
                  :name="
                    showQuickFilters ? 'mdi-chevron-up' : 'mdi-chevron-down'
                  "
                />
              </div>
            </div>
            <div v-show="showQuickFilters" class="filter-section-body">
              <div
                class="filter-toggles d-flex gap-2 flex-wrap align-items-center"
              >
                <div class="quick-chips d-flex gap-2 flex-wrap me-auto">
                  <span class="chip-label text-muted">Quick:</span>
                  <UnifiedButton
                    size="chip"
                    variant="outline"
                    :class="{ active: quickFilters.seniority === 'junior' }"
                    @click="
                      quickFilters.seniority =
                        quickFilters.seniority === 'junior' ? '' : 'junior'
                    "
                  >
                    Junior
                  </UnifiedButton>
                  <UnifiedButton
                    size="chip"
                    variant="outline"
                    :class="{ active: quickFilters.seniority === 'mid' }"
                    @click="
                      quickFilters.seniority =
                        quickFilters.seniority === 'mid' ? '' : 'mid'
                    "
                  >
                    Mid
                  </UnifiedButton>
                  <UnifiedButton
                    size="chip"
                    variant="outline"
                    :class="{ active: quickFilters.seniority === 'senior' }"
                    @click="
                      quickFilters.seniority =
                        quickFilters.seniority === 'senior' ? '' : 'senior'
                    "
                  >
                    Senior
                  </UnifiedButton>
                  <UnifiedButton
                    size="chip"
                    variant="outline"
                    :class="{ active: quickFilters.seniority === 'lead' }"
                    @click="
                      quickFilters.seniority =
                        quickFilters.seniority === 'lead' ? '' : 'lead'
                    "
                  >
                    Lead+
                  </UnifiedButton>
                  <span class="chip-sep">|</span>
                  <UnifiedButton
                    size="chip"
                    variant="outline"
                    :class="{ active: quickFilters.jobType === 'full-time' }"
                    @click="
                      quickFilters.jobType =
                        quickFilters.jobType === 'full-time' ? '' : 'full-time'
                    "
                  >
                    Full‑time
                  </UnifiedButton>
                  <UnifiedButton
                    size="chip"
                    variant="outline"
                    :class="{ active: quickFilters.jobType === 'contract' }"
                    @click="
                      quickFilters.jobType =
                        quickFilters.jobType === 'contract' ? '' : 'contract'
                    "
                  >
                    Contract
                  </UnifiedButton>
                  <span class="chip-sep">|</span>
                  <UnifiedButton
                    size="chip"
                    variant="outline"
                    :class="{ active: quickFilters.salaryMin === 100000 }"
                    @click="
                      quickFilters.salaryMin =
                        quickFilters.salaryMin === 100000 ? 0 : 100000
                    "
                  >
                    ≥ $100k
                  </UnifiedButton>
                  <UnifiedButton
                    size="chip"
                    variant="outline"
                    :class="{ active: quickFilters.salaryMin === 150000 }"
                    @click="
                      quickFilters.salaryMin =
                        quickFilters.salaryMin === 150000 ? 0 : 150000
                    "
                  >
                    ≥ $150k
                  </UnifiedButton>
                </div>

                <UnifiedButton
                  size="sm"
                  :variant="searchForm.gamingOnly ? 'gaming' : 'outline'"
                  leading-icon="mdi-gamepad-variant"
                  @click="toggleGamingFilter"
                >
                  Gaming Only
                </UnifiedButton>

                <UnifiedButton
                  size="sm"
                  :variant="searchForm.savedJobsOnly ? 'success' : 'outline'"
                  leading-icon="mdi-bookmark"
                  @click="toggleSavedJobsFilter"
                >
                  Saved ({{ savedJobs.length }})
                </UnifiedButton>

                <UnifiedButton
                  size="sm"
                  :variant="searchForm.remote ? 'info' : 'outline'"
                  leading-icon="mdi-home"
                  @click="toggleRemoteFilter"
                >
                  Remote
                </UnifiedButton>

                <UnifiedButton
                  v-if="hiddenJobIds.size"
                  size="sm"
                  variant="warning"
                  appearance="outlined"
                  leading-icon="mdi-eye"
                  @click="clearHiddenJobs"
                >
                  Clear Hidden ({{ hiddenJobIds.size }})
                </UnifiedButton>
              </div>
            </div>
          </div>

          <!-- Advanced Filters -->
          <div class="filter-section mt-2">
            <div
              class="filter-section-header"
              role="button"
              tabindex="0"
              :aria-expanded="showAdvancedFilters ? 'true' : 'false'"
              @click="showAdvancedFilters = !showAdvancedFilters"
              @keydown.enter.prevent="
                showAdvancedFilters = !showAdvancedFilters
              "
              @keydown.space.prevent="
                showAdvancedFilters = !showAdvancedFilters
              "
            >
              <div class="header-left">
                <AppIcon name="mdi-tune" />
                <span>Advanced Filters</span>
              </div>
              <div class="header-actions">
                <AppIcon
                  class="toggle-icon"
                  :name="
                    showAdvancedFilters ? 'mdi-chevron-up' : 'mdi-chevron-down'
                  "
                />
              </div>
            </div>
            <div v-show="showAdvancedFilters" class="filter-section-body">
              <div class="row g-3 align-items-end">
                <div class="col-md-4">
                  <label class="form-label">
                    <AppIcon name="mdi-cash" class="me-1" />
                    Minimum Salary
                  </label>
                  <input
                    v-model.number="quickFilters.salaryMin"
                    type="range"
                    min="0"
                    max="200000"
                    step="25000"
                    class="form-range"
                  />
                  <div class="small text-muted mt-1">
                    ≥ ${{ Math.round(quickFilters.salaryMin / 1000) }}k
                  </div>
                </div>

                <div class="col-md-4">
                  <label class="form-label">
                    <AppIcon name="mdi-domain" class="me-1" /> Company contains
                  </label>
                  <input
                    v-model.trim="advancedFilters.companyIncludes"
                    type="text"
                    class="form-control"
                    placeholder="e.g. Ubisoft"
                    @keyup.enter="searchJobs"
                  />
                </div>

                <div class="col-md-4 d-flex gap-3 flex-wrap">
                  <div class="form-check">
                    <input
                      id="onlySalary"
                      v-model="advancedFilters.onlyWithSalary"
                      class="form-check-input"
                      type="checkbox"
                    />
                    <label for="onlySalary" class="form-check-label">
                      <AppIcon name="mdi-currency-usd" class="me-1" /> Only with
                      salary
                    </label>
                  </div>
                  <div class="form-check">
                    <input
                      id="noIntern"
                      v-model="advancedFilters.excludeInternships"
                      class="form-check-input"
                      type="checkbox"
                    />
                    <label for="noIntern" class="form-check-label">
                      <AppIcon name="mdi-school" class="me-1" /> Exclude
                      internships
                    </label>
                  </div>
                </div>
              </div>

              <div class="mt-2 d-flex gap-2 flex-wrap">
                <UnifiedButton
                  size="sm"
                  variant="outline"
                  leading-icon="mdi-filter-off"
                  @click="clearFilters"
                >
                  Clear All
                </UnifiedButton>
                <UnifiedButton
                  size="sm"
                  variant="outline"
                  :disabled="refreshing"
                  :loading="refreshing"
                  leading-icon="mdi-refresh"
                  @click="refreshJobs"
                >
                  Refresh
                </UnifiedButton>
                <UnifiedButton
                  size="sm"
                  variant="success"
                  :disabled="!searchForm.query"
                  leading-icon="mdi-bell-plus"
                  @click="createJobAlert"
                >
                  Create Alert
                </UnifiedButton>
                <UnifiedButton
                  size="sm"
                  variant="ghost"
                  :leading-icon="showProviderStatus ? 'mdi-api-off' : 'mdi-api'"
                  @click="showProviderStatus = !showProviderStatus"
                >
                  {{ showProviderStatus ? "Hide" : "Show" }} API Status
                </UnifiedButton>
              </div>

              <!-- Provider Status (inline) -->
              <div
                v-if="showProviderStatus"
                class="provider-status-inline mt-3 p-3 glass-bg-light border rounded"
              >
                <div class="d-flex align-items-center mb-2">
                  <AppIcon name="mdi-api" class="me-2" />
                  <h6 class="mb-0">Live Job Sources</h6>
                  <span class="badge bg-primary ms-2">{{ Object.keys(providerStatus).length }} providers</span>
                </div>
                <div class="row g-2">
                  <div
                    v-for="(status, provider) in providerStatus"
                    :key="provider"
                    class="col-md-3 col-sm-6"
                  >
                    <div
                      class="provider-card-compact"
                      :class="{ active: status.enabled }"
                    >
                      <div class="provider-name">{{ provider }}</div>
                      <div class="provider-status">
                        <span
                          :class="
                            status.enabled ? 'text-success' : 'text-muted'
                          "
                        >
                          {{ status.enabled ? "Active" : "Inactive" }}
                        </span>
                        <span class="text-muted ms-1 small">
                          ({{ status.rateLimitRemaining }} left)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Job Alerts Section -->
    <div
      v-if="jobAlerts.length > 0 || showJobAlerts"
      class="job-alerts-section mb-4"
    >
      <div class="glass-card section-card">
        <div
          class="section-header d-flex justify-content-between align-items-center"
        >
          <h6 class="mb-0">
            <AppIcon name="mdi-bell" class="me-2" />
            Job Alerts ({{ jobAlerts.length }})
            <span
              v-if="realTimeStats.newJobsToday"
              class="badge bg-primary ms-2"
            >
              {{ realTimeStats.newJobsToday }} new today
            </span>
          </h6>
          <button
            class="btn btn-sm btn-outline-secondary"
            @click="showJobAlerts = !showJobAlerts"
          >
            {{ showJobAlerts ? "Hide" : "Show" }} Alerts
          </button>
        </div>

        <div v-if="showJobAlerts" class="section-body">
          <div
            v-if="jobAlerts.length === 0"
            class="text-muted text-center py-3"
          >
            No job alerts created yet. Create your first alert using the search
            form above.
          </div>

          <div v-else class="alerts-list">
            <div
              v-for="alert in jobAlerts"
              :key="alert.id"
              class="alert-item d-flex justify-content-between align-items-center p-3 mb-2 glass-list-item"
              :class="{ 'alert-disabled': !alert.enabled }"
            >
              <div class="alert-info">
                <div class="alert-name font-weight-medium">
                  {{ alert.name }}
                </div>
                <div class="alert-meta text-muted small">
                  <span>{{ alert.totalMatches }} matches</span>
                  <span class="mx-2">•</span>
                  <span>Last checked {{ getRelativeTime(alert.lastChecked) }}</span>
                  <span v-if="alert.newMatches > 0" class="mx-2">•</span>
                  <span v-if="alert.newMatches > 0" class="text-success">
                    {{ alert.newMatches }} new
                  </span>
                </div>
              </div>

              <div class="alert-actions d-flex gap-1">
                <button
                  class="btn btn-sm"
                  :class="
                    alert.enabled ? 'btn-success' : 'btn-outline-secondary'
                  "
                  @click="toggleJobAlert(alert.id)"
                >
                  <AppIcon
                    :name="alert.enabled ? 'mdi-bell' : 'mdi-bell-off'"
                  />
                </button>

                <button
                  class="btn btn-sm btn-outline-danger"
                  @click="deleteJobAlert(alert.id)"
                >
                  <AppIcon name="mdi-delete" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- New Job Notifications -->
    <div v-if="newJobNotifications.length > 0" class="job-notifications mb-4">
      <div class="glass-card section-card">
        <h6 class="mb-3">
          <AppIcon name="mdi-bell-ring" class="text-primary me-2" />
          New Job Notifications
        </h6>

        <div class="notifications-list">
          <div
            v-for="notification in newJobNotifications.slice(0, 5)"
            :key="notification.id"
            class="notification-item p-3 mb-2"
            :class="{ 'notification-unread': !notification.read }"
            @click="markNotificationRead(notification.id)"
          >
            <div class="notification-content">
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time text-muted small">
                {{ getRelativeTime(notification.timestamp) }}
              </div>
            </div>

            <div class="notification-actions">
              <UnifiedButton
                variant="outline"
                size="sm"
                @click="viewJobDetails(notification.job)"
              >
                View Job
              </UnifiedButton>
            </div>
          </div>
        </div>

        <div v-if="newJobNotifications.length > 5" class="text-center mt-2">
          <button class="btn btn-sm btn-link">
            Show {{ newJobNotifications.length - 5 }} more notifications
          </button>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="alert alert-danger">
      <AppIcon name="mdi-alert-circle-outline" class="me-2" />
      {{ _error }}
      <button class="btn btn-sm btn-outline-danger ms-2" @click="searchJobs">
        Retry
      </button>
    </div>

    <!-- Empty State -->
    <div
      v-if="!isLoading && !isSearching && displayJobs.length === 0"
      class="empty-state glass-card section-card text-center"
    >
      <div class="empty-icon mb-3">
        <AppIcon
          name="mdi-briefcase-search"
          style="font-size: 4rem; opacity: 0.3"
        />
      </div>
      <h4 class="mb-2">No jobs found</h4>
      <p class="text-muted mb-3">
        Try adjusting your search criteria or clearing filters
      </p>
      <div class="d-flex gap-2 justify-content-center">
        <UnifiedButton variant="outline" @click="clearFilters">
          Clear Filters
        </UnifiedButton>
        <UnifiedButton variant="primary" @click="autoSearchFromProfile">
          Search Based on Profile
        </UnifiedButton>
      </div>
    </div>

    <!-- Job Results -->
    <div v-else class="job-results">
      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="glass-card section-card mb-3 text-center py-5"
      >
        <div class="spinner-border text-primary me-2" role="status"></div>
        <span class="text-muted">Loading jobs from {{ providerCount }} sources...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="glass-card section-card mb-3">
        <div class="alert alert-danger mb-0" role="alert">
          <AppIcon name="mdi-alert-circle" class="me-2" />
          Error loading jobs: {{ _error }}
          <UnifiedButton
            variant="outline"
            size="sm"
            class="ms-2"
            @click="refreshJobs"
          >
            Try Again
          </UnifiedButton>
        </div>
      </div>

      <!-- Results Header -->
      <div v-else class="glass-card section-card mb-3">
        <div
          class="section-header d-flex justify-content-between align-items-center"
        >
          <div class="results-summary">
            <h5 class="mb-0">
              {{ displayJobs.length }} jobs found
              <span
                v-if="visibleJobs.length !== displayJobs.length"
                class="text-muted"
              >
                (showing {{ (currentPage - 1) * resultsPerPage + 1 }}-{{
                  Math.min(currentPage * resultsPerPage, displayJobs.length)
                }})
              </span>
              <span
                v-if="isSearching"
                class="spinner-border spinner-border-sm ms-2"
                role="status"
              ></span>
            </h5>
            <small class="text-muted">
              Sorted by relevance
              {{
                gamingJobsCount > 0 ? `• ${gamingJobsCount} gaming-related` : ""
              }}
              • Updated {{ getRelativeTime(lastUpdated) }}
            </small>
          </div>
          <div class="results-actions header-actions-group">
            <select
              v-model="sortBy"
              class="form-select sort-select"
              aria-label="Sort results"
            >
              <option value="relevance">Sort by Relevance</option>
              <option value="date">Newest First</option>
              <option value="salary">Highest Salary</option>
              <option value="company">Company A-Z</option>
            </select>
            <ViewToggle
              v-model="viewMode"
              :options="[
                { value: 'grid', icon: 'mdi-view-grid', label: 'Grid view' },
                { value: 'list', icon: 'mdi-view-list', label: 'List view' },
              ]"
            />
          </div>
        </div>
      </div>

      <!-- Active filters (quick) -->
      <div v-if="activeQuickFilters.length" class="active-filters mb-2">
        <span v-for="f in activeQuickFilters" :key="f.key" class="filter-pill">
          <AppIcon :name="f.icon" />
          {{ f.label }}
          <button
            class="clear-filter"
            aria-label="Clear filter"
            @click="clearQuickFilter(f.key)"
          >
            ×
          </button>
        </span>
        <button
          class="btn btn-xs btn-outline-secondary ms-2"
          @click="clearAllQuickFilters"
        >
          Clear all
        </button>
      </div>

      <!-- Job Results Grid -->
      <JobResultsGrid
        :jobs="visibleJobs"
        :loading="isLoading || isSearching"
        :saved-jobs="savedJobs"
        :show-metrics="true"
        :enable-a-i-insights="true"
        @apply="handleJobApply"
        @save="handleJobSave"
        @view-job="viewJobDetails"
        @add-to-compare="handleAddToCompare"
        @share-job="handleShareJob"
        @report-job="handleReportJob"
      />

      <!-- Pagination Component -->
      <JobPagination
        v-if="displayJobs.length > 0"
        :current-page="currentPage"
        :total-items="displayJobs.length"
        :items-per-page="resultsPerPage"
        :per-page-options="[10, 25, 50, 100]"
        @update:current-page="currentPage = $event"
        @update:items-per-page="handleItemsPerPageChange"
      />
    </div>

    <!-- Job Details Modal -->
    <div v-if="selectedJob" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ selectedJob.title }}</h5>
            <UnifiedButton
              variant="ghost"
              size="sm"
              icon-only
              :icon="'mdi-close'"
              aria-label="Close"
              @click="selectedJob = null"
            ></UnifiedButton>
          </div>
          <div class="modal-body">
            <JobDetailsView :job="selectedJob" />
          </div>
          <div class="modal-footer">
            <UnifiedButton variant="secondary" @click="selectedJob = null">
              Close
            </UnifiedButton>
            <UnifiedButton
              variant="gaming"
              :loading="aiAnalyzing"
              leading-icon="mdi-brain"
              @click="analyzeSelectedJob()"
            >
              {{ aiAnalyzing ? "Analyzing..." : "Analyze with AI" }}
            </UnifiedButton>
            <UnifiedButton
              variant="primary"
              :href="selectedJob.url"
              target="_blank"
              trailing-icon="mdi-open-in-new"
            >
              Apply for Job
            </UnifiedButton>
          </div>
        </div>
      </div>
    </div>
  </div>
  <AIJobAnalysisModal
    v-if="selectedJob"
    v-model:show="showAIAnalysis"
    :job="selectedJob"
    :match-data="aiMatchData"
    :salary-data="aiSalaryData"
    :insights-data="aiInsightsData"
    :mode="aiMode"
    @analyze="(_job, nextMode) => analyzeSelectedJob(nextMode)"
  />
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { computed, ref, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useDebounceFn } from "@vueuse/core";
import AppIcon from "@/components/ui/AppIcon.vue";
import { useJobBoard } from "@/composables/useJobBoard";
import { useUnifiedProfile } from "@/composables/useUnifiedProfile";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import ViewToggle from "@/components/ui/ViewToggle.vue";
import JobDetailsView from "@/components/jobs/JobDetailsView.vue";
import JobResultsGrid from "@/components/jobs/JobResultsGrid.vue";
import AIJobAnalysisModal from "@/components/jobs/AIJobAnalysisModal.vue";
import JobPagination from "@/components/jobs/JobPagination.vue";
import { aiJobService } from "@/services/AIJobService";
import { useAppStore } from "@/stores/app";
import { usePageAssistantContext } from "@/composables/usePageAssistantContext";

// Job board integration
const jobBoard = useJobBoard();
const unifiedProfile = useUnifiedProfile();

// Component state
const selectedJob = ref(null);
const sortBy = ref("relevance");
const refreshing = ref(false);
const showProviderStatus = ref(false);

// Router for navigation
const _router = useRouter();

// Enhanced state for new features
const expandedInsights = ref(null);
const comparisonJobs = ref([]);
const showJobComparison = ref(false);
const selectedJobIds = ref(new Set());
const jobNotifications = ref(new Map());
const loadingStates = ref(new Map());


const getAIInsights = (job) => {
  if (!job) return null;

  const profile = unifiedProfile.jobSearchProfile.value;
  const insights = [];

  // Career Alignment Insight
  const careerAlignment = calculateCareerAlignment(job, profile);
  insights.push({
    type: "career",
    title: "Career Alignment",
    description: `${careerAlignment.score}% match - ${careerAlignment.reasons.join(", ") || "Based on your profile"}`,
    icon: "mdi-target",
    level: careerAlignment.level,
    score: careerAlignment.score,
  });

  // Skill Gap Analysis
  const skillGaps = identifySkillGaps(job, profile);
  if (skillGaps.missing.length > 0) {
    insights.push({
      type: "skills",
      title: "Skill Development",
      description: `Consider developing: ${skillGaps.missing.slice(0, 3).join(", ")}${skillGaps.missing.length > 3 ? ` and ${skillGaps.missing.length - 3} more` : ""}`,
      icon: "mdi-school",
      missing: skillGaps.missing,
      critical: skillGaps.critical,
      action: {
        label: "View Learning Resources",
        icon: "mdi-book-open-variant",
        route: "/skill-mapper",
      },
    });
  } else {
    insights.push({
      type: "skills",
      title: "Skills Match",
      description: "Your skills align well with this role!",
      icon: "mdi-check-circle",
      level: "excellent",
    });
  }

  // Recommendations
  const recommendations = generateRecommendations(job, profile);
  if (recommendations.length > 0) {
    const topRec = recommendations[0];
    insights.push({
      type: "recommendation",
      title: topRec.title,
      description: topRec.description,
      icon:
        topRec.type === "skill"
          ? "mdi-lightbulb"
          : topRec.type === "portfolio"
            ? "mdi-briefcase"
            : "mdi-account-group",
      priority: topRec.priority,
      action: topRec.action
        ? {
            label: topRec.action,
            icon: "mdi-arrow-right",
          }
        : null,
    });
  }

  // Market Comparison
  const marketComparison = getMarketComparison(job);
  insights.push({
    type: "market",
    title: "Market Position",
    description:
      marketComparison.description || "Competitive position in the job market",
    icon: "mdi-chart-line",
    trend: marketComparison.trend,
  });

  // Growth Potential for Gaming Roles
  const growthPotential = assessGrowthPotential(job);
  if (growthPotential.score > 60) {
    insights.push({
      type: "growth",
      title: "Growth Potential",
      description:
        growthPotential.reasons.join(", ") || "Good growth opportunities",
      icon: "mdi-trending-up",
      score: growthPotential.score,
      action: {
        label: "Start Interview Prep",
        icon: "mdi-microphone",
        route: "/interview-prep",
      },
    });
  }

  return insights;
};

const calculateCareerAlignment = (job, profile) => {
  let score = 0;
  let reasons = [];

  // Check title alignment
  if (
    profile.desiredRoles?.some((role) =>
      job.title.toLowerCase().includes(role.toLowerCase()),
    )
  ) {
    score += 30;
    reasons.push("Title matches your desired roles");
  }

  // Check industry alignment (gaming focus)
  if (
    (job.gamingRelevance || 0) > 0.3 &&
    profile.targetIndustries?.includes("gaming")
  ) {
    score += 25;
    reasons.push("Gaming industry alignment");
  }

  // Check skill alignment
  const skillMatch = calculateSkillAlignment(job, profile);
  score += skillMatch * 25;
  if (skillMatch > 0.7) {
    reasons.push("Strong skill alignment");
  }

  // Check location preference
  if (job.remote && profile.workPreferences?.remote) {
    score += 10;
    reasons.push("Remote work preference match");
  }

  // Check experience level
  if (job.experienceLevel === profile.experienceLevel) {
    score += 10;
    reasons.push("Experience level match");
  }

  return {
    score: Math.min(score, 100),
    level:
      score > 80
        ? "excellent"
        : score > 60
          ? "good"
          : score > 40
            ? "fair"
            : "poor",
    reasons,
  };
};

const identifySkillGaps = (job, profile) => {
  const requiredSkills = job.tags || [];
  const userSkills = Array.isArray(profile.skills) ? profile.skills : [];
  const userSkillsLower = userSkills.map((s) => s.toLowerCase());

  const missingSkills = requiredSkills.filter(
    (skill) => !userSkillsLower.includes(skill.toLowerCase()),
  );

  // Enhanced critical skills for gaming industry
  const gamingCriticalSkills = [
    "unity",
    "unreal",
    "c++",
    "c#",
    "python",
    "lua",
    "glsl",
    "hlsl",
    "maya",
    "blender",
    "3ds max",
    "substance",
    "zbrush",
    "photoshop",
    "perforce",
    "git",
    "jenkins",
    "jira",
    "confluence",
    "gameplay programming",
    "graphics programming",
    "engine programming",
    "level design",
    "game design",
    "narrative design",
    "ui/ux design",
    "technical art",
    "vfx",
    "animation",
    "rigging",
    "lighting",
    "audio programming",
    "wwise",
    "fmod",
    "procedural generation",
    "multiplayer",
    "networking",
    "server architecture",
    "aws",
    "azure",
    "playfab",
    "steamworks",
    "console development",
    "mobile development",
  ];

  const webCriticalSkills = [
    "javascript",
    "typescript",
    "react",
    "vue",
    "angular",
    "node",
    "express",
  ];

  const criticalSkills = missingSkills.filter((skill) => {
    const skillLower = skill.toLowerCase();
    return (
      gamingCriticalSkills.includes(skillLower) ||
      webCriticalSkills.includes(skillLower)
    );
  });

  // Categorize missing skills
  const categorizedSkills = {
    programming: [],
    tools: [],
    design: [],
    technical: [],
    other: [],
  };

  missingSkills.forEach((skill) => {
    const skillLower = skill.toLowerCase();
    if (
      [
        "unity",
        "unreal",
        "c++",
        "c#",
        "python",
        "javascript",
        "lua",
        "gameplay programming",
        "graphics programming",
      ].some((s) => skillLower.includes(s))
    ) {
      categorizedSkills.programming.push(skill);
    } else if (
      [
        "maya",
        "blender",
        "substance",
        "zbrush",
        "photoshop",
        "perforce",
        "git",
        "jenkins",
      ].some((s) => skillLower.includes(s))
    ) {
      categorizedSkills.tools.push(skill);
    } else if (
      [
        "game design",
        "level design",
        "ui/ux",
        "narrative design",
        "technical art",
      ].some((s) => skillLower.includes(s))
    ) {
      categorizedSkills.design.push(skill);
    } else if (
      ["multiplayer", "networking", "aws", "azure", "console development"].some(
        (s) => skillLower.includes(s),
      )
    ) {
      categorizedSkills.technical.push(skill);
    } else {
      categorizedSkills.other.push(skill);
    }
  });

  return {
    missing: missingSkills.slice(0, 5),
    critical: criticalSkills,
    categorized: categorizedSkills,
    total: missingSkills.length,
    matchPercentage: Math.round(
      ((requiredSkills.length - missingSkills.length) /
        Math.max(requiredSkills.length, 1)) *
        100,
    ),
    impact:
      criticalSkills.length > 0
        ? "high"
        : missingSkills.length > 3
          ? "medium"
          : "low",
  };
};

const generateRecommendations = (job, profile) => {
  const recommendations = [];

  // Resume tailoring
  if (job.tags?.length > 0) {
    recommendations.push({
      type: "resume",
      title: "Tailor your resume",
      description: `Highlight experience with ${job.tags.slice(0, 3).join(", ")} to better match this role`,
      priority: "high",
      action: "Open Resume Builder",
    });
  }

  // Portfolio enhancement
  if ((job.gamingRelevance || 0) > 0.3) {
    recommendations.push({
      type: "portfolio",
      title: "Showcase gaming projects",
      description:
        "Add relevant gaming projects to strengthen your portfolio for this role",
      priority: "medium",
      action: "Update Portfolio",
    });
  }

  // Skill development
  const skillGaps = identifySkillGaps(job, profile);
  if (skillGaps.critical.length > 0) {
    recommendations.push({
      type: "skill",
      title: "Develop critical skills",
      description: `Consider learning ${skillGaps.critical[0]} to qualify for similar roles`,
      priority: "high",
      action: "Find Resources",
    });
  }

  // Networking
  recommendations.push({
    type: "network",
    title: "Connect with the company",
    description: `Research ${job.company} employees on LinkedIn for networking opportunities`,
    priority: "medium",
    action: "View Company",
  });

  return recommendations;
};

const getMarketComparison = (job) => {
  // Mock market data - in real app would fetch from API
  const similarJobs = filteredJobs.value.filter(
    (j) =>
      j.id !== job.id &&
      j.title.toLowerCase().includes(job.title.split(" ")[0].toLowerCase()),
  );

  const salaryComparison = job.salary
    ? {
        position: "competitive", // above/below/competitive
        percentile: 75,
        range: `$${parseInt(job.salary.replace(/\D/g, "")) * 0.9}k - $${parseInt(job.salary.replace(/\D/g, "")) * 1.1}k`,
      }
    : null;

  return {
    similarJobsCount: similarJobs.length,
    salaryComparison,
    demand:
      similarJobs.length > 10
        ? "high"
        : similarJobs.length > 5
          ? "medium"
          : "low",
    growthTrend: "positive", // positive/negative/stable
  };
};

const assessGrowthPotential = (job) => {
  let score = 50;
  const factors = [];

  // Gaming industry growth
  if ((job.gamingRelevance || 0) > 0.3) {
    score += 20;
    factors.push("Gaming industry growth");
  }

  // Remote opportunities
  if (job.remote) {
    score += 10;
    factors.push("Remote work flexibility");
  }

  // Tech stack relevance
  const modernTech = [
    "react",
    "vue",
    "typescript",
    "python",
    "unity",
    "unreal",
  ];
  const hasModernTech = job.tags?.some((tag) =>
    modernTech.includes(tag.toLowerCase()),
  );
  if (hasModernTech) {
    score += 15;
    factors.push("Modern technology stack");
  }

  return {
    score: Math.min(score, 100),
    level: score > 80 ? "high" : score > 60 ? "medium" : "low",
    factors,
    timeframe: "2-3 years",
  };
};

const generateSkillSuggestions = (missingSkills) => {
  return missingSkills.slice(0, 3).map((skill) => ({
    skill,
    resources: [
      {
        type: "course",
        name: `${skill} Fundamentals`,
        provider: "Online Course",
        url: `https://www.coursera.org/search?query=${encodeURIComponent(skill)}`,
      },
      {
        type: "practice",
        name: `${skill} Projects`,
        provider: "GitHub",
        url: `https://github.com/search?q=${encodeURIComponent(skill)}+language:javascript`,
      },
      {
        type: "certification",
        name: `${skill} Certification`,
        provider: "Industry",
        url: `https://www.google.com/search?q=${encodeURIComponent(skill)}+certification`,
      },
    ],
  }));
};

// Add method to actually use the generated suggestions
const openLearningResource = (resource) => {
  if (resource.url) {
    window.open(resource.url, "_blank");
  }
};


const createJobAlert = () => {
  if (!searchForm.value.query?.trim()) {
    alert("Please enter a search query to create an alert");
    return;
  }

  const alert = {
    id: Date.now().toString(),
    query: searchForm.value.query,
    filters: { ...advancedFilters.value, ...quickFilters.value },
    created: new Date().toISOString(),
    active: true,
    lastNotified: null,
    jobsFound: 0,
  };

  jobAlerts.value.push(alert);

  // Store in localStorage for persistence
  try {
    localStorage.setItem("job_alerts", JSON.stringify(jobAlerts.value));
    alert("Job alert created successfully!");
  } catch {
    console.error("Failed to save job alert:", error);
  }
};

// autoSearchFromProfile is provided by the composable

const toggleInsights = (jobId) => {
  expandedInsights.value = expandedInsights.value === jobId ? null : jobId;
};

const handleInsightAction = (action, job) => {
  switch (action) {
    case "Open Resume Builder":
      router.push("/document-builder");
      break;
    case "Update Portfolio":
      router.push("/portfolio");
      break;
    case "Find Resources":
      // Open learning resources modal
      break;
    case "View Company":
      window.open(
        `https://linkedin.com/company/${job.company.toLowerCase().replace(/\s+/g, "-")}`,
        "_blank",
      );
      break;
  }
};


const isInComparison = (jobId) => {
  return comparisonJobs.value.some((j) => j.id === jobId);
};

const toggleComparison = (job) => {
  const index = comparisonJobs.value.findIndex((j) => j.id === job.id);
  if (index >= 0) {
    comparisonJobs.value.splice(index, 1);
  } else if (comparisonJobs.value.length < 3) {
    comparisonJobs.value.push(job);
  }

  if (comparisonJobs.value.length >= 2) {
    showJobComparison.value = true;
  }
};

const removeFromComparison = (jobId) => {
  comparisonJobs.value = comparisonJobs.value.filter((j) => j.id !== jobId);
  if (comparisonJobs.value.length < 2) {
    showJobComparison.value = false;
  }
};

const clearComparison = () => {
  comparisonJobs.value = [];
  showJobComparison.value = false;
};

const compareJobs = (jobs) => {
  return {
    salaries: jobs.map((j) => j.salary || "Not specified"),
    locations: jobs.map((j) => j.location),
    types: jobs.map((j) => j.type || "Not specified"),
    skills: {
      common: getCommonSkills(jobs),
      unique: getUniqueSkills(jobs),
    },
    benefits: jobs.map((j) => j.benefits || []),
    companies: jobs.map((j) => ({
      name: j.company,
      size: j.companySize || "Unknown",
      industry: j.industry || "Unknown",
    })),
  };
};

const getCommonSkills = (jobs) => {
  const allSkills = jobs.flatMap((j) => j.tags || []);
  const skillCounts = allSkills.reduce((acc, skill) => {
    acc[skill] = (acc[skill] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(skillCounts)
    .filter(([, count]) => count === jobs.length)
    .map(([skill]) => skill);
};

const getUniqueSkills = (jobs) => {
  return jobs.map((job) => ({
    jobId: job.id,
    skills: (job.tags || []).filter(
      (tag) =>
        !jobs.some(
          (otherJob) =>
            otherJob.id !== job.id && (otherJob.tags || []).includes(tag),
        ),
    ),
  }));
};


const toggleJobSelection = (jobId) => {
  if (selectedJobIds.value.has(jobId)) {
    selectedJobIds.value.delete(jobId);
  } else {
    selectedJobIds.value.add(jobId);
  }
  selectedJobIds.value = new Set(selectedJobIds.value); // Trigger reactivity
};

const bulkSaveJobs = async () => {
  const jobs = Array.from(selectedJobIds.value)
    .map((id) => filteredJobs.value.find((j) => j.id === id))
    .filter(Boolean);

  try {
    for (const job of jobs) {
      await saveJob(job);
    }
    selectedJobIds.value.clear();
  } catch {
    console.error("Bulk save failed:", error);
  }
};

const bulkCompareJobs = () => {
  const jobs = Array.from(selectedJobIds.value)
    .map((id) => filteredJobs.value.find((j) => j.id === id))
    .filter(Boolean)
    .slice(0, 3);

  comparisonJobs.value = jobs;
  showJobComparison.value = true;
  selectedJobIds.value.clear();
};

const bulkExportJobs = () => {
  const jobs = Array.from(selectedJobIds.value)
    .map((id) => filteredJobs.value.find((j) => j.id === id))
    .filter(Boolean);

  const exportData = jobs.map((job) => ({
    title: job.title,
    company: job.company,
    location: job.location,
    salary: job.salary,
    type: job.type,
    url: job.url,
    tags: job.tags?.join(", "),
    description: job.description,
  }));

  const csv = convertToCSV(exportData);
  downloadCSV(csv, "selected_jobs.csv");
  selectedJobIds.value.clear();
};

const convertToCSV = (_data) => {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((header) => JSON.stringify(row[header] || "")).join(","),
    ),
  ].join("\n");

  return csv;
};

const downloadCSV = (csv, filename) => {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};


const quickApply = async (job) => {
  if (!canQuickApply(job)) return;

  loadingStates.value.set(job.id, "applying");

  try {
    // In a real app, this would submit application via API
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Track application
    const applications = JSON.parse(
      localStorage.getItem("job_applications") || "[]",
    );
    applications.push({
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      appliedAt: new Date().toISOString(),
      status: "submitted",
    });
    localStorage.setItem("job_applications", JSON.stringify(applications));

    // Show success notification
    jobNotifications.value.set(job.id, {
      type: "success",
      message: "Application submitted successfully!",
      timestamp: Date.now(),
    });

    // Auto-clear notification
    setTimeout(() => {
      jobNotifications.value.delete(job.id);
    }, 5000);
  } catch {
    jobNotifications.value.set(job.id, {
      type: "error",
      message: "Failed to submit application. Please try the direct link.",
      timestamp: Date.now(),
    });
  } finally {
    loadingStates.value.delete(job.id);
  }
};

const canQuickApply = (job) => {
  // Check if job supports quick apply (mock logic)
  const quickApplyProviders = ["greenhouse", "lever", "workday"];
  return quickApplyProviders.some(
    (provider) => job.url?.includes(provider) || job.provider === provider,
  );
};

const shareJob = async (job) => {
  const shareData = {
    title: `${job.title} at ${job.company}`,
    text: `Check out this ${job.title} position at ${job.company}`,
    url: job.url,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(job.url);
      jobNotifications.value.set(job.id, {
        type: "success",
        message: "Job link copied to clipboard!",
        timestamp: Date.now(),
      });

      setTimeout(() => {
        jobNotifications.value.delete(job.id);
      }, 3000);
    }
  } catch (_error) {
    console.error("Share failed:", error);
  }
};


const updateJobStatus = (jobId, status) => {
  const job = filteredJobs.value.find((j) => j.id === jobId);
  if (job) {
    job.status = status;
    job.lastUpdated = new Date().toISOString();
  }
};

const addJobNotification = (jobId, notification) => {
  jobNotifications.value.set(jobId, notification);

  // Auto-clear after delay
  setTimeout(() => {
    jobNotifications.value.delete(jobId);
  }, notification.duration || 5000);
};


const calculateSkillAlignment = (job, profile) => {
  const jobSkills = (job.tags || []).map((s) => s.toLowerCase());
  const userSkills = Array.isArray(profile.skills)
    ? profile.skills.map((s) => s.toLowerCase())
    : [];

  if (jobSkills.length === 0) return 0;

  const matchedSkills = jobSkills.filter((skill) => userSkills.includes(skill));
  return matchedSkills.length / jobSkills.length;
};

const getCompanyInitials = (companyName) => {
  return companyName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

const onLogoError = (event) => {
  event.target.style.display = "none";
  event.target.nextElementSibling.style.display = "flex";
};

const formatJobType = (type) => {
  const types = {
    "full-time": "Full-time",
    "part-time": "Part-time",
    contract: "Contract",
    freelance: "Freelance",
    intern: "Internship",
    temporary: "Temporary",
  };
  return types[type?.toLowerCase()] || type;
};

const getRelativeTime = (dateString) => {
  if (!dateString) return "Recently";

  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 48) return "Yesterday";

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;

  return date.toLocaleDateString();
};

const truncateDescription = (description, maxLength = 150) => {
  if (!description || description.length <= maxLength) return description;
  return description.substring(0, maxLength).trim() + "...";
};

const getJobFreshness = (job) => {

  if (!job?.posted) return null;

  const posted = new Date(job.posted);
  const now = new Date();
  const diffInHours = Math.floor((now - posted) / (1000 * 60 * 60));

  if (diffInHours < 2) {
    return { type: "hot", label: "Just Posted", icon: "mdi-fire" };
  } else if (diffInHours < 24) {
    return { type: "fresh", label: "New Today", icon: "mdi-star" };
  } else if (diffInHours < 72) {
    return { type: "recent", label: "Recent", icon: "mdi-clock-outline" };
  }

  return null;
};


const getSkillMatchPercentage = (job) => {
  const requiredSkills = job.tags || [];
  const matchedSkills = requiredSkills.filter((skill) => isUserSkill(skill));
  return Math.round(
    (matchedSkills.length / Math.max(requiredSkills.length, 1)) * 100,
  );
};

const getSkillMatchLevel = (job) => {
  const percentage = getSkillMatchPercentage(job);
  if (percentage >= 80) return "excellent";
  if (percentage >= 60) return "good";
  if (percentage >= 40) return "fair";
  return "poor";
};

const isCriticalGamingSkill = (skill) => {
  const criticalSkills = [
    "unity",
    "unreal",
    "c++",
    "c#",
    "python",
    "lua",
    "glsl",
    "hlsl",
    "maya",
    "blender",
    "3ds max",
    "substance",
    "zbrush",
    "gameplay programming",
    "graphics programming",
    "engine programming",
    "level design",
    "game design",
    "narrative design",
    "technical art",
  ];
  return criticalSkills.some((critical) =>
    skill.toLowerCase().includes(critical),
  );
};

const isProgrammingSkill = (skill) => {
  const programmingSkills = [
    "c++",
    "c#",
    "python",
    "javascript",
    "lua",
    "java",
    "kotlin",
    "swift",
    "programming",
  ];
  return programmingSkills.some((prog) => skill.toLowerCase().includes(prog));
};

const isDesignSkill = (skill) => {
  const designSkills = [
    "design",
    "art",
    "ui",
    "ux",
    "photoshop",
    "maya",
    "blender",
    "zbrush",
    "substance",
  ];
  return designSkills.some((design) => skill.toLowerCase().includes(design));
};

const getSkillIcon = (skill) => {
  const skillLower = skill.toLowerCase();
  if (skillLower.includes("unity")) return "mdi-unity";
  if (skillLower.includes("unreal")) return "mdi-unreal";
  if (skillLower.includes("c++") || skillLower.includes("c#"))
    return "mdi-language-cpp";
  if (skillLower.includes("python")) return "mdi-language-python";
  if (skillLower.includes("javascript")) return "mdi-language-javascript";
  if (skillLower.includes("design")) return "mdi-palette";
  if (skillLower.includes("art")) return "mdi-brush";
  if (skillLower.includes("programming")) return "mdi-code-braces";
  if (skillLower.includes("maya") || skillLower.includes("blender"))
    return "mdi-cube-outline";
  if (skillLower.includes("multiplayer") || skillLower.includes("network"))
    return "mdi-lan";
  return "mdi-cog";
};

const getSkillTooltip = (skill) => {
  if (isUserSkill(skill))
    return `✓ You have this skill! Great match for this role.`;
  if (isCriticalGamingSkill(skill))
    return `⭐ Critical gaming skill - high priority for this role`;
  return `Consider learning ${skill} to improve your match for this role`;
};

const hasSkillGaps = (job) => {
  const profile = unifiedProfile.jobSearchProfile.value;
  const skillGaps = identifySkillGaps(job, profile);
  return skillGaps.missing.length > 0;
};

const getCriticalSkillGaps = (job) => {
  const profile = unifiedProfile.jobSearchProfile.value;
  const skillGaps = identifySkillGaps(job, profile);
  return skillGaps.critical || [];
};

const navigateToSkillMapper = (job) => {
  // Store job context for skill mapper
  localStorage.setItem(
    "skillMapperContext",
    JSON.stringify({
      jobTitle: job.title,
      requiredSkills: job.tags,
      company: job.company,
    }),
  );
  router.push("/skill-mapper");
};

const startInterviewPrep = (job) => {
  // Store job context for interview prep
  localStorage.setItem(
    "interviewPrepContext",
    JSON.stringify({
      jobTitle: job.title,
      company: job.company,
      skills: job.tags,
      description: job.description,
    }),
  );
  router.push("/interview-prep");
};

const isUserSkill = (skill) => {
  const profile = unifiedProfile.jobSearchProfile.value;
  const userSkills = Array.isArray(profile.skills)
    ? profile.skills.map((s) => s.toLowerCase())
    : [];
  return userSkills.includes(skill.toLowerCase());
};

const extractSalaryNumber = (salaryString) => {
  if (!salaryString) return 0;
  const numbers = salaryString.match(/[\d,]+/g);
  if (!numbers) return 0;
  return parseInt(numbers[0].replace(/,/g, "")) || 0;
};

const getMatchScoreClass = (score) => {
  if (score >= 90) return "score-excellent";
  if (score >= 75) return "score-good";
  if (score >= 60) return "score-fair";
  return "score-low";
};

// AI Analysis modal state
const showAIAnalysis = ref(false);
const aiAnalyzing = ref(false);
const aiMatchData = ref(null);
const aiSalaryData = ref(null);
const aiInsightsData = ref(null);
const aiMode = ref("match");
const appStore = useAppStore();
const { setPageContext, clearPageContext } = usePageAssistantContext();

// Real-time job service state
const jobAlerts = ref([]);
const newJobNotifications = ref([]);
const realTimeStats = ref({});
const showJobAlerts = ref(false);

// Search form
const searchForm = ref({
  query: "",
  location: "",
  type: "",
  datePosted: "all",
  gamingOnly: false,
  savedJobsOnly: false,
  remote: false,
});

// Computed properties
const {
  jobs: _jobs,
  filteredJobs,
  savedJobs,
  totalJobs,
  gamingJobsCount,
  averageSalary,
  topMatches,
  profileSuggestions,
  isLoading,
  isSearching,
  error,
  lastUpdated,
  searchJobs: performSearch,
  autoSearchFromProfile,
  saveJob,
  unsaveJob,
  isJobSaved,
  getProviderStatus,
} = jobBoard;

const providerStatus = computed(() => getProviderStatus());
const providerCount = computed(
  () =>
    Object.keys(providerStatus.value).filter(
      (p) => providerStatus.value[p].enabled,
    ).length,
);

// Collapsible sections
const showQuickFilters = ref(true);
const showAdvancedFilters = ref(false);

const sortedJobs = computed(() => {
  const jobs = [...filteredJobs.value];

  switch (sortBy.value) {
    case "date":
      return jobs.sort((a, b) => {
        const dateA = a.postedDate ? new Date(a.postedDate) : new Date(0);
        const dateB = b.postedDate ? new Date(b.postedDate) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
    case "salary":
      return jobs.sort((a, b) => {
        const salaryA = extractSalaryNumber(a.salary);
        const salaryB = extractSalaryNumber(b.salary);
        return salaryB - salaryA;
      });
    case "company":
      return jobs.sort((a, b) => a.company.localeCompare(b.company));
    default: // relevance
      return jobs; // Already sorted by relevance in useJobBoard
  }
});

// Quick filters (local-only refinement without extra API calls)
const quickFilters = ref({
  seniority: "", // 'junior' | 'mid' | 'senior' | 'lead'
  jobType: "", // 'full-time' | 'contract' | 'part-time' | 'internship'
  salaryMin: 0,
});

// View + pagination state
const viewMode = ref("grid"); // 'grid' | 'list'
const resultsPerPage = ref(25);
const currentPage = ref(1);

// Advanced local-only refinements
const advancedFilters = ref({
  onlyWithSalary: false,
  excludeInternships: false,
  companyIncludes: "",
});

const activeQuickFilters = computed(() => {
  const items = [];
  if (quickFilters.value.seniority)
    items.push({
      key: "seniority",
      label: capitalize(quickFilters.value.seniority),
      icon: "mdi-account-badge",
    });
  if (quickFilters.value.jobType)
    items.push({
      key: "jobType",
      label: formatJobType(quickFilters.value.jobType),
      icon: "mdi-briefcase",
    });
  if (quickFilters.value.salaryMin)
    items.push({
      key: "salaryMin",
      label: `≥ $${quickFilters.value.salaryMin / 1000}k`,
      icon: "mdi-cash",
    });
  return items;
});

const capitalize = (s = "") =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

const clearQuickFilter = (key) => {
  quickFilters.value[key] = key === "salaryMin" ? 0 : "";
};
const clearAllQuickFilters = () => {
  quickFilters.value = { seniority: "", jobType: "", salaryMin: 0 };
};

// Hidden jobs (persist locally)
const hiddenJobIds = ref(new Set());
const HIDDEN_KEY = "navi_hidden_jobs";

onMounted(() => {
  try {
    const raw = localStorage.getItem(HIDDEN_KEY);
    if (raw) hiddenJobIds.value = new Set(JSON.parse(raw));
  } catch {}
});

// Build and push page assistant context for this view
function pushAssistantContext() {
  const ctx = {
    page: "jobs",
    searchQuery: searchForm.value.query || "",
    location: searchForm.value.location || "",
    type: searchForm.value.type || "",
    datePosted: searchForm.value.datePosted || "all",
    gamingOnly: !!searchForm.value.gamingOnly,
    savedJobsOnly: !!searchForm.value.savedJobsOnly,
    remote: !!searchForm.value.remote,
    quickFilters: { ...quickFilters },
    advancedFilters: { ...advancedFilters },
    viewMode: viewMode.value,
    resultsPerPage: resultsPerPage.value,
    totals: {
      totalJobs: totalJobs.value,
      gamingJobs: gamingJobsCount.value,
      topMatches: topMatches.value.length,
      providersActive: providerCount.value,
    },
    selectedJob: selectedJob.value
      ? {
          id: selectedJob.value.id,
          title: selectedJob.value.title,
          company: selectedJob.value.company,
          location: selectedJob.value.location,
        }
      : null,
  };
  setPageContext(ctx);
}

onMounted(pushAssistantContext);
watch(
  [
    () => searchForm.value.query,
    () => searchForm.value.location,
    () => searchForm.value.type,
    () => searchForm.value.datePosted,
    () => searchForm.value.gamingOnly,
    () => searchForm.value.savedJobsOnly,
    () => searchForm.value.remote,
    () => quickFilters.value.seniority,
    () => quickFilters.value.jobType,
    () => quickFilters.value.salaryMin,
    () => advancedFilters.value.companyIncludes,
    () => advancedFilters.value.onlyWithSalary,
    () => advancedFilters.value.excludeInternships,
    viewMode,
    resultsPerPage,
    selectedJob,
  ],
  pushAssistantContext,
  { deep: false },
);

onUnmounted(() => {
  clearPageContext();
});

watch(
  hiddenJobIds,
  (set) => {
    try {
      localStorage.setItem(HIDDEN_KEY, JSON.stringify(Array.from(set)));
    } catch {}
  },
  { deep: true },
);

const hideJob = (id) => {
  hiddenJobIds.value.add(id);
};
const clearHiddenJobs = () => {
  hiddenJobIds.value.clear();
};

// Final display list after local filters
const displayJobs = computed(() => {
  let list = sortedJobs.value.filter((j) => !hiddenJobIds.value.has(j.id));

  // Saved-only refinement if composable didn’t apply it
  if (searchForm.value.savedJobsOnly)
    list = list.filter((j) => isJobSaved(j.id));

  // Quick filters
  if (quickFilters.value.jobType) {
    const jt = quickFilters.value.jobType;
    list = list.filter((j) => (j.type || "").toLowerCase().includes(jt));
  }
  if (quickFilters.value.seniority) {
    const s = quickFilters.value.seniority;
    const pat =
      s === "junior"
        ? /(junior|entry|level\s*1)/i
        : s === "mid"
          ? /(mid|intermediate|level\s*2)/i
          : s === "senior"
            ? /(senior|sr\.|lead|principal|staff|level\s*[34])/i
            : /(lead|principal|staff)/i;
    list = list.filter(
      (j) => pat.test(j.title || "") || pat.test(j.description || ""),
    );
  }
  if (quickFilters.value.salaryMin) {
    list = list.filter(
      (j) => extractSalaryNumber(j.salary) >= quickFilters.value.salaryMin,
    );
  }

  // Advanced refinements
  if (advancedFilters.value.onlyWithSalary) {
    list = list.filter((j) => !!extractSalaryNumber(j.salary));
  }
  if (advancedFilters.value.excludeInternships) {
    list = list.filter(
      (j) => !/(intern|internship)/i.test(`${j.title || ""} ${j.type || ""}`),
    );
  }
  if (advancedFilters.value.companyIncludes?.trim()) {
    const q = advancedFilters.value.companyIncludes.trim().toLowerCase();
    list = list.filter((j) => (j.company || "").toLowerCase().includes(q));
  }

  return list;
});

// Visible page slice with pagination
const visibleJobs = computed(() => {
  const start = (currentPage.value - 1) * resultsPerPage.value;
  const end = start + resultsPerPage.value;
  return displayJobs.value.slice(start, end);
});

// Methods
const searchJobs = async () => {
  const base = { ...searchForm.value };
  if (!base.query && !base.location) {
    base.query = "game";
  }
  await performSearch(base);
};

const setQuickSearch = (suggestion) => {
  searchForm.value.query = suggestion;
  searchJobs();
};

const toggleGamingFilter = () => {
  searchForm.value.gamingOnly = !searchForm.value.gamingOnly;
  searchJobs();
};

const toggleSavedJobsFilter = () => {
  searchForm.value.savedJobsOnly = !searchForm.value.savedJobsOnly;
  searchJobs();
};

const toggleRemoteFilter = () => {
  searchForm.value.remote = !searchForm.value.remote;
  searchJobs();
};

const clearFilters = () => {
  searchForm.value = {
    query: "",
    location: "",
    type: "",
    datePosted: "all",
    gamingOnly: false,
    savedJobsOnly: false,
    remote: false,
  };
  searchJobs();
};

const refreshJobs = async () => {
  refreshing.value = true;
  try {
    // Force refresh with current search parameters
    await searchJobs();
    console.log("Jobs refreshed:", {
      total: totalJobs.value,
      filtered: filteredJobs.value.length,
      providers: Object.keys(providerStatus.value).length,
    });
  } finally {
    refreshing.value = false;
  }
};

// Auto-search on mount to populate initial data
const initializeJobSearch = async () => {
  // If we have profile data, use it for initial search
  if (unifiedProfile.jobSearchProfile.value) {
    await autoSearchFromProfile();
  } else {
    // Otherwise do a general gaming industry search
    searchForm.value.query = "game developer";
    searchForm.value.gamingOnly = true;
    await performSearch();
  }
};

const toggleSaveJob = async (job) => {
  if (isJobSaved(job.id)) {
    await unsaveJob(job.id);
  } else {
    await saveJob(job);
  }
};

const viewJobDetails = (job) => {
  selectedJob.value = job;
};

// Event handlers for JobResultsGrid
const handleJobApply = async (job) => {
  // Existing applyToJob logic or new implementation
  console.log("Applying to job:", job.title);
  // You can add actual apply logic here
};

const handleJobSave = (job) => {

  toggleSaveJob(job);
};

const handleAddToCompare = (job) => {

  toggleComparison(job);
};

const handleShareJob = async (job) => {

  await shareJob(job);
};

const handleReportJob = (job) => {
  console.log("Reporting job:", job.title);

};

// Trigger AI analysis for the currently selected job
const analyzeSelectedJob = async (mode = "match") => {
  if (!selectedJob.value) return;
  // Require API key for AI features
  if (!appStore.settings?.geminiApiKey) {
    alert("Add your Gemini API key in Settings to enable AI analysis.");
    return;
  }
  aiMode.value = mode;
  aiAnalyzing.value = true;
  try {
    // Analyze match (uses heuristics and profile)
    const matches = await aiJobService.analyzeJobMatches([selectedJob.value]);
    aiMatchData.value = matches && matches[0] ? matches[0] : null;

    // Predict salary and gather insights
    aiSalaryData.value = await aiJobService.predictSalary(selectedJob.value);
    aiInsightsData.value = await aiJobService.analyzeJobInsights(
      selectedJob.value,
    );

    showAIAnalysis.value = true;
  } catch (_e) {
    console.warn("AI analysis failed:", e);
    alert("AI analysis failed. Please try again later.");
  } finally {
    aiAnalyzing.value = false;
  }
};

const handleItemsPerPageChange = (newSize) => {
  resultsPerPage.value = newSize;
  currentPage.value = 1; // Reset to first page when changing page size
};

const loadMoreJobs = () => {
  // For backwards compatibility - just go to next page
  if (currentPage.value * resultsPerPage.value < displayJobs.value.length) {
    currentPage.value += 1;
  }
};

// Persist view/paging preferences
const PREFS_KEY = "navi_job_results_prefs";

onMounted(async () => {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      const prefs = JSON.parse(raw);
      if (prefs && (prefs.viewMode === "grid" || prefs.viewMode === "list")) {
        viewMode.value = prefs.viewMode;
      }
      const size = parseInt(prefs?.resultsPerPage, 10);
      if (!Number.isNaN(size) && size > 0) {
        resultsPerPage.value = size;
      }
      const page = parseInt(prefs?.currentPage, 10);
      if (!Number.isNaN(page) && page > 0) {
        currentPage.value = page;
      }
    }
  } catch {}

  // Initialize job search to populate data
  await initializeJobSearch();
});

watch([viewMode, resultsPerPage, currentPage], ([mode, size, page]) => {
  try {
    localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({
        viewMode: mode,
        resultsPerPage: size,
        currentPage: page,
      }),
    );
  } catch {}
});

// Persist collapsible panel UI state (independent key to avoid overwrites)
const FILTER_UI_KEY = "navi_job_filters_ui";

onMounted(() => {
  try {
    const raw = localStorage.getItem(FILTER_UI_KEY);
    if (raw) {
      const ui = JSON.parse(raw);
      if (typeof ui?.showQuickFilters === "boolean")
        showQuickFilters.value = ui.showQuickFilters;
      if (typeof ui?.showAdvancedFilters === "boolean")
        showAdvancedFilters.value = ui.showAdvancedFilters;
    }
  } catch {}
});

watch([showQuickFilters, showAdvancedFilters], ([q, a]) => {
  try {
    localStorage.setItem(
      FILTER_UI_KEY,
      JSON.stringify({ showQuickFilters: q, showAdvancedFilters: a }),
    );
  } catch {}
});

// Debounced search on query change
const debouncedSearch = useDebounceFn(() => searchJobs(), 400);
watch(
  () => searchForm.value.query,
  () => debouncedSearch(),
);

// Reset to first page when search criteria change
watch(
  [
    () => searchForm.value.query,
    () => searchForm.value.location,
    () => searchForm.value.type,
    () => searchForm.value.datePosted,
    () => searchForm.value.gamingOnly,
    () => searchForm.value.savedJobsOnly,
    () => searchForm.value.remote,
    () => quickFilters.value.seniority,
    () => quickFilters.value.jobType,
    () => quickFilters.value.salaryMin,
    () => advancedFilters.value.companyIncludes,
    () => advancedFilters.value.onlyWithSalary,
    () => advancedFilters.value.excludeInternships,
  ],
  () => {
    currentPage.value = 1; // Reset to first page when filters change
  },
);

// Highlight search matches in text
const escapeHtml = (s = "") =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const highlight = (text = "") => {
  const q = (searchForm.value.query || "").trim();
  if (!q) return escapeHtml(text);
  const words = Array.from(new Set(q.split(/\s+/).filter(Boolean))).slice(0, 6);
  if (!words.length) return escapeHtml(text);
  const pattern = new RegExp(
    `(${words.map((w) => w.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")).join("|")})`,
    "gi",
  );
  return escapeHtml(text).replace(pattern, "<mark>$1</mark>");
};


defineExpose({
  getAIInsights,
  generateSkillSuggestions,
  openLearningResource,
  createJobAlert,
  toggleInsights,
  handleInsightAction,
  isInComparison,
  toggleComparison,
  removeFromComparison,
  clearComparison,
  compareJobs,
  toggleJobSelection,
  bulkSaveJobs,
  bulkCompareJobs,
  bulkExportJobs,
  quickApply,
  updateJobStatus,
  addJobNotification,
  getCompanyInitials,
  onLogoError,
  truncateDescription,
  getJobFreshness,
  getSkillMatchLevel,
  isProgrammingSkill,
  isDesignSkill,
  getSkillIcon,
  getSkillTooltip,
  hasSkillGaps,
  getCriticalSkillGaps,
  navigateToSkillMapper,
  startInterviewPrep,
  getMatchScoreClass,
  hideJob,
  visibleJobs,
  loadMoreJobs,
  highlight,
});
</script>

<style scoped>
.provider-status-inline {
  background: var(--glass-bg-light);
  border-radius: var(--radius-md);
}

.provider-card-compact {
  background: var(--surface-base);
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--easing-ease);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.provider-card-compact.active {
}

.provider-card-compact .provider-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.provider-card-compact .provider-status {
  font-size: var(--font-size-xs);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.empty-icon {
  color: var(--text-tertiary);
}

.filters-grid {
  display: grid;
  align-items: end;
}

.filter-item .form-label.small {
  color: var(--text-secondary);
}
.filter-input {
}

.filter-actions :deep(.unified-button),
.filter-actions :deep(button),
.filter-actions .btn {
}

  .filter-actions {
  }
}

  .filter-actions {
  }
}

.filter-section {
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-blur-sm);
}

.filter-section + .filter-section {
}

.filter-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
}

.filter-section-header .header-left {
  display: inline-flex;
  align-items: center;
}

.filter-section-header:hover {
  background: var(--glass-hover-bg);
}

.filter-section-header .toggle-icon {
}

.filter-section-body {
}

.results-toolbar {
  display: grid;
  align-items: end;
}

.results-actions {
  display: flex;
  align-items: center;
}
.sort-select {
}
.per-page-select {
}
.view-toggle {
  display: inline-flex;
}
.view-toggle .btn {
  display: inline-flex;
  align-items: center;
}

  .results-actions {
    justify-content: flex-start;
  }
  .sort-select,
  .per-page-select {
  }
}

.active-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.filter-pill {
  display: inline-flex;
  align-items: center;
  background: var(--glass-bg);
  color: var(--text-primary);
}

.job-grid.list-view {
}

.filter-pill .clear-filter {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
}
.live-job-board {
}

.glass-card {
  background: var(--glass-surface);
  backdrop-filter: var(--glass-backdrop-blur);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

.job-board-header {
  position: relative;
  overflow: hidden;
}

.header-stats {
  display: flex;
  gap: var(--spacing-md);
}

.stat-card {
  text-align: center;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
}

.stat-card.gaming {
}

.stat-number {
  font-weight: var(--font-weight-bold);
}

.stat-label {
  font-size: var(--font-size-xs);
  text-transform: uppercase;
}

.search-suggestions {
  margin-top: var(--spacing-sm);
}

.job-grid {
  display: grid;
  gap: var(--spacing-md);
}

.active-filters {
  display: flex;
  flex-wrap: wrap;
}

.filter-pill {
  display: inline-flex;
  align-items: center;
  border-radius: var(--radius-full);
  background: var(--glass-surface-strong, var(--surface-elevated));
  font-size: var(--font-size-sm);
}

.filter-pill .clear-filter {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
}

.quick-chips .chip {
  border-radius: var(--radius-full);
  background: var(--surface-elevated);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.quick-chips .chip.active {
}

.quick-chips .chip-label {
  align-self: center;
}
.quick-chips .chip-sep {
  align-self: center;
}

.enhanced-job-card {
  position: relative;
  transition: all var(--duration-normal) var(--easing-ease);
  cursor: pointer;
  background: var(--glass-bg);
  border-radius: var(--radius-xl);
  backdrop-filter: var(--glass-backdrop-blur);
  -webkit-backdrop-filter: var(--glass-backdrop-blur);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.enhanced-job-card::before {
  content: "";
  position: absolute;
  background: var(--gradient-primary-subtle);
  pointer-events: none;
}

.enhanced-job-card:hover {
  border-color: var(--glass-border-highlight);
}

.enhanced-job-card.gaming-job {
  background: linear-gradient(
  );
}

.enhanced-job-card.gaming-job:hover {
  box-shadow:
}

.enhanced-job-card.saved-job {
  background: linear-gradient(
  );
}

.enhanced-job-card.top-match {
  background: linear-gradient(
  );
}

.enhanced-job-header {
  display: flex;
  flex-direction: column;
}

.priority-indicators {
  display: flex;
  flex-wrap: wrap;
}

.priority-badge {
  display: inline-flex;
  align-items: center;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  transition: all var(--duration-fast) var(--easing-ease);
}

.priority-badge.top-match {
  background: var(--color-success-bg);
  color: var(--color-success);
  border-color: var(--color-success-border);
}

.priority-badge.gaming {
  background: var(--color-gaming-bg);
  color: var(--color-gaming);
  border-color: var(--color-gaming-border);
}

.priority-badge.remote {
  background: var(--color-info-bg);
  color: var(--color-info);
  border-color: var(--color-info-border);
}

.header-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.header-left {
  display: flex;
}

.company-logo-section {
}

.company-logo-wrapper,
.company-logo-placeholder {
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--glass-bg-light);
}

.company-logo-img {
  object-fit: cover;
}

.company-logo-placeholder {
  font-family: var(--font-primary);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  color: var(--text-primary);
  background: var(--glass-bg-light);
}

.job-title-section {
}

.enhanced-job-title {
  font-family: var(--font-primary);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-xl);
  color: var(--text-primary);
  line-height: var(--line-height-tight);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.job-company-info {
  display: flex;
  flex-direction: column;
}

.enhanced-company-name {
  font-family: var(--font-primary);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  color: var(--color-primary);
}

.job-location-wrapper {
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.header-actions {
  display: flex;
  align-items: flex-start;
}

.action-group {
  display: flex;
}

.primary-actions {
}

.apply-btn {
}

.enhanced-job-content {
}

.job-metrics {
  display: grid;
}

.metric-card {
  display: flex;
  align-items: center;
  background: var(--glass-bg-light);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--easing-ease);
}

.metric-card:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-highlight);
}

.metric-card .app-icon {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
}

.metric-info {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.metric-value {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.salary-metric .app-icon {
  color: var(--color-success);
}

.type-metric .app-icon {
  color: var(--color-info);
}

.date-metric .app-icon {
  color: var(--color-warning);
}

.job-description-section {
}

.enhanced-job-description {
  font-family: var(--font-primary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.enhanced-skills-section {
}

.skills-header {
  display: flex;
  align-items: center;
}

.skills-title {
  font-family: var(--font-primary);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  text-transform: uppercase;
}

.skills-header .app-icon {
  color: var(--color-info);
  font-size: var(--font-size-base);
}

.skills-tags {
  display: flex;
  flex-wrap: wrap;
}

.enhanced-skill-tag {
  display: inline-flex;
  align-items: center;
  background: var(--glass-bg-light);
  color: var(--text-primary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-fast) var(--easing-ease);
  white-space: nowrap;
}

.enhanced-skill-tag:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-highlight);
}

.enhanced-skill-tag.user-skill {
  background: var(--color-success-bg);
  color: var(--color-success);
  border-color: var(--color-success-border);
}

.skill-match-icon {
  font-size: var(--font-size-xs);
  color: var(--color-success);
}

.more-skills-indicator {
  display: inline-flex;
  align-items: center;
  background: var(--surface-muted);
  color: var(--text-muted);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  font-style: italic;
}

.enhanced-job-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-left {
  display: flex;
  align-items: center;
}

.source-info {
  display: flex;
  align-items: center;
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.source-info .app-icon {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.source-label {
  font-weight: var(--font-weight-medium);
}

.footer-right {
  display: flex;
  align-items: center;
}

.match-score {
  display: flex;
  align-items: center;
}

.score-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-xs);
  transition: all var(--duration-fast) var(--easing-ease);
}

.score-indicator.score-excellent {
  background: var(--color-success-bg);
  border-color: var(--color-success);
  color: var(--color-success);
}

.score-indicator.score-good {
  background: var(--color-primary-bg);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.score-indicator.score-fair {
  background: var(--color-warning-bg);
  border-color: var(--color-warning);
  color: var(--color-warning);
}

.score-indicator.score-low {
  background: var(--color-error-bg);
  border-color: var(--color-error);
  color: var(--color-error);
}

.score-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

:deep(mark) {
  background: var(--color-primary-bg);
  color: var(--color-primary);
  border-radius: var(--radius-sm);
}

.company-name {
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.logo-img {
  object-fit: contain;
  border-radius: var(--border-radius-sm);
}

.job-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.meta-item {
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.meta-item.remote {
  font-weight: var(--font-weight-medium);
}

.meta-item.salary {
  font-weight: var(--font-weight-medium);
}

.job-description {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.job-tags .badge {
  font-size: var(--font-size-xs);
}

.job-footer {
  padding-top: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.badge.bg-gaming {
  color: white;
}

.provider-card {
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-md);
}

.provider-card.active {
}

.provider-name {
  font-weight: var(--font-weight-medium);
  text-transform: capitalize;
}

.provider-status {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.empty-state {
  padding: var(--spacing-xl);
}

.empty-icon {
}

.loading-indicator {
  display: inline-flex;
  align-items: center;
}


  .job-grid {
  }

  .enhanced-job-card {
  }

}

  .job-grid {
  }

  .header-main {
  }

  .header-actions {
  }

  .action-group.secondary-actions {
    flex-direction: column;
  }
}

  .job-grid {
  }

  .enhanced-job-card {
  }

  .header-main {
    flex-direction: column;
  }

  .header-actions {
    flex-direction: row;
    justify-content: space-between;
  }

  .action-group {
    flex-direction: row;
  }

  .job-metrics {
  }

  .metric-card {
  }

  .enhanced-job-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-stats {
  }
}

  .job-grid {
  }

  .enhanced-job-card {
    border-radius: var(--radius-lg);
  }

  .priority-indicators {
  }

  .priority-badge {
  }

  .company-logo-wrapper,
  .company-logo-placeholder {
  }

  .enhanced-job-title {
    font-size: var(--font-size-lg);
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .action-group.primary-actions {
  }

  .action-group.secondary-actions {
    flex-direction: row;
    justify-content: space-around;
  }

  .apply-btn {
    justify-content: center;
  }

  .job-metrics {
  }

  .metric-card {
  }

  .skills-tags {
  }

  .enhanced-skill-tag {
  }

  .enhanced-job-footer {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .score-indicator {
  }

  .header-stats {
  }

  .stat-card {
    min-width: auto;
  }

  .job-board-header .section-header {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (hover: none) and (pointer: coarse) {
  .enhanced-job-card {
    transition: none;
  }

  .enhanced-job-card:hover {
    transform: none;
  }

  .enhanced-skill-tag:hover {
    transform: none;
  }

  .metric-card:hover {
    background: var(--glass-bg-light);
    border-color: var(--glass-border);
  }

  .priority-badge {
  }

  .enhanced-skill-tag {
  }
}

  [data-theme="dark"] .enhanced-job-card {
  }

  [data-theme="dark"] .metric-card {
  }

  [data-theme="dark"] .enhanced-skill-tag {
  }
}

  .theme-gaming .enhanced-job-card.gaming-job {
    background: linear-gradient(
    );
  }

  .theme-gaming .priority-badge.gaming {
  }
}

  .job-grid.list-view .enhanced-job-card {
  }

  .job-grid.list-view .header-main {
  }

  .job-grid.list-view .job-metrics {
    display: flex;
    flex-wrap: wrap;
  }

  .job-grid.list-view .metric-card {
  }
}

.alert-item {
  border-radius: var(--border-radius-md);
  transition: all var(--transition-fast);
}

.alert-item:hover {
}

.alert-item.alert-disabled {
}

.alert-name {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.alert-meta {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.notification-item {
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  justify-content: between;
  align-items: center;
}

.notification-item:hover {
}

.notification-item.notification-unread {
  font-weight: var(--font-weight-medium);
}

.notification-content {
}

.notification-message {
  color: var(--text-primary);
}

.notification-time {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.notification-actions {
  margin-left: var(--spacing-md);
}

@keyframes fadeInUp {
  from {
  }
  to {
  }
}

@keyframes slideInRight {
  from {
  }
  to {
  }
}

@keyframes scaleIn {
  from {
  }
  to {
  }
}

@keyframes pulse {
  }
  }
}

.enhanced-job-card {
}

.enhanced-job-card:nth-child(odd) {
}

.enhanced-job-card:nth-child(even) {
}

.priority-badge {
}

.metric-card {
}

.enhanced-skill-tag {
}

.score-indicator {
}

.enhanced-job-card {
  contain: layout style paint;
  will-change: transform, box-shadow;
}

.job-grid {
  contain: layout;
}

.metric-card {
  contain: layout style;
}

.enhanced-skill-tag {
  contain: layout style;
}

.enhanced-job-card:focus-visible {
  box-shadow:
}

.priority-badge[aria-label]::after {
  content: attr(aria-label);
  position: absolute;
  background: var(--surface-overlay);
  color: var(--text-primary);
  font-size: var(--font-size-xs);
  border-radius: var(--radius-sm);
  white-space: nowrap;
  pointer-events: none;
  transition: opacity var(--duration-fast) var(--easing-ease);
  z-index: var(--z-tooltip);
}

.priority-badge:hover::after,
.priority-badge:focus::after {
}

.sr-only {
  position: absolute;
  overflow: hidden;
  white-space: nowrap;
}

@media (prefers-contrast: high) {
  .enhanced-job-card {
  }

  .priority-badge {
    font-weight: var(--font-weight-bold);
  }

  .enhanced-skill-tag {
  }

  .score-indicator {
    font-weight: var(--font-weight-black);
  }
}

@media (prefers-reduced-motion: reduce) {
  .enhanced-job-card,
  .priority-badge,
  .metric-card,
  .enhanced-skill-tag {
    animation: none;
  }

  .enhanced-job-card:hover {
    transform: none;
  }

  .score-indicator {
    animation: none;
  }
}

@media print {
  .enhanced-job-card {
    break-inside: avoid;
    box-shadow: none;
    background: white;
    color: black;
  }

  .priority-badge {
    background: white;
    color: black;
  }

  .header-actions {
    display: none;
  }
}

[data-theme="dark"] .glass-card {
}

[data-theme="dark"] .enhanced-job-card:hover {
}

[data-theme="dark"] .enhanced-job-card:focus-visible {
  box-shadow:
}

[data-theme="dark"] .alert-item {
}

[data-theme="dark"] .alert-item:hover {
}

[data-theme="dark"] .notification-item {
}

[data-theme="dark"] .notification-item:hover {
}

.enhanced-job-card {
  position: relative;
  overflow: hidden;
  transition: all var(--duration-normal) var(--easing-ease);
}

.enhanced-job-card::before {
  content: "";
  position: absolute;
  background: var(--gradient-primary-subtle);
  transition: opacity var(--duration-fast) var(--easing-ease);
}

.enhanced-job-card.top-match::before {
  background: var(--gradient-gaming);
}

.enhanced-job-card:hover {
  box-shadow: var(--shadow-xl);
}

.priority-indicators {
  display: flex;
}

.priority-badge {
  display: inline-flex;
  align-items: center;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
}

.priority-badge.top-match {
  background: linear-gradient(
  );
}

.priority-badge.gaming {
  background: linear-gradient(
  );
}

.priority-badge.remote {
  background: linear-gradient(
  );
}

.enhanced-job-header {
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-left {
  display: flex;
  align-items: flex-start;
}

.company-logo-section {
  position: relative;
}

.company-logo-wrapper {
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface-elevated);
}

.company-logo-img {
  object-fit: cover;
}

.company-logo-placeholder {
  border-radius: var(--radius-lg);
  background: var(--gradient-primary-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
}

.job-title-section {
}

.enhanced-job-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: var(--line-height-tight);
  transition: color var(--duration-fast) var(--easing-ease);
}

.enhanced-job-title:hover {
}

.job-company-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.enhanced-company-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.job-location-wrapper {
  display: flex;
  align-items: center;
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

.header-actions {
  display: flex;
  align-items: flex-start;
}

.action-group {
  display: flex;
  align-items: center;
}

.primary-actions .apply-btn {
}

.secondary-actions {
  transition: opacity var(--duration-fast) var(--easing-ease);
}

.enhanced-job-card:hover .secondary-actions {
}

.enhanced-job-content {
}

.job-metrics {
  display: flex;
  flex-wrap: wrap;
}

.metric-card {
  display: flex;
  align-items: center;
  background: var(--glass-bg-light);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--easing-ease);
}

.metric-card:hover {
  background: var(--glass-bg-strong);
  border-color: var(--glass-border-highlight);
}

.metric-card .app-icon {
  font-size: var(--font-size-lg);
}

.metric-info {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-tertiary);
  text-transform: uppercase;
}

.metric-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.salary-metric .app-icon {
}

.type-metric .app-icon {
}

.date-metric .app-icon {
}

.job-description-section {
}

.enhanced-job-description {
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
}

.enhanced-skills-section {
}

.skills-header {
  display: flex;
  align-items: center;
}

.skills-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-secondary);
}

.skills-tags {
  display: flex;
  flex-wrap: wrap;
}

.enhanced-skill-tag {
  display: inline-flex;
  align-items: center;
  background: var(--surface-subtle);
  color: var(--text-secondary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-fast) var(--easing-ease);
}

.enhanced-skill-tag.user-skill {
  background: var(--color-success-bg);
  border-color: var(--color-success-border);
  font-weight: var(--font-weight-semibold);
}

.enhanced-skill-tag.user-skill::before {
  content: "✓";
}

.enhanced-skill-tag:hover {
  background: var(--surface-elevated);
  border-color: var(--border-strong);
}

.enhanced-skill-tag.user-skill:hover {
}

.ai-insights-panel {
  border-radius: var(--radius-lg);
  background: var(--glass-bg-light);
  overflow: hidden;
}

.ai-insights-header {
  background: var(--gradient-primary-subtle);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all var(--duration-fast) var(--easing-ease);
}

.ai-insights-header:hover {
  background: var(--gradient-primary);
}

.ai-insights-title {
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.ai-insights-content {
}

.insights-sections {
  display: grid;
}

.insight-section {
  display: flex;
  flex-direction: column;
}

.insight-section-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  display: flex;
  align-items: center;
}

.alignment-score {
  display: flex;
  align-items: center;
}

.score-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
}

.score-circle.excellent {
}

.score-circle.good {
}

.score-circle.fair {
}

.score-circle.poor {
}

.score-details ul {
  list-style: none;
  display: flex;
  flex-direction: column;
}

.score-details li {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
}

.score-details li::before {
  content: "•";
  font-weight: bold;
}

.skill-gaps {
  display: flex;
  flex-direction: column;
}

.missing-skills {
  display: flex;
  flex-wrap: wrap;
}

.missing-skill {
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
}

.recommendations-list {
  display: flex;
  flex-direction: column;
}

.recommendation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--surface-subtle);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--easing-ease);
}

.recommendation-item:hover {
  background: var(--surface-elevated);
  border-color: var(--border-strong);
}

.recommendation-content {
}

.recommendation-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.recommendation-description {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.recommendation-priority {
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
}

.recommendation-priority.high {
}

.recommendation-priority.medium {
}

.job-comparison-modal {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
}

.comparison-content {
  background: var(--surface-base);
  overflow-y: auto;
}

.comparison-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.comparison-title {
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.comparison-jobs {
  display: flex;
}

.comparison-job-card {
  background: var(--glass-bg-light);
  border-radius: var(--radius-lg);
  position: relative;
}

.comparison-job-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.comparison-job-company {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.remove-from-comparison {
  position: absolute;
}

.comparison-sections {
  display: flex;
  flex-direction: column;
}

.comparison-section {
  background: var(--surface-subtle);
  border-radius: var(--radius-lg);
}

.comparison-section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  display: flex;
  align-items: center;
}

.comparison-grid {
  display: grid;
}

.comparison-item {
  background: var(--surface-base);
  border-radius: var(--radius-md);
}

.comparison-item-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-tertiary);
  text-transform: uppercase;
}

.comparison-item-value {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.bulk-operations-panel {
  position: sticky;
  background: var(--glass-bg);
  border-radius: var(--radius-lg);
  backdrop-filter: var(--glass-backdrop-blur);
  box-shadow: var(--shadow-lg);
}

.bulk-operations-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bulk-operations-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  display: flex;
  align-items: center;
}

.selected-count {
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}

.bulk-actions {
  display: flex;
  align-items: center;
}

.job-notification {
  position: absolute;
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.job-notification.success {
}

.job-notification.error {
}

.job-card-loading {
  pointer-events: none;
  position: relative;
}

.job-card-loading::after {
  content: "";
  position: absolute;
  background: linear-gradient(
  );
}

@keyframes slideInRight {
  from {
  }
  to {
  }
}

@keyframes shimmer {
  }
  }
}

  .header-main {
    flex-direction: column;
  }

  .header-actions {
    justify-content: flex-end;
  }

  .job-metrics {
    flex-direction: column;
  }

  .comparison-content {
  }

  .comparison-jobs {
    flex-direction: column;
  }

  .comparison-grid {
  }

  .bulk-operations-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .bulk-actions {
    flex-wrap: wrap;
  }
}

  .priority-indicators {
    flex-wrap: wrap;
  }

  .header-left {
    flex-direction: column;
  }

  .job-company-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .secondary-actions {
  }

  .ai-insights-content {
  }

  .job-notification {
    position: fixed;
  }
}

[data-theme="dark"] .enhanced-job-card {
}

[data-theme="dark"] .enhanced-job-card:hover {
}

[data-theme="dark"] .metric-card {
}

[data-theme="dark"] .ai-insights-panel {
}

[data-theme="dark"] .comparison-content {
  background: var(--surface-base);
}

[data-theme="dark"] .bulk-operations-panel {
}

.theme-gaming .enhanced-job-card.gaming-job {
  background: linear-gradient(
  );
}

.theme-gaming .enhanced-job-card.gaming-job:hover {
  background: linear-gradient(
  );
  box-shadow:
    var(--shadow-xl),
}

@media (prefers-contrast: high) {
  .enhanced-job-card,
  .metric-card,
  .ai-insights-panel,
  .comparison-content,
  .bulk-operations-panel {
  }

  .priority-badge {
  }

  .enhanced-skill-tag {
  }
}

@media (prefers-reduced-motion: reduce) {
  .enhanced-job-card,
  .metric-card,
  .ai-insights-header,
  .recommendation-item {
    transition: none;
  }

  .enhanced-job-card:hover {
    transform: none;
  }

  .job-notification {
    animation: none;
  }

  .job-card-loading::after {
    animation: none;
  }
}

.enhanced-job-card:focus {
}

.ai-insights-header:focus {
}

.comparison-job-card:focus {
}
</style>
