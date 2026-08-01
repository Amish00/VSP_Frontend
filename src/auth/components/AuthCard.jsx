// src/auth/components/AuthCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import logoUrl from '../../assets/logo.svg';

const AuthCard = ({ children, maxWidth = 560 }) => (
  <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-bg-base">
    <div className="w-full bg-bg-card border border-border rounded-2xl p-6 sm:p-8"
         style={{ maxWidth, boxShadow: '0 32px 80px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.04)' }}>
      <Link to="/" className="flex items-center justify-center gap-2 mb-7 group">
        <img src={logoUrl} alt="ViriShare logo" className="h-9 w-auto" />
        <span className="font-display font-black text-2xl tracking-tight group-hover:text-primary transition-colors">
          ViriShare
        </span>
      </Link>
      {children}
    </div>
  </div>
);

export default AuthCard;