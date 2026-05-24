import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

import type { ProductHistoryEntryDto } from '@/types/product'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

type PriceHistoryChartProps = {
  rows: ProductHistoryEntryDto[]
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getDate()}/${d.getMonth() + 1}`
}

export function PriceHistoryChart({ rows }: PriceHistoryChartProps) {
  const ordered = [...rows].reverse()
  const labels = ordered.map((r) => fmtDate(r.recordedAt))

  const data = {
    labels,
    datasets: [
      {
        label: 'Costo',
        data: ordered.map((r) => r.cost),
        borderColor: '#D97706',
        backgroundColor: '#D97706',
      },
      {
        label: 'Precio venta',
        data: ordered.map((r) => r.salePrice),
        borderColor: '#16A34A',
        backgroundColor: '#16A34A',
      },
    ],
  }

  return (
    <div className="surface-card p-4">
      <h3 className="text-sm font-extrabold text-text-main">Evolución de precios</h3>
      <div className="mt-3 h-72">
        <Line
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom' as const,
                labels: {
                  font: {
                    family: "'DM Mono', monospace",
                  },
                },
              },
              tooltip: {
                bodyFont: {
                  family: "'DM Mono', monospace",
                },
                titleFont: {
                  family: "'DM Mono', monospace",
                },
              },
            },
            scales: {
              y: {
                ticks: {
                  font: {
                    family: "'DM Mono', monospace",
                  },
                },
              },
            },
          }}
        />
      </div>
    </div>
  )
}
