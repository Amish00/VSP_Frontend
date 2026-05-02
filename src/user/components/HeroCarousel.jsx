import React,{useState,useEffect,useCallback} from 'react'
import {Eye,Clock,ChevronLeft,ChevronRight} from 'lucide-react'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Avatar from '../components/ui/Avatar'

// ─── Videos ───────────────────────────────────────────────────────────────────
export const VIDEOS = [
  {
    id: 1, ch: 1, paid: false, cat: 'Technology',
    title: 'Build a Full-Stack App with React & Node.js — 2025 Guide',
    views: '1.2M', likes: '42K', dur: '42:18', time: '2 days ago',
    em: '💻', bg: '#030f30',
    desc: 'Complete guide to building production React apps with Node.js backend.',
    tags: ['ReactJS', 'Node.js', 'Full-Stack', 'JavaScript', 'Web Dev'],
    thumb: 'https://picsum.photos/seed/react-nodejs/640/360',
  },
  {
    id: 2, ch: 2, paid: true, cat: 'Design',
    title: 'Advanced Motion Design Masterclass',
    views: '890K', likes: '31K', dur: '1:12:05', time: '5 days ago',
    em: '✨', bg: '#030e24',
    desc: 'Learn professional motion design techniques used by top studios.',
    tags: ['Motion Design', 'Animation', 'After Effects', 'Creative'],
    thumb: 'https://picsum.photos/seed/motion-design/640/360',
  },
  {
    id: 3, ch: 3, paid: false, cat: 'Technology',
    title: 'The Future of AI: A Deep Dive Into What\'s Coming',
    views: '3.1M', likes: '140K', dur: '28:44', time: '1 week ago',
    em: '🤖', bg: '#021520',
    desc: 'Explore the latest breakthroughs in AI and what they mean for the future.',
    tags: ['Artificial Intelligence', 'Machine Learning', 'Tech Trends', 'GPT'],
    thumb: 'https://picsum.photos/seed/ai-future/640/360',
  },
  {
    id: 4, ch: 4, paid: true, cat: 'Design',
    title: 'Cinema Photography Secrets No One Talks About',
    views: '450K', likes: '28K', dur: '19:30', time: '3 days ago',
    em: '📷', bg: '#150f00',
    desc: 'Cinematographers reveal hidden techniques for stunning visuals.',
    tags: ['Photography', 'Cinematography', 'Camera', 'Filmmaking'],
    thumb: 'https://picsum.photos/seed/cinema-photo/640/360',
  },
  {
    id: 5, ch: 5, paid: true, cat: 'Music',
    title: 'Pro Music Production from Scratch — Full Course',
    views: '670K', likes: '51K', dur: '55:00', time: '1 week ago',
    em: '🎵', bg: '#100018',
    desc: 'Produce professional music with free tools only.',
    tags: ['Music Production', 'DAW', 'Beat Making', 'Audio Engineering'],
    thumb: 'https://picsum.photos/seed/music-studio/640/360',
  },
  {
    id: 6, ch: 1, paid: false, cat: 'Lifestyle',
    title: 'Minimal Living: 30-Day Challenge Results',
    views: '2.2M', likes: '96K', dur: '15:22', time: '2 weeks ago',
    em: '🌿', bg: '#001510',
    desc: 'I tried minimalism for 30 days — here\'s what happened.',
    tags: ['Minimalism', 'Lifestyle', '30-Day Challenge', 'Productivity'],
    thumb: 'https://picsum.photos/seed/minimal-living/640/360',
  },
  {
    id: 7, ch: 1, paid: false, cat: 'Technology',
    title: 'System Design Interview — Complete Crash Course',
    views: '560K', likes: '22K', dur: '1:02:10', time: '3 weeks ago',
    em: '🏗️', bg: '#020f1e',
    desc: 'Ace your next system design interview with this comprehensive guide.',
    tags: ['System Design', 'Interview Prep', 'Backend', 'Software Engineering'],
    thumb: 'https://picsum.photos/seed/system-design/640/360',
  },
  {
    id: 8, ch: 2, paid: false, cat: 'Design',
    title: 'Color Theory for UI Designers — Definitive Guide',
    views: '340K', likes: '18K', dur: '34:55', time: '1 month ago',
    em: '🎨', bg: '#030820',
    desc: 'Master colour theory and apply it to beautiful, accessible interfaces.',
    tags: ['Color Theory', 'UI Design', 'UX', 'Design Fundamentals'],
    thumb: 'https://picsum.photos/seed/color-theory/640/360',
  },
]

// ─── Channels ─────────────────────────────────────────────────────────────────
export const CHANNELS = [
  { id: 1, name: 'CodeCraft',    handle: '@codecraft',    avatar: '💻', subs: '128K', bg: '#051535' },
  { id: 2, name: 'DesignLab',   handle: '@designlab',    avatar: '✨', subs: '89K',  bg: '#051535' },
  { id: 3, name: 'TechVision',  handle: '@techvision',   avatar: '🤖', subs: '312K', bg: '#031520' },
  { id: 4, name: 'FrameByFrame',handle: '@fbf',          avatar: '📷', subs: '45K',  bg: '#150f00' },
  { id: 5, name: 'BeatMaker',   handle: '@beatmaker',    avatar: '🎵', subs: '67K',  bg: '#150520' },
]

export const getChannel = (id) => CHANNELS.find(c => c.id === id) || CHANNELS[0]



const HERO=[VIDEOS[2],VIDEOS[0],VIDEOS[4],VIDEOS[5]]
const HeroCarousel = ({onWatch}) => {
  const [idx,setIdx]=useState(0)
  const [paused,setPaused]=useState(false)
  const [touch,setTouch]=useState(null)
  const goTo=useCallback(i=>setIdx(((i%HERO.length)+HERO.length)%HERO.length),[])
  useEffect(()=>{if(paused)return;const t=setInterval(()=>goTo(idx+1),5500);return()=>clearInterval(t)},[idx,paused,goTo])
  const v=HERO[idx],ch=getChannel(v.ch)
  return(
    <section aria-label="Featured videos" aria-roledescription="carousel" className="relative overflow-hidden"
      style={{height:'clamp(300px,44vw,520px)'}}
      onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)}
      onTouchStart={e=>setTouch(e.touches[0].clientX)}
      onTouchEnd={e=>{if(touch===null)return;const dx=touch-e.changedTouches[0].clientX;if(dx>40)goTo(idx+1);if(dx<-40)goTo(idx-1);setTouch(null)}}>
      {v.thumb&&<img src={v.thumb} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" style={{opacity:.3,filter:'brightness(.5) saturate(.8)'}}/>}
      <div className="absolute inset-0" aria-hidden style={{background:'linear-gradient(to top,rgba(8,13,24,.97) 0%,rgba(8,13,24,.65) 50%,rgba(8,13,24,.2) 100%)'}}/>
      <div className="absolute inset-0 pointer-events-none" aria-hidden style={{background:'linear-gradient(to right,rgba(8,13,24,.55) 0%,transparent 35%,transparent 65%,rgba(8,13,24,.55) 100%)'}}/>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end px-4 sm:px-8 md:px-12 pb-4 sm:pb-8">
        <div className="max-w-xs sm:max-w-md lg:max-w-lg">
          <div className="flex gap-2 mb-2 sm:mb-3 items-center flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-primary text-white text-xs font-bold">🔥 FEATURED</span>
            <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-white/8 border border-white/15 text-white/70 text-xs backdrop-blur-sm">{v.cat}</span>
            <Badge text={v.paid?'⭐ PAID':'FREE'} type={v.paid?'paid':'free'}/>
          </div>
          <h1 className="font-display font-black text-text-primary leading-tight mb-2 sm:mb-4 line-clamp-2" style={{fontSize:'clamp(18px,3.5vw,40px)'}}>{v.title}</h1>
          <div className="hidden sm:flex items-center gap-3 mb-3 flex-wrap">
            <Avatar channel={ch} size={24}/><span className="text-sm font-semibold text-text-secondary">{ch.name}</span>
            <span className="flex items-center gap-1 text-sm text-text-secondary"><Eye size={12}/>{v.views}</span>
            <span className="flex items-center gap-1 text-sm text-text-secondary"><Clock size={12}/>{v.dur}</span>
          </div>
          <Button onClick={()=>onWatch(v)} size="md">▶ Watch Now</Button>
        </div>
        <div className="flex flex-col items-end gap-3 pb-1 flex-shrink-0 ml-4">
          <div className="flex gap-1.5" role="tablist">
            {HERO.map((_,i)=><button key={i} role="tab" aria-selected={i===idx} onClick={()=>goTo(i)} className="rounded-full transition-all duration-300" style={{height:5,width:i===idx?24:5,background:i===idx?'#2563EB':'rgba(255,255,255,.25)'}}/>)}
          </div>
          <div className="hidden sm:flex gap-2">
            <button onClick={()=>goTo(idx-1)} aria-label="Previous" className="w-9 h-9 rounded-xl border border-white/15 bg-white/8 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/15 transition-all"><ChevronLeft size={16}/></button>
            <button onClick={()=>goTo(idx+1)} aria-label="Next"     className="w-9 h-9 rounded-xl border border-white/15 bg-white/8 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/15 transition-all"><ChevronRight size={16}/></button>
          </div>
        </div>
      </div>
      <div className="absolute top-5 right-4 px-2.5 py-0.5 rounded-full bg-black/45 backdrop-blur-sm text-white/60 text-xs font-mono" aria-live="polite">{idx+1} / {HERO.length}</div>
    </section>
  )
}

export default HeroCarousel
