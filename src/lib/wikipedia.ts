import axios from 'axios'

const wikipediaHeaders: Record<string, string> = {
  'Api-User-Agent': 'TriPl/1.0 (https://tripl-ebon.vercel.app)',
}

if (typeof window === 'undefined') {
  wikipediaHeaders['User-Agent'] = 'TriPl/1.0 (https://tripl-ebon.vercel.app)'
}

const WIKIPEDIA_REQUEST_CONFIG = {
  headers: wikipediaHeaders,
}

export interface WikipediaSummary {
  title: string
  extract?: string
  thumbnail?: { source: string }
  originalimage?: { source: string }
  description?: string
  coordinates?: { lat: number; lon: number }
}

function normalizeSearchTerm(term: string) {
  return term.trim().replace(/\s+/g, ' ')
}

function toTitleCase(term: string) {
  return normalizeSearchTerm(term).replace(/\p{L}[\p{L}\p{M}'-]*/gu, word =>
    word.charAt(0).toLocaleUpperCase() + word.slice(1),
  )
}

function getWikipediaLang(lang: string) {
  return lang === 'pt-BR' ? 'pt' : lang === 'pt' ? 'pt' : 'en'
}

async function fetchSummaryByTitle(lang: string, title: string) {
  const response = await axios.get<WikipediaSummary>(
    `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
    WIKIPEDIA_REQUEST_CONFIG,
  )
  return response.data
}

async function searchWikipediaTitle(lang: string, query: string) {
  const response = await axios.get(`https://${lang}.wikipedia.org/w/api.php`, {
    ...WIKIPEDIA_REQUEST_CONFIG,
    params: {
      action: 'query',
      list: 'search',
      srsearch: query,
      srlimit: 1,
      format: 'json',
      origin: '*',
    },
  })

  return response.data?.query?.search?.[0]?.title as string | undefined
}

export async function fetchWikipediaSummary(term: string, lang: string) {
  const query = normalizeSearchTerm(term)
  if (!query) return null

  const primaryLang = getWikipediaLang(lang)
  const fallbackLang = primaryLang === 'pt' ? 'en' : 'pt'

  for (const wikiLang of [primaryLang, fallbackLang]) {
    try {
      const canonicalTitle = await searchWikipediaTitle(wikiLang, query)
      if (canonicalTitle) {
        return await fetchSummaryByTitle(wikiLang, canonicalTitle)
      }
    } catch {
      // Try direct title candidates below.
    }

    const titles = Array.from(new Set([toTitleCase(query), query]))

    for (const title of titles) {
      try {
        return await fetchSummaryByTitle(wikiLang, title)
      } catch {
        // Try the next title candidate, then the search API below.
      }
    }
  }

  return null
}

export function getWikipediaSummaryImage(summary: WikipediaSummary | null | undefined) {
  return summary?.originalimage?.source || summary?.thumbnail?.source || null
}
