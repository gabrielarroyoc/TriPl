import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'
import { cn } from '../lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white border-primary hover:bg-on-primary-container hover:border-on-primary-container shadow-sm dark:bg-primary-container dark:text-on-primary-container dark:border-primary/30 dark:hover:bg-primary dark:hover:text-white',
  secondary:
    'bg-surface text-on-surface border-outline-variant hover:border-primary hover:text-primary',
  ghost:
    'bg-transparent text-on-surface border-transparent hover:bg-primary-container hover:text-on-primary-container',
  danger:
    'bg-red-50 text-red-600 border-red-100 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/50',
}

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-6 text-sm',
  icon: 'h-10 w-10 p-0',
}

type ButtonProps<T extends ElementType> = {
  as?: T
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  children: ReactNode
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>

export function Button<T extends ElementType = 'button'>({
  as,
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps<T>) {
  const Component = as || 'button'

  return (
    <Component
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg border font-bold uppercase tracking-wider transition-all disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]',
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export function Badge({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary-container px-2.5 py-1 text-label-sm text-on-primary-container',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function Card({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('surface-card', className)}>{children}</div>
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-6 md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className="max-w-3xl">
        {eyebrow && <div className="mb-3">{eyebrow}</div>}
        <h1 className="text-h1">{title}</h1>
        {description && (
          <p className="mt-3 max-w-2xl text-body-lg text-outline">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: ElementType
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
}) {
  return (
    <Card className="flex min-h-[320px] flex-col items-center justify-center border-dashed p-8 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-primary-container text-primary">
        <Icon className="h-7 w-7" />
      </div>
      <h2 className="text-h3">{title}</h2>
      {description && <p className="mt-2 max-w-md text-sm text-outline">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </Card>
  )
}
