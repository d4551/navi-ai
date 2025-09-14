// Flat ESLint config for Vue 3 + TypeScript SFC
import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'

export default [
  {
    ignores: [
      'dist',
      'dist-electron',
      'node_modules',
      'coverage',
      'docs/api.html',
    ],
  },
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.vue', '**/*.ts', '**/*.js'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: {
          ts: tsParser,
        },
        ecmaVersion: 2022,
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        getComputedStyle: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        console: 'readonly',
  fetch: 'readonly',
  Headers: 'readonly',
  Request: 'readonly',
  Response: 'readonly',
        // Common browser APIs used across views/components
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        ResizeObserver: 'readonly',
        confirm: 'readonly',
        alert: 'readonly',
        location: 'readonly',
        history: 'readonly',
        // TS DOM types occasionally flagged by parser in SFCs
        HTMLElement: 'readonly',
        HTMLSelectElement: 'readonly',
        HTMLVideoElement: 'readonly',
        HTMLCanvasElement: 'readonly',
        HTMLImageElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLAudioElement: 'readonly',
        KeyboardEvent: 'readonly',
        MouseEvent: 'readonly',
        TouchEvent: 'readonly',
        Event: 'readonly',
        CustomEvent: 'readonly',
        FocusEvent: 'readonly',
        DragEvent: 'readonly',
        MutationObserver: 'readonly',
        MediaDeviceInfo: 'readonly',
        atob: 'readonly',
        btoa: 'readonly',
        SpeechSynthesisUtterance: 'readonly',
        FileReader: 'readonly',
        performance: 'readonly',
        MediaRecorder: 'readonly',
        MediaStream: 'readonly',
        MediaTrackConstraints: 'readonly',
        DisplayMediaStreamOptions: 'readonly',
        BlobEvent: 'readonly',
        MediaRecorderOptions: 'readonly',
        AudioContext: 'readonly',
        AnalyserNode: 'readonly',
        SpeechRecognition: 'readonly',
        webkitSpeechRecognition: 'readonly',
        HTMLMediaElement: 'readonly',
        ScriptProcessorNode: 'readonly',
        ImageData: 'readonly',
        WebSocket: 'readonly',
        AbortController: 'readonly',
        TextDecoder: 'readonly',
        readonly: 'readonly',
        // Vue 3 types
        ComputedRef: 'readonly',
        Ref: 'readonly',
        // Additional browser APIs
        MediaQueryListEvent: 'readonly',
        EventListener: 'readonly',
  Notification: 'readonly',
  File: 'readonly',
  URLSearchParams: 'readonly',
  Audio: 'readonly',
  crypto: 'readonly',
  process: 'readonly',
  ReadableStream: 'readonly',
  WritableStream: 'readonly',
  TransformStream: 'readonly',
  RequestInit: 'readonly',
  NotificationPermission: 'readonly',
  FocusOptions: 'readonly',
  PropertiesService: 'readonly',
  DocumentApp: 'readonly',
  SpeechSynthesis: 'readonly',
  SpeechSynthesisVoice: 'readonly',
  MediaStreamConstraints: 'readonly',
  MediaStreamAudioSourceNode: 'readonly',
  AudioWorkletNode: 'readonly',
  IDBDatabase: 'readonly',
  indexedDB: 'readonly',
  IDBOpenDBRequest: 'readonly',
  IDBKeyRange: 'readonly',
  IDBRequest: 'readonly',
  NodeJS: 'readonly'
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-useless-escape': 'warn',
      'no-empty': 'off',
      // Disallow direct use of 3rd-party toast lib in app code
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'vue-toast-notification',
              message: 'Use @/composables/useToast instead to ensure consistent styling and logging.',
            },
            {
              name: '@/components/ai/FairyAIFloatingButton.vue',
              message: 'Deprecated. Use AIFairyAssistant.vue (globally mounted in App.vue).',
            },
          ],
        },
      ],
      'vue/no-reserved-component-names': 'off',
      'vue/no-unused-components': 'warn',
      'vue/no-mutating-props': 'warn', // Allow prop mutations with warning for now
      'vue/multi-word-component-names': 'off', // Allow single-word component names
      'vue/no-v-html': 'warn', // Allow v-html with warning for controlled content
      'vue/valid-v-slot': ['error', { 
        allowModifiers: true // Allow Vuetify slot naming like #item.title
      }],
      // Tame noisy style-only rules for now
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
    },
  },
  // Global CJS scripts (Node environment)
  {
    files: ['**/*.cjs'],
    languageOptions: {
      globals: {
        console: 'readonly',
        global: 'readonly',
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'writable',
        Buffer: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
        globalThis: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
  // Test files: relax restricted imports to allow legacy test fixtures
  {
    files: ['test/**/*.js', 'test/**/*.ts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  // Scripts directory configuration
  {
    files: [
      'scripts/**/*.js',
      'scripts/**/*.cjs'
    ],
    languageOptions: {
      globals: {
        // Node.js globals
        console: 'readonly',
        global: 'readonly',
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'writable',
        Buffer: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
        globalThis: 'readonly'
      }
    },
    rules: {
      'no-console': 'off'
    }
  },
  // Environment-specific overrides
  {
    files: ['test/**', 'test/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        global: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly'
      }
    },
    rules: {
      'no-undef': 'off'
    }
  },
  {
    files: [
      'electron/**/*.cjs',
      'electron/**/*.js'
    ],
    languageOptions: {
      globals: {
        // Node.js/Electron main process globals
        console: 'readonly',
        global: 'readonly',
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        exports: 'writable',
        Buffer: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
        globalThis: 'readonly'
      }
    }
  },
  {
    files: [
      'src/services/providers/**',
      'src/services/**/*.ts',
      'src/services/**/*.js',
      'src/utils/logger.*',
      'src/utils/gamification.js'
    ],
    languageOptions: {
      globals: {
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        NodeJS: 'readonly',
        GeminiProvider: 'readonly'
      }
    }
  }
]
