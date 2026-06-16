import React, { useState, useEffect } from 'react';
import { Salad, Home, CreditCard, Wine } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const carouselImages = [
  '/images/Hardbody-Chicken-Meal-transparent.png',
  '/images/Hardbody-Chicken-Only-transparent.png',
  '/images/Cow-Heels-Meal-transparent.png',
  '/images/Braai-Meat-Meal-transparent.png',
  '/images/Beef-Stew-Only_transparent.png',
  '/images/beef meal background removed.png',
  '/images/Wors-Stew-Meal-transparent.png'
];

export const Hero: React.FC = () => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Preload carousel images to prevent layout flash or blanks
  useEffect(() => {
    let loadedCount = 0;
    carouselImages.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === carouselImages.length) {
          setIsLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === carouselImages.length) {
          setIsLoaded(true);
        }
      };
    });
  }, []);

  // Slide cycle transition every 4.5 seconds
  useEffect(() => {
    if (!isLoaded) return;
    const interval = setInterval(() => {
      setPrevIndex(currentIndex);
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isLoaded, currentIndex]);

  const getSlideClassName = (index: number) => {
    if (index === currentIndex) return 'dish-slide active';
    if (index === prevIndex) return 'dish-slide outgoing';
    return 'dish-slide';
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-bg-dark">
      {/* Glow Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(211,84,0,0.18)_0%,rgba(0,0,0,0)_70%)] z-0 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* Fine geometric grids evoking wood-grill wireframes */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:30px_30px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col items-center justify-center text-center space-y-10 mt-16">

        {/* Centered Large Branding Behind Elements */}
        <div className="absolute select-none pointer-events-none font-heading font-extrabold text-[12vw] tracking-wider text-primary/[0.04] uppercase z-0 leading-none">
          DANNY M
        </div>

        {/* Hero Content Grid with Centered Carousel / Logo Plate */}
        <div className="relative flex flex-col items-center justify-center z-10 py-12">
          {/* Centered Glowing Medallion */}
          <div className="relative flex flex-col items-center">
            <div className="relative group cursor-pointer">
              {/* Intense Ember Glow behind Logo / Carousel */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-accent blur-3xl opacity-40 group-hover:opacity-85 transition-all duration-700 scale-110 animate-pulse-slow" />
              <div className="absolute -inset-4 rounded-full border border-white/5 animate-pulse" />

              {/* Dish Carousel or Logo Medallion (while loading) */}
              {!isLoaded ? (
                <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-primary-light/50 bg-[#151211] p-1 flex items-center justify-center transition-transform duration-500 group-hover:scale-105 shadow-[0_0_60px_rgba(211,84,0,0.3)]">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                  <img src="/logo.png" alt="Danny M Restaurant circular Logo" className="w-full h-full object-contain p-4 relative z-20" />
                </div>
              ) : (
                <div className="dish-carousel-container transition-all duration-500 hover:scale-105">
                  {carouselImages.map((src, index) => (
                    <img
                      key={src}
                      src={src}
                      alt={`Danny M Premium Dish ${index + 1}`}
                      className={getSlideClassName(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hero Description */}
        <div className="space-y-6 max-w-3xl z-10">
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none text-white">
            {t('hero.title')}
          </h1>

          <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            {t('hero.description')}
          </p>

          <div className="pt-4 flex justify-center">
            <a href="#menu" className="inline-block bg-primary hover:bg-primary-light text-white px-10 py-4 rounded-full font-bold text-sm transition-all transform hover:-translate-y-0.5 shadow-xl shadow-primary/20 hover:shadow-primary/40 border border-primary-light/20 tracking-wider uppercase flex items-center gap-2">
              {t('menu.fullMenuTitle')}
            </a>
          </div>
        </div>

        {/* Core Highlights Panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl pt-6">
          <div className="bg-[#151211] border border-white/5 rounded-2xl p-4 hover:border-primary/20 transition-all text-center flex flex-col items-center justify-center">
            <Wine className="w-6 h-6 text-primary-light mb-1" />
            <span className="text-[10px] uppercase text-white/40 tracking-wider font-bold">{t('nav.story')}</span>
            <span className="text-xs font-semibold block text-white/95 mt-1">{t('about.ubuntuHeader')}</span>
          </div>
          <div className="bg-[#151211] border border-white/5 rounded-2xl p-4 hover:border-primary/20 transition-all text-center flex flex-col items-center justify-center">
            <Salad className="w-6 h-6 text-primary-light mb-1" />
            <span className="text-[10px] uppercase text-white/40 tracking-wider font-bold">{t('about.cleanSubtitle')}</span>
            <span className="text-xs font-semibold block text-white/95 mt-1">{t('about.cleanBadge')}</span>
          </div>
          <div className="bg-[#151211] border border-white/5 rounded-2xl p-4 hover:border-primary/20 transition-all text-center flex flex-col items-center justify-center">
            <CreditCard className="w-6 h-6 text-primary-light mb-1" />
            <span className="text-[10px] uppercase text-white/40 tracking-wider font-bold">{t('cart.placeOrder')}</span>
            <span className="text-xs font-semibold block text-white/95 mt-1">Cards & Pay</span>
          </div>
          <div className="bg-[#151211] border border-white/5 rounded-2xl p-4 hover:border-primary/20 transition-all text-center flex flex-col items-center justify-center">
            <Home className="w-6 h-6 text-primary-light mb-1" />
            <span className="text-[10px] uppercase text-white/40 tracking-wider font-bold">{t('footer.hours')}</span>
            <span className="text-xs font-semibold block text-white/95 mt-1">9am - 5pm</span>
          </div>
        </div>

      </div>
    </section>
  );
};
