import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { TranscriptionService } from './transcription.service';
import { HighlightService } from './highlight.service';
import { VideoProcessingService } from './video-processing.service';

@Module({
  controllers: [VideoController],
  providers: [
    VideoService,
    TranscriptionService,
    HighlightService,
    VideoProcessingService,
  ],
  exports: [VideoService],
})
export class VideoModule {}
