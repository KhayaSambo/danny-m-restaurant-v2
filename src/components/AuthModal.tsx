import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

// Google SVG Icon
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// Apple SVG Icon
const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.15 1.25-2.13 3.74.03 2.97 2.6 3.96 2.63 3.97l-.05.91zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);
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

  const handleGoogleSignIn = async () => {
    try {
      setSocialLoading('google');
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
      // Redirect happens automatically — modal will close when auth state updates
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google.');
      setSocialLoading(null);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setSocialLoading('apple');
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      // Redirect happens automatically
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Apple.');
      setSocialLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-bg-card border border-white/10 p-8 rounded-[2rem] shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer">
          <X className="w-4 h-4" />
        </button>
        
        <h2 className="text-2xl font-heading font-extrabold text-white mb-2">Welcome</h2>
        <p className="text-white/60 text-sm mb-6">Sign in to place orders and track your feast.</p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
            {error}
          </div>
        )}

        {/* Social Sign-In Buttons — always visible on email step */}
        {step === 'email' && (
          <>
            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={!!socialLoading || loading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-white/90 text-gray-800 font-bold rounded-xl py-3 text-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mb-3 shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
            >
              {socialLoading === 'google' ? (
                <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              {socialLoading === 'google' ? 'Redirecting…' : 'Continue with Google'}
            </button>

            {/* Apple Sign In */}
            <button
              type="button"
              onClick={handleAppleSignIn}
              disabled={!!socialLoading || loading}
              className="w-full flex items-center justify-center gap-3 bg-black hover:bg-zinc-900 text-white font-bold rounded-xl py-3 text-sm border border-white/15 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mb-5 shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
            >
              {socialLoading === 'apple' ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
              ) : (
                <AppleIcon />
              )}
              {socialLoading === 'apple' ? 'Redirecting…' : 'Continue with Apple'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] font-black tracking-widest text-white/30 uppercase">Or continue with email</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
          </>
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
              disabled={loading || !!socialLoading}
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
