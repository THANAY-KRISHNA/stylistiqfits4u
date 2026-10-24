import React, { useState } from 'react';
import { useAdminAuth } from './hooks/useAdminAuth';
import { AdminSidebar, type AdminSection } from './components/AdminSidebar';
import { AdminLoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductEditPage } from './pages/ProductEditPage';
import { OrdersPage } from './pages/OrdersPage';
import { BannersPage } from './pages/BannersPage';
import { MediaLibraryPage } from './pages/MediaLibraryPage';
import { SettingsPage } from './pages/SettingsPage';
import { type AdminProduct } from '../lib/adminData';
import { Sparkles, Loader2, ExternalLink, LogOut } from 'lucide-react';

export const AdminApp: React.FC = () => {
  const { user, isAdmin, loading, error, login, logout } = useAdminAuth();
  const [currentSection, setCurrentSection] = useState<AdminSection>('dashboard');
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null | undefined>(undefined);

  // Loading state during auth bootstrap
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-[#1C1412] flex flex-col items-center justify-center text-[#FAF8F5]">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#A45543] to-[#C68B7B] flex items-center justify-center mb-4 shadow-xl">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <div className="font-serif text-2xl font-semibold mb-2">STYL IS TIQ</div>
        <div className="flex items-center gap-2 text-xs text-[#7E726D]">
          <Loader2 className="w-4 h-4 animate-spin text-[#A45543]" />
          Verifying administrator credentials…
        </div>
      </div>
    );
  }

  // Not logged in or not admin -> Show Admin Login
  if (!user || !isAdmin) {
    return (
      <AdminLoginPage
        onLogin={login}
        loading={loading}
        error={error}
      />
    );
  }

  // Authenticated Admin Dashboard Layout
  return (
    <div className="min-h-screen bg-[#1C1412] text-[#FAF8F5] flex">
      {/* Sidebar (Desktop sticky & Mobile drawer) */}
      <AdminSidebar
        currentSection={currentSection}
        onNavigate={(section) => {
          setEditingProduct(undefined);
          setCurrentSection(section);
        }}
        onLogout={logout}
        user={user}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-[#3D2E2A] bg-[#2E221F]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 pl-12 lg:pl-0">
            <span className="text-xs uppercase tracking-wider text-[#7E726D] font-mono">
              Admin /
            </span>
            <span className="text-sm font-medium text-[#FAF8F5] capitalize">
              {editingProduct !== undefined
                ? editingProduct
                  ? `Edit: ${editingProduct.name}`
                  : 'Add New Product'
                : currentSection}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#3D2E2A] text-xs text-[#D4C5B9] hover:text-[#FAF8F5] hover:bg-[#3D2E2A]/50 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Store</span>
            </a>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#7E726D] hover:text-red-400 hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Section View */}
        <main className="flex-1 pb-16 overflow-x-hidden">
          {currentSection === 'dashboard' && (
            <DashboardPage
              onNavigate={(section) => {
                setEditingProduct(undefined);
                setCurrentSection(section);
              }}
            />
          )}

          {currentSection === 'products' && (
            editingProduct !== undefined ? (
              <ProductEditPage
                product={editingProduct}
                onBack={() => setEditingProduct(undefined)}
                onSaved={() => setEditingProduct(undefined)}
              />
            ) : (
              <ProductsPage
                onEditProduct={(product) => setEditingProduct(product)}
              />
            )
          )}

          {currentSection === 'orders' && <OrdersPage />}

          {currentSection === 'banners' && <BannersPage />}

          {currentSection === 'media' && <MediaLibraryPage />}

          {currentSection === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
};
