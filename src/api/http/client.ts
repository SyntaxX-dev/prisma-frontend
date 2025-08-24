import { env } from '../../lib/env';

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
		...init,
		headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
	});
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return res.json() as Promise<T>;
}

export const httpClient = {
	async get<T>(path: string): Promise<T> {
		return fetchJson<T>(path, { method: 'GET' });
	},
	
	async post<T>(path: string, data?: unknown): Promise<T> {
		return fetchJson<T>(path, {
			method: 'POST',
			body: data ? JSON.stringify(data) : undefined,
		});
	},
	
	async put<T>(path: string, data?: unknown): Promise<T> {
		return fetchJson<T>(path, {
			method: 'PUT',
			body: data ? JSON.stringify(data) : undefined,
		});
	},
	
	async delete<T>(path: string): Promise<T> {
		return fetchJson<T>(path, { method: 'DELETE' });
	},
};



