import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
  Res,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import * as fs from 'fs';
import { VideoService } from './video.service';
import { ProcessVideoDto, VideoResponseDto } from './video.dto';

@Controller('api/videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('video'))
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<VideoResponseDto> {
    if (!file) {
      throw new BadRequestException('No video file provided');
    }

    return this.videoService.uploadVideo(file);
  }

  @Post(':id/process')
  async processVideo(
    @Param('id') id: string,
    @Body() processDto: ProcessVideoDto,
  ): Promise<VideoResponseDto> {
    // Start processing asynchronously
    this.videoService.processVideo(id, processDto).catch((error) => {
      console.error(`Background processing failed for video ${id}:`, error);
    });

    // Return immediately with processing status
    return this.videoService.getVideo(id);
  }

  @Get()
  async getAllVideos(): Promise<VideoResponseDto[]> {
    return this.videoService.getAllVideos();
  }

  @Get(':id')
  async getVideo(@Param('id') id: string): Promise<VideoResponseDto> {
    return this.videoService.getVideo(id);
  }

  @Get(':id/clips/:filename')
  async downloadClip(
    @Param('id') id: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    const clipPath = this.videoService.getClipPath(id, filename);

    if (!fs.existsSync(clipPath)) {
      res.status(HttpStatus.NOT_FOUND).send('Clip not found');
      return;
    }

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const fileStream = fs.createReadStream(clipPath);
    fileStream.pipe(res);
  }

  @Delete(':id')
  async deleteVideo(@Param('id') id: string): Promise<{ message: string }> {
    await this.videoService.deleteVideo(id);
    return { message: 'Video deleted successfully' };
  }
}
