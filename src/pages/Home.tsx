import { CalendarDays, Clock, Globe2, Map, Search, TrendingUp, Users } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { AutocompleteResults } from '../components/AutocompleteResults'
import { DestinationCard } from '../components/DestinationCard'
import { Badge, Button, Card, PageHeader } from '../components/ui'
import { FEATURED_DESTINATIONS } from '../constants'
import { LiquidGlass } from '../components/LiquidGlass'

const tripStats = [
  { icon: CalendarDays, value: '14d', label: 'average trip' },
  { icon: Map, value: '4', label: 'curated routes' },
  { icon: Users, value: 'live', label: 'collaboration' },
]

export default function Home() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

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

  return (
    <div className="pb-24">
      <section className="relative min-h-screen overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=2200"
          className="absolute inset-0 h-full w-full object-cover"
          alt="Mountain road at sunrise"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-950/65 to-blue-950/20" />
        <div className="relative mx-auto grid min-h-screen max-w-7xl grid-cols-1 content-center gap-10 px-6 py-16 md:grid-cols-[1.1fr_0.9fr] md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="max-w-3xl text-white"
          >
            <Badge className="border-white/20 bg-white/15 text-white backdrop-blur-md">
              TriPl
            </Badge>
            <h1 className="mt-5 text-5xl font-bold leading-tight md:text-7xl">
              {t('home.hero_title')}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/80">
              {t('home.hero_subtitle')}
            </p>

            <div ref={dropdownRef} className="relative mt-10 max-w-2xl">
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
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium !text-slate-950 transition-colors hover:bg-primary-container/40 hover:!text-on-primary-container"
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
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium !text-slate-950 transition-colors hover:bg-primary-container/40 hover:!text-on-primary-container"
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
            className="hidden self-end md:block"
          >
            <LiquidGlass
              refractionStrength={15}
              frostedIntensity={20}
              tintColor="rgba(255, 255, 255, 0.08)"
              className="p-5 border border-white/20 shadow-2xl rounded-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-label-sm text-white/80">Next pick</p>
                  <h2 className="text-2xl font-bold text-white">
                    {FEATURED_DESTINATIONS[0].city}
                  </h2>
                </div>
                <Globe2 className="h-8 w-8 text-white" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {tripStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg border border-white/10 bg-white/5 p-3"
                  >
                    <stat.icon className="mb-2 h-4 w-4 text-white" />
                    <p className="font-bold text-white">{stat.value}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-white/60">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </LiquidGlass>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-12">
        <PageHeader
          eyebrow={<Badge>{t('home.curated_picks')}</Badge>}
          title={t('home.trending_destinations')}
          action={
            <Button as={Link} to="/explore" variant="secondary">
              {t('home.view_all')} <Globe2 className="h-4 w-4" />
            </Button>
          }
        />

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_DESTINATIONS.slice(0, 4).map((destination) => (
            <DestinationCard
              key={destination.city}
              destination={destination}
              href={`/destination/${destination.city}`}
              compact
            />
          ))}
        </div>
      </section>
    </div>
  )
}
