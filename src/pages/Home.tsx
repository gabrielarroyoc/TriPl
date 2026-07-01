import { Clock, Search, TrendingUp } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { AutocompleteResults } from '../components/AutocompleteResults'
import { Badge, Button } from '../components/ui'
import { FEATURED_DESTINATIONS } from '../constants'
import { LiquidGlass } from '../components/LiquidGlass'
import { cn } from '../lib/utils'

const FEATURED_IMAGES = [
  "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&q=80&w=600"
]

const socialAvatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100&h=100",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100&h=100",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100&h=100"
]

function MiniInspiredCard({ destination, index, t }: { destination: any; index: number; t: any }) {
  const hasDiscount = index === 0 || index === 2 || index === 3
  const isOverlay = index === 0

  if (isOverlay) {
    return (
      <Link
        to={`/destination/${destination.city}`}
        className="group relative block aspect-[3/4] overflow-hidden rounded-3xl border border-white/10 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-white/20"
      >
        <img
          src={destination.image}
          alt={destination.city}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent" />
        
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-white/15 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-full text-[9px] font-semibold text-white flex items-center gap-1">
            <span>✨ Partner discount</span>
          </div>
        )}

        <div className="absolute bottom-5 left-5 right-5 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">{destination.city}</h3>
            <span className="text-[10px] font-semibold bg-black/40 px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
              ⭐ 4.9
            </span>
          </div>
          <p className="mt-1 text-xs text-white/80">From ${destination.pricePerWeek} / 7 days</p>
          <p className="mt-2 text-[9px] text-white/50 uppercase tracking-widest font-semibold">7 recommended hotels</p>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={`/destination/${destination.city}`}
      className="group block transition-all duration-300 hover:scale-[1.01]"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 shadow-md">
        <img
          src={destination.image}
          alt={destination.city}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-white/15 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-full text-[9px] font-semibold text-white">
            ✨ Partner discount
          </div>
        )}
      </div>
      <div className="mt-3 px-1">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors">
            {destination.city}
          </h3>
          <span className="text-xs font-semibold text-white/80 flex items-center gap-1">
            ⭐ {(4.5 + index * 0.1).toFixed(1)}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-white/60">From ${destination.pricePerWeek} / 7 days</p>
        <p className="mt-1.5 text-[9px] text-white/40 uppercase tracking-widest font-semibold">
          {10 + index * 8} recommended hotels
        </p>
      </div>
    </Link>
  )
}

export default function Home() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isReadMore, setIsReadMore] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 600)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const saveRecentSearch = (query: string) => {
    const updated = [query, ...recentSearches.filter((search) => search !== query)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const handleSearch = () => {
    const query = searchQuery.trim()
    if (query) {
      saveRecentSearch(query)
      setIsDropdownOpen(false)
      navigate(`/destination/${encodeURIComponent(query)}`)
      return
    }
    navigate('/explore')
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
    saveRecentSearch(suggestion)
    setIsDropdownOpen(false)
  }

  const featuredDestination = FEATURED_DESTINATIONS[0]

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/5 blur-[160px] pointer-events-none" />
      
      <div className="relative mx-auto max-w-7xl px-6 pt-32 pb-24 md:px-12 bg-grid rounded-b-[40px] border-b border-white/5">
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-14 items-start">
          
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="flex flex-col text-white"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight max-w-xl">
              {t('home.hero_title')}
            </h1>
            
            <h2 className="mt-14 text-2xl font-bold text-white/90 border-b border-white/10 pb-3">
              {t('explore.popular_destinations', 'Popular destinations')}
            </h2>
            
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
              {FEATURED_DESTINATIONS.map((destination, index) => (
                <MiniInspiredCard
                  key={destination.city}
                  destination={destination}
                  index={index}
                  t={t}
                />
              ))}
            </div>
          </motion.div>
          
          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
            className="flex flex-col gap-8"
          >
            {/* Search Box Card */}
            <div className="flex flex-col">
              <div ref={dropdownRef} className="relative w-full">
                <LiquidGlass
                  refractionStrength={18}
                  frostedIntensity={20}
                  tintColor="rgba(255, 255, 255, 0.08)"
                  className="border border-white/25 shadow-2xl pointer-events-auto rounded-2xl overflow-visible"
                  contentClassName="flex flex-row gap-2 p-1.5 items-center w-full justify-between"
                >
                  <div className="flex items-center gap-2 px-2 flex-1 min-w-0">
                    <Search className="h-5 w-5 text-white/80 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) => {
                        setSearchQuery(event.target.value)
                        setIsDropdownOpen(true)
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
                      placeholder={t('home.search_placeholder')}
                      className="w-full bg-transparent text-sm sm:text-base font-medium text-white caret-white placeholder:text-white/60 outline-none"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    className="bg-white/5 hover:bg-white/15 text-white border border-white/25 hover:border-white/50 font-bold uppercase tracking-wider text-[10px] sm:text-xs px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-full transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Search size={14} className="sm:hidden" />
                    <span className="hidden sm:inline">{t('home.search_button')}</span>
                  </button>
                </LiquidGlass>
                
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="absolute left-0 top-full z-20 mt-2 w-full overflow-hidden rounded-2xl border border-outline-variant bg-surface text-left text-on-surface shadow-2xl"
                    >
                      {searchQuery.trim() === '' ? (
                        <div className="p-3">
                          {recentSearches.length > 0 && (
                            <div className="mb-3">
                              <p className="px-3 pb-2 text-label-sm text-slate-500">
                                {t('home.recent_searches')}
                              </p>
                              {recentSearches.map((search) => (
                                <button
                                  key={search}
                                  onClick={() => handleSuggestionClick(search)}
                                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white hover:bg-primary-container/40 hover:text-on-primary-container transition-colors"
                                >
                                  <Clock size={16} className="text-primary" />
                                  {search}
                                </button>
                              ))}
                            </div>
                          )}

                          <p className="px-3 pb-2 text-label-sm text-slate-500">
                            {t('home.trending_destinations_search')}
                          </p>
                          {FEATURED_DESTINATIONS.slice(0, 3).map((destination) => (
                            <button
                              key={destination.city}
                              onClick={() => handleSuggestionClick(destination.city)}
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white hover:bg-primary-container/40 hover:text-on-primary-container transition-colors"
                            >
                              <TrendingUp size={16} className="text-primary" />
                              {destination.city}, {destination.country}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="min-h-[104px] p-2">
                          {debouncedQuery.trim() === '' || debouncedQuery !== searchQuery ? (
                            <div className="flex h-24 items-center justify-center">
                              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                            </div>
                          ) : (
                            <Suspense
                              fallback={
                                <div className="space-y-3 p-4">
                                  <div className="h-4 w-48 animate-pulse rounded bg-primary-container" />
                                  <div className="h-4 w-32 animate-pulse rounded bg-primary-container" />
                                </div>
                              }
                            >
                              <AutocompleteResults
                                query={debouncedQuery}
                                lang={i18n.language === 'pt' ? 'pt-BR' : 'en'}
                                onSelect={handleSuggestionClick}
                                isDark={true}
                              />
                            </Suspense>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p className="mt-4 text-xs text-white/60 leading-relaxed pl-1 max-w-md">
                {t('home.hero_subtitle')}
              </p>
            </div>

            {/* Featured Destination Card (Inspired Card) */}
            <div className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-md p-6 shadow-2xl">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/5 shadow-inner">
                <img
                  src={FEATURED_IMAGES[selectedImage]}
                  alt="Featured destination view"
                  className="h-full w-full object-cover transition-all duration-500"
                />
              </div>

              {/* Thumbnails */}
              <div className="mt-3 flex gap-2.5">
                {FEATURED_IMAGES.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={cn(
                      "relative h-12 w-20 overflow-hidden rounded-lg border transition-all duration-200",
                      selectedImage === idx
                        ? "border-primary scale-[1.03] ring-1 ring-primary"
                        : "border-white/10 opacity-70 hover:opacity-100"
                    )}
                  >
                    <img src={img} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Title & Price */}
              <div className="mt-5 flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">{featuredDestination.city}</h3>
                  <p className="text-xs text-primary font-medium">{featuredDestination.tagline}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-white">${featuredDestination.pricePerWeek}</p>
                  <p className="text-[9px] text-white/50 uppercase tracking-widest font-semibold">for 7 days</p>
                </div>
              </div>

              {/* Social Proof */}
              <div className="mt-4 flex items-center justify-between border-t border-b border-white/5 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {socialAvatars.map((av, i) => (
                      <img
                        key={i}
                        src={av}
                        className="h-6 w-6 rounded-full border border-surface object-cover shadow-sm"
                      />
                    ))}
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border border-surface bg-primary-container text-[8px] font-bold text-on-primary-container">
                      +12
                    </div>
                  </div>
                  <span className="text-[11px] text-white/70">
                    16 of your friends have been there
                  </span>
                </div>
                <Link to="/explore" className="text-[11px] font-semibold text-primary hover:underline">
                  View reviews
                </Link>
              </div>

              {/* Description */}
              <div className="mt-4">
                <p className="text-xs text-white/70 leading-relaxed">
                  {isReadMore
                    ? featuredDestination.description + " Wander through beautiful cliffside paths, savor authentic local cuisine, and experience the timeless romance of the Amalfi Coast."
                    : featuredDestination.description.slice(0, 110) + "..."}
                  <button
                    onClick={() => setIsReadMore(!isReadMore)}
                    className="ml-1 text-xs font-bold text-primary hover:underline"
                  >
                    {isReadMore ? "Read less" : "Read more"}
                  </button>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <Button
                  as={Link}
                  to={`/destination/${featuredDestination.city}`}
                  className="flex-1 justify-center py-3 rounded-xl border border-white/20 bg-transparent text-white hover:bg-white/5 text-xs font-semibold"
                >
                  Learn more
                </Button>
                <Button
                  as={Link}
                  to={`/planner?destination=${featuredDestination.city}`}
                  className="flex-1 justify-center py-3 rounded-xl bg-primary text-white hover:bg-primary/95 text-xs font-bold"
                >
                  Order now
                </Button>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
      
      {/* TriPl Experience Features highlights section */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-12 text-white relative">
        <div className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        
        <div className="text-center max-w-xl mx-auto">
          <Badge className="border-white/10 bg-white/5 text-primary text-[10px] uppercase font-bold tracking-wider mb-3">
            {t('home.experience_title')}
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight">
            {t('home.experience_subtitle')}
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: t('home.discover_title'), desc: t('home.discover_desc'), color: 'from-blue-500/20 to-transparent' },
            { title: t('home.customize_title'), desc: t('home.customize_desc'), color: 'from-primary/20 to-transparent' },
            { title: t('home.collaborate_title'), desc: t('home.collaborate_desc'), color: 'from-indigo-500/20 to-transparent' }
          ].map((item, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-3xl border border-white/5 bg-surface/30 p-8 hover:border-white/10 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10">
                <span className="text-3xl font-bold text-primary/30 group-hover:text-primary transition-colors">0{index + 1}</span>
                <h3 className="mt-4 text-xl font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-white/60 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
