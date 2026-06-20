import { create } from 'zustand';
import type { MenuItem, CartItem, BundleDeal } from '../types';
import { safeJsonParse, parseExtraPrice, getItemPrice } from '../utils/helpers';

interface CartState {
  cart: Record<string, CartItem>;
  isCartOpen: boolean;
  isCartClosing: boolean;
  cartStep: 'items' | 'checkout';
  isSubmitting: boolean;
  orderSuccess: boolean;
  orderError: string | null;

  // Checkout Fields
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceMode: 'Pickup' | 'Delivery';
  deliveryAddress: string;
  notes: string;
  fieldErrors: Record<string, boolean>;
  fieldShaking: Record<string, boolean>;

  // Customizer Fields
  activeCustomizerItem: MenuItem | BundleDeal | null;
  isCustomizerClosing: boolean;
  customStarch: string;
  customSalad: string;
  customVeggie: string;
  customExtras: Record<string, boolean>;
  customBeverages: Record<string, boolean>;

  // Computed Selectors
  totalCartCount: () => number;
  totalCartPrice: () => number;

  // Cart Actions
  setIsCartOpen: (open: boolean) => void;
  setIsCartClosing: (closing: boolean) => void;
  setCartStep: (step: 'items' | 'checkout') => void;
  setIsSubmitting: (submitting: boolean) => void;
  setOrderSuccess: (success: boolean) => void;
  setOrderError: (error: string | null) => void;
  incrementItem: (item: MenuItem | BundleDeal) => void;
  decrementItem: (item: MenuItem | BundleDeal) => void;
  removeItem: (itemId: string) => void;
  updateItemOption: (itemId: string, field: 'selectedStarch' | 'selectedSalad' | 'selectedVeggie', value: string) => void;
  clearCart: () => void;
  setCart: (cart: Record<string, CartItem>) => void;

  // Form Actions
  setCustomerName: (name: string) => void;
  setCustomerPhone: (phone: string) => void;
  setCustomerEmail: (email: string) => void;
  setServiceMode: (mode: 'Pickup' | 'Delivery') => void;
  setDeliveryAddress: (address: string) => void;
  setNotes: (notes: string) => void;
  triggerFieldShake: (fieldName: string) => void;
  clearCheckoutFields: () => void;

  // Customizer Actions
  setActiveCustomizerItem: (item: MenuItem | BundleDeal | null) => void;
  setIsCustomizerClosing: (closing: boolean) => void;
  setCustomStarch: (starch: string) => void;
  setCustomSalad: (salad: string) => void;
  setCustomVeggie: (veggie: string) => void;
  toggleCustomExtra: (extraName: string) => void;
  toggleCustomBeverage: (bevName: string) => void;
  confirmCustomization: () => void;
  addClick: (item: MenuItem | BundleDeal) => void;
}

export const useCartStore = create<CartState>((set, get) => {
  // Read Initial LocalStorage values
  const initCart = safeJsonParse<Record<string, CartItem>>(localStorage.getItem('danny-m-cart'), {});
  const initName = localStorage.getItem('danny-m-customer-name') || '';
  const initPhone = localStorage.getItem('danny-m-customer-phone') || '';
  const initEmail = localStorage.getItem('danny-m-customer-email') || '';
  const initAddress = localStorage.getItem('danny-m-delivery-address') || '';
  const initNotes = localStorage.getItem('danny-m-notes') || '';

  return {
    cart: initCart,
    isCartOpen: false,
    isCartClosing: false,
    cartStep: 'items',
    isSubmitting: false,
    orderSuccess: false,
    orderError: null,

    customerName: initName,
    customerPhone: initPhone,
    customerEmail: initEmail,
    serviceMode: 'Pickup',
    deliveryAddress: initAddress,
    notes: initNotes,
    fieldErrors: {},
    fieldShaking: {},

    activeCustomizerItem: null,
    isCustomizerClosing: false,
    customStarch: '',
    customSalad: '',
    customVeggie: '',
    customExtras: {},
    customBeverages: {},

    totalCartCount: () => {
      return Object.values(get().cart).reduce((acc, qty) => acc + qty.quantity, 0);
    },

    totalCartPrice: () => {
      return Object.values(get().cart).reduce((acc, cartItem) => acc + (getItemPrice(cartItem) * cartItem.quantity), 0);
    },

    setIsCartOpen: (open) => set({ isCartOpen: open }),
    setIsCartClosing: (closing) => set({ isCartClosing: closing }),
    setCartStep: (step) => set({ cartStep: step }),
    setIsSubmitting: (submitting) => set({ isSubmitting: submitting }),
    setOrderSuccess: (success) => set({ orderSuccess: success }),
    setOrderError: (error) => set({ orderError: error }),

    incrementItem: (item) => {
      const { cart } = get();
      const isBundle = 'items' in item;
      const itemId = isBundle ? `bundle-${item.id}` : item.id;
      const currentQty = cart[itemId]?.quantity || 0;

      if (!isBundle && (item as MenuItem).stock > 0 && currentQty >= (item as MenuItem).stock) {
        alert(`Limit reached. Only ${(item as MenuItem).stock} portions of ${(item as MenuItem).name} are currently available in stock.`);
        return;
      }

      const starches = safeJsonParse<string[]>(item.primaryStarchOptions, []);
      const salads = safeJsonParse<string[]>(item.complementarySaladOptions, []);
      const veggies = safeJsonParse<string[]>(item.sideVeggieOptions, []);

      const newCart = {
        ...cart,
        [itemId]: {
          item: isBundle ? undefined : (item as MenuItem),
          bundle: isBundle ? (item as BundleDeal) : undefined,
          isBundle,
          quantity: currentQty + 1,
          selectedStarch: cart[itemId]?.selectedStarch || (starches[0] || undefined),
          selectedSalad: cart[itemId]?.selectedSalad || (salads[0] || undefined),
          selectedVeggie: cart[itemId]?.selectedVeggie || (veggies[0] || undefined),
          selectedExtras: cart[itemId]?.selectedExtras || [],
          selectedBeverages: cart[itemId]?.selectedBeverages || []
        }
      };

      localStorage.setItem('danny-m-cart', JSON.stringify(newCart));
      set({ cart: newCart });
    },

    decrementItem: (item) => {
      const { cart } = get();
      const isBundle = 'items' in item;
      const itemId = isBundle ? `bundle-${item.id}` : item.id;
      const currentQty = cart[itemId]?.quantity || 0;
      const newCart = { ...cart };

      if (currentQty <= 1) {
        delete newCart[itemId];
      } else {
        newCart[itemId] = {
          ...cart[itemId],
          quantity: currentQty - 1
        };
      }

      localStorage.setItem('danny-m-cart', JSON.stringify(newCart));
      set({ cart: newCart });
    },

    removeItem: (itemId) => {
      const { cart } = get();
      const newCart = { ...cart };
      delete newCart[itemId];
      localStorage.setItem('danny-m-cart', JSON.stringify(newCart));
      set({ cart: newCart });
    },

    updateItemOption: (itemId, field, value) => {
      const { cart } = get();
      if (!cart[itemId]) return;

      const newCart = {
        ...cart,
        [itemId]: {
          ...cart[itemId],
          [field]: value
        }
      };

      localStorage.setItem('danny-m-cart', JSON.stringify(newCart));
      set({ cart: newCart });
    },

    clearCart: () => {
      localStorage.removeItem('danny-m-cart');
      set({ cart: {} });
    },

    setCart: (newCart) => {
      localStorage.setItem('danny-m-cart', JSON.stringify(newCart));
      set({ cart: newCart });
    },

    setCustomerName: (name) => {
      localStorage.setItem('danny-m-customer-name', name);
      set((state) => ({
        customerName: name,
        fieldErrors: { ...state.fieldErrors, name: false },
        fieldShaking: { ...state.fieldShaking, name: false }
      }));
    },

    setCustomerPhone: (phone) => {
      localStorage.setItem('danny-m-customer-phone', phone);
      set((state) => ({
        customerPhone: phone,
        fieldErrors: { ...state.fieldErrors, phone: false },
        fieldShaking: { ...state.fieldShaking, phone: false }
      }));
    },

    setCustomerEmail: (email) => {
      localStorage.setItem('danny-m-customer-email', email);
      set((state) => ({
        customerEmail: email,
        fieldErrors: { ...state.fieldErrors, email: false },
        fieldShaking: { ...state.fieldShaking, email: false }
      }));
    },

    setServiceMode: (mode) => set({ serviceMode: mode }),

    setDeliveryAddress: (address) => {
      localStorage.setItem('danny-m-delivery-address', address);
      set((state) => ({
        deliveryAddress: address,
        fieldErrors: { ...state.fieldErrors, deliveryAddress: false },
        fieldShaking: { ...state.fieldShaking, deliveryAddress: false }
      }));
    },

    setNotes: (notes) => {
      localStorage.setItem('danny-m-notes', notes);
      set((state) => ({
        notes,
        fieldErrors: { ...state.fieldErrors, notes: false },
        fieldShaking: { ...state.fieldShaking, notes: false }
      }));
    },

    triggerFieldShake: (fieldName) => {
      set((state) => ({
        fieldErrors: { ...state.fieldErrors, [fieldName]: true },
        fieldShaking: { ...state.fieldShaking, [fieldName]: true }
      }));
      setTimeout(() => {
        set((state) => ({
          fieldShaking: { ...state.fieldShaking, [fieldName]: false }
        }));
      }, 280);
    },

    clearCheckoutFields: () => {
      localStorage.removeItem('danny-m-customer-name');
      localStorage.removeItem('danny-m-customer-phone');
      localStorage.removeItem('danny-m-customer-email');
      localStorage.removeItem('danny-m-delivery-address');
      localStorage.removeItem('danny-m-notes');
      set({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        deliveryAddress: '',
        notes: ''
      });
    },

    setActiveCustomizerItem: (item) => {
      if (item) {
        const starches = safeJsonParse<string[]>(item.primaryStarchOptions, []);
        const salads = safeJsonParse<string[]>(item.complementarySaladOptions, []);
        const veggies = safeJsonParse<string[]>(item.sideVeggieOptions, []);

        set({
          activeCustomizerItem: item,
          customStarch: starches[0] || '',
          customSalad: salads[0] || '',
          customVeggie: veggies[0] || '',
          customExtras: {},
          customBeverages: {}
        });
      } else {
        set({ activeCustomizerItem: null });
      }
    },

    setIsCustomizerClosing: (closing) => set({ isCustomizerClosing: closing }),
    setCustomStarch: (starch) => set({ customStarch: starch }),
    setCustomSalad: (salad) => set({ customSalad: salad }),
    setCustomVeggie: (veggie) => set({ customVeggie: veggie }),

    toggleCustomExtra: (extraName) => {
      const { customExtras } = get();
      set({
        customExtras: {
          ...customExtras,
          [extraName]: !customExtras[extraName]
        }
      });
    },

    toggleCustomBeverage: (bevName) => {
      const { customBeverages } = get();
      set({
        customBeverages: {
          ...customBeverages,
          [bevName]: !customBeverages[bevName]
        }
      });
    },

    confirmCustomization: () => {
      const {
        activeCustomizerItem,
        customStarch,
        customSalad,
        customVeggie,
        customExtras,
        customBeverages,
        cart
      } = get();

      if (!activeCustomizerItem) return;

      const starches = safeJsonParse<string[]>(activeCustomizerItem.primaryStarchOptions, []);
      const salads = safeJsonParse<string[]>(activeCustomizerItem.complementarySaladOptions, []);
      const veggies = safeJsonParse<string[]>(activeCustomizerItem.sideVeggieOptions, []);
      const extrasList = safeJsonParse<{ name: string; price: string | number }[]>(activeCustomizerItem.addOnSides, []);
      const beveragesList = safeJsonParse<{ name: string; price: string | number }[]>(activeCustomizerItem.beverages, []);

      const selectedExtrasObj = extrasList
        .filter((extra) => customExtras[extra.name])
        .map((extra) => ({ name: extra.name, price: parseExtraPrice(extra.price) }));

      const selectedBeveragesObj = beveragesList
        .filter((bev) => customBeverages[bev.name])
        .map((bev) => ({ name: bev.name, price: parseExtraPrice(bev.price) }));

      const isBundle = 'items' in activeCustomizerItem;
      const itemId = isBundle ? `bundle-${activeCustomizerItem.id}` : activeCustomizerItem.id;
      const currentQty = cart[itemId]?.quantity || 0;

      const newCart = {
        ...cart,
        [itemId]: {
          item: isBundle ? undefined : (activeCustomizerItem as MenuItem),
          bundle: isBundle ? (activeCustomizerItem as BundleDeal) : undefined,
          isBundle,
          quantity: currentQty + 1,
          selectedStarch: customStarch || (starches[0] || undefined),
          selectedSalad: customSalad || (salads[0] || undefined),
          selectedVeggie: customVeggie || (veggies[0] || undefined),
          selectedExtras: selectedExtrasObj,
          selectedBeverages: selectedBeveragesObj
        }
      };

      localStorage.setItem('danny-m-cart', JSON.stringify(newCart));
      set({ cart: newCart });
    },

    addClick: (item) => {
      const starches = safeJsonParse<string[]>(item.primaryStarchOptions, []);
      const salads = safeJsonParse<string[]>(item.complementarySaladOptions, []);
      const veggies = safeJsonParse<string[]>(item.sideVeggieOptions, []);
      const extras = safeJsonParse<{ name: string; price: string | number }[]>(item.addOnSides, []);
      const bevs = safeJsonParse<{ name: string; price: string | number }[]>(item.beverages, []);

      if (starches.length > 0 || salads.length > 0 || veggies.length > 0 || extras.length > 0 || bevs.length > 0) {
        get().setActiveCustomizerItem(item);
      } else {
        const isBundle = 'items' in item;
        if (isBundle) {
          const itemId = `bundle-${item.id}`;
          const { cart } = get();
          const currentQty = cart[itemId]?.quantity || 0;
          const newCart = {
            ...cart,
            [itemId]: {
              bundle: item as BundleDeal,
              isBundle: true,
              quantity: currentQty + 1,
              selectedExtras: [],
              selectedBeverages: []
            }
          };
          localStorage.setItem('danny-m-cart', JSON.stringify(newCart));
          set({ cart: newCart });
        } else {
          get().incrementItem(item);
        }
      }
    }
  };
});
