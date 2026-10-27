# Workspace

Production-ready React frontend foundation: **React 19 · TypeScript (strict) · Vite · React Router · Redux Toolkit / RTK Query · Zustand · Tailwind CSS v4 · React Hook Form + Zod · Vitest + Testing Library + MSW**.

## Getting started

Requires Node ≥ 22.22 and pnpm (version pinned in `package.json#packageManager`).

```bash
pnpm install
cp .env.example .env.local   # mocks are enabled by default
pnpm dev                     # http://localhost:3000
```

With mocks enabled, sign in with **demo@example.com / password123**. To use a real backend, set `VITE_ENABLE_MOCKS=false` and either point `VITE_API_BASE_URL` at it or set `API_PROXY_TARGET` to proxy `/api` through the dev server.

## Scripts

| Script               | Purpose                                               |
| -------------------- | ----------------------------------------------------- |
| `pnpm dev`           | Dev server with HMR (and MSW mocks if enabled)        |
| `pnpm build`         | Type-check, then build to `dist/`                     |
| `pnpm preview`       | Serve the production build locally                    |
| `pnpm typecheck`     | `tsc -b` across app and tooling configs               |
| `pnpm lint`          | ESLint, including a11y rules and architecture imports |
| `pnpm format`        | Prettier (with Tailwind class sorting)                |
| `pnpm test`          | Vitest in watch mode                                  |
| `pnpm test:coverage` | Single run with V8 coverage                           |
| `pnpm check`         | Everything CI should run: types, lint, format, tests  |

## Environment

All configuration is validated at startup in [`src/shared/config/env.ts`](src/shared/config/env.ts). Only `VITE_*` variables reach the browser bundle, so never put secrets in them.

| Variable            | Default | Description                                         |
| ------------------- | ------- | --------------------------------------------------- |
| `VITE_API_BASE_URL` | `/api`  | Base URL of the main backend                        |
| `VITE_ENABLE_MOCKS` | `false` | Serve API responses from MSW (dev server only)      |
| `API_PROXY_TARGET`  | –       | Dev-only: proxy `/api` to this origin (not bundled) |

## Architecture

See **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** for the directory layout, dependency rules, state ownership, RTK Query conventions, and the checklist for adding a new module.
