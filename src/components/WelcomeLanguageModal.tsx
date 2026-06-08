import React, { useState, useEffect } from 'react';
import { useLanguageStore, LANGUAGES, type LanguageCode } from '../store/useLanguageStore';
import { Sparkles, Heart } from 'lucide-react';

interface WelcomeLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeLanguageModal: React.FC<WelcomeLanguageModalProps> = ({ isOpen, onClose }) => {
  const { setLanguage } = useLanguageStore();
  const [selectedLang, setSelectedLang] = useState<LanguageCode>('en');
  const [isClosing, setIsClosing] = useState(false);

  const handleFinish = () => {
    setLanguage(selectedLang);
    localStorage.setItem('danny-m-onboarded', 'true');
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 400); // match duration
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-lg transition-opacity duration-500 ${
        isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div
        className={`relative bg-bg-card/98 border border-white/10 rounded-[2.5rem] w-full max-w-2xl p-8 md:p-12 shadow-[0_0_80px_rgba(217,93,46,0.15)] backdrop-blur-2xl overflow-hidden flex flex-col justify-between transition-all duration-500 transform ${
          isClosing ? 'scale-95 translate-y-4' : 'scale-100 translate-y-0'
        }`}
      >
        {/* Glow ambient background inside modal */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(211,84,0,0.12)_0%,rgba(0,0,0,0)_70%)] z-0 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-full overflow-hidden border border-primary bg-secondary flex items-center justify-center p-1 shadow-lg shadow-primary/20">
            <img src="/logo.png" alt="Danny M Logo" className="w-full h-full object-contain" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] text-primary-light font-black tracking-widest uppercase flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Welcoming You Home / Siyakwamukela
            </span>
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-white leading-tight uppercase">
              The Taste of Ubuntu
            </h2>
          </div>

          <p className="text-white/75 text-sm leading-relaxed max-w-xl">
            In South Africa, <strong className="text-primary-light font-extrabold">Ubuntu</strong> reminds us that <em>"I am because we are"</em>—that we are all connected as one family. 
            Here at Danny M, we believe that sharing a table begins with speaking your language. 
            We embrace the beautiful diversity of our home by offering our menu in all <strong className="text-white">11 official languages</strong>.
          </p>

          <div className="w-full py-4 space-y-3">
            <label className="block text-[10px] font-black tracking-widest text-white/50 uppercase">
              Choose your language / Khetha ulimi lwakho
            </label>
            
            {/* Grid of Languages */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setSelectedLang(lang.code)}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all duration-300 cursor-pointer flex flex-col items-center justify-center ${
                    selectedLang === lang.code
                      ? 'bg-primary/20 border-primary text-primary-light shadow-lg shadow-primary/10'
                      : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="font-black text-sm">{lang.nativeName}</span>
                  <span className="text-[9px] opacity-50 font-normal">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleFinish}
            className="w-full sm:w-auto px-12 py-4 bg-primary hover:bg-primary-light text-white font-extrabold rounded-full text-xs tracking-widest uppercase transition-all shadow-lg shadow-primary/20 hover:shadow-primary/45 border border-primary-light/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Enter Hearth / Ngena</span> <Heart className="w-4 h-4 text-white fill-white/20" />
          </button>
        </div>
      </div>
    </div>
  );
};
