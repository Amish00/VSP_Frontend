import React from 'react';
import Modal from './ui/Modal'; 

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, userName, itemType = 'user' }) => {
  return (
    <Modal open={isOpen} onClose={onClose} title={`Delete ${itemType}`} maxW={480}>
      <div className="space-y-6">
        <p className="text-text-secondary">
          Are you sure you want to delete this {itemType}{' '}
          <span className="font-semibold text-text-primary">{userName}</span>?
          <br />
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border text-text-secondary hover:bg-bg-el transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-danger text-white font-semibold hover:bg-danger/90 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;