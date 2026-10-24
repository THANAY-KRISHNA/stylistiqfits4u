import React, { useState } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ChevronRight,
  AlertCircle,
  QrCode
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import {
  calculateOrderTotals,
  formatINR,
  validateIndianPinCode,
  validateIndianPhone,
  generateOrderId
} from '../utils/cartRules';
import { CustomerAddress, PaymentMethod, OrderDetails } from '../types';
import { ImageWithFallback } from '../components/ImageWithFallback';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Delhi', 'Goa', 'Gujarat',
  'Haryana', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha',
  'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
];

export const CheckoutPage: React.FC = () => {
  const { cart, appliedCoupon, clearCart, setLastOrder, navigateTo } = useShop();
  const totals = calculateOrderTotals(cart, appliedCoupon);

  // Address Form State
  const [formData, setFormData] = useState<CustomerAddress>({
    fullName: '',
    email: '',
    phone: '',
    streetAddress: '',
    apartment: '',
    city: '',
    state: 'Karnataka',
    pinCode: '',
    deliveryInstructions: ''
  });

  const [shippingSpeed, setShippingSpeed] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [upiId, setUpiId] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If cart is empty, redirect to shop
  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <h2 className="font-serif text-2xl font-bold mb-3">No Items to Checkout</h2>
        <p className="text-xs text-[#7E726D] mb-6">Your shopping bag is currently empty.</p>
        <button
          onClick={() => navigateTo('shop')}
          className="px-6 py-2.5 bg-[#A45543] text-white text-xs font-semibold rounded uppercase tracking-wider"
        >
          Browse Shop
        </button>
      </div>
    );
  }

  const expressSurcharge = shippingSpeed === 'express' ? 149 : 0;
  const finalTotal = totals.total + expressSurcharge;

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) errors.fullName = 'Please enter your full name';
    if (!formData.email.trim() || !formData.email.includes('@')) errors.email = 'Valid email is required';
    if (!validateIndianPhone(formData.phone)) errors.phone = 'Valid 10-digit mobile number starting with 6-9 is required';
    if (!formData.streetAddress.trim()) errors.streetAddress = 'Please enter street address';
    if (!formData.city.trim()) errors.city = 'Please enter city';
    if (!validateIndianPinCode(formData.pinCode)) errors.pinCode = 'Valid 6-digit postal PIN code is required';

    if (paymentMethod === 'upi' && !upiId.includes('@')) {
      errors.upi = 'Please enter a valid UPI ID (e.g. yourname@oksbi / yourname@okaxis)';
    }

    if (paymentMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) errors.card = 'Please enter a 16-digit card number';
      if (!cardExpiry) errors.cardExpiry = 'MM/YY required';
      if (cardCvv.length < 3) errors.cardCvv = 'CVV required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo({ top: 150, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    // Simulate order placement
    setTimeout(() => {
      const orderId = generateOrderId();
      const newOrder: OrderDetails = {
        orderId,
        date: new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }),
        items: [...cart],
        subtotal: totals.subtotal,
        discount: totals.discount,
        couponCode: appliedCoupon || undefined,
        shipping: totals.shipping + expressSurcharge,
        total: finalTotal,
        address: { ...formData },
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Paid',
        deliveryEstimate: shippingSpeed === 'express' ? '2-3 Business Days' : '4-5 Business Days'
      };

      setLastOrder(newOrder);
      clearCart();
      setIsSubmitting(false);
      navigateTo('order-confirmation');
    }, 800);
  };

  return (
    <div className="pb-28">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-xs text-[#7E726D]">
          <button onClick={() => navigateTo('cart')} className="hover:text-[#A45543]">
            Shopping Bag
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#2E221F] font-medium">Checkout</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-bold text-[#2E221F] mb-1">Secure Checkout</h1>
        <p className="text-xs text-[#7E726D] mb-8">
          Complete your delivery and payment details to finalize your boutique order.
        </p>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Details & Payment */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Contact Information */}
            <div className="bg-white p-6 rounded-lg border border-[#E8DFD5] shadow-2xs space-y-4">
              <h2 className="font-serif text-base font-bold text-[#2E221F] flex items-center justify-between border-b border-[#E8DFD5] pb-3">
                <span>1. Contact Details</span>
                <span className="text-xs font-normal text-[#7E726D]">For SMS &amp; email delivery updates</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-[#2E221F] block mb-1">
                    Full Name <span className="text-[#A45543]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radhika Sharma"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className={`w-full p-2.5 bg-[#FAF8F5] border rounded focus:outline-none ${
                      formErrors.fullName ? 'border-red-500' : 'border-[#D4C5B9] focus:border-[#A45543]'
                    }`}
                  />
                  {formErrors.fullName && <p className="text-red-600 text-[11px] mt-1">{formErrors.fullName}</p>}
                </div>

                <div>
                  <label className="font-semibold text-[#2E221F] block mb-1">
                    Phone Number (10 Digits) <span className="text-[#A45543]">*</span>
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-2.5 bg-[#F5EFE8] border border-r-0 border-[#D4C5B9] rounded-l text-[#7E726D] font-medium">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      maxLength={10}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full p-2.5 bg-[#FAF8F5] border rounded-r focus:outline-none ${
                        formErrors.phone ? 'border-red-500' : 'border-[#D4C5B9] focus:border-[#A45543]'
                      }`}
                    />
                  </div>
                  {formErrors.phone && <p className="text-red-600 text-[11px] mt-1">{formErrors.phone}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-[#2E221F] block mb-1">
                    Email Address <span className="text-[#A45543]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="radhika@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full p-2.5 bg-[#FAF8F5] border rounded focus:outline-none ${
                      formErrors.email ? 'border-red-500' : 'border-[#D4C5B9] focus:border-[#A45543]'
                    }`}
                  />
                  {formErrors.email && <p className="text-red-600 text-[11px] mt-1">{formErrors.email}</p>}
                </div>
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div className="bg-white p-6 rounded-lg border border-[#E8DFD5] shadow-2xs space-y-4">
              <h2 className="font-serif text-base font-bold text-[#2E221F] border-b border-[#E8DFD5] pb-3">
                2. Delivery Address
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-[#2E221F] block mb-1">
                    Flat / House No. / Building / Floor
                  </label>
                  <input
                    type="text"
                    placeholder="Apt 402, Lotus Residency"
                    value={formData.apartment || ''}
                    onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D4C5B9] rounded focus:outline-none focus:border-[#A45543]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-[#2E221F] block mb-1">
                    Street Address &amp; Locality <span className="text-[#A45543]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="12th Main Road, Indiranagar"
                    value={formData.streetAddress}
                    onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                    className={`w-full p-2.5 bg-[#FAF8F5] border rounded focus:outline-none ${
                      formErrors.streetAddress ? 'border-red-500' : 'border-[#D4C5B9] focus:border-[#A45543]'
                    }`}
                  />
                  {formErrors.streetAddress && (
                    <p className="text-red-600 text-[11px] mt-1">{formErrors.streetAddress}</p>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-[#2E221F] block mb-1">
                    City <span className="text-[#A45543]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Bengaluru"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={`w-full p-2.5 bg-[#FAF8F5] border rounded focus:outline-none ${
                      formErrors.city ? 'border-red-500' : 'border-[#D4C5B9] focus:border-[#A45543]'
                    }`}
                  />
                  {formErrors.city && <p className="text-red-600 text-[11px] mt-1">{formErrors.city}</p>}
                </div>

                <div>
                  <label className="font-semibold text-[#2E221F] block mb-1">
                    PIN Code (6 Digits) <span className="text-[#A45543]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="560038"
                    maxLength={6}
                    value={formData.pinCode}
                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                    className={`w-full p-2.5 bg-[#FAF8F5] border rounded focus:outline-none ${
                      formErrors.pinCode ? 'border-red-500' : 'border-[#D4C5B9] focus:border-[#A45543]'
                    }`}
                  />
                  {formErrors.pinCode && <p className="text-red-600 text-[11px] mt-1">{formErrors.pinCode}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-[#2E221F] block mb-1">
                    State <span className="text-[#A45543]">*</span>
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#D4C5B9] rounded focus:outline-none focus:border-[#A45543]"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Delivery Speed */}
            <div className="bg-white p-6 rounded-lg border border-[#E8DFD5] shadow-2xs space-y-3">
              <h2 className="font-serif text-base font-bold text-[#2E221F] border-b border-[#E8DFD5] pb-3">
                3. Shipping Method
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label
                  className={`p-3.5 rounded border cursor-pointer flex items-start gap-3 transition-all ${
                    shippingSpeed === 'standard'
                      ? 'border-[#A45543] bg-[#FAF8F5]'
                      : 'border-[#D4C5B9] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <input
                    type="radio"
                    name="shippingSpeed"
                    checked={shippingSpeed === 'standard'}
                    onChange={() => setShippingSpeed('standard')}
                    className="mt-0.5 accent-[#A45543]"
                  />
                  <div>
                    <span className="font-bold text-[#2E221F] block">Standard Delivery</span>
                    <span className="text-[#7E726D]">3-5 Business Days</span>
                    <span className="block mt-1 font-semibold text-emerald-700">
                      {totals.shipping === 0 ? 'FREE' : formatINR(totals.shipping)}
                    </span>
                  </div>
                </label>

                <label
                  className={`p-3.5 rounded border cursor-pointer flex items-start gap-3 transition-all ${
                    shippingSpeed === 'express'
                      ? 'border-[#A45543] bg-[#FAF8F5]'
                      : 'border-[#D4C5B9] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <input
                    type="radio"
                    name="shippingSpeed"
                    checked={shippingSpeed === 'express'}
                    onChange={() => setShippingSpeed('express')}
                    className="mt-0.5 accent-[#A45543]"
                  />
                  <div>
                    <span className="font-bold text-[#2E221F] block">Express Air Shipping</span>
                    <span className="text-[#7E726D]">1-2 Business Days priority flight</span>
                    <span className="block mt-1 font-semibold text-[#2E221F]">₹149</span>
                  </div>
                </label>
              </div>
            </div>

            {/* 4. Payment Selection */}
            <div className="bg-white p-6 rounded-lg border border-[#E8DFD5] shadow-2xs space-y-4">
              <h2 className="font-serif text-base font-bold text-[#2E221F] border-b border-[#E8DFD5] pb-3 flex items-center justify-between">
                <span>4. Payment Option</span>
                <span className="text-xs font-normal text-[#7E726D] flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-700" /> 256-bit SSL Secure
                </span>
              </h2>

              <div className="space-y-3 text-xs">
                {/* Cash on Delivery */}
                <label
                  className={`p-4 rounded-lg border cursor-pointer block transition-all ${
                    paymentMethod === 'cod' ? 'border-[#A45543] bg-[#FAF8F5]' : 'border-[#D4C5B9]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-[#A45543]"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-sm text-[#2E221F] block">
                        Cash on Delivery (COD)
                      </span>
                      <span className="text-[#7E726D]">
                        Pay with cash or UPI QR to the courier agent upon doorstep arrival.
                      </span>
                    </div>
                  </div>
                </label>

                {/* UPI */}
                <label
                  className={`p-4 rounded-lg border cursor-pointer block transition-all ${
                    paymentMethod === 'upi' ? 'border-[#A45543] bg-[#FAF8F5]' : 'border-[#D4C5B9]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="accent-[#A45543]"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-sm text-[#2E221F] block">
                        UPI (Google Pay / PhonePe / Paytm / BHIM)
                      </span>
                      <span className="text-[#7E726D]">
                        Instant zero-surcharge transfer via any UPI app or Virtual Payment Address (VPA).
                      </span>
                    </div>
                  </div>

                  {paymentMethod === 'upi' && (
                    <div className="mt-4 pt-3 border-t border-[#E8DFD5] pl-6 space-y-2">
                      <label className="font-semibold block text-[#2E221F]">
                        Enter Your UPI ID / VPA:
                      </label>
                      <input
                        type="text"
                        placeholder="yourname@okaxis or yourphone@ybl"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full p-2 bg-white border border-[#D4C5B9] rounded focus:outline-none focus:border-[#A45543]"
                      />
                      {formErrors.upi && <p className="text-red-600 text-[11px]">{formErrors.upi}</p>}
                    </div>
                  )}
                </label>

                {/* Cards */}
                <label
                  className={`p-4 rounded-lg border cursor-pointer block transition-all ${
                    paymentMethod === 'card' ? 'border-[#A45543] bg-[#FAF8F5]' : 'border-[#D4C5B9]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="accent-[#A45543]"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-sm text-[#2E221F] block">
                        Credit / Debit Card (Visa, Mastercard, RuPay)
                      </span>
                      <span className="text-[#7E726D]">
                        All major Indian and international cards accepted.
                      </span>
                    </div>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="mt-4 pt-3 border-t border-[#E8DFD5] pl-6 space-y-3">
                      <div>
                        <label className="font-semibold block text-[#2E221F] mb-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          placeholder="Name on card"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          className="w-full p-2 bg-white border border-[#D4C5B9] rounded focus:outline-none focus:border-[#A45543]"
                        />
                      </div>
                      <div>
                        <label className="font-semibold block text-[#2E221F] mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          placeholder="4532 •••• •••• 8921"
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full p-2 bg-white border border-[#D4C5B9] rounded focus:outline-none focus:border-[#A45543]"
                        />
                        {formErrors.card && <p className="text-red-600 text-[11px] mt-1">{formErrors.card}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-semibold block text-[#2E221F] mb-1">
                            Expiry (MM/YY)
                          </label>
                          <input
                            type="text"
                            placeholder="08/28"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full p-2 bg-white border border-[#D4C5B9] rounded focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="font-semibold block text-[#2E221F] mb-1">CVV</label>
                          <input
                            type="password"
                            placeholder="•••"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full p-2 bg-white border border-[#D4C5B9] rounded focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Review & Confirmation CTA */}
          <div className="lg:col-span-5 bg-white p-6 rounded-lg border border-[#E8DFD5] shadow-xs space-y-5 sticky top-28">
            <h2 className="font-serif text-lg font-bold text-[#2E221F] pb-3 border-b border-[#E8DFD5]">
              Items In Your Order ({cart.length})
            </h2>

            {/* Compact items list */}
            <div className="max-h-60 overflow-y-auto divide-y divide-[#E8DFD5] pr-1">
              {cart.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center gap-3 text-xs">
                  <div className="w-12 h-14 rounded bg-[#F5EFE8] overflow-hidden shrink-0">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      fallbackText={item.name}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-[#2E221F] truncate">{item.name}</h4>
                    <span className="text-[#7E726D] text-[11px]">
                      {item.size} · {item.color} · Qty {item.quantity}
                    </span>
                  </div>
                  <span className="font-semibold tabular-nums text-[#2E221F]">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs pt-3 border-t border-[#E8DFD5] text-[#7E726D]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-[#2E221F] font-semibold tabular-nums">
                  {formatINR(totals.subtotal)}
                </span>
              </div>

              {totals.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Savings ({appliedCoupon})</span>
                  <span className="tabular-nums">-{formatINR(totals.discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping ({shippingSpeed === 'express' ? 'Express' : 'Standard'})</span>
                <span className="font-medium text-[#2E221F] tabular-nums">
                  {totals.shipping + expressSurcharge === 0 ? (
                    <span className="text-emerald-700 font-bold uppercase text-[11px]">FREE</span>
                  ) : (
                    formatINR(totals.shipping + expressSurcharge)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-base font-bold text-[#2E221F] pt-3 border-t border-[#E8DFD5]">
                <span>Total Payable</span>
                <span className="text-xl text-[#A45543] tabular-nums">
                  {formatINR(finalTotal)}
                </span>
              </div>
            </div>

            {/* Submit Order Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#A45543] hover:bg-[#8e4737] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              {isSubmitting ? (
                <span>Generating Order...</span>
              ) : (
                <>
                  <span>Place Order ({formatINR(finalTotal)})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[11px] text-[#7E726D] text-center">
              By placing your order, you agree to STYL IS TIQ's boutique terms and 7-day exchange policy.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
