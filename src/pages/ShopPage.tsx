import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, ChevronRight, X, Star, RotateCcw } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { PRODUCTS, CATEGORIES_DATA } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { ProductCategory, Product } from '../types';

export const ShopPage: React.FC = () => {
  const { selectedCategory, setSelectedCategory, navigateTo } = useShop();

  // Filter States
  const [minPrice, setMinPrice] = useState(500);
  const [maxPrice, setMaxPrice] = useState(3000);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'rating' | 'popular'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const ITEMS_PER_PAGE = 9;

  const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const COLOR_OPTIONS = [
    { label: 'Black', hex: '#1C1917' },
    { label: 'White', hex: '#F9F8F6' },
    { label: 'Pink', hex: '#DE9C97' },
    { label: 'Sage', hex: '#879F84' },
    { label: 'Beige', hex: '#DFD3C3' },
    { label: 'Navy', hex: '#1F2A38' },
    { label: 'Lavender', hex: '#BCA4D2' },
    { label: 'Rust', hex: '#A85A48' }
  ];

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
    setCurrentPage(1);
  };

  const handleColorToggle = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSelectedCategory('All');
    setMinPrice(500);
    setMaxPrice(3000);
    setSelectedSizes([]);
    setSelectedColors([]);
    setInStockOnly(false);
    setMinRating(0);
    setSortBy('newest');
    setCurrentPage(1);
  };

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    // Category
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Price
    result = result.filter((p) => p.price >= minPrice && p.price <= maxPrice);

    // Sizes
    if (selectedSizes.length > 0) {
      result = result.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
    }

    // Colors
    if (selectedColors.length > 0) {
      result = result.filter((p) =>
        p.colors.some((c) =>
          selectedColors.some((sc) => c.name.toLowerCase().includes(sc.toLowerCase()))
        )
      );
    }

    // Stock
    if (inStockOnly) {
      result = result.filter((p) => p.inStock);
    }

    // Rating
    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    // Sort
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'popular') {
      result.sort((a, b) => b.reviewCount - a.reviewCount);
    } else {
      // Newest
      result.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0));
    }

    return result;
  }, [selectedCategory, minPrice, maxPrice, selectedSizes, selectedColors, inStockOnly, minRating, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const activeFilterCount =
    (selectedCategory !== 'All' ? 1 : 0) +
    (minPrice > 500 || maxPrice < 3000 ? 1 : 0) +
    selectedSizes.length +
    selectedColors.length +
    (inStockOnly ? 1 : 0) +
    (minRating > 0 ? 1 : 0);

  // Render Filter Sidebar Content (shared between desktop and mobile drawer)
  const FilterControls = () => (
    <div className="space-y-6 text-xs text-[#2E221F]">
      {/* Categories */}
      <div>
        <h4 className="font-serif text-sm font-bold uppercase tracking-wider mb-3">Categories</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer hover:text-[#A45543]">
            <input
              type="radio"
              name="category"
              checked={selectedCategory === 'All'}
              onChange={() => {
                setSelectedCategory('All');
                setCurrentPage(1);
              }}
              className="accent-[#A45543]"
            />
            <span>All Styles</span>
            <span className="text-[#7E726D] text-[11px] ml-auto">({PRODUCTS.length})</span>
          </label>
          {CATEGORIES_DATA.map((cat) => (
            <label key={cat.name} className="flex items-center gap-2 cursor-pointer hover:text-[#A45543]">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === cat.name}
                onChange={() => {
                  setSelectedCategory(cat.name as ProductCategory);
                  setCurrentPage(1);
                }}
                className="accent-[#A45543]"
              />
              <span>{cat.name}</span>
              <span className="text-[#7E726D] text-[11px] ml-auto">
                ({PRODUCTS.filter((p) => p.category === cat.name).length})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="pt-4 border-t border-[#E8DFD5]">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-serif text-sm font-bold uppercase tracking-wider">Price Range</h4>
          <span className="text-[11px] font-semibold text-[#A45543]">
            ₹{minPrice} - ₹{maxPrice}
          </span>
        </div>
        <div className="space-y-2">
          <input
            type="range"
            min="500"
            max="3000"
            step="100"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="w-full accent-[#A45543]"
          />
          <div className="flex justify-between text-[11px] text-[#7E726D]">
            <span>₹500</span>
            <span>₹3000</span>
          </div>
        </div>
      </div>

      {/* Sizes */}
      <div className="pt-4 border-t border-[#E8DFD5]">
        <h4 className="font-serif text-sm font-bold uppercase tracking-wider mb-2.5">Size</h4>
        <div className="grid grid-cols-3 gap-1.5">
          {ALL_SIZES.map((sz) => {
            const isSelected = selectedSizes.includes(sz);
            return (
              <button
                key={sz}
                type="button"
                onClick={() => handleSizeToggle(sz)}
                className={`py-1.5 text-xs font-semibold rounded border transition-all ${
                  isSelected
                    ? 'bg-[#2E221F] text-white border-[#2E221F]'
                    : 'bg-white text-[#2E221F] border-[#D4C5B9] hover:border-[#2E221F]'
                }`}
              >
                {sz}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Swatches */}
      <div className="pt-4 border-t border-[#E8DFD5]">
        <h4 className="font-serif text-sm font-bold uppercase tracking-wider mb-2.5">Color</h4>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((col) => {
            const isSelected = selectedColors.includes(col.label);
            return (
              <button
                key={col.label}
                type="button"
                onClick={() => handleColorToggle(col.label)}
                className={`w-7 h-7 rounded-full border-2 transition-all p-0.5 relative group ${
                  isSelected ? 'border-[#A45543] scale-110' : 'border-transparent hover:scale-105'
                }`}
                title={col.label}
              >
                <span
                  className="block w-full h-full rounded-full border border-black/10 shadow-inner"
                  style={{ backgroundColor: col.hex }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability */}
      <div className="pt-4 border-t border-[#E8DFD5]">
        <h4 className="font-serif text-sm font-bold uppercase tracking-wider mb-2">Availability</h4>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => {
              setInStockOnly(e.target.checked);
              setCurrentPage(1);
            }}
            className="rounded accent-[#A45543]"
          />
          <span>In Stock Only ({PRODUCTS.filter((p) => p.inStock).length})</span>
        </label>
      </div>

      {/* Rating */}
      <div className="pt-4 border-t border-[#E8DFD5]">
        <h4 className="font-serif text-sm font-bold uppercase tracking-wider mb-2">Rating</h4>
        <div className="space-y-1.5">
          {[4, 3].map((stars) => (
            <label key={stars} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={minRating === stars}
                onChange={() => {
                  setMinRating(stars);
                  setCurrentPage(1);
                }}
                className="accent-[#A45543]"
              />
              <div className="flex items-center text-amber-600">
                {[...Array(stars)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
                <span className="text-xs text-[#2E221F] ml-1">&amp; above</span>
              </div>
            </label>
          ))}
          {minRating > 0 && (
            <button
              onClick={() => setMinRating(0)}
              className="text-[11px] underline text-[#A45543] hover:text-[#2E221F]"
            >
              Clear rating filter
            </button>
          )}
        </div>
      </div>

      {/* Reset Button */}
      {activeFilterCount > 0 && (
        <div className="pt-4 border-t border-[#E8DFD5]">
          <button
            onClick={resetFilters}
            className="w-full py-2 border border-[#A45543] text-[#A45543] hover:bg-[#A45543] hover:text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="pb-20">
      
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-xs text-[#7E726D]">
          <button onClick={() => navigateTo('home')} className="hover:text-[#A45543]">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#2E221F] font-medium">Shop</span>
          {selectedCategory !== 'All' && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#A45543] font-medium">{selectedCategory}</span>
            </>
          )}
        </div>
      </div>

      {/* Category Hero Header */}
      <section className="bg-[#F5EFE8] border-y border-[#E8DFD5] py-10 sm:py-14 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl">
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#2E221F] mb-3">
            {selectedCategory === 'All' ? 'Shop All Collection' : `${selectedCategory}`}
          </h1>
          <p className="text-xs sm:text-sm text-[#7E726D] leading-relaxed">
            Explore our latest collection of trendy, modest, and elegant styles crafted for modern living.
          </p>
        </div>
      </section>

      {/* Main Catalog Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0 bg-[#FAF8F5] p-5 rounded-lg border border-[#E8DFD5] h-fit sticky top-28">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8DFD5]">
              <span className="font-serif text-base font-bold text-[#2E221F]">Filters</span>
              {activeFilterCount > 0 && (
                <span className="text-xs font-semibold text-[#A45543]">({activeFilterCount} active)</span>
              )}
            </div>
            <FilterControls />
          </aside>

          {/* Right Product Grid Area */}
          <main className="flex-1 min-w-0">
            {/* Top Toolbar: Count, Mobile Filter Trigger, Sort Dropdown */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-[#E8DFD5]">
              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D4C5B9] text-xs font-semibold rounded hover:border-[#2E221F]"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#A45543]" />
                  <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
                </button>
                <span className="text-xs text-[#7E726D]">
                  Showing <strong className="text-[#2E221F]">{filteredProducts.length}</strong> styles
                </span>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#7E726D]">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border border-[#D4C5B9] text-[#2E221F] text-xs py-1.5 px-2.5 rounded focus:outline-none focus:border-[#A45543] font-medium"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Active Filter Pills */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-xs text-[#7E726D]">Active Filters:</span>
                {selectedCategory !== 'All' && (
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F5EFE8] text-xs text-[#2E221F] rounded border border-[#E8DFD5] hover:bg-white"
                  >
                    <span>{selectedCategory}</span>
                    <X className="w-3 h-3 text-[#A45543]" />
                  </button>
                )}
                {selectedSizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => handleSizeToggle(sz)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F5EFE8] text-xs text-[#2E221F] rounded border border-[#E8DFD5] hover:bg-white"
                  >
                    <span>Size: {sz}</span>
                    <X className="w-3 h-3 text-[#A45543]" />
                  </button>
                ))}
                {selectedColors.map((col) => (
                  <button
                    key={col}
                    onClick={() => handleColorToggle(col)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F5EFE8] text-xs text-[#2E221F] rounded border border-[#E8DFD5] hover:bg-white"
                  >
                    <span>Color: {col}</span>
                    <X className="w-3 h-3 text-[#A45543]" />
                  </button>
                ))}
                {(minPrice > 500 || maxPrice < 3000) && (
                  <button
                    onClick={() => {
                      setMinPrice(500);
                      setMaxPrice(3000);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F5EFE8] text-xs text-[#2E221F] rounded border border-[#E8DFD5] hover:bg-white"
                  >
                    <span>₹{minPrice} - ₹{maxPrice}</span>
                    <X className="w-3 h-3 text-[#A45543]" />
                  </button>
                )}
                <button
                  onClick={resetFilters}
                  className="text-xs text-[#A45543] underline hover:text-[#2E221F] ml-2"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Product Cards Grid */}
            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-lg border border-[#E8DFD5] p-8">
                <h3 className="font-serif text-lg font-bold text-[#2E221F] mb-2">No matching products found</h3>
                <p className="text-xs text-[#7E726D] max-w-sm mx-auto mb-6">
                  Try relaxing your price filters or selecting different colors and sizes to view styles.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-[#A45543] text-white text-xs font-semibold rounded uppercase tracking-wider hover:bg-[#8e4737]"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12 pt-8 border-t border-[#E8DFD5]">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-medium border border-[#D4C5B9] rounded disabled:opacity-40 hover:bg-[#F5EFE8]"
                >
                  Prev
                </button>
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 text-xs font-semibold rounded border transition-colors ${
                        currentPage === pageNum
                          ? 'bg-[#2E221F] text-white border-[#2E221F]'
                          : 'border-[#D4C5B9] hover:bg-[#F5EFE8]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-xs font-medium border border-[#D4C5B9] rounded disabled:opacity-40 hover:bg-[#F5EFE8]"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Slide-out Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-[#FAF8F5] p-6 overflow-y-auto flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E8DFD5]">
                  <h3 className="font-serif text-lg font-bold">Filters</h3>
                  <button onClick={() => setIsMobileFilterOpen(false)} className="p-1">
                    <X className="w-5 h-5 text-[#7E726D]" />
                  </button>
                </div>
                <FilterControls />
              </div>
              <div className="pt-6 border-t border-[#E8DFD5] mt-6">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-2.5 bg-[#A45543] text-white text-xs font-bold uppercase tracking-wider rounded"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
