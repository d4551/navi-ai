
import { ref, computed } from "vue";
import { useStorage } from "@vueuse/core";
import type {
  Portfolio,
  PortfolioProject,
} from "@/modules/db/repositories/portfolio";
import { logger } from "@/shared/utils/logger";

export interface ShareSettings {
  isPublic: boolean;
  allowDownload: boolean;
  showContactInfo: boolean;
  requirePassword: boolean;
  password?: string;
  expirationDate?: Date;
  customDomain?: string;
  seoSettings: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
  };
  branding: {
    showWatermark: boolean;
    customLogo?: string;
    customColors?: {
      primary: string;
      secondary: string;
    };
  };
  analytics: {
    enableTracking: boolean;
    trackDownloads: boolean;
    trackViewTime: boolean;
  };
}

export interface PortfolioAnalytics {
  views: {
    total: number;
    unique: number;
    daily: Record<string, number>;
    monthly: Record<string, number>;
  };
  demographics: {
    countries: Record<string, number>;
    devices: Record<string, number>;
    browsers: Record<string, number>;
    referrers: Record<string, number>;
  };
  engagement: {
    averageViewTime: number;
    bounceRate: number;
    mostViewedProjects: Array<{ projectId: string; views: number }>;
    downloadCount: number;
    contactClicks: number;
  };
  performance: {
    loadTime: number;
    mobileScore: number;
    seoScore: number;
    accessibilityScore: number;
  };
}

export interface SharedPortfolioLink {
  id: string;
  url: string;
  title: string;
  description: string;
  shareSettings: ShareSettings;
  analytics: PortfolioAnalytics;
  createdAt: Date;
  lastViewed?: Date;
  isActive: boolean;
}

  // State
  const sharedPortfolios = useStorage(
    "shared-portfolios",
    [] as SharedPortfolioLink[],
  );
  const shareSettings = ref<ShareSettings>({
    isPublic: false,
    allowDownload: true,
    showContactInfo: true,
    requirePassword: false,
    seoSettings: {
      title: "",
      description: "",
      keywords: [],
    },
    branding: {
      showWatermark: true,
    },
    analytics: {
      enableTracking: true,
      trackDownloads: true,
      trackViewTime: true,
    },
  });

  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const activeShares = computed(() =>
    sharedPortfolios.value.filter((share) => share.isActive),
  );

  const totalViews = computed(() =>
    sharedPortfolios.value.reduce(
      (total, share) => total + share.analytics.views.total,
    ),
  );

  const popularShares = computed(() =>
    sharedPortfolios.value
      .sort((a, b) => b.analytics.views.total - a.analytics.views.total)
  );

  // Share Creation
    portfolio: Portfolio,
    settings: Partial<ShareSettings> = {},
    selectedProjectIds?: string[],
  ): Promise<SharedPortfolioLink> {
    try {
      loading.value = true;
      error.value = null;

      // Generate unique share ID and URL
      const shareId = crypto.randomUUID();
      const shareUrl = `${window.location.origin}/portfolio/shared/${shareId}`;

      // Create filtered portfolio data
      const portfolioData = { ...portfolio };
      if (selectedProjectIds) {
        portfolioData.projects = portfolio.projects.filter((p) =>
          selectedProjectIds.includes(p.id),
        );
      }

      // Merge settings with defaults
      const mergedSettings: ShareSettings = {
        ...shareSettings.value,
        ...settings,
        seoSettings: {
          ...shareSettings.value.seoSettings,
          ...settings.seoSettings,
        },
        branding: {
          ...shareSettings.value.branding,
          ...settings.branding,
        },
        analytics: {
          ...shareSettings.value.analytics,
          ...settings.analytics,
        },
      };

      // Create share link
      const shareLink: SharedPortfolioLink = {
        id: shareId,
        url: shareUrl,
        title: mergedSettings.seoSettings.title || portfolio.personalInfo.title,
        description:
          mergedSettings.seoSettings.description || portfolio.personalInfo.bio,
        shareSettings: mergedSettings,
        analytics: initializeAnalytics(),
        createdAt: new Date(),
        isActive: true,
      };

      // Save portfolio data to public storage
      await saveSharedPortfolioData(shareId, portfolioData, mergedSettings);

      // Add to shared portfolios list
      sharedPortfolios.value.push(shareLink);

      logger.info("Portfolio share created:", shareUrl);
      return shareLink;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to create share";
      logger.error("Failed to create portfolio share:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Share Management
    shareId: string,
    updates: Partial<ShareSettings>,
  ): Promise<void> {
    const shareIndex = sharedPortfolios.value.findIndex(
      (s) => s.id === shareId,
    );
      throw new Error("Share not found");
    }

    const share = sharedPortfolios.value[shareIndex];
    share.shareSettings = { ...share.shareSettings, ...updates };

    // Update stored portfolio data if needed
    await updateSharedPortfolioData(shareId, updates);

    logger.info("Portfolio share updated:", shareId);
  }

    const share = sharedPortfolios.value.find((s) => s.id === shareId);
    if (!share) {
      throw new Error("Share not found");
    }

    share.isActive = false;
    await removeSharedPortfolioData(shareId);

    logger.info("Portfolio share deactivated:", shareId);
  }

    const shareIndex = sharedPortfolios.value.findIndex(
      (s) => s.id === shareId,
    );
      throw new Error("Share not found");
    }

    await removeSharedPortfolioData(shareId);

    logger.info("Portfolio share deleted:", shareId);
  }

  // Analytics
    shareId: string,
    viewerInfo: {
      country?: string;
      device?: string;
      browser?: string;
      referrer?: string;
    } = {},
  ) {
    const share = sharedPortfolios.value.find((s) => s.id === shareId);
    if (!share) return;


    // Update view counts
    share.analytics.views.total++;
    share.analytics.views.daily[today] =
    share.analytics.views.monthly[month] =

    // Update demographics
    if (viewerInfo.country) {
      share.analytics.demographics.countries[viewerInfo.country] =
    }

    if (viewerInfo.device) {
      share.analytics.demographics.devices[viewerInfo.device] =
    }

    if (viewerInfo.browser) {
      share.analytics.demographics.browsers[viewerInfo.browser] =
    }

    if (viewerInfo.referrer) {
      share.analytics.demographics.referrers[viewerInfo.referrer] =
    }

    share.lastViewed = new Date();
  }

    const share = sharedPortfolios.value.find((s) => s.id === shareId);
    if (!share) return;

    const existingProject = share.analytics.engagement.mostViewedProjects.find(
      (p) => p.projectId === projectId,
    );

    if (existingProject) {
      existingProject.views++;
    } else {
      share.analytics.engagement.mostViewedProjects.push({
        projectId,
      });
    }

    // Sort by views
    share.analytics.engagement.mostViewedProjects.sort(
      (a, b) => b.views - a.views,
    );
  }

    const share = sharedPortfolios.value.find((s) => s.id === shareId);
    if (!share) return;

    share.analytics.engagement.downloadCount++;
  }

    const share = sharedPortfolios.value.find((s) => s.id === shareId);
    if (!share) return;

    share.analytics.engagement.contactClicks++;
  }

    portfolio: Portfolio,
    settings: ShareSettings,
    selectedProjectIds?: string[],
  ): Promise<string> {
    const filteredProjects = selectedProjectIds
      ? portfolio.projects.filter((p) => selectedProjectIds.includes(p.id))
      : portfolio.projects;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <title>${settings.seoSettings.title}</title>
    <meta name="description" content="${settings.seoSettings.description}">
    <meta name="keywords" content="${settings.seoSettings.keywords.join(", ")}">
    ${settings.seoSettings.ogImage ? `<meta property="og:image" content="${settings.seoSettings.ogImage}">` : ""}
    <meta property="og:title" content="${settings.seoSettings.title}">
    <meta property="og:description" content="${settings.seoSettings.description}">
    <meta property="og:type" content="website">
    ${generatePortfolioCSS(settings)}
</head>
<body>
    <div class="portfolio-container">
        ${generatePortfolioHeader(portfolio.personalInfo, settings)}
        ${generateProjectsSection(filteredProjects, settings)}
        ${generateSkillsSection(portfolio.skills, settings)}
        ${settings.showContactInfo ? generateContactSection(portfolio.personalInfo, settings) : ""}
        ${settings.branding.showWatermark ? generateWatermark() : ""}
    </div>
    ${generatePortfolioJS(settings)}
    ${settings.analytics.enableTracking ? generateAnalyticsScript() : ""}
</body>
</html>`;
  }

    const secondaryColor =

    return `<style>
      :root {
        --primary-color: ${primaryColor};
        --secondary-color: ${secondaryColor};
      }
      
      
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      }
      
      .portfolio-container {
      }
      
      .portfolio-header {
        text-align: center;
        color: white;
      }
      
      }
      
      .portfolio-header p {
      }
      
      .projects-grid {
        display: grid;
      }
      
      .project-card {
        background: white;
      }
      
      .project-card:hover {
      }
      
      .project-title {
        color: var(--primary-color);
      }
      
      .project-description {
      }
      
      .project-tech {
        display: flex;
        flex-wrap: wrap;
      }
      
      .tech-tag {
        color: var(--primary-color);
      }
      
      .project-links {
        display: flex;
      }
      
      .project-link {
        background: var(--primary-color);
        color: white;
        text-decoration: none;
      }
      
      .project-link:hover {
        background: var(--secondary-color);
      }
      
      .skills-section {
        background: white;
      }
      
      .skills-title {
        text-align: center;
        color: var(--primary-color);
      }
      
      .skills-grid {
        display: grid;
      }
      
      }
      
      .skill-list {
        display: flex;
        flex-wrap: wrap;
      }
      
      .skill-item {
      }
      
      .contact-section {
        background: var(--primary-color);
        color: white;
        text-align: center;
      }
      
      .contact-title {
      }
      
      .contact-links {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
      }
      
      .contact-link {
        color: white;
        text-decoration: none;
      }
      
      .contact-link:hover {
      }
      
      .watermark {
        text-align: center;
      }
      
        .contact-links { flex-direction: column; align-items: center; }
      }
    </style>`;
  }

    personalInfo: Portfolio["personalInfo"],
    settings: ShareSettings,
  ): string {
    return `
    <header class="portfolio-header">
      <p>${personalInfo.title}</p>
    </header>`;
  }

    projects: PortfolioProject[],
    _settings: ShareSettings,
  ): string {
    const projectCards = projects
      .map(
        (project) => `
      <article class="project-card" data-project-id="${project.id}">
        <p class="project-description">${project.description}</p>
        ${
          project.technologies.length
            ? `
          <div class="project-tech">
            ${project.technologies.map((tech) => `<span class="tech-tag">${tech}</span>`).join("")}
          </div>
        `
            : ""
        }
        <div class="project-links">
          ${project.links.live ? `<a href="${project.links.live}" class="project-link" target="_blank">View Live</a>` : ""}
          ${project.links.github ? `<a href="${project.links.github}" class="project-link" target="_blank">Source Code</a>` : ""}
        </div>
      </article>
    `,
      )
      .join("");

    return `
    <section class="projects-section">
      <div class="projects-grid">
        ${projectCards}
      </div>
    </section>`;
  }

    skills: Portfolio["skills"],
    _settings: ShareSettings,
  ): string {
    return `
    <section class="skills-section">
      <div class="skills-grid">
        ${
          skills.primary.length
            ? `
          <div class="skill-category">
            <div class="skill-list">
              ${skills.primary.map((skill) => `<span class="skill-item">${skill}</span>`).join("")}
            </div>
          </div>
        `
            : ""
        }
        ${
          skills.secondary.length
            ? `
          <div class="skill-category">
            <div class="skill-list">
              ${skills.secondary.map((skill) => `<span class="skill-item">${skill}</span>`).join("")}
            </div>
          </div>
        `
            : ""
        }
        ${
          skills.tools.length
            ? `
          <div class="skill-category">
            <div class="skill-list">
              ${skills.tools.map((tool) => `<span class="skill-item">${tool}</span>`).join("")}
            </div>
          </div>
        `
            : ""
        }
      </div>
    </section>`;
  }

    personalInfo: Portfolio["personalInfo"],
    _settings: ShareSettings,
  ): string {
    const socialLinks = Object.entries(personalInfo.social)
      .filter(([_, url]) => url)
      .map(
        ([platform, url]) => `
        <a href="${url}" class="contact-link" target="_blank" onclick="trackContactClick()">
        </a>
      `,
      )
      .join("");

    return `
    <section class="contact-section">
      <div class="contact-links">
        ${personalInfo.email ? `<a href="mailto:${personalInfo.email}" class="contact-link" onclick="trackContactClick()">Email</a>` : ""}
        ${personalInfo.website ? `<a href="${personalInfo.website}" class="contact-link" target="_blank" onclick="trackContactClick()">Website</a>` : ""}
        ${socialLinks}
      </div>
    </section>`;
  }

    return `
    <footer class="watermark">
      <p>Created with NAVI Portfolio Generator</p>
    </footer>`;
  }

    return `<script>
      // Track project views
      document.querySelectorAll('.project-card').forEach(card => {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const projectId = entry.target.dataset.projectId;
              if (projectId) {
                trackProjectView(projectId);
              }
            }
          });
        
        observer.observe(card);
      });
      
      // Track downloads
        if (typeof fetch !== 'undefined') {
          fetch('/api/track/download', { method: 'POST' }).catch(() => {});
        }
      }
      
      // Track contact clicks
        if (typeof fetch !== 'undefined') {
          fetch('/api/track/contact', { method: 'POST' }).catch(() => {});
        }
      }
      
      // Track project views
        if (typeof fetch !== 'undefined') {
          fetch('/api/track/project-view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId })
          }).catch(() => {});
        }
      }
    </script>`;
  }

    return `<script>
      // Basic analytics tracking
        const startTime = Date.now();
        
          const viewTime = Date.now() - startTime;
          if (typeof fetch !== 'undefined') {
            fetch('/api/track/view-time', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ viewTime })
            }).catch(() => {});
          }
        });
        
        // Track page view
        if (typeof fetch !== 'undefined') {
          fetch('/api/track/view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              referrer: document.referrer,
              userAgent: navigator.userAgent,
              timestamp: new Date().toISOString()
            })
          }).catch(() => {});
        }
      })();
    </script>`;
  }

    shareId: string,
    portfolio: Portfolio,
    settings: ShareSettings,
  ) {
    // In a real application, this would save to a backend service
    const shareData = {
      portfolio,
      settings,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      `shared-portfolio-${shareId}`,
      JSON.stringify(shareData),
    );
  }

    shareId: string,
    updates: Partial<ShareSettings>,
  ) {
    const existingData = localStorage.getItem(`shared-portfolio-${shareId}`);
    if (!existingData) return;

    const shareData = JSON.parse(existingData);
    shareData.settings = { ...shareData.settings, ...updates };
    shareData.updatedAt = new Date().toISOString();

    localStorage.setItem(
      `shared-portfolio-${shareId}`,
      JSON.stringify(shareData),
    );
  }

    localStorage.removeItem(`shared-portfolio-${shareId}`);
  }

    return {
      views: {
        daily: {},
        monthly: {},
      },
      demographics: {
        countries: {},
        devices: {},
        browsers: {},
        referrers: {},
      },
      engagement: {
        mostViewedProjects: [],
      },
      performance: {
      },
    };
  }

  return {
    // State
    sharedPortfolios,
    shareSettings,
    loading,
    error,

    // Computed
    activeShares,
    totalViews,
    popularShares,

    createShare,
    updateShare,
    deactivateShare,
    deleteShare,

    // Analytics
    trackView,
    trackProjectView,
    trackDownload,
    trackContactClick,

    // Export
    generateShareableHTML,
  };
}
