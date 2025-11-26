import React from "react";
import { CourseCard } from "./CourseCard";

interface Course {
  title: string;
  instructor: string;
  duration: string;
  level: "Iniciante" | "Intermediário" | "Avançado";
  year: string;
  technology: string;
  icon: string;
  iconColor: string;
  isSubscriber: boolean;
  isFree?: boolean;
  thumbnailUrl: string;
  courseId?: string;
  category?: string;
  courseType?: 'CURSO' | 'FORMAÇÃO';
  description?: string;
  isSponsored?: boolean;
}

interface HorizontalCarouselProps {
  courses: Course[];
  itemWidth?: number;
  limitVisibleCards?: boolean;
}

export function HorizontalCarousel({ 
  courses, 
  itemWidth = 280, 
  limitVisibleCards = false 
}: HorizontalCarouselProps) {
  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-4 md:gap-6">
        {courses.map((course, index) => (
          <div
            key={course.courseId || index}
            style={{
              width: `${itemWidth}px`,
              maxWidth: '100%',
            }}
            className="flex-shrink-0"
          >
            <CourseCard {...course} />
          </div>
        ))}
      </div>
    </div>
  );
}