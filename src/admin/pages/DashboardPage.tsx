import React, { useState, useEffect } from 'react';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Clock,
  BarChart3,
  HardDrive,
  Database,
} from 'lucide-react';
import { adminFetchAllProducts, adminFetchOrders } from '../../lib/adminData';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface Stats {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  totalOrders: number;
  pendingOrders: number;
  recentOrders: Array<{
    order_id: string;
    customer_name: string;
    total: number;
    status: string;
    created_at: string;
  }>;
}

interface DashboardPageProps {
  onNavigate: (section: 'products' | 'orders' | 'media' | 'settings') => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbPending, setDbPending] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    setDbPending(false);

    try {
      // 1. Fetch real products
      const { products } = await adminFetchAllProducts();
      
      // 2. Fetch real orders (clean, zero mock data)
      const { orders } = await adminFetchOrders();

      // Check if remote table products exists
      if (supabase) {
        const { error: testErr } = await supabase.from('products').select('id').limit(1);
        if (testErr && testErr.code === 'PGRST205') {
          setDbPending(true);
        }
      }

      setStats({
        totalProducts: products.length,
        publishedProducts: products.filter((p) => !p.status || p.status === 'published').length,
        draftProducts: products.filter((p) => p.status === 'draft').length,
        totalOrders: orders.length,
        pendingOrders: orders.filter((o) => !o.status || o.status === 'pending').length,
        recentOrders: orders.slice(0, 5).map((o) => ({
          order_id: o.order_id,
          customer_name: o.customer_name,
          total: o.total,
          status: o.status,
          created_at: o.created_at,
        })),
      });
    } catch (e: any) {
      setError(e?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const StatCard = ({
    label,
    value,
    sub,
    icon: Icon,
    accent,
    onClick,
  }: {
    label: string;
    value: number | string;
    sub?: string;
    icon: React.FC<{ className?: string }>;
    accent: string;
    onClick?: () => void;
  }) => (
    <div
      onClick={onClick}
      className={`bg-[#2E221F] border border-[#3D2E2A] rounded-2xl p-5 ${onClick ? 'cursor-pointer hover:border-[#A45543]/50 transition-colors' : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {onClick && <ExternalLink className="w-3.5 h-3.5 text-[#5E4E49]" />}
      </div>
      <div className="text-2xl font-bold text-[#FAF8F5] mb-0.5">{loading ? '—' : value}</div>
      <div className="text-xs text-[#7E726D] font-medium">{label}</div>
      {sub && <div className="text-[11px] text-[#5E4E49] mt-0.5">{sub}</div>}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#FAF8F5] font-serif">Dashboard</h1>
          <p className="text-[#7E726D] text-sm mt-0.5">Your store at a glance</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-xs text-[#7E726D] hover:text-[#D4C5B9] border border-[#3D2E2A] rounded-lg hover:bg-[#3D2E2A]/50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Database Pending Setup Banner */}
      {dbPending && (
        <div className="bg-[#2E221F] border border-[#A45543]/60 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#A45543]/20 flex items-center justify-center text-[#C68B7B] shrink-0 mt-0.5 sm:mt-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#FAF8F5]">Supabase Cloud Database Setup Pending</div>
              <div className="text-xs text-[#D4C5B9] mt-0.5">
                Your database tables (products, orders, storage bucket) need to be created in Supabase. Run the SQL script in your Supabase SQL Editor.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('settings')}
            className="px-4 py-2 bg-[#A45543] hover:bg-[#8B4232] text-white text-xs font-medium rounded-xl transition-colors whitespace-nowrap"
          >
            Copy SQL Script →
          </button>
        </div>
      )}

      {/* Generic Error state */}
      {error && !dbPending && (
        <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl px-5 py-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <div className="text-amber-300 text-sm font-medium">Notice</div>
            <div className="text-amber-400/70 text-xs mt-0.5">{error}</div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Products"
          value={stats?.totalProducts ?? 0}
          sub={`${stats?.publishedProducts ?? 0} published · ${stats?.draftProducts ?? 0} drafts`}
          icon={Package}
          accent="bg-[#A45543]"
          onClick={() => onNavigate('products')}
        />
        <StatCard
          label="Total Orders"
          value={stats?.totalOrders ?? 0}
          sub={`${stats?.pendingOrders ?? 0} pending`}
          icon={ShoppingBag}
          accent="bg-[#7E726D]"
          onClick={() => onNavigate('orders')}
        />
        <StatCard
          label="Storage Used"
          value="—"
          sub="Supabase Storage"
          icon={HardDrive}
          accent="bg-[#4B7B82]"
          onClick={() => onNavigate('media')}
        />
        <StatCard
          label="Status"
          value={isSupabaseConfigured ? '✓ Live' : '⚠ Offline'}
          sub={isSupabaseConfigured ? 'Connected to Supabase' : 'Add anon key'}
          icon={BarChart3}
          accent={isSupabaseConfigured ? 'bg-emerald-700' : 'bg-amber-700'}
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-[#2E221F] border border-[#3D2E2A] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#3D2E2A] flex items-center justify-between">
          <h2 className="text-[#FAF8F5] text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#A45543]" />
            Recent Orders
          </h2>
          <button
            onClick={() => onNavigate('orders')}
            className="text-[#A45543] hover:text-[#C68B7B] text-xs transition-colors flex items-center gap-1"
          >
            View all <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-center text-[#5E4E49] text-sm">Loading…</div>
        ) : !stats?.recentOrders.length ? (
          <div className="px-6 py-10 text-center">
            <ShoppingBag className="w-8 h-8 text-[#3D2E2A] mx-auto mb-3" />
            <div className="text-[#7E726D] text-sm">No orders yet</div>
            <div className="text-[#5E4E49] text-xs mt-1">
              {isSupabaseConfigured ? 'Orders will appear here once customers place them' : 'Connect Supabase to see orders'}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#3D2E2A]">
            {stats.recentOrders.map((order) => (
              <div key={order.order_id} className="px-6 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[#FAF8F5] text-sm font-medium">#{order.order_id}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      order.status === 'delivered' ? 'bg-emerald-900/40 text-emerald-400' :
                      order.status === 'shipped' ? 'bg-blue-900/40 text-blue-400' :
                      order.status === 'cancelled' ? 'bg-red-900/40 text-red-400' :
                      'bg-amber-900/40 text-amber-400'
                    }`}>
                      {order.status || 'pending'}
                    </span>
                  </div>
                  <div className="text-[#7E726D] text-xs mt-0.5 truncate">{order.customer_name}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[#FAF8F5] text-sm font-medium">
                    ₹{order.total?.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[#5E4E49] text-[10px] mt-0.5 flex items-center gap-1 justify-end">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      {!isSupabaseConfigured && (
        <div className="mt-6 bg-[#2E221F] border border-[#3D2E2A] rounded-2xl p-6">
          <h3 className="text-[#FAF8F5] text-sm font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#A45543]" />
            Setup Checklist
          </h3>
          <div className="space-y-2.5 text-xs text-[#7E726D]">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border border-[#5E4E49] flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-[#5E4E49]" />
              </div>
              Add <code className="bg-[#1C1412] px-1.5 py-0.5 rounded text-[#C68B7B]">VITE_SUPABASE_ANON_KEY</code> to your .env file
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border border-[#5E4E49] flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-[#5E4E49]" />
              </div>
              Run <code className="bg-[#1C1412] px-1.5 py-0.5 rounded text-[#C68B7B]">supabase_schema.sql</code> in the Supabase SQL editor
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border border-[#5E4E49] flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-[#5E4E49]" />
              </div>
              Create admin account in Supabase Auth with email <code className="bg-[#1C1412] px-1.5 py-0.5 rounded text-[#C68B7B]">stylistiqfits4u@gmail.com</code>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border border-[#5E4E49] flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-[#5E4E49]" />
              </div>
              Run <code className="bg-[#1C1412] px-1.5 py-0.5 rounded text-[#C68B7B]">migrations/002_admin_and_settings.sql</code> for RLS policies
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
