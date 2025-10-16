export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600', 10), // 100MB
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    clipsDir: process.env.CLIPS_DIR || './clips',
  },
  video: {
    targetAspectRatio: '9:16',
    targetWidth: 1080,
    targetHeight: 1920,
    clipDuration: parseInt(process.env.CLIP_DURATION || '60', 10), // seconds
  },
});
