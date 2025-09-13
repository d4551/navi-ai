import { createI18n } from "vue-i18n";
import { unifiedStorage } from "@/utils/storage";

// English translations
const en = {
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    remove: "Remove",
    close: "Close",
    confirm: "Confirm",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    warning: "Warning",
    info: "Information",
    yes: "Yes",
    no: "No",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    export: "Export",
    import: "Import",
    download: "Download",
    upload: "Upload",
  },
  navigation: {
    dashboard: "Dashboard",
    resume: "Resume Builder",
    skills: "Skill Mapper",
    jobs: "Job Search",
    interview: "Mock Interview",
    portfolio: "Modern Portfolio",
    settings: "Settings",
    chat: "AI Assistant",
  },
  resume: {
    title: "Resume Builder",
    personalInfo: "Personal Information",
    experience: "Work Experience",
    education: "Education",
    skills: "Skills",
    projects: "Projects",
    preview: "Preview",
    download: "Download Resume",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email Address",
    phone: "Phone Number",
    location: "Location",
    summary: "Professional Summary",
    linkedIn: "LinkedIn Profile",
    portfolio: "Portfolio URL",
    jobTitle: "Job Title",
    company: "Company",
    startDate: "Start Date",
    endDate: "End Date",
    current: "Currently Working Here",
    description: "Job Description",
    degree: "Degree",
    school: "School/University",
    graduationDate: "Graduation Date",
    gpa: "GPA",
    skillName: "Skill Name",
    skillLevel: "Skill Level",
    skillCategory: "Category",
    addExperience: "Add Experience",
    addEducation: "Add Education",
    addSkill: "Add Skill",
    addProject: "Add Project",
  },
  skills: {
    title: "Skill Mapper",
    currentSkills: "Current Skills",
    suggestedSkills: "Suggested Skills",
    skillGaps: "Skill Gaps",
    learningPath: "Learning Path",
    marketDemand: "Market Demand",
    technical: "Technical Skills",
    soft: "Soft Skills",
    language: "Languages",
    certification: "Certifications",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    expert: "Expert",
    mapSkills: "Map My Skills",
    analyzeGaps: "Analyze Skill Gaps",
  },
  chat: {
    title: "AI Career Assistant",
    placeholder: "Ask me anything about your career...",
    send: "Send",
    clear: "Clear Chat",
    voice: "Voice Input",
    thinking: "NAVI is thinking...",
    welcome:
      "Hello! I'm NAVI, your AI career assistant. How can I help you today?",
    suggestions: {
      resume: "Help me improve my resume",
      skills: "What skills should I learn?",
      interview: "Practice interview questions",
      career: "Career transition advice",
    },
  },
  settings: {
    title: "Settings",
    general: "General Settings",
    appearance: "Appearance",
    language: "Language",
    theme: "Theme",
    notifications: "Notifications",
    privacy: "Privacy",
    data: "Data Management",
    light: "Light Theme",
    dark: "Dark Theme",
    auto: "Auto Theme",
    exportData: "Export My Data",
    importData: "Import Data",
    clearData: "Clear All Data",
    apiKey: "API Key",
    voiceSettings: "Voice Settings",
    enableVoice: "Enable Voice Input",
    enableTTS: "Enable Text-to-Speech",
  },
  validation: {
    required: "This field is required",
    email: "Please enter a valid email address",
    phone: "Please enter a valid phone number",
    url: "Please enter a valid URL",
    minLength: "Must be at least {min} characters",
    maxLength: "Must be less than {max} characters",
    invalidFormat: "Invalid format",
  },
  errors: {
    networkError: "Network error. Please check your connection.",
    apiError: "API error. Please try again later.",
    validationError: "Please fix the validation errors.",
    fileError: "File error. Please try again.",
    generalError: "An error occurred. Please try again.",
    authError: "Authentication failed. Please check your API key.",
    rateLimitError: "Too many requests. Please wait a moment.",
  },
  success: {
    saved: "Successfully saved",
    deleted: "Successfully deleted",
    updated: "Successfully updated",
    exported: "Successfully exported",
    imported: "Successfully imported",
    copied: "Copied to clipboard",
  },
};

// Spanish translations (basic set)
const es = {
  common: {
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    add: "Añadir",
    remove: "Quitar",
    close: "Cerrar",
    confirm: "Confirmar",
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    warning: "Advertencia",
    info: "Información",
    yes: "Sí",
    no: "No",
    search: "Buscar",
    filter: "Filtrar",
    sort: "Ordenar",
    export: "Exportar",
    import: "Importar",
    download: "Descargar",
    upload: "Subir",
  },
  navigation: {
    dashboard: "Panel",
    resume: "Constructor de CV",
    skills: "Mapeador de Habilidades",
    jobs: "Búsqueda de Empleo",
    interview: "Entrevista Simulada",
    portfolio: "Generador de Portfolio",
    settings: "Configuración",
    chat: "Asistente IA",
  },
  resume: {
    title: "Constructor de CV",
    personalInfo: "Información Personal",
    experience: "Experiencia Laboral",
    education: "Educación",
    skills: "Habilidades",
    projects: "Proyectos",
    preview: "Vista previa",
    download: "Descargar CV",
    firstName: "Nombre",
    lastName: "Apellidos",
    email: "Correo Electrónico",
    phone: "Teléfono",
    location: "Ubicación",
    summary: "Resumen Profesional",
  },
  validation: {
    required: "Este campo es obligatorio",
    email: "Ingrese un email válido",
    phone: "Ingrese un teléfono válido",
    url: "Ingrese una URL válida",
    minLength: "Debe tener al menos {min} caracteres",
    maxLength: "Debe tener menos de {max} caracteres",
  },
};

// French translations (basic set)
const fr = {
  common: {
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    add: "Ajouter",
    remove: "Retirer",
    close: "Fermer",
    confirm: "Confirmer",
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès",
    warning: "Avertissement",
    info: "Information",
  },
  navigation: {
    dashboard: "Tableau de bord",
    resume: "Constructeur de CV",
    skills: "Cartographe de Compétences",
    jobs: "Recherche d'emploi",
    interview: "Entretien simulé",
    portfolio: "Générateur de Portfolio",
    settings: "Paramètres",
    chat: "Assistant IA",
  },
  resume: {
    title: "Constructeur de CV",
    personalInfo: "Informations Personnelles",
    experience: "Expérience Professionnelle",
    education: "Éducation",
    skills: "Compétences",
    projects: "Projets",
  },
};

// German translations (basic set)
const de = {
  common: {
    save: "Speichern",
    cancel: "Abbrechen",
    delete: "Löschen",
    edit: "Bearbeiten",
    add: "Hinzufügen",
    remove: "Entfernen",
    close: "Schließen",
    confirm: "Bestätigen",
    loading: "Laden...",
    error: "Fehler",
    success: "Erfolg",
    warning: "Warnung",
    info: "Information",
  },
  navigation: {
    dashboard: "Dashboard",
    resume: "Lebenslauf-Builder",
    skills: "Skill-Mapper",
    jobs: "Jobsuche",
    interview: "Mock Interview",
    portfolio: "Portfolio-Generator",
    settings: "Einstellungen",
    chat: "KI-Assistent",
  },
};

const messages = {
  en,
  es,
  fr,
  de,
};

// Detect browser language
function getBrowserLanguage() {
  const language = navigator.language || navigator.languages[0] || "en";
  const langCode = language.split("-")[0];
  return Object.keys(messages).includes(langCode) ? langCode : "en";
}


export const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: getBrowserLanguage(),
  fallbackLocale: "en",
  messages,
  globalInjection: true,
});


export function useI18n() {
  return i18n.global;
}


export const t = (key, ...args) => {
  return i18n.global.t(key, ...args);
};

export const setLanguage = (locale) => {
  if (messages[locale]) {
    i18n.global.locale.value = locale;
    // Save using unified storage
    try {
      unifiedStorage.set("navi_language", locale);
    } catch {}
    return true;
  }
  return false;
};

// Returns structured language metadata with icon name (no HTML strings)
export const getAvailableLanguages = () => {
  return [
    { code: "en", name: "English", icon: "mdi-flag" },
    { code: "es", name: "Español", icon: "mdi-flag" },
    { code: "fr", name: "Français", icon: "mdi-flag" },
    { code: "de", name: "Deutsch", icon: "mdi-flag" },
  ];
};

// Initialize language from unified storage if available
try {
  const savedLanguage = unifiedStorage.get("navi_language");
  if (savedLanguage && messages[savedLanguage]) {
    i18n.global.locale.value = savedLanguage;
  }
} catch {}

export default i18n;
