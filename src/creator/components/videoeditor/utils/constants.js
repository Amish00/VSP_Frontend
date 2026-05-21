export const PEXELS_KEY = 'qcqkTO4JgIhunCS68ERUgg3XWZjco7Qp4Vu2fKbTSeT4GGhYXb7dc2CK' // Replace with your actual Pexels API key

export const CANVAS_PRESETS = [
  { id: 'youtube', label: 'YouTube', w: 1920, h: 1080 },
  { id: 'shorts', label: 'YouTube Shorts', w: 1080, h: 1920 },
  { id: 'tiktok', label: 'TikTok', w: 1080, h: 1920 },
  { id: 'instagram', label: 'Instagram Post', w: 1080, h: 1080 },
  { id: 'story', label: 'Instagram Story', w: 1080, h: 1920 },
  { id: 'twitter', label: 'Twitter / X', w: 1600, h: 900 },
  { id: '4k', label: '4K UHD', w: 3840, h: 2160 },
  { id: '720p', label: '720p HD', w: 1280, h: 720 },
]

export const TRANSITIONS = [
  { id: 'fade', name: 'Fade', icon: '◉' },
  { id: 'slide-r', name: 'Slide Right', icon: '▶' },
  { id: 'slide-l', name: 'Slide Left', icon: '◀' },
  { id: 'slide-u', name: 'Slide Up', icon: '▲' },
  { id: 'slide-d', name: 'Slide Down', icon: '▼' },
  { id: 'zoom-in', name: 'Zoom In', icon: '⊕' },
  { id: 'zoom-out', name: 'Zoom Out', icon: '⊖' },
  { id: 'dissolve', name: 'Dissolve', icon: '◈' },
  { id: 'spin', name: 'Spin', icon: '↻' },
  { id: 'wipe-r', name: 'Wipe Right', icon: '⊢' },
  { id: 'blur', name: 'Blur', icon: '◌' },
  { id: 'iris', name: 'Iris', icon: '◎' },
]

export const EFFECTS = [
  { id: null, name: 'None' },
  { id: 'grayscale', name: 'Black & White', css: 'grayscale(1)' },
  { id: 'sepia', name: 'Sepia', css: 'sepia(0.9)' },
  { id: 'bright', name: 'Brighten', css: 'brightness(1.4)' },
  { id: 'contrast', name: 'Contrast', css: 'contrast(1.5)' },
  { id: 'warm', name: 'Warm', css: 'sepia(0.3) saturate(1.4) brightness(1.1)' },
  { id: 'cool', name: 'Cool', css: 'hue-rotate(200deg) saturate(0.8)' },
  { id: 'vivid', name: 'Vivid', css: 'saturate(2) contrast(1.1)' },
  { id: 'vintage', name: 'Vintage', css: 'sepia(0.5) contrast(1.1) brightness(0.9) saturate(0.8)' },
  { id: 'cinema', name: 'Cinema', css: 'contrast(1.3) saturate(0.7) brightness(0.85)' },
  { id: 'neon', name: 'Neon', css: 'saturate(3) hue-rotate(30deg) brightness(1.3)' },
  { id: 'invert', name: 'Invert', css: 'invert(1)' },
]

export const TEXT_PRESETS = [
  { name: 'Big Title', text: 'BIG TITLE', fontSize: 96, fontWeight: '900', textColor: '#ffffff', overlayY: 45 },
  { name: 'Subtitle', text: 'Subtitle', fontSize: 48, fontWeight: '400', textColor: '#e5e5e5', overlayY: 60 },
  { name: 'Lower Third', text: 'Lower Third', fontSize: 36, fontWeight: '700', textColor: '#ffffff', overlayX: 15, overlayY: 82 },
  { name: 'Caption', text: 'Caption', fontSize: 26, fontWeight: '400', textColor: '#ffffff', overlayY: 90 },
  { name: 'Neon', text: 'NEON', fontSize: 80, fontWeight: '800', textColor: '#a78bfa', overlayY: 50 },
  { name: 'Yellow', text: 'BOLD', fontSize: 80, fontWeight: '900', textColor: '#facc15', overlayY: 50 },
  { name: 'Headline', text: 'HEADLINE', fontSize: 88, fontWeight: '900', textColor: '#f8fafc', overlayY: 42 },
  { name: 'Minimal', text: 'minimal text', fontSize: 34, fontWeight: '300', textColor: '#f8fafc', overlayY: 56 },
  { name: 'CTA', text: 'FOLLOW FOR MORE', fontSize: 42, fontWeight: '800', textColor: '#ffffff', overlayY: 86 },
  { name: 'Quote', text: '"Your quote here"', fontSize: 54, fontWeight: '500', textColor: '#f1f5f9', overlayY: 52 },
  { name: 'Typewriter', text: 'TYPEWRITER STYLE', fontSize: 40, fontWeight: '600', textColor: '#e2e8f0', fontFamily: 'Courier New', overlayY: 62 },
  { name: 'Breaking', text: 'BREAKING NEWS', fontSize: 64, fontWeight: '900', textColor: '#ef4444', overlayY: 18 },
  { name: 'Pop Label', text: 'NEW', fontSize: 72, fontWeight: '900', textColor: '#22d3ee', overlayX: 22, overlayY: 20 },
  { name: 'Center Punch', text: 'MAKE IT COUNT', fontSize: 70, fontWeight: '800', textColor: '#ffffff', overlayY: 50 },
  { name: 'Soft Lower', text: 'soft subtitle here', fontSize: 30, fontWeight: '400', textColor: '#d1d5db', overlayY: 88 },
  { name: 'Big Serif', text: 'Editorial', fontSize: 76, fontWeight: '700', textColor: '#f8fafc', fontFamily: 'Georgia', overlayY: 46 },
  { name: 'Corner Tag', text: 'VLOG', fontSize: 44, fontWeight: '800', textColor: '#fde047', overlayX: 84, overlayY: 14 },
  { name: 'Kinetic', text: 'GO  GO  GO', fontSize: 58, fontWeight: '900', textColor: '#fb7185', overlayY: 70 },
]

export const SHAPES = [
  { id: 'rect', name: 'Rectangle', d: 'M10,10 L90,10 L90,90 L10,90 Z' },
  { id: 'circle', name: 'Circle', d: 'M50,5 A45,45 0 1,1 49.99,5 Z' },
  { id: 'triangle', name: 'Triangle', d: 'M50,5 L95,95 L5,95 Z' },
  { id: 'diamond', name: 'Diamond', d: 'M50,2 L98,50 L50,98 L2,50 Z' },
  { id: 'star', name: 'Star', d: 'M50,5 L61,35 L95,35 L68,57 L79,91 L50,70 L21,91 L32,57 L5,35 L39,35 Z' },
  { id: 'heart', name: 'Heart', d: 'M50,75 C25,55 5,42 5,28 C5,15 15,5 28,5 C36,5 43,9 50,17 C57,9 64,5 72,5 C85,5 95,15 95,28 C95,42 75,55 50,75Z' },
  { id: 'pentagon', name: 'Pentagon', d: 'M50,5 L93,35 L77,92 L23,92 L7,35 Z' },
  { id: 'hexagon', name: 'Hexagon', d: 'M25,8 L75,8 L97,50 L75,92 L25,92 L3,50 Z' },
  { id: 'octagon', name: 'Octagon', d: 'M30,3 L70,3 L97,30 L97,70 L70,97 L30,97 L3,70 L3,30 Z' },
  { id: 'arrow-r', name: 'Arrow Right', d: 'M10,30 L58,30 L58,15 L92,50 L58,85 L58,70 L10,70 Z' },
  { id: 'arrow-l', name: 'Arrow Left', d: 'M90,30 L42,30 L42,15 L8,50 L42,85 L42,70 L90,70 Z' },
  { id: 'cloud', name: 'Cloud', d: 'M30,77 L75,77 C88,77 95,68 95,57 C95,47 88,39 78,38 C76,24 65,15 51,15 C37,15 25,24 22,37 C12,38 5,46 5,56 C5,69 15,77 30,77 Z' },
  { id: 'speech', name: 'Speech Bubble', d: 'M14,15 L86,15 C92,15 96,19 96,25 L96,63 C96,69 92,73 86,73 L44,73 L25,92 L27,73 L14,73 C8,73 4,69 4,63 L4,25 C4,19 8,15 14,15 Z' },
  { id: 'bolt', name: 'Bolt', d: 'M58,2 L20,55 L42,55 L32,98 L80,40 L58,40 Z' },
]

export const FONTS = ['Inter', 'Arial', 'Georgia', 'Impact', 'Verdana', 'Times New Roman', 'Courier New']

export function transitionCSS(type, progress, dir) {
  const p = dir === 'in' ? progress : 1 - progress
  switch (type) {
    case 'fade': return { opacity: p }
    case 'dissolve': return { opacity: p, filter: `blur(${(1 - p) * 8}px)` }
    case 'slide-r': return { transform: `translateX(${(1 - p) * 100}%)`, opacity: 1 }
    case 'slide-l': return { transform: `translateX(${-(1 - p) * 100}%)`, opacity: 1 }
    case 'slide-u': return { transform: `translateY(${-(1 - p) * 100}%)`, opacity: 1 }
    case 'slide-d': return { transform: `translateY(${(1 - p) * 100}%)`, opacity: 1 }
    case 'zoom-in': return { transform: `scale(${0.3 + p * 0.7})`, opacity: p }
    case 'zoom-out': return { transform: `scale(${1.7 - p * 0.7})`, opacity: p }
    case 'spin': return { transform: `rotate(${(1 - p) * 360}deg)`, opacity: p }
    case 'wipe-r': return { clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` }
    case 'blur': return { filter: `blur(${(1 - p) * 20}px)` }
    case 'iris': return { clipPath: `circle(${p * 80}% at 50% 50%)` }
    default: return {}
  }
}