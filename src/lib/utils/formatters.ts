export function formatDuration(seconds: number): string {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatDate(iso: string): string {
	return new Date(iso).toLocaleDateString();
}



