import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, Bell, X, Menu, LogOut, User, Clock, Heart, Users, DollarSign, Settings, Shield, Video, ChevronDown } from 'lucide-react'
import logoUrl from '../../assets/logo.svg'
import Badge from '../components/ui/Badge'
import { useAuth } from '../../auth/context/AuthContext'

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

// ─── Notifications ────────────────────────────────────────────────────────────
export const NOTIFICATIONS = [
  { id: 1, icon: '✅', title: 'Video Approved',    body: "'React Masterclass' is now live!", time: '2h ago',  unread: true  },
  { id: 2, icon: '❤️', title: 'New Likes',         body: 'Your video got 340 new likes',       time: '4h ago',  unread: true  },
  { id: 3, icon: '💬', title: 'New Comment',       body: 'Dev_Ninja: "Amazing content!"',      time: '6h ago',  unread: true  },
  { id: 4, icon: '👥', title: '+340 subscribers',  body: 'You gained 340 new subs this week',  time: '1d ago',  unread: false },
  { id: 5, icon: '💰', title: 'Payout Processed',  body: '$320 sent to your account',          time: '3d ago',  unread: false },
]

const inp = "w-full bg-bg-el text-text-primary text-base rounded-xl border border-border px-4 py-3 placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"

const NAV_LINKS = [
  { to: '/',              label: 'Home'          },
  { to: '/trending',      label: 'Trending'      },
  { to: '/subscriptions', label: 'Subscriptions' },
  { to: '/plans',         label: 'Plans'         },
]

const PROFILE_ITEMS = [
  { icon: User,       label: 'Profile',          to: '/profile'       },
  { icon: Clock,      label: 'Watch History',     to: '/history'       },
  { icon: Heart,      label: 'Liked Videos',      to: '/liked'         },
  { icon: Users,      label: 'Subscriptions',     to: '/subscriptions' },
  { icon: DollarSign, label: 'Subscription Plan', to: '/plans'         },
  { icon: Settings,   label: 'Settings',          to: '/settings'      },
]

// ── Notification panel ────────────────────────────────────────────────────────
const NotifPanel = ({ onClose }) => {
  const unread = NOTIFICATIONS.filter(n => n.unread).length
  return (
    <>
      <div className="fixed inset-0 z-[148]" onClick={onClose} />
      <div className="absolute top-[calc(100%+10px)] right-0 w-80 bg-bg-card border border-border rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,.6)] overflow-hidden z-[149]">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-lg text-text-primary">Notifications</span>
            {unread > 0 && <span className="px-2 py-0.5 rounded-full bg-danger text-white text-xs font-bold">{unread}</span>}
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:bg-bg-hov"><X size={14} /></button>
        </div>
        <div className="max-h-86 overflow-y-auto">
          {NOTIFICATIONS.map(n => (
            <div key={n.id} className={`flex gap-3 px-4 py-3.5 hover:bg-bg-hov border-b border-border/50 last:border-0 ${n.unread ? 'border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'}`}>
              <div className="w-9 h-9 rounded-xl bg-bg-el flex items-center justify-center text-lg flex-shrink-0">{n.icon}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.unread ? 'font-semibold text-text-primary' : 'font-medium text-text-secondary'}`}>{n.title}</p>
                <p className="text-xs text-text-muted truncate mt-0.5">{n.body}</p>
                <p className="text-xs text-text-muted mt-1">{n.time}</p>
              </div>
              {n.unread && <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />}
            </div>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-border">
          <button className="text-sm text-primary-light font-semibold hover:opacity-80">Mark all as read</button>
        </div>
      </div>
    </>
  )
}

// ── Search overlay ────────────────────────────────────────────────────────────
const SearchOverlay = ({ onClose }) => {
  const [q, setQ] = useState('')
  const ref = useRef(null)
  useEffect(() => {
    ref.current?.focus()
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  const results = q.length > 1 ? VIDEOS.filter(v => v.title.toLowerCase().includes(q.toLowerCase())).slice(0, 6) : []
  return (
    <>
      <div className="fixed inset-0 z-[198] bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-0 left-0 right-0 z-[199] bg-bg-base/98 backdrop-blur-2xl border-b border-border px-4 sm:px-8 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input ref={ref} value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search videos, channels…"
              className={`${inp} pl-11 pr-20`} />
            <button onClick={onClose} className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-primary text-white text-sm font-semibold rounded-lg">Done</button>
          </div>
          {results.length > 0 && (
            <div className="mt-2 bg-bg-card border border-border rounded-xl overflow-hidden">
              {results.map(r => (
                <div key={r.id} onClick={onClose} className="flex items-center gap-3 px-4 py-3 hover:bg-bg-hov cursor-pointer border-b border-border/60 last:border-0 transition-colors">
                  <div className="w-14 h-8 rounded-lg bg-bg-el flex items-center justify-center text-lg flex-shrink-0">{r.em}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{r.title}</p>
                    <p className="text-xs text-text-muted">{r.cat}</p>
                  </div>
                  <Badge text={r.paid ? 'PAID' : 'FREE'} type={r.paid ? 'paid' : 'free'} />
                </div>
              ))}
            </div>
          )}
          {q.length <= 1 && (
            <div className="mt-3 flex gap-2 flex-wrap items-center">
              <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Trending:</span>
              {['React 2025','AI Music','System Design','Lofi Beats'].map(t => (
                <button key={t} onClick={() => setQ(t)} className="chip text-sm">{t}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── Mobile drawer ─────────────────────────────────────────────────────────────
const MobileDrawer = ({ onClose }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const go = (to) => { navigate(to); onClose() }

  return (
    <>
      <div className="fixed inset-0 z-[149] bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-0 left-0 bottom-0 w-[280px] z-[150] bg-bg-side border-r border-border flex flex-col overflow-y-auto"
           style={{ boxShadow: '4px 0 32px rgba(0,0,0,.5)' }}>

        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-border flex-shrink-0">
          <span className="font-display font-black text-lg text-text-primary">Menu</span>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:bg-bg-hov transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* User section */}
        {user ? (
          <div className="px-4 py-4 border-b border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center font-display font-black text-lg text-white flex-shrink-0">
                {user.name?.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-base text-text-primary truncate">{user.name}</p>
                <p className="text-sm text-text-muted truncate">{user.email}</p>
              </div>
            </div>
            <Badge text="⭐ View+Create" type="pro" />
          </div>
        ) : (
          <div className="px-4 py-4 border-b border-border">
            <button onClick={() => go('/signin')}
              className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-[#1d4ed8] transition-colors">
              Sign In
            </button>
          </div>
        )}

        {/* Nav links */}
        <nav className="px-2 py-3 flex-1">
          {NAV_LINKS.map(({ to, label }) => (
            <button key={to} onClick={() => go(to)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-medium mb-0.5 transition-colors text-left
                         ${location.pathname === to ? 'bg-primary/12 text-primary-light font-semibold' : 'text-text-secondary hover:bg-bg-hov hover:text-text-primary'}`}>
              {label}
            </button>
          ))}

          {user && (
            <>
              <div className="h-px bg-border mx-2 my-3" />
              {PROFILE_ITEMS.map(({ icon: Icon, label, to }) => (
                <button key={to} onClick={() => go(to)}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-medium mb-0.5 text-text-secondary hover:bg-bg-hov hover:text-text-primary transition-colors text-left">
                  <Icon size={16} className="text-text-muted flex-shrink-0" />
                  {label}
                </button>
              ))}
              
            </>
          )}
        </nav>

        {/* Sign out */}
        {user && (
          <div className="px-2 py-3 border-t border-border flex-shrink-0">
            <button onClick={() => { logout(); navigate('/'); onClose() }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-semibold text-danger hover:bg-danger/8 transition-colors">
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        )}
      </div>
    </>
  )
}

// ── Main Navbar ───────────────────────────────────────────────────────────────
const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [searchOpen,  setSearchOpen]  = useState(false)
  const [notifOpen,   setNotifOpen]   = useState(false)
  const [profOpen,    setProfOpen]    = useState(false)
  const [drawerOpen,  setDrawerOpen]  = useState(false)
  const unread = NOTIFICATIONS.filter(n => n.unread).length

  // Close dropdowns on outside click
  useEffect(() => {
    const h = e => { if (!e.target.closest('[data-dd]')) { setNotifOpen(false); setProfOpen(false) } }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] h-16 bg-bg-base/96 backdrop-blur-2xl border-b border-border"
              style={{ boxShadow: '0 1px 0 rgba(255,255,255,.03), 0 4px 24px rgba(0,0,0,.35)' }}>

        {/* ── MOBILE LAYOUT ── */}
        <div className="flex md:hidden items-center h-full px-4 relative">
          {/* Left: hamburger */}
          <button onClick={() => setDrawerOpen(true)} aria-label="Open menu"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-text-secondary hover:bg-bg-el transition-colors">
            <Menu size={22} />
          </button>

          {/* Center: logo */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2" aria-label="ViriShare home">
              <img src={logoUrl} alt="" className="h-7 w-auto" />
              <span className="font-display font-black text-lg text-text-primary tracking-tight">ViriShare</span>
            </Link>
          </div>

          {/* Right: search */}
          <div className="ml-auto">
            <button onClick={() => setSearchOpen(true)} aria-label="Search"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-text-secondary hover:bg-bg-el transition-colors">
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* ── DESKTOP LAYOUT ── */}
        <div className="hidden md:flex items-center h-full px-6 gap-5">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group" aria-label="ViriShare home">
            <img src={logoUrl} alt="ViriShare logo" className="h-8 w-auto" />
            <span className="font-display font-black text-xl text-text-primary tracking-tight group-hover:text-primary-light transition-colors">
              ViriShare
            </span>
          </Link>

          {/* Nav links — center */}
          <nav className="flex items-center gap-1 flex-1 justify-center">
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to}
                className={`relative px-5 py-2.5 rounded-xl text-base font-semibold transition-all whitespace-nowrap
                           ${location.pathname === to
                              ? 'text-text-primary bg-bg-el'
                              : 'text-text-secondary hover:text-text-primary hover:bg-bg-el/50'}`}>
                {label}
                {location.pathname === to && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setSearchOpen(true)} aria-label="Search"
              className="w-10 h-10 rounded-xl border border-border bg-bg-el text-text-secondary hover:bg-bg-hov hover:text-text-primary flex items-center justify-center transition-all">
              <Search size={17} />
            </button>

            {user ? (
              <>
                {/* Notifications */}
                <div className="relative" data-dd>
                  <button onClick={() => { setNotifOpen(p => !p); setProfOpen(false) }}
                    aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
                    className={`relative w-10 h-10 rounded-xl border flex items-center justify-center transition-all
                               ${notifOpen ? 'border-primary bg-primary/12 text-primary-light' : 'border-border bg-bg-el text-text-secondary hover:bg-bg-hov hover:text-text-primary'}`}>
                    <Bell size={17} />
                    {unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger border-2 border-bg-base" />}
                  </button>
                  {notifOpen && <NotifPanel onClose={() => setNotifOpen(false)} />}
                </div>

                {/* Studio */}
                <Link to="/creator"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary/35 bg-primary/8 text-primary-light text-sm font-semibold hover:bg-primary/15 hover:border-primary/55 transition-all">
                  <Video size={15} /> Studio
                </Link>

                {/* Profile dropdown */}
                <div className="relative" data-dd>
                  <button onClick={() => { setProfOpen(p => !p); setNotifOpen(false) }}
                    className="flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-xl border border-border bg-bg-el hover:bg-bg-hov transition-all">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-display font-black text-sm text-white flex-shrink-0">
                      {user.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-base font-semibold text-text-primary max-w-[90px] truncate">{user.name?.split(' ')[0]}</span>
                    <ChevronDown size={13} className={`text-text-muted transition-transform ${profOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profOpen && (
                    <div role="menu" className="absolute top-[calc(100%+10px)] right-0 w-60 bg-bg-card border border-border rounded-2xl z-[149] shadow-[0_8px_40px_rgba(0,0,0,.6)] overflow-hidden">
                      {/* User info */}
                      <div className="px-4 py-4 border-b border-border">
                        <div className="flex items-center gap-3 mb-2.5">
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-display font-black text-sm text-white">
                            {user.name?.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-base text-text-primary leading-tight">{user.name}</p>
                            <p className="text-xs text-text-muted mt-0.5">{user.email}</p>
                          </div>
                        </div>
                        <Badge text="⭐ View+Create" type="pro" />
                      </div>

                      <div className="py-1.5 px-1.5">
                        {PROFILE_ITEMS.map(({ icon: Icon, label, to }) => (
                          <Link key={to} to={to} role="menuitem" onClick={() => setProfOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-secondary text-base hover:bg-bg-hov hover:text-text-primary transition-colors">
                            <Icon size={14} className="text-text-muted flex-shrink-0" /> {label}
                          </Link>
                        ))}
                      </div>


                      <div className="border-t border-border py-1.5 px-1.5">
                        <button onClick={() => { logout(); navigate('/'); setProfOpen(false) }} role="menuitem"
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-danger text-base font-semibold hover:bg-danger/8 transition-colors text-left">
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Only a blue "Sign In" button — no "Sign Up"
              <Link to="/signin"
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-base font-bold hover:bg-[#1d4ed8] transition-all shadow-[0_2px_8px_rgba(37,99,235,.35)]">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {drawerOpen && <MobileDrawer onClose={() => setDrawerOpen(false)} />}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  )
}

export default Navbar