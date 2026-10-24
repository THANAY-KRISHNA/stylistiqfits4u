import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Truck,
  MapPin,
  Mail,
  Phone,
  CreditCard,
  ChevronDown,
} from 'lucide-react';
import {
  adminFetchOrders,
  adminUpdateOrderStatus,
  type AdminOrder,
  type OrderStatus,
} from '../../lib/adminData';
import { isSupabaseConfigured } from '../../lib/supabase';
import { formatINR } from '../../utils/cartRules';

const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { orders: data, error: err } = await adminFetchOrders(
      statusFilter === 'all' ? undefined : statusFilter
    );
    if (err) setError(err);
    else setOrders(data);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setActionLoading(orderId);
    const { error: err } = await adminUpdateOrderStatus(orderId, newStatus);
    if (err) {
      showToast(`Error: ${err}`);
    } else {
      showToast(`Order #${orderId} marked as ${newStatus}`);
      await loadOrders();
      if (selectedOrder && selectedOrder.order_id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    }
    setActionLoading(null);
  };

  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      o.order_id.toLowerCase().includes(q) ||
      o.customer_name?.toLowerCase().includes(q) ||
      o.customer_email?.toLowerCase().includes(q) ||
      o.customer_phone?.toLowerCase().includes(q);
    return matchSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-900/40 text-emerald-400 border-emerald-800/40';
      case 'shipped':
        return 'bg-blue-900/40 text-blue-400 border-blue-800/40';
      case 'processing':
        return 'bg-purple-900/40 text-purple-400 border-purple-800/40';
      case 'confirmed':
        return 'bg-indigo-900/40 text-indigo-400 border-indigo-800/40';
      case 'cancelled':
        return 'bg-red-900/40 text-red-400 border-red-800/40';
      case 'pending':
      default:
        return 'bg-amber-900/40 text-amber-400 border-amber-800/40';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
      {!isSupabaseConfigured && (
        <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl px-4 py-2.5 mb-6 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Local Development Mode — Displaying demo orders. Orders placed in checkout will also sync here.</span>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#FAF8F5] font-serif">Customer Orders</h1>
          <p className="text-[#7E726D] text-sm mt-0.5">
            Manage purchases, fulfillments, and order statuses
          </p>
        </div>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-xs text-[#7E726D] hover:text-[#D4C5B9] border border-[#3D2E2A] rounded-xl hover:bg-[#3D2E2A]/50 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Orders
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5E4E49]" />
          <input
            type="search"
            placeholder="Search by Order ID, customer name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#2E221F] border border-[#3D2E2A] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#D4C5B9] placeholder-[#5E4E49] focus:outline-none focus:border-[#A45543] transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-[#5E4E49] shrink-0 ml-1" />
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap capitalize ${
              statusFilter === 'all'
                ? 'bg-[#A45543] text-white'
                : 'bg-[#2E221F] border border-[#3D2E2A] text-[#7E726D] hover:text-[#D4C5B9]'
            }`}
          >
            All
          </button>
          {ORDER_STATUSES.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap capitalize ${
                statusFilter === st
                  ? 'bg-[#A45543] text-white'
                  : 'bg-[#2E221F] border border-[#3D2E2A] text-[#7E726D] hover:text-[#D4C5B9]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="bg-red-900/20 border border-red-700/40 rounded-xl px-5 py-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-red-300 text-sm">{error}</span>
        </div>
      )}

      {/* Orders List */}
      <div className="bg-[#2E221F] border border-[#3D2E2A] rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-[#A45543] animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-10 h-10 text-[#3D2E2A] mx-auto mb-3" />
            <div className="text-[#7E726D] text-sm">No orders found</div>
            <div className="text-[#5E4E49] text-xs mt-1">
              {search ? 'Try clearing your search filter' : 'Customer orders will appear here in real-time'}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1C1412] border-b border-[#3D2E2A] text-[#7E726D] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Order</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Items</th>
                  <th className="px-6 py-3.5">Total</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3D2E2A]">
                {filteredOrders.map((order) => {
                  const isActing = actionLoading === order.order_id;
                  const itemsCount: number = Array.isArray(order.items)
                    ? (order.items as any[]).reduce((acc: number, it: any) => acc + (Number(it.quantity) || 1), 0)
                    : 1;

                  return (
                    <tr
                      key={order.order_id}
                      className="hover:bg-[#3D2E2A]/20 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-[#FAF8F5]">#{order.order_id}</div>
                        <div className="text-[11px] text-[#5E4E49] mt-0.5 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(order.created_at || order.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-[#FAF8F5] font-medium">{order.customer_name}</div>
                        <div className="text-[11px] text-[#7E726D] mt-0.5">{order.customer_email}</div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-[#D4C5B9] font-medium">
                          {itemsCount} item{itemsCount !== 1 ? 's' : ''}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-semibold text-[#FAF8F5]">
                          {formatINR(order.total)}
                        </div>
                        <div className="text-[10px] text-[#7E726D] uppercase mt-0.5">
                          {order.payment_method} · {order.payment_status}
                        </div>
                      </td>

                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block">
                          <select
                            disabled={isActing}
                            value={order.status || 'pending'}
                            onChange={(e) =>
                              handleStatusChange(order.order_id, e.target.value as OrderStatus)
                            }
                            className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none appearance-none pr-6 ${getStatusBadge(
                              order.status || 'pending'
                            )}`}
                          >
                            {ORDER_STATUSES.map((st) => (
                              <option key={st} value={st} className="bg-[#2E221F] text-[#FAF8F5]">
                                {st}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-2.5 h-2.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-current" />
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 rounded-lg border border-[#3D2E2A] text-xs text-[#7E726D] hover:text-[#FAF8F5] hover:bg-[#3D2E2A]/50 transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#2E221F] border border-[#3D2E2A] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#3D2E2A] flex items-center justify-between sticky top-0 bg-[#2E221F] z-10">
              <div>
                <h3 className="text-base font-semibold text-[#FAF8F5]">
                  Order #{selectedOrder.order_id}
                </h3>
                <p className="text-xs text-[#7E726D] mt-0.5">
                  Placed on{' '}
                  {new Date(selectedOrder.created_at || selectedOrder.date).toLocaleDateString(
                    'en-IN',
                    { day: 'numeric', month: 'long', year: 'numeric' }
                  )}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7E726D] hover:text-[#FAF8F5] hover:bg-[#3D2E2A]/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Banner */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#1C1412] border border-[#3D2E2A]">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#7E726D]">Current Status:</span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold capitalize ${getStatusBadge(
                      selectedOrder.status || 'pending'
                    )}`}
                  >
                    {selectedOrder.status || 'pending'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#7E726D]">Change:</span>
                  <select
                    value={selectedOrder.status || 'pending'}
                    onChange={(e) =>
                      handleStatusChange(selectedOrder.order_id, e.target.value as OrderStatus)
                    }
                    className="bg-[#2E221F] border border-[#3D2E2A] rounded-lg px-2.5 py-1 text-xs text-[#FAF8F5] focus:outline-none"
                  >
                    {ORDER_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer and Shipping Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#1C1412] border border-[#3D2E2A]">
                  <h4 className="text-xs font-semibold text-[#FAF8F5] uppercase tracking-wider mb-2.5 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#C68B7B]" /> Shipping Address
                  </h4>
                  <div className="text-xs text-[#D4C5B9] space-y-1">
                    <p className="font-semibold text-[#FAF8F5]">{selectedOrder.customer_name}</p>
                    <p>{selectedOrder.shipping_address?.streetAddress}</p>
                    {selectedOrder.shipping_address?.apartment && (
                      <p>{selectedOrder.shipping_address?.apartment}</p>
                    )}
                    <p>
                      {selectedOrder.shipping_address?.city},{' '}
                      {selectedOrder.shipping_address?.state} -{' '}
                      {selectedOrder.shipping_address?.pinCode}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#1C1412] border border-[#3D2E2A]">
                  <h4 className="text-xs font-semibold text-[#FAF8F5] uppercase tracking-wider mb-2.5 flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-[#C68B7B]" /> Contact & Payment
                  </h4>
                  <div className="text-xs text-[#D4C5B9] space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#7E726D]" />
                      <span>{selectedOrder.customer_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#7E726D]" />
                      <span>{selectedOrder.customer_phone}</span>
                    </div>
                    <div className="pt-1 text-[11px] text-[#7E726D]">
                      Payment: <span className="uppercase text-[#FAF8F5] font-medium">{selectedOrder.payment_method}</span> ({selectedOrder.payment_status})
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-xs font-semibold text-[#FAF8F5] uppercase tracking-wider mb-3">
                  Ordered Items
                </h4>
                <div className="divide-y divide-[#3D2E2A] border border-[#3D2E2A] rounded-xl overflow-hidden bg-[#1C1412]">
                  {Array.isArray(selectedOrder.items) &&
                    selectedOrder.items.map((item: any, i: number) => (
                      <div key={i} className="p-3.5 flex items-center gap-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg border border-[#3D2E2A]"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-[#2E221F] rounded-lg flex items-center justify-center text-xs text-[#7E726D]">
                            N/A
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-[#FAF8F5] truncate">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-[#7E726D] mt-0.5">
                            Size: {item.size} · Color: {item.color} · Qty: {item.quantity}
                          </div>
                        </div>
                        <div className="text-xs font-semibold text-[#FAF8F5]">
                          {formatINR(item.price * (item.quantity || 1))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-4 rounded-xl bg-[#1C1412] border border-[#3D2E2A] space-y-2 text-xs">
                <div className="flex justify-between text-[#7E726D]">
                  <span>Subtotal</span>
                  <span>{formatINR(selectedOrder.subtotal || selectedOrder.total)}</span>
                </div>
                {Number(selectedOrder.discount) > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span>-{formatINR(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#7E726D]">
                  <span>Shipping Fee</span>
                  <span>{Number(selectedOrder.shipping) === 0 ? 'FREE' : formatINR(selectedOrder.shipping)}</span>
                </div>
                <div className="pt-2 border-t border-[#3D2E2A] flex justify-between text-sm font-bold text-[#FAF8F5]">
                  <span>Total Paid</span>
                  <span className="text-[#C68B7B]">{formatINR(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2E221F] border border-[#3D2E2A] rounded-xl px-4 py-3 text-xs text-[#FAF8F5] flex items-center gap-2 shadow-2xl">
          <CheckCircle2 className="w-4 h-4 text-[#C68B7B] shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
};
