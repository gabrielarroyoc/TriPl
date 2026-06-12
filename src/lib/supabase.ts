import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

const SESSION_EXPIRY_MARGIN_MS = 60_000;

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
