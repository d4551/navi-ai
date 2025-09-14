// CanonicalJobService
// Single source of truth for job aggregation/search across the app.
// Re-exports the provider-based implementation to standardize imports.

export { RefactoredJobAPIService } from './RefactoredJobAPIService'
export { refactoredJobAPIService as canonicalJobService } from './RefactoredJobAPIService'
