'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import VideoUpload from '@/components/ui/video-upload'
import ImageUpload from '@/components/ui/image-upload'
import PageLayout from '@/components/layout/PageLayout'
import { Video, Image, Upload } from 'lucide-react'

export default function VideoDemo() {
  const [videos, setVideos] = useState([])
  const [images, setImages] = useState([])

  return (
    <PageLayout title="Upload Demo" titleKu="نموونەی بارکردن">
      <div className="space-y-8">
        {/* Video Upload Demo */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Video className="h-6 w-6 text-blue-600" />
              Video Upload Demo
              <span className="text-base text-gray-600 dark:text-gray-400">/ نموونەی بارکردنی ڤیدیۆ</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VideoUpload
              videos={videos}
              onVideosChange={setVideos}
              maxVideos={3}
              placeholder="Upload Your Videos"
              className="mb-4"
            />
            {videos.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-green-800 dark:text-green-200 font-medium">
                  ✅ {videos.length} video{videos.length !== 1 ? 's' : ''} uploaded successfully!
                </p>
                <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                  {videos.map((video, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{video.originalName}</span>
                      <span>{(video.size / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Image Upload Demo for Comparison */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Image className="h-6 w-6 text-green-600" />
              Image Upload Demo (for comparison)
              <span className="text-base text-gray-600 dark:text-gray-400">/ نموونەی بارکردنی وێنە</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              images={images}
              onImagesChange={setImages}
              maxImages={4}
              className="mb-4"
            />
            {images.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                  ✅ {images.length} image{images.length !== 1 ? 's' : ''} uploaded successfully!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="shadow-lg border-dashed border-2 border-blue-300 dark:border-blue-600">
          <CardContent className="p-6 text-center">
            <Upload className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
              How to Test Upload Functionality
            </h3>
            <div className="text-left max-w-2xl mx-auto space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>🎥 <strong>Video Upload:</strong> Supports MP4, AVI, MOV, WebM (Max 50MB each)</p>
              <p>🖼️ <strong>Image Upload:</strong> Supports JPG, PNG, GIF, WebP (Max 5MB each)</p>
              <p>📱 <strong>Features:</strong> Drag & drop, preview, download, remove</p>
              <p>🎛️ <strong>Video Controls:</strong> Play/pause, mute/unmute, fullscreen preview</p>
              <p>📁 <strong>Storage:</strong> Files saved to <code>/public/upload/Video_Psl/</code> and <code>/public/upload/Image_Psl/</code></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}