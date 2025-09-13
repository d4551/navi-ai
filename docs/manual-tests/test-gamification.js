import { gamificationService, XP_EVENTS } from './src/services/GamificationService.ts';
import { userProfileService } from './src/services/UserProfileService.ts';

document.addEventListener('DOMContentLoaded', async () => {
  const addProjectBtn = document.getElementById('add-project-btn');
  const applyJobBtn = document.getElementById('apply-job-btn');
  const completeInterviewBtn = document.getElementById('complete-interview-btn');
  const unlockAchievementBtn = document.getElementById('unlock-achievement-btn');
  const userProfileResultEl = document.getElementById('user-profile-result');

  const userId = 'default-user';

  async function updateUserProfileDisplay() {
    const profile = await userProfileService.getProfile(userId);
    userProfileResultEl.textContent = JSON.stringify(profile, null, 2);
  }

  addProjectBtn.addEventListener('click', async () => {
    await gamificationService.addXP(userId, XP_EVENTS.ADD_PROJECT);
    updateUserProfileDisplay();
  });

  applyJobBtn.addEventListener('click', async () => {
    await gamificationService.addXP(userId, XP_EVENTS.APPLY_FOR_JOB);
    updateUserProfileDisplay();
  });

  completeInterviewBtn.addEventListener('click', async () => {
    await gamificationService.addXP(userId, XP_EVENTS.COMPLETE_INTERVIEW_PRACTICE);
    updateUserProfileDisplay();
  });

  unlockAchievementBtn.addEventListener('click', async () => {
    await gamificationService.unlockAchievement(userId, 'First Steps');
    updateUserProfileDisplay();
  });

  // Initial display
  updateUserProfileDisplay();
});
