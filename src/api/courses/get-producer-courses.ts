import { httpClient } from '../http/client';

export interface ProducerCourseApi {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  isPaid: boolean;
  isProducerCourse?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProducerCoursesResponse {
  success: boolean;
  data: ProducerCourseApi[];
}

export async function getProducerCourses() {
  const response = await httpClient.get<ProducerCoursesResponse>('/courses/producers');
  return response.data;
}

