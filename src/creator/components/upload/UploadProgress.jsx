// src/components/upload/UploadProgress.js
import React from 'react'
import Button from '../ui/Button'

const UploadProgress = ({ file, onDone, error, isUploading }) => {
  // Success state
  if (!isUploading && !error) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-success/15 border-2 border-success flex items-center justify-center text-3xl mx-auto mb-4">✓</div>
        <h2 className="font-display text-2xl font-extrabold mb-2 text-text-primary">Video Submitted!</h2>
        <p className="text-text-secondary text-sm mb-6 leading-relaxed">Your upload finished and the video is now under review. You'll be notified once it goes live.</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={onDone}>Upload Another</Button>
          <Button variant="ghost" onClick={onDone}>View My Videos</Button>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-red-500/15 border-2 border-red-500 flex items-center justify-center text-3xl mx-auto mb-4">⚠️</div>
        <h2 className="font-display text-2xl font-bold mb-2 text-text-primary">Upload Failed</h2>
        <p className="text-sm text-text-secondary mb-4">{error}</p>
        <Button onClick={onDone}>Try Again</Button>
      </div>
    )
  }

  // Loading state (isUploading === true)
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4" aria-hidden>📤</div>
      <h2 className="font-display text-2xl font-bold mb-2 text-text-primary">Uploading…</h2>
      <p className="text-sm text-text-secondary mb-4">{file?.name || 'Video file'} is being uploaded to the server.</p>
      <div className="max-w-md mx-auto">
        <div className="h-2 bg-bg-el rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-pulse w-1/2"></div>
        </div>
      </div>
      <p className="text-sm text-text-muted mt-2">Please do not close this window.</p>
    </div>
  )
}

export default UploadProgress