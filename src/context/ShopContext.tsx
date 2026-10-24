import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, ProductCategory, OrderDetails } from '../types';
import { PRODUCTS } from '../data/products';
import { fetchProductsFromDatabase, syncCartToDatabase } from '../lib/supabase';

type AppPage = 'home' | 'shop' | 'product-detail' | 'cart' | 'checkout' | 'order-confirmation' | 'about' | 'contact';

interface ShopContextType {
  activePage: AppPage;
  navigateTo: (page: AppPage, productId?: string) => void;
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
  selectedProduct: Product | undefined;
  
  products: Product[];
  isLoadingProducts: boolean;
  refetchProducts: () => Promise<void>;

  cart: CartItem[];
  cartCount: number;
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  
  appliedCoupon: string;
  setAppliedCoupon: (code: string) => void;
  
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;

  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;

  isSizeGuideOpen: boolean;
  setIsSizeGuideOpen: (open: boolean) => void;

  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  selectedCategory: ProductCategory;
  setSelectedCategory: (cat: ProductCategory) => void;

  lastOrder: OrderDetails | null;
  setLastOrder: (order: OrderDetails | null) => void;

  toast: string | null;
  showToast: (message: string) => void;
}

const getSessionId = (): string => {
  try {
    let sid = localStorage.getItem('styl_is_tiq_session_id');
    if (!sid) {
      sid = 'guest_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      localStorage.setItem('styl_is_tiq_session_id', sid);
    }
    return sid;
  } catch {
    return 'guest_default';
  }
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const getInitialPage = (): { page: AppPage; productId: string } => {
  let page: AppPage = 'home';
  let productId = 'floral-kurti-set';

  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    if (path === '/shop') page = 'shop';
    else if (path === '/cart') page = 'cart';
    else if (path === '/checkout') page = 'checkout';
    else if (path === '/order-confirmation') page = 'order-confirmation';
    else if (path === '/about') page = 'about';
    else if (path === '/contact') page = 'contact';
    else if (path.startsWith('/product/')) {
      page = 'product-detail';
      const extracted = path.replace('/product/', '').trim();
      if (extracted) productId = extracted;
    }
  }

  return { page, productId };
};

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = getInitialPage();
  const [activePage, setActivePage] = useState<AppPage>(initial.page);
  const [selectedProductId, setSelectedProductId] = useState<string>(initial.productId);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('styl_is_tiq_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('styl_is_tiq_wishlist');
      return saved ? JSON.parse(saved) : ['embroidered-co-ord-set'];
    } catch {
      return ['embroidered-co-ord-set'];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string>('');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [lastOrder, setLastOrder] = useState<OrderDetails | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Load products from Supabase backend on mount
  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const result = await fetchProductsFromDatabase();
      if (result.fromDatabase && result.products.length > 0) {
        // Filter out drafts or archived products for storefront visitors
        const publicOnly = result.products.filter(
          (p: any) => !p.status || p.status === 'published'
        );
        setProducts(publicOnly.length > 0 ? publicOnly : result.products);
      }
    } catch (e) {
      console.warn('Using local catalog fallback:', e);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Sync browser popstate (back/forward button)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/admin')) return;
      if (path === '/shop') setActivePage('shop');
      else if (path === '/cart') setActivePage('cart');
      else if (path === '/checkout') setActivePage('checkout');
      else if (path === '/order-confirmation') setActivePage('order-confirmation');
      else if (path === '/about') setActivePage('about');
      else if (path === '/contact') setActivePage('contact');
      else if (path.startsWith('/product/')) {
        const id = path.replace('/product/', '').trim();
        if (id) setSelectedProductId(id);
        setActivePage('product-detail');
      } else {
        setActivePage('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('styl_is_tiq_cart', JSON.stringify(cart));
      const sid = getSessionId();
      syncCartToDatabase(sid, cart);
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('styl_is_tiq_wishlist', JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast((prev) => (prev === message ? null : prev));
    }, 3200);
  };

  const navigateTo = (page: AppPage, productId?: string) => {
    const targetId = productId || selectedProductId;
    if (productId) {
      setSelectedProductId(productId);
    }
    setActivePage(page);

    try {
      let targetPath = '/';
      if (page === 'shop') targetPath = '/shop';
      else if (page === 'cart') targetPath = '/cart';
      else if (page === 'checkout') targetPath = '/checkout';
      else if (page === 'order-confirmation') targetPath = '/order-confirmation';
      else if (page === 'about') targetPath = '/about';
      else if (page === 'contact') targetPath = '/contact';
      else if (page === 'product-detail') targetPath = `/product/${targetId}`;

      if (window.location.pathname !== targetPath && !window.location.pathname.startsWith('/admin')) {
        window.history.pushState({ page, productId: targetId }, '', targetPath);
      }
    } catch {
      // ignore in environments without history api
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0] || PRODUCTS[0];

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: Product, size: string, color: string, quantity = 1) => {
    const itemId = `${product.id}-${size}-${color}`;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      const newItem: CartItem = {
        id: itemId,
        productId: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.images[0],
        color,
        size,
        quantity,
        category: product.category
      };
      return [...prev, newItem];
    });

    showToast(`Added "${product.name}" (${size}, ${color}) to bag.`);
    setIsCartOpen(true);
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
    showToast('Item removed from cart.');
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from wishlist');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to wishlist');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return (
    <ShopContext.Provider
      value={{
        activePage,
        navigateTo,
        selectedProductId,
        setSelectedProductId,
        selectedProduct,
        products,
        isLoadingProducts,
        refetchProducts: loadProducts,
        cart,
        cartCount,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        appliedCoupon,
        setAppliedCoupon,
        wishlist,
        toggleWishlist,
        isInWishlist,
        isWishlistOpen,
        setIsWishlistOpen,
        quickViewProduct,
        setQuickViewProduct,
        isSizeGuideOpen,
        setIsSizeGuideOpen,
        isSearchOpen,
        setIsSearchOpen,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        lastOrder,
        setLastOrder,
        toast,
        showToast
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
