import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function PlannerAccordion({
  open,
  onToggle,
  title,
  children,
  className,
}: {
  open: boolean
  onToggle: () => void
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('t-acc surface-card overflow-hidden', className)} data-open={open}>
      <button
        type="button"
        className="t-acc-head t-planner-btn w-full flex items-center justify-between gap-3 px-5 py-4 text-left font-bold text-on-surface"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span>{title}</span>
        <span className="t-acc-chevron text-outline">
          <ChevronDown className="h-4 w-4" strokeWidth={2.5} />
        </span>
      </button>
      <div className="t-acc-panel">
        <div className="t-acc-panel-inner px-5 pb-5">{children}</div>
      </div>
    </div>
  )
}
