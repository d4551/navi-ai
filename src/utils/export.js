import JSZip from "jszip";
import { saveAs } from "file-saver";
import QRCode from "qrcode";
import { format } from "date-fns";
import { marked } from "marked";
// Removed jsPDF (CSP unsafe); using pdf-lib helpers instead
import { pdfFromTallImage } from "@/utils/pdfExport";
import html2canvas from "html2canvas";
import { logger } from "@/shared/utils/logger";
import { validateResumeData } from "@/shared/schemas/exportSchema";

// Enhanced export utilities
export class ExportService {
  // Export resume to multiple formats
  static async exportResume(
    resumeData,
    formats = ["pdf", "json"],
    options = {},
  ) {
    // Validate/normalize against canonical schema
    resumeData = validateResumeData(resumeData);
    const results = {};

    try {
      for (const format of formats) {
        switch (format.toLowerCase()) {
          case "pdf":
            results.pdf = await this.exportToPDF(resumeData, options.pdf);
            break;
          case "json":
            results.json = this.exportToJSON(resumeData);
            break;
          case "markdown":
            results.markdown = this.exportToMarkdown(resumeData);
            break;
          case "html":
            results.html = this.exportToHTML(resumeData, options.html);
            break;
          case "docx":
            results.docx = await this.exportToDocx(resumeData);
            break;
        }
      }

      return results;
    } catch (error) {
      logger.error("Export failed:", error);
      throw error;
    }
  }


  static async exportToPDF(resumeData, options = {}) {
    resumeData = validateResumeData(resumeData);
    try {
      const css =
        typeof document !== "undefined"
          ? getComputedStyle(document.documentElement)
          : null;
      const defaultBg = css
        ? (css.getPropertyValue("--bg-primary") || "#ffffff").trim()
        : "#ffffff";
      const {
        theme = "professional",
        scale = 2,
        backgroundColor = defaultBg,
      } = options;

      // Server-side fallback: return simple text blob (no pdf-lib in SSR)
      if (typeof window === "undefined" || typeof document === "undefined") {
        const lines = [];
        const name =
          `${resumeData.personalInfo?.firstName || ""} ${resumeData.personalInfo?.lastName || ""}`.trim() ||
          "Resume";
        lines.push(name);
        if (resumeData.personalInfo?.email) {
          lines.push(`Email: ${resumeData.personalInfo.email}`);
        }
        if (resumeData.personalInfo?.phone) {
          lines.push(`Phone: ${resumeData.personalInfo.phone}`);
        }
        return new Blob([lines.join("\n")], { type: "text/plain" });
      }

      // Build a detached container with HTML content
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-10000px";
      container.style.top = "0";
      container.style.width = "794px";
      container.style.background = backgroundColor;

      const markdown = this.exportToMarkdown(resumeData);
      const htmlContent = marked(markdown);
      const resumeCSS = this.getResumeCSS(theme);
      container.innerHTML = `<style>${resumeCSS}</style><div class="resume-container">${htmlContent}</div>`;

      document.body.appendChild(container);

      // Render to canvas
      const canvas = await html2canvas(container, { scale, backgroundColor });
      const imgData = canvas.toDataURL("image/png");

      // Cleanup container will happen after capture; convert tall image to paginated PDF
      document.body.removeChild(container);
      const pdfBlob = await pdfFromTallImage(imgData);
      return pdfBlob;
    } catch (error) {
      logger.error("PDF export failed:", error);
      throw new Error("Failed to export to PDF");
    }
  }

  static async exportElementToPDF(element, filename, options = {}) {
    if (!element) {
      logger.warn("exportElementToPDF called with null element");
      return false;
    }
    const css = getComputedStyle(document.documentElement);
    const defaultBg = (
    ).trim();
    const {
      backgroundColor = defaultBg,
      orientation = "p",
    } = options;
    try {
        scale,
        backgroundColor,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdfBlob = await pdfFromTallImage(imgData);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      logger.error("exportElementToPDF failed", err);
      return false;
    }
  }

  // Export to DOCX by generating minimal WordprocessingML package
  static async exportToDocx(resumeData) {
    resumeData = validateResumeData(resumeData);
    try {
      // Basic helpers to escape XML
      const xmlEscape = (s) =>
        String(s || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;");

      const p = (text) => `<w:p><w:r><w:t>${xmlEscape(text)}</w:t></w:r></w:p>`;
        <w:p>
          <w:pPr><w:pStyle w:val="Heading${lvl}"/></w:pPr>
          <w:r><w:t>${xmlEscape(text)}</w:t></w:r>
        </w:p>`;

      const name =
        `${resumeData.personalInfo?.firstName || ""} ${resumeData.personalInfo?.lastName || ""}`.trim();
      const lines = [];
      if (name) {
      }
      if (resumeData.personalInfo?.summary) {
        lines.push(p(resumeData.personalInfo.summary));
      }

      if (
        Array.isArray(resumeData.experience) &&
        resumeData.experience.length
      ) {
        resumeData.experience.forEach((exp) => {
          lines.push(
          );
          if (Array.isArray(exp.description)) {
            exp.description.forEach((d) => lines.push(p(`• ${d}`)));
          }
        });
      }

      if (Array.isArray(resumeData.education) && resumeData.education.length) {
        resumeData.education.forEach((edu) => {
          if (edu.graduationDate) {
            lines.push(p(`Graduated: ${edu.graduationDate}`));
          }
          if (edu.gpa) {
            lines.push(p(`GPA: ${edu.gpa}`));
          }
        });
      }

      if (Array.isArray(resumeData.skills) && resumeData.skills.length) {
        const skillNames = resumeData.skills
          .map((s) => s.name || s)
          .filter(Boolean);
        if (skillNames.length) {
          lines.push(p(skillNames.join(", ")));
        }
      }

      if (Array.isArray(resumeData.projects) && resumeData.projects.length) {
        resumeData.projects.forEach((prj) => {
          if (prj.description) {
            lines.push(p(prj.description));
          }
        });
      }

                    xmlns:o="urn:schemas-microsoft-com:office:office"
                    xmlns:v="urn:schemas-microsoft-com:vml"
          <w:body>
            ${lines.join("\n")}
            <w:sectPr>
            </w:sectPr>
          </w:body>
        </w:document>`;

          <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
          <Default Extension="xml" ContentType="application/xml"/>
          <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
          <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
          <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
          <Override PartName="/word/webSettings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.webSettings+xml"/>
          <Override PartName="/word/fontTable.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml"/>
        </Types>`;

        </Relationships>`;


          <Application>NAVI Career Assistant</Application>
        </Properties>`;

          <dc:title>${xmlEscape(name || "Resume")}</dc:title>
          <dc:creator>NAVI Career Assistant</dc:creator>
          <cp:lastModifiedBy>NAVI</cp:lastModifiedBy>
        </cp:coreProperties>`;

      const zip = new JSZip();
      zip.file("[Content_Types].xml", contentTypes);
      zip.folder("_rels").file(".rels", rels);
      zip.folder("word").file("document.xml", documentXml);
      zip.folder("word").folder("_rels").file("document.xml.rels", docRels);
      zip.folder("docProps").file("app.xml", appXml);
      zip.folder("docProps").file("core.xml", coreXml);

      const blob = await zip.generateAsync({ type: "blob" });
      return blob;
    } catch (error) {
      logger.error("DOCX export failed:", error);
      throw new Error("Failed to export to DOCX");
    }
  }

  static async exportPlainTextDocx(title = "Cover Letter", paragraphs = []) {
    try {
      const xmlEscape = (s) =>
        String(s || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;");

      const p = (text) => `<w:p><w:r><w:t>${xmlEscape(text)}</w:t></w:r></w:p>`;
        <w:p>
          <w:pPr><w:pStyle w:val="Heading${lvl}"/></w:pPr>
          <w:r><w:t>${xmlEscape(text)}</w:t></w:r>
        </w:p>`;

      const lines = [];
      if (title) {
      }
      (paragraphs || []).forEach((para) => {
        // Split on double line breaks to preserve paragraphing
        String(para || "")
          .forEach((chunk) => lines.push(p(chunk)));
      });

                    xmlns:o="urn:schemas-microsoft-com:office:office"
                    xmlns:v="urn:schemas-microsoft-com:vml"
          <w:body>
            ${lines.join("\n")}
            <w:sectPr>
            </w:sectPr>
          </w:body>
        </w:document>`;

          <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
          <Default Extension="xml" ContentType="application/xml"/>
          <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
          <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
          <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
        </Types>`;

        </Relationships>`;


          <Application>NAVI Career Assistant</Application>
        </Properties>`;

          <dc:title>${(title || "Cover Letter").replace(/</g, "&lt;")}</dc:title>
          <dc:creator>NAVI Career Assistant</dc:creator>
          <cp:lastModifiedBy>NAVI</cp:lastModifiedBy>
        </cp:coreProperties>`;

      const zip = new JSZip();
      zip.file("[Content_Types].xml", contentTypes);
      zip.folder("_rels").file(".rels", rels);
      zip.folder("word").file("document.xml", documentXml);
      zip.folder("word").folder("_rels").file("document.xml.rels", docRels);
      zip.folder("docProps").file("app.xml", appXml);
      zip.folder("docProps").file("core.xml", coreXml);

      const blob = await zip.generateAsync({ type: "blob" });
      return blob;
    } catch (error) {
      logger.error("Plain DOCX export failed:", error);
      throw new Error("Failed to export to DOCX");
    }
  }
  // Export to JSON with validation
  static exportToJSON(resumeData, formatted = true) {
    try {
      const exportData = {
        ...resumeData,
        exportedAt: new Date().toISOString(),
        generator: "NAVI Career Assistant",
      };
      return formatted
        : JSON.stringify(exportData);
    } catch (error) {
      logger.error("JSON export failed:", error);
      throw new Error("Failed to export to JSON");
    }
  }

  // Export to Markdown format
  static exportToMarkdown(resumeData) {
    try {

      // Contact Information
      if (resumeData.personalInfo) {
        const { email, phone, location, linkedIn, portfolio } =
          resumeData.personalInfo;

        if (email) {
        }
        if (phone) {
        }
        if (location) {
        }
        if (linkedIn) {
        }
        if (portfolio) {
        }
      }

      // Summary
      if (resumeData.personalInfo?.summary) {
        markdown += `${resumeData.personalInfo.summary}\n\n`;
      }

      // Experience
      if (resumeData.experience?.length) {

        resumeData.experience.forEach((exp) => {
          markdown += `${exp.startDate} - ${exp.current ? "Present" : exp.endDate || ""}\n\n`;

          if (exp.description?.length) {
            exp.description.forEach((desc) => {
              markdown += `- ${desc}\n`;
            });
            markdown += "\n";
          }

          if (exp.skills?.length) {
          }

          markdown += "---\n\n";
        });
      }

      // Education
      if (resumeData.education?.length) {

        resumeData.education.forEach((edu) => {
          if (edu.graduationDate) {
            markdown += `${edu.graduationDate}\n\n`;
          }
          if (edu.gpa) {
            markdown += `GPA: ${edu.gpa}\n\n`;
          }

          if (edu.relevant?.length) {
            markdown += "Relevant Coursework:\n";
            edu.relevant.forEach((course) => {
              markdown += `- ${course}\n`;
            });
            markdown += "\n";
          }

          markdown += "---\n\n";
        });
      }

      // Skills
      if (resumeData.skills?.length) {

        const skillsByCategory = resumeData.skills.reduce((acc, skill) => {
          const category = skill.category || "Other";
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(skill.name);
          return acc;
        }, {});

        Object.entries(skillsByCategory).forEach(([category, skills]) => {
          markdown += `${skills.join(" • ")}\n\n`;
        });
      }

      // Projects
      if (resumeData.projects?.length) {

        resumeData.projects.forEach((project) => {
          if (project.url) {
            markdown += `[View Project](${project.url})\n\n`;
          }
          markdown += `${project.description}\n\n`;

          if (project.technologies?.length) {
          }

          markdown += "---\n\n";
        });
      }

      return markdown;
    } catch (error) {
      logger.error("Markdown export failed:", error);
      throw new Error("Failed to export to Markdown");
    }
  }

  // Export to HTML format
  static exportToHTML(resumeData, options = {}) {
    try {
      const markdown = this.exportToMarkdown(resumeData);
      const htmlContent = marked(markdown);

      const css =
        options.includeCSS !== false ? this.getResumeCSS(options.theme) : "";

      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <title>${resumeData.personalInfo?.firstName || ""} ${resumeData.personalInfo?.lastName || ""} - Resume</title>
    <style>
        ${css}
    </style>
</head>
<body>
    <div class="resume-container">
        ${htmlContent}
    </div>
    <footer>
        <p>Generated by NAVI Career Assistant on ${format(new Date(), "PPP")}</p>
    </footer>
</body>
</html>`;

      return html;
    } catch (error) {
      logger.error("HTML export failed:", error);
      throw new Error("Failed to export to HTML");
    }
  }

  // Get CSS for resume styling
  static getResumeCSS(theme = "professional") {
    const themes = {
      professional: `
      `,
      modern: `
      `,
      creative: `
      `,
    };

    return themes[theme] || themes.professional;
  }

  // Create ZIP file with multiple formats
  static async createResumePackage(
    resumeData,
    formats = ["pdf", "json", "markdown", "html"],
  ) {
    try {
      const zip = new JSZip();
      const folderName = `${resumeData.personalInfo?.firstName || "resume"}_${resumeData.personalInfo?.lastName || "package"}_${format(new Date(), "yyyy-MM-dd")}`;
      const folder = zip.folder(folderName);

      // Export in all requested formats
      const exports = await this.exportResume(resumeData, formats);

      // Add files to ZIP
      Object.entries(exports).forEach(([format, content]) => {
        const extension =
          format === "pdf" ? "pdf" : format === "docx" ? "docx" : "txt";
        let filename = `resume.${extension}`;

        if (format === "json") {
          filename = "resume.json";
        } else if (format === "markdown") {
          filename = "resume.md";
        } else if (format === "html") {
          filename = "resume.html";
        }

        folder.file(filename, content);
      });

      // Add QR code for digital resume
      if (
        resumeData.personalInfo?.portfolio ||
        resumeData.personalInfo?.linkedIn
      ) {
        const qrUrl =
          resumeData.personalInfo.portfolio || resumeData.personalInfo.linkedIn;
        const qrCode = await this.generateQRCode(qrUrl);
      }

      // Add metadata file
      const metadata = {
        generatedAt: new Date().toISOString(),
        generator: "NAVI Career Assistant",
        formats: formats,
        personalInfo: {
          name: `${resumeData.personalInfo?.firstName || ""} ${resumeData.personalInfo?.lastName || ""}`.trim(),
          email: resumeData.personalInfo?.email,
        },
      };


      // Generate ZIP
      const zipContent = await zip.generateAsync({ type: "blob" });

      return {
        blob: zipContent,
        filename: `${folderName}.zip`,
      };
    } catch (error) {
      logger.error("Package creation failed:", error);
      throw new Error("Failed to create resume package");
    }
  }

  // Generate QR Code
  static async generateQRCode(url, options = {}) {
    try {
      const css = getComputedStyle(document.documentElement);
      const dark = (
        options.darkColor ||
        css.getPropertyValue("--text-primary") ||
      ).trim();
      const light = (
        options.lightColor ||
        css.getPropertyValue("--bg-primary") ||
      ).trim();
      const qrOptions = {
        color: {
          dark,
          light,
        },
      };

      return await QRCode.toDataURL(url, qrOptions);
    } catch (error) {
      logger.error("QR code generation failed:", error);
      throw new Error("Failed to generate QR code");
    }
  }

  // Export user data for backup
  static async exportUserData(userData) {
    try {
      const exportData = {
        ...userData,
        exportedAt: new Date().toISOString(),
        generator: "NAVI Career Assistant",
      };

        type: "application/json",
      });

      const filename = `navi_backup_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.json`;

      return { blob, filename };
    } catch (error) {
      logger.error("User data export failed:", error);
      throw new Error("Failed to export user data");
    }
  }

  // Download file helper
  static downloadFile(content, filename, mimeType = "text/plain") {
    try {
      let blob;

      if (content instanceof Blob) {
        blob = content;
      } else if (typeof content === "string") {
        blob = new Blob([content], { type: mimeType });
      } else {
          type: "application/json",
        });
      }

      saveAs(blob, filename);
      return true;
    } catch (error) {
      logger.error("Download failed:", error);
      return false;
    }
  }

  // Batch download helper
  static async downloadResumePackage(resumeData, formats) {
    try {
      const packageData = await this.createResumePackage(resumeData, formats);
      this.downloadFile(packageData.blob, packageData.filename);
      return true;
    } catch (error) {
      logger.error("Package download failed:", error);
      return false;
    }
  }
}

export const exportToJSON = (data, filename = "export.json") => {
  return ExportService.downloadFile(
    ExportService.exportToJSON(data),
    filename,
    "application/json",
  );
};

export const exportToMarkdown = (resumeData, filename = "resume.md") => {
  return ExportService.downloadFile(
    ExportService.exportToMarkdown(resumeData),
    filename,
    "text/markdown",
  );
};

export const exportToHTML = (
  resumeData,
  filename = "resume.html",
  options = {},
) => {
  return ExportService.downloadFile(
    ExportService.exportToHTML(resumeData, options),
    filename,
    "text/html",
  );
};

export default ExportService;
