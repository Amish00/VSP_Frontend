import React from 'react';
import { X, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';

const LockedModal = ({ isOpen, onClose, videoTitle, mode = 'signin_and_plans' }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!isOpen) return null;

  const isLoggedIn = !!user;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-bg-card rounded-2xl w-full max-w-md p-6 border border-border shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-primary-light">
            <Lock size={20} />
            <span className="font-bold text-lg">
              {mode === 'signin' ? 'Sign In Required' : 'Paid Content'}
            </span>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X size={20} />
          </button>
        </div>
        <p className="text-text-primary mb-2">
          {mode === 'signin'
            ? 'Please sign in to like or subscribe.'
            : <><strong>{videoTitle}</strong> is a paid video.</>}
        </p>
        <p className="text-text-secondary text-sm mb-6">
          {mode === 'signin'
            ? 'You need to be logged in to perform this action.'
            : !isLoggedIn
              ? 'Please sign in or upgrade your plan to watch this content.'
              : 'Upgrade your plan to access this video.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => { navigate('/signin'); onClose(); }}
            className="flex-1 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition"
          >
            Sign In
          </button>
          {mode !== 'signin' && (
            <button
              onClick={() => { navigate('/plans'); onClose(); }}
              className="flex-1 py-2 rounded-xl border border-primary text-primary-light font-semibold hover:bg-primary/10 transition"
            >
              View Plans
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LockedModal;