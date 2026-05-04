// src/creator/components/ConfirmDeleteModal.jsx
import React from 'react';
import Modal from '../components/ui/Modal';

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, userName, itemType = 'video' }) => {
  return (
    <Modal open={isOpen} onClose={onClose} title={`Delete ${itemType}`}>
      <p className="text-text-secondary mb-4">
        Are you sure you want to delete this {itemType} <span className="font-semibold text-text-primary">{userName}</span>? This action cannot be undone.
      </p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-text-secondary hover:bg-bg-el transition">
          Cancel
        </button>
        <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-danger text-white font-semibold hover:bg-danger/90 transition">
          Delete
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;