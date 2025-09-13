
import { BaseJobProvider, type JobFilters } from "./JobProviderInterface";
import type { Job } from "@/shared/types/jobs";

export class HitmarkerProvider extends BaseJobProvider {
  name = "hitmarker";
  displayName = "Hitmarker";
  description = "Esports and gaming industry recruitment platform";
  enabled = false;
  // Favor gaming sources earlier within the registry window when enabled
  requiresAuth = false;
  baseUrl = "https://hitmarker.net";

  config = {
    categories: ["gaming", "esports", "streaming", "content"],
    regions: ["global"],
    icon: "mdi-bullseye",
  };

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      q: filters.title || "game developer",
      location: filters.location || "",
      remote: filters.remote || false,
    };
  }

  parseResponse(_data: any): Job[] {
    // Since this is a mock provider for demo purposes, return empty array
    // In a real implementation, this would parse the API response
    return [];
  }

  async fetchJobs(filters: JobFilters): Promise<Job[]> {
    // Generate mock gaming jobs for demonstration
      title: `${filters.title || "Esports"} Manager`,
      ],
      location: [
        "Los Angeles, CA",
        "London, UK",
        "Berlin, DE",
        "Tokyo, JP",
        "Seoul, KR",
      type: "full-time" as const,
      description:
        "Join our professional esports team and help shape the future of competitive gaming...",
      tags: ["esports", "gaming", "tournament", "streaming"],
      postedDate: new Date(
      ),
      source: "Hitmarker",
    }));

    return esportsJobs
      .filter((job) => this.matchesFilters(job, filters))
  }

  private matchesFilters(job: any, filters: JobFilters): boolean {
    if (filters.title) {
      const searchText =
        `${job.title} ${job.company} ${job.description}`.toLowerCase();
      if (!searchText.includes(filters.title.toLowerCase())) {
        return false;
      }
    }

    if (
      filters.location &&
      !job.location.toLowerCase().includes(filters.location.toLowerCase())
    ) {
      return false;
    }

    if (filters.remote !== undefined && job.remote !== filters.remote) {
      return false;
    }

    return true;
  }
}

export class GameDevNetProvider extends BaseJobProvider {
  name = "gamedevnet";
  displayName = "GameDev.net Jobs";
  description = "Game development community job board";
  enabled = false;
  requiresAuth = false;
  baseUrl = "https://gamedev.net";

  config = {
    categories: ["game-development", "programming", "art", "design"],
    regions: ["global"],
    icon: "mdi-controller-classic",
  };

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      q: filters.title || "game developer",
      location: filters.location || "",
      remote: filters.remote || false,
    };
  }

  parseResponse(_data: any): Job[] {
    // Mock implementation - in real world this would parse API response
    return [];
  }

  async fetchJobs(filters: JobFilters): Promise<Job[]> {
    const gameDevJobs = [
      {
        title: `${filters.title || "Unity"} Game Developer`,
        company: "Pixel Perfect Studios",
        location: "Remote",
        type: "full-time" as const,
        remote: true,
        description:
          "Join our indie game development team creating innovative mobile games.",
        url: "https://gamedev.net/jobs/unity-developer",
        postedDate: new Date(),
        source: this.displayName,
      },
      {
        title: "Technical Artist",
        company: "NextGen Gaming",
        location: "San Francisco, CA",
        type: "full-time" as const,
        remote: true,
        description:
          "Bridge the gap between art and technology in our AAA game production.",
        url: "https://gamedev.net/jobs/technical-artist",
        tags: ["Technical Art", "Maya", "Scripting", "AAA"],
        postedDate: new Date(),
        source: this.displayName,
      },
    ];

    return gameDevJobs.filter((job) => this.matchesFilters(job, filters));
  }

  private matchesFilters(job: any, filters: JobFilters): boolean {
    if (filters.title) {
      const searchText = `${job.title} ${job.description}`.toLowerCase();
      if (!searchText.includes(filters.title.toLowerCase())) {
        return false;
      }
    }
    return true;
  }
}

export class GamasutraJobsProvider extends BaseJobProvider {
  name = "gamasutra";
  displayName = "Game Developer Jobs";
  description = "Game industry professional job board";
  enabled = false;
  requiresAuth = false;
  baseUrl = "https://gamedeveloper.com";

  config = {
    categories: ["game-industry", "professional", "aaa", "indie"],
    regions: ["global"],
    icon: "mdi-newspaper-variant",
  };

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      q: filters.title || "game developer",
      location: filters.location || "",
      remote: filters.remote || false,
    };
  }

  parseResponse(_data: any): Job[] {
    // Mock implementation - in real world this would parse API response
    return [];
  }

  async fetchJobs(filters: JobFilters): Promise<Job[]> {
    const gamasutraJobs = [
      {
        title: `Senior ${filters.title || "Game"} Designer`,
        company: "Epic Games",
        location: "Cary, NC",
        type: "full-time" as const,
        remote: false,
        description:
          "Design and implement gameplay systems for next-generation games.",
        url: "https://gamedeveloper.com/jobs/game-designer",
        tags: ["Game Design", "AAA", "Unreal Engine", "Systems"],
        postedDate: new Date(),
        source: this.displayName,
      },
      {
        title: "Community Manager",
        company: "Riot Games",
        location: "Los Angeles, CA",
        type: "full-time" as const,
        remote: true,
        description:
          "Build and engage our gaming community across social platforms.",
        url: "https://gamedeveloper.com/jobs/community-manager",
        tags: ["Community", "Social Media", "Gaming", "Content"],
        postedDate: new Date(),
        source: this.displayName,
      },
    ];

    return gamasutraJobs.filter((job) => this.matchesFilters(job, filters));
  }

  private matchesFilters(job: any, filters: JobFilters): boolean {
    if (filters.title) {
      const searchText = `${job.title} ${job.description}`.toLowerCase();
      if (!searchText.includes(filters.title.toLowerCase())) {
        return false;
      }
    }
    return true;
  }
}

export class GamesIndustryBizProvider extends BaseJobProvider {
  name = "gamesindustrybiz";
  displayName = "GamesIndustry.biz Jobs";
  description = "European gaming industry job board";
  enabled = false;
  requiresAuth = false;
  baseUrl = "https://gamesindustry.biz";

  config = {
    categories: ["gaming", "europe", "professional"],
    regions: ["eu", "uk"],
    icon: "mdi-gamepad-variant",
  };

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      q: filters.title || "game developer",
      location: filters.location || "",
      remote: filters.remote || false,
    };
  }

  parseResponse(_data: any): Job[] {
    // Mock implementation - in real world this would parse API response
    return [];
  }

  async fetchJobs(filters: JobFilters): Promise<Job[]> {
    const europeanGamingJobs = [
      {
        title: `Lead ${filters.title || "Gameplay"} Programmer`,
        company: "Ubisoft",
        location: "Paris, France",
        type: "full-time" as const,
        remote: false,
        description: "Lead gameplay programming team for AAA open-world games.",
        url: "https://gamesindustry.biz/jobs/lead-programmer",
        tags: ["Programming", "Leadership", "AAA", "Open World"],
        postedDate: new Date(),
        source: this.displayName,
      },
      {
        title: "Mobile Game Producer",
        company: "King",
        location: "Stockholm, Sweden",
        type: "full-time" as const,
        remote: true,
        description:
          "Produce casual mobile games for millions of players worldwide.",
        url: "https://gamesindustry.biz/jobs/mobile-producer",
        postedDate: new Date(),
        source: this.displayName,
      },
    ];

    return europeanGamingJobs.filter((job) =>
      this.matchesFilters(job, filters),
    );
  }

  private matchesFilters(job: any, filters: JobFilters): boolean {
    if (filters.title) {
      const searchText = `${job.title} ${job.description}`.toLowerCase();
      if (!searchText.includes(filters.title.toLowerCase())) {
        return false;
      }
    }
    return true;
  }
}

export class IndieGameJobsProvider extends BaseJobProvider {
  name = "indiegamejobs";
  displayName = "Indie Game Jobs";
  description = "Independent game development opportunities";
  enabled = false;
  requiresAuth = false;
  baseUrl = "https://indiegamejobs.com";

  config = {
    categories: ["indie", "game-development", "creative"],
    regions: ["global"],
    icon: "mdi-account-group",
  };

  buildParams(filters: JobFilters): Record<string, any> {
    return {
      q: filters.title || "game developer",
      location: filters.location || "",
      remote: filters.remote || false,
    };
  }

  parseResponse(_data: any): Job[] {
    // Mock implementation - in real world this would parse API response
    return [];
  }

  async fetchJobs(filters: JobFilters): Promise<Job[]> {
    const indieJobs = [
      {
        title: `Indie ${filters.title || "Game"} Developer`,
        company: "Creative Minds Studio",
        location: "Remote",
        type: "contract" as const,
        remote: true,
        description:
          "Join our small indie team creating narrative-driven games.",
        url: "https://indiegamejobs.com/indie-developer",
        tags: ["Indie", "Narrative", "Creative", "Small Team"],
        postedDate: new Date(),
        source: this.displayName,
      },
      {
        title: "Pixel Artist",
        company: "Retro Games Co",
        location: "Portland, OR",
        type: "part-time" as const,
        remote: true,
        description: "Create beautiful pixel art for retro-style indie games.",
        url: "https://indiegamejobs.com/pixel-artist",
        tags: ["Art", "Pixel Art", "Retro", "Visual"],
        postedDate: new Date(),
        source: this.displayName,
      },
    ];

    return indieJobs.filter((job) => this.matchesFilters(job, filters));
  }

  private matchesFilters(job: any, filters: JobFilters): boolean {
    if (filters.title) {
      const searchText = `${job.title} ${job.description}`.toLowerCase();
      if (!searchText.includes(filters.title.toLowerCase())) {
        return false;
      }
    }
    return true;
  }
}

// Export all gaming providers
export const gamingProviders = [
  new HitmarkerProvider(),
  new GameDevNetProvider(),
  new GamasutraJobsProvider(),
  new GamesIndustryBizProvider(),
  new IndieGameJobsProvider(),
];

  return gamingProviders;
}
