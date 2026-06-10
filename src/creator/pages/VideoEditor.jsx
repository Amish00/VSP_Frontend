import React from 'react'
import TopBar from '../components/videoeditor/components/TopBar'
import LeftToolbar from '../components/videoeditor/components//LeftToolbar'
import LeftPanel from '../components/videoeditor/components/LeftPanel'
import Preview from '../components/videoeditor/components/Preview'
import RightPanel from '../components/videoeditor/components/RightPanel'
import Transport from '../components/videoeditor/components/Transport'
import Timeline from '../components/videoeditor/components/Timeline'
import { usePlayback } from '../components/videoeditor/hooks/usePlayback'

const VideoEditor = () => {
  usePlayback()
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0a0a0a' }}>
      <TopBar />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <LeftToolbar />
        <LeftPanel />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <Preview />
          <Transport />
        </div>
        <RightPanel />
      </div>
      <Timeline />
    </div>
  )
}

export default VideoEditor