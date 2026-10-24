import { supabase, isSupabaseConfigured } from './supabase';
import { CATEGORIES_DATA } from '../data/products';
import { optimizeImage } from './imageOptimizer';
import { uploadProductImage } from './adminData';

export interface HeroSlide {
  id: string;
  kicker: string;
  title: string;
  subtitle: string;
  cta: string;
  category: string;
  image: string;
}

export interface CategoryCard {
  name: string;
  description?: string;
  image: string;
}

export interface PromoBanner {
  tag: string;
  title: string;
  description: string;
  cta: string;
  category: string;
  image: string;
}

export interface HomepageContent {
  heroSlides: HeroSlide[];
  categories: CategoryCard[];
  promoBanner: PromoBanner;
}

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    kicker: 'Summer & Festive 2026',
    title: 'Trendy Modest Effortless',
    subtitle: "Premium women's wear curated for every you.",
    cta: 'SHOP NOW',
    category: 'Kurtis',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'slide-2',
    kicker: 'Noir & Zari Edit',
    title: 'Modern Fits Timeless Vibes',
    subtitle: 'Elevated co-ord sets and tailored tunics designed to empower.',
    cta: 'EXPLORE CO-ORDS',
    category: 'Co-ords',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'slide-3',
    kicker: 'Romantic Silhouettes',
    title: 'Graceful Tiered Maxis',
    subtitle: 'Breezy georgettes and mulmuls tailored for effortless twirls.',
    cta: 'DISCOVER DRESSES',
    category: 'Dresses',
    image: 'https://images.unsplash.com/photo-1596783049072-a764d9b73428?auto=format&fit=crop&w=1200&q=85',
  },
];

export const DEFAULT_CATEGORIES: CategoryCard[] = CATEGORIES_DATA.map((c) => ({
  name: c.name,
  description: c.description,
  image: c.image,
}));

export const DEFAULT_PROMO_BANNER: PromoBanner = {
  tag: 'New Arrivals',
  title: 'Modern Fits Timeless Vibes',
  description:
    'Fresh styles for your everyday moments. Hand-embroidered accents, breathable silhouettes, and understated Indian flair.',
  cta: 'EXPLORE NOW',
  category: 'Sets',
  image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1600&q=80',
};

const LOCAL_CONTENT_KEY = 'stylistiq_homepage_content_v1';

export function getLocalHomepageContent(): HomepageContent {
  try {
    const raw = localStorage.getItem(LOCAL_CONTENT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.heroSlides && parsed.categories && parsed.promoBanner) {
        return parsed;
      }
    }
  } catch {}
  return {
    heroSlides: DEFAULT_HERO_SLIDES,
    categories: DEFAULT_CATEGORIES,
    promoBanner: DEFAULT_PROMO_BANNER,
  };
}

export async function fetchHomepageContent(): Promise<HomepageContent> {
  // First try Supabase site_settings if available
  if (supabase && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'homepage_content')
        .single();

      if (!error && data?.value) {
        const val = data.value as HomepageContent;
        if (val.heroSlides && val.categories) {
          try {
            localStorage.setItem(LOCAL_CONTENT_KEY, JSON.stringify(val));
          } catch {}
          return val;
        }
      }

      // Check fallback in products table under site_config_homepage
      const { data: prodData } = await supabase
        .from('products')
        .select('description')
        .eq('id', 'site_config_homepage')
        .single();

      if (prodData?.description) {
        const val = JSON.parse(prodData.description) as HomepageContent;
        if (val.heroSlides && val.categories) {
          try {
            localStorage.setItem(LOCAL_CONTENT_KEY, JSON.stringify(val));
          } catch {}
          return val;
        }
      }
    } catch {
      // ignore and use fallback
    }
  }

  return getLocalHomepageContent();
}

export async function saveHomepageContent(
  content: HomepageContent
): Promise<{ success: boolean; error?: string }> {
  // 1. Immediately persist to localStorage for instant client reactivity
  try {
    localStorage.setItem(LOCAL_CONTENT_KEY, JSON.stringify(content));
    window.dispatchEvent(new CustomEvent('homepage-content-updated', { detail: content }));
  } catch {}

  // 2. Persist to Supabase
  if (supabase && isSupabaseConfigured) {
    let cloudSaved = false;
    let lastError: string | undefined = undefined;

    try {
      // Try site_settings first
      const { error: siteErr } = await supabase.from('site_settings').upsert({
        key: 'homepage_content',
        value: content,
        updated_at: new Date().toISOString(),
      });
      if (!siteErr) {
        cloudSaved = true;
      }
    } catch {}

    try {
      // Also save to products table
      const { error: prodErr } = await supabase.from('products').upsert({
        id: 'site_config_homepage',
        name: 'Site Configuration - Homepage',
        category: 'System',
        price: 0,
        status: 'published',
        description: JSON.stringify(content),
        updated_at: new Date().toISOString(),
      });

      if (!prodErr) {
        cloudSaved = true;
      } else {
        lastError = prodErr.message;
        console.warn('products table cloud save warning:', prodErr.message);
      }
    } catch (e: any) {
      lastError = e?.message;
      console.warn('Supabase cloud content sync notice:', e?.message);
    }

    if (!cloudSaved && lastError) {
      return { success: false, error: lastError };
    }
  }

  return { success: true };
}

/**
 * Optimizes an image to WebP and uploads it directly to Supabase Storage 'product-images/hero'
 */
export async function uploadHeroImage(file: File): Promise<{ url: string | null; error?: string }> {
  try {
    const optimized = await optimizeImage(file, {
      format: 'webp',
      quality: 0.85,
      maxWidth: 1600,
      maxHeight: 1600,
      thumbnail: false,
    });

    const filename = `hero-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}.webp`;
    const { url, error } = await uploadProductImage(optimized.blob, filename, 'hero');

    if (error || !url) {
      // Fallback: create an inline object URL or base64 data URL so it never breaks for the user
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ url: reader.result as string });
        };
        reader.readAsDataURL(optimized.blob);
      });
    }

    return { url };
  } catch (err: any) {
    return { url: null, error: err?.message || 'Failed to process image' };
  }
}
