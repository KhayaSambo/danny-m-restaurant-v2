import React, { useState, useEffect } from 'react';
import { Shield, Settings, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface CookieBannerProps {
  onOpenPrivacy: () => void;
  forceOpen: boolean;
  onCloseForceOpen: () => void;
}

interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  answered: boolean;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onOpenPrivacy, forceOpen, onCloseForceOpen }) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Consent states
  const [analyticsConsent, setAnalyticsConsent] = useState(true);
  const [marketingConsent, setMarketingConsent] = useState(false);

  useEffect(() => {
    const consentStr = localStorage.getItem('danny-m-cookie-consent');
    if (!consentStr) {
      // Show banner after short delay for entry animation
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    } else if (forceOpen) {
      const consent = JSON.parse(consentStr) as CookieConsent;
      // Use functional updates to satisfy lint if needed, but the error is about synchronous setState in effect.
      // Actually, for forceOpen, we can just set them. To avoid cascading renders,
      // we could use a single state object or wrap in a timeout if absolutely necessary.
      // But let's try to just use functional updates first or just ignore if it's a false positive for this use case.
      // Better: Use a timeout to move it out of the synchronous effect execution.
      const timer = setTimeout(() => {
        setAnalyticsConsent(consent.analytics);
        setMarketingConsent(consent.marketing);
        setIsVisible(true);
        setShowSettings(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [forceOpen]);

  const handleAcceptAll = () => {
    const consent: CookieConsent = {
      essential: true,
      analytics: true,
      marketing: true,
      answered: true
    };
    localStorage.setItem('danny-m-cookie-consent', JSON.stringify(consent));
    setIsVisible(false);
    setShowSettings(false);
    if (forceOpen) onCloseForceOpen();
  };

  const handleRejectAll = () => {
    const consent: CookieConsent = {
      essential: true,
      analytics: false,
      marketing: false,
      answered: true
    };
    localStorage.setItem('danny-m-cookie-consent', JSON.stringify(consent));
    setIsVisible(false);
    setShowSettings(false);
    if (forceOpen) onCloseForceOpen();
  };

  const handleSavePreferences = () => {
    const consent: CookieConsent = {
      essential: true,
      analytics: analyticsConsent,
      marketing: marketingConsent,
      answered: true
    };
    localStorage.setItem('danny-m-cookie-consent', JSON.stringify(consent));
    setIsVisible(false);
    setShowSettings(false);
    if (forceOpen) onCloseForceOpen();
  };

  return (
    <div
      data-open={isVisible}
      className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-[90] bg-bg-card/95 border border-white/10 p-5 md:p-6 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.6)] backdrop-blur-lg transition-all duration-300 t-panel-slide"
    >
      <div className="space-y-4">
        {/* Banner Header */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center text-primary-light flex-shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-heading font-extrabold text-sm text-white uppercase tracking-wider">{t('popia.cookieTitle')}</h4>
            <p className="text-[11px] leading-relaxed text-white/60 mt-1">
              {t('popia.cookieDesc')}{' '}
              <button
                onClick={onOpenPrivacy}
                className="text-primary-light hover:underline font-bold focus:outline-none cursor-pointer"
              >
                {t('popia.privacyPolicy')}
              </button>
            </p>
          </div>
        </div>

        {/* Customized Settings Drawer */}
        {showSettings && (
          <div className="bg-[#0d0b0a] border border-white/5 rounded-2xl p-4 space-y-3 animate-fade-in">
            <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
              <span className="font-bold text-white/80">Toggle Preferences</span>
              <span className="text-[8px] uppercase tracking-widest text-primary-light font-black">POPIA Registry</span>
            </div>

            {/* Essential Cookies */}
            <div className="flex justify-between items-start gap-4 text-xs">
              <div>
                <span className="font-bold text-white">Essential Cookies</span>
                <p className="text-[10px] text-white/40 mt-0.5">Required for checkout features, user accounts, and language selection.</p>
              </div>
              <span className="text-[9px] uppercase tracking-wider text-green-400 font-extrabold bg-green-400/10 px-2 py-0.5 rounded-md border border-green-400/20">Always Active</span>
            </div>

            {/* Analytics Cookies */}
            <div className="flex justify-between items-start gap-4 text-xs pt-1">
              <div>
                <span className="font-bold text-white">Analytics Cookies</span>
                <p className="text-[10px] text-white/40 mt-0.5">Helps us measure site traffic and popularity of traditional plate options.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={analyticsConsent}
                  onChange={(e) => setAnalyticsConsent(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>

            {/* Marketing Cookies */}
            <div className="flex justify-between items-start gap-4 text-xs pt-1">
              <div>
                <span className="font-bold text-white">Marketing Cookies</span>
                <p className="text-[10px] text-white/40 mt-0.5">Used to remember customer order profiles for personalized promotions.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>
          </div>
        )}

        {/* Buttons Action Area */}
        <div className="flex flex-wrap gap-2 items-center justify-between pt-1">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-1 text-[10px] font-bold text-white/50 hover:text-white uppercase tracking-widest transition-colors focus:outline-none cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{showSettings ? 'Hide Panel' : t('popia.customize')}</span>
            {showSettings ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <div className="flex gap-2">
            {!showSettings ? (
              <>
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-bold rounded-full tracking-widest uppercase transition-colors cursor-pointer"
                >
                  {t('popia.reject')}
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 bg-primary hover:bg-primary-light text-white text-[10px] font-bold rounded-full tracking-widest uppercase transition-all shadow-md shadow-primary/20 flex items-center gap-1 cursor-pointer border border-primary-light/20"
                >
                  <span>{t('popia.acceptAll')}</span>
                  <Check className="w-3 h-3" />
                </button>
              </>
            ) : (
              <button
                onClick={handleSavePreferences}
                className="px-5 py-2.5 bg-primary hover:bg-primary-light text-white text-[10px] font-extrabold rounded-full tracking-widest uppercase transition-all shadow-md shadow-primary/20 flex items-center gap-1.5 cursor-pointer border border-primary-light/20"
              >
                <span>{t('popia.savePreferences')}</span>
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
