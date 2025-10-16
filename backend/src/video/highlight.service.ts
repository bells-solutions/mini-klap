import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { TranscriptionDto, HighlightDto } from './video.dto';

@Injectable()
export class HighlightService {
  private readonly logger = new Logger(HighlightService.name);
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

  async detectHighlights(
    transcription: TranscriptionDto,
    clipCount: number = 3,
  ): Promise<HighlightDto[]> {
    try {
      this.logger.log('Detecting highlights using GPT');
      
      // Check if API key is configured
      const apiKey = this.configService.get<string>('openai.apiKey');
      if (!apiKey) {
        this.logger.warn('Using mock highlights - OpenAI API key not configured');
        return this.getMockHighlights(transcription, clipCount);
      }

      const prompt = this.buildPrompt(transcription, clipCount);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant specialized in analyzing video transcriptions and identifying the most engaging moments for social media clips. Return only valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.highlights || [];
    } catch (error) {
      this.logger.error(`Highlight detection failed: ${error.message}`, error.stack);
      return this.getMockHighlights(transcription, clipCount);
    }
  }

  private buildPrompt(transcription: TranscriptionDto, clipCount: number): string {
    const segmentsText = transcription.segments
      .map((seg) => `[${seg.start}s - ${seg.end}s]: ${seg.text}`)
      .join('\n');

    return `Analyze the following video transcription and identify the ${clipCount} most engaging moments for TikTok, Instagram, and YouTube Shorts clips.

Transcription:
${segmentsText}

For each highlight, provide:
1. startTime: Start time in seconds
2. endTime: End time in seconds (max 60 seconds duration)
3. title: A catchy title for the clip
4. description: A brief description of why this moment is engaging
5. score: Engagement score (0-100)

Return the response in JSON format:
{
  "highlights": [
    {
      "startTime": number,
      "endTime": number,
      "title": string,
      "description": string,
      "score": number
    }
  ]
}`;
  }

  private getMockHighlights(transcription: TranscriptionDto, clipCount: number): HighlightDto[] {
    // Generate mock highlights based on the transcription segments
    const highlights: HighlightDto[] = [];
    const segments = transcription.segments;
    
    if (segments.length === 0) {
      return [];
    }

    // Create highlights from segments
    const segmentsPerClip = Math.max(1, Math.floor(segments.length / clipCount));
    
    for (let i = 0; i < Math.min(clipCount, segments.length); i++) {
      const startSegment = segments[i * segmentsPerClip];
      const endIndex = Math.min((i + 1) * segmentsPerClip, segments.length) - 1;
      const endSegment = segments[endIndex];

      highlights.push({
        startTime: startSegment.start,
        endTime: Math.min(endSegment.end, startSegment.start + 60), // Max 60 seconds
        title: `Highlight ${i + 1}`,
        description: `Engaging moment from ${startSegment.start}s to ${endSegment.end}s`,
        score: 85 - i * 10,
      });
    }

    return highlights;
  }
}
