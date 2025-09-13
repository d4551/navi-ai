export interface ResumeTemplate {
  name: string;
  description: string;
  margins: { top: number; bottom: number; left: number; right: number };
  fonts: {
    heading: string;
    body: string;
    size: {
      heading1: number;
      heading2: number;
      body: number;
    };
  };
}

export const RESUME_TEMPLATES: Record<string, ResumeTemplate> = {
  "google-xyz": {
    name: "Google XYZ Format",
    description:
      "Clean, minimal single-page resume format popularized by Google",
    margins: { top: 36, bottom: 36, left: 54, right: 54 },
    fonts: {
      heading: "Roboto",
      body: "Roboto",
      size: {
        heading1: 18,
        heading2: 14,
        body: 11,
      },
    },
  },
  "modern-professional": {
    name: "Modern Professional",
    description:
      "Contemporary resume design with clean layout and subtle accents",
    margins: { top: 36, bottom: 36, left: 72, right: 72 },
    fonts: {
      heading: "Arial",
      body: "Arial",
      size: {
        heading1: 16,
        heading2: 12,
        body: 10,
      },
    },
  },
  "academic-cv": {
    name: "Academic CV",
    description: "Detailed format suitable for academic and research positions",
    margins: { top: 54, bottom: 54, left: 72, right: 72 },
    fonts: {
      heading: "Times New Roman",
      body: "Times New Roman",
      size: {
        heading1: 14,
        heading2: 12,
        body: 11,
      },
    },
  },
  creative: {
    name: "Creative Professional",
    description: "Stylish format for creative fields with more visual appeal",
    margins: { top: 36, bottom: 36, left: 54, right: 54 },
    fonts: {
      heading: "Montserrat",
      body: "Open Sans",
      size: {
        heading1: 16,
        heading2: 13,
        body: 10,
      },
    },
  },
  executive: {
    name: "Executive",
    description: "Sophisticated format for senior professionals and executives",
    margins: { top: 36, bottom: 36, left: 72, right: 72 },
    fonts: {
      heading: "Georgia",
      body: "Georgia",
      size: {
        heading1: 16,
        heading2: 13,
        body: 11,
      },
    },
  },
};

export function getAllTemplates(): Record<string, ResumeTemplate> {
  const builtInTemplates = RESUME_TEMPLATES;
  // Only available in Google Apps Script environment
  if (typeof window !== "undefined" && (window as any).PropertiesService) {
    const PropertiesService = (window as any).PropertiesService;
    const userProps = PropertiesService.getUserProperties();
    const customStyles =
      JSON.parse(userProps.getProperty("userSettings") || "{}").customStyles ||
      {};
    return { ...builtInTemplates, ...customStyles };
  }
  return builtInTemplates;
}

export function applyTemplateToDocument(
  documentId: string,
  templateId: string,
): { success?: true; error?: true; message?: string } {
  try {
    // Check if we're in a Google Apps Script environment
    if (typeof window !== "undefined" && (window as any).DocumentApp) {
      const DocumentApp = (window as any).DocumentApp;
      const document = DocumentApp.openById(documentId);
      const template = RESUME_TEMPLATES[templateId];

      if (!template) {
        return { error: true, message: "Template not found" };
      }

      const body = document.getBody();

      // Apply document-level styles
      const style = {};
      style[DocumentApp.Attribute.MARGIN_TOP] = template.margins.top;
      style[DocumentApp.Attribute.MARGIN_BOTTOM] = template.margins.bottom;
      style[DocumentApp.Attribute.MARGIN_LEFT] = template.margins.left;
      style[DocumentApp.Attribute.MARGIN_RIGHT] = template.margins.right;
      body.setAttributes(style);

      // Set default font for body text
      const textStyle = {};
      textStyle[DocumentApp.Attribute.FONT_FAMILY] = template.fonts.body;
      textStyle[DocumentApp.Attribute.FONT_SIZE] = template.fonts.size.body;
      body.setAttributes(textStyle);

      // Apply heading styles to all paragraphs that contain headings
      const paragraphs = body.getParagraphs();
      for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i];
        const text = paragraph.getText().trim();

        // Detect and style headings based on content patterns
        if (
          text &&
          (text.match(/^[A-Z\s]+$/) || // All caps section headers
            text.match(
              /^(EXPERIENCE|EDUCATION|SKILLS|SUMMARY|OBJECTIVE|PROJECTS|CERTIFICATIONS)/,
            ) ||
            text.endsWith(":") ||
            paragraph.getHeading() !== DocumentApp.ParagraphHeading.NORMAL)
        ) {
          const headingStyle = {};
          headingStyle[DocumentApp.Attribute.FONT_FAMILY] =
            template.fonts.heading;
          headingStyle[DocumentApp.Attribute.FONT_SIZE] =
            template.fonts.size.heading1;
          headingStyle[DocumentApp.Attribute.BOLD] = true;
          paragraph.setAttributes(headingStyle);
        }

        // Style job titles and company names (lines that follow name patterns)
        if (text.match(/^\w+\s+\w+(\s+\w+)*\s*(-|–|—|\|)\s*\w+/)) {
          const subheadingStyle = {};
          subheadingStyle[DocumentApp.Attribute.FONT_FAMILY] =
            template.fonts.heading;
          subheadingStyle[DocumentApp.Attribute.FONT_SIZE] =
            template.fonts.size.heading2;
          subheadingStyle[DocumentApp.Attribute.BOLD] = true;
          paragraph.setAttributes(subheadingStyle);
        }
      }

      // Ensure consistent line spacing
      const bodyStyle = {};
      bodyStyle[DocumentApp.Attribute.LINE_SPACING] = 1.15;
      body.setAttributes(bodyStyle);

      return {
        success: true,
        message: `Template "${template.name}" applied successfully`,
      };
    } else {
      return {
        error: true,
        message: "DocumentApp not available in this environment",
      };
    }
  } catch (error) {
    return {
      error: true,
      message: `Failed to apply template: ${(error as Error).message}`,
    };
  }
}
