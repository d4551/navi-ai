import { userProfileService } from "./UserProfileService";
import { logger } from "@/shared/utils/logger";

export const XP_EVENTS = {
};


class GamificationService {
  async addXP(userId: string, amount: number): Promise<any> {
    const userProfile = await userProfileService.getProfile(userId);
    if (!userProfile) {
      logger.warn(`User profile not found for ID: ${userId}`);
      return null;
    }

    userProfile.xp += amount;
    logger.info(
      `Awarded ${amount} XP to user ${userId}. New XP: ${userProfile.xp}`,
    );

    const newLevel = this.getLevelFromXP(userProfile.xp);
    if (newLevel > userProfile.level) {
      userProfile.level = newLevel;
      this.unlockAchievement(userId, `Reached Level ${newLevel}`);
      logger.info(`User ${userId} leveled up to level ${newLevel}!`);
    }

    await userProfileService.updateProfile(userId, userProfile);
    return userProfile;
  }

  async unlockAchievement(
    userId: string,
    achievementName: string,
  ): Promise<any> {
    const userProfile = await userProfileService.getProfile(userId);
    if (!userProfile) {
      logger.warn(`User profile not found for ID: ${userId}`);
      return null;
    }

    if (!userProfile.achievements) {
      userProfile.achievements = [];
    }

    if (!userProfile.achievements.includes(achievementName)) {
      userProfile.achievements.push(achievementName);
      logger.info(`User ${userId} unlocked achievement: ${achievementName}`);
      await userProfileService.updateProfile(userId, userProfile);
    }

    return userProfile;
  }

  getLevelFromXP(xp: number): number {
      if (xp >= LEVEL_THRESHOLDS[i]) {
      }
    }
  }
}

export const gamificationService = new GamificationService();
