import axios from 'axios'
import type { Video, ProcessVideoRequest } from '@/types/video'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const videoApi = {
  async uploadVideo(file: File): Promise<Video> {
    const formData = new FormData()
    formData.append('video', file)

    const response = await api.post('/api/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async processVideo(videoId: string, options: Omit<ProcessVideoRequest, 'videoId'>): Promise<Video> {
    const response = await api.post(`/api/videos/${videoId}/process`, options)
    return response.data
  },

  async getVideo(videoId: string): Promise<Video> {
    const response = await api.get(`/api/videos/${videoId}`)
    return response.data
  },

  async getAllVideos(): Promise<Video[]> {
    const response = await api.get('/api/videos')
    return response.data
  },

  async deleteVideo(videoId: string): Promise<void> {
    await api.delete(`/api/videos/${videoId}`)
  },

  getClipDownloadUrl(videoId: string, filename: string): string {
    return `${API_BASE_URL}/api/videos/${videoId}/clips/${filename}`
  },
}
