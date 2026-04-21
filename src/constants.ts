import { Destination } from "./types";

export const FEATURED_DESTINATIONS: Destination[] = [
  {
    city: "Positano",
    country: "Italy",
    tagline: "The vertical dream of the Amalfi Coast",
    description: "A labyrinth of colors, steep stairs, and lemon-scented air that defines Mediterranean elegance.",
    pricePerWeek: 2400,
    tags: ["Romance", "Luxury", "Culinary"],
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=1200",
    lat: 40.6285,
    lng: 14.4850
  },
  {
    city: "Kyoto",
    country: "Japan",
    tagline: "Ancient tradition meets quiet modernity",
    description: "Experience the tranquil Zen gardens and historic shrines in Japan's cultural capital.",
    pricePerWeek: 1800,
    tags: ["Culture", "Nature", "Relaxation"],
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=1200",
    lat: 35.0116,
    lng: 135.7681
  },
  {
    city: "Venice",
    country: "Italy",
    tagline: "A floating masterpiece of engineering and art",
    description: "Wander through car-free streets and hidden bridges in one of the world's most unique cities.",
    pricePerWeek: 2100,
    tags: ["History", "Art", "Romance"],
    image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&q=80&w=1200",
    lat: 45.4408,
    lng: 12.3155
  },
  {
    city: "Santorini",
    country: "Greece",
    tagline: "Unparalleled sunset vistas and stark beauty",
    description: "Cycladic architecture against the deep azure of the Aegean Sea.",
    pricePerWeek: 3200,
    tags: ["Luxury", "Island", "Photography"],
    image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&q=80&w=1200",
    lat: 36.3932,
    lng: 25.4615
  }
];
