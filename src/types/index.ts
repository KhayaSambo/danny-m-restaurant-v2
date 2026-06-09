export interface SpecialOffer {
  id: string;
  name: string;
  description: string | null;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  stock: number;
  isAvailable: boolean;
  isChefRecommend?: boolean;
  categoryId: string | null;
  primaryStarchOptions?: string | null;
  complementarySaladOptions?: string | null;
  sideVeggieOptions?: string | null;
  addOnSides?: string | null;
  beverages?: string | null;
  specialOffers?: SpecialOffer[];
  isSpecial?: boolean;
  availableFrom?: string | null;
  availableUntil?: string | null;
}

export interface BundleItem {
  id: string;
  bundleDealId: string;
  menuItemId: string;
  quantity: number;
  menuItem?: MenuItem;
}

export interface BundleDeal {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isActive: boolean;
  items: BundleItem[];
  primaryStarchOptions?: string | null;
  complementarySaladOptions?: string | null;
  sideVeggieOptions?: string | null;
  addOnSides?: string | null;
}
export interface Category {
  id: string;
  name: string;
  menuItems: MenuItem[];
}

export interface CartItem {
  item?: MenuItem;
  bundle?: BundleDeal;
  isBundle: boolean;
  quantity: number;
  selectedStarch?: string;
  selectedSalad?: string;
  selectedVeggie?: string;
  selectedExtras?: { name: string; price: number }[];
  selectedBeverages?: { name: string; price: number }[];
}

export interface DBOrder {
  id: string;
  user_id: string;
  total: number;
  status: string;
  notes: string | null;
  items: unknown; // JSONB representing the items details
  created_at: string;
}

export interface CMSOrderPayload {
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  type: 'Pickup' | 'Delivery';
  deliveryAddress?: string;
  notes?: string;
  total: number;
  items: {
    menuItemId: string;
    quantity: number;
    priceAtTime: number;
  }[];
}

export interface UserProfile {
  id: string;
  phone?: string;
  points?: number;
  created_at?: string;
}

export interface ActiveOrderDetails {
  id: string;
  status: string;
  type?: 'Pickup' | 'Delivery';
  total?: number;
  notes?: string;
  items?: unknown;
}
