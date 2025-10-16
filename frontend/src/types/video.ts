export interface Video {
  id: string
  filename: string
  status: 'uploading' | 'processing' | 'completed' | 'failed'
  uploadedAt: Date
  processedAt?: Date
  clips?: Clip[]
  error?: string
}

export interface Clip {
  id: string
  startTime: number
  endTime: number
  duration: number
  title: string
  description: string
  filename: string
  url: string
  hasSubtitles: boolean
}

export interface ProcessVideoRequest {
  videoId: string
  withSubtitles?: boolean
  clipCount?: number
}
