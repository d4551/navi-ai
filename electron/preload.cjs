/* eslint-env browser */
/* global navigator MediaRecorder Blob URL Audio */
// Secure preload script with typed IPC contracts
// Exposes safe main process APIs to renderer via contextBridge

const { contextBridge, ipcRenderer } = require('electron')

// Preload cache for data generation/retrieval
const preloadCache = new Map()

async function runPreloadTasks() {
  const tasks = [
    {
      key: 'aiModels',
      origin: 'ai-list-models',
      loader: () => ipcRenderer.invoke('ai-list-models'),
    },
    {
      key: 'appSettings',
      origin: 'app-get-settings',
      loader: () => ipcRenderer.invoke('app-get-settings'),
    },
  ]

  for (const task of tasks) {
    try {
      const data = await task.loader()
      preloadCache.set(task.key, {
        data,
        metadata: {
          timestamp: new Date().toISOString(),
          origin: task.origin,
        },
      })
    } catch (error) {
      console.error(`Preload task '${task.key}' failed:`, error)
    }
  }
}

runPreloadTasks()

contextBridge.exposeInMainWorld('preloadCache', {
  get: key => preloadCache.get(key) || null,
})

// Renderer-managed audio helpers
const activeRecorders = new Map()

// Preloaded AI responses cache
const preloadedPromptCache = new Map()

async function preloadCommonPrompts() {
  const prompts = [
    'What is NAVI?',
    'How can I improve my resume for the gaming industry?',
  ]
  for (const prompt of prompts) {
    try {
      const response = await ipcRenderer.invoke('ai-generate-text', { prompt })
      preloadedPromptCache.set(prompt, { response, used: 0 })
    } catch (error) {
      console.warn('Failed to preload prompt:', prompt, error)
    }
  }
}

function getPreloadedResponse(prompt) {
  const entry = preloadedPromptCache.get(prompt)
  if (entry) {
    entry.used += 1
    return entry.response
  }
  return null
}

function getPreloadStats() {
  const stats = {}
  for (const [prompt, data] of preloadedPromptCache.entries()) {
    stats[prompt] = { used: data.used }
  }
  return stats
}

ipcRenderer.on(
  'renderer-start-recording',
  async (_event, { streamId, deviceId }) => {
    try {
      const constraints = {
        audio: deviceId ? { deviceId: { exact: deviceId } } : true,
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      const chunks = []
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      })
      recorder.ondataavailable = e => {
        if (e.data.size) chunks.push(e.data)
      }
      recorder.start()
      activeRecorders.set(streamId, { recorder, stream, chunks })
    } catch (err) {
      ipcRenderer.send(`audio-recording-error-${streamId}`, err.message)
    }
  }
)

ipcRenderer.on('renderer-stop-recording', async (_event, { streamId }) => {
  const rec = activeRecorders.get(streamId)
  if (!rec) {
    ipcRenderer.send(`audio-recording-error-${streamId}`, 'Unknown stream')
    return
  }
  rec.recorder.onstop = async () => {
    try {
      const blob = new Blob(rec.chunks, { type: 'audio/webm;codecs=opus' })
      const buffer = Buffer.from(await blob.arrayBuffer())
      ipcRenderer.send(`audio-recording-complete-${streamId}`, buffer)
    } finally {
      rec.stream.getTracks().forEach(t => t.stop())
      activeRecorders.delete(streamId)
    }
  }
  rec.recorder.stop()
})

ipcRenderer.on('renderer-play-audio', (_event, { audioData }) => {
  try {
    const blob = new Blob([audioData], { type: 'audio/webm;codecs=opus' })
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    const cleanup = () => {
      URL.revokeObjectURL(url)
      audio.removeEventListener('ended', cleanup)
    }
    audio.addEventListener('ended', cleanup)
    audio.play().catch(cleanup)
  } catch (error) {
    console.error('Failed to play audio:', error)
  }
})

// Simple validation schemas (replacing zod for preload context)
const AITextRequestSchema = {
  validate: data => {
    if (!data || typeof data !== 'object') return false
    if (
      !data.prompt ||
      typeof data.prompt !== 'string' ||
      data.prompt.length < 1
    )
      return false
    if (data.systemInstructions && typeof data.systemInstructions !== 'string')
      return false
    if (data.options) {
      const opts = data.options
      if (
        opts.temperature &&
        (typeof opts.temperature !== 'number' ||
          opts.temperature < 0 ||
          opts.temperature > 2)
      )
        return false
      if (
        opts.topK &&
        (typeof opts.topK !== 'number' ||
          opts.topK <= 0 ||
          !Number.isInteger(opts.topK))
      )
        return false
      if (
        opts.topP &&
        (typeof opts.topP !== 'number' || opts.topP < 0 || opts.topP > 1)
      )
        return false
      if (
        opts.maxTokens &&
        (typeof opts.maxTokens !== 'number' ||
          opts.maxTokens <= 0 ||
          !Number.isInteger(opts.maxTokens))
      )
        return false
      if (opts.model && typeof opts.model !== 'string') return false
    }
    return true
  },
}

const FileDialogOptionsSchema = {
  validate: data => {
    if (!data || typeof data !== 'object') return false
    if (data.title && typeof data.title !== 'string') return false
    if (data.defaultPath && typeof data.defaultPath !== 'string') return false
    if (data.buttonLabel && typeof data.buttonLabel !== 'string') return false
    if (data.filters) {
      if (!Array.isArray(data.filters)) return false
      for (const filter of data.filters) {
        if (!filter.name || typeof filter.name !== 'string') return false
        if (!Array.isArray(filter.extensions)) return false
        for (const ext of filter.extensions) {
          if (typeof ext !== 'string') return false
        }
      }
    }
    if (data.properties) {
      if (!Array.isArray(data.properties)) return false
      const validProps = [
        'openFile',
        'openDirectory',
        'multiSelections',
        'showHiddenFiles',
      ]
      for (const prop of data.properties) {
        if (!validProps.includes(prop)) return false
      }
    }
    return true
  },
}

const InterviewConfigSchema = {
  validate: data => {
    if (!data || typeof data !== 'object') return false
    if (!data.role || typeof data.role !== 'string' || data.role.length < 1)
      return false
    if (!['entry', 'mid', 'senior', 'lead'].includes(data.difficulty))
      return false
    if (
      !data.duration ||
      typeof data.duration !== 'number' ||
      data.duration <= 0 ||
      !Number.isInteger(data.duration)
    )
      return false
    if (!Array.isArray(data.questionTypes)) return false
    if (data.studioId && typeof data.studioId !== 'string') return false
    return true
  },
}

// Rate limiting for security
const rateLimiter = new Map()
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100

function checkRateLimit(channel) {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW

  if (!rateLimiter.has(channel)) {
    rateLimiter.set(channel, [])
  }

  const requests = rateLimiter.get(channel)
  // Remove old requests outside the window
  const recentRequests = requests.filter(time => time > windowStart)
  rateLimiter.set(channel, recentRequests)

  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    throw new Error(
      `Rate limit exceeded for ${channel}. Max ${RATE_LIMIT_MAX_REQUESTS} requests per minute.`
    )
  }

  recentRequests.push(now)
  return true
}

// Enhanced validation helper with security checks
function validateAndCall(schema, handler, options = {}) {
  const { enableRateLimit = true, sanitizeInput = true } = options

  return async (...args) => {
    try {
      // Rate limiting
      if (enableRateLimit) {
        checkRateLimit(handler.name || 'unknown')
      }

      // Input sanitization and validation
      if (schema && args.length > 0) {
        const input = args[0]

        // Use simple validation instead of zod
        if (!schema.validate(input)) {
          throw new Error('Input validation failed')
        }

        let validated = input

        // Basic sanitization for string inputs
        if (sanitizeInput && typeof validated === 'object') {
          validated = sanitizeObject(validated)
        }

        return await handler(validated, ...args.slice(1))
      }
      return await handler(...args)
    } catch (error) {
      console.error('IPC validation error:', error)
      throw new Error(`Invalid input: ${error.message}`)
    }
  }
}

// Basic input sanitization
function sanitizeObject(obj) {
  if (obj === null || typeof obj !== 'object') return obj

  const sanitized = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Basic XSS prevention - strip HTML tags and limit length
      sanitized[key] = value.replace(/<[^>]*>/g, '').slice(0, 10000)
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value)
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

// Safe event handler wrapper
function createEventHandler() {
  const listeners = new Map()

  return {
    on(event, callback) {
      if (!listeners.has(event)) {
        listeners.set(event, [])
        // Register with main process
        ipcRenderer.on(event, (_, ...args) => {
          listeners.get(event)?.forEach(cb => cb(...args))
        })
      }
      listeners.get(event).push(callback)
    },

    off(event, callback) {
      const eventListeners = listeners.get(event)
      if (eventListeners) {
        const index = eventListeners.indexOf(callback)
        if (index > -1) {
          eventListeners.splice(index, 1)
        }
      }
    },
  }
}

// IPC Surface (documented)
// window.api.ai
//   - init({ apiKey, model }) -> { success, model } (main stores key securely)
//   - generateText({ prompt, systemInstructions?, options? }) -> string
//   - streamGenerate(request, { onChunk, onComplete, onError }) -> controller.cancel()
//   - listModels() -> Model[] | { success, data: Model[] }
//   - mapSkills({ experience, options? }) -> any
//   - scoreResume({ resumeData, jobTitle, options? }) -> any
// window.api.media
//   - getDevices() -> { success, ... }
//   - requestPermissions({ audio?, video? }) -> { success, granted? }
// window.api.audio
//   - sttTranscribe({ provider, audioData, mimeType, language? }) -> { success, transcript? }
//   - ttsSpeak({ provider, text, voice?, rate?, pitch?, volume?, language? })
// window.api.app
//   - getSettings() -> { version, platform, theme, selectedModel, ... }
//   - updateSettings(patch) -> { success }
//   - getVersion(), quit()
// window.electronAPI.interview
//   - start(config), pause(sessionId), resume(sessionId), complete(sessionId), cancel(sessionId)
//   - getStats(), getHistory(params), nextQuestion(sessionId), submitResponse({ sessionId, response })

// Create the secure API surface
const eventHandler = createEventHandler()

const secureAPI = {
  // AI Operations - validated and secure (canonical)
  ai: {
    init: validateAndCall(
      {
        validate: data => {
          if (!data || typeof data !== 'object') return false
          if (
            !data.apiKey ||
            typeof data.apiKey !== 'string' ||
            data.apiKey.length < 1
          )
            return false
          if (data.model && typeof data.model !== 'string') return false
          return true
        },
      },
      ({ apiKey, model }) => ipcRenderer.invoke('ai-init', { apiKey, model })
    ),
    generateText: validateAndCall(AITextRequestSchema, request =>
      ipcRenderer.invoke('ai-generate-text', request)
    ),
    // Unified streaming API matching main process channels
    streamGenerate(request, { onChunk, onComplete, onError } = {}) {
      if (!AITextRequestSchema.validate(request)) {
        throw new Error('Invalid request format')
      }
      const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      const chunkListener = (_, data) => {
        if (data.requestId !== requestId) return
        if (data.error) {
          onError && onError(new Error(data.error))
        } else if (data.chunk) {
          onChunk && onChunk(data.chunk)
        }
      }
      const completeListener = (_, data) => {
        if (data.requestId !== requestId) return
        if (data.error) {
          onError && onError(new Error(data.error))
        } else {
          onComplete &&
            onComplete({ latencyMs: data.latencyMs, cancelled: data.cancelled })
        }
        ipcRenderer.removeListener('ai-stream-chunk', chunkListener)
        ipcRenderer.removeListener('ai-stream-complete', completeListener)
      }
      ipcRenderer.on('ai-stream-chunk', chunkListener)
      ipcRenderer.on('ai-stream-complete', completeListener)
      // Send the validated request payload (named 'request') to main
      ipcRenderer.send('ai-stream-generate-start', { requestId, ...request })
      return {
        cancel() {
          ipcRenderer.send('ai-stream-cancel', requestId)
        },
      }
    },
    getStatus: () => ipcRenderer.invoke('ai-status'),
    listModels: () => ipcRenderer.invoke('ai-list-models'),
    mapSkills: payload => ipcRenderer.invoke('ai-skill-map', payload),
    scoreResume: payload => ipcRenderer.invoke('ai-resume-score', payload),
    getPreloaded: prompt => getPreloadedResponse(prompt),
    getPreloadStats: () => getPreloadStats(),
  },

  // Media/Audio - secure device access
  media: {
    getDevices: () => ipcRenderer.invoke('media-get-devices'),

    requestPermissions: validateAndCall(
      {
        validate: data => {
          if (!data || typeof data !== 'object') return false
          if (
            data.audio !== undefined &&
            typeof data.audio !== 'boolean' &&
            typeof data.audio !== 'object'
          )
            return false
          if (
            data.video !== undefined &&
            typeof data.video !== 'boolean' &&
            typeof data.video !== 'object'
          )
            return false
          return true
        },
      },
      constraints =>
        ipcRenderer.invoke('media-request-permissions', constraints)
    ),

    startRecording: deviceId =>
      ipcRenderer.invoke('audio-start-recording', { deviceId }),
    stopRecording: streamId =>
      ipcRenderer.invoke('audio-stop-recording', { streamId }),
    playAudio: audioData => ipcRenderer.invoke('audio-play', { audioData }),
    processSpeech: params => ipcRenderer.invoke('audio-process-speech', params),
  },

  // Audio (TTS/STT) — typed, safe
  audio: {
    sttTranscribe: validateAndCall(
      {
        validate: data => {
          if (!data || typeof data !== 'object') return false
          if (data.provider && !['system', 'gemini'].includes(data.provider))
            return false
          if (data.language && typeof data.language !== 'string') return false
          if (data.mimeType && typeof data.mimeType !== 'string') return false
          return true
        },
      },
      request => ipcRenderer.invoke('audio-stt-transcribe', request)
    ),
    ttsSpeak: validateAndCall(
      {
        validate: data => {
          if (!data || typeof data !== 'object') return false
          if (data.provider && !['system', 'gemini'].includes(data.provider))
            return false
          if (
            !data.text ||
            typeof data.text !== 'string' ||
            data.text.length < 1
          )
            return false
          if (data.voice && typeof data.voice !== 'string') return false
          if (
            data.rate !== undefined &&
            (typeof data.rate !== 'number' || data.rate < 0 || data.rate > 5)
          )
            return false
          if (
            data.pitch !== undefined &&
            (typeof data.pitch !== 'number' || data.pitch < 0 || data.pitch > 2)
          )
            return false
          if (
            data.volume !== undefined &&
            (typeof data.volume !== 'number' ||
              data.volume < 0 ||
              data.volume > 1)
          )
            return false
          if (data.language && typeof data.language !== 'string') return false
          if (data.outputDeviceId && typeof data.outputDeviceId !== 'string')
            return false
          return true
        },
      },
      request => ipcRenderer.invoke('audio-tts-speak', request)
    ),
  },

  // File System - sandboxed access
  fs: {
    showOpenDialog: validateAndCall(FileDialogOptionsSchema, options =>
      ipcRenderer.invoke('fs-show-open-dialog', options)
    ),

    showSaveDialog: validateAndCall(FileDialogOptionsSchema, options =>
      ipcRenderer.invoke('fs-show-save-dialog', options)
    ),

    // Only allow reading user-selected files
    readFile: filePath => ipcRenderer.invoke('fs-read-file', { filePath }),
    writeFile: (filePath, data) =>
      ipcRenderer.invoke('fs-write-file', { filePath, data }),
  },

  // Interview System
  interview: {
    start: validateAndCall(InterviewConfigSchema, config =>
      ipcRenderer.invoke('interview-start', { config })
    ),

    getQuestion: sessionId =>
      ipcRenderer.invoke('question-next', { sessionId }),

    submitResponse: (sessionId, response) =>
      ipcRenderer.invoke('response-submit', { sessionId, response }),

    pause: sessionId => ipcRenderer.invoke('interview-pause', { sessionId }),
    resume: sessionId => ipcRenderer.invoke('interview-resume', { sessionId }),
    complete: sessionId =>
      ipcRenderer.invoke('interview-complete', { sessionId }),
    cancel: sessionId => ipcRenderer.invoke('interview-cancel', { sessionId }),
    getStats: () => ipcRenderer.invoke('interview-stats'),
    getHistory: () => ipcRenderer.invoke('interview-history'),
    getAllStepSuggestions: () =>
      ipcRenderer.invoke('interview-suggestions-get-all'),
    setStepSuggestions: (stepKey, suggestionsOrRecord, meta = {}) => {
      if (suggestionsOrRecord && suggestionsOrRecord.questions) {
        return ipcRenderer.invoke('interview-suggestions-set', {
          stepKey,
          record: suggestionsOrRecord,
          rationale: meta.rationale,
        })
      }
      return ipcRenderer.invoke('interview-suggestions-set', {
        stepKey,
        suggestions: suggestionsOrRecord,
        rationale: meta.rationale,
      })
    },
  },

  // App Settings - secure preferences
  app: {
    getSettings: () => ipcRenderer.invoke('app-get-settings'),
    updateSettings: settings =>
      ipcRenderer.invoke('app-update-settings', settings),
    getVersion: () => ipcRenderer.invoke('app-get-version'),
    quit: () => ipcRenderer.invoke('app-quit'),
    reportError: errorData => ipcRenderer.invoke('app-report-error', errorData),
  },

  // Studio statistics persistence
  studios: {
    search: query => ipcRenderer.invoke('studio-search', query),
    getById: id => ipcRenderer.invoke('studio-get-by-id', { id }),
    getHealth: () => ipcRenderer.invoke('studio-get-health'),
    import: request => ipcRenderer.invoke('studio-import', request),
    export: () => ipcRenderer.invoke('studio-export'),
    getStatistics: () => ipcRenderer.invoke('studio-get-statistics'),
    getStats: studioId => ipcRenderer.invoke('studio-stats-get', { studioId }),
    setStats: (studioId, stats) =>
      ipcRenderer.invoke('studio-stats-set', { studioId, stats }),
    importNormalized: studios =>
      ipcRenderer.invoke('studios-import-normalized', { studios }),
    listNormalized: () => ipcRenderer.invoke('studios-list-normalized'),
    getNormalized: id => ipcRenderer.invoke('studios-get-normalized', { id }),
  },

  // Portfolio Export/Import
  portfolio: {
    export: validateAndCall(
      {
        validate: data => {
          if (!data || typeof data !== 'object') return false
          if (!['html', 'json', 'pdf'].includes(data.format)) return false
          if (
            data.includeFeaturedOnly !== undefined &&
            typeof data.includeFeaturedOnly !== 'boolean'
          )
            return false
          if (
            data.includeAnalytics !== undefined &&
            typeof data.includeAnalytics !== 'boolean'
          )
            return false
          return true
        },
      },
      request => ipcRenderer.invoke('portfolio-export', request)
    ),

    import: filePath => ipcRenderer.invoke('portfolio-import', { filePath }),
  },

  // Gaming Industry Jobs
  jobs: {
    search: filters => ipcRenderer.invoke('jobs-search', filters),
    getStudios: query => ipcRenderer.invoke('jobs-get-studios', query || {}),
    saveJob: jobId => ipcRenderer.invoke('jobs-save', { jobId }),
    getSavedJobs: () => ipcRenderer.invoke('jobs-get-saved'),
    applyToJob: (jobId, resume) =>
      ipcRenderer.invoke('jobs-apply', { jobId, resume }),
    match: (profile, jobs) =>
      ipcRenderer.invoke('jobs-match', { profile, jobs }),
    recommend: (profile, jobs, limit = 10) =>
      ipcRenderer.invoke('jobs-recommend', { profile, jobs, limit }),
  },

  // Event system
  on: eventHandler.on,
  off: eventHandler.off,
}

// Expose the secure API to renderer
contextBridge.exposeInMainWorld('api', secureAPI)

// Back-compat: expose electronAPI with the shape used in the app's types
// This mirrors legacy usage while routing to the same secure channels
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  saveFile: options => ipcRenderer.invoke('fs-show-save-dialog', options),
  openFile: options => ipcRenderer.invoke('fs-show-open-dialog', options),
  openExternal: url => ipcRenderer.invoke('open-external', url),

  // System info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),

  // AI operations (legacy names)
  ai: {
    initialize: config => ipcRenderer.invoke('ai-init', config),
    generateContent: params =>
      ipcRenderer.invoke('ai-generate-content', params),
    listModels: () => ipcRenderer.invoke('ai-list-models'),
  },

  // Interview operations
  interview: {
    start: config => ipcRenderer.invoke('interview-start', { config }),
    pause: sessionId => ipcRenderer.invoke('interview-pause', { sessionId }),
    resume: sessionId => ipcRenderer.invoke('interview-resume', { sessionId }),
    complete: sessionId =>
      ipcRenderer.invoke('interview-complete', { sessionId }),
    cancel: sessionId => ipcRenderer.invoke('interview-cancel', { sessionId }),
    nextQuestion: sessionId =>
      ipcRenderer.invoke('question-next', { sessionId }),
    submitResponse: data => ipcRenderer.invoke('response-submit', data),
    analyzeResponse: data => ipcRenderer.invoke('ai-analyze-response', data),
    getStats: () => ipcRenderer.invoke('interview-stats'),
    getHistory: params => ipcRenderer.invoke('interview-history', params),
    generateQuestions: config =>
      ipcRenderer.invoke('generate-questions', config),
  },

  // Media operations
  media: {
    getDevices: () => ipcRenderer.invoke('media-get-devices'),
    requestPermissions: constraints =>
      ipcRenderer.invoke('media-request-permissions', constraints),
  },

  // Audio operations
  audio: {
    processSpeech: data => ipcRenderer.invoke('audio-process-speech', data),
    generateSpeech: data => ipcRenderer.invoke('audio-generate-speech', data),
  },

  // Secure storage
  secureStore: {
    set: (key, value) => ipcRenderer.invoke('secure-store-set', { key, value }),
    get: key => ipcRenderer.invoke('secure-store-get', key),
  },

  // Database utilities
  db: {
    backupNow: defaultPath =>
      ipcRenderer.invoke('db-backup-now', { defaultPath }),
    getBackupInfo: () => ipcRenderer.invoke('db-get-backup-info'),
  },

  // Studio operations
  studios: {
    search: query => ipcRenderer.invoke('studio-search', query),
    getById: id => ipcRenderer.invoke('studio-get-by-id', { id }),
    getHealth: () => ipcRenderer.invoke('studio-get-health'),
    import: request => ipcRenderer.invoke('studio-import', request),
    export: () => ipcRenderer.invoke('studio-export'),
    getStatistics: () => ipcRenderer.invoke('studio-get-statistics'),
  },

  // Dev helpers
  openDevTools: () => ipcRenderer.invoke('dev-open-devtools'),
  reload: () => ipcRenderer.invoke('dev-reload'),
})

// Kick off AI prompt preloading
preloadCommonPrompts()
