import { ApiVideoDemo } from '@/components/demo/api-video-demo'

export default function ApiVideoTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">api.video Integration Test</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test the api.video integration with upload and playback
          </p>
        </div>
        
        <ApiVideoDemo />
      </div>
    </div>
  )
} 