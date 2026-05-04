import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart, MapPin, ArrowRight } from "lucide-react";
import { useDestinationsStore } from "../store/useStore";

export default function MyDestinations() {
  const { t } = useTranslation();
  const { savedDestinations, toggleDestination } = useDestinationsStore();

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 min-h-[70vh]">
      <div className="mb-10">
        <h1 className="text-h1 mb-2">{t('destinations.my_destinations')}</h1>
        <p className="text-body-lg text-neutral-500">{t('destinations.my_destinations_desc')}</p>
      </div>

      {savedDestinations.length === 0 ? (
        <div className="py-20 text-center text-neutral-500 flex flex-col items-center border border-dashed border-outline-variant rounded-3xl bg-surface/50">
          <MapPin size={48} className="mb-4 text-neutral-300" />
          <h3 className="text-xl font-bold text-on-surface mb-2">{t('destinations.no_saved')}</h3>
          <p className="mb-8">{t('destinations.explore_to_save')}</p>
          <Link
            to="/explore"
            className="bg-on-surface text-surface px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:opacity-80 transition-all"
          >
            {t('nav.explore')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {savedDestinations.map((dest, idx) => (
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
                  <Heart size={18} className="fill-current text-red-500" />
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
          ))}
        </div>
      )}
    </div>
  );
}
