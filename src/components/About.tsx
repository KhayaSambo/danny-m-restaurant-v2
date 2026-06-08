import React, { useState } from 'react';
import { Salad, Handshake, Flame, Sparkles } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export const About: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { t } = useTranslation();

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
    <section id="about" className="py-24 bg-bg-light border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">

        {/* Interactive Values Card */}
        <div className="flex flex-col space-y-6">
          <div className="flex items-center gap-4 bg-bg-card p-4 rounded-2xl border border-white/5 shadow-xl">
            <div className="w-14 h-14 rounded-full overflow-hidden border border-primary bg-secondary flex items-center justify-center p-1 flex-shrink-0">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-[10px] uppercase text-primary-light font-black tracking-widest">{t('about.promiseSubtitle')}</span>
              <h4 className="font-bold text-white text-base">{t('about.promiseTitle')}</h4>
            </div>
          </div>

          {/* Selector Buttons */}
          <div className="grid grid-cols-3 gap-2 bg-bg-dark p-2 rounded-2xl border border-white/5 shadow-inner">
            {pillars.map((pillar, idx) => {
              const PillarIcon = pillar.icon;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`flex flex-col items-center justify-center py-4 px-2 rounded-xl transition-all duration-300 cursor-pointer ${activeTab === idx
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02] font-extrabold'
                    : 'hover:bg-white/5 text-white/60 font-bold'
                    }`}
                >
                  <PillarIcon className="w-6 h-6 mb-1" />
                  <span className="text-[10px] text-center leading-tight font-black uppercase tracking-wider">{pillar.title}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Value Showcase Panel */}
          <div className="relative min-h-[220px] bg-bg-card rounded-3xl p-8 border border-white/5 shadow-2xl overflow-hidden transition-all duration-500">
            <div className="absolute -right-12 -bottom-12 w-44 h-44 rounded-full blur-3xl opacity-15 bg-primary pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="bg-primary/20 text-primary-light font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-primary/20">
                  {pillars[activeTab].badge}
                </span>
                {(() => {
                  const PillarIcon = pillars[activeTab].icon;
                  return <PillarIcon className="w-8 h-8 text-primary-light" />;
                })()}
              </div>

              <h3 className="text-xl md:text-2xl font-black text-white leading-tight">
                {pillars[activeTab].subtitle}
              </h3>

              <p className="text-white/70 leading-relaxed text-sm">
                {pillars[activeTab].text}
              </p>
            </div>
          </div>
        </div>

        {/* Explanatory Brand Text */}
        <div className="space-y-8">
          <div className="space-y-2">
            <span className="text-primary-light font-bold uppercase tracking-widest text-xs">{t('about.title')}</span>
            <h2 className="font-heading text-3xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">{t('about.header')}</h2>
          </div>
          <p className="text-base text-white/70 leading-relaxed">
            {t('about.desc1')}
          </p>
          <p className="text-base text-white/70 leading-relaxed">
            {t('about.desc2')}
          </p>
          <div className="bg-bg-card p-6 rounded-3xl border border-white/5 border-l-4 border-l-primary shadow-xl">
            <h3 className="text-lg font-black mb-3 flex items-center gap-3 text-white">
              <Sparkles className="w-5 h-5 text-primary-light" /> {t('about.ubuntuHeader')}
            </h3>
            <p className="text-white/80 italic text-sm leading-relaxed">
              {t('about.ubuntuText')}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
