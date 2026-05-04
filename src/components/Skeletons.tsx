import { motion } from "motion/react";
import { Plane, Search } from "lucide-react";

export function DestinationSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 animate-pulse">
      <div className="mb-8">
        <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded mb-4"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Gallery/Hero Skeleton */}
        <div className="aspect-[4/5] rounded-2xl bg-neutral-200 dark:bg-neutral-800 border border-outline-variant sticky top-32"></div>

        {/* Content Skeleton */}
        <div className="space-y-10">
          <div>
            <div className="h-3 w-32 bg-neutral-200 dark:bg-neutral-800 rounded mb-4"></div>
            <div className="h-12 w-64 bg-neutral-200 dark:bg-neutral-800 rounded mb-6"></div>
            <div className="h-10 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-xl"></div>
          </div>

          {/* APIs: Weather Widget Skeleton */}
          <div className="bg-surface border border-outline-variant p-8 rounded-2xl space-y-6 shadow-sm">
            <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-800 rounded border-b border-outline-variant pb-4"></div>
            <div className="grid grid-cols-2 gap-8">
              <div className="flex items-center gap-4">
                <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-xl h-14 w-14"></div>
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                  <div className="h-6 w-12 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-xl h-14 w-14"></div>
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                  <div className="h-6 w-16 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full"></div>
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-11/12"></div>
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full"></div>
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FlightSkeleton() {
  return (
    <div className="mt-6 bg-surface border border-outline-variant rounded-xl p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
            <Plane size={16} className="text-neutral-300 dark:text-neutral-600" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
            <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
          </div>
        </div>
        <div className="h-6 w-20 bg-neutral-200 dark:bg-neutral-800 rounded-full"></div>
      </div>
      <div className="flex justify-between items-center text-center px-4">
        <div className="space-y-2">
          <div className="h-6 w-12 bg-neutral-200 dark:bg-neutral-800 rounded mx-auto"></div>
          <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
        </div>
        <div className="flex-1 px-8">
          <div className="h-px w-full bg-neutral-200 dark:bg-neutral-800 relative"></div>
        </div>
        <div className="space-y-2">
          <div className="h-6 w-12 bg-neutral-200 dark:bg-neutral-800 rounded mx-auto"></div>
          <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export function SearchDropdownSkeleton() {
  return (
    <div className="absolute top-full mt-2 w-full bg-surface border border-outline-variant rounded-xl shadow-2xl overflow-hidden z-50">
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Search size={16} className="text-neutral-300" />
          <div className="h-4 w-48 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center gap-3">
          <Search size={16} className="text-neutral-300" />
          <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center gap-3">
          <Search size={16} className="text-neutral-300" />
          <div className="h-4 w-40 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
