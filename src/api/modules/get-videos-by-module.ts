import { fetchJson } from '@/api/http/client';

export type VideoWithProgress = {
  id: string;
  moduleId: string;
  subCourseId: string;
  videoId: string;
  title: string;
  description?: string;
  url?: string;
  thumbnailUrl?: string;
  duration: number;
  channelTitle?: string;
  channelId?: string;
  channelThumbnailUrl?: string;
  publishedAt?: string;
  viewCount?: number;
  tags?: string[];
  category?: string;
  order: number;
  isCompleted?: boolean;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GetVideosByModuleResponse = {
  success: boolean;
  data: VideoWithProgress[];
};

export async function getVideosByModule(moduleId: string): Promise<GetVideosByModuleResponse> {
  return fetchJson<GetVideosByModuleResponse>(`/modules/${moduleId}/videos`);
}
