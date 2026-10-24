import React from 'react';
import { X, Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { PRODUCTS } from '../data/products';
import { formatINR } from '../utils/cartRules';
import { ImageWithFallback } from './ImageWithFallback';

export const WishlistDrawer: React.FC = () => {
  const {
    isWishlistOpen,
    setIsWishlistOpen,
    wishlist,
    toggleWishlist,
    addToCart,
    navigateTo,
    products
  } = useShop();

  if (!isWishlistOpen) return null;

  const catalogProducts = (products && products.length > 0) ? products : PRODUCTS;
  const wishlistedProducts = catalogProducts.filter((p) => wishlist.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-[#1C1412]/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsWishlistOpen(false)}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] text-[#2E221F] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DFD5]">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-[#A45543] fill-current" />
              <h2 className="font-serif text-lg font-bold">Your Saved Wishlist</h2>
              <span className="text-xs text-[#7E726D]">({wishlist.length})</span>
            </div>
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-1.5 text-[#7E726D] hover:text-[#2E221F] rounded-full hover:bg-[#F5EFE8] transition-colors"
              aria-label="Close wishlist"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#E8DFD5]">
            {wishlistedProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#F5EFE8] flex items-center justify-center text-[#A45543] mb-4">
                  <Heart className="w-8 h-8 opacity-70" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#2E221F] mb-1">Your wishlist is empty</h3>
                <p className="text-xs text-[#7E726D] max-w-xs mb-6">
                  Save pieces you love while browsing our boutique to review or purchase anytime.
                </p>
                <button
                  onClick={() => {
                    setIsWishlistOpen(false);
                    navigateTo('shop');
                  }}
                  className="px-6 py-2.5 bg-[#2E221F] text-[#FAF8F5] text-xs font-semibold tracking-wider uppercase hover:bg-[#A45543] transition-colors rounded-sm shadow-sm"
                >
                  Browse Storefront
                </button>
              </div>
            ) : (
              wishlistedProducts.map((product) => (
                <div key={product.id} className="py-4 flex gap-4">
                  <div className="w-20 h-24 rounded bg-[#F5EFE8] overflow-hidden shrink-0">
                    <ImageWithFallback
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      fallbackText={product.name}
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <button
                          onClick={() => {
                            setIsWishlistOpen(false);
                            navigateTo('product-detail', product.id);
                          }}
                          className="font-serif text-sm font-semibold text-[#2E221F] hover:text-[#A45543] text-left line-clamp-1"
                        >
                          {product.name}
                        </button>
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className="text-[#7E726D] hover:text-[#A45543] text-xs underline shrink-0"
                          aria-label={`Remove ${product.name} from wishlist`}
                        >
                          Remove
                        </button>
                      </div>

                      <span className="text-xs text-[#7E726D]">{product.category}</span>
                      <p className="text-xs font-bold text-[#2E221F] mt-1 tabular-nums">
                        {formatINR(product.price)}
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => {
                          addToCart(
                            product,
                            product.sizes[0] || 'M',
                            product.colors[0]?.name || 'Standard',
                            1
                          );
                          setIsWishlistOpen(false);
                        }}
                        className="w-full py-1.5 px-3 bg-[#2E221F] hover:bg-[#A45543] text-white text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Move to Bag</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Action */}
          {wishlistedProducts.length > 0 && (
            <div className="p-4 border-t border-[#E8DFD5] bg-[#FAF8F5]">
              <button
                onClick={() => {
                  setIsWishlistOpen(false);
                  navigateTo('shop');
                }}
                className="w-full py-2.5 border border-[#2E221F] text-[#2E221F] text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#F5EFE8] flex items-center justify-center gap-2"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
