// Canonical Jobs Service Entry
// Single source of truth for job aggregation/search across the app.
// Importers should prefer `@/services/jobs` instead of referencing various legacy files.

export { RefactoredJobAPIService } from '@/services/RefactoredJobAPIService'
export { refactoredJobAPIService as canonicalJobService } from '@/services/RefactoredJobAPIService'
import { refactoredJobAPIService } from '@/services/RefactoredJobAPIService'

// Legacy alias expected by some composables (e.g., useJobs)
export const jobService = refactoredJobAPIService

// Back-compat named export for legacy imports that expect `JobService`-like default
export default {} as never
