import React from 'react';
import { CheckCircle, Package, Truck, Calendar, MapPin, CreditCard, ArrowRight, Printer } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatINR } from '../utils/cartRules';
import { ImageWithFallback } from '../components/ImageWithFallback';

export const OrderConfirmationPage: React.FC = () => {
  const { lastOrder, navigateTo } = useShop();

  if (!lastOrder) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <h2 className="font-serif text-2xl font-bold mb-3">No Recent Order Found</h2>
        <p className="text-xs text-[#7E726D] mb-6">Explore our storefront to place a new order.</p>
        <button
          onClick={() => navigateTo('shop')}
          className="px-6 py-2.5 bg-[#A45543] text-white text-xs font-semibold rounded uppercase tracking-wider"
        >
          Browse Shop
        </button>
      </div>
    );
  }

  const {
    orderId,
    date,
    items,
    subtotal,
    discount,
    shipping,
    total,
    address,
    paymentMethod,
    deliveryEstimate
  } = lastOrder;

  return (
    <div className="pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Success Header Card */}
        <div className="bg-white p-8 sm:p-10 rounded-xl border border-[#E8DFD5] shadow-sm text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50/60">
            <CheckCircle className="w-9 h-9" />
          </div>

          <span className="text-xs uppercase tracking-widest text-[#A45543] font-bold">
            Thank You, {address.fullName.split(' ')[0]}!
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2E221F] mt-1 mb-2">
            Your Order Has Been Confirmed
          </h1>
          <p className="text-xs sm:text-sm text-[#7E726D] max-w-md mx-auto mb-6">
            We've received your order and our artisan workshop is preparing your pieces with care. A confirmation email has been sent to <strong>{address.email}</strong>.
          </p>

          <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-8 p-4 bg-[#FAF8F5] rounded-lg border border-[#E8DFD5] text-xs">
            <div>
              <span className="text-[#7E726D] block text-[11px]">Order Reference</span>
              <strong className="text-sm font-serif text-[#A45543]">{orderId}</strong>
            </div>
            <div className="h-6 w-px bg-[#D4C5B9] hidden sm:block" />
            <div>
              <span className="text-[#7E726D] block text-[11px]">Order Date</span>
              <strong className="text-xs text-[#2E221F]">{date}</strong>
            </div>
            <div className="h-6 w-px bg-[#D4C5B9] hidden sm:block" />
            <div>
              <span className="text-[#7E726D] block text-[11px]">Delivery Estimate</span>
              <strong className="text-xs text-[#2E221F]">{deliveryEstimate}</strong>
            </div>
            <div className="h-6 w-px bg-[#D4C5B9] hidden sm:block" />
            <div>
              <span className="text-[#7E726D] block text-[11px]">Payment</span>
              <strong className="text-xs text-emerald-800 uppercase font-semibold">
                {paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod.toUpperCase()}
              </strong>
            </div>
          </div>
        </div>

        {/* Simulated Delivery Timeline */}
        <div className="bg-white p-6 rounded-xl border border-[#E8DFD5] shadow-2xs mb-8">
          <h2 className="font-serif text-base font-bold text-[#2E221F] mb-6 flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#A45543]" />
            <span>Shipment Journey Tracking</span>
          </h2>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs mb-2">
                ✓
              </div>
              <span className="font-semibold text-[#2E221F]">Confirmed</span>
              <span className="text-[10px] text-[#7E726D]">Received</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[#A45543] text-white flex items-center justify-center font-bold text-xs mb-2 animate-pulse">
                2
              </div>
              <span className="font-semibold text-[#2E221F]">Quality Check</span>
              <span className="text-[10px] text-[#7E726D]">In Progress</span>
            </div>

            <div className="flex flex-col items-center opacity-40">
              <div className="w-8 h-8 rounded-full bg-[#E8DFD5] text-[#7E726D] flex items-center justify-center font-bold text-xs mb-2">
                3
              </div>
              <span className="font-semibold text-[#2E221F]">Dispatched</span>
              <span className="text-[10px] text-[#7E726D]">Pending</span>
            </div>

            <div className="flex flex-col items-center opacity-40">
              <div className="w-8 h-8 rounded-full bg-[#E8DFD5] text-[#7E726D] flex items-center justify-center font-bold text-xs mb-2">
                4
              </div>
              <span className="font-semibold text-[#2E221F]">Delivered</span>
              <span className="text-[10px] text-[#7E726D]">Estimated 3-5 days</span>
            </div>
          </div>
        </div>

        {/* Order Details & Summary Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Shipping Address Summary */}
          <div className="bg-white p-5 rounded-xl border border-[#E8DFD5] text-xs space-y-2">
            <div className="flex items-center gap-2 font-serif text-sm font-bold text-[#2E221F] pb-2 border-b border-[#E8DFD5]">
              <MapPin className="w-4 h-4 text-[#A45543]" />
              <span>Delivery Address</span>
            </div>
            <p className="font-semibold text-sm text-[#2E221F]">{address.fullName}</p>
            <p className="text-[#7E726D]">
              {address.apartment && `${address.apartment}, `}
              {address.streetAddress}
            </p>
            <p className="text-[#7E726D]">
              {address.city}, {address.state} - <strong>{address.pinCode}</strong>
            </p>
            <p className="text-[#7E726D] pt-1">
              Contact: <strong>+91 {address.phone}</strong>
            </p>
          </div>

          {/* Payment Details */}
          <div className="bg-white p-5 rounded-xl border border-[#E8DFD5] text-xs space-y-2">
            <div className="flex items-center gap-2 font-serif text-sm font-bold text-[#2E221F] pb-2 border-b border-[#E8DFD5]">
              <CreditCard className="w-4 h-4 text-[#A45543]" />
              <span>Payment Details</span>
            </div>
            <p className="font-semibold text-[#2E221F]">
              Method: {paymentMethod === 'cod' ? 'Cash on Delivery (Pay upon arrival)' : paymentMethod.toUpperCase()}
            </p>
            <p className="text-[#7E726D]">
              Status: <span className="font-semibold text-emerald-800">{lastOrder.paymentStatus}</span>
            </p>
            <p className="text-[#7E726D]">
              Total Payable: <strong className="text-[#A45543] text-sm tabular-nums">{formatINR(total)}</strong>
            </p>
          </div>
        </div>

        {/* Itemized Receipt */}
        <div className="bg-white rounded-xl border border-[#E8DFD5] p-6 shadow-2xs mb-8">
          <h2 className="font-serif text-base font-bold text-[#2E221F] pb-3 border-b border-[#E8DFD5] mb-4">
            Order Items ({items.length})
          </h2>

          <div className="divide-y divide-[#E8DFD5]">
            {items.map((item) => (
              <div key={item.id} className="py-3 flex items-center gap-4 text-xs">
                <div className="w-14 h-18 rounded bg-[#F5EFE8] overflow-hidden shrink-0">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    fallbackText={item.name}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif text-sm font-semibold text-[#2E221F] truncate">
                    {item.name}
                  </h4>
                  <p className="text-[#7E726D] text-[11px] mt-0.5">
                    Size: {item.size} · Color: {item.color} · Qty: {item.quantity}
                  </p>
                </div>
                <span className="font-bold text-[#2E221F] tabular-nums">
                  {formatINR(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="pt-4 border-t border-[#E8DFD5] space-y-2 text-xs text-[#7E726D]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-[#2E221F] tabular-nums">{formatINR(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount</span>
                <span className="tabular-nums">-{formatINR(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-medium text-[#2E221F] tabular-nums">
                {shipping === 0 ? 'FREE' : formatINR(shipping)}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#2E221F] pt-2 border-t border-[#E8DFD5]">
              <span>Grand Total</span>
              <span className="text-[#A45543] tabular-nums">{formatINR(total)}</span>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto px-6 py-2.5 bg-white border border-[#D4C5B9] text-[#2E221F] text-xs font-semibold rounded hover:bg-[#FAF8F5] transition-colors flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={() => navigateTo('shop')}
            className="w-full sm:w-auto px-8 py-2.5 bg-[#A45543] hover:bg-[#8e4737] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
