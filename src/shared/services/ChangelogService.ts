/**
 * Changelog Service
 * Manages application version history and changelog display
 */

import { createModal } from '../utils/modalUtils';

export interface ChangelogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch' | 'feature' | 'improvement' | 'bugfix';
  changes: string[];
  breaking?: boolean;
  highlights?: string[];
}

export interface UpcomingFeature {
  title: string;
  description: string;
  status: 'planned' | 'in-development' | 'testing';
  estimatedRelease?: string;
}

class ChangelogService {
  private changelog: ChangelogEntry[] = [
    {
      version: '1.3.0',
      date: '2025-01-20',
      type: 'major',
      changes: [
        'Modular architecture refactoring for better code organization',
        'New unified modal system with consistent styling',
        'Enhanced sharing service with multi-platform support',
        'Improved statistics tracking with detailed analytics',
        'Dynamic challenge system based on user progress'
      ],
      highlights: [
        'Complete modular refactoring',
        'Enhanced user experience'
      ]
    },
    {
      version: '1.2.0',
      date: '2025-01-15',
      type: 'feature',
      changes: [
        'Enhanced skill mapping with visual web representation',
        'Added gaming industry-specific interview scenarios',
        'Improved portfolio generator with interactive previews',
        'New career pathway visualization',
        'Advanced skill-to-industry translation engine'
      ],
      highlights: [
        'Visual skill mapping',
        'Gaming industry focus'
      ]
    },
    {
      version: '1.1.5',
      date: '2025-01-10',
      type: 'improvement',
      changes: [
        'Updated Settings UI with glass morphism design',
        'Enhanced responsive design for mobile devices',
        'Improved accessibility with better ARIA labels',
        'Performance optimizations for large resumes',
        'Better error handling and user feedback'
      ]
    },
    {
      version: '1.1.0',
      date: '2025-01-05',
      type: 'feature',
      changes: [
        'Added mock interview system with AI feedback',
        'Implemented voice recognition for hands-free operation',
        'New gaming studio database with 50+ companies',
        'Enhanced resume templates for gaming industry',
        'Real-time interview analysis and scoring'
      ],
      highlights: [
        'Mock interview system',
        'Voice recognition'
      ]
    },
    {
      version: '1.0.5',
      date: '2024-12-20',
      type: 'bugfix',
      changes: [
        'Fixed API key validation issues',
        'Resolved theme switching problems',
        'Corrected skill mapping edge cases',
        'Improved error handling across all components',
        'Fixed portfolio export functionality'
      ]
    },
    {
      version: '1.0.0',
      date: '2024-12-01',
      type: 'major',
      changes: [
        'Initial release of NAVI Gaming Career Assistant',
        'AI-powered resume builder with gaming industry templates',
        'Portfolio generator with project showcasing',
        'Basic skill mapping functionality',
        'Job search integration with gaming companies',
        'User profile and progress tracking'
      ],
      highlights: [
        'Initial public release',
        'Core AI features'
      ],
      breaking: true
    }
  ];

  private upcomingFeatures: UpcomingFeature[] = [
    {
      title: 'Advanced Analytics Dashboard',
      description: 'Comprehensive analytics with career progression insights and portfolio performance tracking',
      status: 'in-development',
      estimatedRelease: 'Q2 2025'
    },
    {
      title: 'Team Collaboration Features',
      description: 'Share portfolios and collaborate on projects with teammates in real-time',
      status: 'planned',
      estimatedRelease: 'Q2 2025'
    },
    {
      title: 'Gaming Platform Integration',
      description: 'Direct integration with Steam, Discord, Epic Games Store, and other gaming platforms',
      status: 'testing',
      estimatedRelease: 'Q1 2025'
    },
    {
      title: 'AI-Powered Interview Simulator',
      description: 'Practice interviews with AI personas from different game studios',
      status: 'in-development',
      estimatedRelease: 'Q1 2025'
    },
    {
      title: 'Advanced Resume Parsing',
      description: 'Upload existing resumes and automatically extract structured data with AI',
      status: 'completed',
      estimatedRelease: 'Available Now'
    },
    {
      title: 'Market Insights & Salary Analysis',
      description: 'Real-time job market analytics and salary benchmarking for gaming roles',
      status: 'completed',
      estimatedRelease: 'Available Now'
    },
    {
      title: 'Custom Template Builder',
      description: 'Create personalized resume and portfolio templates with advanced customization',
      status: 'completed',
      estimatedRelease: 'Available Now'
    },
    {
      title: 'Version Control & History',
      description: 'Track changes and compare different versions of your documents',
      status: 'completed',
      estimatedRelease: 'Available Now'
    },
    {
      title: 'Multi-Provider AI Integration',
      description: 'Support for OpenAI, Claude, Gemini, and Grok AI models',
      status: 'completed',
      estimatedRelease: 'Available Now'
    },
    {
      title: 'Blockchain Portfolio Verification',
      description: 'Immutable verification of achievements and work history on blockchain',
      status: 'planned',
      estimatedRelease: 'Q3 2025'
    },
    {
      title: 'VR/AR Portfolio Showcase',
      description: 'Present your portfolio in immersive VR environments for gaming companies',
      status: 'planned',
      estimatedRelease: 'Q4 2025'
    },
    {
      title: 'Mobile Application',
      description: 'Native mobile app for iOS and Android with full feature parity',
      status: 'planned',
      estimatedRelease: 'Q4 2025'
    }
  ];

  /**
   * Shows the changelog modal
   */
  showChangelog(): void {
    const content = this.generateChangelogHTML();
    
    createModal({
      title: '📋 Changelog & Updates',
      content,
      size: 'lg',
      buttons: [
        {
          text: 'Close',
          type: 'secondary',
          onclick: 'this.closest(\'.modal\').remove()'
        },
        {
          text: 'View on GitHub',
          type: 'primary',
          href: 'https://github.com/anthropics/claude-code',
          target: '_blank',
          onclick: 'this.closest(\'.modal\').remove()'
        }
      ]
    });
  }

  /**
   * Generates the changelog HTML content
   */
  private generateChangelogHTML(): string {
    const currentVersion = this.getCurrentVersion();
    const recentChanges = this.changelog.slice(0, 5); // Show last 5 versions

    let html = `
      <div class="changelog-modal">
        <div class="current-version-banner p-3 mb-4 bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded">
          <div class="d-flex align-items-center">
            <div class="version-badge-large me-3">
              <span class="badge bg-primary fs-6">v${currentVersion.version}</span>
            </div>
            <div>
              <h6 class="mb-1">Current Version</h6>
              <p class="mb-0 text-muted">Released ${currentVersion.date}</p>
            </div>
          </div>
        </div>

        <div class="changelog-content">
          <h5 class="mb-3">📈 Recent Updates</h5>
          <div class="changelog-list">
    `;

    recentChanges.forEach(entry => {
      const typeIcon = this.getTypeIcon(entry.type);
      const typeColor = this.getTypeColor(entry.type);

      html += `
        <div class="changelog-entry mb-4 p-3 border rounded">
          <div class="changelog-header d-flex align-items-center mb-2">
            <span class="version-badge me-2 badge ${typeColor}">${typeIcon} v${entry.version}</span>
            <small class="text-muted">${entry.date}</small>
            ${entry.breaking ? '<span class="badge bg-warning ms-2">Breaking Changes</span>' : ''}
          </div>
          
          ${entry.highlights ? `
          <div class="highlights mb-2">
            ${entry.highlights.map(highlight => `
              <span class="badge bg-success bg-opacity-10 text-success me-1 mb-1">[MAGIC] ${highlight}</span>
            `).join('')}
          </div>
          ` : ''}

          <ul class="changes-list mb-0">
            ${entry.changes.map(change => `<li>${change}</li>`).join('')}
          </ul>
        </div>
      `;
    });

    html += `
          </div>
        </div>

        <div class="upcoming-features mt-4">
          <h5 class="mb-3">🔮 Coming Soon</h5>
          <div class="features-grid">
            ${this.upcomingFeatures.slice(0, 4).map(feature => `
              <div class="feature-card p-3 border rounded mb-3">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h6 class="mb-0">${feature.title}</h6>
                  <span class="badge ${this.getStatusColor(feature.status)}">${this.getStatusLabel(feature.status)}</span>
                </div>
                <p class="text-muted small mb-1">${feature.description}</p>
                ${feature.estimatedRelease ? `<small class="text-primary">Est. ${feature.estimatedRelease}</small>` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <div class="changelog-footer mt-4 p-3 bg-light rounded">
          <div class="row align-items-center">
            <div class="col">
              <h6 class="mb-1">Stay Updated</h6>
              <p class="mb-0 text-muted small">Follow our development progress and get notified about new releases.</p>
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

  /**
   * Gets the current version info
   */
  getCurrentVersion(): ChangelogEntry {
    return this.changelog[0];
  }

  /**
   * Gets all changelog entries
   */
  getAllChanges(): ChangelogEntry[] {
    return [...this.changelog];
  }

  /**
   * Gets changes since a specific version
   */
  getChangesSince(version: string): ChangelogEntry[] {
    const index = this.changelog.findIndex(entry => entry.version === version);
    return index >= 0 ? this.changelog.slice(0, index) : [];
  }

  /**
   * Checks if there are new changes since user's last seen version
   */
  hasNewChanges(lastSeenVersion?: string): boolean {
    if (!lastSeenVersion) return true;
    return this.getChangesSince(lastSeenVersion).length > 0;
  }

  /**
   * Gets type icon for changelog entries
   */
  private getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      major: '🚀',
      minor: '✨',
      patch: '🔧',
      feature: '🎉',
      improvement: '⚡',
      bugfix: '🐛'
    };
    return icons[type] || '📝';
  }

  /**
   * Gets type color for badges
   */
  private getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      major: 'bg-danger',
      minor: 'bg-primary',
      patch: 'bg-info',
      feature: 'bg-success',
      improvement: 'bg-warning',
      bugfix: 'bg-secondary'
    };
    return colors[type] || 'bg-light';
  }

  /**
   * Gets status color for upcoming features
   */
  private getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      planned: 'bg-secondary',
      'in-development': 'bg-warning',
      testing: 'bg-info'
    };
    return colors[status] || 'bg-light';
  }

  /**
   * Gets status label for upcoming features
   */
  private getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      planned: 'Planned',
      'in-development': 'In Development',
      testing: 'Testing'
    };
    return labels[status] || status;
  }
}

// Export singleton instance
export const changelogService = new ChangelogService();
export default changelogService;
