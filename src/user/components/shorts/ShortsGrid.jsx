import React from 'react'
import ShortsCard from './ShortsCard'
const ShortsGrid = ({shorts=[],onPlay,cols='grid-cols-3 sm:grid-cols-4 lg:grid-cols-6'}) => {
  return(
    <div className={`grid ${cols} gap-2.5`} role="list">
      {shorts.map(s=><div key={s.id} role="listitem"><ShortsCard short={s} onPlay={onPlay}/></div>)}
    </div>
  )
}

export default ShortsGrid
