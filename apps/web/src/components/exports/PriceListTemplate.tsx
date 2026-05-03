import type { LocalDto } from '@/types/local'
import type { ProductDto } from '@/types/product'

type PriceListTemplateProps = {
  local: LocalDto
  products: ProductDto[]
  variant?: 'preview' | 'export'
}

export function PriceListTemplate({
  local,
  products,
  variant = 'preview',
}: PriceListTemplateProps) {
  const generatedAt = new Date().toLocaleString('es-AR')
  const visibleProducts = products.slice(0, 60)
  const isExport = variant === 'export'

  const width = isExport ? '900px' : '100%'
  const headingSize = isExport ? '40px' : '34px'
  const headingLine = isExport ? '44px' : '38px'
  const subSize = isExport ? '18px' : '16px'
  const headerSize = isExport ? '24px' : '20px'
  const rowNameSize = isExport ? '30px' : '26px'
  const rowNameLine = isExport ? '34px' : '30px'
  const rowUnitSize = isExport ? '18px' : '16px'
  const rowPriceSize = isExport ? '32px' : '28px'
  const rowPriceLine = isExport ? '36px' : '32px'
  const footerSize = isExport ? '18px' : '16px'

  return (
    <section
      style={{
        width,
        background: '#FFFFFF',
        color: '#1C1917',
        padding: '32px',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
      }}
    >
      <header style={{ borderBottom: '1px solid #E7E5E4', paddingBottom: '16px' }}>
        <h2 style={{ fontSize: headingSize, lineHeight: headingLine, fontWeight: 700, color: '#0F7A35' }}>
          {local.name}
        </h2>
        <p style={{ marginTop: '6px', fontSize: subSize, color: '#44403C' }}>
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
          fontSize: headerSize,
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
              <p style={{ margin: 0, fontSize: rowNameSize, lineHeight: rowNameLine, fontWeight: 600 }}>
                {p.name}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: rowUnitSize, color: '#78716C' }}>{p.unit}</p>
            </div>
            <p
              style={{
                margin: 0,
                textAlign: 'right',
                fontSize: rowPriceSize,
                lineHeight: rowPriceLine,
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
          fontSize: footerSize,
          color: '#78716C',
        }}
      >
        Generado con PreciosYa
      </footer>
    </section>
  )
}
