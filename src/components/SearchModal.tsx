import React, { useState, useMemo } from 'react';
import { Search, X, ArrowRight, Tag } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { PRODUCTS } from '../data/products';
import { formatINR } from '../utils/cartRules';
import { ImageWithFallback } from './ImageWithFallback';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, navigateTo, products } = useShop();
  const [searchTerm, setSearchTerm] = useState('');

  const catalogProducts = (products && products.length > 0) ? products : PRODUCTS;

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase().trim();
    return catalogProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.fabric.toLowerCase().includes(term) ||
        p.colors.some((c) => c.name.toLowerCase().includes(term))
    );
  }, [searchTerm, catalogProducts]);

  if (!isSearchOpen) return null;

  const popularSearches = ['Kurti Set', 'Co-ord Set', 'Maxi Dress', 'Cotton Top', 'Palazzo', 'Chikankari'];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1C1412]/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsSearchOpen(false)}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl bg-[#FAF8F5] rounded-lg shadow-2xl overflow-hidden z-10 border border-[#E8DFD5] flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E8DFD5] flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-[#A45543] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search kurtis, dresses, co-ords, fabrics, colors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-sm sm:text-base text-[#2E221F] placeholder-[#7E726D] focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-[#7E726D] hover:text-[#2E221F]"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 text-[#7E726D] hover:text-[#2E221F]"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Popular Tags */}
        <div className="px-5 py-3 bg-[#F5EFE8] flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[#7E726D] flex items-center gap-1 shrink-0">
            <Tag className="w-3.5 h-3.5" /> Popular:
          </span>
          {popularSearches.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSearchTerm(tag)}
              className="px-2.5 py-1 bg-white hover:bg-[#2E221F] hover:text-white text-[#2E221F] rounded text-xs transition-colors shrink-0 shadow-2xs"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-[#E8DFD5]">
          {!searchTerm.trim() ? (
            <div className="py-8 text-center text-xs text-[#7E726D]">
              Type a keyword to discover handpicked styles from our collection.
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#7E726D]">
              No styles matched "{searchTerm}". Try searching for "kurti", "co-ord", or "dress".
            </div>
          ) : (
            searchResults.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  setIsSearchOpen(false);
                  navigateTo('product-detail', product.id);
                }}
                className="py-3 px-2 flex items-center gap-4 hover:bg-[#F5EFE8]/70 rounded cursor-pointer transition-colors group"
              >
                <div className="w-14 h-16 rounded bg-[#F5EFE8] overflow-hidden shrink-0">
                  <ImageWithFallback
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    fallbackText={product.name}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase tracking-wider text-[#A45543] font-semibold">
                    {product.category}
                  </span>
                  <h4 className="font-serif text-sm font-semibold text-[#2E221F] group-hover:text-[#A45543] truncate">
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-xs">
                    <span className="font-bold text-[#2E221F] tabular-nums">
                      {formatINR(product.price)}
                    </span>
                    <span className="text-[#7E726D]">★ {product.rating}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#7E726D] group-hover:text-[#A45543] group-hover:translate-x-1 transition-all" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
