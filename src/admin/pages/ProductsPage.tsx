import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Package,
  AlertCircle,
  Loader2,
  CheckCircle2,
  RefreshCw,
  X,
  Archive,
} from 'lucide-react';
import { adminFetchAllProducts, adminTogglePublish, adminArchiveProduct, adminDeleteProduct, type AdminProduct } from '../../lib/adminData';
import { isSupabaseConfigured } from '../../lib/supabase';
import { formatINR } from '../../utils/cartRules';

interface ProductsPageProps {
  onEditProduct: (product: AdminProduct | null) => void;
}

const PAGE_SIZE = 12;

export const ProductsPage: React.FC<ProductsPageProps> = ({ onEditProduct }) => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminProduct | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { products: data, error: err } = await adminFetchAllProducts();
    if (err) setError(err);
    else setProducts(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Filter
  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || (p.status ?? 'published') === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTogglePublish = async (product: AdminProduct) => {
    setActionLoading(product.id);
    const isPublished = (product.status ?? 'published') === 'published';
    const { error: err } = await adminTogglePublish(product.id, !isPublished);
    if (err) showToast(`Error: ${err}`);
    else {
      showToast(isPublished ? 'Product unpublished' : 'Product published');
      await load();
    }
    setActionLoading(null);
  };

  const handleArchive = async (product: AdminProduct) => {
    setActionLoading(product.id);
    const { error: err } = await adminArchiveProduct(product.id);
    if (err) showToast(`Error: ${err}`);
    else { showToast('Product archived'); await load(); }
    setActionLoading(null);
  };

  const handleDelete = async (product: AdminProduct) => {
    setConfirmDelete(null);
    setActionLoading(product.id);
    const { error: err } = await adminDeleteProduct(product.id);
    if (err) showToast(`Error: ${err}`);
    else { showToast('Product deleted'); await load(); }
    setActionLoading(null);
  };

  const statusBadge = (status: string | undefined) => {
    const s = status ?? 'published';
    const styles: Record<string, string> = {
      published: 'bg-emerald-900/40 text-emerald-400 border-emerald-800/40',
      draft: 'bg-amber-900/40 text-amber-400 border-amber-800/40',
      archived: 'bg-[#3D2E2A] text-[#5E4E49] border-[#3D2E2A]',
    };
    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${styles[s] ?? styles.draft}`}>
        {s}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
      {!isSupabaseConfigured && (
        <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl px-4 py-2.5 mb-6 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Local Development Mode — Changes stored locally in browser session until live Supabase Anon Key is added.</span>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#FAF8F5] font-serif">Products</h1>
          <p className="text-[#7E726D] text-sm mt-0.5">{products.length} total</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="w-9 h-9 flex items-center justify-center border border-[#3D2E2A] rounded-lg text-[#7E726D] hover:text-[#D4C5B9] hover:bg-[#3D2E2A]/50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => onEditProduct(null)}
            className="flex items-center gap-2 bg-[#A45543] hover:bg-[#8E3D2D] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5E4E49]" />
          <input
            type="search"
            placeholder="Search by name or category…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-[#2E221F] border border-[#3D2E2A] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#D4C5B9] placeholder-[#5E4E49] focus:outline-none focus:border-[#A45543] transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-[#5E4E49]" />
          {(['all', 'published', 'draft', 'archived'] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                statusFilter === s
                  ? 'bg-[#A45543] text-white'
                  : 'bg-[#2E221F] border border-[#3D2E2A] text-[#7E726D] hover:text-[#D4C5B9]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-700/40 rounded-xl px-5 py-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-red-300 text-sm">{error}</span>
        </div>
      )}

      {/* Products grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 text-[#A45543] animate-spin" />
        </div>
      ) : !paged.length ? (
        <div className="text-center py-20">
          <Package className="w-10 h-10 text-[#3D2E2A] mx-auto mb-3" />
          <div className="text-[#7E726D] text-sm">
            {search ? 'No products match your search' : 'No products yet'}
          </div>
          <button onClick={() => onEditProduct(null)} className="mt-4 text-[#A45543] hover:text-[#C68B7B] text-xs transition-colors">
            Add your first product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paged.map((product) => {
            const isLoading = actionLoading === product.id;
            const isPublished = (product.status ?? 'published') === 'published';
            return (
              <div key={product.id} className="bg-[#2E221F] border border-[#3D2E2A] rounded-2xl overflow-hidden group">
                {/* Image */}
                <div className="aspect-[4/3] bg-[#1C1412] relative overflow-hidden">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-[#3D2E2A]" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    {statusBadge(product.status)}
                  </div>
                  {product.badge && (
                    <div className="absolute top-2 left-2 bg-[#A45543] text-white text-[9px] font-bold px-2 py-0.5 rounded">
                      {product.badge}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="text-[#FAF8F5] text-sm font-medium truncate">{product.name}</div>
                  <div className="text-[#7E726D] text-xs mt-0.5">{product.category}</div>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <span className="text-[#FAF8F5] text-sm font-semibold">{formatINR(product.price)}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-[#5E4E49] text-xs line-through ml-1.5">{formatINR(product.originalPrice)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Toggle publish */}
                      <button
                        onClick={() => handleTogglePublish(product)}
                        disabled={isLoading}
                        title={isPublished ? 'Unpublish' : 'Publish'}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[#7E726D] hover:text-[#C68B7B] hover:bg-[#3D2E2A] transition-colors"
                      >
                        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      {/* Edit */}
                      <button
                        onClick={() => onEditProduct(product)}
                        title="Edit"
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[#7E726D] hover:text-[#C68B7B] hover:bg-[#3D2E2A] transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {/* Archive */}
                      <button
                        onClick={() => handleArchive(product)}
                        disabled={isLoading}
                        title="Archive"
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[#7E726D] hover:text-amber-400 hover:bg-amber-900/20 transition-colors"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => setConfirmDelete(product)}
                        title="Delete"
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[#7E726D] hover:text-red-400 hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#3D2E2A] text-[#7E726D] hover:text-[#D4C5B9] disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[#7E726D] text-xs">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#3D2E2A] text-[#7E726D] hover:text-[#D4C5B9] disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-[#2E221F] border border-[#3D2E2A] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-900/40 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="text-[#FAF8F5] text-sm font-semibold">Delete Product?</div>
                <div className="text-[#7E726D] text-xs mt-0.5">
                  "{confirmDelete.name}" will be permanently deleted. This cannot be undone.
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 text-xs border border-[#3D2E2A] rounded-xl text-[#7E726D] hover:text-[#D4C5B9] transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-2 text-xs bg-red-700 hover:bg-red-600 text-white rounded-xl transition-colors font-medium">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2E221F] border border-[#3D2E2A] rounded-xl px-4 py-3 text-sm text-[#FAF8F5] flex items-center gap-2 shadow-xl">
          <CheckCircle2 className="w-4 h-4 text-[#C68B7B] shrink-0" />
          {toast}
        </div>
      )}
    </div>
  );
};
