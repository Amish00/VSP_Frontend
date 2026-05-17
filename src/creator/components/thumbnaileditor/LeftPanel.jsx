import React, { useState, useRef } from 'react';
import { X, Search, Plus, PlusIcon } from 'lucide-react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import useEditorStore from './useEditorStore';

// ---------- Shared constants ----------
const FONTS = ['Inter', 'Arial', 'Georgia', 'Courier New', 'Impact', 'Trebuchet MS', 'Times New Roman', 'Garamond', 'Comic Sans MS'];
const SOLID_COLORS = [
  '#ffffff','#f5f5f5','#e5e5e5','#a3a3a3','#525252','#262626','#111111','#000000',
  '#fef2f2','#fee2e2','#fca5a5','#ef4444','#dc2626','#b91c1c','#7f1d1d',
  '#fff7ed','#fed7aa','#fb923c','#f97316','#ea580c','#c2410c','#7c2d12',
  '#fefce8','#fef08a','#facc15','#eab308','#ca8a04','#a16207','#713f12',
  '#f0fdf4','#bbf7d0','#86efac','#4ade80','#22c55e','#16a34a','#14532d',
  '#eff6ff','#bfdbfe','#93c5fd','#60a5fa','#3b82f6','#2563eb','#1e3a8a',
  '#fdf4ff','#e9d5ff','#c084fc','#a855f7','#9333ea','#7c3aed','#4c1d95',
  '#fdf2f8','#fbcfe8','#f9a8d4','#f472b6','#ec4899','#db2777','#831843',
];
const GRADIENTS = [
  'linear-gradient(135deg,#667eea,#764ba2)','linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)','linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)','linear-gradient(135deg,#a18cd1,#fbc2eb)',
  'linear-gradient(to bottom,#0f0c29,#302b63)','linear-gradient(135deg,#f7971e,#ffd200)',
  'linear-gradient(135deg,#56ab2f,#a8e063)','linear-gradient(135deg,#ee0979,#ff6a00)',
];
const SHAPES = [
  { type: 'rectangle', label: 'Rect', svg: <rect x="5" y="15" width="90" height="70" fill="currentColor" rx="4" /> },
  { type: 'circle', label: 'Circle', svg: <ellipse cx="50" cy="50" rx="45" ry="45" fill="currentColor" /> },
  { type: 'triangle', label: 'Tri', svg: <polygon points="50,5 95,95 5,95" fill="currentColor" /> },
  { type: 'diamond', label: 'Diamond', svg: <polygon points="50,5 95,50 50,95 5,50" fill="currentColor" /> },
  { type: 'star', label: 'Star', svg: <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="currentColor" /> },
  { type: 'hexagon', label: 'Hex', svg: <polygon points="25,5 75,5 97,50 75,95 25,95 3,50" fill="currentColor" /> },
  { type: 'arrow', label: 'Arrow', svg: <polygon points="0,35 60,35 60,0 100,50 60,100 60,65 0,65" fill="currentColor" /> },
  { type: 'heart', label: 'Heart', svg: <path d="M50,75 C25,55 5,42 5,28 C5,15 15,5 28,5 C36,5 43,9 50,17 C57,9 64,5 72,5 C85,5 95,15 95,28 C95,42 75,55 50,75Z" fill="currentColor" /> },
  { type: 'pentagon', label: 'Penta', svg: <polygon points="50,2 98,36 79,90 21,90 2,36" fill="currentColor" /> },
  { type: 'cross', label: 'Cross', svg: <path d="M35,5 L65,5 L65,35 L95,35 L95,65 L65,65 L65,95 L35,95 L35,65 L5,65 L5,35 L35,35Z" fill="currentColor" /> },
  { type: 'chatbubble', label: 'Chat', svg: <path d="M5,5 L95,5 L95,70 L55,70 L40,95 L40,70 L5,70Z" fill="currentColor" /> },
  { type: 'parallelogram', label: 'Parallelogram', svg: <polygon points="20,5 100,5 80,95 0,95" fill="currentColor" /> },
];

// ---------- Panel header ----------
const PanelHeader = ({ title, onClose }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px 10px', flexShrink: 0 }}>
    <span style={{ fontSize: 13, fontWeight: 600, color: '#e5e5e5' }}>{title}</span>
    <button onClick={onClose} className="btn-icon" style={{ width: 24, height: 24 }}><X size={13} /></button>
  </div>
);

// ---------- Elements Panel (shapes & lines) ----------
const ElementsPanel = () => {
  const addLayer = useEditorStore(s => s.addLayer);
  const page = useEditorStore(s => s.getCurrentPage());
  const [tab, setTab] = useState('shapes');
  const cx = (w = 150, h = 150) => ({ x: page.width / 2 - w / 2, y: page.height / 2 - h / 2 });

  return (
    <div style={{ padding: '0 12px 12px' }}>
      <div style={{ display: 'flex', background: '#1e1e24', borderRadius: 8, padding: 3, gap: 2, marginBottom: 14 }}>
        {['shapes', 'lines'].map(t => (
          <button key={t} className={`tab-pill ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {tab === 'shapes' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {SHAPES.map(s => (
            <div
              key={s.type}
              title={s.label}
              onClick={() => addLayer({ type: 'shape', shapeType: s.type, ...cx(140, 140), width: 140, height: 140, fill: '#e5e5e5', stroke: 'none', strokeWidth: 0 })}
              style={{ aspectRatio: 1, background: '#1e1e24', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#aaa', border: '1px solid #2a2a30', transition: 'all 0.12s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#2a2a30'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1e1e24'; e.currentTarget.style.color = '#aaa'; }}
            >
              <svg viewBox="0 0 100 100" width={32} height={32}>{s.svg}</svg>
            </div>
          ))}
        </div>
      )}
      {tab === 'lines' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {['solid', 'dashed', 'dotted'].map(style => (
            <div
              key={style}
              onClick={() => addLayer({ type: 'line', ...cx(200, 4), width: 200, height: 4, stroke: '#aaa', strokeWidth: 2, lineStyle: style })}
              style={{ padding: '12px 14px', background: '#1e1e24', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #2a2a30', transition: 'all 0.12s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#2a2a30'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1e1e24'; }}
            >
              <svg width={60} height={4}>
                <line x1="0" y1="2" x2="60" y2="2" stroke="#aaa" strokeWidth={2} strokeDasharray={style === 'dashed' ? '10,4' : style === 'dotted' ? '2,5' : undefined} strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: 12, color: '#aaa', textTransform: 'capitalize' }}>{style} line</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------- Text Panel (with click‑to‑add button + presets + fonts) ----------
const TextPanel = () => {
  const addLayer = useEditorStore(s => s.addLayer);
  const setActiveTool = useEditorStore(s => s.setActiveTool);
  const page = useEditorStore(s => s.getCurrentPage());
  const [toolActive, setToolActive] = useState(false);

  const cx = (w, h) => ({ x: page.width / 2 - w / 2, y: page.height / 2 - h / 2 });

  const presets = [
    { label: 'Heading', text: 'Add a heading', fontSize: 52, fontWeight: '700', textColor: '#000', width: 480, height: 84 },
    { label: 'Subheading', text: 'Add a subheading', fontSize: 32, fontWeight: '600', textColor: '#111', width: 380, height: 60 },
    { label: 'Body Text', text: 'Add body text', fontSize: 18, fontWeight: '400', textColor: '#222', width: 300, height: 42 },
    { label: 'Caption', text: 'Caption text', fontSize: 13, fontWeight: '400', textColor: '#444', width: 200, height: 30 },
  ];

  const activateTextTool = () => {
    setActiveTool('text');
    setToolActive(true);
    setTimeout(() => setToolActive(false), 3000);
  };

  return (
    <div style={{ padding: '0 12px 12px' }}>
      <button
        onClick={activateTextTool}
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: 16,
          borderRadius: 8,
          background: '#2a2a30',
          border: '1px solid #3a3a40',
          color: '#fff',
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#3a3a40')}
        onMouseLeave={e => (e.currentTarget.style.background = '#2a2a30')}
      >
        <PlusIcon size={18} /> Add Text Box 
      </button>

      <div className="sec-label" style={{ padding: '0 0 6px' }}>TEXT PRESETS</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
        {presets.map(p => (
          <div
            key={p.label}
            onClick={() => addLayer({ type: 'text', ...cx(p.width, p.height), ...p })}
            style={{ padding: '11px 13px', background: '#1e1e24', borderRadius: 8, cursor: 'pointer', border: '1px solid #2a2a30', transition: 'all 0.12s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#2a2a30'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#1e1e24'; }}
          >
            <div style={{ fontSize: p.fontSize > 36 ? 16 : p.fontSize > 20 ? 13 : 11, fontWeight: p.fontWeight, color: '#e5e5e5', lineHeight: 1.2 }}>{p.label}</div>
            <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>{p.fontSize}px · click to add</div>
          </div>
        ))}
      </div>

      <div className="sec-label" style={{ padding: '0 0 6px' }}>FONTS</div>
      {FONTS.map((f, i) => (
        <div
          key={i}
          onClick={() => addLayer({ type: 'text', text: 'Your text', fontSize: 26, fontFamily: f, fontWeight: '500', textColor: '#000', ...cx(280, 46), width: 280, height: 46 })}
          style={{ padding: '7px 10px', borderRadius: 7, cursor: 'pointer', fontFamily: f, fontSize: 15, color: '#ccc', transition: 'background 0.1s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#1e1e24'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          {f}
        </div>
      ))}
    </div>
  );
};

// ---------- Emojis Panel ----------
const EmojisPanel = () => {
  const addLayer = useEditorStore(s => s.addLayer);
  const page = useEditorStore(s => s.getCurrentPage());
  const handleEmoji = (emoji) => {
    addLayer({ type: 'emoji', emoji: emoji.native, x: page.width / 2 - 40, y: page.height / 2 - 40, width: 80, height: 80 });
  };
  return (
    <div style={{ padding: '0 12px 12px' }}>
      <div style={{ fontSize: 11, color: '#666', marginBottom: 10, lineHeight: 1.5 }}>Click an emoji to add it to your canvas.</div>
      <Picker data={data} onEmojiSelect={handleEmoji} theme="dark" set="native" previewPosition="none" skinTonePosition="none" navPosition="bottom" perLine={7} emojiSize={22} emojiButtonSize={32} />
    </div>
  );
};

// ---------- Uploads Panel ----------
const UploadsPanel = () => {
  const addLayer = useEditorStore(s => s.addLayer);
  const page = useEditorStore(s => s.getCurrentPage());
  const inputRef = useRef();
  const [uploads, setUploads] = useState([]);
  const handleFile = (e) => {
    Array.from(e.target.files).forEach(file => {
      const url = URL.createObjectURL(file);
      setUploads(prev => [{ url, name: file.name }, ...prev]);
      addLayer({ type: 'image', src: url, name: file.name, x: page.width / 2 - 150, y: page.height / 2 - 100, width: 300, height: 200 });
    });
  };
  const handleDrop = (e) => {
    e.preventDefault();
    Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')).forEach(file => {
      const url = URL.createObjectURL(file);
      setUploads(prev => [{ url, name: file.name }, ...prev]);
      addLayer({ type: 'image', src: url, name: file.name, x: page.width / 2 - 150, y: page.height / 2 - 100, width: 300, height: 200 });
    });
  };
  return (
    <div style={{ padding: '0 12px 12px' }}>
      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFile} />
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current.click()}
        style={{ width: '100%', padding: '24px 0', borderRadius: 10, border: '1.5px dashed #2e2e36', background: '#1a1a20', color: '#666', cursor: 'pointer', textAlign: 'center', transition: 'all 0.12s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#4a4a50'; e.currentTarget.style.color = '#aaa'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#2e2e36'; e.currentTarget.style.color = '#666'; }}
      >
        <div style={{ fontSize: 26, marginBottom: 6 }}>+</div>
        <div style={{ fontSize: 12, fontWeight: 500 }}>Upload images</div>
        <div style={{ fontSize: 10, marginTop: 3, color: '#555' }}>Drop files or click to browse</div>
      </div>
      {uploads.length > 0 && (
        <>
          <div className="sec-label" style={{ padding: '12px 0 6px' }}>UPLOADS</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {uploads.map((u, i) => (
              <div key={i} className="photo-card" onClick={() => addLayer({ type: 'image', src: u.url, name: u.name, x: page.width / 2 - 150, y: page.height / 2 - 100, width: 300, height: 200 })} style={{ aspectRatio: '4/3', background: '#1e1e24' }}>
                <img src={u.url} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div className="overlay"><Plus size={18} color="#fff" /></div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ---------- Photos Panel (Pexels) ----------
const PhotosPanel = () => {
  const addLayer = useEditorStore(s => s.addLayer);
  const page = useEditorStore(s => s.getCurrentPage());
  const [photos, setPhotos] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [pg, setPg] = useState(1);
  const PEXELS_KEY = 'qcqkTO4JgIhunCS68ERUgg3XWZjco7Qp4Vu2fKbTSeT4GGhYXb7dc2CK';

  const fetchPhotos = async (q = 'nature', p = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(q || 'design abstract')}&per_page=20&page=${p}`, { headers: { Authorization: PEXELS_KEY } });
      const data = await res.json();
      if (p === 1) setPhotos(data.photos || []);
      else setPhotos(prev => [...prev, ...(data.photos || [])]);
    } catch {
      const fb = Array.from({ length: 20 }, (_, i) => ({ id: i + p * 20, src: { tiny: `https://picsum.photos/seed/${i + p * 20}/200/150`, large: `https://picsum.photos/seed/${i + p * 20}/800/600` }, alt: `Photo ${i + 1}` }));
      if (p === 1) setPhotos(fb);
      else setPhotos(prev => [...prev, ...fb]);
    }
    setLoading(false);
  };
  React.useEffect(() => { fetchPhotos('design abstract', 1); }, []);
  const addPhoto = (photo) => {
    const src = photo.src?.large2x || photo.src?.large || photo.src?.medium || photo.src;
    addLayer({ type: 'image', src, name: photo.alt || 'Photo', x: page.width / 2 - 200, y: page.height / 2 - 133, width: 400, height: 267 });
  };
  return (
    <div style={{ padding: '0 12px 12px' }}>
      <form onSubmit={e => { e.preventDefault(); setPg(1); fetchPhotos(query, 1); }} style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={12} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#666', pointerEvents: 'none' }} />
          <input placeholder="Search photos..." value={query} onChange={e => setQuery(e.target.value)} className="inp" style={{ paddingLeft: 28 }} />
        </div>
      </form>
      {loading && <div style={{ textAlign: 'center', color: '#666', fontSize: 12, padding: '20px 0' }}>Loading...</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {photos.map(p => (
          <div key={p.id} className="photo-card" onClick={() => addPhoto(p)} style={{ aspectRatio: '4/3', background: '#1e1e24' }}>
            <img src={p.src?.tiny || p.src?.medium || p.src} alt={p.alt} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div className="overlay"><Plus size={18} color="#fff" /></div>
          </div>
        ))}
      </div>
      {photos.length > 0 && (
        <button onClick={() => { const np = pg + 1; setPg(np); fetchPhotos(query || 'design abstract', np); }} style={{ width: '100%', marginTop: 10, padding: '8px', borderRadius: 7, border: '1px solid #2e2e36', background: '#1e1e24', color: '#aaa', cursor: 'pointer', fontSize: 12 }}>
          {loading ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  );
};

// ---------- Background Panel ----------
const BackgroundPanel = () => {
  const { setPageBackground, getCurrentPage } = useEditorStore();
  const page = getCurrentPage();
  const [tab, setTab] = useState('solid');
  const [custom, setCustom] = useState('#ffffff');
  return (
    <div style={{ padding: '0 12px 12px' }}>
      <div style={{ display: 'flex', background: '#1e1e24', borderRadius: 8, padding: 3, gap: 2, marginBottom: 14 }}>
        {['solid', 'gradient'].map(t => (
          <button key={t} className={`tab-pill ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {tab === 'solid' && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
            {SOLID_COLORS.map(c => (
              <div
                key={c}
                onClick={() => setPageBackground(c)}
                style={{ width: 26, height: 26, borderRadius: 5, background: c, cursor: 'pointer', border: page.background === c ? '2px solid #fff' : '2px solid transparent', transition: 'all 0.1s', boxSizing: 'border-box' }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="color" value={custom} onChange={e => { setCustom(e.target.value); setPageBackground(e.target.value); }} style={{ width: 32, height: 32, border: 'none', cursor: 'pointer', borderRadius: 6, padding: 0, background: 'none' }} />
            <input type="text" className="inp" value={custom} onChange={e => { setCustom(e.target.value); if (/^#[0-9a-f]{6}$/i.test(e.target.value)) setPageBackground(e.target.value); }} />
            <button onClick={() => setPageBackground(custom)} style={{ padding: '5px 10px', background: '#2a2a30', border: '1px solid #3a3a40', borderRadius: 6, color: '#ccc', cursor: 'pointer', fontSize: 11, whiteSpace: 'nowrap' }}>Apply</button>
          </div>
        </>
      )}
      {tab === 'gradient' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {GRADIENTS.map((g, i) => (
            <div
              key={i}
              onClick={() => setPageBackground(g)}
              style={{ height: 52, borderRadius: 8, background: g, cursor: 'pointer', border: page.background === g ? '2px solid #fff' : '2px solid transparent', transition: 'all 0.12s' }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ---------- Layers Panel ----------
const LayersPanel = () => {
  const { pages, currentPageIndex, selectedLayerIds, selectLayer, toggleLockLayer, toggleVisibleLayer } = useEditorStore();
  const page = pages[currentPageIndex];
  const layers = [...page.layers].reverse();
  return (
    <div style={{ padding: '0 8px 8px' }}>
      {layers.length === 0 && <div style={{ color: '#666', fontSize: 12, textAlign: 'center', padding: '32px 0' }}>No layers yet</div>}
      {layers.map(layer => {
        const isSel = selectedLayerIds.includes(layer.id);
        return (
          <div
            key={layer.id}
            onClick={e => selectLayer(layer.id, e.shiftKey)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 8px',
              borderRadius: 7,
              cursor: 'pointer',
              marginBottom: 2,
              transition: 'all 0.1s',
              background: isSel ? '#2a2a30' : 'transparent',
              border: isSel ? '1px solid #3a3a40' : '1px solid transparent',
            }}
          >
            <div style={{ width: 20, height: 20, background: '#1e1e24', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#aaa', flexShrink: 0 }}>
              {layer.type === 'text' ? 'T' : layer.type === 'image' ? 'I' : layer.type === 'emoji' ? layer.emoji : 'S'}
            </div>
            <span style={{ flex: 1, fontSize: 11, color: isSel ? '#fff' : '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {layer.type === 'text' ? (layer.text || 'Text').slice(0, 18) : layer.type === 'emoji' ? `Emoji ${layer.emoji}` : `${layer.shapeType || layer.type}`}
            </span>
            <button onClick={e => { e.stopPropagation(); toggleVisibleLayer(layer.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: layer.visible ? '#aaa' : '#444', fontSize: 11 }}>
              {layer.visible ? '●' : '○'}
            </button>
            <button onClick={e => { e.stopPropagation(); toggleLockLayer(layer.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: layer.locked ? '#fff' : '#555', fontSize: 11 }}>
              {layer.locked ? '🔒' : '🔓'}
            </button>
          </div>
        );
      })}
    </div>
  );
};

// ---------- Panel mapping ----------
const PANEL_MAP = {
  elements: { title: 'Elements', Component: ElementsPanel },
  text: { title: 'Text', Component: TextPanel },
  emojis: { title: 'Emojis', Component: EmojisPanel },
  uploads: { title: 'Uploads', Component: UploadsPanel },
  photos: { title: 'Photos', Component: PhotosPanel },
  background: { title: 'Background', Component: BackgroundPanel },
  layers: { title: 'Layers', Component: LayersPanel },
};

// ---------- Main LeftPanel component ----------
const LeftPanel = () => {
  const { activePanel, setActivePanel } = useEditorStore();
  if (!activePanel || !PANEL_MAP[activePanel]) return null;
  const { title, Component } = PANEL_MAP[activePanel];
  return (
    <div className="panel" style={{ width: 260, display: 'flex', flexDirection: 'column', zIndex: 15, overflow: 'hidden' }}>
      <PanelHeader title={title} onClose={() => setActivePanel(null)} />
      <div className="sep" />
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 12 }}>
        <Component />
      </div>
    </div>
  );
};

export default LeftPanel;