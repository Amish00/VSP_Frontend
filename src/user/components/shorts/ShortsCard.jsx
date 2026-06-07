import React from 'react';

const ShortsCard = ({ short, onPlay }) => {
  return (
    <button
      onClick={() => onPlay(short)}
      className="rounded-xl overflow-hidden border border-border w-full hover:-translate-y-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
      style={{ background: '#080D18', boxShadow: '0 2px 12px rgba(0,0,0,.3)' }}
    >
      <div className="aspect-[9/16] relative overflow-hidden">
        {short.thumbnailUrl ? (
          <img src={short.thumbnailUrl} alt={short.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-800">🎬</div>
        )}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,.85) 0%, rgba(0,0,0,.2) 50%, transparent 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 px-2 pb-2.5">
          <p className="text-xs font-semibold text-white leading-tight line-clamp-2">{short.title}</p>
          <p className="text-2xs text-white/60 mt-0.5">{short.username}</p>
        </div>
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/55 backdrop-blur-sm border border-white/20 flex items-center justify-center" aria-hidden>
          <svg width="7" height="9" viewBox="0 0 7 9" fill="white"><path d="M0 .5L7 4.5L0 8.5Z" /></svg>
        </div>
        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-xs font-bold">⚡</div>
      </div>
    </button>
  );
};

export default ShortsCard;