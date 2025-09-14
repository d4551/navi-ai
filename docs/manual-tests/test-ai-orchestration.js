import { aiOrchestrationService } from './src/services/AIOrchestrationService.ts';

document.addEventListener('DOMContentLoaded', () => {
  const analyzeProfileBtn = document.getElementById('analyze-profile-btn');
  const findJobsBtn = document.getElementById('find-jobs-btn');
  const enrichStudioBtn = document.getElementById('enrich-studio-btn');

  const profileResultEl = document.getElementById('profile-analysis-result');
  const jobMatchingResultEl = document.getElementById('job-matching-result');
  const studioEnrichmentResultEl = document.getElementById('studio-enrichment-result');

  analyzeProfileBtn.addEventListener('click', async () => {
    profileResultEl.textContent = 'Analyzing...';
    try {
      const result = await aiOrchestrationService.analyzeUserProfile('default-user');
      profileResultEl.textContent = JSON.stringify(result, null, 2);
    } catch (error) {
      profileResultEl.textContent = `Error: ${error.message}`;
    }
  });

  findJobsBtn.addEventListener('click', async () => {
    jobMatchingResultEl.textContent = 'Finding jobs...';
    try {
      const result = await aiOrchestrationService.findMatchingJobs('default-user');
      jobMatchingResultEl.textContent = JSON.stringify(result, null, 2);
    } catch (error) {
      jobMatchingResultEl.textContent = `Error: ${error.message}`;
    }
  });

  enrichStudioBtn.addEventListener('click', async () => {
    studioEnrichmentResultEl.textContent = 'Enriching studio...';
    // In a real scenario, you'd have a way to select a studio.
    // For this test, we'll use a hardcoded example ID.
    const sampleStudioId = 'some-studio-id'; 
    try {
      const result = await aiOrchestrationService.enrichStudioData(sampleStudioId);
      studioEnrichmentResultEl.textContent = JSON.stringify(result, null, 2);
    } catch (error) {
      studioEnrichmentResultEl.textContent = `Error: ${error.message}`;
    }
  });
});
