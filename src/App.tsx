import { Globe, Menu, User, X, Moon, Sun } from 'lucide-react'
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
import Planner from './pages/Planner'
import { AuthProvider, useAuth } from './store/AuthContext'
import { ToastContainer } from './components/ToastContainer'
import { useUIStore } from './store/useStore'
import { useEffect, useRef } from 'react'
import { supabase } from './lib/supabase'
import { LowCortisolIcon } from './components/Icons'
import { cn } from './lib/utils'

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
  ]

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-outline-variant bg-surface/80 dark:bg-black/50 backdrop-blur-xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center h-20 px-6 md:px-12">
        <Link to="/" className="text-2xl font-bold tracking-tighter text-on-surface">
          Tripe
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link
              key={link.name}
              to={link.path}
              className={`font-medium uppercase tracking-wider text-sm transition-all duration-200 ${
                location.pathname === link.path
                  ? 'text-on-surface border-b-2 border-on-surface pb-1'
                  : 'text-neutral-500 hover:text-on-surface'
              }`}
            >
              {link.name}
            </Link>
          ))}

          <div className="w-px h-6 bg-outline-variant mx-2"></div>

          <button
            onClick={toggleDarkMode}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-neutral-400" /> : <Moon className="w-5 h-5 text-neutral-600" />}
          </button>

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 font-medium uppercase tracking-wider text-sm text-neutral-500 hover:text-on-surface transition-colors"
          >
            <Globe className="w-4 h-4" />
            {i18n.language === 'en' ? 'PT' : 'EN'}
          </button>

          {user ? (
            <ProfileDropdown />
          ) : (
            <Link
              to="/login"
              className="bg-on-surface text-surface px-5 py-2.5 rounded-full font-medium uppercase tracking-wider text-xs hover:opacity-80 transition-colors"
            >
              {t('nav.login')}
            </Link>
          )}
        </div>

        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-surface border-b border-outline-variant p-6 space-y-6"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map(link => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block text-lg font-medium text-on-surface hover:opacity-80"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <hr className="border-outline-variant" />

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    toggleLanguage()
                    setIsOpen(false)
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 font-medium uppercase tracking-wider text-xs text-neutral-500 hover:text-on-surface transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  {i18n.language === 'en' ? 'PT' : 'EN'}
                </button>

                <button
                  onClick={() => {
                    toggleDarkMode()
                    setIsOpen(false)
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 font-medium uppercase tracking-wider text-xs text-neutral-500 hover:text-on-surface transition-colors"
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {isDarkMode ? 'Light' : 'Dark'}
                </button>
              </div>

              <div className="flex justify-between items-center">
                {user ? (
                  <Link
                    to="/account"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 font-medium text-on-surface"
                  >
                    <User className="w-5 h-5" />
                    {t('nav.account')}
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full bg-on-surface text-surface px-6 py-3 rounded-xl font-medium uppercase tracking-wider text-sm text-center hover:opacity-80 transition-opacity"
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
  const [badges, setBadges] = useState<string[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user && isOpen) {
      const fetchBadges = async () => {
        try {
          const { data } = await supabase.from('profiles').select('badges').eq('id', user.id).single()
          if (data?.badges) setBadges(data.badges)
        } catch (e) {
          console.error(e)
        }
      }
      fetchBadges()
    }
  }, [user, isOpen])

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
        className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-outline-variant flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors overflow-hidden"
      >
        <User className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-4 w-72 bg-surface dark:bg-neutral-900 border border-outline-variant rounded-2xl shadow-2xl p-4 z-50"
          >
            <div className="px-2 py-3 mb-4 border-b border-outline-variant">
              <p className="text-sm font-bold text-on-surface truncate">{user?.email}</p>
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-0.5">Explorer Level 1</p>
            </div>

            <div className="space-y-4">
              {/* Badges Section */}
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3 px-2">
                  My Badges
                </p>
                <div className="flex flex-wrap gap-2 px-2">
                  {badges.length > 0 ? (
                    badges.map(badge => (
                      <div key={badge} className="p-2 bg-primary/10 rounded-xl border border-primary/20 group relative transition-all hover:scale-110" title={badge}>
                        <LowCortisolIcon className="w-6 h-6 text-primary" />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                          {badge}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="w-full py-4 border border-dashed border-outline-variant rounded-xl flex items-center justify-center grayscale opacity-30">
                       <LowCortisolIcon className="w-6 h-6 text-neutral-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Links */}
              <div className="space-y-1">
                <Link
                  to="/planner"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-sm font-medium text-on-surface"
                >
                  <Globe className="w-4 h-4 text-neutral-500" />
                  My Trips
                </Link>
                <div
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl opacity-40 grayscale cursor-not-allowed text-sm font-medium text-neutral-400"
                >
                  <MapPin className="w-4 h-4 text-neutral-500" />
                  Saved Destinations
                </div>
                <Link
                  to="/account"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-sm font-medium text-on-surface"
                >
                  <User className="w-4 h-4 text-neutral-500" />
                  Settings
                </Link>
              </div>

              <button
                onClick={() => {
                  signOut()
                  setIsOpen(false)
                }}
                className="w-full mt-2 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-widest hover:bg-red-100 transition-colors"
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
    <footer className="w-full border-t border-outline-variant bg-background transition-colors duration-300 py-12 px-6 md:px-12 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-lg font-bold text-on-surface">Tripe</div>
        <div className="flex gap-8">
          <a
            href="#"
            className="text-xs text-neutral-500 hover:text-on-surface underline underline-offset-4 transition-colors"
          >
            Terms
          </a>
          <a
            href="#"
            className="text-xs text-neutral-500 hover:text-on-surface underline underline-offset-4 transition-colors"
          >
            Privacy
          </a>
          <a
            href="#"
            className="text-xs text-neutral-500 hover:text-on-surface underline underline-offset-4 transition-colors"
          >
            Support
          </a>
        </div>
        <p className="text-xs text-neutral-400">
          © 2026 Tripe. Designed for the organized traveler.
        </p>
      </div>
    </footer>
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
        <div className="min-h-screen flex flex-col font-sans transition-colors duration-300">
          <Navbar />
          <ToastContainer />
          <main className="flex-grow pt-20">
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
                element={
                  <ProtectedRoute>
                    <Planner />
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
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}
