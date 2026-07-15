import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Eye, EyeOff, Loader2, MapPin, Check, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useForm, type FieldErrors, type FieldValues, type Path, type UseFormRegister } from 'react-hook-form'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { GrainGradient } from '@paper-design/shaders-react'
import { useStaggerReveal, useTextSwap } from '../hooks/useAuthTransitions'
import { isSupabaseConfigured } from '../lib/supabase'
import { isGoogleOAuthEnabled, rememberOAuthRedirect } from '../lib/oauth'
import { useAuth } from '../store/AuthContext'
import { cn } from '../lib/utils'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
})

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  terms: z.boolean().refine(value => value, { message: 'Você precisa aceitar os termos' }),
})

type LoginFormValues = z.infer<typeof loginSchema>
type RegisterFormValues = z.infer<typeof registerSchema>

const partners = [
  { name: 'booking.com', style: 'font-sans font-bold italic' },
  { name: 'airbnb', style: 'font-sans font-extrabold tracking-tight' },
  { name: 'expedia', style: 'font-serif font-bold' },
  { name: 'skyscanner', style: 'font-sans font-medium text-[11px]' },
  { name: 'tripadvisor', style: 'font-serif italic font-extrabold' },
]

const inputClass =
  't-input-field w-full rounded-xl bg-white/5 py-3 px-4 text-sm text-on-surface placeholder:text-outline border border-white/10 shadow-sm focus:border-primary focus:ring-[3px] focus:ring-primary/20 transition-all outline-none backdrop-blur-sm cursor-text'

function getAuthErrorMessage(err: unknown, fallback: string) {
  const message = err instanceof Error ? err.message : fallback
  return /network|fetch/i.test(message) ? 'Não foi possível conectar ao Supabase.' : message
}

function useFieldErrorShake(error?: string) {
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!error || !wrapRef.current) return

    const field = wrapRef.current.querySelector<HTMLElement>('.t-input-field')
    if (!field) return

    wrapRef.current.classList.add('is-error')
    field.classList.add('is-error')
    field.classList.remove('is-shaking')
    void field.offsetWidth
    field.classList.add('is-shaking')

    const shakeMs = 280
    const timer = window.setTimeout(() => field.classList.remove('is-shaking'), shakeMs + 20)
    return () => window.clearTimeout(timer)
  }, [error])

  useEffect(() => {
    if (error) return
    wrapRef.current?.classList.remove('is-error')
    wrapRef.current?.querySelector('.t-input-field')?.classList.remove('is-error')
  }, [error])

  return wrapRef
}

function GradientPanel() {
  const panelRef = useStaggerReveal(true)
  const headlineRef = useStaggerReveal(true)
  const { t } = useTranslation()

  return (
    <div ref={panelRef} className="t-gradient-panel absolute inset-0 rounded-[28px] overflow-hidden shadow-2xl shadow-primary/20">
      <GrainGradient
        width="100%"
        height="100%"
        colors={['#1e60ff', '#ffffff', '#38bdf8', '#6366f1']}
        colorBack="#0a0f1e"
        softness={0.55}
        intensity={0.45}
        noise={0.2}
        shape="corners"
        speed={0.8}
        scale={1.1}
        rotation={0}
        offsetX={0}
        offsetY={0}
        style={{ position: 'absolute', inset: 0 }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 pointer-events-none" />

      <div className="absolute inset-0 flex flex-col justify-between p-10 text-white z-10">
        <div className="mt-4">
          <span className="t-gradient-badge inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur-md mb-6">
            <MapPin className="h-3 w-3 shrink-0" />
            {t('login.plan_better', 'Planeje melhor')}
          </span>
          <div ref={headlineRef} className="t-stagger">
            <h2 className="t-stagger-line t-stagger-line--1 text-[40px] font-bold leading-[1.08] tracking-tight">
              {t('login.explore_destinations', 'Explore novos destinos')}
              <br />
              <span className="font-serif italic font-normal text-white/85">{t('login.with_tripl', 'com TriPl')}</span>
            </h2>
          </div>
        </div>

        <div className="mb-2">
          <div className="flex items-center gap-6 mb-6">
            <div className="t-gradient-stat rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
              <p className="text-2xl font-bold leading-none">120+</p>
              <p className="text-[10px] text-white/50 uppercase tracking-wider mt-1">{t('login.destinations_stat', 'Destinos')}</p>
            </div>
            <div className="t-gradient-stat rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
              <p className="text-2xl font-bold leading-none">4.9</p>
              <p className="text-[10px] text-white/50 uppercase tracking-wider mt-1">{t('login.rating_stat', 'Avaliação')}</p>
            </div>
          </div>

          <p className="text-[10px] text-white/40 uppercase tracking-[0.15em] font-semibold mb-4">
            {t('login.trusted_brands', 'Marcas que confiam na gente')}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5">
            {partners.map(partner => (
              <span
                key={partner.name}
                className={cn('t-gradient-partner text-[12px] text-white/45 tracking-wide', partner.style)}
              >
                {partner.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function LanguageSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (val: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const options = [
    { value: 'pt', label: 'Português', flag: '🇧🇷' },
    { value: 'en', label: 'English', flag: '🇺🇸' },
  ]

  const currentOption = options.find((opt) => opt.value === value) || options[0]

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs font-semibold text-on-surface bg-white/5 border border-white/15 rounded-full px-3 py-1.5 outline-none cursor-pointer hover:bg-white/10 transition-all active:scale-[0.98] backdrop-blur-md select-none"
      >
        <span>{currentOption.flag}</span>
        <span>{currentOption.label}</span>
        <ChevronDown className={cn("w-3 h-3 text-outline transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-40 bg-[#0f172a]/95 border border-white/10 rounded-2xl shadow-2xl p-1.5 z-50 backdrop-blur-xl"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "flex items-center justify-between w-full text-left text-xs font-medium px-3 py-2 rounded-xl transition-colors cursor-pointer select-none",
                    isSelected
                      ? "bg-primary text-white font-semibold"
                      : "text-on-surface hover:bg-white/10"
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <span>{opt.flag}</span>
                    <span>{opt.label}</span>
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function AuthHeader({
  onToggle,
  toggleLabel,
  currentLanguage,
  onLanguageChange,
}: {
  onToggle: () => void
  toggleLabel: string
  currentLanguage: string
  onLanguageChange: (lang: string) => void
}) {
  return (
    <div className="flex justify-between items-center w-full">
      <Link to="/" className="flex items-center gap-2.5 group cursor-pointer">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-black text-sm shadow-lg shadow-primary/30"
        >
          T
        </motion.div>
        <span className="font-bold text-on-surface tracking-tight text-[15px]">TriPl</span>
      </Link>

      <div className="flex items-center gap-3">
        {/* Custom Language Selector Dropdown */}
        <LanguageSelect value={currentLanguage} onChange={onLanguageChange} />

        <button
          type="button"
          onClick={onToggle}
          className="t-auth-pill cursor-pointer text-xs font-semibold text-outline hover:text-on-surface flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 shadow-sm backdrop-blur-sm"
        >
          {toggleLabel}
          <ArrowRight className="t-auth-pill-arrow h-3 w-3" />
        </button>
      </div>
    </div>
  )
}

function AlertBanner({ error, configMessage }: { error: string | null; configMessage: string }) {
  if (error) {
    return (
      <div key={error} className="t-auth-alert mb-5 rounded-xl border border-red-500/30 bg-red-950/40 p-3.5 text-xs text-red-300 backdrop-blur-sm">
        {error}
      </div>
    )
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="t-auth-alert mb-5 rounded-xl border border-primary/30 bg-primary/10 p-3.5 text-xs text-on-primary-container backdrop-blur-sm">
        {configMessage}
      </div>
    )
  }

  return null
}

function AnimatedSubmitButton({
  loading,
  idleLabel,
  loadingLabel,
  disabled,
}: {
  loading: boolean
  idleLabel: string
  loadingLabel: string
  disabled?: boolean
}) {
  const label = loading ? loadingLabel : idleLabel
  const textRef = useTextSwap(label)

  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className={cn(
        't-auth-btn w-full bg-primary hover:bg-primary/90 disabled:bg-primary/40 text-white font-semibold py-3 px-4 rounded-xl text-sm mt-2 shadow-lg shadow-primary/25 inline-flex items-center justify-center gap-2 min-h-[46px]',
        loading && 'is-loading',
      )}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0 opacity-90" aria-hidden="true" />}
      {loading ? (
        <span className="t-shimmer" data-text={loadingLabel}>
          <span ref={textRef} className="t-text-swap">
            {loadingLabel}
          </span>
        </span>
      ) : (
        <span ref={textRef} className="t-text-swap">
          {idleLabel}
        </span>
      )}
    </button>
  )
}

function FieldGroup({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  const wrapRef = useFieldErrorShake(error)

  return (
    <div ref={wrapRef} className="t-input-wrap">
      <label className="block text-xs font-semibold text-on-surface/80 mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
      {error && <p className="t-error-msg mt-1.5 text-[11px] text-red-500">{error}</p>}
    </div>
  )
}

function PasswordInput<T extends FieldValues>({
  register,
  showPassword,
  setShowPassword,
  error,
  autoComplete = 'current-password',
}: {
  register: UseFormRegister<T>
  showPassword: boolean
  setShowPassword: (v: boolean) => void
  error?: string
  autoComplete?: string
}) {
  const wrapRef = useFieldErrorShake(error)

  return (
    <div ref={wrapRef} className="t-input-wrap">
      <div className="relative flex items-center">
        <input
          type={showPassword ? 'text' : 'password'}
          {...register('password' as Path<T>)}
          autoComplete={autoComplete}
          className={cn(inputClass, 'pl-4 pr-11')}
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="t-auth-icon-btn absolute right-3.5 text-outline hover:text-on-surface transition-colors"
          aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
        >
          <span className="t-icon-swap" data-state={showPassword ? 'b' : 'a'}>
            <span className="t-icon" data-icon="a">
              <Eye className="h-[18px] w-[18px]" />
            </span>
            <span className="t-icon" data-icon="b">
              <EyeOff className="h-[18px] w-[18px]" />
            </span>
          </span>
        </button>
      </div>
      {error && <p className="t-error-msg mt-1.5 text-[11px] text-red-500">{error}</p>}
    </div>
  )
}

function SocialButtons({
  disabled,
  redirectTo,
  onError,
}: {
  disabled?: boolean
  redirectTo: string
  onError: (message: string | null) => void
}) {
  const { t } = useTranslation()
  const { signInWithOAuth } = useAuth()
  const [oauthLoading, setOauthLoading] = useState(false)

  const googleEnabled = isSupabaseConfigured && isGoogleOAuthEnabled()

  const handleGoogle = async () => {
    if (!isSupabaseConfigured) {
      onError(t('login.supabase_not_configured'))
      return
    }

    if (!isGoogleOAuthEnabled()) {
      onError(
        t('login.oauth_provider_disabled', {
          provider: 'Google',
          defaultValue: '{{provider}} ainda não está habilitado. Configure no .env e no painel do Supabase.',
        }),
      )
      return
    }

    setOauthLoading(true)
    onError(null)

    try {
      rememberOAuthRedirect(redirectTo)
      await signInWithOAuth('google')
    } catch (err: unknown) {
      setOauthLoading(false)
      onError(getAuthErrorMessage(err, t('login.oauth_error', 'Erro ao iniciar login social.')))
    }
  }

  return (
    <>
      <div className="relative my-6 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <span className="relative bg-background px-4 text-[11px] font-semibold uppercase tracking-wider text-outline">
          {t('login.or_continue_with', 'ou continue com')}
        </span>
      </div>

      <button
        type="button"
        disabled={disabled || !googleEnabled || oauthLoading}
        onClick={handleGoogle}
        title={!googleEnabled ? t('login.oauth_setup_hint', 'Configure o provider no Supabase e VITE_OAUTH_GOOGLE_ENABLED') : undefined}
        className={cn(
          'flex w-full items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-white/10 bg-white/5 text-xs font-semibold transition-all',
          googleEnabled && !disabled && !oauthLoading
            ? 'text-on-surface hover:bg-white/10 hover:border-white/20 cursor-pointer'
            : 'text-outline cursor-not-allowed opacity-60',
        )}
      >
        {oauthLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.16 2.7 1.145 6.645l4.12 3.12z" />
            <path fill="#4285F4" d="M23.455 12.273c0-.818-.073-1.609-.209-2.373H12v4.509h6.427a5.5 5.5 0 0 1-2.386 3.609l3.718 2.882c2.173-2 3.427-4.945 3.427-8.627z" />
            <path fill="#34A853" d="M19.759 18.018a7.06 7.06 0 0 1-11.49-.918l-4.146 3.2C7.309 23.3 11.236 24 12 24c4.618 0 8.518-1.527 11.355-4.136l-3.596-1.846z" />
            <path fill="#FBBC05" d="M4.123 20.3a7.077 7.077 0 0 1-.368-2.209c0-.773.136-1.518.368-2.209l-4.12-3.12A11.948 11.948 0 0 0 0 12c0 2.227.609 4.318 1.677 6.136l4.146-3.2z" />
          </svg>
        )}
        Google
      </button>
    </>
  )
}

type AuthFormShellProps = {
  formKey: string
  toggleLabel: string
  title: string
  description: string
  configMessage: string
  error: string | null
  onToggle: () => void
  togglePrompt: string
  toggleAction: string
  children: ReactNode
  currentLanguage: string
  onLanguageChange: (lang: string) => void
  oauthRedirectTo: string
  onOAuthError: (message: string | null) => void
  oauthDisabled?: boolean
}

function AuthFormShell({
  formKey,
  toggleLabel,
  title,
  description,
  configMessage,
  error,
  onToggle,
  togglePrompt,
  toggleAction,
  children,
  currentLanguage,
  onLanguageChange,
  oauthRedirectTo,
  onOAuthError,
  oauthDisabled,
}: AuthFormShellProps) {
  const staggerRef = useStaggerReveal(formKey)

  return (
    <div className="flex flex-col h-full">
      <div className="px-10 pt-8 pb-4">
        <div className="mx-auto w-full max-w-[380px]">
          <AuthHeader
            onToggle={onToggle}
            toggleLabel={toggleLabel}
            currentLanguage={currentLanguage}
            onLanguageChange={onLanguageChange}
          />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-10 pb-8">
        <div className="w-full max-w-[380px]">
          <div ref={staggerRef} className="t-stagger mb-8">
            <h2 className="t-stagger-line t-stagger-line--1 text-2xl font-bold text-on-surface tracking-tight leading-tight">
              {title}
            </h2>
            <p className="t-stagger-line t-stagger-line--2 text-sm text-outline mt-2">{description}</p>
          </div>

          <AlertBanner error={error} configMessage={configMessage} />

          {children}

          <p className="mt-6 text-center text-xs text-outline">
            {togglePrompt}{' '}
            <button type="button" onClick={onToggle} className="t-auth-link cursor-pointer text-primary hover:text-primary/80 font-semibold">
              {toggleAction}
            </button>
          </p>

          <SocialButtons
            disabled={oauthDisabled}
            redirectTo={oauthRedirectTo}
            onError={onOAuthError}
          />
        </div>
      </div>
    </div>
  )
}

function LoginForm({
  onSubmit,
  register,
  errors,
  loading,
  error,
  showPassword,
  setShowPassword,
  onToggle,
  currentLanguage,
  onLanguageChange,
  oauthRedirectTo,
  onOAuthError,
}: {
  onSubmit: () => void
  register: UseFormRegister<LoginFormValues>
  errors: FieldErrors<LoginFormValues>
  loading: boolean
  error: string | null
  showPassword: boolean
  setShowPassword: (v: boolean) => void
  onToggle: () => void
  currentLanguage: string
  onLanguageChange: (lang: string) => void
  oauthRedirectTo: string
  onOAuthError: (message: string | null) => void
}) {
  const { t } = useTranslation()

  return (
    <AuthFormShell
      formKey="login"
      toggleLabel={t('login.sign_up_pill', 'Criar conta')}
      title={t('login.welcome', 'Bem-vindo de volta')}
      description={t('login.welcome_desc', 'Entre na sua conta para continuar planejando.')}
      configMessage={t('login.supabase_not_configured', 'Supabase não configurado. Adicione chaves de ambiente para liberar o login.')}
      error={error}
      onToggle={onToggle}
      togglePrompt={t('login.no_account', 'Não tem conta?')}
      toggleAction={t('login.sign_up', 'Cadastre-se')}
      currentLanguage={currentLanguage}
      onLanguageChange={onLanguageChange}
      oauthRedirectTo={oauthRedirectTo}
      onOAuthError={onOAuthError}
      oauthDisabled={loading}
    >
      <form onSubmit={onSubmit} method="POST" className="space-y-4">
        <FieldGroup label={t('login.email', 'Email')} error={errors.email?.message}>
          <input type="email" {...register('email')} autoComplete="email" className={inputClass} placeholder="voce@email.com" />
        </FieldGroup>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-semibold text-on-surface/80 uppercase tracking-wide">{t('login.password', 'Senha')}</label>
            <button
              type="button"
              className="text-xs font-semibold text-primary hover:text-primary/85 transition-colors cursor-pointer"
            >
              {t('login.forgot_password', 'Esqueceu a senha?')}
            </button>
          </div>
          <PasswordInput
            register={register}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            error={errors.password?.message}
            autoComplete="current-password"
          />
        </div>

        <AnimatedSubmitButton
          loading={loading}
          idleLabel={t('login.sign_in', 'Entrar')}
          loadingLabel={t('login.processing', 'Processando...')}
          disabled={!isSupabaseConfigured}
        />
      </form>
    </AuthFormShell>
  )
}

function RegisterForm({
  onSubmit,
  register,
  errors,
  loading,
  error,
  showPassword,
  setShowPassword,
  onToggle,
  currentLanguage,
  onLanguageChange,
  oauthRedirectTo,
  onOAuthError,
}: {
  onSubmit: () => void
  register: UseFormRegister<RegisterFormValues>
  errors: FieldErrors<RegisterFormValues>
  loading: boolean
  error: string | null
  showPassword: boolean
  setShowPassword: (v: boolean) => void
  onToggle: () => void
  currentLanguage: string
  onLanguageChange: (lang: string) => void
  oauthRedirectTo: string
  onOAuthError: (message: string | null) => void
}) {
  const { t } = useTranslation()
  const termsRef = useFieldErrorShake(errors.terms?.message)

  return (
    <AuthFormShell
      formKey="register"
      toggleLabel={t('login.has_account_pill', 'Já tenho conta')}
      title={t('login.create_account', 'Crie sua conta')}
      description={t('login.create_account_desc', 'Comece a planejar suas próximas viagens hoje.')}
      configMessage={t('login.supabase_not_configured', 'Supabase não configurado. Adicione chaves de ambiente para liberar o cadastro.')}
      error={error}
      onToggle={onToggle}
      togglePrompt={t('login.has_account', 'Já tem conta?')}
      toggleAction={t('login.sign_in', 'Entrar')}
      currentLanguage={currentLanguage}
      onLanguageChange={onLanguageChange}
      oauthRedirectTo={oauthRedirectTo}
      onOAuthError={onOAuthError}
      oauthDisabled={loading}
    >
      <form onSubmit={onSubmit} method="POST" className="space-y-4">
        <FieldGroup label={t('login.name', 'Nome')} error={errors.name?.message}>
          <input type="text" {...register('name')} autoComplete="name" className={inputClass} placeholder="Seu nome" />
        </FieldGroup>

        <FieldGroup label={t('login.email', 'Email')} error={errors.email?.message}>
          <input type="email" {...register('email')} autoComplete="email" className={inputClass} placeholder="voce@email.com" />
        </FieldGroup>

        <div>
          <label className="block text-xs font-semibold text-on-surface/80 mb-1.5 uppercase tracking-wide">{t('login.password', 'Senha')}</label>
          <PasswordInput
            register={register}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            error={errors.password?.message}
            autoComplete="new-password"
          />
        </div>

        <div ref={termsRef} className={cn('t-input-wrap', errors.terms && 'is-error')}>
          <div className="flex items-start text-xs text-outline pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                {...register('terms')}
                className="t-input-field mt-0.5 rounded border-white/20 text-primary focus:ring-primary/20 h-4 w-4"
              />
              <span>
                {t('login.agree_terms', 'Concordo com os Termos e Privacidade')}
              </span>
            </label>
          </div>
          {errors.terms && <p className="t-error-msg mt-1.5 text-[11px] text-red-500">{errors.terms.message}</p>}
        </div>

        <AnimatedSubmitButton
          loading={loading}
          idleLabel={t('login.sign_up_btn', 'Criar conta')}
          loadingLabel={t('login.processing', 'Processando...')}
          disabled={!isSupabaseConfigured}
        />
      </form>
    </AuthFormShell>
  )
}

type AuthFormCommonProps = {
  loading: boolean
  error: string | null
  showPassword: boolean
  setShowPassword: (v: boolean) => void
  onToggle: () => void
  currentLanguage: string
  onLanguageChange: (lang: string) => void
  oauthRedirectTo: string
  onOAuthError: (message: string | null) => void
}

function DesktopAuthLayout({
  isLogin,
  loginFormProps,
  registerFormProps,
}: {
  isLogin: boolean
  loginFormProps: AuthFormCommonProps & {
    onSubmit: () => void
    register: UseFormRegister<LoginFormValues>
    errors: FieldErrors<LoginFormValues>
  }
  registerFormProps: AuthFormCommonProps & {
    onSubmit: () => void
    register: UseFormRegister<RegisterFormValues>
    errors: FieldErrors<RegisterFormValues>
  }
}) {
  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-2 relative z-10">
      <div className="hidden md:block h-full">
        <AnimatePresence mode="wait">
          {!isLogin && (
            <motion.div
              key="register-form"
              initial={{ opacity: 0, x: 12, filter: 'blur(3px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -8, filter: 'blur(3px)' }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <RegisterForm {...registerFormProps} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-full md:block">
        <AnimatePresence mode="wait">
          {isLogin && (
            <motion.div
              key="login-form"
              initial={{ opacity: 0, x: -12, filter: 'blur(3px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: 8, filter: 'blur(3px)' }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <LoginForm {...loginFormProps} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function Login() {
  const { i18n } = useTranslation()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false)

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { terms: false },
  })

  const navigate = useNavigate()
  const location = useLocation()
  const { user, signInWithPassword, signUpWithPassword } = useAuth()
  const from = location.state?.from?.pathname || '/'
  const destination = from === '/login' ? '/' : from

  useEffect(() => {
    if (user) {
      navigate(destination, { replace: true })
    }
  }, [destination, navigate, user])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleToggle = () => {
    setError(null)
    setShowPassword(false)
    setIsLogin(!isLogin)
  }

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang)
  }

  const authCommonProps: AuthFormCommonProps = {
    loading,
    error,
    showPassword,
    setShowPassword,
    onToggle: handleToggle,
    currentLanguage: i18n.language,
    onLanguageChange: handleLanguageChange,
    oauthRedirectTo: destination,
    onOAuthError: setError,
  }

  const onLoginSubmit = async (data: LoginFormValues) => {
    if (!isSupabaseConfigured) {
      setError('Supabase não está configurado.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await signInWithPassword(data.email, data.password)
      navigate(destination, { replace: true })
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, 'Erro durante a autenticação.'))
    } finally {
      setLoading(false)
    }
  }

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    if (!isSupabaseConfigured) {
      setError('Supabase não está configurado.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const session = await signUpWithPassword(data.email, data.password, data.name)
      if (session) {
        navigate(destination, { replace: true })
        return
      }
      setError('Verifique seu e-mail para o link de confirmação.')
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, 'Erro durante o cadastro.'))
    } finally {
      setLoading(false)
    }
  }

  const loginFormProps = {
    ...authCommonProps,
    onSubmit: loginForm.handleSubmit(onLoginSubmit),
    register: loginForm.register,
    errors: loginForm.formState.errors,
  }

  const registerFormProps = {
    ...authCommonProps,
    onSubmit: registerForm.handleSubmit(onRegisterSubmit),
    register: registerForm.register,
    errors: registerForm.formState.errors,
  }

  return (
    <div className="h-screen bg-background overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/5 blur-[160px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid pointer-events-none" />

      {!isMobile ? (
        <>
          <div className="absolute inset-4 z-20 hidden md:block pointer-events-none">
            <motion.div
              className="absolute top-0 bottom-0 w-[calc(50%-8px)] pointer-events-auto"
              animate={{
                left: isLogin ? 0 : 'calc(50% + 8px)',
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 30 }}
            >
              <GradientPanel />
            </motion.div>
          </div>

          <DesktopAuthLayout
            isLogin={isLogin}
            loginFormProps={loginFormProps}
            registerFormProps={registerFormProps}
          />
        </>
      ) : (
        <div className="h-full absolute inset-0 z-30">
          <div className="t-page-slide h-full" data-page={isLogin ? 'login' : 'register'}>
            <div className="t-page h-full" data-page-id="login">
              <LoginForm {...loginFormProps} />
            </div>
            <div className="t-page h-full" data-page-id="register">
              <RegisterForm {...registerFormProps} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
