import { ArrowRight, Lock, Mail } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../store/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate();
  console.log('Login mounted');
  const location = useLocation()
  const { enableGuestMode } = useAuth()
  const from = location.state?.from?.pathname || '/'

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
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

  const handleGuest = () => {
    enableGuestMode()
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 bg-[#f9f9f9]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-outline-variant"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-neutral-500 text-sm">
            {isLogin
              ? 'Enter your details to access your trips'
              : 'Join Tripe to plan your next journey'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-700">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant focus:outline-none focus:ring-2 focus:ring-black transition-all bg-[#fcfcfc]"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant focus:outline-none focus:ring-2 focus:ring-black transition-all bg-[#fcfcfc]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-lg py-3.5 font-medium uppercase tracking-wider text-sm hover:bg-neutral-800 transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
          
          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-neutral-200"></div>
            <span className="flex-shrink-0 mx-4 text-neutral-400 text-xs font-bold uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-neutral-200"></div>
          </div>
          
          <button
            type="button"
            onClick={handleGuest}
            className="w-full bg-white text-black border border-outline-variant rounded-lg py-3.5 font-medium uppercase tracking-wider text-sm hover:bg-neutral-50 transition-colors flex justify-center items-center"
          >
            Continue as Guest
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-neutral-500">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-black font-semibold hover:underline"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

