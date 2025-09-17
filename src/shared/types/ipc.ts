// Centralized IPC type definitions for secure main ↔ renderer communication

// AI Service IPC
export interface AITextRequest {
  prompt: string
  systemInstructions?: string
  options?: {
    temperature?: number
    topK?: number
    topP?: number
    maxTokens?: number
    model?: string
  }
}

export interface AIStreamResponse {
  id: string
  text: string
  done: boolean
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface AIInitRequest {
  apiKey: string
  model?: string
}

export interface AIInitResponse {
  success: boolean
  model: string
  error?: string
}

// Media/Audio IPC
export interface MediaDeviceInfo {
  deviceId: string
  label: string
  kind: 'audioinput' | 'audiooutput' | 'videoinput'
  groupId: string
}

export interface AudioPermissionResult {
  granted: boolean
  error?: string
}

export interface MediaConstraints {
  audio?: boolean | MediaTrackConstraints
  video?: boolean | MediaTrackConstraints
}

// File System IPC
export interface FileDialogOptions {
  title?: string
  defaultPath?: string
  buttonLabel?: string
  filters?: Array<{ name: string; extensions: string[] }>
  properties?: Array<
    'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles'
  >
}

export interface FileDialogResult {
  canceled: boolean
  filePaths?: string[]
  filePath?: string
}

// Interview IPC
export interface InterviewConfig {
  role: string
  difficulty: 'entry' | 'mid' | 'senior' | 'lead'
  duration: number // minutes
  questionTypes: string[]
  studioId?: string
}

export interface InterviewSession {
  sessionId: string
  config: InterviewConfig
  questions: InterviewQuestion[]
  currentQuestionIndex: number
  status: 'preparing' | 'active' | 'paused' | 'completed' | 'cancelled'
  startTime: string
  responses: InterviewResponse[]
}

export interface InterviewQuestion {
  id: string
  type: 'behavioral' | 'technical' | 'studio-specific'
  question: string
  context?: string
  expectedDuration: number // seconds
  followUp?: string[]
}

export interface InterviewResponse {
  questionId: string
  response: string
  duration: number // seconds
  timestamp: string
  analysis?: {
    score: number
    feedback: string
    strengths: string[]
    improvements: string[]
  }
}

// App State IPC
export interface AppSettings {
  geminiApiKey?: string
  selectedModel?: string
  theme: 'light' | 'dark' | 'auto'
  voiceMode: boolean
  selectedMicId?: string
  selectedSpeakerId?: string
  autoSave: boolean
}

// Portfolio IPC
export interface PortfolioExportRequest {
  format: 'html' | 'json' | 'pdf'
  includeFeaturedOnly?: boolean
  includeAnalytics?: boolean
}

// Gaming Industry Job IPC
export interface JobSearchFilters {
  roles?: string[]
  studios?: string[]
  location?: string
  remote?: boolean
  experience?: string
  engines?: string[]
  skills?: string[]
}

export interface GameStudio {
  id: string
  name: string
  logo?: string
  location: string
  size: string
  description?: string
  website?: string
}

export interface GameJobListing {
  id: string
  title: string
  studio: GameStudio
  location: string
  remote: boolean
  type: 'full-time' | 'part-time' | 'contract' | 'internship'
  experience: 'entry' | 'mid' | 'senior' | 'lead'
  description: string
  requirements: string[]
  engines: string[]
  skills: string[]
  salary?: {
    min: number
    max: number
    currency: string
  }
  benefits?: string[]
  postedDate: string
  applicationUrl: string
}

// Main IPC API Surface (what's exposed via contextBridge)
export interface MainAPI {
  // AI Operations
  ai: {
    init: (request: AIInitRequest) => Promise<AIInitResponse>
    generateText: (request: AITextRequest) => Promise<string>
    generateStream: (request: AITextRequest) => AsyncGenerator<AIStreamResponse>
    cancel: (id: string) => Promise<void>
    getStatus: () => Promise<{ initialized: boolean; model?: string }>
  }

  // Media/Audio
  media: {
    getDevices: () => Promise<MediaDeviceInfo[]>
    requestPermissions: (
      constraints: MediaConstraints
    ) => Promise<AudioPermissionResult>
    startRecording: (
      deviceId?: string
    ) => Promise<{ success: boolean; streamId?: string }>
    stopRecording: (
      streamId: string
    ) => Promise<{ success: boolean; audioData?: ArrayBuffer }>
    playAudio: (audioData: ArrayBuffer) => Promise<{ success: boolean }>
  }

  // File System
  fs: {
    showOpenDialog: (options: FileDialogOptions) => Promise<FileDialogResult>
    showSaveDialog: (options: FileDialogOptions) => Promise<FileDialogResult>
    readFile: (filePath: string) => Promise<string | ArrayBuffer>
    writeFile: (
      filePath: string,
      data: string | ArrayBuffer
    ) => Promise<boolean>
  }

  // Interview System
  interview: {
    start: (config: InterviewConfig) => Promise<InterviewSession>
    getQuestion: (sessionId: string) => Promise<InterviewQuestion>
    submitResponse: (
      sessionId: string,
      response: InterviewResponse
    ) => Promise<void>
    pause: (sessionId: string) => Promise<void>
    resume: (sessionId: string) => Promise<void>
    complete: (sessionId: string) => Promise<InterviewSession>
    cancel: (sessionId: string) => Promise<void>
    getStats: () => Promise<any>
    getHistory: () => Promise<InterviewSession[]>
  }

  // App Settings
  app: {
    getSettings: () => Promise<AppSettings>
    updateSettings: (settings: Partial<AppSettings>) => Promise<void>
    getVersion: () => Promise<string>
    quit: () => Promise<void>
    reportError: (
      errorData: any
    ) => Promise<{ success: boolean; error?: string }>
  }

  // Portfolio
  portfolio: {
    export: (
      request: PortfolioExportRequest
    ) => Promise<{ success: boolean; filePath?: string }>
    import: (filePath: string) => Promise<{ success: boolean; data?: any }>
  }

  // Gaming Jobs
  jobs: {
    search: (filters: JobSearchFilters) => Promise<GameJobListing[]>
    getStudios: () => Promise<GameStudio[]>
    saveJob: (jobId: string) => Promise<void>
    getSavedJobs: () => Promise<GameJobListing[]>
    applyToJob: (
      jobId: string,
      resume: ArrayBuffer
    ) => Promise<{ success: boolean }>
  }

  // Event listeners for streaming/real-time updates
  on: (event: string, callback: (...args: any[]) => void) => void
  off: (event: string, callback: (...args: any[]) => void) => void
}

// Runtime validation schemas (to be used with zod or io-ts)
export const IPC_EVENTS = {
  // AI Events
  AI_INIT: 'ai:init',
  AI_GENERATE: 'ai:generate',
  AI_STREAM_START: 'ai:stream:start',
  AI_STREAM_CHUNK: 'ai:stream:chunk',
  AI_STREAM_END: 'ai:stream:end',
  AI_STREAM_ERROR: 'ai:stream:error',

  // Media Events
  MEDIA_DEVICES_CHANGED: 'media:devices:changed',
  AUDIO_RECORDING_START: 'audio:recording:start',
  AUDIO_RECORDING_DATA: 'audio:recording:data',
  AUDIO_RECORDING_END: 'audio:recording:end',

  // Interview Events
  INTERVIEW_QUESTION_CHANGE: 'interview:question:change',
  INTERVIEW_STATUS_CHANGE: 'interview:status:change',

  // App Events
  APP_SETTINGS_CHANGED: 'app:settings:changed',
  APP_THEME_CHANGED: 'app:theme:changed',
} as const
