
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, ChevronDown, Check } from 'lucide-react';

const languages = [
  // --- Nepal's official & local languages (MyMemory supported codes) ---
  { code: 'en', name: 'English', short: 'EN' },
  { code: 'ne', name: 'Nepali', short: 'NP' },
  { code: 'mai', name: 'Maithili', short: 'MAI' },
  { code: 'bho', name: 'Bhojpuri', short: 'BHO' },
  { code: 'sa', name: 'Sanskrit', short: 'SA' },
  { code: 'hi', name: 'Hindi', short: 'HI' },

  // --- Other major Indian languages (often spoken in Nepal) ---
  { code: 'bn', name: 'Bengali', short: 'BN' },
  { code: 'ur', name: 'Urdu', short: 'UR' },
  { code: 'pa', name: 'Punjabi', short: 'PA' },
  { code: 'gu', name: 'Gujarati', short: 'GU' },
  { code: 'mr', name: 'Marathi', short: 'MR' },
  { code: 'ta', name: 'Tamil', short: 'TA' },
  { code: 'te', name: 'Telugu', short: 'TE' },
  { code: 'ml', name: 'Malayalam', short: 'ML' },
  { code: 'kn', name: 'Kannada', short: 'KN' },

  // --- Global languages ---
  { code: 'es', name: 'Español', short: 'ES' },
  { code: 'fr', name: 'Français', short: 'FR' },
  { code: 'de', name: 'Deutsch', short: 'DE' },
  { code: 'it', name: 'Italiano', short: 'IT' },
  { code: 'pt', name: 'Português', short: 'PT' },
  { code: 'ru', name: 'Русский', short: 'RU' },
  { code: 'ja', name: '日本語', short: 'JA' },
  { code: 'ko', name: '한국어', short: 'KO' },
  { code: 'zh', name: '中文 (简体)', short: 'ZH' },
  { code: 'ar', name: 'العربية', short: 'AR' },
  { code: 'tr', name: 'Türkçe', short: 'TR' },
  { code: 'vi', name: 'Tiếng Việt', short: 'VI' },
  { code: 'th', name: 'ไทย', short: 'TH' },
  { code: 'id', name: 'Bahasa Indonesia', short: 'ID' },
  { code: 'ms', name: 'Bahasa Melayu', short: 'MS' },
  { code: 'nl', name: 'Nederlands', short: 'NL' },
  { code: 'sv', name: 'Svenska', short: 'SV' },
  { code: 'no', name: 'Norsk', short: 'NO' },
  { code: 'da', name: 'Dansk', short: 'DA' },
  { code: 'fi', name: 'Suomi', short: 'FI' },
  { code: 'pl', name: 'Polski', short: 'PL' },
  { code: 'cs', name: 'Čeština', short: 'CS' },
  { code: 'ro', name: 'Română', short: 'RO' },
  { code: 'hu', name: 'Magyar', short: 'HU' },
  { code: 'el', name: 'Ελληνικά', short: 'EL' },
  { code: 'he', name: 'עברית', short: 'HE' },
];

const LanguageSwitcher = ({ variant = 'icon', isAuthenticated = false }) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const currentLang = languages.find(l => l.code === language) || languages[0];

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Blocked variant (used inside profile dropdown for non‑premium)
  if (variant === 'blocked') {
    return (
      <div className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-text-muted text-base opacity-60 cursor-not-allowed">
        <div className="flex items-center gap-3">
          <Globe size={14} />
          <span>Language</span>
        </div>
        <span className="text-sm font-medium">{currentLang.short}</span>
      </div>
    );
  }

  // Dropdown variant (used in mobile drawer, profile, or standalone)
  if (variant === 'dropdown') {
    return (
      <div className="relative w-full" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-text-secondary text-base hover:bg-bg-hov transition-colors"
        >
          <div className="flex items-center gap-3">
            <Globe size={14} />
            <span>Language</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium" data-no-translate>{currentLang.short}</span>
            <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-bg-card border border-border rounded-xl shadow-lg z-[200] max-h-48 overflow-y-auto">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between w-full px-4 py-2.5 text-sm hover:bg-bg-hov transition-colors ${
                  language === lang.code ? 'text-primary-light font-semibold' : 'text-text-secondary'
                }`}
              >
                <span>{lang.name}</span>
                {language === lang.code && <Check size={14} />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Default 'icon' variant: used for unauthenticated users – clickable button + dropdown
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-bg-el hover:bg-bg-hov transition-colors"
      >
        <Globe size={16} className="text-text-muted" />
        <span className="text-sm font-medium text-text-primary" data-no-translate>{currentLang.short}</span>
        <ChevronDown size={12} className={`text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-bg-card border border-border rounded-xl shadow-lg z-[200] max-h-48 overflow-y-auto">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`flex items-center justify-between w-full px-4 py-2.5 text-sm hover:bg-bg-hov transition-colors ${
                language === lang.code ? 'text-primary-light font-semibold' : 'text-text-secondary'
              }`}
            >
              <span>{lang.name}</span>
              {language === lang.code && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;