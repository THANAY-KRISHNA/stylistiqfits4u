import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, CheckCircle2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { calculateOrderTotals, formatINR, FREE_SHIPPING_THRESHOLD } from '../utils/cartRules';
import { ImageWithFallback } from './ImageWithFallback';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    cartCount,
    updateCartQuantity,
    removeFromCart,
    appliedCoupon,
    setAppliedCoupon,
    navigateTo
  } = useShop();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const totals = calculateOrderTotals(cart, appliedCoupon);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const testCode = couponInput.trim().toUpperCase();
    const result = totals.couponResult;
    if (result.isValid || testCode === 'STYL10' || testCode === 'WELCOME500') {
      setAppliedCoupon(testCode);
      setCouponFeedback('Coupon applied successfully!');
    } else {
      setCouponFeedback('Invalid code or minimum spend requirement not met.');
    }
  };

  const handleQuickCoupon = (code: string) => {
    setCouponInput(code);
    setAppliedCoupon(code);
    setCouponFeedback(`Applied code ${code}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-[#1C1412]/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] text-[#2E221F] shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DFD5]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#A45543]" />
              <h2 className="font-serif text-lg font-bold">Shopping Bag</h2>
              <span className="text-xs text-[#7E726D]">({cartCount} items)</span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-[#7E726D] hover:text-[#2E221F] rounded-full hover:bg-[#F5EFE8] transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          <div className="px-6 py-3 bg-[#F5EFE8] border-b border-[#E8DFD5]">
            {totals.freeShippingDifference > 0 ? (
              <div>
                <p className="text-xs text-[#2E221F] font-medium mb-1.5">
                  Add <span className="font-bold text-[#A45543]">{formatINR(totals.freeShippingDifference)}</span> more for <span className="font-semibold">FREE Shipping</span>
                </p>
                <div className="w-full bg-[#E8DFD5] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#A45543] h-full transition-all duration-300 rounded-full"
                    style={{ width: `${totals.freeShippingProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Congratulations! You've unlocked FREE Shipping</span>
              </div>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#E8DFD5]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#F5EFE8] flex items-center justify-center text-[#A45543] mb-4">
                  <ShoppingBag className="w-8 h-8 opacity-70" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#2E221F] mb-1">Your bag is empty</h3>
                <p className="text-xs text-[#7E726D] max-w-xs mb-6">
                  Explore our handcrafted kurtis, co-ord sets, and modern ethnic pieces.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigateTo('shop');
                  }}
                  className="px-6 py-2.5 bg-[#2E221F] text-[#FAF8F5] text-xs font-semibold tracking-wider uppercase hover:bg-[#A45543] transition-colors rounded-sm shadow-sm"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="py-4 flex gap-4">
                  <div className="w-20 h-24 rounded bg-[#F5EFE8] overflow-hidden shrink-0">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      fallbackText={item.name}
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-serif text-sm font-semibold text-[#2E221F] line-clamp-1">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#7E726D] hover:text-[#A45543] p-1 transition-colors"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#7E726D] mt-1">
                        <span>Size: <strong className="text-[#2E221F]">{item.size}</strong></span>
                        <span>•</span>
                        <span>Color: <strong className="text-[#2E221F]">{item.color}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#D4C5B9] rounded bg-white">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-[#2E221F] hover:bg-[#F5EFE8] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-[#2E221F] hover:bg-[#F5EFE8] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Price */}
                      <span className="text-sm font-bold text-[#2E221F] tabular-nums">
                        {formatINR(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {cart.length > 0 && (
            <div className="border-t border-[#E8DFD5] px-6 py-4 bg-[#FAF8F5] space-y-3">
              {/* Coupon Code Section */}
              <div className="space-y-1.5">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7E726D]" />
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. STYL10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#D4C5B9] rounded focus:outline-none focus:border-[#A45543] uppercase tracking-wider"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#2E221F] text-white text-xs font-semibold rounded hover:bg-[#A45543] transition-colors"
                  >
                    Apply
                  </button>
                </form>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">
                    <span>Applied: <strong>{appliedCoupon}</strong></span>
                    <button
                      onClick={() => {
                        setAppliedCoupon('');
                        setCouponInput('');
                        setCouponFeedback(null);
                      }}
                      className="text-xs underline hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] text-[#7E726D]">
                    <span>Suggested:</span>
                    <button
                      type="button"
                      onClick={() => handleQuickCoupon('STYL10')}
                      className="underline font-semibold text-[#A45543] hover:text-[#2E221F]"
                    >
                      STYL10 (10% off &gt; ₹999)
                    </button>
                  </div>
                )}
                {couponFeedback && (
                  <p className="text-[11px] text-[#A45543] italic">{couponFeedback}</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs pt-2 border-t border-[#E8DFD5]">
                <div className="flex justify-between text-[#7E726D]">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-medium text-[#2E221F]">{formatINR(totals.subtotal)}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Coupon Discount</span>
                    <span className="tabular-nums">-{formatINR(totals.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#7E726D]">
                  <span>Estimated Shipping</span>
                  <span className="tabular-nums font-medium">
                    {totals.shipping === 0 ? (
                      <span className="text-emerald-700 font-semibold uppercase text-[11px]">FREE</span>
                    ) : (
                      formatINR(totals.shipping)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#2E221F] pt-2 border-t border-[#E8DFD5]">
                  <span>Grand Total</span>
                  <span className="tabular-nums text-base text-[#A45543]">{formatINR(totals.total)}</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    navigateTo('checkout');
                  }}
                  className="w-full py-3 bg-[#A45543] text-white text-xs font-bold uppercase tracking-widest rounded hover:bg-[#8e4737] transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    navigateTo('cart');
                  }}
                  className="w-full py-2 bg-transparent text-[#2E221F] text-xs font-semibold tracking-wider hover:text-[#A45543] transition-colors"
                >
                  View Full Cart &amp; Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
