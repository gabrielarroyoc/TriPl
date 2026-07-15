import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import {
  getOAuthRedirectTo,
  type OAuthProvider,
} from '../lib/oauth';
import {
  clearSupabaseAuthStorage,
  supabase,
} from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signOut: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<Session | null>;
  signUpWithPassword: (email: string, password: string, name?: string) => Promise<Session | null>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  signOut: async () => {},
  signInWithPassword: async () => null,
  signUpWithPassword: async () => null,
  signInWithOAuth: async () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const applyAuthState = (nextSession: Session | null) => {
    setSession(nextSession);
    setUser(nextSession?.user ?? null);
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    const setAuthState = (nextSession: Session | null) => {
      if (!isMounted) return;
      applyAuthState(nextSession);
    };

    if (!supabase) {
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    async function initializeAuth() {
      try {
        const {
          data: { session },
          error,
        } = await supabase!.auth.getSession();

        if (error) throw error;
        setAuthState(session);
      } catch (error) {
        console.warn('Supabase session could not be restored.', error);
        clearSupabaseAuthStorage();
        setAuthState(null);
      }

      if (!isMounted) return;

      const { data } = supabase!.auth.onAuthStateChange((_event, session) => {
        setAuthState(session);
      });

      unsubscribe = () => data.subscription.unsubscribe();
    }

    initializeAuth();

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, []);

  const signOut = async () => {
    if (!supabase) {
      clearSupabaseAuthStorage();
      applyAuthState(null);
      return;
    }

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn('Supabase sign out failed. Clearing local session instead.', error);
    } finally {
      clearSupabaseAuthStorage();
      applyAuthState(null);
    }
  };

  const signInWithPassword = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    applyAuthState(data.session);
    return data.session;
  };

  const signUpWithPassword = async (email: string, password: string, name?: string) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: name ? { data: { full_name: name } } : undefined,
    });

    if (error) throw error;

    if (data.session) {
      applyAuthState(data.session);
    }

    return data.session;
  };

  const signInWithOAuth = async (provider: OAuthProvider) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: getOAuthRedirectTo(),
        queryParams:
          provider === 'google'
            ? {
                access_type: 'offline',
                prompt: 'consent',
              }
            : undefined,
      },
    });

    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        signOut,
        signInWithPassword,
        signUpWithPassword,
        signInWithOAuth,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
