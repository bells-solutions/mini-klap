import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Video } from '@/types/video'
import { videoApi } from '@/services/api'

export const useVideoStore = defineStore('video', () => {
  const videos = ref<Video[]>([])
  const currentVideo = ref<Video | null>(null)
  const isUploading = ref(false)
  const isProcessing = ref(false)
  const error = ref<string | null>(null)

  async function uploadVideo(file: File) {
    isUploading.value = true
    error.value = null

    try {
      const video = await videoApi.uploadVideo(file)
      videos.value.push(video)
      currentVideo.value = video
      return video
    } catch (err: any) {
      error.value = err.message || 'Failed to upload video'
      throw err
    } finally {
      isUploading.value = false
    }
  }

  async function processVideo(videoId: string, withSubtitles: boolean = false, clipCount: number = 3) {
    isProcessing.value = true
    error.value = null

    try {
      const video = await videoApi.processVideo(videoId, { withSubtitles, clipCount })
      const index = videos.value.findIndex(v => v.id === videoId)
      if (index !== -1) {
        videos.value[index] = video
      }
      if (currentVideo.value?.id === videoId) {
        currentVideo.value = video
      }
      
      // Poll for status updates
      pollVideoStatus(videoId)
      
      return video
    } catch (err: any) {
      error.value = err.message || 'Failed to process video'
      throw err
    } finally {
      isProcessing.value = false
    }
  }

  async function pollVideoStatus(videoId: string) {
    const maxAttempts = 60 // Poll for up to 5 minutes
    let attempts = 0

    const poll = async () => {
      try {
        const video = await videoApi.getVideo(videoId)
        const index = videos.value.findIndex(v => v.id === videoId)
        if (index !== -1) {
          videos.value[index] = video
        }
        if (currentVideo.value?.id === videoId) {
          currentVideo.value = video
        }

        if (video.status === 'processing' && attempts < maxAttempts) {
          attempts++
          setTimeout(poll, 5000) // Poll every 5 seconds
        }
      } catch (err) {
        console.error('Failed to poll video status:', err)
      }
    }

    poll()
  }

  async function getVideo(videoId: string) {
    try {
      const video = await videoApi.getVideo(videoId)
      currentVideo.value = video
      return video
    } catch (err: any) {
      error.value = err.message || 'Failed to get video'
      throw err
    }
  }

  async function getAllVideos() {
    try {
      videos.value = await videoApi.getAllVideos()
      return videos.value
    } catch (err: any) {
      error.value = err.message || 'Failed to get videos'
      throw err
    }
  }

  async function deleteVideo(videoId: string) {
    try {
      await videoApi.deleteVideo(videoId)
      videos.value = videos.value.filter(v => v.id !== videoId)
      if (currentVideo.value?.id === videoId) {
        currentVideo.value = null
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete video'
      throw err
    }
  }

  return {
    videos,
    currentVideo,
    isUploading,
    isProcessing,
    error,
    uploadVideo,
    processVideo,
    getVideo,
    getAllVideos,
    deleteVideo,
  }
})
