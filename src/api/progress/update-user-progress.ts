import { fetchJson } from '@/api/http/client';
import type { UserProgress } from '@/types/progress';

export type UpdateProgressInput = {
	completedVideoIds: string[];
	lastWatchedVideoId?: string;
};

export async function updateUserProgress(guideId: string, input: UpdateProgressInput): Promise<UserProgress> {
	return fetchJson<UserProgress>(`/progress/${guideId}` ,{
		method: 'PUT',
		body: JSON.stringify(input),
	});
}



