import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Sliders,
  ImageIcon,
  Settings,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import type { User } from '../../lib/auth';

export type AdminSection =
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'banners'
  | 'media'
  | 'settings';

interface AdminSidebarProps {
  currentSection: AdminSection;
  onNavigate: (section: AdminSection) => void;
  onLogout: () => void;
  user: User | null;
}

const NAV_ITEMS: Array<{ id: AdminSection; label: string; icon: React.FC<{ className?: string }> }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'banners', label: 'Banners & Photos', icon: Sliders },
  { id: 'media', label: 'Media Library', icon: ImageIcon },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentSection,
  onNavigate,
  onLogout,
  user,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-[#3D2E2A]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#A45543] to-[#C68B7B] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-serif text-sm font-semibold text-[#FAF8F5] leading-tight">
              STYL IS TIQ
            </div>
            <div className="text-[10px] text-[#7E726D] uppercase tracking-wider">Admin</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = currentSection === id;
          return (
            <button
              key={id}
              onClick={() => { onNavigate(id); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                active
                  ? 'bg-[#A45543]/20 text-[#C68B7B] font-medium'
                  : 'text-[#7E726D] hover:text-[#D4C5B9] hover:bg-[#3D2E2A]/50'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#C68B7B]' : ''}`} />
              <span>{label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#C68B7B]" />}
            </button>
          );
        })}
      </nav>

      {/* View Store */}
      <div className="px-3 pb-2">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-[#7E726D] hover:text-[#D4C5B9] hover:bg-[#3D2E2A]/50 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          View Storefront
        </a>
      </div>

      {/* User + Logout */}
      <div className="px-3 pb-4 border-t border-[#3D2E2A] pt-3">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#A45543] to-[#C68B7B] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.email?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[#D4C5B9] text-xs font-medium truncate">
              {user?.email ?? 'Admin'}
            </div>
            <div className="text-[#7E726D] text-[10px]">Administrator</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#7E726D] hover:text-red-400 hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-[#2E221F] border-r border-[#3D2E2A] h-screen sticky top-0 shrink-0">
        <NavContent />
      </aside>

      {/* Mobile toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-50 w-9 h-9 bg-[#2E221F] border border-[#3D2E2A] rounded-lg flex items-center justify-center text-[#D4C5B9]"
        >
          <Menu className="w-4 h-4" />
        </button>

        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 w-56 bg-[#2E221F] border-r border-[#3D2E2A] flex flex-col">
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 text-[#7E726D] hover:text-[#D4C5B9]"
              >
                <X className="w-5 h-5" />
              </button>
              <NavContent />
            </aside>
          </>
        )}
      </div>
    </>
  );
};
