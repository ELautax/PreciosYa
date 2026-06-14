# Diagrama de componentes — PreciosYa

## Monorepo

```mermaid
flowchart TB
  subgraph root [preciosya monorepo]
    subgraph apps [apps]
      web[web React PWA]
      api[api Express]
      landing[landing static]
    end
    subgraph packages [packages]
      shared[shared PricingEngine + sales math]
    end
  end

  web --> shared
  api --> shared
```

---

## Frontend — componentes principales

```mermaid
flowchart TB
  subgraph webApp [apps/web]
    App[App.tsx Router]
    Layout[AppLayout sidebar + bottom nav]
    Pages[Pages: Dashboard Products Sales History Settings Admin]
    Hooks[TanStack Query hooks]
    Contexts[AuthContext ThemeContext]
    SalesMod[sales/* tabs KPIs charts]
    ProductsMod[products/* form scanner bulk]
  end

  App --> Layout
  Layout --> Pages
  Pages --> Hooks
  Hooks -->|Axios JWT| API
  Contexts --> Hooks
```

| Módulo UI | Ruta | Responsabilidad |
|-----------|------|-----------------|
| Dashboard | `/dashboard` | KPIs, acciones rápidas |
| Productos | `/products` | CRUD, IPC/USD banners, export |
| Ventas | `/sales` | Registrar, resumen, historial, análisis |
| Historial | `/history` | IPC charts + bitácora producto |
| Rubros | `/categories` | Activar COICOP, toggle USD |
| Locales | `/locals` | CRUD locales |
| Ajustes | `/settings` | Cuenta, plan modal |
| Admin | `/admin` | IPC manual, usuarios |

---

## Backend — servicios y rutas

```mermaid
flowchart LR
  subgraph apiLayer [apps/api]
    Routes[routes/index]
    AuthR[auth]
    ProdR[products]
    LocalR[locals]
    CatR[categories]
    IpcR[ipc]
    SaleR[sales]
    ExportR[exports]
    AdminR[admin]
  end

  Routes --> AuthR
  Routes --> ProdR
  Routes --> SaleR
  Routes --> IpcR

  subgraph services [services]
    ProductSvc[product.service]
    EconSvc[economic-index.service]
    SaleSvc[sale.service]
    AnalyticsSvc[sale-analytics.service]
    IpcFetch[ipc-fetch/*]
  end

  ProdR --> ProductSvc
  SaleR --> SaleSvc
  SaleR --> AnalyticsSvc
  IpcR --> EconSvc
  EconSvc --> IpcFetch
```

---

## Integraciones externas

```mermaid
flowchart LR
  API[Express API]
  Alphacast[Alphacast CSV IPC]
  Argly[Argly fallback]
  BCRA[BCRA cotizaciones]
  SupaDB[(Supabase Postgres)]
  SupaStore[Storage price-lists]
  SupaAuth[Supabase Auth]
  Resend[Resend email]

  API --> Alphacast
  API --> Argly
  API --> BCRA
  API --> SupaDB
  API --> SupaStore
  API --> SupaAuth
  API -.-> Resend
```

---

## Paquete compartido (`packages/shared`)

| Módulo | Funciones |
|--------|-----------|
| `pricing.ts` | `calculateSalePrice`, `applyIPC`, `bulkUpdateCosts`, … |
| `sales.ts` | `lineRevenue`, `lineProfit`, `averageTicket` |
| `units.ts` | Enum unidades producto |

Tests Vitest en `packages/shared/src/__tests__/`.

---

## Schedulers

| Job | Cron | Acción |
|-----|------|--------|
| IPC mensual | 1er día hábil 9:00 | Fetch IPC → `economic_indices` → notif NEW_IPC |
| BCRA diario | 03:30 AR | USD oficial → variación diaria |

Archivo: `apps/api/src/jobs/ipc-scheduler.ts`
