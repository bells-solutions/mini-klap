export class UploadVideoDto {
  video: Express.Multer.File;
}

export class ProcessVideoDto {
  videoId: string;
  withSubtitles?: boolean;
  clipCount?: number;
}

export class VideoResponseDto {
  id: string;
  filename: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  uploadedAt: Date;
  processedAt?: Date;
  clips?: ClipDto[];
  error?: string;
}

export class ClipDto {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  title: string;
  description: string;
  filename: string;
  url: string;
  hasSubtitles: boolean;
}

export class TranscriptionDto {
  text: string;
  segments: TranscriptionSegment[];
}

export class TranscriptionSegment {
  id: number;
  start: number;
  end: number;
  text: string;
}

export class HighlightDto {
  startTime: number;
  endTime: number;
  title: string;
  description: string;
  score: number;
}
