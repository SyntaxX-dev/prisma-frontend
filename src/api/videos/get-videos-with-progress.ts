import { fetchJson } from '@/api/http/client';

export type VideoWithProgress = {
  id: string;
  videoId: string;
  title: string;
  isCompleted: boolean;
  completedAt: string | null;
  channelThumbnailUrl: string;
  duration: number;
  description?: string;
  thumbnailUrl?: string;
  url?: string;
  order?: number;
  channelTitle?: string;
  viewCount?: number;
};

export type VideosWithProgressResponse = {
  success: boolean;
  data: VideoWithProgress[];
  courseProgress: {
    totalVideos: number;
    completedVideos: number;
    progressPercentage: number;
  };
};

export async function getVideosWithProgress(subCourseId: string): Promise<VideosWithProgressResponse> {
  return fetchJson<VideosWithProgressResponse>(`/courses/sub-courses/${subCourseId}/videos`);
}
