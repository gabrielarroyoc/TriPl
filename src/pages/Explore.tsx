import { motion } from "motion/react";
import { FEATURED_DESTINATIONS } from "../constants";
import { Search, Calendar, Heart, ArrowRight, Frown } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

export default function Explore() {
  const interests = ["Culture", "Nature", "Culinary", "Adventure", "Relaxation"];
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q')?.toLowerCase() || '';

  const filteredDestinations = FEATURED_DESTINATIONS.filter(
    (dest) =>
      dest.city.toLowerCase().includes(query) ||
      dest.country.toLowerCase().includes(query) ||
      dest.tags.some((tag) => tag.toLowerCase().includes(query))
  );

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row gap-12">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-10">
        <div className="pb-4 border-b border-outline-variant">
          <h2 className="text-h3 mb-1">Filters</h2>
          <p className="text-label-sm text-neutral-500 uppercase tracking-widest font-bold">Refine your journey</p>
        </div>

        {/* Date Range Simulation */}
        <div className="space-y-4">
          <label className="text-label-sm font-bold uppercase block">Date Range</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Select dates" 
              className="w-full h-12 bg-white border border-outline-variant rounded-lg px-4 focus:ring-1 focus:ring-black outline-none"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          </div>
        </div>

        {/* Budget */}
        <div className="space-y-4">
          <label className="text-label-sm font-bold uppercase block">Budget</label>
          <input type="range" className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black" />
          <div className="flex justify-between text-xs font-medium text-neutral-500">
            <span>$500</span>
            <span>$10,000+</span>
          </div>
        </div>

        {/* Interests */}
        <div className="space-y-4">
          <label className="text-label-sm font-bold uppercase block">Interests</label>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <button 
                key={interest}
                className="px-4 py-1 bg-white border border-outline-variant rounded-full text-xs font-medium hover:bg-black hover:text-white transition-colors"
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        <button className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest rounded-lg hover:bg-neutral-800 transition-all active:scale-95">
          Apply Filters
        </button>
      </aside>

      {/* Main Grid */}
      <section className="flex-1">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-h1 mb-2">Destinations</h1>
            <p className="text-body-lg text-neutral-500">Discover where your next story begins.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-label-sm text-neutral-500">
            <span>Sort by:</span>
            <select className="bg-transparent border-none focus:ring-0 font-bold text-black cursor-pointer">
              <option>Relevance</option>
              <option>Price: Low to High</option>
              <option>Rating</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredDestinations.length === 0 ? (
            <div className="col-span-full py-20 text-center text-neutral-500 flex flex-col items-center">
              <Frown size={48} className="mb-4 text-neutral-300" />
              <h3 className="text-xl font-bold text-black mb-2">No destinations found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          ) : (
            filteredDestinations.map((dest, idx) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={dest.city}
                className="group bg-white border border-outline-variant rounded-xl overflow-hidden hover:border-black transition-all"
              >
                <div className="h-64 relative overflow-hidden">
                  <img src={dest.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={dest.city} />
                  <button className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-all">
                    <Heart size={18} />
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-h3">{dest.city}, {dest.country}</h3>
                    <span className="text-lg font-bold">${dest.pricePerWeek}</span>
                  </div>
                  <p className="text-neutral-500 text-sm mb-6 line-clamp-2">{dest.tagline}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {dest.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[10px] uppercase font-bold text-neutral-400 tracking-tighter border border-neutral-200 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link to={`/destination/${dest.city}`} className="text-black group-hover:translate-x-2 transition-transform">
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
