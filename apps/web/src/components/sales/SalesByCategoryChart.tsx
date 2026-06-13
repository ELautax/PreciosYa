import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

type SalesByCategoryChartProps = {
  items: { categoryName: string; revenue: number }[]
}

export function SalesByCategoryChart({ items }: SalesByCategoryChartProps) {
  const top = items.slice(0, 8)

  return (
    <div className="surface-card p-4">
      <h3 className="text-sm font-extrabold text-text-main">Ventas por rubro</h3>
      <div className="mt-3 h-56 sm:h-64">
        <Bar
          data={{
            labels: top.map((i) => i.categoryName),
            datasets: [
              {
                label: 'Ventas',
                data: top.map((i) => i.revenue),
                backgroundColor: '#16A34A',
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
