import React, { useState, useEffect, useRef } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguageStore, LANGUAGES, type LanguageCode } from '../store/useLanguageStore';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const toggleDropdown = () => {
    if (isOpen) {
      setIsOpen(false);
      setIsClosing(true);
      setTimeout(() => setIsClosing(false), 150);
    } else {
      setIsClosing(false);
      setIsOpen(true);
    }
  };

  const selectLanguage = (code: LanguageCode) => {
    setLanguage(code);
    toggleDropdown();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isOpen) {
          setIsOpen(false);
          setIsClosing(true);
          setTimeout(() => setIsClosing(false), 150);
        }
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setIsClosing(true);
        setTimeout(() => setIsClosing(false), 150);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white/80 hover:text-white text-xs font-bold cursor-pointer"
        aria-label="Change Language"
      >
        <Globe className="w-4 h-4 text-primary-light" />
        <span className="hidden sm:inline uppercase tracking-wider">{currentLangObj.code}</span>
      </button>

      {/* Language Dropdown */}
      <div
        className={`absolute top-[120%] right-0 w-64 bg-bg-card border border-white/10 shadow-2xl rounded-2xl p-2 t-dropdown ${isOpen ? 'is-open' : ''} ${isClosing ? 'is-closing' : ''}`}
        data-origin="top-right"
        style={{ zIndex: 100 }}
      >
        <div className="px-3 py-2 border-b border-white/10 mb-2">
          <span className="block text-[10px] text-white/50 uppercase tracking-widest font-black">Select Language / Khetha</span>
        </div>
        <div className="max-h-72 overflow-y-auto space-y-1 custom-scrollbar pr-1">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => selectLanguage(lang.code)}
              className={`w-full text-left flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                language === lang.code ? 'text-primary bg-primary/10' : 'text-white/80 hover:text-white'
              }`}
            >
              <div className="flex flex-col">
                <span className="font-extrabold">{lang.nativeName}</span>
                <span className="text-[9px] text-white/40 font-normal">{lang.name}</span>
              </div>
              {language === lang.code && <Check className="w-4 h-4 text-primary" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
