import { CourseProgress } from '@/types/domain/progress';
import { ModuleProgress } from '@/api/modules/get-modules-by-subcourse';

export interface CourseVideo {
  id: string;
  title: string;
  duration: string;
  watched: boolean;
  locked: boolean;
  description?: string;
  youtubeId?: string;
  thumbnailUrl?: string;
  url?: string;
  order?: number;
  channelTitle?: string;
  channelThumbnailUrl?: string;
  viewCount?: number;
  isCompleted?: boolean;
  completedAt?: string | null;
  moduleId?: string;
  videoId?: string;
}

export interface ModuleDisplay {
  id: string;
  title: string;
  totalDuration: string;
  videosCount: number;
  completedVideos: number;
  videos: CourseVideo[];
}

export interface CourseDetailProps {
  onVideoPlayingChange?: (isPlaying: boolean) => void;
  isVideoPlaying?: boolean;
  subCourseId?: string;
}

export interface VideoPlayerProps {
  selectedVideo: CourseVideo | null;
  isVideoPlaying: boolean;
  onPlayToggle: () => void;
  onPause: () => void;
}

export interface VideoInfoProps {
  selectedVideo: CourseVideo | null;
  onMarkComplete: (video: CourseVideo) => void;
}

export interface VideoTabsProps {
  selectedVideo: CourseVideo | null;
}

export interface CourseSidebarProps {
  modules: ModuleDisplay[];
  expandedModules: Set<string>;
  selectedVideo: CourseVideo | null;
  courseProgress: CourseProgress | null;
  onToggleModule: (moduleId: string) => void;
  onVideoSelect: (video: CourseVideo) => void;
  onMarkComplete: (video: CourseVideo) => void;
}

export interface ModuleItemProps {
  module: ModuleDisplay;
  isExpanded: boolean;
  selectedVideo: CourseVideo | null;
  onToggle: () => void;
  onVideoSelect: (video: CourseVideo) => void;
  onMarkComplete: (video: CourseVideo) => void;
}

export interface VideoItemProps {
  video: CourseVideo;
  isSelected: boolean;
  onSelect: () => void;
  onMarkComplete: () => void;
}

export interface CourseProgressProps {
  courseProgress: CourseProgress | null;
}
