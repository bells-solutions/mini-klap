# MiniKlap 🎬

Transform long videos into viral short clips for TikTok, Instagram, and YouTube Shorts.

## Overview

MiniKlap is an AI-powered web application that automatically analyzes videos, transcribes audio using OpenAI Whisper, detects the most engaging moments with GPT, and generates vertical 9:16 clips perfect for social media. With optional subtitles and one-click downloads, creating viral content has never been easier.

## Features

- 🎥 **Video Upload**: Drag & drop or browse to upload videos
- 🤖 **AI Transcription**: Automatic audio transcription using OpenAI Whisper
- ✨ **Smart Highlights**: GPT-powered detection of engaging moments
- 📱 **Vertical Format**: Automatic 9:16 aspect ratio conversion for social media
- 📝 **Subtitles**: Optional subtitle generation for better engagement
- ⬇️ **Easy Export**: One-click download of generated clips
- 🔗 **Share**: Built-in sharing functionality

## Tech Stack

### Backend (NestJS)
- **Framework**: NestJS (TypeScript)
- **AI Services**: 
  - OpenAI Whisper for transcription
  - GPT-4 for highlight detection
- **Video Processing**: FFmpeg for clip generation
- **Storage**: Local file system

### Frontend (Vue.js)
- **Framework**: Vue 3 with TypeScript
- **State Management**: Pinia
- **Routing**: Vue Router
- **Styling**: Scoped CSS with modern gradient design
- **API Communication**: Axios

## Prerequisites

- Node.js 20.x or later
- npm 10.x or later
- FFmpeg installed on your system
- OpenAI API key

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/bells-solutions/mini-klap.git
cd mini-klap
```

### 2. Backend Setup

```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and add your OpenAI API key
```

**Backend Environment Variables** (`.env`):
```env
PORT=3000
FRONTEND_URL=http://localhost:5173
OPENAI_API_KEY=your_openai_api_key_here
MAX_FILE_SIZE=104857600
UPLOAD_DIR=./uploads
CLIPS_DIR=./clips
CLIP_DURATION=60
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install

# Configure environment variables (optional)
cp .env.example .env
```

**Frontend Environment Variables** (`.env`):
```env
VITE_API_URL=http://localhost:3000
```

### 4. Install FFmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**Windows:**
Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Production Mode

**Backend:**
```bash
cd backend
npm run build
npm run start:prod
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## Usage

1. **Upload Video**: Open the web app and drag & drop a video or click to browse
2. **Configure Options**: 
   - Choose number of clips to generate (1-10)
   - Toggle subtitle generation on/off
3. **Generate Clips**: Click "Generate Clips" and wait for processing
4. **Download**: Once complete, download individual clips or share directly

## API Endpoints

### Video Management
- `POST /api/videos/upload` - Upload a video
- `POST /api/videos/:id/process` - Process video and generate clips
- `GET /api/videos` - List all videos
- `GET /api/videos/:id` - Get video details
- `GET /api/videos/:id/clips/:filename` - Download a clip
- `DELETE /api/videos/:id` - Delete a video and its clips

## Project Structure

```
mini-klap/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration
│   │   ├── video/           # Video module
│   │   │   ├── video.controller.ts
│   │   │   ├── video.service.ts
│   │   │   ├── transcription.service.ts
│   │   │   ├── highlight.service.ts
│   │   │   └── video-processing.service.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── uploads/            # Uploaded videos (gitignored)
│   ├── clips/              # Generated clips (gitignored)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/       # API service
│   │   ├── stores/         # Pinia stores
│   │   ├── types/          # TypeScript types
│   │   ├── views/          # Page components
│   │   ├── App.vue
│   │   └── main.ts
│   └── package.json
└── README.md
```

## Development

### Backend Testing
```bash
cd backend
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
```

### Frontend Testing
```bash
cd frontend
npm run test:unit     # Unit tests with Vitest
```

### Linting
```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

## Configuration

### Video Processing Settings

The backend can be configured via environment variables:

- `MAX_FILE_SIZE`: Maximum upload size in bytes (default: 100MB)
- `CLIP_DURATION`: Maximum clip duration in seconds (default: 60)
- `UPLOAD_DIR`: Directory for uploaded videos
- `CLIPS_DIR`: Directory for generated clips

### OpenAI Settings

- **Whisper Model**: Uses `whisper-1` for transcription
- **GPT Model**: Uses `gpt-4` for highlight detection

## Limitations

- Maximum file size: 100MB (configurable)
- Maximum clip duration: 60 seconds
- Supported formats: MP4, MOV, AVI, and other FFmpeg-compatible formats
- Requires OpenAI API key for production use (mock data available for development)

## Troubleshooting

### "FFmpeg not found" error
Make sure FFmpeg is installed and available in your system PATH.

### "OpenAI API key not configured"
The application will use mock data for transcription and highlights. Add your API key to `.env` for full functionality.

### Upload fails
Check the `MAX_FILE_SIZE` setting and ensure your video is within the limit.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- OpenAI for Whisper and GPT APIs
- NestJS and Vue.js communities
- FFmpeg project for video processing capabilities

---

Built with ❤️ by bells-solutions
