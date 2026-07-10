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

const BLACKLIST_WORDS = [
  // English
  'massacre', 'shooting', 'bombing', 'attack', 'disaster', 'murder', 'assassination', 
  'accident', 'crash', 'tragedy', 'crisis', 'battle', 'war', 'riot', 'incident', 
  'epidemic', 'pandemic', 'death', 'killing', 'casualty', 'crimes', 'violence',
  // Portuguese
  'tiroteio', 'atentado', 'ataque', 'desastre', 'assassinato', 'acidente', 'tragédia', 
  'crise', 'batalha', 'guerra', 'rebelião', 'incidente', 'epidemia', 'pandemia', 
  'morte', 'homicídio', 'chacina', 'queda', 'crime', 'violência', 'sequestro'
]

function isContentSafe(title: string = '', description: string = '', extract: string = ''): boolean {
  const combinedText = `${title} ${description} ${extract}`.toLowerCase()
  return !BLACKLIST_WORDS.some(word => combinedText.includes(word))
}

function getWikipediaLang(lang: string) {
  return lang === 'pt-BR' ? 'pt' : lang === 'pt' ? 'pt' : 'en'
}

async function fetchSummaryByTitle(project: 'wikivoyage' | 'wikipedia', lang: string, title: string) {
  const response = await axios.get<WikipediaSummary>(
    `https://${lang}.${project}.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
    WIKIPEDIA_REQUEST_CONFIG,
  )
  return response.data
}

async function searchWikiTitle(project: 'wikivoyage' | 'wikipedia', lang: string, query: string) {
  const response = await axios.get(`https://${lang}.${project}.org/w/api.php`, {
    ...WIKIPEDIA_REQUEST_CONFIG,
    params: {
      action: 'query',
      list: 'search',
      srsearch: query,
      srlimit: 5,
      format: 'json',
      origin: '*',
    },
  })

  const results = response.data?.query?.search || []
  
  for (const item of results) {
    const title = item.title as string
    if (isContentSafe(title)) {
      return title
    }
  }

  return undefined
}

export async function fetchWikipediaSummary(term: string, lang: string) {
  const query = normalizeSearchTerm(term)
  if (!query) return null

  const primaryLang = getWikipediaLang(lang)
  const fallbackLang = primaryLang === 'pt' ? 'en' : 'pt'

  // 1. Try Wikivoyage first (100% travel-oriented and safe from tragedies)
  for (const wikiLang of [primaryLang, fallbackLang]) {
    try {
      const canonicalTitle = await searchWikiTitle('wikivoyage', wikiLang, query)
      if (canonicalTitle) {
        const summary = await fetchSummaryByTitle('wikivoyage', wikiLang, canonicalTitle)
        if (summary && isContentSafe(summary.title, summary.description, summary.extract)) {
          return summary
        }
      }
    } catch {
      // Try direct titles on Wikivoyage below
    }

    const titles = Array.from(new Set([toTitleCase(query), query]))

    for (const title of titles) {
      try {
        const summary = await fetchSummaryByTitle('wikivoyage', wikiLang, title)
        if (summary && isContentSafe(summary.title, summary.description, summary.extract)) {
          return summary
        }
      } catch {
        // Try next candidate
      }
    }
  }

  // 2. Fall back to Wikipedia with strict blacklist checking
  for (const wikiLang of [primaryLang, fallbackLang]) {
    try {
      const canonicalTitle = await searchWikiTitle('wikipedia', wikiLang, query)
      if (canonicalTitle) {
        const summary = await fetchSummaryByTitle('wikipedia', wikiLang, canonicalTitle)
        if (summary && isContentSafe(summary.title, summary.description, summary.extract)) {
          return summary
        }
      }
    } catch {
      // Try direct titles on Wikipedia below
    }

    const titles = Array.from(new Set([toTitleCase(query), query]))

    for (const title of titles) {
      try {
        const summary = await fetchSummaryByTitle('wikipedia', wikiLang, title)
        if (summary && isContentSafe(summary.title, summary.description, summary.extract)) {
          return summary
        }
      } catch {
        // Try next candidate
      }
    }
  }

  return null
}

export function getWikipediaSummaryImage(summary: WikipediaSummary | null | undefined) {
  return summary?.originalimage?.source || summary?.thumbnail?.source || null
}
