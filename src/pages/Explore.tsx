import { motion, AnimatePresence } from "motion/react";
import { FEATURED_DESTINATIONS } from "../constants";
import { Search, Heart, ArrowRight, Frown, Globe2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import { useDestinationsStore } from "../store/useStore";
import { AutocompleteResults } from "../components/AutocompleteResults";
import { useNavigate } from "react-router-dom";

export default function Explore() {
  const { t, i18n } = useTranslation();
  const { isSaved, toggleDestination } = useDestinationsStore();
  const interests = [
    t('explore.culture', 'Culture'), 
    t('explore.nature', 'Nature'), 
    t('explore.culinary', 'Culinary'), 
    t('explore.adventure', 'Adventure'), 
    t('explore.relaxation', 'Relaxation')
  ];
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q')?.toLowerCase() || '';
  const [localQuery, setLocalQuery] = useState(query);
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [activeInterests, setActiveInterests] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState(t('explore.relevance'));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(localQuery);
    }, 800);
    return () => clearTimeout(timer);
  }, [localQuery]);

  const toggleInterest = (interest: string) => {
    setActiveInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    )
  };

  const filteredDestinations = useMemo(() => {
    let result = [...FEATURED_DESTINATIONS];

    if (localQuery) {
      const q = localQuery.toLowerCase();
      result = result.filter(
        (dest) =>
          dest.city.toLowerCase().includes(q) ||
          dest.country.toLowerCase().includes(q) ||
          dest.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    if (activeInterests.length > 0) {
      result = result.filter(dest => 
        activeInterests.some(interest => 
          // Match translated interest with English tag from constants loosely
          dest.tags.some(tag => 
            interest.toLowerCase().includes(tag.toLowerCase()) || 
            tag.toLowerCase().includes(interest.toLowerCase()) ||
            // Hardcode common mappings just in case
            (interest.includes('Cultur') && tag === 'Culture') ||
            (interest.includes('Natur') && tag === 'Nature') ||
            (interest.includes('Culin') && tag === 'Culinary')
          )
        )
      );
    }

    if (sortBy === t('explore.price_low_high')) {
      result.sort((a, b) => a.pricePerWeek - b.pricePerWeek);
    } else if (sortBy === t('explore.rating')) {
      // Mock rating sort: sort by city name length descending just to show it changes
      result.sort((a, b) => b.city.length - a.city.length);
    }

    return result;
  }, [localQuery, activeInterests, sortBy, t]);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row gap-12">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-10">
        <div className="pb-4 border-b border-outline-variant">
          <h2 className="text-h3 mb-1">{t('explore.filters')}</h2>
          <p className="text-label-sm text-neutral-500 uppercase tracking-widest font-bold">{t('explore.refine')}</p>
        </div>

        {/* Search Bar */}
        <div className="space-y-4">
          <label className="text-label-sm font-bold uppercase block">{t('home.search_placeholder', 'Search Destinations')}</label>
          <div className="relative" ref={dropdownRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input 
              type="text" 
              value={localQuery}
              onChange={(e) => {
                setLocalQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="Ex: Positano, Culture..." 
              className="w-full h-12 bg-surface text-on-surface border border-outline-variant rounded-lg pl-10 pr-4 focus:ring-1 focus:ring-on-surface outline-none"
            />
            
            {/* Autocomplete Dropdown */}
            <AnimatePresence>
              {isDropdownOpen && localQuery.trim().length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute top-full mt-2 left-0 w-full bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-2xl z-50 flex flex-col text-left"
                >
                  <div className="p-2 relative min-h-[100px]">
                    {debouncedQuery.trim() === '' || debouncedQuery !== localQuery ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-neutral-200 border-t-neutral-800 dark:border-neutral-700 dark:border-t-white rounded-full animate-spin" />
                      </div>
                    ) : (
                      <Suspense fallback={<div className="p-4 space-y-4">
                        <div className="flex items-center gap-3">
                          <Search size={16} className="text-neutral-200 dark:text-neutral-800" />
                          <div className="h-4 w-48 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse"></div>
                        </div>
                      </div>}>
                        <AutocompleteResults 
                          query={debouncedQuery} 
                          lang={i18n.language === 'pt' ? 'pt-BR' : 'en'} 
                          onSelect={(name) => {
                            setLocalQuery(name);
                            setIsDropdownOpen(false);
                            navigate(`/destination/${encodeURIComponent(name)}`);
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

        {/* Interests */}
        <div className="space-y-4">
          <label className="text-label-sm font-bold uppercase block">{t('explore.interests')}</label>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <button 
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`px-4 py-1 border border-outline-variant rounded-full text-xs font-medium transition-colors ${
                  activeInterests.includes(interest)
                    ? 'bg-on-surface text-surface'
                    : 'bg-surface text-on-surface hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => {
            setLocalQuery('');
            setActiveInterests([]);
            setSortBy(t('explore.relevance'));
          }}
          className="w-full bg-surface border border-outline-variant text-on-surface py-4 font-bold uppercase tracking-widest rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all active:scale-95"
        >
          {t('explore.apply_filters', 'Clear Filters')}
        </button>
      </aside>

      {/* Main Grid */}
      <section className="flex-1">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-h1 mb-2">{t('explore.destinations_title')}</h1>
            <p className="text-body-lg text-neutral-500">{t('explore.discover_subtitle')}</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-label-sm text-neutral-500">
            <span>{t('explore.sort_by')}</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none focus:ring-0 font-bold text-on-surface cursor-pointer dark:bg-surface"
            >
              <option>{t('explore.relevance')}</option>
              <option>{t('explore.price_low_high')}</option>
              <option>{t('explore.rating')}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredDestinations.length === 0 && localQuery.trim().length > 2 ? (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group bg-surface border border-outline-variant rounded-xl overflow-hidden hover:border-on-surface transition-all col-span-full lg:col-span-1"
            >
              <div className="h-64 relative overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <Globe2 size={64} className="text-neutral-300 dark:text-neutral-700" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-h3 capitalize">{localQuery}</h3>
                  <span className="text-xs font-bold bg-neutral-200 dark:bg-neutral-700 px-2 py-1 rounded">Web</span>
                </div>
                <p className="text-neutral-500 text-sm mb-6 line-clamp-2">
                  {t('explore.plan_trip_here', 'Plan a Trip Here')}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-tighter border border-neutral-200 px-2 py-0.5 rounded">
                      Explore
                    </span>
                  </div>
                  <Link to={`/destination/${encodeURIComponent(localQuery.trim())}`} className="text-on-surface group-hover:translate-x-2 transition-transform">
                    <ArrowRight size={20} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : filteredDestinations.length === 0 ? (
            <div className="col-span-full py-20 text-center text-neutral-500 flex flex-col items-center">
              <Frown size={48} className="mb-4 text-neutral-300" />
              <h3 className="text-xl font-bold text-on-surface mb-2">{t('explore.no_destinations')}</h3>
              <p>{t('explore.adjust_search')}</p>
            </div>
          ) : (
            filteredDestinations.map((dest, idx) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={dest.city}
                className="group bg-surface border border-outline-variant rounded-xl overflow-hidden hover:border-on-surface transition-all"
              >
                <div className="h-64 relative overflow-hidden">
                  <img src={dest.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={dest.city} />
                  <button 
                    onClick={() => toggleDestination(dest)}
                    className="absolute top-4 right-4 p-2 bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-on-surface hover:text-surface transition-all"
                  >
                    <Heart size={18} className={isSaved(dest.city) ? "fill-current text-red-500" : ""} />
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-h3">{dest.city}, {dest.country}</h3>
                    <span className="text-lg font-bold">${dest.pricePerWeek}</span>
                  </div>
                  <p className="text-neutral-500 text-sm mb-6 line-clamp-2">
                    {t(`destinations.${dest.city.toLowerCase()}.tagline`, dest.tagline)}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {dest.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[10px] uppercase font-bold text-neutral-400 tracking-tighter border border-neutral-200 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link to={`/destination/${dest.city}`} className="text-on-surface group-hover:translate-x-2 transition-transform">
                      <ArrowRight size={20} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
