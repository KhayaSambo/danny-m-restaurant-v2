import React, { useRef } from 'react';
import { useCartStore } from '../store/useCartStore';
import { useMenuStore } from '../store/useMenuStore';
import { useTranslation } from '../hooks/useTranslation';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { calculateDiscountedPrice, hasActiveSpecial } from '../utils/pricing';

export const PromotionsSection: React.FC = () => {
  const { t } = useTranslation();
  const categories = useMenuStore((state) => state.categories);
  const bundleDeals = useMenuStore((state) => state.bundleDeals);
  const loading = useMenuStore((state) => state.loading);
  const error = useMenuStore((state) => state.error);
  const loadMenu = useMenuStore((state) => state.loadMenu);
  const cart = useCartStore((state) => state.cart);
  const addClick = useCartStore((state) => state.addClick);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);

  const carouselRef = useRef<HTMLDivElement>(null);

  const allMenuItems = categories.flatMap(cat => cat.menuItems);

  // Get items with active specials OR marked as isSpecial
  const specialItems = allMenuItems.filter(item => hasActiveSpecial(item) || item.isSpecial);

  // Combine bundles and specials for display
  type DisplayPromo = {
    id: string;
    title: string;
    description: string;
    price: number;
    originalPrice?: number;
    badge: string;
    image: string;
    extraImages?: string[];
    isBundle: boolean;
    menuItem?: typeof allMenuItems[0];
    bundleItem?: typeof bundleDeals[0];
  };

  const displayItems: DisplayPromo[] = [
    ...bundleDeals.map(bundle => {
      const allImages = bundle.items?.map(i => i.menuItem?.image).filter(Boolean) || [];
      return {
        id: `bundle-${bundle.id}`,
        title: bundle.name,
        description: bundle.description || 'A great combo deal!',
        price: bundle.price,
        badge: 'Bundle Deal',
        image: allImages[0] || 'https://img.mrdfood.com/300x0/data/355b1dff-dc06-42e8-9add-02c2e9a04feb.jpeg',
        extraImages: allImages.slice(1) as string[],
        isBundle: true,
        bundleItem: bundle,
      };
    }),
    ...specialItems.map(item => {
      const hasSpecialOffer = hasActiveSpecial(item);
      return {
        id: `special-${item.id}`,
        title: item.name,
        description: item.description || item.specialOffers?.[0]?.name || 'Special Showcase!',
        price: hasSpecialOffer ? calculateDiscountedPrice(item) : item.price,
        originalPrice: hasSpecialOffer ? item.price : undefined,
        badge: item.isSpecial ? 'Chef Special' : 'Special Offer',
        image: item.image || 'https://img.mrdfood.com/300x0/data/2b699b02-c496-4142-a51b-bd9897e4964f.jpeg',
        extraImages: [],
        isBundle: false,
        menuItem: item,
      };
    })
  ];

  if (displayItems.length === 0) {
    return null; // Don't render if there are no active promotions
  }

  const cardStyles = [
    {
      bg: 'bg-gradient-to-br from-[#8E44AD] to-[#9B59B6]',
      border: 'border-[#8E44AD]',
      badgeText: 'text-white/90',
      imgBorder: 'border-[#8E44AD]',
    },
    {
      bg: 'bg-gradient-to-br from-[#2980B9] to-[#3498DB]',
      border: 'border-[#2980B9]',
      badgeText: 'text-white/90',
      imgBorder: 'border-[#2980B9]',
    },
    {
      bg: 'bg-gradient-to-br from-[#D35400] to-[#E67E22]',
      border: 'border-[#D35400]',
      badgeText: 'text-white/90',
      imgBorder: 'border-[#D35400]',
    },
    {
      bg: 'bg-gradient-to-br from-[#16A085] to-[#1ABC9C]',
      border: 'border-[#16A085]',
      badgeText: 'text-white/90',
      imgBorder: 'border-[#16A085]',
    }
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { scrollLeft } = carouselRef.current;
      const cardWidth = window.innerWidth < 400 ? 280 : (window.innerWidth < 640 ? 320 : 400);
      const gap = 48; // matching gap-12
      const scrollTo = direction === 'left'
        ? scrollLeft - (cardWidth + gap)
        : scrollLeft + (cardWidth + gap);
      carouselRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <section className="py-24 bg-bg-dark border-t border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-white/60 text-xs font-bold tracking-widest uppercase">Loading hot deals...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-24 bg-bg-dark border-t border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center py-16 bg-red-500/10 border border-red-500/20 rounded-3xl max-w-2xl mx-auto p-8 space-y-4">
            <AlertTriangle className="w-12 h-12 text-red-550 mx-auto" />
            <h3 className="font-heading text-lg font-bold text-white">Failed to Load Promotions</h3>
            <p className="text-white/60 text-sm">{error}</p>
            <button
              onClick={() => loadMenu()}
              className="px-6 py-2.5 bg-primary text-white rounded-full font-bold text-xs tracking-widest uppercase hover:bg-primary-light transition-all cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-bg-dark border-t border-white/5 relative overflow-hidden">
      {/* Left and Right Edge Fade Overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-12 md:w-32 bg-gradient-to-r from-bg-dark via-bg-dark/40 to-transparent pointer-events-none z-30" />
      <div className="absolute right-0 top-0 bottom-0 w-12 md:w-32 bg-gradient-to-l from-bg-dark via-bg-dark/40 to-transparent pointer-events-none z-30" />
      <div className="max-w-7xl mx-auto px-6 relative">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-3">
            <span className="text-primary-light font-bold uppercase tracking-widest text-xs">Hot Deals</span>
            <h2 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight text-white animate-pulse-slow">Promotions & Specials</h2>
            <div className="w-16 h-1 bg-primary rounded-full mt-2" />
          </div>

          {displayItems.length > 1 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => scroll('left')}
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 hover:border-primary-light/40 hover:bg-primary/25 flex items-center justify-center text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
                aria-label="Previous promotions"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 hover:border-primary-light/40 hover:bg-primary/25 flex items-center justify-center text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
                aria-label="Next promotions"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>
          )}
        </div>

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
                className={`relative flex-shrink-0 w-[280px] min-[400px]:w-[320px] sm:w-[400px] snap-center ${style.bg} rounded-[2.5rem] p-6 min-[400px]:p-8 min-h-[300px] flex flex-col justify-between overflow-visible shadow-2xl transition-transform duration-500 hover:-translate-y-2 group ${style.border}`}
              >
                <div className="max-w-[60%] z-10 flex flex-col justify-between h-full">
                  <span className={`text-[10px] font-black tracking-widest uppercase bg-white/20 px-2 py-1 rounded w-max ${style.badgeText}`}>{item.badge}</span>
                  <div>
                    <h3 className="font-heading text-lg sm:text-lg font-extrabold text-white leading-tight mt-4 uppercase break-words">{item.title}</h3>
                    <p className="text-white/80 text-xs mt-2 font-medium line-clamp-3">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-col gap-3">
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-black text-white/90">
                        R{item.price.toFixed(2)}
                      </span>
                      {item.originalPrice && (
                        <span className="text-sm font-bold text-white/50 line-through mb-1">
                          R{item.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="w-full">
                      {item.isBundle ? (
                        (() => {
                          const bundle = item.bundleItem!;
                          const qty = cart[`bundle-${bundle.id}`]?.quantity || 0;
                          return qty === 0 ? (
                            <button
                              onClick={() => addClick(bundle)}
                              className="px-5 py-2 bg-black/35 hover:bg-black/50 border border-white/10 rounded-full font-black text-[9px] tracking-widest uppercase transition-all text-white cursor-pointer"
                            >
                              {t('menu.addToPlate')}
                            </button>
                          ) : (
                            <div className="flex items-center justify-between w-28 bg-black/40 rounded-full p-0.5 border border-white/10">
                              <button
                                onClick={() => decrementItem(bundle)}
                                className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black text-white hover:bg-white/10 cursor-pointer"
                              >
                                −
                              </button>
                              <span className="text-xs font-black text-white">{qty}</span>
                              <button
                                onClick={() => incrementItem(bundle)}
                                className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black text-white hover:bg-white/10 cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          );
                        })()
                      ) : (
                        (() => {
                          const menuItem = item.menuItem!;
                          const qty = cart[menuItem.id]?.quantity || 0;
                          return qty === 0 ? (
                            <button
                              onClick={() => addClick(menuItem)}
                              className="px-5 py-2 bg-black/35 hover:bg-black/50 border border-white/10 rounded-full font-black text-[9px] tracking-widest uppercase transition-all text-white cursor-pointer"
                            >
                              {t('menu.addToPlate')}
                            </button>
                          ) : (
                            <div className="flex items-center justify-between w-28 bg-black/40 rounded-full p-0.5 border border-white/10">
                              <button
                                onClick={() => decrementItem(menuItem)}
                                className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black text-white hover:bg-white/10 cursor-pointer"
                              >
                                −
                              </button>
                              <span className="text-xs font-black text-white">{qty}</span>
                              <button
                                onClick={() => incrementItem(menuItem)}
                                className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black text-white hover:bg-white/10 cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          );
                        })()
                      )}
                    </div>
                  </div>
                </div>

                <div className="absolute top-1/2 -translate-y-1/2 -right-4 min-[400px]:-right-6 sm:-right-8 z-20 flex items-center justify-center">
                  <div className={`relative w-32 h-32 min-[400px]:w-40 min-[400px]:h-40 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full overflow-hidden border-4 ${style.imgBorder} shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-105 group-hover:rotate-12 bg-bg-card`}>
                    <img
                      src={item.image}
                      alt={`${item.title} plate`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {item.extraImages && item.extraImages.map((extraImg, idx) => {
                    const positions = [
                      "-bottom-3 -left-3 min-[400px]:-bottom-4 min-[400px]:-left-4",
                      "-top-3 -left-3 min-[400px]:-top-4 min-[400px]:-left-4",
                      "-bottom-3 right-6 min-[400px]:-bottom-4 min-[400px]:right-8",
                    ];
                    const pos = positions[idx % positions.length];
                    return (
                      <div key={idx} className={`absolute ${pos} w-12 h-12 min-[400px]:w-14 min-[400px]:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-4 ${style.imgBorder} shadow-[0_8px_20px_rgba(0,0,0,0.4)] transition-transform duration-500 group-hover:scale-110 z-30 bg-bg-card`}>
                        <img src={extraImg} alt="Bundle extra item" className="w-full h-full object-cover" />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
