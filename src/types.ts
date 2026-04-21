export interface Destination {
  city: string;
  country: string;
  tagline: string;
  description: string;
  pricePerWeek: number;
  tags: string[];
  image: string;
  lat: number;
  lng: number;
}

export interface WeatherData {
  temp: number;
  description: string;
  icon: string;
}

export interface Activity {
  id: string;
  time: string;
  title: string;
  location: string;
  type: "Flight" | "Hotel" | "Museum" | "Dinner" | "Activity";
  icon: string;
}

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  destination: Destination;
  itinerary: Record<number, Activity[]>; // Day number -> Activities
}
