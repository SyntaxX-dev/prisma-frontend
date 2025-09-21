import { fetchJson } from '@/api/http/client';

export type VideoInput = {
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
};

export type AddVideosToModuleInput = {
  videos: VideoInput[];
};

export type AddVideosToModuleResponse = {
  success: boolean;
  data: {
    videos: Array<{
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
      createdAt: string;
      updatedAt: string;
    }>;
    module: {
      id: string;
      videoCount: number;
    };
  };
};

export async function addVideosToModule(moduleId: string, input: AddVideosToModuleInput): Promise<AddVideosToModuleResponse> {
  return fetchJson<AddVideosToModuleResponse>(`/modules/${moduleId}/videos`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
