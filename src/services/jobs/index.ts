// Canonical Jobs Service Entry
// Single source of truth for job aggregation/search across the app.
// Importers should prefer `@/services/jobs` instead of referencing various legacy files.

export { RefactoredJobAPIService } from '@/services/RefactoredJobAPIService'
export { refactoredJobAPIService as canonicalJobService } from '@/services/RefactoredJobAPIService'

// Back-compat named export for legacy imports that expect `JobService`-like default
export default {} as never

