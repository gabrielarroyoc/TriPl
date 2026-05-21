import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Frown, Globe2, Search, SlidersHorizontal } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AutocompleteResults } from '../components/AutocompleteResults'
import { DestinationCard } from '../components/DestinationCard'
import { Badge, Button, Card, EmptyState, PageHeader } from '../components/ui'
import { FEATURED_DESTINATIONS } from '../constants'
import { useDestinationsStore } from '../store/useStore'

export default function Explore() {
  const { t, i18n } = useTranslation()
  const { isSaved, toggleDestination } = useDestinationsStore()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const query = searchParams.get('q')?.toLowerCase() || ''
  const [localQuery, setLocalQuery] = useState(query)
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  const [activeInterests, setActiveInterests] = useState<string[]>([])
  const [sortBy, setSortBy] = useState(t('explore.relevance'))
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const interests = [
    t('explore.culture', 'Culture'),
    t('explore.nature', 'Nature'),
    t('explore.culinary', 'Culinary'),
    t('explore.adventure', 'Adventure'),
    t('explore.relaxation', 'Relaxation'),
  ]

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
      setDebouncedQuery(localQuery)
    }, 600)
    return () => clearTimeout(timer)
  }, [localQuery])

  const toggleInterest = (interest: string) => {
    setActiveInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    )
  }

  const filteredDestinations = useMemo(() => {
    let result = [...FEATURED_DESTINATIONS]

    if (localQuery) {
      const normalizedQuery = localQuery.toLowerCase()
      result = result.filter(
        (destination) =>
          destination.city.toLowerCase().includes(normalizedQuery) ||
          destination.country.toLowerCase().includes(normalizedQuery) ||
          destination.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery)),
      )
    }

    if (activeInterests.length > 0) {
      result = result.filter((destination) =>
        activeInterests.some((interest) =>
          destination.tags.some(
            (tag) =>
              interest.toLowerCase().includes(tag.toLowerCase()) ||
              tag.toLowerCase().includes(interest.toLowerCase()) ||
              (interest.includes('Cultur') && tag === 'Culture') ||
              (interest.includes('Natur') && tag === 'Nature') ||
              (interest.includes('Culin') && tag === 'Culinary'),
          ),
        ),
      )
    }

    if (sortBy === t('explore.price_low_high')) {
      result.sort((a, b) => a.pricePerWeek - b.pricePerWeek)
    } else if (sortBy === t('explore.rating')) {
      result.sort((a, b) => b.city.length - a.city.length)
    }

    return result
  }, [localQuery, activeInterests, sortBy, t])

  const clearFilters = () => {
    setLocalQuery('')
    setActiveInterests([])
    setSortBy(t('explore.relevance'))
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:px-12">
      <PageHeader
        eyebrow={<Badge>{t('explore.filters')}</Badge>}
        title={t('explore.destinations_title')}
        description={t('explore.discover_subtitle')}
        action={
          <div className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface px-3 py-2">
            <span className="text-label-sm text-outline">{t('explore.sort_by')}</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="bg-transparent text-sm font-bold text-on-surface"
            >
              <option>{t('explore.relevance')}</option>
              <option>{t('explore.price_low_high')}</option>
              <option>{t('explore.rating')}</option>
            </select>
          </div>
        }
      />

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit p-5 lg:sticky lg:top-28">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-primary">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold">{t('explore.filters')}</h2>
              <p className="text-label-sm text-outline">{t('explore.refine')}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-label-sm text-outline">
                {t('home.search_placeholder', 'Search Destinations')}
              </label>
              <div className="relative" ref={dropdownRef}>
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary"
                  size={18}
                />
                <input
                  type="text"
                  value={localQuery}
                  onChange={(event) => {
                    setLocalQuery(event.target.value)
                    setIsDropdownOpen(true)
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Ex: Positano, Culture..."
                  className="h-11 w-full rounded-lg border border-outline-variant bg-background pl-10 pr-3 text-sm font-medium text-on-surface focus:border-primary"
                />

                <AnimatePresence>
                  {isDropdownOpen && localQuery.trim().length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-lg border border-outline-variant bg-surface shadow-2xl"
                    >
                      <div className="min-h-[100px] p-2">
                        {debouncedQuery.trim() === '' || debouncedQuery !== localQuery ? (
                          <div className="flex h-24 items-center justify-center">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                          </div>
                        ) : (
                          <Suspense
                            fallback={
                              <div className="space-y-3 p-4">
                                <div className="h-4 w-40 animate-pulse rounded bg-primary-container" />
                                <div className="h-4 w-28 animate-pulse rounded bg-primary-container" />
                              </div>
                            }
                          >
                            <AutocompleteResults
                              query={debouncedQuery}
                              lang={i18n.language === 'pt' ? 'pt-BR' : 'en'}
                              onSelect={(name) => {
                                setLocalQuery(name)
                                setIsDropdownOpen(false)
                                navigate(`/destination/${encodeURIComponent(name)}`)
                              }}
                              isDark={false}
                            />
                          </Suspense>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-label-sm text-outline">
                {t('explore.interests')}
              </label>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-md border px-3 py-1.5 text-xs font-bold transition-colors ${
                      activeInterests.includes(interest)
                        ? 'border-primary bg-primary text-white'
                        : 'border-outline-variant bg-background text-outline hover:border-primary hover:text-primary'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={clearFilters} variant="secondary" className="w-full">
              {t('explore.apply_filters', 'Clear Filters')}
            </Button>
          </div>
        </Card>

        <section>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {filteredDestinations.length === 0 && localQuery.trim().length > 2 ? (
              <Card className="overflow-hidden">
                <div className="flex h-64 items-center justify-center bg-primary-container text-primary">
                  <Globe2 size={64} />
                </div>
                <div className="p-5">
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-h3 capitalize">{localQuery}</h3>
                      <p className="mt-1 text-sm text-outline">
                        {t('explore.plan_trip_here', 'Plan a Trip Here')}
                      </p>
                    </div>
                    <Badge>Web</Badge>
                  </div>
                  <Button as={Link} to={`/destination/${encodeURIComponent(localQuery.trim())}`}>
                    {t('explore.plan_trip_here', 'Plan a Trip Here')}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ) : filteredDestinations.length === 0 ? (
              <div className="xl:col-span-2">
                <EmptyState
                  icon={Frown}
                  title={t('explore.no_destinations')}
                  description={t('explore.adjust_search')}
                />
              </div>
            ) : (
              filteredDestinations.map((destination, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  key={destination.city}
                >
                  <DestinationCard
                    destination={destination}
                    href={`/destination/${destination.city}`}
                    isSaved={isSaved(destination.city)}
                    onToggleSaved={toggleDestination}
                  />
                </motion.div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
