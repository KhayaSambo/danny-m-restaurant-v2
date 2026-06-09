import { create } from 'zustand';
import type { Category, MenuItem, BundleDeal } from '../types';
import { fetchMenu, fetchBundleDeals } from '../lib/api';

interface MenuState {
  categories: Category[];
  bundleDeals: BundleDeal[];
  loading: boolean;
  error: string | null;
  selectedCategoryId: string;

  // Actions
  setSelectedCategoryId: (id: string) => void;
  loadMenu: () => Promise<void>;
  getAllMenuItems: () => MenuItem[];
  getDisplayedMenuItems: () => MenuItem[];
}

export const useMenuStore = create<MenuState>((set, get) => ({
  categories: [],
  bundleDeals: [],
  loading: true,
  error: null,
  selectedCategoryId: 'all',

  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),

  loadMenu: async () => {
    try {
      set({ loading: true, error: null });
      const [menuData, bundlesData] = await Promise.all([
        fetchMenu(),
        fetchBundleDeals()
      ]);

      const now = new Date();
      const filteredMenuData = menuData.map(cat => ({
        ...cat,
        menuItems: cat.menuItems.filter(item => {
          if (item.availableFrom) {
            const fromDate = new Date(item.availableFrom);
            fromDate.setHours(0, 0, 0, 0);
            if (fromDate > now) return false;
          }
          if (item.availableUntil) {
            const untilDate = new Date(item.availableUntil);
            untilDate.setHours(23, 59, 59, 999);
            if (untilDate < now) return false;
          }
          return true;
        })
      }));

      set({ categories: filteredMenuData, bundleDeals: bundlesData, loading: false });
    } catch (err: unknown) {
      console.error('Error in loadMenu store action:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      set({ error: errMsg || 'Could not connect to the CMS server.', loading: false });
    }
  },

  getAllMenuItems: () => {
    return get().categories.flatMap(cat => cat.menuItems);
  },

  getDisplayedMenuItems: () => {
    const { categories, selectedCategoryId } = get();
    const allItems = categories.flatMap(cat => cat.menuItems);
    
    if (selectedCategoryId === 'all') {
      return allItems;
    }
    
    return categories.find(cat => cat.id === selectedCategoryId)?.menuItems || [];
  }
}));
