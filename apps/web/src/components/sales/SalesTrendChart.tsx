import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

type Point = { date: string; revenue: number }

type SalesTrendChartProps = {
  title: string
  points: Point[]
}

export function SalesTrendChart({ title, points }: SalesTrendChartProps) {
  const labels = points.map((p) => {
    const [, m, d] = p.date.split('-')
    return `${d}/${m}`
  })

  return (
    <div className="surface-card p-4">
      <h3 className="text-sm font-extrabold text-text-main">{title}</h3>
      <div className="mt-3 h-56 sm:h-64">
        <Line
          data={{
            labels,
            datasets: [
              {
                label: 'Facturación',
                data: points.map((p) => p.revenue),
                borderColor: '#16A34A',
                backgroundColor: 'rgba(22, 163, 74, 0.08)',
                fill: true,
                tension: 0.3,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: {
                ticks: {
                  font: { family: "'DM Mono', monospace", size: 10 },
                },
              },
            },
          }}
        />
      </div>
    </div>
  )
}
