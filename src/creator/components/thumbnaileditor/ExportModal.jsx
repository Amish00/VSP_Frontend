import React, { useState } from 'react';
import { X, Download, Check, Loader } from 'lucide-react';
import useEditorStore from './useEditorStore';
import { editorTheme } from './theme';

const ExportModal = ({ onClose }) => {
  const store = useEditorStore();
  const [format, setFormat] = useState('png');
  const [scale, setScale] = useState(2);
  const [status, setStatus] = useState('idle');
  const [msg, setMsg] = useState('');

  const getExportBaseName = () => {
    const raw = (store.documentName || 'design').trim();
    const safe = raw.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim();
    return safe || 'design';
  };

  const isCanvasBlank = (canvas) => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return true;
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] !== 0) return false;
    }
    return true;
  };

  const buildOffscreen = (page) => {
    const wrap = document.createElement('div');
    wrap.style.cssText = `position:fixed;left:-99999px;top:-99999px;width:${page.width}px;height:${page.height}px;overflow:hidden;`;
    const bg = document.createElement('div');
    bg.style.cssText = `position:absolute;inset:0;background:${page.background};`;
    wrap.appendChild(bg);
    for (const layer of page.layers) {
      if (!layer.visible) continue;
      const el = document.createElement('div');
      el.style.cssText = `position:absolute;left:${layer.x}px;top:${layer.y}px;width:${layer.width}px;height:${layer.height}px;transform:rotate(${layer.rotation || 0}deg);opacity:${layer.opacity ?? 1};transform-origin:center center;box-sizing:border-box;`;
      if (layer.type === 'text') {
        el.style.fontFamily = layer.fontFamily || 'Inter, sans-serif';
        el.style.fontSize = (layer.fontSize || 32) + 'px';
        el.style.fontWeight = layer.fontWeight || '600';
        el.style.fontStyle = layer.fontStyle || 'normal';
        el.style.textDecoration = layer.textDecoration || 'none';
        el.style.color = layer.textColor || '#000';
        el.style.textAlign = layer.textAlign || 'left';
        el.style.lineHeight = String(layer.lineHeight || 1.25);
        el.style.letterSpacing = (layer.letterSpacing || 0) + 'px';
        el.style.padding = '4px';
        el.style.whiteSpace = 'pre-wrap';
        el.style.wordBreak = 'break-word';
        el.style.overflow = 'hidden';
        el.textContent = layer.text || '';
      } else if (layer.type === 'shape') {
        const shapesSVG = {
          rectangle: `<rect x="0" y="0" width="100" height="100" fill="${layer.fill || '#ccc'}" stroke="${layer.stroke || 'none'}" stroke-width="${layer.strokeWidth || 0}" rx="0"/>`,
          circle: `<ellipse cx="50" cy="50" rx="50" ry="50" fill="${layer.fill || '#ccc'}" stroke="${layer.stroke || 'none'}" stroke-width="${layer.strokeWidth || 0}"/>`,
          triangle: `<polygon points="50,0 100,100 0,100" fill="${layer.fill || '#ccc'}" stroke="${layer.stroke || 'none'}" stroke-width="${layer.strokeWidth || 0}"/>`,
          diamond: `<polygon points="50,0 100,50 50,100 0,50" fill="${layer.fill || '#ccc'}" stroke="${layer.stroke || 'none'}" stroke-width="${layer.strokeWidth || 0}"/>`,
          star: `<polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="${layer.fill || '#ccc'}" stroke="${layer.stroke || 'none'}" stroke-width="${layer.strokeWidth || 0}"/>`,
          pentagon: `<polygon points="50,2 98,36 79,90 21,90 2,36" fill="${layer.fill || '#ccc'}" stroke="${layer.stroke || 'none'}" stroke-width="${layer.strokeWidth || 0}"/>`,
          hexagon: `<polygon points="25,5 75,5 97,50 75,95 25,95 3,50" fill="${layer.fill || '#ccc'}" stroke="${layer.stroke || 'none'}" stroke-width="${layer.strokeWidth || 0}"/>`,
          arrow: `<polygon points="0,35 60,35 60,0 100,50 60,100 60,65 0,65" fill="${layer.fill || '#ccc'}" stroke="${layer.stroke || 'none'}" stroke-width="${layer.strokeWidth || 0}"/>`,
          heart: `<path d="M50,75 C25,55 5,42 5,28 C5,15 15,5 28,5 C36,5 43,9 50,17 C57,9 64,5 72,5 C85,5 95,15 95,28 C95,42 75,55 50,75Z" fill="${layer.fill || '#ccc'}" stroke="${layer.stroke || 'none'}" stroke-width="${layer.strokeWidth || 0}"/>`,
          cross: `<path d="M35,5 L65,5 L65,35 L95,35 L95,65 L65,65 L65,95 L35,95 L35,65 L5,65 L5,35 L35,35Z" fill="${layer.fill || '#ccc'}" stroke="${layer.stroke || 'none'}" stroke-width="${layer.strokeWidth || 0}"/>`,
          chatbubble: `<path d="M5,5 L95,5 L95,70 L55,70 L40,95 L40,70 L5,70Z" fill="${layer.fill || '#ccc'}" stroke="${layer.stroke || 'none'}" stroke-width="${layer.strokeWidth || 0}"/>`,
          parallelogram: `<polygon points="20,5 100,5 80,95 0,95" fill="${layer.fill || '#ccc'}" stroke="${layer.stroke || 'none'}" stroke-width="${layer.strokeWidth || 0}"/>`,
        };
        el.innerHTML = `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">${shapesSVG[layer.shapeType || 'rectangle']}</svg>`;
      } else if (layer.type === 'image' && layer.src) {
        el.style.overflow = 'hidden';
        const img = document.createElement('img');
        img.crossOrigin = 'anonymous';
        img.src = layer.src;
        img.style.cssText = `width:100%;height:100%;object-fit:${layer.objectFit || 'cover'};border-radius:${layer.borderRadius || 0}%;display:block;`;
        el.appendChild(img);
      } else if (layer.type === 'emoji') {
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.fontFamily = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji","Segoe UI Symbol",sans-serif';
        el.style.fontSize = Math.min(layer.width, layer.height) * 0.75 + 'px';
        el.style.lineHeight = '1.15';
        el.style.overflow = 'visible';
        el.textContent = layer.emoji || '';
      } else if (layer.type === 'line') {
        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        const line = document.createElementNS(ns, 'line');
        line.setAttribute('x1', '0');
        line.setAttribute('y1', '50%');
        line.setAttribute('x2', '100%');
        line.setAttribute('y2', '50%');
        line.setAttribute('stroke', layer.stroke || '#000');
        line.setAttribute('stroke-width', String(layer.strokeWidth || 2));
        line.setAttribute('stroke-linecap', 'round');
        if (layer.lineStyle === 'dashed') line.setAttribute('stroke-dasharray', '12,5');
        if (layer.lineStyle === 'dotted') line.setAttribute('stroke-dasharray', '3,6');
        svg.appendChild(line);
        el.appendChild(svg);
      }
      wrap.appendChild(el);
    }
    document.body.appendChild(wrap);
    return wrap;
  };

  const doExport = async () => {
    setStatus('loading');
    setMsg('Building canvas...');
    const page = store.getCurrentPage();
    try {
      if (format === 'svg') {
        setMsg('Generating SVG...');
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${page.width}" height="${page.height}">`;
        svg += `<rect width="100%" height="100%" fill="${page.background}"/>`;
        for (const l of page.layers) {
          if (!l.visible) continue;
          const g = `transform="translate(${l.x},${l.y}) rotate(${l.rotation || 0},${l.width / 2},${l.height / 2})" opacity="${l.opacity ?? 1}"`;
          if (l.type === 'text') {
            svg += `<text ${g} font-family="${l.fontFamily || 'sans-serif'}" font-size="${l.fontSize || 32}" font-weight="${l.fontWeight || '600'}" fill="${l.textColor || '#000'}">${(l.text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>`;
          } else if (l.type === 'shape') {
            svg += `<g ${g}><svg x="0" y="0" width="${l.width}" height="${l.height}" viewBox="0 0 100 100" preserveAspectRatio="none"><rect width="100" height="100" fill="${l.fill || '#ccc'}"/></svg></g>`;
          }
        }
        svg += '</svg>';
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${getExportBaseName()}.svg`;
        a.click();
        URL.revokeObjectURL(url);
        setStatus('done');
        setMsg('SVG downloaded!');
        setTimeout(() => setStatus('idle'), 2000);
        return;
      }
      const html2canvas = (await import('html2canvas')).default;
      const wrap = buildOffscreen(page);
      setMsg('Rendering...');
      if (document.fonts?.ready) await document.fonts.ready;
      await new Promise(r => setTimeout(r, 120));
      let canvas;
      try {
        canvas = await html2canvas(wrap, { width: page.width, height: page.height, scale, useCORS: true, allowTaint: false, backgroundColor: null, logging: false });
        if (isCanvasBlank(canvas)) {
          canvas = await html2canvas(wrap, { width: page.width, height: page.height, scale, useCORS: true, allowTaint: false, backgroundColor: null, logging: false, foreignObjectRendering: true });
        }
      } finally {
        document.body.removeChild(wrap);
      }
      if (format === 'pdf') {
        setMsg('Generating PDF...');
        const { jsPDF } = await import('jspdf');
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: page.width > page.height ? 'landscape' : 'portrait', unit: 'px', format: [page.width, page.height] });
        pdf.addImage(imgData, 'PNG', 0, 0, page.width, page.height);
        pdf.save(`${getExportBaseName()}.pdf`);
      } else {
        setMsg('Saving...');
        const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
        const q = format === 'jpg' ? 0.92 : 1;
        const url = canvas.toDataURL(mime, q);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${getExportBaseName()}.${format}`;
        a.click();
      }
      setStatus('done');
      setMsg('Downloaded!');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMsg(err.message);
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const formats = [
    { id: 'png', label: 'PNG', desc: 'Best quality' },
    { id: 'jpg', label: 'JPG', desc: 'Smaller file' },
    { id: 'svg', label: 'SVG', desc: 'Vector' },
    { id: 'pdf', label: 'PDF', desc: 'Print ready' },
  ];

  const page = store.getCurrentPage();

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(8,13,24,0.78)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: editorTheme.card, border: `1px solid ${editorTheme.border}`, borderRadius: 14, padding: 24, width: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: editorTheme.text }}>Export Design</span>
          <button onClick={onClose} className="btn-icon"><X size={15} /></button>
        </div>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 10, color: editorTheme.textMuted, fontWeight: 600, letterSpacing: 0.8, marginBottom: 8 }}>FORMAT</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
            {formats.map(f => (
              <div key={f.id} onClick={() => setFormat(f.id)} style={{ padding: '10px 6px', borderRadius: 9, cursor: 'pointer', border: format === f.id ? `1.5px solid ${editorTheme.borderLight}` : `1.5px solid ${editorTheme.border}`, background: format === f.id ? editorTheme.hov : editorTheme.el, textAlign: 'center', transition: 'all 0.12s' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: format === f.id ? editorTheme.text : editorTheme.textSecondary, marginBottom: 2 }}>{f.label}</div>
                <div style={{ fontSize: 9, color: editorTheme.textMuted }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
        {(format === 'png' || format === 'jpg') && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, color: editorTheme.textMuted, fontWeight: 600, letterSpacing: 0.8, marginBottom: 8 }}>SCALE</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3].map(s => (
                <button key={s} onClick={() => setScale(s)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: scale === s ? `1.5px solid ${editorTheme.borderLight}` : `1.5px solid ${editorTheme.border}`, background: scale === s ? editorTheme.hov : editorTheme.el, color: scale === s ? editorTheme.text : editorTheme.textSecondary, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                  {s}× <span style={{ fontSize: 9, fontWeight: 400, color: editorTheme.textMuted }}>{s === 1 ? '72dpi' : s === 2 ? '144dpi' : '216dpi'}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div style={{ background: editorTheme.side, borderRadius: 8, padding: '10px 12px', marginBottom: 18, fontSize: 11, border: `1px solid ${editorTheme.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: editorTheme.textMuted, marginBottom: 4 }}><span>Canvas</span><span style={{ color: editorTheme.textSecondary, fontFamily: 'monospace' }}>{page.width}×{page.height}px</span></div>
          {(format === 'png' || format === 'jpg') && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: editorTheme.textMuted }}><span>Export</span><span style={{ color: editorTheme.text, fontFamily: 'monospace' }}>{page.width * scale}×{page.height * scale}px</span></div>
          )}
        </div>
        <button onClick={doExport} disabled={status === 'loading'} style={{ width: '100%', padding: '11px', borderRadius: 9, border: 'none', background: status === 'done' ? '#11311f' : status === 'error' ? '#3a1a1a' : editorTheme.primaryLight, color: status === 'done' ? '#4ade80' : status === 'error' ? '#f87171' : editorTheme.base, cursor: status === 'loading' ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s' }}>
          {status === 'loading' && <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> {msg}</>}
          {status === 'done' && <><Check size={14} /> {msg}</>}
          {status === 'error' && <>Error: {msg}</>}
          {status === 'idle' && <><Download size={14} /> Export {format.toUpperCase()}</>}
        </button>
      </div>
      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
    </div>
  );
};

export default ExportModal;