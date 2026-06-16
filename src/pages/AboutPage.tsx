import React, { useEffect } from 'react';
import { MapPin, Clock, ShieldCheck, Sparkles, ChefHat } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export const AboutPage: React.FC = () => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `About Us | Danny M Restaurant`;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', "Rooted in tradition and served with care. Learn about Danny M's history, values, and location in Pretoria Central.");
  }, []);

  return (
    <div className="pt-24 md:pt-32 bg-bg-dark animate-fade-in min-h-screen text-white/90 pb-20 relative">
      {/* Glow effect */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Page Title Header */}
        <div className="text-center mb-16 space-y-4">
          <span className="text-primary-light font-bold uppercase tracking-widest text-xs">{t('about.promiseSubtitle')}</span>
          <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-white tracking-tight">{t('about.title')}</h1>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full mt-2" />
        </div>

        {/* Grid Section */}
        <div className="grid lg:grid-cols-12 gap-12 items-center mb-20">
          {/* Visual Brand Image Frame */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative group w-full max-w-sm md:max-w-md">
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-primary to-accent blur-2xl opacity-25 group-hover:opacity-40 transition-all duration-700 scale-105" />
              
              {/* Image Frame */}
              <div className="relative aspect-square rounded-[2.5rem] overflow-hidden border-4 border-white/5 bg-[#151211] p-1 flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <img 
                  src="/logo.png" 
                  alt="Danny M circular brand logo representing heritage" 
                  className="w-full h-full object-contain p-8 transition-transform duration-700 group-hover:scale-105" 
                />
              </div>
            </div>
          </div>

          {/* Core Story Content */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <span className="text-primary-light font-black uppercase tracking-wider text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-light" />
                ESTABLISHED IN PRETORIA CENTRAL
              </span>
              <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-white leading-tight">
                {t('about.header')}
              </h2>
            </div>
            
            <p className="text-base md:text-lg text-white/70 leading-relaxed font-light">
              {t('about.desc1')}
            </p>
            
            <p className="text-base md:text-lg text-white/70 leading-relaxed font-light">
              {t('about.desc2')}
            </p>

            <div className="bg-bg-card p-6 rounded-3xl border border-white/5 border-l-4 border-l-primary shadow-xl">
              <h3 className="text-lg font-black mb-3 flex items-center gap-3 text-white">
                <ChefHat className="w-5 h-5 text-primary-light" /> Our Standard of Excellence
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">
                We believe in serving food of excellent standard—using the freshest local ingredients to ensure every bite is as healthy as it is delicious. Cleanliness, purity, and absolute hygiene are at the heart of our kitchen rules.
              </p>
            </div>
          </div>
        </div>

        {/* Location & Hours Informational Blocks */}
        <div className="grid md:grid-cols-3 gap-8 pt-8 border-t border-white/5">
          <div className="bg-bg-card p-8 rounded-3xl border border-white/5 flex flex-col items-center text-center space-y-4 hover:border-primary/20 transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <MapPin className="w-6 h-6 text-primary-light" />
            </div>
            <h3 className="text-lg font-bold text-white">Find Us</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Schoeman Street,<br />Pretoria Central, South Africa
            </p>
            <span className="text-xs text-primary-light font-bold">Free street parking available</span>
          </div>

          <div className="bg-bg-card p-8 rounded-3xl border border-white/5 flex flex-col items-center text-center space-y-4 hover:border-primary/20 transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Clock className="w-6 h-6 text-primary-light" />
            </div>
            <h3 className="text-lg font-bold text-white">Hours</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Monday - Saturday: 09:00 - 17:00<br />Sunday: Closed
            </p>
            <span className="text-xs text-primary-light font-bold">Dine-in | Takeaway | Delivery</span>
          </div>

          <div className="bg-bg-card p-8 rounded-3xl border border-white/5 flex flex-col items-center text-center space-y-4 hover:border-primary/20 transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="w-6 h-6 text-primary-light" />
            </div>
            <h3 className="text-lg font-bold text-white">Our Assurance</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Fully compliant with local hygiene regulations. Our staff is fully trained in safety & sanitization.
            </p>
            <span className="text-xs text-primary-light font-bold">100% Quality Guaranteed</span>
          </div>
        </div>
      </div>
    </div>
  );
};
