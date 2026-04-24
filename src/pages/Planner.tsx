import axios from 'axios'
import { addDays, format, parseISO } from 'date-fns'
import {
  Calendar,
  Clock,
  Edit2,
  Hotel,
  Info,
  MapPin,
  Plane,
  Plus,
  Search,
  Trash2,
  Utensils,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { cn } from '../lib/utils'
import { useTranslation } from 'react-i18next'
import Select from 'react-select'
import countryList from 'country-list'

interface Activity {
  id: string
  time: string
  title: string
  location: string
  type: 'Flight' | 'Hotel' | 'Restaurant' | 'Activity' | 'Transport' | 'Other'
  notes?: string
}

interface TripDay {
  date: string
  activities: Activity[]
}

interface Trip {
  startDate: string
  destination: string
  country: string
  days: TripDay[]
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
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    time: '12:00',
    title: '',
    location: '',
    type: 'Activity' as const,
    notes: '',
  })

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
            className="w-full border border-neutral-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-black"
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
            className="w-full border border-neutral-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-black"
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
          className="w-full border border-neutral-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-black"
        />
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 block mb-2">
          {t('planner.location')}
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={e => setFormData({ ...formData, location: e.target.value })}
          placeholder="e.g. Haneda Airport"
          className="w-full border border-neutral-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-black"
        />
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 block mb-2">
          {t('planner.notes_optional')}
        </label>
        <textarea
          value={formData.notes}
          onChange={e => setFormData({ ...formData, notes: e.target.value })}
          placeholder="..."
          className="w-full border border-neutral-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-black h-20"
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
  const { t } = useTranslation()
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const [showFlightSearch, setShowFlightSearch] = useState(false)
  const [flightNumber, setFlightNumber] = useState('')
  const [flightData, setFlightData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  
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

  const [editingActivity, setEditingActivity] = useState<{
    dayIndex: number
    activityId?: string
    data: Partial<Activity>
  } | null>(null)

  const [showAddActivity, setShowAddActivity] = useState(false)
  const [showAddDateModal, setShowAddDateModal] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [editFormData, setEditFormData] = useState<Activity | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('tripPlannerData')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Basic migration check to ensure it's the new format
        if (parsed.days && parsed.days.length > 0 && typeof parsed.days[0].date === 'string') {
          setTrip(parsed)
        } else {
          setTrip(defaultTrip)
        }
      } catch (e) {
        setTrip(defaultTrip)
      }
    }
  }, [])

  const saveTrip = (newTrip: Trip) => {
    setTrip(newTrip)
    localStorage.setItem('tripPlannerData', JSON.stringify(newTrip))
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
        <h3 className="text-h3">{t('planner.itinerary')}</h3>
        <nav className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-2">
          {trip.days.map((day, idx) => {
             let formatted = day.date
             try {
               formatted = format(parseISO(day.date), 'MMM dd')
             } catch(e) {}
             
             return (
              <div key={day.date} className="group relative">
                <button
                  onClick={() => setSelectedDayIndex(idx)}
                  className={cn(
                    'w-full px-4 py-3 rounded-lg text-left text-sm font-bold flex justify-between items-center transition-all',
                    selectedDayIndex === idx
                      ? 'bg-primary text-white'
                      : 'text-neutral-500 hover:bg-neutral-100',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className={selectedDayIndex === idx ? 'text-white/70' : 'text-neutral-400'} />
                    <span>{formatted}</span>
                  </div>
                  {selectedDayIndex === idx && (
                    <motion.div
                      layoutId="arrow"
                      className="w-1.5 h-1.5 bg-white rounded-full"
                    />
                  )}
                </button>
                {trip.days.length > 1 && (
                  <button
                    onClick={() => removeDay(idx)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white rounded shadow-sm"
                  >
                    <X
                      size={14}
                      className="text-neutral-400 hover:text-red-500"
                    />
                  </button>
                )}
              </div>
            )
          })}
          
          {showAddDateModal ? (
            <div className="mt-4 p-3 border border-outline-variant rounded-lg space-y-3 bg-neutral-50">
               <input
                 type="date"
                 value={newDate}
                 onChange={e => setNewDate(e.target.value)}
                 className="w-full border border-neutral-200 rounded-md px-2 py-1.5 text-sm outline-none focus:border-black"
               />
               <div className="flex gap-2">
                 <button onClick={addDay} className="flex-1 bg-black text-white text-xs py-1.5 rounded font-bold">{t('planner.add_day')}</button>
                 <button onClick={() => setShowAddDateModal(false)} className="flex-1 bg-neutral-200 text-black text-xs py-1.5 rounded font-bold">Cancel</button>
               </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddDateModal(true)}
              className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-3 border border-outline-variant border-dashed rounded-lg text-neutral-400 text-sm hover:border-black hover:text-black transition-all"
            >
              <Plus size={16} /> {t('planner.add_day')}
            </button>
          )}
        </nav>
      </aside>

      {/* Timeline */}
      <section className="md:col-span-6 space-y-10">
        <div className="flex justify-between items-end flex-wrap gap-4">
          <div>
            <h1 className="text-h2 flex items-center gap-2">
              {trip.destination}
            </h1>
            <p className="text-label-sm text-neutral-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
              <Calendar size={14} />
              {dayDateFormatted}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFlightSearch(true)}
              className="bg-neutral-100 text-black px-6 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-neutral-200 transition-all"
            >
              <Plane size={16} /> {t('planner.check_flight')}
            </button>
            <button
              onClick={() => setShowAddActivity(true)}
              className="bg-primary text-white px-6 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-neutral-800 transition-all"
            >
              <Plus size={16} /> {t('planner.add_activity')}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFlightSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white border border-black p-6 rounded-xl overflow-hidden"
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
                  className="flex-1 border border-neutral-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-black"
                />
                <button
                  onClick={searchFlight}
                  disabled={loading}
                  className="bg-black text-white px-4 rounded-lg text-xs font-bold uppercase tracking-widest disabled:opacity-50"
                >
                  {loading ? t('planner.searching') : <Search size={16} />}
                </button>
              </div>

              {flightData && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-neutral-50 rounded-lg border border-neutral-100"
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
              className="bg-white border border-black p-6 rounded-xl overflow-hidden"
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
              className="bg-white border border-black p-6 rounded-xl overflow-hidden"
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
                      className="w-full border border-neutral-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-black"
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
                      className="w-full border border-neutral-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-black"
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
                    className="w-full border border-neutral-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 block mb-2">
                    {t('planner.location')}
                  </label>
                  <input
                    type="text"
                    value={editFormData.location}
                    onChange={e =>
                      setEditFormData({
                        ...editFormData,
                        location: e.target.value,
                      })
                    }
                    className="w-full border border-neutral-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-black"
                  />
                </div>
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
                  className="w-full bg-black text-white py-2 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-neutral-800 transition-all"
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
            {dayActivities.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8 text-neutral-400"
              >
                <p className="text-sm">
                  {t('planner.no_activities')}
                </p>
                <p className="text-xs mt-2">
                  {t('planner.click_add_activity')}
                </p>
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
                    <div className="absolute -left-[27px] top-2 w-4 h-4 rounded-full ring-4 ring-[#F9F9F9] z-10 bg-primary" />

                    <div className="bg-white border rounded-xl p-6 transition-all border-outline-variant hover:border-neutral-400">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-4 flex-1">
                          <div className="bg-secondary-container/30 p-3 rounded-lg text-primary flex items-center justify-center">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
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
                              <p className="text-xs text-neutral-400 mt-2 italic">
                                {activity.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingActivity({
                                dayIndex: selectedDayIndex,
                                activityId: activity.id,
                                data: activity,
                              })
                              setEditFormData(activity)
                            }}
                            className="p-2 hover:bg-neutral-100 rounded-lg transition-all"
                          >
                            <Edit2 size={14} className="text-neutral-400" />
                          </button>
                          <button
                            onClick={() =>
                              deleteActivity(selectedDayIndex, activity.id)
                            }
                            className="p-2 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={14} className="text-red-400" />
                          </button>
                        </div>
                      </div>

                      <span className="inline-block mt-4 bg-neutral-50 text-[10px] font-bold text-neutral-400 px-3 py-1 rounded-full border border-neutral-100 italic">
                        {activity.type}
                      </span>
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
          <div className="bg-white border border-outline-variant rounded-xl overflow-hidden">
            <div className="h-48 bg-neutral-100 flex items-center justify-center overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=1000"
                className="w-full h-full object-cover opacity-80"
                alt="Map placeholder"
              />
            </div>
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
                          <span className="text-neutral-600 truncate">
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
              <span className="font-bold text-neutral-700 block mb-1">{t('planner.destination')}:</span>
              <input
                className="w-full bg-white border border-neutral-200 rounded px-2 py-1 outline-none focus:border-primary"
                value={trip.destination}
                onChange={e => saveTrip({ ...trip, destination: e.target.value })}
              />
            </li>
            <li>
              <span className="font-bold text-neutral-700 block mb-1">{t('planner.country')}:</span>
              <Select
                 options={COUNTRIES}
                 value={COUNTRIES.find(c => c.value === trip.country)}
                 onChange={(val) => saveTrip({ ...trip, country: val?.value || '' })}
                 className="text-sm"
                 styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: '#e5e5e5',
                      boxShadow: 'none',
                      '&:hover': { borderColor: '#000' }
                    })
                 }}
              />
            </li>
            <li>
              <span className="font-bold text-neutral-700">{t('planner.start_date')}:</span>{' '}
              {format(parseISO(trip.startDate), 'MMM dd, yyyy')}
            </li>
            <li>
              <span className="font-bold text-neutral-700">{t('planner.total_days')}:</span>{' '}
              {trip.days.length}
            </li>
            <li>
              <span className="font-bold text-neutral-700">
                {t('planner.total_activities')}:
              </span>{' '}
              {trip.days.reduce((acc, day) => acc + day.activities.length, 0)}
            </li>
          </ul>
        </div>

        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
          <h4 className="text-sm font-bold uppercase tracking-widest mb-3 text-blue-900">
            {t('planner.travel_tips')}
          </h4>
          <ul className="text-xs text-blue-700 space-y-2 list-disc pl-4">
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

// TO DO: fix layout
