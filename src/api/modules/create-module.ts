import { fetchJson } from '@/api/http/client';

export type CreateModuleInput = {
  name: string;
  description: string;
  order: number;
};

export type CreateModuleResponse = {
  success: boolean;
  data: {
    id: string;
    subCourseId: string;
    name: string;
    description: string;
    order: number;
    videoCount: number;
    createdAt: string;
    updatedAt: string;
  };
};

export async function createModule(subCourseId: string, input: CreateModuleInput): Promise<CreateModuleResponse> {
  return fetchJson<CreateModuleResponse>(`/modules/sub-course/${subCourseId}`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
