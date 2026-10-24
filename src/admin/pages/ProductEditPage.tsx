import React, { useState } from 'react';
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  DollarSign,
  Tag,
  Layers,
  Info,
} from 'lucide-react';
import {
  adminCreateProduct,
  adminUpdateProduct,
  uploadProductImage,
  type AdminProduct,
} from '../../lib/adminData';
import { ImageOptimizer } from '../components/ImageOptimizer';
import { ProductCategory, ProductColor } from '../../types';

interface ProductEditPageProps {
  product: AdminProduct | null;
  onBack: () => void;
  onSaved: () => void;
}

const CATEGORIES: ProductCategory[] = [
  'Kurtis',
  'Sets',
  'Dresses',
  'Tops',
  'Bottoms',
  'Co-ords',
  'Accessories',
];

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const ProductEditPage: React.FC<ProductEditPageProps> = ({
  product,
  onBack,
  onSaved,
}) => {
  const isEditing = Boolean(product);

  const [name, setName] = useState(product?.name || '');
  const [sku, setSku] = useState(product?.sku || '');
  const [category, setCategory] = useState<ProductCategory>(product?.category || 'Kurtis');
  const [price, setPrice] = useState<string>(product?.price ? String(product?.price) : '');
  const [originalPrice, setOriginalPrice] = useState<string>(
    product?.originalPrice ? String(product?.originalPrice) : ''
  );
  const [status, setStatus] = useState<'published' | 'draft' | 'archived'>(
    product?.status || 'published'
  );
  const [badge, setBadge] = useState<string>(product?.badge || '');
  const [inStock, setInStock] = useState<boolean>(product?.inStock ?? true);
  const [description, setDescription] = useState(product?.description || '');
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [sizes, setSizes] = useState<string[]>(
    product?.sizes && product.sizes.length > 0 ? product.sizes : ['XS', 'S', 'M', 'L', 'XL']
  );
  const [colors, setColors] = useState<ProductColor[]>(
    product?.colors && product.colors.length > 0
      ? product.colors
      : [{ name: 'Default', hex: '#2E221F' }]
  );
  const [fabric, setFabric] = useState(product?.fabric || '');
  const [kurtiLength, setKurtiLength] = useState(product?.kurtiLength || '');
  const [dupatta, setDupatta] = useState(product?.dupatta || '');
  const [setIncludes, setSetIncludes] = useState(product?.setIncludes || '');
  const [occasion, setOccasion] = useState(product?.occasion || '');
  const [care, setCare] = useState(product?.care || '');
  const [featured, setFeatured] = useState<boolean>(product?.featured ?? false);
  const [newArrival, setNewArrival] = useState<boolean>(product?.newArrival ?? true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleToggleSize = (size: string) => {
    if (sizes.includes(size)) {
      if (sizes.length === 1) return; // Keep at least one size
      setSizes(sizes.filter((s) => s !== size));
    } else {
      setSizes([...sizes, size]);
    }
  };

  const handleAddColor = () => {
    setColors([...colors, { name: 'New Color', hex: '#C68B7B' }]);
  };

  const handleColorChange = (index: number, field: keyof ProductColor, value: string) => {
    const updated = [...colors];
    updated[index] = { ...updated[index], [field]: value };
    setColors(updated);
  };

  const handleRemoveColor = (index: number) => {
    if (colors.length === 1) return;
    setColors(colors.filter((_, i) => i !== index));
  };

  const handleAddManualImage = () => {
    if (!manualImageUrl.trim()) return;
    if (images.includes(manualImageUrl.trim())) return;
    setImages([...images, manualImageUrl.trim()]);
    setManualImageUrl('');
  };

  const handleRemoveImage = (url: string) => {
    setImages(images.filter((img) => img !== url));
  };

  const handleUploadBlob = async (blob: Blob, filename: string): Promise<string | null> => {
    const { url, error: uploadErr } = await uploadProductImage(blob, filename, 'products');
    if (uploadErr) {
      setError(`Image upload failed: ${uploadErr}`);
      return null;
    }
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError('Product title is required.');
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Valid selling price is required.');
      return;
    }
    const numOriginal = originalPrice ? Number(originalPrice) : numPrice;
    if (images.length === 0) {
      setError('Please add at least one product image.');
      return;
    }
    if (sizes.length === 0) {
      setError('Please select at least one available size.');
      return;
    }

    setSaving(true);

    const productPayload: Partial<AdminProduct> = {
      name: name.trim(),
      sku: sku.trim() || undefined,
      category,
      price: numPrice,
      originalPrice: numOriginal,
      status,
      badge: (badge ? badge.toUpperCase() : undefined) as any,
      inStock,
      description: description.trim(),
      images,
      sizes,
      colors,
      fabric: fabric.trim() || undefined,
      kurtiLength: kurtiLength.trim() || undefined,
      dupatta: dupatta.trim() || undefined,
      setIncludes: setIncludes.trim() || undefined,
      occasion: occasion.trim() || undefined,
      care: care.trim() || undefined,
      featured,
      newArrival,
      rating: product?.rating ?? 4.8,
      reviewCount: product?.reviewCount ?? 0,
    };

    if (isEditing && product) {
      const { error: updateErr } = await adminUpdateProduct(product.id, productPayload);
      if (updateErr) {
        setError(`Failed to update product: ${updateErr}`);
        setSaving(false);
        return;
      }
      setSuccessToast('Product updated successfully!');
    } else {
      const { id, error: createErr } = await adminCreateProduct(productPayload);
      if (createErr || !id) {
        setError(`Failed to create product: ${createErr || 'Unknown error'}`);
        setSaving(false);
        return;
      }
      setSuccessToast('Product created successfully!');
    }

    setSaving(false);
    setTimeout(() => {
      onSaved();
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-xl border border-[#3D2E2A] flex items-center justify-center text-[#7E726D] hover:text-[#FAF8F5] hover:bg-[#3D2E2A]/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#FAF8F5]">
              {isEditing ? `Edit: ${product?.name}` : 'New Product'}
            </h1>
            <p className="text-xs text-[#7E726D] mt-0.5">
              {isEditing ? `Product ID: ${product?.id}` : 'Fill in the details to add to catalog'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border border-[#3D2E2A] text-xs font-medium text-[#7E726D] hover:text-[#FAF8F5] rounded-xl hover:bg-[#3D2E2A]/40 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 bg-[#A45543] hover:bg-[#8E3D2D] disabled:opacity-50 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-lg transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                {isEditing ? 'Save Changes' : 'Create Product'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-900/30 border border-red-700/50 flex items-center gap-3 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successToast && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-900/30 border border-emerald-700/50 flex items-center gap-3 text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Essential details (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Info Card */}
            <div className="bg-[#2E221F] border border-[#3D2E2A] rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-[#FAF8F5] mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#C68B7B]" />
                Basic Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#D4C5B9] mb-1.5">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Embroidered Chanderi Silk Kurti Set"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#1C1412] border border-[#3D2E2A] rounded-xl px-4 py-2.5 text-sm text-[#FAF8F5] placeholder-[#5E4E49] focus:outline-none focus:border-[#A45543]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#D4C5B9] mb-1.5">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ProductCategory)}
                      className="w-full bg-[#1C1412] border border-[#3D2E2A] rounded-xl px-4 py-2.5 text-sm text-[#FAF8F5] focus:outline-none focus:border-[#A45543]"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#D4C5B9] mb-1.5">
                      SKU (Stock Keeping Unit)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. STYL-KRT-001"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full bg-[#1C1412] border border-[#3D2E2A] rounded-xl px-4 py-2.5 text-sm text-[#FAF8F5] placeholder-[#5E4E49] focus:outline-none focus:border-[#A45543]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#D4C5B9] mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Detailed description of the garment, cut, work, styling tips..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#1C1412] border border-[#3D2E2A] rounded-xl px-4 py-2.5 text-sm text-[#FAF8F5] placeholder-[#5E4E49] focus:outline-none focus:border-[#A45543]"
                  />
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-[#2E221F] border border-[#3D2E2A] rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-[#FAF8F5] mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#C68B7B]" />
                Pricing (INR ₹)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#D4C5B9] mb-1.5">
                    Selling Price (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#7E726D]">
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="1299"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-[#1C1412] border border-[#3D2E2A] rounded-xl pl-8 pr-4 py-2.5 text-sm text-[#FAF8F5] placeholder-[#5E4E49] focus:outline-none focus:border-[#A45543]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#D4C5B9] mb-1.5">
                    Original / MRP Price (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#7E726D]">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="1"
                      placeholder="1599"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      className="w-full bg-[#1C1412] border border-[#3D2E2A] rounded-xl pl-8 pr-4 py-2.5 text-sm text-[#FAF8F5] placeholder-[#5E4E49] focus:outline-none focus:border-[#A45543]"
                    />
                  </div>
                </div>
              </div>

              {Number(originalPrice) > Number(price) && Number(price) > 0 && (
                <div className="mt-3 text-xs text-emerald-400 font-medium">
                  {Math.round(
                    ((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100
                  )}
                  % off displayed on storefront
                </div>
              )}
            </div>

            {/* Media & Images Card */}
            <div className="bg-[#2E221F] border border-[#3D2E2A] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[#FAF8F5] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#C68B7B]" />
                  Product Images
                </h2>
                <span className="text-[11px] text-[#7E726D] font-mono">
                  {images.length} added
                </span>
              </div>

              {/* Client-side WebP Image Optimizer & Storage uploader */}
              <div className="mb-4">
                <ImageOptimizer
                  onImagesUploaded={(urls) => setImages((prev) => [...prev, ...urls])}
                  onUpload={handleUploadBlob}
                  existingImages={images}
                  onRemoveExisting={handleRemoveImage}
                  maxImages={8}
                />
              </div>

              {/* Add direct URL */}
              <div className="pt-4 border-t border-[#3D2E2A]">
                <label className="block text-xs font-medium text-[#7E726D] mb-1.5">
                  Or add image via URL:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={manualImageUrl}
                    onChange={(e) => setManualImageUrl(e.target.value)}
                    className="flex-1 bg-[#1C1412] border border-[#3D2E2A] rounded-xl px-4 py-2 text-xs text-[#FAF8F5] placeholder-[#5E4E49] focus:outline-none focus:border-[#A45543]"
                  />
                  <button
                    type="button"
                    onClick={handleAddManualImage}
                    className="px-4 py-2 bg-[#3D2E2A] hover:bg-[#4D3A35] text-xs text-[#FAF8F5] rounded-xl transition-colors"
                  >
                    Add URL
                  </button>
                </div>
              </div>
            </div>

            {/* Fashion Specifications */}
            <div className="bg-[#2E221F] border border-[#3D2E2A] rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-[#FAF8F5] mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#C68B7B]" />
                Garment Specifications
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#D4C5B9] mb-1.5">Fabric</label>
                  <input
                    type="text"
                    placeholder="e.g. Pure Rayon / Chanderi Silk"
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                    className="w-full bg-[#1C1412] border border-[#3D2E2A] rounded-xl px-4 py-2 text-xs text-[#FAF8F5] placeholder-[#5E4E49] focus:outline-none focus:border-[#A45543]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#D4C5B9] mb-1.5">
                    Kurti Length
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 46 inches (Calf Length)"
                    value={kurtiLength}
                    onChange={(e) => setKurtiLength(e.target.value)}
                    className="w-full bg-[#1C1412] border border-[#3D2E2A] rounded-xl px-4 py-2 text-xs text-[#FAF8F5] placeholder-[#5E4E49] focus:outline-none focus:border-[#A45543]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#D4C5B9] mb-1.5">Dupatta</label>
                  <input
                    type="text"
                    placeholder="e.g. 2.4 meters lightweight flowy"
                    value={dupatta}
                    onChange={(e) => setDupatta(e.target.value)}
                    className="w-full bg-[#1C1412] border border-[#3D2E2A] rounded-xl px-4 py-2 text-xs text-[#FAF8F5] placeholder-[#5E4E49] focus:outline-none focus:border-[#A45543]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#D4C5B9] mb-1.5">
                    Set Includes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kurti, Tailored Pant & Dupatta"
                    value={setIncludes}
                    onChange={(e) => setSetIncludes(e.target.value)}
                    className="w-full bg-[#1C1412] border border-[#3D2E2A] rounded-xl px-4 py-2 text-xs text-[#FAF8F5] placeholder-[#5E4E49] focus:outline-none focus:border-[#A45543]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#D4C5B9] mb-1.5">Occasion</label>
                  <input
                    type="text"
                    placeholder="e.g. Casual, Festive, Office, Festive Wear"
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="w-full bg-[#1C1412] border border-[#3D2E2A] rounded-xl px-4 py-2 text-xs text-[#FAF8F5] placeholder-[#5E4E49] focus:outline-none focus:border-[#A45543]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#D4C5B9] mb-1.5">
                    Care Instructions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dry Clean Only / Hand Wash"
                    value={care}
                    onChange={(e) => setCare(e.target.value)}
                    className="w-full bg-[#1C1412] border border-[#3D2E2A] rounded-xl px-4 py-2 text-xs text-[#FAF8F5] placeholder-[#5E4E49] focus:outline-none focus:border-[#A45543]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Settings, Status, Sizes & Colors (1 col) */}
          <div className="space-y-6">
            {/* Publishing & Status Card */}
            <div className="bg-[#2E221F] border border-[#3D2E2A] rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-[#FAF8F5] mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-[#C68B7B]" />
                Status & Visibility
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#D4C5B9] mb-1.5">
                    Publish Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-[#1C1412] border border-[#3D2E2A] rounded-xl px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#A45543]"
                  >
                    <option value="published">Published (Visible to customers)</option>
                    <option value="draft">Draft (Hidden from store)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#D4C5B9] mb-1.5">
                    Promotional Badge
                  </label>
                  <select
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full bg-[#1C1412] border border-[#3D2E2A] rounded-xl px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#A45543]"
                  >
                    <option value="">No Badge</option>
                    <option value="NEW">NEW</option>
                    <option value="BESTSELLER">BESTSELLER</option>
                    <option value="LIMITED">LIMITED</option>
                    <option value="SALE">SALE</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-[#3D2E2A] space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStock}
                      onChange={(e) => setInStock(e.target.checked)}
                      className="w-4 h-4 rounded border-[#3D2E2A] text-[#A45543] focus:ring-0 bg-[#1C1412]"
                    />
                    <span className="text-xs text-[#D4C5B9]">In Stock for Purchase</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="w-4 h-4 rounded border-[#3D2E2A] text-[#A45543] focus:ring-0 bg-[#1C1412]"
                    />
                    <span className="text-xs text-[#D4C5B9]">Featured on Homepage</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newArrival}
                      onChange={(e) => setNewArrival(e.target.checked)}
                      className="w-4 h-4 rounded border-[#3D2E2A] text-[#A45543] focus:ring-0 bg-[#1C1412]"
                    />
                    <span className="text-xs text-[#D4C5B9]">Mark as New Arrival</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Sizes Card */}
            <div className="bg-[#2E221F] border border-[#3D2E2A] rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-[#FAF8F5] mb-3">Sizes Available *</h2>
              <p className="text-[11px] text-[#7E726D] mb-3">
                Select sizes currently in inventory:
              </p>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_SIZES.map((size) => {
                  const selected = sizes.includes(size);
                  return (
                    <button
                      type="button"
                      key={size}
                      onClick={() => handleToggleSize(size)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        selected
                          ? 'bg-[#A45543] text-white shadow'
                          : 'bg-[#1C1412] text-[#7E726D] border border-[#3D2E2A] hover:text-[#FAF8F5]'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colors Card */}
            <div className="bg-[#2E221F] border border-[#3D2E2A] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-[#FAF8F5]">Color Swatches</h2>
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="text-xs text-[#C68B7B] hover:text-[#A45543] flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              <div className="space-y-2.5">
                {colors.map((color, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color.hex}
                      onChange={(e) => handleColorChange(idx, 'hex', e.target.value)}
                      className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={color.name}
                      onChange={(e) => handleColorChange(idx, 'name', e.target.value)}
                      placeholder="Color name"
                      className="flex-1 bg-[#1C1412] border border-[#3D2E2A] rounded-xl px-3 py-1.5 text-xs text-[#FAF8F5] placeholder-[#5E4E49] focus:outline-none focus:border-[#A45543]"
                    />
                    {colors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(idx)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#7E726D] hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
