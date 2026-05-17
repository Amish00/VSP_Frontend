import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // <-- add this
import { Download, Share2, Grid3x3, Undo2, Redo2, ChevronDown, ArrowLeft } from 'lucide-react';
import useEditorStore from './useEditorStore';
import ExportModal from './ExportModal';
import logoUrl from '../../../assets/logo.svg';
import { editorTheme } from './theme';

const SIZE_PRESETS = [
  { label: 'Presentation (16:9)', w: 1280, h: 720 },
  { label: 'Instagram Post', w: 1080, h: 1080 },
  { label: 'Instagram Story', w: 1080, h: 1920 },
  { label: 'Facebook Post', w: 1200, h: 630 },
  { label: 'Twitter Post', w: 1600, h: 900 },
  { label: 'A4 Portrait', w: 794, h: 1123 },
  { label: 'A4 Landscape', w: 1123, h: 794 },
  { label: 'YouTube Thumbnail', w: 1280, h: 720 },
  { label: 'Business Card', w: 1050, h: 600 },
];

const SizeModal = ({ onClose }) => {
  const { setPageSize, getCurrentPage } = useEditorStore();
  const page = getCurrentPage();
  const [w, setW] = useState(page.width);
  const [h, setH] = useState(page.height);
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(8,13,24,0.78)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: editorTheme.card, border: `1px solid ${editorTheme.border}`, borderRadius: 12, padding: 24, width: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: editorTheme.text }}>Canvas Size</span>
          <button onClick={onClose} className="btn-icon"><span style={{ fontSize: 16 }}>✕</span></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 16, maxHeight: 260, overflowY: 'auto' }}>
          {SIZE_PRESETS.map(p => (
            <div key={p.label} onClick={() => { setPageSize(p.w, p.h); onClose(); }} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 7, cursor: 'pointer', transition: 'background 0.1s' }} onMouseEnter={e => e.currentTarget.style.background = editorTheme.hov} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ fontSize: 13, color: editorTheme.textSecondary }}>{p.label}</span>
              <span style={{ fontSize: 11, color: editorTheme.textMuted, fontFamily: 'monospace' }}>{p.w}×{p.h}</span>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${editorTheme.border}`, paddingTop: 16 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: editorTheme.textMuted, marginBottom: 4, fontWeight: 600 }}>WIDTH</div>
              <input type="number" className="inp" value={w} onChange={e => setW(+e.target.value)} min={1} max={8000} />
            </div>
            <span style={{ color: editorTheme.textMuted, marginTop: 16, fontSize: 14 }}>×</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: editorTheme.textMuted, marginBottom: 4, fontWeight: 600 }}>HEIGHT</div>
              <input type="number" className="inp" value={h} onChange={e => setH(+e.target.value)} min={1} max={8000} />
            </div>
          </div>
          <button onClick={() => { setPageSize(w, h); onClose(); }} style={{ width: '100%', padding: '9px', borderRadius: 8, border: 'none', background: editorTheme.primaryLight, color: editorTheme.base, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Apply</button>
        </div>
      </div>
    </div>
  );
};

const TopBar = () => {
  const navigate = useNavigate();  // <-- for back navigation
  const { zoom, setZoom, showGrid, toggleGrid, getCurrentPage, documentName, setDocumentName } = useEditorStore();
  const page = getCurrentPage();
  const [showExport, setShowExport] = useState(false);
  const [showSize, setShowSize] = useState(false);
  const [editName, setEditName] = useState(false);

  const IconBtn = ({ icon: Icon, label, onClick, active }) => (
    <button onClick={onClick} title={label} className={`btn-icon ${active ? 'active' : ''}`}>
      <Icon size={15} />
    </button>
  );

  return (
    <>
      <div className="topbar" style={{ height: 48, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 4, flexShrink: 0, background: editorTheme.side, borderBottom: `1px solid ${editorTheme.border}`, zIndex: 30 }}>
        {/* Back button */}
        <button onClick={() => navigate('/creator/dashboard')} title="Back to Dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: editorTheme.textSecondary, cursor: 'pointer', padding: '4px 8px', borderRadius: 6, fontSize: 13, marginRight: 8 }} onMouseEnter={e => { e.currentTarget.style.background = editorTheme.hov; e.currentTarget.style.color = editorTheme.text; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = editorTheme.textSecondary; }}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        {/* Logo + document name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 8 }}>
          <img src={logoUrl} alt="Logo" style={{ width: 20, height: 20, borderRadius: 7, objectFit: 'contain' }} />
          {editName ? (
            <input autoFocus value={documentName} onChange={e => setDocumentName(e.target.value)} onBlur={() => setEditName(false)} onKeyDown={e => e.key === 'Enter' && setEditName(false)} style={{ background: editorTheme.el, border: `1px solid ${editorTheme.border}`, borderRadius: 6, color: editorTheme.text, padding: '3px 8px', fontSize: 13, fontWeight: 500, outline: 'none', width: 160 }} />
          ) : (
            <button onDoubleClick={() => setEditName(true)} style={{ background: 'none', border: 'none', color: editorTheme.text, fontSize: 13, fontWeight: 500, cursor: 'text', padding: 0 }}>{documentName}</button>
          )}
        </div>

        <div style={{ width: 1, height: 18, background: editorTheme.border, margin: '0 4px' }} />
        <IconBtn icon={Undo2} label="Undo (Ctrl+Z)" onClick={() => {}} />
        <IconBtn icon={Redo2} label="Redo (Ctrl+Y)" onClick={() => {}} />
        <div style={{ width: 1, height: 18, background: editorTheme.border, margin: '0 4px' }} />
        <IconBtn icon={Grid3x3} label="Toggle Grid" onClick={toggleGrid} active={showGrid} />
        <button onClick={() => setShowSize(true)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 8px', borderRadius: 7, border: 'none', background: 'transparent', color: editorTheme.textSecondary, cursor: 'pointer', fontSize: 11 }} onMouseEnter={e => { e.currentTarget.style.background = editorTheme.hov; e.currentTarget.style.color = editorTheme.text; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = editorTheme.textSecondary; }}>
          {page.width}×{page.height}
          <ChevronDown size={11} />
        </button>
        <div style={{ width: 1, height: 18, background: editorTheme.border, margin: '0 4px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button onClick={() => setZoom(Math.max(0.1, zoom - 0.25))} className="btn-icon" style={{ width: 26, height: 26 }}><span style={{ fontSize: 16, lineHeight: 1 }}>−</span></button>
          <select value={Math.round(zoom * 100) / 100} onChange={e => setZoom(parseFloat(e.target.value))} style={{ background: editorTheme.el, border: `1px solid ${editorTheme.border}`, color: editorTheme.textSecondary, borderRadius: 6, padding: '3px 4px', fontSize: 11, cursor: 'pointer', outline: 'none', width: 60, textAlign: 'center' }}>
            {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3].map(z => <option key={z} value={z}>{Math.round(z * 100)}%</option>)}
          </select>
          <button onClick={() => setZoom(Math.min(5, zoom + 0.25))} className="btn-icon" style={{ width: 26, height: 26 }}><span style={{ fontSize: 16, lineHeight: 1 }}>+</span></button>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowExport(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 7, border: `1px solid ${editorTheme.border}`, background: editorTheme.el, color: editorTheme.textSecondary, cursor: 'pointer', fontSize: 12, fontWeight: 500 }} onMouseEnter={e => { e.currentTarget.style.background = editorTheme.hov; e.currentTarget.style.color = editorTheme.text; }} onMouseLeave={e => { e.currentTarget.style.background = editorTheme.el; e.currentTarget.style.color = editorTheme.textSecondary; }}>
          <Download size={13} /> Export
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 7, border: 'none', background: editorTheme.primaryLight, color: editorTheme.base, cursor: 'pointer', fontSize: 12, fontWeight: 600, marginLeft: 6 }}>
          <Share2 size={13} /> Share
        </button>
      </div>
      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
      {showSize && <SizeModal onClose={() => setShowSize(false)} />}
    </>
  );
};

export default TopBar;