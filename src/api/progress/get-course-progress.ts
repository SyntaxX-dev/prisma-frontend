import { fetchJson } from '@/api/http/client';

export type CourseProgressResponse = {
  success: boolean;
  data: {
    subCourseId: string;
    subCourseName: string;
    totalVideos: number;
    completedVideos: number;
    progressPercentage: number;
    isCompleted: boolean;
  };
};

export async function getCourseProgress(subCourseId: string): Promise<CourseProgressResponse> {
  return fetchJson<CourseProgressResponse>(`/progress/course/${subCourseId}`);
}
