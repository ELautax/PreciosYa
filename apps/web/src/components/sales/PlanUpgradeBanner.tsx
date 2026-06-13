import { Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

type PlanUpgradeBannerProps = {
  title?: string
  message?: string
}

export function PlanUpgradeBanner({
  title = 'Función Pro',
  message = 'Pasá a Pro para ver análisis completo, tendencias de 30 días, productos estancados y recomendaciones de promoción.',
}: PlanUpgradeBannerProps) {
  return (
    <div className="rounded-2xl border border-accent-200 bg-accent-50/40 p-5 dark:border-accent-900/30 dark:bg-accent-900/10">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-500 text-white shadow-md">
          <Sparkles size={20} strokeWidth={2.5} />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-black text-text-main">{title}</h3>
          <p className="text-xs font-medium leading-relaxed text-text-muted">{message}</p>
          <Link
            to="/settings?tab=plan&planes=1"
            className="inline-flex text-[10px] font-black uppercase tracking-widest text-primary-600 hover:underline"
          >
            Ver planes
          </Link>
        </div>
      </div>
    </div>
  )
}
