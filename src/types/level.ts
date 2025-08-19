export type Level = {
	id: string;
	index: number;
	title: string;
	description: string;
};

export type LevelProgress = {
	levelId: string;
	completed: boolean;
	completedAt?: string;
};



