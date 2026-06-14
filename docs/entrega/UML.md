# UML — PreciosYa

Diagramas en Mermaid (exportables a PNG desde GitHub, VS Code o mermaid.live).

---

## 1. Casos de uso (resumen)

```mermaid
flowchart TB
  subgraph actors [Actores]
    C[Comerciante]
    A[Administrador]
  end

  subgraph system [PreciosYa]
    UC1((Login))
    UC2((Gestionar catalogo))
    UC3((Aplicar indices))
    UC4((Registrar ventas))
    UC5((Exportar PNG))
    UC6((Admin IPC))
  end

  C --> UC1
  C --> UC2
  C --> UC3
  C --> UC4
  C --> UC5
  A --> UC6
```

Detalle en [CASOS_DE_USO.md](./CASOS_DE_USO.md).

---

## 2. Secuencia — Login

```mermaid
sequenceDiagram
  participant U as Usuario
  participant Web as apps/web
  participant Supa as Supabase Auth
  participant API as Express API
  participant DB as PostgreSQL

  U->>Web: Click Google Login
  Web->>Supa: signInWithOAuth
  Supa-->>Web: session + JWT
  Web->>API: POST /api/auth/google
  API->>Supa: verifyToken
  API->>DB: findOrCreateUser
  DB-->>API: user
  API-->>Web: JWT app + profile
  Web-->>U: Redirect /dashboard
```

---

## 3. Secuencia — Aplicar IPC

```mermaid
sequenceDiagram
  participant U as Comerciante
  participant Web as Frontend
  participant API as API
  participant Econ as economic-index.service
  participant DB as PostgreSQL

  U->>Web: Confirmar Apply IPC
  Web->>API: PUT /api/locals/:id/apply-ipc
  API->>Econ: applyIPCToLocal
  Econ->>DB: get latest IPC by rubro
  Econ->>DB: update products cost (exclude USD rubros)
  Econ->>DB: set last_ipc_applied_period
  DB-->>Econ: ok
  Econ-->>API: summary
  API-->>Web: success
  Web-->>U: Banner verde aplicado
```

---

## 4. Secuencia — Registrar venta

```mermaid
sequenceDiagram
  participant U as Comerciante
  participant Web as Frontend
  participant API as API
  participant Sale as sale.service
  participant DB as PostgreSQL

  U->>Web: Confirmar venta (N items)
  Web->>API: POST /api/sales
  API->>Sale: createSale
  Sale->>DB: load products (active)
  Sale->>Sale: snapshot cost + salePrice
  Sale->>DB: transaction Sale + SaleLines
  DB-->>Sale: sale id
  Sale-->>API: sale dto
  API-->>Web: 201 Created
  Web-->>U: Toast Venta registrada
```

---

## 5. Diagrama de clases — Dominio (simplificado)

```mermaid
classDiagram
  class PricingEngine {
    +calculateSalePrice(cost, marginPct)
    +applyIPC(cost, ipcPct)
    +bulkUpdateCosts(products, pct)
  }

  class SalesMath {
    +lineRevenue(price, qty)
    +lineProfit(price, cost, qty)
    +averageTicket(revenue, count)
  }

  class Product {
    +UUID id
    +Decimal cost
    +Decimal marginPct
    +Decimal salePrice
  }

  class Sale {
    +UUID id
    +DateTime soldAt
    +SaleLine[] lines
  }

  class SaleLine {
    +Decimal quantity
    +Decimal unitSalePrice
    +Decimal unitCostSnapshot
  }

  Sale "1" --> "*" SaleLine
  SaleLine --> Product : productId
  Product --> PricingEngine : uses
  SaleLine --> SalesMath : uses
```

Implementación: `packages/shared/src/pricing.ts`, `sales.ts`

---

## 6. Despliegue (deployment)

```mermaid
flowchart TB
  User[Usuario mobile/desktop]
  VercelWeb[Vercel web]
  VercelLand[Vercel landing]
  Railway[Railway API]
  Supa[(Supabase)]

  User --> VercelWeb
  User --> VercelLand
  VercelWeb --> Railway
  Railway --> Supa
  VercelWeb --> Supa
```

Ver [DISENO_ARQUITECTURA.md](./DISENO_ARQUITECTURA.md).
