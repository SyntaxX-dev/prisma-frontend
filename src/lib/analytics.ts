export function track(event: string, payload?: Record<string, unknown>): void {
	if (process.env.NODE_ENV !== 'production') return;
	void event;
	void payload;
}



