import React from 'react';
import { Star, Heart, Eye } from 'lucide-react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { formatINR } from '../utils/cartRules';
import { ImageWithFallback } from './ImageWithFallback';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { navigateTo, isInWishlist, toggleWishlist, setQuickViewProduct } = useShop();
  const isWishlisted = isInWishlist(product.id);

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <div className="group relative flex flex-col bg-transparent text-left transition-all duration-300">
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-[#F5EFE8] mb-3">
        <button
          onClick={() => navigateTo('product-detail', product.id)}
          className="w-full h-full text-left block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A45543]"
          aria-label={`View details for ${product.name}`}
        >
          <ImageWithFallback
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            fallbackText={product.name}
          />
        </button>

        {/* Badge (NEW / BESTSELLER) */}
        {product.badge && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-[#2E221F]/90 text-[#FAF8F5] rounded-xs shadow-sm">
            {product.badge}
          </span>
        )}

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
            isWishlisted
              ? 'bg-[#A45543] text-white'
              : 'bg-white/80 backdrop-blur-xs text-[#2E221F] hover:bg-white hover:text-[#A45543]'
          }`}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View Button on Hover */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setQuickViewProduct(product);
          }}
          className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-[90%] py-2 bg-white/95 backdrop-blur-xs text-[#2E221F] text-xs font-semibold rounded shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-[#2E221F] hover:text-white flex items-center justify-center gap-1.5"
          aria-label={`Quick view ${product.name}`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Quick View</span>
        </button>
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-1">
        {/* Category tag */}
        <span className="text-[11px] font-medium uppercase tracking-wider text-[#7E726D] mb-1">
          {product.category}
        </span>

        {/* Product Name */}
        <button
          onClick={() => navigateTo('product-detail', product.id)}
          className="text-left font-serif text-base font-semibold text-[#2E221F] hover:text-[#A45543] transition-colors line-clamp-1 mb-1 focus:outline-none"
        >
          {product.name}
        </button>

        {/* Price & Discount */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm sm:text-base font-semibold text-[#2E221F] tabular-nums">
            {formatINR(product.price)}
          </span>
          {product.originalPrice > product.price && (
            <>
              <span className="text-xs text-[#7E726D] line-through tabular-nums">
                {formatINR(product.originalPrice)}
              </span>
              <span className="text-[11px] font-medium text-[#A45543]">
                {discountPercent}% OFF
              </span>
            </>
          )}
        </div>

        {/* Rating and Reviews */}
        <div className="flex items-center gap-1.5 text-xs text-[#7E726D] mt-auto">
          <div className="flex items-center text-amber-600">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="ml-1 font-semibold text-[#2E221F]">{product.rating}</span>
          </div>
          <span>({product.reviewCount})</span>
        </div>
      </div>
    </div>
  );
};
