import { httpClient } from '../http/client';

export type GenerationType = 'mindmap' | 'text';

export interface GenerateMindMapRequest {
  videoId: string;
  videoTitle: string;
  videoDescription: string;
  videoUrl: string;
  generationType?: GenerationType;
}

export interface MindMapData {
  id: string;
  content: string;
  videoTitle: string;
  videoUrl: string;
  createdAt: string;
  updatedAt: string;
  generationType?: GenerationType;
  remainingGenerations?: number;
}

export interface GenerateMindMapResponse {
  success: boolean;
  data: MindMapData;
  code?: string;
  message?: string;
}

export interface GenerationLimitInfo {
  generationsToday: number;
  dailyLimit: number;
  remainingGenerations: number;
  canGenerate: boolean;
  resetTime?: string; // ISO string do horário de reset
}

export interface AllLimitsInfo {
  mindmap: GenerationLimitInfo;
  text: GenerationLimitInfo;
}

export interface GetGenerationLimitsResponse {
  success: boolean;
  data: AllLimitsInfo;
}

// Manter compatibilidade com código existente
export interface MindMapLimitInfo {
  generationsToday: number;
  dailyLimit: number;
  remainingGenerations: number;
  canGenerate: boolean;
}

export interface GetMindMapLimitResponse {
  success: boolean;
  data: MindMapLimitInfo;
}

export interface GetMindMapByVideoResponse {
  success: boolean;
  data?: MindMapData;
  message?: string;
}

export interface ListUserMindMapsResponse {
  success: boolean;
  data: {
    mindMaps: MindMapData[];
    total: number;
  };
}

export async function generateMindMap(data: GenerateMindMapRequest): Promise<GenerateMindMapResponse> {
  return httpClient.post<GenerateMindMapResponse>('/courses/generate-mind-map', data);
}

export async function getMindMapByVideo(videoId: string): Promise<GetMindMapByVideoResponse> {
  return httpClient.get<GetMindMapByVideoResponse>(`/courses/mind-map/${videoId}`);
}

export async function listUserMindMaps(): Promise<ListUserMindMapsResponse> {
  return httpClient.get<ListUserMindMapsResponse>('/courses/mind-maps');
}

export async function getMindMapLimit(): Promise<GetMindMapLimitResponse> {
  // Manter compatibilidade - retorna apenas limite de mindmap
  const response = await httpClient.get<GetGenerationLimitsResponse>('/courses/generation-limits');
  return {
    success: response.success,
    data: response.data.mindmap,
  };
}

export async function getGenerationLimits(): Promise<GetGenerationLimitsResponse> {
  return httpClient.get<GetGenerationLimitsResponse>('/courses/generation-limits');
}
