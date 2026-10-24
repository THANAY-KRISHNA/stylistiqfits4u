import { CartItem } from '../types';

export const FREE_SHIPPING_THRESHOLD = 999;
export const STANDARD_SHIPPING_FEE = 99;

export interface CouponResult {
  code: string;
  discount: number;
  isValid: boolean;
  message: string;
}

export const VALID_COUPONS: Record<string, { type: 'percent' | 'flat'; value: number; minSpend: number; description: string }> = {
  STYL10: {
    type: 'percent',
    value: 10,
    minSpend: 999,
    description: '10% off on orders above ₹999'
  },
  WELCOME500: {
    type: 'flat',
    value: 500,
    minSpend: 2499,
    description: 'Flat ₹500 off on orders above ₹2499'
  },
  FESTIVE15: {
    type: 'percent',
    value: 15,
    minSpend: 1499,
    description: '15% off festive styles above ₹1499'
  }
};

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function calculateShipping(subtotal: number): number {
  if (subtotal === 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
}

export function applyCoupon(subtotal: number, code?: string): CouponResult {
  if (!code || !code.trim()) {
    return { code: '', discount: 0, isValid: false, message: '' };
  }

  const normalized = code.trim().toUpperCase();
  const rule = VALID_COUPONS[normalized];

  if (!rule) {
    return {
      code: normalized,
      discount: 0,
      isValid: false,
      message: 'Invalid coupon code. Try STYL10 or WELCOME500'
    };
  }

  if (subtotal < rule.minSpend) {
    return {
      code: normalized,
      discount: 0,
      isValid: false,
      message: `Add ₹${rule.minSpend - subtotal} more to unlock coupon ${normalized}`
    };
  }

  const discount = rule.type === 'percent'
    ? Math.round((subtotal * rule.value) / 100)
    : Math.min(rule.value, subtotal);

  return {
    code: normalized,
    discount,
    isValid: true,
    message: `Coupon applied: ${rule.description}`
  };
}

export function calculateOrderTotals(items: CartItem[], couponCode?: string) {
  const subtotal = calculateSubtotal(items);
  const couponResult = applyCoupon(subtotal, couponCode);
  const discount = couponResult.isValid ? couponResult.discount : 0;
  const shipping = calculateShipping(subtotal - discount);
  const total = Math.max(0, subtotal - discount + shipping);
  const freeShippingDifference = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  return {
    subtotal,
    discount,
    shipping,
    total,
    couponResult,
    freeShippingDifference,
    freeShippingProgress
  };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function validateIndianPinCode(pin: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pin.trim());
}

export function validateIndianPhone(phone: string): boolean {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }
  return /^[6-9]\d{9}$/.test(cleaned);
}

export function generateOrderId(): string {
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `STIQ-${randomDigits}`;
}
