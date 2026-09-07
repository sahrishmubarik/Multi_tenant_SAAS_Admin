# Frontend — Multi-Tenant SaaS Admin (RoleBase)

React single-page app for the multi-tenant SaaS admin: authentication, workspaces (tenants), members and roles, invitations, and an activity log.

## Tech stack

React 19 · Vite · React Router 7 · Tailwind CSS 4 · Zod · FontAwesome.

## Quick start

```bash
npm install
npm run dev       # start the dev server on http://localhost:5173
```

The dev server proxies `/api` to the backend at `http://localhost:3000` (see `vite.config.js`), so run the backend alongside it.

## Scripts

| Script | Description |
| ------ | ----------- |
| `npm run dev` | Start the Vite dev server (`:5173`) with the `/api` proxy. |
| `npm run build` | Production build to `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint. |

## Project structure

```
src/
├── pages/            # routed pages (Login, Signup, Dashboard, MyWorkspace, Members, Activity, …)
├── components/       # UI components
│   ├── ui/           # shared presentational primitives (Toast, ConfirmDialog, TextField, PasswordField)
│   └── members/      # members-feature pieces (MemberRow, RoleBadge)
├── context/          # WorkspaceContext (selected workspace + list)
├── services/         # api.js — the shared API client
├── validations/      # validation.js — Zod schemas (client-side)
├── App.jsx           # routes
└── main.jsx          # entry (wraps App in WorkspaceProvider)
```

## Conventions

### Imports — use the `@` alias
`@` maps to `src` (configured in `vite.config.js` and `jsconfig.json`). Import across folders with it instead of relative paths:

```js
import LoginCard from "@/components/LoginCard";
import { api } from "@/services/api";
import { useWorkspace } from "@/context/WorkspaceContext";
```

### Talking to the backend — always go through `api`
`src/services/api.js` exports an `api` client (`api.get/post/patch/delete`). It handles the `/api/v1` base path, JSON, the `Authorization: Bearer <token>` header, error normalization, and a 401 → clear-token-and-redirect-to-login. **Do not call `fetch` directly** and do not hand-build auth headers.

```js
import { api, ApiError } from "@/services/api";

// authenticated call (token injected automatically)
const data = await api.get("/workspace/my-workspaces");

// public call — no token
await api.post("/auth/login", credentials, { auth: false });
```

On failure the client throws an `ApiError` with `message`, `status`, and (for validation failures) a field-keyed `errors` object — catch it and read those:

```js
try {
  await api.post("/workspace", { workspaceName });
} catch (error) {
  setMessage(
    error.errors
      ? Object.values(error.errors).flat().join(" ")
      : error.message,
  );
}
```

Options: pass `{ auth: false }` for endpoints that must not send a token (login, signup, forgot/reset password, email verification, invitation details), and `{ skipAuthRedirect: true }` when the caller wants to handle a 401 itself instead of being redirected.

### Auth
The JWT lives in `localStorage` under `token`. `components/ProtectedRoute.jsx` gates authenticated pages. The selected workspace id is kept in `localStorage` under `workspaceId` and surfaced through `WorkspaceContext`.

### Validation
Client-side validation uses the Zod schemas in `src/validations/validation.js`. Components validate with `schema.safeParse(...)` and show field errors before calling `api`.

### Reusable UI
Prefer the primitives in `components/ui/` when building forms and dialogs:
- `TextField` / `PasswordField` — labeled inputs with an error slot (`PasswordField` includes its own show/hide toggle).
- `ConfirmDialog` — confirmation modal (title + body + Cancel/Confirm, with a loading state).
- `Toast` — top-right success toast.

## Notes

- `dist/` is the build output and is git-ignored.
- There are no automated tests yet; verify changes by running the app against the backend.
- For the overall project and backend, see the [root README](../README.md).
