import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import {
  clearLocalAuthSession,
  clearSupabaseAuthStorage,
  getLocalAuthSession,
  startLocalAuthSession,
  supabase,
} from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signOut: () => Promise<void>;
  signInLocal: (email: string) => Session;
  signInWithPassword: (email: string, password: string) => Promise<Session | null>;
  signUpWithPassword: (email: string, password: string) => Promise<Session | null>;
  loading: boolean;
  isLocalSession: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  signOut: async () => {},
  signInLocal: () => null as unknown as Session,
  signInWithPassword: async () => null,
  signUpWithPassword: async () => null,
  loading: true,
  isLocalSession: false,
});

export const useAuth = () => useContext(AuthContext);

type AuthSource = 'local' | 'supabase' | null;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocalSession, setIsLocalSession] = useState(false);
  const authSourceRef = useRef<AuthSource>(null);

  const applyAuthState = (nextSession: Session | null, source: AuthSource) => {
    authSourceRef.current = nextSession ? source : null;
    setSession(nextSession);
    setUser(nextSession?.user ?? null);
    setIsLocalSession(Boolean(nextSession && source === 'local'));
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    const setAuthState = (nextSession: Session | null, source: AuthSource) => {
      if (!isMounted) return;

      if (authSourceRef.current === 'local' && source !== 'local') {
        return;
      }

      applyAuthState(nextSession, source);
    };

    const localSession = getLocalAuthSession();
    if (localSession) {
      setAuthState(localSession, 'local');
      return () => {
        isMounted = false;
      };
    }

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
        setAuthState(session, session ? 'supabase' : null);
      } catch (error) {
        console.warn('Supabase session could not be restored. Starting in guest mode.', error);
        clearSupabaseAuthStorage();
        setAuthState(null, null);
      }

      if (!isMounted) return;

      const { data } = supabase!.auth.onAuthStateChange((_event, session) => {
        setAuthState(session, session ? 'supabase' : null);
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
    clearLocalAuthSession();

    if (!supabase) {
      clearSupabaseAuthStorage();
      applyAuthState(null, null);
      return;
    }

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn('Supabase sign out failed. Clearing local session instead.', error);
    } finally {
      clearSupabaseAuthStorage();
      applyAuthState(null, null);
    }
  };

  const signInLocal = (email: string) => {
    clearSupabaseAuthStorage();
    const localSession = startLocalAuthSession(email);
    applyAuthState(localSession, 'local');
    return localSession;
  };

  const signInWithPassword = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    authSourceRef.current = null;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    clearLocalAuthSession();
    applyAuthState(data.session, data.session ? 'supabase' : null);
    return data.session;
  };

  const signUpWithPassword = async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }

    authSourceRef.current = null;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.session) {
      clearLocalAuthSession();
      applyAuthState(data.session, 'supabase');
    }

    return data.session;
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        signOut,
        signInLocal,
        signInWithPassword,
        signUpWithPassword,
        loading,
        isLocalSession,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
