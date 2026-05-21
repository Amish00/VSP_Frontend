import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useStore } from '../store/store';
import { FONTS, EFFECTS, TRANSITIONS } from '../utils/constants';

function Sec({ title, children, open: init = true }) {
  const [open, setOpen] = useState(init);
  return (
    <div style={{ borderBottom: '1px solid #141414' }}>
      <button onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '7px 12px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#888', fontSize: 9, fontWeight: 600,
          letterSpacing: 0.8, fontFamily: 'inherit', textTransform: 'uppercase'
        }}>
        {title} {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
      </button>
      {open && <div style={{ padding: '0 12px 11px' }}>{children}</div>}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
      <span style={{ fontSize: 10, color: '#aaa', minWidth: 48, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'flex-end' }}>{children}</div>
    </div>
  );
}

function Num({ v, onChange, min, max, step = 0.1 }) {
  return (
    <input type="number" value={Math.round((v || 0) * 100) / 100} min={min} max={max} step={step}
      onChange={e => onChange(parseFloat(e.target.value) || 0)}
      style={{ width: 58, background: '#111', border: '1px solid #222', borderRadius: 5, padding: '3px 5px', fontSize: 11, color: '#e0e0e0', outline: 'none', fontFamily: 'inherit', textAlign: 'center' }} />
  );
}

function Slider({ v, onChange, min = 0, max = 1, step = 0.01, label }) {
  return (
    <Row label={label}>
      <input type="range" min={min} max={max} step={step} value={v}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ flex: 1, WebkitAppearance: 'none', height: 2, background: '#2a2a2a', borderRadius: 99, outline: 'none', cursor: 'pointer', accentColor: '#fff' }} />
      <span style={{ fontSize: 9, color: '#aaa', minWidth: 28 }}>{Math.round(v * (max === 1 ? 100 : 1))}{max === 1 ? '%' : ''}</span>
    </Row>
  );
}

const inp = {
  width: '100%', background: '#111', border: '1px solid #222', borderRadius: 5,
  padding: '4px 8px', fontSize: 11, color: '#e0e0e0', outline: 'none', fontFamily: 'inherit'
};

const actionBtn = {
  padding: '6px', borderRadius: 6, border: '1px solid #2a2a2a',
  background: '#111', color: '#ccc', cursor: 'pointer', fontSize: 11,
  fontFamily: 'inherit', width: '100%', textAlign: 'center',
};

const RightPanel = () => {
  const { getSelectedClip, updateClip, removeClip, duplicateClip, splitClip, currentTime } = useStore();
  const clip = getSelectedClip();

  if (!clip) return null;

  const upd = p => updateClip(clip.id, p);

  return (
    <div style={{
      width: 260,                      // increased from 208
      background: '#0d0d0d',
      borderLeft: '1px solid #1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',              // prevent any overflow
      flexShrink: 0
    }}>
      {/* Header */}
      <div style={{ padding: '9px 12px 8px', borderBottom: '1px solid #1a1a1a', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#e0e0e0', textTransform: 'capitalize' }}>{clip.type}</span>
        </div>
        <input value={clip.name || ''} onChange={e => upd({ name: e.target.value })} style={inp} placeholder="Clip name" />
      </div>

      {/* Scrollable content – only vertical scrolling, no horizontal */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <Sec title="Timing">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {[['Start', 'start'], ['Dur.', 'duration'], ['Speed', 'speed'], ['Offset', 'offset']].map(([l, k]) => (
              <div key={k}>
                <div style={{ fontSize: 8, color: '#666', marginBottom: 2, fontWeight: 600 }}>{l.toUpperCase()}</div>
                <Num v={clip[k] || 0} step={k === 'speed' ? 0.1 : 0.1} min={k === 'speed' ? 0.1 : 0} onChange={v => upd({ [k]: v })} />
              </div>
            ))}
          </div>
        </Sec>

        <Sec title="Playback">
          <Slider label="Opacity" v={clip.opacity ?? 1} onChange={v => upd({ opacity: v })} />
          <Slider label="Volume" v={clip.volume ?? 1} onChange={v => upd({ volume: v })} max={2} step={0.01} />
          <Row label="Mute">
            <input type="checkbox" checked={clip.muted ?? false} onChange={e => upd({ muted: e.target.checked })} style={{ cursor: 'pointer', width: 14, height: 14, accentColor: '#fff' }} />
          </Row>
        </Sec>

        {['text', 'shape', 'sticker'].includes(clip.type) && (
          <Sec title="Position">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {[['X %', 'overlayX'], ['Y %', 'overlayY'], ['W %', 'overlayW'], ['H %', 'overlayH']].map(([l, k]) => (
                <div key={k}>
                  <div style={{ fontSize: 8, color: '#666', marginBottom: 2, fontWeight: 600 }}>{l}</div>
                  <Num v={clip[k] || 0} min={0} max={100} step={0.5} onChange={v => upd({ [k]: v })} />
                </div>
              ))}
            </div>
          </Sec>
        )}

        {clip.type === 'text' && (
          <Sec title="Text">
            <div style={{ marginBottom: 7 }}>
              <div style={{ fontSize: 8, color: '#666', marginBottom: 3, fontWeight: 600 }}>CONTENT</div>
              <textarea value={clip.text || ''} onChange={e => upd({ text: e.target.value })}
                style={{ ...inp, resize: 'vertical', minHeight: 48, fontSize: 12 }} />
            </div>
            <Row label="Font">
              <select value={clip.fontFamily || 'Inter'} onChange={e => upd({ fontFamily: e.target.value })} style={{ ...inp, padding: '3px 5px', fontSize: 10 }}>
                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </Row>
            <Row label="Size"><Num v={clip.fontSize || 72} min={8} max={400} step={1} onChange={v => upd({ fontSize: v })} /></Row>
            <Row label="Weight">
              <select value={clip.fontWeight || '700'} onChange={e => upd({ fontWeight: e.target.value })} style={{ ...inp, padding: '3px 5px', fontSize: 10 }}>
                {['300', '400', '500', '600', '700', '800', '900'].map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </Row>
            <Row label="Color">
              <input type="color" value={clip.textColor || '#ffffff'} onChange={e => upd({ textColor: e.target.value })} style={{ width: 24, height: 20, border: 'none', cursor: 'pointer', borderRadius: 4, padding: 0 }} />
              <input type="text" value={clip.textColor || ''} onChange={e => { if (/^#[0-9a-f]{6}$/i.test(e.target.value)) upd({ textColor: e.target.value }); }} style={{ ...inp, flex: 1, fontSize: 10, padding: '3px 6px' }} />
            </Row>
            <Row label="Align">
              <div style={{ display: 'flex', gap: 3 }}>
                {['left', 'center', 'right'].map(a => (
                  <button key={a} onClick={() => upd({ textAlign: a })}
                    style={{ width: 26, height: 22, borderRadius: 4, border: `1px solid ${clip.textAlign === a ? '#555' : '#1e1e1e'}`, background: clip.textAlign === a ? '#2a2a2a' : '#161616', color: clip.textAlign === a ? '#fff' : '#aaa', cursor: 'pointer', fontSize: 10 }}>
                    {a[0].toUpperCase()}
                  </button>
                ))}
              </div>
            </Row>
          </Sec>
        )}

        {clip.type === 'shape' && (
          <Sec title="Shape">
            <Row label="Color">
              <input type="color" value={clip.shapeColor || '#3b82f6'} onChange={e => upd({ shapeColor: e.target.value })} style={{ width: 24, height: 20, border: 'none', cursor: 'pointer', borderRadius: 4, padding: 0 }} />
              <input type="text" value={clip.shapeColor || ''} onChange={e => { if (/^#[0-9a-f]{6}$/i.test(e.target.value)) upd({ shapeColor: e.target.value }); }} style={{ ...inp, flex: 1, fontSize: 10, padding: '3px 6px' }} />
            </Row>
          </Sec>
        )}

        {clip.type !== 'audio' && (
          <Sec title="Filter" open={false}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              {EFFECTS.map(e => {
                const active = clip.filter === e.id;
                return (
                  <div key={e.id || 'none'} onClick={() => upd({ filter: e.id })}
                    style={{ padding: '6px 7px', borderRadius: 6, background: active ? '#1a1a1a' : '#111', border: `1px solid ${active ? '#3a3a3a' : '#1a1a1a'}`, cursor: 'pointer', textAlign: 'center', fontSize: 10, color: active ? '#fff' : '#aaa' }}>
                    {e.name}
                  </div>
                );
              })}
            </div>
          </Sec>
        )}

        {clip.type !== 'audio' && (
          <Sec title="Transitions" open={false}>
            {['In', 'Out'].map(dir => {
              const key = `trans${dir}`, dkey = `trans${dir}Dur`;
              return (
                <div key={dir} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 9, color: '#888', fontWeight: 600, marginBottom: 4 }}>{dir.toUpperCase()}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 3, marginBottom: 6 }}>
                    {[{ id: null, icon: '—' }, ...TRANSITIONS].map(t => {
                      const active = clip[key] === t.id;
                      return (
                        <div key={t.id || 'none'} onClick={() => upd({ [key]: t.id })} title={t.name}
                          style={{ padding: '5px 3px', borderRadius: 5, background: active ? '#1a1a1a' : '#111', border: `1px solid ${active ? '#3a3a3a' : '#1a1a1a'}`, cursor: 'pointer', textAlign: 'center', fontSize: 12, color: active ? '#fff' : '#aaa' }}>
                          {t.icon || '—'}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 9, color: '#888', minWidth: 28 }}>Dur.</span>
                    <input type="range" min={0.1} max={3} step={0.1} value={clip[dkey] ?? 0.5}
                      onChange={e => upd({ [dkey]: parseFloat(e.target.value) })}
                      style={{ flex: 1, WebkitAppearance: 'none', height: 2, background: '#2a2a2a', borderRadius: 99, cursor: 'pointer', accentColor: '#fff' }} />
                    <span style={{ fontSize: 9, color: '#aaa', fontFamily: 'monospace', minWidth: 22 }}>{(clip[dkey] ?? 0.5).toFixed(1)}s</span>
                  </div>
                </div>
              );
            })}
          </Sec>
        )}

        <Sec title="Actions" open={false}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <button onClick={() => splitClip(clip.id, currentTime)} style={actionBtn}>✂ Split at Playhead</button>
            <button onClick={() => duplicateClip(clip.id)} style={actionBtn}>⧉ Duplicate</button>
            <button onClick={() => removeClip(clip.id)} style={{ ...actionBtn, borderColor: '#3a1a1a', background: '#1a0e0e', color: '#f87171' }}>✕ Delete</button>
          </div>
        </Sec>
      </div>
    </div>
  );
};

export default RightPanel;