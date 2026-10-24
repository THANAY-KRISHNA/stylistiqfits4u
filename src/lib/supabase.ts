import { createClient, User, Session } from '@supabase/supabase-js';
import { Product, CartItem, OrderDetails } from '../types';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../data/products';

const env = typeof import.meta !== 'undefined' && import.meta?.env ? import.meta.env : (typeof process !== 'undefined' ? process.env : {}) as any;
const supabaseUrl = env?.VITE_SUPABASE_URL || 'https://lmgrhnwksuztcsmwkoqo.supabase.co';
const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_lTlA5gd1JbFl-lLxEo8Z3A_PQo08bnB';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'your-supabase-anon-key-here' &&
  supabaseAnonKey.trim().length > 10
);

// Create client only if properly configured
export const supabase = isSupabaseConfigured && supabaseUrl
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'stylistiqfits4u_auth'
      }
    })
  : null;

// Re-export types for convenience
export type { User, Session };

/**
 * Normalizes raw Supabase row into standard STYL IS TIQ Product interface.
 * Supports both snake_case and camelCase schema designs.
 */
export function mapDatabaseProduct(row: Record<string, any>): Product {
  return {
    id: String(row.id || row.product_id || ''),
    name: row.name || 'Untitled Product',
    category: row.category || 'Kurtis',
    price: Number(row.price || 0),
    originalPrice: Number(row.original_price ?? row.originalPrice ?? row.price ?? 0),
    rating: Number(row.rating || 4.5),
    reviewCount: Number(row.review_count ?? row.reviewCount ?? 0),
    badge: row.badge || undefined,
    inStock: row.in_stock !== undefined ? Boolean(row.in_stock) : row.inStock !== undefined ? Boolean(row.inStock) : true,
    description: row.description || '',
    images: Array.isArray(row.images) ? row.images : typeof row.image === 'string' ? [row.image] : [],
    colors: Array.isArray(row.colors) ? row.colors : [],
    sizes: Array.isArray(row.sizes) ? row.sizes : ['S', 'M', 'L', 'XL'],
    fabric: row.fabric || '',
    kurtiLength: row.kurti_length || row.kurtiLength || undefined,
    dupatta: row.dupatta || undefined,
    setIncludes: row.set_includes || row.setIncludes || undefined,
    occasion: row.occasion || '',
    care: row.care || '',
    featured: Boolean(row.featured),
    newArrival: Boolean(row.new_arrival ?? row.newArrival),
    reviews: Array.isArray(row.reviews) ? row.reviews : []
  };
}

export function getLocalFallbackProducts(): Product[] {
  try {
    const saved = localStorage.getItem('stylistiq_admin_local_products');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return FALLBACK_PRODUCTS;
}

/**
 * Fetches all products from Supabase `products` table.
 * Automatically falls back to high-fidelity local products if database is empty or unconfigured.
 */
export async function fetchProductsFromDatabase(): Promise<{ products: Product[]; fromDatabase: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { products: getLocalFallbackProducts(), fromDatabase: false };
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn('Supabase fetch products notice:', error.message);
      return { products: getLocalFallbackProducts(), fromDatabase: false, error: error.message };
    }

    if (data && data.length > 0) {
      const filtered = data.filter((r) => r.id !== 'site_config_homepage' && r.category !== 'System');
      const mapped = filtered.map(mapDatabaseProduct);
      return { products: mapped, fromDatabase: true };
    }

    // Table exists but is empty
    return { products: getLocalFallbackProducts(), fromDatabase: false, error: 'Database table "products" is empty' };
  } catch (err: any) {
    console.error('Failed to fetch from Supabase:', err);
    return { products: getLocalFallbackProducts(), fromDatabase: false, error: err?.message || 'Network error' };
  }
}

/**
 * Persists an order into Supabase `orders` (and optionally `order_items`) table.
 */
export async function recordOrderToDatabase(order: OrderDetails): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    console.info('Supabase not configured: order stored locally in session.');
    return { success: true };
  }

  try {
    const payload = {
      order_id: order.orderId,
      date: order.date,
      subtotal: order.subtotal,
      discount: order.discount,
      coupon_code: order.couponCode || null,
      shipping: order.shipping,
      total: order.total,
      payment_method: order.paymentMethod,
      payment_status: order.paymentStatus,
      delivery_estimate: order.deliveryEstimate,
      customer_name: order.address.fullName,
      customer_email: order.address.email,
      customer_phone: order.address.phone,
      shipping_address: order.address,
      items: order.items,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase.from('orders').insert([payload]);

    if (error) {
      console.error('Failed to insert order into Supabase:', error);
      return { success: false, error: error.message };
    }

    // Try inserting into order_items if table exists (non-blocking)
    try {
      const itemsPayload = order.items.map((item) => ({
        order_id: order.orderId,
        product_id: item.productId,
        name: item.name,
        price: item.price,
        original_price: item.originalPrice,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        category: item.category,
        image: item.image
      }));
      await supabase.from('order_items').insert(itemsPayload);
    } catch {
      // order_items is optional if orders.items stores the full JSON
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error saving order to Supabase:', err);
    return { success: false, error: err?.message || 'Failed to submit order' };
  }
}

/**
 * Syncs cart items to Supabase `cart_items` table for persistent cross-device sessions.
 */
export async function syncCartToDatabase(sessionId: string, items: CartItem[]): Promise<void> {
  if (!supabase || !isSupabaseConfigured || !sessionId) return;

  try {
    // Upsert or replace session cart
    await supabase.from('cart_items').delete().eq('session_id', sessionId);
    if (items.length > 0) {
      const records = items.map((item) => ({
        session_id: sessionId,
        item_id: item.id,
        product_id: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        category: item.category,
        updated_at: new Date().toISOString()
      }));
      await supabase.from('cart_items').insert(records);
    }
  } catch (err) {
    console.warn('Non-critical: Cart sync to Supabase skipped:', err);
  }
}

/**
 * Diagnostic helper: checks connection and lists available tables
 */
export async function testConnection(): Promise<{
  connected: boolean;
  message: string;
  tablesFound?: string[];
}> {
  if (!isSupabaseConfigured) {
    return {
      connected: false,
      message: 'Supabase URL or Anon Key is missing in .env.'
    };
  }

  try {
    const checks = ['products', 'orders', 'cart_items'];
    const found: string[] = [];

    for (const table of checks) {
      const { error } = await supabase!.from(table).select('*').limit(1);
      if (!error || error.code !== 'PGRST205') { // PGRST205 means table not found
        found.push(table);
      }
    }

    return {
      connected: true,
      message: 'Connected to Supabase successfully.',
      tablesFound: found
    };
  } catch (err: any) {
    return {
      connected: false,
      message: err?.message || 'Connection failed.'
    };
  }
}
