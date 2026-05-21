import { createClient, type Session, type SupabaseClient, type User } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

const SESSION_EXPIRY_MARGIN_MS = 60_000;
const LOCAL_AUTH_STORAGE_KEY = 'tripe-local-auth-session';

function getSupabaseUrl(url: string) {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

const parsedSupabaseUrl = getSupabaseUrl(supabaseUrl);
const authStorageKey = parsedSupabaseUrl
  ? `sb-${parsedSupabaseUrl.hostname.split('.')[0]}-auth-token`
  : null;

export const isSupabaseConfigured = Boolean(parsedSupabaseUrl && supabaseAnonKey);

export function clearSupabaseAuthStorage() {
  if (!authStorageKey || typeof window === 'undefined') return;

  window.localStorage.removeItem(authStorageKey);
  window.localStorage.removeItem(`${authStorageKey}-code-verifier`);
  window.localStorage.removeItem(`${authStorageKey}-user`);
}

export function clearLocalAuthSession() {
  if (typeof window === 'undefined') return;

  window.localStorage.removeItem(LOCAL_AUTH_STORAGE_KEY);
}

export function getLocalAuthSession(): Session | null {
  if (typeof window === 'undefined') return null;

  const rawSession = window.localStorage.getItem(LOCAL_AUTH_STORAGE_KEY);
  if (!rawSession) return null;

  try {
    return JSON.parse(rawSession) as Session;
  } catch {
    clearLocalAuthSession();
    return null;
  }
}

export function startLocalAuthSession(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const now = Math.floor(Date.now() / 1000);
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `local-${Date.now()}`;

  const user = {
    id,
    aud: 'authenticated',
    role: 'authenticated',
    email: normalizedEmail,
    app_metadata: { provider: 'local', providers: ['local'] },
    user_metadata: { name: normalizedEmail.split('@')[0] },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as User;

  const session = {
    access_token: `local-${id}`,
    refresh_token: `local-refresh-${id}`,
    expires_in: 60 * 60 * 24 * 365,
    expires_at: now + 60 * 60 * 24 * 365,
    token_type: 'bearer',
    user,
  } as Session;

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(session));
  }

  return session;
}

function readStoredSession(): Session | null {
  if (!authStorageKey || typeof window === 'undefined') return null;

  const rawSession = window.localStorage.getItem(authStorageKey);
  if (!rawSession) return null;

  try {
    return JSON.parse(rawSession) as Session;
  } catch {
    clearSupabaseAuthStorage();
    return null;
  }
}

function clearExpiredStoredSession() {
  const storedSession = readStoredSession();
  if (!storedSession?.expires_at) return;

  const expiresSoon =
    storedSession.expires_at * 1000 - Date.now() < SESSION_EXPIRY_MARGIN_MS;

  if (expiresSoon) {
    clearSupabaseAuthStorage();
  }
}

clearExpiredStoredSession();

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;
