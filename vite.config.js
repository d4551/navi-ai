import { defineConfig, splitVendorChunkPlugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import process from 'node:process'

export default defineConfig(({ command }) => ({
  plugins: [
    vue(),
    // Improve vendor chunk splitting to reduce main bundle size
    splitVendorChunkPlugin(),
    // Dev-only middleware to ensure proper Content-Type for all module types
    {
      name: 'fix-mime-types',
      apply: 'serve',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || ''
          const originalWriteHead = res.writeHead
          res.writeHead = function patchedWriteHead(...args) {
            try {
              const path = (url.split('?')[0]) || ''

              // Fix MIME types for various file extensions
              if (path.endsWith('.vue') || path.includes('.vue?')) {
                const existing = res.getHeader('Content-Type')
                if (!existing) {
                  res.setHeader('Content-Type', 'text/javascript; charset=utf-8')
                }
              } else if (path.endsWith('.ts') || path.includes('.ts?')) {
                const existing = res.getHeader('Content-Type')
                if (!existing) {
                  res.setHeader('Content-Type', 'text/javascript; charset=utf-8')
                }
              } else if (path.endsWith('.js') || path.includes('.js?')) {
                const existing = res.getHeader('Content-Type')
                if (!existing || existing === '') {
                  res.setHeader('Content-Type', 'text/javascript; charset=utf-8')
                }
              } else if (path.endsWith('.css') || path.includes('.css?')) {
                const existing = res.getHeader('Content-Type')
                if (!existing) {
                  res.setHeader('Content-Type', 'text/css; charset=utf-8')
                }
              }
            } catch {}
            // Preserve original semantics for all signatures
            return originalWriteHead.apply(this, args)
          }
          next()
        })
      }
    },
    // Development CSP handler
    {
      name: 'dev-csp-handler',
      apply: 'serve',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Remove any conflicting CSP headers from middleware
          res.removeHeader('Content-Security-Policy')
          res.removeHeader('Content-Security-Policy-Report-Only')
          next()
        })
      }
    },
    {
      name: 'global-polyfill',
      config(config) {
        config.define = config.define || {}
        config.define.global = config.define.global || 'globalThis'
      }
    }
  ],
  // Use absolute base in dev to avoid odd relative import/MIME issues
  base: command === 'build' ? './' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Reduce bundle size and avoid source map issues
    minify: 'terser',
    // Enable more aggressive tree shaking
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    rollupOptions: {
      external: [
        'better-sqlite3',
        'electron', 
        'fs',
        'path',
        'crypto',
        'events'
      ],
      output: {
        // Optimized manual chunks for better caching and loading
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            // Split application code by feature
            if (id.includes('src/views/')) {
              const viewName = id.split('src/views/')[1].split('.')[0]
              return `view-${viewName.toLowerCase()}`
            }
            if (id.includes('src/components/')) {
              if (id.includes('src/components/ui/')) return 'ui-components'
              if (id.includes('src/components/settings/')) return 'settings-components'
              if (id.includes('src/components/portfolio/')) return 'portfolio-components'
              if (id.includes('src/components/jobs/')) return 'jobs-components'
              return 'shared-components'
            }
            return undefined
          }

          const parts = id.split('node_modules/')[1]
          const pkg = parts.startsWith('@') ? parts.split('/').slice(0, 2).join('/') : parts.split('/')[0]

          // Critical app dependencies - load early
          const critical = ['vue', 'vue-router', 'pinia']
          if (critical.includes(pkg)) return 'app-core'

          // Heavy AI/ML libraries - lazy load
          const aiLibs = ['@ai-sdk/google', '@google/generative-ai', '@google/genai', 'ai']
          if (aiLibs.includes(pkg)) return 'ai-core'

          const mlLibs = ['@huggingface/transformers', '@tensorflow/tfjs', 'onnxruntime-web', 'onnxruntime-common']
          if (mlLibs.includes(pkg)) return 'ml-heavy'

          // Audio processing - only load when needed
          const audioLibs = ['phonemizer', 'kokoro-js']
          if (audioLibs.includes(pkg)) return 'audio-processing'

          // Document processing
          const docLibs = ['pdf-lib', 'html2canvas', 'file-saver', 'jszip']
          if (docLibs.includes(pkg)) return 'document-processing'

          // UI framework
          const uiLibs = ['vuetify', '@heroicons/vue', 'vue-toastification']
          if (uiLibs.includes(pkg)) return 'ui-framework'

          // Charts and visualization
          const chartLibs = ['chart.js', 'vue-chartjs', 'cytoscape', 'animejs']
          if (chartLibs.includes(pkg)) return 'charts-viz'

          // Utilities - smaller chunks
          const utilLibs = ['lodash-es', 'date-fns', 'fuse.js', 'validator', 'zod', 'dompurify']
          if (utilLibs.includes(pkg)) return 'utils'

          // HTTP and networking
          const httpLibs = ['axios', 'workbox-window']
          if (httpLibs.includes(pkg)) return 'http'

          // Text processing
          const textLibs = ['compromise', 'natural', 'marked']
          if (textLibs.includes(pkg)) return 'text-processing'

          // Monitoring and dev tools
          const monitoringLibs = ['@sentry/browser', '@sentry/core']
          if (monitoringLibs.includes(pkg)) return 'monitoring'

          // Fallback for small vendors
          return `vendor-misc`
        },
        // Optimize chunk file naming
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'css/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    },
    // Optimized chunk size limits
    chunkSizeWarningLimit: 800, // Stricter limit to catch bloated chunks
    target: 'es2020', // Modern browsers support
    cssCodeSplit: true, // Split CSS into separate chunks
    reportCompressedSize: false // Faster builds
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@modules': fileURLToPath(new URL('./src/modules', import.meta.url)),
      'util': 'util',
      'process': 'process',
      'buffer': 'buffer',
      // Alias Node.js-only modules to browser-safe stubs in development
      ...(command === 'serve' ? {
        'better-sqlite3': fileURLToPath(new URL('./src/stubs/better-sqlite3.js', import.meta.url)),
        'events': fileURLToPath(new URL('./src/stubs/events.js', import.meta.url))
      } : {})
    }
  },
  define: {
    global: 'globalThis',
    'process.env': '{}',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.platform': JSON.stringify(process.platform),
    'process.version': JSON.stringify(process.version),
    // Define Node.js-only modules as empty objects in browser
    '__VITE_IS_NODE__': 'false'
  },
  optimizeDeps: {
    // Force pre-bundling of critical dependencies
    include: [
      'vue',
      'vue-router',
      'pinia',
      '@vueuse/core',
      'animejs',
      'vue-content-loader'
    ],
    // Exclude heavy and conditional dependencies
    exclude: [
      // Node.js only
      'better-sqlite3',
      'electron',
      'fs', 'path', 'crypto', 'events',
      // Heavy AI/ML libraries (lazy load)
      '@huggingface/transformers',
      'onnxruntime-web',
      'phonemizer',
      // Database services
      '@/services/database/DatabaseManager',
      '@/services/database/StudioRepository',
      '@/services/database/JobRepository',
      '@/services/database/DatabaseStudioService',
      '@/services/database/DatabaseJobService',
      // Conditional features
      'workbox-window',
      '@sentry/browser'
    ],
    entries: ['index.html']
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler' // or "modern"
      }
    }
  },
  server: {
    // Allow overriding via environment variable (e.g. VITE_PORT=5180 npm run electron-dev:port)
    port: Number(process.env.VITE_PORT) || 5173,
    // Bind to all interfaces so Codespaces/containers can reach it
    host: true,
    strictPort: true,
    cors: true,
    headers: {
      // Strongly discourage any caching to avoid 304s without Content-Type
      'Cache-Control': 'no-store, max-age=0, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      // Allow Vite HMR and development resources - CSP handled by HTML meta tag
    },
    // Configure HMR for Codespaces environment
    hmr: (() => {
      const isCodespaces = !!process.env.CODESPACES;
      
      if (!isCodespaces) {
        // Local development - standard HMR with WebSocket
        return true;
      }
      
      // In Codespaces, configure HMR to work without WebSocket errors
      return {
        overlay: {
          warnings: false,
          errors: false // Hide HMR overlay errors to reduce noise
        }
      };
    })(),
    // Dev proxy to work around CORS for public APIs
    proxy: {
      '/proxy/remoteok': {
        target: 'https://remoteok.io',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/proxy\/remoteok/, '')
      },
      // Optional API proxy for local backend. Set VITE_API_PROXY_TARGET (or API_PROXY_TARGET)
      // to something like "http://localhost:18422" to enable.
      ...(process.env.VITE_API_PROXY_TARGET || process.env.API_PROXY_TARGET
        ? {
            '/api': {
              target: process.env.VITE_API_PROXY_TARGET || process.env.API_PROXY_TARGET,
              changeOrigin: true,
              secure: false,
              // Keep the /api prefix as-is; backend should serve under the same base path
              // If your backend does not expect /api, uncomment the rewrite below.
              // rewrite: (path) => path.replace(/^\/api/, '')
            }
          }
        : {})
    },
    // Prevent webpack-related connection issues
    fs: {
      strict: false // Allow serving files outside of root
    }
  }
}))
