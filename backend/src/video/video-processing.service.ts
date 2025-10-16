import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as fs from 'fs';
import { HighlightDto, TranscriptionSegment } from './video.dto';

@Injectable()
export class VideoProcessingService {
  private readonly logger = new Logger(VideoProcessingService.name);

  constructor(private configService: ConfigService) {}

  async generateClip(
    inputPath: string,
    outputPath: string,
    highlight: HighlightDto,
    withSubtitles: boolean = false,
    transcriptionSegments?: TranscriptionSegment[],
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      this.logger.log(`Generating clip: ${outputPath}`);

      const targetWidth = this.configService.get<number>('video.targetWidth');
      const targetHeight = this.configService.get<number>('video.targetHeight');
      const duration = highlight.endTime - highlight.startTime;

      let command = ffmpeg(inputPath)
        .setStartTime(highlight.startTime)
        .setDuration(duration)
        .videoFilters([
          // Scale and crop to 9:16 aspect ratio
          `scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=increase`,
          `crop=${targetWidth}:${targetHeight}`,
        ])
        .outputOptions([
          '-c:v libx264',
          '-preset fast',
          '-crf 23',
          '-c:a aac',
          '-b:a 128k',
        ]);

      // Add subtitles if requested
      if (withSubtitles && transcriptionSegments) {
        const subtitlesPath = await this.generateSubtitles(
          transcriptionSegments,
          highlight.startTime,
          highlight.endTime,
          outputPath,
        );
        
        if (subtitlesPath) {
          command = command.videoFilters([
            `scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=increase`,
            `crop=${targetWidth}:${targetHeight}`,
            `subtitles=${subtitlesPath}:force_style='Alignment=2,FontSize=24,MarginV=50'`,
          ]);
        }
      }

      command
        .output(outputPath)
        .on('end', () => {
          this.logger.log(`Clip generated successfully: ${outputPath}`);
          resolve();
        })
        .on('error', (err) => {
          this.logger.error(`Clip generation failed: ${err.message}`, err.stack);
          reject(err);
        })
        .on('progress', (progress) => {
          this.logger.debug(`Processing: ${progress.percent?.toFixed(2)}% done`);
        })
        .run();
    });
  }

  private async generateSubtitles(
    segments: TranscriptionSegment[],
    startTime: number,
    endTime: number,
    outputPath: string,
  ): Promise<string | null> {
    try {
      // Filter segments that fall within the clip time range
      const relevantSegments = segments.filter(
        (seg) => seg.start >= startTime && seg.end <= endTime,
      );

      if (relevantSegments.length === 0) {
        return null;
      }

      // Generate SRT subtitle content
      const srtContent = relevantSegments
        .map((seg, index) => {
          const adjustedStart = seg.start - startTime;
          const adjustedEnd = seg.end - startTime;
          return this.formatSrtEntry(
            index + 1,
            adjustedStart,
            adjustedEnd,
            seg.text,
          );
        })
        .join('\n\n');

      // Save to file
      const srtPath = outputPath.replace(/\.[^.]+$/, '.srt');
      await fs.promises.writeFile(srtPath, srtContent, 'utf-8');

      this.logger.log(`Subtitles generated: ${srtPath}`);
      return srtPath;
    } catch (error) {
      this.logger.error(`Subtitle generation failed: ${error.message}`, error.stack);
      return null;
    }
  }

  private formatSrtEntry(
    index: number,
    startTime: number,
    endTime: number,
    text: string,
  ): string {
    return `${index}\n${this.formatSrtTime(startTime)} --> ${this.formatSrtTime(endTime)}\n${text}`;
  }

  private formatSrtTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 1000);

    return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(secs)},${this.pad(millis, 3)}`;
  }

  private pad(num: number, size: number = 2): string {
    return num.toString().padStart(size, '0');
  }

  async getVideoMetadata(videoPath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(metadata);
        }
      });
    });
  }
}
