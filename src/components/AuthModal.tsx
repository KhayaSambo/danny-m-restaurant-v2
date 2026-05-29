import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // validation/shake states
  const [emailError, setEmailError] = useState(false);
  const [emailShaking, setEmailShaking] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [otpShaking, setOtpShaking] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailError(false);
    setEmailShaking(false);
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value);
    setOtpError(false);
    setOtpShaking(false);
  };

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setEmailError(true);
      setEmailShaking(true);
      setTimeout(() => setEmailShaking(false), 280);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      if (error) throw error;
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.');
      setEmailError(true);
      setEmailShaking(true);
      setTimeout(() => setEmailShaking(false), 280);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setOtpError(true);
      setOtpShaking(true);
      setTimeout(() => setOtpShaking(false), 280);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      });
      if (error) throw error;
      if (data.user) {
        onSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
      setOtpError(true);
      setOtpShaking(true);
      setTimeout(() => setOtpShaking(false), 280);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-bg-card border border-white/10 p-8 rounded-[2rem] shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer">
          <X className="w-4 h-4" />
        </button>
        
        <h2 className="text-2xl font-heading font-extrabold text-white mb-2">Welcome</h2>
        <p className="text-white/60 text-sm mb-8">Sign in securely without a password.</p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
            {error}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black tracking-widest text-white/50 uppercase mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input 
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="name@example.com"
                  className={`w-full bg-bg-dark border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm outline-none transition-all t-fire-input ${emailError ? 'is-error' : ''} ${emailShaking ? 'is-shaking' : ''}`}
                  required
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-light text-white font-bold rounded-xl py-3 text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Magic Link / OTP'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
             <div className="flex items-center justify-between gap-2 mb-4 bg-green-400/5 border border-green-400/10 rounded-xl p-3">
               <div className="flex items-center gap-2">
                 <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                 <span className="text-xs text-green-400/90 font-medium">OTP sent to <span className="font-bold text-green-400">{email}</span></span>
               </div>
               <button 
                 type="button" 
                 onClick={() => {
                   setStep('email');
                   setOtp('');
                   setOtpError(false);
                   setOtpShaking(false);
                 }}
                 className="text-[10px] uppercase tracking-widest font-black text-white/50 hover:text-primary-light transition-colors cursor-pointer bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/5"
               >
                 Change
               </button>
             </div>
            <div>
              <label className="block text-[10px] font-black tracking-widest text-white/50 uppercase mb-2">Enter 6-Digit Code</label>
              <input 
                type="text"
                value={otp}
                onChange={handleOtpChange}
                placeholder="000000"
                className={`w-full bg-bg-dark border border-white/10 rounded-xl py-3 px-4 text-white text-center tracking-[0.5em] text-lg font-bold outline-none transition-all t-fire-input ${otpError ? 'is-error' : ''} ${otpShaking ? 'is-shaking' : ''}`}
                required
                maxLength={6}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-light text-white font-bold rounded-xl py-3 text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
