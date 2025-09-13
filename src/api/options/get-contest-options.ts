import { httpClient } from '../http/client';
import { ContestType } from '../../types/auth-api';
import { ApiError } from '../http/client';

export interface ContestOption {
  value: ContestType;
  label: string;
}

export async function getContestOptions(): Promise<ContestOption[]> {
  try {
    const response = await httpClient.get<ContestOption[]>('/options/contests');
    return response;
  } catch (error) {
    throw error as ApiError;
  }
}
