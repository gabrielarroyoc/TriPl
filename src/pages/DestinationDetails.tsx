import axios from 'axios'
import { ArrowLeft, Cloud, CloudRain, Globe2, MapPin, Plus, Sun, Wind } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { FEATURED_DESTINATIONS } from '../constants'

interface WikiData {
  title: string
  extract: string
  thumbnail?: { source: string }
  originalimage?: { source: string }
  description?: string
  coordinates?: { lat: number; lon: number }
}

export default function DestinationDetails() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const [wikiData, setWikiData] = useState<WikiData | null>(null)
  const [weather, setWeather] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchData() {
      if (!id) return
      setLoading(true)
      setError(false)
      
      try {
        // Fetch Wikipedia data based on current language
        const lang = i18n.language === 'pt' ? 'pt' : 'en'
        const wikiRes = await axios.get(
          `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(id)}`
        )
        setWikiData(wikiRes.data)

        // Try to fetch weather
        const weatherRes = await axios.get(`/api/weather?city=${encodeURIComponent(id)}`)
        setWeather(weatherRes.data)
      } catch (err) {
        console.error('Failed to fetch destination data', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, i18n.language])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-32 flex flex-col items-center justify-center space-y-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-full border-4 border-neutral-100 dark:border-neutral-800 border-t-on-surface dark:border-t-on-surface"
        />
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-label-sm font-bold uppercase tracking-widest text-neutral-400"
        >
          {t('explore.loading_destination')}
        </motion.p>
      </div>
    )
  }

  if (error || !wikiData) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-32 text-center space-y-6">
        <Globe2 className="w-16 h-16 mx-auto text-neutral-200" />
        <h2 className="text-h2">{t('explore.no_destinations')}</h2>
        <p className="text-neutral-500 max-w-md mx-auto">
          {t('explore.adjust_search')}
        </p>
        <Link
          to="/"
          className="inline-block mt-8 bg-on-surface text-surface px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
        >
          {t('explore.back_to_search')}
        </Link>
      </div>
    )
  }

  const WeatherIcon = () => {
    if (!weather) return <Cloud className="text-neutral-300" />
    const desc = (weather.weather[0].main || weather.weather[0].description || '').toLowerCase()
    if (desc.includes('sun') || desc.includes('clear'))
      return <Sun className="text-orange-400" />
    if (desc.includes('rain')) return <CloudRain className="text-blue-400" />
    return <Cloud className="text-neutral-400" />
  }

  // Fallback image if wiki doesn't provide one
  const imageUrl =
    wikiData.originalimage?.source || wikiData.thumbnail?.source ||
    'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&q=80&w=1000'

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-12">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-label-sm font-bold uppercase tracking-widest text-neutral-400 hover:text-on-surface transition-colors"
      >
        <ArrowLeft size={16} /> {t('explore.back_to_search')}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Gallery/Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-100 border border-outline-variant sticky top-32"
        >
          <img
            src={imageUrl}
            className="w-full h-full object-cover"
            alt={wikiData.title}
          />
        </motion.div>

        {/* Content */}
        <div className="space-y-10">
          <div>
            <span className="text-label-sm font-bold text-neutral-400 uppercase tracking-[0.2em]">
              {wikiData.description || 'Destination'}
            </span>
            <h1 className="text-h1 mt-2">{wikiData.title}</h1>
          </div>

          {/* APIs: Weather Widget */}
          <div className="bg-surface border border-outline-variant p-8 rounded-2xl space-y-6 shadow-sm">
            <h3 className="text-h3 border-b border-outline-variant pb-4 text-on-surface">
              {t('explore.live_stats')}
            </h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="flex items-center gap-4">
                <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl">
                  <WeatherIcon />
                </div>
                <div>
                  <p className="text-label-sm text-neutral-400 uppercase font-bold">
                    {t('explore.climate')}
                  </p>
                  <p className="text-xl font-bold">
                    {weather?.main?.temp != null ? `${Math.round(weather.main.temp)}°C` : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl">
                  <Wind className="text-blue-200" />
                </div>
                <div>
                  <p className="text-label-sm text-neutral-400 uppercase font-bold">
                    {t('explore.wind')}
                  </p>
                  <p className="text-xl font-bold">
                    {weather?.wind?.speed != null ? `${weather.wind.speed} km/h` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-h3">{t('explore.cultural_overview')}</h3>
            <p className="text-neutral-600 text-base md:text-lg leading-relaxed">
              {wikiData.extract}
            </p>
            {wikiData.coordinates && (
              <p className="text-sm text-neutral-400 flex items-center gap-2 pt-4">
                <MapPin size={16} /> Coordinates: {wikiData.coordinates.lat},{' '}
                {wikiData.coordinates.lon}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Link
              to="/planner"
              className="flex-1 bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3"
            >
              <Plus size={20} /> {t('explore.plan_trip_here')}
            </Link>
          </div>
        </div>
      </div>

      {/* Suggestions Section */}
      <section className="pt-20 border-t border-outline-variant">
        <h2 className="text-h2 mb-10">{t('explore.popular_destinations')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURED_DESTINATIONS.slice(0, 3).map(dest => (
            <Link
              key={dest.city}
              to={`/destination/${dest.city}`}
              className="group space-y-4"
            >
              <div className="aspect-video rounded-xl overflow-hidden border border-outline-variant">
                <img
                  src={dest.image}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  alt={dest.city}
                />
              </div>
              <div>
                <h4 className="font-bold">
                  {dest.city}, {dest.country}
                </h4>
                <p className="text-xs text-neutral-400">
                  {t(`destinations.${dest.city.toLowerCase()}.tagline`, dest.tagline)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
