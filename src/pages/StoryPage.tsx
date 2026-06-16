import React, { useState, useEffect } from 'react';
import { Salad, Handshake, Flame, Heart } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export const StoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `Our Story | Danny M Restaurant`;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', "Discover the heritage of Danny M. Grounded in the spirit of Ubuntu: 'I am because we are.' Learn about our commitment to traditional cooking methods and hygiene.");
  }, []);

  const pillars = [
    {
      title: t('about.cleanTitle'),
      icon: Salad,
      badge: t('about.cleanBadge'),
      subtitle: t('about.cleanSubtitle'),
      text: t('about.cleanText'),
    },
    {
      title: t('about.ubuntuHeader'),
      icon: Handshake,
      badge: t('about.ubuntuBadge'),
      subtitle: t('about.ubuntuSubtitle'),
      text: t('about.ubuntuText'),
    },
    {
      title: t('about.tradTitle'),
      icon: Flame,
      badge: t('about.tradBadge'),
      subtitle: t('about.tradSubtitle'),
      text: t('about.tradText'),
    }
  ];

  return (
    <div className="pt-24 md:pt-32 bg-bg-dark animate-fade-in min-h-screen text-white/90 pb-20 relative">
      {/* Background glow elements */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/15 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <span className="text-primary-light font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
            <Heart className="w-4 h-4 text-primary" /> THE TASTE OF UBUNTU
          </span>
          <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-white tracking-tight">Our Heritage & Story</h1>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full mt-2" />
        </div>

        {/* Narrative Introduction Banner */}
        <div className="bg-bg-card rounded-[2.5rem] border border-white/5 p-8 md:p-12 mb-16 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 space-y-6">
              <span className="bg-primary/20 text-primary-light font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full border border-primary/20 inline-block">
                The Ubuntu Philosophy
              </span>
              <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-white leading-tight">
                &ldquo;Umuntu Ngumuntu Ngabantu&rdquo; &mdash; I Am Because We Are.
              </h2>
              <p className="text-white/70 leading-relaxed text-base md:text-lg font-light">
                At Danny M, our food is a vehicle for community, unity, and heritage. Every slow-cooked stew and flame-braised Mogodu we prepare respects the time-honored methods of our ancestors. We serve our Pretoria Central community with the same warmth and respect we show our own family.
              </p>
            </div>
            <div className="md:col-span-4 flex justify-center">
              <div className="w-32 h-32 rounded-full border-2 border-primary/20 bg-secondary/20 flex items-center justify-center p-3 animate-pulse-slow shadow-lg shadow-primary/10">
                <Handshake className="w-16 h-16 text-primary-light" />
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Values Pillar Showcase */}
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Left: Pillar Selectors */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-4 bg-bg-card p-4 rounded-2xl border border-white/5 shadow-xl">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-primary bg-secondary flex items-center justify-center p-0.5 flex-shrink-0">
                <img src="/logo.png" alt="Danny M Seal" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-[10px] uppercase text-primary-light font-black tracking-widest">{t('about.promiseSubtitle')}</span>
                <h4 className="font-bold text-white text-base">{t('about.promiseTitle')}</h4>
              </div>
            </div>

            {/* Vertically stacked selectors with hover/active transitions */}
            <div className="flex flex-col gap-3 bg-bg-card/40 p-3 rounded-3xl border border-white/5 shadow-inner">
              {pillars.map((pillar, idx) => {
                const PillarIcon = pillar.icon;
                const isActive = activeTab === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`flex items-center gap-4 py-5 px-6 rounded-2xl transition-all duration-300 cursor-pointer text-left border ${
                      isActive
                        ? 'bg-primary border-primary-light text-white shadow-xl shadow-primary/20 scale-[1.01]'
                        : 'bg-bg-card border-white/5 hover:bg-white/5 text-white/60 hover:text-white'
                    }`}
                  >
                    <PillarIcon className={`w-6 h-6 flex-shrink-0 ${isActive ? 'text-white' : 'text-primary-light'}`} />
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider block leading-tight">{pillar.title}</span>
                      <span className={`text-[10px] block mt-0.5 font-medium ${isActive ? 'text-white/80' : 'text-white/40'}`}>
                        {pillar.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Dynamic Pillar Description Card */}
          <div className="lg:col-span-7 bg-bg-card rounded-[2.5rem] p-8 md:p-12 border border-white/5 shadow-2xl relative min-h-[380px] overflow-hidden transition-all duration-500 flex flex-col justify-center">
            {/* Absolute element */}
            <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full blur-3xl opacity-10 bg-primary pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <span className="bg-primary/20 text-primary-light font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full border border-primary/20">
                  {pillars[activeTab].badge}
                </span>
                {(() => {
                  const PillarIcon = pillars[activeTab].icon;
                  return <PillarIcon className="w-12 h-12 text-primary-light" />;
                })()}
              </div>

              <h3 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
                {pillars[activeTab].subtitle}
              </h3>

              <div className="h-0.5 w-12 bg-primary/40 rounded-full" />

              <p className="text-white/70 leading-relaxed text-sm md:text-base font-light">
                {pillars[activeTab].text}
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
