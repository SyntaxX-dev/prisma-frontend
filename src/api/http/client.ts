import { env } from '../../lib/env';

export interface ApiError {
	message: string;
	status: number;
	details?: unknown;
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
	const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
	
	const headers: HeadersInit = { 
		'Content-Type': 'application/json', 
		...(token && { 'Authorization': `Bearer ${token}` }),
		...(init?.headers || {}) 
	};
	
	const res = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
		...init,
		headers,
	});
	
	if (!res.ok) {
		let errorData: any = {};
		try {
			const text = await res.text();
			if (text) {
				errorData = JSON.parse(text);
			}
		} catch {
			// Se não conseguir parsear, usar objeto vazio
			errorData = {};
		}
		
		const error: ApiError = {
			message: errorData.message || `HTTP ${res.status}`,
			status: res.status,
			details: errorData
		};
		throw error;
	}
	
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
	
	async postFormData<T>(path: string, formData: FormData): Promise<T> {
		const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
		
		// NÃO definir Content-Type manualmente - o browser faz isso automaticamente com o boundary correto
		const headers: HeadersInit = {};
		
		if (token) {
			(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
		}
		
		const res = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
			method: 'POST',
			body: formData,
			headers,
		});
		
		if (!res.ok) {
			const errorData = await res.json().catch(() => ({}));
			const error: ApiError = {
				message: errorData.message || `HTTP ${res.status}`,
				status: res.status,
				details: errorData
			};
			throw error;
		}
		
		return res.json() as Promise<T>;
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



