# API Documentation

## Base URL

```
http://localhost:3000
```

## Endpoints

### 1. Upload Video

Upload a video file for processing.

**Endpoint:** `POST /api/videos/upload`

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with `video` field containing the video file

**Example (curl):**
```bash
curl -X POST http://localhost:3000/api/videos/upload \
  -F "video=@path/to/your/video.mp4"
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "550e8400-e29b-41d4-a716-446655440000.mp4",
  "status": "uploading",
  "uploadedAt": "2025-10-15T23:57:30.638Z"
}
```

### 2. Process Video

Start processing a video to generate clips.

**Endpoint:** `POST /api/videos/:id/process`

**Request Body:**
```json
{
  "withSubtitles": true,
  "clipCount": 3
}
```

**Parameters:**
- `withSubtitles` (boolean, optional): Add subtitles to clips. Default: false
- `clipCount` (number, optional): Number of clips to generate (1-10). Default: 3

**Example (curl):**
```bash
curl -X POST http://localhost:3000/api/videos/550e8400-e29b-41d4-a716-446655440000/process \
  -H "Content-Type: application/json" \
  -d '{"withSubtitles": true, "clipCount": 3}'
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "550e8400-e29b-41d4-a716-446655440000.mp4",
  "status": "processing",
  "uploadedAt": "2025-10-15T23:57:30.638Z"
}
```

### 3. Get Video Status

Check the processing status and get clips when ready.

**Endpoint:** `GET /api/videos/:id`

**Example (curl):**
```bash
curl http://localhost:3000/api/videos/550e8400-e29b-41d4-a716-446655440000
```

**Response (Processing):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "550e8400-e29b-41d4-a716-446655440000.mp4",
  "status": "processing",
  "uploadedAt": "2025-10-15T23:57:30.638Z"
}
```

**Response (Completed):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "550e8400-e29b-41d4-a716-446655440000.mp4",
  "status": "completed",
  "uploadedAt": "2025-10-15T23:57:30.638Z",
  "processedAt": "2025-10-15T23:59:45.123Z",
  "clips": [
    {
      "id": "clip-uuid-1",
      "startTime": 0,
      "endTime": 15,
      "duration": 15,
      "title": "Highlight 1",
      "description": "Engaging moment from 0s to 15s",
      "filename": "550e8400-e29b-41d4-a716-446655440000_clip_1_clip-uuid-1.mp4",
      "url": "/api/videos/550e8400-e29b-41d4-a716-446655440000/clips/550e8400-e29b-41d4-a716-446655440000_clip_1_clip-uuid-1.mp4",
      "hasSubtitles": true
    }
  ]
}
```

### 4. List All Videos

Get all uploaded videos.

**Endpoint:** `GET /api/videos`

**Example (curl):**
```bash
curl http://localhost:3000/api/videos
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "filename": "video1.mp4",
    "status": "completed",
    "uploadedAt": "2025-10-15T23:57:30.638Z",
    "processedAt": "2025-10-15T23:59:45.123Z",
    "clips": [...]
  }
]
```

### 5. Download Clip

Download a generated clip.

**Endpoint:** `GET /api/videos/:id/clips/:filename`

**Example (curl):**
```bash
curl -O http://localhost:3000/api/videos/550e8400-e29b-41d4-a716-446655440000/clips/550e8400-e29b-41d4-a716-446655440000_clip_1_clip-uuid-1.mp4
```

**Response:**
- Binary video file (MP4)
- Content-Type: `video/mp4`
- Content-Disposition: `attachment; filename="..."`

### 6. Delete Video

Delete a video and all its generated clips.

**Endpoint:** `DELETE /api/videos/:id`

**Example (curl):**
```bash
curl -X DELETE http://localhost:3000/api/videos/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "message": "Video deleted successfully"
}
```

## Status Codes

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request data
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Video Status Flow

1. **uploading**: Video uploaded, ready to process
2. **processing**: AI transcription and clip generation in progress
3. **completed**: All clips generated successfully
4. **failed**: Processing failed (check error field)

## Processing Workflow

```
Upload Video (POST /api/videos/upload)
    ↓
Get Video ID
    ↓
Start Processing (POST /api/videos/:id/process)
    ↓
Poll Status (GET /api/videos/:id)
    ↓
Status = "processing" → Wait 5s → Poll Again
    ↓
Status = "completed" → Get Clips URLs
    ↓
Download Clips (GET /api/videos/:id/clips/:filename)
```

## Example: Full Workflow with JavaScript

```javascript
// 1. Upload video
const formData = new FormData();
formData.append('video', videoFile);

const uploadResponse = await fetch('http://localhost:3000/api/videos/upload', {
  method: 'POST',
  body: formData,
});
const video = await uploadResponse.json();

// 2. Start processing
await fetch(`http://localhost:3000/api/videos/${video.id}/process`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ withSubtitles: true, clipCount: 3 }),
});

// 3. Poll for completion
const pollInterval = setInterval(async () => {
  const statusResponse = await fetch(`http://localhost:3000/api/videos/${video.id}`);
  const status = await statusResponse.json();
  
  if (status.status === 'completed') {
    clearInterval(pollInterval);
    console.log('Clips ready:', status.clips);
  } else if (status.status === 'failed') {
    clearInterval(pollInterval);
    console.error('Processing failed:', status.error);
  }
}, 5000);

// 4. Download clips
for (const clip of video.clips) {
  const downloadUrl = `http://localhost:3000${clip.url}`;
  // Trigger download or display in UI
}
```

## Rate Limiting

Currently no rate limiting is implemented. For production use, consider adding rate limiting middleware.

## CORS

CORS is enabled for the frontend URL specified in environment variables (default: http://localhost:5173).

## File Size Limits

Default maximum file size: 100MB (configurable via `MAX_FILE_SIZE` environment variable)

## Supported Video Formats

Any format supported by FFmpeg, including:
- MP4
- MOV
- AVI
- MKV
- WebM
- And many more...
