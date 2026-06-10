import React, { useState } from 'react';
import { X, ShieldCheck, Eye, Trash2, Edit, Mail, FileText, CheckCircle2 } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    const closeMs = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--modal-close-dur")
    ) || 150;
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, closeMs);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-300 ${!isClosing ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
    >
      {/* Modal Container */}
      <div
        className={`w-full max-w-2xl bg-bg-card border border-white/10 p-6 md:p-8 rounded-[2rem] shadow-[0_0_80px_rgba(0,0,0,0.95)] relative flex flex-col justify-between max-h-[85vh] t-modal ${!isClosing ? 'is-open' : 'is-closing'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer border border-white/5"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-4 flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-primary-light">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-extrabold text-white tracking-tight uppercase">Privacy Policy & POPIA</h2>
            <span className="text-[10px] uppercase tracking-widest font-black text-primary-light">Danny M Compliance Registry</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2 text-white/70 text-xs md:text-sm leading-relaxed scrollbar-thin">
          
          <div className="bg-[#1c1513] border border-primary/20 rounded-2xl p-4 mb-4">
            <h3 className="font-heading font-bold text-white text-xs md:text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary-light flex-shrink-0" />
              POPIA Compliance Summary
            </h3>
            <p className="text-[11px] text-white/80 leading-relaxed">
              Danny M Restaurant processes personal information in strict accordance with the South African **Protection of Personal Information Act (POPIA), Act No. 4 of 2013**. We respect your rights to privacy and transparent processing of your details.
            </p>
          </div>

          <section className="space-y-2">
            <h3 className="font-heading font-bold text-white text-xs md:text-sm uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-primary-light" />
              1. Responsible Party
            </h3>
            <p>
              Danny M Restaurant, located at **Schoeman Street, Pretoria Central**, is the Responsible Party under POPIA. We determine the purpose and means for processing your personal information when you order online, register an account, or browse our website.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-heading font-bold text-white text-xs md:text-sm uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-primary-light" />
              2. What Information We Collect & Why
            </h3>
            <p>
              We only collect information necessary to fulfill our service contract (orders) and maintain account security:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-white/60 text-[11px] md:text-xs">
              <li><strong>Contact details:</strong> Name, email address, phone number (used to coordinate deliveries, send pickup alerts, and confirm payments).</li>
              <li><strong>Delivery Information:</strong> Physical delivery address (used strictly for order dispatch).</li>
              <li><strong>Transaction Data:</strong> Ordered meals, customized options, payment confirmations (processed securely via our payment gateway partner, Yoco).</li>
              <li><strong>Electronic Identifiers:</strong> Language preference and cookie flags (necessary to remember user preferences).</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-heading font-bold text-white text-xs md:text-sm uppercase tracking-wider flex items-center gap-1.5">
              <Edit className="w-4 h-4 text-primary-light" />
              3. Processing and Direct Marketing Consent
            </h3>
            <p>
              By ordering from our menu or signing up, you consent to the processing of your details for order fulfillment. 
              Under **POPIA Section 69**, direct electronic marketing (newsletters, promo alerts) requires your explicit, optional **opt-in consent**. You can choose to opt into marketing during account creation or checkout, and you may withdraw this consent at any time.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-heading font-bold text-white text-xs md:text-sm uppercase tracking-wider flex items-center gap-1.5">
              <Trash2 className="w-4 h-4 text-primary-light" />
              4. Data Subject Rights (Section 24)
            </h3>
            <p>
              Under POPIA, you have the following legally protected rights regarding your personal information:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-white/60 text-[11px] md:text-xs">
              <li><strong>Right of Access:</strong> Request details of the personal information we hold about you.</li>
              <li><strong>Right to Correction:</strong> Request update or correction of inaccurate details via your profile.</li>
              <li><strong>Right to Deletion:</strong> Request erasure of details. You can erase local caching and sign out instantly from your Profile page, and contact our Information Officer to request complete server-side order database purge.</li>
              <li><strong>Right to Object:</strong> Object to processing for direct marketing.</li>
            </ul>
          </section>

          <section className="space-y-2 border-t border-white/5 pt-4">
            <h3 className="font-heading font-bold text-white text-xs md:text-sm uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-primary-light" />
              5. Information Officer Contact Details
            </h3>
            <p>
              For inquiries, withdrawal of marketing consent, or requests to exercise data rights under POPIA, please contact our designated Information Officer:
            </p>
            <div className="bg-[#151211] border border-white/5 rounded-xl p-3 text-[11px] md:text-xs font-mono space-y-1">
              <div><strong>Name:</strong> Danny M Information Officer</div>
              <div><strong>Email:</strong> <a href="mailto:info@dannym.co.za" className="text-primary-light hover:underline">info@dannym.co.za</a></div>
              <div><strong>Address:</strong> Schoeman Street, Pretoria Central, 0002</div>
            </div>
            <p className="text-[10px] text-white/40 italic mt-2">
              If you feel we have not processed your details lawfully, you have the right to lodge a complaint with the Information Regulator of South Africa (inforegulator.org.za).
            </p>
          </section>
        </div>

        {/* Footer Action */}
        <div className="mt-6 border-t border-white/5 pt-4 flex justify-end flex-shrink-0">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 bg-primary hover:bg-primary-light text-white font-bold rounded-full text-xs tracking-widest uppercase transition-all shadow-md shadow-primary/20 hover:scale-105 active:scale-95 cursor-pointer border border-primary-light/20"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
