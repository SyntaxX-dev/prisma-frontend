'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getModulesBySubCourse, getModuleVideos } from '@/api/modules/get-modules-by-subcourse';
import { markVideoCompleted } from '@/api/progress/mark-video-completed';
import type { CourseProgress } from '@/types/domain/progress';
import type { Video as ModuleVideo, ModuleProgress } from '@/api/modules/get-modules-by-subcourse';
import { CourseVideo, ModuleDisplay } from '@/types/ui/features/course';

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};

export function useCourse(subCourseId?: string) {
  const [selectedVideo, setSelectedVideo] = useState<CourseVideo | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(["1"]));
  const [localVideoPlaying, setLocalVideoPlaying] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [videos, setVideos] = useState<CourseVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastFetchedSubCourseId, setLastFetchedSubCourseId] = useState<string | null>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);
  const fetchingRef = useRef(false);

  const modules: ModuleDisplay[] = (() => {
    if (videos.length === 0) return [];

    const hasModuleIds = videos.some(v => v.moduleId && v.moduleId !== 'default-module');

    if (hasModuleIds) {
      const moduleMap = new Map<string, CourseVideo[]>();
      videos.forEach(video => {
        const moduleId = video.moduleId || 'default-module';
        if (!moduleMap.has(moduleId)) {
          moduleMap.set(moduleId, []);
        }
        moduleMap.get(moduleId)!.push(video);
      });

      return Array.from(moduleMap.entries()).map(([moduleId, moduleVideos], index) => {
        const videosCount = moduleVideos.length;
        const completedVideos = moduleVideos.filter(v => v.isCompleted).length;

        return {
          id: moduleId,
          title: `Módulo ${index + 1}`,
          totalDuration: `${videosCount} vídeo${videosCount !== 1 ? 's' : ''}`,
          videosCount,
          completedVideos,
          videos: moduleVideos.sort((a, b) => (a.order || 0) - (b.order || 0))
        };
      });
    } else {
      const totalVideos = videos.length;
      const completedVideos = videos.filter(v => v.isCompleted).length;

      return [{
        id: "1",
        title: "Vídeos do Curso",
        totalDuration: `${totalVideos} vídeo${totalVideos !== 1 ? 's' : ''}`,
        videosCount: totalVideos,
        completedVideos,
        videos: videos.sort((a, b) => (a.order || 0) - (b.order || 0))
      }];
    }
  })();

  const fetchModules = useCallback(async () => {
    if (!subCourseId) {
      return;
    }

    if (fetchingRef.current) {
      return;
    }

    if (lastFetchedSubCourseId === subCourseId && videos.length > 0) {
      return;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);

      const modulesData = await getModulesBySubCourse(subCourseId);

      if (modulesData.success && modulesData.data) {
        const allVideos: CourseVideo[] = [];
        let totalVideos = 0;
        let completedVideos = 0;
        const moduleProgressMap = new Map<string, ModuleProgress>();

        for (const moduleData of modulesData.data) {
          try {
            const videosData = await getModuleVideos(moduleData.id);

            if (videosData.success && videosData.data && videosData.data.videos) {
              if (!Array.isArray(videosData.data.videos)) {
                continue;
              }

              if (videosData.data.videos.length === 0) {
                continue;
              }

                const moduleVideos = videosData.data.videos.map((video: ModuleVideo): CourseVideo => ({
                id: video.id,
                title: video.title,
                duration: formatDuration(video.duration || 0),
                watched: video.progress?.isCompleted || false,
                locked: false,
                description: video.description || "Descrição não disponível para esta aula.",
                youtubeId: video.videoId,
                thumbnailUrl: video.thumbnailUrl,
                url: video.url,
                order: video.order || 0,
                channelTitle: video.channelTitle,
                channelThumbnailUrl: video.channelThumbnailUrl,
                viewCount: video.viewCount,
                isCompleted: video.progress?.isCompleted || false,
                completedAt: video.progress?.completedAt || null,
                moduleId: video.moduleId,
                videoId: video.videoId
              }));

              allVideos.push(...moduleVideos);

              if (videosData.data.moduleProgress) {
                totalVideos += videosData.data.moduleProgress.totalVideos;
                completedVideos += videosData.data.moduleProgress.completedVideos;
                moduleProgressMap.set(moduleData.id, videosData.data.moduleProgress);
              } else {
                totalVideos += moduleVideos.length;
                completedVideos += moduleVideos.filter(v => v.isCompleted).length;
              }
            }
          } catch (error) {
            // Handle error silently
          }
        }

        setVideos(allVideos);
        setLastFetchedSubCourseId(subCourseId);

        if (allVideos.length > 0) {
          setSelectedVideo(allVideos[0]);
        } else {
          setSelectedVideo(null);
        }

        const progressPercentage = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

        setCourseProgress({
          subCourseId: subCourseId,
          subCourseName: "Curso",
          totalVideos,
          completedVideos,
          progressPercentage,
          isCompleted: completedVideos === totalVideos
        });
      }
    } catch (err) {
      // Handle error silently
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [subCourseId, lastFetchedSubCourseId, videos.length]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  useEffect(() => {
    if (localVideoPlaying) {
      setIframeKey(prev => prev + 1);
    }
  }, [localVideoPlaying]);

  const toggleModule = useCallback((moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  }, []);

  const handleVideoSelect = useCallback((video: CourseVideo) => {
    if (!video.locked) {
      setSelectedVideo(video);
      setLocalVideoPlaying(false);
    }
  }, []);

  const handleMarkVideoComplete = useCallback(async (video: CourseVideo) => {
    if (!video.videoId) return;

    const isCompleted = !video.isCompleted;

    setVideos(prevVideos =>
      prevVideos.map(v =>
        v.id === video.id
          ? {
            ...v,
            isCompleted: isCompleted,
            watched: isCompleted,
            completedAt: isCompleted ? new Date().toISOString() : null
          }
          : v
      )
    );

    if (selectedVideo?.id === video.id) {
      setSelectedVideo((prev: CourseVideo | null) => prev ? {
        ...prev,
        isCompleted: isCompleted,
        watched: isCompleted,
        completedAt: isCompleted ? new Date().toISOString() : null
      } : null);
    }

    setCourseProgress((prev: CourseProgress | null) => {
      if (!prev) return null;

      const newCompletedVideos = isCompleted
        ? prev.completedVideos + 1
        : prev.completedVideos - 1;

      const newProgressPercentage = Math.round((newCompletedVideos / prev.totalVideos) * 100);

      return {
        ...prev,
        completedVideos: newCompletedVideos,
        progressPercentage: newProgressPercentage,
        isCompleted: newCompletedVideos === prev.totalVideos
      };
    });

    try {
      const response = await markVideoCompleted({
        videoId: video.videoId,
        isCompleted: isCompleted
      });

      if (response.success && response.data.courseProgress) {
        setCourseProgress((prev: CourseProgress | null) => prev ? {
          ...prev,
          totalVideos: response.data.courseProgress.totalVideos,
          completedVideos: response.data.courseProgress.completedVideos,
          progressPercentage: response.data.courseProgress.progressPercentage,
          isCompleted: response.data.courseProgress.completedVideos === response.data.courseProgress.totalVideos
        } : null);
      }
    } catch (error) {
      // Revert changes on error
      setVideos(prevVideos =>
        prevVideos.map(v =>
          v.id === video.id
            ? {
              ...v,
              isCompleted: !isCompleted,
              watched: !isCompleted,
              completedAt: !isCompleted ? new Date().toISOString() : null
            }
            : v
        )
      );

      if (selectedVideo?.id === video.id) {
        setSelectedVideo((prev: CourseVideo | null) => prev ? {
          ...prev,
          isCompleted: !isCompleted,
          watched: !isCompleted,
          completedAt: !isCompleted ? new Date().toISOString() : null
        } : null);
      }

      setCourseProgress((prev: CourseProgress | null) => {
        if (!prev) return null;

        const revertedCompletedVideos = !isCompleted
          ? prev.completedVideos + 1
          : prev.completedVideos - 1;

        const revertedProgressPercentage = Math.round((revertedCompletedVideos / prev.totalVideos) * 100);

        return {
          ...prev,
          completedVideos: revertedCompletedVideos,
          progressPercentage: revertedProgressPercentage,
          isCompleted: revertedCompletedVideos === prev.totalVideos
        };
      });
    }
  }, [selectedVideo]);

  const handlePlayToggle = useCallback(() => {
    setLocalVideoPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setLocalVideoPlaying(false);
  }, []);

  return {
    // State
    selectedVideo,
    expandedModules,
    localVideoPlaying,
    iframeKey,
    videos,
    loading,
    courseProgress,
    modules,
    
    // Actions
    toggleModule,
    handleVideoSelect,
    handleMarkVideoComplete,
    handlePlayToggle,
    handlePause,
    
    // Setters
    setLocalVideoPlaying
  };
}
