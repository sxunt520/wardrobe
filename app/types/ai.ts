export interface ImageAnalysisResult {
  category: string;
  colors: string[];
  material: string;
  pattern?: string;
  season: string;
  suggestedName: string;
  confidence: number;
  tags: string[];
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface VirtualTryOnResult {
  imageUrl: string;
  processingTime: number;
  confidence: number;
}

export interface AIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  processingTime?: number;
}

export interface AIServiceConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}