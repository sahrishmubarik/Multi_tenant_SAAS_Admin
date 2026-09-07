# CLAUDE.md

Guidance for Claude Code (and other agents) when working in this repository.

## What this project is

A **multi-tenant SaaS admin** with role-based access control (RBAC). Users create workspaces (tenants), invite members by email, and manage each member's role. Every sensitive action is written to an audit log ("Activity").

The repo is a two-part monorepo with **no root package.json** — `backend/` and `frontend/` are installed and run independently.

- **`backend/`** — REST API. Node.js + Express 5, Drizzle ORM over PostgreSQL, JWT auth, bcrypt, Zod validation, Mailgun for transactional email. ESM (`"type": "module"`).
- **`frontend/`** — SPA. React 19, Vite, React Router 7, Tailwind CSS 4, Zod, FontAwesome.

## Commands

Run these from the respective subdirectory.

### Backend (`cd backend`)
```bash
npm install              # or: pnpm install  (see note below)
npm run dev              # start API on PORT (default 3000) — no watch/reload
npm start                # same as dev
npm run db:generate      # generate a new SQL migration from schema changes
npm run db:migrate       # apply migrations (runs src/db/migrate.js)
npm run studio           # open Drizzle Studio
```
There is **no test runner** — `npm test` intentionally exits 1.

### Frontend (`cd frontend`)
```bash
npm install
npm run dev              # Vite dev server on :5173, proxies /api -> :3000
npm run build            # production build
npm run preview          # preview the build
npm run lint             # ESLint
```

## Architecture & conventions

### Backend layout
```
backend/src/
├── config/         # db pool (client.js)
├── controllers/    # thin HTTP handlers — one file per feature: authController, workspaceController, invitationController
├── services/       # business logic: authService, workspaceService, memberService, invitationService (+ auditLog, emailService)
├── repositories/   # data access (Drizzle): userRepo, workspaceRepo, workspaceMemberRepo, invitationRepo
├── middlewares/    # auth, owner, ownerOrAdmin, admin, errorHandler
├── routes/         # auth.js, workspace.js, invitation.js, index.js (aggregator)
├── validators/     # authValidation.js, workspaceValidation.js (Zod)
├── templates/      # email.js (HTML)
├── utils/          # cryptoUtils.js, pagination.js, errors.js (typed AppError classes)
├── db/
│   ├── schema/     # one file per table + index.js barrel (re-exports all)
│   ├── migrate.js
│   └── migrations/
├── app.js          # builds the Express app (cors, json, router, errorHandler) and exports it
└── server.js       # imports app, reads PORT, listen()
```

### Layered architecture (controller → service → repository)
The backend is layered; keep the layers separated when adding code.
- **Controllers** are thin: parse/validate input, call a service, send the success response. No `try/catch`, no direct DB access.
- **Services** hold the business logic and orchestration. They return data or **throw a typed error** from `#utils/errors.js` (`BadRequestError` 400, `UnauthorizedError` 401, `ForbiddenError` 403, `NotFoundError` 404, `ConflictError` 409). Services never touch `res`.
- **Repositories** own the Drizzle queries. The repeated membership/role and user lookups live here (`workspaceMemberRepo`, `userRepo`), not inline in each handler.

### Error handling is centralized — do not write `try/catch` in controllers
Express 5 automatically forwards a rejected promise from an async handler to the error middleware, so a thrown `ZodError` (from `schema.parse()`) or `AppError` bubbles to `middlewares/errorHandler.js`, which maps it to `{ success: false, message, errors? }` with the right status code. Add a new failure case by throwing a typed error in the service — never by hand-writing a `res.status(...).json(...)` in the controller. The one exception is genuinely best-effort work (e.g. the audit-log write in `changeUserPassword`), which is wrapped so a logging hiccup can't fail the request.

### Backend request flow
`server.js` → `app.js` → `routes/index.js` mounts three routers under `/api/v1`:
- `/api/v1/auth` — signup, login, forget/reset password, email verification, profile, change-password.
- `/api/v1/workspace` — workspace CRUD, members, role changes, ownership transfer, leave, activity.
- `/api/v1/workspace-invitation` — create / accept / revoke / status / details.

Each route composes middleware then a controller: `authMiddleware` (verify JWT, set `req.user`) → an authorization middleware → controller.

- **Adding an endpoint**: add a handler to the relevant feature controller → a function in the matching service → a repo method if a new query is needed → wire the route. Follow the existing thin-controller pattern.
- **Authorization middleware** lives in `src/middlewares/`: `owner.js` (owner only), `ownerOrAdmin.js` (owner or admin), `admin.js` (admin only). They resolve `workspaceId` from `req.params`/`req.body`/`req.query` and check the caller's row via `workspaceMemberRepo`.
- **Validation** uses Zod schemas in `src/validators/` (`authValidation.js` for auth, `workspaceValidation.js` for workspace). Controllers call `schema.parse(req.body)` — a failure throws a `ZodError` that the central handler formats. Don't hand-format validation errors.
- **Audit logging**: call `createAuditLog({ performedBy, action, affectedUser, message })` from `#services/auditLog.js` after a successful mutation (from the service layer).
- **Email**: `#services/emailService.js` (`sendEmailNotification`, `generateAndSendToken`) with HTML from `#templates/email.js`. Tokens are hashed via `#utils/cryptoUtils.js` before storage.

### Import aliases (backend)
`package.json` `imports` maps subpath aliases — **use these, not relative paths**: `#controllers/*`, `#routes/*`, `#middlewares/*`, `#config/*`, `#services/*`, `#repositories/*`, `#utils/*`, `#validators/*`, `#templates/*`, `#db/*`. Always include the `.js` extension (ESM). The `#` aliases also work inside the schema files and are resolved by `drizzle-kit`.

### Database
- Schema lives in `src/db/schema/` — **one file per table** (`user.js`, `workspace.js`, `workspaceMember.js`, `invitation.js`, `auditLog.js`), aggregated by `src/db/schema/index.js`. Import tables from the barrel: `import { users } from "#db/schema/index.js"`.
- Tables: `users`, `workspaces`, `workspace_members`, `invitations`, `auditLog`.
- **All IDs are UUIDs** (`uuid().defaultRandom()`). Do not treat IDs as integers.
- Roles are a pg enum: `admin`, `owner`, `editor`, `viewer`. A member defaults to `viewer`; the workspace creator is inserted as `owner`.
- Change a table → `npm run db:generate` → `npm run db:migrate`. Do not hand-edit files in `src/db/migrations/`.

### Frontend layout
```
frontend/src/
├── components/     # reusable UI components (moved out of the old assets/ folder)
├── context/        # WorkspaceContext (React context provider)
├── pages/          # routed pages
├── services/       # api.js
├── validations/    # validation.js (Zod, client-side)
├── App.jsx, main.jsx
```

- Import with the **`@` alias** (`@` → `src`), configured in `vite.config.js` and `jsconfig.json`: e.g. `import LoginCard from "@/components/LoginCard"`. Prefer `@/...` over relative paths for cross-folder imports.
- Components call the API with **relative** `fetch("/api/v1/...")`. In dev, Vite's proxy (`vite.config.js`) forwards `/api` to `http://localhost:3000`. Keep new calls relative so the proxy works — do not hardcode `http://localhost:...`.
- JWT is stored in `localStorage` under `token` and sent as `Authorization: Bearer <token>`. `ProtectedRoute` gates authenticated pages.

## Environment

Create `backend/.env` (git-ignored); see `backend/.env.example`. Required variables:

| Variable          | Purpose                                                 |
| ----------------- | ------------------------------------------------------- |
| `DATABASE_URL`    | PostgreSQL connection string                            |
| `JWT_SECRET`      | Signing secret for JWTs                                 |
| `PORT`            | API port (default 3000)                                 |
| `MAILGUN_API_KEY` | Mailgun API key for outbound email                      |
| `MAILGUN_DOMAIN`  | Mailgun sending domain                                  |
| `BASE_URL`        | App base URL used to build email links                  |
| `CORS_ORIGINS`    | Comma-separated allowed origins (default localhost:5173)|

## Gotchas

- **Two lockfiles** exist in `backend/` (`package-lock.json` and `pnpm-lock.yaml`). Pick one package manager and delete the other to avoid drift.
- `frontend/src/services/api.js` is **stale/unused** — it points at `http://localhost:5000`, which is not where the backend runs. Components fetch `/api/...` directly. Don't wire new code through it without fixing it first.
- `src/middlewares/admin.js` casts `workspaceId` with `Number()` even though IDs are UUID strings, so it always rejects. It is currently unused; fix it before using.
- `#services/emailService.js` builds the Mailgun client at **module load**, so the server won't boot without `MAILGUN_API_KEY`. For a local boot/smoke test without email, set a dummy value (`MAILGUN_API_KEY=dummy`).
- No automated tests exist — verify changes by running both apps and exercising the affected flow.
