import { fetchJson } from '@/api/http/client';
import type { Level } from '@/types/level';

export async function getLevelById(levelId: string): Promise<Level> {
	return fetchJson<Level>(`/levels/${levelId}`);
}



