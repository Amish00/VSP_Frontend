import React,{useState} from 'react'
import {ChevronRight,Eye,Clock} from 'lucide-react'
import Badge from '../ui/Badge'
const VideoDescription = ({video}) => {
  const [exp,setExp]=useState(false)
  return(
    <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-bg-card border border-border mb-6" style={{boxShadow:'0 2px 12px rgba(0,0,0,.2)'}}>
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <span className="flex items-center gap-1.5 text-sm text-text-secondary"><Eye size={13}/>{video.views} views</span>
        <span className="flex items-center gap-1.5 text-sm text-text-secondary"><Clock size={13}/>{video.time}</span>
        <Badge text={video.paid?'PAID':'FREE'} type={video.paid?'paid':'free'}/>
        {video.cat&&<span className="px-2.5 py-0.5 rounded-full bg-bg-el border border-border text-xs text-text-secondary">{video.cat}</span>}
      </div>
      <p className={`text-sm text-text-secondary leading-relaxed mb-3 ${!exp?'line-clamp-2':''}`}>{video.desc}</p>
      <button onClick={()=>setExp(p=>!p)} className="text-sm text-primary-light font-semibold hover:opacity-80 flex items-center gap-1" aria-expanded={exp}>
        {exp?'Show less':'Show more'}<ChevronRight size={13} className={`transition-transform ${exp?'rotate-90':''}`}/>
      </button>
      {video.tags?.length>0&&<div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
        {video.tags.map(t=><span key={t} className="px-2.5 py-1 rounded-full bg-primary/8 border border-primary/20 text-primary-light text-xs font-medium cursor-pointer hover:bg-primary/15">#{t}</span>)}
      </div>}
    </div>
  )
}

export default VideoDescription
