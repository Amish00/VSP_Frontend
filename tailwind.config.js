/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#080D18',
          card: '#0F1724',
          el:   '#141E2E',
          side: '#0A1020',
          hov:  '#192236',
          deep: '#060A12',
        },
        border: {
          DEFAULT: '#1A2B42',
          light:   '#243348',
          subtle:  '#111E30',
        },
        primary: {
          DEFAULT: '#2563EB',
          light:   '#60A5FA',
          muted:   '#93C5FD',
          glow:    'rgba(37,99,235,0.18)',
          subtle:  'rgba(37,99,235,0.06)',
        },
        accent:  '#0EA5E9',
        success: '#10B981',
        warning: '#F59E0B',
        danger:  '#EF4444',
        text: {
          primary:   '#ECF0FB',
          secondary: '#8FA3BE',
          muted:     '#4A6080',
          inverse:   '#080D18',
        },
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"Fira Code"', 'monospace'],
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '1.45', letterSpacing: '0.01em' }],
        xs:    ['12px', { lineHeight: '1.5'  }],
        sm:    ['13px', { lineHeight: '1.55' }],
        base:  ['14px', { lineHeight: '1.6'  }],
        md:    ['15px', { lineHeight: '1.65' }],
        lg:    ['16px', { lineHeight: '1.6'  }],
        xl:    ['18px', { lineHeight: '1.45' }],
        '2xl': ['22px', { lineHeight: '1.3'  }],
        '3xl': ['28px', { lineHeight: '1.2'  }],
        '4xl': ['36px', { lineHeight: '1.1'  }],
        '5xl': ['48px', { lineHeight: '1.0'  }],
      },
      spacing: {
        /* 8-point grid additions */
        '4.5':  '18px',
        '13':   '52px',
        '15':   '60px',
        '18':   '72px',
        '22':   '88px',
        '26':   '104px',
      },
      borderRadius: {
        sm:    '6px',
        md:    '10px',
        lg:    '14px',
        xl:    '18px',
        '2xl': '22px',
        '3xl': '28px',
      },
      boxShadow: {
        /* Neumorphic layered shadows — outset + inset */
        'neu':       '4px 4px 12px rgba(0,0,0,0.5), -1px -1px 4px rgba(255,255,255,0.03)',
        'neu-sm':    '2px 2px 8px rgba(0,0,0,0.4), -1px -1px 3px rgba(255,255,255,0.02)',
        'neu-inset': 'inset 2px 2px 6px rgba(0,0,0,0.4), inset -1px -1px 3px rgba(255,255,255,0.03)',
        'card':      '0 2px 12px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.2)',
        'card-hover':'0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
        'glow-blue': '0 0 20px rgba(37,99,235,0.25)',
        'drop':      '0 24px 64px rgba(0,0,0,0.65)',
        'inner':     'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      transitionTimingFunction: {
        'spring':   'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'smooth':   'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '180': '180ms',
        '250': '250ms',
      },
    },
  },
  plugins: [],
}
