import { Globe, Menu, User, X, Moon, Sun, MapPin } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Link,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import Account from './pages/Account'
import DestinationDetails from './pages/DestinationDetails'
import Explore from './pages/Explore'
import Home from './pages/Home'
import Login from './pages/Login'
import MyDestinations from './pages/MyDestinations'
import Planner from './pages/Planner'
import { AuthProvider, useAuth } from './store/AuthContext'
import { ToastContainer } from './components/ToastContainer'
import { useUIStore } from './store/useStore'
import { useToastStore } from './store/useToastStore'
import { useEffect, useRef } from 'react'
import { supabase } from './lib/supabase'
import { LowCortisolIcon } from './components/Icons'
import { cn } from './lib/utils'
import { Button } from './components/ui'
import { LiquidGlass } from './components/LiquidGlass'

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const { isDarkMode, toggleDarkMode } = useUIStore()

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'pt' : 'en')
  }

  const navLinks = [
    { name: t('nav.explore'), path: '/explore' },
    { name: t('nav.planner'), path: '/planner' },
    { name: t('nav.destinations'), path: '/destinations' },
  ]

  const isHomePage = location.pathname === '/'

  return (
    <nav className="fixed top-4 left-0 w-full z-50 px-6 md:px-12 pointer-events-none">
      <LiquidGlass
        refractionStrength={25}
        frostedIntensity={24}
        tintColor="rgba(255, 255, 255, 0.08)"
        className="max-w-7xl mx-auto border border-white/20 shadow-2xl pointer-events-auto"
      >
        <div className="flex justify-between items-center h-16 px-6 md:px-8">
          <Link to="/" className="text-2xl font-bold tracking-tight text-white transition-colors">
            TriPl
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => {
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "font-semibold tracking-wider text-xs transition-all duration-200 uppercase",
                    isActive
                      ? "text-white border-b-2 border-white pb-0.5"
                      : "text-white/70 hover:text-white"
                  )}
                >
                  {link.name}
                </Link>
              )
            })}

            <div className="w-px h-4 mx-1 bg-white/20 transition-colors" />

            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 font-semibold tracking-wider text-xs text-white/80 hover:text-white transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              {i18n.language === 'en' ? 'PT' : 'EN'}
            </button>

            {user ? (
              <ProfileDropdown />
            ) : (
              <Link
                to="/login"
                className="bg-white/15 text-white border border-white/30 font-bold uppercase tracking-wider text-xs px-4 py-2 rounded-lg hover:bg-white/25 transition-all active:scale-[0.98] shrink-0"
              >
                {t('nav.login')}
              </Link>
            )}
          </div>

          {/* Mobile Hamburguer */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-white hover:bg-white/10 transition-colors"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </LiquidGlass>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-surface border-b border-outline-variant p-6 space-y-6 pointer-events-auto"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map(link => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block text-lg font-medium text-on-surface hover:text-primary"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <hr className="border-outline-variant" />

            <div className="space-y-6">
              <div>
                <button
                  onClick={() => {
                    toggleLanguage()
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-primary-container font-medium uppercase tracking-wider text-xs text-on-primary-container hover:bg-primary hover:text-white transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  {i18n.language === 'en' ? 'PT' : 'EN'}
                </button>
              </div>

              <div className="flex justify-between items-center">
                {user ? (
                  <Link
                    to="/account"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 font-medium text-on-surface hover:text-primary"
                  >
                    <User className="w-5 h-5" />
                    {t('nav.account')}
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full bg-primary text-white px-6 py-3 rounded-lg font-medium uppercase tracking-wider text-sm text-center hover:bg-on-primary-container transition-colors"
                  >
                    {t('nav.login')}
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, signOut } = useAuth()
  const { t } = useTranslation()
  const { addToast } = useToastStore()
  const [badges, setBadges] = useState<string[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const badgeWarningShownRef = useRef(false)

  useEffect(() => {
    if (user && isOpen && supabase) {
      const fetchBadges = async () => {
        try {
          const { data } = await supabase.from('profiles').select('badges').eq('id', user.id).single()
          if (data?.badges) setBadges(data.badges)
          badgeWarningShownRef.current = false
        } catch (e) {
          console.error(e)
          if (!badgeWarningShownRef.current) {
            addToast(t('account.badges_load_error', 'Could not load your badges right now.'), 'warning')
            badgeWarningShownRef.current = true
          }
        }
      }
      fetchBadges()
    }
  }, [addToast, t, user, isOpen])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-lg bg-primary-container border border-primary/20 flex items-center justify-center hover:bg-primary hover:text-white transition-colors overflow-hidden"
        aria-label="Open profile menu"
      >
        <User className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-4 w-72 bg-surface border border-outline-variant rounded-lg shadow-2xl p-4 z-50"
          >
            <div className="px-2 py-3 mb-4 border-b border-outline-variant">
              <p className="text-sm font-bold text-on-surface truncate">{user?.email}</p>
              <p className="text-[10px] text-primary uppercase tracking-widest mt-0.5">
                Explorer Level 1
              </p>
            </div>

            <div className="space-y-4">
              {/* Badges Section */}
              <div>
                <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-3 px-2">
                  My Badges
                </p>
                <div className="flex flex-wrap gap-2 px-2">
                  {badges.length > 0 ? (
                    badges.map(badge => (
                    <div key={badge} className="p-2 bg-primary-container rounded-lg border border-primary/20 group relative transition-all hover:scale-105" title={badge}>
                        <LowCortisolIcon className="w-6 h-6 text-primary" />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                          {badge}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="w-full py-4 border border-dashed border-outline-variant rounded-lg flex items-center justify-center opacity-40">
                       <LowCortisolIcon className="w-6 h-6 text-primary" />
                    </div>
                  )}
                </div>
              </div>

              {/* Links */}
              <div className="space-y-1">
                <Link
                  to="/planner"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors text-sm font-medium text-on-surface"
                >
                  <Globe className="w-4 h-4 text-outline" />
                  My Trips
                </Link>
                <div
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg opacity-40 cursor-not-allowed text-sm font-medium text-outline"
                >
                  <MapPin className="w-4 h-4 text-outline" />
                  Saved Destinations
                </div>
                <Link
                  to="/account"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors text-sm font-medium text-on-surface"
                >
                  <User className="w-4 h-4 text-outline" />
                  Settings
                </Link>
              </div>

              <button
                onClick={() => {
                  signOut()
                  setIsOpen(false)
                }}
                className="w-full mt-2 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-widest hover:bg-red-100 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Footer() {
  return (
    <footer className="w-full border-t border-outline-variant bg-surface transition-colors duration-300 py-10 px-6 md:px-12 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-lg font-bold text-primary">TriPl</div>
        <div className="flex gap-8">
          <a
            href="#"
            className="text-xs text-outline hover:text-primary underline underline-offset-4 transition-colors"
          >
            Terms
          </a>
          <a
            href="#"
            className="text-xs text-outline hover:text-primary underline underline-offset-4 transition-colors"
          >
            Privacy
          </a>
          <a
            href="#"
            className="text-xs text-outline hover:text-primary underline underline-offset-4 transition-colors"
          >
            Support
          </a>
        </div>
        <p className="text-xs text-outline">
          © 2026 TriPl. Designed for the organized traveler.
        </p>
      </div>
    </footer>
  )
}

function AppContent() {
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  const isLoginPage = location.pathname === '/login'

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300">
      {!isLoginPage && <Navbar />}
      <ToastContainer />
      <main className={cn("flex-grow", isHomePage || isLoginPage ? "pt-0" : "pt-24")}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/explore"
            element={
              <ProtectedRoute>
                <Explore />
              </ProtectedRoute>
            }
          />
          <Route
            path="/planner"
            element={<Planner />}
          />
          <Route
            path="/destinations"
            element={
              <ProtectedRoute>
                <MyDestinations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/destination/:id"
            element={
              <ProtectedRoute>
                <DestinationDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {!isLoginPage && <Footer />}
    </div>
  )
}

export default function App() {
  const { isDarkMode } = useUIStore()

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}
