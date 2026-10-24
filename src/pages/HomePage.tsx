import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Instagram, Heart } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { PRODUCTS, INSTAGRAM_POSTS } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { ProductCategory } from '../types';
import { ImageWithFallback } from '../components/ImageWithFallback';
import {
  fetchHomepageContent,
  getLocalHomepageContent,
  DEFAULT_HERO_SLIDES,
  DEFAULT_CATEGORIES,
  DEFAULT_PROMO_BANNER,
  type HomepageContent,
} from '../lib/contentData';

export const HomePage: React.FC = () => {
  const { navigateTo, setSelectedCategory, products } = useShop();
  const [content, setContent] = useState<HomepageContent>(getLocalHomepageContent());
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchHomepageContent().then((data) => {
      if (data) setContent(data);
    });

    const handleUpdate = (e: any) => {
      if (e.detail) {
        setContent(e.detail);
      } else {
        fetchHomepageContent().then(setContent);
      }
    };

    const handleFocus = () => {
      fetchHomepageContent().then(setContent);
    };

    window.addEventListener('homepage-content-updated', handleUpdate);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('homepage-content-updated', handleUpdate);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const heroSlides = content.heroSlides && content.heroSlides.length > 0 ? content.heroSlides : DEFAULT_HERO_SLIDES;
  const categories = content.categories && content.categories.length > 0 ? content.categories : DEFAULT_CATEGORIES;
  const promo = content.promoBanner || DEFAULT_PROMO_BANNER;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const catalogProducts = (products && products.length > 0) ? products : PRODUCTS;
  const safeSlideIndex = currentSlide < heroSlides.length ? currentSlide : 0;
  const activeHero = heroSlides[safeSlideIndex];
  const featuredProducts = catalogProducts.filter((p) => p.featured).slice(0, 4);

  const handleCategoryClick = (cat: ProductCategory) => {
    setSelectedCategory(cat);
    navigateTo('shop');
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* 1. Fashion Hero Carousel / Showcase */}
      <section className="relative bg-[#F5EFE8] border-b border-[#E8DFD5] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px] lg:min-h-[580px] items-stretch">
            
            {/* Left Content Side */}
            <div className="lg:col-span-6 flex flex-col justify-center py-12 lg:py-16 pr-0 lg:pr-8 z-10">
              <span className="text-xs uppercase tracking-[0.25em] text-[#A45543] font-semibold mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {activeHero.kicker}
              </span>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#2E221F] leading-[1.15] mb-5 text-balance">
                {activeHero.title}
              </h1>

              <p className="text-sm sm:text-base text-[#7E726D] max-w-md leading-relaxed mb-8">
                {activeHero.subtitle}
              </p>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setSelectedCategory(activeHero.category as ProductCategory);
                    navigateTo('shop');
                  }}
                  className="px-8 py-3.5 bg-[#A45543] text-white text-xs font-bold uppercase tracking-widest rounded hover:bg-[#8e4737] transition-all flex items-center gap-2 shadow-md hover:gap-3"
                >
                  <span>{activeHero.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Slider Dots */}
              <div className="flex items-center gap-2 mt-10">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all ${
                      safeSlideIndex === idx ? 'w-8 bg-[#A45543]' : 'w-2 bg-[#D4C5B9]'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Right Photography Side */}
            <div className="lg:col-span-6 relative min-h-[380px] lg:min-h-full">
              <div className="w-full h-full rounded-b-xl lg:rounded-bl-3xl lg:rounded-b-none overflow-hidden bg-[#FAF8F5]">
                <ImageWithFallback
                  src={activeHero.image}
                  alt={activeHero.title}
                  className="w-full h-full object-cover object-top transition-opacity duration-700"
                  fallbackText="STYL IS TIQ Hero Collection"
                />
              </div>

              {/* Carousel Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-[#2E221F] flex items-center justify-center shadow-md backdrop-blur-xs transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-[#2E221F] flex items-center justify-center shadow-md backdrop-blur-xs transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Circular Category Shortcuts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-4 pt-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => handleCategoryClick(cat.name as ProductCategory)}
              className="group flex flex-col items-center shrink-0 cursor-pointer focus:outline-none min-w-[76px] sm:min-w-[96px]"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden p-0.5 border border-[#D4C5B9] group-hover:border-[#A45543] group-hover:shadow-md transition-all mb-2 bg-[#F5EFE8]">
                <ImageWithFallback
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                  fallbackText={cat.name}
                />
              </div>
              <span className="text-xs sm:text-sm font-medium text-[#2E221F] group-hover:text-[#A45543] transition-colors whitespace-nowrap">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Featured Collection Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2E221F] mb-2">
            Featured Collection
          </h2>
          <p className="text-xs sm:text-sm text-[#7E726D]">
            Handpicked styles you'll love, curated for comfort and timeless grace.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => {
              setSelectedCategory('All');
              navigateTo('shop');
            }}
            className="inline-flex items-center gap-2 px-8 py-3 border border-[#2E221F] hover:bg-[#2E221F] hover:text-[#FAF8F5] text-xs font-bold uppercase tracking-widest text-[#2E221F] rounded transition-colors"
          >
            <span>VIEW ALL PRODUCTS</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 4. Promotional Split Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-xl overflow-hidden bg-[#2E221F] text-[#FAF8F5] shadow-xl min-h-[380px] flex items-center">
          {/* Subtle background photo overlay */}
          <div className="absolute inset-0 opacity-40">
            <ImageWithFallback
              src={promo.image}
              alt={promo.title}
              className="w-full h-full object-cover"
              fallbackText={promo.title}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#1C1412] via-[#2E221F]/90 to-transparent" />

          {/* Banner Content */}
          <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-xl">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C68B7B] font-semibold block mb-2">
              {promo.tag}
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-normal leading-tight mb-3">
              {promo.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#D4C5B9] leading-relaxed mb-6">
              {promo.description}
            </p>
            <button
              onClick={() => {
                setSelectedCategory(promo.category as ProductCategory);
                navigateTo('shop');
              }}
              className="px-6 py-3 bg-[#FAF8F5] text-[#2E221F] hover:bg-[#A45543] hover:text-white text-xs font-bold uppercase tracking-widest rounded transition-colors inline-flex items-center gap-2"
            >
              <span>{promo.cta}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. Instagram Gallery & Community */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="flex items-center justify-center gap-2 text-[#A45543] text-xs font-semibold uppercase tracking-wider mb-1">
            <Instagram className="w-4 h-4" />
            <span>@styl_is_tiq</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2E221F]">
            Wear Your Story
          </h2>
          <p className="text-xs sm:text-sm text-[#7E726D] mt-1">
            Tag us in your fits to be featured in our boutique community journal.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {INSTAGRAM_POSTS.map((post) => (
            <a
              key={post.id}
              href="https://www.instagram.com/styl_is_tiq/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-lg overflow-hidden bg-[#F5EFE8] shadow-xs"
            >
              <ImageWithFallback
                src={post.image}
                alt="Instagram post"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                fallbackText="Instagram Community"
              />
              <div className="absolute inset-0 bg-[#2E221F]/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-white">
                <p className="text-xs line-clamp-2 leading-relaxed mb-2 font-medium">
                  {post.caption}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-[#C68B7B]">
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>{post.likes}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};
