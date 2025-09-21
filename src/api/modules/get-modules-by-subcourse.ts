import { fetchJson } from '@/api/http/client';

export type Module = {
  id: string;
  subCourseId: string;
  name: string;
  description: string;
  order: number;
  videoCount: number;
  createdAt: string;
  updatedAt: string;
  videos?: Video[];
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

export type ModulesResponse = {
  success: boolean;
  data: Module[];
};

export async function getModulesBySubCourse(subCourseId: string): Promise<ModulesResponse> {
  return fetchJson<ModulesResponse>(`/modules/sub-course/${subCourseId}`);
}

export type ModuleVideosResponse = {
  success: boolean;
  data: {
    videos: Video[];
    moduleProgress: ModuleProgress;
  };
};

export async function getModuleVideos(moduleId: string): Promise<ModuleVideosResponse> {
  return fetchJson<ModuleVideosResponse>(`/modules/${moduleId}/videos`);
}
