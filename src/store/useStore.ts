import { create } from "zustand";
import { Destination, Trip } from "../types";
import { persist } from "zustand/middleware";

interface TripStore {
  trips: Trip[];
  addTrip: (trip: Trip) => void;
  removeTrip: (id: string) => void;
  updateTrip: (id: string, trip: Partial<Trip>) => void;
}

export const useTripStore = create<TripStore>((set) => ({
  trips: [],
  addTrip: (trip) => set((state) => ({ trips: [trip, ...state.trips] })),
  removeTrip: (id) => set((state) => ({ trips: state.trips.filter((t) => t.id !== id) })),
  updateTrip: (id, trip) =>
    set((state) => ({
      trips: state.trips.map((t) => (t.id === id ? { ...t, ...trip } : t)),
    })),
}));

interface UIStore {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  isDarkMode: false,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}));

interface DestinationsStore {
  savedDestinations: Destination[];
  toggleDestination: (dest: Destination) => void;
  isSaved: (city: string) => boolean;
}

export const useDestinationsStore = create<DestinationsStore>()(
  persist(
    (set, get) => ({
      savedDestinations: [],
      toggleDestination: (dest) =>
        set((state) => {
          const exists = state.savedDestinations.some((d) => d.city === dest.city);
          if (exists) {
            return {
              savedDestinations: state.savedDestinations.filter(
                (d) => d.city !== dest.city
              ),
            };
          }
          return {
            savedDestinations: [...state.savedDestinations, dest],
          };
        }),
      isSaved: (city) =>
        get().savedDestinations.some((d) => d.city === city),
    }),
    {
      name: "destinations-storage",
    }
  )
);
