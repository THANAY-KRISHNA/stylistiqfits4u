import React, { useState } from 'react';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Tag, CheckCircle2, ChevronRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { calculateOrderTotals, formatINR, FREE_SHIPPING_THRESHOLD } from '../utils/cartRules';
import { ImageWithFallback } from '../components/ImageWithFallback';

export const CartPage: React.FC = () => {
  const {
    cart,
    cartCount,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    appliedCoupon,
    setAppliedCoupon,
    navigateTo
  } = useShop();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [orderNote, setOrderNote] = useState('');

  const totals = calculateOrderTotals(cart, appliedCoupon);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const code = couponInput.trim().toUpperCase();
    if (code === 'STYL10' || code === 'WELCOME500' || code === 'FESTIVE15') {
      setAppliedCoupon(code);
      setCouponError(null);
    } else {
      setCouponError('Invalid coupon code. Try STYL10 for 10% off.');
    }
  };

  return (
    <div className="pb-24">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-xs text-[#7E726D]">
          <button onClick={() => navigateTo('home')} className="hover:text-[#A45543]">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#2E221F] font-medium">Shopping Bag</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2E221F] mb-2">
          Your Shopping Bag
        </h1>
        <p className="text-xs sm:text-sm text-[#7E726D] mb-8">
          Review your chosen boutique items, apply offers, and proceed to checkout.
        </p>

        {cart.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-lg border border-[#E8DFD5] max-w-xl mx-auto p-8 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#F5EFE8] flex items-center justify-center text-[#A45543] mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 opacity-70" />
            </div>
            <h2 className="font-serif text-xl font-bold text-[#2E221F] mb-2">Your Bag is Empty</h2>
            <p className="text-xs text-[#7E726D] max-w-sm mx-auto mb-6">
              Looks like you haven't added any pieces yet. Explore our handcrafted kurtis and co-ord sets.
            </p>
            <button
              onClick={() => navigateTo('shop')}
              className="px-8 py-3 bg-[#A45543] hover:bg-[#8e4737] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Free Shipping Alert Bar */}
              <div className="p-4 bg-[#F5EFE8] rounded-lg border border-[#E8DFD5]">
                {totals.freeShippingDifference > 0 ? (
                  <div>
                    <div className="flex justify-between text-xs text-[#2E221F] font-medium mb-1.5">
                      <span>
                        Add <strong className="text-[#A45543]">{formatINR(totals.freeShippingDifference)}</strong> more to get <strong>FREE Delivery</strong>
                      </span>
                      <span className="text-[#7E726D]">{totals.freeShippingProgress}%</span>
                    </div>
                    <div className="w-full bg-[#E8DFD5] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#A45543] h-full rounded-full transition-all duration-300"
                        style={{ width: `${totals.freeShippingProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Your order qualifies for FREE Pan-India Shipping!</span>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="bg-white rounded-lg border border-[#E8DFD5] overflow-hidden divide-y divide-[#E8DFD5]">
                <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-[#FAF8F5] text-xs font-semibold text-[#7E726D] uppercase tracking-wider">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Price</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>

                {cart.map((item) => (
                  <div key={item.id} className="p-4 sm:px-6 sm:py-5 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center">
                    {/* Item Info */}
                    <div className="w-full sm:col-span-6 flex gap-4">
                      <div className="w-20 h-24 rounded bg-[#F5EFE8] overflow-hidden shrink-0">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          fallbackText={item.name}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase tracking-wider text-[#A45543] font-semibold">
                          {item.category}
                        </span>
                        <h3 className="font-serif text-sm font-semibold text-[#2E221F] truncate">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-[#7E726D] mt-1">
                          <span>Size: <strong className="text-[#2E221F]">{item.size}</strong></span>
                          <span>•</span>
                          <span>Color: <strong className="text-[#2E221F]">{item.color}</strong></span>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-xs text-[#A45543] hover:underline flex items-center gap-1 mt-2 sm:hidden"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="w-full sm:w-auto sm:col-span-2 flex items-center justify-between sm:justify-center">
                      <span className="text-xs text-[#7E726D] sm:hidden">Quantity:</span>
                      <div className="flex items-center border border-[#D4C5B9] rounded bg-white">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 text-[#2E221F] hover:bg-[#F5EFE8]"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 text-[#2E221F] hover:bg-[#F5EFE8]"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Unit Price */}
                    <div className="hidden sm:block sm:col-span-2 text-right text-xs text-[#7E726D] tabular-nums">
                      {formatINR(item.price)}
                    </div>

                    {/* Line Total & Remove */}
                    <div className="w-full sm:w-auto sm:col-span-2 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                      <span className="text-xs text-[#7E726D] sm:hidden">Total:</span>
                      <span className="text-sm font-bold text-[#2E221F] tabular-nums">
                        {formatINR(item.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="hidden sm:inline-flex text-xs text-[#7E726D] hover:text-[#A45543] transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Actions: Clear Cart & Note */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <button
                  onClick={() => navigateTo('shop')}
                  className="text-xs font-semibold text-[#A45543] hover:underline flex items-center gap-1"
                >
                  ← Continue Shopping
                </button>
                <button
                  onClick={clearCart}
                  className="text-xs text-[#7E726D] hover:text-[#A45543] underline"
                >
                  Clear Entire Bag
                </button>
              </div>

              {/* Special Delivery Instructions note */}
              <div className="bg-white p-4 rounded-lg border border-[#E8DFD5] space-y-1.5">
                <label className="text-xs font-semibold text-[#2E221F] block">
                  Add Special Instructions for Boutique / Gift Message (Optional):
                </label>
                <textarea
                  rows={2}
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="e.g. Please pack with tissue gift wrapping or deliver on weekend..."
                  className="w-full p-2.5 text-xs bg-[#FAF8F5] border border-[#D4C5B9] rounded focus:outline-none focus:border-[#A45543]"
                />
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-4 bg-white p-6 rounded-lg border border-[#E8DFD5] shadow-xs space-y-5 sticky top-28">
              <h2 className="font-serif text-lg font-bold text-[#2E221F] pb-3 border-b border-[#E8DFD5]">
                Order Summary
              </h2>

              {/* Promo Coupon Form */}
              <div className="space-y-2">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7E726D]" />
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#D4C5B9] rounded focus:outline-none focus:border-[#A45543] uppercase tracking-wider"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#2E221F] text-white text-xs font-semibold rounded hover:bg-[#A45543] transition-colors"
                  >
                    Apply
                  </button>
                </form>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded">
                    <span>Applied: <strong>{appliedCoupon}</strong></span>
                    <button
                      onClick={() => {
                        setAppliedCoupon('');
                        setCouponInput('');
                      }}
                      className="text-xs underline hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-[#7E726D]">
                    Use coupon <span className="font-semibold text-[#A45543]">STYL10</span> for 10% off orders over ₹999.
                  </p>
                )}
                {couponError && <p className="text-xs text-[#A45543]">{couponError}</p>}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2.5 text-xs text-[#7E726D] pt-2 border-t border-[#E8DFD5]">
                <div className="flex justify-between">
                  <span>Bag Subtotal ({cartCount} items)</span>
                  <span className="font-medium text-[#2E221F] tabular-nums">{formatINR(totals.subtotal)}</span>
                </div>

                {totals.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount Savings</span>
                    <span className="tabular-nums">-{formatINR(totals.discount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="font-medium tabular-nums">
                    {totals.shipping === 0 ? (
                      <span className="text-emerald-700 font-semibold uppercase text-[11px]">FREE</span>
                    ) : (
                      formatINR(totals.shipping)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-base font-bold text-[#2E221F] pt-3 border-t border-[#E8DFD5]">
                  <span>Total Amount</span>
                  <span className="text-lg text-[#A45543] tabular-nums">{formatINR(totals.total)}</span>
                </div>
                <p className="text-[11px] text-[#7E726D]">Inclusive of all applicable GST taxes</p>
              </div>

              {/* Checkout CTA */}
              <button
                type="button"
                onClick={() => navigateTo('checkout')}
                className="w-full py-3.5 bg-[#A45543] hover:bg-[#8e4737] text-white text-xs font-bold uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="p-3 bg-[#FAF8F5] rounded border border-[#E8DFD5] flex items-center gap-2 text-xs text-[#7E726D]">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                <span>Encrypted checkout. Cash on Delivery (COD) available across India.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
