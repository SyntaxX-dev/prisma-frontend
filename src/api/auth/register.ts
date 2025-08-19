import { fetchJson } from '@/api/http/client';
import type { Session } from '@/types/auth';

export type RegisterInput = { name: string; email: string; password: string };

export async function register(input: RegisterInput): Promise<Session> {
	return fetchJson<Session>('/auth/register', {
		method: 'POST',
		body: JSON.stringify(input),
	});
}



