import { fetchJson } from '@/api/http/client';
import type { Guide } from '@/types/guide';

export async function getGuides(): Promise<Guide[]> {
	return fetchJson<Guide[]>('/guides');
}



