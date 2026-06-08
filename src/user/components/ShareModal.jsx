import React, { useEffect, useState } from 'react';
import { X, Link2, Check } from 'lucide-react';
import { FaWhatsapp, FaFacebookF, FaTwitter, FaRedditAlien, FaLinkedinIn } from 'react-icons/fa';

const ShareModal = ({ isOpen, onClose, url, title, thumbnail }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    { name: 'WhatsApp', icon: <FaWhatsapp size={24} />, color: 'bg-[#25D366]', href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}` },
    { name: 'Facebook',  icon: <FaFacebookF size={22} />, color: 'bg-[#1877F2]', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { name: 'Twitter',   icon: <FaTwitter size={22} />,   color: 'bg-[#1DA1F2]', href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}` },
    { name: 'Reddit',    icon: <FaRedditAlien size={24} />, color: 'bg-[#FF4500]', href: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}` },
    { name: 'LinkedIn',  icon: <FaLinkedinIn size={22} />, color: 'bg-[#0077B5]', href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}` },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0F0F0F] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="font-bold text-lg text-white">Share</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {thumbnail && (
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
              <img src={thumbnail} alt="" className="w-16 h-16 rounded-lg object-cover" />
              <p className="text-sm text-white/80 line-clamp-2">{title}</p>
            </div>
          )}

          {/* Icons only – horizontal row */}
          <div className="flex justify-center items-center gap-4 mb-5">
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onClose()}
                className={`w-12 h-12 rounded-full flex items-center justify-center ${link.color} text-white hover:scale-110 transition-transform shadow-lg`}
                title={link.name}
              >
                {link.icon}
              </a>
            ))}
          </div>

          {/* Copy link row stays as is */}
          <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1.5 border border-white/10">
            <input type="text" readOnly value={url} className="flex-1 bg-transparent text-white/80 text-sm px-2 py-1.5 outline-none" />
            <button onClick={copyToClipboard} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white text-sm font-medium">
              {copied ? <Check size={16} /> : <Link2 size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;