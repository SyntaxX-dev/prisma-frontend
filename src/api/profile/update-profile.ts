import { httpClient } from '../http/client';
import { ApiError } from '../http/client';
import { UserProfile } from '../../types/auth-api';

export interface UpdateProfileRequest {
  name?: string;
  age?: number;
  educationLevel?: string;
  userFocus?: string;
  profileImage?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  aboutYou?: string;
  habilities?: string;
  momentCareer?: string;
  location?: string;
  contestType?: string;
  collegeCourse?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  badge?: string;
  hasNotification: boolean;
  missingFields: string[];
  profileCompletionPercentage: number;
  completedFields: string[];
  data?: UserProfile;
}

export async function updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
  try {
    const response = await httpClient.put<UpdateProfileResponse>('/profile', data);
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}