import { motion } from 'motion/react'
import { Calendar, LogOut, Mail, MapPin, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { LowCortisolIcon } from '../components/Icons'
import { Badge, Button, Card, PageHeader } from '../components/ui'
import { useAuth } from '../store/AuthContext'

export default function Account() {
  const { user, signOut, isLocalSession } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <PageHeader
        eyebrow={<Badge>Profile</Badge>}
        title="My Account"
        description="Your saved places, trip activity, and traveler badges live here."
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-10"
      >
        <Card className="p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-primary/20 bg-primary-container text-primary">
              <User className="h-9 w-9" />
            </div>

            <div className="flex-1">
              <p className="text-label-sm text-outline">Signed in as</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-outline">
                <Mail className="h-4 w-4 text-primary" />
                <span>{user?.email}</span>
                {isLocalSession && <Badge>Local mode</Badge>}
              </div>
            </div>

            <Button onClick={handleSignOut} variant="danger">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>

          <div className="mt-8 border-t border-outline-variant pt-8">
            <h3 className="text-label-sm text-outline">My Badges</h3>
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary-container px-4 py-3">
                <LowCortisolIcon className="h-7 w-7 text-primary" />
                <div>
                  <p className="text-sm font-bold text-on-primary-container">Low Cortisol</p>
                  <p className="text-xs text-outline">Balanced planning</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-container text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold">Saved Destinations</h3>
          </div>
          <p className="mb-5 text-sm text-outline">You haven't saved any destinations yet.</p>
          <Button as={Link} to="/destinations" variant="secondary" size="sm">
            View Destinations
          </Button>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary-container text-primary">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold">My Trips</h3>
          </div>
          <p className="mb-5 text-sm text-outline">You don't have any upcoming trips planned.</p>
          <Button as={Link} to="/planner" variant="secondary" size="sm">
            Go to Planner
          </Button>
        </Card>
      </div>
    </div>
  )
}
