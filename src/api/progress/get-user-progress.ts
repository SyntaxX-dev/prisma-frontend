import { fetchJson } from '@/api/http/client';
import type { UserProgress } from '@/types/progress';

export async function getUserProgress(guideId: string): Promise<UserProgress> {
	return fetchJson<UserProgress>(`/progress/${guideId}`);
}



