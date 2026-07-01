import { CheckCircle2, Clock, Edit2, Trash2 } from 'lucide-react'
import { useRef } from 'react'
import { LowCortisolIcon } from '../Icons'
import { useCardTilt } from '../../hooks/usePlannerTransitions'
import { cn } from '../../lib/utils'
import type { ReactNode } from 'react'

export type PlannerActivity = {
  id: string
  time: string
  title: string
  location: string
  type: string
  notes?: string
  imageUrl?: string
  isCheckedIn?: boolean
  badges?: string[]
}

export function ActivityCard({
  activity,
  icon,
  animationDelay,
  onCheckIn,
  onEdit,
  onDelete,
}: {
  activity: PlannerActivity
  icon: ReactNode
  animationDelay: number
  onCheckIn: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const tiltRef = useRef<HTMLDivElement>(null)
  useCardTilt(tiltRef, 5)

  return (
    <div
      className="t-planner-activity-enter relative group"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="absolute -left-[27px] top-3 w-4 h-4 rounded-full ring-4 ring-background z-10 bg-primary" />

      <div ref={tiltRef} className="t-tilt">
        <div className="t-tilt-card surface-card p-6 border-outline-variant hover:border-primary/40 transition-colors">
          <div className="t-tilt-glare" aria-hidden="true" />
          <div className="flex justify-between items-start relative z-[1]">
            <div className="flex gap-6 flex-1 min-w-0">
              <div className="w-20 h-32 shrink-0 bg-primary-container rounded-xl overflow-hidden flex items-center justify-center text-primary relative border border-outline-variant/30">
                {activity.imageUrl ? (
                  <img src={activity.imageUrl} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="opacity-50">{icon}</div>
                )}
              </div>
              <div className="flex-1 py-1 min-w-0">
                <p className="text-label-sm text-outline uppercase tracking-widest font-bold flex items-center gap-2">
                  <Clock size={12} />
                  {activity.time}
                </p>
                <h3 className="text-lg font-bold mt-1 truncate">{activity.title}</h3>
                <p className="text-sm text-outline mt-1">{activity.location}</p>
                {activity.notes && (
                  <p className="text-xs text-outline mt-2 italic line-clamp-2">{activity.notes}</p>
                )}
                <div className="mt-4">
                  <span className="inline-block bg-primary-container text-[10px] font-bold text-on-primary-container px-3 py-1 rounded-md border border-primary/10 italic">
                    {activity.type}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={onCheckIn}
                className={cn(
                  't-planner-icon-btn p-2 rounded-lg border',
                  activity.isCheckedIn
                    ? 'bg-primary-container border-primary/20 text-primary'
                    : 'hover:bg-primary-container border-transparent text-outline',
                )}
                title={activity.isCheckedIn ? 'Checked In!' : 'Check-in'}
              >
                <CheckCircle2 size={14} />
              </button>
              <button
                type="button"
                onClick={onEdit}
                className="t-planner-icon-btn p-2 hover:bg-primary-container rounded-lg text-outline hover:text-primary"
              >
                <Edit2 size={14} />
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="t-planner-icon-btn p-2 hover:bg-red-50 rounded-lg text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {activity.badges && activity.badges.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-dashed border-outline-variant relative z-[1]">
              {activity.badges.map(badge => (
                <div
                  key={badge}
                  className="flex items-center gap-2 bg-primary-container border border-primary/20 px-3 py-1.5 rounded-lg shadow-sm"
                >
                  <LowCortisolIcon className="w-5 h-5 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-tighter text-on-primary-container">
                    {badge}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
