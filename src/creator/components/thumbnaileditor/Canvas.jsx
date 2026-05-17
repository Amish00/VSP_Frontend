import React, { useRef, useCallback, useState, useEffect } from 'react';
import useEditorStore from './useEditorStore';
import CanvasLayer from './CanvasLayer';

function Grid({ width, height }) {
  const lines = [];
  const step = 40;
  for (let x = 0; x <= width; x += step)
    lines.push(<line key={`v${x}`} x1={x} y1={0} x2={x} y2={height} stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />);
  for (let y = 0; y <= height; y += step)
    lines.push(<line key={`h${y}`} x1={0} y1={y} x2={width} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth={0.5} />);
  return <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }} width={width} height={height}>{lines}</svg>;
}

const Canvas = () => {
  const store = useEditorStore();
  const { zoom, showGrid, activeTool, clearSelection, addLayer, setActiveTool } = store;
  const page = store.getCurrentPage();
  const wrapRef = useRef();
  const paperRef = useRef();
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panRef = useRef(null);



  const getPos = useCallback(
    (e) => {
      const rect = wrapRef.current.getBoundingClientRect();
      const cx = rect.width / 2 + pan.x;
      const cy = rect.height / 2 + pan.y;
      const px = (page.width * zoom) / 2;
      const py = (page.height * zoom) / 2;
      return {
        x: (e.clientX - rect.left - (cx - px)) / zoom,
        y: (e.clientY - rect.top - (cy - py)) / zoom,
      };
    },
    [zoom, pan, page]
  );

  const onMouseDown = useCallback(
    (e) => {
      // Middle mouse button pan
      if (e.button === 1) {
        panRef.current = { sx: e.clientX - pan.x, sy: e.clientY - pan.y };
        return;
      }
      const isPaper = e.target === wrapRef.current || e.target === paperRef.current || e.target.dataset.bg === '1';
      if (!isPaper) return;
      const pos = getPos(e);

      if (activeTool === 'select') {
        clearSelection();
      } else if (activeTool === 'text') {
        // Create a new text layer with black text
        addLayer({
          type: 'text',
          x: pos.x,
          y: pos.y,
          width: 280,
          height: 64,
          text: 'Double-click to edit',
          fontSize: 32,
          fontWeight: '600',
          textColor: '#000000', // black
        });
        // Switch back to select mode after adding
        setActiveTool('select');
      }
    },
    [activeTool, clearSelection, addLayer, setActiveTool, getPos, pan]
  );

  const onMouseMove = useCallback((e) => {
    if (panRef.current) {
      setPan({ x: e.clientX - panRef.current.sx, y: e.clientY - panRef.current.sy });
    }
  }, []);

  const onMouseUp = useCallback(() => {
    panRef.current = null;
  }, []);

  // Wheel: zoom with Ctrl/Cmd, pan otherwise
  useEffect(() => {
    const el = wrapRef.current;
    const onWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        store.setZoom(zoom + (e.deltaY > 0 ? -0.1 : 0.1));
      } else {
        setPan((p) => ({ x: p.x - e.deltaX * 0.5, y: p.y - e.deltaY * 0.5 }));
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoom, store]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'Delete' || e.key === 'Backspace') store.deleteSelectedLayers();
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') store.copySelected();
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') store.paste();
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        store.duplicateSelectedLayers();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        store.selectAll();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        store.setZoom(1);
        setPan({ x: 0, y: 0 });
      }
      if (e.key === 'Escape') store.clearSelection();
      // Nudge selected layers with arrow keys
      const nudge = e.shiftKey ? 10 : 1;
      const { pages, currentPageIndex, selectedLayerIds } = useEditorStore.getState();
      const pg = pages[currentPageIndex];
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        selectedLayerIds.forEach((id) => {
          const l = pg.layers.find((x) => x.id === id);
          if (l) store.updateLayer(id, { x: l.x - nudge });
        });
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        selectedLayerIds.forEach((id) => {
          const l = pg.layers.find((x) => x.id === id);
          if (l) store.updateLayer(id, { x: l.x + nudge });
        });
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedLayerIds.forEach((id) => {
          const l = pg.layers.find((x) => x.id === id);
          if (l) store.updateLayer(id, { y: l.y - nudge });
        });
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedLayerIds.forEach((id) => {
          const l = pg.layers.find((x) => x.id === id);
          if (l) store.updateLayer(id, { y: l.y + nudge });
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [store]);

  const cursor = activeTool === 'text' ? 'text' : 'default';

  return (
    <div
      ref={wrapRef}
      style={{ flex: 1, overflow: 'hidden', position: 'relative', background: '#1e1e24', cursor }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      {/* Dot grid background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, #2a2a30 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
        }}
      />
      {/* Canvas paper */}
      <div
        ref={paperRef}
        data-bg="1"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: page.width,
          height: page.height,
          transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
          transformOrigin: 'center center',
          background: page.background,
          boxShadow: '0 0 0 1px rgba(255,255,255,0.1), 0 8px 40px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
      >
        {showGrid && <Grid width={page.width} height={page.height} />}
        {page.layers.map((layer) => (
          <CanvasLayer key={layer.id} layer={layer} zoom={zoom} />
        ))}
      </div>
      {/* Zoom controls HUD */}
      <div style={{ position: 'absolute', bottom: 14, right: 14, display: 'flex', gap: 6, alignItems: 'center' }}>
        <button onClick={() => store.setZoom(Math.max(0.1, zoom - 0.25))} className="btn-icon" style={{ background: '#1a1a20', border: '1px solid #2e2e36' }}>
          −
        </button>
        <span
          style={{
            background: '#1a1a20',
            color: '#aaa',
            padding: '4px 9px',
            borderRadius: 6,
            fontSize: 11,
            border: '1px solid #2e2e36',
            fontFamily: 'monospace',
            minWidth: 46,
            textAlign: 'center',
          }}
        >
          {Math.round(zoom * 100)}%
        </span>
        <button onClick={() => store.setZoom(Math.min(5, zoom + 0.25))} className="btn-icon" style={{ background: '#1a1a20', border: '1px solid #2e2e36' }}>
          +
        </button>
        <button
          onClick={() => {
            store.setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="btn-icon"
          style={{ background: '#1a1a20', border: '1px solid #2e2e36', fontSize: 10, width: 'auto', padding: '0 8px' }}
        >
          Reset
        </button>
      </div>
      {/* Page dimensions HUD */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: 14,
          background: 'rgba(0,0,0,0.6)',
          color: '#aaa',
          padding: '3px 8px',
          borderRadius: 5,
          fontSize: 10,
          fontFamily: 'monospace',
        }}
      >
        {page.width}×{page.height}
      </div>
    </div>
  );
};

export default Canvas;