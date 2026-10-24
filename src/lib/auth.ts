import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

export type { User, Session };

const DEV_SESSION_KEY = 'stylistiq_dev_admin_session';

const MOCK_ADMIN_USER: User = {
  id: 'stylistiq-admin-master',
  app_metadata: { provider: 'email' },
  user_metadata: { name: 'Store Administrator' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'stylistiqfits4u@gmail.com',
};

/**
 * Sign in with email and password.
 * Prioritizes Supabase Auth if configured, and supports local dev credentials
 * so development and testing can proceed seamlessly.
 */
export async function signIn(email: string, password: string): Promise<{
  user: User | null;
  session: Session | null;
  error: string | null;
}> {
  const env = typeof import.meta !== 'undefined' && import.meta?.env ? import.meta.env : (typeof process !== 'undefined' ? process.env : {}) as any;
  const adminEmail = (env?.VITE_ADMIN_EMAIL || 'stylistiqfits4u@gmail.com').toLowerCase();
  const normalizedInputEmail = email.trim().toLowerCase();

  const isDev = Boolean(env?.DEV || (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production'));

  // 1. Try Supabase Auth if client is configured
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data?.user) {
      return { user: data.user, session: data.session, error: null };
    }
    
    // Only in local development mode: allow local admin fallback if Supabase Auth is unconfirmed or offline
    if (isDev && normalizedInputEmail === adminEmail && (password === 'admin123' || password === 'admin')) {
      try {
        localStorage.setItem(DEV_SESSION_KEY, JSON.stringify(MOCK_ADMIN_USER));
      } catch {}
      return { user: MOCK_ADMIN_USER, session: null, error: null };
    }

    if (error) {
      return { user: null, session: null, error: error.message };
    }
  }

  // 2. Local development fallback mode when Supabase client is not configured
  if (isDev && normalizedInputEmail === adminEmail && (password === 'admin123' || password === 'admin')) {
    try {
      localStorage.setItem(DEV_SESSION_KEY, JSON.stringify(MOCK_ADMIN_USER));
    } catch {}
    return { user: MOCK_ADMIN_USER, session: null, error: null };
  }

  return {
    user: null,
    session: null,
    error: 'Invalid email or password. Please verify your Supabase credentials.',
  };
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<{ error: string | null }> {
  try {
    localStorage.removeItem(DEV_SESSION_KEY);
  } catch {}

  if (supabase) {
    const { error } = await supabase.auth.signOut();
    return { error: error?.message ?? null };
  }
  return { error: null };
}

/**
 * Get the current authenticated user without a network request.
 * Checks Supabase session or cached local dev admin session.
 */
export async function getCurrentUser(): Promise<User | null> {
  if (supabase) {
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) return data.user;
    } catch {
      // ignore
    }
  }

  try {
    const local = localStorage.getItem(DEV_SESSION_KEY);
    if (local) return JSON.parse(local) as User;
  } catch {}

  return null;
}

/**
 * Subscribe to auth state changes.
 */
export function onAuthStateChange(
  callback: (user: User | null, session: Session | null) => void
): () => void {
  if (!supabase) {
    // Check if local dev session is present
    getCurrentUser().then((user) => callback(user, null));
    return () => {};
  }

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null, session);
  });

  return () => data.subscription.unsubscribe();
}

/**
 * Check whether the currently signed-in user is the admin.
 */
export function isAdminUser(user: User | null): boolean {
  const env = typeof import.meta !== 'undefined' && import.meta?.env ? import.meta.env : (typeof process !== 'undefined' ? process.env : {}) as any;
  const adminEmail = (env?.VITE_ADMIN_EMAIL || 'stylistiqfits4u@gmail.com').toLowerCase();
  return Boolean(user && user.email?.toLowerCase() === adminEmail);
}
