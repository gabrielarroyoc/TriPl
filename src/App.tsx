import { Globe, Menu, User, X } from 'lucide-react'
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

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const { user } = useAuth()

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'pt' : 'en')
  }

  const navLinks = [
    { name: t('nav.explore'), path: '/explore' },
    { name: t('nav.planner'), path: '/planner' },
  ]

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-outline-variant bg-white/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex justify-between items-center h-20 px-6 md:px-12">
        <Link to="/" className="text-2xl font-bold tracking-tighter text-black">
          Tripe
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link
              key={link.name}
              to={link.path}
              className={`font-medium uppercase tracking-wider text-sm transition-all duration-200 ${
                location.pathname === link.path
                  ? 'text-black border-b-2 border-black pb-1'
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              {link.name}
            </Link>
          ))}

          <div className="w-px h-6 bg-outline-variant mx-2"></div>

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 font-medium uppercase tracking-wider text-sm text-neutral-500 hover:text-black transition-colors"
          >
            <Globe className="w-4 h-4" />
            {i18n.language === 'en' ? 'PT' : 'EN'}
          </button>

          {user ? (
            <Link
              to="/account"
              className="w-10 h-10 rounded-full bg-neutral-100 border border-outline-variant flex items-center justify-center hover:bg-neutral-200 transition-colors"
            >
              <User className="w-5 h-5 text-neutral-600" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="bg-black text-white px-5 py-2.5 rounded-full font-medium uppercase tracking-wider text-xs hover:bg-neutral-800 transition-colors"
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
            className="md:hidden bg-white border-b border-outline-variant p-6 space-y-6"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map(link => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block text-lg font-medium"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <hr className="border-outline-variant" />

            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  toggleLanguage()
                  setIsOpen(false)
                }}
                className="flex items-center gap-2 font-medium uppercase tracking-wider text-sm text-neutral-500"
              >
                <Globe className="w-5 h-5" />
                {i18n.language === 'en' ? 'Switch to PT' : 'Switch to EN'}
              </button>

              {user ? (
                <Link
                  to="/account"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 font-medium"
                >
                  <User className="w-5 h-5" />
                  {t('nav.account')}
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="bg-black text-white px-6 py-2 rounded-lg font-medium uppercase tracking-wider text-sm"
                >
                  {t('nav.login')}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="w-full border-t border-outline-variant bg-[#F9F9F9] py-12 px-6 md:px-12 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-lg font-bold text-black">Tripe</div>
        <div className="flex gap-8">
          <a
            href="#"
            className="text-xs text-neutral-500 hover:text-black underline underline-offset-4"
          >
            Terms
          </a>
          <a
            href="#"
            className="text-xs text-neutral-500 hover:text-black underline underline-offset-4"
          >
            Privacy
          </a>
          <a
            href="#"
            className="text-xs text-neutral-500 hover:text-black underline underline-offset-4"
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
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col font-sans">
          <Navbar />
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
