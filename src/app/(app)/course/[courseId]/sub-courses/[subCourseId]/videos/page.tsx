"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Navbar } from "@/components/layout";
import { Sidebar } from "@/components/Sidebar";
import { BackgroundGrid } from "@/components/shared/BackgroundGrid";
import { CourseDetail } from "@/components/features/course";
import { LoadingGrid } from "@/components/ui/loading-grid";
import { useLoading } from "@/contexts/LoadingContext";
import { useVideoPageLoad } from "@/hooks/features/courses";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/features/auth";

export default function CourseDetailPage() {
  const [isDark, setIsDark] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const { setLoading } = useLoading();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const subCourseId = params.subCourseId as string;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useVideoPageLoad({
    waitForVideo: true,
    videoLoading: isDataLoading,
    customDelay: 0
  });

  const toggleTheme = useCallback(() => {
    setIsDark(!isDark);
  }, [isDark]);

  const handleVideoPlayingChange = useCallback((playing: boolean) => {
    setIsVideoPlaying(playing);
  }, []);

  const courseDetailComponent = useMemo(() => (
    <CourseDetail
      onVideoPlayingChange={handleVideoPlayingChange}
      isVideoPlaying={isVideoPlaying}
      subCourseId={subCourseId}
    />
  ), [handleVideoPlayingChange, isVideoPlaying, subCourseId]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingGrid size="60" color="#bd18b4" />
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingGrid size="60" color="#bd18b4" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <BackgroundGrid />

      <div className="relative z-10 flex">
        <Sidebar isDark={isDark} toggleTheme={toggleTheme} isVideoPlaying={isVideoPlaying} />
        <div className="flex-1">
          <Navbar isDark={isDark} toggleTheme={toggleTheme} />
          <div className="pt-24 md:pt-10">
            {courseDetailComponent}
          </div>
        </div>
      </div>
    </div>
  );
}
