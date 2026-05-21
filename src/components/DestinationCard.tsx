import { ArrowRight, Heart, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Destination } from '../types'
import { cn } from '../lib/utils'
import { Badge, Card } from './ui'

export function DestinationCard({
  destination,
  href,
  isSaved,
  onToggleSaved,
  featured = false,
  compact = false,
  className,
}: {
  destination: Destination
  href: string
  isSaved?: boolean
  onToggleSaved?: (destination: Destination) => void
  featured?: boolean
  compact?: boolean
  className?: string
}) {
  const imageHeight = featured ? 'h-80 lg:h-96' : compact ? 'h-48' : 'h-60'
  const titleSize = featured ? 'text-3xl' : compact ? 'text-xl' : 'text-2xl'

  return (
    <Card
      className={cn(
        'group overflow-hidden transition-all hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:shadow-blue-950/10',
        className,
      )}
    >
      <div className={cn('relative overflow-hidden', imageHeight)}>
        <img
          src={destination.image}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          alt={`${destination.city}, ${destination.country}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-blue-950/10 to-transparent" />
        {onToggleSaved && (
          <button
            onClick={(event) => {
              event.preventDefault()
              onToggleSaved(destination)
            }}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-white/15 text-white backdrop-blur-md transition-all hover:bg-white hover:text-primary"
            aria-label={isSaved ? 'Remove saved destination' : 'Save destination'}
          >
            <Heart size={18} className={isSaved ? 'fill-current text-red-500' : ''} />
          </button>
        )}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 text-sm font-bold text-white">
          <MapPin size={16} />
          {destination.country}
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <h3 className={cn('font-bold leading-tight', titleSize)}>
              {destination.city}
            </h3>
            <p className="mt-1 text-sm text-outline">{destination.tagline}</p>
          </div>
          <span className="text-lg font-bold text-primary">${destination.pricePerWeek}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-wrap gap-2">
            {destination.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} className="bg-background text-outline">
                {tag}
              </Badge>
            ))}
          </div>
          <Link
            to={href}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white transition-transform group-hover:translate-x-1"
            aria-label={`Open ${destination.city}`}
          >
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </Card>
  )
}
