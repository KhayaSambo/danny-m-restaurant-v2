import React, { useRef } from 'react';
import { useCartStore } from '../store/useCartStore';
import { useMenuStore } from '../store/useMenuStore';
import { useTranslation } from '../hooks/useTranslation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { calculateDiscountedPrice, hasActiveSpecial } from '../utils/pricing';

export const PromotionsSection: React.FC = () => {
  const { t } = useTranslation();
  const categories = useMenuStore((state) => state.categories);
  const bundleDeals = useMenuStore((state) => state.bundleDeals);
  const cart = useCartStore((state) => state.cart);
  const addClick = useCartStore((state) => state.addClick);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);

  const carouselRef = useRef<HTMLDivElement>(null);

  const allMenuItems = categories.flatMap(cat => cat.menuItems);

  // Get items with active specials
  const specialItems = allMenuItems.filter(item => hasActiveSpecial(item));

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
      };
    }),
    ...specialItems.map(item => ({
      id: `special-${item.id}`,
      title: item.name,
      description: item.description || item.specialOffers?.[0]?.name || 'Special Offer!',
      price: calculateDiscountedPrice(item),
      originalPrice: item.price,
      badge: 'Special Offer',
      image: item.image || 'https://img.mrdfood.com/300x0/data/2b699b02-c496-4142-a51b-bd9897e4964f.jpeg',
      extraImages: [],
      isBundle: false,
      menuItem: item,
    }))
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
                className={`relative flex-shrink-0 w-[320px] sm:w-[400px] snap-center ${style.bg} rounded-[2.5rem] p-8 min-h-[300px] flex flex-col justify-between overflow-visible shadow-2xl transition-transform duration-500 hover:-translate-y-2 group ${style.border}`}
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
                      {!item.isBundle && item.menuItem ? (
                        (cart[item.menuItem.id]?.quantity || 0) === 0 ? (
                          <button
                            onClick={() => addClick(item.menuItem!)}
                            className="px-5 py-2 bg-black/35 hover:bg-black/50 border border-white/10 rounded-full font-black text-[9px] tracking-widest uppercase transition-all text-white cursor-pointer"
                          >
                            {t('menu.addToPlate')}
                          </button>
                        ) : (
                          <div className="flex items-center justify-between w-28 bg-black/40 rounded-full p-0.5 border border-white/10">
                            <button
                              onClick={() => decrementItem(item.menuItem!)}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black text-white hover:bg-white/10 cursor-pointer"
                            >
                              −
                            </button>
                            <span className="text-xs font-black text-white">{cart[item.menuItem.id].quantity}</span>
                            <button
                              onClick={() => incrementItem(item.menuItem!)}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black text-white hover:bg-white/10 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        )
                      ) : (
                        <div className="text-[10px] font-bold text-white/70 uppercase tracking-widest">
                          Bundle Deal Active
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="absolute top-1/2 -translate-y-1/2 -right-8 z-20 flex items-center justify-center">
                  <div className={`relative w-44 h-44 md:w-48 md:h-48 rounded-full overflow-hidden border-4 ${style.imgBorder} shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-105 group-hover:rotate-12 bg-bg-card`}>
                    <img
                      src={item.image}
                      alt={`${item.title} plate`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {item.extraImages && item.extraImages.map((extraImg, idx) => {
                    const positions = [
                      "-bottom-4 -left-4",
                      "-top-4 -left-4",
                      "-bottom-4 right-8",
                    ];
                    const pos = positions[idx % positions.length];
                    return (
                      <div key={idx} className={`absolute ${pos} w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-4 ${style.imgBorder} shadow-[0_8px_20px_rgba(0,0,0,0.4)] transition-transform duration-500 group-hover:scale-110 z-30 bg-bg-card`}>
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
