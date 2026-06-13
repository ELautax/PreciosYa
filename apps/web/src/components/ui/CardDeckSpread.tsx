import { Children, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return reduced
}

function useMinWidth(px: number) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${px}px)`)
    const sync = () => setMatches(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [px])

  return matches
}

type CardDeckSpreadProps = {
  children: ReactNode
  className?: string
  /** Clases del grid en mobile / fallback */
  stackClassName?: string
}

/**
 * Mazo de cards que se abre al entrar en viewport (estilo Framer CardDeckSpread).
 * En desktop: stack → spread + hover con elevación y blur en el resto.
 */
export function CardDeckSpread({
  children,
  className = '',
  stackClassName = 'grid gap-4 md:grid-cols-3 md:items-stretch',
}: CardDeckSpreadProps) {
  const items = Children.toArray(children)
  const ref = useRef<HTMLDivElement>(null)
  const [spread, setSpread] = useState(false)
  const [hovered, setHovered] = useState<number | null>(null)
  const reduced = usePrefersReducedMotion()
  const isDesktop = useMinWidth(900)

  useEffect(() => {
    if (reduced || !isDesktop) {
      setSpread(true)
      return
    }

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setSpread(true)
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [reduced, isDesktop])

  if (!isDesktop) {
    return <div className={`${stackClassName} ${className}`.trim()}>{items}</div>
  }

  return (
    <div
      ref={ref}
      className={[
        'card-deck-spread',
        spread ? 'is-spread' : '',
        hovered !== null ? 'has-hover' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onMouseLeave={() => setHovered(null)}
    >
      <div className="card-deck-spread-track">
        {items.map((child, index) => (
          <div
            key={index}
            className={`card-deck-spread-item ${hovered === index ? 'is-hovered' : ''}`}
            style={{ '--deck-i': index } as CSSProperties}
            onMouseEnter={() => setHovered(index)}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}
