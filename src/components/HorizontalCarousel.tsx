import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
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
}

interface HorizontalCarouselProps {
  courses: Course[];
  itemWidth?: number;
}

export function HorizontalCarousel({ courses, itemWidth = 280 }: HorizontalCarouselProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollAmount = itemWidth * 2;
    
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setScrollPosition(scrollContainerRef.current.scrollLeft);
    }
  };

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = scrollContainerRef.current 
    ? scrollPosition < (scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth)
    : true;

  return (
    <div className="relative group">

      {canScrollLeft && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full w-10 h-10 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      )}

      {canScrollRight && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full w-10 h-10 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      )}

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="overflow-x-auto scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <div 
          className="flex gap-4 pb-4"
          style={{ 
            width: `${courses.length * (itemWidth + 16)}px` // 16px for gap
          }}
        >
          {courses.map((course, index) => (
            <div 
              key={index} 
              className="flex-shrink-0" 
              style={{ width: `${itemWidth}px` }}
            >
              <CourseCard {...course} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
