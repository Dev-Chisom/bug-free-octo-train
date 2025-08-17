# api.video Integration

This directory contains the api.video integration for video upload, processing, and playback using web components.

## Features

- ✅ **Video Upload**: Upload videos to api.video with progress tracking
- ✅ **Video Processing**: Automatic video optimization and transcoding
- ✅ **Video Playback**: Play videos using api.video web components
- ✅ **React Query Integration**: Caching and background updates
- ✅ **TypeScript Support**: Full type safety
- ✅ **Error Handling**: Robust error handling and retries
- ✅ **Progress Tracking**: Real-time upload progress
- ✅ **Status Monitoring**: Track video processing status

## Setup

### 1. Environment Variables

Add these environment variables to your `.env.local`:

```bash
NEXT_PUBLIC_API_VIDEO_API_KEY=your_api_video_api_key
NEXT_PUBLIC_API_VIDEO_ENVIRONMENT=sandbox  # or 'production'
```

### 2. Get API Key

1. Sign up at [api.video](https://api.video)
2. Get your API key from the dashboard
3. Add it to your environment variables

## Usage

### Basic Video Upload

```tsx
import { useVideoUpload } from '@/lib/api-video/hooks'

function MyComponent() {
  const { uploadVideo, isUploading, error } = useVideoUpload()

  const handleUpload = async (file: File) => {
    try {
      const videoId = await uploadVideo(
        file,
        {
          title: 'My Video',
          description: 'Video description',
          tags: ['tag1', 'tag2'],
        },
        (progress) => {
          console.log(`Upload progress: ${progress}%`)
        }
      )
      
      console.log('Uploaded video ID:', videoId)
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  return (
    <div>
      <input type="file" accept="video/*" onChange={(e) => {
        const file = e.target.files?.[0]
        if (file) handleUpload(file)
      }} />
      {isUploading && <p>Uploading...</p>}
      {error && <p>Error: {error.message}</p>}
    </div>
  )
}
```

### Video Player Component

```tsx
import { VideoPlayer } from '@/components/ui/video-player'

function MyVideoPlayer() {
  return (
    <VideoPlayer
      videoId="your_video_id"
      controls={true}
      autoplay={false}
      muted={true}
      width="100%"
      height="400px"
      onPlay={() => console.log('Video started')}
      onPause={() => console.log('Video paused')}
      onError={(error) => console.error('Video error:', error)}
    />
  )
}
```

### Check Video Status

```tsx
import { useApiVideoStatus } from '@/lib/api-video/hooks'

function VideoStatus({ videoId }: { videoId: string }) {
  const { data: status, isLoading } = useApiVideoStatus(videoId)

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <p>Status: {status?.status}</p>
      {status?.status === 'ready' && <p>Video is ready to play!</p>}
      {status?.status === 'processing' && <p>Video is being processed...</p>}
    </div>
  )
}
```

## Components

### ApiVideoPlayer

A React wrapper around the api.video web component.

```tsx
import { ApiVideoPlayer } from '@/components/ui/api-video-player'

<ApiVideoPlayer
  videoId="your_video_id"
  autoplay={false}
  muted={true}
  controls={true}
  onPlay={() => console.log('Playing')}
  onPause={() => console.log('Paused')}
/>
```

### VideoPlayer

A comprehensive video player that supports both regular video files and api.video videos.

```tsx
import { VideoPlayer } from '@/components/ui/video-player'

<VideoPlayer
  src="video_url" // For regular videos
  videoId="api_video_id" // For api.video videos
  controls={true}
  autoplay={false}
  muted={true}
/>
```

## Hooks

### useVideoUpload

Upload videos to api.video with progress tracking.

```tsx
const { uploadVideo, isUploading, error } = useVideoUpload()
```

### useApiVideoStatus

Check the processing status of a video.

```tsx
const { data: status } = useApiVideoStatus(videoId)
```

### useApiVideo

Get video details from api.video.

```tsx
const { data: video } = useApiVideo(videoId)
```

## Configuration

### File Size Limits

- **Maximum file size**: 100MB
- **Supported formats**: MP4, WebM, OGG, QuickTime

### Processing Settings

- **Thumbnail generation**: Enabled
- **Poster generation**: Enabled
- **Quality**: Medium (configurable)

### Player Settings

- **Autoplay**: Disabled by default
- **Muted**: Enabled by default
- **Controls**: Enabled by default
- **Loop**: Disabled by default

## Demo

Visit `/demo/api-video` to see a working demo of the api.video integration.

## Error Handling

The integration includes comprehensive error handling:

- **File validation**: Size and format checks
- **Upload errors**: Network and API errors
- **Processing errors**: Video processing failures
- **Player errors**: Playback issues

## Performance

- **Caching**: Videos are cached for 5 minutes
- **Background updates**: Status is updated automatically
- **Optimized loading**: Videos load progressively
- **Adaptive streaming**: Automatic quality adjustment

## Security

- **API key**: Stored in environment variables
- **File validation**: Client-side and server-side checks
- **Error sanitization**: Safe error messages
- **CORS handling**: Proper cross-origin requests 