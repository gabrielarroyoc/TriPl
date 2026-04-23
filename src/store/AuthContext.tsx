import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signOut: () => Promise<void>;
  loading: boolean;
  isGuest: boolean;
  enableGuestMode: () => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  signOut: async () => {},
  loading: true,
  isGuest: false,
  enableGuestMode: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem('guestMode') === 'true');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(() => {
      // In case of any startup API issues, just stop loading
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    if (isGuest) {
      setIsGuest(false);
      localStorage.removeItem('guestMode');
      return;
    }
    await supabase.auth.signOut();
  };

  const enableGuestMode = () => {
    setIsGuest(true);
    localStorage.setItem('guestMode', 'true');
  };

  const contextUser = isGuest ? { id: 'guest-user', email: 'guest@tripe.local' } as User : user;
  const contextSession = isGuest ? { user: contextUser, access_token: 'guest-token' } as Session : session;

  return (
    <AuthContext.Provider value={{ 
      session: contextSession, 
      user: contextUser, 
      signOut, 
      loading: isGuest ? false : loading,
      isGuest,
      enableGuestMode
    }}>
      {(!loading || isGuest) && children}
    </AuthContext.Provider>
  );
};
