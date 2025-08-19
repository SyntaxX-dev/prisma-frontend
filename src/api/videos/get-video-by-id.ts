import { fetchJson } from '@/api/http/client';
import type { Video } from '@/types/video';

export async function getVideoById(videoId: string): Promise<Video> {
	return fetchJson<Video>(`/videos/${videoId}`);
}



