import React from 'react'
import VideoTable from '../components/VideoTable'
import Button from '../components/ui/Button'
const MyVideosPage = ({onNav}) => {
  return(
    <div className="pb-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary">My Videos</h1>
        <Button onClick={()=>onNav?.('upload')}>⬆️ Upload New</Button>
      </div>
      <VideoTable onEdit={v=>console.log('Edit',v)}/>
    </div>
  )
}

export default MyVideosPage
