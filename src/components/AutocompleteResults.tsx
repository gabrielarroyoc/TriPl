import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import useSWR from 'swr'
import { fetchMapboxAutocomplete } from '../lib/mapbox'

export const fetchAutocomplete = async ([_, query, lang]: [string, string, string]) => {
  if (!query) return []
  const results = await fetchMapboxAutocomplete(query, lang)
  return results.map(item => ({
    name: item.name,
    display_name: item.display_name,
    image: null
  }))
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
    return <p className={`px-6 py-4 text-sm ${isDark ? 'text-white/60' : '!text-slate-500'}`}>{t('home.no_suggestions', { query })}</p>
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
              : '!text-slate-950 hover:bg-primary-container/40 hover:!text-on-primary-container'
          }`}
        >
          {s.image ? (
            <img src={s.image} alt={s.name} className={`w-10 h-10 rounded-lg object-cover border transition-colors ${
              isDark ? 'border-white/20 group-hover:border-white/50' : 'border-slate-200 group-hover:border-primary/40'
            }`} />
          ) : (
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isDark ? 'bg-white/10' : 'bg-primary-container/30'
            }`}>
              <Search size={16} className={isDark ? 'text-white/50' : 'text-primary'} />
            </div>
          )}
          <div className="flex flex-col truncate">
            <span className="font-bold">{s.name}</span>
            <span className={`text-xs truncate capitalize ${isDark ? 'text-white/60' : '!text-slate-500'}`}>{s.display_name}</span>
          </div>
        </button>
      ))}
    </>
  )
}
