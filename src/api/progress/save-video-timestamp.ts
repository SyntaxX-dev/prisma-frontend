import { httpClient } from '../http/client'

export interface SaveVideoTimestampInput {
  videoId: string
  timestamp: number
}

export interface SaveVideoTimestampResponse {
  success: boolean
  data: {
    progress: {
      id: string
      userId: string
      videoId: string
      subCourseId: string
      isCompleted: boolean
      currentTimestamp: number
      completedAt: string | null
      createdAt: string
      updatedAt: string
    }
  }
}

export async function saveVideoTimestamp(
  input: SaveVideoTimestampInput,
): Promise<SaveVideoTimestampResponse> {
  return httpClient.post<SaveVideoTimestampResponse>(
    '/progress/video/timestamp',
    input
  )
}
