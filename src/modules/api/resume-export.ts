
import { logger } from "@/shared/utils/logger";
// Reuse consolidated export utilities for browser fallbacks
// Keeps export behavior consistent across the app
import { ExportService } from "@/utils/export";
import type {
  ResumeData,
  ExportFormat,
  ExportOptions,
  ResumeExperienceItem,
} from "../../shared/types/resume";

export interface ResumeExportRequest {
  resumeData: ResumeData;
  format: ExportFormat;
  options?: ExportOptions;
}

export interface ResumeExportResponse {
  success: boolean;
  url?: string;
  blob?: Blob;
  filename?: string;
  error?: string;
  metadata?: {
    format: ExportFormat;
    size: number;
    pageCount?: number;
    generatedAt: string;
  };
}

export class ResumeExportService {
  private static instance: ResumeExportService;

  static getInstance(): ResumeExportService {
    if (!ResumeExportService.instance) {
      ResumeExportService.instance = new ResumeExportService();
    }
    return ResumeExportService.instance;
  }

  async exportResume(
    request: ResumeExportRequest,
  ): Promise<ResumeExportResponse> {
    try {
      logger.info(`Exporting resume to ${request.format}`);

      switch (request.format) {
        case "pdf":
          return await this.exportToPDF(request.resumeData, request.options);

        case "docx":
          return await this.exportToDocx(request.resumeData, request.options);

        case "html":
          return await this.exportToHTML(request.resumeData, request.options);

        case "json":
          return await this.exportToJSON(request.resumeData, request.options);

        case "markdown":
          return await this.exportToMarkdown(
            request.resumeData,
            request.options,
          );

        default:
          throw new Error(`Unsupported export format: ${request.format}`);
      }
    } catch (_error) {
      logger.error("Resume export failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown export error",
      };
    }
  }

  private async exportToPDF(
    resumeData: ResumeData,
    options?: ExportOptions,
  ): Promise<ResumeExportResponse> {
    try {
      // Generate HTML template
      const htmlTemplate = this.generateHTMLTemplate(resumeData, options);

      // Check if we're in Electron environment
      if (
        typeof window !== "undefined" &&
        (window as any).electronAPI?.resume?.exportPDF
      ) {
        // Use Electron's PDF generation
        const result = await (window as any).electronAPI.resume.exportPDF({
          html: htmlTemplate,
          options: {
            margin: options?.margins,
            displayHeaderFooter: false,
            printBackground: true,
          },
        });

        if (result.success) {
          return {
            success: true,
            blob: new Blob([result.buffer], { type: "application/pdf" }),
            filename: this.generateFilename(resumeData, "pdf"),
            metadata: {
              format: "pdf",
              size: result.buffer.length,
              pageCount: result.pageCount,
              generatedAt: new Date().toISOString(),
            },
          };
        }
        throw new Error(result.error);
      }

      // Fallback to browser PDF generation via shared ExportService
      const blob = await ExportService.exportToPDF(resumeData, {
        theme: options?.theme,
      });
      return {
        success: true,
        blob,
        filename: this.generateFilename(resumeData, "pdf"),
        metadata: {
          format: "pdf",
          size: blob.size,
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (_error) {
      throw new Error(
        `PDF export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private async exportToDocx(
    resumeData: ResumeData,
    options?: ExportOptions,
  ): Promise<ResumeExportResponse> {
    try {
      // Check if we have docx generation capability
      if (
        typeof window !== "undefined" &&
        (window as any).electronAPI?.resume?.exportDocx
      ) {
        const result = await (window as any).electronAPI.resume.exportDocx({
          resumeData,
          template: options?.template || "modern",
          options,
        });

        if (result.success) {
          return {
            success: true,
            blob: new Blob([result.buffer], {
              type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            }),
            filename: this.generateFilename(resumeData, "docx"),
            metadata: {
              format: "docx",
              size: result.buffer.length,
              generatedAt: new Date().toISOString(),
            },
          };
        }
        throw new Error(result.error);
      }

      // Web-based DOCX generation fallback via shared ExportService
      const blob = await ExportService.exportToDocx(resumeData);
      return {
        success: true,
        blob,
        filename: this.generateFilename(resumeData, "docx"),
        metadata: {
          format: "docx",
          size: blob.size,
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (_error) {
      throw new Error(
        `DOCX export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private async exportToHTML(
    resumeData: ResumeData,
    options?: ExportOptions,
  ): Promise<ResumeExportResponse> {
    try {
      const htmlContent = this.generateHTMLTemplate(resumeData, options);
      const blob = new Blob([htmlContent], { type: "text/html" });

      return {
        success: true,
        blob,
        filename: this.generateFilename(resumeData, "html"),
        metadata: {
          format: "html",
          size: blob.size,
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (_error) {
      throw new Error(
        `HTML export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private async exportToJSON(
    resumeData: ResumeData,
    _options?: ExportOptions,
  ): Promise<ResumeExportResponse> {
    try {
      const jsonContent = JSON.stringify(
        {
          ...resumeData,
          exportMetadata: {
            exportedAt: new Date().toISOString(),
            exportedBy: "NAVI Gaming Jobseeker Platform",
          },
        },
        null,
      );

      const blob = new Blob([jsonContent], { type: "application/json" });

      return {
        success: true,
        blob,
        filename: this.generateFilename(resumeData, "json"),
        metadata: {
          format: "json",
          size: blob.size,
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (_error) {
      throw new Error(
        `JSON export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private async exportToMarkdown(
    resumeData: ResumeData,
    _options?: ExportOptions,
  ): Promise<ResumeExportResponse> {
    try {
      const markdownContent = this.generateMarkdownTemplate(resumeData);
      const blob = new Blob([markdownContent], { type: "text/markdown" });

      return {
        success: true,
        blob,
        filename: this.generateFilename(resumeData, "md"),
        metadata: {
          format: "markdown",
          size: blob.size,
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (_error) {
      throw new Error(
        `Markdown export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  private generateHTMLTemplate(
    resumeData: ResumeData,
    options?: ExportOptions,
  ): string {
    const template = options?.template || "modern";
    const _theme = options?.theme || "light";

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <title>${resumeData.personalInfo?.name || "Resume"} - Gaming Industry Resume</title>
    <style>
        ${this.getResumeCSS(template, theme)}
    </style>
</head>
<body class="resume-template-${template} theme-${theme}">
    <div class="resume-container">
        ${this.generatePersonalInfoSection(resumeData.personalInfo)}
        ${this.generateSummarySection(resumeData.summary)}
        ${this.generateExperienceSection(resumeData.experience)}
        ${this.generateSkillsSection(resumeData.skills)}
        ${this.generateEducationSection(resumeData.education)}
        ${this.generateGamingSection(resumeData.gamingExperience)}
        ${this.generateProjectsSection(resumeData.projects)}
    </div>
</body>
</html>`;
  }

  private generateMarkdownTemplate(resumeData: ResumeData): string {
    const sections = [];

    // Header
    if (resumeData.personalInfo) {

      const contactInfo = [];
      if (resumeData.personalInfo.email)
      if (resumeData.personalInfo.phone)
      if (resumeData.personalInfo.location)

      if (contactInfo.length) {
        sections.push(contactInfo.join(" | ") + "\n");
      }
    }

    // Summary
    if (resumeData.summary) {
      sections.push(resumeData.summary + "\n");
    }

    // Experience
    if (resumeData.experience?.length) {
      resumeData.experience.forEach((exp: ResumeExperienceItem) => {
        sections.push(
        );
        if (exp.description) sections.push(`\n${exp.description}\n`);
      });
    }

    // Skills
    if (
      resumeData.skills?.technical?.length ||
      resumeData.skills?.soft?.length
    ) {
      if (resumeData.skills.technical?.length) {
        sections.push(
        );
      }
      if (resumeData.skills.soft?.length) {
        sections.push(
        );
      }
    }

    // Gaming Experience
    if (resumeData.gamingExperience) {
      const gaming = resumeData.gamingExperience;
      if (gaming.gameEngines)
      if (gaming.platforms)
      if (gaming.shippedTitles)
    }

    return sections.join("\n");
  }

  private getResumeCSS(template: string, _theme: string): string {
    // Base CSS that works across all templates
    const baseCSS = `
      
      @media print {
      }
    `;

    // Template-specific CSS
    const templateCSS = {
      modern: `
        .theme-light { background: white; }
             -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      `,
      classic: `
      `,
      gaming: `
      `,
    };

    return (
      baseCSS +
      (templateCSS[template as keyof typeof templateCSS] || templateCSS.modern)
    );
  }

  private generatePersonalInfoSection(personalInfo?: any): string {
    if (!personalInfo) return "";

    const contactItems = [];
    if (personalInfo.email) contactItems.push(personalInfo.email);
    if (personalInfo.phone) contactItems.push(personalInfo.phone);
    if (personalInfo.location) contactItems.push(personalInfo.location);

    return `
      <div class="personal-info section">
        <div class="contact-info">${contactItems.join(" | ")}</div>
      </div>
    `;
  }

  private generateSummarySection(summary?: string): string {
    if (!summary) return "";
    return `
      <div class="summary section">
        <p>${summary}</p>
      </div>
    `;
  }

  private generateExperienceSection(experience?: any[]): string {
    if (!experience?.length) return "";

    const experienceItems = experience
      .map(
        (exp) => `
      <div class="experience-item">
        <div class="date-range">${exp.startDate} - ${exp.endDate || "Present"} | ${exp.location || ""}</div>
        ${exp.description ? `<p>${exp.description}</p>` : ""}
      </div>
    `,
      )
      .join("");

    return `
      <div class="experience section">
        ${experienceItems}
      </div>
    `;
  }

  private generateSkillsSection(skills?: any): string {
    if (!skills) return "";

    const sections = [];
    if (skills.technical?.length) {
      const skillTags = skills.technical
        .map((skill: string) => `<span class="skill-tag">${skill}</span>`)
        .join("");
      sections.push(
        `<div><strong>Technical Skills:</strong><div class="skills-list">${skillTags}</div></div>`,
      );
    }

    if (skills.soft?.length) {
      const skillTags = skills.soft
        .map((skill: string) => `<span class="skill-tag">${skill}</span>`)
        .join("");
      sections.push(
        `<div><strong>Soft Skills:</strong><div class="skills-list">${skillTags}</div></div>`,
      );
    }

    return sections.length
      ? `
      <div class="skills section">
        ${sections.join("")}
      </div>
    `
      : "";
  }

  private generateEducationSection(education?: any[]): string {
    if (!education?.length) return "";

    const educationItems = education
      .map(
        (edu) => `
      <div class="education-item">
        <div class="date-range">${edu.school} | ${edu.year}</div>
      </div>
    `,
      )
      .join("");

    return `
      <div class="education section">
        ${educationItems}
      </div>
    `;
  }

  private generateGamingSection(gamingExperience?: any): string {
    if (!gamingExperience) return "";

    const items = [];
    if (gamingExperience.gameEngines)
      items.push(
        `<p><strong>Game Engines:</strong> ${gamingExperience.gameEngines}</p>`,
      );
    if (gamingExperience.platforms)
      items.push(
        `<p><strong>Platforms:</strong> ${gamingExperience.platforms}</p>`,
      );
    if (gamingExperience.genres)
      items.push(`<p><strong>Genres:</strong> ${gamingExperience.genres}</p>`);
    if (gamingExperience.shippedTitles)
      items.push(
        `<p><strong>Shipped Titles:</strong> ${gamingExperience.shippedTitles}</p>`,
      );

    return items.length
      ? `
      <div class="gaming section">
        ${items.join("")}
      </div>
    `
      : "";
  }

  private generateProjectsSection(projects?: any[]): string {
    if (!projects?.length) return "";

    const projectItems = projects
      .map(
        (project) => `
      <div class="project-item">
        <p>${project.description}</p>
        ${project.technologies ? `<div class="skills-list">${project.technologies.map((tech: string) => `<span class="skill-tag">${tech}</span>`).join("")}</div>` : ""}
      </div>
    `,
      )
      .join("");

    return `
      <div class="projects section">
        ${projectItems}
      </div>
    `;
  }

  private async generatePDFInBrowser(
    _htmlContent: string,
    resumeData: ResumeData,
    _options?: ExportOptions,
  ): Promise<ResumeExportResponse> {
    // Backward-compatible wrapper: delegate to shared ExportService for consistency
    const blob = await ExportService.exportToPDF(resumeData);
    return {
      success: true,
      blob,
      filename: this.generateFilename(resumeData, "pdf"),
      metadata: {
        format: "pdf",
        size: blob.size,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  private async generateDocxInBrowser(
    resumeData: ResumeData,
    _options?: ExportOptions,
  ): Promise<ResumeExportResponse> {
    // Delegate to shared ExportService DOCX implementation
    const blob = await ExportService.exportToDocx(resumeData);
    return {
      success: true,
      blob,
      filename: this.generateFilename(resumeData, "docx"),
      metadata: {
        format: "docx",
        size: blob.size,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  private generateRTFContent(resumeData: ResumeData): string {
    const rtfHeader =
    const rtfFooter = "}";

    let content = "";

    if (resumeData.personalInfo?.name) {
    }

    if (resumeData.summary) {
    }

    return rtfHeader + content + rtfFooter;
  }

  private generateFilename(resumeData: ResumeData, extension: string): string {
    const name = resumeData.personalInfo?.name || "Resume";
    return `${cleanName}_Resume_${timestamp}.${extension}`;
  }
}

// Export singleton instance
export const resumeExportService = ResumeExportService.getInstance();

// API route handlers
export const resumeExportRoutes = {
  async export(request: ResumeExportRequest): Promise<ResumeExportResponse> {
    return await resumeExportService.exportResume(request);
  },

  async downloadResume(
    resumeData: ResumeData,
    format: ExportFormat,
    options?: ExportOptions,
  ): Promise<void> {
    const result = await resumeExportService.exportResume({
      resumeData,
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
      throw new Error(result.error || "Export failed");
    }
  },
};
