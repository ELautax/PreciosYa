import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js'
import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import { useCategories } from '@/hooks/useCategories'
import { getCategoryUi } from '@/lib/categoryUi'
import type { CategoryDto } from '@/types/category'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

type SalesByCategoryChartProps = {
  localId: string
  items: { categoryId: string | null; categoryName: string; revenue: number }[]
}

export function SalesByCategoryChart({ localId, items }: SalesByCategoryChartProps) {
  const { data: categories } = useCategories(localId)
  const categoryMap = useMemo(() => {
    const map = new Map<string, CategoryDto>()
    categories?.forEach(c => map.set(c.id, c))
    return map
  }, [categories])

  const top = items.slice(0, 8)

  return (
    <div className="min-w-0 rounded-2xl border border-border bg-surface-soft/30 p-4">
      <h3 className="text-sm font-extrabold text-text-main">Ventas por rubro</h3>
      <div className="relative mt-3 h-48 min-w-0 sm:h-64">
        <Bar
          data={{
            labels: top.map((i) => i.categoryName),
            datasets: [
              {
                label: 'Ventas',
                data: top.map((i) => i.revenue),
                backgroundColor: top.map((i) => {
                  const cat = i.categoryId ? categoryMap.get(i.categoryId) : undefined
                  return getCategoryUi(cat?.templateSlug ?? null, cat?.colorHex).colorHex
                }),
                borderRadius: 8,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y' as const,
            plugins: { legend: { display: false } },
          }}
        />
      </div>
    </div>
  )
}
