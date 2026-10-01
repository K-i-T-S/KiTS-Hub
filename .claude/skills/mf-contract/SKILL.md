---
name: mf-contract
description: Module Federation contract for KiTS Hub — remote names, ports, exposed modules and shared singletons for the shell and the six solutions. Use before editing any webpack.config.cjs, adding or renaming an exposed module, changing React/router versions, or debugging "Invalid hook call", blank remotes, or remoteEntry.js load failures.
---

# KiTS Hub Module Federation contract

The shell (`shared-shell`, host) loads six solutions (remotes) at runtime over
Module Federation. Each app is a webpack-served React 18 SPA with react-router —
`next` is listed as a dependency but no app is served by Next.js.

## Contract (source of truth: each app's `webpack.config.cjs`)

| App | Workspace | MF name | Dev port | Exposed modules |
|---|---|---|---|---|
| Shell (host) | `@kits-hub/shared-shell` | `shell` | 3000 | — |
| Inventory | `@kits-hub/inventory-management` | `inventoryManagement` | 4177 | `./App`, `./InventoryDashboard`, `./ProductsPage`, `./bootstrap` |
| Point of Sale | `@kits-hub/point-of-sale` | `pointOfSale` | 4178 | `./App`, `./PosApp`, `./PosDashboard`, `./CheckoutPage`, `./TransactionsPage`, `./ReceiptsPage`, `./SettingsPage`, `./bootstrap` |
| CRM | `@kits-hub/crm-system` | `crmSystem` | 4179 | `./App`, `./CrmApp`, `./CrmDashboard`, `./CustomersPage`, `./CommunicationsPage`, `./SalesPage`, `./SettingsPage`, `./bootstrap` |
| HR | `@kits-hub/hr-management` | `hrManagement` | 4180 | `./App`, `./HrApp`, `./HrDashboard`, `./EmployeesPage`, `./AttendancePage`, `./PayrollPage`, `./SettingsPage`, `./bootstrap` |
| Accounting | `@kits-hub/accounting-system` | `accountingSystem` | 4181 | `./App`, `./AccountingApp`, `./AccountingDashboard`, `./TransactionsPage`, `./InvoicesPage`, `./ReportsPage`, `./SettingsPage`, `./bootstrap` |
| Analytics | `@kits-hub/analytics-dashboard` | `analyticsDashboard` | 4182 | `./App`, `./AnalyticsApp`, `./AnalyticsDashboard`, `./ReportsPage`, `./KPIPage`, `./TrendsPage`, `./SettingsPage`, `./bootstrap` |

The shell's `remotes` map uses `<mfName>@http://localhost:<port>/remoteEntry.js`.

Shell `shared` singletons: `react` 18.3.1, `react-dom`, `react-router-dom`,
`@supabase/supabase-js`, `@kits-hub/ui` (`^1.0.0`). `lucide-react` is shared but
not a singleton.

## Rules when changing anything above

1. An MF name, port or exposed key is a cross-app API. Change the remote's
   `webpack.config.cjs` **and** the shell's `remotes` / import sites in the same
   change, then update the table here.
2. Never remove or rename an exposed key without searching the shell for
   `'<mfName>/<Key>'` imports first.
3. React, react-dom and react-router-dom must be singletons with matching
   `requiredVersion` on host and every remote. Mismatched or unshared copies
   cause "Invalid hook call" and blank remotes.
4. Keep `entry: './src/bootstrap.tsx'` (async boundary) in every remote.
5. Verify with `npm run test:module-federation` and by loading each remote
   through the shell, not just standalone.

## Known issues

None open. Fixed 2026-10-01 (uncommitted at the time): the four remotes that had
`shared: {}` (crm, hr, accounting, analytics) now share react / react-dom /
react-router-dom as singletons, and the shell's `dev`/`start` scripts point at
`webpack.config.cjs` instead of deleted variants.
