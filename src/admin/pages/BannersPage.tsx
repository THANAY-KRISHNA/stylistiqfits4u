import React, { useState, useEffect, useRef } from 'react';
import {
  Sliders,
  Upload,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Sparkles,
  ImageIcon,
  RefreshCw,
  Eye,
} from 'lucide-react';
import {
  fetchHomepageContent,
  saveHomepageContent,
  uploadHeroImage,
  DEFAULT_HERO_SLIDES,
  DEFAULT_CATEGORIES,
  DEFAULT_PROMO_BANNER,
  type HomepageContent,
  type HeroSlide,
  type CategoryCard,
} from '../../lib/contentData';
import { ProductCategory } from '../../types';

const CATEGORY_OPTIONS: ProductCategory[] = [
  'Kurtis',
  'Sets',
  'Dresses',
  'Tops',
  'Bottoms',
  'Co-ords',
  'Accessories',
];

export const BannersPage: React.FC = () => {
  const [content, setContent] = useState<HomepageContent>({
    heroSlides: DEFAULT_HERO_SLIDES,
    categories: DEFAULT_CATEGORIES,
    promoBanner: DEFAULT_PROMO_BANNER,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingSlideId, setUploadingSlideId] = useState<string | null>(null);
  const [uploadingCatIndex, setUploadingCatIndex] = useState<number | null>(null);
  const [uploadingPromo, setUploadingPromo] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'hero' | 'categories' | 'promo'>('hero');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingUploadTarget, setPendingUploadTarget] = useState<{
    type: 'hero' | 'category' | 'promo';
    id?: string;
    index?: number;
  } | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchHomepageContent().then((data) => {
      setContent(data);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { success, error } = await saveHomepageContent(content);
    setSaving(false);
    if (success) {
      showToast('Homepage banners & content saved! Storefront updated.');
    } else {
      showToast(`Error saving: ${error}`);
    }
  };

  // ─── Hero Slides Actions ───────────────────────────────────────────────────

  const handleSlideChange = (id: string, field: keyof HeroSlide, value: string) => {
    setContent((prev) => ({
      ...prev,
      heroSlides: prev.heroSlides.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    }));
  };

  const handleAddSlide = () => {
    const newSlide: HeroSlide = {
      id: `slide-${Date.now().toString(36)}`,
      kicker: 'Special Feature 2026',
      title: 'New Festive Arrivals',
      subtitle: 'Exclusive handcrafted styles tailored for elegance and grace.',
      cta: 'EXPLORE NOW',
      category: 'Kurtis',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85',
    };
    setContent((prev) => ({
      ...prev,
      heroSlides: [...prev.heroSlides, newSlide],
    }));
    showToast('New slide added. Remember to click Save!');
  };

  const handleDeleteSlide = (id: string) => {
    if (content.heroSlides.length <= 1) {
      alert('You must keep at least one hero slide.');
      return;
    }
    setContent((prev) => ({
      ...prev,
      heroSlides: prev.heroSlides.filter((s) => s.id !== id),
    }));
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= content.heroSlides.length) return;
    const reordered = [...content.heroSlides];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;
    setContent((prev) => ({ ...prev, heroSlides: reordered }));
  };

  // ─── File Upload Handler ───────────────────────────────────────────────────

  const triggerUpload = (target: { type: 'hero' | 'category' | 'promo'; id?: string; index?: number }) => {
    setPendingUploadTarget(target);
    fileInputRef.current?.click();
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingUploadTarget) return;

    if (pendingUploadTarget.type === 'hero' && pendingUploadTarget.id) {
      setUploadingSlideId(pendingUploadTarget.id);
    } else if (pendingUploadTarget.type === 'category' && pendingUploadTarget.index !== undefined) {
      setUploadingCatIndex(pendingUploadTarget.index);
    } else if (pendingUploadTarget.type === 'promo') {
      setUploadingPromo(true);
    }

    const { url, error } = await uploadHeroImage(file);

    setUploadingSlideId(null);
    setUploadingCatIndex(null);
    setUploadingPromo(false);

    if (error || !url) {
      showToast(`Upload failed: ${error || 'Unknown error'}`);
      return;
    }

    if (pendingUploadTarget.type === 'hero' && pendingUploadTarget.id) {
      handleSlideChange(pendingUploadTarget.id, 'image', url);
      showToast('Hero photo uploaded & converted to WebP! Click Save Changes.');
    } else if (pendingUploadTarget.type === 'category' && pendingUploadTarget.index !== undefined) {
      const idx = pendingUploadTarget.index;
      setContent((prev) => {
        const updated = [...prev.categories];
        updated[idx] = { ...updated[idx], image: url };
        return { ...prev, categories: updated };
      });
      showToast('Category photo updated! Click Save Changes.');
    } else if (pendingUploadTarget.type === 'promo') {
      setContent((prev) => ({
        ...prev,
        promoBanner: { ...prev.promoBanner, image: url },
      }));
      showToast('Promo banner photo updated! Click Save Changes.');
    }

    e.target.value = '';
    setPendingUploadTarget(null);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 flex items-center justify-center text-[#FAF8F5]">
        <Loader2 className="w-6 h-6 animate-spin text-[#A45543] mr-2" />
        <span>Loading homepage content…</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Hidden File Input for WebP uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileSelected}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#FAF8F5] font-serif">
            Homepage Banners & Photos
          </h1>
          <p className="text-[#7E726D] text-sm mt-0.5">
            Upload latest photos and edit headings for the main carousel, categories, and banners
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#3D2E2A] text-xs text-[#D4C5B9] hover:text-[#FAF8F5] hover:bg-[#3D2E2A]/50 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Live Site</span>
          </a>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A45543] to-[#8B4232] text-white text-xs font-semibold shadow-lg hover:brightness-110 active:scale-98 transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save All Changes</span>
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2E221F] border border-emerald-500/50 text-[#FAF8F5] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-[#3D2E2A] pb-3">
        <button
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'hero'
              ? 'bg-[#A45543] text-white'
              : 'text-[#7E726D] hover:text-[#FAF8F5] hover:bg-[#3D2E2A]/40'
          }`}
        >
          Hero Carousel Slides ({content.heroSlides.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'categories'
              ? 'bg-[#A45543] text-white'
              : 'text-[#7E726D] hover:text-[#FAF8F5] hover:bg-[#3D2E2A]/40'
          }`}
        >
          Category Circles ({content.categories.length})
        </button>
        <button
          onClick={() => setActiveTab('promo')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'promo'
              ? 'bg-[#A45543] text-white'
              : 'text-[#7E726D] hover:text-[#FAF8F5] hover:bg-[#3D2E2A]/40'
          }`}
        >
          Promo Split Banner
        </button>
      </div>

      {/* ─── TAB 1: HERO CAROUSEL SLIDES ─── */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#D4C5B9]">
              These are the large rotating showcase slides at the very top of your homepage.
            </p>
            <button
              onClick={handleAddSlide}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#3D2E2A] text-xs text-[#C68B7B] hover:bg-[#A45543]/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Slide</span>
            </button>
          </div>

          <div className="space-y-6">
            {content.heroSlides.map((slide, index) => {
              const isUploadingThis = uploadingSlideId === slide.id;
              return (
                <div
                  key={slide.id}
                  className="bg-[#2E221F] border border-[#3D2E2A] rounded-2xl p-6 shadow-xl space-y-6"
                >
                  {/* Top Bar of Slide Card */}
                  <div className="flex items-center justify-between border-b border-[#3D2E2A]/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#A45543]/30 text-[#C68B7B] font-mono text-xs flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm font-semibold text-[#FAF8F5]">
                        Slide: {slide.title || 'Untitled Slide'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveSlide(index, 'up')}
                        disabled={index === 0}
                        title="Move Slide Up"
                        className="p-1.5 text-[#7E726D] hover:text-[#FAF8F5] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <MoveUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveSlide(index, 'down')}
                        disabled={index === content.heroSlides.length - 1}
                        title="Move Slide Down"
                        className="p-1.5 text-[#7E726D] hover:text-[#FAF8F5] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <MoveDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSlide(slide.id)}
                        disabled={content.heroSlides.length <= 1}
                        title="Delete Slide"
                        className="p-1.5 text-red-400 hover:text-red-300 disabled:opacity-30 disabled:pointer-events-none transition-colors ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Grid: Image on Left/Top, Controls on Right */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    {/* Image Preview & Upload Box */}
                    <div className="md:col-span-5 space-y-3">
                      <div className="relative aspect-[3/4] max-h-80 w-full rounded-xl overflow-hidden bg-[#1C1412] border border-[#3D2E2A] group">
                        {slide.image ? (
                          <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-[#7E726D]">
                            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                            <span className="text-xs">No image uploaded</span>
                          </div>
                        )}

                        {/* Hover Overlay with Upload Action */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                          <button
                            type="button"
                            disabled={isUploadingThis}
                            onClick={() => triggerUpload({ type: 'hero', id: slide.id })}
                            className="px-4 py-2 bg-[#A45543] hover:bg-[#8B4232] text-white text-xs font-semibold rounded-lg shadow-lg flex items-center gap-1.5 transition-transform active:scale-95"
                          >
                            {isUploadingThis ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                            <span>{isUploadingThis ? 'Optimizing…' : 'Upload New Photo (WebP)'}</span>
                          </button>
                          <span className="text-[10px] text-[#D4C5B9]">Converts & shrinks to WebP automatically</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isUploadingThis}
                        onClick={() => triggerUpload({ type: 'hero', id: slide.id })}
                        className="w-full py-2.5 rounded-xl border border-dashed border-[#A45543]/60 bg-[#A45543]/10 hover:bg-[#A45543]/20 text-[#C68B7B] text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        {isUploadingThis ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{isUploadingThis ? 'Uploading WebP…' : 'Change Photo from Device'}</span>
                      </button>

                      <div>
                        <label className="text-[11px] text-[#7E726D] block mb-1">
                          Or Direct Image URL:
                        </label>
                        <input
                          type="text"
                          value={slide.image}
                          onChange={(e) => handleSlideChange(slide.id, 'image', e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-[#1C1412] border border-[#3D2E2A] rounded-lg px-2.5 py-1.5 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#A45543]"
                        />
                      </div>
                    </div>

                    {/* Text Fields */}
                    <div className="md:col-span-7 space-y-4">
                      <div>
                        <label className="text-xs font-medium text-[#FAF8F5] block mb-1">
                          Subtitle Tag / Kicker
                        </label>
                        <input
                          type="text"
                          value={slide.kicker}
                          onChange={(e) => handleSlideChange(slide.id, 'kicker', e.target.value)}
                          placeholder="e.g. Summer & Festive 2026"
                          className="w-full bg-[#1C1412] border border-[#3D2E2A] rounded-xl px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#A45543]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-[#FAF8F5] block mb-1">
                          Headline / Title
                        </label>
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) => handleSlideChange(slide.id, 'title', e.target.value)}
                          placeholder="e.g. Trendy Modest Effortless"
                          className="w-full bg-[#1C1412] border border-[#3D2E2A] rounded-xl px-3 py-2 text-sm text-[#FAF8F5] font-serif focus:outline-none focus:border-[#A45543]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium text-[#FAF8F5] block mb-1">
                          Description Subtitle
                        </label>
                        <textarea
                          rows={2}
                          value={slide.subtitle}
                          onChange={(e) => handleSlideChange(slide.id, 'subtitle', e.target.value)}
                          placeholder="e.g. Premium women's wear curated for every you."
                          className="w-full bg-[#1C1412] border border-[#3D2E2A] rounded-xl px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#A45543]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-[#FAF8F5] block mb-1">
                            Button Text
                          </label>
                          <input
                            type="text"
                            value={slide.cta}
                            onChange={(e) => handleSlideChange(slide.id, 'cta', e.target.value)}
                            placeholder="e.g. SHOP NOW"
                            className="w-full bg-[#1C1412] border border-[#3D2E2A] rounded-xl px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#A45543]"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-medium text-[#FAF8F5] block mb-1">
                            Target Category Link
                          </label>
                          <select
                            value={slide.category}
                            onChange={(e) => handleSlideChange(slide.id, 'category', e.target.value)}
                            className="w-full bg-[#1C1412] border border-[#3D2E2A] rounded-xl px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#A45543]"
                          >
                            {CATEGORY_OPTIONS.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 2: CATEGORY CIRCLES ─── */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <p className="text-xs text-[#D4C5B9]">
            These are the 7 circular category photos located directly under the hero banner. Click any photo to upload a replacement photo.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {content.categories.map((cat, idx) => {
              const isUploadingThis = uploadingCatIndex === idx;
              return (
                <div
                  key={cat.name}
                  className="bg-[#2E221F] border border-[#3D2E2A] rounded-2xl p-5 flex flex-col items-center text-center space-y-3"
                >
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#A45543]/40 bg-[#1C1412] group">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => triggerUpload({ type: 'category', index: idx })}
                        className="p-2 bg-[#A45543] rounded-full text-white shadow-lg hover:scale-105 transition-transform"
                        title="Upload New Category Photo"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-[#FAF8F5]">{cat.name}</h4>
                    <p className="text-[11px] text-[#7E726D] mt-0.5 line-clamp-1">
                      {cat.description || `${cat.name} Collection`}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isUploadingThis}
                    onClick={() => triggerUpload({ type: 'category', index: idx })}
                    className="w-full py-1.5 rounded-lg border border-[#3D2E2A] text-xs text-[#C68B7B] hover:bg-[#3D2E2A]/50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    {isUploadingThis ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Upload className="w-3 h-3" />
                    )}
                    <span>{isUploadingThis ? 'Uploading…' : 'Change Photo'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 3: PROMO BANNER ─── */}
      {activeTab === 'promo' && (
        <div className="bg-[#2E221F] border border-[#3D2E2A] rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-[#FAF8F5]">Promotional Split Banner</h3>
            <p className="text-xs text-[#7E726D] mt-0.5">
              The editorial wide background banner displayed in the middle of the homepage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-5 space-y-3">
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-[#1C1412] border border-[#3D2E2A] group">
                <img
                  src={content.promoBanner.image}
                  alt={content.promoBanner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => triggerUpload({ type: 'promo' })}
                    className="px-4 py-2 bg-[#A45543] rounded-lg text-white text-xs font-semibold shadow-lg flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Banner Photo</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                disabled={uploadingPromo}
                onClick={() => triggerUpload({ type: 'promo' })}
                className="w-full py-2.5 rounded-xl border border-dashed border-[#A45543]/60 bg-[#A45543]/10 hover:bg-[#A45543]/20 text-[#C68B7B] text-xs font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {uploadingPromo ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>{uploadingPromo ? 'Optimizing & Uploading…' : 'Change Banner Photo'}</span>
              </button>
            </div>

            <div className="md:col-span-7 space-y-4">
              <div>
                <label className="text-xs font-medium text-[#FAF8F5] block mb-1">Tag Kicker</label>
                <input
                  type="text"
                  value={content.promoBanner.tag}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      promoBanner: { ...prev.promoBanner, tag: e.target.value },
                    }))
                  }
                  className="w-full bg-[#1C1412] border border-[#3D2E2A] rounded-xl px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#A45543]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#FAF8F5] block mb-1">Headline</label>
                <input
                  type="text"
                  value={content.promoBanner.title}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      promoBanner: { ...prev.promoBanner, title: e.target.value },
                    }))
                  }
                  className="w-full bg-[#1C1412] border border-[#3D2E2A] rounded-xl px-3 py-2 text-sm text-[#FAF8F5] font-serif focus:outline-none focus:border-[#A45543]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#FAF8F5] block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={content.promoBanner.description}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      promoBanner: { ...prev.promoBanner, description: e.target.value },
                    }))
                  }
                  className="w-full bg-[#1C1412] border border-[#3D2E2A] rounded-xl px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#A45543]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#FAF8F5] block mb-1">Button Text</label>
                  <input
                    type="text"
                    value={content.promoBanner.cta}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        promoBanner: { ...prev.promoBanner, cta: e.target.value },
                      }))
                    }
                    className="w-full bg-[#1C1412] border border-[#3D2E2A] rounded-xl px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#A45543]"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#FAF8F5] block mb-1">Category Link</label>
                  <select
                    value={content.promoBanner.category}
                    onChange={(e) =>
                      setContent((prev) => ({
                        ...prev,
                        promoBanner: { ...prev.promoBanner, category: e.target.value },
                      }))
                    }
                    className="w-full bg-[#1C1412] border border-[#3D2E2A] rounded-xl px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#A45543]"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
