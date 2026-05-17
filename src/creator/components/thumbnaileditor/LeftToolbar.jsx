import React from 'react';
import { MousePointer2, Shapes, TextSelect, Smile, Upload, Image, Palette, Layers, Type } from 'lucide-react';
import useEditorStore from './useEditorStore';
import { editorTheme } from './theme';

const tools = [
  { id: 'select', Icon: MousePointer2, label: 'Select', toolId: 'select' }, 
];

const panels = [
  { id: 'text', Icon: Type, label: 'Text' },
  { id: 'elements', Icon: Shapes, label: 'Elements' },
  { id: 'emojis', Icon: Smile, label: 'Emojis' },
  { id: 'uploads', Icon: Upload, label: 'Uploads' },
  { id: 'photos', Icon: Image, label: 'Photos' },
  { id: 'background', Icon: Palette, label: 'Background' },
];

const LeftToolbar = () => {
  const { activeTool, activePanel, setActiveTool, setActivePanel } = useEditorStore();

  return (
    <div className="panel" style={{ width: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 6px', gap: 2, flexShrink: 0, zIndex: 20, background: editorTheme.side, borderRight: `1px solid ${editorTheme.border}` }}>
      {tools.map(({ id, Icon, label, toolId }) => {
        const isActive = activeTool === toolId;
        return (
          <button key={id} title={label} onClick={() => setActiveTool(toolId)} className={`tool-btn ${isActive ? 'active' : ''}`}>
            <Icon size={18} />
            <span>{label}</span>
          </button>
        );
      })}
      <div className="sep" style={{ width: '70%', margin: '6px 0', background: editorTheme.border }} />
      {panels.map(({ id, Icon, label }) => {
        const isActive = activePanel === id;
        return (
          <button key={id} title={label} onClick={() => setActivePanel(id)} className={`tool-btn ${isActive ? 'active' : ''}`}>
            <Icon size={18} />
            <span>{label}</span>
          </button>
        );
      })}
      <div style={{ flex: 1 }} />
      <button title="Layers" onClick={() => setActivePanel('layers')} className={`tool-btn ${activePanel === 'layers' ? 'active' : ''}`}>
        <Layers size={18} />
        <span>Layers</span>
      </button>
    </div>
  );
};

export default LeftToolbar;