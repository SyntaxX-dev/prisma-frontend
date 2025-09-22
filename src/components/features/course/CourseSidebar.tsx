'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { CourseProgress } from './CourseProgress';
import { ModuleItem } from './ModuleItem';
import { CourseSidebarProps } from '@/types/ui/features/course';

export function CourseSidebar({
    modules,
    expandedModules,
    selectedVideo,
    courseProgress,
    onToggleModule,
    onVideoSelect,
    onMarkComplete
}: CourseSidebarProps) {
    return (
        <div className="relative z-10 bg-transparent backdrop-blur-md border-l border-white/10 flex flex-col w-96">
            <CourseProgress courseProgress={courseProgress} />

            <ScrollArea className="flex-1 bg-transparent overflow-y-auto">
                <div className="p-4 space-y-2">
                    {modules.map((module) => (
                        <ModuleItem
                            key={module.id}
                            module={module}
                            isExpanded={expandedModules.has(module.id)}
                            selectedVideo={selectedVideo}
                            onToggle={() => onToggleModule(module.id)}
                            onVideoSelect={onVideoSelect}
                            onMarkComplete={onMarkComplete}
                        />
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
