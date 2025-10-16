import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import * as fs from 'fs';
import { TranscriptionDto, TranscriptionSegment } from './video.dto';

@Injectable()
export class TranscriptionService {
  private readonly logger = new Logger(TranscriptionService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('openai.apiKey');
    if (!apiKey) {
      this.logger.warn('OpenAI API key not configured');
    }
    this.openai = new OpenAI({
      apiKey: apiKey || 'dummy-key',
    });
  }

  async transcribeVideo(videoPath: string): Promise<TranscriptionDto> {
    try {
      this.logger.log(`Transcribing video: ${videoPath}`);
      
      // Check if API key is configured
      const apiKey = this.configService.get<string>('openai.apiKey');
      if (!apiKey) {
        this.logger.warn('Using mock transcription - OpenAI API key not configured');
        return this.getMockTranscription();
      }

      // Read the video file
      const fileStream = fs.createReadStream(videoPath);

      // Call OpenAI Whisper API
      const response = await this.openai.audio.transcriptions.create({
        file: fileStream,
        model: 'whisper-1',
        response_format: 'verbose_json',
        timestamp_granularities: ['segment'],
      });

      // Transform the response to our DTO
      const segments: TranscriptionSegment[] = (response as any).segments?.map(
        (seg: any, index: number) => ({
          id: index,
          start: seg.start,
          end: seg.end,
          text: seg.text,
        }),
      ) || [];

      return {
        text: response.text,
        segments,
      };
    } catch (error) {
      this.logger.error(`Transcription failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  private getMockTranscription(): TranscriptionDto {
    // Mock transcription for development/testing
    return {
      text: 'This is a sample video transcription. In this video, we discuss important topics and share valuable insights. The content is engaging and perfect for social media clips.',
      segments: [
        {
          id: 0,
          start: 0,
          end: 15,
          text: 'This is a sample video transcription.',
        },
        {
          id: 1,
          start: 15,
          end: 35,
          text: 'In this video, we discuss important topics and share valuable insights.',
        },
        {
          id: 2,
          start: 35,
          end: 60,
          text: 'The content is engaging and perfect for social media clips.',
        },
      ],
    };
  }
}
