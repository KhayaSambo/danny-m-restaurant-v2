import { create } from 'zustand';
import { fetchOrderStatus } from '../lib/api';
import type { ActiveOrderDetails } from '../types';

interface OrderTrackerState {
  activeOrderId: string | null;
  activeOrderData: ActiveOrderDetails | null;
  cartSidebarTab: 'cart' | 'tracker';
  prevStatus: string | null;

  // Actions
  setActiveOrderId: (id: string | null) => void;
  setActiveOrderData: (data: ActiveOrderDetails | null) => void;
  setCartSidebarTab: (tab: 'cart' | 'tracker') => void;
  loadOrderStatus: () => Promise<void>;
  dismissTracking: () => void;
}

// Global Audio ref for status changes
let readyAudio: HTMLAudioElement | null = null;
try {
  readyAudio = new Audio('https://cdn.pixabay.com/audio/2022/03/16/audio_53b8a1f5a7.mp3');
} catch (e) {
  console.warn('Audio is not supported in this environment', e);
}

export const useOrderTrackerStore = create<OrderTrackerState>((set, get) => {
  const initOrderId = localStorage.getItem('danny-m-active-order-id');
  const initSidebarTab = initOrderId ? 'tracker' : 'cart';

  return {
    activeOrderId: initOrderId,
    activeOrderData: null,
    cartSidebarTab: initSidebarTab,
    prevStatus: null,

    setActiveOrderId: (id) => {
      if (id) {
        localStorage.setItem('danny-m-active-order-id', id);
      } else {
        localStorage.removeItem('danny-m-active-order-id');
      }
      set({ activeOrderId: id });
    },

    setActiveOrderData: (data) => {
      const { prevStatus } = get();
      const currentStatus = data?.status;

      if (currentStatus === 'Ready' && prevStatus !== 'Ready' && readyAudio) {
        readyAudio.play().catch((err) => console.error('Audio play error', err));
      }

      set({
        activeOrderData: data,
        prevStatus: currentStatus || null
      });
    },

    setCartSidebarTab: (tab) => set({ cartSidebarTab: tab }),

    loadOrderStatus: async () => {
      const { activeOrderId } = get();
      if (!activeOrderId) return;
      try {
        const data = (await fetchOrderStatus(activeOrderId)) as ActiveOrderDetails;
        get().setActiveOrderData(data);
      } catch (err) {
        console.error('Error in loadOrderStatus store action:', err);
      }
    },

    dismissTracking: () => {
      localStorage.removeItem('danny-m-active-order-id');
      set({
        activeOrderId: null,
        activeOrderData: null,
        cartSidebarTab: 'cart',
        prevStatus: null
      });
    }
  };
});
