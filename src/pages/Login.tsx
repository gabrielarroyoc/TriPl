import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { z } from 'zod'
import { isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../store/AuthContext'

const authSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
})

type AuthFormValues = z.infer<typeof authSchema>

const partners = [
  { name: 'booking.com', style: 'font-sans font-bold italic' },
  { name: 'airbnb', style: 'font-sans font-extrabold tracking-tight text-[11px]' },
  { name: 'expedia', style: 'font-serif font-bold text-[13px]' },
  { name: 'skyscanner', style: 'font-sans font-medium text-[11px]' },
  { name: 'tripadvisor', style: 'font-serif italic font-extrabold text-[12px]' }
]

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
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

  const onSubmit = async (data: AuthFormValues) => {
    if (!isSupabaseConfigured) {
      setError('Supabase não está configurado. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY ao seu ambiente.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        await signInWithPassword(data.email, data.password)
      } else {
        const session = await signUpWithPassword(data.email, data.password)
        if (session) {
          navigate(destination, { replace: true })
          return
        }
        setError('Verifique seu e-mail para o link de confirmação se esta for uma nova conta.')
        setLoading(false)
        return
      }
      navigate(destination, { replace: true })
    } catch (err: any) {
      const message = err.message || 'Ocorreu um erro durante a autenticação.'
      const isNetworkError = message === 'Failed to fetch' || /network|fetch/i.test(message)

      setError(
        isNetworkError
          ? 'Não foi possível conectar ao Supabase. Verifique suas chaves de ambiente.'
          : message,
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center p-6 md:p-8 relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-[1360px] grid grid-cols-1 md:grid-cols-[1.3fr_0.7fr] gap-12 md:gap-16 items-center z-10"
      >
        {/* Left Column - Inspired Mesh Gradient Card */}
        <div 
          className="relative hidden md:flex w-full h-[calc(100vh-48px)] md:h-[calc(100vh-48px)] min-h-[640px] rounded-[32px] overflow-hidden flex-col justify-between p-12 text-white border border-white/5 shadow-xl"
          style={{
            background: `
              radial-gradient(circle at 15% 85%, rgba(0, 210, 255, 0.45) 0%, transparent 60%), 
              radial-gradient(circle at 85% 15%, rgba(30, 96, 255, 0.8) 0%, transparent 55%), 
              radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.35) 0%, transparent 65%), 
              #0c2d68
            `
          }}
        >
          {/* Top text branding */}
          <div>
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest pl-0.5">
              PLANEJE MELHOR
            </p>
            <h2 className="text-4xl font-extrabold leading-[1.15] tracking-tight mt-4">
              Explore novos <br />
              destinos <br />
              <span className="font-serif italic font-normal text-[#93c5fd]">com TriPl</span>
            </h2>
          </div>

          {/* Partner logos block */}
          <div className="mt-auto pl-0.5">
            <p className="text-[9px] text-white/40 uppercase tracking-widest font-semibold mb-4">
              Marcas que confiam na gente
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 opacity-40">
              {partners.map((partner, i) => (
                <span key={i} className={`text-white tracking-wider lowercase ${partner.style}`}>
                  {partner.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Form Container */}
        <div className="flex flex-col w-full max-w-[380px] mx-auto text-left p-2 sm:p-0">
          {/* Header Row: Logo & Top Right Action */}
          <div className="flex justify-between items-center mb-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-black text-sm shadow-md shadow-primary/10">
                T
              </div>
              <span className="font-extrabold text-[#0c2540] tracking-wider text-base">tripl</span>
            </div>
            <Link
              to="/explore"
              className="text-xs font-semibold text-[#8c9ba5] hover:text-[#0c2540] transition-colors flex items-center gap-1"
            >
              Explorar destinos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Titles */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#0c2540] tracking-tight">
              {isLogin ? 'Bem-vindo de volta' : 'Criar conta'}
            </h2>
            <p className="text-xs text-[#8c9ba5] font-medium mt-1">
              {isLogin ? 'Entre na sua conta para continuar.' : 'Crie sua conta para começar.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-600">
              {error}
            </div>
          )}

          {!isSupabaseConfigured && !error && (
            <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-600">
              Supabase não configurado. Adicione chaves de ambiente para liberar o login.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* E-mail Field */}
            <div>
              <label className="block text-xs font-bold text-[#0c2540] mb-2">
                Email
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full bg-[#eef2f6] rounded-xl py-3.5 px-4 text-xs text-[#0c2540] placeholder:text-[#a0aec0] border border-transparent focus:border-[#70b5ff]/50 focus:bg-white focus:ring-1 focus:ring-[#70b5ff]/20 transition-all outline-none"
                placeholder="m@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-[11px] text-red-500 pl-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-[#0c2540]">
                  Senha
                </label>
                <button
                  type="button"
                  className="text-xs font-semibold text-[#1e60ff] hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register('password')}
                  className="w-full bg-[#eef2f6] rounded-xl py-3.5 pl-4 pr-12 text-xs text-[#0c2540] placeholder:text-[#a0aec0] border border-transparent focus:border-[#70b5ff]/50 focus:bg-white focus:ring-1 focus:ring-[#70b5ff]/20 transition-all outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-[#a0aec0] hover:text-[#0c2540] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-[11px] text-red-500 pl-1">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me checkbox */}
            <div className="flex items-center text-xs text-[#8c9ba5] font-medium pt-1">
              <label className="flex items-center gap-2 hover:text-[#0c2540] cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded border-[#cbd5e1] text-primary focus:ring-primary h-4 w-4"
                />
                <span>Lembrar-me</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isSupabaseConfigured}
              className="w-full bg-[#1e60ff] hover:bg-[#1a56db] disabled:bg-[#1e60ff]/50 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 mt-6 text-sm shadow-md shadow-[#1e60ff]/10"
            >
              {loading ? 'Processando...' : isLogin ? 'Entrar' : 'Cadastrar'}
            </button>
          </form>

          {/* Toggle Register / Login */}
          <div className="mt-6 text-center text-xs text-[#8c9ba5] font-medium">
            {isLogin ? "Não tem conta? " : 'Já tem conta? '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#1e60ff] hover:underline font-semibold"
            >
              {isLogin ? 'Cadastre-se' : 'Entrar'}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#cbd5e1]/40" />
            </div>
            <span className="relative bg-[#f4f6f9] px-3 text-[9px] font-bold text-[#8c9ba5] tracking-widest">
              OU
            </span>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-xs font-semibold text-[#0c2540]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.16 2.7 1.145 6.645l4.12 3.12z"
                />
                <path
                  fill="#4285F4"
                  d="M23.455 12.273c0-.818-.073-1.609-.209-2.373H12v4.509h6.427a5.5 5.5 0 0 1-2.386 3.609l3.718 2.882c2.173-2 3.427-4.945 3.427-8.627z"
                />
                <path
                  fill="#34A853"
                  d="M19.759 18.018a7.06 7.06 0 0 1-11.49-.918l-4.146 3.2C7.309 23.3 11.236 24 12 24c4.618 0 8.518-1.527 11.355-4.136l-3.596-1.846z"
                />
                <path
                  fill="#FBBC05"
                  d="M4.123 20.3a7.077 7.077 0 0 1-.368-2.209c0-.773.136-1.518.368-2.209l-4.12-3.12A11.948 11.948 0 0 0 0 12c0 2.227.609 4.318 1.677 6.136l4.146-3.2z"
                />
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-xs font-semibold text-[#0c2540]"
            >
              <svg className="w-4 h-4 fill-[#0c2540]" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.83-.98 2.94 1.07.08 2.16-.52 2.81-1.33z" />
              </svg>
              Apple
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
