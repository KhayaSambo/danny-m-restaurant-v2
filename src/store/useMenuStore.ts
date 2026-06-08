import { create } from 'zustand';
import type { Category, MenuItem } from '../types';
import { fetchMenu } from '../lib/api';

interface MenuState {
  categories: Category[];
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
  loading: true,
  error: null,
  selectedCategoryId: 'all',

  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),

  loadMenu: async () => {
    try {
      set({ loading: true, error: null });
      const data = await fetchMenu();
      set({ categories: data, loading: false });
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
