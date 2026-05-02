import React from 'react'
import logoUrl from '../../assets/logo.svg'

const AuthCard = ({ children, maxWidth = 560 }) => (
  <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-bg-base">
    <div className="w-full bg-bg-card border border-border rounded-2xl p-6 sm:p-8"
         style={{ maxWidth, boxShadow: '0 32px 80px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.04)' }}>
      <div className="flex items-center justify-center gap-2 mb-7">
        <img src={logoUrl} alt="ViriShare logo" className="h-10 w-auto" />
        <span className="font-display font-black text-2xl text-primary-light tracking-tight">
        ViriShare
        </span>
      </div>
      {children}
    </div>
  </div>
)

export default AuthCard
