import { Compass, Globe2, Map, Search, Star, Users } from 'lucide-react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { FEATURED_DESTINATIONS } from '../constants'
import { cn } from '../lib/utils'

export default function Home() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate('/explore')
    }
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#f9f9f9]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white mt-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium tracking-widest uppercase mb-6">
              Tripe 2.0
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
            className="max-w-2xl mx-auto bg-white/10 backdrop-blur-xl p-2 rounded-2xl flex items-center shadow-2xl border border-white/20"
          >
            <Search className="text-white mx-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
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
                  {dest.tags[0]}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why TripNexus Section */}
      <section className="bg-black text-white py-32 mt-20 rounded-[3rem] mx-4 md:mx-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
              Tripe Experience
            </h2>
            <p className="text-white/60 text-lg">
              Redefining how you explore the globe.
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

