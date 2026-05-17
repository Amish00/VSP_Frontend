import React, { useState } from 'react';
import {
  ChevronDown, ChevronRight, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, Strikethrough, ArrowUp, ArrowDown, ChevronsUp, ChevronsDown,
  Copy, Trash2, AlignHorizontalJustifyStart, AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd, AlignVerticalJustifyStart, AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd
} from 'lucide-react';
import useEditorStore from './useEditorStore';

const FONTS = ['Inter','Arial','Georgia','Courier New','Impact','Trebuchet MS','Times New Roman','Garamond','Verdana'];
const SWATCH_COLORS = [
  '#000','#fff','#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899',
  '#6b7280','#374151','#1f2937','#7c3aed','#db2777','#dc2626','#059669','#0284c7',
];

function ColorBtn({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position:'relative' }}>
      <div onClick={() => setOpen(!open)} style={{ width:26, height:26, borderRadius:5, background:value||'#000', border:'1.5px solid #3a3a40', cursor:'pointer', flexShrink:0, transition:'border-color 0.1s' }}
        onMouseEnter={e => e.currentTarget.style.borderColor='#666'} onMouseLeave={e => e.currentTarget.style.borderColor='#3a3a40'} />
      {open && (
        <div style={{ position:'absolute', right:0, top:32, zIndex:9999, background:'#1e1e24', border:'1px solid #2e2e36', borderRadius:10, padding:12, width:180, boxShadow:'0 8px 32px rgba(0,0,0,0.5)' }}>
          <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:10 }}>
            {SWATCH_COLORS.map(c => (
              <div key={c} onClick={() => { onChange(c); setOpen(false); }}
                style={{ width:22, height:22, borderRadius:4, background:c, cursor:'pointer', border: value===c?'2px solid #fff':'2px solid transparent' }} />
            ))}
          </div>
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            <input type="color" value={value||'#000000'} onChange={e => onChange(e.target.value)} style={{ width:28, height:26, border:'none', cursor:'pointer', borderRadius:4, padding:0, background:'transparent' }} />
            <input type="text" value={value||''} onChange={e => { if(/^#[0-9a-f]{6}$/i.test(e.target.value)) onChange(e.target.value); }} className="inp" style={{ flex:1, fontSize:11, padding:'4px 6px' }} placeholder="#000000" />
          </div>
          <button onClick={() => setOpen(false)} style={{ marginTop:8, width:'100%', padding:'4px', background:'#2a2a30', border:'none', borderRadius:5, color:'#aaa', cursor:'pointer', fontSize:10 }}>Done</button>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
      <span style={{ fontSize:11, color:'#aaa', minWidth:52, flexShrink:0 }}>{label}</span>
      <div style={{ flex:1, display:'flex', justifyContent:'flex-end', gap:4 }}>{children}</div>
    </div>
  );
}

function Section({ title, children, defaultOpen=true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom:'1px solid #2a2a30' }}>
      <button onClick={() => setOpen(!open)}
        style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:'none', border:'none', cursor:'pointer', color:'#aaa', fontSize:10, fontWeight:600, letterSpacing:0.8 }}>
        {title}
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </button>
      {open && <div style={{ padding:'0 14px 12px' }}>{children}</div>}
    </div>
  );
}

function TransformSection({ layer }) {
  const upd = useEditorStore(s => s.updateLayer);
  return (
    <Section title="TRANSFORM">
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:10 }}>
        {[['X','x'],['Y','y'],['W','width'],['H','height']].map(([lbl,key]) => (
          <div key={key}>
            <div style={{ fontSize:9, color:'#666', marginBottom:3, fontWeight:600 }}>{lbl}</div>
            <input type="number" className="num-inp" value={Math.round(layer[key])} onChange={e => upd(layer.id,{[key]:+e.target.value||0})} style={{ width:'100%' }} />
          </div>
        ))}
      </div>
      <Field label="Rotate">
        <input type="range" min={0} max={360} value={Math.round(layer.rotation||0)} onChange={e => upd(layer.id,{rotation:+e.target.value})} style={{ flex:1 }} />
        <input type="number" className="num-inp" style={{ width:50 }} value={Math.round(layer.rotation||0)} onChange={e => upd(layer.id,{rotation:+e.target.value||0})} />
      </Field>
      <Field label="Opacity">
        <input type="range" min={0} max={1} step={0.01} value={layer.opacity??1} onChange={e => upd(layer.id,{opacity:+e.target.value})} style={{ flex:1 }} />
        <span style={{ fontSize:10, color:'#aaa', minWidth:32, textAlign:'right' }}>{Math.round((layer.opacity??1)*100)}%</span>
      </Field>
    </Section>
  );
}

function TextSection({ layer }) {
  const upd = useEditorStore(s => s.updateLayer);
  const aligns = [
    { val:'left', Icon:AlignLeft },
    { val:'center', Icon:AlignCenter },
    { val:'right', Icon:AlignRight },
    { val:'justify', Icon:AlignJustify },
  ];
  const styles = [
    { key:'fontWeight', on:'700', off:'400', Icon:Bold },
    { key:'fontStyle', on:'italic', off:'normal', Icon:Italic },
    { key:'textDecoration', on:'underline', off:'none', Icon:Underline },
    { key:'textDecoration', on:'line-through', off:'none', Icon:Strikethrough },
  ];

  return (
    <Section title="TEXT">
      <Field label="Font">
        <select className="inp" style={{ fontSize:11, width:'100%' }} value={layer.fontFamily||'Inter'} onChange={e => upd(layer.id,{fontFamily:e.target.value})}>
          {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </Field>
      <div style={{ display:'flex', gap:6, marginBottom:10 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:9, color:'#666', marginBottom:3, fontWeight:600 }}>SIZE</div>
          <input type="number" className="num-inp" value={layer.fontSize||32} min={1} onChange={e => upd(layer.id,{fontSize:+e.target.value||12})} style={{ width:'100%' }} />
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:9, color:'#666', marginBottom:3, fontWeight:600 }}>LINE H.</div>
          <input type="number" className="num-inp" value={layer.lineHeight||1.2} step={0.1} min={0.5} onChange={e => upd(layer.id,{lineHeight:+e.target.value||1})} style={{ width:'100%' }} />
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:9, color:'#666', marginBottom:3, fontWeight:600 }}>SPACING</div>
          <input type="number" className="num-inp" value={layer.letterSpacing||0} min={-10} onChange={e => upd(layer.id,{letterSpacing:+e.target.value||0})} style={{ width:'100%' }} />
        </div>
      </div>
      <Field label="Color">
        <ColorBtn value={layer.textColor||'#000'} onChange={v => upd(layer.id,{textColor:v})} />
      </Field>
      <Field label="Align">
        <div style={{ display:'flex', gap:4 }}>
          {aligns.map(({val,Icon}) => (
            <button key={val} onClick={() => upd(layer.id,{textAlign:val})} className="btn-icon"
              style={{ width:28, height:28, background:(layer.textAlign||'left')===val?'#2a2a30':'transparent', color:(layer.textAlign||'left')===val?'#fff':'#aaa', borderRadius:5 }}>
              <Icon size={14} />
            </button>
          ))}
        </div>
      </Field>
      <Field label="Style">
        <div style={{ display:'flex', gap:4 }}>
          {styles.map(({key,on,off,Icon},i) => {
            const active = layer[key]===on;
            return (
              <button key={i} onClick={() => upd(layer.id,{[key]:active?off:on})} className="btn-icon"
                style={{ width:28, height:28, background:active?'#2a2a30':'transparent', color:active?'#fff':'#aaa', borderRadius:5 }}>
                <Icon size={14} />
              </button>
            );
          })}
        </div>
      </Field>
    </Section>
  );
}

function ShapeSection({ layer }) {
  const upd = useEditorStore(s => s.updateLayer);
  const SHAPES = ['rectangle','circle','triangle','diamond','star','pentagon','hexagon','arrow','heart','cross','chatbubble','parallelogram'];
  return (
    <Section title="SHAPE">
      <Field label="Type">
        <select className="inp" style={{ fontSize:11, width:'100%' }} value={layer.shapeType||'rectangle'} onChange={e => upd(layer.id,{shapeType:e.target.value})}>
          {SHAPES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
        </select>
      </Field>
      <Field label="Fill"><ColorBtn value={layer.fill||'#e5e5e5'} onChange={v => upd(layer.id,{fill:v})} /></Field>
      <Field label="Stroke"><ColorBtn value={layer.stroke==='none'?'#000':(layer.stroke||'#000')} onChange={v => upd(layer.id,{stroke:v})} /></Field>
      <Field label="Stroke W.">
        <input type="number" className="num-inp" style={{ width:70 }} value={layer.strokeWidth||0} min={0} max={30} onChange={e => upd(layer.id,{strokeWidth:+e.target.value||0})} />
      </Field>
    </Section>
  );
}

function ImageSection({ layer }) {
  const upd = useEditorStore(s => s.updateLayer);
  return (
    <Section title="IMAGE">
      <Field label="Fit">
        <select className="inp" style={{ fontSize:11, width:'100%' }} value={layer.objectFit||'cover'} onChange={e => upd(layer.id,{objectFit:e.target.value})}>
          {['cover','contain','fill','none'].map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </Field>
      <Field label="Radius">
        <input type="range" min={0} max={50} value={layer.borderRadius||0} onChange={e => upd(layer.id,{borderRadius:+e.target.value})} style={{ flex:1 }} />
        <span style={{ fontSize:10, color:'#aaa', minWidth:32, textAlign:'right' }}>{layer.borderRadius||0}%</span>
      </Field>
    </Section>
  );
}

function LineSection({ layer }) {
  const upd = useEditorStore(s => s.updateLayer);
  return (
    <Section title="LINE">
      <Field label="Color"><ColorBtn value={layer.stroke||'#aaa'} onChange={v => upd(layer.id,{stroke:v})} /></Field>
      <Field label="Width">
        <input type="range" min={1} max={30} value={layer.strokeWidth||2} onChange={e => upd(layer.id,{strokeWidth:+e.target.value})} style={{ flex:1 }} />
        <span style={{ fontSize:10, color:'#aaa', minWidth:28 }}>{layer.strokeWidth||2}px</span>
      </Field>
      <Field label="Style">
        <select className="inp" style={{ fontSize:11, width:'100%' }} value={layer.lineStyle||'solid'} onChange={e => upd(layer.id,{lineStyle:e.target.value})}>
          {['solid','dashed','dotted'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
    </Section>
  );
}

function ArrangeSection() {
  const store = useEditorStore();
  const iconBtn = (Icon, action, label) => (
    <button onClick={action} title={label} className="btn-icon" style={{ flex:1, width:'auto', borderRadius:6, border:'1px solid #2e2e36', padding:'6px 0' }}>
      <Icon size={14} />
    </button>
  );
  return (
    <Section title="ARRANGE">
      <div style={{ display:'flex', gap:6, marginBottom:12 }}>
        {iconBtn(ChevronsUp, store.bringToFront, 'To Front')}
        {iconBtn(ArrowUp, store.bringForward, 'Bring Forward')}
        {iconBtn(ArrowDown, store.sendBackward, 'Send Backward')}
        {iconBtn(ChevronsDown, store.sendToBack, 'To Back')}
      </div>
      <div style={{ marginBottom:12 }}>
        <div style={{ fontSize:10, color:'#666', fontWeight:600, marginBottom:8, letterSpacing:0.8 }}>ALIGN</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
          {/* Row 1: Horizontal aligns */}
          <button onClick={() => store.alignLayers('left')} title="Align Left" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'6px 4px', borderRadius:6, border:'1px solid #2e2e36', background:'transparent', color:'#aaa', cursor:'pointer', fontSize:12 }}>
            <AlignHorizontalJustifyStart size={14} /> Left
          </button>
          <button onClick={() => store.alignLayers('centerH')} title="Center Horizontally" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'6px 4px', borderRadius:6, border:'1px solid #2e2e36', background:'transparent', color:'#aaa', cursor:'pointer', fontSize:12 }}>
            <AlignHorizontalJustifyCenter size={14} /> Center H
          </button>
          <button onClick={() => store.alignLayers('right')} title="Align Right" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'6px 4px', borderRadius:6, border:'1px solid #2e2e36', background:'transparent', color:'#aaa', cursor:'pointer', fontSize:12 }}>
            <AlignHorizontalJustifyEnd size={14} /> Right
          </button>
          {/* Row 2: Vertical aligns */}
          <button onClick={() => store.alignLayers('top')} title="Align Top" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'6px 4px', borderRadius:6, border:'1px solid #2e2e36', background:'transparent', color:'#aaa', cursor:'pointer', fontSize:12 }}>
            <AlignVerticalJustifyStart size={14} /> Top
          </button>
          <button onClick={() => store.alignLayers('centerV')} title="Center Vertically" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'6px 4px', borderRadius:6, border:'1px solid #2e2e36', background:'transparent', color:'#aaa', cursor:'pointer', fontSize:12 }}>
            <AlignVerticalJustifyCenter size={14} /> Middle
          </button>
          <button onClick={() => store.alignLayers('bottom')} title="Align Bottom" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'6px 4px', borderRadius:6, border:'1px solid #2e2e36', background:'transparent', color:'#aaa', cursor:'pointer', fontSize:12 }}>
            <AlignVerticalJustifyEnd size={14} /> Bottom
          </button>
        </div>
      </div>
      <div style={{ display:'flex', gap:6 }}>
        <button onClick={store.duplicateSelectedLayers} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'8px', borderRadius:6, border:'1px solid #2e2e36', background:'#1e1e24', color:'#aaa', cursor:'pointer', fontSize:11 }} onMouseEnter={e => { e.currentTarget.style.background='#2a2a30'; e.currentTarget.style.color='#fff'; }} onMouseLeave={e => { e.currentTarget.style.background='#1e1e24'; e.currentTarget.style.color='#aaa'; }}>
          <Copy size={13} /> Duplicate
        </button>
        <button onClick={store.deleteSelectedLayers} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'8px', borderRadius:6, border:'1px solid #5a1a1a', background:'#2a1010', color:'#f87171', cursor:'pointer', fontSize:11 }} onMouseEnter={e => { e.currentTarget.style.background='#3a1010'; e.currentTarget.style.color='#ff8a8a'; }} onMouseLeave={e => { e.currentTarget.style.background='#2a1010'; e.currentTarget.style.color='#f87171'; }}>
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </Section>
  );
}

export default function RightPanel() {
  const { selectedLayerIds, pages, currentPageIndex } = useEditorStore();
  const page = pages[currentPageIndex];
  const layer = page.layers.find(l => selectedLayerIds[0] === l.id);

  if (!layer) return null;

  return (
    <div className="panel-right" style={{ width: 260, display:'flex', flexDirection:'column', zIndex:15, overflowY:'auto', overflowX:'hidden', flexShrink:0 }}>
      <div style={{ padding:'11px 14px 10px', borderBottom:'1px solid #2a2a30', flexShrink:0, display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:12, fontWeight:600, color:'#e5e5e5', textTransform:'capitalize' }}>{layer.type}</span>
        {selectedLayerIds.length > 1 && <span style={{ fontSize:10, color:'#666' }}>+{selectedLayerIds.length-1}</span>}
      </div>
      <TransformSection layer={layer} />
      {layer.type === 'text' && <TextSection layer={layer} />}
      {layer.type === 'shape' && <ShapeSection layer={layer} />}
      {layer.type === 'image' && <ImageSection layer={layer} />}
      {layer.type === 'line' && <LineSection layer={layer} />}
      <ArrangeSection />
    </div>
  );
}