<template>
  <StandardPageLayout
    :header-context="{
      store,
      profileCompleteness,
      themeName: theme?.getThemeDisplayName?.() || 'System',
    }"
    class="font-sans "
  >
    <template #header-actions>
      <HeaderActions layout="horizontal" alignment="end" gap="md" priority="secondary">
        <UnifiedButton
          variant="glass"
          size="md"
          leading-icon="MagnifyingGlassIcon"
          @click="showSearchModal = true"
        >
          Search
        </UnifiedButton>
        <UnifiedButton
          variant="glass"
          size="md"
          leading-icon="ArrowDownTrayIcon"
          @click="exportSettings"
        >
          Export
        </UnifiedButton>
        <UnifiedButton
          variant="ghost"
          size="md"
          leading-icon="mdi-backup-restore"
          @click="resetToDefaults"
        >
          Reset
        </UnifiedButton>
        <UnifiedButton
          variant="primary"
          size="md"
          :disabled="saving"
          :loading="saving"
          leading-icon="mdi-content-save"
          @click="saveAllSettings"
        >
          {{ saving ? "Saving..." : "Save All" }}
        </UnifiedButton>
        <ThemeToggle :compact="true" :show-density="true" />
      </HeaderActions>
    </template>

    <!-- Main Content with improved layout -->
    <div class="settings-layout unified-container">
      <!-- Enhanced Loading State -->
      <LoadingSkeletons
        v-if="store?.loading?.ai || loadingModels || loadingDevices"
        variant="form"
        :form-field-count="5"
        :show="true"
      />

      <!-- Enhanced Settings Navigation with Master Glass Theme -->
      <div class="settings-navigation enhanced-glass-card" style="margin-bottom: var(--spacing-6); position: sticky; top: var(--spacing-4); z-index: 10;">
        <!-- Enhanced Search Header -->
        <div class="navigation-header glass-section-header" style="padding: var(--spacing-4); border-b: 1px solid var(--glass-border);">
          <div class="flex items-center gap-glass-md">
            <div class="search-input-wrapper flex-grow-1" style="max-width: calc(var(--page-narrow-width) * 0.55);">
              <div class="position-relative">
                <AppIcon name="MagnifyingGlassIcon" class="position-absolute" style="left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-secondary);" />
                <input
                  v-model="searchQuery"
                  type="text"
                  class="glass-input enhanced-search-input"
                  placeholder="Search settings..."
                  aria-label="Search settings"
                  style="padding-left: 40px;"
                />
              </div>
            </div>
            <div class="quick-filters flex gap-glass-sm">
              <UnifiedButton
                v-for="quickTab in quickAccessTabs"
                :key="quickTab.key"
                :variant="activeTab === quickTab.key ? 'primary' : 'ghost'"
                size="sm"
                :leading-icon="quickTab.icon"
                @click="activeTab = quickTab.key"
              >
                {{ quickTab.shortLabel }}
              </UnifiedButton>
            </div>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div style="padding: 0 var(--spacing-4) var(--spacing-4);">
          <GlassNavTabs v-model:active-tab="activeTab" :tabs="logicalTabGroups" aria-label="Settings Categories" />
        </div>
      </div>

      <!-- Content Area with logical grouping -->
      <div class="settings-content">
        <!-- ESSENTIALS Group with Enhanced Unified Profile Tabs -->
        <div v-if="activeTab === 'profile'" class="settings-group">
          <div class="group-header enhanced-glass-card" style="padding: var(--spacing-5); margin-bottom: var(--spacing-4);">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="h4 mb-2" style="color: var(--text-primary-600);">
                  <AppIcon name="UserIcon-card-details" class="mr-2" />
                  Profile & Identity
                </h2>
                <p class="mb-0" style="color: var(--text-secondary);">
                  Essential profile information and gaming career details
                </p>
              </div>
              <div class="profile-completion">
                <div class="completion-badge" style="padding: var(--spacing-2) var(--spacing-3); background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: var(--radius-lg);">
                  <span style="color: var(--text-secondary); font-size: 0.875rem;">Completion</span>
                  <div style="font-weight: 600; color: var(--color-primary-500);">{{ Math.round(profileCompleteness) }}%</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Enhanced Unified Profile with Master Glass Tabs -->
          <div class="enhanced-glass-card profile-main-card enhanced-profile-card">
            <div class="profile-tabs-container">
              <!-- Enhanced Tab Navigation -->
              <div class="profile-tab-navigation">
                <div class="profile-tab-buttons glass-tab-wrapper">
                  <UnifiedButton
                    :variant="activeProfileTab === 'personal' ? 'primary' : 'glass'"
                    size="sm"
                    leading-icon="UserIcon"
                    class="profile-tab-btn"
                    @click="activeProfileTab = 'personal'"
                  >
                    Personal Info
                  </UnifiedButton>
                  <UnifiedButton
                    :variant="activeProfileTab === 'gaming' ? 'primary' : 'glass'"
                    size="sm"
                    leading-icon="PuzzlePieceIcon"
                    class="profile-tab-btn"
                    @click="activeProfileTab = 'gaming'"
                  >
                    Gaming Profile
                  </UnifiedButton>
                  <UnifiedButton
                    :variant="activeProfileTab === 'career' ? 'primary' : 'glass'"
                    size="sm"
                    leading-icon="BriefcaseIcon"
                    class="profile-tab-btn"
                    @click="activeProfileTab = 'career'"
                  >
                    Career Details
                  </UnifiedButton>
                </div>
              </div>

              <!-- Enhanced Tab Content -->
              <div class="profile-tab-content glass-tab-content">
                <!-- Personal Info Tab -->
                <div v-if="activeProfileTab === 'personal'" class="tab-pane profile-tab-pane">
                  <ProfileSection
                    v-model:user-profile="userProfile"
                    :saving="saving"
                    :is-tabbed="true"
                    @save="saveSettings"
                  />
                </div>

                <!-- Gaming Profile Tab -->
                <div v-if="activeProfileTab === 'gaming'" class="tab-pane profile-tab-pane">
                  <GamingProfileSection
                    v-model:gaming-profile="userProfile.gamingProfile"
                    :saving="saving"
                    :is-tabbed="true"
                    @save="saveSettings"
                  />
                </div>

                <!-- Career Details Tab -->
                <div v-if="activeProfileTab === 'career'" class="tab-pane profile-tab-pane">
                  <div class="career-details-section glass-section">
                    <div class="section-header glass-section-header">
                      <h4 class="h6 mb-0" style="color: var(--text-primary-600); display: flex; align-items: center; gap: var(--spacing-2);">
                        <AppIcon name="BriefcaseIcon" style="color: var(--color-primary-500);" />
                        Career Preferences
                      </h4>
                      <p class="mb-0" style="color: var(--text-secondary); font-size: 0.875rem; margin-top: var(--spacing-1);">Define your career goals and preferences</p>
                    </div>
                    
                    <div class="form-grid glass-form-grid">
                      <div class="form-flex flex-wrap" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--spacing-4);">
                        <div class="glass-form-field">
                          <label for="career-level" class="form-label glass-label">Career Level</label>
                          <select
                            id="career-level"
                            v-model="userProfile.careerPreferences.level"
                            class="glass-input enhanced-glass-input"
                          >
                            <option value="">Select level</option>
                            <option value="entry">Entry Level</option>
                            <option value="mid">Mid Level</option>
                            <option value="senior">Senior Level</option>
                            <option value="lead">Lead/Principal</option>
                            <option value="director">Director/VP</option>
                          </select>
                        </div>
                        
                        <div class="glass-form-field">
                          <label for="preferred-roles" class="form-label glass-label">Preferred Roles</label>
                          <input
                            id="preferred-roles"
                            v-model="userProfile.careerPreferences.preferredRoles"
                            type="text"
                            class="glass-input enhanced-glass-input"
                            placeholder="e.g., Game Developer, Technical Artist"
                          />
                        </div>
                      </div>
                      
                      <div class="form-flex flex-wrap" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--spacing-4);">
                        <div class="glass-form-field">
                          <label for="work-preference" class="form-label glass-label">Work Preference</label>
                          <select
                            id="work-preference"
                            v-model="userProfile.careerPreferences.workPreference"
                            class="glass-input enhanced-glass-input"
                          >
                            <option value="">Select preference</option>
                            <option value="remote">Remote</option>
                            <option value="hybrid">Hybrid</option>
                            <option value="onsite">On-site</option>
                            <option value="flexible">Flexible</option>
                          </select>
                        </div>
                        
                        <div class="glass-form-field">
                          <label for="salary-range" class="form-label glass-label">Target Salary Range</label>
                          <input
                            id="salary-range"
                            v-model="userProfile.careerPreferences.salaryRange"
                            type="text"
                            class="glass-input enhanced-glass-input"
                            placeholder="e.g., $80k - $120k"
                          />
                        </div>
                      </div>
                      
                      <div class="glass-form-field">
                        <label for="career-goals" class="form-label glass-label">Career Goals</label>
                        <textarea
                          id="career-goals"
                          v-model="userProfile.careerPreferences.goals"
                          class="glass-input enhanced-glass-input"
                          rows="4"
                          placeholder="Describe your career aspirations and goals..."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- AI & AUTOMATION Group -->
        <div v-if="activeTab === 'ai'" class="settings-group">
          <div class="enhanced-glass-card">
            <div class="glass-card-header">
              <div class="header-content">
                <div class="header-icon">
                  <AppIcon name="CpuChipIcon" />
                </div>
                <div class="header-text">
                  <h2 class="header-title">AI & Automation</h2>
                  <p class="header-description">Configure AI services, API keys, and intelligent features</p>
                </div>
              </div>
            </div>

            <div class="glass-card-content">
              <!-- Tab Navigation -->
              <div class="glass-tab-wrapper">
                <UnifiedButton
                  :variant="activeAITab === 'gemini' ? 'primary' : 'glass'"
                  size="sm"
                  leading-icon="mdi-google"
                  class="profile-tab-btn"
                  @click="activeAITab = 'gemini'"
                >
                  Gemini API
                </UnifiedButton>
                <UnifiedButton
                  :variant="activeAITab === 'voice' ? 'primary' : 'glass'"
                  size="sm"
                  leading-icon="MicrophoneIcon"
                  class="profile-tab-btn"
                  @click="activeAITab = 'voice'"
                >
                  Voice AI
                </UnifiedButton>
                <UnifiedButton
                  :variant="activeAITab === 'providers' ? 'primary' : 'glass'"
                  size="sm"
                  leading-icon="CloudIcon-outline"
                  class="profile-tab-btn"
                  @click="activeAITab = 'providers'"
                >
                  Providers
                </UnifiedButton>
                <UnifiedButton
                  :variant="activeAITab === 'integration' ? 'primary' : 'glass'"
                  size="sm"
                  leading-icon="LinkIcon-variant"
                  class="profile-tab-btn"
                  @click="activeAITab = 'integration'"
                >
                  Integration
                </UnifiedButton>
                <UnifiedButton
                  :variant="activeAITab === 'advanced' ? 'primary' : 'glass'"
                  size="sm"
                  leading-icon="mdi-cog-outline"
                  class="profile-tab-btn"
                  @click="activeAITab = 'advanced'"
                >
                  Advanced
                </UnifiedButton>
              </div>

              <!-- Enhanced Tab Content -->
              <div class="profile-tab-content glass-tab-content">
                <!-- Gemini API Tab -->
                <div v-if="activeAITab === 'gemini'" class="tab-pane profile-tab-pane">
                  <!-- Skeleton Loading for API Configuration -->
                  <LoadingSkeletons
                    v-if="loadingModels"
                    variant="form"
                    :form-field-count="3"
                    :show="true"
                  />

                  <ApiConfigurationSection
                    v-else
                    v-model:settings="settings"
                    :show-api-key="showApiKey"
                    :testing="testing"
                    :api-test-result="apiTestResult"
                    :loading-models="loadingModels"
                    :connecting="connecting"
                    :available-models="safeAvailableModels"
                    :selected-model-info="safeSelectedModelInfo"
                    @toggle-api-key-visibility="showApiKey = !showApiKey"
                    @test-api-key="testApiKey"
                    @connect-api-key="connectApiKey"
                    @load-models="loadModels"
                    @save-settings="saveSettings"
                  />
                </div>

                <!-- Voice AI Tab -->
                <div v-if="activeAITab === 'voice'" class="tab-pane profile-tab-pane">
                  <VoiceExperienceSection
                    :voice-settings="{
                      voiceMode: settings.voiceMode || false,
                      ttsProvider: settings.ttsProvider || 'system',
                      kokoroModel: settings.kokoroModel || 'default',
                      voiceHandsFree: settings.voiceHandsFree || false,
                      chatCuesMuted: settings.chatCuesMuted || false
                    }"
                    @save="updateVoiceSettings"
                  />
                </div>

                <!-- Providers Tab -->
                <div v-if="activeAITab === 'providers'" class="tab-pane profile-tab-pane">
                  <div class="glass-section">
                    <div class="section-header glass-section-header">
                      <h4 class="h6 mb-0" style="color: var(--text-primary-600); display: flex; align-items: center; gap: var(--spacing-2);">
                        <AppIcon name="CloudIcon-outline" style="color: var(--color-primary-500);" />
                        AI Service Providers
                      </h4>
                      <p class="mb-0" style="color: var(--text-secondary); font-size: 0.875rem; margin-top: var(--spacing-1);">Manage connections to different AI service providers</p>
                    </div>
                    
                    <div class="provider-grid">
                      <!-- Google Gemini -->
                      <div class="provider-card glass-card">
                        <div class="provider-header">
                          <AppIcon name="mdi-google" class="provider-icon" />
                          <div class="provider-info">
                            <h5 class="provider-name">Google Gemini</h5>
                            <span
                              class="provider-status"
                              :class="store.settings?.geminiApiKey ? 'status-connected' : 'status-available'"
                            >{{ store.settings?.geminiApiKey ? 'Connected' : 'Not Connected' }}</span>
                          </div>
                        </div>
                        <div class="provider-features">
                          <span class="feature-tag">Text Generation</span>
                          <span class="feature-tag">Vision</span>
                          <span class="feature-tag">Code Analysis</span>
                        </div>
                      </div>

                      <!-- OpenAI -->
                      <div class="provider-card glass-card">
                        <div class="provider-header">
                          <AppIcon name="mdi-openai" class="provider-icon" />
                          <div class="provider-info">
                            <h5 class="provider-name">OpenAI</h5>
                            <span
                              class="provider-status"
                              :class="store.settings?.openaiApiKey ? 'status-connected' : 'status-available'"
                            >{{ store.settings?.openaiApiKey ? 'Connected' : 'Available' }}</span>
                          </div>
                        </div>
                        <div class="provider-features">
                          <span class="feature-tag">GPT Models</span>
                          <span class="feature-tag">DALL-E</span>
                          <span class="feature-tag">Whisper</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Integration Tab -->
                <div v-if="activeAITab === 'integration'" class="tab-pane profile-tab-pane">
                  <div class="glass-section">
                    <div class="section-header glass-section-header">
                      <h4 class="h6 mb-0" style="color: var(--text-primary-600); display: flex; align-items: center; gap: var(--spacing-2);">
                        <AppIcon name="LinkIcon-variant" style="color: var(--color-primary-500);" />
                        AI Integration & Monitoring
                      </h4>
                      <p class="mb-0" style="color: var(--text-secondary); font-size: 0.875rem; margin-top: var(--spacing-1);">Monitor AI service health and manage feature integrations</p>
                    </div>
                    
                    <!-- AI Integration Panel -->
                    <AIIntegrationPanel />
                  </div>
                </div>

                <!-- Advanced Tab -->
                <div v-if="activeAITab === 'advanced'" class="tab-pane profile-tab-pane">
                  <div class="glass-section">
                    <div class="section-header glass-section-header">
                      <h4 class="h6 mb-0" style="color: var(--text-primary-600); display: flex; align-items: center; gap: var(--spacing-2);">
                        <AppIcon name="mdi-cog-outline" style="color: var(--color-primary-500);" />
                        Advanced AI Settings
                      </h4>
                      <p class="mb-0" style="color: var(--text-secondary); font-size: 0.875rem; margin-top: var(--spacing-1);">Fine-tune AI behavior and performance settings</p>
                    </div>
                    
                    <div class="glass-form-grid">
                      <!-- Response Settings -->
                      <div class="glass-form-field">
                        <h5 class="setting-group-title">Response Generation</h5>
                        <div class="form-flex flex-wrap" style="display: grid; grid-template-columns: 1fr auto; gap: var(--spacing-3); align-items: center; margin-bottom: var(--spacing-3);">
                          <label class="form-label glass-label">Temperature</label>
                          <span class="range-value">{{ settings.aiTemperature ?? 0.7 }}</span>
                        </div>
                        <input type="range" min="0" max="1" step="0.1" :value="settings.aiTemperature ?? 0.7" class="glass-slider enhanced-glass-input" style="width: 100%;" @input="updateSetting('aiTemperature', parseFloat($event.target.value))" />
                      </div>
                      
                      <div class="glass-form-field">
                        <label class="form-label glass-label">Max Tokens</label>
                        <input type="number" :value="settings.aiMaxTokens ?? 2048" class="glass-input enhanced-glass-input" placeholder="2048" @input="updateSetting('aiMaxTokens', parseInt($event.target.value))" />
                      </div>

                      <div class="glass-form-field">
                        <h5 class="setting-group-title">AI Behavior</h5>
                        <div class="form-flex flex-wrap" style="display: flex; align-items: center; gap: var(--spacing-3); margin-bottom: var(--spacing-2);">
                          <input type="checkbox" :checked="settings.aiAutoSuggest ?? false" class="glass-toggle" @change="updateSetting('aiAutoSuggest', $event.target.checked)" />
                          <label class="toggle-label glass-label">Auto-suggest responses</label>
                        </div>
                        <div class="form-flex flex-wrap" style="display: flex; align-items: center; gap: var(--spacing-3); margin-bottom: var(--spacing-2);">
                          <input type="checkbox" :checked="settings.aiSmartCorrection ?? false" class="glass-toggle" @change="updateSetting('aiSmartCorrection', $event.target.checked)" />
                          <label class="toggle-label glass-label">Smart grammar correction</label>
                        </div>
                        <div class="form-flex flex-wrap" style="display: flex; align-items: center; gap: var(--spacing-3);">
                          <input type="checkbox" :checked="settings.aiContextAware ?? true" class="glass-toggle" @change="updateSetting('aiContextAware', $event.target.checked)" />
                          <label class="toggle-label glass-label">Context-aware responses</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SYSTEM & INTERFACE Group -->
        <div v-if="activeTab === 'system'" class="settings-group">
          <div class="enhanced-glass-card">
            <div class="glass-card-header">
              <div class="header-content">
                <div class="header-icon">
                  <AppIcon name="CogIcon" />
                </div>
                <div class="header-text">
                  <h2 class="header-title">System & Interface</h2>
                  <p class="header-description">Application preferences, hardware settings, and system configuration</p>
                </div>
              </div>
            </div>

            <div class="glass-card-content">
              <!-- Tab Navigation -->
              <div class="glass-tab-wrapper">
                <UnifiedButton
                  :variant="activeSystemTab === 'interface' ? 'primary' : 'glass'"
                  size="sm"
                  leading-icon="SwatchIcon"
                  class="profile-tab-btn"
                  @click="activeSystemTab = 'interface'"
                >
                  Interface
                </UnifiedButton>
                <UnifiedButton
                  :variant="activeSystemTab === 'hardware' ? 'primary' : 'glass'"
                  size="sm"
                  leading-icon="mdi-speaker"
                  class="profile-tab-btn"
                  @click="activeSystemTab = 'hardware'"
                >
                  Hardware
                </UnifiedButton>
                <UnifiedButton
                  :variant="activeSystemTab === 'system' ? 'primary' : 'glass'"
                  size="sm"
                  leading-icon="mdi-cog-outline"
                  class="profile-tab-btn"
                  @click="activeSystemTab = 'system'"
                >
                  System
                </UnifiedButton>
                <UnifiedButton
                  :variant="activeSystemTab === 'voice' ? 'primary' : 'glass'"
                  size="sm"
                  leading-icon="MicrophoneIcon"
                  class="profile-tab-btn"
                  @click="activeSystemTab = 'voice'"
                >
                  Voice
                </UnifiedButton>
              </div>

              <!-- Tab Content -->
              <div class="profile-tab-content glass-tab-content">
                <!-- Interface Tab -->
                <div v-if="activeSystemTab === 'interface'" class="tab-pane profile-tab-pane">
                  <ApplicationPreferencesSection
                    :settings="settings"
                    @save="saveSettings"
                  />
                </div>

                <!-- Hardware Tab -->
                <div v-if="activeSystemTab === 'hardware'" class="tab-pane profile-tab-pane">
                  <AudioHardwareSection
                    :settings="settings"
                    :voices="voices"
                    :audio-devices="audioDevices"
                    :loading-devices="loadingDevices"
                    @load-audio-devices="loadAudioDevices"
                    @update:settings="updateAudioSettings"
                  />
                </div>

                <!-- System Tab -->
                <div v-if="activeSystemTab === 'system'" class="tab-pane profile-tab-pane">
                  <SystemConfigurationSection
                    :settings="{ ...settings.system || {}, fairyBubbleSize: settings.fairyBubbleSize }"
                    @clear-cache="clearAppCache"
                    @clear-logs="clearApplicationLogs"
                    @export-settings="exportUserSettings"
                    @import-settings="importUserSettings"
                    @update-fairy-setting="(value) => store.updateSettings({ fairyBubbleSize: value })"
                    @save="saveSettings"
                  />
                </div>

                <!-- Voice Tab -->
                <div v-if="activeSystemTab === 'voice'" class="tab-pane profile-tab-pane">
                  <VoiceExperienceSection
                    :voice-settings="{
                      voiceMode: settings.voiceMode || false,
                      ttsProvider: settings.ttsProvider || 'system',
                      kokoroModel: settings.kokoroModel || 'default',
                      voiceHandsFree: settings.voiceHandsFree || false,
                      chatCuesMuted: settings.chatCuesMuted || false
                    }"
                    @save="updateVoiceSettings"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- CAREER & DATA Group -->
        <div v-if="activeTab === 'career'" class="settings-group">
          <div class="enhanced-glass-card">
            <div class="glass-card-header">
              <div class="header-content">
                <div class="header-icon">
                  <AppIcon name="BriefcaseIcon" />
                </div>
                <div class="header-text">
                  <h2 class="header-title">Career & Data</h2>
                  <p class="header-description">Job search settings, data sources, and career development tools</p>
                </div>
              </div>
            </div>

            <div class="glass-card-content">
              <!-- Tab Navigation -->
              <div class="glass-tab-wrapper">
                <UnifiedButton
                  :variant="activeCareerTab === 'gaming' ? 'glass' : 'ghost'"
                  size="sm"
                  class="glass-tab-button"
                  @click="activeCareerTab = 'gaming'"
                >
                  <AppIcon name="PuzzlePieceIcon" />
                  Gaming Career
                </UnifiedButton>
                <UnifiedButton
                  :variant="activeCareerTab === 'sources' ? 'glass' : 'ghost'"
                  size="sm"
                  class="glass-tab-button"
                  @click="activeCareerTab = 'sources'"
                >
                  <AppIcon name="CircleStackIcon-search" />
                  Data Sources
                </UnifiedButton>
                <UnifiedButton
                  :variant="activeCareerTab === 'management' ? 'glass' : 'ghost'"
                  size="sm"
                  class="glass-tab-button"
                  @click="activeCareerTab = 'management'"
                >
                  <AppIcon name="CircleStackIcon-cog" />
                  Data Management
                </UnifiedButton>
              </div>

              <!-- Tab Content -->
              <div class="glass-tab-content">
                <!-- Gaming Career Tab -->
                <div v-if="activeCareerTab === 'gaming'" class="tab-pane">
                  <GamingCareerSection
                    v-model:career-profile="userProfile.careerProfile"
                    :saving="saving"
                    @save="saveSettings"
                  />
                </div>

                <!-- Data Sources Tab -->
                <div v-if="activeCareerTab === 'sources'" class="tab-pane">
                  <JobDataSourcesSection
                    v-model:job-settings="settings.jobSearch"
                    @save="saveSettings"
                  />
                </div>

                <!-- Data Management Tab -->
                <div v-if="activeCareerTab === 'management'" class="tab-pane">
                  <DataManagementSection
                    v-model:data-settings="settings.data"
                    @save="saveSettings"
                    @export-data="exportUserData"
                    @import-data="importUserData"
                    @clear-cache="clearAppCache"
                    @export-resume="exportResume"
                    @export-portfolio="exportPortfolio"
                    @export-chat-history="exportChatHistory"
                    @export-settings="exportSettings"
                    @backup-database="backupDatabase"
                    @import-resume="importResume"
                    @import-portfolio="importPortfolio"
                    @import-settings="importUserSettings"
                    @import-linkedin="importFromLinkedIn"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- INSIGHTS & PROGRESS Group -->
        <div v-if="activeTab === 'insights'" class="settings-group">
          <div class="enhanced-glass-card">
            <div class="glass-card-header">
              <div class="header-content">
                <div class="header-icon">
                  <AppIcon name="ChartBarIcon" />
                </div>
                <div class="header-text">
                  <h2 class="header-title">Insights & Progress</h2>
                  <p class="header-description">Usage statistics, achievements, and development tracking</p>
                </div>
              </div>
            </div>

            <div class="glass-card-content">
              <!-- Tab Navigation -->
              <div class="glass-tab-wrapper">
                <UnifiedButton
                  :variant="activeInsightsTab === 'stats' ? 'glass' : 'ghost'"
                  size="sm"
                  class="glass-tab-button"
                  @click="activeInsightsTab = 'stats'"
                >
                  <AppIcon name="ChartBarSquareIcon" />
                  Statistics
                </UnifiedButton>
                <UnifiedButton
                  :variant="activeInsightsTab === 'achievements' ? 'glass' : 'ghost'"
                  size="sm"
                  class="glass-tab-button"
                  @click="activeInsightsTab = 'achievements'"
                >
                  <AppIcon name="TrophyIcon" />
                  Achievements
                </UnifiedButton>
              </div>

              <!-- Tab Content -->
              <div class="glass-tab-content">
                <!-- Statistics Tab -->
                <div v-if="activeInsightsTab === 'stats'" class="tab-pane">
                  <UsageStatisticsCard
                    :statistics="usageStats"
                    @export-stats="exportUsageStats"
                    @reset-stats="resetUsageStats"
                  />
                </div>

                <!-- Achievements Tab -->
                <div v-if="activeInsightsTab === 'achievements'" class="tab-pane">
                  <GamificationDashboard />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ADVANCED Group -->
        <div v-if="activeTab === 'advanced'" class="settings-group">
          <div class="enhanced-glass-card">
            <div class="glass-card-header">
              <div class="header-content">
                <div class="header-icon">
                  <AppIcon name="WrenchScrewdriverIcon" />
                </div>
                <div class="header-text">
                  <h2 class="header-title">Advanced & Developer</h2>
                  <p class="header-description">Developer tools, system configuration, and advanced features</p>
                </div>
              </div>
            </div>

            <div class="glass-card-content">
              <!-- Tab Navigation -->
              <div class="glass-tab-wrapper">
                <UnifiedButton
                  :variant="activeAdvancedTab === 'developer' ? 'glass' : 'ghost'"
                  size="sm"
                  class="glass-tab-button"
                  @click="activeAdvancedTab = 'developer'"
                >
                  <AppIcon name="CommandLineIcon" />
                  Developer
                </UnifiedButton>
                <UnifiedButton
                  :variant="activeAdvancedTab === 'system' ? 'glass' : 'ghost'"
                  size="sm"
                  class="glass-tab-button"
                  @click="activeAdvancedTab = 'system'"
                >
                  <AppIcon name="mdi-cog-outline" />
                  System Config
                </UnifiedButton>
              </div>

              <!-- Tab Content -->
              <div class="glass-tab-content">
                <!-- Developer Tab -->
                <div v-if="activeAdvancedTab === 'developer'" class="tab-pane">
                  <DeveloperSettingsSection
                    v-model:settings="settings"
                    :app-version="appVersion"
                    @save="saveSettings"
                    @reset-all="resetAllSettings"
                    @export-debug="exportDebugInfo"
                  />
                </div>

                <!-- System Config Tab -->
                <div v-if="activeAdvancedTab === 'system'" class="tab-pane">
                  <SystemConfigurationSection
                    v-model:system-settings="settings.system"
                    @save="saveSettings"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- HELP & ABOUT Group -->
        <div v-if="activeTab === 'about'" class="settings-group">
          <div class="enhanced-glass-card">
            <div class="glass-card-header">
              <div class="header-content">
                <div class="header-icon">
                  <AppIcon name="InformationCircleIcon" />
                </div>
                <div class="header-text">
                  <h2 class="header-title">Help & About</h2>
                  <p class="header-description">App information, support resources, and tips</p>
                </div>
              </div>
            </div>

            <div class="glass-card-content">
              <!-- Tab Navigation -->
              <div class="glass-tab-wrapper">
                <UnifiedButton
                  :variant="activeHelpTab === 'about' ? 'glass' : 'ghost'"
                  size="sm"
                  class="glass-tab-button"
                  @click="activeHelpTab = 'about'"
                >
                  <AppIcon name="InformationCircleIcon" />
                  About
                </UnifiedButton>
                <UnifiedButton
                  :variant="activeHelpTab === 'tips' ? 'glass' : 'ghost'"
                  size="sm"
                  class="glass-tab-button"
                  @click="activeHelpTab = 'tips'"
                >
                  <AppIcon name="LightBulbIcon-outline" />
                  Tips & Help
                </UnifiedButton>
              </div>

              <!-- Tab Content -->
              <div class="glass-tab-content">
                <!-- About Tab -->
                <div v-if="activeHelpTab === 'about'" class="tab-pane">
                  <AboutCard
                    :logo-src="logoSrc"
                    :app-version="appVersion"
                    @show-changelog="showChangelog"
                    @report-issue="reportIssue"
                    @request-feature="requestFeature"
                    @contact-support="contactSupport"
                    @show-privacy="showPrivacy"
                    @show-terms="showTerms"
                  />
                </div>

                <!-- Tips Tab -->
                <div v-if="activeHelpTab === 'tips'" class="tab-pane">
                  <TipsRecommendationsCard
                    :tips="tipsData"
                    :recommendations="recommendationsData"
                    @tip-action="handleTipAction"
                    @complete-recommendation="completeRecommendation"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sticky Save Bar -->
      <div v-show="isDirty" class="settings-save-bar glass p-glass-md gap-glass-md rounded-lg neon-interactive" style="position: fixed; bottom: var(--spacing-4); right: var(--spacing-4); z-index: 100;">
        <div class="flex items-center gap-glass-md">
          <div class="flex items-center gap-glass-sm">
            <AppIcon name="mdi-content-save" style="color: var(--color-warning-500);" />
            <span style="color: var(--text-secondary); font-size: 0.875rem;">
              {{ saving ? 'Saving changes…' : 'Unsaved changes' }}
            </span>
          </div>
          <div class="flex gap-glass-sm">
            <UnifiedButton variant="ghost" size="sm" leading-icon="mdi-backup-restore" @click="resetToDefaults">
              Reset
            </UnifiedButton>
            <UnifiedButton variant="primary" size="sm" :disabled="saving" leading-icon="mdi-content-save" @click="saveAllSettings">
              {{ saving ? 'Saving…' : 'Save All' }}
            </UnifiedButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Search Modal -->
    <ModalBase
      v-if="showSearchModal"
      title="Search Settings"
      @close="showSearchModal = false"
    >
      <div style="padding: var(--spacing-4);">
        <input
          v-model="searchQuery"
          type="text"
          class="glass-input w-100 mb-3"
          placeholder="Search for settings, features, or options..."
          style="font-size: 1.1rem; padding: var(--spacing-4);"
        />
        <div v-if="filteredSearchResults?.length" class="search-results">
          <div
            v-for="result in filteredSearchResults.slice(0, 10)"
            :key="result.id"
            class="search-result-item"
            style="padding: var(--spacing-3); border-b: 1px solid var(--glass-border); cursor: pointer;"
            @click="activeTab = result.tab; showSearchModal = false"
          >
            <div class="flex items-center gap-glass-md">
              <AppIcon :name="result.icon" />
              <div>
                <div style="font-weight: 500;">{{ result.title }}</div>
                <div style="font-size: 0.875rem; color: var(--text-secondary);">{{ result.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalBase>
  </StandardPageLayout>
</template>

<script setup>
import { ArrowDownTrayIcon, BriefcaseIcon, ChartBarIcon, ChartBarSquareIcon, CogIcon, CommandLineIcon, CpuChipIcon, InformationCircleIcon, MagnifyingGlassIcon, MicrophoneIcon, PuzzlePieceIcon, UserIcon, WrenchScrewdriverIcon } from '@heroicons/vue/24/outline'
import { TrophyIcon } from '@heroicons/vue/24/solid'

import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUnifiedTheme } from '@/shared/composables/useUnifiedTheme'

// Components
import StandardPageLayout from '@/components/layout/StandardPageLayout.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import HeaderActions from '@/components/ui/HeaderActions.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import GlassNavTabs from '@/components/GlassNavTabs.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import ModalBase from '@/components/ui/ModalBase.vue'
import ContentLoader from '@/components/LoadingIndicator.vue'
import LoadingSkeletons from '@/components/LoadingSkeletons.vue'
import AIIntegrationPanel from '@/components/AIIntegrationPanel.vue'

// Voice routing
import { setVoiceRoutingPreferences } from '@/utils/voice'

// Settings Components
import ProfileSection from '@/components/settings/ProfileSection.vue'
import GamingProfileSection from '@/components/settings/GamingProfileSection.vue'
import ApiConfigurationSection from '@/components/settings/ApiConfigurationSection.vue'
import ApplicationPreferencesSection from '@/components/settings/ApplicationPreferencesSection.vue'
import AudioHardwareSection from '@/components/settings/AudioHardwareSection.vue'
import VoiceExperienceSection from '@/components/settings/VoiceExperienceSection.vue'
import GamingCareerSection from '@/components/settings/GamingCareerSection.vue'
import JobDataSourcesSection from '@/components/settings/JobDataSourcesSection.vue'
import DataManagementSection from '@/components/settings/DataManagementSection.vue'
import UsageStatisticsCard from '@/components/settings/UsageStatisticsCard.vue'
import GamificationDashboard from '@/components/GamificationDashboard.vue'
import DeveloperSettingsSection from '@/components/settings/DeveloperSettingsSection.vue'
import SystemConfigurationSection from '@/components/settings/SystemConfigurationSection.vue'
import AboutCard from '@/components/settings/AboutCard.vue'
import TipsRecommendationsCard from '@/components/settings/TipsRecommendationsCard.vue'

// Store and Theme
const route = useRoute()
const store = useAppStore()
const theme = useUnifiedTheme()

// Reactive State - Support URL parameters for direct navigation
const activeTab = ref(route.query.tab || 'profile')
const activeProfileTab = ref('personal')
const activeAITab = ref('gemini')
const activeSystemTab = ref('interface')
const activeCareerTab = ref('gaming')
const activeInsightsTab = ref('stats')
const activeAdvancedTab = ref('developer')
const activeHelpTab = ref('about')
const searchQuery = ref('')
const showSearchModal = ref(false)
const showApiKey = ref(false)
const saving = ref(false)
const testing = ref(false)
const connecting = ref(false)
const loadingModels = ref(false)
const apiTestResult = ref(null)

// Settings Data
const settings = computed(() => store.settings || {})
const userProfile = computed(() => {
  const profile = store.userProfile || {}
  return {
    personalInfo: profile.personalInfo || {},
    gamingProfile: profile.gamingProfile || {},
    careerProfile: profile.careerProfile || {},
    careerPreferences: profile.careerPreferences || {},
    ...profile
  }
})

// Defensive computed properties to prevent [object Promise] issues
const safeAvailableModels = computed(() => {
  const models = store.availableModels
  return Array.isArray(models) ? models : []
})

const safeSelectedModelInfo = computed(() => {
  const info = store.selectedModelInfo
  // Only return if it's a plain object (not a Promise)
  if (info && typeof info === 'object' && !('then' in info)) {
    return info
  }
  return null
})

// Logical Tab Organization
const logicalTabGroups = computed(() => [
  {
    key: 'profile',
    label: 'Profile & Identity',
    icon: 'UserIcon-card-details',
    description: 'Personal and gaming profile information',
    category: 'essentials'
  },
  {
    key: 'ai',
    label: 'AI & Automation',
    icon: 'mdi-brain',
    description: 'AI services and intelligent features',
    category: 'features'
  },
  {
    key: 'system',
    label: 'System & Interface',
    icon: 'mdi-tune-vertical',
    description: 'App preferences and hardware settings',
    category: 'system'
  },
  {
    key: 'career',
    label: 'Career & Data',
    icon: 'mdi-briefcase-search-outline',
    description: 'Job search and data management',
    category: 'data'
  },
  {
    key: 'insights',
    label: 'Insights & Progress',
    icon: 'ChartBarIcon-timeline-variant',
    description: 'Usage statistics and achievements',
    category: 'analytics'
  },
  {
    key: 'advanced',
    label: 'Advanced & Developer',
    icon: 'mdi-console-line',
    description: 'Developer tools and system configuration',
    category: 'advanced'
  },
  {
    key: 'about',
    label: 'Help & About',
    icon: 'QuestionMarkCircleIcon-circle-outline',
    description: 'App info and support resources',
    category: 'support'
  }
])

// Quick Access Tabs
const quickAccessTabs = computed(() => [
  { key: 'profile', shortLabel: 'Profile', icon: 'UserIcon-card-details' },
  { key: 'ai', shortLabel: 'AI', icon: 'mdi-brain' },
  { key: 'system', shortLabel: 'System', icon: 'mdi-tune-vertical' },
  { key: 'career', shortLabel: 'Career', icon: 'mdi-briefcase-search-outline' }
])

// Search functionality
const searchResults = computed(() => {
  const allSettings = [
    { id: 'profile-name', title: 'Personal Profile', description: 'Name, email, contact information', tab: 'profile', icon: 'UserIcon' },
    { id: 'gaming-profile', title: 'Gaming Profile', description: 'Studio preferences, roles, experience', tab: 'profile', icon: 'DevicePhoneMobileIcon' },
    { id: 'api-keys', title: 'API Configuration', description: 'Gemini API key and AI services', tab: 'ai', icon: 'KeyIcon' },
    { id: 'ai-settings', title: 'AI Features', description: 'AI model preferences and behavior', tab: 'ai', icon: 'mdi-robot' },
    { id: 'theme-settings', title: 'Theme & Display', description: 'Dark mode, density, appearance', tab: 'system', icon: 'SwatchIcon' },
    { id: 'audio-hardware', title: 'Audio Hardware', description: 'Microphone, speakers, voice settings', tab: 'system', icon: 'MicrophoneIcon' },
    { id: 'job-sources', title: 'Job Data Sources', description: 'Gaming studios and job boards', tab: 'career', icon: 'CircleStackIcon' },
    { id: 'usage-stats', title: 'Usage Statistics', description: 'App usage and performance metrics', tab: 'insights', icon: 'ChartBarIcon-box' },
    { id: 'developer-tools', title: 'Developer Settings', description: 'Debug mode, logs, advanced options', tab: 'advanced', icon: 'mdi-code-tags' }
  ]
  return allSettings
})

const filteredSearchResults = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  return searchResults.value.filter(item =>
    item.title.toLowerCase().includes(query) ||
    item.description.toLowerCase().includes(query)
  )
})

// Profile completeness calculation
const profileCompleteness = computed(() => {
  const profile = userProfile.value
  if (!profile) return 0
  
  let completed = 0
  let total = 0
  
  // Personal info fields
  const personalFields = ['name', 'email', 'phone', 'location']
  personalFields.forEach(field => {
    total++
    if (profile.personalInfo?.[field]) completed++
  })
  
  // Gaming profile fields
  const gamingFields = ['preferredRoles', 'experienceLevel', 'portfolioUrl']
  gamingFields.forEach(field => {
    total++
    if (profile.gamingProfile?.[field]) completed++
  })
  
  return total > 0 ? (completed / total) * 100 : 0
})

// State tracking
const originalSettings = ref(null)
const originalUserProfile = ref(null)

// Initialize original state for dirty tracking
onMounted(() => {
  originalSettings.value = JSON.parse(JSON.stringify(settings.value))
  originalUserProfile.value = JSON.parse(JSON.stringify(userProfile.value))
})

const isDirty = computed(() => {
  if (!originalSettings.value || !originalUserProfile.value) return false
  
  // Deep comparison function
  const hasChanges = (original, current) => {
    if (original === current) return false
    if (typeof original !== typeof current) return true
    if (original === null || current === null) return original !== current
    
    if (typeof original === 'object') {
      const originalKeys = Object.keys(original)
      const currentKeys = Object.keys(current)
      
      if (originalKeys.length !== currentKeys.length) return true
      
      for (const key of originalKeys) {
        if (hasChanges(original[key], current[key])) return true
      }
      return false
    }
    
    return original !== current
  }
  
  // Check if settings have been modified
  const settingsChanged = hasChanges(originalSettings.value, settings.value)
  const profileChanged = hasChanges(originalUserProfile.value, userProfile.value)
  
  return settingsChanged || profileChanged
})

// Methods
const saveAllSettings = async () => {
  saving.value = true
  try {
    // Save settings only - user profile is handled through individual section saves
    const success = store.updateSettings(settings.value)
    
    if (!success) {
      throw new Error('Failed to update settings')
    }
    
    // Reset original values after successful save
    originalSettings.value = JSON.parse(JSON.stringify(settings.value))
    originalUserProfile.value = JSON.parse(JSON.stringify(userProfile.value))
    
    // Show success notification
  } catch (error) {
    console.error('Failed to save settings:', error)
    // Show error notification
  } finally {
    saving.value = false
  }
}

const saveSettings = async (settingsData) => {
  await store.updateSettings(settingsData)
}

const updateVoiceSettings = async (voiceSettings) => {
  // Extract voice settings and update the main settings object
  const updatedSettings = {
    voiceMode: voiceSettings.voiceMode,
    ttsProvider: voiceSettings.ttsProvider,
    kokoroModel: voiceSettings.kokoroModel,
    voiceHandsFree: voiceSettings.voiceHandsFree,
    chatCuesMuted: voiceSettings.chatCuesMuted
  }
  
  await store.updateSettings(updatedSettings)
}

const updateSetting = async (key, value) => {
  // Update the reactive settings object
  settings.value[key] = value
  
  // Auto-save individual setting changes
  try {
    await store.updateSettings({ [key]: value })
  } catch (error) {
    console.error(`Failed to update setting ${key}:`, error)
  }
}

const resetToDefaults = async () => {
  if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
    await store.resetSettings()
    
    // Reset original values after successful reset
    originalSettings.value = JSON.parse(JSON.stringify(settings.value))
    originalUserProfile.value = JSON.parse(JSON.stringify(userProfile.value))
  }
}

const exportSettings = () => {
  const data = {
    settings: settings.value,
    profile: userProfile.value,
    exportDate: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `navi-settings-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// Mock data for components that need it
const logoSrc = computed(() => {
  // Use theme-appropriate logo (align with useUnifiedTheme API)
  try {
    return theme?.isDark?.value ? '/logoDark.svg' : '/logoLight.svg'
  } catch {
    return '/logoLight.svg'
  }
})
const appVersion = ref('2.0.0')
// Theme management - unused for now but kept for theme expansion
const _availableThemes = ref(['light', 'dark', 'auto'])
const usageStats = ref({})
const tipsData = ref([])
const recommendationsData = ref([])

// Audio device management
const loadingDevices = ref(false)
const audioDevices = ref([])
const voices = ref([])

// Event handlers
const handleTipAction = (tip) => {
  // Show a success notification for the tip action
  if (tip && tip.title) {
    // Use the store's notification system if available, otherwise fall back to alert
    if (store.showNotification) {
      store.showNotification({
        type: 'success',
        message: `Tip action completed: ${tip.title}`,
        duration: 3000
      })
    } else {
      alert(`Tip: ${tip.title}`)
    }
  }
}

const completeRecommendation = (recommendation) => {
  if (recommendation && recommendation.id) {
    // Mark the recommendation as completed in the store or local state
    if (store.completeRecommendation) {
      store.completeRecommendation(recommendation.id)
    }
    
    // Show success notification
    if (store.showNotification) {
      store.showNotification({
        type: 'success',
        message: `Recommendation completed: ${recommendation.title || 'Task completed'}`,
        duration: 3000
      })
    } else {
      alert(`Completed: ${recommendation.title || 'Task completed'}`)
    }
    
    // Remove the completed recommendation from the list
    recommendationsData.value = recommendationsData.value.filter(
      rec => rec.id !== recommendation.id
    )
  }
}

const exportUserData = () => {
  // Prepare all user data for export
  const exportData = {
    version: appVersion.value,
    exportDate: new Date().toISOString(),
    profile: userProfile.value,
    settings: settings.value,
    usageStats: usageStats.value,
    tips: tipsData.value,
    recommendations: recommendationsData.value
  }

  // Create a blob and download link
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `navi-user-data-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)

  // Show success notification
  if (store.showNotification) {
    store.showNotification({
      type: 'success',
      message: 'User data exported successfully',
      duration: 3000
    })
  } else {
    alert('User data exported successfully')
  }
}

const importUserData = () => {
  // Create a file input element
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  
  input.onchange = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    try {
      const fileContent = await file.text()
      const importedData = JSON.parse(fileContent)
      
      // Validate the imported data structure
      if (!importedData || typeof importedData !== 'object') {
        throw new Error('Invalid file format')
      }
      
      // Check if this is a NAVI export file
      if (!importedData.version || !importedData.exportDate) {
        throw new Error('Not a valid NAVI data export file')
      }
      
      // Confirm with user before importing
      if (confirm('Are you sure you want to import this data? This will overwrite your current settings and profile.')) {
        // Import profile data if available
        if (importedData.profile && store.saveUserProfile) {
          await store.saveUserProfile(importedData.profile)
        }
        
        // Import settings data if available
        if (importedData.settings && store.saveSettings) {
          await store.saveSettings(importedData.settings)
        }
        
        // Update local state if needed
        if (importedData.tips && Array.isArray(importedData.tips)) {
          tipsData.value = importedData.tips
        }
        
        if (importedData.recommendations && Array.isArray(importedData.recommendations)) {
          recommendationsData.value = importedData.recommendations
        }
        
        // Show success notification
        if (store.showNotification) {
          store.showNotification({
            type: 'success',
            message: 'User data imported successfully',
            duration: 3000
          })
        } else {
          alert('User data imported successfully')
        }
      }
    } catch (error) {
      console.error('Failed to import user data:', error)
      
      // Show error notification
      if (store.showNotification) {
        store.showNotification({
          type: 'error',
          message: `Import failed: ${error.message || 'Invalid file format'}`,
          duration: 5000
        })
      } else {
        alert(`Import failed: ${error.message || 'Invalid file format'}`)
      }
    }
  }
  
  // Trigger the file selection dialog
  input.click()
}

const clearAppCache = () => {
  if (confirm('Are you sure you want to clear the application cache? This will remove temporary data but preserve your settings and profile.')) {
    try {
      // Clear localStorage cache
      const keysToPreserve = ['userProfile', 'settings', 'authToken', 'sessionData']
      const allKeys = Object.keys(localStorage)
      
      for (const key of allKeys) {
        if (!keysToPreserve.includes(key) && !key.startsWith('navi-')) {
          localStorage.removeItem(key)
        }
      }
      
      // Clear sessionStorage
      sessionStorage.clear()
      
      // Clear IndexedDB if available
      if (window.indexedDB && window.indexedDB.databases) {
        window.indexedDB.databases().then((databases) => {
          for (const db of databases) {
            if (db.name && db.name.includes('navi-cache')) {
              window.indexedDB.deleteDatabase(db.name)
            }
          }
        }).catch(console.error)
      }
      
      // Clear service worker cache if available
      if ('caches' in window) {
        window.caches.keys().then((cacheNames) => {
          for (const cacheName of cacheNames) {
            if (cacheName.includes('navi') || cacheName.includes('workbox')) {
              window.caches.delete(cacheName)
            }
          }
        })
      }
      
      // Show success notification
      if (store.showNotification) {
        store.showNotification({
          type: 'success',
          message: 'Application cache cleared successfully',
          duration: 3000
        })
      } else {
        alert('Application cache cleared successfully')
      }
    } catch (error) {
      console.error('Failed to clear cache:', error)
      
      // Show error notification
      if (store.showNotification) {
        store.showNotification({
          type: 'error',
          message: 'Failed to clear cache. Some data may still be cached.',
          duration: 5000
        })
      } else {
        alert('Failed to clear cache. Some data may still be cached.')
      }
    }
  }
}

const resetAllSettings = () => {
  resetToDefaults()
}

const exportDebugInfo = () => {
  // Gather comprehensive debug information using window object for browser APIs
  const debugInfo = {
    version: appVersion.value,
    timestamp: new Date().toISOString(),
    userAgent: window.navigator.userAgent,
    platform: window.navigator.platform,
    language: window.navigator.language,
    online: window.navigator.onLine,
    hardwareConcurrency: window.navigator.hardwareConcurrency || 'unknown',
    deviceMemory: window.navigator.deviceMemory || 'unknown',
    cookieEnabled: window.navigator.cookieEnabled,
    javaEnabled: window.navigator.javaEnabled ? window.navigator.javaEnabled() : false,
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      colorDepth: window.screen.colorDepth,
      pixelDepth: window.screen.pixelDepth
    },
    window: {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight
    },
    location: {
      href: window.location.href,
      origin: window.location.origin,
      protocol: window.location.protocol,
      host: window.location.host
    },
    localStorageKeys: Object.keys(window.localStorage),
    sessionStorageKeys: Object.keys(window.sessionStorage),
    settings: settings.value,
    profile: userProfile.value,
    storeState: store ? { 
      availableModels: store.availableModels,
      selectedModelInfo: store.selectedModelInfo,
      loading: store.loading
    } : 'Store not available'
  }

  // Create and download debug info file
  const blob = new Blob([JSON.stringify(debugInfo, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `navi-debug-info-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)

  // Show success notification
  if (store?.showNotification) {
    store.showNotification({
      type: 'success',
      message: 'Debug information exported successfully',
      duration: 3000
    })
  } else {
    alert('Debug information exported successfully')
  }
}

const showChangelog = () => {
  // Create a modal or open a dialog showing the changelog
  const changelogContent = `
# NAVI Changelog

## Version 2.0.0
- Complete UI overhaul with glass morphism design
- Enhanced profile management with tabbed interface
- Advanced AI integration with multiple model support
- Comprehensive settings organization with logical grouping
- Improved data export/import functionality
- Added debug information export capability

## Version 1.5.0
- Initial gamification system implementation
- Basic AI assistant integration
- Profile completion tracking
- Settings search functionality

## Version 1.0.0
- Initial release
- Basic profile management
- Simple settings interface
- Foundation for gaming career tools
`

  // Show changelog in a modal or alert
  if (store?.showModal) {
    store.showModal({
      title: 'NAVI Changelog',
      content: changelogContent,
      type: 'info'
    })
  } else {
    alert(changelogContent)
  }
}

const reportIssue = () => {
  // Create a GitHub issue URL with pre-filled template
  const issueTitle = encodeURIComponent('Bug Report: [Please describe the issue]')
  const issueBody = encodeURIComponent(`
## Bug Description
[Please describe the bug in detail]

## Steps to Reproduce
1. [First step]
2. [Second step]
3. [Third step]

## Expected Behavior
[What you expected to happen]

## Actual Behavior
[What actually happened]

## Environment
- **App Version:** ${appVersion.value}
- **Browser:** ${window.navigator.userAgent}
- **OS:** ${window.navigator.platform}

## Screenshots
[If applicable, add screenshots to help explain your problem]

## Additional Context
[Add any other context about the problem here]
  `.trim())

  const githubUrl = `https://github.com/d4551/navi2/issues/new?title=${issueTitle}&body=${issueBody}`

  // Open GitHub issue page in new tab
  window.open(githubUrl, '_blank', 'noopener,noreferrer')

  // Show notification
  if (store?.showNotification) {
    store.showNotification({
      type: 'info',
      message: 'Opening GitHub issue page for bug reporting',
      duration: 3000
    })
  }
}

const requestFeature = () => {
  // Create a GitHub issue URL for feature requests with pre-filled template
  const issueTitle = encodeURIComponent('Feature Request: [Please describe the feature]')
  const issueBody = encodeURIComponent(`
## Feature Description
[Please describe the feature you would like to see in detail]

## Problem This Feature Solves
[Explain the problem or use case this feature would address]

## Proposed Solution
[Describe how you envision this feature working]

## Alternative Solutions
[Describe any alternative solutions or features you've considered]

## Additional Context
[Add any other context, screenshots, or mockups about the feature request here]

## Environment
- **App Version:** ${appVersion.value}
- **Browser:** ${window.navigator.userAgent}
- **OS:** ${window.navigator.platform}
  `.trim())

  const githubUrl = `https://github.com/d4551/navi2/issues/new?title=${issueTitle}&body=${issueBody}&labels=enhancement`

  // Open GitHub issue page in new tab
  window.open(githubUrl, '_blank', 'noopener,noreferrer')

  // Show notification
  if (store?.showNotification) {
    store.showNotification({
      type: 'info',
      message: 'Opening GitHub for feature request submission',
      duration: 3000
    })
  }
}

const contactSupport = () => {
  // Open email client with support email
  const subject = encodeURIComponent('NAVI Support Request')
  const body = encodeURIComponent(`
Hello NAVI Support Team,

I need assistance with the following:

[Please describe your issue or question in detail]

App Version: ${appVersion.value}
Browser: ${window.navigator.userAgent}
Operating System: ${window.navigator.platform}

Best regards,
[Your Name]
  `.trim())

  const mailtoUrl = `mailto:support@navi-app.com?subject=${subject}&body=${body}`

  // Open email client
  window.location.href = mailtoUrl

  // Show notification
  if (store?.showNotification) {
    store.showNotification({
      type: 'info',
      message: 'Opening email client for support contact',
      duration: 3000
    })
  }
}

const showPrivacy = () => {
  // Display privacy policy in a modal or alert
  const privacyContent = `
# NAVI Privacy Policy

## Last Updated: ${new Date().toISOString().split('T')[0]}

### 1. Information We Collect
We collect information you provide directly to us, such as when you create an account, update your profile, or use our services. This may include:
- Personal identification information (name, email address, etc.)
- Professional and career information
- Gaming preferences and experience
- Usage data and preferences

### 2. How We Use Your Information
We use the information we collect to:
- Provide, maintain, and improve our services
- Personalize your experience and content
- Develop new products and services
- Communicate with you about products, services, offers, and events

### 3. Information Sharing
We do not sell your personal information. We may share your information with:
- Service providers who assist us in operating our services
- Professional advisors (lawyers, bankers, auditors, etc.)
- When required by law or to protect our rights

### 4. Data Security
We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.

### 5. Your Rights
You have the right to:
- Access and receive a copy of your personal information
- Correct or update your information
- Delete your information
- Object to or restrict certain processing activities

### 6. Contact Us
If you have questions about this privacy policy, please contact us at privacy@navi-app.com.
`

  // Show privacy policy in a modal or alert
  if (store?.showModal) {
    store.showModal({
      title: 'NAVI Privacy Policy',
      content: privacyContent,
      type: 'info'
    })
  } else {
    alert(privacyContent)
  }
}

const showTerms = () => {
  // Display terms of service in a modal or alert
  const termsContent = `
# NAVI Terms of Service

## Last Updated: ${new Date().toISOString().split('T')[0]}

### 1. Acceptance of Terms
By accessing or using NAVI, you agree to be bound by these Terms of Service and our Privacy Policy.

### 2. Description of Service
NAVI provides career development tools, AI-assisted job search features, and gaming industry insights.

### 3. User Accounts
You are responsible for maintaining the confidentiality of your account and password and for restricting access to your device.

### 4. User Conduct
You agree not to use the service for any illegal purpose or in violation of any laws in your jurisdiction.

### 5. Intellectual Property
All content included on this site, such as text, graphics, logos, and software, is the property of NAVI or its content suppliers.

### 6. Limitation of Liability
NAVI shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.

### 7. Changes to Terms
We reserve the right to modify these terms at any time. We will provide notice of significant changes.

### 8. Contact Information
For questions about these terms, please contact us at terms@navi-app.com.
`

  // Show terms in a modal or alert
  if (store?.showModal) {
    store.showModal({
      title: 'NAVI Terms of Service',
      content: termsContent,
      type: 'info'
    })
  } else {
    alert(termsContent)
  }
}

const exportUsageStats = () => {
  // Prepare usage statistics for export
  const exportData = {
    version: appVersion.value,
    exportDate: new Date().toISOString(),
    statistics: usageStats.value,
    profile: {
      name: userProfile.value.personalInfo?.name,
      email: userProfile.value.personalInfo?.email
    }
  }

  // Create a blob and download link
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `navi-usage-stats-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)

  // Show success notification
  if (store?.showNotification) {
    store.showNotification({
      type: 'success',
      message: 'Usage statistics exported successfully',
      duration: 3000
    })
  } else {
    alert('Usage statistics exported successfully')
  }
}

const resetUsageStats = () => {
  if (confirm('Are you sure you want to reset all usage statistics? This action cannot be undone.')) {
    // Reset usage statistics to empty object
    usageStats.value = {}
    
    // Optionally, reset in the store if available
    if (store?.resetUsageStatistics) {
      store.resetUsageStatistics()
    }

    // Show success notification
    if (store?.showNotification) {
      store.showNotification({
        type: 'success',
        message: 'Usage statistics reset successfully',
        duration: 3000
      })
    } else {
      alert('Usage statistics reset successfully')
    }
  }
}

// AI Configuration methods
const testApiKey = async () => {
  testing.value = true
  apiTestResult.value = null
  try {
    // Test the API key using the store
    const result = await store.testGeminiApiKey()
    apiTestResult.value = {
      success: result.success,
      message: result.message || (result.success ? 'API key is valid' : 'API key test failed')
    }
  } catch (error) {
    apiTestResult.value = {
      success: false,
      message: error.message || 'Failed to test API key'
    }
  } finally {
    testing.value = false
  }
}

const connectApiKey = async () => {
  connecting.value = true
  try {
    // Connect the API key using the store
    await store.connectGeminiApi()
    // Load available models after connection
    await loadModels()
  } catch (error) {
    console.error('Failed to connect API key:', error)
  } finally {
    connecting.value = false
  }
}

const loadModels = async () => {
  loadingModels.value = true
  try {
    // Load available models from the store
    await store.loadAvailableModels()
  } catch (error) {
    console.error('Failed to load models:', error)
  } finally {
    loadingModels.value = false
  }
}

// Update voice routing preferences when settings change
const updateVoiceRouting = () => {
  const voiceSettings = settings.value.voice || {}
  setVoiceRoutingPreferences({
    ttsProvider: voiceSettings.ttsProvider || 'system',
    sttProvider: voiceSettings.sttProvider || 'system',
    micDeviceId: voiceSettings.micDeviceId || '',
    speakerDeviceId: voiceSettings.speakerDeviceId || '',
    lang: voiceSettings.lang || 'en-US'
  })
}

// Clear application logs
const clearApplicationLogs = () => {
  if (confirm('Are you sure you want to clear all application logs? This action cannot be undone.')) {
    try {
      // Clear console logs if available
      if (console.clear) {
        console.clear()
      }
      
      // Clear any stored logs in localStorage
      const logKeys = Object.keys(localStorage).filter(key => 
        key.includes('log') || key.includes('debug') || key.includes('error')
      )
      
      for (const key of logKeys) {
        localStorage.removeItem(key)
      }
      
      // Show success notification
      if (store.showNotification) {
        store.showNotification({
          type: 'success',
          message: 'Application logs cleared successfully',
          duration: 3000
        })
      } else {
        alert('Application logs cleared successfully')
      }
    } catch (error) {
      console.error('Failed to clear logs:', error)
      
      if (store.showNotification) {
        store.showNotification({
          type: 'error',
          message: 'Failed to clear logs completely',
          duration: 5000
        })
      } else {
        alert('Failed to clear logs completely')
      }
    }
  }
}

// Data Management Event Handlers
const exportResume = () => {
  // Future implementation: Export resume in PDF/Word format
  alert('Resume export will be implemented in future update')
}

const exportPortfolio = () => {
  // Future implementation: Export portfolio data
  alert('Portfolio export will be implemented in future update')  
}

const exportChatHistory = () => {
  try {
    const chatData = {
      chatHistory: store.chatHistory,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `navi-chat-history-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to export chat history:', error)
    alert('Failed to export chat history')
  }
}

const backupDatabase = () => {
  // Future implementation: Backup local SQLite database
  alert('Database backup will be implemented in future update')
}

const importResume = () => {
  // Future implementation: Import resume from file
  alert('Resume import will be implemented in future update')
}

const importPortfolio = () => {
  // Future implementation: Import portfolio data
  alert('Portfolio import will be implemented in future update')
}

const importFromLinkedIn = () => {
  // Future implementation: Import data from LinkedIn
  alert('LinkedIn import will be implemented in future update')
}

// Export user settings (alias for existing exportSettings)
const exportUserSettings = () => {
  exportSettings()
}

// Import user settings (alias for existing importUserData)
const importUserSettings = () => {
  importUserData()
}

// Update audio settings
const updateAudioSettings = (newSettings) => {
  settings.value = { ...settings.value, ...newSettings }
  saveSettings()
}

// Load audio devices
const loadAudioDevices = async () => {
  try {
    loadingDevices.value = true
    
    // Check for browser support
    if (!navigator?.mediaDevices?.getUserMedia) {
      throw new Error('Audio devices are not supported in this browser. Please use a modern browser like Chrome, Firefox, or Edge.')
    }
    
    // Request microphone permission first
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    
    // Get audio devices
    const devices = await navigator.mediaDevices.enumerateDevices()
    audioDevices.value = devices.filter(device => device.kind === 'audioinput')
    
    // Stop the stream since we only needed it for permissions
    stream.getTracks().forEach(track => track.stop())
    
    // Load available voices for TTS
    loadVoices()
    
  } catch (error) {
    console.error('Failed to load audio devices:', error)
    
    // Provide user-friendly error messages
    let userMessage = 'Failed to access audio devices'
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        userMessage = 'Microphone permission was denied. Please allow microphone access and try again.'
      } else if (error.name === 'NotFoundError') {
        userMessage = 'No microphone devices found. Please check your audio hardware.'
      } else if (error.name === 'NotSupportedError') {
        userMessage = 'Audio devices are not supported on this browser or device.'
      } else if (error.message.includes('not supported')) {
        userMessage = error.message
      }
    }
    
    if (store.showNotification) {
      store.showNotification({
        type: 'error',
        message: userMessage,
        duration: 5000
      })
    }
  } finally {
    loadingDevices.value = false
  }
}

// Load available TTS voices
const loadVoices = () => {
  if ('speechSynthesis' in window) {
    const updateVoices = () => {
      voices.value = window.speechSynthesis.getVoices()
    }
    
    updateVoices()
    
    // Some browsers load voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices
    }
  }
}

// Initialize voice routing and watch for changes
onMounted(() => {
  // Load initial data if needed
  updateVoiceRouting()
  
  // Load audio devices on mount
  loadAudioDevices()
  
  // Watch for changes to voice settings
  watch(() => settings.value.voice, () => {
    updateVoiceRouting()
  }, { deep: true })
})
</script>

<style scoped>
.settings-layout {
  min-height: 100vh;
  padding-bottom: 100px; /* Space for sticky save bar */
}

.settings-navigation {
  position: sticky;
  top: var(--spacing-4);
  z-index: 10;
}

.settings-group {
  margin-bottom: var(--spacing-8);
}

.group-header {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--glass-border);
}

.settings-grid {
  gap: var(--spacing-6);
}

.search-input-wrapper {
  position: relative;
}

.quick-filters {
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.settings-save-bar {
  position: fixed;
  bottom: var(--spacing-4);
  right: var(--spacing-4);
  z-index: 100;
  box-shadow: var(--glass-shadow);
}

.completion-badge {
  text-align: center;
  min-width: 80px;
}

.search-result-item {
  transition: background-color var(--duration-fast) var(--easing-ease-out);
}

.search-result-item:hover {
  background: var(--glass-hover-bg);
}

/* Enhanced Glass Components for Master Theme */
.enhanced-glass-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter, blur(16px));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-2xl);
  box-shadow: var(--glass-shadow);
  transition: all var(--duration-normal);
}

.enhanced-glass-card:hover {
  border-color: color-mix(in srgb, var(--color-primary-500) 30%, transparent);
  box-shadow: 
    var(--glass-shadow),
    0 8px 25px color-mix(in srgb, var(--color-primary-500) 10%, transparent);
}

.glass-section-header {
  position: relative;
  background: rgba(var(--glass-border-rgb, 255, 255, 255), 0.02);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.enhanced-search-input {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter, blur(12px));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  transition: all var(--duration-normal);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.enhanced-search-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 
    inset 0 1px 3px rgba(0, 0, 0, 0.1),
    0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent),
    var(--glass-shadow);
  background: var(--glass-hover-bg);
}

/* Enhanced Light/Dark Mode Integration for Settings */

/* Dark Theme Enhancements */
[data-theme="dark"] .enhanced-glass-card {
  background: var(--glass-bg);
  border-color: var(--glass-border);
  box-shadow: var(--glass-shadow);
}

[data-theme="dark"] .enhanced-profile-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  border-color: var(--glass-border);
}

[data-theme="dark"] .enhanced-search-input {
  background: var(--glass-bg);
  border-color: var(--glass-border);
  color: var(--text-primary-600);
}

[data-theme="dark"] .glass-tab-wrapper {
  background: var(--glass-bg);
  border-color: var(--glass-border);
  box-shadow: var(--glass-shadow);
}

[data-theme="dark"] .profile-tab-btn:not([data-variant="primary"]) {
  background: var(--glass-bg) !important;
  border-color: var(--glass-border) !important;
  color: var(--text-secondary) !important;
}

[data-theme="dark"] .profile-tab-btn:not([data-variant="primary"]):hover {
  background: var(--glass-hover-bg) !important;
  border-color: color-mix(in srgb, var(--color-primary-500) 40%, transparent) !important;
  color: var(--text-primary-600) !important;
}

/* Light Theme Enhancements */
[data-theme="light"] .enhanced-glass-card {
  background: var(--glass-bg);
  border-color: var(--glass-border);
  box-shadow: var(--glass-shadow);
}

[data-theme="light"] .enhanced-search-input:focus {
  background: var(--glass-hover-bg);
  border-color: var(--color-primary-500);
  box-shadow: 
    inset 0 1px 3px rgba(0, 0, 0, 0.1),
    0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent),
    var(--glass-shadow);
}

/* Smooth Theme Transitions */
.enhanced-glass-card,
.enhanced-profile-card,
.enhanced-search-input,
.glass-tab-wrapper,
.profile-tab-btn {
  transition: 
    background-color var(--duration-normal),
    border-color var(--duration-normal),
    color var(--duration-normal),
    box-shadow var(--duration-normal),
    backdrop-filter var(--duration-normal);
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  .enhanced-glass-card,
  .enhanced-profile-card {
    border-width: 2px;
    backdrop-filter: none;
  }
  
  .enhanced-search-input {
    border-width: 2px;
    backdrop-filter: none;
  }
  
  .glass-tab-wrapper {
    border-width: 2px;
    backdrop-filter: none;
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .enhanced-glass-card,
  .enhanced-profile-card,
  .enhanced-search-input,
  .glass-tab-wrapper,
  .profile-tab-btn {
    transition: none;
  }
  
  .enhanced-glass-card:hover,
  .enhanced-profile-card:hover {
    transform: none;
  }
}

/* Enhanced Profile Tab Styling with Master Theme */
.profile-main-card,
.enhanced-profile-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter, blur(16px));
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}

.enhanced-profile-card {
  position: relative;
  overflow: hidden;
}

.enhanced-profile-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%,
    color-mix(in srgb, var(--color-primary-500) 60%, transparent) 20%,
    color-mix(in srgb, var(--color-primary-500) 80%, transparent) 50%,
    color-mix(in srgb, var(--color-primary-500) 60%, transparent) 80%,
    transparent 100%);
  z-index: 1;
}

.profile-tabs-container {
  padding: var(--spacing-6);
}

.profile-tab-navigation {
  margin-bottom: var(--spacing-6);
}

.glass-tab-wrapper {
  display: flex;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
  background: var(--glass-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  backdrop-filter: var(--glass-backdrop-filter, blur(12px));
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.glass-tab-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent, 
    color-mix(in srgb, var(--color-primary-500) 40%, transparent), 
    transparent);
  opacity: 0.8;
}

.profile-tab-btn {
  transition: all var(--duration-normal) var(--easing-ease-out);
  border-radius: var(--radius-md) !important;
  font-weight: 500;
  font-size: 0.875rem;
}

.profile-tab-btn:not([data-variant="primary"]) {
  background: var(--glass-bg) !important;
  backdrop-filter: var(--glass-backdrop-filter) !important;
  -webkit-backdrop-filter: var(--glass-backdrop-filter) !important;
  border: 1px solid var(--glass-border) !important;
  box-shadow: var(--glass-shadow) !important;
  color: var(--text-primary-600) !important;
}

.profile-tab-btn:not([data-variant="primary"]):hover {
  background: var(--glass-hover-bg) !important;
  border-color: color-mix(in srgb, var(--color-primary-500) 40%, transparent) !important;
  transform: translateY(-1px);
  box-shadow: 
    var(--glass-shadow),
    0 0 12px color-mix(in srgb, var(--color-primary-500) 15%, transparent) !important;
}

.glass-tab-content {
  position: relative;
  padding: var(--spacing-2);
}

.profile-tab-pane {
  background: color-mix(in srgb, var(--glass-bg) 30%, transparent);
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--glass-border) 50%, transparent);
  padding: 0;
  backdrop-filter: blur(4px);
}

.glass-section {
  position: relative;
}

.glass-section-header {
  border-b: 1px solid color-mix(in srgb, var(--glass-border) 60%, transparent);
  padding-bottom: var(--spacing-3);
  margin-bottom: var(--spacing-5);
  position: relative;
}

.glass-section-header::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, 
    var(--color-primary-500), 
    color-mix(in srgb, var(--color-primary-500) 40%, transparent));
  border-radius: var(--radius-full);
}

.glass-form-grid {
  position: relative;
  display: grid;
  gap: var(--spacing-5);
}

.glass-form-field {
  position: relative;
}

.glass-label {
  position: relative;
  color: var(--text-secondary);
  font-weight: 600;
  margin-bottom: var(--spacing-2);
  display: block;
  font-size: 0.875rem !important;
  letter-spacing: 0.025em;
  text-transform: none;
}

.enhanced-glass-input {
  background: color-mix(in srgb, var(--glass-bg) 70%, transparent) !important;
  border: 1px solid color-mix(in srgb, var(--glass-border) 70%, transparent) !important;
  backdrop-filter: blur(8px) !important;
  transition: all var(--duration-normal) var(--easing-ease-out) !important;
}

.enhanced-glass-input:focus {
  background: color-mix(in srgb, var(--glass-bg) 85%, transparent) !important;
  border-color: color-mix(in srgb, var(--color-primary-500) 60%, transparent) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent) !important;
}

.enhanced-glass-input:hover:not(:focus) {
  border-color: color-mix(in srgb, var(--glass-border) 90%, var(--text-secondary)) !important;
  background: color-mix(in srgb, var(--glass-bg) 80%, transparent) !important;
}

@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr !important;
  }
  
  .quick-filters {
    width: 100%;
    justify-content: center;
  }
  
  .navigation-header > div {
    flex-direction: column;
    gap: var(--spacing-3);
  }
  
  .settings-save-bar {
    left: var(--spacing-4);
    right: var(--spacing-4);
    bottom: var(--spacing-4);
  }
  
  .glass-tab-wrapper {
    flex-direction: column;
    gap: var(--spacing-1);
  }
  
  .profile-tab-btn {
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .profile-tabs-container {
    padding: var(--spacing-4) !important;
  }
  
  .profile-tab-pane {
    padding: 0 !important;
  }
}

/* ===== AI & AUTOMATION ENHANCED STYLES ===== */

/* Glass Card Header Consistency */
.glass-card-header {
  padding: var(--spacing-6) var(--spacing-6) var(--spacing-4);
  border-b: 1px solid color-mix(in srgb, var(--glass-border) 50%, transparent);
  position: relative;
}

.glass-card-header::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: var(--spacing-6);
  right: var(--spacing-6);
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%,
    color-mix(in srgb, var(--color-primary-500) 40%, transparent) 20%,
    color-mix(in srgb, var(--color-primary-500) 60%, transparent) 50%,
    color-mix(in srgb, var(--color-primary-500) 40%, transparent) 80%,
    transparent 100%);
}

.header-content {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-4);
}

.header-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    color-mix(in srgb, var(--color-primary-500) 10%, transparent) 0%,
    color-mix(in srgb, var(--color-primary-500) 5%, transparent) 100%);
  border: 1px solid color-mix(in srgb, var(--color-primary-500) 20%, transparent);
  border-radius: var(--radius-xl);
  color: var(--color-primary-500);
  font-size: 1.25rem;
  backdrop-filter: blur(8px);
}

.header-text {
  flex: 1;
  min-width: 0;
}

.header-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  margin: 0 0 var(--spacing-1) 0;
  line-height: 1.3;
}

.header-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.glass-card-content {
  padding: var(--spacing-6);
}

/* Enhanced Tab Button Styling */
.glass-tab-button {
  transition: all var(--duration-normal) var(--easing-ease-out);
  border-radius: var(--radius-md) !important;
  font-weight: 500;
  font-size: 0.875rem;
  gap: var(--spacing-2);
}

.glass-tab-button:not([data-variant="glass"]) {
  background: var(--glass-bg) !important;
  backdrop-filter: var(--glass-backdrop-filter) !important;
  border: 1px solid var(--glass-border) !important;
  box-shadow: var(--glass-shadow) !important;
  color: var(--text-secondary) !important;
}

.glass-tab-button:not([data-variant="glass"]):hover {
  background: var(--glass-hover-bg) !important;
  border-color: color-mix(in srgb, var(--color-primary-500) 40%, transparent) !important;
  color: var(--text-primary-600) !important;
  transform: translateY(-1px);
  box-shadow: 
    var(--glass-shadow),
    0 0 12px color-mix(in srgb, var(--color-primary-500) 15%, transparent) !important;
}

/* Tab Pane Styling */
.tab-pane {
  background: color-mix(in srgb, var(--glass-bg) 30%, transparent);
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--glass-border) 50%, transparent);
  padding: var(--spacing-6);
  backdrop-filter: blur(4px);
  position: relative;
}

/* Enhanced Section Cards */
.enhanced-section-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  box-shadow: var(--glass-shadow);
  transition: all var(--duration-normal);
}

.enhanced-section-card:hover {
  border-color: color-mix(in srgb, var(--color-primary-500) 30%, transparent);
  box-shadow: 
    var(--glass-shadow),
    0 8px 25px color-mix(in srgb, var(--color-primary-500) 10%, transparent);
}

.section-header {
  border-b: 1px solid color-mix(in srgb, var(--glass-border) 60%, transparent);
  padding-bottom: var(--spacing-4);
  margin-bottom: var(--spacing-6);
  position: relative;
}

.section-header::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, 
    var(--color-primary-500), 
    color-mix(in srgb, var(--color-primary-500) 40%, transparent));
  border-radius: var(--radius-full);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  margin: 0 0 var(--spacing-2) 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.section-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

/* Provider Grid Layout */
.provider-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-4);
  margin-top: var(--spacing-6);
}

.provider-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-5);
  transition: all var(--duration-normal);
  position: relative;
  overflow: hidden;
}

.provider-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%,
    color-mix(in srgb, var(--color-primary-500) 60%, transparent) 50%,
    transparent 100%);
}

.provider-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--color-primary-500) 40%, transparent);
  box-shadow: 
    var(--glass-shadow),
    0 8px 20px color-mix(in srgb, var(--color-primary-500) 15%, transparent);
}

.provider-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-4);
}

.provider-icon {
  font-size: 1.5rem;
  color: var(--color-primary-500);
}

.provider-info {
  flex: 1;
}

.provider-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  margin: 0 0 var(--spacing-1) 0;
}

.provider-status {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-connected {
  background: color-mix(in srgb, var(--color-primary-500) 10%, transparent);
  color: var(--color-primary-500);
  border: 1px solid color-mix(in srgb, var(--color-primary-500) 20%, transparent);
}

.status-available {
  background: color-mix(in srgb, var(--color-secondary-500) 10%, transparent);
  color: var(--color-secondary-500);
  border: 1px solid color-mix(in srgb, var(--color-secondary-500) 20%, transparent);
}

.provider-features {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
}

.feature-tag {
  font-size: var(--font-size-xs);
  background: color-mix(in srgb, var(--glass-bg) 60%, transparent);
  color: var(--text-secondary);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-md);
  border: 1px solid color-mix(in srgb, var(--glass-border) 60%, transparent);
  backdrop-filter: blur(8px);
}

/* Advanced Settings Grid */
.advanced-settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-6);
  margin-top: var(--spacing-6);
}

.setting-group {
  background: color-mix(in srgb, var(--glass-bg) 40%, transparent);
  border: 1px solid color-mix(in srgb, var(--glass-border) 40%, transparent);
  border-radius: var(--radius-lg);
  padding: var(--spacing-5);
  backdrop-filter: blur(8px);
}

.setting-group-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary-600);
  margin: 0 0 var(--spacing-4) 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.9;
}

.glass-input {
  background: color-mix(in srgb, var(--glass-bg) 70%, transparent) !important;
  border: 1px solid color-mix(in srgb, var(--glass-border) 70%, transparent) !important;
  backdrop-filter: blur(8px) !important;
  color: var(--text-primary-600) !important;
  transition: all var(--duration-normal) var(--easing-ease-out) !important;
}

.glass-input:focus {
  background: color-mix(in srgb, var(--glass-bg) 85%, transparent) !important;
  border-color: color-mix(in srgb, var(--color-primary-500) 60%, transparent) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent) !important;
  outline: none !important;
}

.glass-slider {
  appearance: none;
  background: color-mix(in srgb, var(--glass-bg) 70%, transparent);
  border: 1px solid color-mix(in srgb, var(--glass-border) 70%, transparent);
  border-radius: var(--radius-full);
  height: 6px;
  backdrop-filter: blur(8px);
  transition: all var(--duration-normal);
}

.glass-slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-primary-500);
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all var(--duration-normal);
}

.glass-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary-500) 40%, transparent);
}

.range-value {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  margin-left: var(--spacing-2);
}

.toggle-field {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.glass-toggle {
  appearance: none;
  width: 44px;
  height: 24px;
  background: color-mix(in srgb, var(--glass-bg) 60%, transparent);
  border: 1px solid color-mix(in srgb, var(--glass-border) 60%, transparent);
  border-radius: var(--radius-full);
  position: relative;
  cursor: pointer;
  transition: all var(--duration-normal);
  backdrop-filter: blur(8px);
}

.glass-toggle::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  transition: all var(--duration-normal);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.glass-toggle:checked {
  background: var(--color-primary-500);
  border-color: var(--color-primary-500);
}

.glass-toggle:checked::before {
  transform: translateX(20px);
}

.toggle-label {
  font-size: var(--font-size-sm);
  color: var(--text-primary-600);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  flex: 1;
}

/* Responsive Adjustments for AI Section */
@media (max-width: 768px) {
  .provider-grid {
    grid-template-columns: 1fr;
  }
  
  .advanced-settings-grid {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .glass-card-header,
  .glass-card-content {
    padding: var(--spacing-4);
  }
  
  .setting-group {
    padding: var(--spacing-4);
  }
  
  .provider-card {
    padding: var(--spacing-4);
  }
}
</style>
