import { httpClient } from '../http/client'

export interface InProgressVideo {
  videoId: string
  videoTitle: string
  videoUrl: string
  thumbnailUrl: string | null
  subCourseId: string
  courseId: string
  currentTimestamp: number
  duration: number | null
  progressPercentage: number
  lastWatchedAt: string
}

export interface GetInProgressVideosResponse {
  success: boolean
  data: {
    videos: InProgressVideo[]
  }
}

export async function getInProgressVideos(): Promise<GetInProgressVideosResponse> {
  return httpClient.get<GetInProgressVideosResponse>(
    '/progress/videos/in-progress'
  )
}
