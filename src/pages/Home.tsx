import axios from 'axios'
import { Clock, Compass, Globe2, Map, Search, Star, TrendingUp, Users } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { FEATURED_DESTINATIONS } from '../constants'
import { cn } from '../lib/utils'

export default function Home() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<{name: string, display_name: string}[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch Geocoding suggestions (debounced)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([])
      return
    }
    const timeoutId = setTimeout(async () => {
      try {
        const lang = i18n.language === 'pt' ? 'pt-BR' : 'en'
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            searchQuery
          )}&format=json&limit=5&accept-language=${lang}`
        )
        if (res.data && Array.isArray(res.data)) {
          // Filter to strictly include geographical entities (cities, states, countries, etc)
          // Excludes POIs like offices, shops, buildings (which caused companies to appear)
          const validClasses = ['place', 'boundary']
          const filtered = res.data.filter((item: any) => validClasses.includes(item.class))
          
          // Remove duplicates by name
          const unique = Array.from(new Map(filtered.map((item: any) => [item.name, item])).values()) as any[]
          setSuggestions(unique.map(item => ({ name: item.name, display_name: item.display_name })))
        }
      } catch (err) {
        console.error('Failed to fetch suggestions', err)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, i18n.language])

  const saveRecentSearch = (query: string) => {
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim())
      setIsDropdownOpen(false)
      navigate(`/destination/${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate('/explore')
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
    setIsDropdownOpen(false)
  }

  return (
    <div className="space-y-32 pb-32">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=2000"
            className="w-full h-full object-cover brightness-[0.6]"
            alt="Hero background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white mt-12 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium tracking-widest uppercase mb-6">
              Tripe
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight">
              {t('home.hero_title')}
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-lg md:text-xl font-light mb-12 opacity-90 max-w-2xl mx-auto"
          >
            {t('home.hero_subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            ref={dropdownRef}
            className="relative max-w-2xl mx-auto"
          >
            <div className="bg-white/10 backdrop-blur-xl p-2 rounded-2xl flex items-center shadow-2xl border border-white/20 relative z-20">
              <Search className="text-white mx-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value)
                  setIsDropdownOpen(true)
                }}
                onFocus={() => setIsDropdownOpen(true)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder={t('home.search_placeholder')}
                className="w-full py-4 text-white bg-transparent focus:outline-none placeholder:text-white/60 text-lg"
              />
              <button
                onClick={handleSearch}
                className="bg-white text-black px-8 py-4 rounded-xl font-semibold uppercase tracking-widest hover:bg-neutral-200 transition-colors hidden sm:block"
              >
                {t('home.search_button')}
              </button>
            </div>

            {/* Smart Suggestions Dropdown */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute top-full mt-2 left-0 w-full bg-black/80 backdrop-blur-3xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col text-left"
                >
                  {searchQuery.trim() === '' ? (
                    <div className="p-4 space-y-4">
                      {recentSearches.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 mb-2 px-4 font-bold">
                            {t('home.recent_searches')}
                          </p>
                          {recentSearches.map(s => (
                            <button
                              key={s}
                              onClick={() => handleSuggestionClick(s)}
                              className="w-full text-left px-4 py-3 text-white hover:bg-white/10 rounded-xl flex items-center gap-4 transition-colors"
                            >
                              <Clock size={16} className="text-white/40" /> {s}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 mb-2 px-4 font-bold mt-2">
                          {t('home.trending_destinations_search')}
                        </p>
                        {FEATURED_DESTINATIONS.slice(0, 3).map(d => (
                          <button
                            key={d.city}
                            onClick={() => handleSuggestionClick(d.city)}
                            className="w-full text-left px-4 py-3 text-white hover:bg-white/10 rounded-xl flex items-center gap-4 transition-colors"
                          >
                            <TrendingUp size={16} className="text-white/40" /> {d.city}, {d.country}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-2">
                      {suggestions.length > 0 ? (
                        suggestions.map(s => (
                          <button
                            key={s.display_name}
                            onClick={() => handleSuggestionClick(s.name)}
                            className="w-full text-left px-4 py-3 text-white hover:bg-white/10 rounded-xl flex items-center gap-4 transition-colors"
                          >
                            <Search size={16} className="text-white/40 flex-shrink-0" />
                            <div className="flex flex-col truncate">
                              <span className="font-bold">{s.name}</span>
                              <span className="text-xs text-white/50 truncate">{s.display_name}</span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <p className="px-6 py-4 text-white/50 text-sm">{t('home.no_suggestions', { query: searchQuery })}</p>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-xs font-bold bg-black text-white px-3 py-1.5 rounded-full uppercase tracking-widest mb-4 inline-block">
              {t('home.curated_picks')}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">
              {t('home.trending_destinations')}
            </h2>
          </motion.div>
          <Link
            to="/explore"
            className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            {t('home.view_all')} <Globe2 className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-[300px_300px] gap-4">
          {/* Main Featured Card */}
          <Link
            to={`/destination/${FEATURED_DESTINATIONS[0].city}`}
            className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-2xl bg-black"
          >
            <img
              src={FEATURED_DESTINATIONS[0].image}
              className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-1000 group-hover:scale-105 group-hover:opacity-100"
              alt={FEATURED_DESTINATIONS[0].city}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-white/20 backdrop-blur-md text-xs uppercase font-bold px-3 py-1 rounded-full border border-white/20">
                  {t('home.editors_choice')}
                </span>
                <span className="text-white flex items-center gap-1 font-medium bg-black/40 backdrop-blur-md px-3 py-1 rounded-full">
                  <Star size={14} className="fill-white" /> 4.9
                </span>
              </div>
              <h3 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">
                {FEATURED_DESTINATIONS[0].city},{' '}
                {FEATURED_DESTINATIONS[0].country}
              </h3>
              <p className="text-lg text-white/80 font-light">
                {t('home.from')}
                {FEATURED_DESTINATIONS[0].pricePerWeek}
              </p>
              <p className="text-sm text-white/60 mt-2 italic">
                {t(`destinations.${FEATURED_DESTINATIONS[0].city.toLowerCase()}.tagline`, FEATURED_DESTINATIONS[0].tagline)}
              </p>
            </div>
          </Link>

          {/* Secondary Cards */}
          {FEATURED_DESTINATIONS.slice(1, 4).map((dest, idx) => (
            <Link
              key={dest.city}
              to={`/destination/${dest.city}`}
              className={cn(
                'relative group overflow-hidden rounded-2xl bg-black',
                idx === 0 ? 'md:col-span-2' : '',
              )}
            >
              <img
                src={dest.image}
                className="absolute inset-0 w-full h-full object-cover opacity-70 transition-transform duration-1000 group-hover:scale-110 group-hover:opacity-100"
                alt={dest.city}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <h3
                  className={cn(
                    'font-bold tracking-tight mb-1',
                    idx === 0 ? 'text-3xl' : 'text-xl',
                  )}
                >
                  {dest.city}, {dest.country}
                </h3>
                <p className="text-xs opacity-80 uppercase tracking-widest">
                  {t(`destinations.${dest.city.toLowerCase()}.tagline`, dest.tagline)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why TripNexus Section */}
      <section className="bg-black text-white dark:bg-white/5 dark:backdrop-blur-3xl dark:border dark:border-white/10 dark:text-white py-32 mt-20 rounded-[3rem] mx-4 md:mx-12 overflow-hidden relative transition-all duration-300">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
              {t('home.experience_title')}
            </h2>
            <p className="text-white/60 text-lg">
              {t('home.experience_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
            {[
              {
                id: '01',
                icon: Compass,
                title: t('home.discover_title'),
                desc: t('home.discover_desc'),
              },
              {
                id: '02',
                icon: Map,
                title: t('home.customize_title'),
                desc: t('home.customize_desc'),
              },
              {
                id: '03',
                icon: Users,
                title: t('home.collaborate_title'),
                desc: t('home.collaborate_desc'),
              },
              {
                id: '04',
                icon: Globe2,
                title: t('home.explore_title'),
                desc: t('home.explore_desc'),
              },
              ].map((item, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                key={item.id}
                className="relative group"
              >
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold mb-3">{item.title}</h4>
                <p className="text-white/60 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
