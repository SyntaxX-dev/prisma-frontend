import { httpClient } from '../http/client';
import { CollegeCourse } from '../../types/auth-api';
import { ApiError } from '../http/client';

export interface CollegeCourseOption {
  value: CollegeCourse;
  label: string;
}

export async function getCollegeCourseOptions(): Promise<CollegeCourseOption[]> {
  try {
    const response = await httpClient.get<CollegeCourseOption[]>('/options/college-courses');
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}
