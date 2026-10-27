# Architecture

The codebase is organised by **business domain**. Each domain is a module that owns its pages, components, API endpoints, types, hooks and tests. Shared infrastructure and generic UI live outside modules and know nothing about them.

## Directory layout

```
src/
  app/                 Composition root: wires everything together
    layouts/           App shell (header, navigation, main landmark)
    providers/         Global providers (Redux, theme sync)
    router/            Route tree composition, error and not-found pages
    store/             Redux store, listeners, app-level Zustand stores
  services/
    api/               Shared RTK Query API, base query, error normalization
  shared/              Domain-free building blocks
    config/            Validated environment configuration
    constants/         App-wide constants
    hooks/             Generic hooks (debounce, document title)
    lib/               Generic utilities (cn, error helpers, form helpers)
    types/             Cross-cutting types (ApiError, Paginated)
    ui/                Generic, accessible UI primitives
  modules/
    <domain>/
      api/             Endpoints injected into the shared API
      components/      Feature components (see "Module anatomy")
      hooks/           Feature hooks
      mocks/           MSW handlers for this domain (dev + tests only)
      pages/           Route-level screens (lazy-loaded)
      types/           Domain types and Zod schemas
      utils/           Domain helpers
      routes.ts        Route definitions owned by the module
      index.ts         Public API — the only file other code may import
  mocks/               Composes module mock handlers for browser/Node
  styles/              Design tokens and global CSS
  test/                Test setup and render helpers
  main.tsx             Entry point
```

Folders exist only when they have content. Don't create empty ones to match this list.

## Dependency rules

```
app  ──►  modules (public index only)  ──►  services  ──►  shared
 └──────────────────────────────────────────────┴───────────►  shared
```

| Layer      | May import                                                     |
| ---------- | -------------------------------------------------------------- |
| `app`      | anything                                                       |
| `modules`  | `shared`, `services`, other modules **via `@/modules/<name>`** |
| `services` | `shared`                                                       |
| `shared`   | nothing above it                                               |

ESLint (`no-restricted-imports`) enforces these rules. Inside a module, use relative imports. Across modules, import only from the other module's `index.ts`. If two modules need the same thing, the right fix is usually to move it into `shared/`, not to deepen the coupling between them.

## Module anatomy

- **`pages/`**: route-level screens. A page owns its data fetching, URL state and orchestration. Every page renders exactly one `PageHeader`, which owns the `<h1>` and the document title.
- **`components/`**: feature components. They receive data through props and report back through callbacks. The proposed split between `components/` and `ui/` was folded into `components/`, because the line between "composed" and "presentational" kept moving and the split added churn without adding clarity. Generic presentation belongs in `shared/ui/`.
- **`containers/`** is optional. Add it only when one piece of orchestration (data, mutations, navigation) is reused by several pages. Until then, pages are the containers.
- **`routes.ts`**: the module's `RouteObject[]`, with `lazy` pages so each module becomes its own chunk. The app decides where to mount the routes (public, or inside the authenticated shell).
- **`paths.ts`**: URL builders. Other modules link with these instead of hard-coded strings.
- **`index.ts`**: the public API. Export as little as possible.

## State ownership

| Kind of state                                            | Owner                                         |
| -------------------------------------------------------- | --------------------------------------------- |
| Server data (anything fetched)                           | **RTK Query** cache. Never copy it elsewhere. |
| Shareable / navigable view state (filters, page, sort)   | **URL search params**                         |
| Form state                                               | **React Hook Form** (+ Zod schema)            |
| Local interaction state (open/closed, hover, draft text) | **`useState`** in the component               |
| Shared client state with a clear owner (UI preferences)  | **Zustand**: small, focused stores            |

### RTK Query conventions

- **One API** ([`services/api/baseApi.ts`](../src/services/api/baseApi.ts)). Modules call `baseApi.injectEndpoints` in `modules/<name>/api/<name>Api.ts`. There is no central endpoint registry. The only shared edit is adding a new **tag type** to `tagTypes`.
- **Naming.** Queries are `getX` (one item) and `listX` (collections). Mutations use a verb: `createX`, `updateX`, `deleteX`, or a domain verb such as `login`. Export the generated hooks from the same file.
- **Typing.** Every endpoint declares `<Result, Arg>`. Use `void` for endpoints that take no argument.
- **Tags.** A list provides `{ type, id }` for each item plus `{ type, id: 'LIST' }`. An update invalidates `{ type, id }`, which also refetches every list containing that item. Creates and deletes invalidate `LIST`.
- **Errors.** The base query normalizes every failure into `ApiError` (`shared/types/api.ts`): a status, a user-safe message, and optional `code` and `fieldErrors`. Use `getErrorMessage(error)` to display one, and `applyServerErrors` to map an error onto a form. When the backend's error format changes, update [`normalizeError.ts`](../src/services/api/normalizeError.ts) and nothing else.
- **Retries.** Queries retry network errors, timeouts, 429 and 5xx responses up to twice, with exponential backoff. **Mutations never retry automatically.** A timed-out POST may already have succeeded, and replaying it could create a duplicate. An endpoint can opt out with `extraOptions: { maxRetries: 0 }`.
- **Duplicate submissions.** Submit buttons stay disabled while the mutation is in flight (`isSubmitting` / `isLoading`). If the backend supports idempotency keys, add them per endpoint for operations where a duplicate would be costly.
- **Session expiry.** Any 401 response invalidates the `Session` tag ([`app/store/sessionExpiryListener.ts`](../src/app/store/sessionExpiryListener.ts)). The route guard then redirects to sign-in, and the user returns to the original URL afterwards. Modules never handle 401 themselves.
- **Sign-out** calls `resetApiState()`, so no cached data from the previous user survives.
- **UI states.** Every query-backed view handles _loading_ (spinner), _error_ (alert with retry), _empty_ (with separate copy for filtered and truly empty), and _success_. Background refetches keep the stale data on screen, dimmed, with `aria-busy`.
- **Pagination and filtering.** Filters live in the URL (see `useProductListParams`). They are parsed with Zod and fall back to defaults when invalid. Changing a filter resets to page 1. Search input is debounced before it reaches the URL.
- **Code generation.** There is currently no OpenAPI contract, so types are written by hand. Once the backend publishes a reliable schema, generate endpoint types with `@rtk-query/codegen-openapi`, using `injectEndpoints` output per module.

### Zustand conventions

- One store per concern, named `use<Concern>Store`. Subscribe with fine-grained selectors (`useStore((s) => s.field)`). Never subscribe to the whole store.
- **Persist only explicitly approved, non-sensitive preferences.** Every persisted store sets a `name`, a `version`, `partialize` (an allowlist of fields to persist) and `migrate`. Bump `version` whenever the persisted shape changes ([example](../src/app/store/preferencesStore.ts)).
- Never put server data, tokens or session details in Zustand. Authentication relies on an HttpOnly cookie (`credentials: 'include'`), so no token exists in JavaScript.
- An app-shell store lives in `app/store/`. A store owned by one feature lives in that module, for example a multi-step wizard spanning several of its routes.

## Styling

Tailwind CSS v4 with semantic design tokens ([`styles/tokens.css`](../src/styles/tokens.css)). Components use semantic utilities such as `bg-surface`, `text-muted` and `border-border`, never raw palette colours. Themes work by swapping CSS variables under `[data-theme]`, so components need no `dark:` variants. Compose classes with `cn()`. Prettier sorts the class lists.

## Accessibility baseline

- Skip link, landmark regions, and focus moves to `<main>` on every client-side navigation.
- A descriptive document title on every page (via `PageHeader`).
- Form fields go through `Field`, which guarantees a `<label>`, plus `aria-invalid` and `aria-describedby` for hints and errors.
- Errors use `role="alert"`, and loading states use `role="status"` and `aria-busy`.
- Dialogs use the native `<dialog>` element, which provides focus trapping, Escape to close, and focus restoration.
- Focus rings are visible, and animation is reduced when the user prefers reduced motion.
- `eslint-plugin-jsx-a11y` runs in CI. Tests query by role and accessible name, so they also fail when accessibility breaks.

## Testing

- **Vitest + Testing Library** for components and pages, run against the **same MSW handlers** the dev server uses. Requests with no handler fail the test.
- `renderRoute(routes, { path })` renders real module routes with a fresh store and an in-memory router.
- Pure logic (error normalization, redirect safety, store migrations) gets plain unit tests.
- Test files sit next to the code they cover (`*.test.ts(x)`).

## Error handling

- Route-level `errorElement`s catch render errors and failed chunk loads. A failure inside a page keeps the app shell and navigation usable.
- Request errors are data (`ApiError`), not exceptions, and each view renders them in context.

## Adding a module

1. Create `src/modules/<name>/` with `types/`, `api/<name>Api.ts` (`baseApi.injectEndpoints`), `pages/`, and whatever else it needs.
2. Add the entity's tag type to `tagTypes` in `services/api/baseApi.ts`.
3. Define `routes.ts` with lazy pages, plus `paths.ts` if other code links to the module.
4. Export the public API from `index.ts`.
5. Mount the routes in `app/router/routes.tsx` and add a nav entry in `app/layouts/navigation.ts`.
6. Add `mocks/handlers.ts` and register it in `src/mocks/handlers.ts`.
7. Write tests with `renderRoute`.

No existing module needs to change.
