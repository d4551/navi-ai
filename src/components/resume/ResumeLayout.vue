<template>
  <div class="resume-layout">
    <!-- Header Section -->
    <header class="resume-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="resume-title">Resume Builder</h1>
          <p class="resume-subtitle">
            Build your professional resume with AI assistance
          </p>
        </div>
        <div class="header-actions">
          <button class="action-btn secondary" @click="saveAsDraft">
            <AppIcon name="mdi-content-save" />
            Save Draft
          </button>
          <button class="action-btn secondary" @click="previewResume">
            <AppIcon name="mdi-eye" />
            Preview
          </button>
          <button class="action-btn primary" @click="exportResume">
            <AppIcon name="mdi-download" />
            Export
          </button>
        </div>
      </div>

      <!-- Progress Indicator -->
      <div class="progress-section">
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: completionPercentage + '%' }"
          ></div>
        </div>
        <span class="progress-text">{{ completionPercentage }}% Complete</span>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="resume-main">
      <!-- Side Navigation -->
      <nav class="resume-nav">
        <div class="nav-section">
          <h3 class="nav-title">Resume Sections</h3>
          <ul class="nav-list">
            <li
              v-for="section in sections"
              :key="section.id"
              class="nav-item"
              :class="{ active: activeSection === section.id }"
              @click="setActiveSection(section.id)"
            >
              <AppIcon class="nav-icon" :name="section.icon" />
              <span class="nav-text">{{ section.title }}</span>
              <AppIcon
                v-if="section.completed"
                class="nav-indicator"
                name="mdi-check-circle-outline"
              />
            </li>
          </ul>
        </div>

        <!-- AI Assistant -->
        <div class="ai-assistant">
          <div class="assistant-header">
            <AppIcon name="mdi-robot" />
            <h4>AI Assistant</h4>
          </div>
          <p class="assistant-description">
            Get personalized suggestions for your resume content
          </p>
          <button class="assistant-btn" @click="openAIAssistant">
            Get AI Help
          </button>
        </div>
      </nav>

      <!-- Content Area -->
      <div class="resume-content">
        <!-- Section Editor -->
        <div class="section-editor">
          <div class="editor-header">
            <h2 class="section-title">{{ currentSection?.title }}</h2>
            <div class="section-actions">
              <button
                v-if="currentSection?.allowMultiple"
                class="icon-btn"
                @click="addItem"
              >
                <AppIcon name="mdi-plus" />
              </button>
              <button
                v-if="currentSection?.allowReorder"
                class="icon-btn"
                @click="reorderItems"
              >
                <AppIcon name="mdi-sort" />
              </button>
            </div>
          </div>

          <!-- Dynamic Section Content -->
          <div class="section-content">
            <slot
              :section="currentSection"
              :data="resumeData[activeSection]"
            ></slot>
          </div>
        </div>

        <!-- Live Preview Panel -->
        <div v-show="showPreview" class="preview-panel">
          <div class="preview-header">
            <h3>Live Preview</h3>
            <button class="icon-btn" @click="togglePreview">
              <AppIcon name="mdi-close-circle-outline" />
            </button>
          </div>
          <div class="preview-content">
            <div ref="previewContainer" class="resume-preview">
              <!-- Preview content will be rendered here -->
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";

export default {
  name: "ResumeLayout",
  components: {
    AppIcon,
  },
  props: {
    resumeData: {
      type: Object,
      default: () => ({}),
    },
    showPreview: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    "save-draft",
    "preview",
    "export",
    "section-change",
    "ai-assist",
    "preview-toggle",
    "add-item",
    "reorder-items",
  ],
  setup(props, { emit }) {
    const activeSection = ref("personal");

    const sections = ref([
      {
        id: "personal",
        title: "Personal Information",
        icon: "mdi-account",
        completed: false,
        required: true,
      },
      {
        id: "summary",
        title: "Professional Summary",
        icon: "mdi-text-box",
        completed: false,
        required: true,
      },
      {
        id: "experience",
        title: "Work Experience",
        icon: "mdi-briefcase",
        completed: false,
        required: true,
        allowMultiple: true,
        allowReorder: true,
      },
      {
        id: "education",
        title: "Education",
        icon: "mdi-school",
        completed: false,
        required: true,
        allowMultiple: true,
      },
      {
        id: "skills",
        title: "Skills",
        icon: "mdi-cog",
        completed: false,
        required: true,
      },
      {
        id: "projects",
        title: "Projects",
        icon: "mdi-folder-multiple-outline",
        completed: false,
        required: false,
        allowMultiple: true,
      },
      {
        id: "certifications",
        title: "Certifications",
        icon: "mdi-certificate",
        completed: false,
        required: false,
        allowMultiple: true,
      },
      {
        id: "additional",
        title: "Additional Information",
        icon: "mdi-plus-circle",
        completed: false,
        required: false,
      },
    ]);

    const currentSection = computed(() => {
      return sections.value.find((s) => s.id === activeSection.value);
    });

    const completionPercentage = computed(() => {
      const completed = sections.value.filter((s) => s.completed).length;
      return Math.round((completed / sections.value.length) * 100);
    });

    const setActiveSection = (sectionId) => {
      activeSection.value = sectionId;
      emit("section-change", sectionId);
    };

    const saveAsDraft = () => {
      emit("save-draft", props.resumeData);
    };

    const previewResume = () => {
      emit("preview", props.resumeData);
    };

    const exportResume = () => {
      emit("export", props.resumeData);
    };

    const togglePreview = () => {
      emit("preview-toggle");
    };

    const openAIAssistant = () => {
      emit("ai-assist", {
        section: activeSection.value,
        data: props.resumeData[activeSection.value],
      });
    };

    const addItem = () => {
      emit("add-item", activeSection.value);
    };

    const reorderItems = () => {
      emit("reorder-items", activeSection.value);
    };

    // Update section completion status
    const updateSectionCompletion = () => {
      sections.value.forEach((section) => {
        const sectionData = props.resumeData[section.id];
        if (sectionData) {
          // Basic completion check - can be enhanced based on section requirements
          section.completed = Boolean(
            sectionData && Object.keys(sectionData).length > 0,
          );
        }
      });
    };

    onMounted(() => {
      updateSectionCompletion();
    });

    return {
      activeSection,
      sections,
      currentSection,
      completionPercentage,
      setActiveSection,
      saveAsDraft,
      previewResume,
      exportResume,
      togglePreview,
      openAIAssistant,
      addItem,
      reorderItems,
    };
  },
};
</script>

<style scoped>
.resume-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--md-sys-color-surface);
}

.resume-header {
  background-color: var(--md-sys-color-surface-container);
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  padding: 16px 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.title-section h1 {
  font: var(--md-sys-typescale-headline-medium-font);
  color: var(--md-sys-color-on-surface);
  margin: 0;
}

.title-section p {
  font: var(--md-sys-typescale-body-medium-font);
  color: var(--md-sys-color-on-surface-variant);
  margin: 4px 0 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 20px;
  border: none;
  font: var(--md-sys-typescale-label-large-font);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

.action-btn.secondary {
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background-color: var(--md-sys-color-surface-variant);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--md-sys-color-primary);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font: var(--md-sys-typescale-body-small-font);
  color: var(--md-sys-color-on-surface-variant);
  white-space: nowrap;
}

.resume-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.resume-nav {
  width: 280px;
  background-color: var(--md-sys-color-surface-container-low);
  border-right: 1px solid var(--md-sys-color-outline-variant);
  padding: 24px 0;
  overflow-y: auto;
}

.nav-section {
  padding: 0 24px 24px;
}

.nav-title {
  font: var(--md-sys-typescale-title-small-font);
  color: var(--md-sys-color-on-surface);
  margin: 0 0 16px;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-bottom: 4px;
}

.nav-item:hover {
  background-color: var(--md-sys-color-secondary-container);
}

.nav-item.active {
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

.nav-icon {
  font-size: 20px;
  margin-right: 12px;
  color: var(--md-sys-color-primary);
}

.nav-text {
  flex: 1;
  font: var(--md-sys-typescale-body-medium-font);
}

.nav-indicator {
  color: var(--md-sys-color-primary);
  font-size: 16px;
}

.ai-assistant {
  margin: 24px;
  padding: 20px;
  background-color: var(--md-sys-color-primary-container);
  border-radius: 16px;
}

.assistant-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.assistant-header i {
  color: var(--md-sys-color-primary);
  font-size: 20px;
}

.assistant-header h4 {
  font: var(--md-sys-typescale-title-small-font);
  color: var(--md-sys-color-on-primary-container);
  margin: 0;
}

.assistant-description {
  font: var(--md-sys-typescale-body-small-font);
  color: var(--md-sys-color-on-primary-container);
  margin: 0 0 16px;
}

.assistant-btn {
  width: 100%;
  padding: 12px;
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  border: none;
  border-radius: 12px;
  font: var(--md-sys-typescale-label-large-font);
  cursor: pointer;
  transition: all 0.2s ease;
}

.assistant-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.resume-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.section-editor {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font: var(--md-sys-typescale-headline-small-font);
  color: var(--md-sys-color-on-surface);
  margin: 0;
}

.section-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 20px;
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.section-content {
  background-color: var(--md-sys-color-surface);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.preview-panel {
  width: 400px;
  background-color: var(--md-sys-color-surface);
  border-left: 1px solid var(--md-sys-color-outline-variant);
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
}

.preview-header h3 {
  font: var(--md-sys-typescale-title-medium-font);
  color: var(--md-sys-color-on-surface);
  margin: 0;
}

.preview-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.resume-preview {
  background: white;
  min-height: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

  .resume-nav {
  }

  .preview-panel {
  }
}

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    justify-content: center;
  }

  .resume-main {
    flex-direction: column;
  }

  .resume-nav {
    height: auto;
  }

  .preview-panel {
  }
}
</style>
