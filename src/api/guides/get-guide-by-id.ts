import { fetchJson } from '@/api/http/client';
import type { Guide } from '@/types/guide';

export async function getGuideById(id: string): Promise<Guide> {
	return fetchJson<Guide>(`/guides/${id}`);
}



