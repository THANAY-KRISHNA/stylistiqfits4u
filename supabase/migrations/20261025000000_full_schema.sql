-- ==============================================================================
-- STYL IS TIQ - Complete PostgreSQL Schema, Security Policies & Seed Data
-- Project: lmgrhnwksuztcsmwkoqo
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
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view published products"
  ON public.products FOR SELECT
  USING (status = 'published' OR status IS NULL OR auth.jwt() ->> 'email' = 'stylistiqfits4u@gmail.com');

DROP POLICY IF EXISTS "Admin insert products" ON public.products;
CREATE POLICY "Admin insert products"
  ON public.products FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = 'stylistiqfits4u@gmail.com');

DROP POLICY IF EXISTS "Admin update products" ON public.products;
CREATE POLICY "Admin update products"
  ON public.products FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' = 'stylistiqfits4u@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'stylistiqfits4u@gmail.com');

DROP POLICY IF EXISTS "Admin delete products" ON public.products;
CREATE POLICY "Admin delete products"
  ON public.products FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' = 'stylistiqfits4u@gmail.com');

-- Orders RLS
DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
DROP POLICY IF EXISTS "Allow anon place orders" ON public.orders;
CREATE POLICY "Public can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin view all orders" ON public.orders;
DROP POLICY IF EXISTS "Allow anon read orders" ON public.orders;
CREATE POLICY "Admin view all orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'stylistiqfits4u@gmail.com');

DROP POLICY IF EXISTS "Admin update orders" ON public.orders;
CREATE POLICY "Admin update orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'email' = 'stylistiqfits4u@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'stylistiqfits4u@gmail.com');

DROP POLICY IF EXISTS "Admin delete orders" ON public.orders;
CREATE POLICY "Admin delete orders"
  ON public.orders FOR DELETE TO authenticated
  USING (auth.jwt() ->> 'email' = 'stylistiqfits4u@gmail.com');

-- Order Items & Cart Items RLS
DROP POLICY IF EXISTS "Allow anon manage cart items" ON public.cart_items;
CREATE POLICY "Allow anon manage cart items"
  ON public.cart_items FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert order_items" ON public.order_items;
CREATE POLICY "Allow insert order_items"
  ON public.order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow select order_items" ON public.order_items;
DROP POLICY IF EXISTS "Admin view order_items" ON public.order_items;
CREATE POLICY "Admin view order_items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'stylistiqfits4u@gmail.com');

DROP POLICY IF EXISTS "Admin delete order_items" ON public.order_items;
CREATE POLICY "Admin delete order_items"
  ON public.order_items FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'stylistiqfits4u@gmail.com');

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
  WITH CHECK (bucket_id = 'product-images' AND auth.jwt() ->> 'email' = 'stylistiqfits4u@gmail.com');

DROP POLICY IF EXISTS "Admin Update product-images" ON storage.objects;
CREATE POLICY "Admin Update product-images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND auth.jwt() ->> 'email' = 'stylistiqfits4u@gmail.com')
  WITH CHECK (bucket_id = 'product-images' AND auth.jwt() ->> 'email' = 'stylistiqfits4u@gmail.com');

DROP POLICY IF EXISTS "Admin Delete product-images" ON storage.objects;
CREATE POLICY "Admin Delete product-images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND auth.jwt() ->> 'email' = 'stylistiqfits4u@gmail.com');

-- 7. INITIAL PRODUCT SEED DATA (12 Products)
INSERT INTO public.products (
  id, name, category, price, original_price, rating, review_count, badge, in_stock, description,
  images, colors, sizes, fabric, kurti_length, dupatta, set_includes, occasion, care, featured, new_arrival, status, sku
) VALUES
(
  'floral-kurti-set',
  'Floral Kurti Set',
  'Kurtis',
  1299,
  1599,
  4.8,
  120,
  'NEW',
  true,
  'Elegant floral printed kurti set crafted in breathable rayon blend, paired with coordinating bottoms and lightweight matching dupatta. Perfect for casual outings, college wear, or small intimate gatherings.',
  ARRAY[
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=85'
  ],
  '[{"name":"Lavender","hex":"#BCA4D2"},{"name":"Sage Green","hex":"#9EAD9B"},{"name":"Blush Pink","hex":"#E6B8B8"},{"name":"Ivory Gold","hex":"#E3D7C5"}]'::jsonb,
  ARRAY['XS','S','M','L','XL','XXL'],
  'Premium Rayon Blend with Soft Sheen',
  '46 inches (Calf Length)',
  '2.4 meters lightweight flowy dupatta',
  'Kurti, Tailored Pant & Dupatta',
  'Casual Day Out, College, Small Gatherings, Office Casual',
  'Hand wash / Gentle cold machine wash inside out',
  true,
  true,
  'published',
  'STYL-KRT-001'
),
(
  'embroidered-co-ord-set',
  'Embroidered Co-ord Set',
  'Co-ords',
  1599,
  1999,
  4.7,
  98,
  'BESTSELLER',
  true,
  'Sophisticated dark chocolate noir co-ord featuring intricate golden thread embroidery along the placket and cuffs. High-slit longline tunic with matching straight trousers for an effortless modern ethnic silhouette.',
  ARRAY[
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=85'
  ],
  '[{"name":"Midnight Chocolate","hex":"#261D1A"},{"name":"Olive Bronze","hex":"#58533F"},{"name":"Deep Wine","hex":"#4E2129"}]'::jsonb,
  ARRAY['S','M','L','XL'],
  'Fine Slub Rayon with Zari Thread Detailing',
  '42 inches',
  'Not applicable (2-Piece Set)',
  'Embroidered Tunic Top & Straight Pants',
  'Festive Dinners, Evening Brunches, Friday Formals',
  'Dry clean recommended for initial wash',
  true,
  false,
  'published',
  'STYL-COO-002'
),
(
  'printed-a-line-kurti',
  'Printed A-Line Kurti',
  'Kurtis',
  1199,
  1499,
  4.6,
  76,
  'NEW',
  true,
  'Refreshing botanical sage print A-line kurti with delicate V-neckline and bell sleeve cuffs. Graceful movement with comfortable side pockets for daily wear.',
  ARRAY[
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85'
  ],
  '[{"name":"Botanical Sage","hex":"#879F84"},{"name":"Earthy Rust","hex":"#A85A48"},{"name":"Pale Mustard","hex":"#D6AE58"}]'::jsonb,
  ARRAY['XS','S','M','L','XL','XXL'],
  '100% Breathable Pure Cotton',
  '44 inches',
  NULL,
  'Single Kurti',
  'Everyday Wear, Workwear, Casual Brunch',
  'Machine wash with like colors',
  true,
  true,
  'published',
  'STYL-KRT-003'
),
(
  'tiered-maxi-dress',
  'Tiered Maxi Dress',
  'Dresses',
  1499,
  1899,
  4.6,
  64,
  'BESTSELLER',
  true,
  'Whimsical three-tiered maxi dress in romantic blush rose. Designed with soft flutter sleeves, a cinched drawstring waist, and gentle volume that twirls effortlessly.',
  ARRAY[
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=85'
  ],
  '[{"name":"Blush Rose","hex":"#DE9C97"},{"name":"Teal Lagoon","hex":"#4B7B82"},{"name":"Champagne Sand","hex":"#E4D5C5"}]'::jsonb,
  ARRAY['XS','S','M','L','XL'],
  'Flowy Georgette with Butter-Crepe Lining',
  '52 inches (Ankle Length)',
  NULL,
  'Full Length Tiered Dress with Tie Belt',
  'Vacation, Sunday Brunch, Sunset Parties',
  'Gentle hand wash in cold water',
  true,
  false,
  'published',
  'STYL-DRS-004'
),
(
  'cotton-co-ord-set',
  'Cotton Linen Co-ord Set',
  'Co-ords',
  1399,
  1699,
  4.7,
  91,
  NULL,
  true,
  'Chic resort-inspired co-ord set in breathable cotton linen. Features a smart camp collar shirt with tortoise buttons and relaxed high-waisted cropped trousers.',
  ARRAY[
    'https://images.unsplash.com/photo-1534126511673-b6899657816a?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=85'
  ],
  '[{"name":"Natural Sand","hex":"#DFD3C3"},{"name":"Terracotta","hex":"#B85D43"},{"name":"Slate Teal","hex":"#52797C"}]'::jsonb,
  ARRAY['S','M','L','XL'],
  'Premium Washed Cotton-Linen Blend',
  NULL,
  NULL,
  'Notched Collar Shirt & Elasticated Back Pants',
  'Resort Wear, Travel, Casual Workday',
  'Warm iron inside out, gentle wash',
  false,
  true,
  'published',
  'STYL-COO-005'
),
(
  'embroidered-kurti-set',
  'Embroidered Festive Kurti Set',
  'Sets',
  1699,
  2199,
  4.8,
  83,
  'NEW',
  true,
  'Opulent festive kurti set with delicate resham and sitara embroidery on organza paneling. Paired with a shimmering scallop-bordered organza dupatta.',
  ARRAY[
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85'
  ],
  '[{"name":"Lilac Mist","hex":"#CDB7D9"},{"name":"Mint Frost","hex":"#BBD5C6"},{"name":"Powder Blue","hex":"#B4CDE0"}]'::jsonb,
  ARRAY['XS','S','M','L','XL'],
  'Chanderi Silk Blend with Organza Scallops',
  '45 inches',
  '2.5 meters scalloped organza dupatta',
  'Silk Blend Kurti, Pants & Embroidered Dupatta',
  'Festivals, Puja, Intimate Weddings, Eid, Diwali',
  'Dry clean only',
  true,
  true,
  'published',
  'STYL-SET-006'
),
(
  'casual-button-top',
  'Casual Button-Down Cotton Top',
  'Tops',
  899,
  1099,
  4.5,
  50,
  NULL,
  true,
  'Everyday staple top in soft organic cotton. Features subtle front pintucks, wooden buttons, and a relaxed boxy cut that tucks seamlessly into palazzos or jeans.',
  ARRAY[
    'https://images.unsplash.com/photo-1534126511673-b6899657816a?auto=format&fit=crop&w=800&q=85'
  ],
  '[{"name":"Pistachio Sage","hex":"#9BB29B"},{"name":"Warm Vanilla","hex":"#F3EDE2"},{"name":"Dusty Peach","hex":"#E7B8A4"}]'::jsonb,
  ARRAY['XS','S','M','L','XL'],
  '100% Khadi Weave Cotton',
  NULL,
  NULL,
  'Single Top',
  'Daily College, Casual Office, Cafe Hangouts',
  'Machine wash regular',
  false,
  false,
  'published',
  'STYL-TOP-007'
),
(
  'palazzo-pants-black',
  'Pleated Flared Palazzo Pants',
  'Bottoms',
  999,
  1299,
  4.6,
  48,
  NULL,
  true,
  'Ultra-comfortable wide-leg palazzos with deep double side pockets, a clean flat front waist, and an elasticated back waistband for all-day comfort.',
  ARRAY[
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=85'
  ],
  '[{"name":"Midnight Black","hex":"#1C1917"},{"name":"Raw Off-White","hex":"#ECE8DF"},{"name":"Forest Olive","hex":"#4A5340"}]'::jsonb,
  ARRAY['S','M','L','XL','XXL'],
  'Heavy Rayon Twill with Fluid Drape',
  NULL,
  NULL,
  'Single Palazzo Pant',
  'Versatile Ethnic & Indo-Western Pairings',
  'Gentle wash inside out',
  false,
  false,
  'published',
  'STYL-BOT-008'
),
(
  'printed-boho-dress',
  'Printed Boho Midi Dress',
  'Dresses',
  1299,
  1699,
  4.6,
  67,
  NULL,
  true,
  'Vintage-inspired bohemian midi dress with hand-block inspired floral motifs, tassel tie-ups at the collar, and subtle smocked cuffs.',
  ARRAY[
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=85'
  ],
  '[{"name":"Indigo Night","hex":"#1F2A38"},{"name":"Maroon Spice","hex":"#59252A"}]'::jsonb,
  ARRAY['XS','S','M','L','XL'],
  'Mulmul Cotton with Cotton Lining',
  '48 inches',
  NULL,
  'Single Midi Dress with Fabric Belt',
  'Weekend Getaways, Art Exhibits, Dinners',
  'Cold hand wash with mild detergent',
  false,
  true,
  'published',
  'STYL-DRS-009'
),
(
  'potli-embroidered-bag',
  'Zari Embroidered Velvet Potli',
  'Accessories',
  849,
  1199,
  4.9,
  42,
  'LIMITED',
  true,
  'Handcrafted plush velvet potli purse adorned with resham threadwork, golden pearls, and heavy braided drawstring with custom latkan tassels.',
  ARRAY[
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=85'
  ],
  '[{"name":"Old Rose","hex":"#B57C76"},{"name":"Emerald","hex":"#264A38"},{"name":"Deep Burgundy","hex":"#4B1C24"}]'::jsonb,
  ARRAY['Free Size'],
  'Micro Velvet with Satin Lining and Metal Zari',
  NULL,
  NULL,
  'Handcrafted Potli with Pearl Handle Strap',
  'Weddings, Sangeet, Festive Receptions',
  'Spot clean only. Store in provided dust bag.',
  false,
  false,
  'published',
  'STYL-ACC-010'
),
(
  'oxidized-jhumka-earrings',
  'Heritage Oxidized Silver Jhumkas',
  'Accessories',
  699,
  999,
  4.8,
  88,
  NULL,
  true,
  'Traditional Kashmiri-inspired bell jhumkas with intricate floral filigree, tiny dangling ghungroo droplets, and hypoallergenic ear posts.',
  ARRAY[
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=85'
  ],
  '[{"name":"Antique Silver","hex":"#8F9094"}]'::jsonb,
  ARRAY['Free Size'],
  'German Silver Alloy (Nickel Free)',
  NULL,
  NULL,
  'Pair of Drop Earrings with Secure Stoppers',
  'Ethnic Ensembles, Festive Celebrations',
  'Keep away from perfumes, sweat and water',
  false,
  true,
  'published',
  'STYL-ACC-011'
),
(
  'chikankari-straight-kurti',
  'Chikankari Modal Straight Kurti',
  'Kurtis',
  1399,
  1799,
  4.9,
  112,
  'BESTSELLER',
  true,
  'Exquisite Lucknowi chikankari inspired embroidery on buttery modal fabric. Straight fit with side slits, detailed sleeves, and round keyhole neck.',
  ARRAY[
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85',
    'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=800&q=85'
  ],
  '[{"name":"Seafoam Green","hex":"#95C0B5"},{"name":"Peach Sorbet","hex":"#EBB4A2"},{"name":"Pristine White","hex":"#F9F8F6"}]'::jsonb,
  ARRAY['XS','S','M','L','XL','XXL'],
  'Pure Modal Chanderi with Shadow Embroidery',
  '45 inches',
  NULL,
  'Single Straight Kurti (Inner Slip Recommended)',
  'Day Events, Office, Festive Brunches',
  'Dry clean or gentle hand wash with liquid detergent',
  true,
  false,
  'published',
  'STYL-KRT-012'
)
ON CONFLICT (id) DO NOTHING;
