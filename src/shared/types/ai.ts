
// Core AI Provider Types
export enum AIProvider {
  GEMINI = "gemini",
  OPENAI = "openai",
  CLAUDE = "claude",
  GROK = "grok",
  DALLE = "dalle",
  STABLE_DIFFUSION = "stable-diffusion",
}

// Modal Types
export enum ModalityType {
  TEXT = "text",
  IMAGE = "image",
  AUDIO = "audio",
  VIDEO = "video",
  MIXED = "mixed",
}

// Provider Configuration Types
export interface ProviderConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string;
  models: ModelInfo[];
  rateLimits: RateLimit;
  supportedModalities: ModalityType[];
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: AIProvider;
  capabilities: string[];
  contextWindow: number;
  maxTokens: number;
  modalities: ModalityType[];
  pricing: ModelPricing;
  performance: ModelPerformance;
}

export interface ModelPricing {
  inputPrice: number; // per token
  outputPrice: number; // per token
  imagePrice?: number; // per image
  audioPrice?: number; // per minute
}

export interface ModelPerformance {
  speed: number; // tokens per second
  reliability: number; // uptime percentage
  quality: number; // user ratings
}

// Request Types
export interface MultiModalRequest {
  id: string;
  type: RequestType;
  modalities: ModalityType[];
  providers: AIProvider[];
  content: InputContent[];
  options: RequestOptions;
  context?: RequestContext;
}

export interface InputContent {
  type: ModalityType;
  data: string | Blob | File;
  metadata?: Record<string, any>;
}

export interface RequestOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  timeout?: number;
  priority?: "low" | "normal" | "high";
  retryAttempts?: number;
  concurrentExecution?: boolean;
}

// Response Types
export interface MultiModalResponse {
  id: string;
  requestId: string;
  provider: AIProvider;
  model: string;
  success: boolean;
  content: OutputContent;
  usage: UsageMetrics;
  timing: TimingMetrics;
  error?: string;
}

export interface OutputContent {
  text?: string;
  images?: ImageOutput[];
  audio?: AudioOutput[];
  video?: VideoOutput[];
  mixed?: MixedContent;
}

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  prompt?: string;
}

export interface ImageOutput {
  url: string;
  data: string;
  metadata: ImageMetadata;
}

export interface AudioOutput {
  url: string;
  duration: number;
  format: string;
}

export interface VideoOutput {
  url: string;
  duration: number;
  resolution: string;
}

export interface MixedContent {
  combined: string;
  components: OutputContent[];
}

export interface UsageMetrics {
  inputTokens: number;
  outputTokens: number;
  imagesGenerated: number;
  audioDuration: number;
  videoDuration: number;
  cost: number;
}

export interface TimingMetrics {
  startedAt: number;
  completedAt: number;
  totalTime: number;
  queueTime?: number;
  processingTime: number;
}

// Context Types
export interface RequestContext {
  userId?: string;
  sessionId?: string;
  component?: string;
  jobRole?: string;
  industry?: string;
  history?: PreviousInteraction[];
}

export interface PreviousInteraction {
  request: string;
  response: string;
  timestamp: number;
  feedback?: UserFeedback;
}

export interface UserFeedback {
  rating: number;
  comments?: string;
  model: string;
}

// Comparative Analysis Types
export interface ModelComparison {
  taskType: RequestType;
  executions: MultiModalResponse[];
  winner: string;
  metrics: ComparativeMetrics;
}

export interface ComparativeMetrics {
  cost: number;
  speed: number;
  quality: number;
  reliability: number;
}

export interface PerformanceReport {
  model: string;
  taskType: RequestType;
  samples: number;
  averageSpeed: number;
  averageCost: number;
  qualityScore: number;
  uptime: number;
}

// Manager State Types
export interface AIManagerState {
  isInitialized: boolean;
  providers: Map<AIProvider, ProviderStatus>;
  currentRequests: Map<string, MultiModalRequest>;
  performanceData: PerformanceReport[];
  defaultModality: ModalityType;
  loadBalancing: boolean;
}

export interface ProviderStatus {
  provider: AIProvider;
  initialized: boolean;
  health: "healthy" | "degraded" | "down";
  lastHealthCheck: number;
  activeRequests: number;
  totalRequests: number;
  errorCount: number;
}

// Request/Response Types
export enum RequestType {
  TEXT_GENERATION = "text_generation",
  IMAGE_GENERATION = "image_generation",
  AUDIO_TRANSCRIPTION = "audio_transcription",
  AUDIO_GENERATION = "audio_generation",
  VIDEO_ANALYSIS = "video_analysis",
  MULTIMODAL_CHAT = "multimodal_chat",
  RESUME_ANALYSIS = "resume_analysis",
  COVER_LETTER_GEN = "cover_letter_generation",
  INTERVIEW_PREP = "interview_preparation",
  PORTFOLIO_DESC = "portfolio_description",
}

// Streaming Types
export interface StreamingSession {
  id: string;
  provider: AIProvider;
  modality: ModalityType;
  startTime: number;
  chunkCount: number;
}

export interface StreamCallbacks {
  onStart?: (session: StreamingSession) => void;
  onChunk?: (chunk: any) => void;
  onComplete?: (result: MultiModalResponse) => void;
  onError?: (error: Error) => void;
}

// Configuration Types
export interface AIManagerConfig {
  providers: ProviderConfig[];
  enableLoadBalancing: boolean;
  enableConcurrentExecution: boolean;
  enableFallback: boolean;
  healthCheckInterval: number;
  defaultTimeout: number;
  maxRetries: number;
}

export interface RateLimit {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
}

// Event Types for Reactive Updates
export interface AIManagerEvent {
  type:
    | "provider_health"
    | "request_started"
    | "request_completed"
    | "error_occurred";
  data: any;
}

// Performance Analysis Types
export interface PerformanceAnalysis {
  taskType: RequestType;
  duration: "hour" | "day" | "week" | "month";
  topPerformers: ModelInfo[];
  costAnalysis: CostBreakdown;
  qualityMetrics: QualityMetrics;
}

export interface CostBreakdown {
  totalCost: number;
  breakdown: Record<string, number>;
  savings: number;
}

export interface QualityMetrics {
  averageScore: number;
  trend: "improving" | "stable" | "declining";
  outliers: number;
}

// Health Monitoring Types
export interface HealthMetrics {
  provider: AIProvider;
  responseTime: number;
  successRate: number;
  errorRate: number;
  lastCheck: number;
  status: "healthy" | "degraded" | "down";
}

// Process Types for Concurrent Execution
export interface ConcurrentProcess {
  id: string;
  request: MultiModalRequest;
  processes: SubProcess[];
  coordinator: ProcessCoordinator;
}

export interface SubProcess {
  id: string;
  provider: AIProvider;
  status: "pending" | "running" | "completed" | "failed";
  result?: MultiModalResponse;
  timing: TimingMetrics;
}

export interface ProcessCoordinator {
  strategy: "parallel" | "sequential" | "combined";
  combiner: (results: MultiModalResponse[]) => MultiModalResponse;
  timeout: number;
}

// Legacy Types for Compatibility
export interface GeminiModelInfo {
  id: string;
  name: string;
  displayName: string;
  description: string;
  version: string;
  isExperimental: boolean;
  capabilities: string[];
  inputTokenLimit: number;
  outputTokenLimit: number;
  supportedGenerationMethods: string[];
  temperature: { min: number; max: number; default: number };
  topP: { min: number; max: number; default: number };
  topK: { min: number; max: number; default: number };
}

export interface AIMetrics {
  requests: number;
  errors: number;
  averageLatencyMs: number;
  lastLatencyMs: number;
  totalTokens?: number;
  streamingSessions?: number;
}

export interface AIState {
  initialized: boolean;
  currentModel: string | null;
  lastError: string | null;
  metrics: AIMetrics;
}

export interface GenerateTextOptions {
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  systemPrompt?: string;
}

export interface StreamingCallbacks {
  onChunk?: (chunk: string) => void;
  onComplete?: (result: any) => void;
  onError?: (error: Error) => void;
}

export interface StreamingRequest {
  prompt: string;
  systemInstructions?: string;
  options?: GenerateTextOptions;
}

export interface ContextualSuggestionsOptions {
  componentType: string;
  currentData?: Record<string, any>;
  userProfile?: Record<string, any>;
  options?: GenerateTextOptions;
}

export interface ResumeContentOptions {
  userInfo: Record<string, any>;
  userSettings?: Record<string, any>;
  options?: GenerateTextOptions;
}

export interface AudioTranscriptionOptions {
  provider?: string;
  language?: string;
  model?: string;
}
