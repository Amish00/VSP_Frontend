import React from 'react';

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, userName, itemType = 'user' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-xl">
                <h2 className="text-xl font-display font-bold text-text-primary mb-2">Delete {itemType}</h2>
                <p className="text-text-secondary mb-6">
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
            </div>
        </div>
    );
};

export default ConfirmDeleteModal;