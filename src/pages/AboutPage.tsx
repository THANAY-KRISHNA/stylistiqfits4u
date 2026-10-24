import React from 'react';
import { Sparkles, Heart, Award, ArrowRight, Instagram } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ImageWithFallback } from '../components/ImageWithFallback';

export const AboutPage: React.FC = () => {
  const { navigateTo } = useShop();

  return (
    <div className="pb-24 space-y-16">
      {/* Hero Banner */}
      <section className="bg-[#F5EFE8] py-16 sm:py-20 border-b border-[#E8DFD5]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-[#A45543] font-bold block mb-2">
            The STYL IS TIQ Story
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#2E221F] mb-4">
            Wear Your Story
          </h1>
          <p className="text-xs sm:text-base text-[#7E726D] max-w-2xl mx-auto leading-relaxed">
            Crafting elegant, modest, and effortless women's wear that bridges traditional Indian artistry with contemporary comfort.
          </p>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#F5EFE8] shadow-sm">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80"
              alt="Artisan craftsmanship"
              className="w-full h-full object-cover"
              fallbackText="Boutique Craftsmanship"
            />
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#7E726D] leading-relaxed">
            <span className="text-xs uppercase tracking-wider text-[#A45543] font-semibold">
              Our Heritage &amp; Vision
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2E221F]">
              Handcrafted With Grace, Tailored For Real Life
            </h2>
            <p>
              Founded with the conviction that ethnic wear should be as effortless and comfortable as everyday loungewear, STYL IS TIQ curates pieces that honor timeless Indian textile traditions while flattering modern silhouettes.
            </p>
            <p>
              From botanical block-print kurtis to sleek monochrome co-ords and tiered festive maxis, every garment is thoughtfully designed with breathable fabrics, functional deep pockets, and skin-friendly linings.
            </p>

            <div className="pt-4 flex items-center gap-4">
              <button
                onClick={() => navigateTo('shop')}
                className="px-6 py-3 bg-[#A45543] hover:bg-[#8e4737] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors inline-flex items-center gap-2"
              >
                <span>Explore The Collection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-lg border border-[#E8DFD5] space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#FAF8F5] text-[#A45543] flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2E221F]">Conscious Craftsmanship</h3>
            <p className="text-xs text-[#7E726D] leading-relaxed">
              We produce in mindful, limited batches to minimize waste and ensure each garment receives meticulous tailoring.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg border border-[#E8DFD5] space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#FAF8F5] text-[#A45543] flex items-center justify-center mb-3">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2E221F]">Inclusive Sizing</h3>
            <p className="text-xs text-[#7E726D] leading-relaxed">
              From XS to XXL, our pattern easing is customized to real body proportions so you feel confident and supported.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg border border-[#E8DFD5] space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#FAF8F5] text-[#A45543] flex items-center justify-center mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2E221F]">Honest Pricing</h3>
            <p className="text-xs text-[#7E726D] leading-relaxed">
              Direct-to-consumer boutique quality without traditional retail markups. Premium luxury within reach.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
