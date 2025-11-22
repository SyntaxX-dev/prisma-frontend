"use client";

import { useState, useEffect, Suspense } from "react";
import { Navbar } from "../../../components/Navbar";
import { Sidebar } from "../../../components/Sidebar";
import { useAuth } from "../../../hooks/features/auth";
import { LoadingGrid } from "@/components/ui/loading-grid";
import { useNavigationWithLoading } from "@/hooks/shared";
import { useLoading } from "@/contexts/LoadingContext";
import { usePageDataLoad } from "@/hooks/shared";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { ArrowRight } from "lucide-react";

interface Course {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

function CoursesContent() {
  const [isDark, setIsDark] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { setLoading } = useLoading();
  const { navigateWithLoading } = useNavigationWithLoading();
  const router = useRouter();


  usePageDataLoad({
    waitForData: true,
    dataLoading: isLoading,
    customDelay: 0
  });

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCoursesLoading(true);
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();

        if (data.success) {
          setCourses(data.data);
        } else {
          setError('Erro ao carregar cursos');
        }
      } catch (err) {
        setError('Erro ao conectar com o servidor');
      } finally {
        setCoursesLoading(false);
        setIsLoading(false);
      }
    };

    if (user) {
      fetchCourses();
    }
  }, [user]);

  const handleCourseClick = (courseId: string, courseName: string) => {
    navigateWithLoading(`/courses/${courseId}`, `Carregando curso ${courseName}...`);
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
        <Sidebar isDark={isDark} toggleTheme={toggleTheme} />
        <div className="flex-1">
          <Navbar isDark={isDark} toggleTheme={toggleTheme} />

          <div className="p-6 ml-10 pt-6" style={{ marginTop: '80px' }}>
            <div className="mb-8">
              <h1 className="text-white text-3xl font-bold mb-2">Cursos</h1>
              <p className="text-white/60 text-lg">Explore nossa biblioteca completa de cursos de tecnologia</p>
            </div>

            {coursesLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingGrid size="60" color="#bd18b4" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-red-400 text-lg">{error}</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => handleCourseClick(course.id, course.name)}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 cursor-pointer hover:bg-white/10 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden bg-white/10">
                        <div className="text-2xl">📚</div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white text-lg font-semibold group-hover:text-[#c532e2] transition-colors">
                          {course.name}
                        </h3>
                        <p className="text-white/60 text-sm">
                          Curso disponível
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-[#c532e2] group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed">
                      {course.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <LoadingGrid size="60" color="#bd18b4" />
      </div>
    }>
      <CoursesContent />
    </Suspense>
  );
}
