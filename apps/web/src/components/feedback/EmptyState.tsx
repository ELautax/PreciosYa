import { type LucideIcon } from 'lucide-react'
import { type ReactNode } from 'react'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
  compact?: boolean
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  compact = false 
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border-strong/40 text-center animate-fade-in ${
      compact ? 'py-8 px-4' : 'py-16 px-6'
    }`}>
      <div className={`mb-4 rounded-3xl bg-primary-50 p-4 text-primary-600 dark:bg-primary-900/20 ${
        compact ? 'p-3' : 'p-4'
      }`}>
        <Icon size={compact ? 24 : 32} strokeWidth={2.5} />
      </div>
      <h3 className={`${compact ? 'text-lg font-bold' : 'heading-lg'} mb-2 text-text-main`}>{title}</h3>
      <p className={`mx-auto max-w-sm text-text-muted text-balance ${
        compact ? 'text-xs mb-4' : 'text-sm mb-8'
      }`}>
        {description}
      </p>
      {action ? (
        <div className="animate-slide-up">
          {action}
        </div>
      ) : null}
    </div>
  )
}
