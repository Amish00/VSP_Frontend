import { create } from 'zustand';

let layerIdCounter = 0;
const genId = () => `layer_${++layerIdCounter}_${Date.now()}`;

const defaultPage = () => ({
  id: `page_${Date.now()}`,
  background: '#ffffff',
  width: 1280,
  height: 720,
  layers: [],
});

const useEditorStore = create((set, get) => ({
  documentName: 'Untitled Design',
  pages: [defaultPage()],
  currentPageIndex: 0,
  selectedLayerIds: [],
  activeTool: 'select',
  activePanel: null,
  zoom: 0.75,
  clipboard: null,
  showGrid: false,
  canvasRef: null,

  getCurrentPage: () => {
    const { pages, currentPageIndex } = get();
    return pages[currentPageIndex];
  },

  getSelectedLayers: () => {
    const { pages, currentPageIndex, selectedLayerIds } = get();
    return pages[currentPageIndex].layers.filter(l => selectedLayerIds.includes(l.id));
  },

  setCanvasRef: (ref) => set({ canvasRef: ref }),
  setDocumentName: (name) => set({ documentName: name }),

  addPage: () => set(state => {
    const newPage = defaultPage();
    const newPages = [...state.pages, newPage];
    return { pages: newPages, currentPageIndex: newPages.length - 1, selectedLayerIds: [] };
  }),

  deletePage: (index) => set(state => {
    if (state.pages.length === 1) return state;
    const newPages = state.pages.filter((_, i) => i !== index);
    return { pages: newPages, currentPageIndex: Math.min(state.currentPageIndex, newPages.length - 1), selectedLayerIds: [] };
  }),

  duplicatePage: (index) => set(state => {
    const page = state.pages[index];
    const newPage = { ...page, id: `page_${Date.now()}`, layers: page.layers.map(l => ({ ...l, id: genId() })) };
    const newPages = [...state.pages.slice(0, index + 1), newPage, ...state.pages.slice(index + 1)];
    return { pages: newPages, currentPageIndex: index + 1 };
  }),

  setCurrentPage: (index) => set({ currentPageIndex: index, selectedLayerIds: [] }),

  setPageBackground: (color) => set(state => {
    const pages = [...state.pages];
    pages[state.currentPageIndex] = { ...pages[state.currentPageIndex], background: color };
    return { pages };
  }),

  setPageSize: (width, height) => set(state => {
    const pages = [...state.pages];
    pages[state.currentPageIndex] = { ...pages[state.currentPageIndex], width, height };
    return { pages };
  }),

  addLayer: (layerData) => {
    const id = genId();
    const layer = { id, x: 100, y: 100, width: 200, height: 100, rotation: 0, opacity: 1, locked: false, visible: true, name: layerData.type || 'Layer', ...layerData, id };
    set(state => {
      const pages = [...state.pages];
      const page = { ...pages[state.currentPageIndex] };
      page.layers = [...page.layers, layer];
      pages[state.currentPageIndex] = page;
      return { pages, selectedLayerIds: [id] };
    });
    return id;
  },

  updateLayer: (id, updates) => set(state => {
    const pages = [...state.pages];
    const page = { ...pages[state.currentPageIndex] };
    page.layers = page.layers.map(l => l.id === id ? { ...l, ...updates } : l);
    pages[state.currentPageIndex] = page;
    return { pages };
  }),

  updateSelectedLayers: (updates) => set(state => {
    const pages = [...state.pages];
    const page = { ...pages[state.currentPageIndex] };
    page.layers = page.layers.map(l => state.selectedLayerIds.includes(l.id) ? { ...l, ...updates } : l);
    pages[state.currentPageIndex] = page;
    return { pages };
  }),

  deleteSelectedLayers: () => set(state => {
    const pages = [...state.pages];
    const page = { ...pages[state.currentPageIndex] };
    page.layers = page.layers.filter(l => !state.selectedLayerIds.includes(l.id));
    pages[state.currentPageIndex] = page;
    return { pages, selectedLayerIds: [] };
  }),

  duplicateSelectedLayers: () => set(state => {
    const pages = [...state.pages];
    const page = { ...pages[state.currentPageIndex] };
    const newIds = [];
    const newLayers = state.selectedLayerIds.map(id => {
      const original = page.layers.find(l => l.id === id);
      const newId = genId();
      newIds.push(newId);
      return { ...original, id: newId, x: original.x + 20, y: original.y + 20 };
    });
    page.layers = [...page.layers, ...newLayers];
    pages[state.currentPageIndex] = page;
    return { pages, selectedLayerIds: newIds };
  }),

  bringForward: () => set(state => {
    if (state.selectedLayerIds.length !== 1) return state;
    const pages = [...state.pages];
    const page = { ...pages[state.currentPageIndex] };
    const idx = page.layers.findIndex(l => l.id === state.selectedLayerIds[0]);
    if (idx < page.layers.length - 1) {
      const layers = [...page.layers];
      [layers[idx], layers[idx + 1]] = [layers[idx + 1], layers[idx]];
      page.layers = layers;
      pages[state.currentPageIndex] = page;
      return { pages };
    }
    return state;
  }),

  sendBackward: () => set(state => {
    if (state.selectedLayerIds.length !== 1) return state;
    const pages = [...state.pages];
    const page = { ...pages[state.currentPageIndex] };
    const idx = page.layers.findIndex(l => l.id === state.selectedLayerIds[0]);
    if (idx > 0) {
      const layers = [...page.layers];
      [layers[idx], layers[idx - 1]] = [layers[idx - 1], layers[idx]];
      page.layers = layers;
      pages[state.currentPageIndex] = page;
      return { pages };
    }
    return state;
  }),

  bringToFront: () => set(state => {
    const pages = [...state.pages];
    const page = { ...pages[state.currentPageIndex] };
    const idx = page.layers.findIndex(l => l.id === state.selectedLayerIds[0]);
    const layers = [...page.layers];
    const [layer] = layers.splice(idx, 1);
    layers.push(layer);
    page.layers = layers;
    pages[state.currentPageIndex] = page;
    return { pages };
  }),

  sendToBack: () => set(state => {
    const pages = [...state.pages];
    const page = { ...pages[state.currentPageIndex] };
    const idx = page.layers.findIndex(l => l.id === state.selectedLayerIds[0]);
    const layers = [...page.layers];
    const [layer] = layers.splice(idx, 1);
    layers.unshift(layer);
    page.layers = layers;
    pages[state.currentPageIndex] = page;
    return { pages };
  }),

  toggleLockLayer: (id) => set(state => {
    const pages = [...state.pages];
    const page = { ...pages[state.currentPageIndex] };
    page.layers = page.layers.map(l => l.id === id ? { ...l, locked: !l.locked } : l);
    pages[state.currentPageIndex] = page;
    return { pages };
  }),

  toggleVisibleLayer: (id) => set(state => {
    const pages = [...state.pages];
    const page = { ...pages[state.currentPageIndex] };
    page.layers = page.layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l);
    pages[state.currentPageIndex] = page;
    return { pages };
  }),

  selectLayer: (id, multi = false) => set(state => {
    if (!id) return { selectedLayerIds: [] };
    if (multi) {
      const ids = state.selectedLayerIds.includes(id)
        ? state.selectedLayerIds.filter(x => x !== id)
        : [...state.selectedLayerIds, id];
      return { selectedLayerIds: ids };
    }
    return { selectedLayerIds: [id] };
  }),

  selectAll: () => set(state => {
    const page = state.pages[state.currentPageIndex];
    return { selectedLayerIds: page.layers.map(l => l.id) };
  }),

  clearSelection: () => set({ selectedLayerIds: [] }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  setActivePanel: (panel) => set(state => ({ activePanel: state.activePanel === panel ? null : panel })),
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),
  toggleGrid: () => set(state => ({ showGrid: !state.showGrid })),

  copySelected: () => set(state => {
    const layers = get().getSelectedLayers();
    return { clipboard: layers };
  }),

  paste: () => set(state => {
    if (!state.clipboard || !state.clipboard.length) return state;
    const pages = [...state.pages];
    const page = { ...pages[state.currentPageIndex] };
    const newIds = [];
    const newLayers = state.clipboard.map(l => {
      const newId = genId();
      newIds.push(newId);
      return { ...l, id: newId, x: l.x + 20, y: l.y + 20 };
    });
    page.layers = [...page.layers, ...newLayers];
    pages[state.currentPageIndex] = page;
    return { pages, selectedLayerIds: newIds };
  }),

  alignLayers: (direction) => set(state => {
    if (state.selectedLayerIds.length < 1) return state;
    const pages = [...state.pages];
    const page = { ...pages[state.currentPageIndex] };
    const selected = page.layers.filter(l => state.selectedLayerIds.includes(l.id));
    const minX = Math.min(...selected.map(l => l.x));
    const minY = Math.min(...selected.map(l => l.y));
    const maxX = Math.max(...selected.map(l => l.x + l.width));
    const maxY = Math.max(...selected.map(l => l.y + l.height));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    page.layers = page.layers.map(l => {
      if (!state.selectedLayerIds.includes(l.id)) return l;
      switch (direction) {
        case 'left': return { ...l, x: minX };
        case 'right': return { ...l, x: maxX - l.width };
        case 'top': return { ...l, y: minY };
        case 'bottom': return { ...l, y: maxY - l.height };
        case 'centerH': return { ...l, x: centerX - l.width / 2 };
        case 'centerV': return { ...l, y: centerY - l.height / 2 };
        default: return l;
      }
    });
    pages[state.currentPageIndex] = page;
    return { pages };
  }),
}));

export default useEditorStore;