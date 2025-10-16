import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import {
  VideoResponseDto,
  ClipDto,
  ProcessVideoDto,
} from './video.dto';
import { TranscriptionService } from './transcription.service';
import { HighlightService } from './highlight.service';
import { VideoProcessingService } from './video-processing.service';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);
  private videos: Map<string, VideoResponseDto> = new Map();

  constructor(
    private configService: ConfigService,
    private transcriptionService: TranscriptionService,
    private highlightService: HighlightService,
    private videoProcessingService: VideoProcessingService,
  ) {
    // Ensure directories exist
    this.ensureDirectories();
  }

  private ensureDirectories() {
    const uploadDir = this.configService.get<string>('upload.uploadDir') || './uploads';
    const clipsDir = this.configService.get<string>('upload.clipsDir') || './clips';

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    if (!fs.existsSync(clipsDir)) {
      fs.mkdirSync(clipsDir, { recursive: true });
    }
  }

  async uploadVideo(file: Express.Multer.File): Promise<VideoResponseDto> {
    const videoId = uuidv4();
    const uploadDir = this.configService.get<string>('upload.uploadDir') || './uploads';
    const filename = `${videoId}${path.extname(file.originalname)}`;
    const filepath = path.join(uploadDir, filename);

    // Move file to uploads directory
    await fs.promises.writeFile(filepath, file.buffer);

    const video: VideoResponseDto = {
      id: videoId,
      filename,
      status: 'uploading',
      uploadedAt: new Date(),
    };

    this.videos.set(videoId, video);
    this.logger.log(`Video uploaded: ${videoId}`);

    return video;
  }

  async processVideo(
    videoId: string,
    processDto: ProcessVideoDto,
  ): Promise<VideoResponseDto> {
    const video = this.videos.get(videoId);
    if (!video) {
      throw new NotFoundException(`Video not found: ${videoId}`);
    }

    video.status = 'processing';
    this.videos.set(videoId, video);

    try {
      const uploadDir = this.configService.get<string>('upload.uploadDir') || './uploads';
      const clipsDir = this.configService.get<string>('upload.clipsDir') || './clips';
      const videoPath = path.join(uploadDir, video.filename);

      // Step 1: Transcribe video
      this.logger.log(`Step 1: Transcribing video ${videoId}`);
      const transcription = await this.transcriptionService.transcribeVideo(videoPath);

      // Step 2: Detect highlights
      this.logger.log(`Step 2: Detecting highlights for video ${videoId}`);
      const clipCount = processDto.clipCount || 3;
      const highlights = await this.highlightService.detectHighlights(
        transcription,
        clipCount,
      );

      // Step 3: Generate clips
      this.logger.log(`Step 3: Generating ${highlights.length} clips for video ${videoId}`);
      const clips: ClipDto[] = [];

      for (let i = 0; i < highlights.length; i++) {
        const highlight = highlights[i];
        const clipId = uuidv4();
        const clipFilename = `${videoId}_clip_${i + 1}_${clipId}.mp4`;
        const clipPath = path.join(clipsDir, clipFilename);

        await this.videoProcessingService.generateClip(
          videoPath,
          clipPath,
          highlight,
          processDto.withSubtitles,
          transcription.segments,
        );

        clips.push({
          id: clipId,
          startTime: highlight.startTime,
          endTime: highlight.endTime,
          duration: highlight.endTime - highlight.startTime,
          title: highlight.title,
          description: highlight.description,
          filename: clipFilename,
          url: `/api/videos/${videoId}/clips/${clipFilename}`,
          hasSubtitles: processDto.withSubtitles || false,
        });
      }

      video.status = 'completed';
      video.processedAt = new Date();
      video.clips = clips;
      this.videos.set(videoId, video);

      this.logger.log(`Video processing completed: ${videoId}`);
      return video;
    } catch (error) {
      video.status = 'failed';
      video.error = error.message;
      this.videos.set(videoId, video);
      this.logger.error(`Video processing failed: ${videoId}`, error.stack);
      throw error;
    }
  }

  async getVideo(videoId: string): Promise<VideoResponseDto> {
    const video = this.videos.get(videoId);
    if (!video) {
      throw new NotFoundException(`Video not found: ${videoId}`);
    }
    return video;
  }

  async getAllVideos(): Promise<VideoResponseDto[]> {
    return Array.from(this.videos.values());
  }

  getClipPath(videoId: string, clipFilename: string): string {
    const clipsDir = this.configService.get<string>('upload.clipsDir') || './clips';
    return path.join(clipsDir, clipFilename);
  }

  async deleteVideo(videoId: string): Promise<void> {
    const video = this.videos.get(videoId);
    if (!video) {
      throw new NotFoundException(`Video not found: ${videoId}`);
    }

    // Delete uploaded video
    const uploadDir = this.configService.get<string>('upload.uploadDir') || './uploads';
    const videoPath = path.join(uploadDir, video.filename);
    if (fs.existsSync(videoPath)) {
      await fs.promises.unlink(videoPath);
    }

    // Delete clips
    if (video.clips) {
      const clipsDir = this.configService.get<string>('upload.clipsDir') || './clips';
      for (const clip of video.clips) {
        const clipPath = path.join(clipsDir, clip.filename);
        if (fs.existsSync(clipPath)) {
          await fs.promises.unlink(clipPath);
        }
        // Delete subtitle file if exists
        const srtPath = clipPath.replace(/\.mp4$/, '.srt');
        if (fs.existsSync(srtPath)) {
          await fs.promises.unlink(srtPath);
        }
      }
    }

    this.videos.delete(videoId);
    this.logger.log(`Video deleted: ${videoId}`);
  }
}
