import React, { useRef, useState, useCallback } from 'react';
import useEditorStore from './useEditorStore';
import { editorTheme } from './theme';

const HANDLE_SIZE = 8;

const Handles = ({ onResize }) => {
  const handles = [
    { id: 'nw', style: { top: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2, cursor: 'nw-resize' } },
    { id: 'n', style: { top: -HANDLE_SIZE / 2, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' } },
    { id: 'ne', style: { top: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2, cursor: 'ne-resize' } },
    { id: 'e', style: { top: '50%', right: -HANDLE_SIZE / 2, transform: 'translateY(-50%)', cursor: 'e-resize' } },
    { id: 'se', style: { bottom: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2, cursor: 'se-resize' } },
    { id: 's', style: { bottom: -HANDLE_SIZE / 2, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' } },
    { id: 'sw', style: { bottom: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2, cursor: 'sw-resize' } },
    { id: 'w', style: { top: '50%', left: -HANDLE_SIZE / 2, transform: 'translateY(-50%)', cursor: 'w-resize' } },
  ];
  return (
    <>
      <div style={{ position: 'absolute', inset: -1.5, border: `1.5px solid ${editorTheme.primaryLight}`, borderRadius: 2, pointerEvents: 'none', zIndex: 50 }} />
      {handles.map((h) => (
        <div
          key={h.id}
          onMouseDown={(e) => {
            e.stopPropagation();
            onResize(e, h.id);
          }}
          style={{
            position: 'absolute',
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            background: editorTheme.primaryLight,
            border: `1.5px solid ${editorTheme.borderLight}`,
            borderRadius: 2,
            zIndex: 100,
            ...h.style,
          }}
        />
      ))}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          onResize(e, 'rotate');
        }}
        style={{
          position: 'absolute',
          top: -24,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 12,
          height: 12,
          background: editorTheme.primaryLight,
          borderRadius: '50%',
          cursor: 'grab',
          zIndex: 100,
          border: `1.5px solid ${editorTheme.borderLight}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: -12,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 1,
          height: 12,
          background: editorTheme.primaryLight,
          zIndex: 50,
          pointerEvents: 'none',
        }}
      />
    </>
  );
};

const SHAPE_SVG = (layer) => {
  const fill = layer.fill || '#ccc';
  const stroke = layer.stroke || 'none';
  const sw = layer.strokeWidth || 0;
  const shapes = {
    rectangle: <rect x="0" y="0" width="100" height="100" fill={fill} stroke={stroke} strokeWidth={sw} rx="0" />,
    circle: <ellipse cx="50" cy="50" rx="50" ry="50" fill={fill} stroke={stroke} strokeWidth={sw} />,
    triangle: <polygon points="50,0 100,100 0,100" fill={fill} stroke={stroke} strokeWidth={sw} />,
    diamond: <polygon points="50,0 100,50 50,100 0,50" fill={fill} stroke={stroke} strokeWidth={sw} />,
    star: <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill={fill} stroke={stroke} strokeWidth={sw} />,
    pentagon: <polygon points="50,2 98,36 79,90 21,90 2,36" fill={fill} stroke={stroke} strokeWidth={sw} />,
    hexagon: <polygon points="25,5 75,5 97,50 75,95 25,95 3,50" fill={fill} stroke={stroke} strokeWidth={sw} />,
    arrow: <polygon points="0,35 60,35 60,0 100,50 60,100 60,65 0,65" fill={fill} stroke={stroke} strokeWidth={sw} />,
    heart: <path d="M50,75 C25,55 5,42 5,28 C5,15 15,5 28,5 C36,5 43,9 50,17 C57,9 64,5 72,5 C85,5 95,15 95,28 C95,42 75,55 50,75Z" fill={fill} stroke={stroke} strokeWidth={sw} />,
    cross: <path d="M35,5 L65,5 L65,35 L95,35 L95,65 L65,65 L65,95 L35,95 L35,65 L5,65 L5,35 L35,35Z" fill={fill} stroke={stroke} strokeWidth={sw} />,
    chatbubble: <path d="M5,5 L95,5 L95,70 L55,70 L40,95 L40,70 L5,70Z" fill={fill} stroke={stroke} strokeWidth={sw} />,
    parallelogram: <polygon points="20,5 100,5 80,95 0,95" fill={fill} stroke={stroke} strokeWidth={sw} />,
  };
  return <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">{shapes[layer.shapeType || 'rectangle']}</svg>;
};

const TextEditInline = ({ layer, onDone }) => {
  const updateLayer = useEditorStore((s) => s.updateLayer);
  const [text, setText] = useState(layer.text || '');
  const ref = useRef();
  React.useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);
  return (
    <textarea
      ref={ref}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => {
        updateLayer(layer.id, { text });
        onDone();
      }}
      style={{
        width: '100%',
        height: '100%',
        fontFamily: layer.fontFamily || 'Inter, sans-serif',
        fontSize: (layer.fontSize || 32) + 'px',
        fontWeight: layer.fontWeight || '600',
        fontStyle: layer.fontStyle || 'normal',
        color: layer.textColor || '#000',
        textAlign: layer.textAlign || 'left',
        lineHeight: layer.lineHeight || 1.25,
        letterSpacing: (layer.letterSpacing || 0) + 'px',
        background: 'rgba(0,0,0,0.1)',
        border: 'none',
        outline: 'none',
        resize: 'none',
        padding: '4px',
        overflow: 'hidden',
        cursor: 'text',
      }}
    />
  );
};

const CanvasLayer = ({ layer, zoom }) => {
  const { selectedLayerIds, selectLayer, updateLayer, activeTool } = useEditorStore();
  const isSel = selectedLayerIds.includes(layer.id);
  const [editing, setEditing] = useState(false);
  const ref = useRef();

  const onMouseDown = useCallback(
    (e) => {
      if (layer.locked || activeTool !== 'select') return;
      e.stopPropagation();
      selectLayer(layer.id, e.shiftKey);
      const sx = e.clientX,
        sy = e.clientY,
        ox = layer.x,
        oy = layer.y;
      const mv = (ev) => updateLayer(layer.id, { x: ox + (ev.clientX - sx) / zoom, y: oy + (ev.clientY - sy) / zoom });
      const up = () => {
        document.removeEventListener('mousemove', mv);
        document.removeEventListener('mouseup', up);
      };
      document.addEventListener('mousemove', mv);
      document.addEventListener('mouseup', up);
    },
    [layer, zoom, activeTool, selectLayer, updateLayer]
  );

  const onResize = useCallback(
    (e, handle) => {
      e.stopPropagation();
      e.preventDefault();
      const sx = e.clientX,
        sy = e.clientY,
        ow = layer.width,
        oh = layer.height,
        ox = layer.x,
        oy = layer.y,
        or = layer.rotation || 0;
      if (handle === 'rotate') {
        const rect = ref.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2,
          cy = rect.top + rect.height / 2;
        const sa = Math.atan2(sy - cy, sx - cx);
        const mv = (ev) => {
          const a = Math.atan2(ev.clientY - cy, ev.clientX - cx);
          updateLayer(layer.id, { rotation: or + (a - sa) * (180 / Math.PI) });
        };
        const up = () => {
          document.removeEventListener('mousemove', mv);
          document.removeEventListener('mouseup', up);
        };
        document.addEventListener('mousemove', mv);
        document.addEventListener('mouseup', up);
        return;
      }
      const mv = (ev) => {
        const dx = (ev.clientX - sx) / zoom,
          dy = (ev.clientY - sy) / zoom;
        let nx = ox,
          ny = oy,
          nw = ow,
          nh = oh;
        if (handle.includes('e')) nw = Math.max(20, ow + dx);
        if (handle.includes('s')) nh = Math.max(20, oh + dy);
        if (handle.includes('w')) {
          nw = Math.max(20, ow - dx);
          nx = ox + (ow - nw);
        }
        if (handle.includes('n')) {
          nh = Math.max(20, oh - dy);
          ny = oy + (oh - nh);
        }
        updateLayer(layer.id, { x: nx, y: ny, width: nw, height: nh });
      };
      const up = () => {
        document.removeEventListener('mousemove', mv);
        document.removeEventListener('mouseup', up);
      };
      document.addEventListener('mousemove', mv);
      document.addEventListener('mouseup', up);
    },
    [layer, zoom, updateLayer]
  );

  if (!layer.visible) return null;

  return (
    <div
      ref={ref}
      onMouseDown={onMouseDown}
      onDoubleClick={() => layer.type === 'text' && setEditing(true)}
      style={{
        position: 'absolute',
        left: layer.x,
        top: layer.y,
        width: layer.width,
        height: layer.height,
        transform: `rotate(${layer.rotation || 0}deg)`,
        opacity: layer.opacity ?? 1,
        cursor: activeTool === 'select' ? (layer.locked ? 'not-allowed' : 'move') : 'default',
        userSelect: 'none',
      }}
    >
      {layer.type === 'text' && !editing && (
        <div
          style={{
            width: '100%',
            height: '100%',
            fontFamily: layer.fontFamily || 'Inter, sans-serif',
            fontSize: (layer.fontSize || 32) + 'px',
            fontWeight: layer.fontWeight || '600',
            fontStyle: layer.fontStyle || 'normal',
            textDecoration: layer.textDecoration || 'none',
            color: layer.textColor || '#fff',
            textAlign: layer.textAlign || 'left',
            lineHeight: layer.lineHeight || 1.25,
            letterSpacing: (layer.letterSpacing || 0) + 'px',
            padding: '4px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflow: 'hidden',
          }}
        >
          {layer.text || 'Double-click to edit'}
        </div>
      )}
      {layer.type === 'text' && editing && <TextEditInline layer={layer} onDone={() => setEditing(false)} />}
      {layer.type === 'shape' && SHAPE_SVG(layer)}
      {layer.type === 'image' &&
        (layer.src ? (
          <img
            src={layer.src}
            alt=""
            crossOrigin="anonymous"
            draggable={false}
            style={{ width: '100%', height: '100%', objectFit: layer.objectFit || 'cover', borderRadius: (layer.borderRadius || 0) + '%', pointerEvents: 'none', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: editorTheme.el, display: 'flex', alignItems: 'center', justifyContent: 'center', color: editorTheme.textMuted, fontSize: 12 }}>
            No image
          </div>
        ))}
      {layer.type === 'emoji' && (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: Math.min(layer.width, layer.height) * 0.75 + 'px',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          {layer.emoji}
        </div>
      )}
      {layer.type === 'line' && (
        <svg width="100%" height="100%">
          <line
            x1="0"
            y1="50%"
            x2="100%"
            y2="50%"
            stroke={layer.stroke || '#888'}
            strokeWidth={layer.strokeWidth || 2}
            strokeDasharray={layer.lineStyle === 'dashed' ? '12,5' : layer.lineStyle === 'dotted' ? '3,6' : undefined}
            strokeLinecap="round"
          />
        </svg>
      )}
      {isSel && !editing && <Handles onResize={onResize} />}
    </div>
  );
};

export default CanvasLayer;