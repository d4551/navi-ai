
/// <reference types="node" />

// Node.js globals for demo execution
declare const require: any;
declare const module: any;
declare const process: any;

import { unifiedService } from "@/shared/services/UnifiedService";
import { configManager } from "@/shared/config/ServiceConfig";

// Demo user profile for testing
const demoUserProfile = {
  name: "Alex Chen",
  email: "alex.chen@example.com",
  location: "Remote",
  experience: [
    {
      title: "Senior Game Developer",
      company: "Indie Studios Inc.",
      description: "Led development of award-winning indie games",
    },
    {
      title: "Junior Game Programmer",
      company: "Mobile Games Co.",
      technologies: ["Unity", "JavaScript", "React Native"],
      description: "Developed mobile games with millions of downloads",
    },
  ],
  skills: [
  ],
  preferences: {
    remote: true,
    companySize: ["Small", "Medium"],
    jobType: ["full-time", "contract"],
    industries: ["Gaming", "VR/AR", "Mobile Games"],
  },
  portfolio: [
    {
      name: "Fantasy RPG Mobile Game",
      url: "https://github.com/alexchen/fantasy-rpg",
    },
    {
      name: "VR Adventure Game",
      description: "Immersive VR experience for Oculus platforms",
      technologies: ["Unreal Engine", "C++", "Oculus SDK"],
      url: "https://github.com/alexchen/vr-adventure",
    },
  ],
};

export class NAVIDemo {
  async runFullDemo(): Promise<void> {
    console.log("=====================================\n");

    try {
      // Initialize the service
      await this.initializeService();

      await this.demonstrateJobSearch();
      await this.demonstrateStudioSearch();
      await this.demonstrateAIRecommendations();
      await this.showServiceStatistics();

    } catch (_error) {
      throw error;
    }
  }

  private async initializeService(): Promise<void> {

    const config = configManager.getConfig();
    console.log(`   Environment: ${configManager.getEnvironment()}`);
    console.log(
      `   Database: ${config.database.type} (${config.database.path})`,
    );
    console.log(`   AI Provider: ${config.ai.provider}`);

    await unifiedService.initialize({
      aiProvider: config.ai.provider as any,
      enableBackgroundSync: config.jobs.enableBackgroundSync,
    });

  }

  private async demonstrateJobSearch(): Promise<void> {
    console.log("─────────────────────────────");

    // Basic job search
    console.log("   Searching for Unity developer jobs...");
    const jobs = await unifiedService.searchJobs({
      keywords: "Unity developer",
      location: "Remote",
      remote: true,
      userProfile: demoUserProfile,
    });

    console.log(`   Found ${jobs.length} job(s)`);

      console.log(`   Top Result: ${topJob.title} at ${topJob.company}`);
      console.log(`   Location: ${topJob.location}`);
      console.log(`   Remote: ${topJob.remote ? "Yes" : "No"}`);
      if (topJob.aiScore) {
      }
    }

    console.log("");
  }

  private async demonstrateStudioSearch(): Promise<void> {
    console.log("─────────────────────────────────");

    // Basic studio search
    console.log("   Searching for indie game studios...");
    const studios = await unifiedService.searchStudios({
      type: "Indie",
      userProfile: demoUserProfile,
    });

    console.log(`   Found ${studios.length} studio(s)`);

      console.log(`   Top Result: ${topStudio.name}`);
      console.log(`   Location: ${topStudio.location}`);
      console.log(`   Size: ${topStudio.size}`);
      console.log(
      );
      if (topStudio.aiInsights) {
        console.log(
        );
      }
    }

    console.log("");
  }

  private async demonstrateAIRecommendations(): Promise<void> {
    console.log("─────────────────────────────────────");

    // AI job recommendations
    console.log("   Getting AI-powered job recommendations...");
    const jobRecs = await unifiedService.getJobRecommendations(
      demoUserProfile,
    );
    console.log(`   AI recommended ${jobRecs.length} job(s) based on profile`);

    jobRecs.forEach((job, index) => {
      if (job.aiScore) {
      }
    });

    // AI studio recommendations
    console.log("\n   Getting AI-powered studio recommendations...");
    const studioRecs = await unifiedService.getStudioRecommendations(
      demoUserProfile,
    );
    console.log(
      `   AI recommended ${studioRecs.length} studio(s) based on profile`,
    );

    studioRecs.forEach((studio, index) => {
      if (studio.aiInsights) {
      }
    });

    console.log("");
  }

  private async showServiceStatistics(): Promise<void> {
    console.log("────────────────────");

    const stats = await unifiedService.getServiceStats();

    console.log("   Database:");
    console.log(`     Jobs: ${stats.database.jobs}`);
    console.log(`     Studios: ${stats.database.studios}`);
    console.log(`     Size: ${stats.database.size}`);

    console.log("   AI Service:");
    if (stats.ai.provider) {
      console.log(`     Provider: ${stats.ai.provider}`);
    }

    console.log("   Services:");
    console.log(
    );

    console.log("");
  }
}

  const demo = new NAVIDemo();
  await demo.runFullDemo();
}

// Self-executing demo when run directly
if (typeof window === "undefined" && require.main === module) {
  runNAVIDemo()
    .then(() => {
    })
    .catch((_error) => {
    });
}

export default NAVIDemo;
