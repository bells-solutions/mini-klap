# Quick Start Guide

Get MiniKlap up and running in minutes!

## Prerequisites

- Node.js 20.x or later
- FFmpeg installed
- OpenAI API key (optional for development)

## Installation Steps

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/bells-solutions/mini-klap.git
cd mini-klap

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

**Backend (.env):**
```bash
cd backend
cp .env.example .env
# Edit .env and add your OpenAI API key (optional)
```

**Frontend (.env):**
```bash
cd ../frontend
cp .env.example .env
# Default configuration works for local development
```

### 3. Start the Application

**Option A: Run Both Services (Recommended for Development)**

Terminal 1 - Backend:
```bash
cd backend
npm run start:dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Access the app at: **http://localhost:5173**

**Option B: Using Docker (Recommended for Production)**

```bash
# From the root directory
docker-compose up
```

Access the app at: **http://localhost**

## First Video Upload

1. Open **http://localhost:5173** in your browser
2. Drag and drop a video file or click to browse
3. Configure options:
   - Toggle subtitles on/off
   - Set number of clips (1-10)
4. Click "Generate Clips"
5. Wait for processing (uses mock data without API key)
6. Download your clips!

## Development Mode (Without OpenAI API Key)

MiniKlap includes mock data for development:
- **Transcription**: Returns sample text with 3 segments
- **Highlights**: Generates clips based on video segments
- **Video Processing**: Creates actual 9:16 clips with FFmpeg

This allows you to test the full workflow without an API key!

## Adding Your OpenAI API Key

To enable real AI features:

1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Add to `backend/.env`:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```
3. Restart the backend server

## Troubleshooting

### FFmpeg not found
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Windows
Download from https://ffmpeg.org/download.html
```

### Port already in use
Change the port in `backend/.env`:
```
PORT=3001
```

And in `frontend/.env`:
```
VITE_API_URL=http://localhost:3001
```

### Upload fails
Check file size limits in `backend/.env`:
```
MAX_FILE_SIZE=104857600  # 100MB in bytes
```

## Next Steps

- Read the [full README](../README.md) for detailed information
- Explore the API endpoints
- Customize video processing settings
- Deploy to production with Docker

## Support

- Create an issue on GitHub
- Check the documentation
- Review the code examples

Happy clipping! 🎬
