import axios from 'axios'
import { addDays, format, parseISO } from 'date-fns'
import { ptBR, enUS } from 'date-fns/locale'
import {
  Calendar,
  CheckCircle2,
  Hotel,
  Info,
  Lock,
  LockOpen,
  MapPin,
  Plane,
  Plus,
  Search,
  Share2,
  Utensils,
  X,
} from 'lucide-react'
import { motion } from 'motion/react'
import { LowCortisolIcon } from '../components/Icons'
import { useEffect, useRef, useState, Suspense } from 'react'
import { cn } from '../lib/utils'
import { useTranslation } from 'react-i18next'
import Select from 'react-select'
import countryList from 'country-list'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../store/AuthContext'
import { useToastStore } from '../store/useToastStore'
import useSWR from 'swr'
import { FlightSkeleton } from '../components/Skeletons'
import { fetchWikipediaSummary, getWikipediaSummaryImage } from '../lib/wikipedia'
import { ActivityCard } from '../components/planner/ActivityCard'
import { PlannerAccordion } from '../components/planner/PlannerAccordion'
import { useStaggerReveal, useTextSwap } from '../hooks/useAuthTransitions'
import { useAvatarGroupHover, useVerticalDayPill } from '../hooks/usePlannerTransitions'

const flightFetcher = async (url: string) => {
  try {
    const { data } = await axios.get(url)
    if (!data || typeof data !== 'object' || !Array.isArray(data.data)) {
      return { data: [], requestFailed: true }
    }
    return data
  } catch {
    return { data: [], requestFailed: true }
  }
}

function FlightResult({ flightNumber }: { flightNumber: string }) {
  const { t } = useTranslation()
  const { addToast } = useToastStore()
  const { data } = useSWR(`/api/flights?flight_number=${flightNumber}`, flightFetcher, { suspense: true })
  const flightData = data?.data?.[0] || null

  useEffect(() => {
    if (data?.requestFailed) {
      addToast(t('planner.flight_lookup_error', 'Flight data is temporarily unavailable.'), 'warning')
    }
  }, [addToast, data?.requestFailed, t])

  if (!flightData) {
    return (
      <div className="mt-6 rounded-lg border border-outline-variant bg-primary-container/25 p-4 text-center text-sm text-outline">
        {data?.requestFailed
          ? t('planner.flight_lookup_error', 'Flight data is temporarily unavailable.')
          : t('planner.flight_not_found', 'Flight not found. Check the flight number and try again.')}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 p-4 bg-primary-container/35 dark:bg-primary/10 rounded-lg border border-outline-variant"
    >
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-outline-variant">
        <div>
          <p className="text-[10px] text-outline font-bold uppercase tracking-widest">
            {flightData.airline?.name}
          </p>
          <h5 className="font-bold">{flightData.flight?.iata}</h5>
        </div>
        <span
          className={cn(
            'text-[10px] uppercase font-bold px-2 py-1 rounded',
            flightData.flight_status === 'scheduled'
              ? 'bg-primary-container text-on-primary-container'
              : 'bg-primary text-white',
          )}
        >
          {flightData.flight_status}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-8 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary/35">
          <Plane size={16} className="rotate-90" />
        </div>
        <div>
          <p className="text-xl font-bold">
            {flightData.departure?.iata}
          </p>
          <p className="text-[10px] text-outline">
            {flightData.departure?.airport}
          </p>
        </div>
        <div>
          <p className="text-xl font-bold">
            {flightData.arrival?.iata}
          </p>
          <p className="text-[10px] text-outline">
            {flightData.arrival?.airport}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

interface Activity {
  id: string
  time: string
  title: string
  location: string
  type: 'Activity' | 'Flight' | 'Hotel' | 'Food' | 'Restaurant'
  notes?: string
  imageUrl?: string
  isCheckedIn?: boolean
  badges?: string[]
}



interface TripDay {
  date: string
  activities: Activity[]
  isPrivate?: boolean
  isCompleted?: boolean
}

interface Trip {
  startDate: string
  destination: string
  country: string
  days: TripDay[]
  ownerId?: string
}

const ACTIVITY_TYPES = [
  'Flight',
  'Hotel',
  'Restaurant',
  'Activity',
  'Transport',
  'Other',
]

const getActivityIcon = (type: string) => {
  const icons: { [key: string]: any } = {
    Flight: <Plane size={18} />,
    Hotel: <Hotel size={18} />,
    Restaurant: <Utensils size={18} />,
    Activity: <MapPin size={18} />,
    Transport: <MapPin size={18} />,
    Other: <Info size={18} />,
  }
  return icons[type] || <Info size={18} />
}

const COUNTRIES = countryList.getData().map(c => ({ value: c.code, label: c.name }))

function AddActivityForm({
  dayIndex,
  onAdd,
}: {
  dayIndex: number
  onAdd: (activity: Activity) => void
}) {
  const { t, i18n } = useTranslation()
  const [formData, setFormData] = useState({
    time: '12:00',
    title: '',
    location: '',
    type: 'Activity' as const,
    notes: '',
    imageUrl: '',
  })
  const [isSearching, setIsSearching] = useState(false)
  const { addToast } = useToastStore()

  const fetchImage = async () => {
    const searchTerms = formData.location || formData.title
    if (!searchTerms.trim()) {
      addToast(t('planner.image_search_missing', 'Add a title or location before searching for an image.'), 'warning')
      return
    }

    setIsSearching(true)
    try {
      const lang = i18n.language === 'pt' ? 'pt' : 'en'
      const summary = await fetchWikipediaSummary(searchTerms, lang)
      const imageUrl = getWikipediaSummaryImage(summary)
      if (imageUrl) {
        setFormData(prev => ({ 
          ...prev, 
          imageUrl,
        }))
        addToast(t('planner.image_search_success', 'Image added to the activity.'), 'success')
      } else {
        addToast(t('planner.image_search_empty', 'No image was found for this place.'), 'warning')
      }
    } catch (e) {
      console.error('Failed to fetch image', e)
      addToast(t('planner.image_search_error', 'Could not search for an image right now.'), 'error')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-outline block mb-2">
            {t('planner.time')}
          </label>
          <input
            type="time"
            value={formData.time}
            onChange={e => setFormData({ ...formData, time: e.target.value })}
            className="w-full bg-transparent text-on-surface border border-outline-variant rounded-lg px-4 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-outline block mb-2">
            {t('planner.type')}
          </label>
          <select
            value={formData.type}
            onChange={e =>
              setFormData({ ...formData, type: e.target.value as any })
            }
            className="w-full bg-transparent text-on-surface border border-outline-variant rounded-lg px-4 py-2 text-sm outline-none focus:border-primary"
          >
            {ACTIVITY_TYPES.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-widest text-outline block mb-2">
          {t('planner.title')}
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g. Flight to Tokyo"
          className="w-full bg-transparent text-on-surface border border-outline-variant rounded-lg px-4 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-widest text-outline block mb-2">
          {t('planner.location')}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={formData.location}
            onChange={e => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g. Haneda Airport"
            className="flex-1 bg-transparent border border-outline-variant rounded-lg px-4 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            onClick={fetchImage}
            disabled={isSearching}
            className="t-planner-icon-btn px-3 bg-primary-container text-primary rounded-lg hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Search for image"
          >
            {isSearching ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <Search size={16} />}
          </button>
        </div>
      </div>

      {formData.imageUrl && (
        <div className="relative group aspect-video rounded-lg overflow-hidden border border-outline-variant">
          <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
          <button 
            onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
            className="absolute top-2 right-2 p-1.5 bg-on-primary-container/80 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div>
        <label className="text-xs font-bold uppercase tracking-widest text-outline block mb-2">
          {t('planner.notes_optional')}
        </label>
        <textarea
          value={formData.notes}
          onChange={e => setFormData({ ...formData, notes: e.target.value })}
          placeholder="..."
          className="w-full bg-transparent text-on-surface border border-outline-variant rounded-lg px-4 py-2 text-sm outline-none focus:border-primary h-20"
        />
      </div>

      <button
        onClick={() => onAdd({ ...formData, id: Date.now().toString() })}
        className="t-planner-btn w-full bg-primary text-white py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-on-primary-container dark:bg-primary-container dark:text-on-primary-container dark:hover:bg-primary dark:hover:text-white shadow-lg shadow-primary/15"
      >
        {t('planner.add_activity')}
      </button>
    </div>
  )
}

export default function Planner() {
  const { t, i18n } = useTranslation()
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [showFlightSearch, setShowFlightSearch] = useState(false)
  const [flightNumber, setFlightNumber] = useState('')
  const [searchedFlight, setSearchedFlight] = useState('')
  const [isEditingImageSearch, setIsEditingImageSearch] = useState(false)
  const autoSaveErrorShownRef = useRef(false)

  const fetchEditImage = async () => {
    const searchTerms = editFormData?.location || editFormData?.title
    if (!searchTerms?.trim()) {
      addToast(t('planner.image_search_missing', 'Add a title or location before searching for an image.'), 'warning')
      return
    }

    setIsEditingImageSearch(true)
    try {
      const lang = i18n.language === 'pt' ? 'pt' : 'en'
      const summary = await fetchWikipediaSummary(searchTerms, lang)
      const imageUrl = getWikipediaSummaryImage(summary)
      if (imageUrl) {
        setEditFormData(prev => prev ? ({ 
          ...prev, 
          imageUrl,
        }) : null)
        addToast(t('planner.image_search_success', 'Image added to the activity.'), 'success')
      } else {
        addToast(t('planner.image_search_empty', 'No image was found for this place.'), 'warning')
      }
    } catch (e) {
      console.error('Failed to fetch image', e)
      addToast(t('planner.image_search_error', 'Could not search for an image right now.'), 'error')
    } finally {
      setIsEditingImageSearch(false)
    }
  }
  
  const defaultTrip: Trip = {
    startDate: '2026-05-01',
    destination: 'Tokyo, Japan',
    country: 'JP',
    days: [
      {
        date: '2026-05-01',
        activities: [
          {
            id: '1',
            time: '08:30',
            title: 'NH 202 · HND Arrival',
            location: 'Terminal 3, Haneda Airport',
            type: 'Flight',
          },
          {
            id: '2',
            time: '11:00',
            title: 'The Trunk Hotel',
            location: 'Shibuya-ku, Jingumae 5-31',
            type: 'Hotel',
          },
        ]
      },
      {
        date: '2026-05-02',
        activities: [
          {
            id: '3',
            time: '10:00',
            title: 'Senso-ji Temple',
            location: 'Asakusa, Tokyo',
            type: 'Activity',
          },
          {
            id: '4',
            time: '13:00',
            title: 'Lunch at Tsukiji',
            location: 'Tsukiji Market',
            type: 'Restaurant',
          },
        ]
      },
      {
        date: '2026-05-03',
        activities: [
          {
            id: '5',
            time: '14:00',
            title: 'Shibuya Crossing',
            location: 'Shibuya',
            type: 'Activity',
          },
        ]
      },
      {
        date: '2026-05-04',
        activities: [
          {
            id: '6',
            time: '09:00',
            title: 'Mount Fuji Day Trip',
            location: 'Hakone',
            type: 'Activity',
          },
        ]
      }
    ],
  }

  const [trip, setTrip] = useState<Trip>(defaultTrip)
  const [searchParams, setSearchParams] = useSearchParams()
  const tripId = searchParams.get('tripId')
  const [isSharing, setIsSharing] = useState(false)
  const { user } = useAuth()
  const { addToast } = useToastStore()
  const [presentUsers, setPresentUsers] = useState<{ id: string, email: string }[]>([])

  const [editingActivity, setEditingActivity] = useState<{
    dayIndex: number
    activityId?: string
    data: Partial<Activity>
  } | null>(null)

  const [showAddActivity, setShowAddActivity] = useState(false)
  const [showAddDateModal, setShowAddDateModal] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [editFormData, setEditFormData] = useState<Activity | null>(null)
  const dayNavRef = useRef<HTMLDivElement>(null)
  const dayPillRef = useRef<HTMLDivElement>(null)
  const presenceRef = useRef<HTMLDivElement>(null)
  const headerStaggerRef = useStaggerReveal(`${trip.destination}-${selectedDayIndex}`)
  const shareLabelRef = useTextSwap(
    isSharing ? t('planner.sharing') : tripId ? t('planner.copy_link') : t('planner.share_trip'),
  )

  useVerticalDayPill(dayNavRef, dayPillRef, selectedDayIndex)
  useAvatarGroupHover(presenceRef)

  // Load trip data (either from URL/Supabase or local storage)
  useEffect(() => {
    async function loadTrip() {
      if (tripId) {
        if (!supabase) {
          addToast(t('planner.link_error', 'Shared trips require Supabase configuration.'), 'error')
          return
        }

        try {
          const { data, error } = await supabase.from('shared_trips').select('trip_data').eq('id', tripId).single()
          if (error) throw error
          if (data && data.trip_data) {
            // Validation check
            if (data.trip_data.days && Array.isArray(data.trip_data.days)) {
              setTrip(data.trip_data)
            }
          }
        } catch (err) {
          console.error("Failed to fetch shared trip", err)
          addToast(t('planner.shared_trip_load_error', 'Could not load this shared trip. Try refreshing the page.'), 'error')
        }
      } else {
        const saved = localStorage.getItem('tripPlannerData')
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            if (parsed.days && parsed.days.length > 0 && typeof parsed.days[0].date === 'string') {
              setTrip(parsed)
            } else {
              setTrip(defaultTrip)
            }
          } catch (e) {
            setTrip(defaultTrip)
            addToast(t('planner.local_trip_restore_error', 'Your saved local itinerary could not be restored, so we started a fresh one.'), 'warning')
          }
        }
      }
    }
    loadTrip()
  }, [tripId])

  // Realtime Presence sync
  useEffect(() => {
    if (!tripId || !user || !supabase) return

    const room = supabase.channel(`trip-${tripId}`)

    room
      .on('presence', { event: 'sync' }, () => {
        const state = room.presenceState()
        // Flatten the object to get all connected user states
        const users = Object.values(state).flatMap((presenceList: any) => presenceList)
        // Deduplicate by user id (in case someone has multiple tabs open)
        const uniqueUsers = Array.from(new Map(users.map((u: any) => [u.id, u])).values())
        setPresentUsers(uniqueUsers as { id: string, email: string }[])
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await room.track({ id: user.id, email: user.email })
        }
      })

    return () => {
      supabase.removeChannel(room)
    }
  }, [tripId, user])

  // Debounced remote saving for collaborative edits
  useEffect(() => {
    if (!tripId || !trip || !supabase) return
    const timeout = setTimeout(async () => {
      try {
        await supabase.from('shared_trips').update({ trip_data: trip }).eq('id', tripId)
        autoSaveErrorShownRef.current = false
      } catch (err) {
        console.error("Failed to auto-save to cloud", err)
        if (!autoSaveErrorShownRef.current) {
          addToast(t('planner.autosave_error', 'Could not auto-save to the shared trip. Your latest edits may still be local.'), 'warning')
          autoSaveErrorShownRef.current = true
        }
      }
    }, 1500)
    return () => clearTimeout(timeout)
  }, [addToast, t, trip, tripId])

  const saveTrip = (newTrip: Trip) => {
    setTrip(newTrip)
    if (!tripId) {
      localStorage.setItem('tripPlannerData', JSON.stringify(newTrip))
    }
  }

  const handleShare = async () => {
    if (tripId) {
      navigator.clipboard.writeText(window.location.href)
      addToast(t('planner.link_copied', 'Link copied to clipboard! Share it with your friends.'), 'success')
      return
    }

    if (!supabase) {
      addToast(t('planner.link_error', 'Shared links require Supabase configuration.'), 'error')
      return
    }

    setIsSharing(true)
    try {
      const tripWithSharedOwner = { ...trip, ownerId: user?.id }
      const { data, error } = await supabase.from('shared_trips').insert({ trip_data: tripWithSharedOwner }).select().single()
      if (error) throw error
      if (data) {
        setSearchParams({ tripId: data.id })
        setTrip(tripWithSharedOwner)
        navigator.clipboard.writeText(`${window.location.origin}/planner?tripId=${data.id}`)
        addToast(t('planner.link_copied', 'Shareable link generated and copied to clipboard!'), 'success')
      }
    } catch (err) {
      console.error(err)
      addToast(t('planner.link_error', 'Failed to generate link. Ensure Supabase database is configured.'), 'error')
    } finally {
      setIsSharing(false)
    }
  }

  const searchFlight = () => {
    if (!flightNumber.trim()) {
      addToast(t('planner.flight_lookup_missing', 'Enter a flight number before searching.'), 'warning')
      return
    }
    setSearchedFlight(flightNumber)
  }

  const isOwner = !tripId || (user && trip.ownerId === user.id)

  const getIntensityInfo = (count: number) => {
    if (count === 0) return { label: 'Empty', color: 'text-outline', icon: '💨', progress: 0 }
    if (count <= 3) return { label: t('planner.intensity.balanced', 'Balanced'), color: 'text-primary', icon: '🧘', progress: 33 }
    if (count <= 5) return { label: t('planner.intensity.active', 'Active'), color: 'text-primary', icon: '🏃', progress: 66 }
    return { label: t('planner.intensity.heavy', 'Heavy'), color: 'text-on-primary-container', icon: '🔥', progress: 100 }
  }

  const toggleCheckIn = (dayIndex: number, activityId: string) => {
    const newDays = [...trip.days]
    newDays[dayIndex].activities = newDays[dayIndex].activities.map(act => {
      if (act.id === activityId) {
        const isCheckingIn = !act.isCheckedIn
        return {
          ...act,
          isCheckedIn: isCheckingIn,
          badges: isCheckingIn ? [...(act.badges || []), 'LOW CORTISOL'] : (act.badges || []).filter(b => b !== 'LOW CORTISOL')
        }
      }
      return act
    })
    const newTrip = { ...trip, days: newDays }
    saveTrip(newTrip)
    
    const activity = newDays[dayIndex].activities.find(a => a.id === activityId)
    if (activity?.isCheckedIn) {
      addToast(t('planner.badge_unlocked'), 'success')
    }
  }

  const toggleDayCheckIn = async (dayIndex: number) => {
    const newDays = [...trip.days]
    newDays[dayIndex].isCompleted = !newDays[dayIndex].isCompleted
    const newTrip = { ...trip, days: newDays }
    saveTrip(newTrip)
    
    if (newDays[dayIndex].isCompleted) {
      addToast(t('planner.day_completed', 'Day Completed! Enjoy your badges! 🏆'), 'success')
      
      // Persist badge to profile forever
      if (user && supabase) {
        try {
          const { data: profile } = await supabase.from('profiles').select('badges').eq('id', user.id).single()
          const currentBadges = profile?.badges || []
          if (!currentBadges.includes('LOW CORTISOL')) {
            await supabase.from('profiles').upsert({ 
              id: user.id, 
              badges: [...currentBadges, 'LOW CORTISOL'],
              updated_at: new Date().toISOString()
            })
            addToast(t('planner.profile_badge_added'), 'success')
          }
        } catch (e) {
          console.error("Failed to persist badge", e)
          addToast(t('planner.profile_badge_error', 'Badge unlocked, but it could not be saved to your profile right now.'), 'warning')
        }
      }
    }
  }

  const toggleDayPrivacy = (dayIndex: number) => {
    if (!isOwner) return
    const newDays = [...trip.days]
    newDays[dayIndex].isPrivate = !newDays[dayIndex].isPrivate
    const newTrip = { ...trip, days: newDays }
    saveTrip(newTrip)
    
    if (newDays[dayIndex].isPrivate) {
      addToast(t('planner.day_private', 'This day is now private and hidden from collaborators.'), 'info')
    } else {
      addToast(t('planner.day_public', 'This day is now visible to everyone.'), 'info')
    }
  }

  const addDay = () => {
    if (!newDate) return
    // check if date already exists
    if (trip.days.find(d => d.date === newDate)) {
      addToast(t('planner.duplicate_day', 'This day already exists in your itinerary.'), 'warning')
      setShowAddDateModal(false)
      return
    }
    const newTrip = {
      ...trip,
      days: [...trip.days, { date: newDate, activities: [] }].sort((a, b) => a.date.localeCompare(b.date)),
    }
    saveTrip(newTrip)
    setShowAddDateModal(false)
    setNewDate('')
  }

  // Redirect if current day is private and not owner
  useEffect(() => {
    if (trip.days.length > 0 && !isOwner && trip.days[selectedDayIndex]?.isPrivate) {
      const firstVisible = trip.days.findIndex(d => !d.isPrivate)
      if (firstVisible !== -1) setSelectedDayIndex(firstVisible)
    }
  }, [selectedDayIndex, isOwner, trip.days])

  const removeDay = (dayIndex: number) => {
    if (trip.days.length === 1) return
    const newTrip = {
      ...trip,
      days: trip.days.filter((_, i) => i !== dayIndex),
    }
    saveTrip(newTrip)
    setSelectedDayIndex(Math.max(0, selectedDayIndex - 1))
  }

  const addActivity = (dayIndex: number, activity: Activity) => {
    const newDays = [...trip.days]
    if (!newDays[dayIndex]) return
    newDays[dayIndex].activities = [...newDays[dayIndex].activities, activity]
    const newTrip = { ...trip, days: newDays }
    saveTrip(newTrip)
    addToast(t('planner.activity_added', 'Activity added to your itinerary.'), 'success')
    setShowAddActivity(false)
  }

  const updateActivity = (
    dayIndex: number,
    activityId: string,
    updated: Activity,
  ) => {
    const newDays = [...trip.days]
    if (!newDays[dayIndex]) return
    newDays[dayIndex].activities = newDays[dayIndex].activities.map(act =>
      act.id === activityId ? updated : act,
    )
    const newTrip = { ...trip, days: newDays }
    saveTrip(newTrip)
    addToast(t('planner.activity_updated', 'Activity updated.'), 'success')
    setEditingActivity(null)
    setEditFormData(null)
  }

  const deleteActivity = (dayIndex: number, activityId: string) => {
    const newDays = [...trip.days]
    if (!newDays[dayIndex]) return
    newDays[dayIndex].activities = newDays[dayIndex].activities.filter(act => act.id !== activityId)
    const newTrip = { ...trip, days: newDays }
    saveTrip(newTrip)
    addToast(t('planner.activity_deleted', 'Activity removed from your itinerary.'), 'info')
  }

  const currentDay = trip.days[selectedDayIndex]
  const dayActivities = currentDay?.activities || []
  let dayDateFormatted = ''
  try {
    if (currentDay?.date) {
      dayDateFormatted = format(parseISO(currentDay.date), 'EEEE, MMM dd')
    }
  } catch (e) {
    dayDateFormatted = currentDay?.date || ''
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 px-6 md:px-12 py-10 relative z-10">
      {/* Day Navigation */}
      <aside className="md:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-h3">{t('planner.itinerary')}</h3>
          {!isOwner && (
            <div className="bg-primary-container p-1 rounded-md text-primary" title="Viewing shared itinerary">
               <Share2 size={12} />
            </div>
          )}
        </div>
        <nav className="t-planner-day-nav relative max-h-[500px] overflow-y-auto pr-1">
          <div ref={dayPillRef} className="t-planner-day-pill" aria-hidden="true" />
          <div ref={dayNavRef} className="relative z-[1] flex flex-col gap-1.5">
          {trip.days.map((day, idx) => {
             if (!isOwner && day.isPrivate) return null;
             
             let formatted = day.date
             try {
               const locale = i18n.language === 'pt' ? ptBR : enUS
               formatted = format(parseISO(day.date), 'MMM dd', { locale })
             } catch(e) {}
             
             const isActive = selectedDayIndex === idx

             return (
              <div key={day.date} className="group relative">
                <button
                  type="button"
                  data-day-tab
                  onClick={() => setSelectedDayIndex(idx)}
                  className={cn(
                    't-planner-day-tab w-full px-4 py-3 rounded-lg text-left text-sm font-bold flex justify-between items-center',
                    isActive ? 'text-white' : 'text-outline hover:text-on-primary-container',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className={isActive ? 'text-white/70' : 'text-outline'} />
                    <span>{formatted}</span>
                    {day.isPrivate && (
                      <Lock size={12} className={isActive ? 'text-white/70' : 'text-primary'} />
                    )}
                  </div>
                  {day.isCompleted && (
                    <CheckCircle2 size={14} className={isActive ? 'text-white/80' : 'text-primary'} />
                  )}
                </button>
                {isOwner && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-[2]">
                    <button
                      type="button"
                      onClick={() => toggleDayPrivacy(idx)}
                      className="t-planner-icon-btn p-1 bg-surface rounded shadow-sm hover:bg-primary-container"
                      title={day.isPrivate ? 'Make Public' : 'Make Private'}
                    >
                      {day.isPrivate ? (
                        <LockOpen size={14} className="text-outline hover:text-primary" />
                      ) : (
                        <Lock size={14} className="text-outline hover:text-primary" />
                      )}
                    </button>
                    {trip.days.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDay(idx)}
                        className="t-planner-icon-btn p-1 bg-surface rounded shadow-sm hover:bg-primary-container"
                      >
                        <X size={14} className="text-outline hover:text-red-500" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          </div>
          
          {showAddDateModal ? (
            <div className="mt-4 p-3 border border-outline-variant rounded-lg space-y-3 bg-primary-container/35">
               <input
                 type="date"
                 value={newDate}
                 onChange={e => setNewDate(e.target.value)}
                 className="w-full bg-transparent text-on-surface border border-outline-variant rounded-md px-2 py-1.5 text-sm outline-none focus:border-primary"
               />
               <div className="flex gap-2">
                 <button onClick={addDay} className="flex-1 bg-primary text-white text-xs py-1.5 rounded font-bold">{t('planner.add_day')}</button>
                 <button onClick={() => setShowAddDateModal(false)} className="flex-1 bg-surface border border-outline-variant text-on-surface text-xs py-1.5 rounded font-bold">Cancel</button>
               </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddDateModal(true)}
              className="t-planner-btn mt-4 flex items-center justify-center gap-2 w-full px-4 py-3 border border-outline-variant border-dashed rounded-xl text-outline text-sm hover:border-primary hover:text-primary"
            >
              <Plus size={16} /> {t('planner.add_day')}
            </button>
          )}
        </nav>

        {/* Day Intensity Meter */}
        {currentDay && (
          <div className="bg-surface border border-outline-variant rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-outline">{t('planner.day_pulse', 'Day Pulse')}</span>
              <span className="text-lg">{getIntensityInfo(dayActivities.length).icon}</span>
            </div>
            <div className="space-y-2">
              <div className="flex flex-col gap-0.5">
                <span className={cn("text-sm font-bold", getIntensityInfo(dayActivities.length).color)}>
                  {getIntensityInfo(dayActivities.length).label}
                </span>
                <span className="text-[10px] text-outline font-medium">
                  {t('planner.activities_count', { count: dayActivities.length })}
                </span>
              </div>
              <div className="h-1.5 w-full bg-primary-container rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${getIntensityInfo(dayActivities.length).progress}%` }}
                  className={cn("h-full transition-all duration-500", 
                    dayActivities.length <= 3 ? "bg-primary/40" : 
                    dayActivities.length <= 5 ? "bg-primary/70" : "bg-primary"
                  )}
                />
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Timeline */}
      <section className="md:col-span-6 space-y-8">
        <div ref={headerStaggerRef} className="t-stagger flex justify-between items-end flex-wrap gap-4">
          <div>
            <h1 className="t-stagger-line t-stagger-line--1 text-h2 flex items-center gap-2 text-on-surface">
              {trip.destination}
            </h1>
            <p className="t-stagger-line t-stagger-line--2 text-label-sm text-outline font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
              <Calendar size={14} />
              {dayDateFormatted}
              {currentDay?.isPrivate && (
                <span className="flex items-center gap-1 bg-primary-container text-primary px-2 py-0.5 rounded-md text-[10px] ml-2">
                  <Lock size={10} /> {t('planner.private', 'PRIVATE')}
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {presentUsers.length > 0 && (
              <div ref={presenceRef} className="flex items-center gap-1 mr-2">
                {presentUsers.map(u => (
                  <div
                    key={u.id}
                    className="t-avatar w-8 h-8 rounded-lg border-2 border-background bg-primary text-white flex items-center justify-center text-xs font-bold shadow-md dark:border-slate-950 dark:bg-primary-container dark:text-on-primary-container cursor-default"
                    title={u.email}
                  >
                    {u.email.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
            )}
            
            <button
              type="button"
              onClick={handleShare}
              disabled={isSharing}
              className={cn(
                't-planner-btn bg-primary text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-on-primary-container dark:bg-primary-container dark:text-on-primary-container dark:hover:bg-primary dark:hover:text-white shadow-lg shadow-primary/20',
                isSharing && 'is-loading',
              )}
            >
              <Share2 size={16} />
              <span ref={shareLabelRef} className="t-text-swap">
                {isSharing ? t('planner.sharing') : tripId ? t('planner.copy_link') : t('planner.share_trip')}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowFlightSearch(v => !v)
                if (showFlightSearch) setSearchedFlight('')
              }}
              className={cn(
                't-planner-btn bg-surface border border-outline-variant text-on-surface px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:border-primary hover:text-primary',
                showFlightSearch && 'border-primary text-primary',
              )}
            >
              <Plane size={16} /> {t('planner.check_flight')}
            </button>
            <button
              type="button"
              onClick={() => setShowAddActivity(v => !v)}
              className="t-planner-btn bg-primary text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-on-primary-container dark:bg-primary-container dark:text-on-primary-container dark:hover:bg-primary dark:hover:text-white shadow-lg shadow-primary/10"
            >
              <Plus size={16} /> {t('planner.add_activity')}
            </button>

            <button
              type="button"
              onClick={() => toggleDayCheckIn(selectedDayIndex)}
              className={cn(
                't-planner-btn px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg',
                currentDay?.isCompleted 
                  ? 'border border-primary/25 bg-primary text-white shadow-primary/20 dark:bg-primary-container dark:text-on-primary-container' 
                  : 'bg-surface border border-outline-variant text-on-surface hover:border-primary hover:text-primary',
              )}
            >
              <CheckCircle2 size={16} /> 
              {currentDay?.isCompleted ? t('planner.day_done', 'Day Completed') : t('planner.day_checkin', 'Check-in no Dia')}
            </button>
          </div>
        </div>

        {currentDay?.isCompleted && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary p-4 rounded-lg text-white shadow-lg shadow-primary/20 flex items-center justify-between mb-6 dark:bg-primary-container dark:text-on-primary-container"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl dark:bg-primary/20">
                🏆
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-widest">{t('planner.day_achieved', 'Day Goal Achieved!')}</h4>
                <p className="text-xs text-white/85 dark:text-on-primary-container/80">{t('planner.day_achieved_desc', 'You successfully completed your itinerary for today.')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-md border border-white/25 dark:bg-primary/15 dark:border-primary/30">
              <LowCortisolIcon className="w-5 h-5 brightness-0 invert" />
              <span className="text-[10px] font-black tracking-tighter">LOW CORTISOL</span>
            </div>
          </motion.div>
        )}

        <div className="space-y-4">
          <PlannerAccordion
            open={showFlightSearch}
            onToggle={() => {
              setShowFlightSearch(v => !v)
              if (showFlightSearch) setSearchedFlight('')
            }}
            title={t('planner.flight_lookup')}
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={flightNumber}
                onChange={e => setFlightNumber(e.target.value)}
                placeholder="e.g. AA100"
                className="flex-1 bg-transparent text-on-surface border border-outline-variant rounded-xl px-4 py-2 text-sm outline-none focus:border-primary cursor-text"
              />
              <button
                type="button"
                onClick={searchFlight}
                className="t-planner-btn bg-primary text-white px-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-on-primary-container dark:bg-primary-container dark:text-on-primary-container dark:hover:bg-primary dark:hover:text-white"
              >
                <Search size={16} />
              </button>
            </div>

            {searchedFlight && (
              <Suspense fallback={<FlightSkeleton />}>
                <FlightResult flightNumber={searchedFlight} />
              </Suspense>
            )}
          </PlannerAccordion>

          <PlannerAccordion
            open={showAddActivity}
            onToggle={() => setShowAddActivity(v => !v)}
            title={t('planner.add_activity')}
          >
            <AddActivityForm
              dayIndex={selectedDayIndex}
              onAdd={activity => {
                addActivity(selectedDayIndex, activity)
                setShowAddActivity(false)
              }}
            />
          </PlannerAccordion>

          {editingActivity && editFormData && (
            <PlannerAccordion
              open={Boolean(editingActivity && editFormData)}
              onToggle={() => {
                setEditingActivity(null)
                setEditFormData(null)
              }}
              title={t('planner.edit_activity')}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-outline block mb-2">
                      {t('planner.time')}
                    </label>
                    <input
                      type="time"
                      value={editFormData.time}
                      onChange={e =>
                        setEditFormData({
                          ...editFormData,
                          time: e.target.value,
                        })
                      }
                      className="w-full bg-transparent border border-outline-variant rounded-lg px-4 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-outline block mb-2">
                      {t('planner.type')}
                    </label>
                    <select
                      value={editFormData.type}
                      onChange={e =>
                        setEditFormData({
                          ...editFormData,
                          type: e.target.value as any,
                        })
                      }
                      className="w-full bg-transparent text-on-surface border border-outline-variant rounded-lg px-4 py-2 text-sm outline-none focus:border-primary"
                    >
                      {ACTIVITY_TYPES.map(type => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-outline block mb-2">
                    {t('planner.title')}
                  </label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={e =>
                      setEditFormData({
                        ...editFormData,
                        title: e.target.value,
                      })
                    }
                    className="w-full bg-transparent border border-outline-variant rounded-lg px-4 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-outline block mb-2">
                    {t('planner.location')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editFormData.location}
                      onChange={e =>
                        setEditFormData({
                          ...editFormData,
                          location: e.target.value,
                        })
                      }
                      className="flex-1 bg-transparent border border-outline-variant rounded-lg px-4 py-2 text-sm outline-none focus:border-primary"
                    />
                    <button
                      onClick={fetchEditImage}
                      disabled={isEditingImageSearch}
                      className="t-planner-icon-btn px-3 bg-primary-container text-primary rounded-lg hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isEditingImageSearch ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <Search size={16} />}
                    </button>
                  </div>
                </div>

                {editFormData.imageUrl && (
                  <div className="relative group aspect-video rounded-lg overflow-hidden border border-outline-variant">
                    <img src={editFormData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                    <button 
                      onClick={() => setEditFormData(prev => prev ? ({ ...prev, imageUrl: '' }) : null)}
                      className="absolute top-2 right-2 p-1.5 bg-on-primary-container/80 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-outline block mb-2">
                    {t('planner.notes_optional')}
                  </label>
                  <textarea
                    value={editFormData.notes || ''}
                    onChange={e =>
                      setEditFormData({
                        ...editFormData,
                        notes: e.target.value,
                      })
                    }
                    className="w-full bg-transparent border border-outline-variant rounded-lg px-4 py-2 text-sm outline-none focus:border-primary h-20"
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateActivity(
                      editingActivity.dayIndex,
                      editingActivity.activityId!,
                      editFormData,
                    )
                  }
                  className="t-planner-btn w-full bg-primary text-white py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-on-primary-container dark:bg-primary-container dark:text-on-primary-container dark:hover:bg-primary dark:hover:text-white"
                >
                  {t('planner.save_changes')}
                </button>
              </div>
            </PlannerAccordion>
          )}
        </div>

        <div className="relative pl-8">
          <div className="absolute left-[11px] top-4 bottom-4 w-[1px] bg-outline-variant" />

          <div className="space-y-8">
            {!trip.days.some(d => isOwner || !d.isPrivate) && !isOwner ? (
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="text-center py-20 bg-primary-container/35 rounded-lg border border-dashed border-outline-variant"
               >
                 <Lock size={48} className="mx-auto text-primary/40 mb-4" />
                 <h2 className="text-xl font-bold">{t('planner.private_trip', 'This itinerary is private')}</h2>
                 <p className="text-sm text-outline mt-2 max-w-xs mx-auto">
                   {t('planner.private_trip_desc', 'The owner has marked all days as private. Only authorized collaborators can see the full schedule.')}
                 </p>
               </motion.div>
            ) : dayActivities.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8 text-outline"
              >
                <p className="text-sm">
                  {t('planner.no_activities')}
                </p>
                {isOwner && (
                  <p className="text-xs mt-2">
                    {t('planner.click_add_activity')}
                  </p>
                )}
              </motion.div>
            ) : (
              dayActivities
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((activity, idx) => (
                  <ActivityCard
                    key={`${selectedDayIndex}-${activity.id}`}
                    activity={activity}
                    icon={getActivityIcon(activity.type)}
                    animationDelay={idx * 70}
                    onCheckIn={() => toggleCheckIn(selectedDayIndex, activity.id)}
                    onEdit={() => {
                      setEditingActivity({
                        dayIndex: selectedDayIndex,
                        activityId: activity.id,
                        data: activity,
                      })
                      setEditFormData(activity)
                    }}
                    onDelete={() => deleteActivity(selectedDayIndex, activity.id)}
                  />
                ))
            )}
          </div>
        </div>
      </section>

      {/* Sidebar Details */}
      <section className="md:col-span-4 space-y-6">
        {dayActivities.length > 0 && (
          <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden">

            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">{t('planner.day_summary')}</h3>
              </div>

              <div className="space-y-4">
                <div className="text-sm">
                  <p className="text-outline text-xs uppercase font-bold mb-2">
                    {t('planner.activities_today')}
                  </p>
                  <p className="text-xl font-bold">{dayActivities.length}</p>
                </div>
                <div>
                  <p className="text-outline text-xs uppercase font-bold mb-3">
                    {t('planner.schedule')}
                  </p>
                  <div className="space-y-2">
                    {dayActivities
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .slice(0, 5)
                      .map(activity => (
                        <div key={activity.id} className="text-xs flex gap-2">
                          <span className="font-bold text-primary w-12">
                            {activity.time}
                          </span>
                          <span className="text-outline truncate">
                            {activity.title}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-primary-container/40 p-6 rounded-lg border border-primary/10">
          <h4 className="text-sm font-bold uppercase tracking-widest mb-3 flex items-center justify-between">
            {t('planner.trip_information')}
          </h4>
          <ul className="text-xs text-outline space-y-3">
            <li>
              <span className="font-bold text-on-surface block mb-1">{t('planner.destination')}:</span>
              <input
                className="w-full bg-transparent text-on-surface border border-outline-variant rounded px-2 py-1 outline-none focus:border-primary"
                value={trip.destination}
                onChange={e => saveTrip({ ...trip, destination: e.target.value })}
              />
            </li>
            <li>
              <span className="font-bold text-on-surface block mb-1">{t('planner.country')}:</span>
              <Select
                 options={COUNTRIES}
                 value={COUNTRIES.find(c => c.value === trip.country)}
                 onChange={(val) => saveTrip({ ...trip, country: val?.value || '' })}
                 className="text-sm"
                 styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: 'transparent',
                      borderColor: 'var(--color-outline-variant)',
                      boxShadow: 'none',
                      '&:hover': { borderColor: 'var(--color-on-surface)' }
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: 'var(--color-on-surface)'
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-on-surface)'
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused ? 'var(--color-primary)' : 'transparent',
                      color: state.isFocused ? '#fff' : 'var(--color-on-surface)',
                    })
                 }}
              />
            </li>
            <li>
              <span className="font-bold text-on-surface">{t('planner.start_date')}:</span>{' '}
              {format(parseISO(trip.startDate), 'MMM dd, yyyy', { locale: i18n.language === 'pt' ? ptBR : enUS })}
            </li>
            <li>
              <span className="font-bold text-on-surface">{t('planner.total_days')}:</span>{' '}
              {trip.days.length}
            </li>
            <li>
              <span className="font-bold text-on-surface">
                {t('planner.total_activities')}:
              </span>{' '}
              {trip.days.reduce((acc, day) => acc + day.activities.length, 0)}
            </li>
          </ul>
        </div>

        <div className="bg-surface p-6 rounded-lg border border-outline-variant">
          <h4 className="text-sm font-bold uppercase tracking-widest mb-3 text-on-primary-container">
            {t('planner.travel_tips')}
          </h4>
          <ul className="text-xs text-primary space-y-2 list-disc pl-4">
            <li>{t('planner.tip_1')}</li>
            <li>{t('planner.tip_2')}</li>
            <li>{t('planner.tip_3')}</li>
            <li>{t('planner.tip_4')}</li>
          </ul>
        </div>
      </section>
    </div>
    </div>
  )
}

