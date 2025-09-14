<template>
  <!-- eslint-disable -->
  <StandardPageLayout
    page-type="gaming"
    content-spacing="normal"
    max-width="xl"
    title="Interview Preparation"
    subtitle="Master your gaming industry interviews with AI-powered preparation and real-time feedback"
    :header-context="{
      sessions: completedInterviews,
      score: averageScore + '%',
      hours: practiceHours + 'h',
    }"
  >
    <template #header-actions>
      <UnifiedButton
        variant="primary"
        leading-icon="mdi-play-circle"
        @click="startQuickInterview"
      >
        Start Interview
      </UnifiedButton>
      <UnifiedButton
        variant="glass"
        leading-icon="mdi-brain"
        @click="generateQuestions"
      >
        Generate Questions
      </UnifiedButton>
    </template>

    <!-- Step navigation -->
    <div class="unified-container">
      <GlassNavTabs
        v-model:activeTab="activeStep"
        :tabs="stepTabs"
        aria-label="Interview Steps"
      />
    </div>

    <div class="prep-layout">
      <!-- Interview Prep Overview - Now First Step -->
      <Card
        v-show="activeStep === 'overview'"
        variant="glass"
        class="section-card"
      >
        <div class="section-header">
          <h3 class="panel-title">
            <AppIcon name="mdi-microphone-variant" />
            Interview Preparation Hub
          </h3>
          <p class="section-description">
            Master your gaming industry interviews with AI-powered preparation,
            personalized scenarios, and real-time feedback.
          </p>
        </div>

        <div class="prep-overview-grid section-body">
          <!-- Quick Start Actions -->
          <Card
            variant="glass"
            class="overview-actions-card enhanced-actions"
          >
            <div class="card-header">
              <div class="card-icon">
                <AppIcon name="mdi-rocket-launch" />
              </div>
              <h4 class="card-title">Quick Start</h4>
            </div>
            <p class="card-description">
              Jump into practice or customize your interview experience
            </p>
            <div class="action-buttons">
              <UnifiedButton
                color="gaming"
                size="lg"
                leading-icon="mdi-play-circle"
                @click="startQuickInterview"
                class="primary-action enhanced-btn"
              >
                Start Practice Interview
              </UnifiedButton>
              <div class="secondary-actions">
                <UnifiedButton
                  color="glass"
                  appearance="outlined"
                  leading-icon="mdi-brain"
                  @click="generateQuestions"
                  class="enhanced-btn"
                >
                  Generate Questions
                </UnifiedButton>
                <UnifiedButton
                  color="glass"
                  appearance="outlined"
                  leading-icon="mdi-account-tie"
                  @click="activeStep = 'persona'"
                  class="enhanced-btn"
                >
                  Create Persona
                </UnifiedButton>
              </div>
            </div>
          </Card>

          <!-- Progress & Stats -->
          <Card variant="glass" class="prep-stats-card enhanced-stats">
            <div class="card-header">
              <div class="card-icon stats-icon">
                <AppIcon name="mdi-chart-line" />
              </div>
              <h4 class="card-title">Your Progress</h4>
            </div>
            <div class="stats-grid">
              <div
                class="stat-item animated-stat"
                @mouseenter="animateStatValue"
              >
                <div
                  class="stat-value gradient-text"
                  :data-value="completedInterviews"
                >
                  {{ displayedCompletedInterviews }}
                </div>
                <div class="stat-label">Sessions Completed</div>
                <div class="stat-indicator"></div>
              </div>
              <div class="stat-item animated-stat">
                <div
                  class="stat-value gradient-text"
                  :data-value="averageScore"
                >
                  {{ displayedAverageScore }}%
                </div>
                <div class="stat-label">Average Score</div>
                <div class="stat-indicator"></div>
              </div>
              <div class="stat-item animated-stat">
                <div
                  class="stat-value gradient-text"
                  :data-value="practiceHours"
                >
                  {{ displayedPracticeHours }}h
                </div>
                <div class="stat-label">Practice Time</div>
                <div class="stat-indicator"></div>
              </div>
              <div class="stat-item animated-stat">
                <div
                  class="stat-value gradient-text"
                  :data-value="totalQuestionsMastered"
                >
                  {{ displayedQuestionsMastered }}
                </div>
                <div class="stat-label">Questions Mastered</div>
                <div class="stat-indicator"></div>
              </div>
            </div>
          </Card>

          <!-- Recent Context -->
          <Card v-if="jobContext" variant="glass" class="context-card">
            <h4 class="card-title">
              <AppIcon name="mdi-briefcase-search" />
              Job Context Detected
            </h4>
            <div class="context-details">
              <div class="context-job">
                <h5>{{ jobContext.jobTitle }}</h5>
                <p class="company">{{ jobContext.company }}</p>
                <div class="context-skills">
                  <span
                    v-for="skill in jobContext.skills?.slice(0, 5)"
                    :key="skill"
                    class="skill-tag"
                  >
                    {{ skill }}
                  </span>
                </div>
              </div>
              <UnifiedButton
                color="gaming"
                size="sm"
                leading-icon="mdi-target"
                @click="useJobContext"
              >
                Prep for This Role
              </UnifiedButton>
            </div>
          </Card>
        </div>

        <!-- Navigation Tip -->
        <div class="prep-flow-tip">
          <AppIcon name="mdi-lightbulb" />
          <span>
            <strong>Pro Tip:</strong> Use "Target Studio" to select your
            company, "Interview Persona" to customize the interviewer style, and
            "Session Setup" to fine-tune difficulty and question types.
          </span>
        </div>
      </Card>

      <!-- Studio selection -->
      <Card
        v-show="activeStep === 'studio'"
        variant="glass"
        class="section-card"
      >
        <div class="section-header">
          <h3 class="panel-title">
            <AppIcon name="mdi-office-building" /> Target Studio
          </h3>
        </div>
        <div class="studio-search section-body">
          <MuiTextField
            :model-value="studioQuery"
            placeholder="Search studios (e.g. Riot, Epic, Ubisoft)"
            variant="outlined"
            size="medium"
            full-width
            start-adornment="mdi-magnify"
            @update:model-value="onStudioQuery"
          />
        </div>

        <!-- Studio Filters -->
        <div v-if="!studioQuery.trim()" class="studio-filters section-body">
          <div class="filter-row">
            <select
              v-model="studioTypeFilter"
              class="form-select glass-input small-select"
              title="Studio type"
            >
              <option value="">All Types</option>
              <option value="AAA">AAA Studios</option>
              <option value="Indie">Indie Studios</option>
              <option value="Mobile">Mobile Studios</option>
              <option value="Platform">Platform Companies</option>
            </select>
            <select
              v-model="studioLocationFilter"
              class="form-select glass-input small-select"
              title="Location"
            >
              <option value="">All Locations</option>
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="France">France</option>
              <option value="Japan">Japan</option>
            </select>
            <UnifiedButton
              color="glass"
              appearance="outlined"
              size="sm"
              leading-icon="mdi-sync"
              @click="clearStudioFilters"
            >
              Clear
            </UnifiedButton>
          </div>

          <!-- Quick filter chips (like Jobs section) -->
          <div class="filter-chips">
            <div class="chip-group" aria-label="Studio type quick filters">
              <button
                class="chip-btn"
                :class="{ active: !studioTypeFilter }"
                :aria-pressed="!studioTypeFilter"
                @click="studioTypeFilter = ''"
              >
                All
              </button>
              <button
                class="chip-btn"
                :class="{ active: studioTypeFilter === 'AAA' }"
                :aria-pressed="studioTypeFilter === 'AAA'"
                @click="studioTypeFilter = 'AAA'"
              >
                AAA
              </button>
              <button
                class="chip-btn"
                :class="{ active: studioTypeFilter === 'Indie' }"
                :aria-pressed="studioTypeFilter === 'Indie'"
                @click="studioTypeFilter = 'Indie'"
              >
                Indie
              </button>
              <button
                class="chip-btn"
                :class="{ active: studioTypeFilter === 'Mobile' }"
                :aria-pressed="studioTypeFilter === 'Mobile'"
                @click="studioTypeFilter = 'Mobile'"
              >
                Mobile
              </button>
              <button
                class="chip-btn"
                :class="{ active: studioTypeFilter === 'Platform' }"
                :aria-pressed="studioTypeFilter === 'Platform'"
                @click="studioTypeFilter = 'Platform'"
              >
                Platform
              </button>
            </div>
            <div class="chip-group" aria-label="Location quick filters">
              <button
                class="chip-btn"
                :class="{ active: !studioLocationFilter }"
                :aria-pressed="!studioLocationFilter"
                @click="studioLocationFilter = ''"
              >
                All
              </button>
              <button
                class="chip-btn"
                :class="{ active: studioLocationFilter === 'United States' }"
                :aria-pressed="studioLocationFilter === 'United States'"
                @click="studioLocationFilter = 'United States'"
              >
                US
              </button>
              <button
                class="chip-btn"
                :class="{ active: studioLocationFilter === 'Canada' }"
                :aria-pressed="studioLocationFilter === 'Canada'"
                @click="studioLocationFilter = 'Canada'"
              >
                Canada
              </button>
              <button
                class="chip-btn"
                :class="{ active: studioLocationFilter === 'United Kingdom' }"
                :aria-pressed="studioLocationFilter === 'United Kingdom'"
                @click="studioLocationFilter = 'United Kingdom'"
              >
                UK
              </button>
              <button
                class="chip-btn"
                :class="{ active: studioLocationFilter === 'France' }"
                :aria-pressed="studioLocationFilter === 'France'"
                @click="studioLocationFilter = 'France'"
              >
                France
              </button>
              <button
                class="chip-btn"
                :class="{ active: studioLocationFilter === 'Japan' }"
                :aria-pressed="studioLocationFilter === 'Japan'"
                @click="studioLocationFilter = 'Japan'"
              >
                Japan
              </button>
            </div>
          </div>
        </div>

        <!-- Search Results -->
        <div
          v-if="studioQuery.trim() && studioSuggestions.length"
          class="studio-suggestions glass-list"
        >
          <div class="section-header">Search Results</div>
          <div
            v-for="s in studioSuggestions"
            :key="s.id"
            class="studio-suggestion-card section-card section-card interactive-hover glass-list-item"
            :class="{ selected: selectedStudio?.id === s.id }"
            @click="selectStudio(s)"
          >
            <div class="s-logo">
              <img
                v-if="s.logo"
                :src="s.logo"
                :alt="s.name"
                @error="onImgErr"
              />
              <div v-else class="s-logo-fallback">{{ s.name.charAt(0) }}</div>
            </div>
            <div class="s-info">
              <div class="s-name">{{ s.name }}</div>
              <div class="s-meta">
                <span>{{ s.headquarters || s.location }}</span>
                <span v-if="s.type">• {{ s.type }}</span>
              </div>
            </div>
            <div class="s-choose">
              <UnifiedButton
                color="glass"
                appearance="outlined"
                size="sm"
                @click.stop="selectStudio(s)"
                >Choose</UnifiedButton
              >
            </div>
          </div>
        </div>

        <!-- All Studios List (when not searching) -->
        <div v-else-if="!studioQuery.trim()" class="studio-list">
          <div class="section-header">
            All Studios
            <span class="count">({{ filteredAllStudios.length }})</span>
          </div>
          <div class="studio-suggestions glass-list">
            <div
              v-for="s in filteredAllStudios.slice(
                0,
                showAllStudios ? filteredAllStudios.length : 20,
              )"
              :key="s.id"
              class="studio-suggestion-card section-card section-card interactive-hover glass-list-item"
              :class="{ selected: selectedStudio?.id === s.id }"
              @click="selectStudio(s)"
            >
              <div class="s-logo">
                <img
                  v-if="s.logo"
                  :src="s.logo"
                  :alt="s.name"
                  @error="onImgErr"
                />
                <div v-else class="s-logo-fallback">{{ s.name.charAt(0) }}</div>
              </div>
              <div class="s-info">
                <div class="s-name">{{ s.name }}</div>
                <div class="s-meta">
                  <span>{{ s.headquarters || s.location }}</span>
                  <span v-if="s.type || s.category"
                    >• {{ s.type || s.category }}</span
                  >
                </div>
              </div>
              <div class="s-choose">
                <UnifiedButton
                  color="glass"
                  appearance="outlined"
                  size="sm"
                  @click.stop="selectStudio(s)"
                  >Choose</UnifiedButton
                >
              </div>
            </div>
          </div>

          <div
            v-if="filteredAllStudios.length > 20 && !showAllStudios"
            class="show-more"
          >
            <UnifiedButton
              color="glass"
              appearance="outlined"
              @click="showAllStudios = true"
            >
              Show All {{ filteredAllStudios.length }} Studios
            </UnifiedButton>
          </div>
        </div>

        <div v-if="favoriteStudios.length" class="favorites">
          <div class="favorites-title">Favorites</div>
          <div class="favorites-grid">
            <button
              v-for="fav in favoriteStudios"
              :key="fav.id"
              class="fav-chip"
              :class="{ active: selectedStudio?.id === fav.id }"
              @click="selectStudio(fav)"
            >
              {{ fav.name }}
            </button>
          </div>
        </div>
      </Card>

      <!-- Persona + config -->
      <Card
        v-show="activeStep !== 'studio'"
        variant="glass"
        class="section-card"
      >
        <!-- Overview (sticky) -->
        <div class="side-overview sticky">
          <div class="sr-only" role="status" aria-live="polite">
            Step {{ stepIndex(activeStep) + 1 }} of {{ steps.length }} ({{
              stepProgress
            }}%)
          </div>
          <div class="overview-header">
            <div class="overview-title">
              <AppIcon name="mdi-clipboard-text-outline" />
              Prep Overview
            </div>
            <div
              class="overview-progress"
              role="progressbar"
              :aria-valuemin="0"
              :aria-valuemax="100"
              :aria-valuenow="stepProgress"
            >
              <div class="progress progress--sm">
                <div
                  class="progress-bar"
                  :style="{ width: stepProgress + '%' }"
                ></div>
              </div>
              <span class="progress-text"
                >Step {{ stepIndex(activeStep) + 1 }} / {{ steps.length }}</span
              >
            </div>
          </div>

          <div class="overview-grid">
            <div class="ov-row">
              <span class="ov-label">Studio</span>
              <span class="ov-value">{{
                selectedStudio?.name || "Any / Practice"
              }}</span>
            </div>
            <div class="ov-row">
              <span class="ov-label">Persona</span>
              <span class="ov-value">{{
                selectedPersona?.name || "Select a persona"
              }}</span>
            </div>
            <div class="ov-row">
              <span class="ov-label">Role</span>
              <span class="ov-value"
                >{{ roleType || "Choose role" }} ({{ experienceLevel }})</span
              >
            </div>
            <div class="ov-row">
              <span class="ov-label">Questions</span>
              <span class="ov-value"
                >{{ questionCount }} • {{ duration }} min</span
              >
            </div>
            <div class="ov-row">
              <span class="ov-label">Focus</span>
              <span class="ov-value">
                <span v-if="includeBehavioral">Behavioral</span>
                <span v-if="includeTechnical"
                  >{{ includeBehavioral ? " • " : "" }}Technical</span
                >
                <span v-if="includeStudioSpecific"
                  >{{
                    includeBehavioral || includeTechnical ? " • " : ""
                  }}Studio</span
                >
              </span>
            </div>
          </div>

          <div class="overview-actions">
            <UnifiedButton
              color="glass"
              appearance="outlined"
              leading-icon="mdi-arrow-left"
              size="sm"
              :disabled="activeStep === 'overview'"
              @click="goBack"
              >Back (←/B)</UnifiedButton
            >
            <div class="spacer"></div>
            <template v-if="activeStep !== 'settings'">
              <UnifiedButton
                color="gaming"
                trailing-icon="mdi-arrow-right"
                size="sm"
                @click="goNext"
                >Next (→/N)</UnifiedButton
              >
            </template>
            <template v-else>
              <UnifiedButton
                color="gaming"
                leading-icon="mdi-microphone"
                size="sm"
                :disabled="!selectedPersona || !roleType"
                :loading="starting"
                @click="beginInterview"
                >Start (Enter)</UnifiedButton
              >
            </template>
          </div>
        </div>
        <div class="panel-header d-flex align-center justify-between">
          <h3 class="panel-title">
            <AppIcon name="mdi-tie" /> Interview Persona
          </h3>
          <div class="d-flex gap-2">
            <UnifiedButton
              color="glass"
              appearance="outlined"
              leading-icon="mdi-dice-6"
              @click="randomizePersona"
              >Surprise Me</UnifiedButton
            >
            <UnifiedButton
              ref="aiPersonaBtn"
              color="gaming"
              :loading="aiPersonaLoading"
              leading-icon="mdi-robot"
              @click="aiRecommendPersona"
              >AI Persona</UnifiedButton
            >
            <UnifiedButton
              v-if="lastUsedConfig"
              color="glass"
              appearance="outlined"
              size="sm"
              leading-icon="🔄"
              @click="restoreLastUsed"
            >
              Restore Last Used
            </UnifiedButton>
            <UnifiedButton
              color="glass"
              appearance="outlined"
              size="sm"
              leading-icon="mdi-backup-restore"
              @click="resetInterviewPrep"
            >
              Reset
            </UnifiedButton>
          </div>
        </div>
        <div
          v-if="
            autoAppliedLastUsed && selectedPersona?.id === lastUsedPersonaId
          "
          class="mini-note"
        >
          Using last used persona
        </div>
        <div v-show="activeStep === 'persona'" class="mini-note">
          Tip: Use “AI Persona” for a role-tailored interviewer profile, or
          “Surprise Me” to explore different styles.
        </div>
        <div
          v-show="activeStep === 'persona' || activeStep === 'settings'"
          class="persona-grid"
        >
          <div
            v-for="p in personas"
            :key="p.id"
            class="persona-card section-card section-card interactive-hover"
            :class="{ selected: selectedPersona?.id === p.id }"
            @click="selectPersona(p)"
          >
            <div class="persona-header">
              <AppIcon :name="p.icon || '👤'" class="persona-icon" />
              <div class="persona-name">{{ p.name }}</div>
            </div>
            <div v-if="recommendedPersonaId === p.id" class="persona-badge">
              AI Recommended
            </div>
            <div
              v-else-if="lastUsedPersonaId === p.id"
              class="persona-badge persona-badge-muted"
            >
              Last Used
            </div>
            <div
              v-else-if="p.isStudioSpecific"
              class="persona-badge persona-badge-studio"
            >
              {{ p.studioName }} Specific
            </div>
            <div
              v-else-if="p.isCustom"
              class="persona-badge persona-badge-custom"
            >
              Custom AI
            </div>
            <div class="persona-desc">{{ p.description }}</div>
            <div class="persona-tags">
              <span v-for="t in p.focusAreas" :key="t" class="tag">{{
                t
              }}</span>
            </div>
          </div>
        </div>

        <h3 v-show="activeStep === 'settings'" class="panel-title mt-lg">
          <AppIcon name="mdi-tune-variant" /> Session Settings
        </h3>
        <div v-show="activeStep === 'settings'" class="settings-grid">
          <MuiTextField
            v-model="roleType"
            label="Target Role"
            placeholder="e.g., Gameplay Engineer, Technical Artist, Producer"
            variant="outlined"
            full-width
          />
          <div>
            <label class="form-label">Experience Level</label>
            <select v-model="experienceLevel" class="form-select glass-input">
              <option value="junior">Junior</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
              <option value="principal">Principal</option>
            </select>
          </div>
          <div>
            <label class="form-label">Question Count</label>
            <select
              v-model.number="questionCount"
              class="form-select glass-input"
            >
              <option :value="5">5</option>
              <option :value="8">8</option>
              <option :value="10">10</option>
            </select>
          </div>
          <div>
            <label class="form-label">Duration (min)</label>
            <select v-model.number="duration" class="form-select glass-input">
              <option :value="20">20</option>
              <option :value="30">30</option>
              <option :value="45">45</option>
            </select>
          </div>
        </div>

        <div v-show="activeStep === 'settings'" class="toggles">
          <label class="toggle-item">
            <input v-model="includeBehavioral" type="checkbox" /> Behavioral
          </label>
          <label class="toggle-item">
            <input v-model="includeTechnical" type="checkbox" /> Technical
          </label>
          <label class="toggle-item">
            <input v-model="includeStudioSpecific" type="checkbox" />
            Studio-Specific
          </label>
        </div>

        <!-- Tips for settings -->
        <div v-show="activeStep === 'settings'" class="mini-note">
          Tip: Senior roles often target 10 questions and 45 minutes. Adjust
          based on the team’s interview rubric.
        </div>
      </Card>

      <!-- Recommendations & Recents -->
      <Card
        v-show="activeStep !== 'studio'"
        variant="glass"
        class="section-card"
      >
        <div class="panel-header d-flex align-center justify-between">
          <h3 class="panel-title">
            <AppIcon name="mdi-star" /> Recommended Studios
          </h3>
          <div class="d-flex gap-2 align-center">
            <select
              v-model="recBias"
              class="form-select glass-input small-select"
              title="Bias"
            >
              <option value="neutral">Neutral</option>
              <option value="AAA">AAA</option>
              <option value="Indie">Indie</option>
            </select>
            <UnifiedButton
              color="gaming"
              :loading="aiRecLoading"
              leading-icon="mdi-robot"
              @click="aiRecommendStudios"
              >AI Recommend</UnifiedButton
            >
          </div>
        </div>
        <div class="recommendations">
          <div
            v-for="rec in recommendedStudios"
            :key="rec.id"
            class="studio-suggestion-card section-card section-card interactive-hover"
            @click="selectStudio(rec)"
          >
            <div class="s-logo">
              <img
                v-if="rec.logo"
                :src="rec.logo"
                :alt="rec.name"
                @error="onImgErr"
              />
              <div v-else class="s-logo-fallback">{{ rec.name.charAt(0) }}</div>
            </div>
            <div class="s-info">
              <div class="s-name">{{ rec.name }}</div>
              <div class="s-meta">
                <span>{{ rec.headquarters || rec.location }}</span>
                <span v-if="rec.type">• {{ rec.type }}</span>
              </div>
            </div>
            <div class="s-choose">
              <UnifiedButton
                color="glass"
                appearance="outlined"
                size="sm"
                @click.stop="selectStudio(rec)"
                >Use</UnifiedButton
              >
            </div>
          </div>
        </div>

        <h3 class="panel-title mt-lg">
          <AppIcon name="mdi-clock-time-nine-outline" /> Recent Presets
        </h3>
        <div v-if="recentPresets.length" class="recents">
          <button
            v-for="r in recentPresets"
            :key="r.ts"
            class="fav-chip"
            @click="applyRecentPreset(r)"
          >
            {{ r.studioName || "General" }} • {{ r.personaName || "Persona" }} •
            {{ r.roleType }}
          </button>
        </div>
      </Card>

      <!-- Step actions -->
      <div class="step-actions">
        <UnifiedButton
          color="glass"
          appearance="outlined"
          leading-icon="mdi-arrow-left"
          :disabled="activeStep === 'overview'"
          @click="goBack"
          >Back (←/B)</UnifiedButton
        >
        <div class="spacer"></div>
        <template v-if="activeStep !== 'settings'">
          <UnifiedButton
            color="gaming"
            trailing-icon="mdi-arrow-right"
            @click="goNext"
            >Next (→/N)</UnifiedButton
          >
        </template>
        <template v-else>
          <UnifiedButton
            color="gaming"
            leading-icon="mdi-microphone"
            :disabled="!selectedPersona || !roleType"
            :loading="starting"
            @click="beginInterview"
            >Start Interview (Enter)</UnifiedButton
          >
        </template>
      </div>
    </div>

    <!-- AI Persona Preview Modal -->
    <div
      v-if="showPersonaPreview"
      class="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="AI Persona Preview"
      @keydown.capture="onModalKeydown"
      @click="dismissPersonaPreview"
    >
      <div class="modal-card" ref="modalEl" tabindex="-1" @click.stop>
        <div class="modal-header">
          <strong>AI Persona Preview</strong>
          <button class="close-btn" @click="dismissPersonaPreview">✕</button>
        </div>
        <div class="modal-body">
          <div class="pv-row">
            <span class="pv-label">Name</span
            ><span class="pv-value">{{ pendingPersonaSuggestion?.name }}</span>
          </div>
          <div class="pv-row">
            <span class="pv-label">Archetype</span
            ><span class="pv-value">{{
              pendingPersonaSuggestion?.archetype
            }}</span>
          </div>
          <div class="pv-row">
            <span class="pv-label">Tone</span
            ><span class="pv-value">{{ pendingPersonaSuggestion?.tone }}</span>
          </div>
          <div class="pv-row">
            <span class="pv-label">Style</span
            ><span class="pv-value">{{
              pendingPersonaSuggestion?.interviewStyle
            }}</span>
          </div>
          <div class="pv-row">
            <span class="pv-label">Focus Areas</span
            ><span class="pv-value">{{
              (pendingPersonaSuggestion?.focusAreas || []).join(", ")
            }}</span>
          </div>
          <div v-if="pendingPersonaSuggestion?.studioName" class="pv-row">
            <span class="pv-label">Studio</span
            ><span class="pv-value">{{
              pendingPersonaSuggestion.studioName
            }}</span>
          </div>
        </div>
        <div class="modal-actions">
          <UnifiedButton
            color="gaming"
            leading-icon="mdi-check"
            @click="acceptPersonaPreview"
            >Use This Persona</UnifiedButton
          >
          <UnifiedButton
            color="glass"
            appearance="outlined"
            leading-icon="mdi-close"
            @click="dismissPersonaPreview"
            >Dismiss</UnifiedButton
          >
        </div>
      </div>
    </div>
  </StandardPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';

import { usePageAssistantContext } from "@/composables/usePageAssistantContext";
import AppIcon from "@/components/ui/AppIcon.vue";

import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAppStore } from "@/stores/app";
import { toastSuccess, toastError } from "@/shared/services/toastService.ts";
import StandardPageLayout from "@/components/layout/StandardPageLayout.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import Card from "@/components/Card.vue";
import MuiTextField from "@/components/ui/MuiTextField.vue";
import GlassNavTabs from "@/components/GlassNavTabs.vue";
import { studioService } from "@/modules/studios/StudioService";
import aiInterviewService from "@/services/AIInterviewService";
import { aiService } from "@/shared/services/AIService";
import { unifiedStorage } from "@/utils/storage";
import { useToast } from "@/composables/useToast";

const _router = useRouter();
const route = useRoute();
const store = useAppStore();
const { info: toastInfo, error: _toastError } = useToast();

// Persona type accommodates optional studio-specific attributes added at runtime
type Persona = {
  id: string;
  name: string;
  icon: string;
  description: string;
  tone: string;
  focusAreas: string[];
  archetype: string;
  studioTypes: string[];
  isStudioSpecific?: boolean;
  studioName?: string;
  isCustom?: boolean;
  interviewStyle?: string;
  studioValues?: string[];
};

// Studio search/selection
const studioQuery = ref("");
const studioSuggestions = ref<any[]>([]);
const selectedStudio = ref<any | null>(null);
const favoriteStudios = ref<any[]>([]);
const allStudios = ref<any[]>([]);
const studioTypeFilter = ref("");
const studioLocationFilter = ref("");
const showAllStudios = ref(false);
const localTheme = ref("auto");
let searchTimer: any = null;

function onStudioQuery(val: string) {
  studioQuery.value = val;
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(async () => {
    if (!studioQuery.value.trim()) {
      studioSuggestions.value = [];
      return;
    }
    try {
      studioSuggestions.value = await studioService.getSuggestions(
        studioQuery.value,
        8,
      );
    } catch {}
  }, 250);
}

function selectStudio(s: any) {
  selectedStudio.value = s;
  // Auto-update personas and recommendations when studio is selected
  updateStudioSpecificPersonas();
  updateStudioRecommendations();
}

function selectPersona(p: any) {
  selectedPersona.value = p;
  if (recommendedPersonaId.value && recommendedPersonaId.value !== p.id) {
    recommendedPersonaId.value = null;
  }
}

function onImgErr(e: Event) {
  (e.target as HTMLImageElement).style.display = "none";
}

function clearStudioFilters() {
  studioTypeFilter.value = "";
  studioLocationFilter.value = "";
  showAllStudios.value = false;
}

// Base persona templates - will be dynamically enhanced based on studio selection
const basePersonas: Persona[] = [
  {
    id: "aaa-gameplay",
    name: "AAA Gameplay Engineer",
    icon: "mdi-gamepad-variant",
    description:
      "Focus on systems, performance, and cross-discipline collaboration at scale.",
    tone: "direct and technical",
    focusAreas: ["systems", "performance", "C++", "cross-team"],
    archetype: "AAA Engineer",
    studioTypes: ["AAA"],
  },
  {
    id: "indie-creator",
    name: "Indie Studio Lead",
    icon: "mdi-hammer-wrench",
    description:
      "Explores creativity, rapid prototyping, and generalist skills.",
    tone: "collaborative and creative",
    focusAreas: ["prototyping", "design sensibility", "wearing many hats"],
    archetype: "Indie Lead",
    studioTypes: ["Indie"],
  },
  {
    id: "publisher-pm",
    name: "Publisher PM",
    icon: "mdi-bullhorn",
    description:
      "Product mindset with live ops, KPIs, and cross-studio coordination.",
    tone: "data-informed and pragmatic",
    focusAreas: ["live ops", "roadmaps", "metrics"],
    archetype: "Publisher PM",
    studioTypes: ["AAA", "Platform"],
  },
  {
    id: "mobile-f2p",
    name: "Mobile F2P",
    icon: "mdi-cellphone",
    description: "Economy design, monetization, and UA for mobile games.",
    tone: "user-centric and analytical",
    focusAreas: ["economy", "A/B tests", "monetization"],
    archetype: "Mobile F2P",
    studioTypes: ["Mobile"],
  },
  {
    id: "esports-ops",
    name: "Esports Ops",
    icon: "mdi-trophy",
    description:
      "Community, competitive ops, and broadcast production elements.",
    tone: "community-forward",
    focusAreas: ["events", "community", "broadcast"],
    archetype: "Esports Ops",
    studioTypes: ["Esports"],
  },
  {
    id: "technical-lead",
    name: "Technical Lead",
    icon: "mdi-cog",
    description:
      "Deep technical assessment with architecture and performance focus.",
    tone: "analytical and thorough",
    focusAreas: ["architecture", "scalability", "team leadership"],
    archetype: "Tech Lead",
    studioTypes: ["AAA", "Platform"],
  },
  {
    id: "creative-director",
    name: "Creative Director",
    icon: "mdi-palette",
    description:
      "Vision-focused interviewer assessing creative thinking and innovation.",
    tone: "inspiring and visionary",
    focusAreas: ["creativity", "vision", "player experience"],
    archetype: "Creative Director",
    studioTypes: ["AAA", "Indie"],
  },
];

// Dynamic personas list that updates based on studio selection
const personas = ref<Persona[]>([...basePersonas]);

const selectedPersona = ref<Persona | null>(null);
const recommendedPersonaId = ref<string | null>(null);
const lastUsedPersonaId = ref<string | null>(null);
const lastUsedConfig = ref<any | null>(null);
const autoAppliedLastUsed = ref(false);

// Persona preview modal state (placed early to avoid TDZ issues in any watches/computed)
const showPersonaPreview = ref(false);
const pendingPersonaSuggestion = ref<any | null>(null);

// Session config
const roleType = ref("");
const experienceLevel = ref<"junior" | "mid" | "senior" | "principal">("mid");
const questionCount = ref(8);
const duration = ref(30);
const includeBehavioral = ref(true);
const includeTechnical = ref(true);
const includeStudioSpecific = ref(true);

const starting = ref(false);
const recommendedStudios = ref<any[]>([]);
const aiRecLoading = ref(false);
const aiPersonaLoading = ref(false);
const recBias = ref<"neutral" | "AAA" | "Indie">("neutral");
const recentPresets = ref<any[]>([]);
const userKey = computed(
  () =>
    (store.user?.personalInfo?.email ||
      (store.user as any)?.email ||
      (store.user as any)?.id ||
      "default") as string,
);

// Interview Prep Overview Data
const jobContext = ref<any>(null);
const completedInterviews = computed(() => {
  const sessions = (store.user as any)?.interviewSessions || [];
  return Array.isArray(sessions) ? sessions.length : 0;
});
const averageScore = computed(() => {
  const sessions = (store.user as any)?.interviewSessions || [];
  if (!Array.isArray(sessions) || sessions.length === 0) return 0;
  const scores = sessions.filter((s) => s.score).map((s) => s.score);
  return scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;
});
const practiceHours = computed(() => {
  const sessions = (store.user as any)?.interviewSessions || [];
  if (!Array.isArray(sessions)) return 0;
  return Math.round(
    sessions.reduce((total, session) => total + (session.duration || 0), 0) /
      3600,
  ); // Convert seconds to hours
});

const totalQuestionsMastered = computed(() => {
  const sessions = (store.user as any)?.interviewSessions || [];
  if (!Array.isArray(sessions)) return 0;
  return sessions.reduce(
    (total, session) => total + (session.questionsAnswered || 0),
    0,
  );
});

// Animated stat values for smooth transitions
const displayedCompletedInterviews = ref(0);
const displayedAverageScore = ref(0);
const displayedPracticeHours = ref(0);
const displayedQuestionsMastered = ref(0);

// Animate stats on mount
const animateStatValue = () => {
  // Optional animation trigger for hover effects
};

const animateStatValuesOnMount = () => {
  // Animate completed interviews
  const targetInterviews = completedInterviews.value;
  let currentInterviews = 0;
  const interviewInterval = setInterval(() => {
    if (currentInterviews < targetInterviews) {
      currentInterviews++;
      displayedCompletedInterviews.value = currentInterviews;
    } else {
      clearInterval(interviewInterval);
    }
  }, 100);

  // Animate average score
  const targetScore = averageScore.value;
  let currentScore = 0;
  const scoreInterval = setInterval(() => {
    if (currentScore < targetScore) {
      currentScore += Math.ceil(targetScore / 20);
      if (currentScore > targetScore) currentScore = targetScore;
      displayedAverageScore.value = currentScore;
    } else {
      clearInterval(scoreInterval);
    }
  }, 50);

  // Animate practice hours
  const targetHours = practiceHours.value;
  let currentHours = 0;
  const hoursInterval = setInterval(() => {
    if (currentHours < targetHours) {
      currentHours++;
      displayedPracticeHours.value = currentHours;
    } else {
      clearInterval(hoursInterval);
    }
  }, 150);

  // Animate questions mastered
  const targetQuestions = totalQuestionsMastered.value;
  let currentQuestions = 0;
  const questionsInterval = setInterval(() => {
    if (currentQuestions < targetQuestions) {
      currentQuestions += Math.ceil(targetQuestions / 15);
      if (currentQuestions > targetQuestions)
        currentQuestions = targetQuestions;
      displayedQuestionsMastered.value = currentQuestions;
    } else {
      clearInterval(questionsInterval);
    }
  }, 80);
};

const _lastSessions = computed(() => {
  const sessions = (store.user as any)?.interviewSessions || [];
  if (Array.isArray(sessions) && sessions.length) {
    const items = sessions
      .slice(-5)
      .reverse()
      .map((s: any) => ({
        id: s.id,
        studioName: s.studioName || s.studio,
        roleType: s.role || s.roleType,
        experienceLevel: s.experienceLevel || "mid",
        date: s.date || s.createdAt || Date.now(),
      }));
    return items;
  }
  // Fallback to recent presets
  return (recentPresets.value || []).slice(0, 5);
});

// Filtered studios based on type and location filters
const filteredAllStudios = computed(() => {
  let filtered = [...allStudios.value];

  if (studioTypeFilter.value) {
    filtered = filtered.filter((studio) => {
      const type = (studio.type || studio.category || "").toLowerCase();
      return type === studioTypeFilter.value.toLowerCase();
    });
  }

  if (studioLocationFilter.value) {
    filtered = filtered.filter((studio) => {
      const headquarters = (studio.headquarters || "").toLowerCase();
      const location = (studio.location || "").toLowerCase();
      const filterLoc = studioLocationFilter.value.toLowerCase();
      return headquarters.includes(filterLoc) || location.includes(filterLoc);
    });
  }

  return filtered.sort((a, b) => a.name.localeCompare(b.name));
});

// Enhanced Step navigation - Interview Prep first
type StepKey = "overview" | "studio" | "persona" | "settings";
const stepTabs = [
  {
    key: "overview",
    label: "Interview Prep",
    icon: "mdi-microphone-variant",
    shortLabel: "Prep",
  },
  {
    key: "studio",
    label: "Target Studio",
    icon: "mdi-office-building",
    shortLabel: "Studio",
  },
  {
    key: "persona",
    label: "Interview Persona",
    icon: "mdi-account",
    shortLabel: "Persona",
  },
  {
    key: "settings",
    label: "Session Setup",
    icon: "mdi-tune-variant",
    shortLabel: "Setup",
  },
];
const activeStep = ref<StepKey>("overview");

const steps: StepKey[] = ["overview", "studio", "persona", "settings"];
const stepIndex = (s: StepKey) => steps.indexOf(s);
const stepProgress = computed(() =>
  Math.round(((stepIndex(activeStep.value) + 1) / steps.length) * 100),
);

const canProceedFrom = (s: StepKey) => {
  if (s === "overview") return true; // always can proceed from overview
  if (s === "studio") return true; // optional
  if (s === "persona") return !!selectedPersona.value;
  if (s === "settings") return !!roleType.value;
  return false;
};

// Interview Prep Overview Actions
const startQuickInterview = () => {
  // Quick start with default settings
  if (!selectedStudio.value) {
    // Select a random popular gaming studio for quick start
    const popularStudios = [
      "Riot Games",
      "Epic Games",
      "Blizzard Entertainment",
      "Valve",
      "Nintendo",
    ];
    const randomStudio =
      popularStudios[Math.floor(Math.random() * popularStudios.length)];
    const studioMatch = allStudios.value.find((s) =>
      s.name.includes(randomStudio),
    );
    if (studioMatch) selectedStudio.value = studioMatch;
  }

  // Navigate directly to interview session
  router.push("/interview-session");
};

const generateQuestions = async () => {
  try {
    // Generate context-aware questions
    const context = jobContext.value || {
      jobTitle: "Game Developer",
      company: selectedStudio.value?.name || "Gaming Studio",
      skills: ["Unity", "C#", "Game Design"],
    };

    // Store context and navigate to interview session with question generation
    sessionStorage.setItem(
      "interviewContext",
      JSON.stringify({
        ...context,
        generateQuestions: true,
        mode: "questions-only",
      }),
    );

    toastInfo("Generating personalized interview questions...");
    router.push("/interview-session");
  } catch {
    toastError("Failed to generate questions");
  }
};

const useJobContext = () => {
  if (jobContext.value) {
    // Auto-select studio if it matches
    const studioMatch = allStudios.value.find(
      (s) =>
        s.name.toLowerCase().includes(jobContext.value.company.toLowerCase()) ||
        jobContext.value.company.toLowerCase().includes(s.name.toLowerCase()),
    );

    if (studioMatch) {
      selectedStudio.value = studioMatch;
      toastSuccess(`Selected ${studioMatch.name} for interview prep`);
    }

    // Move to persona step to customize interview
    activeStep.value = "persona";
  }
};

function goNext() {
  const idx = stepIndex(activeStep.value);
  if (idx === steps.length - 1) return;
  const cur = steps[idx];
  if (!canProceedFrom(cur)) {
    toastInfo("Complete required fields to continue");
    return;
  }
  activeStep.value = steps[idx + 1];
}

function goBack() {
  const idx = stepIndex(activeStep.value);
  if (idx <= 0) return;
  activeStep.value = steps[idx - 1];
}

// Guard tab clicks from skipping ahead
watch(activeStep, (to, from) => {
  const toIdx = stepIndex(to);
  const fromIdx = stepIndex(from as StepKey);
  if (toIdx > fromIdx) {
    // moving forward: validate current step
    if (!canProceedFrom(from as StepKey)) {
      toastInfo("Complete required fields to continue");
      activeStep.value = from as StepKey;
      return;
    }
  }
});

// Keyboard shortcuts for navigation
function onKeydown(e: KeyboardEvent) {
  const tag =
    e.target && (e.target as HTMLElement).tagName
      ? String((e.target as HTMLElement).tagName).toLowerCase()
      : "";
  const typing = tag === "input" || tag === "textarea" || tag === "select";
  if (typing) return;
  const k = e.key?.toLowerCase();
  if (k === "arrowright" || k === "n") {
    e.preventDefault();
    goNext();
  } else if (k === "arrowleft" || k === "b") {
    e.preventDefault();
    goBack();
  } else if (k === "r") {
    e.preventDefault();
    resetInterviewPrep();
  } else if (k === "enter") {
    if (
      activeStep.value === "settings" &&
      selectedPersona.value &&
      roleType.value &&
      !starting.value
    ) {
      e.preventDefault();
      beginInterview();
    }
  } else if (k >= "1" && k <= "4") {
    // Allow quick step access without skipping validation forward
    const idx = Number(k) - 1;
    const currentIdx = stepIndex(activeStep.value);
    if (idx <= currentIdx) {
      activeStep.value = steps[idx];
    } else {
      // trying to jump forward: validate
      if (canProceedFrom(activeStep.value)) activeStep.value = steps[idx];
      else toastInfo("Complete required fields to continue");
    }
  }
}

async function beginInterview() {
  if (!selectedPersona.value || !roleType.value) return;
  starting.value = true;
  try {
    const config = {
      type: selectedStudio.value ? "studio" : "practice",
      studioId: selectedStudio.value?.id,
      studioName: selectedStudio.value?.name,
      roleType: roleType.value,
      experienceLevel: experienceLevel.value,
      duration: duration.value,
      questionCount: questionCount.value,
      includeBehavioral: includeBehavioral.value,
      includeTechnical: includeTechnical.value,
      includeStudioSpecific: includeStudioSpecific.value,
      persona: {
        id: selectedPersona.value.id,
        name: selectedPersona.value.name,
        archetype: selectedPersona.value.archetype,
        tone: selectedPersona.value.tone,
        focusAreas: selectedPersona.value.focusAreas,
        studioSpecific: selectedPersona.value.isStudioSpecific,
        studioName: selectedPersona.value.studioName,
        interviewStyle: selectedPersona.value.interviewStyle,
        studioValues: selectedPersona.value.studioValues,
      },
      // Enhanced studio context for AI question generation
      studioContext: selectedStudio.value
        ? {
            name: selectedStudio.value.name,
            type: selectedStudio.value.type || selectedStudio.value.category,
            location:
              selectedStudio.value.headquarters ||
              selectedStudio.value.location,
            technologies: selectedStudio.value.technologies,
            gameGenres: selectedStudio.value.gameGenres,
            culture: selectedStudio.value.culture,
            size: selectedStudio.value.size,
            platforms: selectedStudio.value.platforms,
          }
        : null,
    };

    const result = await aiInterviewService.startInterviewSession(_config);
    if (result.success) {
      try {
        saveRecentPreset(_config);
      } catch {}
      try {
        saveLastUsed(_config);
        lastUsedPersonaId.value = config.persona?.id || null;
      } catch {}
      router.push(`/interview-session/${result.session.id}`);
    }
  } finally {
    starting.value = false;
  }
}

function randomizePersona() {
  const pool = personas.value;
  selectedPersona.value = pool[Math.floor(Math.random() * pool.length)];
}

onMounted(async () => {
  try {
    localTheme.value = (store.settings?.theme as any) || "auto";
  } catch {}
  try {
    favoriteStudios.value = await studioService.getFavoriteStudios();
  } catch {}
  try {
    loadRecentPresets();
  } catch {}

  // Load job context from localStorage if available
  try {
    const storedContext = localStorage.getItem("interviewPrepContext");
    if (storedContext) {
      jobContext.value = JSON.parse(storedContext);
      // Clear the stored context after loading
      localStorage.removeItem("interviewPrepContext");
    }
  } catch (_error) {
    console.warn("Failed to load job context:", error);
  }
  try {
    await loadLastUsed();
  } catch {}
  try {
    await loadAllStudios();
  } catch {}
  try {
    await recomputeFallbackRecommendations();
  } catch {}
  try {
    window.addEventListener("keydown", onKeydown);
  } catch {}

  // Normalize: accept studio via query param (id or name) and optional mode
  try {
    const qs: any = route?.query || {};
    const studioParam = (qs.studio ? String(qs.studio) : "").trim();
    if (studioParam) {
      await studioService.initialize();
      let picked = await studioService.getStudioById(studioParam);
      if (!picked) {
        picked = await studioService.findStudioByName(studioParam);
      }
      if (picked) {
        selectedStudio.value = picked as any;
        try {
          toastInfo(`Loaded studio: ${picked.name}`);
        } catch {}
        // If a studio is preselected, advance to persona to streamline flow
        if (activeStep.value === "studio") activeStep.value = "persona";
      }
    }
    const mode = (qs.mode ? String(qs.mode) : "").toLowerCase();
    if (mode === "interview") {
      // Jump to settings when user intends to start interview quickly
      activeStep.value = "settings";
      try {
        toastInfo("Jumped to Start — review summary and press Start");
      } catch {}
    }

    // Optional deep-linking for role/level/persona
    const role = (qs.role ? String(qs.role) : "").trim();
    const level = (qs.level ? String(qs.level) : "").trim().toLowerCase();
    const personaId = (qs.persona ? String(qs.persona) : "").trim();
    if (role) roleType.value = role;
    if (["junior", "mid", "senior", "principal"].includes(level))
      experienceLevel.value = level as any;
    if (personaId) {
      const p = (personas.value as any[]).find((x) => x.id === personaId);
      if (p) selectedPersona.value = p;
    }
  } catch {}

  // Animate stats on page load
  setTimeout(() => {
    animateStatValuesOnMount();
  }, 500);
});

onUnmounted(() => {
  try {
    window.removeEventListener("keydown", onKeydown);
  } catch {}
});

// Assistant context integration
const { setPageContext, clearPageContext } = usePageAssistantContext();
const aiPersonaBtn = ref<HTMLElement | null>(null);
function pushAssistantContext() {
  setPageContext({
    page: "interview-prep",
    activeStep: activeStep.value,
    selectedStudio: selectedStudio.value
      ? { id: selectedStudio.value.id, name: selectedStudio.value.name }
      : null,
    selectedPersona: selectedPersona.value
      ? { id: selectedPersona.value.id, name: selectedPersona.value.name }
      : null,
    roleType: roleType.value,
    experienceLevel: experienceLevel.value,
    questionCount: questionCount.value,
    duration: duration.value,
    includeBehavioral: includeBehavioral.value,
    includeTechnical: includeTechnical.value,
    includeStudioSpecific: includeStudioSpecific.value,
    stepProgress: stepProgress.value,
    favoritesCount: favoriteStudios.value?.length || 0,
  });
}
onMounted(pushAssistantContext);
watch(
  [
    activeStep,
    selectedStudio,
    selectedPersona,
    () => roleType.value,
    () => experienceLevel.value,
    () => questionCount.value,
    () => duration.value,
    () => includeBehavioral.value,
    () => includeTechnical.value,
    () => includeStudioSpecific.value,
  ],
  pushAssistantContext,
);
onUnmounted(() => {
  clearPageContext();
});

const modalEl = ref<HTMLElement | null>(null);
watch(showPersonaPreview, async (open) => {
  if (open) {
    await nextTick();
    try {
      modalEl.value?.focus();
    } catch {}
  } else {
    await nextTick();
    try {
      aiPersonaBtn.value?.focus();
    } catch {}
  }
});

function getFocusable(el: HTMLElement | null): HTMLElement[] {
  if (!el) return [];
  const sel =
    'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
  return Array.from(el.querySelectorAll<HTMLElement>(sel)).filter(
    (_e) => !e.hasAttribute("disabled"),
  );
}

function onModalKeydown(e: KeyboardEvent) {
  if (!showPersonaPreview.value) return;
  const key = e.key?.toLowerCase();
  if (key === "escape") {
    e.stopPropagation();
    e.preventDefault();
    dismissPersonaPreview();
    return;
  }
  if (key !== "tab") return;
  const focusables = getFocusable(modalEl.value);
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement as HTMLElement | null;
  if (e.shiftKey) {
    if (active === first || !modalEl.value?.contains(active)) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (active === last || !modalEl.value?.contains(active)) {
      e.preventDefault();
      first.focus();
    }
  }
}

function buildShareLink() {
  try {
    const base =
      window.location.origin + window.location.pathname + "#/interview-prep";
    const params = new URLSearchParams();
    if (selectedStudio.value?.id) params.set("studio", selectedStudio.value.id);
    params.set("mode", "interview");
    if (roleType.value) params.set("role", roleType.value);
    if (experienceLevel.value)
      params.set("level", String(experienceLevel.value));
    if (selectedPersona.value?.id)
      params.set("persona", selectedPersona.value.id);
    return `${base}?${params.toString()}`;
  } catch {
    return "#/interview-prep";
  }
}

async function _copyShareLink() {
  const link = buildShareLink();
  try {
    await navigator.clipboard.writeText(link);
    toastInfo("Share link copied to clipboard");
  } catch {
    // Fallback via prompt
    try {
      window.prompt("Copy this link", link);
    } catch {}
  }
}

async function loadAllStudios() {
  try {
    // Initialize the studio service first
    await studioService.initialize();
    // Load all studios for the filterable list
    const result = await studioService.searchStudios({});
    allStudios.value = result.studios || [];
  } catch (_error) {
    console.warn("Failed to load all studios:", error);
    allStudios.value = [];
  }
}

function _saveCurrentPreset() {
  const cfg = {
    studioId: selectedStudio.value?.id,
    studioName: selectedStudio.value?.name,
    persona: selectedPersona.value
      ? {
          id: selectedPersona.value.id,
          name: selectedPersona.value.name,
        }
      : null,
    roleType: roleType.value,
    experienceLevel: experienceLevel.value,
  };
  saveRecentPreset({
    studioId: cfg.studioId,
    studioName: cfg.studioName,
    persona: cfg.persona,
    personaId: cfg.persona?.id,
    personaName: cfg.persona?.name,
    roleType: cfg.roleType,
    experienceLevel: cfg.experienceLevel,
  });
}

function saveRecentPreset(cfg: any) {
  const entry = {
    ts: Date.now(),
    studioId: cfg.studioId,
    studioName: cfg.studioName,
    personaId: cfg.persona?.id,
    personaName: cfg.persona?.name,
    roleType: cfg.roleType,
    experienceLevel: cfg.experienceLevel,
  };
  const key = "interview.presets." + userKey.value;
  const list = unifiedStorage.get(key) || [];
  const filtered = list.filter(
    (r: any) =>
      !(
        r.studioId === entry.studioId &&
        r.personaId === entry.personaId &&
        r.roleType === entry.roleType &&
        r.experienceLevel === entry.experienceLevel
      ),
  );
  filtered.unshift(entry);
  unifiedStorage.set(key, filtered.slice(0, 6));
  recentPresets.value = filtered.slice(0, 6);
}

async function loadRecentPresets() {
  const key = "interview.presets." + userKey.value;
  recentPresets.value = unifiedStorage.get(key) || [];
}

function applyRecentPreset(p: any) {
  roleType.value = p.roleType;
  experienceLevel.value = p.experienceLevel;
  selectedPersona.value =
    personas.value.find((x) => x.id === p.personaId) || null;
  if (p.studioId) {
    selectedStudio.value = { id: p.studioId, name: p.studioName };
  }
}

function _formatWhen(ts?: number | string): string {
  try {
    const d = typeof ts === "number" ? new Date(ts) : new Date(String(ts));
    return (
      d.toLocaleDateString() +
      " " +
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  } catch {
    return "";
  }
}

async function aiRecommendStudios() {
  aiRecLoading.value = true;
  try {
    try {
      // Initialize AI service with centralized API key resolver
      await aiService.initialize({
        primaryProvider: "google",
        enableContextPersistence: false,
      });
    } catch (_error) {
      const msg =
        error && typeof error === "object" && "message" in error
          ? (error as any).message
          : String(_error);
      console.warn("AI service initialization failed:", msg);
    }
    // Build context
    const all = await studioService.searchStudios({});
    const available = all.studios.slice(0, 80); // limit context size for prompt only
    const persona = selectedPersona.value;
    const favorites = favoriteStudios.value.map((s) => s.name).slice(0, 8);
    const contextParts = [
      `Role: ${roleType.value || "Generalist"}`,
      `Experience: ${experienceLevel.value}`,
      `Persona: ${persona ? persona.name : "General"}`,
      `Archetype: ${persona?.archetype || ""}`,
      `Tone: ${persona?.tone || ""}`,
      `Focus: ${(persona?.focusAreas || []).join(", ")}`,
      favorites.length ? `Favorites: ${favorites.join(", ")}` : "",
    ].filter(Boolean);
    if (recBias.value !== "neutral") {
      contextParts.push(`Preference: ${recBias.value}`);
    }
    const systemMsg = `Recommend 5 real game studios that fit the user context below. Respond with a simple JSON array of studio names (strings) only.`;
    const availableList = `Available studios: ${available.map((s) => `${s.name} (${(s as any).type || "Unknown"}, ${s.headquarters || (s as any).location || "Unknown"})`).join("; ")}`;
    const prompt = `${systemMsg}\n\nContext: ${contextParts.join(" • ")}\n\n${availableList}`;
    // Cache key
    const cacheKey = computeStudioCacheKey(
      roleType.value,
      experienceLevel.value,
      selectedPersona.value?.id,
      favoriteStudios.value,
    );
    const cached = getCachedStudios(cacheKey);
    if (cached) {
      recommendedStudios.value = matchNamesToStudios(cached, all.studios);
      aiRecLoading.value = false;
      return;
    }

    const res = await aiService.chat({
      message: prompt,
      type: "analysis",
      metadata: { feature: "interview-prep-studio-recs" },
    });
    const names = parseRecommendedNames(res.content);
    let matched: any[] = matchNamesToStudios(names, all.studios);
    // Reorder by bias and supplement if needed
    if (recBias.value !== "neutral") {
      const bias = recBias.value;
      const biased = matched.filter(
        (s) => (s.type || (s as any).category) === bias,
      );
      const rest = matched.filter(
        (s) => (s.type || (s as any).category) !== bias,
      );
      matched = [...biased, ...rest];
      if (matched.length < 6) {
        const fill = all.studios
          .filter(
            (s) =>
              ((s as any).type || (s as any).category) === bias &&
              !matched.find((m) => m.id === s.id),
          )
          .slice(0, 6 - matched.length);
        matched = [...matched, ...fill];
      }
    }
    if (matched.length > 0) {
      recommendedStudios.value = matched.slice(0, 6);
      cacheStudios(
        cacheKey,
        matched.map((m) => m.name),
      );
    }
  } catch (_e) {
    // keep previous recommendations
    console.warn("AI studio recommendations failed", e);
  } finally {
    aiRecLoading.value = false;
  }
}

function parseRecommendedNames(text: string): string[] {
  try {
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");
    if (start >= 0 && end > start) {
      const arr = JSON.parse(text.slice(start, end + 1));
      if (Array.isArray(arr)) return arr.filter((x) => typeof x === "string");
    }
  } catch {}
  // fallback: extract quoted names or capitalized sequences
  const names = new Set<string>();
  const quoted = text.match(/"([^"]+)"/g) || [];
  quoted.map((q) => q.replace(/(^"|"$)/g, "")).forEach((n) => names.add(n));
  // also try to find names from available list by presence
  return Array.from(names);
}

function matchNamesToStudios(names: string[], all: any[]): any[] {
  const lowerMap = new Map(all.map((s) => [s.name.toLowerCase(), s]));
  const matched: any[] = [];
  const used = new Set<string>();
  const norm = (x: string) =>
    x
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const tokens = (x: string) => new Set(norm(x).split(" ").filter(Boolean));
  const jaccard = (a: Set<string>, b: Set<string>) => {
    const inter = new Set([...a].filter((x) => b.has(x)));
    const uni = new Set([...a, ...b]);
    return uni.size ? inter.size / uni.size : 0;
  };
  names.forEach((n) => {
    const key = n.toLowerCase();
    let m = lowerMap.get(key);
    if (m && !used.has(m.id)) {
      matched.push(m);
      used.add(m.id);
      return;
    }
    // contains match
    const contains = all.find(
      (s) => s.name.toLowerCase().includes(key) && !used.has(s.id),
    );
    if (contains) {
      matched.push(contains);
      used.add(contains.id);
      return;
    }
    // Jaccard similarity
    const nt = tokens(n);
    let best: any = null;
    let bestScore = 0;
    for (const s of all) {
      if (used.has(s.id)) continue;
      const score = jaccard(nt, tokens(s.name));
      if (score > bestScore) {
        bestScore = score;
        best = s;
      }
    }
    if (best && bestScore >= 0.5) {
      matched.push(best);
      used.add(best.id);
    }
  });
  return matched;
}

// Watch for studio selection changes
watch(selectedStudio, (newStudio, oldStudio) => {
  if (newStudio?.id !== oldStudio?.id) {
    updateStudioSpecificPersonas();
    updateStudioRecommendations();
  }
});

watch(recBias, async (val) => {
  // Reorder current recommendations and recompute fallback suggestions
  const bias = val;
  if (bias !== "neutral") {
    const preferred = recommendedStudios.value.filter(
      (s) => ((s as any).type || (s as any).category) === bias,
    );
    const rest = recommendedStudios.value.filter(
      (s) => ((s as any).type || (s as any).category) !== bias,
    );
    recommendedStudios.value = [...preferred, ...rest].slice(0, 6);
  }
  await recomputeFallbackRecommendations();
});

async function recomputeFallbackRecommendations() {
  const bias = recBias.value;
  try {
    if (favoriteStudios.value.length > 0) {
      let list = [...favoriteStudios.value];
      if (bias !== "neutral") {
        const preferred = list.filter(
          (s) => (s.type || (s as any).category) === bias,
        );
        const rest = list.filter(
          (s) => (s.type || (s as any).category) !== bias,
        );
        list = [...preferred, ...rest];
      }
      recommendedStudios.value = list.slice(0, 6);
    } else {
      const res = await studioService.searchStudios({});
      const all = res.studios;
      if (bias !== "neutral") {
        const preferred = all.filter(
          (s) => ((s as any).type || (s as any).category) === bias,
        );
        const rest = all.filter(
          (s) => ((s as any).type || (s as any).category) !== bias,
        );
        recommendedStudios.value = [...preferred, ...rest].slice(0, 6);
      } else {
        recommendedStudios.value = all.slice(0, 6);
      }
    }
  } catch {}
}

async function loadLastUsed() {
  const key = "interview.last." + userKey.value;
  const data = unifiedStorage.get(key);
  if (_data) {
    lastUsedConfig.value = data;
    if (data.personaId) {
      const p = (personas.value as any[]).find((x) => x.id === data.personaId);
      if (p) {
        selectedPersona.value = p;
        lastUsedPersonaId.value = p.id;
        autoAppliedLastUsed.value = true;
      }
    }
    if (data.studioId && data.studioName) {
      selectedStudio.value = { id: data.studioId, name: data.studioName };
    }
    if (data.roleType) roleType.value = data.roleType;
    if (data.experienceLevel) experienceLevel.value = data.experienceLevel;
  }
}

function saveLastUsed(cfg: any) {
  const key = "interview.last." + userKey.value;
  const data = {
    personaId: cfg.persona?.id,
    personaName: cfg.persona?.name,
    studioId: cfg.studioId,
    studioName: cfg.studioName,
    roleType: cfg.roleType,
    experienceLevel: cfg.experienceLevel,
    ts: Date.now(),
  };
  try {
    unifiedStorage.set(key, data);
  } catch {}
}

function restoreLastUsed() {
  const data = lastUsedConfig.value;
  if (!data) return;
  const p = (personas.value as any[]).find((x) => x.id === data.personaId);
  if (p) {
    selectedPersona.value = p;
  }
  if (data.studioId && data.studioName) {
    selectedStudio.value = { id: data.studioId, name: data.studioName };
  }
  if (data.roleType) roleType.value = data.roleType;
  if (data.experienceLevel) experienceLevel.value = data.experienceLevel;
  autoAppliedLastUsed.value = true;
}

function computeStudioCacheKey(
  role: string,
  level: string,
  personaId?: string,
  favs: any[] = [],
) {
  const favSlice = favs
    .map((f) => f.id)
    .sort()
    .slice(0, 6)
    .join(",");
  return `role=${role}|lvl=${level}|persona=${personaId || "none"}|fav=${favSlice}`;
}

function hashKey(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return String(h >>> 0);
}

function cacheStudios(key: string, names: string[]) {
  const storeKey = "interview.recs.studios." + hashKey(key);
  const payload = { ts: Date.now(), names };
  try {
    localStorage.setItem(storeKey, JSON.stringify(payload));
  } catch {}
}

function getCachedStudios(key: string): string[] | null {
  const storeKey = "interview.recs.studios." + hashKey(key);
  try {
    const raw = localStorage.getItem(storeKey);
    if (!raw) return null;
    const data = JSON.parse(raw);

    if (Date.now() - (data.ts || 0) > 24 * 60 * 60 * 1000) return null;
    return Array.isArray(data.names) ? data.names : null;
  } catch {
    return null;
  }
}

async function aiRecommendPersona() {
  aiPersonaLoading.value = true;
  try {
    try {
      // Initialize AI service with centralized API key resolver
      await aiService.initialize({
        primaryProvider: "google",
        enableContextPersistence: false,
      });
    } catch (_error) {
      const msg =
        error && typeof error === "object" && "message" in error
          ? (error as any).message
          : String(_error);
      console.warn("AI service initialization failed:", msg);
    }
    const studio = selectedStudio.value;
    const favorites = favoriteStudios.value.map((s) => s.name).slice(0, 6);

    // Enhanced context with studio-specific information
    const studioContext = studio
      ? [
          `Studio: ${studio.name}`,
          `Studio Type: ${studio.type || studio.category || "Unknown"}`,
          `Location: ${studio.headquarters || studio.location || "Unknown"}`,
          studio.technologies
            ? `Tech Stack: ${studio.technologies.slice(0, 5).join(", ")}`
            : "",
          studio.gameGenres
            ? `Game Genres: ${studio.gameGenres.slice(0, 3).join(", ")}`
            : "",
          studio.culture?.values
            ? `Values: ${studio.culture.values.slice(0, 3).join(", ")}`
            : "",
        ].filter(Boolean)
      : ["Studio: General Practice"];

    const ctx = [
      `Target role: ${roleType.value || "Generalist"}`,
      `Experience: ${experienceLevel.value}`,
      ...studioContext,
      favorites.length ? `Favorite Studios: ${favorites.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join(" • ");

    const prompt = `Create an interviewer persona specifically tailored for this gaming industry interview context. The persona should reflect the studio's culture, technical requirements, and interview style.

Context: ${ctx}

Return JSON with this structure:
{
  "name": "Persona name that reflects the studio/role",
  "archetype": "Professional archetype (e.g., 'Epic Games Technical Lead', 'Indie Creative Director')",
  "tone": "Interview style and communication approach",
  "focusAreas": ["specific", "areas", "of", "focus"],
  "interviewStyle": "Description of how they conduct interviews",
  "studioValues": ["values", "they", "emphasize"]
}`;

    // Enhanced cache key with studio-specific data
    const pKey = `persona|role=${roleType.value}|lvl=${experienceLevel.value}|studio=${studio?.id || "none"}|type=${studio?.type || "none"}`;
    const pCache = getCachedPersona(pKey);
    if (pCache) {
      applyPersonaSuggestion(pCache);
      aiPersonaLoading.value = false;
      return;
    }

    const res = await aiService.chat({
      message: prompt,
      type: "analysis",
      metadata: {
        feature: "interview-prep-persona-rec",
        studio: studio?.name,
        studioType: studio?.type || studio?.category,
      },
    });

    const sug = parsePersonaSuggestion(res.content);
    if (sug) {
      // Enhance suggestion with studio-specific information
      if (studio) {
        sug.studioName = studio.name;
        sug.studioSpecific = true;
        sug.description = `${sug.interviewStyle || sug.description || "Professional interviewer"} - Specifically tailored for ${studio.name} interviews.`;
      }
      cachePersona(pKey, sug);
      // Show preview instead of applying immediately
      pendingPersonaSuggestion.value = sug;
      showPersonaPreview.value = true;
    }
  } catch (_e) {
    console.warn("AI persona recommendation failed", e);
  } finally {
    aiPersonaLoading.value = false;
  }
}

function parsePersonaSuggestion(text: string): any | null {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const obj = JSON.parse(text.slice(start, end + 1));
      if (obj && obj.name) {
        obj.focusAreas = Array.isArray(obj.focusAreas) ? obj.focusAreas : [];
        return obj;
      }
    }
  } catch {}
  return null;
}

function cachePersona(key: string, persona: any) {
  const storeKey = "interview.recs.persona." + hashKey(key);
  try {
    localStorage.setItem(storeKey, JSON.stringify({ ts: Date.now(), persona }));
  } catch {}
}

function getCachedPersona(key: string): any | null {
  const storeKey = "interview.recs.persona." + hashKey(key);
  try {
    const raw = localStorage.getItem(storeKey);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() - (data.ts || 0) > 24 * 60 * 60 * 1000) return null;
    return data.persona || null;
  } catch {
    return null;
  }
}

function applyPersonaSuggestion(sug: any) {
  // Try to match an existing persona first
  const byName = personas.value.find(
    (p) => p.name.toLowerCase() === String(sug.name || "").toLowerCase(),
  );
  if (byName) {
    selectedPersona.value = byName;
    recommendedPersonaId.value = byName.id;
    return;
  }
  // Try by archetype overlap
  const arc = String(sug.archetype || "");
  const matchArc = personas.value.find(
    (p) =>
      p.archetype &&
      arc &&
      arc.toLowerCase().includes(String(p.archetype).toLowerCase()),
  );
  if (matchArc) {
    selectedPersona.value = matchArc;
    recommendedPersonaId.value = matchArc.id;
    return;
  }
  // Otherwise, add a temporary custom persona
  const custom = {
    id: "custom-" + Date.now(),
    name: sug.name || "Custom Persona",
    icon: "🧠",
    description:
      "AI-recommended interviewer style for " +
      (selectedStudio.value?.name || "this position"),
    tone: sug.tone || "professional",
    focusAreas: Array.isArray(sug.focusAreas) ? sug.focusAreas : [],
    archetype: sug.archetype || "Gaming Interviewer",
    studioTypes: selectedStudio.value?.type ? [selectedStudio.value.type] : [],
    isCustom: true,
    studioSpecific: !!selectedStudio.value,
  };
  personas.value.unshift(custom);
  selectedPersona.value = custom;
  recommendedPersonaId.value = custom.id;
}

// Reset to sensible defaults
function resetInterviewPrep() {
  selectedStudio.value = null;
  selectedPersona.value = null as any;
  roleType.value = "";
  experienceLevel.value = "mid" as any;
  questionCount.value = 8;
  duration.value = 30;
  includeBehavioral.value = true;
  includeTechnical.value = true;
  includeStudioSpecific.value = true;
  recBias.value = "neutral";
  recommendedPersonaId.value = null;
  showAllStudios.value = false;
  toastInfo("Interview Prep reset to defaults");
}

// Persona preview modal state
function acceptPersonaPreview() {
  if (pendingPersonaSuggestion.value) {
    applyPersonaSuggestion(pendingPersonaSuggestion.value);
  }
  showPersonaPreview.value = false;
  pendingPersonaSuggestion.value = null;
}
function dismissPersonaPreview() {
  showPersonaPreview.value = false;
  pendingPersonaSuggestion.value = null;
}

// Update personas based on selected studio
function updateStudioSpecificPersonas() {
  if (!selectedStudio.value) {
    // Reset to base personas if no studio selected
    personas.value = [...basePersonas];
    return;
  }

  const studioType =
    selectedStudio.value.type || selectedStudio.value.category || "AAA";
  const studioName = selectedStudio.value.name;

  // Filter and prioritize personas relevant to studio type
  const relevantPersonas = basePersonas.filter(
    (p) => !p.studioTypes || p.studioTypes.includes(studioType),
  );
  const otherPersonas = basePersonas.filter(
    (p) => p.studioTypes && !p.studioTypes.includes(studioType),
  );

  // Add studio-specific variants
  const studioSpecificPersonas = relevantPersonas.map(
    (p) =>
      ({
        ...p,
        id: p.id + "-studio",
        name: p.name + ` (${studioName})`,
        description:
          p.description +
          ` Tailored for ${studioName}'s interview style and culture.`,
        isStudioSpecific: true,
        studioName: studioName,
      }) as any,
  );

  personas.value = [
    ...studioSpecificPersonas,
    ...relevantPersonas,
    ...otherPersonas,
  ];
}

// Update studio recommendations based on selection
function updateStudioRecommendations() {
  if (!selectedStudio.value) return;

  // Clear recommended persona when studio changes
  if (
    recommendedPersonaId.value &&
    selectedPersona.value?.id !== recommendedPersonaId.value
  ) {
    recommendedPersonaId.value = null;
  }

  // Auto-recommend most relevant persona for this studio
  const studioType =
    selectedStudio.value.type || selectedStudio.value.category || "AAA";
  const relevantPersona = personas.value.find(
    (p) => p.studioTypes?.includes(studioType) || (p as any).isStudioSpecific,
  );

  if (relevantPersona && !selectedPersona.value) {
    selectedPersona.value = relevantPersona;
    recommendedPersonaId.value = relevantPersona.id;
  }
}
</script>

<style scoped>

.prep-layout {
  max-width: var(--page-content-max-width);
  display: grid;
  contain: layout style;
}

  .prep-layout {
  }
}

  .prep-layout {
  }
}

.section-card {
  overflow: hidden;
  contain: layout;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow);
  transition: all var(--duration-normal) var(--easing-ease-out);
}

.section-card:hover {
}

.panel-title {
  display: flex;
  align-items: center;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-lg);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.section-body {
}

.mini-note {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  border-radius: var(--radius-md);
}

.enhanced-actions {
  background: var(--glass-bg);
  position: relative;
  overflow: hidden;
  transition: all var(--duration-normal);
}

.enhanced-actions::before {
  content: "";
  position: absolute;
  background: linear-gradient(
  );
  transition: opacity var(--duration-normal);
  pointer-events: none;
}

.enhanced-actions:hover {
  border-color: var(--glass-border-hover);
}

.enhanced-actions:hover::before {
}

.card-header {
  display: flex;
  align-items: center;
}

.card-icon {
  border-radius: var(--radius-xl);
  background: linear-gradient(
  );
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  position: relative;
}

.stats-icon {
  background: linear-gradient(
  );
}

.card-description {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
}

.secondary-actions {
  display: flex;
}

.enhanced-btn {
  position: relative;
  overflow: hidden;
  transition: all var(--duration-fast);
}

.enhanced-btn::before {
  content: "";
  position: absolute;
  transition:
}

.enhanced-btn:active::before {
}

.enhanced-stats {
  position: relative;
}

.animated-stat {
  text-align: center;
  border-radius: var(--radius-lg);
  background: var(--glass-bg);
  position: relative;
  overflow: hidden;
  transition: all var(--duration-fast);
}

.animated-stat::before {
  content: "";
  position: absolute;
  background: linear-gradient(
  );
  transition: opacity var(--duration-fast);
}

.animated-stat:hover {
  border-color: var(--glass-border-hover);
}

.animated-stat:hover::before {
}

.gradient-text {
  background: linear-gradient(
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: var(--font-weight-bold);
  position: relative;
}

.stat-indicator {
  position: absolute;
  background: linear-gradient(
  );
  transform-origin: left;
}

.animated-stat:hover .stat-indicator {
}

.stat-label {
  position: relative;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

@media (max-width: var(--breakpoint-md)) {
  .secondary-actions {
    flex-direction: column;
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .card-header {
    flex-direction: column;
    text-align: center;
  }
}
.prep-layout {
  max-width: var(--page-content-max-width);
  display: grid;
}

  .prep-layout {
  }
}

.studio-search {
}

.studio-suggestions {
  display: grid;
  overflow: auto;
}

.studio-suggestion-card {
  display: flex;
  align-items: center;
  border-radius: var(--radius-lg);
  background: var(--surface-elevated);
  transition: all var(--transition-base);
  cursor: pointer;
}

.studio-suggestion-card:hover {
  border-color: var(--border-strong);
  background: var(--surface-container);
}

.studio-suggestion-card.selected {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  background: color-mix(
    in srgb,
    var(--surface-elevated)
  );
}

.s-logo {
  border-radius: var(--radius-md);
  background: var(--surface-container);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.s-logo img {
  object-fit: cover;
}

.s-logo-fallback {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.s-info {
}

.s-name {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-md);
}

.s-meta {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.favorites {
}

.favorites-title {
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
}

.favorites-grid {
  display: flex;
  flex-wrap: wrap;
}

.fav-chip {
  border-radius: var(--radius-full);
  background: var(--surface-elevated);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  transition: all var(--transition-base);
  cursor: pointer;
}

.fav-chip:hover {
  border-color: var(--border-strong);
  background: var(--surface-container);
}

.fav-chip.active {
  border-color: var(--color-primary);
  background: color-mix(
    in srgb,
    var(--surface-elevated)
  );
  color: var(--color-primary);
}

.persona-grid {
  display: grid;
}

.persona-card {
  border-radius: var(--radius-lg);
  background: var(--surface-elevated);
  transition: all var(--transition-base);
  cursor: pointer;
}

.persona-card:hover {
  border-color: var(--border-strong);
  background: var(--surface-container);
}

.persona-card.selected {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
  background: color-mix(
    in srgb,
    var(--surface-elevated)
  );
}

.persona-header {
  display: flex;
  align-items: center;
}

.persona-icon {
  font-size: var(--font-size-lg);
  color: var(--color-primary);
}

.persona-name {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-md);
}

.persona-badge {
  display: inline-block;
  background: var(--surface-container);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.persona-desc {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
}

.persona-tags {
  display: flex;
  flex-wrap: wrap;
}

.tag {
  display: inline-block;
  background: var(--surface-container);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.settings-grid {
  display: grid;
}

.toggles {
  display: flex;
}

.toggle-item {
  display: flex;
  align-items: center;
  font-size: var(--font-size-md);
}

.summary {
  display: grid;
  border-radius: var(--radius-lg);
  background: var(--surface-elevated);
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.summary .label {
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
}

.summary .value {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-md);
  color: var(--text-primary);
}

.persona-inline-badge {
  border-radius: var(--radius-full);
  color: var(--color-primary);
  background: color-mix(
    in srgb,
    var(--surface-elevated)
  );
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.sr-only {
  position: absolute;
  overflow: hidden;
  white-space: nowrap;
}

.small-select {
  font-size: var(--font-size-sm);
  border-radius: var(--radius-md);
  background: var(--surface-elevated);
}

.studio-filters {
}

.filter-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.filter-chips {
  display: grid;
}

.chip-group {
  display: flex;
  flex-wrap: wrap;
}

.chip-btn {
  border-radius: var(--radius-full);
  background: var(--surface-elevated);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-base);
}

.chip-btn:hover {
  background: var(--surface-container);
  color: var(--text-primary);
  border-color: var(--border-strong);
}

.chip-btn.active {
  background: color-mix(
    in srgb,
    var(--surface-elevated)
  );
  color: var(--color-primary);
  border-color: var(--color-primary);
}
.section-header {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-lg);
  display: flex;
  align-items: center;
}

.section-header .count {
  font-weight: var(--font-weight-regular);
  color: var(--text-secondary);
  font-size: var(--font-size-md);
}

.show-more {
  text-align: center;
}

  .prep-overview-grid {
  }

  .prep-layout {
  }

  .chip-group {
  }

  .panel-header {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .secondary-actions {
    flex-direction: column;
  }

  .settings-grid {
  }

  .step-actions {
    flex-wrap: wrap;
    justify-content: center;
  }
}

.sticky {
  position: sticky;
  align-self: start;
}

  .sticky {
    position: static;
    z-index: auto;
  }
}

.side-overview {
  border-radius: var(--radius-lg);
  background: var(--surface-elevated);
}

.overview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.overview-title {
  display: flex;
  align-items: center;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-lg);
}

.overview-grid {
  display: grid;
}

.ov-row {
  display: flex;
  justify-content: space-between;
}

.ov-label {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.ov-value {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.overview-actions {
  display: flex;
  align-items: center;
}

.overview-actions .spacer {
}

.progress {
  background: var(--surface-container);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.progress--sm {
}

.progress-bar {
  background: linear-gradient(
    var(--color-primary),
    var(--color-success)
  );
  transition: width var(--transition-slow);
}

.progress-text {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.step-actions {
  position: sticky;
  display: flex;
  align-items: center;
  backdrop-filter: blur(var(--blur-md));
}

.step-actions .spacer {
}



.studio-type-badge {
  background: color-mix(
    in srgb,
    var(--surface-elevated)
  );
  color: var(--color-primary);
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-medium);
}

.persona-card.selected.persona-studio-specific {
  background: linear-gradient(
  );
  border-color: var(--color-primary);
}

.persona-card:has(.persona-badge-custom) {
  position: relative;
  overflow: hidden;
}

.persona-card:has(.persona-badge-custom)::before {
  content: "";
  position: absolute;
  background: linear-gradient(
    transparent,
    transparent
  );
  transition: left var(--transition-slow);
}

.persona-card:hover:has(.persona-badge-custom)::before {
}

.modal-overlay {
  position: fixed;
  background: var(--surface-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
}

.modal-card {
  background: var(--surface-elevated);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-body {
  display: grid;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  transition: color var(--transition-base);
}

.close-btn:hover {
  color: var(--text-primary);
}

.pv-row {
  display: flex;
  justify-content: space-between;
}

.pv-label {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.pv-value {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.prep-overview-grid {
  display: grid;
}

  .prep-overview-grid {
  }
}

  .prep-overview-grid {
  }
}

.overview-actions-card,
.prep-stats-card,
.context-card {
}

.card-title {
  display: flex;
  align-items: center;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  font-size: var(--font-size-lg);
}

.action-buttons {
  display: flex;
  flex-direction: column;
}

.primary-action {
  font-size: var(--font-size-lg);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  line-height: var(--line-height-tight);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.context-details {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-md);
}

.context-job .company {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.context-skills {
  display: flex;
  flex-wrap: wrap;
}

.skill-tag {
  background: color-mix(
    in srgb,
    var(--surface-elevated)
  );
  color: var(--color-primary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
}

.prep-flow-tip {
  display: flex;
  align-items: flex-start;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

  .prep-layout {
  }

  .card-header {
    flex-direction: column;
    text-align: center;
  }

  .context-details {
    flex-direction: column;
    align-items: stretch;
  }

  .overview-actions {
    flex-direction: column;
  }

  .persona-grid {
  }
}
</style>
