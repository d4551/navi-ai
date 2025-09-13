import type {
  PortfolioItem,
  PortfolioFilters,
  PortfolioStats,
  PortfolioExportData,
  PortfolioExportOptions,
  PortfolioItemType,
} from "../types/portfolio";
import { aiService } from "./AIService";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export class PortfolioService {
  static parseItemDate(dateStr: string): Date | null {
    if (!dateStr) return null;

    // Handle "Month YYYY" format
    if (monthYearMatch) {
      const dateTime = Date.parse(
      );
      return isNaN(dateTime) ? null : new Date(dateTime);
    }

    // Fallback to standard Date.parse
    const timestamp = Date.parse(dateStr);
    return isNaN(timestamp) ? null : new Date(timestamp);
  }

  static async exportOnePagersPDF(
    user: { name?: string; email?: string },
    items: PortfolioItem[],
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);


    const drawWrappedText = (
      page: any,
      text: string,
      x: number,
      yStart: number,
      maxWidth: number,
    ) => {
      const words = text.split(/\s+/);
      let line = "";
      let y = yStart;
      for (const w of words) {
        const test = line ? line + " " + w : w;
        if (width > maxWidth) {
          page.drawText(line, {
            x,
            y,
            font,
          });
          line = w;
          y -= lineHeight;
        } else {
          line = test;
        }
      }
      if (line) {
        page.drawText(line, {
          x,
          y,
          font,
        });
        y -= lineHeight;
      }
      return y;
    };

    for (const item of items) {
      const page = pdf.addPage();
      const { width, height } = page.getSize();

      // Header
      const title = `${item.title || "Project"}${item.date ? " — " + item.date : ""}`;
      page.drawText(title, {
        x: margin,
        y: height - margin,
        font,
      });
      if (user?.name || user?.email) {
        page.drawText(
          `${user?.name || ""} ${user?.email ? "<" + user.email + ">" : ""}`.trim(),
        );
      }

      // Sections
      const addSection = (heading: string) => {
        page.drawText(heading, {
          x: margin,
          y: cursor,
          font,
        });
      };

      if (item.description) {
        addSection("Summary");
        cursor = drawWrappedText(
          page,
          String(item.description),
          margin,
          cursor,
          contentWidth,
        );
      }

      const listSection = (heading: string, arr?: string[]) => {
        if (!arr || !arr.length) return;
        addSection(heading);
        for (const entry of arr) {
          const bullet = "• " + String(entry);
          cursor = drawWrappedText(page, bullet, margin, cursor, contentWidth);
        }
      };

      listSection("Responsibilities", (item as any).responsibilities);
      listSection("Outcomes / Impact", (item as any).outcomes);
      if ((item as any).skills?.length) {
        addSection("Skills");
        cursor = drawWrappedText(
          page,
          (item as any).skills.join(", "),
          margin,
          cursor,
          contentWidth,
        );
      }

      // Footer (links)
      if ((item as any).links?.length) {
        addSection("Links");
          cursor = drawWrappedText(
            page,
            `${l.label || l.type || "Link"}: ${l.url}`,
            margin,
            cursor,
            contentWidth,
          );
        }
      }
    }
    return await pdf.save();
  }

  static detectPlatform(
    url: string,
  ): "steam" | "itch" | "youtube" | "github" | "other" {
    const u = (url || "").toLowerCase();
    if (u.includes("store.steampowered.com/app/")) return "steam";
    if (u.includes("itch.io")) return "itch";
    if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
    if (u.includes("github.com")) return "github";
    return "other";
  }

  static parseYouTubeId(url: string): string | null {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtu.be")) {
      }
      if (u.hostname.includes("youtube.com")) {
        const id = u.searchParams.get("v");
        if (id) return id;
        // Handle /embed/ID
        const m = u.pathname.match(/\/embed\/([\w-]+)/);
      }
    } catch {}
    return null;
  }

  static getYouTubeThumb(id: string): string {
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }

  static parseSteamAppId(url: string): string | null {
    try {
      const u = new URL(url);
      const m = u.pathname.match(/\/app\/(\d+)/);
    } catch {
      return null;
    }
  }

  static async fetchSteamAppDetails(
    appId: string,
  ): Promise<{
    title?: string;
    description?: string;
    image?: string;
    site?: string;
  }> {
    try {
      const resp = await fetch(
        `https://store.steampowered.com/api/appdetails?appids=${encodeURIComponent(appId)}`,
      );
      const json = await resp.json();
      const entry = json?.[appId];
      const data = entry?.data;
      if (!entry?.success || !data) return {};
      const title = data.name;
      const description = (data.short_description || "").toString();
      const image = data.header_image;
      return { title, description, image, site: "Steam" };
    } catch {
      return {};
    }
  }

  static async fetchLinkMetadata(
    url: string,
  ): Promise<{
    title?: string;
    description?: string;
    image?: string;
    site?: string;
  }> {
    try {
      const resp = await fetch(url, { method: "GET" });
      const html = await resp.text();
      const og = (prop: string) => {
        const re = new RegExp(
          `<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`,
          "i",
        );
        const m = html.match(re);
      };
      const title =
      const description = og("og:description");
      const image = og("og:image");
      const site = og("og:site_name");
      // Fallback for YouTube thumbnails when OG blocked
      if (!image && this.detectPlatform(url) === "youtube") {
        const id = this.parseYouTubeId(url);
        if (id) {
          return {
            title,
            description,
            image: this.getYouTubeThumb(id),
            site: site || "YouTube",
          };
        }
      }
      return { title, description, image, site };
    } catch {
      return {};
    }
  }

  static roleTemplates: Record<
    string,
    { responsibilities: string[]; outcomes: string[]; skills: string[] }
  > = {
    Programmer: {
      responsibilities: [
        "Implemented gameplay systems and mechanics",
        "Optimized performance and memory usage",
        "Built tooling and pipelines for designers and artists",
        "Integrated platform services (Steamworks, PSN, Xbox Live)",
      ],
      outcomes: [
        "Shipped two content updates with zero regressions",
      ],
      skills: [
        "C++",
        "Unity",
        "Unreal Engine",
        "Profiling",
        "Optimization",
      ],
    },
    Designer: {
      responsibilities: [
        "Designed levels, systems, and progression loops",
        "Authored gameplay specs and balanced economies",
        "Iterated using telemetry and playtest feedback",
      ],
      outcomes: [
      ],
      skills: ["Systems Design", "Level Design", "Scripting", "Balancing"],
    },
    Artist: {
      responsibilities: [
        "Created production-ready art assets",
        "Established style guides and pipelines",
        "Optimized textures and materials",
      ],
      outcomes: [
        "Achieved target memory budgets",
        "Delivered asset packs on schedule",
      ],
      skills: ["Photoshop", "Blender/Maya", "Substance", "PBR"],
    },
    Audio: {
      responsibilities: [
        "Composed adaptive music",
        "Designed SFX",
        "Integrated audio middleware (Wwise/FMOD)",
      ],
      outcomes: [
        "Shipped reactive music system",
      ],
      skills: ["Wwise", "FMOD", "Mixing", "Implementation"],
    },
    Producer: {
      responsibilities: [
        "Coordinated cross-discipline schedules",
        "Managed sprint planning and risk tracking",
        "Facilitated playtests and triage",
      ],
      outcomes: [
        "Delivered milestones on time",
      ],
      skills: ["Agile", "Scheduling", "Communication"],
    },
  };

  static engineTemplates: Record<
    string,
    { responsibilities?: string[]; outcomes?: string[]; skills?: string[] }
  > = {
    Unity: {
      responsibilities: [
        "Implemented ScriptableObject-driven content",
        "Optimized GC allocations and draw calls",
      ],
      outcomes: [
        "Stabilized frame pacing on mid-tier devices",
      ],
    },
    "Unreal Engine": {
      responsibilities: [
        "Developed gameplay in C++ and Blueprints",
        "Created tooling/editor utilities",
        "Optimized replication/netcode",
      ],
      outcomes: [
        "Shipped networked feature with deterministic behavior",
      ],
      skills: ["C++", "Blueprints", "Replication", "Niagara"],
    },
  };

  static prepareStaticSite(
    user: { name?: string; email?: string },
    items: PortfolioItem[],
  ): string {
    const escape = (s: string = "") =>
      s.replace(
        /[&<>]/g,
        (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!,
      );
    const cards = items
      .map(
        (i) => `
      <article class="card">
        <p class="meta">${escape(i.type || "")}${i.date ? " • " + escape(i.date) : ""}</p>
        ${i.image ? `<img src="${escape(i.image)}" alt="${escape(i.title)}"/>` : ""}
        ${i.description ? `<p>${escape(i.description)}</p>` : ""}
        ${
          i.skills?.length
            ? `<div class="tags">${i.skills
                .map((s) => `<span>${escape(s)}</span>`)
                .join("")}</div>`
            : ""
        }
      </article>
    `,
      )
      .join("\n");
    return `<!doctype html>
<html lang="en">
<head>
  <title>${escape(user.name || "Portfolio")}</title>
  <style>
  </style>
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  </head>
<body>
  <header>
    ${user.email ? `<div class="subtitle">${escape(user.email)}</div>` : ""}
  </header>
  <main>${cards}</main>
</body>
</html>`;
  }

  static prepareOnePager(
    item: PortfolioItem,
    user: { name: string; email?: string },
  ): string {
    const lines: string[] = [];
    lines.push("");
    lines.push(`Author: ${user.name}${user.email ? ` <${user.email}>` : ""}`);
    if (item.role) lines.push(`Role: ${item.role}`);
    if (item.engines?.length) lines.push(`Engines: ${item.engines.join(", ")}`);
    if (item.platforms?.length)
      lines.push(`Platforms: ${item.platforms.join(", ")}`);
    lines.push("");
    if (item.description) {
      lines.push(item.description);
      lines.push("");
    }
    if (item.responsibilities?.length) {
      item.responsibilities.forEach((r) => lines.push(`- ${r}`));
      lines.push("");
    }
    if (item.outcomes?.length) {
      item.outcomes.forEach((o) => lines.push(`- ${o}`));
      lines.push("");
    }
    if (item.skills?.length) {
      lines.push(item.skills.join(", "));
      lines.push("");
    }
    if (item.links?.length) {
      item.links.forEach((l) =>
        lines.push(`- [${l.label || l.type || "Link"}](${l.url})`),
      );
      lines.push("");
    }
    return lines.join("\n");
  }

  static filterItems(
    items: PortfolioItem[],
    filters: Partial<PortfolioFilters>,
  ): PortfolioItem[] {
    let filtered = [...items];

    // Featured filter
    if (filters.showFeaturedOnly) {
      filtered = filtered.filter((item) => item.featured);
    }

    // Type filter
    if (filters.type && filters.type !== "all") {
      filtered = filtered.filter((item) => item.type === filters.type);
    }

    // Skill filters
    if (filters.skillFilters?.length) {
      filtered = filtered.filter((item) =>
        filters.skillFilters!.every((skill) =>
          (item.skills || []).includes(skill),
        ),
      );
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
      const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

      filtered = filtered.filter((item) => {
        const itemDate = this.parseItemDate(item.date);
        if (!itemDate) return true;

        if (fromDate && itemDate < fromDate) return false;
        if (toDate) {
          const endOfMonth = new Date(
            toDate.getFullYear(),
          );
          if (itemDate > endOfMonth) return false;
        }
        return true;
      });
    }

    // Search query filter
    if (filters.searchQuery?.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.game?.toLowerCase().includes(query) ||
          (item.skills || []).some((skill) =>
            skill.toLowerCase().includes(query),
          ),
      );
    }

    return filtered;
  }

  static sortItems(
    items: PortfolioItem[],
    sortMode: string = "recent",
  ): PortfolioItem[] {
    const sorted = [...items];

    switch (sortMode) {
      case "alphabetical":
        return sorted.sort((a, b) =>
          (a.title || "").localeCompare(b.title || ""),
        );

      case "type":
        return sorted.sort((a, b) => {
          const typeCompare = (a.type || "").localeCompare(b.type || "");
            ? typeCompare
            : (a.title || "").localeCompare(b.title || "");
        });

      case "featured":
        return sorted.sort((a, b) => {
          return (
          );
        });

      case "recent":
      default:
        return sorted.sort((a, b) => {
          return dateB - dateA;
        });
    }
  }

  static generateStats(items: PortfolioItem[]): PortfolioStats {
    const skillCounts = new Map<string, number>();
    const typeCounts: Record<string, number> = {};
    const games = new Set<string>();

    items.forEach((item) => {
      // Count skills
      (item.skills || []).forEach((skill) => {
      });

      // Count types
      if (item.type) {
      }

      // Track games
      if (item.game) {
        games.add(item.game);
      }
    });

    const topSkills = Array.from(skillCounts.entries())
      .map(([skill, count]) => ({ skill, count }));


    const featuredCount = items.filter((item) => item.featured).length;
    const totalProjects = items.filter(
      (item) => item.type === "project",
    ).length;
    const totalClips = items.filter((item) => item.type === "clip").length;
    const totalAchievements = items.filter(
      (item) => item.type === "achievement",
    ).length;

    return {
      totalItems: items.length,
      featuredItems: featuredCount,
      skillsCount: skillCounts.size,
      gamesCount: games.size,
      typeBreakdown: typeCounts as Record<PortfolioItemType, number>,
      topSkills,
      recentActivity,
      // Template compatibility properties
      totalProjects,
      totalClips,
      totalAchievements,
      featuredCount,
      recentItemsCount: recentActivity.length,
      completionRate:
      itemsByType: typeCounts,
    };
  }

  static validateItem(item: Partial<PortfolioItem>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!item.title?.trim()) {
      errors.push("Title is required");
    }

    if (!item.description?.trim()) {
      errors.push("Description is required");
    }

    if (!item.type) {
      errors.push("Type is required");
    }

    if (!item.date?.trim()) {
      errors.push("Date is required");
    } else if (!this.parseItemDate(item.date)) {
      errors.push("Invalid date format");
    }

    if (item.url && !this.isValidUrl(item.url)) {
      errors.push("Invalid URL format");
    }

    return {
      errors,
    };
  }

  static prepareExportData(
    items: PortfolioItem[],
    user: { name: string; email?: string },
    options: PortfolioExportOptions,
  ): PortfolioExportData {
    let portfolioItems = [...items];

    if (options.includeFeaturedOnly) {
      portfolioItems = portfolioItems.filter((item) => item.featured);
    }

    return {
      user,
      portfolio: portfolioItems,
      stats: this.generateStats(portfolioItems),
      exportedAt: new Date().toISOString(),
      settings: {
        layout: "grid",
        showAnalytics: options.includeAnalytics ?? true,
        autoSave: true,
      },
    };
  }

  static generateId(): string {
  }

  static createItem(data: Partial<PortfolioItem>): PortfolioItem {
    const now = new Date().toISOString();

    return {
      id: this.generateId(),
      title: data.title || "",
      description: data.description || "",
      type: data.type || "achievement",
      game: data.game || "",
      skills: data.skills || [],
      date:
        data.date ||
        new Date().toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
      featured: data.featured || false,
      url: data.url,
      thumbnail: data.thumbnail,
      metrics: data.metrics,
      createdAt: now,
      updatedAt: now,
      ...data,
    };
  }

  static reorderItems(
    items: PortfolioItem[],
    fromIndex: number,
    toIndex: number,
  ): PortfolioItem[] {
    const reordered = [...items];
    return reordered;
  }

  static extractCommonSkills(items: PortfolioItem[]): string[] {
    const skillCounts = new Map<string, number>();

    items.forEach((item) => {
      (item.skills || []).forEach((skill) => {
      });
    });

    return Array.from(skillCounts.entries())
      .map(([skill]) => skill)
  }

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static async generateAIRecommendations(
    userProfile: any,
    currentPortfolio: PortfolioItem[],
    targetRole?: string,
  ): Promise<{
    suggestions: Array<{
      type: PortfolioItemType;
      title: string;
      description: string;
      skills: string[];
      reasoning: string;
    }>;
    improvements: Array<{
      itemId?: string;
      suggestion: string;
      priority: "high" | "medium" | "low";
    }>;
    missingElements: string[];
  }> {
    try {
      // Initialize AI service if needed
      await aiService.initialize({
        primaryProvider: "google",
        enableContextPersistence: true,
        enableRealTime: false,
      });

      const contextInfo = `USER PROFILE:

CURRENT PORTFOLIO:

TARGET ROLE: ${targetRole || "Gaming Industry Professional"}

Analyze the user's gaming background and current portfolio to suggest improvements and new portfolio items that would strengthen their application for gaming industry roles.`;

      const response = await aiService.chat({
        message: `Analyze this gaming professional's portfolio and suggest improvements and new items that would showcase their gaming skills for ${targetRole || "industry"} roles.`,
        context: contextInfo,
        type: "analysis",
      });

      // Parse AI response into structured recommendations
      return this.parseAIRecommendations(response.content);
    } catch (_error) {
      console.error("Failed to generate AI portfolio recommendations:", error);
      return this.getFallbackRecommendations(currentPortfolio, targetRole);
    }
  }

  private static parseAIRecommendations(aiResponse: string): any {
    try {
      // Try to parse as JSON first
      return JSON.parse(aiResponse);
    } catch {
      // Fallback: extract recommendations from text
      const lines = aiResponse.split("\n").filter((line) => line.trim());

      const suggestions = [];
      const improvements = [];
      const missingElements = [];

      let currentSection = "";

      for (const line of lines) {
        if (
          line.toLowerCase().includes("suggest") ||
          line.toLowerCase().includes("add")
        ) {
          currentSection = "suggestions";
        } else if (
          line.toLowerCase().includes("improve") ||
          line.toLowerCase().includes("enhance")
        ) {
          currentSection = "improvements";
        } else if (
          line.toLowerCase().includes("missing") ||
          line.toLowerCase().includes("lack")
        ) {
          currentSection = "missing";
        }


          switch (currentSection) {
            case "suggestions":
              suggestions.push({
                type: "project",
                description: trimmed,
                skills: ["Gaming", "Leadership"],
                reasoning: "AI suggested based on profile analysis",
              });
              break;
            case "improvements":
              improvements.push({
                suggestion: trimmed,
                priority: "medium",
              });
              break;
            case "missing":
              missingElements.push(trimmed);
              break;
          }
        }
      }

      return { suggestions, improvements, missingElements };
    }
  }

  private static getFallbackRecommendations(
    currentPortfolio: PortfolioItem[],
    targetRole?: string,
  ): any {
    const hasProjects = currentPortfolio.some(
      (item) => item.type === "project",
    );
    const hasAchievements = currentPortfolio.some(
      (item) => item.type === "achievement",
    );
    const hasLeadership = currentPortfolio.some(
      (item) =>
        item.description?.toLowerCase().includes("lead") ||
        item.description?.toLowerCase().includes("manage"),
    );

    const suggestions = [];
    const improvements = [];
    const missingElements = [];

    if (!hasProjects) {
      suggestions.push({
        type: "project",
        title: "Gaming Community Project",
        description:
          "Document a community building or moderation project that showcases leadership skills",
        skills: ["Community Management", "Leadership", "Communication"],
        reasoning: "Projects demonstrate practical application of skills",
      });
    }

    if (!hasAchievements) {
      suggestions.push({
        type: "achievement",
        title: "Competitive Gaming Achievement",
        description:
          "Highlight your highest rank or tournament placement in competitive gaming",
        skills: [
          "Competitive Gaming",
          "Performance Under Pressure",
          "Strategic Thinking",
        ],
        reasoning: "Achievements show concrete results and dedication",
      });
    }

    if (!hasLeadership) {
      improvements.push({
        suggestion:
          "Add examples of leadership or team coordination from gaming experiences",
        priority: "high",
      });
    }

      missingElements.push(
        "Portfolio needs more items to demonstrate range of experience",
      );
    }

    return { suggestions, improvements, missingElements };
  }

  static async enhanceItemDescription(
    item: Partial<PortfolioItem>,
    userProfile: any,
    targetRole?: string,
  ): Promise<string> {
    try {
      await aiService.initialize({
        primaryProvider: "google",
        enableContextPersistence: true,
        enableRealTime: false,
      });

      const contextInfo = `PORTFOLIO ITEM:
Title: ${item.title}
Current Description: ${item.description}
Type: ${item.type}
Game: ${item.game}
Skills: ${item.skills?.join(", ")}

USER PROFILE: ${JSON.stringify(userProfile)}
TARGET ROLE: ${targetRole || "Gaming Professional"}

Enhance this portfolio item description to better showcase transferable skills and gaming industry relevance.`;

      const response = await aiService.chat({
        message: `Rewrite this portfolio item description to be more compelling and highlight transferable skills for ${targetRole || "gaming industry"} roles. Focus on impact, skills, and professional growth.`,
        context: contextInfo,
        type: "generation",
      });

      return response.content || item.description || "";
    } catch (_error) {
      console.error("Failed to enhance item description:", error);
      return item.description || "";
    }
  }
}
