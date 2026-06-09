import React, { useState } from 'react';
import { ChefHat, Check, Flame, ZoomIn } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { safeJsonParse, parseExtraPrice } from '../utils/helpers';
import { calculateDiscountedPrice, hasActiveSpecial } from '../utils/pricing';
import type { MenuItem } from '../types';

export const CustomizerModal: React.FC = () => {
  const activeCustomizerItem = useCartStore((state) => state.activeCustomizerItem);
  const isCustomizerClosing = useCartStore((state) => state.isCustomizerClosing);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const customStarch = useCartStore((state) => state.customStarch);
  const customSalad = useCartStore((state) => state.customSalad);
  const customVeggie = useCartStore((state) => state.customVeggie);
  const customExtras = useCartStore((state) => state.customExtras);
  const customBeverages = useCartStore((state) => state.customBeverages);

  const setActiveCustomizerItem = useCartStore((state) => state.setActiveCustomizerItem);
  const setIsCustomizerClosing = useCartStore((state) => state.setIsCustomizerClosing);
  const setCustomStarch = useCartStore((state) => state.setCustomStarch);
  const setCustomSalad = useCartStore((state) => state.setCustomSalad);
  const setCustomVeggie = useCartStore((state) => state.setCustomVeggie);
  const toggleCustomExtra = useCartStore((state) => state.toggleCustomExtra);
  const toggleCustomBeverage = useCartStore((state) => state.toggleCustomBeverage);
  const confirmCustomization = useCartStore((state) => state.confirmCustomization);
  const setIsCartOpen = useCartStore((state) => state.setIsCartOpen);

  if (!activeCustomizerItem) return null;

  interface CustomizerOption {
    name: string;
    price?: string | number;
  }

  const item = activeCustomizerItem;
  const isBundle = 'items' in item;
  const starches = safeJsonParse<string[]>(item.primaryStarchOptions, []);
  const salads = safeJsonParse<string[]>(item.complementarySaladOptions, []);
  const veggies = safeJsonParse<string[]>(item.sideVeggieOptions, []);
  const extrasList = safeJsonParse<CustomizerOption[]>(item.addOnSides, []);
  const beveragesList = safeJsonParse<CustomizerOption[]>(item.beverages, []);

  // Calculate compound price
  const basePrice = isBundle ? item.price : calculateDiscountedPrice(item as MenuItem);
  let runningPrice = basePrice;
  const displayImage = isBundle
    ? (item.items?.map(i => i.menuItem?.image).filter(Boolean)[0] || 'https://img.mrdfood.com/300x0/data/355b1dff-dc06-42e8-9add-02c2e9a04feb.jpeg')
    : item.image;
  extrasList.forEach((extra) => {
    if (customExtras[extra.name]) {
      runningPrice += parseExtraPrice(extra.price);
    }
  });
  beveragesList.forEach((bev) => {
    if (customBeverages[bev.name]) {
      runningPrice += parseExtraPrice(bev.price);
    }
  });

  const handleCloseCustomizer = (onComplete?: () => void) => {
    setIsCustomizerClosing(true);
    const closeMs = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--modal-close-dur")
    ) || 150;
    setTimeout(() => {
      setActiveCustomizerItem(null);
      setIsCustomizerClosing(false);
      if (onComplete) onComplete();
    }, closeMs);
  };

  const handleConfirm = () => {
    confirmCustomization();
    handleCloseCustomizer(() => {
      setIsCartOpen(true);
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/75 backdrop-blur-sm transition-opacity duration-300 ${!isCustomizerClosing ? 'opacity-100' : 'opacity-0'}`}
        onClick={() => handleCloseCustomizer()}
      />
      {/* Modal */}
      <div className={`fixed inset-x-4 bottom-4 top-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[680px] md:max-h-[90vh] z-50 bg-bg-card/98 border border-white/10 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.95)] backdrop-blur-2xl overflow-hidden flex flex-col justify-between t-modal ${!isCustomizerClosing ? 'is-open' : 'is-closing'}`}>

        {/* Header with warm styling */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-bg-dark/30 flex-shrink-0">
          <div className="flex items-center gap-3">
            <ChefHat className="w-6 h-6 text-primary-light" />
            <div>
              <h3 className="font-heading text-lg font-extrabold text-white tracking-tight uppercase">Customize {item.name}</h3>
              <p className="text-[10px] text-primary-light font-black tracking-widest uppercase mt-0.5">Craft Your Perfect Plate</p>
            </div>
          </div>
          <button
            onClick={() => handleCloseCustomizer()}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close customizer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Customization Fields */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Hero Dish Showcase */}
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-bg-dark/40 border border-white/5 rounded-3xl p-5 shadow-inner">
          {displayImage && displayImage !== 'null' && displayImage !== '' && (
            <div
              onClick={() => setZoomedImage(displayImage || null)}
              className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary bg-bg-dark shadow-[0_10px_25px_rgba(0,0,0,0.5)] flex-shrink-0 cursor-zoom-in relative group/image transition-transform duration-300 hover:scale-105"
              title="Click to view full plate"
            >
              <img
                src={displayImage}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 flex items-center justify-center transition-opacity duration-300">
                <ZoomIn className="w-5 h-5 text-white" />
              </div>
            </div>
          )}
            <div className="text-center sm:text-left space-y-1.5">
              <h4 className="font-heading text-lg font-bold text-white uppercase tracking-tight">{item.name}</h4>
              <p className="text-white/60 text-xs leading-relaxed max-w-md">
                {item.description || "Freshly cooked traditional South African delight prepared with clean ingredients."}
              </p>
            </div>
          </div>

          {/* Starches */}
          {starches.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase">Choice of Starch</span>
                <span className="text-[9px] bg-primary/20 text-primary-light border border-primary/20 px-2 py-0.5 rounded-full font-black uppercase">Required</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {starches.map((starch: string) => (
                  <button
                    key={starch}
                    type="button"
                    onClick={() => setCustomStarch(starch)}
                    className={`p-3 rounded-2xl border text-center text-xs font-bold transition-all cursor-pointer ${customStarch === starch
                      ? 'bg-primary/25 border-primary text-white shadow-md'
                      : 'bg-bg-dark/50 border-white/5 text-white/60 hover:text-white hover:border-white/10'
                      }`}
                  >
                    {starch}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Salads */}
          {salads.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase">Choice of Salad</span>
                <span className="text-[9px] bg-primary/20 text-primary-light border border-primary/20 px-2 py-0.5 rounded-full font-black uppercase">Required</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {salads.map((salad: string) => (
                  <button
                    key={salad}
                    type="button"
                    onClick={() => setCustomSalad(salad)}
                    className={`p-3 rounded-2xl border text-center text-xs font-bold transition-all cursor-pointer ${customSalad === salad
                      ? 'bg-primary/25 border-primary text-white shadow-md'
                      : 'bg-bg-dark/50 border-white/5 text-white/60 hover:text-white hover:border-white/10'
                      }`}
                  >
                    {salad}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Side Veggies */}
          {veggies.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase">Choice of Side Veggie</span>
                <span className="text-[9px] bg-primary/20 text-primary-light border border-primary/20 px-2 py-0.5 rounded-full font-black uppercase">Required</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {veggies.map((veg: string) => (
                  <button
                    key={veg}
                    type="button"
                    onClick={() => setCustomVeggie(veg)}
                    className={`p-3 rounded-2xl border text-center text-xs font-bold transition-all cursor-pointer ${customVeggie === veg
                      ? 'bg-primary/25 border-primary text-white shadow-md'
                      : 'bg-bg-dark/50 border-white/5 text-white/60 hover:text-white hover:border-white/10'
                      }`}
                  >
                    {veg}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Added Extras */}
          {extrasList.length > 0 && (
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase block">Add Extras</span>
              <div className="grid sm:grid-cols-2 gap-3">
                {extrasList.map((extra) => {
                  const isChecked = !!customExtras[extra.name];
                  const price = parseExtraPrice(extra.price);
                  return (
                    <button
                      key={extra.name}
                      type="button"
                      onClick={() => toggleCustomExtra(extra.name)}
                      className={`p-4 rounded-2xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${isChecked
                        ? 'bg-primary/20 border-primary text-white shadow-md'
                        : 'bg-bg-dark/50 border-white/5 text-white/60 hover:text-white hover:border-white/10'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isChecked ? 'bg-primary border-primary text-white' : 'border-white/20'}`}>
                          {isChecked && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span>{extra.name}</span>
                      </div>
                      <span className="text-primary-light font-black">+ R {price.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Beverages */}
          {beveragesList.length > 0 && (
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase block">Select Beverage</span>
              <div className="grid sm:grid-cols-2 gap-3">
                {beveragesList.map((bev) => {
                  const isChecked = !!customBeverages[bev.name];
                  const price = parseExtraPrice(bev.price);
                  return (
                    <button
                      key={bev.name}
                      type="button"
                      onClick={() => toggleCustomBeverage(bev.name)}
                      className={`p-4 rounded-2xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${isChecked
                        ? 'bg-primary/20 border-primary text-white shadow-md'
                        : 'bg-bg-dark/50 border-white/5 text-white/60 hover:text-white hover:border-white/10'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isChecked ? 'bg-primary border-primary text-white' : 'border-white/20'}`}>
                          {isChecked && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span>{bev.name}</span>
                      </div>
                      <span className="text-primary-light font-black">+ R {price.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Dynamic Compound Cost & Add to Plate button */}
        <div className="border-t border-white/10 bg-bg-dark/65 backdrop-blur-md p-6 flex flex-col sm:flex-row justify-between items-center gap-4 flex-shrink-0">
          <div className="text-center sm:text-left">
            <span className="text-[9px] uppercase tracking-wider text-white/40 font-bold flex items-center gap-2 mb-1">
              Compound Cost
              {!isBundle && hasActiveSpecial(item as MenuItem) && (
                <span className="text-primary-light bg-primary/20 px-1.5 py-0.5 rounded uppercase tracking-widest text-[8px]">Special Applied!</span>
              )}
            </span>
            <span className="text-2xl font-black text-primary-light">R {runningPrice.toFixed(2)}</span>
          </div>
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-light text-white font-extrabold rounded-full text-xs tracking-widest uppercase transition-all cursor-pointer shadow-lg shadow-primary/20 hover:shadow-primary/45 border border-primary-light/20 flex items-center justify-center gap-2"
          >
            <span>Confirm & Add to Plate</span> <Flame className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Lightbox Zoom Overlay */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 transition-all duration-300 animate-fade-in"
          onClick={() => setZoomedImage(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setZoomedImage(null)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white text-xl transition-all hover:scale-105 active:scale-95 cursor-pointer z-10"
            aria-label="Close image zoom"
          >
            ✕
          </button>

          {/* Zoomed Image */}
          <div
            className="relative max-w-full max-h-[80vh] rounded-[2rem] overflow-hidden border-2 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={zoomedImage}
              alt={item.name}
              className="max-w-full max-h-[75vh] md:max-h-[80vh] object-contain"
            />
            {/* Overlay description */}
            <div className="absolute bottom-0 inset-x-0 bg-black/70 backdrop-blur-xs p-6 border-t border-white/5 text-center">
              <h4 className="font-heading text-lg font-bold text-white uppercase tracking-tight">{item.name}</h4>
              <p className="text-white/60 text-xs mt-1">{item.description || "Traditional South African dish"}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
