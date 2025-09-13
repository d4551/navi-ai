
import { createModal } from "../utils/modalUtils";
import { useToast } from "@/composables/useToast";

export interface ShareContent {
  title: string;
  text: string;
  url?: string;
  hashtags?: string[];
}

export interface ShareOptions {
  platforms?: ("linkedin" | "twitter" | "email" | "clipboard" | "qr")[];
  customMessage?: string;
  preview?: {
    title: string;
    subtitle?: string;
    description?: string;
  };
}

class SharingService {
  private toast = useToast();

  async share(
    content: ShareContent,
    options: ShareOptions = {},
  ): Promise<void> {
    const shareUrl = content.url || window.location.href;
    const shareText = content.text;

    // Try native sharing first (mobile devices)
    if (navigator.share) {
      try {
        await navigator.share({
          title: content.title,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (error: any) {
        if (error.name === "AbortError") return; // User cancelled
        // Fall through to enhanced sharing modal
      }
    }

    // Show enhanced sharing modal
    this.showSharingModal(content, shareUrl, options);
  }

  private showSharingModal(
    content: ShareContent,
    shareUrl: string,
    options: ShareOptions,
  ): void {
    const platforms = options.platforms || [
      "clipboard",
      "linkedin",
      "twitter",
      "email",
    ];
    const preview = options.preview || { title: content.title };

    const modalContent = `
      <div class="share-modal">
          ${preview.description ? `<small class="text-muted">${preview.description}</small>` : ""}
        </div>
        <div class="share-options">
          ${this.generatePlatformButtons(platforms)}
        </div>
      </div>
    `;

    const modal = createModal({
      title: "Share Content",
      content: modalContent,
      size: "md",
      buttons: [
        {
          text: "Close",
          type: "secondary",
          onclick: "this.closest('.modal').remove()",
        },
      ],
    });

    this.attachSharingHandlers(content, shareUrl, modal);
  }

  private generatePlatformButtons(platforms: string[]): string {
    const buttons: Record<
      string,
      { label: string; icon: string; class: string }
    > = {
      clipboard: {
        label: "Copy Link",
        icon: "mdi-clipboard",
      },
      linkedin: {
        label: "LinkedIn",
        icon: "mdi-linkedin",
        class: "btn-outline-primary",
      },
      twitter: {
        label: "Twitter",
        icon: "mdi-twitter",
        class: "btn-outline-info",
      },
      email: {
        label: "Email",
        icon: "mdi-email",
        class: "btn-outline-success",
      },
      qr: {
        label: "QR Code",
        icon: "mdi-qrcode",
        class: "btn-outline-secondary",
      },
    };

    let html = "";

    // Primary button (usually clipboard)
    const primaryPlatforms = platforms.filter((p) => ["clipboard"].includes(p));
    primaryPlatforms.forEach((platform) => {
      const btn = buttons[platform];
      if (btn) {
        html += `
          </button>
        `;
      }
    });

    // Secondary buttons in grid
    const secondaryPlatforms = platforms.filter(
      (p) => !["clipboard"].includes(p),
    );

      secondaryPlatforms.forEach((platform) => {
        const btn = buttons[platform];
        if (btn) {
          html += `
            <div class="col-${cols}">
              </button>
            </div>
          `;
        }
      });

      html += `</div>`;
    }

    return html;
  }

  private attachSharingHandlers(
    content: ShareContent,
    shareUrl: string,
    modal: HTMLElement,
  ): void {
    const shareMessage = `${content.text}\\n\\n${shareUrl}`;
    const hashtags = content.hashtags ? content.hashtags.join(",") : "";

    // Clipboard sharing
    (window as any).shareToClipboard = () => {
      navigator.clipboard
        .writeText(shareMessage)
        .then(() => {
          this.toast.success("Link copied to clipboard!");
          modal.remove();
        })
        .catch(() => {
          this.toast.error("Failed to copy to clipboard");
        });
    };

    // LinkedIn sharing
    (window as any).shareToLinkedin = () => {
      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(content.text)}`;
      window.open(linkedInUrl, "_blank");
      modal.remove();
    };

    // Twitter sharing
    (window as any).shareToTwitter = () => {
      let twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(content.text)}&url=${encodeURIComponent(shareUrl)}`;
      if (hashtags) {
        twitterUrl += `&hashtags=${hashtags}`;
      }
      window.open(twitterUrl, "_blank");
      modal.remove();
    };

    // Email sharing
    (window as any).shareToEmail = () => {
      const subject = encodeURIComponent(content.title);
      const body = encodeURIComponent(
        `${content.text}\\n\\nCheck it out: ${shareUrl}`,
      );
      const emailUrl = `mailto:?subject=${subject}&body=${body}`;
      window.location.href = emailUrl;
      modal.remove();
    };

    // QR Code generation
    (window as any).shareToQr = () => {
      this.generateQRCode(shareUrl, content.title);
      modal.remove();
    };
  }

  private generateQRCode(url: string, title: string): void {

    createModal({
      title: "QR Code",
      content: `
        <div class="text-center">
          <p class="small text-muted">Scan to access: ${title}</p>
          <button class="btn btn-primary btn-sm" onclick="window.open('${qrUrl}', '_blank')">
            Download QR Code
          </button>
        </div>
      `,
      size: "sm",
    });
  }

  async shareInterviewResults(
    score: number,
    totalQuestions: number,
  ): Promise<void> {
    await this.share(
      {
        title: "My Gaming Interview Results",
        text: `[GAME] I scored ${score}% in my gaming industry mock interview! ${totalQuestions} questions completed. Practicing for my dream gaming career with NAVI.`,
        hashtags: ["gaming", "career", "interview", "gamedev"],
      },
      {
        preview: {
          title: "[STATS] Interview Results",
          subtitle: `Score: ${score}% (${totalQuestions} questions)`,
          description: "Powered by NAVI Gaming Career Assistant",
        },
      },
    );
  }

  async sharePortfolio(name: string, projectCount: number): Promise<void> {
    await this.share(
      {
        title: `${name}'s Gaming Portfolio`,
        text: `[GAME] Check out my gaming portfolio! ${projectCount} featured projects showcasing my skills in the gaming industry.`,
        hashtags: ["gaming", "portfolio", "gamedev", "showcase"],
      },
      {
        platforms: ["clipboard", "linkedin", "twitter", "email", "qr"],
        preview: {
          title: `[GAME] ${name}'s Portfolio`,
          subtitle: `${projectCount} featured projects`,
          description: "Professional gaming portfolio powered by NAVI",
        },
      },
    );
  }

  async shareResume(name: string, role: string): Promise<void> {
    await this.share(
      {
        title: `${name} - ${role} Resume`,
        text: `Check out my gaming industry resume for ${role} positions. Built with NAVI Career Assistant.`,
        hashtags: [
          "resume",
          "gaming",
          "career",
          role.toLowerCase().replace(/\s+/g, ""),
        ],
      },
      {
        preview: {
          subtitle: role,
          description: "Gaming industry resume built with NAVI",
        },
      },
    );
  }

  async shareAchievement(
    achievement: string,
    description: string,
  ): Promise<void> {
    await this.share(
      {
        title: "Gaming Career Achievement",
        hashtags: ["gaming", "achievement", "career", "milestone"],
      },
      {
        preview: {
          title: "[TROPHY] New Achievement",
          subtitle: achievement,
          description: description,
        },
      },
    );
  }
}

// Export singleton instance
export const sharingService = new SharingService();
export default sharingService;
