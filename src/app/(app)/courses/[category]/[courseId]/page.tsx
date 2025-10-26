"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout";
import { Sidebar } from "@/components/Sidebar";
import { CourseDetail } from "@/components/features/course";
import { useLoading } from "@/contexts/LoadingContext";
import { useVideoPageLoad } from "@/hooks/features/courses";

export default function CourseDetailPage() {
  const params = useParams();
  const [isDark, setIsDark] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const { setLoading } = useLoading();
  
  useEffect(() => {
    setIsDataLoading(false);
  }, []);
  
  useVideoPageLoad({
    waitForVideo: true,
    videoLoading: isDataLoading,
    customDelay: 0
  });

  const toggleTheme = () => {
    setIsDark(!isDark);
  };


  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div
        className={`fixed inset-0 transition-all duration-300 ${isDark
          ? 'bg-gray-950'
          : 'bg-gray-500'
          }`}
        style={{
          backgroundImage: isDark
            ? `
        radial-gradient(circle at 25% 25%, rgba(179, 226, 64, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(179, 226, 64, 0.04) 0%, transparent 50%)
      `
            : `
        radial-gradient(circle at 25% 25%, rgba(179, 226, 64, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(179, 226, 64, 0.05) 0%, transparent 50%)
      `
        }}
      />

      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 10%, rgba(201, 254, 2, 0.06), transparent 20%),
            radial-gradient(circle at 85% 90%, rgba(201, 254, 2, 0.04), transparent 20%)
          `
        }}
      />

      <div
        className={`fixed inset-0 backdrop-blur-sm transition-all duration-300 ${isDark ? 'bg-black/30' : 'bg-black/10'
          }`}
      />

      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0'
        }}
      />

      <div className="relative z-10 flex">
        <Sidebar isDark={isDark} toggleTheme={toggleTheme} isVideoPlaying={isVideoPlaying} />
        <div className="flex-1">
          <Navbar isDark={isDark} toggleTheme={toggleTheme} />
          <div style={{ marginTop: '80px' }}>
            <CourseDetail onVideoPlayingChange={setIsVideoPlaying} isVideoPlaying={isVideoPlaying} subCourseId={params.courseId as string} />
          </div>
        </div>
      </div>
    </div>
  );
}
