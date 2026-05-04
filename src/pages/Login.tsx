import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Lock, Mail } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
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
  const from = location.state?.from?.pathname || '/'

  const onSubmit = async (data: AuthFormValues) => {
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        })
        if (error) throw error
        // Optionally show a message to check their email for verification.
        setError(
          'Please check your email for the verification link if this is a new account.',
        )
        setLoading(false)
        return
      }
      navigate(from, { replace: true })
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface p-8 rounded-2xl shadow-xl border border-outline-variant"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-2 text-on-surface">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            {isLogin
              ? 'Enter your details to access your trips'
              : 'Join TriPl to plan your next journey'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm mb-6 border border-red-100 dark:border-red-900/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-on-surface">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="email"
                {...register('email')}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-on-surface transition-all bg-background text-on-surface ${
                  errors.email ? 'border-red-500' : 'border-outline-variant'
                }`}
                placeholder="name@example.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-on-surface">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="password"
                {...register('password')}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-on-surface transition-all bg-background text-on-surface ${
                  errors.password ? 'border-red-500' : 'border-outline-variant'
                }`}
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-on-surface text-surface rounded-lg py-3.5 font-medium uppercase tracking-wider text-sm hover:opacity-80 transition-opacity flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-on-surface font-semibold hover:underline"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

