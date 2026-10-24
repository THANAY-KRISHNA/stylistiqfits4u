import React, { useState } from 'react';
import {
  Star,
  Heart,
  Share2,
  ShoppingBag,
  Plus,
  Minus,
  ChevronRight,
  ShieldCheck,
  Truck,
  RefreshCw,
  CreditCard,
  ChevronDown,
  CheckCircle2,
  Check
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { PRODUCTS } from '../data/products';
import { formatINR } from '../utils/cartRules';
import { ProductCard } from '../components/ProductCard';
import { ImageWithFallback } from '../components/ImageWithFallback';

export const ProductDetailPage: React.FC = () => {
  const {
    selectedProduct,
    addToCart,
    isInWishlist,
    toggleWishlist,
    setIsSizeGuideOpen,
    navigateTo,
    showToast,
    products
  } = useShop();

  const catalogProducts = (products && products.length > 0) ? products : PRODUCTS;
  const product = selectedProduct || catalogProducts[0];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || 'Standard');
  const [quantity, setQuantity] = useState(1);
  const [copiedShare, setCopiedShare] = useState(false);

  // Accordion open states
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [sizeFitOpen, setSizeFitOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);

  // Review submission simulation
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [submittedReview, setSubmittedReview] = useState(false);

  const isWishlisted = isInWishlist(product.id);

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    navigateTo('checkout');
  };

  const handleShare = () => {
    setCopiedShare(true);
    navigator.clipboard?.writeText(window.location.href);
    showToast('Product link copied to clipboard!');
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) return;
    setSubmittedReview(true);
    showToast('Thank you! Your verified review has been submitted.');
    setNewReviewAuthor('');
    setNewReviewComment('');
  };

  const relatedProducts = catalogProducts.filter(
    (p) => p.id !== product.id && (p.category === product.category || p.featured)
  ).slice(0, 4);

  return (
    <div className="pb-24">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-xs text-[#7E726D]">
          <button onClick={() => navigateTo('home')} className="hover:text-[#A45543]">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button
            onClick={() => {
              navigateTo('shop');
            }}
            className="hover:text-[#A45543]"
          >
            {product.category}
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#2E221F] font-medium truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      {/* Main PDP Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left: Gallery Column (Thumbs + Main Showcase) */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto shrink-0 max-h-[580px] no-scrollbar">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-20 sm:w-20 sm:h-24 rounded overflow-hidden border-2 transition-all shrink-0 bg-[#F5EFE8] ${
                    selectedImageIndex === idx
                      ? 'border-[#A45543] scale-102'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                  aria-label={`View photo ${idx + 1}`}
                >
                  <ImageWithFallback
                    src={img}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main Image Showcase */}
            <div className="relative flex-1 aspect-[3/4] rounded-lg overflow-hidden bg-[#F5EFE8] shadow-xs group">
              <ImageWithFallback
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-top transition-all duration-300"
                fallbackText={product.name}
              />

              {/* Wishlist Heart Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
                  isWishlisted
                    ? 'bg-[#A45543] text-white'
                    : 'bg-white/80 hover:bg-white text-[#2E221F] hover:text-[#A45543]'
                }`}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>

              {product.badge && (
                <span className="absolute top-4 left-4 px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-[#2E221F]/90 text-white rounded-xs">
                  {product.badge}
                </span>
              )}
            </div>
          </div>

          {/* Right: Purchase & Info Module */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#A45543] font-semibold">
                STYL IS TIQ · {product.category}
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2E221F] mt-1 mb-2">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 text-xs text-[#7E726D]">
                <div className="flex text-amber-600">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating) ? 'fill-current' : 'opacity-35'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold text-[#2E221F]">{product.rating}</span>
                <span>({product.reviewCount} reviews)</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="flex items-baseline gap-3 pb-4 border-b border-[#E8DFD5]">
              <span className="text-2xl sm:text-3xl font-bold text-[#2E221F] tabular-nums">
                {formatINR(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-base text-[#7E726D] line-through tabular-nums">
                    {formatINR(product.originalPrice)}
                  </span>
                  <span className="text-xs font-bold text-[#A45543] px-2 py-0.5 bg-[#FAF8F5] border border-[#A45543]/30 rounded">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
              <span className="text-[11px] text-[#7E726D] block sm:inline ml-auto">
                Inclusive of all taxes
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#7E726D] leading-relaxed">
              {product.description}
            </p>

            {/* Color Swatches */}
            {product.colors.length > 0 && (
              <div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-semibold text-[#2E221F]">
                    Color: <strong className="text-[#A45543] font-bold">{selectedColor}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c.name)}
                      className={`w-8 h-8 rounded-full border-2 transition-all p-0.5 ${
                        selectedColor === c.name
                          ? 'border-[#2E221F] scale-110 shadow-sm'
                          : 'border-transparent hover:scale-105'
                      }`}
                      title={c.name}
                    >
                      <span
                        className="block w-full h-full rounded-full shadow-inner border border-black/10"
                        style={{ backgroundColor: c.hex }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {product.sizes.length > 0 && (
              <div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-semibold text-[#2E221F]">
                    Size: <strong className="text-[#A45543] font-bold">{selectedSize}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-xs underline text-[#A45543] hover:text-[#2E221F] font-medium"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`min-w-11 h-9 px-3 text-xs font-semibold rounded border transition-all ${
                        selectedSize === sz
                          ? 'bg-[#2E221F] text-white border-[#2E221F] shadow-xs'
                          : 'bg-white text-[#2E221F] border-[#D4C5B9] hover:border-[#2E221F]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper & Add to Cart Row */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-[#D4C5B9] rounded bg-white h-12">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 h-full text-[#2E221F] hover:bg-[#F5EFE8] transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 text-sm font-semibold tabular-nums min-w-[2.5rem] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 h-full text-[#2E221F] hover:bg-[#F5EFE8] transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Primary Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 h-12 bg-[#A45543] hover:bg-[#8e4737] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
              </div>

              {/* Buy Now Button */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full h-11 bg-[#2E221F] hover:bg-[#1a1312] text-[#FAF8F5] text-xs sm:text-sm font-bold uppercase tracking-wider rounded transition-colors"
              >
                Buy Now
              </button>

              {/* Secondary actions: Wishlist & Share */}
              <div className="flex items-center justify-center gap-6 pt-2 text-xs text-[#7E726D]">
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className="flex items-center gap-1.5 hover:text-[#A45543] transition-colors"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'text-[#A45543] fill-current' : ''}`} />
                  <span>{isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center gap-1.5 hover:text-[#A45543] transition-colors"
                >
                  {copiedShare ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                  <span>{copiedShare ? 'Copied Link!' : 'Share'}</span>
                </button>
              </div>
            </div>

            {/* Trust Badges 4-Grid Strip */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-[#F5EFE8] rounded-lg border border-[#E8DFD5] text-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#A45543] shrink-0" />
                <div>
                  <p className="font-semibold text-[#2E221F]">Free Shipping</p>
                  <p className="text-[10px] text-[#7E726D]">On orders above ₹999</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#A45543] shrink-0" />
                <div>
                  <p className="font-semibold text-[#2E221F]">COD Available</p>
                  <p className="text-[10px] text-[#7E726D]">Pay on delivery option</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#A45543] shrink-0" />
                <div>
                  <p className="font-semibold text-[#2E221F]">Easy Returns</p>
                  <p className="text-[10px] text-[#7E726D]">7 Days Hassle Free</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#A45543] shrink-0" />
                <div>
                  <p className="font-semibold text-[#2E221F]">Secure Payments</p>
                  <p className="text-[10px] text-[#7E726D]">100% Safe &amp; Verified</p>
                </div>
              </div>
            </div>

            {/* Accordions Section */}
            <div className="border-t border-[#E8DFD5] divide-y divide-[#E8DFD5] text-xs">
              {/* 1. Product Details */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => setDetailsOpen(!detailsOpen)}
                  className="w-full flex items-center justify-between text-left font-serif text-sm font-bold text-[#2E221F]"
                >
                  <span>Product Details</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${detailsOpen ? 'rotate-180' : ''}`} />
                </button>
                {detailsOpen && (
                  <div className="pt-3 space-y-1.5 text-[#2E221F] animate-in fade-in duration-150">
                    <p>• <strong>Fabric:</strong> {product.fabric}</p>
                    {product.kurtiLength && <p>• <strong>Length:</strong> {product.kurtiLength}</p>}
                    {product.dupatta && <p>• <strong>Dupatta:</strong> {product.dupatta}</p>}
                    {product.setIncludes && <p>• <strong>Set Includes:</strong> {product.setIncludes}</p>}
                    <p>• <strong>Occasion:</strong> {product.occasion}</p>
                    <p>• <strong>Care Instructions:</strong> {product.care}</p>
                  </div>
                )}
              </div>

              {/* 2. Size & Fit */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => setSizeFitOpen(!sizeFitOpen)}
                  className="w-full flex items-center justify-between text-left font-serif text-sm font-bold text-[#2E221F]"
                >
                  <span>Size &amp; Fit</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${sizeFitOpen ? 'rotate-180' : ''}`} />
                </button>
                {sizeFitOpen && (
                  <div className="pt-3 space-y-2 text-[#7E726D] animate-in fade-in duration-150">
                    <p>• Model is 5'7" wearing size S for standard regular fit.</p>
                    <p>• Relaxed tailoring with comfortable ease around the bust and waist.</p>
                    <p>• Refer to our detailed size chart for precise measurements.</p>
                  </div>
                )}
              </div>

              {/* 3. Shipping & Returns */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => setShippingOpen(!shippingOpen)}
                  className="w-full flex items-center justify-between text-left font-serif text-sm font-bold text-[#2E221F]"
                >
                  <span>Shipping &amp; Returns</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${shippingOpen ? 'rotate-180' : ''}`} />
                </button>
                {shippingOpen && (
                  <div className="pt-3 space-y-2 text-[#7E726D] animate-in fade-in duration-150">
                    <p>• Dispatched within 24-48 hours via premium express couriers.</p>
                    <p>• Standard delivery across India in 3-5 business days.</p>
                    <p>• Easy 7-day exchange or store credit for unworn garments with tags attached.</p>
                  </div>
                )}
              </div>

              {/* 4. Customer Reviews */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => setReviewsOpen(!reviewsOpen)}
                  className="w-full flex items-center justify-between text-left font-serif text-sm font-bold text-[#2E221F]"
                >
                  <span>Customer Reviews ({product.reviews?.length || 2})</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${reviewsOpen ? 'rotate-180' : ''}`} />
                </button>
                {reviewsOpen && (
                  <div className="pt-3 space-y-4 animate-in fade-in duration-150">
                    {/* Existing reviews */}
                    {product.reviews && product.reviews.length > 0 ? (
                      product.reviews.map((rev) => (
                        <div key={rev.id} className="p-3 rounded bg-white border border-[#E8DFD5] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#2E221F]">{rev.author}</span>
                            <span className="text-[10px] text-[#7E726D]">{rev.date}</span>
                          </div>
                          <div className="flex items-center gap-1 text-amber-600">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current" />
                            ))}
                            {rev.verified && (
                              <span className="text-[10px] text-emerald-700 ml-2 font-medium">
                                ✓ Verified Buyer
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#7E726D] mt-1">{rev.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#7E726D]">Be the first to review this product!</p>
                    )}

                    {/* Write a review form */}
                    <div className="pt-2 border-t border-[#E8DFD5]">
                      <h5 className="font-semibold text-xs text-[#2E221F] mb-2">Write a Review</h5>
                      {submittedReview ? (
                        <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Review submitted for verification. Thank you!</span>
                        </div>
                      ) : (
                        <form onSubmit={handleAddReview} className="space-y-2">
                          <input
                            type="text"
                            required
                            placeholder="Your Name"
                            value={newReviewAuthor}
                            onChange={(e) => setNewReviewAuthor(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D4C5B9] rounded focus:outline-none"
                          />
                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-[#7E726D]">Rating:</span>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setNewReviewRating(star)}
                                className="text-amber-500"
                              >
                                <Star
                                  className={`w-4 h-4 ${
                                    star <= newReviewRating ? 'fill-current' : 'opacity-30'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          <textarea
                            required
                            rows={2}
                            placeholder="Share your fit, fabric, and styling experience..."
                            value={newReviewComment}
                            onChange={(e) => setNewReviewComment(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D4C5B9] rounded focus:outline-none"
                          />
                          <button
                            type="submit"
                            className="px-4 py-1.5 bg-[#2E221F] text-white text-xs font-semibold rounded hover:bg-[#A45543]"
                          >
                            Submit Review
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* You May Also Like Section */}
        <section className="mt-20 pt-12 border-t border-[#E8DFD5]">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2E221F]">
              You May Also Like
            </h2>
            <p className="text-xs sm:text-sm text-[#7E726D] mt-1">
              Coordinating styles and signature boutique pieces to complete your wardrobe.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
