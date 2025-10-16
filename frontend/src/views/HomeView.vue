<template>
  <div class="mini-klap">
    <header class="header">
      <h1>🎬 MiniKlap</h1>
      <p class="tagline">Transform long videos into viral short clips</p>
    </header>

    <main class="main-content">
      <!-- Upload Section -->
      <section v-if="!currentVideo" class="upload-section">
        <div class="upload-area" @dragover.prevent @drop.prevent="handleDrop">
          <input
            ref="fileInput"
            type="file"
            accept="video/*"
            @change="handleFileSelect"
            class="file-input"
          />
          <div class="upload-content" @click="triggerFileInput">
            <svg class="upload-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <h3>Drop your video here or click to browse</h3>
            <p>Supports MP4, MOV, AVI and more</p>
          </div>
        </div>

        <div v-if="isUploading" class="loading">
          <div class="spinner"></div>
          <p>Uploading video...</p>
        </div>
      </section>

      <!-- Processing Section -->
      <section v-if="currentVideo && currentVideo.status !== 'completed'" class="processing-section">
        <div class="video-info">
          <h2>{{ currentVideo.filename }}</h2>
          <p class="status">Status: <span :class="'status-' + currentVideo.status">{{ currentVideo.status }}</span></p>
        </div>

        <div v-if="currentVideo.status === 'uploading'" class="options-form">
          <h3>Processing Options</h3>
          
          <div class="form-group">
            <label>
              <input type="checkbox" v-model="withSubtitles" />
              Add subtitles to clips
            </label>
          </div>

          <div class="form-group">
            <label for="clipCount">Number of clips:</label>
            <input
              id="clipCount"
              type="number"
              v-model.number="clipCount"
              min="1"
              max="10"
              class="clip-count-input"
            />
          </div>

          <button @click="startProcessing" class="btn btn-primary" :disabled="isProcessing">
            {{ isProcessing ? 'Starting...' : 'Generate Clips' }}
          </button>
        </div>

        <div v-if="currentVideo.status === 'processing'" class="processing-status">
          <div class="spinner"></div>
          <h3>Processing your video...</h3>
          <p>This may take a few minutes. We're transcribing audio, detecting highlights, and generating clips.</p>
        </div>

        <div v-if="currentVideo.status === 'failed'" class="error-message">
          <p>❌ Processing failed: {{ currentVideo.error }}</p>
          <button @click="resetVideo" class="btn">Try Another Video</button>
        </div>
      </section>

      <!-- Results Section -->
      <section v-if="currentVideo && currentVideo.status === 'completed'" class="results-section">
        <div class="video-info">
          <h2>✨ Your clips are ready!</h2>
          <p>{{ currentVideo.clips?.length }} clips generated from {{ currentVideo.filename }}</p>
        </div>

        <div class="clips-grid">
          <div v-for="clip in currentVideo.clips" :key="clip.id" class="clip-card">
            <div class="clip-header">
              <h3>{{ clip.title }}</h3>
              <span class="clip-duration">{{ formatDuration(clip.duration) }}</span>
            </div>
            <p class="clip-description">{{ clip.description }}</p>
            <div class="clip-meta">
              <span>{{ formatTime(clip.startTime) }} - {{ formatTime(clip.endTime) }}</span>
              <span v-if="clip.hasSubtitles" class="subtitle-badge">📝 Subtitles</span>
            </div>
            <div class="clip-actions">
              <a
                :href="getDownloadUrl(clip)"
                :download="clip.filename"
                class="btn btn-download"
              >
                ⬇️ Download
              </a>
              <button @click="shareClip(clip)" class="btn btn-secondary">
                🔗 Share
              </button>
            </div>
          </div>
        </div>

        <div class="actions">
          <button @click="resetVideo" class="btn btn-primary">Process Another Video</button>
        </div>
      </section>

      <!-- Error Display -->
      <div v-if="error" class="error-banner">
        {{ error }}
      </div>
    </main>

    <footer class="footer">
      <p>Powered by OpenAI Whisper & GPT | Built with NestJS & Vue.js</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useVideoStore } from '@/stores/video'
import { videoApi } from '@/services/api'
import type { Clip } from '@/types/video'

const videoStore = useVideoStore()
const fileInput = ref<HTMLInputElement | null>(null)
const withSubtitles = ref(true)
const clipCount = ref(3)

const currentVideo = computed(() => videoStore.currentVideo)
const isUploading = computed(() => videoStore.isUploading)
const isProcessing = computed(() => videoStore.isProcessing)
const error = computed(() => videoStore.error)

function triggerFileInput() {
  fileInput.value?.click()
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    await videoStore.uploadVideo(file)
  }
}

async function handleDrop(event: DragEvent) {
  const file = event.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('video/')) {
    await videoStore.uploadVideo(file)
  }
}

async function startProcessing() {
  if (currentVideo.value) {
    await videoStore.processVideo(currentVideo.value.id, withSubtitles.value, clipCount.value)
  }
}

function resetVideo() {
  videoStore.currentVideo = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function getDownloadUrl(clip: Clip): string {
  return videoApi.getClipDownloadUrl(currentVideo.value!.id, clip.filename)
}

function shareClip(clip: Clip) {
  const url = getDownloadUrl(clip)
  if (navigator.share) {
    navigator.share({
      title: clip.title,
      text: clip.description,
      url: url,
    })
  } else {
    navigator.clipboard.writeText(url)
    alert('Link copied to clipboard!')
  }
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.mini-klap {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  text-align: center;
  padding: 2rem 1rem;
  color: white;
}

.header h1 {
  font-size: 3rem;
  margin: 0;
  font-weight: bold;
}

.tagline {
  font-size: 1.2rem;
  margin: 0.5rem 0 0;
  opacity: 0.9;
}

.main-content {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.upload-section,
.processing-section,
.results-section {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.upload-area {
  border: 3px dashed #667eea;
  border-radius: 1rem;
  padding: 3rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: #764ba2;
  background: rgba(102, 126, 234, 0.05);
}

.file-input {
  display: none;
}

.upload-content {
  cursor: pointer;
}

.upload-icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1rem;
  color: #667eea;
}

.upload-content h3 {
  font-size: 1.5rem;
  margin: 0 0 0.5rem;
  color: #333;
}

.upload-content p {
  color: #666;
  margin: 0;
}

.loading,
.processing-status {
  text-align: center;
  padding: 2rem;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.video-info {
  margin-bottom: 2rem;
}

.video-info h2 {
  margin: 0 0 0.5rem;
  color: #333;
}

.status {
  margin: 0;
  color: #666;
}

.status-uploading {
  color: #f59e0b;
}

.status-processing {
  color: #3b82f6;
}

.status-completed {
  color: #10b981;
}

.status-failed {
  color: #ef4444;
}

.options-form {
  max-width: 400px;
}

.options-form h3 {
  margin: 0 0 1rem;
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #333;
  font-weight: 500;
}

.clip-count-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
  margin-top: 0.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #764ba2;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e5e7eb;
  color: #333;
}

.btn-secondary:hover {
  background: #d1d5db;
}

.btn-download {
  background: #10b981;
  color: white;
  text-decoration: none;
  display: inline-block;
}

.btn-download:hover {
  background: #059669;
}

.clips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.clip-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  background: #f9fafb;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.clip-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.clip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.clip-header h3 {
  margin: 0;
  font-size: 1.125rem;
  color: #333;
}

.clip-duration {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.clip-description {
  color: #666;
  margin: 0 0 1rem;
  font-size: 0.9rem;
  line-height: 1.5;
}

.clip-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #666;
}

.subtitle-badge {
  background: #fbbf24;
  color: #78350f;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.clip-actions {
  display: flex;
  gap: 0.5rem;
}

.clip-actions .btn {
  flex: 1;
  padding: 0.5rem;
  font-size: 0.875rem;
}

.actions {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.error-message {
  text-align: center;
  padding: 2rem;
}

.error-message p {
  color: #ef4444;
  font-size: 1.125rem;
  margin: 0 0 1rem;
}

.error-banner {
  background: #fee2e2;
  border: 1px solid #ef4444;
  color: #991b1b;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
  text-align: center;
}

.footer {
  text-align: center;
  padding: 2rem 1rem;
  color: white;
  opacity: 0.8;
}

.footer p {
  margin: 0;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 2rem;
  }

  .clips-grid {
    grid-template-columns: 1fr;
  }

  .clip-actions {
    flex-direction: column;
  }
}
</style>

