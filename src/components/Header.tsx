import React, { useState } from 'react';
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCategory } from '../types';

export const Header: React.FC = () => {
  const {
    activePage,
    navigateTo,
    cartCount,
    setIsCartOpen,
    wishlist,
    setIsWishlistOpen,
    setIsSearchOpen,
    setSelectedCategory
  } = useShop();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collectionsDropdownOpen, setCollectionsDropdownOpen] = useState(false);

  const handleCategoryNav = (cat: ProductCategory) => {
    setSelectedCategory(cat);
    navigateTo('shop');
    setMobileMenuOpen(false);
    setCollectionsDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8DFD5] transition-all">
      {/* Top Notification Bar */}
      <div className="bg-[#2E221F] text-[#FAF8F5] text-xs py-2 px-4 text-center tracking-wider font-medium flex items-center justify-center gap-3">
        <span>Free Shipping on Orders Above ₹999</span>
        <span className="opacity-40">|</span>
        <span>COD Available</span>
        <span className="opacity-40">|</span>
        <span>Easy 7-Day Returns</span>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-[#2E221F] hover:text-[#A45543] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A45543]"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo & Tagline */}
          <div className="flex-1 lg:flex-none flex justify-center lg:justify-start">
            <button
              onClick={() => navigateTo('home')}
              className="text-left group cursor-pointer focus:outline-none"
              aria-label="STYL IS TIQ Home"
            >
              <span className="block font-serif text-2xl sm:text-3xl font-bold tracking-[0.2em] text-[#2E221F] group-hover:text-[#A45543] transition-colors uppercase">
                STYL IS TIQ
              </span>
              <span className="block text-[10px] sm:text-[11px] tracking-[0.35em] text-[#A45543] uppercase font-medium pl-0.5">
                WEAR YOUR STORY
              </span>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium text-[#2E221F]">
            <button
              onClick={() => navigateTo('home')}
              className={`hover:text-[#A45543] transition-colors py-1 relative ${
                activePage === 'home' ? 'text-[#A45543] font-semibold' : ''
              }`}
            >
              Home
              {activePage === 'home' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#A45543]" />
              )}
            </button>

            <button
              onClick={() => {
                setSelectedCategory('All');
                navigateTo('shop');
              }}
              className={`hover:text-[#A45543] transition-colors py-1 relative ${
                activePage === 'shop' ? 'text-[#A45543] font-semibold' : ''
              }`}
            >
              Shop
              {activePage === 'shop' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#A45543]" />
              )}
            </button>

            <button
              onClick={() => {
                setSelectedCategory('Kurtis');
                navigateTo('shop');
              }}
              className="hover:text-[#A45543] transition-colors py-1"
            >
              New Arrivals
            </button>

            {/* Collections Dropdown */}
            <div className="relative group" onMouseLeave={() => setCollectionsDropdownOpen(false)}>
              <button
                onClick={() => setCollectionsDropdownOpen(!collectionsDropdownOpen)}
                onMouseEnter={() => setCollectionsDropdownOpen(true)}
                className="flex items-center gap-1 hover:text-[#A45543] transition-colors py-1"
              >
                <span>Collections</span>
                <ChevronDown className="w-4 h-4 opacity-70 group-hover:rotate-180 transition-transform" />
              </button>

              {collectionsDropdownOpen && (
                <div
                  className="absolute top-full left-0 w-48 py-2 bg-white rounded-md shadow-lg border border-[#E8DFD5] z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseEnter={() => setCollectionsDropdownOpen(true)}
                  onMouseLeave={() => setCollectionsDropdownOpen(false)}
                >
                  {(['Kurtis', 'Sets', 'Dresses', 'Co-ords', 'Tops', 'Bottoms', 'Accessories'] as ProductCategory[]).map(
                    (cat) => (
                      <button
                        key={cat}
                        onClick={() => handleCategoryNav(cat)}
                        className="w-full text-left px-4 py-2 text-xs text-[#2E221F] hover:bg-[#FAF8F5] hover:text-[#A45543] transition-colors"
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => navigateTo('about')}
              className={`hover:text-[#A45543] transition-colors py-1 relative ${
                activePage === 'about' ? 'text-[#A45543] font-semibold' : ''
              }`}
            >
              About
              {activePage === 'about' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#A45543]" />
              )}
            </button>

            <button
              onClick={() => navigateTo('contact')}
              className={`hover:text-[#A45543] transition-colors py-1 relative ${
                activePage === 'contact' ? 'text-[#A45543] font-semibold' : ''
              }`}
            >
              Contact
              {activePage === 'contact' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#A45543]" />
              )}
            </button>
          </nav>

          {/* Right Action Icons: Search, Wishlist, Cart */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-[#2E221F] hover:text-[#A45543] transition-colors focus:outline-none"
              aria-label="Search catalog"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Instagram / Social Profile Shortcut */}
            <a
              href="https://www.instagram.com/styl_is_tiq/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center p-2 text-[#2E221F] hover:text-[#A45543] transition-colors"
              title="Visit @styl_is_tiq on Instagram"
              aria-label="Instagram profile @styl_is_tiq"
            >
              <User className="w-5 h-5" />
            </a>

            {/* Wishlist Button with Counter */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2 text-[#2E221F] hover:text-[#A45543] transition-colors focus:outline-none"
              aria-label={`Wishlist with ${wishlist.length} saved items`}
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-[#A45543] rounded-full">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Bag Button with Counter */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#2E221F] hover:text-[#A45543] transition-colors focus:outline-none"
              aria-label={`Shopping bag with ${cartCount} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-[#A45543] rounded-full animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E8DFD5] py-4 px-2 bg-[#FAF8F5] animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col space-y-3 text-base font-medium text-[#2E221F]">
              <button
                onClick={() => {
                  navigateTo('home');
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3 py-2 rounded-md hover:bg-[#F5EFE8] hover:text-[#A45543]"
              >
                Home
              </button>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  navigateTo('shop');
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3 py-2 rounded-md hover:bg-[#F5EFE8] hover:text-[#A45543]"
              >
                Shop All
              </button>

              <div className="pl-4 border-l-2 border-[#E8DFD5] space-y-2 py-1">
                <span className="text-xs uppercase tracking-wider text-[#7E726D] font-bold">Categories</span>
                {(['Kurtis', 'Sets', 'Dresses', 'Co-ords', 'Tops', 'Bottoms', 'Accessories'] as ProductCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryNav(cat)}
                    className="block text-left text-sm text-[#2E221F] hover:text-[#A45543] py-1"
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  navigateTo('about');
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3 py-2 rounded-md hover:bg-[#F5EFE8] hover:text-[#A45543]"
              >
                About Boutique
              </button>
              <button
                onClick={() => {
                  navigateTo('contact');
                  setMobileMenuOpen(false);
                }}
                className="text-left px-3 py-2 rounded-md hover:bg-[#F5EFE8] hover:text-[#A45543]"
              >
                Contact & Support
              </button>
              <a
                href="https://www.instagram.com/styl_is_tiq/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-left px-3 py-2 text-xs text-[#A45543] font-semibold flex items-center gap-2"
              >
                <span>Follow @styl_is_tiq on Instagram</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
