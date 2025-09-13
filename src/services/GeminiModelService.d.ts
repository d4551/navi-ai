
import type { GeminiModelInfo } from "@/shared/types/ai";
export type { GeminiModelInfo };

export interface FetchModelsResult {
  models?: GeminiModelInfo[];
  lastUpdated?: string;
  source?: string;
}

export interface APIKeyTestResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ModelCapabilities {
  textGeneration?: boolean;
  multiTurn?: boolean;
  imageInput?: boolean;
  videoInput?: boolean;
  audioInput?: boolean;
  audioOutput?: boolean;
  realtimeChat?: boolean;
  liveChat?: boolean;
  codeGeneration?: boolean;
  jsonMode?: boolean;
  streaming?: boolean;
  multimodal?: boolean;
}

declare class GeminiModelService {
  constructor();

  fetchAvailableModels(apiKey: string): Promise<FetchModelsResult>;

  testAPIKey(apiKey: string): Promise<APIKeyTestResult>;

  getCuratedModelList(): GeminiModelInfo[];

  getFallbackModelList(): FetchModelsResult;

  parseModelInfo(model: any): GeminiModelInfo;

  determineCapabilities(model: any): string[];

  extractVersion(name: string): string;

  getCapabilityDescription(capability: string): string;

  getCapabilityIcon(capability: string): string;
}

declare const geminiModelService: GeminiModelService;
export default geminiModelService;
export { geminiModelService };
