import React, { useState } from 'react';
import { Instagram, Mail, Phone, MapPin, ArrowRight, ShieldCheck, RefreshCw, Truck, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCategory } from '../types';

export const Footer: React.FC = () => {
  const { navigateTo, setSelectedCategory, showToast } = useShop();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    setIsSubscribed(true);
    showToast('Welcome to STYL IS TIQ! Use code STYL10 for 10% off.');
  };

  const handleCategoryClick = (cat: ProductCategory) => {
    setSelectedCategory(cat);
    navigateTo('shop');
  };

  return (
    <footer className="bg-[#2E221F] text-[#FAF8F5] pt-14 pb-10 border-t border-[#3E302C]">
      {/* Trust Badges Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-[#433531]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F5]/5 flex items-center justify-center text-[#C68B7B] mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold tracking-wide">Premium Quality</h4>
            <p className="text-xs text-[#D4C5B9] mt-1">Carefully Curated Handpicked Fabrics</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F5]/5 flex items-center justify-center text-[#C68B7B] mb-3">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold tracking-wide">Free Shipping</h4>
            <p className="text-xs text-[#D4C5B9] mt-1">On All Orders Above ₹999</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F5]/5 flex items-center justify-center text-[#C68B7B] mb-3">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold tracking-wide">Easy Returns</h4>
            <p className="text-xs text-[#D4C5B9] mt-1">Hassle-Free 7-Day Exchange Policy</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F5]/5 flex items-center justify-center text-[#C68B7B] mb-3">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold tracking-wide">Customer Support</h4>
            <p className="text-xs text-[#D4C5B9] mt-1">Always Here to Help Your Styling</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <span className="font-serif text-2xl font-bold tracking-[0.2em] text-[#FAF8F5] uppercase block">
                STYL IS TIQ
              </span>
              <span className="text-[11px] tracking-[0.35em] text-[#C68B7B] uppercase font-medium">
                WEAR YOUR STORY
              </span>
            </div>

            <p className="text-xs text-[#D4C5B9] leading-relaxed max-w-sm">
              A boutique dedicated to modern, modest, and effortless women's wear. We curate comfortable silhouettes in premium cottons, mulmuls, and festive silks crafted to celebrate everyday womanhood.
            </p>

            <div className="pt-2">
              <a
                href="https://www.instagram.com/styl_is_tiq/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#FAF8F5]/10 hover:bg-[#A45543] text-xs font-medium text-[#FAF8F5] transition-colors"
              >
                <Instagram className="w-4 h-4 text-[#C68B7B]" />
                <span>Follow @styl_is_tiq on Instagram</span>
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h5 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#FAF8F5] mb-4">
              Collections
            </h5>
            <ul className="space-y-2 text-xs text-[#D4C5B9]">
              {(['Kurtis', 'Sets', 'Dresses', 'Co-ords', 'Tops', 'Bottoms', 'Accessories'] as ProductCategory[]).map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => handleCategoryClick(cat)}
                    className="hover:text-[#C68B7B] transition-colors"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h5 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#FAF8F5] mb-4">
              Customer Care
            </h5>
            <ul className="space-y-2 text-xs text-[#D4C5B9]">
              <li>
                <button onClick={() => navigateTo('about')} className="hover:text-[#C68B7B] transition-colors">
                  Our Boutique Story
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('contact')} className="hover:text-[#C68B7B] transition-colors">
                  Contact Us
                </button>
              </li>
              <li>
                <span className="text-[#9E9088]">Shipping &amp; COD Terms</span>
              </li>
              <li>
                <span className="text-[#9E9088]">7-Day Returns Policy</span>
              </li>
              <li>
                <span className="text-[#9E9088]">Boutique FAQ</span>
              </li>
              <li>
                <a href="/admin" className="hover:text-[#C68B7B] transition-colors text-[11px] text-[#7E726D] inline-flex items-center gap-1">
                  <span>Admin Portal</span>
                  <span>→</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h5 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#FAF8F5] mb-4">
              Join The Circle
            </h5>
            <p className="text-xs text-[#D4C5B9] mb-3 leading-relaxed">
              Subscribe for private previews, festive edit releases, and receive 10% off your first order.
            </p>

            {isSubscribed ? (
              <div className="flex items-center gap-2 p-2.5 rounded bg-[#FAF8F5]/10 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Code <strong>STYL10</strong> has been unlocked!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5]/10 border border-[#433531] rounded text-xs text-white placeholder-[#9E9088] focus:outline-none focus:border-[#C68B7B]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-[#A45543] hover:bg-[#8e4737] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-[#433531] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#9E9088] gap-4">
        <p>© 2026 STYL IS TIQ. All rights reserved. Prototype for boutique presentation.</p>
        <p className="tracking-wide">
          Handcrafted with precision · Wear Your Story · Pan-India Shipping
        </p>
      </div>
    </footer>
  );
};
