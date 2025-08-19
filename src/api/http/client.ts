import { env } from '@/lib/env';

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
		...init,
		headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
	});
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return res.json() as Promise<T>;
}



