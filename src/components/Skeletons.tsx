import { Plane, Search } from "lucide-react";

export function DestinationSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 animate-pulse">
      <div className="mb-8">
        <div className="h-4 w-24 bg-primary-container/70 dark:bg-primary/15 rounded mb-4"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Gallery/Hero Skeleton */}
        <div className="aspect-[4/5] rounded-lg bg-primary-container/70 dark:bg-primary/15 border border-outline-variant sticky top-32"></div>

        {/* Content Skeleton */}
        <div className="space-y-10">
          <div>
            <div className="h-3 w-32 bg-primary-container/70 dark:bg-primary/15 rounded mb-4"></div>
            <div className="h-12 w-64 bg-primary-container/70 dark:bg-primary/15 rounded mb-6"></div>
            <div className="h-10 w-48 bg-primary-container/70 dark:bg-primary/15 rounded-lg"></div>
          </div>

          {/* APIs: Weather Widget Skeleton */}
          <div className="bg-surface border border-outline-variant p-8 rounded-lg space-y-6 shadow-sm">
            <div className="h-6 w-32 bg-primary-container/70 dark:bg-primary/15 rounded border-b border-outline-variant pb-4"></div>
            <div className="grid grid-cols-2 gap-8">
              <div className="flex items-center gap-4">
                <div className="bg-primary-container/70 dark:bg-primary/15 p-4 rounded-lg h-14 w-14"></div>
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-primary-container/70 dark:bg-primary/15 rounded"></div>
                  <div className="h-6 w-12 bg-primary-container/70 dark:bg-primary/15 rounded"></div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-primary-container/70 dark:bg-primary/15 p-4 rounded-lg h-14 w-14"></div>
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-primary-container/70 dark:bg-primary/15 rounded"></div>
                  <div className="h-6 w-16 bg-primary-container/70 dark:bg-primary/15 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="h-4 bg-primary-container/70 dark:bg-primary/15 rounded w-full"></div>
            <div className="h-4 bg-primary-container/70 dark:bg-primary/15 rounded w-11/12"></div>
            <div className="h-4 bg-primary-container/70 dark:bg-primary/15 rounded w-full"></div>
            <div className="h-4 bg-primary-container/70 dark:bg-primary/15 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FlightSkeleton() {
  return (
    <div className="mt-6 bg-surface border border-outline-variant rounded-lg p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-container/70 dark:bg-primary/15 flex items-center justify-center">
            <Plane size={16} className="text-primary/50" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-primary-container/70 dark:bg-primary/15 rounded"></div>
            <div className="h-3 w-16 bg-primary-container/70 dark:bg-primary/15 rounded"></div>
          </div>
        </div>
        <div className="h-6 w-20 bg-primary-container/70 dark:bg-primary/15 rounded-md"></div>
      </div>
      <div className="flex justify-between items-center text-center px-4">
        <div className="space-y-2">
          <div className="h-6 w-12 bg-primary-container/70 dark:bg-primary/15 rounded mx-auto"></div>
          <div className="h-3 w-20 bg-primary-container/70 dark:bg-primary/15 rounded"></div>
        </div>
        <div className="flex-1 px-8">
          <div className="h-px w-full bg-primary-container/70 dark:bg-primary/15 relative"></div>
        </div>
        <div className="space-y-2">
          <div className="h-6 w-12 bg-primary-container/70 dark:bg-primary/15 rounded mx-auto"></div>
          <div className="h-3 w-20 bg-primary-container/70 dark:bg-primary/15 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export function SearchDropdownSkeleton() {
  return (
    <div className="absolute top-full mt-2 w-full bg-surface border border-outline-variant rounded-lg shadow-2xl overflow-hidden z-50">
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Search size={16} className="text-primary/40" />
          <div className="h-4 w-48 bg-primary-container/70 dark:bg-primary/15 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center gap-3">
          <Search size={16} className="text-primary/40" />
          <div className="h-4 w-32 bg-primary-container/70 dark:bg-primary/15 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center gap-3">
          <Search size={16} className="text-primary/40" />
          <div className="h-4 w-40 bg-primary-container/70 dark:bg-primary/15 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
