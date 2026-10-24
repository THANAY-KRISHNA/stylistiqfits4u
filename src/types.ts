export type ProductCategory = 
  | 'All'
  | 'Kurtis'
  | 'Sets'
  | 'Dresses'
  | 'Tops'
  | 'Bottoms'
  | 'Co-ords'
  | 'Accessories';

export interface ProductColor {
  name: string;
  hex: string;
  image?: string;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  sizePurchased?: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  badge?: 'NEW' | 'BESTSELLER' | 'LIMITED' | 'SALE';
  inStock: boolean;
  description: string;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  fabric: string;
  kurtiLength?: string;
  dupatta?: string;
  setIncludes?: string;
  occasion: string;
  care: string;
  featured?: boolean;
  newArrival?: boolean;
  reviews?: ProductReview[];
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
  category: ProductCategory;
}

export interface FilterState {
  category: ProductCategory;
  minPrice: number;
  maxPrice: number;
  sizes: string[];
  colors: string[];
  inStockOnly: boolean;
  minRating: number;
  sortBy: 'newest' | 'price-low' | 'price-high' | 'rating' | 'popular';
  searchQuery: string;
}

export interface CustomerAddress {
  fullName: string;
  email: string;
  phone: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  state: string;
  pinCode: string;
  deliveryInstructions?: string;
}

export type PaymentMethod = 'cod' | 'upi' | 'card' | 'netbanking';

export interface OrderDetails {
  orderId: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shipping: number;
  total: number;
  address: CustomerAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: 'Pending' | 'Paid';
  deliveryEstimate: string;
}
