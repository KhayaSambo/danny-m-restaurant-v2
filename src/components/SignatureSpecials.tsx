import React from 'react';
import { useCartStore } from '../store/useCartStore';
import { useMenuStore } from '../store/useMenuStore';
import { useTranslation } from '../hooks/useTranslation';

export const SignatureSpecials: React.FC = () => {
  const { t } = useTranslation();
  const categories = useMenuStore((state) => state.categories);
  const cart = useCartStore((state) => state.cart);
  const addClick = useCartStore((state) => state.addClick);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);

  const allMenuItems = categories.flatMap(cat => cat.menuItems);

  const findItemByName = (substring: string) => {
    return allMenuItems.find(item => item.name.toLowerCase().includes(substring.toLowerCase()));
  };

  const braaiItem = findItemByName("Braai Meat") || findItemByName("Steak Only");
  const mogoduItem = findItemByName("Mogodu") || findItemByName("Tripe");
  const beefStewItem = findItemByName("Beef Stew") || findItemByName("Cow Heels");

  return (
    <section className="py-24 bg-bg-dark border-t border-white/5 overflow-visible">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16 space-y-3">
          <span className="text-primary-light font-bold uppercase tracking-widest text-xs">{t('menu.chefRecommends')}</span>
          <h2 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight text-white animate-pulse-slow">{t('menu.title')}</h2>
          <div className="w-16 h-1 bg-primary mx-auto rounded-full mt-2" />
        </div>

        <div className="grid lg:grid-cols-3 gap-10 lg:gap-8 pt-4">

          {/* Card 1: Warm Amber (Braai Meat Meal) */}
          <div className="relative bg-[#E67E22] rounded-[2.5rem] p-8 min-h-[300px] flex flex-col justify-between overflow-visible shadow-2xl transition-transform duration-500 hover:-translate-y-2 group">
            <div className="max-w-[55%] z-10 flex flex-col justify-between h-full">
              <span className="text-[9px] font-black tracking-widest text-white/70 uppercase">{t('menu.votedBest')}</span>
              <div>
                <h3 className="font-heading text-3xl font-extrabold text-white leading-tight mt-4 uppercase">Braai Meat</h3>
                <p className="text-white/80 text-xs mt-2 font-medium">
                  {braaiItem?.description || "Pan-fried steak seasoned with robust herbs & tomato gravy."}
                </p>
              </div>
              <div className="mt-4 flex flex-col gap-3">
                <span className="text-2xl font-black text-white/90">
                  {braaiItem ? `R${braaiItem.price.toFixed(2)}` : "R90.00"}
                </span>

                {braaiItem && (
                  <div className="w-full">
                    {(cart[braaiItem.id]?.quantity || 0) === 0 ? (
                      <button
                        onClick={() => addClick(braaiItem)}
                        className="px-5 py-2 bg-black/35 hover:bg-black/50 border border-white/10 rounded-full font-black text-[9px] tracking-widest uppercase transition-all text-white cursor-pointer"
                      >
                        {t('menu.addToPlate')}
                      </button>
                    ) : (
                      <div className="flex items-center justify-between w-28 bg-black/40 rounded-full p-0.5 border border-white/10">
                        <button
                          onClick={() => decrementItem(braaiItem)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black text-white hover:bg-white/10 cursor-pointer"
                        >
                          −
                        </button>
                        <span className="text-xs font-black text-white">{cart[braaiItem.id].quantity}</span>
                        <button
                          onClick={() => incrementItem(braaiItem)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black text-white hover:bg-white/10 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="absolute top-1/2 -translate-y-1/2 -right-8 w-44 h-44 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-[#E67E22] shadow-[0_15px_40px_rgba(0,0,0,0.5)] z-20 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-12 bg-bg-card">
              <img
                src={braaiItem?.image || "https://img.mrdfood.com/300x0/data/2b699b02-c496-4142-a51b-bd9897e4964f.jpeg"}
                alt="Braai Meat plate"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Card 2: Deep Terracotta (Mogodu Meal) */}
          <div className="relative bg-[#D35400] rounded-[2.5rem] p-8 min-h-[300px] flex flex-col justify-between overflow-visible shadow-2xl transition-transform duration-500 hover:-translate-y-2 group">
            <div className="max-w-[55%] z-10 flex flex-col justify-between h-full">
              <span className="text-[9px] font-black tracking-widest text-white/70 uppercase">{t('menu.slowBraised')}</span>
              <div>
                <h3 className="font-heading text-3xl font-extrabold text-white leading-tight mt-4 uppercase">Mogodu</h3>
                <p className="text-white/80 text-xs mt-2 font-medium">
                  {mogoduItem?.description || "Tender South African tripe simmered in rich gravy."}
                </p>
              </div>
              <div className="mt-4 flex flex-col gap-3">
                <span className="text-2xl font-black text-white/90">
                  {mogoduItem ? `R${mogoduItem.price.toFixed(2)}` : "R90.00"}
                </span>

                {mogoduItem && (
                  <div className="w-full">
                    {(cart[mogoduItem.id]?.quantity || 0) === 0 ? (
                      <button
                        onClick={() => addClick(mogoduItem)}
                        className="px-5 py-2 bg-black/35 hover:bg-black/50 border border-white/10 rounded-full font-black text-[9px] tracking-widest uppercase transition-all text-white cursor-pointer"
                      >
                        {t('menu.addToPlate')}
                      </button>
                    ) : (
                      <div className="flex items-center justify-between w-28 bg-black/40 rounded-full p-0.5 border border-white/10">
                        <button
                          onClick={() => decrementItem(mogoduItem)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black text-white hover:bg-white/10 cursor-pointer"
                        >
                          −
                        </button>
                        <span className="text-xs font-black text-white">{cart[mogoduItem.id].quantity}</span>
                        <button
                          onClick={() => incrementItem(mogoduItem)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black text-white hover:bg-white/10 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="absolute top-1/2 -translate-y-1/2 -right-8 w-44 h-44 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-[#D35400] shadow-[0_15px_40px_rgba(0,0,0,0.5)] z-20 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-12 bg-bg-card">
              <img
                src={mogoduItem?.image || "https://img.mrdfood.com/300x0/data/355b1dff-dc06-42e8-9add-02c2e9a04feb.jpeg"}
                alt="Mogodu plate"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Card 3: Deep Slate/Charcoal (Beef Stew Meal) */}
          <div className="relative bg-[#2C2421] rounded-[2.5rem] p-8 min-h-[300px] flex flex-col justify-between overflow-visible shadow-2xl transition-transform duration-500 hover:-translate-y-2 group border border-white/5">
            <div className="max-w-[55%] z-10 flex flex-col justify-between h-full">
              <span className="text-[9px] font-black tracking-widest text-white/50 uppercase">{t('menu.classicSimmer')}</span>
              <div>
                <h3 className="font-heading text-3xl font-extrabold text-white leading-tight mt-4 uppercase">Beef Stew</h3>
                <p className="text-white/70 text-xs mt-2 font-medium">
                  {beefStewItem?.description || "Hearty slow-cooked beef infused with traditional vegetables."}
                </p>
              </div>
              <div className="mt-4 flex flex-col gap-3">
                <span className="text-2xl font-black text-primary-light">
                  {beefStewItem ? `R${beefStewItem.price.toFixed(2)}` : "R90.00"}
                </span>

                {beefStewItem && (
                  <div className="w-full">
                    {(cart[beefStewItem.id]?.quantity || 0) === 0 ? (
                      <button
                        onClick={() => addClick(beefStewItem)}
                        className="px-5 py-2 bg-black/35 hover:bg-black/50 border border-white/10 rounded-full font-black text-[9px] tracking-widest uppercase transition-all text-white cursor-pointer"
                      >
                        {t('menu.addToPlate')}
                      </button>
                    ) : (
                      <div className="flex items-center justify-between w-28 bg-black/40 rounded-full p-0.5 border border-white/10">
                        <button
                          onClick={() => decrementItem(beefStewItem)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black text-white hover:bg-white/10 cursor-pointer"
                        >
                          −
                        </button>
                        <span className="text-xs font-black text-white">{cart[beefStewItem.id].quantity}</span>
                        <button
                          onClick={() => incrementItem(beefStewItem)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black text-white hover:bg-white/10 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="absolute top-1/2 -translate-y-1/2 -right-8 w-44 h-44 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-[#2C2421] shadow-[0_15px_40px_rgba(0,0,0,0.5)] z-20 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-12 bg-bg-card">
              <img
                src={beefStewItem?.image || "https://img.mrdfood.com/300x0/data/1d0a3d6e-093c-4638-98da-b78679aa6784.jpeg"}
                alt="Beef Stew plate"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
