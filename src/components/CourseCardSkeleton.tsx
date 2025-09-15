import { Card, CardContent, CardHeader } from "./ui/card";

export function CourseCardSkeleton() {
  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader className="p-0">
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-gray-700 animate-pulse" />
          </div>
          
          <div className="absolute top-3 right-3">
            <div className="bg-gray-700/50 backdrop-blur-md border border-gray-600/30 rounded-full px-3 py-1 w-20 h-6 animate-pulse" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-2 mb-2">
          <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-gray-700 rounded animate-pulse w-1/2" />
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 bg-gray-700 rounded animate-pulse" />
          <div className="h-3 bg-gray-700 rounded animate-pulse w-24" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-700 rounded animate-pulse" />
            <div className="h-3 bg-gray-700 rounded animate-pulse w-8" />
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-700 rounded animate-pulse" />
            <div className="h-3 bg-gray-700 rounded animate-pulse w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
