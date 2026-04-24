import { useParams, Link } from "react-router-dom";
import { FEATURED_DESTINATIONS } from "../constants";
import { motion } from "motion/react";
import { Sun, Cloud, CloudRain, MapPin, Wind, ArrowLeft, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

export default function DestinationDetails() {
  const { id } = useParams();
  const destination = FEATURED_DESTINATIONS.find(d => d.city === id);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await axios.get(`/api/weather?city=${id}`);
        setWeather(res.data);
      } catch (err) {
        console.error("Weather fetch failed", err);
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, [id]);

  if (!destination) return <div className="p-20 text-center">Destination not found</div>;

  const WeatherIcon = () => {
    if (!weather) return <Cloud className="text-neutral-300" />;
    const desc = weather.weather[0].main.toLowerCase();
    if (desc.includes("sun") || desc.includes("clear")) return <Sun className="text-orange-400" />;
    if (desc.includes("rain")) return <CloudRain className="text-blue-400" />;
    return <Cloud className="text-neutral-400" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-12">
      <Link to="/explore" className="inline-flex items-center gap-2 text-label-sm font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors">
        <ArrowLeft size={16} /> Back to Search
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Gallery/Hero */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-100 border border-outline-variant"
        >
          <img src={destination.image} className="w-full h-full object-cover" alt={destination.city} />
        </motion.div>

        {/* Content */}
        <div className="space-y-10">
          <div>
            <span className="text-label-sm font-bold text-neutral-400 uppercase tracking-[0.2em]">{destination.country}</span>
            <h1 className="text-h1 mt-2">{destination.city}</h1>
            <p className="text-body-lg text-neutral-500 mt-4 leading-relaxed">{destination.tagline}</p>
          </div>

          {/* APIs: Weather Widget */}
          <div className="bg-white border border-outline-variant p-8 rounded-2xl space-y-6">
            <h3 className="text-h3 border-b border-outline-variant pb-4">Live Statistics</h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="flex items-center gap-4">
                <div className="bg-neutral-50 p-4 rounded-xl">
                  <WeatherIcon />
                </div>
                <div>
                  <p className="text-label-sm text-neutral-400 uppercase font-bold">Climate</p>
                  <p className="text-xl font-bold">{loading ? "..." : weather ? `${Math.round(weather.main.temp)}°C` : "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-neutral-50 p-4 rounded-xl">
                  <Wind className="text-blue-200" />
                </div>
                <div>
                  <p className="text-label-sm text-neutral-400 uppercase font-bold">Wind</p>
                  <p className="text-xl font-bold">{loading ? "..." : weather ? `${weather.wind.speed} km/h` : "N/A"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-h3">Quick Experience</h3>
            <p className="text-neutral-500 text-sm leading-relaxed">{destination.description}</p>
            <div className="flex flex-wrap gap-2">
              {destination.tags.map(tag => (
                <span key={tag} className="px-4 py-1.5 bg-neutral-100 text-neutral-600 rounded-full text-xs font-bold uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button className="flex-1 bg-primary text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3">
              <Plus size={20} /> Add to Itinerary
            </button>
            <button className="p-4 border border-outline-variant rounded-xl hover:bg-neutral-50 transition-colors">
              <MapPin />
            </button>
          </div>
        </div>
      </div>
      
      {/* Suggestions Section */}
      <section className="pt-10 border-t border-outline-variant">
        <h2 className="text-h2 mb-10">You might also like</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURED_DESTINATIONS.filter(d => d.city !== destination.city).slice(0, 3).map((dest) => (
            <Link key={dest.city} to={`/destination/${dest.city}`} className="group space-y-4">
              <div className="aspect-video rounded-xl overflow-hidden border border-outline-variant">
                <img src={dest.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={dest.city} />
              </div>
              <div>
                <h4 className="font-bold">{dest.city}, {dest.country}</h4>
                <p className="text-xs text-neutral-400">{dest.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
