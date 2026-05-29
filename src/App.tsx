import React, { useState, useEffect, useRef } from 'react';
import {
  Salad,
  Handshake,
  Flame,
  ShoppingCart,
  Utensils,
  Wine,
  CreditCard,
  Home,
  Sparkles,
  AlertTriangle,
  MapPin,
  Clock,
  Package,
  Check,
  Bike,
  Car,
  Inbox,
  ChefHat,
  UtensilsCrossed,
  ShoppingBag,
  Info,
  User,
  LogOut
} from 'lucide-react';


import { supabase } from './lib/supabase';
import { AuthModal } from './components/AuthModal';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  stock: number;
  isAvailable: boolean;
  categoryId: string | null;
  primaryStarchOptions?: string | null;
  complementarySaladOptions?: string | null;
  sideVeggieOptions?: string | null;
  addOnSides?: string | null;
  beverages?: string | null;
}

interface Category {
  id: string;
  name: string;
  menuItems: MenuItem[];
}

interface CartItem {
  item: MenuItem;
  quantity: number;
  selectedStarch?: string;
  selectedSalad?: string;
  selectedVeggie?: string;
  selectedExtras?: { name: string; price: number }[];
  selectedBeverages?: { name: string; price: number }[];
}

const CMS_URL = import.meta.env.VITE_CMS_URL || '';

const App: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Database API States
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  // Checkout and Cart States
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Order Tracking States
  const [activeOrderId, setActiveOrderId] = useState<string | null>(() => {
    return localStorage.getItem('danny-m-active-order-id');
  });
  const [activeOrderData, setActiveOrderData] = useState<any | null>(null);
  // Ref to store previous status for audio cue
  const prevStatusRef = useRef<string | null>(null);
  // Audio for Ready status
  const readyAudioRef = useRef(new Audio('https://cdn.pixabay.com/audio/2022/03/16/audio_53b8a1f5a7.mp3'));

  // Play audio when status changes to Ready
  useEffect(() => {
    if (!activeOrderData) return;
    const prev = prevStatusRef.current;
    const current = activeOrderData.status;
    if (current === 'Ready' && prev !== 'Ready') {
      readyAudioRef.current.play().catch(err => console.error('Audio play error', err));
    }
    prevStatusRef.current = current;
  }, [activeOrderData]);

  const [cartSidebarTab, setCartSidebarTab] = useState<'cart' | 'tracker'>(() => {
    return localStorage.getItem('danny-m-active-order-id') ? 'tracker' : 'cart';
  });

  const handleDismissTracking = () => {
    localStorage.removeItem('danny-m-active-order-id');
    setActiveOrderId(null);
    setActiveOrderData(null);
    setOrderSuccess(false);
    setCartSidebarTab('cart');
  };

  // Auth & Profile States
  const [user, setUser] = useState<any | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileClosing, setIsProfileClosing] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleProfileToggle = () => {
    if (isProfileOpen) {
      setIsProfileOpen(false);
      setIsProfileClosing(true);
      setTimeout(() => setIsProfileClosing(false), 150); // --dropdown-close-dur
    } else {
      setIsProfileClosing(false);
      setIsProfileOpen(true);
    }
  };

  // Customizer Modal States
  const [activeCustomizerItem, setActiveCustomizerItem] = useState<MenuItem | null>(null);
  const [customStarch, setCustomStarch] = useState<string>('');
  const [customSalad, setCustomSalad] = useState<string>('');
  const [customVeggie, setCustomVeggie] = useState<string>('');
  const [customExtras, setCustomExtras] = useState<Record<string, boolean>>({});
  const [customBeverages, setCustomBeverages] = useState<Record<string, boolean>>({});

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [serviceMode, setServiceMode] = useState<'Pickup' | 'Delivery'>('Pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');



  // Fetch Menu from Next.js CMS API
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${CMS_URL}/api/menu`);
        if (!res.ok) {
          throw new Error('Failed to fetch menu items from CMS database.');
        }
        const data = await res.json();
        setCategories(data);
      } catch (err: any) {
        console.error('Error fetching menu:', err);
        setError(err.message || 'Could not connect to the CMS server.');
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Supabase Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Poll Order Status from Next.js CMS API
  useEffect(() => {
    if (!activeOrderId) {
      setActiveOrderData(null);
      return;
    }

    const fetchOrderStatus = async () => {
      try {
        const res = await fetch(`${CMS_URL}/api/orders/${activeOrderId}`);
        if (!res.ok) {
          throw new Error('Failed to retrieve order status.');
        }
        const data = await res.json();
        setActiveOrderData(data);
      } catch (err) {
        console.error('Error fetching order status:', err);
      }
    };

    // Initial fetch
    fetchOrderStatus();

    // Set up polling interval every 15 seconds
    const intervalId = setInterval(() => {
      fetchOrderStatus();
    }, 15000);

    return () => clearInterval(intervalId);
  }, [activeOrderId]);

  // Sync customizer modal selections on open
  useEffect(() => {
    if (activeCustomizerItem) {
      const starches = activeCustomizerItem.primaryStarchOptions ? JSON.parse(activeCustomizerItem.primaryStarchOptions) : [];
      const salads = activeCustomizerItem.complementarySaladOptions ? JSON.parse(activeCustomizerItem.complementarySaladOptions) : [];
      const veggies = activeCustomizerItem.sideVeggieOptions ? JSON.parse(activeCustomizerItem.sideVeggieOptions) : [];

      setCustomStarch(starches[0] || '');
      setCustomSalad(salads[0] || '');
      setCustomVeggie(veggies[0] || '');
      setCustomExtras({});
      setCustomBeverages({});
    }
  }, [activeCustomizerItem]);

  // Extra price string parser
  const parseExtraPrice = (priceStr: string | number | undefined): number => {
    if (priceStr === undefined) return 0;
    if (typeof priceStr === 'number') return priceStr;
    const cleaned = priceStr.toString().replace(/R/i, '').trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Get total price of a cart item including all extras
  const getItemPrice = (cartItem: CartItem) => {
    let price = cartItem.item.price;
    if (cartItem.selectedExtras) {
      price += cartItem.selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
    }
    if (cartItem.selectedBeverages) {
      price += cartItem.selectedBeverages.reduce((sum, bev) => sum + bev.price, 0);
    }
    return price;
  };

  // Cart Adjustments
  const handleIncrement = (item: MenuItem) => {
    setCart(prev => {
      const currentQty = prev[item.id]?.quantity || 0;
      if (item.stock > 0 && currentQty >= item.stock) {
        alert(`Limit reached. Only ${item.stock} portions of ${item.name} are currently available in stock.`);
        return prev;
      }

      // Auto-set default choices if starches or salads are available
      const starches = item.primaryStarchOptions ? JSON.parse(item.primaryStarchOptions) : [];
      const salads = item.complementarySaladOptions ? JSON.parse(item.complementarySaladOptions) : [];
      const veggies = item.sideVeggieOptions ? JSON.parse(item.sideVeggieOptions) : [];

      return {
        ...prev,
        [item.id]: {
          item,
          quantity: currentQty + 1,
          selectedStarch: prev[item.id]?.selectedStarch || (starches[0] || undefined),
          selectedSalad: prev[item.id]?.selectedSalad || (salads[0] || undefined),
          selectedVeggie: prev[item.id]?.selectedVeggie || (veggies[0] || undefined),
          selectedExtras: prev[item.id]?.selectedExtras || [],
          selectedBeverages: prev[item.id]?.selectedBeverages || []
        }
      };
    });
  };

  const handleDecrement = (item: MenuItem) => {
    setCart(prev => {
      const currentQty = prev[item.id]?.quantity || 0;
      if (currentQty <= 1) {
        const next = { ...prev };
        delete next[item.id];
        return next;
      }
      return {
        ...prev,
        [item.id]: {
          ...prev[item.id],
          quantity: currentQty - 1
        }
      };
    });
  };

  const handleUpdateOptions = (itemId: string, field: 'selectedStarch' | 'selectedSalad' | 'selectedVeggie', value: string) => {
    setCart(prev => {
      if (!prev[itemId]) return prev;
      return {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          [field]: value
        }
      };
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setCart(prev => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  // Open customization modal if options exist, else add directly
  const handleAddClick = (item: MenuItem) => {
    const starches = item.primaryStarchOptions ? JSON.parse(item.primaryStarchOptions) : [];
    const salads = item.complementarySaladOptions ? JSON.parse(item.complementarySaladOptions) : [];
    const veggies = item.sideVeggieOptions ? JSON.parse(item.sideVeggieOptions) : [];
    const extras = item.addOnSides ? JSON.parse(item.addOnSides) : [];
    const bevs = item.beverages ? JSON.parse(item.beverages) : [];

    if (starches.length > 0 || salads.length > 0 || veggies.length > 0 || extras.length > 0 || bevs.length > 0) {
      setActiveCustomizerItem(item);
    } else {
      handleIncrement(item);
    }
  };

  // Add customized item from dialog modal
  const handleConfirmCustomization = () => {
    if (!activeCustomizerItem) return;

    const starches = activeCustomizerItem.primaryStarchOptions ? JSON.parse(activeCustomizerItem.primaryStarchOptions) : [];
    const salads = activeCustomizerItem.complementarySaladOptions ? JSON.parse(activeCustomizerItem.complementarySaladOptions) : [];
    const veggies = activeCustomizerItem.sideVeggieOptions ? JSON.parse(activeCustomizerItem.sideVeggieOptions) : [];
    const extrasList = activeCustomizerItem.addOnSides ? JSON.parse(activeCustomizerItem.addOnSides) : [];
    const beveragesList = activeCustomizerItem.beverages ? JSON.parse(activeCustomizerItem.beverages) : [];

    const selectedExtrasObj = extrasList
      .filter((extra: any) => customExtras[extra.name])
      .map((extra: any) => ({ name: extra.name, price: parseExtraPrice(extra.price) }));

    const selectedBeveragesObj = beveragesList
      .filter((bev: any) => customBeverages[bev.name])
      .map((bev: any) => ({ name: bev.name, price: parseExtraPrice(bev.price) }));

    setCart(prev => {
      const currentQty = prev[activeCustomizerItem.id]?.quantity || 0;
      return {
        ...prev,
        [activeCustomizerItem.id]: {
          item: activeCustomizerItem,
          quantity: currentQty + 1,
          selectedStarch: customStarch || (starches[0] || undefined),
          selectedSalad: customSalad || (salads[0] || undefined),
          selectedVeggie: customVeggie || (veggies[0] || undefined),
          selectedExtras: selectedExtrasObj,
          selectedBeverages: selectedBeveragesObj
        }
      };
    });

    setActiveCustomizerItem(null);
    setIsCartOpen(true);
  };

  // Submitting Order to the CMS API
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!customerName.trim()) {
      alert("Please enter your name to complete the order.");
      return;
    }
    if (customerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      alert("Please enter a valid email address (e.g. name@example.com).");
      return;
    }
    if (serviceMode === 'Delivery' && !deliveryAddress.trim()) {
      alert("Please specify your delivery address.");
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

      // Compile side choices and added extras dynamically to append directly to notes column for kitchen staff display
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

      // @ts-ignore
      var yoco = new window.YocoSDK({
        publicKey: 'pk_test_ed3c54a6gOol69qa7f45', // Test key
      });

      yoco.showPopup({
        amountInCents: totalCartPrice * 100,
        currency: 'ZAR',
        name: 'Danny M Restaurant',
        description: 'Authentic African Cuisine',
        callback: async function (result: any) {
          if (result.error) {
            setOrderError(result.error.message);
            setIsSubmitting(false);
          } else {
            try {
              // Call our Edge Function
              const { error: yocoError } = await supabase.functions.invoke('process-yoco-payment', {
                body: { token: result.id, amountInCents: totalCartPrice * 100 }
              });
              
              if (yocoError) throw yocoError;

              // Dual-sync step 1: Insert into Supabase orders table
              const { error: dbError } = await supabase.from('orders').insert({
                user_id: user.id,
                total: totalCartPrice,
                notes: finalNotes || null,
                items: cartEntries.map(entry => ({
                  menuItemId: entry.item.id,
                  name: entry.item.name,
                  quantity: entry.quantity,
                  priceAtTime: getItemPrice(entry),
                  selectedStarch: entry.selectedStarch,
                  selectedSalad: entry.selectedSalad,
                  selectedVeggie: entry.selectedVeggie,
                  selectedExtras: entry.selectedExtras,
                  selectedBeverages: entry.selectedBeverages
                }))
              });

              if (dbError) {
                console.error('Supabase DB Sync Error:', dbError);
                throw new Error(dbError.message || 'Failed to sync order to Supabase database.');
              }

              // Dual-sync step 2: Post to existing CMS / Turso database
              const res = await fetch(`${CMS_URL}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              });

              if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to submit order to CMS.');
              }

              const orderData = await res.json();
              if (orderData && orderData.id) {
                localStorage.setItem('danny-m-active-order-id', orderData.id);
                setActiveOrderId(orderData.id);
                setCartSidebarTab('tracker');
              }

              setOrderSuccess(true);
              setCart({}); // clear cart
              setCustomerName('');
              setCustomerPhone('');
              setCustomerEmail('');
              setDeliveryAddress('');
              setNotes('');
            } catch (err: any) {
              console.error('Order Submission Error:', err);
              setOrderError(err.message || 'Failed to finalize order. Please contact support.');
            } finally {
              setIsSubmitting(false);
            }
          }
        }
      });
    } catch (err: any) {
      console.error('Order Initialization Error:', err);
      setOrderError(err.message || 'Failed to initialize payment.');
      setIsSubmitting(false);
    }
  };


  // Signature / Specials mappings matching db seed names
  const allMenuItems = categories.flatMap(cat => cat.menuItems);

  const findItemByName = (substring: string) => {
    return allMenuItems.find(item => item.name.toLowerCase().includes(substring.toLowerCase()));
  };

  const braaiItem = findItemByName("Braai Meat") || findItemByName("Steak Only");
  const mogoduItem = findItemByName("Mogodu") || findItemByName("Tripe");
  const beefStewItem = findItemByName("Beef Stew") || findItemByName("Cow Heels");

  const displayedMenuItems = selectedCategoryId === 'all'
    ? allMenuItems
    : categories.find(cat => cat.id === selectedCategoryId)?.menuItems || [];

  const totalCartCount = Object.values(cart).reduce((acc, qty) => acc + qty.quantity, 0);
  const totalCartPrice = Object.values(cart).reduce((acc, cartItem) => acc + (getItemPrice(cartItem) * cartItem.quantity), 0);
  const calculatedVat = totalCartPrice * 0.15;
  const subtotal = totalCartPrice - calculatedVat;

  const pillars = [
    {
      title: "Clean Food Focus",
      icon: Salad,
      badge: "Absolute Hygiene",
      subtitle: "Excellent Clean Food First",
      text: "At Danny M, our kitchen operates on a policy of absolute purity. We source only fresh, premium ingredients, keeping our kitchen clean enough to treat every guest like our own children. No shortcuts, just healthy and authentic meals.",
    },
    {
      title: "Spirit of Ubuntu",
      icon: Handshake,
      badge: "We Are Family",
      subtitle: "Caring For Every Client",
      text: "Ubuntu means 'I am because we are.' Our team prepares every dish as an act of absolute love and care. We greet you with warm smiles and treat your dining experience as a sacred gathering of family.",
    },
    {
      title: "African Tradition",
      icon: Flame,
      badge: "Slow-Cooked Heritage",
      subtitle: "Real Pretoria Soul Food",
      text: "Celebrating South African culture, we master traditional slow-cooked stews, slow-braised Mogodu, and perfect Braai. Our cooking respects the ancestral methods to deliver deep, robust, comforting flavors.",
    }
  ];

  return (
    <div className="min-h-screen bg-bg-light text-white/90 font-body selection:bg-primary selection:text-white overflow-x-hidden">
      {/* Sleek Dark Glassmorphism Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled
        ? 'bg-bg-dark/85 border-b border-white/5 backdrop-blur-xl py-4 shadow-2xl shadow-black/40 opacity-100 translate-y-0 pointer-events-auto'
        : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <a href="#" className="flex items-center gap-3 font-heading font-extrabold text-2xl tracking-tight hover:scale-102 transition-transform">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-primary bg-secondary flex items-center justify-center p-0.5 shadow-lg shadow-primary/20">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">DANNY M</span>
          </a>

          <ul className="hidden md:flex gap-10 font-bold text-xs tracking-widest text-white/60 uppercase">
            <li>
              <a href="#home" className="hover:text-primary transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-primary after:transition-all after:duration-300">Home</a>
            </li>
            <li>
              <a href="#about" className="hover:text-primary transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-primary after:transition-all after:duration-300">Our Story</a>
            </li>
            <li>
              <a href="#menu" className="hover:text-primary transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-primary after:transition-all after:duration-300">Menu</a>
            </li>
            <li>
              <a href="#contact" className="hover:text-primary transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-primary after:transition-all after:duration-300">Contact</a>
            </li>
          </ul>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => {
                  if (user) {
                    handleProfileToggle();
                  } else {
                    setIsAuthModalOpen(true);
                  }
                }}
                className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/80 cursor-pointer"
                aria-label="Profile"
              >
                <User className="w-5 h-5" />
              </button>
              
              {/* Profile Dropdown using transitions-dev */}
              <div 
                className={`absolute top-[120%] right-0 w-56 bg-bg-card border border-white/10 shadow-2xl rounded-2xl p-2 t-dropdown ${isProfileOpen ? 'is-open' : ''} ${isProfileClosing ? 'is-closing' : ''}`} 
                data-origin="top-right"
              >
                <div className="px-4 py-3 border-b border-white/10 mb-2">
                  <span className="block text-xs text-white/50 uppercase tracking-widest font-black">Logged in as</span>
                  <span className="block text-sm font-bold text-white mt-1 truncate">{user?.email || 'user@example.com'}</span>
                </div>
                <button className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 rounded-xl text-sm font-bold transition-colors">
                  <User className="w-4 h-4 text-primary-light" /> My Profile
                </button>
                <button className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 rounded-xl text-sm font-bold transition-colors">
                  <Utensils className="w-4 h-4 text-primary-light" /> Past Orders
                </button>
                <button 
                  onClick={() => {
                    setUser(null);
                    handleProfileToggle();
                  }}
                  className="w-full text-left flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 text-red-400 rounded-xl text-sm font-bold transition-colors mt-1"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setOrderSuccess(false);
                setOrderError(null);
                setIsCartOpen(true);
              }}
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/80 cursor-pointer"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce border border-bg-dark">
                  {totalCartCount}
                </span>
              )}
            </button>
            <a href="#menu" className="bg-primary text-white px-6 py-2.5 rounded-full font-bold hover:bg-primary-light hover:shadow-lg hover:shadow-primary/30 transition-all text-xs tracking-widest uppercase border border-primary-light/20">
              Order Now
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section: Centered Grill Medallion */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-bg-dark">
        {/* Glow Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(211,84,0,0.18)_0%,rgba(0,0,0,0)_70%)] z-0 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[160px] pointer-events-none z-0" />

        {/* Fine geometric grids evoking wood-grill wireframes */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:30px_30px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col items-center justify-center text-center space-y-10 mt-16">

          {/* Centered Large Branding Behind Elements */}
          <div className="absolute select-none pointer-events-none font-heading font-extrabold text-[12vw] tracking-wider text-primary/[0.04] uppercase z-0 leading-none">
            DANNY M
          </div>

          {/* Hero Content Grid with Centered Logo Plate */}
          <div className="relative flex flex-col items-center justify-center z-10 py-12">
            {/* Centered Glowing Medallion */}
            <div className="relative flex flex-col items-center">
              <div className="relative group cursor-pointer">
                {/* Intense Ember Glow behind Logo */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-accent blur-3xl opacity-40 group-hover:opacity-85 transition-all duration-700 scale-110 animate-pulse-slow" />
                <div className="absolute -inset-4 rounded-full border border-white/5 animate-pulse" />

                {/* Main Plate Medallion */}
                <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-primary-light/50 bg-[#151211] p-1 flex items-center justify-center transition-transform duration-500 group-hover:scale-105 shadow-[0_0_60px_rgba(211,84,0,0.3)]">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                  <img src="/logo.png" alt="Danny M Restaurant circular Logo" className="w-full h-full object-contain p-4 relative z-20" />
                </div>
              </div>
            </div>
          </div>

          {/* Hero Description */}
          <div className="space-y-6 max-w-3xl z-10">
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none text-white">
              The Taste of <span className="bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent font-extrabold">Ubuntu</span>
            </h1>

            <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
              Authentic African cuisine crafted with love, deep tradition, and a proud dedication to <span className="text-primary-light font-semibold">excellent, clean food</span>.
            </p>

            <div className="pt-4 flex justify-center">
              <a href="#menu" className="inline-block bg-primary hover:bg-primary-light text-white px-10 py-4 rounded-full font-bold text-sm transition-all transform hover:-translate-y-0.5 shadow-xl shadow-primary/20 hover:shadow-primary/40 border border-primary-light/20 tracking-wider uppercase flex items-center gap-2">
                Explore Our Menu
              </a>
            </div>
          </div>

          {/* Core Highlights Panel */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl pt-6">
            <div className="bg-[#151211] border border-white/5 rounded-2xl p-4 hover:border-primary/20 transition-all text-center flex flex-col items-center justify-center">
              <Wine className="w-6 h-6 text-primary-light mb-1" />
              <span className="text-[10px] uppercase text-white/40 tracking-wider font-bold">Concept</span>
              <span className="text-xs font-semibold block text-white/95 mt-1">Ubuntu Gatherings</span>
            </div>
            <div className="bg-[#151211] border border-white/5 rounded-2xl p-4 hover:border-primary/20 transition-all text-center flex flex-col items-center justify-center">
              <Salad className="w-6 h-6 text-primary-light mb-1" />
              <span className="text-[10px] uppercase text-white/40 tracking-wider font-bold">Kitchen Standard</span>
              <span className="text-xs font-semibold block text-white/95 mt-1">Strict Hygiene Seal</span>
            </div>
            <div className="bg-[#151211] border border-white/5 rounded-2xl p-4 hover:border-primary/20 transition-all text-center flex flex-col items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary-light mb-1" />
              <span className="text-[10px] uppercase text-white/40 tracking-wider font-bold">Payments</span>
              <span className="text-xs font-semibold block text-white/95 mt-1">NFC & Debit Cards</span>
            </div>
            <div className="bg-[#151211] border border-white/5 rounded-2xl p-4 hover:border-primary/20 transition-all text-center flex flex-col items-center justify-center">
              <Home className="w-6 h-6 text-primary-light mb-1" />
              <span className="text-[10px] uppercase text-white/40 tracking-wider font-bold">Hours</span>
              <span className="text-xs font-semibold block text-white/95 mt-1">Mon - Sat: 9am - 5pm</span>
            </div>
          </div>

        </div>
      </section>

      {/* Recommended Specials Slider Section (Inspired by Card Depth & Colors) */}
      <section className="py-24 bg-bg-dark border-t border-white/5 overflow-visible">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-16 space-y-3">
            <span className="text-primary-light font-bold uppercase tracking-widest text-xs">Chef Recommends</span>
            <h2 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight text-white animate-pulse-slow">Ubuntu Signatures</h2>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full mt-2" />
          </div>

          <div className="grid lg:grid-cols-3 gap-10 lg:gap-8 pt-4">

            {/* Card 1: Warm Amber (Braai Meat Meal) */}
            <div className="relative bg-[#E67E22] rounded-[2.5rem] p-8 min-h-[300px] flex flex-col justify-between overflow-visible shadow-2xl transition-transform duration-500 hover:-translate-y-2 group">
              <div className="max-w-[55%] z-10 flex flex-col justify-between h-full">
                <span className="text-[9px] font-black tracking-widest text-white/70 uppercase">Voted Best Choice</span>
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

                  {/* Adding order interaction directly into Signature plates */}
                  {braaiItem && (
                    <div className="w-full">
                      {(cart[braaiItem.id]?.quantity || 0) === 0 ? (
                        <button
                          onClick={() => handleAddClick(braaiItem)}
                          className="px-5 py-2 bg-black/35 hover:bg-black/50 border border-white/10 rounded-full font-black text-[9px] tracking-widest uppercase transition-all text-white cursor-pointer"
                        >
                          + Add To Plate
                        </button>
                      ) : (
                        <div className="flex items-center justify-between w-28 bg-black/40 rounded-full p-0.5 border border-white/10">
                          <button
                            onClick={() => handleDecrement(braaiItem)}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black text-white hover:bg-white/10 cursor-pointer"
                          >
                            −
                          </button>
                          <span className="text-xs font-black text-white">{cart[braaiItem.id].quantity}</span>
                          <button
                            onClick={() => handleIncrement(braaiItem)}
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

              {/* Overlapping circular top-down plate */}
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
                <span className="text-[9px] font-black tracking-widest text-white/70 uppercase">Slow Braised Soul</span>
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

                  {/* Order Selector */}
                  {mogoduItem && (
                    <div className="w-full">
                      {(cart[mogoduItem.id]?.quantity || 0) === 0 ? (
                        <button
                          onClick={() => handleAddClick(mogoduItem)}
                          className="px-5 py-2 bg-black/35 hover:bg-black/50 border border-white/10 rounded-full font-black text-[9px] tracking-widest uppercase transition-all text-white cursor-pointer"
                        >
                          + Add To Plate
                        </button>
                      ) : (
                        <div className="flex items-center justify-between w-28 bg-black/40 rounded-full p-0.5 border border-white/10">
                          <button
                            onClick={() => handleDecrement(mogoduItem)}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black text-white hover:bg-white/10 cursor-pointer"
                          >
                            −
                          </button>
                          <span className="text-xs font-black text-white">{cart[mogoduItem.id].quantity}</span>
                          <button
                            onClick={() => handleIncrement(mogoduItem)}
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

              {/* Overlapping circular top-down plate */}
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
                <span className="text-[9px] font-black tracking-widest text-white/50 uppercase">Classic Simmer</span>
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

                  {/* Order Selector */}
                  {beefStewItem && (
                    <div className="w-full">
                      {(cart[beefStewItem.id]?.quantity || 0) === 0 ? (
                        <button
                          onClick={() => handleAddClick(beefStewItem)}
                          className="px-5 py-2 bg-black/35 hover:bg-black/50 border border-white/10 rounded-full font-black text-[9px] tracking-widest uppercase transition-all text-white cursor-pointer"
                        >
                          + Add To Plate
                        </button>
                      ) : (
                        <div className="flex items-center justify-between w-28 bg-black/40 rounded-full p-0.5 border border-white/10">
                          <button
                            onClick={() => handleDecrement(beefStewItem)}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black text-white hover:bg-white/10 cursor-pointer"
                          >
                            −
                          </button>
                          <span className="text-xs font-black text-white">{cart[beefStewItem.id].quantity}</span>
                          <button
                            onClick={() => handleIncrement(beefStewItem)}
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

              {/* Overlapping circular top-down plate */}
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

      {/* About Section: Hearth Gatherings & Values */}
      <section id="about" className="py-24 bg-bg-light border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">

          {/* Interactive Values Card */}
          <div className="flex flex-col space-y-6">
            <div className="flex items-center gap-4 bg-bg-card p-4 rounded-2xl border border-white/5 shadow-xl">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-primary bg-secondary flex items-center justify-center p-1 flex-shrink-0">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-[10px] uppercase text-primary-light font-black tracking-widest">Our Promise</span>
                <h4 className="font-bold text-white text-base">The Danny M Ubuntu Seal</h4>
              </div>
            </div>

            {/* Selector Buttons */}
            <div className="grid grid-cols-3 gap-2 bg-bg-dark p-2 rounded-2xl border border-white/5 shadow-inner">
              {pillars.map((pillar, idx) => {
                const PillarIcon = pillar.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`flex flex-col items-center justify-center py-4 px-2 rounded-xl transition-all duration-300 cursor-pointer ${activeTab === idx
                      ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02] font-extrabold'
                      : 'hover:bg-white/5 text-white/60 font-bold'
                      }`}
                  >
                    <PillarIcon className="w-6 h-6 mb-1" />
                    <span className="text-[10px] text-center leading-tight font-black uppercase tracking-wider">{pillar.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Value Showcase Panel */}
            <div className="relative min-h-[220px] bg-bg-card rounded-3xl p-8 border border-white/5 shadow-2xl overflow-hidden transition-all duration-500">
              <div className="absolute -right-12 -bottom-12 w-44 h-44 rounded-full blur-3xl opacity-15 bg-primary pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="bg-primary/20 text-primary-light font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-primary/20">
                    {pillars[activeTab].badge}
                  </span>
                  {(() => {
                    const PillarIcon = pillars[activeTab].icon;
                    return <PillarIcon className="w-8 h-8 text-primary-light" />;
                  })()}
                </div>

                <h3 className="text-xl md:text-2xl font-black text-white leading-tight">
                  {pillars[activeTab].subtitle}
                </h3>

                <p className="text-white/70 leading-relaxed text-sm">
                  {pillars[activeTab].text}
                </p>
              </div>
            </div>
          </div>

          {/* Explanatory Brand Text */}
          <div className="space-y-8">
            <div className="space-y-2">
              <span className="text-primary-light font-bold uppercase tracking-widest text-xs">About Danny M</span>
              <h2 className="font-heading text-3xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">Rooted in Tradition, Served with Care</h2>
            </div>
            <p className="text-base text-white/70 leading-relaxed">
              Located in the vibrant heart of Pretoria Central, Danny M is more than just a restaurant—it's a home for authentic African flavors. We specialize in traditional dishes that celebrate freshness and simplicity.
            </p>
            <p className="text-base text-white/70 leading-relaxed">
              Our kitchen is a place of dedication. Each meal is prepared by a staff that views cooking as an act of love. We believe in "excellent clean food"—using the freshest ingredients to ensure every bite is as healthy as it is delicious.
            </p>
            <div className="bg-bg-card p-6 rounded-3xl border border-white/5 border-l-4 border-l-primary shadow-xl">
              <h3 className="text-lg font-black mb-3 flex items-center gap-3 text-white">
                <Sparkles className="w-5 h-5 text-primary-light" /> The Spirit of Ubuntu
              </h3>
              <p className="text-white/80 italic text-sm leading-relaxed">
                "I am because we are." At Danny M, this isn't just a tagline; it's how we treat every client. We care for each person who walks through our doors with the same warmth and respect we'd show our own family.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Sleek Dynamic Menu Section */}
      <section id="menu" className="py-24 bg-bg-dark border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6">

          {/* Header & Category Selection Pills */}
          <div className="flex flex-col items-center text-center mb-16 space-y-6">
            <div className="space-y-3">
              <span className="text-primary-light font-bold uppercase tracking-widest text-xs">Fresh Daily</span>
              <h2 className="font-heading text-3xl md:text-5xl font-extrabold text-white tracking-tight">Traditional Menu</h2>
              <div className="w-16 h-1 bg-primary mx-auto rounded-full mt-2" />
            </div>

            {/* Dynamic Category Filter Selection Pills */}
            <div className="flex flex-wrap justify-center gap-2 p-1 bg-bg-card border border-white/5 rounded-full shadow-inner max-w-4xl mx-auto overflow-hidden">
              <button
                onClick={() => setSelectedCategoryId('all')}
                className={`px-5 py-2.5 rounded-full font-black text-[10px] tracking-widest uppercase transition-all cursor-pointer ${selectedCategoryId === 'all'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-white/60 hover:text-white'
                  }`}
              >
                ● SHOW ALL
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={`px-5 py-2.5 rounded-full font-black text-[10px] tracking-widest uppercase transition-all cursor-pointer flex items-center justify-center gap-2 ${selectedCategoryId === category.id
                    ? 'bg-primary text-white shadow-md'
                    : 'text-white/60 hover:text-white'
                    }`}
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Loaders / Errors states for menu grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-white/60 text-xs font-bold tracking-widest uppercase">Loading traditional flavours...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-red-500/10 border border-red-500/20 rounded-3xl max-w-2xl mx-auto p-8 space-y-4">
              <AlertTriangle className="w-12 h-12 text-red-550 mx-auto" />
              <h3 className="font-heading text-lg font-bold text-white">Failed to Load Menu</h3>
              <p className="text-white/60 text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-primary text-white rounded-full font-bold text-xs tracking-widest uppercase hover:bg-primary-light transition-all cursor-pointer"
              >
                Retry Connection
              </button>
            </div>
          ) : displayedMenuItems.length === 0 ? (
            <div className="text-center py-20 text-white/50 text-sm">
              No items currently available in this category. Check back later!
            </div>
          ) : (
            /* Cards Grid */
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {displayedMenuItems.map((item) => {
                const qty = cart[item.id]?.quantity || 0;
                const isSoldOut = !item.isAvailable || item.stock <= 0;

                return (
                  <div key={item.id} className="group bg-bg-card rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl transition-all duration-500 hover:border-primary/20 transform hover:-translate-y-1.5 flex flex-col justify-between">
                    <div>
                      {/* Perfect Circular Plate Framed container */}
                      {item.image && item.image !== 'null' && item.image !== '' ? (
                        <div className="h-64 overflow-hidden relative p-6 flex items-center justify-center">
                          <div className="w-48 h-48 rounded-full overflow-hidden border-2 border-white/5 shadow-[0_12px_30px_rgba(0,0,0,0.6)] relative z-10 transition-transform duration-700 group-hover:scale-105 group-hover:rotate-6 bg-bg-dark">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute top-4 right-4 bg-primary text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg border border-primary-light/10">
                            R {item.price.toFixed(2)}
                          </div>

                          {/* Sold out indicators */}
                          {isSoldOut && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-20">
                              <span className="bg-red-600 text-white font-black text-[9px] tracking-widest uppercase px-4 py-2 rounded-full border border-red-500 shadow-xl">
                                OUT OF STOCK
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-6 pt-12 relative flex flex-col items-center">
                          <div className="absolute top-4 right-4 bg-primary text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg border border-primary-light/10">
                            R {item.price.toFixed(2)}
                          </div>

                          {/* Sold out indicator for no-image cards */}
                          {isSoldOut && (
                            <span className="bg-red-600 text-white font-black text-[9px] tracking-widest uppercase px-4 py-2 rounded-full border border-red-500 shadow-xl mb-2">
                              OUT OF STOCK
                            </span>
                          )}
                        </div>
                      )}

                      <div className="px-6 pb-2 space-y-2 text-center">
                        <h3 className="font-heading text-lg font-bold text-white group-hover:text-primary-light transition-colors uppercase tracking-tight line-clamp-1">{item.name}</h3>
                        <p className="text-white/50 text-xs leading-relaxed line-clamp-3 px-2">
                          {item.description || "Freshly cooked traditional South African delight prepared with clean ingredients."}
                        </p>
                      </div>
                    </div>

                    {/* Interactive Button / Quantity Selector footer */}
                    <div className="p-6 pt-4">
                      {isSoldOut ? (
                        <button
                          disabled
                          className="w-full py-3 bg-white/5 border border-white/5 text-white/30 rounded-full font-black text-[10px] tracking-widest uppercase cursor-not-allowed"
                        >
                          Sold Out
                        </button>
                      ) : qty === 0 ? (
                        <button
                          onClick={() => handleAddClick(item)}
                          className="w-full py-3 bg-white/5 border border-white/10 rounded-full font-black text-[10px] tracking-widest uppercase hover:bg-primary hover:border-primary-light hover:text-white transition-all text-white/80 cursor-pointer"
                        >
                          + Add To Plate
                        </button>
                      ) : (
                        <div className="flex items-center justify-between bg-primary rounded-full p-0.5 border border-primary-light/35 shadow-md">
                          <button
                            onClick={() => handleDecrement(item)}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-black text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
                          >
                            −
                          </button>
                          <span className="text-sm font-black text-white">{qty}</span>
                          <button
                            onClick={() => handleIncrement(item)}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-black text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* Styled Footer */}
      <footer id="contact" className="bg-bg-dark pt-24 pb-12 text-white/80 border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-16 mb-16 relative z-10">

          <div className="space-y-6">
            <h3 className="font-heading text-2xl font-extrabold tracking-tight text-white">DANNY M</h3>
            <p className="text-white/60 leading-relaxed text-sm">
              Authentic African flavors in the heart of Pretoria. Dedicated to the spirit of Ubuntu and the art of traditional cooking.
            </p>
            <div className="flex gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer text-white shadow-md" aria-label="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer text-white shadow-md" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.008 3.81.055.97.044 1.5.206 1.85.342.463.18.792.395 1.14.743.348.349.562.678.742 1.14.136.35.298.88.342 1.85.047 1.026.055 1.38.055 3.81 0 2.43-.008 2.784-.055 3.81-.044.97-.206 1.5-.342 1.85a2.915 2.915 0 01-.74 1.14c-.349.348-.678.562-1.14.742-.35.136-.88.298-1.85.342-1.026.047-1.38.055-3.81.055-2.43 0-2.784-.008-3.81-.055-.97-.044-1.5-.206-1.85-.342a2.915 2.915 0 01-1.14-.74 2.915 2.915 0 01-.742-1.14c-.136-.35-.298-.88-.342-1.85-.047-1.026-.055-1.38-.055-3.81 0-2.43.008-2.784.055-3.81.044-.97.206-1.5.342-1.85.18-.463.395-.792.743-1.14.349-.348.678-.562 1.14-.742.35-.136.88-.298 1.85-.342 1.026-.047 1.38-.055 3.81-.055zm0-2C9.536 0 9.191.012 8.087.062 6.98.113 6.224.288 5.566.544a4.92 4.92 0 00-1.782 1.16 4.92 4.92 0 00-1.16 1.782C2.378 4.135 2.2 4.887 2.148 5.992 2.102 7.095 2.09 7.44 2.09 10.218c0 2.778.012 3.123.063 4.227.05 1.105.226 1.857.482 2.515.26.666.6 1.229 1.16 1.782.553.553 1.116.892 1.782 1.16.658.256 1.41.431 2.515.482 1.104.05 1.448.062 4.227.062 2.778 0 3.123-.012 4.227-.062 1.105-.05 1.857-.226 2.515-.482.666-.26 1.229-.6 1.782-1.16.553-.553.892-1.116 1.16-1.782.256-.658.431-1.41.482-2.515.05-1.104.062-1.448.062-4.227 0-2.778-.012-3.123-.062-4.227-.05-1.105-.226-1.857-.482-2.515a4.92 4.92 0 00-1.16-1.782 4.92 4.92 0 00-1.782-1.16c-.658-.256-1.41-.431-2.515-.482C15.428.012 15.083 0 12.315 0zm0 4.945c-2.913 0-5.273 2.36-5.273 5.273s2.36 5.273 5.273 5.273 5.273-2.36 5.273-5.273-2.36-5.273-5.273-5.273zm0 8.545c-1.808 0-3.273-1.465-3.273-3.273s1.465-3.273 3.273-3.273 3.273 1.465 3.273 3.273-1.465 3.273-3.273 3.273zm5.638-8.337c0 .65-.527 1.178-1.178 1.178-.65 0-1.178-.528-1.178-1.178 0-.65.528-1.178 1.178-1.178.65 0 1.178.528 1.178 1.178z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://wa.me/27123456789" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer text-white shadow-md" aria-label="WhatsApp">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.004 2C6.48 2 2 6.48 2 12.004c0 1.763.456 3.486 1.326 5.006L2 22l5.127-1.345a9.92 9.92 0 004.877 1.275c5.524 0 10.004-4.48 10.004-10.004C22.008 6.48 17.528 2 12.004 2zm5.736 13.918c-.244.69-1.21 1.258-1.666 1.31-.456.052-.942.072-2.736-.653-2.285-.927-3.766-3.254-3.879-3.407-.114-.153-.923-1.229-.923-2.344 0-1.116.58-1.663.788-1.892.208-.228.456-.285.61-.285.153 0 .307.002.44.008.136.006.319-.052.5-.052.183 0 .366.068.528.457.163.388.56 1.365.61 1.467.05.102.083.22.015.352-.068.133-.102.217-.203.336-.102.119-.214.266-.305.358-.102.102-.208.214-.09.417.119.203.528.87.1.13c1.13.996 2.08 1.305 2.375 1.452.296.147.468.119.57.003.102-.116.44-.51.558-.684.119-.174.238-.146.402-.086.163.06 1.036.488 1.213.577.178.089.296.133.34.208.044.075.044.437-.2.12z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-heading text-primary-light font-bold uppercase tracking-widest text-xs">Location & Hours</h4>
            <ul className="space-y-4 text-white/60 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary-light mt-0.5 flex-shrink-0" />
                <span>Schoeman Street, Pretoria Central</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-primary-light mt-0.5 flex-shrink-0" />
                <span>Mon - Sat: 09:00 - 17:00<br />Sun: Closed</span>
              </li>
              <li className="flex items-start gap-3">
                <Info className="w-4 h-4 text-primary-light mt-0.5 flex-shrink-0" />
                <span>Free Street Parking Available</span>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-heading text-primary-light font-bold uppercase tracking-widest text-xs">Payments & Service</h4>
            <ul className="space-y-4 text-white/60 text-sm">
              <li className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-primary-light flex-shrink-0" />
                <span>Debit Cards & NFC Accepted</span>
              </li>
              <li className="flex items-center gap-3">
                <Package className="w-4 h-4 text-primary-light flex-shrink-0" />
                <span>Dine-in | Takeaway | Delivery</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-white/5 pt-12 text-center text-white/30 text-xs">
          &copy; {new Date().getFullYear()} Danny M Restaurant. The Taste of Ubuntu. All rights reserved.
        </div>
      </footer>



      {/* PREMIUM SLIDE-OUT CART SIDEBAR */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-bg-card/98 border-l border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.95)] backdrop-blur-2xl transition-transform duration-500 transform ${isCartOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col justify-between`}>
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
            onClick={() => setIsCartOpen(false)}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Cart Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeOrderId && cartSidebarTab === 'tracker' ? (
            /* UBUNTU HEARTH PROGRESS TRACKER */
            <div className="space-y-6 py-4 animate-fade-in">
              {/* Active Order Card */}
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
                /* CANCELLED STATE WRAPPER */
                <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 text-center space-y-4 shadow-lg shadow-red-950/20">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-3xl mx-auto shadow-inner">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
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
                /* ACTIVE VERTICAL STEPPER */
                <div className="space-y-6 bg-bg-dark/45 border border-white/5 rounded-3xl p-6 shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(217,93,46,0.03)_0%,transparent_70%)] pointer-events-none" />

                  {/* Step Item Builder */}
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
                          {/* Left Line & Indicator column */}
                          <div className="flex flex-col items-center flex-shrink-0 relative">
                            {/* Vertical Line linking to next step */}
                            {stepNum < 4 && (
                              <div className={`w-0.5 absolute top-10 bottom-[-24px] z-0 transition-colors duration-500 ${state === 'completed' ? 'bg-primary' : 'bg-white/10 border-dashed border-l border-white/20'
                                }`} />
                            )}

                            {/* Circle Indicator */}
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

                          {/* Right text contents */}
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

                  {/* Complete Dismiss / Clear Box */}
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

              {/* Back button */}
              {activeOrderData?.status !== 'Completed' && activeOrderData?.status !== 'Cancelled' && (
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-full text-[10px] tracking-widest uppercase transition-all cursor-pointer text-center flex items-center justify-center gap-2"
                >
                  <Clock className="w-3.5 h-3.5 text-white/60" />
                  <span>Keep Tracking in Background</span>
                </button>
              )}
            </div>
          ) : orderSuccess ? (
            /* KEEP RETAINED IF ORDER SUCCESS BUT NO TRACKING ID FOR ROBUSTNESS */
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12 animate-pulse-slow">
              <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center shadow-lg shadow-primary/30 mx-auto">
                <Check className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-2">
                <span className="text-primary-light font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-1"><Sparkles className="w-3.5 h-3.5 text-primary-light" /> Order Received!</span>
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
                  setIsCartOpen(false);
                }}
                className="mt-4 px-8 py-3 bg-primary hover:bg-primary-light text-white font-bold rounded-full text-xs tracking-widest uppercase transition-all cursor-pointer"
              >
                Close & Browse Menu
              </button>
            </div>
          ) : Object.keys(cart).length === 0 ? (
            /* EMPTY CART STATE */
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-20 text-white/40">
              <ShoppingBag className="w-16 h-16 text-white/20 mx-auto" />
              <h4 className="font-heading text-lg font-bold text-white uppercase tracking-tight">Your Plate is Empty</h4>
              <p className="text-xs max-w-xs mx-auto">
                Add some of our slow-cooked Pretoria traditional meals to customize your perfect plate.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-full text-[10px] tracking-widest uppercase transition-all cursor-pointer"
              >
                Start Adding meals
              </button>
            </div>
          ) : (
            /* ACTIVE CART ITEMS LIST */
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase block border-b border-white/5 pb-2">Selected Items</span>
              {Object.values(cart).map((cartItem) => {
                const item = cartItem.item;
                const starches = item.primaryStarchOptions ? JSON.parse(item.primaryStarchOptions) : [];
                const salads = item.complementarySaladOptions ? JSON.parse(item.complementarySaladOptions) : [];
                const veggies = item.sideVeggieOptions ? JSON.parse(item.sideVeggieOptions) : [];

                return (
                  <div key={item.id} className="bg-bg-dark/40 border border-white/5 rounded-2xl p-4 space-y-3 shadow-inner">
                    <div className="flex justify-between items-start gap-4">
                      {/* Avatar */}
                      {item.image && item.image !== 'null' && item.image !== '' && (
                        <div className="w-16 h-16 rounded-full overflow-hidden border border-white/10 bg-bg-dark flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* Name & price */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-heading font-extrabold text-sm text-white uppercase truncate tracking-tight">{item.name}</h4>
                        <span className="text-xs text-primary-light font-black block mt-0.5">R {getItemPrice(cartItem).toFixed(2)}</span>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-white/30 hover:text-red-500 transition-colors text-sm cursor-pointer"
                        aria-label="Remove item"
                      >
                        ✕
                      </button>
                    </div>

                    {/* DYNAMIC OPTION SELECTORS (STARCH / SALAD / VEGGIE) FROM CMS */}
                    {(starches.length > 0 || salads.length > 0 || veggies.length > 0) && (
                      <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2">
                        {starches.length > 0 && (
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase tracking-wider text-white/40 font-bold block">Choice of Starch</label>
                            <select
                              value={cartItem.selectedStarch || ''}
                              onChange={(e) => handleUpdateOptions(item.id, 'selectedStarch', e.target.value)}
                              className="w-full bg-bg-dark border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white/80 focus:border-primary focus:outline-none"
                            >
                              {starches.map((s: string) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        )}

                        {salads.length > 0 && (
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase tracking-wider text-white/40 font-bold block">Choice of Salad</label>
                            <select
                              value={cartItem.selectedSalad || ''}
                              onChange={(e) => handleUpdateOptions(item.id, 'selectedSalad', e.target.value)}
                              className="w-full bg-bg-dark border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white/80 focus:border-primary focus:outline-none"
                            >
                              {salads.map((s: string) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        )}

                        {veggies.length > 0 && (
                          <div className="space-y-1 col-span-2">
                            <label className="text-[9px] uppercase tracking-wider text-white/40 font-bold block">Choice of Side Veggie</label>
                            <select
                              value={cartItem.selectedVeggie || ''}
                              onChange={(e) => handleUpdateOptions(item.id, 'selectedVeggie', e.target.value)}
                              className="w-full bg-bg-dark border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white/80 focus:border-primary focus:outline-none"
                            >
                              {veggies.map((s: string) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Selected Extras & Beverages */}
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

                    {/* Quantity selectors */}
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] uppercase text-white/30 tracking-widest font-black">Quantity</span>
                      <div className="flex items-center justify-between w-24 bg-bg-dark rounded-full p-0.5 border border-white/5">
                        <button
                          onClick={() => handleDecrement(item)}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white/80 hover:bg-white/5 cursor-pointer"
                        >
                          −
                        </button>
                        <span className="text-xs font-black text-white">{cartItem.quantity}</span>
                        <button
                          onClick={() => handleIncrement(item)}
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
          )}
        </div>

        {/* ACTIVE CART SUMMARY & CHECKOUT FORM */}
        {!orderSuccess && Object.keys(cart).length > 0 && (
          <div className="border-t border-white/10 bg-bg-dark/65 backdrop-blur-md p-6 space-y-6">

            {/* Calculation Totals */}
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

            {/* CHECKOUT SUBMISSION FORM */}
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
                  className="w-full bg-[#151211] border border-white/5 hover:border-white/15 focus:border-primary focus:outline-none rounded-xl px-4 py-3 text-xs text-white"
                />

                <input
                  type="tel"
                  placeholder="Phone Number (Highly Recommended)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-[#151211] border border-white/5 hover:border-white/15 focus:border-primary focus:outline-none rounded-xl px-4 py-3 text-xs text-white"
                />

                <input
                  type="email"
                  placeholder="Email Address (For order updates)"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-[#151211] border border-white/5 hover:border-white/15 focus:border-primary focus:outline-none rounded-xl px-4 py-3 text-xs text-white"
                />

                {/* Service Mode Toggles */}
                <div className="grid grid-cols-2 gap-2 bg-[#0d0b0a] p-1 rounded-xl border border-white/5 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setServiceMode('Pickup')}
                    className={`py-2 px-3 rounded-lg font-black text-[9px] tracking-widest uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 ${serviceMode === 'Pickup'
                      ? 'bg-primary text-white shadow-md'
                      : 'text-white/50 hover:text-white'
                      }`}
                  >
                    <Car className="w-3.5 h-3.5" />
                    <span>Pickup</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setServiceMode('Delivery')}
                    className={`py-2 px-3 rounded-lg font-black text-[9px] tracking-widest uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 ${serviceMode === 'Delivery'
                      ? 'bg-primary text-white shadow-md'
                      : 'text-white/50 hover:text-white'
                      }`}
                  >
                    <Bike className="w-3.5 h-3.5" />
                    <span>Delivery</span>
                  </button>
                </div>

                {/* Delivery Address Input */}
                {serviceMode === 'Delivery' && (
                  <input
                    type="text"
                    required
                    placeholder="Delivery Address (Required)*"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full bg-[#151211] border border-white/5 hover:border-primary focus:border-primary focus:outline-none rounded-xl px-4 py-3 text-xs text-white animate-pulse-slow"
                  />
                )}

                <input
                  type="text"
                  placeholder="Special instructions (e.g. Extra Gravy)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#151211] border border-white/5 hover:border-white/15 focus:border-primary focus:outline-none rounded-xl px-4 py-3 text-xs text-white"
                />
              </div>

              {/* Glowing Submit Button */}
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
                    <span>Submit Order to Kitchen</span> <Flame className="w-4 h-4" />
                  </span>
                )}
              </button>
            </form>

          </div>
        )}
      </div>
      {/* PREMIUM CUSTOMIZER DIALOG MODAL */}
      {activeCustomizerItem && (() => {
        const item = activeCustomizerItem;
        const starches = item.primaryStarchOptions ? JSON.parse(item.primaryStarchOptions) : [];
        const salads = item.complementarySaladOptions ? JSON.parse(item.complementarySaladOptions) : [];
        const veggies = item.sideVeggieOptions ? JSON.parse(item.sideVeggieOptions) : [];
        const extrasList = item.addOnSides ? JSON.parse(item.addOnSides) : [];
        const beveragesList = item.beverages ? JSON.parse(item.beverages) : [];

        // Calculate active item cost dynamically inside the modal
        let runningPrice = item.price;
        extrasList.forEach((extra: any) => {
          if (customExtras[extra.name]) {
            runningPrice += parseExtraPrice(extra.price);
          }
        });
        beveragesList.forEach((bev: any) => {
          if (customBeverages[bev.name]) {
            runningPrice += parseExtraPrice(bev.price);
          }
        });

        return (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setActiveCustomizerItem(null)}
            />
            {/* Modal */}
            <div className="fixed inset-x-4 bottom-4 top-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[680px] md:max-h-[90vh] z-50 bg-bg-card/98 border border-white/10 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.95)] backdrop-blur-2xl overflow-hidden flex flex-col justify-between animate-fade-in">

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
                  onClick={() => setActiveCustomizerItem(null)}
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
                  {item.image && item.image !== 'null' && item.image !== '' && (
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary bg-bg-dark shadow-[0_10px_25px_rgba(0,0,0,0.5)] flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
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
                      {extrasList.map((extra: any) => {
                        const isChecked = !!customExtras[extra.name];
                        const price = parseExtraPrice(extra.price);
                        return (
                          <button
                            key={extra.name}
                            type="button"
                            onClick={() => setCustomExtras(prev => ({ ...prev, [extra.name]: !isChecked }))}
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
                      {beveragesList.map((bev: any) => {
                        const isChecked = !!customBeverages[bev.name];
                        const price = parseExtraPrice(bev.price);
                        return (
                          <button
                            key={bev.name}
                            type="button"
                            onClick={() => setCustomBeverages(prev => ({ ...prev, [bev.name]: !isChecked }))}
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
                  <span className="text-[9px] uppercase tracking-wider text-white/40 font-bold block">Compound Cost</span>
                  <span className="text-2xl font-black text-primary-light">R {runningPrice.toFixed(2)}</span>
                </div>
                <button
                  type="button"
                  onClick={handleConfirmCustomization}
                  className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-light text-white font-extrabold rounded-full text-xs tracking-widest uppercase transition-all cursor-pointer shadow-lg shadow-primary/20 hover:shadow-primary/45 border border-primary-light/20 flex items-center justify-center gap-2"
                >
                  <span>Confirm & Add to Plate</span> <Flame className="w-4 h-4" />
                </button>
              </div>

            </div>
          </>
        );
      })()}

      {/* Backdrop overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-500" onClick={() => setIsCartOpen(false)} />
      )}

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
            {/* Pulsating glowing ember dot */}
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

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onSuccess={(user) => { setUser(user); setIsAuthModalOpen(false); }} />
    </div>
  );
};

export default App;
