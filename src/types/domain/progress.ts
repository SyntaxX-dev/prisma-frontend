export type UserProgress = {
	guideId: string;
	completedVideoIds: string[];
	lastWatchedVideoId?: string;
};

export type VideoProgress = {
	id: string;
	userId: string;
	videoId: string;
	subCourseId: string;
	isCompleted: boolean;
	completedAt: string | null;
	createdAt: string;
	updatedAt: string;
};

export type CourseProgress = {
	subCourseId: string;
	subCourseName: string;
	totalVideos: number;
	completedVideos: number;
	progressPercentage: number;
	isCompleted: boolean;
};



