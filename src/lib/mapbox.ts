import axios from 'axios'
import { FEATURED_DESTINATIONS } from '../constants'

export interface MapboxDestination {
  title: string
  description?: string
  extract?: string
  coordinates?: { lat: number; lon: number }
  image?: string
}

export interface MapboxLocation {
  name: string
  display_name: string
  coordinates: {
    lat: number;
    lng: number;
  };
  context: string;
}

const DEFAULT_TRAVEL_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=1200'

export async function fetchMapboxAutocomplete(query: string, lang: string): Promise<MapboxLocation[]> {
  const cleanQuery = query.trim()
  if (!cleanQuery) return []

  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ''
  const locale = lang === 'pt-BR' ? 'pt' : 'en'

  if (!token) {
    console.warn('Mapbox access token is not set.')
    // Fallback: return matched featured destinations
    return FEATURED_DESTINATIONS.filter(d => 
      d.city.toLowerCase().includes(cleanQuery.toLowerCase()) ||
      d.country.toLowerCase().includes(cleanQuery.toLowerCase())
    ).map(d => ({
      name: d.city,
      display_name: `${d.city}, ${d.country}`,
      coordinates: { lat: d.lat, lng: d.lng },
      context: d.tagline,
    }))
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cleanQuery)}.json?access_token=${token}&autocomplete=true&limit=5&language=${locale}`
  
  try {
    const { data } = await axios.get(url)
    return (data.features || []).map((feat: any) => ({
      name: feat.text,
      display_name: feat.place_name,
      coordinates: {
        lng: feat.center[0],
        lat: feat.center[1],
      },
      context: feat.properties?.category || feat.place_type?.[0] || '',
    }))
  } catch (err) {
    console.error('Mapbox geocoding failed:', err)
    return []
  }
}

export async function fetchMapboxDestination(id: string, lang: string): Promise<MapboxDestination | null> {
  const cleanId = id.trim()
  if (!cleanId) return null

  // 1. Check if it is a featured destination to use local high-quality data
  const featured = FEATURED_DESTINATIONS.find(
    d => d.city.toLowerCase() === cleanId.toLowerCase()
  )

  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ''
  const locale = lang === 'pt-BR' ? 'pt' : 'en'

  let title = featured ? featured.city : cleanId
  let description = featured ? featured.tagline : 'Destination'
  let extract = featured ? featured.description : ''
  let lat = featured ? featured.lat : 0
  let lon = featured ? featured.lng : 0
  let image = featured ? featured.image : DEFAULT_TRAVEL_IMAGE

  // 2. Query Mapbox to get correct coordinates and official name
  if (token) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cleanId)}.json?access_token=${token}&limit=1&language=${locale}`
    try {
      const { data } = await axios.get(url)
      const feature = data.features?.[0]
      if (feature) {
        title = feature.text
        description = feature.properties?.category || feature.place_type?.[0] || description
        lat = feature.center[1]
        lon = feature.center[0]
        
        if (!featured) {
          extract = locale === 'pt'
            ? `Explore e descubra a maravilhosa região de ${feature.place_name}. Planeje seu roteiro, encontre atividades e salve este destino para começar a planejar sua jornada de viagens.`
            : `Explore and discover the beautiful region of ${feature.place_name}. Plan your activities, create your custom itinerary, and save this destination to start your journey.`
        }
      }
    } catch (err) {
      console.error('Mapbox fetch destination coordinates failed:', err)
    }
  } else if (!featured) {
    // If no token and not featured, mock a default
    extract = locale === 'pt'
      ? `Explore a maravilhosa cidade de ${title}.`
      : `Explore the wonderful city of ${title}.`
  }

  return {
    title,
    description,
    extract,
    coordinates: { lat, lon },
    image,
  }
}
