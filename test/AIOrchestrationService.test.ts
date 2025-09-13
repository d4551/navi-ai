import { aiOrchestrationService } from '../src/services/AIOrchestrationService';
import { expect, test, vi } from 'vitest';

// Mock dependencies
vi.mock('../src/services/UserProfileService', () => ({
  userProfileService: {
    getProfile: vi.fn(),
  },
}));

vi.mock('../electron/services/DatabaseStudioService.cjs', () => ({
  DatabaseStudioService: vi.fn(() => ({
    getStudio: vi.fn(),
    upsertStudio: vi.fn(),
  })),
}));

vi.mock('../src/services/JobAPIService', () => ({
  JobAPIService: vi.fn(() => ({
    fetchJobs: vi.fn(),
  })),
}));

vi.mock('../electron/services/AIService.cjs', () => ({
  MainAIService: vi.fn(() => ({
    generateText: vi.fn(),
  })),
}));

test('AIOrchestrationService should analyze user profile', async () => {
  const { userProfileService } = await import('../src/services/UserProfileService');
  const { MainAIService } = await import('../electron/services/AIService.cjs');

  const mockProfile = { name: 'Test User', skills: { technical: ['Unity', 'C#'] } };
  const mockAIResponse = { summary: 'A great developer.' };

  vi.spyOn(userProfileService, 'getProfile').mockResolvedValue(mockProfile);
  const aiServiceInstance = new MainAIService();
  vi.spyOn(aiServiceInstance, 'generateText').mockResolvedValue({
    text: JSON.stringify(mockAIResponse),
    usageMetadata: {},
    latencyMs: 100,
    finishReason: undefined,
    safetyRatings: undefined,
    modelUsed: 'gemini-1.5-flash'
  });

  const result = await aiOrchestrationService.analyzeUserProfile('test-user');
  expect(result).toEqual(mockAIResponse);
  expect(userProfileService.getProfile).toHaveBeenCalledWith('test-user');
  expect(aiServiceInstance.generateText).toHaveBeenCalled();
});
