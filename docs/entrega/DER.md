# DER — Diagrama Entidad-Relación (PreciosYa)

**Fuente de verdad:** [`apps/api/prisma/schema.prisma`](../../apps/api/prisma/schema.prisma)

## Diagrama (Mermaid)

```mermaid
erDiagram
  User ||--o{ Local : owns
  User ||--o{ Notification : receives
  User ||--o{ Subscription : has

  Local ||--o{ Category : has
  Local ||--o{ Product : has
  Local ||--o{ PriceList : exports
  Local ||--o{ Sale : records

  CategoryTemplate ||--o{ Category : seeds
  Category ||--o{ Product : groups

  Product ||--o{ PriceHistory : tracks
  Product ||--o{ SaleLine : sold_in

  Sale ||--|{ SaleLine : contains

  User {
    uuid id PK
    string email UK
    string name
    enum plan
    datetime plan_expires_at
  }

  Local {
    uuid id PK
    uuid user_id FK
    string name
    decimal min_margin_pct
    datetime last_ipc_applied_period
    datetime last_usd_applied_period
  }

  Category {
    uuid id PK
    uuid local_id FK
    uuid template_id FK
    enum preferred_index
    boolean is_active
  }

  Product {
    uuid id PK
    uuid local_id FK
    uuid category_id FK
    decimal cost
    decimal margin_pct
    decimal sale_price
    boolean is_margin_alert
  }

  PriceHistory {
    uuid id PK
    uuid product_id FK
    enum change_reason
    datetime recorded_at
  }

  EconomicIndex {
    uuid id PK
    enum type
    datetime period
    decimal value_pct
  }

  Sale {
    uuid id PK
    uuid local_id FK
    datetime sold_at
  }

  SaleLine {
    uuid id PK
    uuid sale_id FK
    uuid product_id FK
    decimal quantity
    decimal unit_sale_price
    decimal unit_cost_snapshot
  }
```

## Entidades (13 tablas)

| Tabla | Descripción |
|-------|-------------|
| `users` | Cuenta Google; plan Free/Pro/Agency |
| `locals` | Sucursal/negocio del usuario |
| `category_templates` | Catálogo COICOP/INDEC seed |
| `categories` | Rubros activos por local |
| `products` | Artículos con costo, margen, precio |
| `price_history` | Append-only cambios de precio |
| `economic_indices` | IPC y USD históricos |
| `price_lists` | Registro exports PNG |
| `notifications` | Alertas in-app |
| `subscriptions` | Suscripciones (manual v1) |
| `sales` | Cabecera venta |
| `sale_lines` | Líneas con snapshots |

## Enums principales

| Enum | Valores relevantes |
|------|-------------------|
| `PlanType` | FREE, PRO, AGENCY |
| `ChangeReason` | MANUAL, BULK_PCT, IPC_INDEC, BCRA_RATE, IMPORT |
| `IndexType` | IPC_INDEC_*, BCRA_USD_OFICIAL |
| `NotifType` | NEW_IPC, BCRA_USD_ALERT, MARGIN_ALERT, … |

## Reglas de integridad

- `sale_lines.product_id` → `ON DELETE RESTRICT` (preserva historial).
- `products`, `categories` → cascade con `local`.
- `price_history` nunca se actualiza ni borra (trigger Postgres + política app).

## Índices de performance

- `products(local_id, is_active)`
- `price_history(product_id, recorded_at DESC)`
- `sales(local_id, sold_at DESC)`
- `economic_indices(type, period DESC)`
