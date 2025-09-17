<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="settings-card glass-card section-card mb-4 font-sans" role="region" aria-labelledby="app-prefs-title">
    <div class="card-header section-header card-header--dense">
      <h5 id="app-prefs-title" class="mb-0">
        <SettingsIconComponent class="mr-2 icon-sm" />Application Preferences
      </h5>
    </div>
    <div class="card-body section-body card-body--dense">
      <!-- Theme Selection -->
      <div class="mb-3 p-glass-md border rounded-3 glass-input">
        <div class="flex justify-between items-center">
          <div>
            <label class="form-label font-medium mb-1">Theme</label>
            <div class="form-text">Switch between light, dark, and system theme preferences</div>
          </div>
          <ThemeToggle :compact="false" />
        </div>
      </div>

      <!-- Auto-save Settings -->
      <div class="mb-3 p-glass-md border rounded-3 glass-input">
        <div class="form-check form-switch mb-2">
          <input
            id="auto-save"
            v-model="settings.autoSave"
            class="form-check-input"
            type="checkbox"
          />
          <label class="form-check-label font-medium" for="auto-save">
            Auto-save changes
          </label>
        </div>
        <div class="form-text hint-chip" role="note">
          <SaveIconComponent />
          <span>Automatically saves your work as you type</span>
        </div>
      </div>

      <!-- Cover Letter Auto-Advance -->
      <div class="mb-3 p-glass-md border rounded-3 glass-input">
        <div class="form-check form-switch mb-2">
          <input
            id="cl-auto-advance"
            v-model="settings.coverLetterAutoAdvance"
            class="form-check-input"
            type="checkbox"
          />
          <label class="form-check-label font-medium" for="cl-auto-advance">
            Auto-advance Cover Letter steps
          </label>
        </div>
        <div class="form-text hint-chip" role="note">
          <SettingsIconComponent />
          <span>Automatically move to the next step after key actions (analyze, generate, review).</span>
        </div>
      </div>

      <!-- Notification Preferences -->
      <div class="mb-3 p-glass-md border rounded-3 glass-input">
        <label class="form-label font-medium mb-3">Notifications</label>
        <div class="flex flex-wrap g-3">
          <div class="flex-1-sm-6">
            <div class="form-check form-switch">
              <input
                id="notify-updates"
                v-model="settings.notifications.updates"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label" for="notify-updates">
                Update notifications
              </label>
            </div>
          </div>
          <div class="flex-1-sm-6">
            <div class="form-check form-switch">
              <input
                id="notify-errors"
                v-model="settings.notifications.errors"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label" for="notify-errors">
                Error notifications
              </label>
            </div>
          </div>
          <div class="flex-1-sm-6">
            <div class="form-check form-switch">
              <input
                id="notify-success"
                v-model="settings.notifications.success"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label" for="notify-success">
                Success notifications
              </label>
            </div>
          </div>
          <div class="flex-1-sm-6">
            <div class="form-check form-switch">
              <input
                id="notify-chat"
                v-model="settings.notifications.chat"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label" for="notify-chat">
                Chat notifications
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Settings -->
      <div class="mb-3 p-glass-md border rounded-3 glass-input">
        <label class="form-label font-medium mb-3">Performance</label>
        <div class="flex flex-wrap g-3">
          <div class="flex-1-sm-6">
            <div class="form-check form-switch">
              <input
                id="reduced-motion"
                v-model="settings.reducedMotion"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label" for="reduced-motion">
                Reduced motion
              </label>
            </div>
            <div class="form-text">
              Minimizes animations and transitions for better
              performance.
            </div>
          </div>
          <div class="flex-1-sm-6">
            <div class="form-check form-switch">
              <input
                id="high-contrast"
                v-model="settings.highContrast"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label" for="high-contrast">
                High contrast mode
              </label>
            </div>
            <div class="form-text">
              Increases contrast for better visibility.
            </div>
          </div>
        </div>
      </div>

      <!-- Language & Localization -->
      <div class="mb-3 p-glass-md border rounded-3 glass-input">
        <label for="app-language" class="form-label font-medium">Application Language</label>
        <select
          id="app-language"
          v-model="settings.language"
          class="form-select glass-input"
          aria-describedby="language-help"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="it">Italiano</option>
          <option value="pt">Português</option>
          <option value="zh">中文</option>
          <option value="ja">日本語</option>
          <option value="ko">한국어</option>
        </select>
        <div id="language-help" class="form-text">
          Select your preferred language for the application interface.
        </div>
      </div>

      <!-- Data & Privacy -->
      <div class="mb-3 p-glass-md border rounded-3 glass-input">
        <label class="form-label font-medium mb-3">Data & Privacy</label>
        <div class="flex flex-wrap g-3">
          <div class="flex-1-sm-6">
            <div class="form-check form-switch">
              <input
                id="analytics"
                v-model="settings.analytics"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label" for="analytics">
                Usage analytics
              </label>
            </div>
            <div class="form-text">
              Help improve NAVI by sharing anonymous usage data.
            </div>
          </div>
          <div class="flex-1-sm-6">
            <div class="form-check form-switch">
              <input
                id="crash-reports"
                v-model="settings.crashReports"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label" for="crash-reports">
                Crash reports
              </label>
            </div>
            <div class="form-text">
              Automatically send crash reports to help fix issues.
            </div>
          </div>

          <div class="flex-1-12">
            <div class="form-check form-switch">
              <input
                id="data-encryption"
                v-model="settings.dataEncryption"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label" for="data-encryption">
                Encrypt stored data
              </label>
            </div>
            <div class="form-text">
              Encrypt sensitive data stored locally for enhanced security.
            </div>
          </div>

          <div class="flex-1-12">
            <div class="form-check form-switch">
              <input
                id="sync-disabled"
                v-model="settings.syncDisabled"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label" for="sync-disabled">
                Disable cloud sync
              </label>
            </div>
            <div class="form-text">
              Keep all data stored locally only, no cloud synchronization.
            </div>
          </div>

          <div class="flex-1-12">
            <div class="form-check form-switch">
              <input
                id="anonymize-data"
                v-model="settings.anonymizeData"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label" for="anonymize-data">
                Anonymize usage data
              </label>
            </div>
            <div class="form-text">
              Remove personal information from analytics and error reports.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  SettingsIconComponent,
  SaveIconComponent
} from './SettingsIcons.js'
import ThemeToggle from '@/components/ThemeToggle.vue'

export default {
  name: 'ApplicationPreferencesSection',
  components: {
    SettingsIconComponent,
    SaveIconComponent,
    ThemeToggle
  },
  props: {
    settings: {
      type: Object,
      required: true
    }
  },
  emits: []
}
</script>
