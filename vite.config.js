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
    // Dev API mock middleware (enabled when no API proxy target is configured)
    {
      name: 'dev-api-mock',
      apply: 'serve',
      configureServer(server) {
        try {
          const apiTarget = process.env.VITE_API_PROXY_TARGET || process.env.API_PROXY_TARGET
          const enableMockEnv = String(process.env.VITE_ENABLE_API_MOCK || '').toLowerCase()
          const enableMock = !apiTarget && (enableMockEnv === 'true' || enableMockEnv === '' )

          if (!enableMock) return

          server.middlewares.use((req, res, next) => {
            const url = req.url || ''

            // Only handle /api requests
            if (!url.startsWith('/api')) return next()

            const sendJSON = (obj, status = 200) => {
              res.statusCode = status
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify(obj))
            }

            // Simple routing
            if (url === '/api/health' || url === '/api/v1/health') {
              return sendJSON({ status: 'ok', env: 'mock', time: new Date().toISOString() })
            }

            if (url === '/api/system/status' || url === '/api/v1/system/status') {
              return sendJSON({
                uptime: process.uptime(),
                version: 'dev-mock',
                checks: { db: 'ok', cache: 'ok' },
              })
            }

            if (url === '/api/models' || url === '/api/v1/models') {
              return sendJSON({
                models: [
                  { id: 'gemini-2.0-flash-exp', provider: 'google', supports: ['text', 'vision', 'audio'] },
                  { id: 'gpt-4o-mini', provider: 'openai', supports: ['text', 'vision'] },
                  { id: 'claude-3-haiku', provider: 'anthropic', supports: ['text'] }
                ]
              })
            }

            // Tracking endpoints - no-op
            if (url.startsWith('/api/track/')) {
              res.statusCode = 204
              return res.end()
            }

            // Known but unimplemented endpoints can return a helpful message
            if (url.startsWith('/api/v1/')) {
              return sendJSON({ ok: false, mock: true, hint: 'No backend configured. Set VITE_API_PROXY_TARGET to proxy /api to your server.' }, 501)
            }

            // Default: pass through
            return next()
          })
          console.log('[vite] dev-api-mock enabled: serving mock responses for /api/*')
        } catch {}
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
        // Use function-based manualChunks to enable smarter vendor splitting
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          const parts = id.split('node_modules/')[1]
          const pkg = parts.startsWith('@') ? parts.split('/').slice(0, 2).join('/') : parts.split('/')[0]

          // Group some known-heavy vendors for better caching
          const groups = {
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            'ui-vendor': ['vuetify'],
            'ai-vendor': ['@ai-sdk/google', 'ai', '@google/genai', '@google/generative-ai'],
            'data-vendor': ['pdf-lib', 'xlsx', 'file-saver', 'jszip'],
            'charts-vendor': ['chart.js', 'vue-chartjs', 'animejs'],
            'utils-vendor': ['lodash-es', 'date-fns', 'fuse.js', 'validator'],
            'media-vendor': ['compromise', 'natural'],
            'http-vendor': ['axios', 'workbox-window'],
            // Separate heavy vendors into their own chunks
            'phonemizer-vendor': ['phonemizer'],
            'transformers-vendor': ['@huggingface/transformers'],
            'ml-vendor': ['@tensorflow/tfjs', 'onnxruntime-web', 'ml-matrix']
          }
          for (const [group, pkgs] of Object.entries(groups)) {
            if (pkgs.includes(pkg)) return group
          }
          // Fallback: split by package for other vendors
          return `vendor-${pkg}`
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
    // Raise limit for heavy ML/AI vendors while keeping others optimized
    chunkSizeWarningLimit: 1500,
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
    // Force pre-bundling of frequently used deps
    include: [
      'animejs', 
      'buffer', 
      'process', 
      'util', 
      'vue-content-loader', 
      'pdf-lib',
      '@google/generative-ai'
    ],
    // Exclude Node.js-only modules from browser builds
    exclude: [
      'better-sqlite3',
      'electron',
      'fs',
      'path',
      'crypto',
      'events',
      // Database services that depend on better-sqlite3
      '@/services/database/DatabaseManager',
      '@/services/database/StudioRepository',
      '@/services/database/JobRepository',
      '@/services/database/DatabaseStudioService',
      '@/services/database/DatabaseJobService'
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
