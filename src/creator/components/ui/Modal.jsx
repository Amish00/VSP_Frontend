import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({
  open,
  onClose,
  title,
  children,
  maxW = '640px',
  minH = 'auto',           // e.g. '300px'
  maxH = '80vh',           // limit height to 80% of viewport
  overflow = 'auto',       // scroll if content exceeds maxH
  closeOnBackdropClick = true,
  showCloseButton = true,
}) => {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        onClick={closeOnBackdropClick ? onClose : undefined}
      />

      {/* Panel */}
      <div
        className="relative bg-bg-card border border-border rounded-2xl w-full overflow-hidden flex flex-col"
        style={{
          maxWidth: maxW,
          minHeight: minH,
          maxHeight: maxH,
          boxShadow: '0 32px 80px rgba(0,0,0,.65), inset 0 1px 0 rgba(255,255,255,.04)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <h2 id="modal-title" className="font-display font-bold text-lg text-text-primary">
            {title}
          </h2>
          {showCloseButton && onClose && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:bg-bg-hov hover:text-text-primary transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Body – scrollable if needed */}
        <div className="px-6 py-5 overflow-y-auto flex-1" style={{ overflow }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;