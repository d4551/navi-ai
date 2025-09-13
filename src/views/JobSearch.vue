<template>
  <StandardPageLayout
    title="The Job Board"
    subtitle="Discover video game industry roles with AI‑powered matching and studio intel"
    title-icon="mdi-clipboard-text-outline"
    page-type="gaming"
    max-width="full"
    content-spacing="normal"
    :hero-stats="jobBoardStats"
  >
    <template #header-actions>
      <HeaderActions
        layout="horizontal"
        alignment="end"
        gap="md"
        priority="primary"
      >
        <UnifiedButton
          variant="primary"
          size="md"
          leading-icon="mdi-magnify"
          @click="showAdvancedSearch = true"
        >
          Advanced Search
        </UnifiedButton>

        <UnifiedButton
          variant="gaming"
          size="md"
          leading-icon="mdi-gamepad-variant"
          :class="{ active: gamingFilterActive }"
          @click="toggleGamingFilter"
        >
          Gaming Jobs Only
        </UnifiedButton>

        <UnifiedButton
          variant="glass"
          size="md"
          leading-icon="mdi-bookmark-outline"
          @click="showSavedJobs = !showSavedJobs"
        >
          Saved ({{ savedJobs.length }})
        </UnifiedButton>

        <UnifiedButton
          variant="outline"
          size="md"
          leading-icon="mdi-bell-outline"
          @click="showJobAlertsModal = true"
        >
          Job Alerts
          <UiChip
            v-if="jobAlerts.length"
            classes="chip chip-warning chip-compact ms-2"
          >
            {{ jobAlerts.length }}
          </UiChip>
        </UnifiedButton>
      </HeaderActions>

      <!-- Compact Gamification HUD -->
      <div class="mt-3">
        <CompactGamifyHUD />
      </div>
    </template>

    <!-- Quick Actions Bar -->
    <div class="content-section">
      <div class="unified-card">
        <div
          class="d-flex flex-wrap justify-content-between align-items-center gap-md"
        >
          <div class="d-flex flex-wrap gap-sm">
            <UnifiedButton
              variant="primary"
              size="lg"
              leading-icon="mdi-magnify"
              @click="showSearchModal = true"
            >
              Pin New Gig Hunt
            </UnifiedButton>
            <UnifiedButton
              variant="cyber"
              size="lg"
              leading-icon="mdi-brain"
              :loading="aiLoading"
              @click="aiRecommendJobs"
            >
              AI Job Matching
            </UnifiedButton>

            <UnifiedButton
              variant="glass"
              size="lg"
              leading-icon="mdi-lightbulb"
              @click="showSmartSearchDialog = true"
            >
              Smart Search
            </UnifiedButton>
          </div>
          <div class="d-flex align-items-center gap-sm">
            <UiChip classes="stats-chip"> {{ totalJobs }} jobs found </UiChip>
            <UnifiedButton
              variant="secondary"
              :loading="refreshing"
              :disabled="refreshing"
              leading-icon="mdi-refresh"
              @click="refreshJobs"
            >
              Refresh
            </UnifiedButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Advanced Search and Filter Section -->
    <section class="search-filter-section">
      <StandardCard variant="glass" class="filter-card">
        <template #title>
          <AppIcon name="mdi-filter-variant" />
          Search & Filter Jobs
        </template>

        <v-form @submit.prevent="applyFilters">
          <v-row class="ga-3 align-end">
            <!-- Search Jobs -->
            <v-col cols="12" md="4">
              <v-text-field
                v-model="searchFilters.keywords"
                label="Search Jobs"
                placeholder="Job title, skills, company..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                color="primary"
                density="comfortable"
                clearable
              />
            </v-col>

            <!-- Location -->
            <v-col cols="12" sm="6" md="2">
              <v-select
                v-model="searchFilters.location"
                label="Location"
                :items="[
                  { title: 'All Locations', value: '' },
                  { title: 'Remote', value: 'remote' },
                  { title: 'United States', value: 'us' },
                  { title: 'Europe', value: 'eu' },
                  { title: 'Asia', value: 'asia' },
                  { title: 'Canada', value: 'canada' },
                ]"
                variant="outlined"
                color="primary"
                density="comfortable"
                prepend-inner-icon="mdi-map-marker"
              />
            </v-col>

            <!-- Job Type -->
            <v-col cols="12" sm="6" md="2">
              <v-select
                v-model="searchFilters.jobType"
                label="Job Type"
                :items="[
                  { title: 'All Types', value: '' },
                  { title: 'Full Time', value: 'full-time' },
                  { title: 'Part Time', value: 'part-time' },
                  { title: 'Contract', value: 'contract' },
                  { title: 'Internship', value: 'internship' },
                ]"
                variant="outlined"
                color="primary"
                density="comfortable"
                prepend-inner-icon="mdi-briefcase"
              />
            </v-col>

            <!-- Posted -->
            <v-col cols="12" sm="6" md="2">
              <v-select
                v-model="searchFilters.posted"
                label="Posted"
                :items="[
                  { title: 'All Time', value: '' },
                  { title: 'Last 24 hours', value: '24h' },
                  { title: 'Last 7 days', value: '7d' },
                  { title: 'Last 30 days', value: '30d' },
                ]"
                variant="outlined"
                color="primary"
                density="comfortable"
                prepend-inner-icon="mdi-clock-outline"
              />
            </v-col>

            <!-- Action Buttons -->
            <v-col cols="12" md="2">
              <v-row class="ga-2">
                <v-col cols="6">
                  <UnifiedButton
                    variant="secondary"
                    block
                    @click="clearFilters"
                  >
                    Clear
                  </UnifiedButton>
                </v-col>
                <v-col cols="6">
                  <UnifiedButton
                    variant="primary"
                    block
                    leading-icon="mdi-magnify"
                    @click="applyFilters"
                  >
                    Search
                  </UnifiedButton>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <!-- Gaming-Specific Filters (show when gaming filter is active) -->
          <v-expand-transition>
            <div
              v-show="gamingFilterActive"
              class="gaming-filters mt-4 pt-4"
              style="border-top: 1px solid var(--border-base)"
            >
              <h4 class="text-h6 mb-3">
                <AppIcon name="mdi-gamepad-variant" />
                Gaming Industry Filters
              </h4>

              <v-row>
                <!-- Game Engines -->
                <v-col cols="12" md="3">
                  <v-select
                    v-model="gamingFilters.gameEngines"
                    label="Game Engines"
                    :items="gameEngineOptions"
                    multiple
                    chips
                    variant="outlined"
                    color="primary"
                    density="comfortable"
                    prepend-inner-icon="mdi-engine"
                  />
                </v-col>

                <!-- Studio Types -->
                <v-col cols="12" md="3">
                  <v-select
                    v-model="gamingFilters.studioTypes"
                    label="Studio Types"
                    :items="studioTypeOptions"
                    multiple
                    chips
                    variant="outlined"
                    color="primary"
                    density="comfortable"
                    prepend-inner-icon="mdi-office-building"
                  />
                </v-col>

                <!-- Platforms -->
                <v-col cols="12" md="3">
                  <v-select
                    v-model="gamingFilters.platforms"
                    label="Platforms"
                    :items="platformOptions"
                    multiple
                    chips
                    variant="outlined"
                    color="primary"
                    density="comfortable"
                    prepend-inner-icon="mdi-devices"
                  />
                </v-col>

                <!-- Role Categories -->
                <v-col cols="12" md="3">
                  <v-select
                    v-model="gamingFilters.roleCategories"
                    label="Role Categories"
                    :items="roleCategoryOptions"
                    multiple
                    chips
                    variant="outlined"
                    color="primary"
                    density="comfortable"
                    prepend-inner-icon="mdi-account-group"
                  />
                </v-col>
              </v-row>
            </div>
          </v-expand-transition>
        </v-form>
      </StandardCard>
    </section>

    <!-- Top Matches Section (shown when AI analysis is available) -->
    <v-container v-if="topMatches.length > 0" class="mb-6">
      <v-card class="top-matches-card" elevation="0">
        <v-card-title class="d-flex align-center justify-space-between pa-4">
          <div class="d-flex align-center">
            <AppIcon name="mdi-star" color="warning" size="32" class="me-3" />
            <div>
              <h3 class="text-h5 mb-1">Top AI Matches for You</h3>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ topMatches.length }} high-match opportunities (60%+
                compatibility)
              </p>
            </div>
          </div>
          <UnifiedButton
            v-if="!aiLoading && jobResults.length > 0"
            variant="outline"
            color="primary"
            leading-icon="mdi-robot"
            :loading="aiLoading"
            @click="aiRecommendJobs"
          >
            Refresh Analysis
          </UnifiedButton>
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row>
            <v-col
              v-for="job in topMatches.slice(0, 6)"
              :key="job.id"
              cols="12"
              md="6"
              lg="4"
            >
              <v-card
                class="top-match-job-card h-100"
                variant="outlined"
                hover
                @click="viewJobDetails(job)"
              >
                <v-card-text class="pa-4">
                  <div class="d-flex align-start justify-space-between mb-3">
                    <div class="flex-grow-1">
                      <h4 class="text-h6 mb-1">{{ job.title }}</h4>
                      <p class="text-body-2 text-medium-emphasis mb-0">
                        {{ job.company }} • {{ job.location }}
                      </p>
                    </div>
                    <UiChip
                      :classes="`chip chip-${getMatchChipColor(job.matchScore)}`"
                    >
                      {{ job.matchScore }}%
                    </UiChip>
                  </div>
                  <div class="d-flex align-center justify-space-between">
                    <div class="d-flex align-center ga-2">
                      <UiChip classes="chip chip-info chip-compact">
                        {{ formatJobType(job.type) }}
                      </UiChip>
                      <UiChip
                        v-if="job.salary"
                        classes="chip chip-success chip-compact"
                      >
                        {{ formatSalary(job.salary) }}
                      </UiChip>
                    </div>
                    <UnifiedButton
                      variant="primary"
                      size="sm"
                      @click.stop="viewJobDetails(job)"
                    >
                      View Details
                    </UnifiedButton>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <div v-if="topMatches.length > 6" class="text-center mt-4">
            <UnifiedButton
              variant="outline"
              color="secondary"
              @click="scrollToJobsTable"
            >
              View All {{ topMatches.length }} Top Matches
            </UnifiedButton>
          </div>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- AI Analysis CTA (shown when no AI analysis has been run) -->
    <v-container
      v-else-if="jobResults.length > 0 && !hasRunAIAnalysis"
      class="mb-6"
    >
      <v-card class="ai-cta-card text-center" elevation="0">
        <v-card-text class="pa-8">
          <AppIcon
            name="mdi-robot-excited"
            size="80"
            color="primary"
            class="mb-4"
          />
          <h2 class="text-h4 mb-4">Get AI-Powered Job Recommendations</h2>
          <p
            class="text-body-1 text-medium-emphasis mb-6 mx-auto max-w-text-600"
          >
            Let our advanced AI analyze {{ jobResults.length }} jobs and find
            your best matches based on your skills, experience, and preferences.
          </p>
          <UnifiedButton
            variant="primary"
            size="xl"
            leading-icon="mdi-sparkles"
            :loading="aiLoading"
            @click="aiRecommendJobs"
          >
            Analyze Jobs with AI
          </UnifiedButton>
          <div class="mt-4">
            <UiChip classes="chip chip-success me-2">
              <AppIcon name="mdi-check-circle" class="me-1" />
              Smart Matching Algorithm
            </UiChip>
            <UiChip classes="chip chip-info">
              <AppIcon name="mdi-brain" class="me-1" />
              Personalized Results
            </UiChip>
          </div>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- Jobs Results Section -->
    <v-container>
      <v-card id="jobs-table" class="jobs-results-card" elevation="0">
        <v-card-title class="d-flex align-center justify-space-between pa-4">
          <div>
            <h2 class="text-h4 mb-2">Gaming Job Opportunities</h2>
            <p class="text-body-1 text-medium-emphasis mb-0">
              Curated from multiple gaming industry sources
            </p>
          </div>
          <div class="header-actions-group">
            <UiChip classes="chip chip-primary">
              {{ filteredJobs.length }} Results
            </UiChip>
            <ViewToggle
              v-model="viewMode"
              :options="[
                { value: 'table', icon: 'mdi-table', label: 'Table view' },
                { value: 'cards', icon: 'mdi-view-grid', label: 'Cards view' },
              ]"
            />
          </div>
        </v-card-title>
        <!-- Table View -->
        <v-data-table
          v-if="viewMode === 'table'"
          v-model="selectedJobs"
          :headers="tableHeaders"
          :items="paginatedJobs"
          :loading="loading"
          class="jobs-data-table"
          item-value="id"
          show-select
          density="comfortable"
          hover
        >
          <!-- Empty state -->
          <template #no-data>
            <div class="empty-state text-center pa-8">
              <AppIcon
                name="mdi-magnify"
                size="64"
                color="primary"
                class="mb-4"
              />
              <h3 class="text-h5 mb-2">No jobs found</h3>
              <p class="text-body-2 text-medium-emphasis mb-4">
                Try adjusting your filters or
                <router-link
                  to="/settings#job-sources-section"
                  class="text-primary"
                >
                  configure more job sources
                </router-link>
              </p>
            </div>
          </template>

          <!-- Job Title Column -->
          <template #item.title="{ item }">
            <div class="job-title-cell">
              <h4 class="text-subtitle-1 font-weight-semibold mb-1">
                {{ item.title }}
              </h4>
              <div class="d-flex align-center ga-1 mb-2">
                <UiChip
                  v-for="tag in (item.tags || []).slice(0, 2)"
                  :key="tag"
                  classes="chip chip-info chip-compact"
                >
                  {{ tag }}
                </UiChip>
                <UiChip
                  v-if="
                    item.matchScore !== undefined && item.matchScore !== null
                  "
                  :classes="`chip chip-${getMatchChipColor(item.matchScore)} chip-compact`"
                >
                  <AppIcon name="mdi-target-variant" class="me-1" />
                  {{ Math.round(item.matchScore) }}%
                </UiChip>
              </div>
            </div>
          </template>

          <!-- Company Column -->
          <template #item.company="{ item }">
            <div class="company-cell d-flex align-center ga-3">
              <v-avatar v-if="item.companyLogo" size="40">
                <v-img :src="item.companyLogo" :alt="item.company" />
              </v-avatar>
              <v-avatar v-else color="primary" size="40">
                <span class="text-white font-weight-bold">
                  {{ item.company.charAt(0).toUpperCase() }}
                </span>
              </v-avatar>
              <div>
                <div class="d-flex align-center ga-1">
                  <span class="font-weight-medium">{{ item.company }}</span>
                  <UnifiedButton
                    v-if="getMatchingStudio(item.company)"
                    icon-only
                    size="xs"
                    variant="ghost"
                    :aria-label="`View ${item.company} studio details`"
                    icon="mdi-information-outline"
                    @click.stop="openStudioModal(item)"
                  />
                </div>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ item.source }}
                </p>
              </div>
            </div>
          </template>

          <!-- Location Column -->
          <template #item.location="{ item }">
            <div class="d-flex align-center ga-1">
              <AppIcon name="mdi-map-marker" size="16" color="primary" />
              <span>{{ item.location || "Not specified" }}</span>
              <UiChip
                v-if="item.remote"
                classes="chip chip-success chip-compact"
              >
                Remote
              </UiChip>
            </div>
          </template>

          <!-- Job Type Column -->
          <template #item.type="{ item }">
            <UiChip :classes="`chip chip-${getJobTypeChipColor(item.type)}`">
              {{ formatJobType(item.type) }}
            </UiChip>
          </template>

          <!-- Salary Column -->
          <template #item.salary="{ item }">
            <span v-if="item.salary" class="font-weight-medium">
              {{ formatSalary(item.salary) }}
            </span>
            <span v-else class="text-medium-emphasis"> Not disclosed </span>
          </template>

          <!-- Posted Date Column -->
          <template #item.postedDate="{ item }">
            <span class="text-body-2 text-medium-emphasis">
              {{ formatRelativeDate(item.postedDate) }}
            </span>
          </template>

          <!-- Actions Column -->
          <template #item.actions="{ item }">
            <div class="d-flex ga-1">
              <UnifiedButton
                icon-only
                size="sm"
                variant="outline"
                aria-label="View job details"
                icon="mdi-eye"
                @click="viewJob(item)"
              />
              <UnifiedButton
                icon-only
                size="sm"
                :variant="isJobSaved(item.id) ? 'primary' : 'outline'"
                :aria-label="
                  isJobSaved(item.id) ? 'Remove from saved' : 'Save job'
                "
                :icon="
                  isJobSaved(item.id) ? 'mdi-bookmark' : 'mdi-bookmark-outline'
                "
                @click="toggleSaveJob(item)"
              />
              <UnifiedButton
                icon-only
                size="sm"
                variant="primary"
                aria-label="Apply to job"
                icon="mdi-send"
                @click="applyToJob(item)"
              />
            </div>
          </template>
        </v-data-table>

        <!-- Cards View -->
        <div v-else-if="viewMode === 'cards'" class="pa-4">
          <div
            v-if="filteredJobs.length === 0 && !loading"
            class="empty-state text-center pa-8"
          >
            <AppIcon
              name="mdi-magnify"
              size="64"
              color="primary"
              class="mb-4"
            />
            <h3 class="text-h5 mb-2">No jobs found</h3>
            <p class="text-body-2 text-medium-emphasis mb-4">
              Try adjusting your filters or
              <router-link
                to="/settings#job-sources-section"
                class="text-primary"
              >
                configure more job sources
              </router-link>
            </p>
          </div>

          <v-row v-else>
            <v-col
              v-for="job in paginatedJobs"
              :key="job.id"
              cols="12"
              sm="6"
              lg="4"
              xl="3"
            >
              <v-card
                class="job-card h-100"
                variant="outlined"
                hover
                :class="{ 'selected-job-card': selectedJobs.includes(job.id) }"
                @click="viewJob(job)"
              >
                <v-card-text class="pa-4">
                  <!-- Card Header -->
                  <div class="d-flex align-start justify-space-between mb-3">
                    <v-checkbox
                      v-model="selectedJobs"
                      :value="job.id"
                      density="compact"
                      hide-details
                      @click.stop
                    />
                    <div class="d-flex ga-1">
                      <UnifiedButton
                        icon-only
                        size="sm"
                        :variant="isJobSaved(job.id) ? 'primary' : 'ghost'"
                        :icon="
                          isJobSaved(job.id)
                            ? 'mdi-bookmark'
                            : 'mdi-bookmark-outline'
                        "
                        @click.stop="toggleSaveJob(job)"
                      />
                    </div>
                  </div>

                  <!-- Job Title -->
                  <div class="mb-3">
                    <h4 class="text-h6 mb-2">{{ job.title }}</h4>
                    <div class="d-flex align-center ga-1 mb-2">
                      <UiChip
                        v-if="
                          job.matchScore !== undefined &&
                            job.matchScore !== null
                        "
                        :classes="`chip chip-${getMatchChipColor(job.matchScore)}`"
                      >
                        <AppIcon name="mdi-target-variant" class="me-1" />
                        {{ Math.round(job.matchScore) }}%
                      </UiChip>
                    </div>
                  </div>

                  <!-- Company Info -->
                  <div class="d-flex align-center mb-4">
                    <v-avatar v-if="job.companyLogo" size="32" class="me-3">
                      <v-img :src="job.companyLogo" :alt="job.company" />
                    </v-avatar>
                    <v-avatar v-else color="primary" size="32" class="me-3">
                      <span class="text-white text-caption font-weight-bold">
                        {{ job.company.charAt(0).toUpperCase() }}
                      </span>
                    </v-avatar>
                    <div class="flex-grow-1">
                      <div class="d-flex align-center ga-1">
                        <span class="font-weight-medium">{{
                          job.company
                        }}</span>
                        <UnifiedButton
                          v-if="getMatchingStudio(job.company)"
                          icon-only
                          size="xs"
                          variant="ghost"
                          icon="mdi-information-outline"
                          @click.stop="openStudioModal(job)"
                        />
                      </div>
                      <p class="text-body-2 text-medium-emphasis mb-0">
                        {{ job.source }}
                      </p>
                    </div>
                  </div>

                  <!-- Job Details -->
                  <div class="mb-4">
                    <div class="d-flex align-center mb-2">
                      <AppIcon
                        name="mdi-map-marker"
                        size="16"
                        color="primary"
                        class="me-2"
                      />
                      <span class="text-body-2">{{
                        job.location || "Not specified"
                      }}</span>
                      <UiChip
                        v-if="job.remote"
                        classes="chip chip-success chip-compact ml-2"
                      >
                        Remote
                      </UiChip>
                    </div>
                    <div class="d-flex align-center mb-2">
                      <AppIcon
                        name="mdi-clock-outline"
                        size="16"
                        color="primary"
                        class="me-2"
                      />
                      <span class="text-body-2">{{
                        formatJobType(job.type)
                      }}</span>
                    </div>
                    <div v-if="job.salary" class="d-flex align-center">
                      <AppIcon
                        name="mdi-currency-usd"
                        size="16"
                        color="success"
                        class="me-2"
                      />
                      <span class="text-body-2 font-weight-medium">{{
                        formatSalary(job.salary)
                      }}</span>
                    </div>
                  </div>

                  <!-- Job Tags -->
                  <div class="mb-4">
                    <UiChip
                      v-for="tag in (job.tags || []).slice(0, 3)"
                      :key="tag"
                      classes="chip chip-info chip-compact me-1 mb-1"
                    >
                      {{ tag }}
                    </UiChip>
                  </div>

                  <!-- Action Buttons -->
                  <div class="d-flex ga-2 flex-column">
                    <div class="d-flex ga-2">
                      <UnifiedButton
                        variant="outline"
                        color="primary"
                        size="sm"
                        class="flex-grow-1"
                        @click.stop="viewJob(job)"
                      >
                        View Details
                      </UnifiedButton>
                      <UnifiedButton
                        variant="primary"
                        size="sm"
                        @click.stop="applyToJob(job)"
                      >
                        Apply
                      </UnifiedButton>
                    </div>
                    <div class="d-flex ga-1">
                      <UnifiedButton
                        icon-only
                        variant="outline"
                        color="secondary"
                        size="sm"
                        icon="mdi-brain"
                        :tooltip="'AI Analysis'"
                        class="flex-grow-0"
                        @click.stop="analyzeJobWithAI(job, 'match')"
                      />
                      <v-menu>
                        <template #activator="{ props }">
                          <UnifiedButton
                            icon-only
                            icon="mdi-chevron-down"
                            size="sm"
                            variant="outline"
                            v-bind="props"
                            @click.stop
                          />
                        </template>
                        <v-list density="compact">
                          <v-list-item @click="analyzeJobWithAI(job, 'match')">
                            <v-list-item-title>
                              <AppIcon name="mdi-target" class="me-2" />
                              Match Analysis
                            </v-list-item-title>
                          </v-list-item>
                          <v-list-item @click="analyzeJobWithAI(job, 'salary')">
                            <v-list-item-title>
                              <AppIcon name="mdi-currency-usd" class="me-2" />
                              Salary Prediction
                            </v-list-item-title>
                          </v-list-item>
                          <v-list-item
                            @click="analyzeJobWithAI(job, 'insights')"
                          >
                            <v-list-item-title>
                              <AppIcon name="mdi-lightbulb" class="me-2" />
                              Career Insights
                            </v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Pagination -->
        <v-card-actions v-if="totalPages > 1" class="pa-4 border-t">
          <div class="d-flex justify-space-between align-center w-100">
            <div class="pagination-info text-medium-emphasis">
              Showing {{ (currentPage - 1) * itemsPerPage + 1 }}-{{
                Math.min(currentPage * itemsPerPage, totalJobs)
              }}
              of {{ totalJobs }} jobs
            </div>
            <v-pagination
              v-model="currentPage"
              :length="totalPages"
              :total-visible="7"
              color="primary"
              variant="elevated"
              density="comfortable"
            />
          </div>
        </v-card-actions>
      </v-card>
    </v-container>

    <!-- Advanced Search Modal -->
    <v-dialog v-model="showSearchModal" max-width="900" persistent>
      <v-card>
        <v-card-title class="d-flex align-center pa-6">
          <AppIcon name="mdi-robot" color="primary" class="me-3" size="32" />
          <div>
            <h2 class="text-h5">AI-Powered Job Search</h2>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Let AI find the perfect gaming jobs for you
            </p>
          </div>
          <v-spacer />
          <UnifiedButton
            icon-only
            variant="ghost"
            icon="mdi-close"
            aria-label="Close"
            @click="showSearchModal = false"
          />
        </v-card-title>
        <v-card-text class="pa-6">
          <JobSearchPreferences
            :preferences="searchPreferences"
            @update:preferences="updateSearchPreferences"
          />
          <v-divider class="my-6" />
          <AIJobSearchInterface
            :search-form="searchForm"
            :loading="searching"
            @search="performSearch"
            @save-search="saveSearch"
          />
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <UnifiedButton
            variant="outline"
            color="secondary"
            @click="showSearchModal = false"
          >
            Close
          </UnifiedButton>
          <UnifiedButton
            variant="primary"
            :loading="searching"
            leading-icon="mdi-robot"
            @click="performAdvancedSearch"
          >
            {{ searching ? "Searching..." : "Start AI Search" }}
          </UnifiedButton>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Job Details Modal -->
    <v-dialog v-model="showJobDetails" max-width="1200" scrollable>
      <v-card v-if="selectedJob">
        <v-card-title class="d-flex align-center pa-6">
          <div class="flex-grow-1">
            <h2 class="text-h5 mb-1">{{ selectedJob.title }}</h2>
            <p class="text-body-1 text-medium-emphasis mb-0">
              {{ selectedJob.company }} • {{ selectedJob.location }}
            </p>
          </div>
          <UnifiedButton
            icon-only
            variant="ghost"
            icon="mdi-close"
            aria-label="Close"
            @click="showJobDetails = false"
          />
        </v-card-title>
        <v-card-text class="pa-0">
          <JobDetailsView
            :job="selectedJob"
            :is-saved="isJobSaved(selectedJob.id)"
            @save="toggleSaveJob"
            @apply="applyToJob"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Studio Details Modal -->
    <v-dialog v-model="selectedStudioForModal" max-width="900" scrollable>
      <v-card v-if="selectedStudioForModal">
        <v-card-title class="d-flex align-center pa-6">
          <div class="d-flex align-center ga-4 flex-grow-1">
            <v-avatar
              v-if="selectedStudioForModal.logo"
              size="64"
              class="studio-logo"
            >
              <v-img
                :src="selectedStudioForModal.logo"
                :alt="`${selectedStudioForModal.name} logo`"
                @error="onLogoError"
              />
            </v-avatar>
            <v-avatar v-else size="64" color="primary" class="studio-logo">
              <AppIcon name="mdi-domain" size="32" color="white" />
            </v-avatar>
            <div>
              <h2 class="text-h4 mb-1">{{ selectedStudioForModal.name }}</h2>
              <p class="text-body-1 text-medium-emphasis mb-0">
                Gaming Studio Details
              </p>
            </div>
          </div>
          <UnifiedButton
            icon-only
            variant="ghost"
            icon="mdi-close"
            aria-label="Close"
            @click="closeStudioModal"
          />
        </v-card-title>

        <v-card-text class="pa-6">
          <!-- Quick Overview -->
          <div class="studio-overview mb-6">
            <v-row>
              <v-col cols="12" sm="6" md="3">
                <v-card variant="outlined" class="pa-4">
                  <div class="d-flex align-center ga-3">
                    <AppIcon name="mdi-map-marker" color="primary" size="24" />
                    <div>
                      <p class="text-caption text-medium-emphasis mb-1">
                        Location
                      </p>
                      <p class="font-weight-semibold mb-0">
                        {{ selectedStudioForModal.headquarters }}
                      </p>
                    </div>
                  </div>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-card variant="outlined" class="pa-4">
                  <div class="d-flex align-center ga-3">
                    <AppIcon
                      name="mdi-account-group"
                      color="primary"
                      size="24"
                    />
                    <div>
                      <p class="text-caption text-medium-emphasis mb-1">Size</p>
                      <p class="font-weight-semibold mb-0">
                        {{ selectedStudioForModal.size }}
                      </p>
                    </div>
                  </div>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-card variant="outlined" class="pa-4">
                  <div class="d-flex align-center ga-3">
                    <AppIcon name="mdi-calendar" size="24" color="primary" />
                    <div>
                      <p class="text-caption text-medium-emphasis mb-1">
                        Founded
                      </p>
                      <p class="font-weight-semibold mb-0">
                        {{ selectedStudioForModal.founded }}
                      </p>
                    </div>
                  </div>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-card variant="outlined" class="pa-4">
                  <div class="d-flex align-center ga-3">
                    <AppIcon name="mdi-chart-bar" color="primary" size="24" />
                    <div>
                      <p class="text-caption text-medium-emphasis mb-1">Type</p>
                      <p class="font-weight-semibold mb-0">
                        {{
                          selectedStudioForModal.publiclyTraded
                            ? "Public"
                            : "Private"
                        }}
                      </p>
                    </div>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <!-- Studio Description -->
          <div v-if="selectedStudioForModal.description" class="mb-6">
            <div class="d-flex align-center mb-4">
              <AppIcon
                name="mdi-information-outline"
                color="primary"
                class="me-2"
              />
              <h3 class="text-h6">About</h3>
            </div>
            <p class="text-body-1">{{ selectedStudioForModal.description }}</p>
          </div>

          <!-- Culture & Values -->
          <div v-if="selectedStudioForModal.culture" class="mb-6">
            <div class="d-flex align-center mb-4">
              <AppIcon name="mdi-heart" color="primary" class="me-2" />
              <h3 class="text-h6">Culture & Values</h3>
            </div>
            <v-row>
              <v-col cols="12" md="4">
                <h4 class="text-subtitle-1 mb-3">Values</h4>
                <div class="d-flex flex-wrap ga-2">
                  <UiChip
                    v-for="value in selectedStudioForModal.culture.values"
                    :key="value"
                    classes="chip chip-primary chip-compact"
                  >
                    {{ value }}
                  </UiChip>
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <h4 class="text-subtitle-1 mb-3">Work Style</h4>
                <p class="text-body-2 text-medium-emphasis">
                  {{ selectedStudioForModal.culture.workStyle }}
                </p>
              </v-col>
              <v-col cols="12" md="4">
                <h4 class="text-subtitle-1 mb-3">Environment</h4>
                <p class="text-body-2 text-medium-emphasis">
                  {{ selectedStudioForModal.culture.environment }}
                </p>
              </v-col>
            </v-row>
          </div>

          <!-- Games & Technologies -->
          <div class="mb-6">
            <div class="d-flex align-center mb-4">
              <AppIcon
                name="mdi-gamepad-variant"
                color="primary"
                class="me-2"
              />
              <h3 class="text-h6">Games & Technologies</h3>
            </div>
            <v-row>
              <v-col cols="12" md="6">
                <h4 class="text-subtitle-1 mb-3">Popular Games</h4>
                <div class="d-flex flex-wrap ga-2">
                  <UiChip
                    v-for="game in selectedStudioForModal.games"
                    :key="game"
                    classes="chip chip-success chip-compact"
                  >
                    {{ game }}
                  </UiChip>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <h4 class="text-subtitle-1 mb-3">Technologies</h4>
                <div class="d-flex flex-wrap ga-2">
                  <UiChip
                    v-for="tech in selectedStudioForModal.technologies"
                    :key="tech"
                    classes="chip chip-info chip-compact"
                  >
                    {{ tech }}
                  </UiChip>
                </div>
              </v-col>
            </v-row>
          </div>

          <!-- Common Roles -->
          <div v-if="selectedStudioForModal.commonRoles" class="mb-6">
            <div class="d-flex align-center mb-4">
              <AppIcon name="mdi-account-tie" color="primary" class="me-2" />
              <h3 class="text-h6">Common Roles</h3>
            </div>
            <div class="d-flex flex-wrap ga-2">
              <UiChip
                v-for="role in selectedStudioForModal.commonRoles"
                :key="role"
                classes="chip chip-warning chip-compact"
              >
                {{ role }}
              </UiChip>
            </div>
          </div>

          <!-- Interview Style -->
          <div v-if="selectedStudioForModal.interviewStyle" class="mb-6">
            <div class="d-flex align-center mb-4">
              <AppIcon name="mdi-forum" color="primary" class="me-2" />
              <h3 class="text-h6">Interview Style</h3>
            </div>
            <p class="text-body-1 text-medium-emphasis">
              {{ selectedStudioForModal.interviewStyle }}
            </p>
          </div>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <UnifiedButton
            variant="outline"
            color="secondary"
            @click="closeStudioModal"
          >
            Close
          </UnifiedButton>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Smart Search Dialog -->
    <v-dialog v-model="showSmartSearchDialog" max-width="600" persistent>
      <v-card>
        <v-card-title class="d-flex align-items-center">
          <AppIcon name="mdi-lightbulb" class="me-3 text-primary" />
          <span>Smart Job Search</span>
        </v-card-title>
        <v-card-text>
          <p class="text-body-2 mb-4">
            Tell me what you're looking for in natural language, and I'll find
            the perfect jobs for you!
          </p>

          <v-textarea
            v-model="smartSearchQuery"
            label="Describe your ideal job"
            placeholder="e.g., 'I want a senior Unity developer position, remote work, salary around $90k, at a gaming startup'"
            rows="4"
            variant="outlined"
            auto-grow
            @keydown.ctrl.enter="executeSmartSearch"
          />

          <div class="mt-4">
            <h6 class="text-subtitle-2 mb-2">Example queries:</h6>
            <div class="d-flex flex-wrap gap-2">
              <UiChip
                classes="chip chip-primary chip-compact"
                @click="
                  smartSearchQuery =
                    'Remote frontend developer position with React, $80k+'
                "
              >
                Remote React developer $80k+
              </UiChip>
              <UiChip
                classes="chip chip-primary chip-compact"
                @click="
                  smartSearchQuery =
                    'Senior game developer at AAA studio, Unity experience'
                "
              >
                Senior Unity at AAA studio
              </UiChip>
              <UiChip
                classes="chip chip-primary chip-compact"
                @click="
                  smartSearchQuery =
                    'Entry level programming job, willing to learn, full-time'
                "
              >
                Entry level programming
              </UiChip>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <UnifiedButton variant="ghost" @click="showSmartSearchDialog = false">
            Cancel
          </UnifiedButton>
          <UnifiedButton
            variant="primary"
            :disabled="!smartSearchQuery.trim()"
            :loading="searching"
            leading-icon="mdi-magnify"
            @click="executeSmartSearch"
          >
            Smart Search
          </UnifiedButton>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- AI Job Analysis Modal -->
    <AIJobAnalysisModal
      v-model:show="showAIModal"
      :job="selectedJobForAI"
      :match-data="aiMatches.find((m) => m.job.id === selectedJobForAI?.id)"
      :salary-data="salaryPrediction"
      :insights-data="aiJobInsights"
      :mode="aiAnalysisMode"
      @analyze="analyzeJobWithAI"
      @close="closeAIModal"
    />
  </StandardPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useAppStore } from "@/stores/app";
import { formatRelativeDate } from "@/utils/date";
import { useToast } from "@/composables/useToast";
import { useRouter } from "vue-router";
// Theme handled globally by unified theme system

// UI Components
import StandardPageLayout from "@/components/layout/StandardPageLayout.vue";
import StandardCard from "@/components/ui/StandardCard.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import HeaderActions from "@/components/ui/HeaderActions.vue";
import JobDetailsView from "@/components/jobs/JobDetailsView.vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import AIJobAnalysisModal from "@/components/jobs/AIJobAnalysisModal.vue";
import CompactGamifyHUD from "@/components/CompactGamifyHUD.vue";
import GamificationService from "@/utils/gamification";
import UiChip from "@/components/ui/UiChip.vue";
import ViewToggle from "@/components/ui/ViewToggle.vue";

// Services
import { canonicalJobService as refactoredJobAPIService } from "@/services/jobs";
import type { GamingJobFilters } from "@/services/GamingJobsService";
import { JobRepository } from "@/services/JobRepository";
import {
  buildNormalizedStudios,
  buildTokenIndex,
  fuzzyMatchStudios,
  normalizeStudio,
  type NormalizedStudio,
} from "@/shared/utils/studioNormalization";
import { seedStudiosIfEmpty } from "@/shared/services/StudioPersistenceService";
import { GAMING_STUDIOS } from "@/shared/constants/gaming-studios";
import { aiJobService, type AIJobMatch } from "@/services/AIJobService";

// Types
import type {
  Job,
  JobFilters,
  JobType,
  ExperienceLevel,
  SalaryRange,
} from "@/shared/types/jobs";

// Reactive state
const router = useRouter();
const store = useAppStore();
const gService = new (GamificationService as any)(store);
const { toast } = useToast();
// const theme = useUnifiedTheme() // not needed locally

// Easter-egg content removed in canonical implementation

// UI State
const viewMode = ref<"table" | "cards">("table");
const showSearchModal = ref<boolean>(false);
const showJobDetails = ref<boolean>(false);
const selectedJob = ref<Job | null>(null);
const loading = ref<boolean>(false);
const searching = ref<boolean>(false);
const selectedStudioForModal = ref<NormalizedStudio | null>(null);
const refreshing = ref<boolean>(false);
const aiLoading = ref<boolean>(false);

// Studio fuzzy index
const studioTokenIndex = ref<Record<string, Set<string>> | null>(null);
const normalizedStudioList = ref<NormalizedStudio[]>([]);

// Lightweight Levenshtein distance for tie-breakers
function levenshtein(a: string, b: string) {
  a = (a || "").toLowerCase();
  b = (b || "").toLowerCase();
  const m = a.length,
    n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0),
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }
  return dp[m][n];
}

// Search and Filter State
const searchKeywords = ref<string>("");
const selectedLocation = ref<string>("");
const selectedJobType = ref<string>("");
const selectedExperience = ref<string>("");
const selectedJobs = ref<string[]>([]);

// Jobs Data
const jobResults = ref<Job[]>([]);
const savedJobIds = ref<Set<string>>(new Set());
const savedJobs = ref<Job[]>([]);
const applications = ref<any[]>([]);
const jobBoardSources = ref<any[]>([]);
const selectedSources = ref<string[]>([]);
const activeFilters = ref<Partial<JobFilters>>({});

// Gaming-specific filters
const gamingFilters = ref<GamingJobFilters>({
  gameEngines: [],
  studioTypes: [],
  platforms: [],
  roleCategories: [],
  workStyle: "any",
});

// Gaming filter options
const gameEngineOptions = ref([
  "Unity",
  "Unreal Engine",
  "Godot",
  "CryEngine",
  "Frostbite",
  "Source Engine",
  "id Tech",
  "Custom Engine",
]);

const studioTypeOptions = ref([
  "AAA Studio",
  "Indie Studio",
  "Mobile Studio",
  "VR/AR Studio",
  "Publisher",
  "Platform Holder",
  "Middleware",
  "Tools & Engine",
]);

const platformOptions = ref([
  "PC",
  "PlayStation",
  "Xbox",
  "Nintendo Switch",
  "Mobile",
  "VR/AR",
  "Web",
  "Console",
  "Cross-platform",
]);

const roleCategoryOptions = ref([
  "Programming",
  "Design",
  "Art & Animation",
  "Audio",
  "Production",
  "QA Testing",
  "Marketing",
  "Business",
  "Community",
  "Operations",
]);

// Additional missing state
const gamingJobsCount = ref(0);
const averageSalary = ref(75000);
const topMatches = computed(() =>
  jobResults.value.filter((j) => (Number(j.matchScore) || 0) >= 60),
);

// Hero stats for StandardPageLayout
const jobBoardStats = computed(() => [
  { label: `${totalJobs.value.toLocaleString()} Live Jobs` },
  { label: `${gamingJobsCount.value} Gaming` },
  { label: `${topMatches.value.length} Top Matches` },
  { label: `$${Math.round(averageSalary.value / 1000)}K Avg Salary` },
]);
const showAdvancedSearch = ref(false);
const showSavedJobs = ref(false);
const showJobAlertsModal = ref(false);
const jobAlerts = ref<any[]>([]);
const searchFilters = ref({
  keywords: "",
  location: "",
  jobType: "",
  posted: "",
});

// AI-powered features
const aiMatches = ref<AIJobMatch[]>([]);
const showAIRecommendations = ref(false);
const aiAnalysisMode = ref<"match" | "salary" | "insights">("match");
const selectedJobForAI = ref<Job | null>(null);
const aiJobInsights = ref<any>(null);
const salaryPrediction = ref<any>(null);
const showAIModal = ref(false);
const showSmartSearchDialog = ref(false);
const smartSearchQuery = ref("");

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(25);


const gamingFilterActive = computed(() => {
  return (
    gamingFilters.value.gameEngines?.length > 0 ||
    gamingFilters.value.studioTypes?.length > 0 ||
    gamingFilters.value.platforms?.length > 0 ||
    gamingFilters.value.roleCategories?.length > 0
  );
});

const toggleGamingFilter = () => {
  if (gamingFilterActive.value) {
    // Clear all gaming filters
    gamingFilters.value = {
      gameEngines: [],
      studioTypes: [],
      platforms: [],
      roleCategories: [],
      workStyle: "any",
    };
  } else {
    // Set some default gaming filters to activate gaming mode
    gamingFilters.value.studioTypes = ["AAA Studio", "Indie Studio"];
  }
};

// Computed Properties
const totalJobs = computed(() => filteredJobs.value.length);
const totalPages = computed(() =>
  Math.ceil(totalJobs.value / itemsPerPage.value),
);
// Bulk selection currently not exposed; keep derived guard minimal to avoid ESLint noise
const _allSelected = computed(
  () =>
    selectedJobs.value.length === paginatedJobs.value.length &&
    paginatedJobs.value.length > 0,
);

const filteredJobs = computed(() => {
  let jobs = jobResults.value;

  if (searchKeywords.value) {
    const keywords = searchKeywords.value.toLowerCase();
    jobs = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(keywords) ||
        job.company.toLowerCase().includes(keywords) ||
        job.tags?.some((tag) => tag.toLowerCase().includes(keywords)),
    );
  }

  if (selectedLocation.value) {
    jobs = jobs.filter((job) => {
      if (selectedLocation.value === "remote") {
        return job.remote;
      }
      // Add more location filtering logic here
      return true;
    });
  }

  if (selectedJobType.value) {
    jobs = jobs.filter((job) => job.type === selectedJobType.value);
  }

  if (selectedExperience.value) {
    jobs = jobs.filter((job) => {
      const title = job.title.toLowerCase();
      switch (selectedExperience.value) {
        case "entry":
          return (
            title.includes("junior") ||
            title.includes("entry") ||
            title.includes("associate")
          );
        case "mid":
          return (
            !title.includes("senior") &&
            !title.includes("lead") &&
            !title.includes("principal")
          );
        case "senior":
          return title.includes("senior");
        case "lead":
          return title.includes("lead") || title.includes("principal");
        default:
          return true;
      }
    });
  }

  return jobs;
});

const paginatedJobs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredJobs.value.slice(start, end);
});

// visiblePages no longer needed with v-pagination

// Compute badge class for match score thresholds
// Deprecated badge class helper (chip colors used instead)

// Get Vuetify chip color for match score
function getMatchChipColor(score: number | string | undefined): string {
  const s = Number(score) || 0;
  if (s >= 90) return "success";
  if (s >= 80) return "info";
  if (s >= 70) return "primary";
  if (s >= 60) return "warning";
  return "error";
}

// Get Vuetify chip color for job type
function getJobTypeChipColor(type: JobType): string {
  switch (type) {
    case "full-time":
      return "primary";
    case "part-time":
      return "info";
    case "contract":
      return "warning";
    case "internship":
      return "success";
    default:
      return "secondary";
  }
}

// Table headers for Vuetify data table
const tableHeaders = computed(() => [
  {
    title: "Job Title",
    key: "title",
    align: "start" as const,
    sortable: true,
    width: "25%",
  },
  {
    title: "Company",
    key: "company",
    align: "start" as const,
    sortable: true,
    width: "20%",
  },
  {
    title: "Location",
    key: "location",
    align: "start" as const,
    sortable: true,
    width: "15%",
  },
  {
    title: "Type",
    key: "type",
    align: "center" as const,
    sortable: true,
    width: "10%",
  },
  {
    title: "Salary",
    key: "salary",
    align: "start" as const,
    sortable: false,
    width: "15%",
  },
  {
    title: "Posted",
    key: "postedDate",
    align: "start" as const,
    sortable: true,
    width: "10%",
  },
  {
    title: "Actions",
    key: "actions",
    align: "center" as const,
    sortable: false,
    width: "10%",
  },
]);

// headerActions removed; actions are in-page


const getMatchingStudio = (companyName: string): NormalizedStudio | null => {
  if (!companyName) {
    return null;
  }
  try {
    const map = store.normalizedStudios || {};
    const list = Object.values(map) as NormalizedStudio[];
    const lc = String(companyName).toLowerCase();
    let match = list.find((s) => s?.name?.toLowerCase?.() === lc);
    if (match) return match;
    match = list.find((s) => lc.includes(s?.name?.toLowerCase?.()));
    if (match) return match;
  } catch {}
  // Fuzzy match via token index
  try {
    if (studioTokenIndex.value && normalizedStudioList.value?.length) {
      const studiosById = store.normalizedStudios || {};
      const results =
        fuzzyMatchStudios(
          String(companyName),
          studioTokenIndex.value,
          studiosById,
        ) || [];
      const top = results[0];
      if (top && top.score >= 70) {
        return studiosById[top.id] || null;
      }
    }
  } catch {}
  // Levenshtein tie-breaker across normalized names
  try {
    const list = Object.values(store.normalizedStudios || {}) as any[];
    if (list.length) {
      let best: any = null,
        bestDist = Infinity;
      for (const s of list) {
        const d = levenshtein(String(companyName), String(s?.name || ""));
        if (d < bestDist) {
          bestDist = d;
          best = s;
        }
      }
      if (
        best &&
        (bestDist <= 2 ||
          bestDist <= Math.ceil(String(companyName).length * 0.2))
      ) {
        return best;
      }
    }
  } catch {}
  // Fallback to static constants
  const studioEntry = Object.values(GAMING_STUDIOS).find(
    (studio) => studio.name.toLowerCase() === companyName.toLowerCase(),
  );
  return studioEntry ? normalizeStudio(studioEntry) : null;
};


const openStudioModal = (job: Job): void => {
  const studio = getMatchingStudio(job.company);
  if (studio) {
    selectedStudioForModal.value = studio;
  }
};


const closeStudioModal = () => {
  selectedStudioForModal.value = null;
};


const onLogoError = (event: Event): void => {
  // Hide broken image and show placeholder
  const target = event.target as HTMLImageElement | null;
  if (target instanceof HTMLImageElement) {
    target.style.display = "none";
    target.nextElementSibling?.classList.remove("d-none");
  }
};

// Search preferences
const searchPreferences = ref({
  keywords: "",
  location: "",
  remote: false,
  salaryMin: null,
  salaryMax: null,
  experience: "",
  jobType: "",
  skills: [],
});

const searchForm = ref({
  query: "",
  filters: {},
  aiEnhanced: true,
});

// Methods
// Toggle-select removed; bulk selection is not exposed in UI

const isJobSaved = (jobId: string): boolean => {
  return savedJobIds.value.has(jobId);
};

const toggleSaveJob = async (job: Job): Promise<void> => {
  if (savedJobIds.value.has(job.id)) {
    savedJobIds.value.delete(job.id);
    toast.info(`Removed "${job.title}" from saved jobs`);
    // Remove from local saved jobs array
    savedJobs.value = savedJobs.value.filter((j) => j.id !== job.id);

    // Remove from database
    try {
      await JobRepository.unsaveJob(job.id);
    } catch (error) {
      console.warn("Failed to unsave job in database:", error);
    }
  } else {
    savedJobIds.value.add(job.id);
    toast.success(`Saved "${job.title}" to your saved jobs`);

    // Save to both store and database
    store.saveJob(job);
    try {
      await JobRepository.saveJob(job.id);
      // Also ensure the job exists in the repository
      await JobRepository.create(job);
    } catch (error) {
      console.warn("Failed to save job in database:", error);
    }
  }
};

const viewJob = (job: Job): void => {
  selectedJob.value = job;
  showJobDetails.value = true;
};

const applyToJob = async (job: Job): Promise<void> => {
  try {
    // Track application
    store.saveJobApplication({
      jobId: job.id,
      title: job.title,
      company: job.company,
      appliedAt: new Date(),
      status: "applied",
      matchScore: job.matchScore,
      resumeId: store.resumeData?.id || null,
    });

    // Enhanced job application with smart document generation
    try {
      gService.completeDailyChallenge("job_apply");
      gService.updateStreak();
    } catch {}
    const shouldUseSmartApply =
      (job.matchScore || 0) > 60 ||
      !store.resumeData?.personalInfo?.firstName ||
      !store.resumeData?.experience?.length;

    if (shouldUseSmartApply) {
      const result = await showSmartApplicationDialog(job);

      if (result?.action === "optimize-both") {
        // Open resume builder and then cover letter builder with job prepopulation
        await router.push({
          path: "/resume",
          query: {
            jobId: job.id,
            company: encodeURIComponent(job.company),
            position: encodeURIComponent(job.title),
            description: encodeURIComponent(job.description || ""),
            requirements: encodeURIComponent(JSON.stringify(job.tags || [])),
            autoGenerate: "true",
          },
        });
        toast.success("Resume builder opened with job prepopulation");
        return;
      } else if (result?.action === "optimize-resume") {
        await router.push({
          path: "/resume",
          query: {
            jobId: job.id,
            company: encodeURIComponent(job.company),
            position: encodeURIComponent(job.title),
            autoTailor: "true",
          },
        });
        toast.success("Resume tailoring initiated");
        return;
      } else if (result?.action === "optimize-cover-letter") {
        // Ensure basic resume info exists before opening cover letter
        if (!store.resumeData?.personalInfo?.firstName) {
          toast.warning(
            "Please complete your resume personal information first",
          );
          await router.push({
            path: "/resume",
            query: { returnTo: `/cover-letter?jobId=${job.id}` },
          });
          return;
        }

        await router.push({
          path: "/cover-letter",
          query: {
            jobId: job.id,
            company: encodeURIComponent(job.company),
            position: encodeURIComponent(job.title),
            description: encodeURIComponent(job.description || ""),
            autoGenerate: "true",
          },
        });
        toast.success("Cover letter builder opened with job context");
        return;
      } else if (result?.action === "skip") {
        // Continue to standard application
      } else {
        // Cancelled by user
        return;
      }
    }

    // Standard application flow
    performStandardApplication(job);
  } catch {
    toast.error("Failed to process application");
  }
};

// Smart application dialog with multiple options
const showSmartApplicationDialog = async (job: Job) => {
  return new Promise<{ action: string } | null>((resolve) => {
    try {
      if (store.setModal) {
        store.setModal({
          type: "smart-application",
          job: job,
          onOptimizeBoth: () => resolve({ action: "optimize-both" }),
          onOptimizeResume: () => resolve({ action: "optimize-resume" }),
          onOptimizeCoverLetter: () =>
            resolve({ action: "optimize-cover-letter" }),
          onSkip: () => resolve({ action: "skip" }),
          onCancel: () => resolve(null),
        });
      } else {
        // Fallback to simple confirmation
        const confirmed = confirm(
          `Would you like to optimize your application for "${job.title}"?\n\nWe can tailor your resume and cover letter to increase your chances!`,
        );
        resolve(confirmed ? { action: "optimize-both" } : { action: "skip" });
      }
    } catch {
      resolve({ action: "skip" });
    }
  });
};

// Standard application handler
const performStandardApplication = (job: Job) => {
  if (job.applicationUrl) {
    window.open(job.applicationUrl, "_blank");
    toast.success(`Application opened for "${job.title}"`);
  } else {
    toast.success(`Application submitted for "${job.title}"`);
  }
};

// Confirmation dialog helper
// confirmation dialog helper not used; removed

// badge class helper not used; removed

const formatJobType = (type: JobType): string => {
  return (
    type
      ?.split("-")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ") || "Not specified"
  );
};

const formatSalary = (salary: string | SalaryRange | undefined): string => {
  if (!salary) return "Not disclosed";
  if (typeof salary === "string") return salary;
  return `${salary.currency || "$"}${salary.min} - ${salary.currency || "$"}${salary.max} ${salary.frequency || "yearly"}`;
};

const aiRecommendJobs = async () => {
  aiLoading.value = true;
  try {
    // Get current jobs or fetch new ones if needed
    let jobs = jobResults.value;
    if (!jobs.length) {
      const searchResult = await refactoredJobAPIService.searchJobs({
        title: "developer",
        location: "remote",
      });
      jobs = searchResult.jobs;
      jobResults.value = jobs;
    }

    // Use AI service to analyze and match jobs
    const matches = await aiJobService.analyzeJobMatches(jobs);
    aiMatches.value = matches;

    // Update job results with AI scores
    jobResults.value = matches.map((match) => ({
      ...match.job,
      matchScore: match.matchScore,
      matchReasons: match.matchReasons,
      aiEnhanced: true,
    }));

    // Get personalized recommendations
    const recommendations = await aiJobService.generateRecommendations(
      jobs,
      10,
    );

    toast({
      title: "AI Analysis Complete",
      description: `Analyzed ${jobs.length} jobs and found ${recommendations.length} top recommendations`,
      type: "success",
    });

    showAIRecommendations.value = true;
  } catch (error) {
    console.error("AI recommendation failed:", error);
    toast({
      title: "AI Recommendation Failed",
      description: "Unable to generate recommendations at this time",
      type: "error",
    });
  } finally {
    aiLoading.value = false;
  }
};

// AI-powered job analysis for individual jobs
const analyzeJobWithAI = async (
  job: Job,
  mode: "match" | "salary" | "insights" = "match",
) => {
  try {
    aiAnalysisMode.value = mode;
    selectedJobForAI.value = job;

    switch (mode) {
      case "match": {
        const matches = await aiJobService.analyzeJobMatches([job]);
        aiMatches.value = matches;
        break;
      }
      case "salary": {
        const prediction = await aiJobService.predictSalary(job);
        salaryPrediction.value = prediction;
        break;
      }
      case "insights": {
        const insights = await aiJobService.analyzeJobInsights(job);
        aiJobInsights.value = insights;
        break;
      }
    }

    showAIModal.value = true;
  } catch (error) {
    console.error("AI analysis failed:", error);
    toast({
      title: "AI Analysis Failed",
      description: "Unable to analyze this job at the moment",
      type: "error",
    });
  }
};

// Smart job search with AI enhancement
const performSmartSearch = async (query: string) => {
  searching.value = true;
  try {
    // Enhanced search filters based on natural language query
    const enhancedFilters = await parseNaturalLanguageQuery(query);

    const result = await refactoredJobAPIService.searchJobs(enhancedFilters);

    // Apply AI analysis to results
    const aiAnalyzedJobs = await aiJobService.analyzeJobMatches(result.jobs);

    // Update results with AI scores
    jobResults.value = aiAnalyzedJobs.map((match) => ({
      ...match.job,
      matchScore: match.matchScore,
      matchReasons: match.matchReasons,
      aiEnhanced: true,
    }));

    toast({
      title: "Smart Search Complete",
      description: `Found ${result.jobs.length} jobs with AI-powered matching`,
      type: "success",
    });
  } catch (error) {
    console.error("Smart search failed:", error);
    toast({
      title: "Smart Search Failed",
      description: "Falling back to regular search",
      type: "warning",
    });

    // Fallback to regular search
    const result = await refactoredJobAPIService.searchJobs({ title: query });
    jobResults.value = result.jobs;
  } finally {
    searching.value = false;
  }
};

// Natural language query parser
const parseNaturalLanguageQuery = async (
  query: string,
): Promise<JobFilters> => {
  const queryLower = query.toLowerCase();
  const filters: JobFilters = { title: query };

  // Extract location preferences
  if (queryLower.includes("remote")) {
    filters.remote = true;
    filters.location = "remote";
  }

  // Extract experience level
  if (queryLower.includes("senior")) {
    filters.experienceLevel = "senior";
  } else if (queryLower.includes("junior") || queryLower.includes("entry")) {
    filters.experienceLevel = "entry";
  } else if (queryLower.includes("lead") || queryLower.includes("principal")) {
    filters.experienceLevel = "lead";
  }

  // Extract job type
  if (queryLower.includes("part-time") || queryLower.includes("part time")) {
    filters.jobType = "part-time";
  } else if (
    queryLower.includes("contract") ||
    queryLower.includes("freelance")
  ) {
    filters.jobType = "contract";
  } else if (queryLower.includes("internship")) {
    filters.jobType = "internship";
  } else {
    filters.jobType = "full-time";
  }

  // Extract salary expectations
  const salaryMatch = query.match(/\$?(\d{1,3}),?(\d{3})/g);
  if (salaryMatch) {
    const salary = parseInt(salaryMatch[0].replace(/[$,]/g, ""));
    if (salary > 1000) {
      // Assuming yearly salary
      filters.salaryMin = Math.floor(salary * 0.9);
      filters.salaryMax = Math.floor(salary * 1.3);
    }
  }

  return filters;
};

// AI Modal Management
const closeAIModal = () => {
  showAIModal.value = false;
  selectedJobForAI.value = null;
  aiJobInsights.value = null;
  salaryPrediction.value = null;
};

// Smart Search execution
const executeSmartSearch = async () => {
  if (!smartSearchQuery.value.trim()) return;

  showSmartSearchDialog.value = false;
  await performSmartSearch(smartSearchQuery.value);
  smartSearchQuery.value = "";
};

const applyFilters = () => {
  currentPage.value = 1; // Reset to first page when filtering
};

const clearFilters = () => {
  searchKeywords.value = "";
  selectedLocation.value = "";
  selectedJobType.value = "";
  selectedExperience.value = "";
  currentPage.value = 1;
};

const refreshJobs = async () => {
  refreshing.value = true;
  try {
    const filters: JobFilters = {
      title: searchKeywords.value,
      location: selectedLocation.value,
      jobType: selectedJobType.value as JobType,
      experienceLevel: selectedExperience.value as ExperienceLevel,
      remote: selectedLocation.value === "remote",
    };
    const result = await refactoredJobAPIService.searchJobs(filters);
    jobResults.value = result.jobs;
    toast.success(`Found ${result.totalFound} jobs`);
  } catch (error) {
    console.error("Failed to refresh jobs:", error);
    toast.error("Failed to refresh jobs");
  } finally {
    refreshing.value = false;
  }
};

// Direct job source search implementation using unified API (unused legacy helper)
  try {
    const enabledSources = store.settings?.enabledJobSources || ['arbeitnow', 'remoteok', 'github', 'wellfound']
      return { success: false, data: [], error: 'No job sources enabled. Configure sources in Settings.' }
    }
    
    // Convert filters to JobFilters format
    const jobFilters: JobFilters = {
      query: filters.keywords || filters.query || '',
      location: filters.location || '',
      remote: filters.remote,
      jobType: filters.type || filters.jobType,
      experienceLevel: filters.experience || filters.experienceLevel,
      salaryRange: filters.salaryMin || filters.salaryMax ? {
        min: filters.salaryMin,
        max: filters.salaryMax
      } : undefined,
      sources: enabledSources,
    }
    
    // Use unified job API service with refactored providers
    const result = await refactoredJobAPIService.searchJobs(jobFilters)
    
    // Store results in database for persistence
      for (const job of result.jobs) {
        try {
          // Create a simple storage mechanism since JobRepository isn't available
          localStorage.setItem(`job_${job.id}`, JSON.stringify({
            ...job,
            cached: true,
            cachedAt: new Date().toISOString()
          }))
        } catch (error) {
          console.debug('Job storage failed:', job.id, error)
        }
      }
    }
    
    return { 
      data: result.jobs,
      totalResults: result.totalFound,
      sources: result.sources,
      errors: result.errors,
      processingTime: result.processingTime
    }
  } catch (error) {
    console.error('Job search failed:', error)
    // Fallback to mock results if API fails
    return await getMockJobResults(filters)
  }

// Generate mock job results for demo/fallback
  const mockJobs = [
    {
      title: `${filters.query || 'Game'} Developer`,
      company: 'Epic Games',
      location: filters.location === 'remote' ? 'Remote' : 'Cary, NC',
      type: filters.roleType || 'full-time',
      experience: filters.experienceLevel || 'mid',
      description: 'Join our team building the next generation of gaming experiences.',
      posted: new Date().toISOString(),
      source: 'mock'
    },
    {
      title: `Senior ${filters.query || 'UI/UX'} Designer`,
      company: 'Riot Games',
      location: filters.location === 'remote' ? 'Remote' : 'Los Angeles, CA',
      type: filters.roleType || 'full-time',
      experience: 'senior',
      description: 'Design engaging user interfaces for our gaming platforms.',
      posted: new Date().toISOString(),
      source: 'mock'
    },
    {
      title: `${filters.query || 'Technical'} Artist`,
      company: 'Blizzard Entertainment', 
      location: filters.location === 'remote' ? 'Remote' : 'Irvine, CA',
      type: filters.roleType || 'full-time',
      experience: filters.experienceLevel || 'mid',
      description: 'Bridge the gap between art and technology in game development.',
      posted: new Date().toISOString(),
      source: 'mock'
    }
  ]
  
  // Filter jobs based on search criteria
  const filteredJobs = mockJobs.filter(job => {
    if (filters.query && !job.title.toLowerCase().includes(filters.query.toLowerCase())) {
      return false
    }
    if (filters.experienceLevel && job.experience !== filters.experienceLevel) {
      return false
    }
    if (filters.roleType && job.type !== filters.roleType) {
      return false
    }
    return true
  })
  
  return { success: true, data: filteredJobs }

// Local job matching algorithm
const performLocalJobMatching = async (jobs: any[], profile: any) => {
  return jobs.map((job) => {

    // Skill matching
    const jobSkills = [
      ...(job.requirements || []),
      ...(job.title?.toLowerCase().split(" ") || []),
    ];
    const userSkills: string[] = Array.isArray(profile.skills)
      ? profile.skills.map((s: string) => s.toLowerCase())
      : [];
    const skillMatches = jobSkills.filter((req: string) =>
      userSkills.some(
        (skill: string) =>
          req.toLowerCase().includes(skill) ||
          skill.includes(req.toLowerCase()),
      ),
    ).length;

    // Title relevance
    const titleWords: string[] = job.title?.toLowerCase().split(" ") || [];
    const interestWords: string[] = Array.isArray(profile.interests)
      ? profile.interests.map((i: string) => i.toLowerCase())
      : [];
    const titleMatches = titleWords.filter((word: string) =>
      interestWords.some(
        (interest: string) =>
          word.includes(interest) || interest.includes(word),
      ),
    ).length;

    // Description matching
    const description = job.description?.toLowerCase() || "";
    const descriptionMatches = userSkills.filter((skill: string) =>
      description.includes(skill),
    ).length;

    // Location preference
    if (profile.location && job.location) {
      if (
        job.location.toLowerCase().includes(profile.location.toLowerCase()) ||
        (profile.location.toLowerCase() === "remote" &&
          job.location.toLowerCase().includes("remote"))
      ) {
        score += weights.location;
      }
    }

  });
};

const performSearch = async (searchData: {
  query: string;
  filters: any;
  aiEnhanced: boolean;
}) => {
  searching.value = true;
  try {
    const filters: JobFilters = {
      title: searchData.query,
      ...searchData.filters,
    };

    // Fetch jobs from canonical service based on incoming filters
    const searchRes = await refactoredJobAPIService.searchJobs(filters);
    const currentJobs = Array.isArray(searchRes?.jobs) ? searchRes.jobs : [];
    jobResults.value = currentJobs;

    // Build user profile for matching
    const profile = {
      skills:
        store.user?.skills ||
        (Array.isArray(store.mappedSkills)
          ? store.mappedSkills.map((s: any) => s.name)
          : []) ||
        [],
      interests: store.user?.interests || [],
      location: store.user?.location,
      workStyle: store.user?.workStyle,
      salaryExpectation: store.user?.salaryExpectation,
      technologies: store.user?.technologies || [],
    };

    let scoredJobs;

    // Try window.api first if available
    if (window.api?.jobs?.recommend && currentJobs.length) {
      try {
        const resp = await window.api.jobs.recommend({
          profile,
          jobs: currentJobs,
        });
        const recs = Array.isArray(resp?.data) ? resp.data : resp || [];
        const scoreMap = new Map(recs.map((r: any) => [r.jobId, r.matchScore]));
        scoredJobs = currentJobs.map((j) => ({
          ...j,
        }));
      } catch (apiError) {
        console.warn(
          "Window API recommendation failed, using local matching:",
          apiError,
        );
      }
    }

    // Fallback to local AI-like matching algorithm
    if (!scoredJobs) {
      scoredJobs = await performLocalJobMatching(currentJobs, profile);
    }

    // Sort by match score and update results
    const sortedJobs = scoredJobs.sort(
    );
    jobResults.value = sortedJobs;

    const topMatchesCount = sortedJobs.filter(
    ).length;
    toast.success(
      `AI analysis complete! Found ${topMatchesCount} high-match opportunities`,
    );
  } catch (error) {
    console.error("AI recommendation failed:", error);
    toast.error("AI recommendation temporarily unavailable");
  } finally {
    aiLoading.value = false;
  }
};

const performAdvancedSearch = () => {
  performSearch(searchForm.value);
};

// Removed unused enhanced AI button handlers

const saveSearch = (searchData: {
  query: string;
  filters: any;
  aiEnhanced: boolean;
}) => {
  try {
    const saved = JSON.parse(
      localStorage.getItem(LS_KEYS.savedSearches) || "[]",
    );
    saved.push({
      id: Date.now(),
      ...searchData,
      savedAt: new Date().toISOString(),
    });
    localStorage.setItem(LS_KEYS.savedSearches, JSON.stringify(saved));
    toast.success("Search saved");
  } catch (e) {
    console.warn("Failed saving search", e);
  }
};

const updateSearchPreferences = (
  preferences: Partial<typeof searchPreferences.value>,
) => {
  searchPreferences.value = { ...searchPreferences.value, ...preferences };
};

// --- AI Match helper computed/methods added to satisfy template references ---

// Flag indicating whether any AI analysis (match scores) has been applied
const hasRunAIAnalysis = computed(() =>
  jobResults.value.some(
    (j) => j.matchScore !== undefined && j.matchScore !== null,
  ),
);

// Wrapper used by the Top Matches card button (alias to existing viewJob logic)
  viewJob(job);
}

// Smooth scroll helper for "View All Top Matches" button
  const el = document.getElementById("jobs-table");
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// Removed unused local handlers to satisfy lint; actions are handled inline or via other components

// Load job sources and initialize
const getFilteredJobSources = (userPreferences: any) => {
  // Default job sources - in a real implementation this would come from a configuration
  const defaultSources = [
    {
      id: "arbeitnow",
      name: "Arbeitnow",
      description: "Global job listings",
      enabled: true,
      deprecated: false,
      requiresAuth: false,
      icon: "mdi-web",
      categories: ["global", "remote"],
      features: ["api", "scraping"],
      regions: ["Global"],
    },
    {
      id: "github",
      name: "GitHub Jobs",
      description: "Developer job listings",
      enabled: true,
      deprecated: false,
      requiresAuth: false,
      icon: "mdi-github",
      color: "var(--text-primary)",
      categories: ["tech", "developer"],
      features: ["api"],
      regions: ["Global"],
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      description: "Professional networking jobs",
      enabled: true,
      deprecated: false,
      requiresAuth: true,
      icon: "mdi-linkedin",
      categories: ["professional", "networking"],
      features: ["api", "auth"],
      regions: ["Global"],
    },
    {
      id: "indeed",
      name: "Indeed",
      description: "Job search engine",
      enabled: true,
      deprecated: false,
      requiresAuth: false,
      icon: "mdi-magnify",
      categories: ["search", "aggregator"],
      features: ["scraping"],
      regions: ["Global"],
    },
  ];

  // Filter based on user preferences
  return defaultSources.filter((source) => {
    if (
      userPreferences.enabledSources &&
    ) {
      return userPreferences.enabledSources.includes(source.id);
    }
    return source.enabled && !source.deprecated;
  });
};

const initializeJobSources = async () => {
  try {
    // Get user preferences from store
    const userPreferences = {
      enabledSources: store.settings.enabledJobSources || [],
      regions: store.settings.preferredRegions || [],
      categories: store.settings.preferredCategories || [],
    };

    // Load filtered job sources based on user preferences
    const sources = getFilteredJobSources(userPreferences);

    // Map to UI format with additional metadata
    jobBoardSources.value = sources.map((source: any) => ({
      id: source.id,
      name: source.name,
      description:
        source.description ||
        `${source.regions?.join(", ") || "Global"} job listings`,
      enabled: source.enabled && !source.deprecated,
      apiKey: source.requiresAuth
        ? store.settings.jobSourcesConfig?.[source.id]?.apiKey || ""
        : "Not required",
      rateLimit: source.rateLimit || "Unknown",
      status: source.deprecated ? "deprecated" : "operational",
      icon: source.icon || getSourceIcon(source.id),
      color: source.color || getSourceColor(source.id),
      categories: source.categories || source.features || [],
      features: source.features || [],
    }));

    // Update selected sources based on user preferences
      selectedSources.value = userPreferences.enabledSources.filter(
        (sourceId: string) =>
          jobBoardSources.value.some(
            (source) => source.id === sourceId && source.enabled,
          ),
      );
    } else {
      // Default to enabled sources if no preferences set
      selectedSources.value = jobBoardSources.value
        .filter((source) => source.enabled && !source.requiresAuth)
        .map((source) => source.id);
    }

      total: jobBoardSources.value.length,
      enabled: jobBoardSources.value.filter((s) => s.enabled).length,
      selected: selectedSources.value.length,
      sources: jobBoardSources.value.map(
        (s) => `${s.name} (${s.enabled ? "enabled" : "disabled"})`,
      ),
    });
  } catch (error) {
    console.error("Failed to load job sources:", error);
  }
};

  const icons: Record<string, string> = {
    arbeitnow: "mdi mdi-briefcase-search",
    github: "mdi mdi-github",
    linkedin: "mdi mdi-linkedin",
    indeed: "mdi mdi-briefcase",
  };
  return icons[sourceId] || "mdi mdi-web";
}

  // Get computed CSS variables from document
  const root = document.documentElement;
  const primaryColor =
    getComputedStyle(root).getPropertyValue("--color-primary");
  const textPrimary = getComputedStyle(root).getPropertyValue("--text-primary");
  const infoColor = getComputedStyle(root).getPropertyValue("--color-info");
  const primaryAlt = getComputedStyle(root).getPropertyValue(
    "--color-primary-alt",
  );
  const textMuted = getComputedStyle(root).getPropertyValue("--text-muted");

  const colors: Record<string, string> = {
    arbeitnow: primaryColor?.trim() || "var(--color-primary)",
    github: textPrimary?.trim() || "var(--text-primary)",
    linkedin: infoColor?.trim() || "var(--color-info)",
    indeed: primaryAlt?.trim() || "var(--color-primary-alt)",
  };
  return colors[sourceId] || textMuted?.trim() || "var(--text-muted)";
}

// Job search caching and rate limiting
// Lightweight cache + throttling (used by searchJobsFromSources)
// const jobCache = new Map()

// Cache cleanup - remove expired entries
  const now = Date.now()
  for (const [key, value] of jobCache.entries()) {
    if (now - value.timestamp > value.ttl) {
      jobCache.delete(key)
    }
  }

// --- Persistence (localStorage) ---
const LS_KEYS = {
  sources: "jobSearch.selectedSources",
  preferences: "jobSearch.preferences",
  applications: "jobSearch.applications",
  filters: "jobSearch.filters",
  savedSearches: "jobSearch.savedSearches",
  resultsCache: "jobSearch.resultsCache",
  savedJobs: "jobSearch.savedJobs",
};

  try {
    const s = localStorage.getItem(LS_KEYS.sources);
    if (s) {
      selectedSources.value = JSON.parse(s);
    }
    const p = localStorage.getItem(LS_KEYS.preferences);
    if (p) {
      searchPreferences.value = {
        ...searchPreferences.value,
        ...JSON.parse(p),
      };
    }
    const a = localStorage.getItem(LS_KEYS.applications);
    if (a) {
      applications.value = JSON.parse(a);
    }
    const f = localStorage.getItem(LS_KEYS.filters);
    if (f) {
      activeFilters.value = { ...activeFilters.value, ...JSON.parse(f) };
    }
    const cached = localStorage.getItem(LS_KEYS.resultsCache);
    if (cached) {
      jobResults.value = JSON.parse(cached);
    }
    const saved = localStorage.getItem(LS_KEYS.savedJobs);
    if (saved) {
      savedJobs.value = JSON.parse(saved);
    }
  } catch (e) {
    console.warn("Failed to load persisted job search data", e);
  }
}

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.debug("Persist failed for", key, e);
  }
}

// Load saved jobs from store
const loadSavedJobs = () => {
  const saved = store.jobSearchData?.savedJobs || [];
  saved.forEach((job: Job) => savedJobIds.value.add(job.id));
};

// Load saved jobs from database repository
const loadSavedJobsFromDB = async () => {
  try {
    // Load saved job IDs from repository
    const savedJobIds_db = await JobRepository.getSavedJobs();
    savedJobIds_db.forEach((jobId) => savedJobIds.value.add(jobId));

    // Load recent jobs from repository to populate jobResults
    const recentJobs = await JobRepository.getAll();
    }
  } catch (error) {
    console.warn("Failed to load jobs from database:", error);
    // Fallback to localStorage-based loading
    loadSavedJobs();
  }
};

// Watch for changes and persist
watch(selectedSources, (v) => persist(LS_KEYS.sources, v), { deep: true });
watch(searchPreferences, (v) => persist(LS_KEYS.preferences, v), {
  deep: true,
});
watch(applications, (v) => persist(LS_KEYS.applications, v), { deep: true });
watch(savedJobs, (v) => persist(LS_KEYS.savedJobs, v), { deep: true });

// Initialize
onMounted(async () => {
  loadPersisted();
  await loadSavedJobsFromDB();
  await initializeJobSources();
  // Seed and import studios for cross-matching
  try {
    await seedStudiosIfEmpty();
  } catch {}
  try {
    const normalized = buildNormalizedStudios();
    // Persist normalized list to Electron main (idempotent)
    // @ts-ignore
    if ((window.electronAPI as any)?.studios?.importNormalized) {
      try {
        await (window.electronAPI as any).studios.importNormalized(normalized);
      } catch {}
    }
    // Update Pinia store cache for UI lookups
    try {
      store.upsertNormalizedStudios(normalized);
    } catch {}
    // Build fuzzy token index locally for quick lookups
    try {
      studioTokenIndex.value = buildTokenIndex(normalized);
      normalizedStudioList.value = normalized;
    } catch {}
  } catch (e) {
    console.warn("Studio normalization/import failed", e);
  }
});
</script>

<style scoped>
.job-search-container {
  background: linear-gradient(
  );
}

.hero-header {
  background: linear-gradient(
  );
}

.hero-icon {
}

.action-bar-card {
  background: linear-gradient(
  );
}

.filter-card {
  background: linear-gradient(
  );
}

.top-matches-card {
  background: linear-gradient(
  );
}

.top-match-job-card {
  transition: var(--transition-normal);
  cursor: pointer;
}

.top-match-job-card:hover {
}

.ai-cta-card {
  background: linear-gradient(
  );
}

.jobs-results-card {
  background: linear-gradient(
  );
}

.ui-chip.stats-chip {
  display: inline-flex;
  align-items: center;
  border-radius: var(--radius-full);
  color: var(--color-success);
  background: transparent;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
}

.ui-chip.chip {
  display: inline-flex;
  align-items: center;
  border-radius: var(--radius-full);
  background: var(--glass-elevated);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.ui-chip.chip-compact {
}

.ui-chip.chip-primary {
}
.ui-chip.chip-success {
  color: var(--color-success);
}
.ui-chip.chip-info {
  color: var(--color-info);
}
.ui-chip.chip-warning {
  color: var(--color-warning);
}
.ui-chip.chip-danger {
  color: var(--color-error);
}

.ui-chip.chip-green {
  color: var(--color-success);
}
.ui-chip.chip-orange {
  color: var(--color-warning);
}
.ui-chip.chip-red {
  color: var(--color-error);
}

.jobs-data-table {
  background: transparent;
}

.job-card {
  transition: var(--transition-normal);
}

.job-card:hover {
}

.selected-job-card {
  border-color: rgb(var(--v-theme-primary));
  background: linear-gradient(
  );
}

.studio-logo {
  background: linear-gradient(
  );
}

.empty-state {
}

@keyframes pulse {
  }
  }
}

@keyframes fadeInUp {
  from {
  }
  to {
  }
}

.v-theme--dark .section-card {
}

.v-theme--dark .hero-header {
  background: linear-gradient(
  );
}

  .hero-header {
  }

  .hero-title {
  }

  .hero-subtitle {
  }
}

  .job-search-container {
  }

  .hero-header {
  }

  .hero-title {
  }
}

.v-btn:focus-visible {
}

.v-card:focus-within {
}

.v-btn {
}

@media (prefers-contrast: high) {
  .section-card {
    background: rgb(var(--v-theme-surface)) !important;
  }

  .job-card {
  }
}

@media (prefers-reduced-motion: reduce) {
  }

  .hero-icon {
    animation: none;
  }

  .job-card:hover,
  .top-match-job-card:hover {
    transform: none;
  }
}

.job-search-redesign {
}

.tab-content-wrapper {
}

  .job-search-redesign {
  }

  .tab-content-wrapper {
  }

  .section-card {
    border-radius: var(--border-radius-md);
  }
}

.tab-pane {
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

.step-number {
  background: var(--primary-gradient);
  color: var(--text-on-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-header {
  background: var(--glass-header);
}

.card-body {
}

.results-count-badge .badge {
}

.company-logo {
  object-fit: contain;
  background: var(--glass-surface);
  box-shadow: var(--glass-shadow);
  transition: var(--transition-fast);
}

.job-row {
  cursor: pointer;
}

.job-row:hover {
}

.job-card {
  transition: var(--transition-fast);
}

.job-card:hover {
  box-shadow: var(--glass-shadow);
}

.job-card.selected {
  border-color: var(--bs-primary);
}

.empty-state {
}

.empty-state i {
}

.job-cards-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
  );
}

  .job-cards-grid {
  }
}

@media (min-width: var(--breakpoint-xl)) {
  .job-cards-grid {
  }
}

  .job-cards-grid {
  }
}

@media (max-width: var(--breakpoint-md)) {
  .job-cards-grid {
  }
}

.action-buttons .btn {
  transition: var(--transition-fast);
}

.action-buttons .btn:hover {
}

.view-toggle .btn {
}

.pagination .page-link {
  border: none;
  color: var(--bs-body-color);
}

.pagination .page-item.active .page-link {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
}

.modal.show {
  background-color: var(--modal-backdrop-bg);
}

  .job-search-redesign {
  }

  .card-header {
  }

  .card-body {
  }

  .step-number {
  }

  .job-cards-grid {
  }

  .table-responsive {
  }

  .action-buttons .btn {
  }
}

[data-theme="dark"] .step-number {
}

@media (prefers-reduced-motion: reduce) {
  .tab-pane {
    animation: none;
  }
}

.modal-backdrop {
  position: fixed;
  background: var(--modal-backdrop-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.studio-modal {
  max-width: var(--page-content-max-width);
  overflow-y: auto;
}

.studio-modal-heading {
  display: flex;
  align-items: center;
}

.studio-modal-logo {
  overflow: hidden;
  background: var(--glass-surface);
  display: flex;
  align-items: center;
  justify-content: center;
}

.studio-logo-img {
  object-fit: contain;
}

.studio-logo-fallback {
  color: var(--color-primary);
}

.overview-grid {
  display: grid;
}

.overview-item {
  display: flex;
  align-items: center;
  background: var(--glass-surface);
}

.item-label {
  color: var(--text-muted);
}

.item-value {
  color: var(--text-primary);
}

.info-section {
}

  color: var(--color-primary);
}

.culture-grid {
  display: grid;
}

  color: var(--text-primary);
}

.values-list,
.games-list,
.tech-list,
.roles-list {
  display: flex;
  flex-wrap: wrap;
}

.value-tag,
.game-tag,
.tech-tag,
.role-tag {
}

.value-tag {
  background: linear-gradient(
    var(--color-primary),
    var(--color-secondary)
  );
  color: var(--text-on-primary);
}

.game-tag {
  background: var(--glass-surface);
  color: var(--text-primary);
}

.tech-tag {
  background: linear-gradient(
  );
  color: var(--text-on-primary);
}

.role-tag {
  background: linear-gradient(
  );
  color: var(--text-on-primary);
}

.games-tech-grid {
  display: grid;
}

.games-section,
.tech-section {
}

  color: var(--text-primary);
}

@keyframes fadeIn {
  from {
  }
  to {
  }
}

  .studio-modal {
  }

  .games-tech-grid {
  }

  .culture-grid {
  }

  .overview-grid {
  }
}


.board-pins {
  @apply position-absolute;
  pointer-events: none;
}

.pin {
  @apply position-absolute;
}

}

}

}

@keyframes pinBounce {
  }
  }
}

.sam-max-quote {
  max-width: var(--page-narrow-width);
  position: relative;
  overflow: hidden;
}

.sam-max-quote::before {
  @apply position-absolute;
}

.quote-text {
  font-style: italic;
  color: rgba(var(--v-theme-primary));
}

.quote-author {
  text-align: right;
}

.easter-egg {
  cursor: pointer;
  transition: var(--transition-normal);
  position: relative;
}

.easter-egg:hover {
}

.easter-egg:active {
}

.the-board-container {
  background: rgba(var(--v-theme-background));
  position: relative;
}

.the-board-container::before {
  content: "";
  position: fixed;
  background:
    radial-gradient(
    ),
    radial-gradient(
    ),
    radial-gradient(
    );
  pointer-events: none;
}

.konami-activated {
}

.konami-activated .board-pins .pin {
}

@keyframes pinCrazy {
  }
  }
  }
  }
  }
}

.secret-reference {
  @apply position-absolute;
  color: rgba(var(--v-theme-primary));
  transition: opacity var(--duration-normal) var(--easing-ease);
  pointer-events: none;
}

.easter-egg:hover .secret-reference {
}

.btn-board-style {
  color: rgb(var(--v-theme-primary));
  font-family: inherit;
  text-transform: uppercase;
  transition: var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.btn-board-style::before {
  content: "";
  @apply position-absolute;
  background: linear-gradient(
    transparent,
    transparent
  );
  transition: left var(--duration-slow) var(--easing-ease);
}

.btn-board-style:hover::before {
}

.btn-board-style:hover {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

.max-tooltip {
  @apply position-absolute;
  color: rgb(var(--v-theme-primary));
  white-space: nowrap;
  transition: var(--transition-normal);
  pointer-events: none;
}

.max-tooltip.show {
}

.max-tooltip::after {
  content: "";
  @apply position-absolute;
}

  .sam-max-quote {
  }

  .quote-text {
  }

  .board-pins {
  }

  .btn-board-style {
  }
}

@media (prefers-reduced-motion: reduce) {
  .pin,
  .easter-egg:hover,
  .konami-activated {
    animation: none !important;
  }

  .easter-egg:hover {
    transform: none;
  }
}

@media (prefers-contrast: high) {
  .sam-max-quote {
    background: rgb(var(--v-theme-surface));
  }

  .quote-text {
    color: rgb(var(--v-theme-primary));
  }
}
</style>
