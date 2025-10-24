import { httpClient } from '../http/client';
import { OffensivesResponse } from '../../types/offensives';

export async function getOffensives(): Promise<OffensivesResponse> {
  const response = await httpClient.get<OffensivesResponse>('/offensives');
  return response;
}
