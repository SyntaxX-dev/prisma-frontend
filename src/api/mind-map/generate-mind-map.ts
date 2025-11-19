import { httpClient } from '../http/client';

export interface GenerateMindMapRequest {
  videoId: string;
  videoTitle: string;
  videoDescription: string;
  videoUrl: string;
}

export interface MindMapData {
  id: string;
  content: string;
  videoTitle: string;
  videoUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateMindMapResponse {
  success: boolean;
  data: MindMapData;
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
