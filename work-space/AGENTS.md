# Agent and contributor guide

Vite + React 19 + TypeScript (strict) SPA. Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) before making structural changes.

- Package manager: **pnpm**. Run `pnpm check` (types, lint, format, tests) before finishing a change.
- Business code goes in `src/modules/<domain>/`. Cross-module imports use only `@/modules/<name>` (the module's `index.ts`). ESLint enforces the layer rules.
- Server data lives in RTK Query only (`baseApi.injectEndpoints` inside the owning module). Don't copy it into Zustand or Redux slices.
- List filters and pagination live in URL search params. Use Zustand only for shared client state with a clear owner.
- Use `shared/ui` primitives and semantic Tailwind tokens (`bg-surface`, `text-muted`, …), never raw colours.
- Library versions are newer than many references: React Router 8 (`RouterProvider` from `react-router/dom`), MSW 3 (`onUnhandledFrame`), Zod 4, Tailwind 4. Check the installed types before relying on older APIs.
