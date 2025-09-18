import { createRouter, createWebHashHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { logger } from '@/shared/utils/logger'

// Views - Lazy loaded for better performance with MUI integration
const Dashboard = () => import('@/views/Dashboard.vue')
const GamingDashboard = () => import('@/views/GamingDashboard.vue')

// Document builder - unified resume and cover letter
const DocumentBuilder = () => import('@/views/DocumentBuilder.vue')
const ModernPortfolio = () => import('@/views/ModernPortfolio.vue')
const PortfolioStudio = () => import('@/views/PortfolioStudio.vue')
const PortfolioProjectView = () => import('@/views/PortfolioProjectView.vue')

// Job search and career tools
const JobSearch = () => import('@/views/Jobs.vue')
const SkillMapper = () => import('@/views/SkillMapper.vue')
const SkillMapperNew = () => import('@/views/AISkillMapper.vue')
const InterviewPrep = () => import('@/views/InterviewPrep.vue')
const InterviewSession = () => import('@/views/InterviewSession.vue')
const GamingInterview = () => import('@/views/GamingInterview.vue')
const JobTailoredResumeView = () => import('@/views/JobTailoredResumeView.vue')

// System and settings
const Settings = () => import('@/views/Settings.vue')
const GamificationHub = () => import('@/views/GamificationHub.vue')

// Production-Ready AI Components
const LiveJobBoard = () => import('@/views/LiveJobBoard.vue')
const AIJobMatching = () => import('@/views/AIJobMatching.vue')
const AIDashboard = () => import('@/views/AIDashboard.vue')
const AIInterviewPrep = () => import('@/views/AIInterviewPrep.vue')
const AIMediaDemo = () => import('@/views/AIMediaDemo.vue')
const AIIntegration = () => import('@/views/AIIntegration.vue')

// Demo and testing components
const RealTimeDemo = () => import('@/views/RealTimeDemo.vue')
const VoiceServicesTest = () => import('@/views/VoiceServicesTest.vue')
const FairyChatDemo = () => import('@/views/FairyChatDemo.vue')
const HeaderDemo = () => import('@/views/HeaderDemo.vue')

// Studio-related views
const TheStudios = () => import('@/views/TheStudio.vue')
const StudioDatabase = () => import('@/views/StudioDatabase.vue')
const StudioAnalytics = () => import('@/views/StudioAnalytics.vue')
const StudioNetworking = () => import('@/views/StudioNetworking.vue')

// System views
const TheFlow = () => import('@/views/TheFlow.vue')
const TheCloud = () => import('@/views/TheCloud.vue')
const TheSystem = () => import('@/views/TheSystem.vue')

// Dev/diagnostics
const Pathology = () => import('@/views/Pathology.vue')

// Optional effects + perf utilities
import { initEffects, staggerFadeIn, pulseOnFocus } from '@/utils/effects'
import { performanceMonitor } from '@/utils/performance'

const routes = [
  // Root redirect
  {
    path: '/',
    redirect: '/dashboard',
    meta: {
      title: 'Gaming Career Dashboard',
      icon: 'mdi-gamepad-variant',
      muiTheme: true,
      aiPowered: true,
      samMaxStyle: true,
    },
  },

  // Main dashboards
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      title: 'Gaming Career Dashboard',
      icon: 'mdi-view-dashboard',
      muiTheme: true,
      aiPowered: true,
      samMaxStyle: true,
    },
  },
  {
    path: '/gaming-dashboard',
    name: 'GamingDashboard',
    component: GamingDashboard,
    alias: ['/hub', '/gaming-hub'],
    meta: {
      title: 'Gaming Career Hub',
      icon: 'mdi-gamepad-variant',
      muiTheme: false,
      aiPowered: true,
      samMaxStyle: true,
    },
  },
  {
    path: '/gamification',
    name: 'GamificationHub',
    component: GamificationHub,
    meta: {
      title: 'Gamification Hub',
      icon: 'mdi-trophy',
      muiTheme: true,
      aiPowered: false,
      samMaxStyle: true,
    },
  },

  // Career Documents Section - Unified Document Builder
  {
    path: '/documents',
    name: 'DocumentBuilder',
    component: DocumentBuilder,
    alias: [
      '/resume',
      '/cover-letter',
      '/documents/resume',
      '/documents/cover-letter',
    ],
    meta: {
      title: 'Document Builder',
      icon: 'mdi-text-box-edit-outline',
      muiTheme: true,
      aiPowered: true,
      samMaxStyle: true,
    },
  },

  // Legacy document routes (redirect to unified builder)
  {
    path: '/resume-builder',
    redirect: '/documents',
  },
  {
    path: '/cover-letter-builder',
    redirect: '/documents',
  },

  // Portfolio section
  {
    path: '/portfolio',
    name: 'ModernPortfolio',
    component: ModernPortfolio,
    alias: ['/portfolio/showcase', '/modern-portfolio', '/portfolio-modern'],
    meta: {
      title: 'Portfolio',
      icon: 'mdi-briefcase-variant',
      muiTheme: true,
      aiPowered: true,
      samMaxStyle: true,
    },
  },
  {
    path: '/portfolio/manage',
    name: 'PortfolioStudio',
    component: PortfolioStudio,
    alias: [
      '/portfolio/templates',
      '/portfolio/analytics',
      '/portfolio-legacy',
    ],
    meta: {
      title: 'Portfolio Studio',
      icon: 'mdi-briefcase-variant',
      muiTheme: true,
      aiPowered: true,
      samMaxStyle: true,
    },
  },
  {
    path: '/portfolio/project/:slug',
    name: 'PortfolioProjectView',
    component: PortfolioProjectView,
    meta: {
      title: 'Project',
      icon: 'mdi-briefcase-outline',
      muiTheme: true,
    },
  },

  // Skills section
  {
    path: '/skills',
    name: 'SkillMapper',
    component: SkillMapper,
    meta: {
      title: 'Skill Mapper',
      icon: 'mdi-map',
      muiTheme: true,
      aiPowered: true,
      samMaxStyle: true,
    },
  },

  // Jobs section
  {
    path: '/jobs',
    name: 'JobSearch',
    component: JobSearch,
    meta: {
      title: 'Unified Job Board',
      icon: 'mdi-briefcase-search',
      muiTheme: true,
      aiPowered: true,
      samMaxStyle: true,
    },
  },
  {
    path: '/jobs/tailored',
    name: 'JobTailoredResume',
    component: JobTailoredResumeView,
    meta: {
      title: 'Job-Tailored Resume',
      icon: 'mdi-file-document-edit',
      hidden: true,
    },
  },

  // Legacy job routes (redirect to unified jobs)
  { path: '/gaming/jobs', redirect: '/jobs?filter=gaming' },
  { path: '/jobs/gaming', redirect: '/jobs?filter=gaming' },
  { path: '/job-search', redirect: '/jobs' },
  { path: '/jobboard', redirect: '/jobs' },
  { path: '/job-board', redirect: '/jobs' },
  { path: '/live-jobs', redirect: '/jobs' },
  {
    path: '/gaming-jobs',
    redirect: '/jobs?filter=gaming',
    meta: {
      title: 'Gaming Jobs (Redirected)',
      icon: 'mdi-gamepad-variant',
    },
  },

  // Interview section
  {
    path: '/interview-prep',
    name: 'InterviewPrep',
    component: InterviewPrep,
    meta: {
      title: 'Interview Prep',
      icon: 'mdi-account-voice',
      muiTheme: true,
      aiPowered: true,
      samMaxStyle: true,
    },
  },
  {
    path: '/interview',
    redirect: '/interview-prep',
  },
  // Interview sessions
  {
    path: '/interview-session/:sessionId',
    name: 'InterviewSession',
    component: InterviewSession,
    meta: {
      title: 'Interview Session',
      icon: 'mdi-microphone',
      muiTheme: true,
      aiPowered: true,
      samMaxStyle: true,
    },
  },
  {
    path: '/interview-session/quick',
    name: 'QuickInterviewSession',
    component: InterviewSession,
    meta: {
      title: 'Quick Practice',
      icon: 'mdi-lightning-bolt',
      muiTheme: true,
      aiPowered: true,
      samMaxStyle: true,
    },
  },
  {
    path: '/interview-session/studio/:studioId',
    name: 'StudioInterviewSession',
    component: InterviewSession,
    meta: {
      title: 'Studio Interview',
      icon: 'mdi-gamepad-variant',
      muiTheme: true,
      aiPowered: true,
      samMaxStyle: true,
    },
  },
  {
    path: '/interview-session/behavioral',
    name: 'BehavioralInterviewSession',
    component: InterviewSession,
    meta: {
      title: 'Behavioral Interview',
      icon: 'mdi-account-group',
      muiTheme: true,
      aiPowered: true,
      samMaxStyle: true,
    },
  },
  {
    path: '/interview-session/technical',
    name: 'TechnicalInterviewSession',
    component: InterviewSession,
    meta: {
      title: 'Technical Interview',
      icon: 'mdi-code-braces',
      muiTheme: true,
      aiPowered: true,
      samMaxStyle: true,
    },
  },
  {
    path: '/interview-session/panel',
    name: 'PanelInterviewSession',
    component: InterviewSession,
    meta: {
      title: 'Panel Interview',
      icon: 'mdi-account-multiple',
      muiTheme: true,
      aiPowered: true,
      samMaxStyle: true,
    },
  },
  {
    path: '/interview-session/negotiation',
    name: 'NegotiationInterviewSession',
    component: InterviewSession,
    meta: {
      title: 'Salary Negotiation',
      icon: 'mdi-handshake',
      muiTheme: true,
      aiPowered: true,
      samMaxStyle: true,
    },
  },
  {
    path: '/interview-review/:reviewId',
    name: 'InterviewReview',
    component: InterviewSession,
    meta: {
      title: 'Interview Review',
      icon: 'mdi-clipboard-text',
      muiTheme: true,
      aiPowered: true,
      samMaxStyle: true,
    },
  },
  {
    path: '/interview-history',
    name: 'InterviewHistory',
    component: InterviewPrep,
    meta: {
      title: 'Interview History',
      icon: 'mdi-history',
      muiTheme: true,
      aiPowered: true,
      samMaxStyle: true,
    },
  },
  {
    path: '/gaming-interview',
    name: 'GamingInterview',
    component: GamingInterview,
    meta: {
      title: 'Gaming Interview',
      icon: 'mdi-gamepad-variant',
      muiTheme: true,
      aiPowered: true,
      samMaxStyle: true,
    },
  },

  // Demo routes
  {
    path: '/demo/realtime',
    name: 'RealTimeDemo',
    component: RealTimeDemo,
    meta: {
      title: 'Live AI Chat',
      icon: 'mdi-robot',
      muiTheme: true,
      aiPowered: true,
      isLive: true,
      samMaxStyle: true,
    },
  },
  {
    path: '/demo/fairy-chat',
    name: 'FairyChatDemo',
    component: FairyChatDemo,
    meta: {
      title: 'Fairy Chat Modal',
      icon: 'mdi-robot',
      muiTheme: true,
      aiPowered: true,
      samMaxStyle: true,
    },
  },
  {
    path: '/demo/ai-media',
    name: 'AIMediaDemo',
    component: AIMediaDemo,
    meta: {
      title: 'AI Media Studio',
      icon: 'mdi-multimedia',
      muiTheme: true,
      aiPowered: true,
      samMaxStyle: true,
    },
  },
  {
    path: '/demo/header',
    name: 'HeaderDemo',
    component: HeaderDemo,
    meta: {
      title: 'Enhanced Header Demo',
      icon: 'mdi-view-dashboard-variant',
      muiTheme: true,
      aiPowered: false,
      samMaxStyle: true,
    },
  },

  // Production-ready AI features
  {
    path: '/ai/job-board',
    name: 'LiveJobBoard',
    component: LiveJobBoard,
    meta: {
      title: 'Live Job Board',
      icon: 'mdi-briefcase-search',
      muiTheme: true,
      aiPowered: true,
      samMaxStyle: true,
    },
  },
  {
    path: '/ai/job-matching',
    name: 'AIJobMatching',
    component: AIJobMatching,
    meta: {
      title: 'AI Job Matching',
      icon: 'mdi-briefcase-variant',
      muiTheme: true,
      aiPowered: true,
      samMaxStyle: true,
    },
  },
  {
    path: '/ai/dashboard',
    name: 'AIDashboard',
    component: AIDashboard,
    meta: {
      title: 'AI Dashboard',
      icon: 'mdi-view-dashboard-variant',
      muiTheme: true,
      aiPowered: true,
      samMaxStyle: true,
    },
  },
  {
    path: '/ai/interview-prep',
    name: 'AIInterviewPrep',
    component: AIInterviewPrep,
    meta: {
      title: 'AI Interview Prep',
      icon: 'mdi-robot-happy',
      muiTheme: true,
      aiPowered: true,
      samMaxStyle: true,
    },
  },
  {
    path: '/ai/integration',
    name: 'AIIntegration',
    component: AIIntegration,
    meta: {
      title: 'AI Integration',
      icon: 'mdi-test-tube',
      muiTheme: true,
      aiPowered: true,
      samMaxStyle: true,
    },
  },
  {
    path: '/ai/skills',
    name: 'AISkillMapper',
    component: SkillMapperNew,
    meta: {
      title: 'AI Skill Mapper',
      icon: 'mdi-map-marker-path',
      muiTheme: true,
      aiPowered: true,
      samMaxStyle: true,
    },
  },

  // Studios section
  {
    path: '/studios',
    component: TheStudios,
    redirect: '/studios/database',
    children: [
      {
        path: 'database',
        name: 'StudioDatabase',
        component: StudioDatabase,
        meta: {
          title: 'Studio Database',
          icon: 'mdi-database',
          muiTheme: true,
          aiPowered: true,
          samMaxStyle: true,
        },
      },
      {
        path: 'analytics',
        name: 'StudioAnalytics',
        component: StudioAnalytics,
        meta: {
          title: 'Studio Analytics',
          icon: 'mdi-chart-line',
          muiTheme: true,
          aiPowered: true,
          samMaxStyle: true,
        },
      },
      {
        path: 'network',
        name: 'StudioNetworking',
        component: StudioNetworking,
        meta: {
          title: 'Studio Networking',
          icon: 'mdi-account-network',
          muiTheme: true,
          aiPowered: true,
          samMaxStyle: true,
        },
      },
    ],
  },

  // System views
  {
    path: '/flow',
    name: 'TheFlow',
    component: TheFlow,
    meta: {
      title: 'THE FLOW',
      icon: 'mdi-chart-sankey',
      muiTheme: true,
      aiPowered: true,
      samMaxStyle: true,
    },
  },
  {
    path: '/cloud',
    name: 'TheCloud',
    component: TheCloud,
    meta: {
      title: 'THE CLOUD',
      icon: 'mdi-cloud',
      muiTheme: true,
      aiPowered: true,
      samMaxStyle: true,
    },
  },
  {
    path: '/system',
    name: 'TheSystem',
    component: TheSystem,
    meta: {
      title: 'THE SYSTEM',
      icon: 'mdi-monitor-dashboard',
      muiTheme: true,
      aiPowered: true,
      samMaxStyle: true,
    },
  },

  // Settings and configuration
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: {
      title: 'System & Settings',
      icon: 'mdi-cog',
      muiTheme: true,
      aiPowered: true,
      samMaxStyle: true,
    },
  },

  // Development and testing routes
  {
    path: '/dev/pathology',
    name: 'Pathology',
    component: Pathology,
    meta: {
      title: 'Diagnostics',
      icon: 'mdi-stethoscope',
      hidden: true,
    },
  },
  {
    path: '/voice-test',
    name: 'VoiceServicesTest',
    component: VoiceServicesTest,
    meta: {
      title: 'Voice Services Test',
      icon: 'mdi-microphone-settings',
      muiTheme: true,
      aiPowered: true,
      samMaxStyle: true,
      hidden: true,
    },
  },

  // Catch-all redirect
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  // Ensure the window scrolls to top on navigation and
  // restore position on back/forward. Hash anchors are respected.
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { left: 0, top: 0 }
  },
})

// Route performance monitoring + MUI theme integration
let routeNPDelayTimer = null
let routeNPStarted = false

router.beforeEach(async (to, from, next) => {
  try {
    performanceMonitor.markStart(`route-${to.name}`)
  } catch (_e) {
    logger.debug('Route performance tracking failed:', _e)
  }
  // Lightweight AI auto-initialization for AI powered routes (idempotent)
  if (to.meta?.aiPowered) {
    try {
      const [{ aiService }, { useAppStore }] = await Promise.all([
        import('@/shared/services/AIService'),
        import('@/stores/app'),
      ])
      const store = useAppStore()
      if (store?.settings?.geminiApiKey || store?.settings?.openaiApiKey) {
        await aiService.initialize({
          primaryProvider: store.settings.geminiApiKey ? 'google' : 'openai',
          enableContextPersistence: true,
          enableRealTime: !!store.settings.enableRealtimeFeatures,
        })
      }
    } catch (_e) {
      logger.debug('AI auto-init skipped (non-critical):', _e)
    }
  }

  // Handle MUI theme integration
  if (to.meta?.muiTheme) {
    try {
      // Ensure font integration is loaded
      const { useElectrolizeFont } = await import('@/utils/fontIntegration')
      const fontInfo = useElectrolizeFont()

      if (!fontInfo.isLoaded) {
        // Re-initialize font if needed
        const { initializeElectrolizeFont } = await import(
          '@/utils/fontIntegration'
        )
        await initializeElectrolizeFont()
      }

      // Apply MUI-specific body classes
      document.body.classList.add('mui-route')
      document.body.classList.remove('standard-route')
    } catch (_e) {
      logger.debug('MUI theme setup failed:', _e)
    }
  } else {
    document.body.classList.remove('mui-route')
    document.body.classList.add('standard-route')
  }

  if (routeNPDelayTimer) {
    clearTimeout(routeNPDelayTimer)
  }
  routeNPDelayTimer = setTimeout(() => {
    try {
      NProgress.start()
      routeNPStarted = true
    } catch (_e) {
      logger.debug('NProgress start failed:', _e)
    }
  }, 120)
  next()
})

router.afterEach((to, from) => {
  setTimeout(() => {
    // Scroll application containers to top for layouts that use a custom scroller
    try {
      const scrollers = [
        document.querySelector('.main-content'),
        document.getElementById('app-root'),
        document.scrollingElement || document.documentElement,
      ].filter(Boolean)
      scrollers.forEach(el => {
        if ('scrollTo' in el) {
          el.scrollTo({ top: 0, left: 0, behavior: 'auto' })
        } else {
          el.scrollTop = 0
          el.scrollLeft = 0
        }
      })
    } catch (_e) {
      logger.debug('Scroll-to-top failed:', _e)
    }
    try {
      performanceMonitor.markEnd(`route-${to.name}`, {
        fromRoute: from.name,
        toRoute: to.name,
      })
    } catch (_e) {
      logger.debug('Route performance end tracking failed:', _e)
    }
    // Optional gentle effects (if anime.js is available)
    try {
      initEffects()
      pulseOnFocus()
      const container = document.querySelector('.main-content')
      if (container) {
        staggerFadeIn(container)
      }
    } catch (_e) {
      logger.warn('Route animation failed:', _e)
    }
    if (routeNPDelayTimer) {
      clearTimeout(routeNPDelayTimer)
      routeNPDelayTimer = null
    }
    if (routeNPStarted) {
      try {
        NProgress.done()
      } catch (_e) {
        logger.debug('NProgress done failed:', _e)
      }
      routeNPStarted = false
    }

    // Update document title and announce route change for screen readers
    try {
      const base = 'NAVI - AI Career Assistant'
      const title =
        to.meta && to.meta.title ? `${to.meta.title} • ${base}` : base
      document.title = title
      // Normalize title separator to a clean bullet
      document.title =
        to.meta && to.meta.title ? `${to.meta.title} • ${base}` : base
      const sr = document.getElementById('sr-announcer')
      if (sr)
        sr.textContent = `Navigated to ${to.meta?.title || to.name || 'page'}`
    } catch (_e) {
      logger.debug('Route ARIA announce failed:', _e)
    }
  }, 100)
})

// Add global error handler for navigation failures
router.onError(error => {
  logger.warn('Router navigation error:', error)
  // Don't throw - just log and continue
  // This prevents router warnings from disrupting navigation
})

export default router
