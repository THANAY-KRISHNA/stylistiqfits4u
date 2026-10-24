import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Globe,
  Database,
  Truck,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  Lock,
  Server,
  Key,
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE } from '../../utils/cartRules';

export const SettingsPage: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lmgrhnwksuztcsmwkoqo.supabase.co';
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'stylistiqfits4u@gmail.com';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sqlMigrationScript = `-- ==============================================================================
-- STYL IS TIQ - Complete PostgreSQL Schema, Security Policies & Seed Data
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/lmgrhnwksuztcsmwkoqo/sql
-- ==============================================================================

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  rating NUMERIC DEFAULT 4.5,
  review_count INTEGER DEFAULT 0,
  badge TEXT,
  in_stock BOOLEAN DEFAULT true,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  colors JSONB DEFAULT '[]',
  sizes TEXT[] DEFAULT '{"XS","S","M","L","XL","XXL"}',
  fabric TEXT,
  kurti_length TEXT,
  dupatta TEXT,
  set_includes TEXT,
  occasion TEXT,
  care TEXT,
  featured BOOLEAN DEFAULT false,
  new_arrival BOOLEAN DEFAULT false,
  reviews JSONB DEFAULT '[]',
  status TEXT DEFAULT 'published',
  sku TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku TEXT;

CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- 2. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  date TEXT NOT NULL,
  subtotal NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  coupon_code TEXT,
  shipping NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'Pending',
  delivery_estimate TEXT,
  items JSONB NOT NULL,
  status TEXT DEFAULT 'pending'
);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 3. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT REFERENCES public.orders(order_id) ON DELETE CASCADE,
  product_id TEXT,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  color TEXT,
  size TEXT,
  quantity INTEGER NOT NULL,
  category TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  image TEXT,
  color TEXT,
  size TEXT,
  quantity INTEGER NOT NULL,
  category TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cart_session ON public.cart_items(session_id);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Products RLS
DROP POLICY IF EXISTS "Public can view published products" ON public.products;
CREATE POLICY "Public can view published products"
  ON public.products FOR SELECT
  USING (status = 'published' OR status IS NULL OR auth.jwt() ->> 'email' = '${adminEmail}');

DROP POLICY IF EXISTS "Admin insert products" ON public.products;
CREATE POLICY "Admin insert products"
  ON public.products FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = '${adminEmail}');

DROP POLICY IF EXISTS "Admin update products" ON public.products;
CREATE POLICY "Admin update products"
  ON public.products FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' = '${adminEmail}')
  WITH CHECK (auth.jwt() ->> 'email' = '${adminEmail}');

DROP POLICY IF EXISTS "Admin delete products" ON public.products;
CREATE POLICY "Admin delete products"
  ON public.products FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' = '${adminEmail}');

-- Orders RLS
DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
CREATE POLICY "Public can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin view all orders" ON public.orders;
CREATE POLICY "Admin view all orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = '${adminEmail}');

DROP POLICY IF EXISTS "Admin update orders" ON public.orders;
CREATE POLICY "Admin update orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' = '${adminEmail}')
  WITH CHECK (auth.jwt() ->> 'email' = '${adminEmail}');

DROP POLICY IF EXISTS "Admin delete orders" ON public.orders;
CREATE POLICY "Admin delete orders"
  ON public.orders FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' = '${adminEmail}');

-- Order Items & Cart Items RLS
DROP POLICY IF EXISTS "Allow anon manage cart items" ON public.cart_items;
CREATE POLICY "Allow anon manage cart items"
  ON public.cart_items FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert order_items" ON public.order_items;
CREATE POLICY "Allow insert order_items"
  ON public.order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin view order_items" ON public.order_items;
CREATE POLICY "Admin view order_items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = '${adminEmail}');

DROP POLICY IF EXISTS "Admin delete order_items" ON public.order_items;
CREATE POLICY "Admin delete order_items"
  ON public.order_items FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' = '${adminEmail}');

-- 6. STORAGE BUCKET: product-images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  10485760,
  ARRAY['image/webp', 'image/jpeg', 'image/png', 'image/gif']
)
ON CONFLICT (id) DO UPDATE 
SET public = true, file_size_limit = 10485760;

DROP POLICY IF EXISTS "Public Access product-images" ON storage.objects;
CREATE POLICY "Public Access product-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admin Upload product-images" ON storage.objects;
CREATE POLICY "Admin Upload product-images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND auth.jwt() ->> 'email' = '${adminEmail}');

DROP POLICY IF EXISTS "Admin Update product-images" ON storage.objects;
CREATE POLICY "Admin Update product-images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND auth.jwt() ->> 'email' = '${adminEmail}')
  WITH CHECK (bucket_id = 'product-images' AND auth.jwt() ->> 'email' = '${adminEmail}');

DROP POLICY IF EXISTS "Admin Delete product-images" ON storage.objects;
CREATE POLICY "Admin Delete product-images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND auth.jwt() ->> 'email' = '${adminEmail}');
`;


  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#FAF8F5] font-serif">Store Settings & Deployment</h1>
        <p className="text-[#7E726D] text-sm mt-0.5">
          Configuration, security policies, and custom domain setup
        </p>
      </div>

      {/* Security Audit Banner */}
      <div className="bg-[#2E221F] border border-emerald-800/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-900/40 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#FAF8F5]">Security & Key Architecture</h2>
            <p className="text-xs text-[#D4C5B9] mt-1 leading-relaxed">
              STYL IS TIQ strictly adheres to the principle of least privilege. Your Supabase <strong>service_role</strong> secret key is <strong>never</strong> present in the frontend client or bundle. Write access to products, order management, and image storage is exclusively gated by authenticated session RLS matching the verified admin email.
            </p>
            <div className="mt-3 flex items-center gap-3 text-[11px] text-[#7E726D]">
              <span className="flex items-center gap-1 text-emerald-400">
                <Check className="w-3.5 h-3.5" /> No service-role key in bundle
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <Check className="w-3.5 h-3.5" /> Client-side RLS enforcement
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Store Info & Shipping Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Store Profile */}
        <div className="bg-[#2E221F] border border-[#3D2E2A] rounded-2xl p-6 shadow-xl">
          <h2 className="text-sm font-semibold text-[#FAF8F5] mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#C68B7B]" /> Store Profile
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[#7E726D] block mb-1">Store Name</label>
              <div className="bg-[#1C1412] px-3.5 py-2 rounded-xl text-[#FAF8F5] font-medium border border-[#3D2E2A]">
                STYL IS TIQ
              </div>
            </div>
            <div>
              <label className="text-[#7E726D] block mb-1">Support & Admin Email</label>
              <div className="bg-[#1C1412] px-3.5 py-2 rounded-xl text-[#FAF8F5] font-mono border border-[#3D2E2A]">
                {adminEmail}
              </div>
            </div>
            <div>
              <label className="text-[#7E726D] block mb-1">Store Currency</label>
              <div className="bg-[#1C1412] px-3.5 py-2 rounded-xl text-[#FAF8F5] font-medium border border-[#3D2E2A]">
                Indian Rupee (INR ₹)
              </div>
            </div>
          </div>
        </div>

        {/* Shipping & Thresholds */}
        <div className="bg-[#2E221F] border border-[#3D2E2A] rounded-2xl p-6 shadow-xl">
          <h2 className="text-sm font-semibold text-[#FAF8F5] mb-4 flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#C68B7B]" /> Shipping & Cart Rules
          </h2>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[#7E726D] block mb-1">Free Shipping Threshold</label>
              <div className="bg-[#1C1412] px-3.5 py-2 rounded-xl text-[#FAF8F5] font-medium border border-[#3D2E2A] flex justify-between">
                <span>Free delivery on orders</span>
                <span className="font-semibold text-emerald-400">≥ ₹{FREE_SHIPPING_THRESHOLD}</span>
              </div>
            </div>
            <div>
              <label className="text-[#7E726D] block mb-1">Standard Shipping Fee</label>
              <div className="bg-[#1C1412] px-3.5 py-2 rounded-xl text-[#FAF8F5] font-medium border border-[#3D2E2A] flex justify-between">
                <span>Flat rate under ₹{FREE_SHIPPING_THRESHOLD}</span>
                <span className="font-semibold text-[#C68B7B]">₹{STANDARD_SHIPPING_FEE}</span>
              </div>
            </div>
            <div>
              <label className="text-[#7E726D] block mb-1">Supported Payment Methods</label>
              <div className="bg-[#1C1412] px-3.5 py-2 rounded-xl text-[#FAF8F5] font-medium border border-[#3D2E2A]">
                UPI, Cash on Delivery (COD), Credit/Debit Cards, Netbanking
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vercel & Custom Domain Configuration */}
      <div className="bg-[#2E221F] border border-[#3D2E2A] rounded-2xl p-6 shadow-xl">
        <h2 className="text-sm font-semibold text-[#FAF8F5] mb-3 flex items-center gap-2">
          <Server className="w-4 h-4 text-[#C68B7B]" /> Vercel & Production Custom Domain
        </h2>
        <p className="text-xs text-[#7E726D] mb-4">
          To connect your custom domain <code className="text-[#C68B7B] bg-[#1C1412] px-1.5 py-0.5 rounded">stylistiqfits.com</code> on Vercel:
        </p>

        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-xl bg-[#1C1412] border border-[#3D2E2A] space-y-2">
            <div className="font-semibold text-[#FAF8F5]">1. Add Domain in Vercel Dashboard</div>
            <p className="text-[#7E726D]">
              Navigate to Vercel Project → <strong>Settings</strong> → <strong>Domains</strong> and add:
            </p>
            <div className="flex gap-2">
              <span className="px-2.5 py-1 bg-[#2E221F] rounded-lg text-[#C68B7B] font-mono">stylistiqfits.com</span>
              <span className="px-2.5 py-1 bg-[#2E221F] rounded-lg text-[#C68B7B] font-mono">www.stylistiqfits.com</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#1C1412] border border-[#3D2E2A] space-y-2">
            <div className="font-semibold text-[#FAF8F5]">2. DNS Records for Domain Registrar</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] font-mono">
                <thead>
                  <tr className="text-[#7E726D] border-b border-[#3D2E2A]">
                    <th className="pb-1">Type</th>
                    <th className="pb-1">Name</th>
                    <th className="pb-1">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3D2E2A] text-[#FAF8F5]">
                  <tr>
                    <td className="py-1.5 text-emerald-400 font-bold">A</td>
                    <td className="py-1.5">@</td>
                    <td className="py-1.5">76.76.21.21</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-emerald-400 font-bold">CNAME</td>
                    <td className="py-1.5">www</td>
                    <td className="py-1.5">cname.vercel-dns.com</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#1C1412] border border-[#3D2E2A] space-y-2">
            <div className="font-semibold text-[#FAF8F5]">3. Environment Variables in Vercel</div>
            <p className="text-[#7E726D]">
              In Vercel → <strong>Settings</strong> → <strong>Environment Variables</strong>, configure:
            </p>
            <div className="space-y-1 font-mono text-[11px]">
              <div className="text-[#FAF8F5]">VITE_SUPABASE_URL = {supabaseUrl}</div>
              <div className="text-[#FAF8F5]">VITE_SUPABASE_ANON_KEY = [Your Supabase Anon Key]</div>
              <div className="text-[#FAF8F5]">VITE_ADMIN_EMAIL = {adminEmail}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Database Schema & SQL Migration */}
      <div className="bg-[#2E221F] border border-[#3D2E2A] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#FAF8F5] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#C68B7B]" /> Supabase SQL Migration & RLS Script
          </h2>
          <button
            onClick={() => copyToClipboard(sqlMigrationScript, 'sql')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#A45543] hover:bg-[#8E3D2D] text-white rounded-lg text-xs font-medium transition-colors"
          >
            {copiedKey === 'sql' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                Copied SQL!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Migration SQL
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-[#7E726D] mb-4">
          Copy this script and paste it into your{' '}
          <a
            href="https://supabase.com/dashboard/project/lmgrhnwksuztcsmwkoqo/sql"
            target="_blank"
            rel="noreferrer"
            className="text-[#C68B7B] hover:underline inline-flex items-center gap-1"
          >
            Supabase SQL Editor <ExternalLink className="w-3 h-3" />
          </a>{' '}
          to guarantee that all RLS policies, storage bucket, and status columns are provisioned.
        </p>

        <pre className="bg-[#1C1412] p-4 rounded-xl text-[11px] font-mono text-[#D4C5B9] overflow-x-auto max-h-60 border border-[#3D2E2A]">
          {sqlMigrationScript}
        </pre>
      </div>
    </div>
  );
};
