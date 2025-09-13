export interface PageHeaderConfig {
  title: string;
  subtitle?: string;
  icon?: string;
  heroStats?: (
    _ctx: any,
  ) => Array<{ label: string; icon?: string; color?: string }>;
}

export const pageHeaders: Record<string, PageHeaderConfig> = {
  Dashboard: {
    title: "Gaming Career Command Center",
    subtitle:
      "Track your career progress, applications, and achievements in the gaming industry",
    icon: "mdi-view-dashboard",
    heroStats: (ctx) => {
      if (!ctx?.store)
        return [
          { label: "85% Profile Complete", icon: "mdi-account-check", color: "primary" },
          { label: "23 Applications", icon: "mdi-briefcase-outline", color: "success" },
          { label: "Level 7 Developer", icon: "mdi-trophy", color: "warning" },
        ];
      const store = ctx.store;
      return [
        {
          label: `${store.profileCompleteness || 85}% Profile Complete`,
          icon: "mdi-account-check",
          color: "primary",
        },
        {
          label: `${(store.jobSearchData?.applications || []).length || 23} Applications`,
          icon: "mdi-briefcase-outline",
          color: "success",
        },
        { label: `Level ${store.userLevel || 7} Developer`, icon: "mdi-trophy", color: "warning" },
      ];
    },
  },
  DocumentBuilder: {
    title: "Document Builder",
    subtitle: "AI-powered resume and cover letter creation",
    icon: "mdi-text-box-edit-outline",
  },
  JobSearch: {
    title: "Gaming Jobs Central",
    subtitle:
      "Discover your next gaming industry role with AI-powered matching and real-time opportunities",
    icon: "mdi-magnify",
    heroStats: (_ctx) => [
      { label: "2,847 Active Jobs", icon: "mdi-briefcase-search", color: "primary" },
      { label: "156 Studio Partners", icon: "mdi-domain", color: "info" },
      { label: "94% Match Rate", icon: "mdi-target", color: "success" },
    ],
  },
  LegacyJobSearch: {
    title: "Legacy Job Board",
    subtitle: "Full-featured legacy job board view",
    icon: "mdi-briefcase-search",
  },
  JobTailoredResume: {
    title: "Job Tailored Resume",
    subtitle: "Generate resumes tailored to a target job",
    icon: "mdi-file-account",
  },
  LiveJobBoardDemo: {
    title: "Live Job Board Demo",
    subtitle: "Real-time job search from multiple APIs",
    icon: "mdi-briefcase-search",
  },

  SkillMapper: {
    title: "Gaming Skills Mapper",
    subtitle: "Transform gaming expertise into professional opportunities",
    icon: "mdi-map-marker-path",
    heroStats: (ctx) => {
      if (!ctx) return [];
      const mapped = Number(ctx.mappedSkillsCount || 0);
      const readiness = Number(ctx.industryReadinessScore || 0);
      const matches = Number(ctx.careerMatchesCount || 0);
      return [
        { label: `${mapped} mapped`, icon: "mdi-map", color: "warning" },
        { label: `${readiness}% readiness`, icon: "mdi-target", color: "success" },
        { label: `${matches} matches`, icon: "mdi-briefcase", color: "info" },
      ];
    },
  },
  Portfolio: {
    title: "Portfolio",
    subtitle:
      "Showcase your game projects, clips, and achievements to stand out in the gaming industry",
    icon: "mdi-briefcase-variant",
    heroStats: (ctx) => {
      const p = Number(ctx?.projects || 12);
      const c = Number(ctx?.clips || 8);
      const a = Number(ctx?.achievements || 15);
      return [
        { label: `${p} Projects`, icon: "mdi-briefcase", color: "primary" },
        { label: `${c} Game Assets`, icon: "mdi-gamepad-variant", color: "info" },
        { label: `${a} Achievements`, icon: "mdi-trophy", color: "success" },
      ];
    },
  },
  GamificationHub: {
    title: "Gamification Hub",
    subtitle: "Achievements, quests, and your progress",
    icon: "mdi-trophy",
  },
  Studios: {
    title: "Studios",
    subtitle: "Gaming industry intelligence database",
    icon: "mdi-domain",
  },
  TheStudio: {
    title: "Portfolio Studio",
    subtitle: "Create and manage your portfolio projects",
    icon: "mdi-briefcase-variant",
  },
  StudioAnalytics: {
    title: "Studio Intel",
    subtitle: "Market intelligence and salary insights",
    icon: "mdi-chart-line",
  },
  StudioNetworking: {
    title: "Network Surveillance",
    subtitle: "Professional connections and industry contacts",
    icon: "mdi-account-network",
  },
  InterviewPrep: {
    title: "Interview Preparation",
    subtitle: "Pick a studio and persona to shape your interview",
    icon: "mdi-account-group",
  },
  InterviewSession: {
    title: "Interview Session",
    subtitle: "Real-time practice with timing and feedback",
    icon: "mdi-clipboard-text",
  },
  GamingInterview: {
    title: "Gaming Studio Interview",
    subtitle: "Practice tailored to specific studios and roles",
    icon: "mdi-gamepad-variant",
  },
  TheFlow: {
    title: "The Flow",
    subtitle: "Career automation pipelines and tools",
    icon: "mdi-sync",
  },
  TheSystem: {
    title: "The System",
    subtitle: "Ecosystem command center and performance",
    icon: "mdi-cog-outline",
  },
  AIMediaDemo: {
    title: "AI Media Studio",
    subtitle:
      "Analyze video and audio content with advanced AI models and real-time processing",
    icon: "mdi-video-box",
    heroStats: (_ctx) => [
      { label: "4K Video Support", icon: "mdi-video-4k-box", color: "primary" },
      { label: "8 AI Models", icon: "mdi-brain", color: "info" },
      { label: "Real-time Analysis", icon: "mdi-speedometer", color: "success" },
    ],
  },
  RealTimeDemo: {
    title: "Live AI Chat",
    subtitle: "Streamed responses and interactive tools",
    icon: "mdi-robot",
  },
  VoiceServicesTest: {
    title: "Voice Services Test",
    subtitle: "Test and debug voice/media capabilities",
    icon: "mdi-microphone",
  },
  Settings: {
    title: "Settings & Preferences",
    subtitle: "Customize your NAVI experience and configure AI services",
    icon: "mdi-cog",
    heroStats: (_ctx) => [
      { label: "12 Integrations", icon: "mdi-api", color: "primary" },
      { label: "5 AI Services", icon: "mdi-brain", color: "info" },
      { label: "100% Secure", icon: "mdi-shield-check", color: "success" },
    ],
  },
  HeaderDemo: {
    title: "Enhanced Header Demo",
    subtitle:
      "Showcase of the modern animated header system with dynamic stats and effects",
    icon: "mdi-view-dashboard-variant",
    heroStats: (_ctx) => [
      { label: "24 Projects", icon: "mdi-briefcase", color: "primary" },
      { label: "18 Media Clips", icon: "mdi-video", color: "info" },
      { label: "32 Achievements", icon: "mdi-trophy", color: "success" },
    ],
  },
};

export const getPageHeaderByRouteName = (
  routeName: string,
): PageHeaderConfig | undefined => {
  const name = String(routeName);
  // Map legacy/alt route names to canonical config
  const aliases: Record<string, string> = {
    ModernPortfolio: "Portfolio",
    PortfolioGenerator: "Portfolio",
  };
  const canonical = aliases[name] || name;
  return pageHeaders[canonical];
};

export const resolveHeaderFromRoute = (
  route: any,
  _context?: any,
): PageHeaderConfig | undefined => {
  if (!route?.name) return undefined;
  const routeName = typeof route.name === "string" ? route.name : String(route.name);
  return getPageHeaderByRouteName(routeName);
};

export default pageHeaders;

