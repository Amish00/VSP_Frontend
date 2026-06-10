import React from 'react'
import { MousePointer2, Scissors, FolderOpen, Type, Shapes, Star, Music, Zap, Repeat2 } from 'lucide-react'
import { useStore } from '../store/store'

const TOOLS = [
  { id: 'select', Icon: MousePointer2, label: 'Select' },
  { id: 'split', Icon: Scissors, label: 'Split' },
]

const PANELS = [
  { id: 'media', Icon: FolderOpen, label: 'Media' },
  { id: 'text', Icon: Type, label: 'Text' },
  { id: 'shapes', Icon: Shapes, label: 'Shapes' },
  { id: 'stickers', Icon: Star, label: 'Stickers' },
  { id: 'audio', Icon: Music, label: 'Audio' },
  { id: 'transitions', Icon: Repeat2, label: 'Trans.' },
  { id: 'effects', Icon: Zap, label: 'Effects' },
]

const LeftToolbar = () => {
  const { activeTool, activePanel, setActiveTool, setActivePanel } = useStore()

  const Btn = ({ id, Icon, label, active, onClick }) => (
    <button
      onClick={onClick}
      title={label}
      style={{
        width: 56,
        height: 48,
        borderRadius: 7,
        border: 'none',
        background: active ? '#1a1a1a' : 'transparent',
        color: active ? '#fff' : '#555',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        fontSize: 9,
        fontFamily: 'inherit',
        fontWeight: 500,
        transition: 'all 0.1s',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.background = '#141414'
          e.currentTarget.style.color = '#888'
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = '#555'
        }
      }}
    >
      <Icon size={17} />
      <span>{label}</span>
    </button>
  )

  return (
    <div
      style={{
        width: 68,
        background: '#0d0d0d',
        borderRight: '1px solid #1a1a1a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px 0',
        gap: 2,
        flexShrink: 0,
        overflowY: 'auto',    // allow scroll if too many items, but we have few
        height: '100%',       // take full height of parent
      }}
    >
      {TOOLS.map(({ id, Icon, label }) => (
        <Btn
          key={id}
          id={id}
          Icon={Icon}
          label={label}
          active={activeTool === id}
          onClick={() => setActiveTool(id)}
        />
      ))}
      <div
        style={{
          width: '30px',
          height: 1,
          background: '#1a1a1a',
          margin: '6px 0',
        }}
      />
      {PANELS.map(({ id, Icon, label }) => (
        <Btn
          key={id}
          id={id}
          Icon={Icon}
          label={label}
          active={activePanel === id}
          onClick={() => setActivePanel(id)}
        />
      ))}
    </div>
  )
}

export default LeftToolbar