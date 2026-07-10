import { ArrowRight, Clock, MapPin, Search, TrendingUp } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { AutocompleteResults } from '../components/AutocompleteResults'
import { LiquidGlass } from '../components/LiquidGlass'
import { FEATURED_DESTINATIONS } from '../constants'
import { cn } from '../lib/utils'
import type { Destination } from '../types'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=2000'

function DestinationCard({ destination, index }: { destination: Destination; index: number }) {
  const { t } = useTranslation()
  const isFeatured = index === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={`/destination/${destination.city}`}
        className={cn(
          'group relative block h-full overflow-hidden rounded-[28px] border border-white/10',
          isFeatured ? 'aspect-[4/5] sm:aspect-[5/4]' : 'aspect-[4/5]',
        )}
      >
        <img
          src={destination.image}
          alt={destination.city}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-transparent" />
        <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-primary/10" />

        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
                {destination.country}
              </p>
              <h3
                className={cn(
                  'mt-1 font-bold tracking-tight text-white transition-colors group-hover:text-white',
                  isFeatured ? 'text-2xl sm:text-3xl' : 'text-xl',
                )}
              >
                {destination.city}
              </h3>
              <p className="mt-1.5 max-w-xs text-sm text-white/60 line-clamp-1">{destination.tagline}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-lg font-bold text-white">
                {t('home.from')}
                {destination.pricePerWeek}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-white/40">{t('home.per_week')}</p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function SearchBar() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) setRecentSearches(JSON.parse(saved))
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
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 600)
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
    navigate(`/destination/${encodeURIComponent(suggestion)}`)
  }

  return (
    <div ref={dropdownRef} className="relative w-full max-w-xl">
      <LiquidGlass
        refractionStrength={16}
        frostedIntensity={22}
        tintColor="rgba(255, 255, 255, 0.1)"
        className="overflow-visible rounded-2xl border border-white/25 shadow-2xl"
        contentClassName="flex flex-row items-center gap-2 p-1.5 w-full"
      >
        <div className="flex min-w-0 flex-1 items-center gap-2.5 px-3">
          <Search className="h-5 w-5 shrink-0 text-white/75" />
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
            className="w-full bg-transparent text-sm font-medium text-white caret-white outline-none placeholder:text-white/55 sm:text-base"
          />
        </div>
        <button
          onClick={handleSearch}
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white transition-all duration-300 hover:bg-primary/90 active:scale-[0.98] sm:px-6 sm:py-3 sm:text-xs"
        >
          <Search size={14} className="sm:hidden" />
          <span className="hidden sm:inline">{t('home.search_button')}</span>
        </button>
      </LiquidGlass>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-full z-30 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-surface/95 text-left text-on-surface shadow-2xl backdrop-blur-xl"
          >
            {searchQuery.trim() === '' ? (
              <div className="p-3">
                {recentSearches.length > 0 && (
                  <div className="mb-3">
                    <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-outline">
                      {t('home.recent_searches')}
                    </p>
                    {recentSearches.map((search) => (
                      <button
                        key={search}
                        onClick={() => handleSuggestionClick(search)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white transition-colors hover:bg-primary/15"
                      >
                        <Clock size={15} className="text-primary" />
                        {search}
                      </button>
                    ))}
                  </div>
                )}

                <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-outline">
                  {t('home.trending_destinations_search')}
                </p>
                {FEATURED_DESTINATIONS.slice(0, 3).map((destination) => (
                  <button
                    key={destination.city}
                    onClick={() => handleSuggestionClick(destination.city)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white transition-colors hover:bg-primary/15"
                  >
                    <TrendingUp size={15} className="text-primary" />
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
  )
}

export default function Home() {
  const { t } = useTranslation()
  const featured = FEATURED_DESTINATIONS[0]

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-on-surface">
      {/* ── Hero ── */}
      <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden">
        <motion.img
          src={HERO_IMAGE}
          alt=""
          aria-hidden="true"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-grid opacity-40" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-16 pt-32 md:px-12 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <p className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
              TriPl
            </p>
            <h1 className="mt-4 text-2xl font-semibold leading-snug tracking-tight text-white/90 sm:text-3xl md:text-4xl md:leading-tight">
              {t('home.hero_title')}
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60 sm:text-base">
              {t('home.hero_subtitle')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8"
          >
            <SearchBar />
          </motion.div>
        </div>
      </section>

      {/* ── Destinations ── */}
      <section className="relative mx-auto max-w-7xl px-6 py-20 md:px-12 md:py-28">
        <div className="absolute left-1/2 top-0 h-[40%] w-[50%] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              {t('explore.popular_destinations')}
            </h2>
            <p className="mt-2 max-w-md text-sm text-white/50">{t('home.destinations_subtitle')}</p>
          </div>
          <Link
            to="/explore"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            {t('home.view_all')}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="relative mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_DESTINATIONS.map((destination, index) => (
            <div key={destination.city} className={index === 0 ? 'sm:col-span-2 lg:col-span-2' : ''}>
              <DestinationCard destination={destination} index={index} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured spotlight ── */}
      <section className="relative overflow-hidden border-y border-white/5">
        <div className="absolute inset-0">
          <img
            src={featured.image}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
        </div>

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-20 md:grid-cols-2 md:px-12 md:py-28">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
              {t('home.editors_choice')}
            </p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
              {featured.city}
            </h2>
            <p className="mt-2 text-base text-primary/90">{featured.tagline}</p>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/55">{featured.description}</p>

            <div className="mt-6 flex items-center gap-2 text-sm text-white/50">
              <MapPin className="h-4 w-4 text-primary" />
              {featured.city}, {featured.country}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={`/destination/${featured.city}`}
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
              >
                {t('home.learn_more')}
              </Link>
              <Link
                to={`/planner?destination=${featured.city}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-bold text-white transition-all hover:bg-primary/90"
              >
                {t('home.plan_trip')}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[4/3] overflow-hidden rounded-[32px] border border-white/10 shadow-2xl"
          >
            <img
              src={featured.image}
              alt={featured.city}
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-white/15 bg-background/70 px-4 py-3 backdrop-blur-md">
              <div>
                <p className="text-lg font-bold text-white">
                  {t('home.from')}
                  {featured.pricePerWeek}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-white/45">{t('home.per_week')}</p>
              </div>
              <div className="flex gap-1.5">
                {featured.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Experience ── */}
      <section className="relative mx-auto max-w-7xl px-6 py-20 md:px-12 md:py-28">
        <div className="absolute right-0 top-1/3 h-[40%] w-[40%] rounded-full bg-blue-500/5 blur-[140px] pointer-events-none" />

        <div className="relative max-w-xl">
          <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            {t('home.experience_subtitle')}
          </h2>
          <p className="mt-3 text-sm text-white/50">{t('home.experience_title')}</p>
        </div>

        <div className="relative mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { title: t('home.discover_title'), desc: t('home.discover_desc') },
            { title: t('home.customize_title'), desc: t('home.customize_desc') },
            { title: t('home.collaborate_title'), desc: t('home.collaborate_desc') },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative border-t border-white/10 pt-6"
            >
              <span className="text-sm font-bold tracking-widest text-primary/50 transition-colors group-hover:text-primary">
                0{index + 1}
              </span>
              <h3 className="mt-4 text-xl font-bold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
