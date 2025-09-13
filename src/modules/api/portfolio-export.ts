
import { logger } from "@/shared/utils/logger";
import type { PortfolioProject } from "@/shared/types/portfolio";

export interface PortfolioExportRequest {
  projects: PortfolioProject[];
  format: "pdf" | "zip" | "html" | "json" | "website";
  options?: PortfolioExportOptions;
}

export interface PortfolioExportOptions {
  template?: "modern" | "gaming" | "minimal" | "showcase";
  theme?: "light" | "dark" | "gaming" | "neon";
  includeImages?: boolean;
  includeSource?: boolean;
  includeReadme?: boolean;
  customCSS?: string;
  metadata?: {
    author?: string;
    title?: string;
    description?: string;
    website?: string;
    social?: Record<string, string>;
  };
}

export interface PortfolioExportResponse {
  success: boolean;
  url?: string;
  blob?: Blob;
  filename?: string;
  error?: string;
  metadata?: {
    format: string;
    size: number;
    projectCount: number;
    generatedAt: string;
    template?: string;
  };
}

export class PortfolioExportService {
  private static instance: PortfolioExportService;

  static getInstance(): PortfolioExportService {
    if (!PortfolioExportService.instance) {
      PortfolioExportService.instance = new PortfolioExportService();
    }
    return PortfolioExportService.instance;
  }

  async exportPortfolio(
    request: PortfolioExportRequest,
  ): Promise<PortfolioExportResponse> {
    try {
      logger.info(
        `Exporting portfolio to ${request.format} with ${request.projects.length} projects`,
      );

      switch (request.format) {
        case "pdf":
          return await this.exportToPDF(request.projects, request.options);

        case "html":
          return await this.exportToHTML(request.projects, request.options);

        case "website":
          return await this.exportToWebsite(request.projects, request.options);

        case "json":
          return await this.exportToJSON(request.projects, request.options);

        case "zip":
          return await this.exportToZip(request.projects, request.options);

        default:
          throw new Error(`Unsupported export format: ${request.format}`);
      }
    } catch (_error) {
      logger.error("Portfolio export failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown export error",
      };
    }
  }

  private async exportToPDF(
    projects: PortfolioProject[],
    options?: PortfolioExportOptions,
  ): Promise<PortfolioExportResponse> {
    try {
      const htmlTemplate = this.generatePortfolioHTML(projects, options);

      // Use Electron PDF generation if available
      if (
        typeof window !== "undefined" &&
        (window as any).electronAPI?.portfolio?.exportPDF
      ) {
        const result = await (window as any).electronAPI.portfolio.exportPDF({
          html: htmlTemplate,
          options: {
            landscape: true,
            margin: {
            },
            displayHeaderFooter: true,
            headerTemplate: this.generatePDFHeader(_options),
            footerTemplate: this.generatePDFFooter(_options),
            printBackground: true,
          },
        });

        if (result.success) {
          return {
            success: true,
            blob: new Blob([result.buffer], { type: "application/pdf" }),
            filename: this.generateFilename("portfolio", "pdf", options),
            metadata: {
              format: "pdf",
              size: result.buffer.length,
              projectCount: projects.length,
              generatedAt: new Date().toISOString(),
              template: options?.template,
            },
          };
        }
        throw new Error(result.error);
      }

      // Fallback to browser PDF generation
      return await this.generatePDFInBrowser(htmlTemplate, projects, options);
    } catch (_error) {
      throw new Error(
        `PDF export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private async exportToHTML(
    projects: PortfolioProject[],
    options?: PortfolioExportOptions,
  ): Promise<PortfolioExportResponse> {
    try {
      const htmlContent = this.generatePortfolioHTML(projects, options, true);
      const blob = new Blob([htmlContent], { type: "text/html" });

      return {
        success: true,
        blob,
        filename: this.generateFilename("portfolio", "html", options),
        metadata: {
          format: "html",
          size: blob.size,
          projectCount: projects.length,
          generatedAt: new Date().toISOString(),
          template: options?.template,
        },
      };
    } catch (_error) {
      throw new Error(
        `HTML export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private async exportToWebsite(
    projects: PortfolioProject[],
    options?: PortfolioExportOptions,
  ): Promise<PortfolioExportResponse> {
    try {
      // Create a complete website structure
      const files = await this.generateWebsiteFiles(projects, options);

      // Create ZIP with website structure
      const zipBlob = await this.createZipFromFiles(files);

      return {
        success: true,
        blob: zipBlob,
        filename: this.generateFilename("portfolio-website", "zip", options),
        metadata: {
          format: "website",
          size: zipBlob.size,
          projectCount: projects.length,
          generatedAt: new Date().toISOString(),
          template: options?.template,
        },
      };
    } catch (_error) {
      throw new Error(
        `Website export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private async exportToJSON(
    projects: PortfolioProject[],
    options?: PortfolioExportOptions,
  ): Promise<PortfolioExportResponse> {
    try {
      const portfolioData = {
        metadata: {
          title: options?.metadata?.title || "Gaming Portfolio",
          author: options?.metadata?.author,
          description: options?.metadata?.description,
          generatedAt: new Date().toISOString(),
          exportedBy: "NAVI Gaming Jobseeker Platform",
        },
        projects: projects.map((project) => ({
          ...project,
          // Add gaming-specific metadata
          gamingMetadata: {
            platforms: this.extractPlatforms(project.description),
            gameEngines: this.extractGameEngines(project.description),
            genres: this.extractGenres(project.description),
          },
        })),
        settings: {
          template: options?.template,
          theme: options?.theme,
          includeImages: options?.includeImages,
          includeSource: options?.includeSource,
        },
      };

      const blob = new Blob([jsonContent], { type: "application/json" });

      return {
        success: true,
        blob,
        filename: this.generateFilename("portfolio-data", "json", options),
        metadata: {
          format: "json",
          size: blob.size,
          projectCount: projects.length,
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (_error) {
      throw new Error(
        `JSON export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private async exportToZip(
    projects: PortfolioProject[],
    options?: PortfolioExportOptions,
  ): Promise<PortfolioExportResponse> {
    try {
      const files: Record<string, Blob | string> = {};

      // Add HTML portfolio
      files["index.html"] = this.generatePortfolioHTML(projects, options, true);

      // Add project pages
      projects.forEach((project) => {
          this.generateProjectHTML(project, options);
      });

      // Add CSS files
      files["assets/styles.css"] = this.generatePortfolioCSS(
        options?.template,
        options?.theme,
      );

      // Add JavaScript if needed
      files["assets/portfolio.js"] = this.generatePortfolioJS(_options);

      // Add README
      if (options?.includeReadme !== false) {
        files["README.md"] = this.generateReadme(projects, options);
      }

      // Add project assets if requested
      if (options?.includeImages !== false) {
        await this.addProjectAssets(files, projects);
      }

      const zipBlob = await this.createZipFromFiles(files);

      return {
        success: true,
        blob: zipBlob,
        filename: this.generateFilename("portfolio-archive", "zip", options),
        metadata: {
          format: "zip",
          size: zipBlob.size,
          projectCount: projects.length,
          generatedAt: new Date().toISOString(),
          template: options?.template,
        },
      };
    } catch (_error) {
      throw new Error(
        `ZIP export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private generatePortfolioHTML(
    projects: PortfolioProject[],
    options?: PortfolioExportOptions,
    standalone = false,
  ): string {
    const template = options?.template || "modern";
    const _theme = options?.theme || "light";
    const metadata = options?.metadata || {};

    const cssContent = standalone
      ? `${mdiLink}<style>${this.generatePortfolioCSS(template, theme)}</style>`
      : `${mdiLink}<link rel="stylesheet" href="assets/styles.css">`;

    const jsContent = standalone
      ? `<script>${this.generatePortfolioJS(_options)}</script>`
      : `<script src="assets/portfolio.js"></script>`;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <title>${metadata.title || "Gaming Portfolio"}</title>
    <meta name="description" content="${metadata.description || "Professional gaming industry portfolio"}">
    <meta name="author" content="${metadata.author || ""}">
    ${cssContent}
</head>
<body class="portfolio-template-${template} theme-${theme}">
    <div class="portfolio-container">
        ${this.generatePortfolioHeader(metadata)}
        ${this.generateProjectGrid(projects, options)}
        ${this.generatePortfolioFooter(metadata)}
    </div>
    ${jsContent}
</body>
</html>`;
  }

  private generateProjectHTML(
    project: PortfolioProject,
    options?: PortfolioExportOptions,
  ): string {
    const template = options?.template || "modern";
    const _theme = options?.theme || "light";

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <title>${project.title} - Gaming Portfolio</title>
    <link rel="stylesheet" href="../assets/styles.css">
</head>
<body class="portfolio-template-${template} theme-${theme}">
    <div class="project-detail-container">
        <nav class="project-nav">
            <a href="../index.html" class="back-link">← Back to Portfolio</a>
        </nav>
        
        <header class="project-header">
            ${project.image ? `<img src="${project.image}" alt="${project.title}" class="project-hero">` : ""}
        </header>
        
        <main class="project-content">
            <section class="project-description">
                <p>${project.description}</p>
            </section>
            
            ${
              project.technologies?.length
                ? `
            <section class="project-technologies">
                <div class="tech-tags">
                    ${project.technologies.map((tech) => `<span class="tech-tag">${tech}</span>`).join("")}
                </div>
            </section>
            `
                : ""
            }
            
            <section class="project-links">
                <div class="project-buttons">
                    ${project.liveUrl ? `<a href="${project.liveUrl}" class="btn btn-primary" target="_blank">View Live</a>` : ""}
                    ${project.githubUrl ? `<a href="${project.githubUrl}" class="btn btn-secondary" target="_blank">View Source</a>` : ""}
                </div>
            </section>
            
            <section class="project-gaming-info">
                <div class="gaming-metadata">
                    <div class="gaming-detail">
                        <strong>Platforms:</strong> ${this.extractPlatforms(project.description).join(", ") || "Not specified"}
                    </div>
                    <div class="gaming-detail">
                        <strong>Game Engines:</strong> ${this.extractGameEngines(project.description).join(", ") || "Not specified"}
                    </div>
                    <div class="gaming-detail">
                        <strong>Genres:</strong> ${this.extractGenres(project.description).join(", ") || "Not specified"}
                    </div>
                </div>
            </section>
        </main>
    </div>
</body>
</html>`;
  }

  private generatePortfolioHeader(metadata: any): string {
    return `
      <header class="portfolio-header">
        <div class="hero-section">
          ${metadata.description ? `<p class="portfolio-description">${metadata.description}</p>` : ""}
        </div>
        
        ${
          metadata.social
            ? `
        <div class=\"social-links\">
          ${Object.entries(metadata.social)
            .map(
              ([platform, url]) =>
                `<a href=\"${url}\" class=\"social-link ${platform}\" target=\"_blank\">${platform}</a>`,
            )
            .join("")}
        </div>
        `
            : ""
        }
      </header>
    `;
  }

  private generateProjectGrid(
    projects: PortfolioProject[],
    _options?: PortfolioExportOptions,
  ): string {
    const projectCards = projects
      .map(
        (project) => `
      <div class="project-card" data-category="${this.getProjectCategory(project)}">
        ${
          project.image
            ? `
          <div class="project-image">
            <img src="${project.image}" alt="${project.title}" loading="lazy">
          </div>
        `
            : ""
        }
        
        <div class="project-info">
          <p class="project-description">${project.description}</p>
          
          ${
            project.technologies?.length
              ? `
            <div class="project-tech">
              ${project.technologies
                .map((tech) => `<span class="tech-tag">${tech}</span>`)
                .join("")}
            </div>
          `
              : ""
          }
          
          <div class="project-actions">
            ${project.liveUrl ? `<a href="${project.liveUrl}" class="btn btn-primary" target="_blank">View Live</a>` : ""}
            ${project.githubUrl ? `<a href="${project.githubUrl}" class="btn btn-secondary" target="_blank">Source</a>` : ""}
          </div>
          
          <div class="project-metadata">
            <div class="gaming-badges">
              ${this.extractPlatforms(project.description)
                .map(
                  (platform) =>
                    `<span class="badge platform-badge">${platform}</span>`,
                )
                .join("")}
              ${this.extractGameEngines(project.description)
                .map(
                  (engine) =>
                    `<span class="badge engine-badge">${engine}</span>`,
                )
                .join("")}
            </div>
          </div>
        </div>
      </div>
    `,
      )
      .join("");

    return `
      <main class="portfolio-main">
        <div class="projects-filter">
          <button class="filter-btn active" data-filter="all">All Projects</button>
          <button class="filter-btn" data-filter="games">Games</button>
          <button class="filter-btn" data-filter="tools">Tools</button>
          <button class="filter-btn" data-filter="web">Web</button>
        </div>
        
        <div class="projects-grid">
          ${projectCards}
        </div>
      </main>
    `;
  }

  private generatePortfolioFooter(metadata: any): string {
    const currentYear = new Date().getFullYear();
    return `
      <footer class="portfolio-footer">
        <div class="footer-content">
          <p>&copy; ${currentYear} ${metadata.author || "Gaming Portfolio"}. Created with NAVI Gaming Jobseeker Platform.</p>
          ${metadata.website ? `<p><a href="${metadata.website}" target="_blank">Visit Website</a></p>` : ""}
        </div>
      </footer>
    `;
  }

  private generatePortfolioCSS(template?: string, theme?: string): string {
    const baseCSS = `
      .btn { 
        text-decoration: none; 
        cursor: pointer; 
      }
      .btn-primary { 
      }
      .btn-secondary {
      }
      .filter-btn { 
        cursor: pointer; 
      }
    `;

    const templateCSS = {
      gaming: `
      `,
      minimal: `
      `,
      showcase: `
      `,
    };

    const themeCSS = {
      dark: `
      `,
    };

    return (
      baseCSS +
      (templateCSS[template as keyof typeof templateCSS] || "") +
      (themeCSS[theme as keyof typeof themeCSS] || "")
    );
  }

  private generatePortfolioJS(_options?: PortfolioExportOptions): string {
    return `
        // Project filtering
        const filterButtons = document.querySelectorAll('.filter-btn');
        const projectCards = document.querySelectorAll('.project-card');
        
        filterButtons.forEach(btn => {
          btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            
            // Update active button
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Filter projects
            projectCards.forEach(card => {
              if (filter === 'all') {
                card.style.display = 'block';
              } else {
                const category = card.dataset.category;
                card.style.display = category === filter ? 'block' : 'none';
              }
            });
          });
        });
        
        // Smooth scrolling for internal links
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
              behavior: 'smooth'
            });
          });
        });
        
        // Add loading states for external links
        document.querySelectorAll('a[target="_blank"]').forEach(link => {
            this.textContent = 'Opening...';
            setTimeout(() => {
              this.textContent = this.dataset.originalText || this.textContent;
          });
        });
      });
    `;
  }

  private extractPlatforms(description: string): string[] {
    const platforms = [
      "PC",
      "Console",
      "Mobile",
      "VR",
      "AR",
      "Web",
      "Switch",
      "PlayStation",
      "Xbox",
      "Steam",
    ];
    return platforms.filter((platform) =>
      description.toLowerCase().includes(platform.toLowerCase()),
    );
  }

  private extractGameEngines(description: string): string[] {
    const engines = [
      "Unity",
      "Unreal Engine",
      "Godot",
      "GameMaker",
      "Construct",
      "RPG Maker",
      "Custom Engine",
    ];
    return engines.filter((engine) =>
      description.toLowerCase().includes(engine.toLowerCase()),
    );
  }

  private extractGenres(description: string): string[] {
    const genres = [
      "RPG",
      "FPS",
      "Strategy",
      "Puzzle",
      "Platformer",
      "Racing",
      "Sports",
      "Horror",
      "Adventure",
    ];
    return genres.filter((genre) =>
      description.toLowerCase().includes(genre.toLowerCase()),
    );
  }

  private getProjectCategory(project: PortfolioProject): string {
    const description = project.description.toLowerCase();
    const tech = project.technologies?.join(" ").toLowerCase() || "";

    if (
      description.includes("game") ||
      description.includes("unity") ||
      description.includes("unreal")
    ) {
      return "games";
    }
    if (
      description.includes("tool") ||
      description.includes("editor") ||
      description.includes("utility")
    ) {
      return "tools";
    }
    if (
      tech.includes("react") ||
      tech.includes("vue") ||
      tech.includes("web") ||
      description.includes("website")
    ) {
      return "web";
    }
    return "games"; // Default to games for gaming portfolio
  }

  private getSocialIcon(platform: string): string {
    const icons: Record<string, string> = {
      github: "github",
      linkedin: "linkedin",
      twitter: "twitter",
      instagram: "instagram",
      website: "web",
      portfolio: "briefcase",
      email: "email",
    };
    return icons[platform.toLowerCase()] || "link";
  }

  private async generateWebsiteFiles(
    projects: PortfolioProject[],
    options?: PortfolioExportOptions,
  ): Promise<Record<string, string | Blob>> {
    const files: Record<string, string | Blob> = {};

    // Main index.html
    files["index.html"] = this.generatePortfolioHTML(projects, options, false);

    // Individual project pages
    projects.forEach((project) => {
      files[filename] = this.generateProjectHTML(project, options);
    });

    // Assets
    files["assets/styles.css"] = this.generatePortfolioCSS(
      options?.template,
      options?.theme,
    );
    files["assets/portfolio.js"] = this.generatePortfolioJS(_options);

    // Config files
    files["package.json"] = JSON.stringify(
      {
        name: "gaming-portfolio",
        description: "Gaming industry portfolio website",
        scripts: {
          "serve-node": "npx http-server",
        },
      },
      null,
    );

    // README
    files["README.md"] = this.generateReadme(projects, options);

    return files;
  }

  private async createZipFromFiles(
    files: Record<string, string | Blob>,
  ): Promise<Blob> {
    // Simple ZIP implementation - in production, use JSZip library
    // For now, return a single file archive
    const content = Object.entries(files)
      .map(
        ([filename, content]) =>
          `=== ${filename} ===\n${typeof content === "string" ? content : "[BINARY FILE]"}\n\n`,
      )
      .join("");

    return new Blob([content], { type: "application/zip" });
  }

  private generateReadme(
    projects: PortfolioProject[],
    options?: PortfolioExportOptions,
  ): string {
    const metadata = options?.metadata || {};


${metadata.description ? `${metadata.description}\n\n` : ""}


This portfolio contains ${projects.length} projects showcasing gaming industry expertise:

${projects
  .map(
    (project, index) => `
   - ${project.description}
   ${project.technologies?.length ? `   - Technologies: ${project.technologies.join(", ")}` : ""}
   ${project.liveUrl ? `   - [View Live](${project.liveUrl})` : ""}
   ${project.githubUrl ? `   - [Source Code](${project.githubUrl})` : ""}
`,
  )
  .join("")}


To view this portfolio locally:

   - Node.js: \`npx http-server\`



`;
  }

  private async addProjectAssets(
    files: Record<string, string | Blob>,
    projects: PortfolioProject[],
  ): Promise<void> {
    for (const project of projects) {
      if (project.image && project.image.startsWith("data:")) {
        files[filename] = imageBlob;
      }
    }
  }

  private generatePDFHeader(options?: PortfolioExportOptions): string {
    return `
        ${options?.metadata?.title || "Gaming Portfolio"} - ${options?.metadata?.author || ""}
      </div>
    `;
  }

  private generatePDFFooter(_options?: PortfolioExportOptions): string {
    return `
        Page <span class="pageNumber"></span> of <span class="totalPages"></span> - Generated with NAVI Gaming Jobseeker Platform
      </div>
    `;
  }

  private async generatePDFInBrowser(
    htmlContent: string,
    projects: PortfolioProject[],
    options?: PortfolioExportOptions,
  ): Promise<PortfolioExportResponse> {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      throw new Error(
        "Could not open print window. Please check popup blockers.",
      );
    }

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    await new Promise((resolve) => {
      printWindow.addEventListener("load", resolve);
    });

    printWindow.print();

    return {
      success: true,
      filename: this.generateFilename("portfolio", "pdf", options),
      metadata: {
        format: "pdf",
        size: htmlContent.length,
        projectCount: projects.length,
        generatedAt: new Date().toISOString(),
        template: options?.template,
      },
    };
  }

  private generateFilename(
    baseName: string,
    extension: string,
    options?: PortfolioExportOptions,
  ): string {
    const author = options?.metadata?.author || "Portfolio";
    return `${cleanAuthor}_${baseName}_${timestamp}.${extension}`;
  }
}

// Export singleton instance
export const portfolioExportService = PortfolioExportService.getInstance();

// API route handlers
export const portfolioExportRoutes = {
  async export(
    request: PortfolioExportRequest,
  ): Promise<PortfolioExportResponse> {
    return await portfolioExportService.exportPortfolio(request);
  },

  async downloadPortfolio(
    projects: PortfolioProject[],
    format: "pdf" | "zip" | "html" | "json" | "website",
    options?: PortfolioExportOptions,
  ): Promise<void> {
    const result = await portfolioExportService.exportPortfolio({
      projects,
      format,
      options,
    });

    if (result.success && result.blob && result.filename) {
      // Create download link
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      throw new Error(result.error || "Portfolio export failed");
    }
  },
};
