import { fetchJson } from '@/api/http/client';
import type { Level } from '@/types/level';

export async function getGuideLevels(guideId: string): Promise<Level[]> {
	return fetchJson<Level[]>(`/guides/${guideId}/levels`);
}



