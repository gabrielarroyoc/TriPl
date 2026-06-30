import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Lock, Mail } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Badge, Button, Card } from '../components/ui'
import { isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../store/AuthContext'

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type AuthFormValues = z.infer<typeof authSchema>

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.')
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
        setError('Please check your email for the verification link if this is a new account.')
        setLoading(false)
        return
      }
      navigate(destination, { replace: true })
    } catch (err: any) {
      const message = err.message || 'An error occurred during authentication.'
      const isNetworkError = message === 'Failed to fetch' || /network|fetch/i.test(message)

      setError(
        isNetworkError
          ? 'Could not reach the configured Supabase project. Check that VITE_SUPABASE_URL points to an active project.'
          : message,
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-lg border border-outline-variant bg-surface shadow-xl md:grid-cols-[0.95fr_1.05fr]"
      >
        <div className="hidden bg-primary p-8 text-white md:flex md:flex-col md:justify-between">
          <Badge className="w-fit border-white/20 bg-white/15 text-white">TriPl</Badge>
          <div>
            <h1 className="text-4xl font-bold leading-tight">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/75">
              {isLogin
                ? 'Enter your details to access your trips.'
                : 'Join TriPl to plan your next journey.'}
            </p>
          </div>
          <p className="text-label-sm text-white/60">Travel planning</p>
        </div>

        <Card className="rounded-none border-0 p-6 shadow-none md:p-10">
          <div className="mb-8 md:hidden">
            <Badge>TriPl</Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-on-surface">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          {!isSupabaseConfigured && !error && (
            <div className="mb-6 rounded-lg border border-primary/20 bg-primary-container p-4 text-sm text-on-primary-container">
              Supabase is not configured. Add your Supabase URL and anon key to enable authentication.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-on-surface">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
                <input
                  type="email"
                  {...register('email')}
                  className={`w-full rounded-lg border bg-background py-3 pl-10 pr-4 text-on-surface transition-all focus:border-primary ${
                    errors.email ? 'border-red-500' : 'border-outline-variant'
                  }`}
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-on-surface">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
                <input
                  type="password"
                  {...register('password')}
                  className={`w-full rounded-lg border bg-background py-3 pl-10 pr-4 text-on-surface transition-all focus:border-primary ${
                    errors.password ? 'border-red-500' : 'border-outline-variant'
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || !isSupabaseConfigured}
              className="w-full"
              size="lg"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In with Supabase' : 'Sign Up with Supabase'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-outline">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold text-primary hover:underline"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
