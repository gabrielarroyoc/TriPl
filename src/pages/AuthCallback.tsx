import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { consumeOAuthRedirect, getOAuthErrorFromUrl } from '../lib/oauth'
import { isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../store/AuthContext'

export default function AuthCallback() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const oauthError = getOAuthErrorFromUrl()
    if (oauthError) {
      setError(decodeURIComponent(oauthError.replace(/\+/g, ' ')))
    }
  }, [])

  useEffect(() => {
    if (loading || error) return

    if (user) {
      navigate(consumeOAuthRedirect('/'), { replace: true })
      return
    }

    if (!isSupabaseConfigured) {
      setError(t('login.supabase_not_configured'))
    }
  }, [error, loading, navigate, t, user])

  useEffect(() => {
    if (loading || user || error) return

    const timeout = window.setTimeout(() => {
      setError(t('login.oauth_callback_timeout', 'Não foi possível concluir o login social. Tente novamente.'))
    }, 8000)

    return () => window.clearTimeout(timeout)
  }, [error, loading, t, user])

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-6">
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-50" />
      <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-surface/60 p-8 text-center backdrop-blur-md">
        {error ? (
          <>
            <h1 className="text-lg font-bold text-on-surface">{t('login.oauth_error_title', 'Falha no login social')}</h1>
            <p className="mt-3 text-sm text-outline">{error}</p>
            <Link
              to="/login"
              className="mt-6 inline-flex rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-primary/90"
            >
              {t('login.back_to_login', 'Voltar ao login')}
            </Link>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm font-medium text-on-surface">
              {t('login.oauth_completing', 'Concluindo autenticação...')}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
