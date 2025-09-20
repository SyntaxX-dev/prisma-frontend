import { fetchJson } from '@/api/http/client';

export type MarkVideoCompletedInput = {
  videoId: string;
  isCompleted: boolean;
};

export type VideoProgressResponse = {
  success: boolean;
  data: {
    progress: {
      id: string;
      userId: string;
      videoId: string;
      subCourseId: string;
      isCompleted: boolean;
      completedAt: string | null;
      createdAt: string;
      updatedAt: string;
    };
    courseProgress: {
      totalVideos: number;
      completedVideos: number;
      progressPercentage: number;
    };
  };
};

export async function markVideoCompleted(input: MarkVideoCompletedInput): Promise<VideoProgressResponse> {
  return fetchJson<VideoProgressResponse>('/progress/video', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
