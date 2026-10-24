import React, { useState } from 'react';
import { X, Star, ShoppingBag, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatINR } from '../utils/cartRules';
import { ImageWithFallback } from './ImageWithFallback';

export const QuickViewModal: React.FC = () => {
  const { quickViewProduct, setQuickViewProduct, addToCart, navigateTo, setIsSizeGuideOpen } = useShop();

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!quickViewProduct) return null;

  const activeSize = selectedSize || quickViewProduct.sizes[0] || 'M';
  const activeColor = selectedColor || quickViewProduct.colors[0]?.name || 'Standard';

  const handleAddToCart = () => {
    addToCart(quickViewProduct, activeSize, activeColor, 1);
    setQuickViewProduct(null);
  };

  const handleViewFullDetails = () => {
    const id = quickViewProduct.id;
    setQuickViewProduct(null);
    navigateTo('product-detail', id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1C1412]/60 backdrop-blur-xs transition-opacity"
        onClick={() => setQuickViewProduct(null)}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-3xl bg-[#FAF8F5] rounded-lg shadow-2xl overflow-hidden z-10 border border-[#E8DFD5] max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-3 right-3 z-20 p-2 text-[#7E726D] hover:text-[#2E221F] bg-white/80 hover:bg-white rounded-full transition-colors shadow-sm"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Column */}
        <div className="md:w-1/2 bg-[#F5EFE8] flex flex-col">
          <div className="relative aspect-[3/4] w-full overflow-hidden">
            <ImageWithFallback
              src={quickViewProduct.images[selectedImageIndex] || quickViewProduct.images[0]}
              alt={quickViewProduct.name}
              className="w-full h-full object-cover"
              fallbackText={quickViewProduct.name}
            />
          </div>
          {quickViewProduct.images.length > 1 && (
            <div className="flex gap-2 p-3 bg-white/50 overflow-x-auto justify-center">
              {quickViewProduct.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImageIndex(i)}
                  className={`w-12 h-14 rounded overflow-hidden border-2 transition-all ${
                    selectedImageIndex === i ? 'border-[#A45543]' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <ImageWithFallback src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Column */}
        <div className="md:w-1/2 p-6 overflow-y-auto flex flex-col justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#A45543] font-semibold">
              {quickViewProduct.category}
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2E221F] mt-1 mb-2">
              {quickViewProduct.name}
            </h3>

            {/* Ratings */}
            <div className="flex items-center gap-2 mb-3 text-xs text-[#7E726D]">
              <div className="flex text-amber-600">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(quickViewProduct.rating) ? 'fill-current' : 'opacity-40'
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold text-[#2E221F]">{quickViewProduct.rating}</span>
              <span>({quickViewProduct.reviewCount} reviews)</span>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-2.5 mb-4">
              <span className="text-xl font-bold text-[#2E221F] tabular-nums">
                {formatINR(quickViewProduct.price)}
              </span>
              {quickViewProduct.originalPrice > quickViewProduct.price && (
                <>
                  <span className="text-sm text-[#7E726D] line-through tabular-nums">
                    {formatINR(quickViewProduct.originalPrice)}
                  </span>
                  <span className="text-xs font-semibold text-[#A45543]">
                    {Math.round(
                      ((quickViewProduct.originalPrice - quickViewProduct.price) /
                        quickViewProduct.originalPrice) *
                        100
                    )}
                    % OFF
                  </span>
                </>
              )}
            </div>

            <p className="text-xs text-[#7E726D] leading-relaxed mb-4 line-clamp-3">
              {quickViewProduct.description}
            </p>

            {/* Color Selector */}
            {quickViewProduct.colors.length > 0 && (
              <div className="mb-4">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-medium text-[#2E221F]">
                    Color: <strong className="text-[#A45543]">{activeColor}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {quickViewProduct.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c.name)}
                      className={`w-7 h-7 rounded-full border-2 transition-all p-0.5 ${
                        activeColor === c.name ? 'border-[#2E221F] scale-110' : 'border-transparent'
                      }`}
                      title={c.name}
                    >
                      <span
                        className="block w-full h-full rounded-full shadow-inner"
                        style={{ backgroundColor: c.hex }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {quickViewProduct.sizes.length > 0 && (
              <div className="mb-5">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-medium text-[#2E221F]">Select Size:</span>
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-xs underline text-[#A45543] hover:text-[#2E221F]"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickViewProduct.sizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`min-w-9 h-8 px-2 text-xs font-semibold rounded border transition-all ${
                        activeSize === sz
                          ? 'bg-[#2E221F] text-white border-[#2E221F]'
                          : 'bg-white text-[#2E221F] border-[#D4C5B9] hover:border-[#2E221F]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-[#E8DFD5]">
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full py-2.5 bg-[#A45543] hover:bg-[#8e4737] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Shopping Bag</span>
            </button>
            <button
              type="button"
              onClick={handleViewFullDetails}
              className="w-full py-2 bg-transparent text-xs text-[#2E221F] font-semibold hover:text-[#A45543] flex items-center justify-center gap-1.5"
            >
              <span>View Full Details &amp; Reviews</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
