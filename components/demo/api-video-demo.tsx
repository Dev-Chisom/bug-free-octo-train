'use client'

import React, { useState } from 'react'
import { Upload, Play, Pause, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VideoPlayer } from '@/components/ui/video-player'
import { useVideoUpload } from '@/lib/api-video/hooks'
import { useApiVideoStatus } from '@/lib/api-video/hooks'
import { toast } from 'sonner'

export const ApiVideoDemo: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedVideoId, setUploadedVideoId] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const { uploadVideo, isUploading, error } = useVideoUpload()
  const { data: videoStatus } = useApiVideoStatus(uploadedVideoId || '')

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a video file')
        return
      }

      // Validate file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        toast.error('File size must be less than 100MB')
        return
      }

      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a video file first')
      return
    }

    try {
      const videoId = await uploadVideo(
        selectedFile,
        {
          title: selectedFile.name,
          description: 'Uploaded via api.video demo',
          tags: ['demo', 'upload'],
          metadata: {
            uploadedVia: 'demo-component',
            originalSize: selectedFile.size,
          },
        },
        (progress) => {
          setUploadProgress(progress)
        }
      )

      setUploadedVideoId(videoId)
      toast.success('Video uploaded successfully!')
    } catch (error) {
      // Upload error occurred
      toast.error('Failed to upload video')
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ready':
        return 'text-green-500'
      case 'processing':
        return 'text-yellow-500'
      case 'uploading':
        return 'text-blue-500'
      case 'failed':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">api.video Integration Demo</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload and play videos using api.video web components
        </p>
      </div>

      {/* File Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Upload Video</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Video File
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
            />
          </div>

          {selectedFile && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
              <p className="text-sm">
                <strong>Selected:</strong> {selectedFile.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading... {uploadProgress.toFixed(1)}%
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Video
              </>
            )}
          </Button>

          {error && (
            <div className="text-red-500 text-sm">
              Error: {error.message}
            </div>
          )}
        </div>
      </div>

      {/* Upload Status */}
      {uploadedVideoId && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Upload Status</h2>
          
          <div className="space-y-2">
            <p className="text-sm">
              <strong>Video ID:</strong> {uploadedVideoId}
            </p>
            <p className="text-sm">
              <strong>Status:</strong>{' '}
              <span className={getStatusColor(videoStatus?.status)}>
                {videoStatus?.status || 'Unknown'}
              </span>
            </p>
            {videoStatus?.error && (
              <p className="text-sm text-red-500">
                Error: {videoStatus.error}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Video Player */}
      {uploadedVideoId && videoStatus?.status === 'ready' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Video Player</h2>
          
          <div className="aspect-video rounded-lg overflow-hidden">
            <VideoPlayer
              src=""
              videoId={uploadedVideoId}
              controls={true}
              autoplay={false}
              muted={true}
              className="w-full h-full"
              onPlay={() => {
                // Video started playing
              }}
              onPause={() => {
                // Video paused
              }}
              onError={(error) => {/* Video error occurred */}}
            />
          </div>
        </div>
      )}

      {/* Processing Status */}
      {uploadedVideoId && videoStatus?.status === 'processing' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Processing Video</h2>
          
          <div className="flex items-center space-x-3">
            <Loader2 className="w-5 h-5 animate-spin text-yellow-500" />
            <span className="text-yellow-500">
              Video is being processed. This may take a few minutes...
            </span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-200">
          How it works:
        </h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Select a video file (MP4, WebM, OGG, or QuickTime)</li>
          <li>• Click upload to send the video to api.video</li>
          <li>• Wait for processing to complete</li>
          <li>• Play the video using the api.video web component</li>
          <li>• Videos are automatically optimized for different devices and connections</li>
        </ul>
      </div>
    </div>
  )
} 