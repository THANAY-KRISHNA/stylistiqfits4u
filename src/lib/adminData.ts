import { supabase } from './supabase';
import type { Product } from '../types';
import { mapDatabaseProduct } from './supabase';
import { PRODUCTS } from '../data/products';

// ─── Product Admin Operations ──────────────────────────────────────────────

export interface AdminProduct extends Product {
  sku?: string;
  status?: 'published' | 'draft' | 'archived';
  created_at?: string;
  updated_at?: string;
}

const LOCAL_PRODUCTS_KEY = 'stylistiq_admin_local_products';
const LOCAL_ORDERS_KEY = 'stylistiq_admin_local_orders';

function getLocalProducts(): AdminProduct[] {
  try {
    const saved = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  const initial = PRODUCTS.map((p, idx) => ({
    ...p,
    sku: `STYL-${p.category.toUpperCase().slice(0, 3)}-${String(idx + 1).padStart(3, '0')}`,
    status: 'published' as AdminProduct['status'],
    created_at: new Date(Date.now() - idx * 86400000).toISOString(),
  }));
  try {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(initial));
  } catch {}
  return initial;
}

function saveLocalProducts(products: AdminProduct[]) {
  try {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
  } catch {}
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Fetch all products for admin (includes drafts and archived).
 */
export async function adminFetchAllProducts(): Promise<{
  products: AdminProduct[];
  error?: string;
}> {
  if (!supabase) {
    return { products: getLocalProducts() };
  }

  let { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    const retry = await supabase.from('products').select('*');
    if (!retry.error) {
      data = retry.data;
      error = null;
    }
  }

  if (error) {
    return { products: getLocalProducts(), error: undefined };
  }

  return {
    products: (data ?? []).map((row) => ({
      ...mapDatabaseProduct(row),
      sku: row.sku ?? undefined,
      status: (row.status ?? 'published') as AdminProduct['status'],
      created_at: row.created_at,
      updated_at: row.updated_at,
    })),
  };
}

/**
 * Create a new product record.
 */
export async function adminCreateProduct(
  product: Partial<AdminProduct>
): Promise<{ id: string | null; error?: string }> {
  const id = product.id?.trim() || `${slugify(product.name || 'product')}-${Date.now().toString(36)}`;

  if (!supabase) {
    const existing = getLocalProducts();
    const newProduct: AdminProduct = {
      id,
      name: product.name || 'New Product',
      category: product.category || 'Kurtis',
      price: Number(product.price || 0),
      originalPrice: Number(product.originalPrice || product.price || 0),
      rating: product.rating ?? 4.8,
      reviewCount: product.reviewCount ?? 0,
      badge: product.badge,
      inStock: product.inStock ?? true,
      description: product.description || '',
      images: product.images || [],
      colors: product.colors || [{ name: 'Default', hex: '#2E221F' }],
      sizes: product.sizes || ['XS', 'S', 'M', 'L', 'XL'],
      fabric: product.fabric,
      occasion: product.occasion,
      care: product.care,
      featured: product.featured ?? false,
      newArrival: product.newArrival ?? true,
      sku: product.sku || `STYL-${(product.category || 'KRT').toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-3)}`,
      status: product.status || 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveLocalProducts([newProduct, ...existing]);
    return { id };
  }

  const payload = buildProductPayload({
    ...product,
    id,
    status: product.status ?? 'draft',
  });

  let { data, error } = await supabase
    .from('products')
    .insert([payload])
    .select('id')
    .single();

  if (error && (error.message.includes('status') || error.message.includes('sku'))) {
    const fallback = { ...payload };
    delete fallback.status;
    delete fallback.sku;
    const retry = await supabase
      .from('products')
      .insert([fallback])
      .select('id')
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    if (error.code === 'PGRST205' || error.message.includes('Could not find the table') || error.message.includes('relation "products" does not exist')) {
      const existing = getLocalProducts();
      const newProduct: AdminProduct = {
        id,
        name: product.name || 'New Product',
        category: product.category || 'Kurtis',
        price: Number(product.price || 0),
        originalPrice: Number(product.originalPrice || product.price || 0),
        rating: product.rating ?? 4.8,
        reviewCount: product.reviewCount ?? 0,
        badge: product.badge,
        inStock: product.inStock ?? true,
        description: product.description || '',
        images: product.images || [],
        colors: product.colors || [{ name: 'Default', hex: '#2E221F' }],
        sizes: product.sizes || ['XS', 'S', 'M', 'L', 'XL'],
        fabric: product.fabric,
        occasion: product.occasion,
        care: product.care,
        featured: product.featured ?? false,
        newArrival: product.newArrival ?? true,
        sku: product.sku || `STYL-${(product.category || 'KRT').toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-3)}`,
        status: product.status || 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      saveLocalProducts([newProduct, ...existing]);
      return { id };
    }
    return { id: null, error: error.message };
  }
  return { id: data?.id ?? id };
}

/**
 * Update an existing product by ID.
 */
export async function adminUpdateProduct(
  id: string,
  updates: Partial<AdminProduct>
): Promise<{ error?: string }> {
  if (!supabase) {
    const existing = getLocalProducts();
    const updated = existing.map((p) =>
      p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
    );
    saveLocalProducts(updated);
    return {};
  }

  const payload = buildProductPayload(updates);
  delete payload.id;

  let { error } = await supabase
    .from('products')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error && (error.message.includes('status') || error.message.includes('sku'))) {
    const fallback = { ...payload };
    delete fallback.status;
    delete fallback.sku;
    const retry = await supabase
      .from('products')
      .update({ ...fallback, updated_at: new Date().toISOString() })
      .eq('id', id);
    error = retry.error;
  }

  if (error) {
    if (error.code === 'PGRST205' || error.message.includes('Could not find the table')) {
      const existing = getLocalProducts();
      const updated = existing.map((p) =>
        p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
      );
      saveLocalProducts(updated);
      return {};
    }
  }

  return { error: error?.message };
}

/**
 * Toggle a product's published status.
 */
export async function adminTogglePublish(
  id: string,
  published: boolean
): Promise<{ error?: string }> {
  return adminUpdateProduct(id, {
    status: published ? 'published' : 'draft',
  } as Partial<AdminProduct>);
}

/**
 * Soft-delete a product by setting status to 'archived'.
 */
export async function adminArchiveProduct(id: string): Promise<{ error?: string }> {
  return adminUpdateProduct(id, { status: 'archived' } as Partial<AdminProduct>);
}

/**
 * Permanently delete a product.
 */
export async function adminDeleteProduct(id: string): Promise<{ error?: string }> {
  if (!supabase) {
    const existing = getLocalProducts();
    saveLocalProducts(existing.filter((p) => p.id !== id));
    return {};
  }
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error && (error.code === 'PGRST205' || error.message.includes('Could not find the table'))) {
    const existing = getLocalProducts();
    saveLocalProducts(existing.filter((p) => p.id !== id));
    return {};
  }
  return { error: error?.message };
}

// ─── Order Admin Operations ─────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface AdminOrder {
  id: string;
  order_id: string;
  created_at: string;
  date: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: Record<string, string>;
  total: number;
  subtotal: number;
  discount: number;
  shipping: number;
  payment_method: string;
  payment_status: string;
  delivery_estimate: string;
  items: unknown[];
  status: OrderStatus;
}

function getLocalOrders(): AdminOrder[] {
  try {
    const saved = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (saved) {
      const orders = JSON.parse(saved);
      // Clean out any old mock data from previous sessions
      if (Array.isArray(orders)) {
        return orders.filter((o: any) => o.id !== 'ord-1' && o.id !== 'ord-2' && o.id !== 'ord-3' && o.id !== 'ord-4');
      }
    }
  } catch {}
  return [];
}

export async function adminFetchOrders(
  status?: OrderStatus
): Promise<{ orders: AdminOrder[]; error?: string }> {
  if (!supabase) {
    const all = getLocalOrders();
    const filtered = status ? all.filter((o) => o.status === status) : all;
    return { orders: filtered };
  }

  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) {
    const all = getLocalOrders();
    return { orders: status ? all.filter((o) => o.status === status) : all };
  }

  return { orders: data as AdminOrder[] };
}

export async function adminUpdateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<{ error?: string }> {
  if (!supabase) {
    const orders = getLocalOrders();
    const updated = orders.map((o) =>
      o.order_id === orderId ? { ...o, status, updated_at: new Date().toISOString() } : o
    );
    try {
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(updated));
    } catch {}
    return {};
  }

  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('order_id', orderId);
  return { error: error?.message };
}

// ─── Storage Operations ─────────────────────────────────────────────────────

export const STORAGE_BUCKET = 'product-images';

/**
 * Upload an optimized image to Supabase Storage (or create local object URL if offline).
 */
export async function uploadProductImage(
  fileOrBlob: File | Blob,
  filename?: string,
  folder: string = 'products'
): Promise<{ url: string | null; path: string | null; error?: string }> {
  if (!supabase) {
    const url = URL.createObjectURL(fileOrBlob);
    return { url, path: `${folder}/${filename || 'image.webp'}` };
  }

  const originalName = fileOrBlob instanceof File ? fileOrBlob.name : (filename || 'image.webp');
  const ext = originalName.split('.').pop() ?? 'webp';
  const cleanBase = originalName.replace(/\.[^/.]+$/, '').replace(/[^\w-]/g, '_');
  const fileName = `${folder}/${cleanBase}-${Date.now().toString(36)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, fileOrBlob, {
      contentType: fileOrBlob.type || 'image/webp',
      upsert: true,
    });

  if (uploadError) return { url: null, path: null, error: uploadError.message };

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);
  return { url: data.publicUrl, path: fileName, error: undefined };
}

/**
 * Delete a file from Supabase Storage by its path.
 */
export async function deleteStorageFile(filePath: string): Promise<{ error?: string }> {
  if (!supabase) return { error: undefined };
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
  return { error: error?.message };
}

/**
 * List all files in a storage folder.
 */
export async function listStorageFiles(folder: string = 'products') {
  if (!supabase) return { files: [], error: undefined };
  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).list(folder, {
    sortBy: { column: 'created_at', order: 'desc' },
  });
  if (error) return { files: [], error: error.message };
  return { files: data ?? [], error: undefined };
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function buildProductPayload(product: Partial<AdminProduct>): Record<string, unknown> {
  return {
    ...(product.id !== undefined && { id: product.id }),
    ...(product.name !== undefined && { name: product.name }),
    ...(product.category !== undefined && { category: product.category }),
    ...(product.price !== undefined && { price: product.price }),
    ...(product.originalPrice !== undefined && { original_price: product.originalPrice }),
    ...(product.description !== undefined && { description: product.description }),
    ...(product.images !== undefined && { images: product.images }),
    ...(product.colors !== undefined && { colors: product.colors }),
    ...(product.sizes !== undefined && { sizes: product.sizes }),
    ...(product.badge !== undefined && { badge: product.badge }),
    ...(product.inStock !== undefined && { in_stock: product.inStock }),
    ...(product.fabric !== undefined && { fabric: product.fabric }),
    ...(product.occasion !== undefined && { occasion: product.occasion }),
    ...(product.care !== undefined && { care: product.care }),
    ...(product.featured !== undefined && { featured: product.featured }),
    ...(product.newArrival !== undefined && { new_arrival: product.newArrival }),
    ...(product.rating !== undefined && { rating: product.rating }),
    ...(product.reviewCount !== undefined && { review_count: product.reviewCount }),
    ...((product as any).sku !== undefined && { sku: (product as any).sku }),
    ...((product as any).status !== undefined && { status: (product as any).status }),
    ...(product.kurtiLength !== undefined && { kurti_length: product.kurtiLength }),
    ...(product.dupatta !== undefined && { dupatta: product.dupatta }),
    ...(product.setIncludes !== undefined && { set_includes: product.setIncludes }),
  };
}
