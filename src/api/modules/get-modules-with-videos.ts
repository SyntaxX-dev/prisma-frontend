import { fetchJson } from '@/api/http/client';

export type ModuleWithVideos = {
  id: string;
  subCourseId: string;
  name: string;
  description: string;
  order: number;
  videoCount: number;
  createdAt: string;
  updatedAt: string;
  videos: Video[];
  moduleProgress: ModuleProgress;
};

export type Video = {
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
  progress?: {
    isCompleted: boolean;
    completedAt: string | null;
  };
  youtubeData?: {
    videoId: string;
    title: string;
    description: string;
    url: string;
    thumbnailUrl: string;
    duration: number;
    channelTitle: string;
    channelId: string;
    channelThumbnailUrl: string;
    publishedAt: string;
    viewCount: number;
    tags: string[];
    category: string;
  };
};

export type ModuleProgress = {
  totalVideos: number;
  completedVideos: number;
  progressPercentage: number;
};

export type ModulesWithVideosResponse = {
  success: boolean;
  data: {
    modules: ModuleWithVideos[];
  };
};

export async function getModulesWithVideos(subCourseId: string): Promise<ModulesWithVideosResponse> {
  return fetchJson<ModulesWithVideosResponse>(`/modules/sub-course/${subCourseId}/with-videos`);
}
