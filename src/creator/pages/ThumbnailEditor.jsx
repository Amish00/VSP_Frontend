import React from 'react'
import TopBar from '../components/thumbnaileditor/TopBar'
import LeftToolbar from '../components/thumbnaileditor/LeftToolbar'
import LeftPanel from '../components/thumbnaileditor/LeftPanel'
import Canvas from '../components/thumbnaileditor/Canvas'
import PagesPanel from '../components/thumbnaileditor/PagesPanel'
import RightPanel from '../components/thumbnaileditor/RightPanel'
import { editorTheme } from '../components/thumbnaileditor/theme'

const ThumbnailEditor = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: editorTheme.base, color: editorTheme.text }}>
      <TopBar />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <LeftToolbar />
        <LeftPanel />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Canvas />
          <PagesPanel />
        </div>
        <RightPanel />
      </div>
    </div>
  )
}

export default ThumbnailEditor
