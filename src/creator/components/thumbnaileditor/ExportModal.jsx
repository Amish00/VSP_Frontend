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

  // Render a single layer to canvas context (for perfect emoji and image rendering)
  const renderLayerToCanvas = async (ctx, layer, width, height) => {
    ctx.save();
    
    // Apply transformations
    const centerX = width / 2;
    const centerY = height / 2;
    ctx.translate(layer.x + centerX, layer.y + centerY);
    ctx.rotate((layer.rotation || 0) * Math.PI / 180);
    ctx.globalAlpha = layer.opacity ?? 1;
    ctx.translate(-centerX, -centerY);
    
    if (layer.type === 'emoji') {
      // Perfect emoji rendering using canvas text
      const emoji = layer.emoji || '😀';
      const fontSize = Math.min(width, height) * 0.7;
      ctx.font = `${fontSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "Segoe UI Symbol", "Helvetica Neue", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#000000';
      ctx.fillText(emoji, width / 2, height / 2);
    } 
    else if (layer.type === 'image' && layer.src) {
      await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          // Calculate object-fit positioning
          const imgAspect = img.width / img.height;
          const containerAspect = width / height;
          
          let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
          
          if (layer.objectFit === 'cover') {
            if (imgAspect > containerAspect) {
              drawHeight = height;
              drawWidth = img.width * (height / img.height);
              offsetX = (width - drawWidth) / 2;
            } else {
              drawWidth = width;
              drawHeight = img.height * (width / img.width);
              offsetY = (height - drawHeight) / 2;
            }
          } else if (layer.objectFit === 'contain') {
            if (imgAspect > containerAspect) {
              drawWidth = width;
              drawHeight = img.height * (width / img.width);
              offsetY = (height - drawHeight) / 2;
            } else {
              drawHeight = height;
              drawWidth = img.width * (height / img.height);
              offsetX = (width - drawWidth) / 2;
            }
          } else { // fill/stretch
            drawWidth = width;
            drawHeight = height;
          }
          
          // Apply border radius as clip
          if (layer.borderRadius > 0) {
            ctx.save();
            ctx.beginPath();
            const radius = (layer.borderRadius / 100) * Math.min(width, height);
            ctx.moveTo(radius, 0);
            ctx.lineTo(width - radius, 0);
            ctx.quadraticCurveTo(width, 0, width, radius);
            ctx.lineTo(width, height - radius);
            ctx.quadraticCurveTo(width, height, width - radius, height);
            ctx.lineTo(radius, height);
            ctx.quadraticCurveTo(0, height, 0, height - radius);
            ctx.lineTo(0, radius);
            ctx.quadraticCurveTo(0, 0, radius, 0);
            ctx.closePath();
            ctx.clip();
          }
          
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
          
          if (layer.borderRadius > 0) {
            ctx.restore();
          }
          
          resolve();
        };
        img.onerror = () => resolve();
        img.src = layer.src;
      });
    }
    else if (layer.type === 'text') {
      ctx.font = `${layer.fontStyle || 'normal'} ${layer.fontWeight || '600'} ${layer.fontSize || 32}px ${layer.fontFamily || 'Inter, sans-serif'}`;
      ctx.fillStyle = layer.textColor || '#000';
      ctx.textAlign = layer.textAlign || 'left';
      ctx.textBaseline = 'top';
      ctx.letterSpacing = `${layer.letterSpacing || 0}px`;
      
      const lines = (layer.text || '').split('\n');
      const lineHeight = (layer.lineHeight || 1.25) * (layer.fontSize || 32);
      
      lines.forEach((line, i) => {
        let x = 4; // padding
        if (ctx.textAlign === 'center') x = width / 2;
        if (ctx.textAlign === 'right') x = width - 4;
        ctx.fillText(line, x, i * lineHeight + 4);
      });
    }
    else if (layer.type === 'shape') {
      // Render shape using canvas paths
      const fill = layer.fill || '#ccc';
      const stroke = layer.stroke || 'none';
      const strokeWidth = layer.strokeWidth || 0;
      
      ctx.beginPath();
      const w = width, h = height;
      const centerX = w / 2, centerY = h / 2;
      
      switch(layer.shapeType) {
        case 'rectangle':
          ctx.rect(0, 0, w, h);
          break;
        case 'circle':
          ctx.ellipse(centerX, centerY, w/2, h/2, 0, 0, 2 * Math.PI);
          break;
        case 'triangle':
          ctx.moveTo(centerX, 0);
          ctx.lineTo(w, h);
          ctx.lineTo(0, h);
          ctx.closePath();
          break;
        case 'diamond':
          ctx.moveTo(centerX, 0);
          ctx.lineTo(w, centerY);
          ctx.lineTo(centerX, h);
          ctx.lineTo(0, centerY);
          ctx.closePath();
          break;
        case 'star':
          const points = 5;
          const outerR = Math.min(w, h) / 2;
          const innerR = outerR * 0.4;
          for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? outerR : innerR;
            const angle = (Math.PI * 2 * i) / (points * 2) - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          break;
        default:
          ctx.rect(0, 0, w, h);
      }
      
      if (fill !== 'none') {
        ctx.fillStyle = fill;
        ctx.fill();
      }
      if (stroke !== 'none' && strokeWidth > 0) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
      }
    }
    else if (layer.type === 'line') {
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.strokeStyle = layer.stroke || '#000';
      ctx.lineWidth = layer.strokeWidth || 2;
      
      if (layer.lineStyle === 'dashed') {
        ctx.setLineDash([12, 6]);
      } else if (layer.lineStyle === 'dotted') {
        ctx.setLineDash([3, 6]);
      } else {
        ctx.setLineDash([]);
      }
      
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    ctx.restore();
  };

  const renderPageToCanvas = async (page, targetScale = 1) => {
    const canvas = document.createElement('canvas');
    canvas.width = page.width * targetScale;
    canvas.height = page.height * targetScale;
    const ctx = canvas.getContext('2d');
    
    // Draw background
    ctx.fillStyle = page.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Scale context for high-res export
    ctx.scale(targetScale, targetScale);
    
    // Render each layer in order
    for (const layer of page.layers) {
      if (!layer.visible) continue;
      await renderLayerToCanvas(ctx, layer, layer.width, layer.height);
    }
    
    return canvas;
  };

  const doExport = async () => {
    setStatus('loading');
    setMsg('Preparing...');
    const page = store.getCurrentPage();
    
    try {
      if (format === 'svg') {
        setMsg('Generating SVG...');
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${page.width}" height="${page.height}">`;
        svg += `<rect width="100%" height="100%" fill="${page.background}"/>`;
        
        for (const l of page.layers) {
          if (!l.visible) continue;
          const transform = `translate(${l.x},${l.y}) rotate(${l.rotation || 0},${l.width/2},${l.height/2})`;
          
          if (l.type === 'emoji') {
            svg += `<g transform="${transform}" opacity="${l.opacity ?? 1}">
              <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="'Segoe UI Emoji','Apple Color Emoji'" font-size="${Math.min(l.width, l.height) * 0.7}" fill="#000000">${escapeXml(l.emoji || '😀')}</text>
            </g>`;
          } else if (l.type === 'image' && l.src) {
            svg += `<g transform="${transform}" opacity="${l.opacity ?? 1}">
              <image href="${l.src}" width="${l.width}" height="${l.height}" preserveAspectRatio="${l.objectFit === 'cover' ? 'xMidYMid slice' : l.objectFit === 'contain' ? 'xMidYMid meet' : 'none'}" />
            </g>`;
          } else if (l.type === 'text') {
            svg += `<g transform="${transform}" opacity="${l.opacity ?? 1}">
              <text x="4" y="4" font-family="${l.fontFamily || 'sans-serif'}" font-size="${l.fontSize || 32}" font-weight="${l.fontWeight || '600'}" fill="${l.textColor || '#000'}">${escapeXml(l.text || '')}</text>
            </g>`;
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
      
      // PNG/JPG/PDF using canvas rendering
      const targetScale = (format === 'png' || format === 'jpg') ? scale : 1;
      setMsg('Rendering with canvas...');
      const canvas = await renderPageToCanvas(page, targetScale);
      
      if (format === 'pdf') {
        setMsg('Generating PDF...');
        const { jsPDF } = await import('jspdf');
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: page.width > page.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [page.width * targetScale, page.height * targetScale],
        });
        pdf.addImage(imgData, 'PNG', 0, 0, page.width * targetScale, page.height * targetScale);
        pdf.save(`${getExportBaseName()}.pdf`);
      } else {
        setMsg('Saving...');
        const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
        const quality = format === 'jpg' ? 0.92 : 1;
        const url = canvas.toDataURL(mime, quality);
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

  const escapeXml = (str) => {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
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
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={15} color={editorTheme.textSecondary} /></button>
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
                <button key={s} onClick={() => setScale(s)} style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1.5px solid ${scale === s ? editorTheme.borderLight : editorTheme.border}`, background: scale === s ? editorTheme.hov : editorTheme.el, color: scale === s ? editorTheme.text : editorTheme.textSecondary, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                  {s}× <span style={{ fontSize: 9, fontWeight: 400, color: editorTheme.textMuted }}>{s === 1 ? '72dpi' : s === 2 ? '144dpi' : '216dpi'}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div style={{ background: editorTheme.side, borderRadius: 8, padding: '10px 12px', marginBottom: 18, fontSize: 11, border: `1px solid ${editorTheme.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: editorTheme.textMuted, marginBottom: 4 }}>
            <span>Canvas</span>
            <span style={{ color: editorTheme.textSecondary, fontFamily: 'monospace' }}>{page.width}×{page.height}px</span>
          </div>
          {(format === 'png' || format === 'jpg') && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: editorTheme.textMuted }}>
              <span>Export</span>
              <span style={{ color: editorTheme.text, fontFamily: 'monospace' }}>{page.width * scale}×{page.height * scale}px</span>
            </div>
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