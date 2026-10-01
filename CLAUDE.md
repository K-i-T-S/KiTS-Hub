# KiTS Hub

Multi-tenant business SaaS: a shell app that loads six business solutions over
Webpack Module Federation, backed by Supabase (with RLS) and Stripe. npm
workspaces monorepo, TypeScript, React 18.3.1. Node 20 or 24, npm 10 or 11.

## Layout

- `shared-shell/` — host app (`@kits-hub/shared-shell`, port 3000)
- `solutions/*` — six remotes: inventory-management, point-of-sale, crm-system,
  hr-management, accounting-system, analytics-dashboard (ports 4177–4182)
- `packages/*` — `@kits-hub/` auth, config, database, event-bus, navigation,
  notification, sync, ui, workflow (+ `ui-test-app`)
- `shared/*` — shared components, hooks, lib, services, types, etc.
- `kits-hub-v2.0/` — separate workspace; Supabase migrations live in
  `kits-hub-v2.0/supabase/migrations`
- `tests/` — `kits-hub-tests` workspace (unit, integration, e2e, visual)
- `archive/` — old code; don't edit or import from it

The apps are webpack-served React SPAs with react-router. `next` is a listed
dependency, but no app is served by Next.js.

## Commands

- Install: `npm install` (root only; workspaces resolve from here)
- One app: `npm run dev:<inventory|pos|crm|hr|accounting|analytics>` / `build:…` / `test:…` / `lint:…`
- Everything: `npm run dev`, `npm run build`, `npm run test`, `npm run lint`
- Types: `npm run typecheck` (tsc --build)
- Cross-app checks: `npm run test:module-federation`, `npm run test:cross-solution`

## Module Federation

Names, ports, exposed modules and shared singletons are in the `mf-contract`
skill (`.claude/skills/mf-contract/SKILL.md`). Read it before touching any
`webpack.config.cjs`, and keep it updated when the contract changes. To add a
solution, use `/new-solution`.

## Working rules

- After changing `packages/*`, `shared/*` or `shared-shell/`, run the
  `cross-solution-reviewer` agent to see which solutions are affected.
- For changes to auth, tenant scoping, RLS policies, Supabase queries or Stripe
  webhooks, run the `security-reviewer` agent. Focus it on tenant isolation:
  every query must be scoped to the caller's tenant, and webhook signatures must
  be verified.
- API responses use `{ success: boolean, data?: T, error?: string }`.
- Don't add `*_REPORT.md` / `*_SUMMARY.md` / `*_GUIDE.md` files to the repo
  root (a hook blocks new ones). Report results in chat; lasting docs go in
  `docs/`.
- Never edit `.env*` (except `*.example`) or `package-lock.json` directly
  (blocked by hook).
- Code files are auto-formatted with Prettier (`.prettierrc`) after each edit.
- The repo is public on GitHub: never commit secrets, keys or tenant data.
