import React, { useRef } from 'react';
import { useCartStore } from '../store/useCartStore';
import { useMenuStore } from '../store/useMenuStore';
import { useTranslation } from '../hooks/useTranslation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const SignatureSpecials: React.FC = () => {
  const { t } = useTranslation();
  const categories = useMenuStore((state) => state.categories);
  const cart = useCartStore((state) => state.cart);
  const addClick = useCartStore((state) => state.addClick);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  
  const carouselRef = useRef<HTMLDivElement>(null);

  const allMenuItems = categories.flatMap(cat => cat.menuItems);

  // Filter for items explicitly marked as chef recommended
  const chefRecommendedItems = allMenuItems.filter(item => item.isChefRecommend && item.isAvailable);

  // Fallbacks if fewer than 3 items are marked
  let displayItems = [...chefRecommendedItems];
  if (displayItems.length < 3) {
    const findItemByName = (substring: string) => {
      return allMenuItems.find(item => item.name.toLowerCase().includes(substring.toLowerCase()));
    };

    const fallbackItems = [
      findItemByName("Braai Meat") || findItemByName("Steak Only"),
      findItemByName("Mogodu") || findItemByName("Tripe"),
      findItemByName("Beef Stew") || findItemByName("Cow Heels")
    ].filter((item): item is typeof allMenuItems[0] => !!item);

    if (displayItems.length === 0) {
      displayItems = fallbackItems;
    } else {
      // Merge unique items up to 3
      for (const fallback of fallbackItems) {
        if (displayItems.length >= 3) break;
        if (!displayItems.some(item => item.id === fallback.id)) {
          displayItems.push(fallback);
        }
      }
    }
  }

  // Cap at 5 items max
  displayItems = displayItems.slice(0, 5);

  // Curated premium palettes for up to 5 items
  const cardStyles = [
    {
      bg: 'bg-[#E67E22]',
      border: 'border-[#E67E22]',
      badgeText: 'text-white/70',
      badge: t('menu.votedBest') || 'Voted Best',
      imgBorder: 'border-[#E67E22]',
      fallbackImage: 'https://img.mrdfood.com/300x0/data/2b699b02-c496-4142-a51b-bd9897e4964f.jpeg'
    },
    {
      bg: 'bg-[#D35400]',
      border: 'border-[#D35400]',
      badgeText: 'text-white/70',
      badge: t('menu.slowBraised') || 'Slow Braised',
      imgBorder: 'border-[#D35400]',
      fallbackImage: 'https://img.mrdfood.com/300x0/data/355b1dff-dc06-42e8-9add-02c2e9a04feb.jpeg'
    },
    {
      bg: 'bg-[#2C2421]',
      border: 'border-[#2C2421] border-white/5',
      badgeText: 'text-white/50',
      badge: t('menu.classicSimmer') || 'Classic Simmer',
      imgBorder: 'border-[#2C2421]',
      fallbackImage: 'https://img.mrdfood.com/300x0/data/1d0a3d6e-093c-4638-98da-b78679aa6784.jpeg'
    },
    {
      bg: 'bg-[#C0392B]',
      border: 'border-[#C0392B]',
      badgeText: 'text-white/70',
      badge: 'Chef Special',
      imgBorder: 'border-[#C0392B]',
      fallbackImage: 'https://img.mrdfood.com/300x0/data/2b699b02-c496-4142-a51b-bd9897e4964f.jpeg'
    },
    {
      bg: 'bg-[#16A085]',
      border: 'border-[#16A085]',
      badgeText: 'text-white/70',
      badge: 'Heritage Recipe',
      imgBorder: 'border-[#16A085]',
      fallbackImage: 'https://img.mrdfood.com/300x0/data/355b1dff-dc06-42e8-9add-02c2e9a04feb.jpeg'
    }
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { scrollLeft } = carouselRef.current;
      const cardWidth = window.innerWidth < 640 ? 320 : 400;
      const gap = 48; // matching gap-12
      const scrollTo = direction === 'left'
        ? scrollLeft - (cardWidth + gap)
        : scrollLeft + (cardWidth + gap);
      carouselRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-24 bg-bg-dark border-t border-white/5 overflow-visible">
      <div className="max-w-7xl mx-auto px-6 relative">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-3">
            <span className="text-primary-light font-bold uppercase tracking-widest text-xs">{t('menu.chefRecommends')}</span>
            <h2 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight text-white animate-pulse-slow">{t('menu.title')}</h2>
            <div className="w-16 h-1 bg-primary rounded-full mt-2" />
          </div>

          {/* Carousel Navigation Arrows */}
          {displayItems.length > 1 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => scroll('left')}
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 hover:border-primary-light/40 hover:bg-primary/25 flex items-center justify-center text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
                aria-label="Previous specials"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 hover:border-primary-light/40 hover:bg-primary/25 flex items-center justify-center text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
                aria-label="Next specials"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>
          )}
        </div>

        {/* Carousel Slider Wrapper */}
        <div
          ref={carouselRef}
          className="flex gap-12 overflow-x-auto scroll-smooth py-6 px-4 -mx-4 snap-x snap-mandatory no-scrollbar"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {displayItems.map((item, index) => {
            const style = cardStyles[index % cardStyles.length];
            return (
              <div
                key={item.id}
                className={`relative flex-shrink-0 w-[320px] sm:w-[400px] snap-center ${style.bg} rounded-[2.5rem] p-8 min-h-[300px] flex flex-col justify-between overflow-visible shadow-2xl transition-transform duration-500 hover:-translate-y-2 group ${style.border}`}
              >
                <div className="max-w-[60%] z-10 flex flex-col justify-between h-full">
                  <span className={`text-[9px] font-black tracking-widest uppercase ${style.badgeText}`}>{style.badge}</span>
                  <div>
                    <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-white leading-tight mt-4 uppercase break-words">{item.name}</h3>
                    <p className="text-white/80 text-xs mt-2 font-medium line-clamp-3">
                      {item.description || "Freshly prepared traditional meal crafted with care."}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-col gap-3">
                    <span className="text-2xl font-black text-white/90">
                      R{item.price.toFixed(2)}
                    </span>

                    <div className="w-full">
                      {(cart[item.id]?.quantity || 0) === 0 ? (
                        <button
                          onClick={() => addClick(item)}
                          className="px-5 py-2 bg-black/35 hover:bg-black/50 border border-white/10 rounded-full font-black text-[9px] tracking-widest uppercase transition-all text-white cursor-pointer"
                        >
                          {t('menu.addToPlate')}
                        </button>
                      ) : (
                        <div className="flex items-center justify-between w-28 bg-black/40 rounded-full p-0.5 border border-white/10">
                          <button
                            onClick={() => decrementItem(item)}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black text-white hover:bg-white/10 cursor-pointer"
                          >
                            −
                          </button>
                          <span className="text-xs font-black text-white">{cart[item.id].quantity}</span>
                          <button
                            onClick={() => incrementItem(item)}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black text-white hover:bg-white/10 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`absolute top-1/2 -translate-y-1/2 -right-8 w-44 h-44 md:w-48 md:h-48 rounded-full overflow-hidden border-4 ${style.imgBorder} shadow-[0_15px_40px_rgba(0,0,0,0.5)] z-20 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-12 bg-bg-card`}>
                  <img
                    src={item.image || style.fallbackImage}
                    alt={`${item.name} plate`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
