import React, { useState } from 'react';
import { User as UserIcon, Check } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { supabase } from '../lib/supabase';
import type { User as SupaUser } from '@supabase/supabase-js';

interface ProfileModalProps {
  user: SupaUser | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, isOpen, onClose }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const customerName = useCartStore((state) => state.customerName);
  const customerPhone = useCartStore((state) => state.customerPhone);
  const customerEmail = useCartStore((state) => state.customerEmail);
  const deliveryAddress = useCartStore((state) => state.deliveryAddress);
  const fieldErrors = useCartStore((state) => state.fieldErrors);
  const fieldShaking = useCartStore((state) => state.fieldShaking);

  const setCustomerName = useCartStore((state) => state.setCustomerName);
  const setCustomerPhone = useCartStore((state) => state.setCustomerPhone);
  const setDeliveryAddress = useCartStore((state) => state.setDeliveryAddress);

  if (!isOpen) return null;

  const handleCloseProfileModal = () => {
    setIsClosing(true);
    const closeMs = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--modal-close-dur")
    ) || 150;
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, closeMs);
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      
      // Save locally
      localStorage.setItem('danny-m-customer-name', customerName);
      localStorage.setItem('danny-m-customer-phone', customerPhone);
      localStorage.setItem('danny-m-customer-email', customerEmail);
      localStorage.setItem('danny-m-delivery-address', deliveryAddress);
      
      if (user) {
        const { error } = await supabase.auth.updateUser({
          data: {
            full_name: customerName,
            phone: customerPhone,
            delivery_address: deliveryAddress
          }
        });
        if (error) throw error;
      }
      
      alert('Profile updated successfully!');
      handleCloseProfileModal();
    } catch (err: unknown) {
      console.error('Error saving profile:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      alert('Saved locally. Profile could not be synced to Supabase: ' + errMsg);
      handleCloseProfileModal();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/75 backdrop-blur-sm transition-opacity duration-300 ${!isClosing ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleCloseProfileModal}
      />
      {/* Modal Card */}
      <div className={`fixed inset-x-4 bottom-4 top-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[500px] md:max-h-[90vh] z-50 bg-bg-card/98 border border-white/10 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.95)] backdrop-blur-2xl overflow-hidden flex flex-col justify-between t-modal ${!isClosing ? 'is-open' : 'is-closing'}`}>
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-bg-dark/30 flex-shrink-0">
          <div className="flex items-center gap-3">
            <UserIcon className="w-6 h-6 text-primary-light" />
            <div>
              <h3 className="font-heading text-lg font-extrabold text-white tracking-tight uppercase">My Profile</h3>
              <p className="text-[10px] text-primary-light font-black tracking-widest uppercase mt-0.5">Ubuntu Hearth Account</p>
            </div>
          </div>
          <button
            onClick={handleCloseProfileModal}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Fields */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-1 bg-bg-dark/30 p-4 border border-white/5 rounded-2xl">
            <span className="block text-[9px] uppercase tracking-wider text-white/40 font-bold">Email Address</span>
            <span className="block text-sm text-white/90 font-bold font-mono">{user?.email || 'authenticated@user.com'}</span>
            <span className="block text-[8px] uppercase tracking-widest text-primary-light/60 font-black mt-1">● Account managed securely via Supabase</span>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black tracking-widest text-white/50 uppercase">Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-[#151211] border border-white/5 rounded-xl px-4 py-3.5 text-xs text-white outline-none transition-all t-fire-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black tracking-widest text-white/50 uppercase">Phone Number</label>
              <input
                type="tel"
                placeholder="e.g. +27 82 123 4567"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-[#151211] border border-white/5 rounded-xl px-4 py-3.5 text-xs text-white outline-none transition-all t-fire-input"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black tracking-widest text-white/50 uppercase">Delivery Address</label>
              <input
                type="text"
                placeholder="Street, Suburb, Pretoria"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className={`w-full bg-[#151211] border border-white/5 rounded-xl px-4 py-3.5 text-xs text-white outline-none transition-all t-fire-input ${fieldErrors.deliveryAddress ? 'is-error' : ''} ${fieldShaking.deliveryAddress ? 'is-shaking' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="p-6 border-t border-white/5 bg-bg-dark/30 flex justify-between items-center gap-4 flex-shrink-0">
          <button
            type="button"
            onClick={handleCloseProfileModal}
            className="px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-full text-[10px] tracking-widest uppercase transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="px-8 py-3.5 bg-primary hover:bg-primary-light text-white font-extrabold rounded-full text-[10px] tracking-widest uppercase transition-all cursor-pointer shadow-lg shadow-primary/20 hover:shadow-primary/45 border border-primary-light/20 flex items-center justify-center gap-2"
          >
            {isSaving ? 'Saving...' : 'Save Profile'} <Check className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </>
  );
};
