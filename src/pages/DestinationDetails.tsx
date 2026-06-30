import axios from 'axios'
import { ArrowLeft, Cloud, CloudRain, Globe2, Heart, MapPin, Plus, Sun, Wind } from 'lucide-react'
import { motion } from 'motion/react'
import { Suspense } from 'react'
import useSWR from 'swr'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { FEATURED_DESTINATIONS } from '../constants'
import { useDestinationsStore } from '../store/useStore'
import { DestinationSkeleton } from '../components/Skeletons'
import { DestinationCard } from '../components/DestinationCard'
import { Badge, Button, Card } from '../components/ui'
import { fetchWikipediaSummary, getWikipediaSummaryImage, type WikipediaSummary } from '../lib/wikipedia'
import { useToastStore } from '../store/useToastStore'

const weatherFetcher = async (url: string) => {
  try {
    const { data } = await axios.get(url)
    return data && typeof data === 'object' ? data : null
  } catch {
    return null
  }
}

function DestinationContent() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const { isSaved, toggleDestination } = useDestinationsStore()
  const { addToast } = useToastStore()

  const lang = i18n.language === 'pt' ? 'pt' : 'en'

  // Fetch Wikipedia data using SWR and Suspense
  const { data: wikiData } = useSWR<WikipediaSummary | null>(
    id ? ['wikipedia-summary', id, lang] : null,
    ([, query, wikiLang]: [string, string, string]) => fetchWikipediaSummary(query, wikiLang),
    { suspense: true }
  )

  // Try to fetch weather using SWR and Suspense
  const { data: weather } = useSWR(
    id ? `/api/weather?city=${encodeURIComponent(id)}` : null,
    weatherFetcher,
    { suspense: true }
  )

  if (!wikiData) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-32 text-center space-y-6">
        <Globe2 className="w-16 h-16 mx-auto text-primary" />
        <h2 className="text-h2">{t('explore.no_destinations')}</h2>
        <p className="text-outline max-w-md mx-auto">
          {t('explore.adjust_search')}
        </p>
        <Button
          as={Link}
          to="/"
          className="mt-4"
        >
          {t('explore.back_to_search')}
        </Button>
      </div>
    )
  }

  const weatherData = weather && typeof weather === 'object' ? weather : null
  const isWeatherUnavailable = !weatherData?.main

  const WeatherIcon = () => {
    if (!weatherData?.weather?.[0]) return <Cloud className="text-primary/35" />
    const desc = (weatherData.weather[0].main || weatherData.weather[0].description || '').toLowerCase()
    if (desc.includes('sun') || desc.includes('clear'))
      return <Sun className="text-orange-400" />
    if (desc.includes('rain')) return <CloudRain className="text-blue-400" />
    return <Cloud className="text-primary/50" />
  }

  const imageUrl =
    getWikipediaSummaryImage(wikiData) ||
    'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&q=80&w=1000'

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-12">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-label-sm text-outline hover:text-primary transition-colors"
      >
        <ArrowLeft size={16} /> {t('explore.back_to_search')}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Gallery/Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="aspect-[4/5] rounded-lg overflow-hidden bg-primary-container border border-outline-variant sticky top-32 shadow-xl shadow-blue-950/10"
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
            <Badge>
              {wikiData.description || 'Destination'}
            </Badge>
            <h1 className="text-h1 mt-2">{wikiData.title}</h1>
          </div>
          
          <Button
            variant="secondary"
            onClick={() => {
              const wasSaved = isSaved(wikiData.title || id || '')
              const destObj = FEATURED_DESTINATIONS.find(
                d => d.city.toLowerCase() === (id || '').toLowerCase()
              ) || {
                city: wikiData.title || id || '',
                country: '',
                tagline: wikiData.description || '',
                description: wikiData.extract || '',
                pricePerWeek: 0,
                tags: [],
                image: imageUrl,
                lat: wikiData.coordinates?.lat || 0,
                lng: wikiData.coordinates?.lon || 0,
              }
              toggleDestination(destObj)
              addToast(
                wasSaved
                  ? t('explore.destination_removed', 'Destination removed from your saved list.')
                  : t('explore.destination_saved', 'Destination saved to your list.'),
                wasSaved ? 'info' : 'success',
              )
            }}
          >
            <Heart 
              size={18} 
              className={isSaved(wikiData.title || id || '') ? 'fill-current text-red-500' : ''} 
            />
            {isSaved(wikiData.title || id || '') ? 'Saved to My Destinations' : 'Save Destination'}
          </Button>

          {/* APIs: Weather Widget */}
          <Card className="p-6 space-y-6">
            <h3 className="text-h3 border-b border-outline-variant pb-4 text-on-surface">
              {t('explore.live_stats')}
            </h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="flex items-center gap-4">
                <div className="bg-primary-container p-4 rounded-lg">
                  <WeatherIcon />
                </div>
                <div>
                  <p className="text-label-sm text-outline">
                    {t('explore.climate')}
                  </p>
                  <p className="text-xl font-bold">
                    {weatherData?.main?.temp != null ? `${Math.round(weatherData.main.temp)}°C` : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-primary-container p-4 rounded-lg">
                  <Wind className="text-primary" />
                </div>
                <div>
                  <p className="text-label-sm text-outline">
                    {t('explore.wind')}
                  </p>
                  <p className="text-xl font-bold">
                    {weatherData?.wind?.speed != null ? `${weatherData.wind.speed} km/h` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            {isWeatherUnavailable && (
              <p className="rounded-lg border border-outline-variant bg-primary-container/35 px-4 py-3 text-sm text-outline">
                {t('explore.weather_unavailable', 'Weather data is temporarily unavailable for this destination.')}
              </p>
            )}
          </Card>

          <div className="space-y-6">
            <h3 className="text-h3">{t('explore.cultural_overview')}</h3>
            <p className="text-outline text-base md:text-lg leading-relaxed">
              {wikiData.extract}
            </p>
            {wikiData.coordinates && (
              <p className="text-sm text-outline flex items-center gap-2 pt-4">
                <MapPin size={16} /> Coordinates: {wikiData.coordinates.lat},{' '}
                {wikiData.coordinates.lon}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              as={Link}
              to="/planner"
              size="lg"
              className="flex-1"
            >
              <Plus size={20} /> {t('explore.plan_trip_here')}
            </Button>
          </div>
        </div>
      </div>

      {/* Suggestions Section */}
      <section className="pt-20 border-t border-outline-variant">
        <h2 className="text-h2 mb-10">{t('explore.popular_destinations')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURED_DESTINATIONS.slice(0, 3).map(dest => (
            <DestinationCard
              key={dest.city}
              destination={{
                ...dest,
                tagline: t(`destinations.${dest.city.toLowerCase()}.tagline`, dest.tagline),
              }}
              href={`/destination/${dest.city}`}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

export default function DestinationDetails() {
  return (
    <Suspense fallback={<DestinationSkeleton />}>
      <DestinationContent />
    </Suspense>
  )
}
