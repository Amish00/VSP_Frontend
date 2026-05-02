import React, { useEffect } from 'react'
import { X } from 'lucide-react'

/**
 * Modal — used for confirmations and info-collection forms.
 * Usage:
 *   <Modal open={open} onClose={() => setOpen(false)} title="Confirm Action">
 *     <p>Are you sure?</p>
 *     <div className="flex gap-2 mt-4">
 *       <button onClick={onClose}>Cancel</button>
 *       <button onClick={handleConfirm}>Confirm</button>
 *     </div>
 *   </Modal>
 */
const Modal = ({ open, onClose, title, children, maxW = 480 }) => {
  useEffect(() => {
    if (!open) return
    const h = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', h)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-bg-card border border-border rounded-2xl w-full overflow-hidden"
           style={{ maxWidth: maxW, boxShadow: '0 32px 80px rgba(0,0,0,.65), inset 0 1px 0 rgba(255,255,255,.04)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 id="modal-title" className="font-display font-bold text-lg text-text-primary">{title}</h2>
          <button onClick={onClose} aria-label="Close"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:bg-bg-hov hover:text-text-primary transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

export default Modal