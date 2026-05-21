import axios from 'axios'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import useSWR from 'swr'

export const fetchAutocomplete = async ([_, query, lang]: [string, string, string]) => {
  if (!query) return []
  
  // 1. Fetch strict geographical locations from Nominatim
  const nomRes = await axios.get(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&accept-language=${lang}`
  )
  
  const validClasses = ['place', 'boundary']
  const filtered = (nomRes.data || []).filter((item: any) => validClasses.includes(item.class))
  const uniqueItems = Array.from(new Map(filtered.map((item: any) => [item.name, item])).values()) as any[]

  // 2. Fetch thumbnails from Wikipedia
  const wikiLang = lang === 'pt-BR' ? 'pt' : 'en'
  const enriched = await Promise.all(
    uniqueItems.map(async (item) => {
      try {
        const wikiRes = await axios.get(
          `https://${wikiLang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(item.name)}`
        )
        return {
          name: item.name,
          display_name: item.display_name,
          image: wikiRes.data?.thumbnail?.source || wikiRes.data?.originalimage?.source || null
        }
      } catch (err) {
        return {
          name: item.name,
          display_name: item.display_name,
          image: null
        }
      }
    })
  )

  return enriched
}

export function AutocompleteResults({ 
  query, 
  lang, 
  onSelect,
  isDark = true
}: { 
  query: string, 
  lang: string, 
  onSelect: (s: string) => void,
  isDark?: boolean
}) {
  const { t } = useTranslation()
  const { data: unique } = useSWR(
    query.trim() ? ['autocomplete', query, lang] : null,
    fetchAutocomplete,
    { suspense: true }
  )

  if (!unique || unique.length === 0) {
    return <p className={`px-6 py-4 text-sm ${isDark ? 'text-white/60' : 'text-outline'}`}>{t('home.no_suggestions', { query })}</p>
  }

  return (
    <>
      {unique.map(s => (
        <button
          key={s.name}
          onClick={() => onSelect(s.name)}
          className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-4 transition-colors group ${
            isDark 
              ? 'text-white hover:bg-white/10' 
              : 'text-on-surface hover:bg-primary-container'
          }`}
        >
          {s.image ? (
            <img src={s.image} alt={s.name} className={`w-10 h-10 rounded-lg object-cover border transition-colors ${
              isDark ? 'border-white/20 group-hover:border-white/50' : 'border-outline-variant group-hover:border-primary/40'
            }`} />
          ) : (
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isDark ? 'bg-white/10' : 'bg-primary-container'
            }`}>
              <Search size={16} className={isDark ? 'text-white/50' : 'text-primary'} />
            </div>
          )}
          <div className="flex flex-col truncate">
            <span className="font-bold">{s.name}</span>
            <span className={`text-xs truncate capitalize ${isDark ? 'text-white/60' : 'text-outline'}`}>{s.display_name}</span>
          </div>
        </button>
      ))}
    </>
  )
}
