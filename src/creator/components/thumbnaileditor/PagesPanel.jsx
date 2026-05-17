import React from 'react';
import { Plus, Trash2, Copy } from 'lucide-react';
import useEditorStore from './useEditorStore';
import { editorTheme } from './theme';

const PageThumb = ({ page, index, isActive, onClick }) => {
  const scale = 90 / page.width;
  const h = 90 * (page.height / page.width);
  return (
    <div onClick={onClick} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '4px 2px' }}>
      <div style={{ width: 90, height: Math.round(h), background: page.background || editorTheme.base, borderRadius: 4, overflow: 'hidden', border: isActive ? `2px solid ${editorTheme.primaryLight}` : `2px solid ${editorTheme.border}`, transition: 'border-color 0.12s', position: 'relative', flexShrink: 0 }}>
        {page.layers.slice(-8).map(layer => {
          if (!layer.visible) return null;
          const lx = layer.x * scale, ly = layer.y * scale, lw = layer.width * scale, lh = layer.height * scale;
          if (layer.type === 'shape') return <div key={layer.id} style={{ position: 'absolute', left: lx, top: ly, width: lw, height: lh, background: layer.fill || '#ccc', opacity: layer.opacity ?? 1, borderRadius: layer.shapeType === 'circle' ? '50%' : 0 }} />;
          if (layer.type === 'text') return <div key={layer.id} style={{ position: 'absolute', left: lx, top: ly, width: lw, height: lh, fontSize: (layer.fontSize || 32) * scale, fontWeight: layer.fontWeight, color: layer.textColor || '#000', overflow: 'hidden', lineHeight: 1.2, opacity: layer.opacity ?? 1 }}>{(layer.text || '').slice(0, 8)}</div>;
          if (layer.type === 'image' && layer.src) return <img key={layer.id} src={layer.src} alt="" style={{ position: 'absolute', left: lx, top: ly, width: lw, height: lh, objectFit: 'cover', opacity: layer.opacity ?? 1 }} />;
          if (layer.type === 'emoji') return <div key={layer.id} style={{ position: 'absolute', left: lx, top: ly, width: lw, height: lh, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: lw * 0.7 }}>{layer.emoji}</div>;
          return null;
        })}
      </div>
      <span style={{ fontSize: 9, color: isActive ? editorTheme.text : editorTheme.textMuted, fontFamily: 'monospace' }}>{index + 1}</span>
    </div>
  );
};

const PagesPanel = () => {
  const { pages, currentPageIndex, setCurrentPage, addPage, deletePage, duplicatePage } = useEditorStore();
  return (
    <div style={{ height: 108, background: editorTheme.side, borderTop: `1px solid ${editorTheme.border}`, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 10, flexShrink: 0 }}>
      <span style={{ fontSize: 9, color: editorTheme.textMuted, fontWeight: 600, letterSpacing: 1, flexShrink: 0, writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>PAGES</span>
      <div style={{ flex: 1, display: 'flex', gap: 8, overflowX: 'auto', alignItems: 'center', padding: '6px 0' }}>
        {pages.map((page, i) => (
          <PageThumb key={page.id} page={page} index={i} isActive={i === currentPageIndex} onClick={() => setCurrentPage(i)} />
        ))}
        <button onClick={addPage} style={{ width: 62, height: 46, background: 'transparent', border: `1.5px dashed ${editorTheme.border}`, borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: editorTheme.textMuted, transition: 'all 0.12s', flexShrink: 0 }} onMouseEnter={e => { e.currentTarget.style.borderColor = editorTheme.textMuted; e.currentTarget.style.color = editorTheme.textSecondary; }} onMouseLeave={e => { e.currentTarget.style.borderColor = editorTheme.border; e.currentTarget.style.color = editorTheme.textMuted; }}>
          <Plus size={16} />
        </button>
      </div>
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <button onClick={() => duplicatePage(currentPageIndex)} title="Duplicate page" className="btn-icon"><Copy size={14} /></button>
        <button onClick={() => deletePage(currentPageIndex)} title="Delete page" disabled={pages.length === 1} className="btn-icon" style={{ opacity: pages.length === 1 ? 0.3 : 1 }}><Trash2 size={14} /></button>
      </div>
    </div>
  );
};

export default PagesPanel;