import type { LocalDto } from '@/types/local'
import type { ProductDto } from '@/types/product'

type PriceListTemplateProps = {
  local: LocalDto
  products: ProductDto[]
}

export function PriceListTemplate({ local, products }: PriceListTemplateProps) {
  const generatedAt = new Date().toLocaleString('es-AR')
  const visibleProducts = products.slice(0, 60)

  return (
    <section
      style={{
        width: '900px',
        background: '#FFFFFF',
        color: '#1C1917',
        padding: '32px',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
      }}
    >
      <header style={{ borderBottom: '1px solid #E7E5E4', paddingBottom: '16px' }}>
        <h2 style={{ fontSize: '40px', lineHeight: '44px', fontWeight: 700, color: '#0F7A35' }}>
          {local.name}
        </h2>
        <p style={{ marginTop: '6px', fontSize: '18px', color: '#44403C' }}>
          Lista de precios · {generatedAt}
        </p>
      </header>

      <div
        style={{
          marginTop: '20px',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '12px',
          borderBottom: '1px solid #E7E5E4',
          paddingBottom: '8px',
          fontWeight: 700,
          fontSize: '24px',
          color: '#1C1917',
        }}
      >
        <span style={{ fontWeight: 700 }}>Producto</span>
        <span style={{ fontWeight: 700 }}>Precio</span>
      </div>

      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {visibleProducts.map((p) => (
          <li
            key={p.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 0',
              borderBottom: '1px solid #F1F5F9',
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: '30px', lineHeight: '34px', fontWeight: 600 }}>
                {p.name}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '18px', color: '#78716C' }}>{p.unit}</p>
            </div>
            <p
              style={{
                margin: 0,
                textAlign: 'right',
                fontSize: '32px',
                lineHeight: '36px',
                fontWeight: 700,
              }}
            >
              ${p.salePrice.toFixed(2)}
            </p>
          </li>
        ))}
      </ul>

      <footer
        style={{
          marginTop: '24px',
          borderTop: '1px solid #E7E5E4',
          paddingTop: '10px',
          fontSize: '18px',
          color: '#78716C',
        }}
      >
        Generado con PreciosYa
      </footer>
    </section>
  )
}
