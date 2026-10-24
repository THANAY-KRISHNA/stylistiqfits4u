-- ==============================================================================
-- STYL IS TIQ: Migration 002 - Admin Dashboard, RLS Policies & Storage
-- Project: stylistiqfits4u
-- URL: https://lmgrhnwksuztcsmwkoqo.supabase.co
-- ==============================================================================

-- 1. EXTEND PRODUCTS TABLE FOR ADMIN DASHBOARD
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS sku TEXT;

CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- 2. EXTEND ORDERS TABLE FOR ORDER MANAGEMENT
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 3. PRODUCTS ROW LEVEL SECURITY (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow public / guest shoppers to read published products
DROP POLICY IF EXISTS "Public can view published products" ON public.products;
CREATE POLICY "Public can view published products"
  ON public.products 
  FOR SELECT
  USING (
    status = 'published' 
    OR status IS NULL 
    OR auth.jwt() ->> 'email' = 'stylistiqfits4u@gmail.com'
  );

-- Only authenticated admin can insert products
DROP POLICY IF EXISTS "Admin insert products" ON public.products;
CREATE POLICY "Admin insert products"
  ON public.products 
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = 'stylistiqfits4u@gmail.com');

-- Only authenticated admin can update products
DROP POLICY IF EXISTS "Admin update products" ON public.products;
CREATE POLICY "Admin update products"
  ON public.products 
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'stylistiqfits4u@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'stylistiqfits4u@gmail.com');

-- Only authenticated admin can delete products
DROP POLICY IF EXISTS "Admin delete products" ON public.products;
CREATE POLICY "Admin delete products"
  ON public.products 
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'stylistiqfits4u@gmail.com');

-- Drop old broad policy if present
DROP POLICY IF EXISTS "Allow service role or admin to manage products" ON public.products;


-- 4. ORDERS ROW LEVEL SECURITY (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow shoppers to insert/place orders
DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
DROP POLICY IF EXISTS "Allow anon place orders" ON public.orders;
CREATE POLICY "Public can create orders"
  ON public.orders 
  FOR INSERT
  WITH CHECK (true);

-- Admin can read all orders; guest shoppers can read placed order by order_id or email
DROP POLICY IF EXISTS "Allow anon read orders" ON public.orders;
DROP POLICY IF EXISTS "Admin view all orders" ON public.orders;
CREATE POLICY "Admin view all orders"
  ON public.orders 
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'stylistiqfits4u@gmail.com');

-- Only admin can update order statuses (shipped, delivered, cancelled)
DROP POLICY IF EXISTS "Admin update orders" ON public.orders;
CREATE POLICY "Admin update orders"
  ON public.orders 
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'stylistiqfits4u@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'stylistiqfits4u@gmail.com');


-- 5. ORDER ITEMS RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow insert order_items" ON public.order_items;
CREATE POLICY "Allow insert order_items" 
  ON public.order_items 
  FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow select order_items" ON public.order_items;
CREATE POLICY "Allow select order_items" 
  ON public.order_items 
  FOR SELECT 
  USING (true);


-- 6. CART ITEMS RLS
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon manage cart items" ON public.cart_items;
CREATE POLICY "Allow anon manage cart items" 
  ON public.cart_items 
  FOR ALL 
  USING (true);


-- 7. SUPABASE STORAGE: product-images BUCKET
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/webp', 'image/jpeg', 'image/png', 'image/gif']
)
ON CONFLICT (id) DO UPDATE 
SET public = true, file_size_limit = 10485760;

-- Storage RLS: Public can view images
DROP POLICY IF EXISTS "Public Access product-images" ON storage.objects;
CREATE POLICY "Public Access product-images"
  ON storage.objects 
  FOR SELECT
  USING (bucket_id = 'product-images');

-- Storage RLS: Only Admin can upload images
DROP POLICY IF EXISTS "Admin Upload product-images" ON storage.objects;
CREATE POLICY "Admin Upload product-images"
  ON storage.objects 
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images' 
    AND auth.jwt() ->> 'email' = 'stylistiqfits4u@gmail.com'
  );

-- Storage RLS: Only Admin can delete images
DROP POLICY IF EXISTS "Admin Delete product-images" ON storage.objects;
CREATE POLICY "Admin Delete product-images"
  ON storage.objects 
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images' 
    AND auth.jwt() ->> 'email' = 'stylistiqfits4u@gmail.com'
  );
