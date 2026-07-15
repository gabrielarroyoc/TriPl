export type OAuthProvider = 'google'

const OAUTH_REDIRECT_KEY = 'tripl_oauth_redirect'

export function isGoogleOAuthEnabled(): boolean {
  const value = import.meta.env.VITE_OAUTH_GOOGLE_ENABLED

  // Default enabled so the button works as soon as Google is set up in Supabase.
  if (value === undefined || value === '') return true
  return value === 'true' || value === '1'
}

export function getOAuthRedirectTo(): string {
  const configured = import.meta.env.VITE_OAUTH_REDIRECT_URL?.trim()
  if (configured) return configured
  return `${window.location.origin}/auth/callback`
}

export function rememberOAuthRedirect(path: string) {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(OAUTH_REDIRECT_KEY, path)
}

export function consumeOAuthRedirect(fallback = '/'): string {
  if (typeof window === 'undefined') return fallback

  const stored = window.sessionStorage.getItem(OAUTH_REDIRECT_KEY)
  window.sessionStorage.removeItem(OAUTH_REDIRECT_KEY)

  if (!stored || stored === '/login' || stored === '/auth/callback') {
    return fallback
  }

  return stored
}

export function getOAuthErrorFromUrl(): string | null {
  if (typeof window === 'undefined') return null

  const search = new URLSearchParams(window.location.search)
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))

  return (
    search.get('error_description') ||
    search.get('error') ||
    hash.get('error_description') ||
    hash.get('error')
  )
}
