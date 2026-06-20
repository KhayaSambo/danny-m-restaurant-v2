import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { User, ShoppingCart, Utensils, LogOut, Menu, X } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();
  const location = useLocation();

  const isHome = location.pathname === '/';
  const showScrolledStyles = isScrolled || !isHome;


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
      setIsMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        if (isProfileOpen) {
          setIsProfileOpen(false);
          setIsProfileClosing(true);
          setTimeout(() => setIsProfileClosing(false), 150);
        }
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isProfileOpen) {
          setIsProfileOpen(false);
          setIsProfileClosing(true);
          setTimeout(() => setIsProfileClosing(false), 150);
        }
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isProfileOpen]);

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
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${showScrolledStyles
          ? 'bg-bg-dark/85 border-b border-white/5 backdrop-blur-xl py-4 shadow-2xl shadow-black/40 opacity-100 translate-y-0 pointer-events-auto'
          : 'bg-transparent border-b border-transparent py-5 opacity-100 translate-y-0 pointer-events-auto'
        }`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center relative">
          {/* Mobile Menu Toggle (Left on Mobile) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-white/80 cursor-pointer"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Centered Logo & Brand */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
            <Link to="/" className="flex items-center gap-2 md:gap-3 font-heading font-extrabold text-xl md:text-2xl tracking-tight hover:scale-102 transition-transform">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border border-primary bg-secondary flex items-center justify-center p-0.5 shadow-lg shadow-primary/20">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              {/* <span className="hidden lg:inline tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">DANNY M</span> */}
            </Link>
          </div>

          <ul className="hidden md:flex gap-10 font-bold text-xs tracking-widest uppercase items-center">
            <li>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 hover:after:w-full after:h-0.5 after:bg-primary after:transition-all after:duration-300 ${isActive ? 'text-primary after:w-full' : 'text-white/60 hover:text-primary after:w-0'
                  }`
                }
              >
                {t('nav.home')}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/story"
                className={({ isActive }) =>
                  `transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 hover:after:w-full after:h-0.5 after:bg-primary after:transition-all after:duration-300 ${isActive ? 'text-primary after:w-full' : 'text-white/60 hover:text-primary after:w-0'
                  }`
                }
              >
                {t('nav.story')}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/menu"
                className={({ isActive }) =>
                  `transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 hover:after:w-full after:h-0.5 after:bg-primary after:transition-all after:duration-300 ${isActive ? 'text-primary after:w-full' : 'text-white/60 hover:text-primary after:w-0'
                  }`
                }
              >
                {t('nav.menu')}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 hover:after:w-full after:h-0.5 after:bg-primary after:transition-all after:duration-300 ${isActive ? 'text-primary after:w-full' : 'text-white/60 hover:text-primary after:w-0'
                  }`
                }
              >
                {t('nav.contact')}
              </NavLink>
            </li>
          </ul>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>
            <div className="relative" ref={profileDropdownRef}>
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
              aria-label={`Cart with ${totalCartCount} items`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="t-badge" data-open={totalCartCount > 0 ? "true" : "false"}>
                <span
                  key={totalCartCount}
                  className="t-badge-dot bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-bg-dark animate-in zoom-in duration-300"
                >
                  {totalCartCount}
                </span>
              </span>
            </button>
            <Link to="/menu" className="hidden lg:flex bg-primary text-white px-6 py-2.5 rounded-full font-bold hover:bg-primary-light hover:shadow-lg hover:shadow-primary/30 transition-all text-xs tracking-widest uppercase border border-primary-light/20">
              {t('nav.orderNow')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      <div
        className={`md:hidden fixed inset-0 bg-bg-dark/80 backdrop-blur-2xl transition-all duration-500 z-40 ${isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
          }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div
          className="flex flex-col pt-24 pb-8 px-8 gap-6 h-full overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center pb-4 border-b border-white/5">
            <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">Menu</span>
            <LanguageSelector />
          </div>
          <NavLink
            to="/"
            end
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `text-2xl font-heading font-extrabold tracking-tight transition-colors ${isActive ? 'text-primary' : 'text-white/70'
              }`
            }
          >
            {t('nav.home')}
          </NavLink>
          <NavLink
            to="/story"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `text-2xl font-heading font-extrabold tracking-tight transition-colors ${isActive ? 'text-primary' : 'text-white/70'
              }`
            }
          >
            {t('nav.story')}
          </NavLink>
          <NavLink
            to="/menu"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `text-2xl font-heading font-extrabold tracking-tight transition-colors ${isActive ? 'text-primary' : 'text-white/70'
              }`
            }
          >
            {t('nav.menu')}
          </NavLink>
          <NavLink
            to="/contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `text-2xl font-heading font-extrabold tracking-tight transition-colors ${isActive ? 'text-primary' : 'text-white/70'
              }`
            }
          >
            {t('nav.contact')}
          </NavLink>

          {/* User Account/Profile Integration on Mobile */}
          {user ? (
            <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
              <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">
                {t('nav.loggedInAs')}
              </span>
              <span className="block text-xs font-bold text-white truncate bg-white/5 px-4 py-2.5 rounded-xl border border-white/5">
                {user.email || 'user@example.com'}
              </span>
              <button
                onClick={() => {
                  setIsProfileModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 rounded-xl text-sm font-bold transition-colors cursor-pointer text-white/70 hover:text-white"
              >
                <User className="w-4 h-4 text-primary-light" /> {t('nav.profile')}
              </button>
              <button
                onClick={() => {
                  setIsOrdersModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 rounded-xl text-sm font-bold transition-colors cursor-pointer text-white/70 hover:text-white"
              >
                <Utensils className="w-4 h-4 text-primary-light" /> {t('nav.orders')}
              </button>
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 text-red-400 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> {t('nav.signOut')}
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-white/5">
              <button
                onClick={() => {
                  setIsAuthModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-white/15 rounded-xl text-xs font-black tracking-widest uppercase transition-colors cursor-pointer text-white/80 hover:text-white border border-white/10 bg-white/5"
              >
                <User className="w-4 h-4 text-primary-light" /> Sign In / Create Account
              </button>
            </div>
          )}

          <div className="mt-auto pt-8 border-t border-white/5">
            <Link
              to="/menu"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 text-sm tracking-widest uppercase shadow-lg shadow-primary/20"
            >
              <Utensils className="w-5 h-5" /> {t('nav.orderNow')}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
