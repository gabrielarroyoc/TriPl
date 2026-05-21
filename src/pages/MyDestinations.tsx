import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin } from 'lucide-react'
import { DestinationCard } from '../components/DestinationCard'
import { Badge, Button, EmptyState, PageHeader } from '../components/ui'
import { useDestinationsStore } from '../store/useStore'

export default function MyDestinations() {
  const { t } = useTranslation()
  const { savedDestinations, toggleDestination } = useDestinationsStore()

  return (
    <div className="mx-auto min-h-[70vh] max-w-7xl px-6 py-12 md:px-12">
      <PageHeader
        eyebrow={<Badge>{t('nav.destinations')}</Badge>}
        title={t('destinations.my_destinations')}
        description={t('destinations.my_destinations_desc')}
      />

      <div className="mt-10">
        {savedDestinations.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title={t('destinations.no_saved')}
            description={t('destinations.explore_to_save')}
            action={
              <Button as={Link} to="/explore">
                {t('nav.explore')}
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {savedDestinations.map((destination, index) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                key={destination.city}
              >
                <DestinationCard
                  destination={destination}
                  href={`/destination/${destination.city}`}
                  isSaved
                  onToggleSaved={toggleDestination}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
