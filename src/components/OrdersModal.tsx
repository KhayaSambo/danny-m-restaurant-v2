import React, { useState, useEffect } from 'react';
import { Utensils, ShoppingBag, Sparkles } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useMenuStore } from '../store/useMenuStore';
import { supabase } from '../lib/supabase';
import { safeJsonParse } from '../utils/helpers';
import type { MenuItem, DBOrder } from '../types';
import type { User as SupaUser } from '@supabase/supabase-js';

export interface PastOrderItem {
  menuItemId: string;
  quantity: number;
  name?: string;
  priceAtTime?: number;
  selectedStarch?: string;
  selectedSalad?: string;
  selectedVeggie?: string;
  selectedExtras?: { name: string; price: number }[];
  selectedBeverages?: { name: string; price: number }[];
}

interface OrdersModalProps {
  user: SupaUser | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrdersModal: React.FC<OrdersModalProps> = ({ user, isOpen, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [pastOrders, setPastOrders] = useState<DBOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const cart = useCartStore((state) => state.cart);
  const setCart = useCartStore((state) => state.setCart);
  const setIsCartOpen = useCartStore((state) => state.setIsCartOpen);
  const categories = useMenuStore((state) => state.categories);

  useEffect(() => {
    if (!isOpen || !user) return;

    let active = true;
    const fetchPastOrders = async () => {
      try {
        // Run asynchronously to avoid direct set state within effect warning
        Promise.resolve().then(() => {
          if (active) setLoadingOrders(true);
        });

        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        if (active) {
          setPastOrders((data as DBOrder[]) || []);
        }
      } catch (err) {
        console.error('Error fetching past orders:', err);
      } finally {
        if (active) {
          setLoadingOrders(false);
        }
      }
    };

    fetchPastOrders();

    return () => {
      active = false;
    };
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleCloseOrdersModal = () => {
    setIsClosing(true);
    const closeMs = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--modal-close-dur")
    ) || 150;
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, closeMs);
  };

  const handleReorder = (orderItems: PastOrderItem[]) => {
    const newCart = { ...cart };
    
    // Flatten categories to get all menu items
    const allMenuItems: MenuItem[] = [];
    categories.forEach(cat => {
      cat.menuItems.forEach(item => {
        allMenuItems.push(item);
      });
    });
    
    orderItems.forEach((orderItem) => {
      const item = allMenuItems.find(i => i.id === orderItem.menuItemId);
      if (item) {
        if (newCart[item.id]) {
          newCart[item.id].quantity += orderItem.quantity;
        } else {
          newCart[item.id] = {
            item,
            quantity: orderItem.quantity,
            selectedStarch: orderItem.selectedStarch || undefined,
            selectedSalad: orderItem.selectedSalad || undefined,
            selectedVeggie: orderItem.selectedVeggie || undefined,
            selectedExtras: orderItem.selectedExtras || [],
            selectedBeverages: orderItem.selectedBeverages || []
          };
        }
      }
    });
    
    setCart(newCart);
    handleCloseOrdersModal();
    setIsCartOpen(true);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/75 backdrop-blur-sm transition-opacity duration-300 ${!isClosing ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleCloseOrdersModal}
      />
      {/* Modal Card */}
      <div className={`fixed inset-x-4 bottom-4 top-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[680px] md:max-h-[90vh] z-50 bg-bg-card/98 border border-white/10 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.95)] backdrop-blur-2xl overflow-hidden flex flex-col justify-between t-modal ${!isClosing ? 'is-open' : 'is-closing'}`}>
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-bg-dark/30 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Utensils className="w-6 h-6 text-primary-light" />
            <div>
              <h3 className="font-heading text-lg font-extrabold text-white tracking-tight uppercase">Order History</h3>
              <p className="text-[10px] text-primary-light font-black tracking-widest uppercase mt-0.5">Your Authentic Pretoria Feasts</p>
            </div>
          </div>
          <button
            onClick={handleCloseOrdersModal}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Orders List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loadingOrders ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-white/40 uppercase tracking-widest font-black">Fetching Feast Logs...</span>
            </div>
          ) : pastOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 text-white/10" />
              <h4 className="font-heading text-sm font-bold text-white uppercase tracking-tight">No Feasts Logged Yet</h4>
              <p className="text-[10px] text-white/40 max-w-xs leading-relaxed">
                You haven't ordered any delicious traditional plates under this account yet. Time to slow-cook some wonders!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pastOrders.map((order) => {
                const orderDate = new Date(order.created_at).toLocaleDateString('en-ZA', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                const items = typeof order.items === 'string' ? safeJsonParse<PastOrderItem[]>(order.items, []) : ((order.items as PastOrderItem[]) || []);

                return (
                  <div key={order.id} className="bg-bg-dark/45 border border-white/5 rounded-3xl p-5 space-y-4 shadow-inner relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(217,93,46,0.02)_0%,transparent_75%)] pointer-events-none" />
                    
                    {/* Header details */}
                    <div className="flex justify-between items-start gap-4 flex-wrap pb-3 border-b border-white/5">
                      <div className="space-y-0.5">
                        <span className="block text-[10px] text-white/40 font-bold">{orderDate}</span>
                        <span className="block text-[9px] uppercase tracking-wider text-primary-light font-black">ID: #{order.id.slice(0, 8)}</span>
                      </div>
                      
                      <div className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${
                        order.status === 'Completed'
                          ? 'bg-green-500/10 border-green-500/20 text-green-400'
                          : order.status === 'Cancelled'
                            ? 'bg-red-500/10 border-red-500/20 text-red-400'
                            : order.status === 'Ready'
                              ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-450 animate-pulse'
                              : 'bg-primary/10 border-primary/20 text-primary-light'
                      }`}>
                        {order.status}
                      </div>
                    </div>

                    {/* Order Items List */}
                    <div className="space-y-2.5">
                      {items.map((it: PastOrderItem, idx: number) => (
                        <div key={idx} className="flex justify-between items-start text-xs">
                          <div className="min-w-0 pr-4">
                            <span className="font-bold text-white uppercase">{it.name || `Meal item #${it.menuItemId}`}</span>
                            <span className="text-[10px] text-white/50 block mt-0.5">
                              {[it.selectedStarch, it.selectedSalad, it.selectedVeggie].filter(Boolean).join(', ')}
                            </span>
                          </div>
                          <span className="text-white/60 font-medium font-mono flex-shrink-0">
                            {it.quantity}x <span className="text-[10px] text-white/30 font-bold">@ R{it.priceAtTime?.toFixed(2) || '0.00'}</span>
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Total & Reorder Button footer */}
                    <div className="pt-3 border-t border-white/5 flex justify-between items-center flex-wrap gap-3">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-white/35 font-bold block">Total Paid</span>
                        <span className="text-sm font-black text-primary-light">R {order.total?.toFixed(2) || '0.00'}</span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleReorder(items)}
                        className="flex items-center gap-1.5 px-4.5 py-2.5 bg-white/5 border border-white/10 hover:border-primary-light/30 hover:bg-primary/10 hover:text-primary-light text-white font-bold rounded-full text-[9px] tracking-widest uppercase transition-all cursor-pointer hover:scale-105 active:scale-95 animate-in fade-in"
                      >
                        <span>Reorder Feast</span> <Sparkles className="w-3.5 h-3.5 text-primary-light" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-bg-dark/30 flex justify-end flex-shrink-0">
          <button
            type="button"
            onClick={handleCloseOrdersModal}
            className="px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-full text-[10px] tracking-widest uppercase transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </>
  );
};
