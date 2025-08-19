import { fetchJson } from '@/api/http/client';
import type { Video } from '@/types/video';

export async function getVideosByGuide(guideId: string): Promise<Video[]> {
	return fetchJson<Video[]>(`/guides/${guideId}/videos`);
}



