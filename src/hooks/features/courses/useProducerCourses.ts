import { useQuery } from '@tanstack/react-query';
import { CACHE_TAGS } from '@/lib/cache/invalidate-tags';
import { getProducerCourses, type ProducerCourseApi } from '@/api/courses/get-producer-courses';
import { transformApiCourseToCourse, type Course } from './useCourseSearch';

function transformProducerCourse(course: ProducerCourseApi): Course {
  const transformed = transformApiCourseToCourse({
    id: course.id,
    name: course.name,
    description: course.description ?? 'Curso de produtor',
    imageUrl: course.imageUrl ?? '',
    isPaid: course.isPaid,
    createdAt: course.createdAt ?? new Date().toISOString(),
    updatedAt: course.updatedAt ?? new Date().toISOString(),
  });

  return {
    ...transformed,
    courseType: 'PRODUTOR',
    isSponsored: true,
    isSubscriber: course.isPaid,
    isFree: !course.isPaid,
  };
}

export function useProducerCourses() {
  return useQuery({
    queryKey: [CACHE_TAGS.COURSES, 'producer-courses'],
    queryFn: async (): Promise<Course[]> => {
      const courses = await getProducerCourses();
      return courses.map(transformProducerCourse);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

