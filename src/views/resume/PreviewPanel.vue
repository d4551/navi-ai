<template>
  <div 
    class="preview-panel-wrapper"
    :class="theme?.getThemeClasses?.('resume-preview')"
  >
    <!-- Preview Controls Header -->
    <div class="preview-controls glass-elevated mb-3">
      <div
        class="d-flex align-items-center justify-content-between flex-wrap gap-3"
      >
        <div class="d-flex align-items-center gap-2">
          <h2 class="h6 mb-0 text-primary">
            <AppIcon name="mdi-eye" size="default" aria-hidden="true" />
            Live Preview
          </h2>
          <div class="live-indicator d-flex align-items-center">
            <div class="live-pulse me-2"></div>
            <small class="text-muted fw-medium">Auto-updating</small>
          </div>
        </div>

        <!-- Template Selector -->
        <div class="template-selector d-flex align-items-center gap-2">
          <label class="form-label mb-0 text-muted small d-none d-md-inline">Template:</label>
          <select
            class="form-select form-select-sm glass-input select-auto-width"
            :value="selectedTemplate"
            @change="$emit('update:selectedTemplate', $event.target.value)"
          >
            <option value="professional">Professional</option>
            <option value="creative">Creative</option>
            <option value="technical">Technical</option>
            <option value="modern">Modern</option>
            <option value="minimal">Minimal</option>
            <option v-if="canUseAI" value="ai-smart">AI Smart</option>
          </select>
          <div class="form-check form-switch ms-2" title="Toggle cover page (hero sheet)">
            <input id="toggleCoverPage" v-model="showCoverPage" class="form-check-input" type="checkbox">
            <label class="form-check-label small" for="toggleCoverPage">Cover</label>
          </div>
        </div>

        <!-- AI Template Button -->
        <UnifiedButton
          v-if="canUseAI"
          variant="outline"
          :loading="loading.templateGeneration"
          leading-icon="mdi-wand"
          :aria-label="loading.templateGeneration ? 'Generating smart template...' : 'Generate AI smart template'"
          @click="$emit('generate-smart-template')"
        >
          <span class="d-none d-lg-inline">Smart Template</span>
          <span class="d-lg-none">AI</span>
        </UnifiedButton>

        <!-- Additional AI Enhancement Actions -->
        <div v-if="canUseAI" class="ai-enhance-group d-flex flex-wrap gap-2">
          <UnifiedButton variant="ghost" size="sm" :disabled="loading.ai" leading-icon="mdi-text-box-check" title="AI optimize summary for clarity & impact" @click="emitOptimizeSummary">Improve Summary</UnifiedButton>
          <UnifiedButton variant="ghost" size="sm" :disabled="loading.ai" leading-icon="mdi-chart-bar" title="AI will try to add measurable impact to bullet points" @click="emitQuantifyExperience">Quantify</UnifiedButton>
          <UnifiedButton variant="ghost" size="sm" :disabled="loading.ai" leading-icon="mdi-lightbulb-on-outline" title="AI suggest missing relevant skills" @click="emitSuggestSkills">Skills</UnifiedButton>
        </div>
      </div>
    </div>

    <!-- Export Actions Bar -->
    <div class="export-actions glass-elevated mb-3">
      <div
        class="d-flex align-items-center justify-content-between flex-wrap gap-2"
      >
        <div class="d-flex align-items-center gap-2">
          <small class="text-muted fw-medium">Export Options:</small>
        </div>

        <div class="d-flex align-items-center gap-2" role="group" aria-label="Export and preview options">
          <UnifiedButton variant="ghost" :disabled="!hasContent" leading-icon="mdi-link-variant" aria-label="Open full preview in new window" @click="previewWindow">
            <span class="d-none d-sm-inline">Full Preview</span>
            <span class="d-sm-none">Preview</span>
          </UnifiedButton>
          <UnifiedButton variant="primary" :disabled="!hasContent || loading.export" :loading="loading.export" leading-icon="mdi-file-pdf-box" aria-label="Export resume as PDF" @click="exportPDF">PDF</UnifiedButton>
          <UnifiedButton variant="secondary" :disabled="!hasContent || loading.export" leading-icon="mdi-language-html5" aria-label="Export resume as HTML" @click="exportHTML">
            <span class="d-none d-lg-inline">HTML</span>
          </UnifiedButton>
          <UnifiedButton variant="outline" :disabled="!hasContent" leading-icon="mdi-clipboard-text-outline" aria-label="Copy HTML to clipboard" @click="copyHTML">
            <span class="d-none d-lg-inline">Copy</span>
          </UnifiedButton>
        </div>
      </div>
    </div>
    <!-- Preview Card -->
    <div class="card section-card section-card card-compact preview-card">
      <div
        class="card-header section-header card-header--dense d-flex align-items-center justify-content-between"
      >
        <div class="d-flex align-items-center gap-2">
          <AppIcon name="mdi-file-document-outline" size="default" color="primary" aria-hidden="true" />
          <span class="fw-semibold">{{ resume?.personalInfo?.firstName || "Your" }}
            {{ resume?.personalInfo?.lastName || "Resume" }}</span>
        </div>

        <!-- Completion Progress -->
        <div
          v-if="hasContent"
          class="completion-indicator d-flex align-items-center gap-2"
        >
          <div
            class="progress progress-sm progress-sm-60"
            :title="`${completionPercentage}% complete`"
          >
            <div
              class="progress-bar bg-success"
              :style="`width: ${completionPercentage}%`"
              role="progressbar"
              :aria-valuenow="completionPercentage"
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
          <small class="text-muted fw-medium">{{ completionPercentage }}%</small>
        </div>
      </div>
      <div class="card-body section-body p-0">
        <!-- Loading State -->
        <div
          v-if="loading.ai || loading.export || loading.templateGeneration"
          class="loading-state p-4"
          role="status"
          aria-live="polite"
        >
          <div class="text-center mb-3">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-muted mt-2 mb-0">
              <span v-if="loading.ai">Generating content...</span>
              <span v-else-if="loading.export">Preparing export...</span>
              <span v-else-if="loading.templateGeneration">Creating template...</span>
            </p>
          </div>
          <ContentLoader
            :height="200"
            :width="600"
            :speed="1.2"
            primary-color="var(--skeleton-primary)"
            secondary-color="var(--skeleton-secondary)"
            :animate="true"
            class="w-100"
          >
            <rect x="20" y="20" rx="6" ry="6" width="60%" height="16" />
            <rect x="20" y="44" rx="4" ry="4" width="40%" height="12" />
            <rect x="20" y="68" rx="8" ry="8" width="90%" height="80" />
            <rect x="20" y="160" rx="6" ry="6" width="70%" height="14" />
          </ContentLoader>
        </div>

        <!-- Empty State -->
        <div v-else-if="!hasContent" class="empty-state text-center py-5">
          <div class="empty-icon mb-3">
            <AppIcon name="mdi-file-document-outline" aria-hidden="true" />
          </div>
          <h6 class="text-primary fw-semibold mb-2">
            Ready for Your Information
          </h6>
          <p class="text-muted mb-3">
            Start filling out your details to see a live preview of your resume
          </p>
          <div class="d-flex flex-wrap gap-2 justify-content-center">
            <small class="text-muted">
              <AppIcon name="mdi-lightbulb" aria-hidden="true" />
              Tip: Changes appear instantly as you type
            </small>
          </div>
        </div>

        <!-- Live Resume Preview -->
        <div v-else class="resume-preview-container">
          <div
            id="resume-preview"
            class="preview-content"
            :class="getTemplateClass"
            :style="templateStyles"
          >
            <!-- Optional Cover Page -->
            <div v-if="showCoverPage" class="cover-page mb-5">
              <div class="cover-inner">
                <h1 class="cover-name">{{ getFullName }}</h1>
                <p v-if="primaryTitle" class="cover-title h5 fw-semibold text-muted mb-3">{{ primaryTitle }}</p>
                <p v-if="resume?.personalInfo?.summary" class="lead cover-summary mb-4">{{ firstSummarySentence }}</p>
                <div v-if="coverHighlights.length" class="cover-highlights d-flex flex-wrap gap-2 mb-4">
                  <span v-for="h in coverHighlights" :key="h" class="badge badge-compact rounded-pill bg-primary-subtle text-primary">{{ h }}</span>
                </div>
                <div class="cover-contact small text-muted d-flex flex-wrap gap-3 justify-content-center">
                  <span v-if="resume?.personalInfo?.email"><AppIcon name="mdi-email" class="me-1" />{{ resume.personalInfo.email }}</span>
                  <span v-if="resume?.personalInfo?.phone"><AppIcon name="mdi-phone" class="me-1" />{{ resume.personalInfo.phone }}</span>
                  <span v-if="resume?.personalInfo?.location"><AppIcon name="mdi-map-marker" class="me-1" />{{ resume.personalInfo.location }}</span>
                  <span v-if="resume?.personalInfo?.linkedIn"><AppIcon name="mdi-linkedin" class="me-1" />LinkedIn</span>
                  <span v-if="resume?.personalInfo?.portfolio"><AppIcon name="mdi-web" class="me-1" />Portfolio</span>
                </div>
              </div>
              <hr class="cover-divider" />
            </div>
            <!-- Header Section -->
            <div class="resume-header text-center mb-4 p-4">
              <div class="name-section mb-3">
                <h1 class="resume-name text-gradient mb-2">
                  {{ getFullName }}
                </h1>
                <div class="contact-info text-muted">
                  <div
                    class="contact-line d-flex flex-wrap justify-content-center gap-3"
                  >
                    <span
                      v-if="resume?.personalInfo?.email"
                      class="contact-item"
                    >
                      <AppIcon name="mdi-email-outline" aria-hidden="true" />
                      {{ resume?.personalInfo.email }}
                    </span>
                    <span
                      v-if="resume?.personalInfo?.phone"
                      class="contact-item"
                    >
                      <AppIcon name="mdi-phone" aria-hidden="true" />
                      {{ resume?.personalInfo.phone }}
                    </span>
                    <span
                      v-if="resume?.personalInfo?.location"
                      class="contact-item"
                    >
                      <AppIcon name="mdi-map-marker" aria-hidden="true" />
                      {{ resume?.personalInfo.location }}
                    </span>
                  </div>
                  <div
                    v-if="
                      resume?.personalInfo?.linkedIn ||
                        resume?.personalInfo?.portfolio
                    "
                    class="links-line d-flex flex-wrap justify-content-center gap-3 mt-2"
                  >
                    <a
                      v-if="resume?.personalInfo?.linkedIn"
                      :href="resume?.personalInfo.linkedIn"
                      target="_blank"
                      class="text-primary text-decoration-none"
                    >
                      <AppIcon name="mdi-linkedin" class="me-1" />
                      LinkedIn
                    </a>
                    <a
                      v-if="resume?.personalInfo?.portfolio"
                      :href="resume?.personalInfo.portfolio"
                      target="_blank"
                      class="text-primary text-decoration-none"
                    >
                      <AppIcon name="mdi-web" class="me-1" />
                      Portfolio
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Professional Summary -->
            <div
              v-if="resume?.personalInfo?.summary"
              class="resume-section summary-section mb-4"
            >
              <h2 class="section-title">
                <AppIcon name="mdi-account-details" class="me-2" />
                Professional Summary
              </h2>
              <div class="section-content">
                <p class="summary-text mb-0">
                  {{ resume?.personalInfo.summary }}
                </p>
              </div>
            </div>

            <!-- Professional Experience -->
            <div
              v-if="resume?.experience?.length"
              class="resume-section experience-section mb-4"
            >
              <h2 class="section-title">
                <AppIcon name="mdi-briefcase" aria-hidden="true" />
                Professional Experience
              </h2>
              <div class="section-content">
                <div
                  v-for="(exp, index) in resume?.experience"
                  :key="index"
                  class="experience-item mb-4"
                >
                  <div
                    class="experience-header d-flex justify-content-between align-items-start mb-2"
                  >
                    <div class="position-info">
                      <h3 class="position-title h6 fw-bold mb-1">
                        {{ exp.title || "Job Title" }}
                      </h3>
                      <div class="company-name text-primary fw-semibold">
                        {{ exp.company || "Company Name" }}
                      </div>
                    </div>
                    <div class="date-range text-muted text-end">
                      <small class="fw-medium">{{ exp.startDate }} -
                        {{ exp.endDate || "Present" }}</small>
                    </div>
                  </div>
                  <div v-if="exp.description" class="experience-description">
                    <p class="mb-0">{{ exp.description }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Education -->
            <div
              v-if="resume?.education?.length"
              class="resume-section education-section mb-4"
            >
              <h2 class="section-title">
                <AppIcon name="mdi-school" class="me-2" />
                Education
              </h2>
              <div class="section-content">
                <div
                  v-for="(edu, index) in resume?.education"
                  :key="index"
                  class="education-item mb-3"
                >
                  <div
                    class="education-header d-flex justify-content-between align-items-start mb-1"
                  >
                    <div class="degree-info">
                      <h3 class="degree-title h6 fw-bold mb-1">
                        {{ edu.degree || "Degree" }}
                      </h3>
                      <div class="institution-name text-primary">
                        {{ edu.institution || "Institution" }}
                      </div>
                    </div>
                    <div class="graduation-date text-muted text-end">
                      <small class="fw-medium">{{
                        edu.graduationDate || edu.year || "Year"
                      }}</small>
                    </div>
                  </div>
                  <div v-if="edu.gpa" class="gpa-info text-muted mb-2">
                    <small>GPA: {{ edu.gpa }}</small>
                  </div>
                  <div v-if="edu.description" class="education-description">
                    <p class="mb-0 small">{{ edu.description }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Additional Experience -->
            <div
              v-if="resume?.additionalExperience?.length"
              class="resume-section additional-experience-section mb-4"
            >
              <h2 class="section-title">
                <AppIcon name="mdi-star" aria-hidden="true" />
                Additional Experience
              </h2>
              <div class="section-content">
                <div
                  v-for="(exp, index) in resume?.additionalExperience"
                  :key="index"
                  class="additional-exp-item mb-3"
                >
                  <div
                    class="exp-header d-flex justify-content-between align-items-start mb-1"
                  >
                    <div class="title-info">
                      <h3 class="exp-title h6 fw-bold mb-1">
                        {{ exp.title || "Title" }}
                      </h3>
                      <div class="organization-name text-primary">
                        {{ exp.organization || "Organization" }}
                      </div>
                    </div>
                    <div class="date-range text-muted text-end">
                      <small class="fw-medium">{{ exp.startDate }} - {{ exp.endDate }}</small>
                    </div>
                  </div>
                  <div v-if="exp.type" class="exp-type mb-2">
                    <span class="badge badge-compact bg-light text-dark">{{
                      exp.type
                    }}</span>
                  </div>
                  <div v-if="exp.description" class="exp-description">
                    <p class="mb-0 small">{{ exp.description }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Skills -->
            <div
              v-if="
                resume?.skills?.technical?.length || resume?.skills?.soft?.length
              "
              class="resume-section skills-section mb-4"
            >
              <h2 class="section-title">
                <AppIcon name="mdi-cog-outline" aria-hidden="true" />
                Skills
              </h2>
              <div class="section-content">
                <div
                  v-if="resume?.skills?.technical?.length"
                  class="skill-category mb-3"
                >
                  <h3
                    class="skill-category-title h6 fw-semibold text-primary mb-2"
                  >
                    Technical Skills
                  </h3>
                  <div class="skill-tags d-flex flex-wrap gap-2">
                    <span
                      v-for="skill in resume?.skills.technical"
                      :key="skill"
                      class="badge badge-compact bg-primary-subtle text-primary"
                    >{{ skill }}</span>
                  </div>
                </div>
                <div
                  v-if="resume?.skills?.soft?.length"
                  class="skill-category mb-3"
                >
                  <h3
                    class="skill-category-title h6 fw-semibold text-primary mb-2"
                  >
                    Soft Skills
                  </h3>
                  <div class="skill-tags d-flex flex-wrap gap-2">
                    <span
                      v-for="skill in resume?.skills.soft"
                      :key="skill"
                      class="badge badge-compact bg-secondary-subtle text-secondary"
                    >{{ skill }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Portfolio -->
            <div
              v-if="resume?.portfolio?.length"
              class="resume-section portfolio-section mb-4"
            >
              <h2 class="section-title">
                <AppIcon name="mdi-folder-multiple-outline-image" class="me-2" />
                Portfolio
              </h2>
              <div class="section-content">
                <div
                  v-for="(item, index) in resume?.portfolio"
                  :key="index"
                  class="portfolio-item mb-3"
                >
                  <div
                    class="portfolio-header d-flex justify-content-between align-items-start mb-2"
                  >
                    <div class="project-info">
                      <h3 class="project-title h6 fw-bold mb-1">
                        {{ item.title || "Project Title" }}
                      </h3>
                      <span
                        v-if="item.type"
                        class="badge badge-compact bg-info-subtle text-info"
                      >{{ item.type }}</span>
                    </div>
                    <div v-if="item.url" class="project-link">
                      <UnifiedButton
                        variant="outline"
                        :href="item.url"
                        leading-icon="mdi-link-variant"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        View
                      </UnifiedButton>
                    </div>
                  </div>
                  <div v-if="item.description" class="portfolio-description">
                    <p class="mb-0 small">{{ item.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quantification Diff Modal -->
    <div v-if="showQuantifyDiff" class="quantify-diff-modal">
      <div class="qd-backdrop" @click="closeQuantifyDiff"></div>
      <div class="qd-dialog section-card section-card">
        <header class="qd-header d-flex justify-content-between align-items-center mb-3">
          <h6 class="mb-0">Impact Enhancement Preview</h6>
          <button class="btn btn-sm btn-outline-secondary" @click="closeQuantifyDiff">Close</button>
        </header>
        <div class="qd-body">
          <div class="qd-columns">
            <div class="qd-col">
              <h6 class="small text-muted mb-2">Original</h6>
              <ul class="qd-list">
                <li v-for="(line,i) in quantifyOriginal" :key="'o'+i">{{ line }}</li>
              </ul>
            </div>
            <div class="qd-col">
              <h6 class="small text-muted mb-2">Enhanced</h6>
              <ul class="qd-list enhanced">
                <li v-for="(line,i) in quantifyEnhanced" :key="'n'+i">{{ line }}</li>
              </ul>
            </div>
          </div>
        </div>
        <footer class="qd-footer d-flex justify-content-end gap-2 mt-3">
          <button class="btn btn-outline-secondary btn-sm" @click="closeQuantifyDiff">Dismiss</button>
          <button class="btn btn-primary btn-sm" @click="$emit('apply-quantified', quantifyEnhanced)">Apply Changes</button>
        </footer>
      </div>
    </div>
  </div>
</template>
<script>
import { computed, watch, nextTick, ref } from 'vue'
import { UserRepository } from '@/modules/db/repositories/user'
import AppIcon from '@/components/ui/AppIcon.vue'
import { ContentLoader } from "vue-content-loader";
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
// Removed jsPDF (CSP concerns); using pdf-lib helper
import { pdfFromTallImage } from '@/utils/pdfExport'
import html2canvas from "html2canvas"
import { useUnifiedTheme } from '@/shared/composables/useUnifiedTheme'

export default {
  name: "PreviewPanel",
  components: { ContentLoader, AppIcon, UnifiedButton },
  props: {
  // Made optional with safe default so template access like resume.personalInfo won't throw
  resume: { type: Object, default: () => ({}) },
    selectedTemplate: { type: String, default: "Professional" },
    customTemplate: { type: String, default: "" },
    canUseAI: { type: Boolean, default: false },
    loading: { type: Object, default: () => ({}) },
  },
  emits: [
    "update:selectedTemplate",
    "generate-smart-template",
    "content-updated",
    "template-changed",
  "ai-optimize-summary",
  "ai-quantify-experience",
  "ai-suggest-skills",
  "apply-quantified",
  ],
  setup(props, { emit }) {
    let theme
    try { theme = useUnifiedTheme() } catch { theme = null }
    const hasContent = computed(() => {
      const info = props.resume?.personalInfo;
      return !!(info?.firstName || info?.lastName || info?.email);
    });

    const getFullName = computed(() => {
      const info = props.resume?.personalInfo;
      if (!info) {
        return "Your Name";
      }
      const firstName = info.firstName || "";
      const lastName = info.lastName || "";
      return `${firstName} ${lastName}`.trim() || "Your Name";
    });

    const getTemplateClass = computed(() => {
      const baseClasses = "resume-template";
      switch (props.selectedTemplate?.toLowerCase()) {
        case "creative":
          return `${baseClasses} template-creative`;
        case "technical":
          return `${baseClasses} template-technical`;
        case "modern":
          return `${baseClasses} template-modern`;
        case "minimal":
          return `${baseClasses} template-minimal`;
        case "ai-smart":
        case "ai smart":
          return `${baseClasses} template-ai-smart`;
        default:
          return `${baseClasses} template-professional`;
      }
    });

    const completionPercentage = computed(() => {
      const resume = props.resume;
      if (!resume) {
        return 0;
      }

      let completed = 0;
      const total = 8; // Total sections to check

      // Personal Info (40% weight - most important)
      const info = resume.personalInfo;
      if (info?.firstName && info?.lastName) {
        completed += 1;
      }
      if (info?.email) {
        completed += 1;
      }
      if (info?.phone) {
        completed += 0.5;
      }
      if (info?.summary) {
        completed += 1;
      }

      // Experience (20% weight)
      if (resume.experience?.length > 0) {
        completed += 1.5;
      }

      // Education (15% weight)
      if (resume.education?.length > 0) {
        completed += 1;
      }

      // Skills (15% weight)
      if (
        resume.skills?.technical?.length > 0 ||
        resume.skills?.soft?.length > 0
      ) {
        completed += 1;
      }

      // Portfolio/Additional (10% weight)
      if (resume.portfolio?.length > 0) {
        completed += 0.5;
      }
      if (resume.additionalExperience?.length > 0) {
        completed += 0.5;
      }

      return Math.min(Math.round((completed / total) * 100), 100);
    });

    const templateStyles = computed(() => {
      // Unify colors to design tokens; templates may still style layout via classes
      return {
        "--primary-color": "var(--color-primary)",
        "--accent-color": "var(--color-primary-alt)",
        "--section-color": "var(--color-primary)",
        color: "var(--text-primary)",
      };
    });

    // Cover Page Enhancements
    const showCoverPage = computed({
      get: () => props.resume?.__showCoverPage !== false && internalShowCover.value,
      set: (v) => { internalShowCover.value = v }
    })
    const internalShowCover = ref(true)
    // Load persisted cover toggle
    ;(async () => {
      try {
        const settings = await UserRepository.getSettings() || {}
        if (settings && settings.resume && settings.resume.showCoverPage === false) internalShowCover.value = false
      } catch {}
    })()
    const primaryTitle = computed(() => props.resume?.personalInfo?.title || props.resume?.personalInfo?.role || '')
    const firstSummarySentence = computed(() => {
      const s = props.resume?.personalInfo?.summary || ''
      const match = s.match(/[^.!?]*[.!?]/)
      return match ? match[0].trim() : s.trim()
    })
    const coverHighlights = computed(() => {
      const skills = Array.isArray(props.resume?.skills?.technical) ? props.resume.skills.technical.slice(0,6) : []
      const companies = Array.isArray(props.resume?.experience) ? props.resume.experience.map((e)=> e.company).filter(Boolean).slice(0,3) : []
      const tags = [...skills, ...companies]
      return Array.from(new Set(tags)).slice(0,8)
    })

    // AI action emitters (parent handles actual AI work)
    function emitOptimizeSummary() { emit('ai-optimize-summary') }
    function emitQuantifyExperience() { emit('ai-quantify-experience') }
    function emitSuggestSkills() { emit('ai-suggest-skills') }

    // Persist cover toggle changes (debounced)
    let coverPersistTimer = null
    watch(showCoverPage, (val) => {
      if (coverPersistTimer) clearTimeout(coverPersistTimer)
      coverPersistTimer = setTimeout(async () => {
        try {
          const settings = await UserRepository.getSettings() || {}
          const resumeSettings = Object.assign({}, (settings.resume || {}), { showCoverPage: val })
          await UserRepository.updateSettings(Object.assign({}, settings, { resume: resumeSettings }))
  } catch {}
      }, 400)
    })

    // Bullet quantification preview (diff modal state)
    const showQuantifyDiff = ref(false)
    const quantifyOriginal = ref([])
    const quantifyEnhanced = ref([])
    function openQuantifyDiff(original, enhanced) {
      quantifyOriginal.value = original
      quantifyEnhanced.value = enhanced
      showQuantifyDiff.value = true
    }
    function closeQuantifyDiff() { showQuantifyDiff.value = false }

    const previewWindow = () => {
      const win = window.open("", "_blank");
      const content =
        document.getElementById("resume-preview")?.innerHTML || "";
      win.document.write(
        `<!DOCTYPE html><html><head><title>Resume Preview</title><style>body{font-family:var(--font-primary,'Electrolize','Inter',sans-serif);color:var(--text-primary);background:var(--bg-primary);max-width:800px;margin:40px auto;padding:0 20px;}@media print{body{margin:0;padding:20px;}}</style></head><body>${content}</body></html>`,
      );
      win.document.close();
    };

    const exportPDF = async () => {
      if (!hasContent.value) return
      const element = document.getElementById('resume-preview')
      if (!element) return
      // Temporarily disable animations/effects for stable capture
      element.classList.add('exporting')
      try {
        const css = window.getComputedStyle(document.documentElement)
        const bg = (css.getPropertyValue('--bg-primary') || '#ffffff').trim()
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: bg,
          width: element.offsetWidth,
          height: element.offsetHeight,
          // Avoid scroll offset artifacts
          scrollX: 0,
          scrollY: -window.scrollY
        })
        const imgData = canvas.toDataURL('image/png')
        const pdfBlob = await pdfFromTallImage(imgData)
        const url = URL.createObjectURL(pdfBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${props.resume?.personalInfo?.name || getFullName.value || 'Resume'}.pdf`
        a.click()
        URL.revokeObjectURL(url)
      } catch (e) {
        console.warn('Export failed', e)
      } finally {
        element.classList.remove('exporting')
      }
    };

    const exportHTML = () => {
      const content =
        document.getElementById("resume-preview")?.innerHTML || "";
      const blob = new Blob(
        [
          `<!DOCTYPE html><html><head><meta charset='utf-8'><title>${props.resume?.personalInfo?.name || "Resume"}</title><style>:root{--bg-primary:var(--surface-base);--text-primary:var(--text-primary);--text-secondary:var(--text-secondary);--color-primary:var(--color-primary-500);--font-primary:var(--font-family-primary)}@media(prefers-color-scheme:dark){:root{--bg-primary:var(--surface-base);--text-primary:var(--text-primary);--text-secondary:var(--text-secondary)}}body{font-family:var(--font-primary);color:var(--text-primary);background:var(--bg-primary);max-width:800px;margin:0 auto;padding:40px 20px}</style></head><body>${content}</body></html>`,
        ],
        { type: "text/html" },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
  a.download = `${props.resume?.personalInfo?.name || getFullName.value || "Resume"}.html`;
      a.click();
      URL.revokeObjectURL(url);
    };

    const copyHTML = async () => {
      try {
        const content =
          document.getElementById("resume-preview")?.innerHTML || "";
        await navigator.clipboard.writeText(content);
      } catch (_e) {
        console.warn("Copy failed", e);
      }
    };

    // Watch for resume changes to trigger live updates
    watch(
      () => props.resume,
      () => {
        nextTick(() => {
          // Emit event to notify parent of content change
          emit("content-updated", {
            hasContent: hasContent.value,
            completionPercentage: completionPercentage.value,
          });
        });
      },
      { deep: true, immediate: true },
    );

    // Watch for template changes
    watch(
      () => props.selectedTemplate,
      (newTemplate) => {
        emit("template-changed", newTemplate);
      },
    );

    return {
      hasContent,
      getFullName,
      getTemplateClass,
      completionPercentage,
      templateStyles,
      previewWindow,
      exportPDF,
      exportHTML,
      copyHTML,
      theme,
  showCoverPage,
  coverHighlights,
  primaryTitle,
  firstSummarySentence,
  emitOptimizeSummary,
  emitQuantifyExperience,
  emitSuggestSkills,
  showQuantifyDiff,
  quantifyOriginal,
  quantifyEnhanced,
  openQuantifyDiff,
  closeQuantifyDiff,
    };
  },
};
</script>

<style scoped>
/* Cover Page */
.cover-page { position: relative; text-align: center; padding: 2rem 1rem 1rem; background: var(--glass-surface-light); border:1px solid var(--glass-border); border-radius: var(--border-radius-lg); }
[data-theme="dark"] .cover-page { background: var(--glass-surface-dark); }
.cover-name { font-size: clamp(2.2rem, 5vw, 3rem); font-weight: 800; letter-spacing: .5px; background: linear-gradient(90deg,var(--section-color),color-mix(in srgb,var(--section-color) 60%, var(--text-primary))); -webkit-background-clip:text; background-clip:text; color: transparent; }
.cover-summary { max-width: var(--page-content-max-width); margin: 0 auto; line-height: 1.4; }
.cover-highlights .badge { backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); border:1px solid var(--glass-border); }
.cover-divider { margin: 2rem auto 0; max-width: calc(var(--page-narrow-width) * 0.33); border-top:2px solid var(--section-color); opacity: .4; }
.ai-enhance-group .btn { --bs-btn-padding-y: .25rem; --bs-btn-padding-x: .6rem; --bs-btn-font-size: .7rem; }

/* Theme Integration */
.preview-panel-wrapper {
  transition: background-color var(--transition-normal), color var(--transition-normal);
}

.preview-controls {
  transition: background-color var(--transition-normal), border-color var(--transition-normal);
}

/* Dark theme overrides */
[data-theme="dark"] .preview-controls {
  background: var(--color-surface-variant);
  border-color: var(--color-gray-700);
}

[data-theme="dark"] .resume-content {
  background: var(--color-surface);
  color: var(--color-on-surface);
}

/* Live Preview Indicator */
.live-pulse {
  width: 8px;
  height: 8px;
  background: var(--color-success);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

/* Preview Container */
.preview-panel-wrapper {
  max-width: 100%;
  overflow-x: auto;
}

/* Controls bars */
.preview-controls,
.export-actions {
  background: var(--glass-elevated);
  backdrop-filter: blur(var(--glass-backdrop-blur)) saturate(140%);
  -webkit-backdrop-filter: blur(var(--glass-backdrop-blur)) saturate(140%);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
}

.resume-preview-container {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-lg);
  padding: 1rem;
  min-height: 400px;
}

.preview-content {
  max-width: var(--page-content-max-width);
  margin: 0 auto;
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: 2rem;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow-unified);
  font-family: var(--font-primary);
  line-height: 1.6;
}

/* Export-safe mode (disable animations/effects for consistent capture) */
#resume-preview.exporting,
#resume-preview.exporting * {
  animation: none !important;
  transition: none !important;
  filter: none !important;
}

#resume-preview.exporting .text-gradient {
  background: none !important;
  -webkit-background-clip: initial !important;
  background-clip: initial !important;
  color: var(--text-primary) !important;
}

/* Template Variants */
.template-professional { --section-color: var(--color-primary); }

.template-creative { --section-color: var(--color-primary); }

.template-technical { --section-color: var(--color-primary); }

.template-modern { --section-color: var(--color-primary); }

.template-minimal {
  --section-color: var(--color-primary);
  background: var(--bg-primary);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}

[data-theme="dark"] .template-minimal,
:root:not([data-theme]) .template-minimal {
  --section-color: var(--color-primary);
  background: var(--bg-primary);
  border: 1px solid var(--glass-border-dark);
  box-shadow: var(--glass-shadow-dark);
}

.template-ai-smart { --section-color: var(--color-primary); }

/* Dark Theme Template Variants */
[data-theme="dark"] .template-professional,
:root:not([data-theme]) .template-professional { --section-color: var(--color-primary); }

[data-theme="dark"] .template-creative,
:root:not([data-theme]) .template-creative {
  --section-color: var(--color-accent-500);
  background: linear-gradient(135deg, var(--surface-strong) 0%, color-mix(in srgb, var(--color-accent-500) 15%, var(--surface-strong)) 100%);
}

[data-theme="dark"] .template-technical,
:root:not([data-theme]) .template-technical {
  --section-color: var(--color-info-500);
}

[data-theme="dark"] .template-modern,
:root:not([data-theme]) .template-modern {
  --section-color: var(--color-secondary-500);
  background: linear-gradient(135deg, var(--surface-strong) 0%, color-mix(in srgb, var(--color-secondary-500) 15%, var(--surface-strong)) 100%);
}

[data-theme="dark"] .template-minimal,
:root:not([data-theme]) .template-minimal {
  --section-color: var(--color-info-400);
  background: var(--surface-base);
  border: 1px solid var(--border-strong);
  box-shadow: var(--shadow-sm);
}

[data-theme="dark"] .template-ai-smart,
:root:not([data-theme]) .template-ai-smart {
  --section-color: var(--color-primary-400);
  background: linear-gradient(135deg, var(--surface-container) 0%, var(--surface-strong) 100%);
  border: 2px solid color-mix(in srgb, var(--color-primary-500) 15%, transparent);
}

/* Resume Sections */
.resume-header {
  border-bottom: 2px solid var(--section-color, var(--color-primary-500));
  margin-bottom: 2rem !important;
  background: var(--surface-glass);
  padding: 1.5rem;
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
}

[data-theme="dark"] .resume-header,
:root:not([data-theme]) .resume-header {
  background: var(--surface-glass);
  border-bottom-color: var(--section-color, var(--color-primary-400));
}

.resume-name {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--section-color, var(--color-primary-500));
  margin-bottom: var(--spacing-2);
}

/* Shimmer accent similar to fairy chat */
.text-gradient {
  background: linear-gradient(90deg, var(--text-primary), color-mix(in srgb, var(--color-primary-500) 40%, var(--text-primary)));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: shimmer 2.2s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 1; filter: drop-shadow(0 0 0 transparent); }
  50% { opacity: 0.9; filter: drop-shadow(0 0 6px color-mix(in srgb, var(--color-primary-500) 35%, transparent)); }
}

.contact-info {
  font-size: var(--font-size-sm);
}

.contact-item,
.contact-info a {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color var(--duration-fast) var(--easing-ease);
}

.contact-info a:hover {
  color: var(--section-color, var(--color-primary-500));
}

[data-theme="dark"] .contact-item,
[data-theme="dark"] .contact-info a,
:root:not([data-theme]) .contact-item,
:root:not([data-theme]) .contact-info a {
  color: var(--text-secondary);
}

[data-theme="dark"] .contact-info a:hover,
:root:not([data-theme]) .contact-info a:hover {
  color: var(--section-color, var(--color-primary-400));
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--section-color, var(--color-primary-500));
  border-bottom: 1px solid var(--section-color, var(--color-primary-500));
  padding-bottom: var(--spacing-2);
  margin-bottom: var(--spacing-4);
  display: flex;
  align-items: center;
}

[data-theme="dark"] .section-title,
:root:not([data-theme]) .section-title {
  border-bottom-color: var(--section-color, var(--color-primary-400));
}

.section-content {
  padding-left: 0;
}

/* Experience & Education Items */
.experience-item,
.education-item,
.additional-exp-item {
  border-left: 3px solid rgba(102, 126, 234, 0.1);
  padding-left: 1rem;
  margin-bottom: 1.5rem;
  position: relative;
}

[data-theme="dark"] .experience-item,
[data-theme="dark"] .education-item,
[data-theme="dark"] .additional-exp-item,
:root:not([data-theme]) .experience-item,
:root:not([data-theme]) .education-item,
:root:not([data-theme]) .additional-exp-item {
  border-left-color: rgba(144, 180, 255, 0.15);
}

.experience-item::before,
.education-item::before,
.additional-exp-item::before { content:""; position:absolute; left:-6px; top:0; width:8px; height:8px; background: var(--section-color, var(--color-primary-500)); border-radius:50%; }

.position-title,
.degree-title,
.exp-title {
  color: var(--text-primary);
  margin-bottom: var(--spacing-1);
}

[data-theme="dark"] .position-title,
[data-theme="dark"] .degree-title,
[data-theme="dark"] .exp-title,
:root:not([data-theme]) .position-title,
:root:not([data-theme]) .degree-title,
:root:not([data-theme]) .exp-title {
  color: var(--text-primary);
}

.company-name,
.institution-name,
.organization-name {
  color: var(--section-color, var(--color-primary-500));
  font-weight: var(--font-weight-medium);
}

/* Skills Section */
.skill-tags {
  gap: 0.5rem;
}

.skill-tags .badge {
  font-size: var(--font-size-sm);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-medium);
}

/* Portfolio Section */
.portfolio-item {
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-md);
  padding: 1rem;
  transition: all 0.2s ease;
  background: var(--bg-primary);
}

[data-theme="dark"] .portfolio-item,
:root:not([data-theme]) .portfolio-item {
  background: var(--dark-bg-secondary);
  border-color: var(--glass-border-dark);
}

.portfolio-item:hover {
  border-color: var(--section-color, var(--color-primary));
  box-shadow: var(--shadow-sm);
}

[data-theme="dark"] .portfolio-item:hover,
:root:not([data-theme]) .portfolio-item:hover {
  box-shadow: 0 2px 8px rgba(144, 180, 255, 0.15);
}

/* Responsive Design */
@media (max-width: 991.98px) {
  .card-header,
  .card-footer {
    padding: clamp(var(--spacing-2), 2vw, var(--spacing-3));
  }

  .preview-content {
    padding: 1.5rem;
  }

  .resume-name {
    font-size: var(--font-size-3xl);
  }

  .experience-header,
  .education-header,
  .exp-header {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .date-range,
  .graduation-date {
    text-align: left !important;
    margin-top: 0.25rem;
  }
}

@media (max-width: 575.98px) {
  .preview-content {
    padding: 1rem;
  }

  .resume-name {
    font-size: var(--font-size-2xl);
  }

  .contact-line,
  .links-line {
    flex-direction: column;
    gap: 0.5rem !important;
  }

  .skill-tags {
    justify-content: center;
  }
}

/* Dark mode support using data-theme */
[data-theme="dark"] .preview-content,
:root:not([data-theme]) .preview-content {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--glass-border-dark);
}

[data-theme="dark"] .contact-item,
:root:not([data-theme]) .contact-item { color: var(--text-secondary); }

[data-theme="dark"] .portfolio-item,
:root:not([data-theme]) .portfolio-item {
  background: var(--surface-container);
  border-color: var(--border-strong);
}

[data-theme="dark"] .portfolio-item:hover,
:root:not([data-theme]) .portfolio-item:hover {
  background: var(--surface-elevated);
}

/* Print styles */
@media print {
  .preview-content {
    box-shadow: none;
    border: none;
    margin: 0;
    padding: 1rem;
  }

  .live-pulse,
  .btn,
  .badge {
    display: none !important;
  }
}
</style>
