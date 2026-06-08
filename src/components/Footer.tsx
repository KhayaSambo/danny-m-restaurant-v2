import React from 'react';
import { MapPin, Clock, Info, CreditCard, Package } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer id="contact" className="bg-bg-dark pt-24 pb-12 text-white/80 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-16 mb-16 relative z-10">

        <div className="space-y-6">
          <h3 className="font-heading text-2xl font-extrabold tracking-tight text-white">DANNY M</h3>
          <p className="text-white/60 leading-relaxed text-sm">
            {t('hero.description')}
          </p>
          <div className="flex gap-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer text-white shadow-md" aria-label="Facebook">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer text-white shadow-md" aria-label="Instagram">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.008 3.81.055.97.044 1.5.206 1.85.342.463.18.792.395 1.14.743.348.349.562.678.742 1.14.136.35.298.88.342 1.85.047 1.026.055 1.38.055 3.81 0 2.43-.008 2.784-.055 3.81-.044.97-.206 1.5-.342 1.85a2.915 2.915 0 01-.74 1.14c-.349.348-.678.562-1.14.742-.35.136-.88.298-1.85.342-1.026.047-1.38.055-3.81.055-2.43 0-2.784-.008-3.81-.055-.97-.044-1.5-.206-1.85-.342a2.915 2.915 0 01-1.14-.74 2.915 2.915 0 01-.742-1.14c-.136-.35-.298-.88-.342-1.85-.047-1.026-.055-1.38-.055-3.81 0-2.43.008-2.784.055-3.81.044-.97.206-1.5.342-1.85.18-.463.395-.792.743-1.14.349-.348.678-.562 1.14-.742.35-.136.88-.298 1.85-.342 1.026-.047 1.38-.055 3.81-.055zm0-2C9.536 0 9.191.012 8.087.062 6.98.113 6.224.288 5.566.544a4.92 4.92 0 00-1.782 1.16 4.92 4.92 0 00-1.16 1.782C2.378 4.135 2.2 4.887 2.148 5.992 2.102 7.095 2.09 7.44 2.09 10.218c0 2.778.012 3.123.063 4.227.05 1.105.226 1.857.482 2.515.26.666.6 1.229 1.16 1.782.553.553 1.116.892 1.782 1.16.658.256 1.41.431 2.515.482 1.104.05 1.448.062 4.227.062 2.778 0 3.123-.012 4.227-.062 1.105-.05 1.857-.226 2.515-.482.666-.26 1.229-.6 1.782-1.16.553-.553.892-1.116 1.16-1.782.256-.658.431-1.41.482-2.515.05-1.104.062-1.448.062-4.227 0-2.778-.012-3.123-.062-4.227-.05-1.105-.226-1.857-.482-2.515a4.92 4.92 0 00-1.16-1.782 4.92 4.92 0 00-1.782-1.16c-.658-.256-1.41-.431-2.515-.482C15.428.012 15.083 0 12.315 0zm0 4.945c-2.913 0-5.273 2.36-5.273 5.273s2.36 5.273 5.273 5.273 5.273-2.36 5.273-5.273-2.36-5.273-5.273-5.273zm0 8.545c-1.808 0-3.273-1.465-3.273-3.273s1.465-3.273 3.273-3.273 3.273 1.465 3.273 3.273-1.465 3.273-3.273 3.273zm5.638-8.337c0 .65-.527 1.178-1.178 1.178-.65 0-1.178-.528-1.178-1.178 0-.65.528-1.178 1.178-1.178.65 0 1.178.528 1.178 1.178z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="https://wa.me/27123456789" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer text-white shadow-md" aria-label="WhatsApp">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.004 2C6.48 2 2 6.48 2 12.004c0 1.763.456 3.486 1.326 5.006L2 22l5.127-1.345a9.92 9.92 0 004.877 1.275c5.524 0 10.004-4.48 10.004-10.004C22.008 6.48 17.528 2 12.004 2zm5.736 13.918c-.244.69-1.21 1.258-1.666 1.31-.456.052-.942.072-2.736-.653-2.285-.927-3.766-3.254-3.879-3.407-.114-.153-.923-1.229-.923-2.344 0-1.116.58-1.663.788-1.892.208-.228.456-.285.61-.285.153 0 .307.002.44.008.136.006.319-.052.5-.052.183 0 .366.068.528.457.163.388.56 1.365.61 1.467.05.102.083.22.015.352-.068.133-.102.217-.203.336-.102.119-.214.266-.305.358-.102.102-.208.214-.09.417.119.203.528.87.1.13c1.13.996 2.08 1.305 2.375 1.452.296.147.468.119.57.003.102-.116.44-.51.558-.684.119-.174.238-.146.402-.086.163.06 1.036.488 1.213.577.178.089.296.133.34.208.044.075.044.437-.2.12z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="font-heading text-primary-light font-bold uppercase tracking-widest text-xs">Location & Hours</h4>
          <ul className="space-y-4 text-white/60 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-primary-light mt-0.5 flex-shrink-0" />
              <span>Schoeman Street, Pretoria Central</span>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-primary-light mt-0.5 flex-shrink-0" />
              <span>Mon - Sat: 09:00 - 17:00<br />Sun: Closed</span>
            </li>
            <li className="flex items-start gap-3">
              <Info className="w-4 h-4 text-primary-light mt-0.5 flex-shrink-0" />
              <span>Free Street Parking Available</span>
            </li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="font-heading text-primary-light font-bold uppercase tracking-widest text-xs">Payments & Service</h4>
          <ul className="space-y-4 text-white/60 text-sm">
            <li className="flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-primary-light flex-shrink-0" />
              <span>Debit Cards & NFC Accepted</span>
            </li>
            <li className="flex items-center gap-3">
              <Package className="w-4 h-4 text-primary-light flex-shrink-0" />
              <span>Dine-in | Takeaway | Delivery</span>
            </li>
          </ul>
        </div>

      </div>

      <div className="border-t border-white/5 pt-12 text-center text-white/30 text-xs">
        &copy; {new Date().getFullYear()} Danny M Restaurant. The Taste of Ubuntu. {t('footer.rights')}
      </div>
    </footer>
  );
};
