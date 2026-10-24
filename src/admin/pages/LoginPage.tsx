import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Loader2, Sparkles } from 'lucide-react';

interface AdminLoginPageProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLogin, loading, error }) => {
  const [email, setEmail] = useState('stylistiqfits4u@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await onLogin(email.trim(), password);
  };

  return (
    <div className="min-h-screen bg-[#1C1412] flex items-center justify-center px-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#A45543]/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#C68B7B]/8 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#A45543] to-[#C68B7B] mb-4 shadow-lg">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-serif text-3xl text-[#FAF8F5] font-semibold tracking-tight">
            STYL IS TIQ
          </h1>
          <p className="text-[#7E726D] text-sm mt-1">Admin Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-[#2E221F] border border-[#3D2E2A] rounded-2xl shadow-2xl p-8">
          <h2 className="text-[#FAF8F5] text-lg font-semibold mb-1">Sign in</h2>
          <p className="text-[#7E726D] text-sm mb-7">Access your store dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="admin-email" className="block text-xs font-medium text-[#D4C5B9] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7E726D]" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="your@email.com"
                  className="w-full bg-[#1C1412] border border-[#3D2E2A] rounded-xl pl-10 pr-4 py-3 text-sm text-[#FAF8F5] placeholder-[#5E4E49] focus:outline-none focus:border-[#A45543] focus:ring-1 focus:ring-[#A45543] transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="admin-password" className="block text-xs font-medium text-[#D4C5B9] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7E726D]" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-[#1C1412] border border-[#3D2E2A] rounded-xl pl-10 pr-12 py-3 text-sm text-[#FAF8F5] placeholder-[#5E4E49] focus:outline-none focus:border-[#A45543] focus:ring-1 focus:ring-[#A45543] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7E726D] hover:text-[#C68B7B] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 text-red-300 text-xs flex items-start gap-2">
                <span className="mt-0.5 shrink-0">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-gradient-to-r from-[#A45543] to-[#C68B7B] hover:from-[#8E3D2D] hover:to-[#A45543] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl py-3 text-sm font-semibold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in to Dashboard'
              )}
            </button>
          </form>

          {/* Security note */}
          <p className="text-center text-[#5E4E49] text-[11px] mt-6 leading-relaxed">
            Secured by Supabase Auth · Admin access only
          </p>
        </div>

        {/* Back to store link */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-[#7E726D] hover:text-[#C68B7B] text-xs transition-colors"
          >
            ← Return to storefront
          </a>
        </div>
      </div>
    </div>
  );
};
