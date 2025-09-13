
import { createModal } from "../utils/modalUtils";

export interface ChangelogEntry {
  version: string;
  date: string;
  type: "major" | "minor" | "patch" | "feature" | "improvement" | "bugfix";
  changes: string[];
  breaking?: boolean;
  highlights?: string[];
}

export interface UpcomingFeature {
  title: string;
  description: string;
  status: "planned" | "in-development" | "testing";
  estimatedRelease?: string;
}

class ChangelogService {
  private changelog: ChangelogEntry[] = [
    {
      type: "major",
      changes: [
        "Modular architecture refactoring for better code organization",
        "New unified modal system with consistent styling",
        "Enhanced sharing service with multi-platform support",
        "Improved statistics tracking with detailed analytics",
        "Dynamic challenge system based on user progress",
      ],
      highlights: ["Complete modular refactoring", "Enhanced user experience"],
    },
    {
      type: "feature",
      changes: [
        "Enhanced skill mapping with visual web representation",
        "Added gaming industry-specific interview scenarios",
        "Improved portfolio generator with interactive previews",
        "New career pathway visualization",
        "Advanced skill-to-industry translation engine",
      ],
      highlights: ["Visual skill mapping", "Gaming industry focus"],
    },
    {
      type: "improvement",
      changes: [
        "Updated Settings UI with glass morphism design",
        "Enhanced responsive design for mobile devices",
        "Improved accessibility with better ARIA labels",
        "Performance optimizations for large resumes",
        "Better error handling and user feedback",
      ],
    },
    {
      type: "feature",
      changes: [
        "Added mock interview system with AI feedback",
        "Implemented voice recognition for hands-free operation",
        "Enhanced resume templates for gaming industry",
        "Real-time interview analysis and scoring",
      ],
      highlights: ["Mock interview system", "Voice recognition"],
    },
    {
      type: "bugfix",
      changes: [
        "Fixed API key validation issues",
        "Resolved theme switching problems",
        "Corrected skill mapping edge cases",
        "Improved error handling across all components",
      ],
    },
    {
      type: "major",
      changes: [
        "Initial release of NAVI Gaming Career Assistant",
        "AI-powered resume builder with gaming industry templates",
        "Portfolio generator with project showcasing",
        "Job search integration with gaming companies",
        "User profile and progress tracking",
      ],
      highlights: ["Initial public release", "Core AI features"],
      breaking: true,
    },
  ];

  private upcomingFeatures: UpcomingFeature[] = [
    {
      title: "Advanced Analytics Dashboard",
      description:
        "Comprehensive analytics with career progression insights and portfolio performance tracking",
      status: "in-development",
    },
    {
      title: "Team Collaboration Features",
      description:
        "Share portfolios and collaborate on projects with teammates in real-time",
      status: "planned",
    },
    {
      title: "Gaming Platform Integration",
      description:
        "Direct integration with Steam, Discord, Epic Games Store, and other gaming platforms",
      status: "testing",
    },
    {
      title: "AI-Powered Interview Simulator",
      description:
        "Practice interviews with AI personas from different game studios",
      status: "in-development",
    },
    {
      title: "Advanced Resume Parsing",
      description:
        "Upload existing resumes and automatically extract structured data with AI",
      status: "completed",
      estimatedRelease: "Available Now",
    },
    {
      title: "Market Insights & Salary Analysis",
      description:
        "Real-time job market analytics and salary benchmarking for gaming roles",
      status: "completed",
      estimatedRelease: "Available Now",
    },
    {
      title: "Custom Template Builder",
      description:
        "Create personalized resume and portfolio templates with advanced customization",
      status: "completed",
      estimatedRelease: "Available Now",
    },
    {
      title: "Version Control & History",
      description:
        "Track changes and compare different versions of your documents",
      status: "completed",
      estimatedRelease: "Available Now",
    },
    {
      title: "Multi-Provider AI Integration",
      description: "Support for OpenAI, Claude, Gemini, and Grok AI models",
      status: "completed",
      estimatedRelease: "Available Now",
    },
    {
      title: "Blockchain Portfolio Verification",
      description:
        "Immutable verification of achievements and work history on blockchain",
      status: "planned",
    },
    {
      title: "VR/AR Portfolio Showcase",
      description:
        "Present your portfolio in immersive VR environments for gaming companies",
      status: "planned",
    },
    {
      title: "Mobile Application",
      description:
        "Native mobile app for iOS and Android with full feature parity",
      status: "planned",
    },
  ];

  showChangelog(): void {
    const content = this.generateChangelogHTML();

    createModal({
      content,
      size: "lg",
      buttons: [
        {
          text: "Close",
          type: "secondary",
          onclick: "this.closest('.modal').remove()",
        },
        {
          text: "View on GitHub",
          type: "primary",
          href: "https://github.com/anthropics/claude-code",
          target: "_blank",
          onclick: "this.closest('.modal').remove()",
        },
      ],
    });
  }

  private generateChangelogHTML(): string {
    const currentVersion = this.getCurrentVersion();

    let html = `
      <div class="changelog-modal">
          <div class="d-flex align-items-center">
            </div>
            <div>
            </div>
          </div>
        </div>

        <div class="changelog-content">
          <div class="changelog-list">
    `;

    recentChanges.forEach((entry) => {
      const typeIcon = this.getTypeIcon(entry.type);
      const typeColor = this.getTypeColor(entry.type);

      html += `
            <small class="text-muted">${entry.date}</small>
          </div>
          
          ${
            entry.highlights
              ? `
            ${entry.highlights
              .map(
                (highlight) => `
            `,
              )
              .join("")}
          </div>
          `
              : ""
          }

            ${entry.changes.map((change) => `<li>${change}</li>`).join("")}
          </ul>
        </div>
      `;
    });

    html += `
          </div>
        </div>

          <div class="features-grid">
            ${this.upcomingFeatures
              .map(
                (feature) => `
                  <span class="badge ${this.getStatusColor(feature.status)}">${this.getStatusLabel(feature.status)}</span>
                </div>
                ${feature.estimatedRelease ? `<small class="text-primary">Est. ${feature.estimatedRelease}</small>` : ""}
              </div>
            `,
              )
              .join("")}
          </div>
        </div>

          <div class="row align-items-center">
            <div class="col">
            </div>
            <div class="col-auto">
              <a href="https://github.com/anthropics/claude-code/releases" target="_blank" class="btn btn-outline-primary btn-sm">
                Watch Releases
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    return html;
  }

  getCurrentVersion(): ChangelogEntry {
  }

  getAllChanges(): ChangelogEntry[] {
    return [...this.changelog];
  }

  getChangesSince(version: string): ChangelogEntry[] {
    const index = this.changelog.findIndex(
      (entry) => entry.version === version,
    );
  }

  hasNewChanges(lastSeenVersion?: string): boolean {
    if (!lastSeenVersion) return true;
  }

  private getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
    };
  }

  private getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      major: "bg-danger",
      minor: "bg-primary",
      patch: "bg-info",
      feature: "bg-success",
      improvement: "bg-warning",
      bugfix: "bg-secondary",
    };
    return colors[type] || "bg-light";
  }

  private getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      planned: "bg-secondary",
      "in-development": "bg-warning",
      testing: "bg-info",
    };
    return colors[status] || "bg-light";
  }

  private getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      planned: "Planned",
      "in-development": "In Development",
      testing: "Testing",
    };
    return labels[status] || status;
  }
}

// Export singleton instance
export const changelogService = new ChangelogService();
export default changelogService;
