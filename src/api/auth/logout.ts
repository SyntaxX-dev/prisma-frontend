import { fetchJson } from '@/api/http/client';

export async function logout(): Promise<{ success: true }> {
	return fetchJson<{ success: true }>('/auth/logout', { method: 'POST' });
}



