import React from 'react';
import { UtensilsCrossed, AlertTriangle } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useMenuStore } from '../store/useMenuStore';
import { useTranslation } from '../hooks/useTranslation';
import { calculateDiscountedPrice, hasActiveSpecial } from '../utils/pricing';

export const MenuSection: React.FC = () => {
  const { t } = useTranslation();
  const cart = useCartStore((state) => state.cart);
  const addClick = useCartStore((state) => state.addClick);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);

  const categories = useMenuStore((state) => state.categories);
  const loading = useMenuStore((state) => state.loading);
  const error = useMenuStore((state) => state.error);
  const selectedCategoryId = useMenuStore((state) => state.selectedCategoryId);
  const setSelectedCategoryId = useMenuStore((state) => state.setSelectedCategoryId);
  const getDisplayedMenuItems = useMenuStore((state) => state.getDisplayedMenuItems);

  const displayedMenuItems = getDisplayedMenuItems();

  return (
    <section id="menu" className="py-24 bg-bg-dark border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header & Category Selection Pills */}
        <div className="flex flex-col items-center text-center mb-16 space-y-6">
          <div className="space-y-3">
            <span className="text-primary-light font-bold uppercase tracking-widest text-xs">{t('menu.fullMenuSubtitle')}</span>
            <h2 className="font-heading text-3xl md:text-5xl font-extrabold text-white tracking-tight">{t('menu.title')}</h2>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full mt-2" />
          </div>

          {/* Dynamic Category Filter Selection Pills */}
          <div className="flex flex-wrap justify-center gap-2 p-1 bg-bg-card border border-white/5 rounded-full shadow-inner max-w-4xl mx-auto overflow-hidden">
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={`px-5 py-2.5 rounded-full font-black text-[10px] tracking-widest uppercase transition-all cursor-pointer ${selectedCategoryId === 'all'
                ? 'bg-primary text-white shadow-md'
                : 'text-white/60 hover:text-white'
                }`}
            >
              ● {t('nav.home') === 'Home' ? 'SHOW ALL' : 'ALL'}
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategoryId(category.id)}
                className={`px-5 py-2.5 rounded-full font-black text-[10px] tracking-widest uppercase transition-all cursor-pointer flex items-center justify-center gap-2 ${selectedCategoryId === category.id
                  ? 'bg-primary text-white shadow-md'
                  : 'text-white/60 hover:text-white'
                  }`}
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Loaders / Errors states for menu grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-white/60 text-xs font-bold tracking-widest uppercase">Loading traditional flavours...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-red-500/10 border border-red-500/20 rounded-3xl max-w-2xl mx-auto p-8 space-y-4">
            <AlertTriangle className="w-12 h-12 text-red-550 mx-auto" />
            <h3 className="font-heading text-lg font-bold text-white">Failed to Load Menu</h3>
            <p className="text-white/60 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-primary text-white rounded-full font-bold text-xs tracking-widest uppercase hover:bg-primary-light transition-all cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : displayedMenuItems.length === 0 ? (
          <div className="text-center py-20 text-white/50 text-sm">
            No items currently available in this category. Check back later!
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayedMenuItems.map((item) => {
              const qty = cart[item.id]?.quantity || 0;
              const isSoldOut = !item.isAvailable || item.stock <= 0;

              return (
                <div key={item.id} className="group bg-bg-card rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl transition-all duration-500 hover:border-primary/20 transform hover:-translate-y-1.5 flex flex-col justify-between">
                  <div>
                    {/* Perfect Circular Plate Framed container */}
                    {item.image && item.image !== 'null' && item.image !== '' ? (
                      <div className="h-64 overflow-hidden relative p-6 flex items-center justify-center">
                        <div className="w-48 h-48 rounded-full overflow-hidden border-2 border-white/5 shadow-[0_12px_30px_rgba(0,0,0,0.6)] relative z-10 transition-transform duration-700 group-hover:scale-105 group-hover:rotate-6 bg-bg-dark">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute top-4 right-4 bg-primary text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg border border-primary-light/10 flex flex-col items-end">
                          {hasActiveSpecial(item) ? (
                            <>
                              <span className="text-[9px] line-through text-white/70">R {item.price.toFixed(2)}</span>
                              <span>R {calculateDiscountedPrice(item).toFixed(2)}</span>
                            </>
                          ) : (
                            <span>R {item.price.toFixed(2)}</span>
                          )}
                        </div>

                        {/* Sold out indicators */}
                        {isSoldOut && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-20">
                            <span className="bg-red-600 text-white font-black text-[9px] tracking-widest uppercase px-4 py-2 rounded-full border border-red-500 shadow-xl">
                              {t('menu.outOfStock')}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-6 pt-12 relative flex flex-col items-center">
                        <div className="absolute top-4 right-4 bg-primary text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg border border-primary-light/10 flex flex-col items-end">
                          {hasActiveSpecial(item) ? (
                            <>
                              <span className="text-[9px] line-through text-white/70">R {item.price.toFixed(2)}</span>
                              <span>R {calculateDiscountedPrice(item).toFixed(2)}</span>
                            </>
                          ) : (
                            <span>R {item.price.toFixed(2)}</span>
                          )}
                        </div>

                        {/* Sold out indicator for no-image cards */}
                        {isSoldOut && (
                          <span className="bg-red-600 text-white font-black text-[9px] tracking-widest uppercase px-4 py-2 rounded-full border border-red-500 shadow-xl mb-2">
                            {t('menu.outOfStock')}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="px-6 pb-2 space-y-2 text-center">
                      <h3 className="font-heading text-lg font-bold text-white group-hover:text-primary-light transition-colors uppercase tracking-tight line-clamp-1">{item.name}</h3>
                      <p className="text-white/50 text-xs leading-relaxed line-clamp-3 px-2">
                        {item.description || "Freshly cooked traditional South African delight prepared with clean ingredients."}
                      </p>
                    </div>
                  </div>

                  {/* Interactive Button / Quantity Selector footer */}
                  <div className="p-6 pt-4">
                    {isSoldOut ? (
                      <button
                        disabled
                        className="w-full py-3 bg-white/5 border border-white/5 text-white/30 rounded-full font-black text-[10px] tracking-widest uppercase cursor-not-allowed"
                      >
                        {t('menu.outOfStock')}
                      </button>
                    ) : qty === 0 ? (
                      <button
                        onClick={() => addClick(item)}
                        className="w-full py-3 bg-white/5 border border-white/10 rounded-full font-black text-[10px] tracking-widest uppercase hover:bg-primary hover:border-primary-light hover:text-white transition-all text-white/80 cursor-pointer"
                      >
                        {t('menu.addToPlate')}
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-primary rounded-full p-0.5 border border-primary-light/35 shadow-md">
                        <button
                          onClick={() => decrementItem(item)}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-black text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
                        >
                          −
                        </button>
                        <span className="text-sm font-black text-white">{qty}</span>
                        <button
                          onClick={() => incrementItem(item)}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-black text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
