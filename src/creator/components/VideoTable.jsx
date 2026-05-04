import React,{useState} from 'react'
import Badge from '../components/ui/Badge'

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

const FILTERS=['All','Approved','Pending','Rejected']
const VideoTable = ({onEdit}) => {
  const [filter,setFilter]=useState('All')
  const rows=VIDEOS.map((v,i)=>({...v,status:['Published','Pending','Rejected','Published'][i%4]||'Published',uploadDate:'2025-0'+(i+1)+'-15',editedViews:v.views}))
  const shown=filter==='All'?rows:rows.filter(r=>r.status===filter)
  return(
    <div>
      <div className="flex gap-1 p-1 bg-bg-el border border-border rounded-xl mb-4 w-fit flex-wrap">
        {FILTERS.map(f=><button key={f} onClick={()=>setFilter(f)} className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${filter===f?'bg-primary text-white':'text-text-secondary hover:text-text-primary'}`}>{f}</button>)}
      </div>
      <div className="bg-bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-sm" style={{minWidth:600}}>
          <thead><tr className="border-b border-border bg-bg-el">
            {['Video','Status','Views','Date','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider whitespace-nowrap">{h}</th>)}
          </tr></thead>
          <tbody>
            {shown.map(v=><tr key={v.id} className="trow border-b border-border/50 last:border-0">
              <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-14 h-8 rounded-lg bg-bg-el overflow-hidden flex items-center justify-center text-lg flex-shrink-0">{v.em}</div><span className="font-medium text-text-primary line-clamp-1 max-w-[200px]">{v.title}</span></div></td>
              <td className="px-4 py-3"><Badge text={v.status} type={v.status==='Published'?'approved':v.status==='Pending'?'pending':'rejected'}/></td>
              <td className="px-4 py-3 text-text-secondary tabular-nums">{v.editedViews}</td>
              <td className="px-4 py-3 text-text-muted whitespace-nowrap">{v.uploadDate}</td>
              <td className="px-4 py-3"><div className="flex gap-1.5">
                <button onClick={()=>onEdit?.(v)} className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary-light text-xs font-semibold hover:bg-primary/20 transition-colors">Edit</button>
                <button className="px-2.5 py-1 rounded-lg bg-danger/10 text-danger text-xs font-semibold hover:bg-danger/20 transition-colors">Delete</button>
              </div></td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default VideoTable
