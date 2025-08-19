export type VideoSource = {
	url: string;
	quality: '720p' | '1080p';
};

export type Video = {
	id: string;
	title: string;
	durationSec: number;
	sources: VideoSource[];
};



