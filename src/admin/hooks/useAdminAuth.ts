import { useState, useEffect, useCallback } from 'react';
import { signIn, signOut, getCurrentUser, onAuthStateChange, isAdminUser } from '../../lib/auth';
import type { User } from '../../lib/auth';

interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

interface AdminAuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook that manages admin authentication state.
 * Subscribes to Supabase Auth events and checks whether
 * the signed-in user has the admin email.
 *
 * Security note: isAdminUser() here is only a UX helper.
 * Actual write protection is enforced by Supabase RLS policies.
 */
export function useAdminAuth(): AdminAuthState & AdminAuthActions {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Bootstrap — check for existing session
    getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });

    // Subscribe to future auth events
    const unsubscribe = onAuthStateChange((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const { user: authUser, error: authError } = await signIn(email, password);

    if (authError) {
      setError(authError);
      setLoading(false);
      return false;
    }

    if (!authUser || !isAdminUser(authUser)) {
      await signOut(); // sign out non-admin immediately
      setError('Access denied. This account does not have admin privileges.');
      setUser(null);
      setLoading(false);
      return false;
    }

    setUser(authUser);
    setLoading(false);
    return true;
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    await signOut();
    setUser(null);
    setLoading(false);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    user,
    isAdmin: isAdminUser(user),
    loading,
    error,
    login,
    logout,
    clearError,
  };
}
