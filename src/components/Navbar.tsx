import React, { useState, useEffect } from 'react';
import { User, ShoppingCart, Utensils, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/useCartStore';
import type { User as SupaUser } from '@supabase/supabase-js';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from '../hooks/useTranslation';

interface NavbarProps {
  user: SupaUser | null;
  setUser: (user: SupaUser | null) => void;
  setIsAuthModalOpen: (open: boolean) => void;
  setIsProfileModalOpen: (open: boolean) => void;
  setIsOrdersModalOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  setUser,
  setIsAuthModalOpen,
  setIsProfileModalOpen,
  setIsOrdersModalOpen
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileClosing, setIsProfileClosing] = useState(false);

  const { t } = useTranslation();

  const totalCartCount = useCartStore((state) => state.totalCartCount());
  const setIsCartOpen = useCartStore((state) => state.setIsCartOpen);
  const setOrderSuccess = useCartStore((state) => state.setOrderSuccess);
  const setOrderError = useCartStore((state) => state.setOrderError);
  const clearCart = useCartStore((state) => state.clearCart);
  const clearCheckoutFields = useCartStore((state) => state.clearCheckoutFields);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleProfileToggle = () => {
    if (isProfileOpen) {
      setIsProfileOpen(false);
      setIsProfileClosing(true);
      setTimeout(() => setIsProfileClosing(false), 150); // --dropdown-close-dur
    } else {
      setIsProfileClosing(false);
      setIsProfileOpen(true);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    clearCheckoutFields();
    clearCart();
    if (isProfileOpen) {
      handleProfileToggle();
    }
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled
      ? 'bg-bg-dark/85 border-b border-white/5 backdrop-blur-xl py-4 shadow-2xl shadow-black/40 opacity-100 translate-y-0 pointer-events-auto'
      : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <a href="#" className="flex items-center gap-3 font-heading font-extrabold text-2xl tracking-tight hover:scale-102 transition-transform">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-primary bg-secondary flex items-center justify-center p-0.5 shadow-lg shadow-primary/20">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">DANNY M</span>
        </a>

        <ul className="hidden md:flex gap-10 font-bold text-xs tracking-widest text-white/60 uppercase">
          <li>
            <a href="#home" className="hover:text-primary transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-primary after:transition-all after:duration-300">{t('nav.home')}</a>
          </li>
          <li>
            <a href="#about" className="hover:text-primary transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-primary after:transition-all after:duration-300">{t('nav.story')}</a>
          </li>
          <li>
            <a href="#menu" className="hover:text-primary transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-primary after:transition-all after:duration-300">{t('nav.menu')}</a>
          </li>
          <li>
            <a href="#contact" className="hover:text-primary transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-primary after:transition-all after:duration-300">{t('nav.contact')}</a>
          </li>
        </ul>

        <div className="flex items-center gap-4">
          <LanguageSelector />
          <div className="relative">
            <button
              onClick={() => {
                if (user) {
                  handleProfileToggle();
                } else {
                  setIsAuthModalOpen(true);
                }
              }}
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/80 cursor-pointer"
              aria-label="Profile"
            >
              <User className="w-5 h-5" />
            </button>

            {/* Profile Dropdown using transitions-dev */}
            <div
              className={`absolute top-[120%] right-0 w-56 bg-bg-card border border-white/10 shadow-2xl rounded-2xl p-2 t-dropdown ${isProfileOpen ? 'is-open' : ''} ${isProfileClosing ? 'is-closing' : ''}`}
              data-origin="top-right"
            >
              <div className="px-4 py-3 border-b border-white/10 mb-2">
                <span className="block text-xs text-white/50 uppercase tracking-widest font-black">{t('nav.loggedInAs')}</span>
                <span className="block text-sm font-bold text-white mt-1 truncate">{user?.email || 'user@example.com'}</span>
              </div>
              <button
                onClick={() => {
                  setIsProfileModalOpen(true);
                  handleProfileToggle();
                }}
                className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                <User className="w-4 h-4 text-primary-light" /> {t('nav.profile')}
              </button>
              <button
                onClick={() => {
                  setIsOrdersModalOpen(true);
                  handleProfileToggle();
                }}
                className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                <Utensils className="w-4 h-4 text-primary-light" /> {t('nav.orders')}
              </button>
              <button
                onClick={handleSignOut}
                className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 text-red-400 rounded-xl text-sm font-bold transition-colors mt-1 cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> {t('nav.signOut')}
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              setOrderSuccess(false);
              setOrderError(null);
              setIsCartOpen(true);
            }}
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/80 cursor-pointer"
            aria-label="Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="t-badge" data-open={totalCartCount > 0 ? "true" : "false"}>
              <span className="t-badge-dot bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-bg-dark">
                {totalCartCount}
              </span>
            </span>
          </button>
          <a href="#menu" className="bg-primary text-white px-6 py-2.5 rounded-full font-bold hover:bg-primary-light hover:shadow-lg hover:shadow-primary/30 transition-all text-xs tracking-widest uppercase border border-primary-light/20">
            {t('nav.orderNow')}
          </a>
        </div>
      </div>
    </nav>
  );
};
