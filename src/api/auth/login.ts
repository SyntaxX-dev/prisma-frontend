import { fetchJson } from '@/api/http/client';
import type { Session } from '@/types/auth';

export type LoginInput = { email: string; password: string };

export async function login(input: LoginInput): Promise<Session> {
	return fetchJson<Session>('/auth/login', {
		method: 'POST',
		body: JSON.stringify(input),
	});
}



