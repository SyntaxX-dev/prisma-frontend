"use client";

import { useState } from "react";
import { Navbar } from "../../../../components/Navbar";
import { Sidebar } from "../../../../components/Sidebar";
import { CourseDetail } from "../../../../components/CourseDetail";

export default function CoursePage() {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>

      <div
        className={`fixed inset-0 transition-all duration-300 ${
          isDark
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
            radial-gradient(circle at 15% 10%, rgba(201, 254, 2, 0.16), transparent 20%),
            radial-gradient(circle at 85% 90%, rgba(201, 254, 2, 0.09), transparent 20%)
          `
        }}
      />

      <div
        className={`fixed inset-0 backdrop-blur-3xl transition-all duration-300 ${isDark ? 'bg-black/30' : 'bg-black/10'
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
        <Sidebar isDark={isDark} toggleTheme={toggleTheme} />
        <div className="flex-1 pt-4">
          <Navbar isDark={isDark} toggleTheme={toggleTheme} />
          <CourseDetail />
        </div>
      </div>
    </div>
  );
}