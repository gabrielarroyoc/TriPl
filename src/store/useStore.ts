import { create } from "zustand";
import { Trip, Destination } from "../types";

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
