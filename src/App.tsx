import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import { supabase } from './lib/supabase';
import { useCartStore } from './store/useCartStore';
import { useMenuStore } from './store/useMenuStore';
import { useOrderTrackerStore } from './store/useOrderTrackerStore';
import type { User as SupaUser } from '@supabase/supabase-js';

// Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CustomizerModal } from './components/CustomizerModal';
import { ProfileModal } from './components/ProfileModal';
import { OrdersModal } from './components/OrdersModal';
import { AuthModal } from './components/AuthModal';
import { WelcomeLanguageModal } from './components/WelcomeLanguageModal';
import { CookieBanner } from './components/CookieBanner';
import { PrivacyModal } from './components/PrivacyModal';

// Pages
import { Home } from './pages/Home';
import { MenuPage } from './pages/MenuPage';
import { StoryPage } from './pages/StoryPage';
import { ContactPage } from './pages/ContactPage';

// Scroll to Top component for smooth page transitions
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
};

const CMS_URL = import.meta.env.VITE_CMS_URL || '';

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<SupaUser | null>(null);
  
  // Modal States not stored in Zustand
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(() => !localStorage.getItem('danny-m-onboarded'));
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isCookieForcedOpen, setIsCookieForcedOpen] = useState(false);

  // Zustand Store Selectors
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const activeCustomizerItem = useCartStore((state) => state.activeCustomizerItem);
  const setIsCartOpen = useCartStore((state) => state.setIsCartOpen);
  const setCartStep = useCartStore((state) => state.setCartStep);
  const setIsSubmitting = useCartStore((state) => state.setIsSubmitting);
  const setOrderSuccess = useCartStore((state) => state.setOrderSuccess);
  const setOrderError = useCartStore((state) => state.setOrderError);
  const setCart = useCartStore((state) => state.setCart);
  const clearCheckoutFields = useCartStore((state) => state.clearCheckoutFields);
  
  // Checkout values for metadata synchronization
  const customerName = useCartStore((state) => state.customerName);
  const customerPhone = useCartStore((state) => state.customerPhone);
  const customerEmail = useCartStore((state) => state.customerEmail);
  const deliveryAddress = useCartStore((state) => state.deliveryAddress);
  const setCustomerName = useCartStore((state) => state.setCustomerName);
  const setCustomerPhone = useCartStore((state) => state.setCustomerPhone);
  const setCustomerEmail = useCartStore((state) => state.setCustomerEmail);
  const setDeliveryAddress = useCartStore((state) => state.setDeliveryAddress);

  const categories = useMenuStore((state) => state.categories);
  const loadMenu = useMenuStore((state) => state.loadMenu);

  const activeOrderId = useOrderTrackerStore((state) => state.activeOrderId);
  const activeOrderData = useOrderTrackerStore((state) => state.activeOrderData);
  const setActiveOrderId = useOrderTrackerStore((state) => state.setActiveOrderId);
  const setCartSidebarTab = useOrderTrackerStore((state) => state.setCartSidebarTab);
  const loadOrderStatus = useOrderTrackerStore((state) => state.loadOrderStatus);

  // 1. Initial Data Fetch
  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  // POPIA Privacy Deep-linking support
  useEffect(() => {
    const handleHashAndSearchChange = () => {
      const params = new URLSearchParams(window.location.search);
      const isPrivacy = params.get('privacy') === 'true' || window.location.hash === '#privacy';
      if (isPrivacy) {
        setIsPrivacyModalOpen(true);
      }
    };

    handleHashAndSearchChange();
    window.addEventListener('hashchange', handleHashAndSearchChange);
    return () => window.removeEventListener('hashchange', handleHashAndSearchChange);
  }, []);

  // 2. Supabase Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 3. Pre-fill checkout fields from Supabase Auth user metadata
  useEffect(() => {
    if (!user) return;
    if (user.user_metadata) {
      if (user.user_metadata.full_name && !customerName) {
        setCustomerName(user.user_metadata.full_name);
      }
      if (user.user_metadata.phone && !customerPhone) {
        setCustomerPhone(user.user_metadata.phone);
      }
      if (user.user_metadata.delivery_address && !deliveryAddress) {
        setDeliveryAddress(user.user_metadata.delivery_address);
      }
    }
    if (user.email && !customerEmail) {
      setCustomerEmail(user.email);
    }
  }, [user, customerName, customerPhone, customerEmail, deliveryAddress, setCustomerName, setCustomerPhone, setCustomerEmail, setDeliveryAddress]);

  // 4. Poll Order Status from Next.js CMS API
  useEffect(() => {
    if (!activeOrderId) return;

    // Initial fetch
    loadOrderStatus();

    // Set up polling interval every 15 seconds
    const intervalId = setInterval(() => {
      loadOrderStatus();
    }, 15000);

    return () => clearInterval(intervalId);
  }, [activeOrderId, loadOrderStatus]);

  // 5. Scroll Lock effect for open modals
  useEffect(() => {
    const isModalActive = isCartOpen || !!activeCustomizerItem || isAuthModalOpen || isProfileModalOpen || isOrdersModalOpen || isWelcomeModalOpen || isPrivacyModalOpen;
    if (isModalActive) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isCartOpen, activeCustomizerItem, isAuthModalOpen, isProfileModalOpen, isOrdersModalOpen, isWelcomeModalOpen, isPrivacyModalOpen]);

  // 6. Reconcile Yoco Hosted Checkout Redirect Callback States (Success & Cancel)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const yocoSuccess = params.get('yoco_success');
    const yocoCancel = params.get('yoco_cancel');

    if (yocoSuccess === 'true') {
      const settleOrder = async () => {
        try {
          const pendingStr = localStorage.getItem('danny-m-pending-order');
          if (!pendingStr) {
            console.warn('No pending order payload found in localStorage.');
            return;
          }
          const pending = JSON.parse(pendingStr);

          // Get active authenticated user session securely
          const { data: { session } } = await supabase.auth.getSession();
          const activeUser = session?.user;
          if (!activeUser) {
            alert('Authentication lost. Please sign in to finalize your order.');
            setIsAuthModalOpen(true);
            return;
          }

          setIsSubmitting(true);
          setOrderError(null);

          // Submit order to Supabase orders table
          const { error: dbError } = await supabase.from('orders').insert({
            user_id: activeUser.id,
            total: pending.total,
            notes: pending.notes || null,
            items: pending.supabaseItems
          });

          if (dbError) {
            console.error('Supabase DB Sync Error during reconciliation:', dbError);
            throw new Error(dbError.message || 'Failed to sync order to Supabase database.');
          }

          // Post order to CMS / Turso database
          const res = await fetch(`${CMS_URL}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pending.cmsPayload)
          });

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to submit order to CMS.');
          }

          const orderData = await res.json();
          if (orderData && orderData.id) {
            setActiveOrderId(orderData.id);
            setCartSidebarTab('tracker');
          }

          // Finalize Success State
          setOrderSuccess(true);
          setIsCartOpen(true); // Open cart to show success medallions
          setCart({}); // flush active cart
          clearCheckoutFields();
          localStorage.removeItem('danny-m-pending-order');
        } catch (err: unknown) {
          console.error('Order Settlement Error:', err);
          const errMsg = err instanceof Error ? err.message : String(err);
          alert('Saved locally. Order settlement failed: ' + errMsg);
        } finally {
          setIsSubmitting(false);
          // Clean URL params to avoid re-triggering on reload
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      };

      settleOrder();
    } else if (yocoCancel === 'true') {
      alert('Payment was cancelled on the Yoco secure checkout page. Feel free to review your traditional plate and try again.');
      setIsCartOpen(true);
      setCartStep('checkout');
      // Clean URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user, categories, setIsCartOpen, setCartStep, setIsSubmitting, setOrderSuccess, setOrderError, setCart, clearCheckoutFields, setActiveOrderId, setCartSidebarTab]);

  return (
    <div className="min-h-screen bg-bg-light text-white/90 font-body selection:bg-primary selection:text-white overflow-x-hidden">
      <ScrollToTop />
      <WelcomeLanguageModal isOpen={isWelcomeModalOpen} onClose={() => setIsWelcomeModalOpen(false)} />
      {/* Navigation */}
      <Navbar
        user={user}
        setUser={setUser}
        setIsAuthModalOpen={setIsAuthModalOpen}
        setIsProfileModalOpen={setIsProfileModalOpen}
        setIsOrdersModalOpen={setIsOrdersModalOpen}
      />

      {/* Pages Container with Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/story" element={<StoryPage />} />
        <Route path="/about" element={<Navigate to="/story" replace />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>

      {/* Styled Footer */}
      <Footer
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
        onOpenCookies={() => setIsCookieForcedOpen(true)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        user={user}
        setIsAuthModalOpen={setIsAuthModalOpen}
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
      />

      {/* Item Customizer Modal */}
      <CustomizerModal />

      {/* Profile settings Modal */}
      <ProfileModal
        user={user}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Past Orders Modal */}
      <OrdersModal
        user={user}
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(loggedUser) => setUser(loggedUser)}
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
      />

      {/* POPIA Compliance Controls */}
      <CookieBanner
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
        forceOpen={isCookieForcedOpen}
        onCloseForceOpen={() => setIsCookieForcedOpen(false)}
      />

      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      {/* Active Order Floating Tracker Badge */}
      {activeOrderId && activeOrderData && !isCartOpen && (
        <div className="fixed bottom-6 left-6 z-50 animate-fade-in">
          <button
            onClick={() => {
              setCartSidebarTab('tracker');
              setIsCartOpen(true);
            }}
            className="flex items-center gap-3 bg-bg-card/90 border border-primary/20 hover:border-primary text-white px-5 py-3 rounded-full shadow-[0_10px_30px_rgba(217,93,46,0.2)] hover:shadow-[0_10px_35px_rgba(217,93,46,0.35)] backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer relative"
          >
            <span className="relative flex h-2 w-2">
              {['Received', 'Preparing', 'Ready'].includes(activeOrderData.status) && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              )}
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-[10px] font-black tracking-widest uppercase text-white/90 flex items-center justify-center gap-1.5">
              <span>Track order:</span> <span className="text-primary-light">{activeOrderData.status}</span> <ChefHat className="w-3.5 h-3.5 text-primary-light inline" />
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
