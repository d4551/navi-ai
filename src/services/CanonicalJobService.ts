// CanonicalJobService
// Single source of truth for job aggregation/search across the app.
// Re-exports the provider-based implementation to standardize imports.

export { RefactoredJobAPIService } from "./RefactoredJobAPIService";
export { refactoredJobAPIService as canonicalJobService } from "./RefactoredJobAPIService";
// Back-compat alias for legacy Named import usage
export { refactoredJobAPIService as CanonicalJobService } from "./RefactoredJobAPIService";
