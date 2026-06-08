import React from 'react';
import {
  Utensils,
  Flame,
  Sparkles,
  Inbox,
  ChefHat,
  Bike,
  Car,
  Check,
  AlertTriangle,
  ShoppingBag,
  Clock
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useOrderTrackerStore } from '../store/useOrderTrackerStore';
import { safeJsonParse, getItemPrice, calculateVat } from '../utils/helpers';
import { supabase } from '../lib/supabase';
import type { User as SupaUser } from '@supabase/supabase-js';

interface CartDrawerProps {
  user: SupaUser | null;
  setIsAuthModalOpen: (open: boolean) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ user, setIsAuthModalOpen }) => {
  const cart = useCartStore((state) => state.cart);
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const isCartClosing = useCartStore((state) => state.isCartClosing);
  const cartStep = useCartStore((state) => state.cartStep);
  const isSubmitting = useCartStore((state) => state.isSubmitting);
  const orderSuccess = useCartStore((state) => state.orderSuccess);
  const orderError = useCartStore((state) => state.orderError);

  const customerName = useCartStore((state) => state.customerName);
  const customerPhone = useCartStore((state) => state.customerPhone);
  const customerEmail = useCartStore((state) => state.customerEmail);
  const serviceMode = useCartStore((state) => state.serviceMode);
  const deliveryAddress = useCartStore((state) => state.deliveryAddress);
  const notes = useCartStore((state) => state.notes);
  const fieldErrors = useCartStore((state) => state.fieldErrors);
  const fieldShaking = useCartStore((state) => state.fieldShaking);

  const setIsCartOpen = useCartStore((state) => state.setIsCartOpen);
  const setIsCartClosing = useCartStore((state) => state.setIsCartClosing);
  const setCartStep = useCartStore((state) => state.setCartStep);
  const setIsSubmitting = useCartStore((state) => state.setIsSubmitting);
  const setOrderSuccess = useCartStore((state) => state.setOrderSuccess);
  const setOrderError = useCartStore((state) => state.setOrderError);
  const incrementItem = useCartStore((state) => state.incrementItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateItemOption = useCartStore((state) => state.updateItemOption);
  const triggerFieldShake = useCartStore((state) => state.triggerFieldShake);

  const setCustomerName = useCartStore((state) => state.setCustomerName);
  const setCustomerPhone = useCartStore((state) => state.setCustomerPhone);
  const setCustomerEmail = useCartStore((state) => state.setCustomerEmail);
  const setNotes = useCartStore((state) => state.setNotes);

  const activeOrderId = useOrderTrackerStore((state) => state.activeOrderId);
  const activeOrderData = useOrderTrackerStore((state) => state.activeOrderData);
  const cartSidebarTab = useOrderTrackerStore((state) => state.cartSidebarTab);
  const setCartSidebarTab = useOrderTrackerStore((state) => state.setCartSidebarTab);
  const dismissTracking = useOrderTrackerStore((state) => state.dismissTracking);

  const totalCartPrice = useCartStore((state) => state.totalCartPrice());
  const { subtotal, vat: calculatedVat } = calculateVat(totalCartPrice);

  const handleCloseCart = () => {
    setIsCartClosing(true);
    const closeMs = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--modal-close-dur")
    ) || 150;
    setTimeout(() => {
      setIsCartOpen(false);
      setIsCartClosing(false);
    }, closeMs);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!customerName.trim()) {
      triggerFieldShake('name');
      setOrderError("Please enter your name to complete the order.");
      return;
    }
    if (customerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      triggerFieldShake('email');
      setOrderError("Please enter a valid email address.");
      return;
    }
    if (serviceMode === 'Delivery' && !deliveryAddress.trim()) {
      triggerFieldShake('deliveryAddress');
      setOrderError("Please specify your delivery address.");
      return;
    }
    const cartEntries = Object.values(cart);
    if (cartEntries.length === 0) {
      alert("Your plate is empty. Add some traditional meals first!");
      return;
    }

    try {
      setIsSubmitting(true);
      setOrderError(null);

      const optionsNotes = cartEntries.map(entry => {
        const choices = [];
        if (entry.selectedStarch) choices.push(`Starch: ${entry.selectedStarch}`);
        if (entry.selectedSalad) choices.push(`Salad: ${entry.selectedSalad}`);
        if (entry.selectedVeggie) choices.push(`Veggie: ${entry.selectedVeggie}`);
        if (entry.selectedExtras && entry.selectedExtras.length > 0) {
          choices.push(`Extras: ${entry.selectedExtras.map(e => e.name).join(', ')}`);
        }
        if (entry.selectedBeverages && entry.selectedBeverages.length > 0) {
          choices.push(`Beverages: ${entry.selectedBeverages.map(b => b.name).join(', ')}`);
        }
        return choices.length > 0 ? `${entry.item.name} (${choices.join(', ')})` : '';
      }).filter(Boolean).join(' | ');

      const finalNotes = [notes.trim(), optionsNotes].filter(Boolean).join(' [Selections: ') + (optionsNotes ? ']' : '');

      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        customerEmail: customerEmail.trim() || undefined,
        type: serviceMode,
        deliveryAddress: serviceMode === 'Delivery' ? deliveryAddress.trim() : undefined,
        notes: finalNotes || undefined,
        total: totalCartPrice,
        items: cartEntries.map(entry => ({
          menuItemId: entry.item.id,
          quantity: entry.quantity,
          priceAtTime: getItemPrice(entry)
        }))
      };

      const pendingOrderPayload = {
        total: totalCartPrice,
        notes: finalNotes || null,
        supabaseItems: cartEntries.map(entry => ({
          menuItemId: entry.item.id,
          name: entry.item.name,
          quantity: entry.quantity,
          priceAtTime: getItemPrice(entry),
          selectedStarch: entry.selectedStarch || null,
          selectedSalad: entry.selectedSalad || null,
          selectedVeggie: entry.selectedVeggie || null,
          selectedExtras: entry.selectedExtras || [],
          selectedBeverages: entry.selectedBeverages || []
        })),
        cmsPayload: payload
      };
      
      localStorage.setItem('danny-m-pending-order', JSON.stringify(pendingOrderPayload));

      const { data, error: yocoError } = await supabase.functions.invoke('process-yoco-payment', {
        body: {
          amountInCents: totalCartPrice * 100,
          currency: 'ZAR',
          successUrl: `${window.location.origin}/?yoco_success=true`,
          cancelUrl: `${window.location.origin}/?yoco_cancel=true`
        }
      });

      if (yocoError) throw yocoError;

      if (data && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        throw new Error('Yoco hosted checkout did not return a valid redirection URL.');
      }
    } catch (err: unknown) {
      console.error('Order Initialization Error:', err);
      const errMsg = err instanceof Error ? err.message : 'Failed to initialize payment.';
      setOrderError(errMsg);
      setIsSubmitting(false);
    }
  };

  const handleDismissTracking = () => {
    dismissTracking();
    setOrderSuccess(false);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/75 backdrop-blur-md transition-opacity duration-300 ${isCartOpen && !isCartClosing ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className={`relative bg-bg-card/98 border border-white/10 rounded-[2.5rem] w-full max-w-5xl h-[85vh] md:h-[80vh] flex flex-col justify-between shadow-[0_0_80px_rgba(0,0,0,0.95)] backdrop-blur-2xl t-modal ${isCartOpen && !isCartClosing ? 'is-open' : ''} ${isCartClosing ? 'is-closing' : ''} overflow-hidden`}>
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-bg-dark/30">
          {activeOrderId ? (
            <div className="flex bg-[#0d0b0a] p-1 rounded-xl border border-white/5 shadow-inner">
              <button
                onClick={() => setCartSidebarTab('cart')}
                className={`py-1.5 px-3 rounded-lg font-black text-[9px] tracking-widest uppercase transition-all cursor-pointer flex items-center justify-center gap-1 ${cartSidebarTab === 'cart'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-white/50 hover:text-white'
                  }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Your Plate ({Object.keys(cart).length})</span>
              </button>
              <button
                onClick={() => setCartSidebarTab('tracker')}
                className={`py-1.5 px-4 rounded-lg font-black text-[9px] tracking-widest uppercase transition-all cursor-pointer flex items-center gap-1.5 relative ${cartSidebarTab === 'tracker'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-white/50 hover:text-white'
                  }`}
              >
                <Flame className="w-3.5 h-3.5 text-primary-light" />
                <span>Track Order</span>
                {activeOrderData && ['Received', 'Preparing', 'Ready'].includes(activeOrderData.status) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Utensils className="w-6 h-6 text-primary-light" />
              <div>
                <h3 className="font-heading text-lg font-extrabold text-white tracking-tight uppercase">Your Ubuntu Plate</h3>
                <p className="text-[10px] text-primary-light font-black tracking-widest uppercase mt-0.5">Ready for the Kitchen</p>
              </div>
            </div>
          )}
          <button
            onClick={handleCloseCart}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Cart Content */}
        <div className="flex-1 overflow-hidden p-6">
          {activeOrderId && cartSidebarTab === 'tracker' ? (
            /* UBUNTU HEARTH PROGRESS TRACKER */
            <div className="h-full overflow-y-auto space-y-6 py-4 animate-fade-in max-w-lg mx-auto">
              <div className="bg-[#151211] border border-white/5 rounded-2xl p-5 text-center space-y-3 relative overflow-hidden shadow-inner">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,93,46,0.08)_0%,transparent_100%)] pointer-events-none animate-pulse-slow" />
                <span className="text-[10px] text-white/40 uppercase tracking-widest block font-black">Ubuntu Active Order</span>
                <h4 className="font-mono text-sm font-bold text-primary-light uppercase tracking-wider">#{activeOrderId.substring(activeOrderId.length - 8)}</h4>

                {activeOrderData ? (
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-primary/20 border border-primary/30 text-white shadow-lg shadow-primary/10">
                      <span className="relative flex h-2 w-2">
                        {['Received', 'Preparing', 'Ready'].includes(activeOrderData.status) && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        )}
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                      </span>
                      {activeOrderData.status}
                    </div>
                    {activeOrderData.type && (
                      <span className="text-[9px] uppercase tracking-wider text-white/40 font-bold flex items-center justify-center gap-1.5 mt-1">
                        Service: {activeOrderData.type === 'Delivery' ? <Bike className="w-3.5 h-3.5 text-primary-light inline" /> : <Car className="w-3.5 h-3.5 text-primary-light inline" />} {activeOrderData.type}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-white/5 border border-white/10 text-white/50">
                    <div className="w-3.5 h-3.5 border-2 border-white/35 border-t-transparent rounded-full animate-spin" />
                    Locating Hearth...
                  </div>
                )}
              </div>

              {activeOrderData && activeOrderData.status === 'Cancelled' ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 text-center space-y-4 shadow-lg shadow-red-950/20">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-3xl mx-auto shadow-inner">
                    <AlertTriangle className="w-8 h-8 text-red-550" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-heading text-lg font-black text-red-400 uppercase tracking-tight">Order Cancelled</h4>
                    <p className="text-white/60 text-xs leading-relaxed max-w-xs mx-auto">
                      We're extremely sorry, but your order was cancelled by the kitchen staff. Please check your contact number or get in touch with us at the Ubuntu counter.
                    </p>
                  </div>
                  <button
                    onClick={handleDismissTracking}
                    className="w-full py-3 bg-red-500/20 hover:bg-red-500/35 border border-red-500/35 hover:border-red-500 text-white text-xs font-black tracking-widest uppercase rounded-full transition-all cursor-pointer shadow-md shadow-red-550/10"
                  >
                    Dismiss & Restart Cart
                  </button>
                </div>
              ) : (
                <div className="space-y-6 bg-bg-dark/45 border border-white/5 rounded-3xl p-6 shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(217,93,46,0.03)_0%,transparent_70%)] pointer-events-none" />

                  {(() => {
                    const currentStatus = activeOrderData?.status || 'Received';

                    const getStepDetails = (step: number) => {
                      const isDelivery = activeOrderData?.type === 'Delivery';
                      switch (step) {
                        case 1:
                          return {
                            title: "Hearth Received",
                            tag: "Received",
                            desc: "We've got your order! Our kitchen is validating prep slots at the Pretoria Ubuntu Hearth.",
                            icon: Inbox
                          };
                        case 2:
                          return {
                            title: "Simmering Prep",
                            tag: "Preparing",
                            desc: "The potjie is simmering! Our chefs are preparing your traditional plate with absolute care.",
                            icon: ChefHat
                          };
                        case 3:
                          return {
                            title: isDelivery ? "On The Road" : "Piping Hot & Ready",
                            tag: "Ready",
                            desc: isDelivery
                              ? "Our delivery rider has your traditional meal packed warm and is en route to your address."
                              : "Ready for collection! Head over to the Ubuntu Hearth counter to grab your piping-hot plate.",
                            icon: isDelivery ? Bike : Flame
                          };
                        case 4:
                          return {
                            title: "Feast of Ubuntu",
                            tag: "Completed",
                            desc: "Feast complete! We hope you enjoyed the authentic taste of Pretoria. 'I am because we are.'",
                            icon: Utensils
                          };
                        default:
                          return { title: "", tag: "", desc: "", icon: null };
                      }
                    };

                    const getStepState = (stepTag: string) => {
                      const statusList = ['Received', 'Preparing', 'Ready', 'Completed'];
                      const currentIdx = statusList.indexOf(currentStatus);
                      const stepIdx = statusList.indexOf(stepTag);

                      if (currentIdx > stepIdx) return 'completed';
                      if (currentIdx === stepIdx) return 'active';
                      return 'pending';
                    };

                    return [1, 2, 3, 4].map((stepNum) => {
                      const details = getStepDetails(stepNum);
                      const state = getStepState(details.tag);

                      return (
                        <div key={stepNum} className="flex gap-4 relative group">
                          <div className="flex flex-col items-center flex-shrink-0 relative">
                            {stepNum < 4 && (
                              <div className={`w-0.5 absolute top-10 bottom-[-24px] z-0 transition-colors duration-500 ${state === 'completed' ? 'bg-primary' : 'bg-white/10 border-dashed border-l border-white/20'
                                }`} />
                            )}

                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-all duration-500 border ${state === 'completed'
                              ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                              : state === 'active'
                                ? 'bg-[#1c1513] border-primary text-white shadow-[0_0_20px_rgba(217,93,46,0.4)] animate-pulse'
                                : 'bg-[#151211] border-white/5 text-white/30'
                              }`}>
                              {state === 'completed' ? (
                                <Check className="w-5 h-5" />
                              ) : (
                                (() => {
                                  const StepIcon = details.icon;
                                  return StepIcon ? <StepIcon className="w-5 h-5" /> : null;
                                })()
                              )}
                            </div>
                          </div>

                          <div className="space-y-1 pb-4 flex-1">
                            <h5 className={`font-heading text-xs font-black tracking-widest uppercase transition-colors duration-500 ${state === 'active' ? 'text-primary-light font-extrabold' : state === 'completed' ? 'text-white' : 'text-white/30'
                              }`}>
                              {details.title}
                            </h5>
                            <p className={`text-[10px] leading-relaxed transition-colors duration-500 ${state === 'active' ? 'text-white/80' : state === 'completed' ? 'text-white/50' : 'text-white/20'
                              }`}>
                              {details.desc}
                            </p>
                          </div>
                        </div>
                      );
                    });
                  })()}

                  {activeOrderData?.status === 'Completed' && (
                    <div className="pt-4 border-t border-white/5 text-center space-y-3 animate-bounce-slow">
                      <p className="text-[10px] text-primary-light font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-primary-light" /> Traditional Feast Delivered!
                      </p>
                      <button
                        onClick={handleDismissTracking}
                        className="w-full py-3.5 bg-primary hover:bg-primary-light text-white font-extrabold rounded-full text-[10px] tracking-widest uppercase shadow-md shadow-primary/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>Dismiss Tracker & Place New Order</span> <Flame className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeOrderData?.status !== 'Completed' && activeOrderData?.status !== 'Cancelled' && (
                <button
                  onClick={handleCloseCart}
                  className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-full text-[10px] tracking-widest uppercase transition-all cursor-pointer text-center flex items-center justify-center gap-2"
                >
                  <Clock className="w-3.5 h-3.5 text-white/60" />
                  <span>Keep Tracking in Background</span>
                </button>
              )}
            </div>
          ) : orderSuccess ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12 animate-pulse-slow max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center shadow-lg shadow-primary/30 mx-auto">
                <Check className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <span className="text-primary-light font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-1">Order Received!</span>
                <h4 className="font-heading text-2xl font-black text-white uppercase tracking-tight">Cooked with Love</h4>
                <div className="w-12 h-0.5 bg-primary mx-auto rounded-full mt-2" />
              </div>
              <p className="text-white/70 text-sm leading-relaxed max-w-sm mx-auto">
                Thank you for ordering! The kitchen team has received your order in the CMS and is preparing your meal with absolute love, hygiene, and care.
              </p>
              <p className="text-primary-light font-bold text-xs">
                Ubuntu: "I am because we are."
              </p>
              <button
                onClick={() => {
                  setOrderSuccess(false);
                  handleCloseCart();
                }}
                className="mt-4 px-8 py-3 bg-primary hover:bg-primary-light text-white font-bold rounded-full text-xs tracking-widest uppercase transition-all cursor-pointer"
              >
                Close & Browse Menu
              </button>
            </div>
          ) : Object.keys(cart).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-20 text-white/40">
              <ShoppingBag className="w-16 h-16 text-white/20 mx-auto" />
              <h4 className="font-heading text-lg font-bold text-white uppercase tracking-tight">Your Plate is Empty</h4>
              <p className="text-xs max-w-xs mx-auto">
                Add some of our slow-cooked Pretoria traditional meals to customize your perfect plate.
              </p>
              <button
                onClick={handleCloseCart}
                className="mt-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-full text-[10px] tracking-widest uppercase transition-all cursor-pointer"
              >
                Start Adding meals
              </button>
            </div>
          ) : (
            <div className="h-full">
              {/* DESKTOP VIEW: TWO COLUMNS */}
              <div className="hidden md:grid grid-cols-2 gap-8 h-full">
                {/* Left Column: Selected Items */}
                <div className="flex flex-col h-full overflow-hidden pr-4 border-r border-white/5">
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase block border-b border-white/5 pb-2">Selected Items</span>
                    {Object.values(cart).map((cartItem) => {
                      const item = cartItem.item;
                      const starches = safeJsonParse<string[]>(item.primaryStarchOptions, []);
                      const salads = safeJsonParse<string[]>(item.complementarySaladOptions, []);
                      const veggies = safeJsonParse<string[]>(item.sideVeggieOptions, []);

                      return (
                        <div key={item.id} className="bg-bg-dark/40 border border-white/5 rounded-2xl p-4 space-y-3 shadow-inner">
                          <div className="flex justify-between items-start gap-4">
                            {item.image && item.image !== 'null' && item.image !== '' && (
                              <div className="w-16 h-16 rounded-full overflow-hidden border border-white/10 bg-bg-dark flex-shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <h4 className="font-heading font-extrabold text-sm text-white uppercase truncate tracking-tight">{item.name}</h4>
                              <span className="text-xs text-primary-light font-black block mt-0.5">R {getItemPrice(cartItem).toFixed(2)}</span>
                            </div>

                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-white/30 hover:text-red-500 transition-colors text-sm cursor-pointer"
                              aria-label="Remove item"
                            >
                              ✕
                            </button>
                          </div>

                          {(starches.length > 0 || salads.length > 0 || veggies.length > 0) && (
                            <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2">
                              {starches.length > 0 && (
                                <div className="space-y-1">
                                  <label className="text-[9px] uppercase tracking-wider text-white/40 font-bold block">Choice of Starch</label>
                                  <select
                                    value={cartItem.selectedStarch || ''}
                                    onChange={(e) => updateItemOption(item.id, 'selectedStarch', e.target.value)}
                                    className="w-full bg-bg-dark border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white/80 focus:border-primary focus:outline-none"
                                  >
                                    {starches.map((s) => <option key={s} value={s}>{s}</option>)}
                                  </select>
                                </div>
                              )}

                              {salads.length > 0 && (
                                <div className="space-y-1">
                                  <label className="text-[9px] uppercase tracking-wider text-white/40 font-bold block">Choice of Salad</label>
                                  <select
                                    value={cartItem.selectedSalad || ''}
                                    onChange={(e) => updateItemOption(item.id, 'selectedSalad', e.target.value)}
                                    className="w-full bg-bg-dark border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white/80 focus:border-primary focus:outline-none"
                                  >
                                    {salads.map((s) => <option key={s} value={s}>{s}</option>)}
                                  </select>
                                </div>
                              )}

                              {veggies.length > 0 && (
                                <div className="space-y-1 col-span-2">
                                  <label className="text-[9px] uppercase tracking-wider text-white/40 font-bold block">Choice of Side Veggie</label>
                                  <select
                                    value={cartItem.selectedVeggie || ''}
                                    onChange={(e) => updateItemOption(item.id, 'selectedVeggie', e.target.value)}
                                    className="w-full bg-bg-dark border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white/80 focus:border-primary focus:outline-none"
                                  >
                                    {veggies.map((s) => <option key={s} value={s}>{s}</option>)}
                                  </select>
                                </div>
                              )}
                            </div>
                          )}

                          {((cartItem.selectedExtras && cartItem.selectedExtras.length > 0) ||
                            (cartItem.selectedBeverages && cartItem.selectedBeverages.length > 0)) && (
                              <div className="pt-2 border-t border-white/5 space-y-1">
                                {cartItem.selectedExtras && cartItem.selectedExtras.length > 0 && (
                                  <div className="text-[10px] text-white/70">
                                    <span className="text-white/40 font-bold uppercase tracking-wider block">Extras Added:</span>
                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                      {cartItem.selectedExtras.map((ex, idx) => (
                                        <span key={idx} className="bg-primary/20 text-primary-light border border-primary/20 rounded-full px-2 py-0.5 text-[9px] font-medium">
                                          {ex.name} (+R{ex.price.toFixed(2)})
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {cartItem.selectedBeverages && cartItem.selectedBeverages.length > 0 && (
                                  <div className="text-[10px] text-white/70">
                                    <span className="text-white/40 font-bold uppercase tracking-wider block">Beverages Added:</span>
                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                      {cartItem.selectedBeverages.map((bev, idx) => (
                                        <span key={idx} className="bg-primary/20 text-primary-light border border-primary/20 rounded-full px-2 py-0.5 text-[9px] font-medium">
                                          {bev.name} (+R{bev.price.toFixed(2)})
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                          <div className="flex justify-between items-center pt-2">
                            <span className="text-[10px] uppercase text-white/30 tracking-widest font-black">Quantity</span>
                            <div className="flex items-center justify-between w-24 bg-bg-dark rounded-full p-0.5 border border-white/5">
                              <button
                                onClick={() => decrementItem(item)}
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white/80 hover:bg-white/5 cursor-pointer"
                              >
                                −
                              </button>
                              <span className="text-xs font-black text-white">{cartItem.quantity}</span>
                              <button
                                onClick={() => incrementItem(item)}
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white/80 hover:bg-white/5 cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: Checkout Form + Totals */}
                <div className="flex flex-col h-full overflow-hidden">
                  <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                    <div className="space-y-2 text-sm border-b border-white/5 pb-4">
                      <div className="flex justify-between text-white/50 text-xs">
                        <span>Subtotal</span>
                        <span>R {subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-white/50 text-xs">
                        <span>VAT (15% South African Standard)</span>
                        <span>R {calculatedVat.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-extrabold text-white text-base pt-1">
                        <span>Grand Total</span>
                        <span className="text-primary-light">R {totalCartPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                      <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase block">Checkout Details</span>

                      {orderError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center flex items-center justify-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-red-400" /> <span>{orderError}</span>
                        </div>
                      )}

                      <div className="space-y-3">
                        <input
                          type="text"
                          required
                          placeholder="Your Name (Required)*"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className={`w-full bg-[#151211] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none transition-all t-fire-input ${fieldErrors.name ? 'is-error' : ''} ${fieldShaking.name ? 'is-shaking' : ''}`}
                        />

                        <input
                          type="tel"
                          placeholder="Phone Number (Highly Recommended)"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className={`w-full bg-[#151211] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none transition-all t-fire-input ${fieldErrors.phone ? 'is-error' : ''} ${fieldShaking.phone ? 'is-shaking' : ''}`}
                        />

                        <input
                          type="email"
                          placeholder="Email Address (For order updates)"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className={`w-full bg-[#151211] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none transition-all t-fire-input ${fieldErrors.email ? 'is-error' : ''} ${fieldShaking.email ? 'is-shaking' : ''}`}
                        />

                        <input
                          type="text"
                          placeholder="Special instructions (e.g. Extra Gravy)"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className={`w-full bg-[#151211] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none transition-all t-fire-input ${fieldErrors.notes ? 'is-error' : ''} ${fieldShaking.notes ? 'is-shaking' : ''}`}
                        />
                      </div>

                      <div className="bg-[#1c1513] border border-primary/20 rounded-xl p-3 text-center text-[10px] text-primary-light font-black tracking-widest uppercase mb-4 mt-2 animate-pulse-slow">
                        ● Pickup Order
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-primary hover:bg-primary-light text-white font-extrabold rounded-full text-xs tracking-widest uppercase transition-all cursor-pointer shadow-lg shadow-primary/20 hover:shadow-primary/45 border border-primary-light/20 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Sending to Kitchen...</span>
                          </>
                        ) : (
                          <span className="flex items-center justify-center gap-1.5">
                            <span>Submit Order</span> <Flame className="w-4 h-4" />
                          </span>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* MOBILE VIEW (RETAINED BACKWARDS COMPATIBILITY) */}
              <div className="md:hidden flex flex-col h-full justify-between">
                {cartStep === 'items' ? (
                  <div className="flex flex-col h-full overflow-hidden justify-between">
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                      <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase block border-b border-white/5 pb-2">Selected Items</span>
                      {Object.values(cart).map((cartItem) => {
                        const item = cartItem.item;
                        const starches = safeJsonParse<string[]>(item.primaryStarchOptions, []);
                        const salads = safeJsonParse<string[]>(item.complementarySaladOptions, []);
                        const veggies = safeJsonParse<string[]>(item.sideVeggieOptions, []);

                        return (
                          <div key={item.id} className="bg-bg-dark/40 border border-white/5 rounded-2xl p-4 space-y-3">
                            <div className="flex justify-between items-start gap-4">
                              {item.image && item.image !== 'null' && item.image !== '' && (
                                <div className="w-16 h-16 rounded-full overflow-hidden border border-white/10 bg-bg-dark flex-shrink-0">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                              )}

                              <div className="flex-1 min-w-0">
                                <h4 className="font-heading font-extrabold text-sm text-white uppercase truncate tracking-tight">{item.name}</h4>
                                <span className="text-xs text-primary-light font-black block mt-0.5">R {getItemPrice(cartItem).toFixed(2)}</span>
                              </div>

                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-white/30 hover:text-red-500 transition-colors text-sm cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>

                            {(starches.length > 0 || salads.length > 0 || veggies.length > 0) && (
                              <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2">
                                {starches.length > 0 && (
                                  <div className="space-y-1">
                                    <label className="text-[9px] uppercase tracking-wider text-white/40 font-bold block">Choice of Starch</label>
                                    <select
                                      value={cartItem.selectedStarch || ''}
                                      onChange={(e) => updateItemOption(item.id, 'selectedStarch', e.target.value)}
                                      className="w-full bg-bg-dark border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white/80 focus:border-primary focus:outline-none"
                                    >
                                      {starches.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                  </div>
                                )}
                                {salads.length > 0 && (
                                  <div className="space-y-1">
                                    <label className="text-[9px] uppercase tracking-wider text-white/40 font-bold block">Choice of Salad</label>
                                    <select
                                      value={cartItem.selectedSalad || ''}
                                      onChange={(e) => updateItemOption(item.id, 'selectedSalad', e.target.value)}
                                      className="w-full bg-bg-dark border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white/80 focus:border-primary focus:outline-none"
                                    >
                                      {salads.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                  </div>
                                )}
                                {veggies.length > 0 && (
                                  <div className="space-y-1 col-span-2">
                                    <label className="text-[9px] uppercase tracking-wider text-white/40 font-bold block">Choice of Side Veggie</label>
                                    <select
                                      value={cartItem.selectedVeggie || ''}
                                      onChange={(e) => updateItemOption(item.id, 'selectedVeggie', e.target.value)}
                                      className="w-full bg-bg-dark border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white/80 focus:border-primary focus:outline-none"
                                    >
                                      {veggies.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                  </div>
                                )}
                              </div>
                            )}

                            {((cartItem.selectedExtras && cartItem.selectedExtras.length > 0) ||
                              (cartItem.selectedBeverages && cartItem.selectedBeverages.length > 0)) && (
                                <div className="pt-2 border-t border-white/5 space-y-1">
                                  {cartItem.selectedExtras && cartItem.selectedExtras.length > 0 && (
                                    <div className="text-[10px] text-white/70">
                                      <span className="text-white/40 font-bold uppercase tracking-wider block">Extras:</span>
                                      <div className="flex flex-wrap gap-1 mt-0.5">
                                        {cartItem.selectedExtras.map((ex, idx) => (
                                          <span key={idx} className="bg-primary/20 text-primary-light border border-primary/20 rounded-full px-2 py-0.5 text-[9px] font-medium">
                                            {ex.name} (+R{ex.price.toFixed(2)})
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {cartItem.selectedBeverages && cartItem.selectedBeverages.length > 0 && (
                                    <div className="text-[10px] text-white/70">
                                      <span className="text-white/40 font-bold uppercase tracking-wider block">Beverages:</span>
                                      <div className="flex flex-wrap gap-1 mt-0.5">
                                        {cartItem.selectedBeverages.map((bev, idx) => (
                                          <span key={idx} className="bg-primary/20 text-primary-light border border-primary/20 rounded-full px-2 py-0.5 text-[9px] font-medium">
                                            {bev.name} (+R{bev.price.toFixed(2)})
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                            <div className="flex justify-between items-center pt-2">
                              <span className="text-[10px] uppercase text-white/30 tracking-widest font-black">Quantity</span>
                              <div className="flex items-center justify-between w-24 bg-bg-dark rounded-full p-0.5 border border-white/5">
                                <button
                                  onClick={() => decrementItem(item)}
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white/80 hover:bg-white/5 cursor-pointer"
                                >
                                  −
                                </button>
                                <span className="text-xs font-black text-white">{cartItem.quantity}</span>
                                <button
                                  onClick={() => incrementItem(item)}
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white/80 hover:bg-white/5 cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-white/10 pt-4 mt-2 space-y-3 bg-bg-card">
                      <div className="flex justify-between text-white font-extrabold text-sm px-2">
                        <span>Total:</span>
                        <span className="text-primary-light">R {totalCartPrice.toFixed(2)}</span>
                      </div>
                      <button
                        onClick={() => setCartStep('checkout')}
                        className="w-full py-4 bg-primary hover:bg-primary-light text-white font-extrabold rounded-full text-xs tracking-widest uppercase shadow-lg shadow-primary/20 border border-primary-light/20 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Proceed to Checkout</span> <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col h-full overflow-hidden justify-between">
                    <button
                      onClick={() => setCartStep('items')}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-primary-light uppercase tracking-widest hover:text-white transition-colors mb-4 cursor-pointer self-start"
                    >
                      ← Back to Plate
                    </button>

                    <div className="flex-1 overflow-y-auto space-y-6 pr-1">
                      <div className="space-y-2 text-sm border-b border-white/5 pb-4">
                        <div className="flex justify-between text-white/50 text-xs">
                          <span>Subtotal</span>
                          <span>R {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-white/50 text-xs">
                          <span>VAT (15%)</span>
                          <span>R {calculatedVat.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-extrabold text-white text-base pt-1">
                          <span>Grand Total</span>
                          <span className="text-primary-light">R {totalCartPrice.toFixed(2)}</span>
                        </div>
                      </div>

                      <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                        <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase block">Checkout Details</span>

                        {orderError && (
                          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center flex items-center justify-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-red-400" /> <span>{orderError}</span>
                          </div>
                        )}

                        <div className="space-y-3">
                          <input
                            type="text"
                            required
                            placeholder="Your Name (Required)*"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className={`w-full bg-[#151211] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none transition-all t-fire-input ${fieldErrors.name ? 'is-error' : ''} ${fieldShaking.name ? 'is-shaking' : ''}`}
                          />

                          <input
                            type="tel"
                            placeholder="Phone Number (Highly Recommended)"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className={`w-full bg-[#151211] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none transition-all t-fire-input ${fieldErrors.phone ? 'is-error' : ''} ${fieldShaking.phone ? 'is-shaking' : ''}`}
                          />

                          <input
                            type="email"
                            placeholder="Email Address (For order updates)"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            className={`w-full bg-[#151211] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none transition-all t-fire-input ${fieldErrors.email ? 'is-error' : ''} ${fieldShaking.email ? 'is-shaking' : ''}`}
                          />

                          <input
                            type="text"
                            placeholder="Special instructions (e.g. Extra Gravy)"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className={`w-full bg-[#151211] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none transition-all t-fire-input ${fieldErrors.notes ? 'is-error' : ''} ${fieldShaking.notes ? 'is-shaking' : ''}`}
                          />
                        </div>

                        <div className="bg-[#1c1513] border border-primary/20 rounded-xl p-3 text-center text-[10px] text-primary-light font-black tracking-widest uppercase mb-4 mt-2 animate-pulse-slow">
                          ● Pickup Order
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-4 bg-primary hover:bg-primary-light text-white font-extrabold rounded-full text-xs tracking-widest uppercase transition-all cursor-pointer shadow-lg shadow-primary/20 hover:shadow-primary/45 border border-primary-light/20 flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Sending to Kitchen...</span>
                            </>
                          ) : (
                            <span className="flex items-center justify-center gap-1.5">
                              <span>Submit Order</span> <Flame className="w-4 h-4" />
                            </span>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
