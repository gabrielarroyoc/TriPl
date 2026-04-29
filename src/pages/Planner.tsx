import axios from 'axios'
import { addDays, format, parseISO } from 'date-fns'
import { ptBR, enUS } from 'date-fns/locale'
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  Hotel,
  Info,
  Lock,
  LockOpen,
  MapPin,
  Plane,
  Plus,
  Search,
  Share2,
  Trash2,
  Utensils,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { LowCortisolIcon } from '../components/Icons'
import { useEffect, useState } from 'react'
import { cn } from '../lib/utils'
import { useTranslation } from 'react-i18next'
import Select from 'react-select'
import countryList from 'country-list'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../store/AuthContext'
import { useToastStore } from '../store/useToastStore'

interface Activity {
  id: string
  time: string
  title: string
  location: string
  type: 'Activity' | 'Flight' | 'Hotel' | 'Food'
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

  const fetchImage = async () => {
    const searchTerms = formData.location || formData.title
    if (!searchTerms) return

    setIsSearching(true)
    try {
      const lang = i18n.language === 'pt' ? 'pt' : 'en'
      const res = await axios.get(
        `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerms)}`
      )
      if (res.data.originalimage?.source || res.data.thumbnail?.source) {
        setFormData(prev => ({ 
          ...prev, 
          imageUrl: res.data.originalimage?.source || res.data.thumbnail?.source 
        }))
      }
    } catch (e) {
      console.error('Failed to fetch image', e)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 block mb-2">
            {t('planner.time')}
          </label>
          <input
            type="time"
            value={formData.time}
            onChange={e => setFormData({ ...formData, time: e.target.value })}
            className="w-full bg-transparent text-on-surface border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 block mb-2">
            {t('planner.type')}
          </label>
          <select
            value={formData.type}
            onChange={e =>
              setFormData({ ...formData, type: e.target.value as any })
            }
            className="w-full bg-transparent text-on-surface border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 text-sm outline-none focus:border-primary"
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
        <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 block mb-2">
          {t('planner.title')}
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g. Flight to Tokyo"
          className="w-full bg-transparent text-on-surface border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 block mb-2">
          {t('planner.location')}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={formData.location}
            onChange={e => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g. Haneda Airport"
            className="flex-1 bg-transparent border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 text-sm outline-none focus:border-on-surface"
          />
          <button
            onClick={fetchImage}
            disabled={isSearching}
            className="px-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
            title="Search for image"
          >
            {isSearching ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <Search size={16} />}
          </button>
        </div>
      </div>

      {formData.imageUrl && (
        <div className="relative group aspect-video rounded-xl overflow-hidden border border-outline-variant">
          <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
          <button 
            onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
            className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div>
        <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 block mb-2">
          {t('planner.notes_optional')}
        </label>
        <textarea
          value={formData.notes}
          onChange={e => setFormData({ ...formData, notes: e.target.value })}
          placeholder="..."
          className="w-full bg-transparent text-on-surface border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 text-sm outline-none focus:border-primary h-20"
        />
      </div>

      <button
        onClick={() => onAdd({ ...formData, id: Date.now().toString() })}
        className="w-full bg-black text-white py-2 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-neutral-800 transition-all"
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
  const [flightData, setFlightData] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)

  const fetchEditImage = async () => {
    const searchTerms = editFormData?.location || editFormData?.title
    if (!searchTerms) return

    setIsSearching(true)
    try {
      const lang = i18n.language === 'pt' ? 'pt' : 'en'
      const res = await axios.get(
        `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerms)}`
      )
      if (res.data.originalimage?.source || res.data.thumbnail?.source) {
        setEditFormData(prev => prev ? ({ 
          ...prev, 
          imageUrl: res.data.originalimage?.source || res.data.thumbnail?.source 
        }) : null)
      }
    } catch (e) {
      console.error('Failed to fetch image', e)
    } finally {
      setIsSearching(false)
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

  // Load trip data (either from URL/Supabase or local storage)
  useEffect(() => {
    async function loadTrip() {
      if (tripId) {
        try {
          const { data, error } = await supabase.from('shared_trips').select('trip_data').eq('id', tripId).single()
          if (data && data.trip_data) {
            // Validation check
            if (data.trip_data.days && Array.isArray(data.trip_data.days)) {
              setTrip(data.trip_data)
            }
          }
        } catch (err) {
          console.error("Failed to fetch shared trip", err)
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
          }
        }
      }
    }
    loadTrip()
  }, [tripId])

  // Realtime Presence sync
  useEffect(() => {
    if (!tripId || !user) return

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
    if (!tripId || !trip) return
    const timeout = setTimeout(async () => {
      try {
        await supabase.from('shared_trips').update({ trip_data: trip }).eq('id', tripId)
      } catch (err) {
        console.error("Failed to auto-save to cloud", err)
      }
    }, 1500)
    return () => clearTimeout(timeout)
  }, [trip, tripId])

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

  const searchFlight = async () => {
    if (!flightNumber) return
    setLoading(true)
    try {
      const res = await axios.get(`/api/flights?flight_number=${flightNumber}`)
      setFlightData(res.data.data?.[0] || null)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const isOwner = !tripId || (user && trip.ownerId === user.id)

  const getIntensityInfo = (count: number) => {
    if (count === 0) return { label: 'Empty', color: 'text-neutral-400', icon: '💨', progress: 0 }
    if (count <= 3) return { label: t('planner.intensity.balanced', 'Balanced'), color: 'text-green-500', icon: '🧘', progress: 33 }
    if (count <= 5) return { label: t('planner.intensity.active', 'Active'), color: 'text-blue-500', icon: '🏃', progress: 66 }
    return { label: t('planner.intensity.heavy', 'Heavy'), color: 'text-orange-500', icon: '🔥', progress: 100 }
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
      if (user) {
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
    setEditingActivity(null)
    setEditFormData(null)
  }

  const deleteActivity = (dayIndex: number, activityId: string) => {
    const newDays = [...trip.days]
    if (!newDays[dayIndex]) return
    newDays[dayIndex].activities = newDays[dayIndex].activities.filter(act => act.id !== activityId)
    const newTrip = { ...trip, days: newDays }
    saveTrip(newTrip)
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
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 px-6 md:px-12 py-10">
      {/* Day Navigation */}
      <aside className="md:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-h3">{t('planner.itinerary')}</h3>
          {!isOwner && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-1 rounded-full text-blue-600 dark:text-blue-400" title="Viewing shared itinerary">
               <Share2 size={12} />
            </div>
          )}
        </div>
        <nav className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-2">
          {trip.days.map((day, idx) => {
             // Hide private days for non-owners
             if (!isOwner && day.isPrivate) return null;
             
             let formatted = day.date
             try {
               const locale = i18n.language === 'pt' ? ptBR : enUS
               formatted = format(parseISO(day.date), 'MMM dd', { locale })
             } catch(e) {}
             
             return (
              <div key={day.date} className="group relative">
                <button
                  onClick={() => setSelectedDayIndex(idx)}
                  className={cn(
                    'w-full px-4 py-3 rounded-lg text-left text-sm font-bold flex justify-between items-center transition-all',
                    selectedDayIndex === idx
                      ? 'bg-primary text-surface dark:text-black shadow-lg shadow-primary/20'
                      : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className={selectedDayIndex === idx ? 'text-white/70' : 'text-neutral-400'} />
                    <span>{formatted}</span>
                    {day.isPrivate && (
                      <Lock size={12} className={selectedDayIndex === idx ? 'text-white/70' : 'text-primary'} />
                    )}
                  </div>
                  {selectedDayIndex === idx && (
                    <motion.div
                      layoutId="arrow"
                      className="w-1.5 h-1.5 bg-surface rounded-full"
                    />
                  )}
                </button>
                {isOwner && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleDayPrivacy(idx)}
                      className="p-1 bg-surface rounded shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      title={day.isPrivate ? 'Make Public' : 'Make Private'}
                    >
                      {day.isPrivate ? (
                        <LockOpen size={14} className="text-neutral-400 hover:text-primary" />
                      ) : (
                        <Lock size={14} className="text-neutral-400 hover:text-primary" />
                      )}
                    </button>
                    {trip.days.length > 1 && (
                      <button
                        onClick={() => removeDay(idx)}
                        className="p-1 bg-surface rounded shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >
                        <X
                          size={14}
                          className="text-neutral-400 hover:text-red-500"
                        />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          
          {showAddDateModal ? (
            <div className="mt-4 p-3 border border-outline-variant rounded-lg space-y-3 bg-neutral-50 dark:bg-neutral-900">
               <input
                 type="date"
                 value={newDate}
                 onChange={e => setNewDate(e.target.value)}
                 className="w-full bg-transparent text-on-surface border border-neutral-200 dark:border-neutral-800 rounded-md px-2 py-1.5 text-sm outline-none focus:border-primary"
               />
               <div className="flex gap-2">
                 <button onClick={addDay} className="flex-1 bg-on-surface text-surface text-xs py-1.5 rounded font-bold">{t('planner.add_day')}</button>
                 <button onClick={() => setShowAddDateModal(false)} className="flex-1 bg-neutral-200 dark:bg-neutral-800 text-on-surface text-xs py-1.5 rounded font-bold">Cancel</button>
               </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddDateModal(true)}
              className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-3 border border-outline-variant border-dashed rounded-lg text-neutral-400 text-sm hover:border-on-surface hover:text-on-surface transition-all"
            >
              <Plus size={16} /> {t('planner.add_day')}
            </button>
          )}
        </nav>

        {/* Day Intensity Meter */}
        {currentDay && (
          <div className="bg-surface border border-outline-variant rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{t('planner.day_pulse', 'Day Pulse')}</span>
              <span className="text-lg">{getIntensityInfo(dayActivities.length).icon}</span>
            </div>
            <div className="space-y-2">
              <div className="flex flex-col gap-0.5">
                <span className={cn("text-sm font-bold", getIntensityInfo(dayActivities.length).color)}>
                  {getIntensityInfo(dayActivities.length).label}
                </span>
                <span className="text-[10px] text-neutral-400 font-medium">
                  {t('planner.activities_count', { count: dayActivities.length })}
                </span>
              </div>
              <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${getIntensityInfo(dayActivities.length).progress}%` }}
                  className={cn("h-full transition-all duration-500", 
                    dayActivities.length <= 3 ? "bg-green-500" : 
                    dayActivities.length <= 5 ? "bg-blue-500" : "bg-orange-500"
                  )}
                />
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Timeline */}
      <section className="md:col-span-6 space-y-10">
        <div className="flex justify-between items-end flex-wrap gap-4">
          <div>
            <h1 className="text-h2 flex items-center gap-2 text-on-surface">
              {trip.destination}
            </h1>
            <p className="text-label-sm text-neutral-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
              <Calendar size={14} />
              {dayDateFormatted}
              {currentDay?.isPrivate && (
                <span className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] ml-2">
                  <Lock size={10} /> {t('planner.private', 'PRIVATE')}
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Presence Indicators */}
            {presentUsers.length > 0 && (
              <div className="flex items-center -space-x-2 mr-2">
                {presentUsers.map((u, i) => (
                  <div 
                    key={u.id} 
                    className="w-8 h-8 rounded-full border-2 border-white bg-black dark:border-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-bold shadow-md z-10"
                    title={u.email}
                    style={{ zIndex: 10 - i }}
                  >
                    {u.email.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
            )}
            
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="bg-primary text-surface dark:text-black px-6 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
            >
              <Share2 size={16} /> 
              {isSharing 
                ? t('planner.sharing') 
                : tripId 
                  ? t('planner.copy_link') 
                  : t('planner.share_trip')
              }
            </button>
            <button
              onClick={() => setShowFlightSearch(true)}
              className="bg-neutral-100 dark:bg-neutral-800 text-on-surface px-6 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all"
            >
              <Plane size={16} /> {t('planner.check_flight')}
            </button>
            <button
              onClick={() => setShowAddActivity(true)}
              className="bg-primary text-surface dark:text-black px-6 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:opacity-80 transition-all shadow-lg shadow-primary/10"
            >
              <Plus size={16} /> {t('planner.add_activity')}
            </button>

            <button
              onClick={() => toggleDayCheckIn(selectedDayIndex)}
              className={cn(
                "px-6 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all shadow-lg",
                currentDay?.isCompleted 
                  ? "bg-green-500 text-white shadow-green-500/20" 
                  : "bg-surface border border-outline-variant text-on-surface hover:bg-neutral-50 dark:hover:bg-neutral-800"
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
            className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-xl text-white shadow-lg flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                🏆
              </div>
              <div>
                <h4 className="font-bold text-sm uppercase tracking-widest">{t('planner.day_achieved', 'Day Goal Achieved!')}</h4>
                <p className="text-xs text-white/80">{t('planner.day_achieved_desc', 'You successfully completed your itinerary for today.')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
              <LowCortisolIcon className="w-5 h-5 brightness-0 invert" />
              <span className="text-[10px] font-black tracking-tighter">LOW CORTISOL</span>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {showFlightSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-surface border border-outline-variant p-6 rounded-xl overflow-hidden"
            >
              <div className="flex justify-between mb-4">
                <h4 className="font-bold">{t('planner.flight_lookup')}</h4>
                <button onClick={() => setShowFlightSearch(false)}>
                  <X size={16} />
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={flightNumber}
                  onChange={e => setFlightNumber(e.target.value)}
                  placeholder="e.g. AA100"
                  className="flex-1 bg-transparent text-on-surface border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 text-sm outline-none focus:border-primary"
                />
                <button
                  onClick={searchFlight}
                  disabled={loading}
                  className="bg-on-surface text-surface px-4 rounded-lg text-xs font-bold uppercase tracking-widest disabled:opacity-50 hover:opacity-80 transition-opacity"
                >
                  {loading ? t('planner.searching') : <Search size={16} />}
                </button>
              </div>

              {flightData && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800"
                >
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-neutral-200">
                    <div>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                        {flightData.airline?.name}
                      </p>
                      <h5 className="font-bold">{flightData.flight?.iata}</h5>
                    </div>
                    <span
                      className={cn(
                        'text-[10px] uppercase font-bold px-2 py-1 rounded',
                        flightData.flight_status === 'scheduled'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700',
                      )}
                    >
                      {flightData.flight_status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-8 text-center relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-neutral-300">
                      <Plane size={16} className="rotate-90" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">
                        {flightData.departure?.iata}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        {flightData.departure?.airport}
                      </p>
                    </div>
                    <div>
                      <p className="text-xl font-bold">
                        {flightData.arrival?.iata}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        {flightData.arrival?.airport}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {showAddActivity && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-surface border border-outline-variant p-6 rounded-xl overflow-hidden"
            >
              <div className="flex justify-between mb-4">
                <h4 className="font-bold">{t('planner.add_activity')}</h4>
                <button onClick={() => setShowAddActivity(false)}>
                  <X size={16} />
                </button>
              </div>
              <AddActivityForm
                dayIndex={selectedDayIndex}
                onAdd={activity => {
                  addActivity(selectedDayIndex, activity)
                  setShowAddActivity(false)
                }}
              />
            </motion.div>
          )}

          {editingActivity && editFormData && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-surface border border-outline-variant p-6 rounded-xl overflow-hidden"
            >
              <div className="flex justify-between mb-4">
                <h4 className="font-bold">{t('planner.edit_activity')}</h4>
                <button onClick={() => setEditingActivity(null)}>
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 block mb-2">
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
                      className="w-full bg-transparent border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 text-sm outline-none focus:border-on-surface"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 block mb-2">
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
                      className="w-full bg-transparent border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 text-sm outline-none focus:border-on-surface"
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
                  <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 block mb-2">
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
                    className="w-full bg-transparent border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 text-sm outline-none focus:border-on-surface"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 block mb-2">
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
                      className="flex-1 bg-transparent border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 text-sm outline-none focus:border-on-surface"
                    />
                    <button
                      onClick={fetchEditImage}
                      disabled={isSearching}
                      className="px-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
                    >
                      {isSearching ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <Search size={16} />}
                    </button>
                  </div>
                </div>

                {editFormData.imageUrl && (
                  <div className="relative group aspect-video rounded-xl overflow-hidden border border-outline-variant">
                    <img src={editFormData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                    <button 
                      onClick={() => setEditFormData(prev => prev ? ({ ...prev, imageUrl: '' }) : null)}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 block mb-2">
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
                    className="w-full border border-neutral-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-black h-20"
                  />
                </div>
                <button
                  onClick={() =>
                    updateActivity(
                      editingActivity.dayIndex,
                      editingActivity.activityId!,
                      editFormData,
                    )
                  }
                  className="w-full bg-on-surface text-surface py-2 rounded-lg font-bold uppercase tracking-widest text-xs hover:opacity-80 transition-all"
                >
                  {t('planner.save_changes')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative pl-8">
          <div className="absolute left-[11px] top-4 bottom-4 w-[1px] bg-outline-variant" />

          <div className="space-y-8">
            {!trip.days.some(d => isOwner || !d.isPrivate) && !isOwner ? (
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="text-center py-20 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-dashed border-outline-variant"
               >
                 <Lock size={48} className="mx-auto text-neutral-300 mb-4" />
                 <h2 className="text-xl font-bold">{t('planner.private_trip', 'This itinerary is private')}</h2>
                 <p className="text-sm text-neutral-500 mt-2 max-w-xs mx-auto">
                   {t('planner.private_trip_desc', 'The owner has marked all days as private. Only authorized collaborators can see the full schedule.')}
                 </p>
               </motion.div>
            ) : dayActivities.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8 text-neutral-400"
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
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={activity.id}
                    className="relative group"
                  >
                    <div className="absolute -left-[27px] top-2 w-4 h-4 rounded-full ring-4 ring-background z-10 bg-primary" />

                    <div className="bg-surface border rounded-xl p-6 transition-all border-outline-variant hover:border-on-surface">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-6 flex-1">
                          <div className="w-20 h-32 flex-shrink-0 bg-secondary-container/20 rounded-2xl overflow-hidden flex items-center justify-center text-primary relative border border-outline-variant/30">
                            {activity.imageUrl ? (
                              <img src={activity.imageUrl} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="opacity-50">
                                {getActivityIcon(activity.type)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 py-1">
                            <p className="text-label-sm text-neutral-400 uppercase tracking-widest font-bold flex items-center gap-2">
                              <Clock size={12} />
                              {activity.time}
                            </p>
                            <h3 className="text-lg font-bold mt-1">
                              {activity.title}
                            </h3>
                            <p className="text-sm text-neutral-500 mt-1">
                              {activity.location}
                            </p>
                            {activity.notes && (
                              <p className="text-xs text-neutral-400 mt-2 italic line-clamp-2">
                                {activity.notes}
                              </p>
                            )}
                            <div className="mt-4">
                              <span className="inline-block bg-neutral-100 dark:bg-neutral-800 text-[10px] font-bold text-neutral-500 dark:text-neutral-400 px-3 py-1 rounded-full border border-outline-variant italic">
                                {activity.type}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => toggleCheckIn(selectedDayIndex, activity.id)}
                            className={cn(
                              "p-2 rounded-lg transition-all border",
                              activity.isCheckedIn 
                                ? "bg-green-50 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400" 
                                : "hover:bg-neutral-100 border-transparent text-neutral-400"
                            )}
                            title={activity.isCheckedIn ? "Checked In!" : "Check-in"}
                          >
                            <CheckCircle2 size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingActivity({
                                dayIndex: selectedDayIndex,
                                activityId: activity.id,
                                data: activity,
                              })
                              setEditFormData(activity)
                            }}
                            className="p-2 hover:bg-neutral-100 rounded-lg transition-all text-neutral-400"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() =>
                              deleteActivity(selectedDayIndex, activity.id)
                            }
                            className="p-2 hover:bg-red-50 rounded-lg transition-all text-red-400"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Badges Section */}
                      {activity.badges && activity.badges.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-dashed border-outline-variant">
                          {activity.badges.map(badge => (
                            <div 
                              key={badge}
                              className="flex items-center gap-2 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-xl shadow-sm"
                            >
                              <div className="w-5 h-5 flex items-center justify-center">
                                <LowCortisolIcon className="w-full h-full text-orange-600 dark:text-orange-400" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-tighter text-orange-600 dark:text-orange-400">
                                {badge}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}


                    </div>
                  </motion.div>
                ))
            )}
          </div>
        </div>
      </section>

      {/* Sidebar Details */}
      <section className="md:col-span-4 space-y-6">
        {dayActivities.length > 0 && (
          <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">

            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">{t('planner.day_summary')}</h3>
              </div>

              <div className="space-y-4">
                <div className="text-sm">
                  <p className="text-neutral-400 text-xs uppercase font-bold mb-2">
                    {t('planner.activities_today')}
                  </p>
                  <p className="text-xl font-bold">{dayActivities.length}</p>
                </div>
                <div>
                  <p className="text-neutral-400 text-xs uppercase font-bold mb-3">
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
                          <span className="text-neutral-600 dark:text-neutral-300 truncate">
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

        <div className="bg-primary/5 p-6 rounded-xl border border-primary/10">
          <h4 className="text-sm font-bold uppercase tracking-widest mb-3 flex items-center justify-between">
            {t('planner.trip_information')}
          </h4>
          <ul className="text-xs text-neutral-500 space-y-3">
            <li>
              <span className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">{t('planner.destination')}:</span>
              <input
                className="w-full bg-transparent text-on-surface border border-neutral-200 dark:border-neutral-700 rounded px-2 py-1 outline-none focus:border-primary"
                value={trip.destination}
                onChange={e => saveTrip({ ...trip, destination: e.target.value })}
              />
            </li>
            <li>
              <span className="font-bold text-neutral-700 dark:text-neutral-300 block mb-1">{t('planner.country')}:</span>
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
              <span className="font-bold text-neutral-700 dark:text-neutral-300">{t('planner.start_date')}:</span>{' '}
              {format(parseISO(trip.startDate), 'MMM dd, yyyy', { locale: i18n.language === 'pt' ? ptBR : enUS })}
            </li>
            <li>
              <span className="font-bold text-neutral-700 dark:text-neutral-300">{t('planner.total_days')}:</span>{' '}
              {trip.days.length}
            </li>
            <li>
              <span className="font-bold text-neutral-700 dark:text-neutral-300">
                {t('planner.total_activities')}:
              </span>{' '}
              {trip.days.reduce((acc, day) => acc + day.activities.length, 0)}
            </li>
          </ul>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-900/50">
          <h4 className="text-sm font-bold uppercase tracking-widest mb-3 text-blue-900 dark:text-blue-300">
            {t('planner.travel_tips')}
          </h4>
          <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-2 list-disc pl-4">
            <li>{t('planner.tip_1')}</li>
            <li>{t('planner.tip_2')}</li>
            <li>{t('planner.tip_3')}</li>
            <li>{t('planner.tip_4')}</li>
          </ul>
        </div>
      </section>
    </div>
  )
}

