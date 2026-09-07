# Backend — Multi-Tenant SaaS Admin API

REST API for the multi-tenant SaaS admin (RBAC). Handles authentication, workspaces (tenants), members and roles, invitations, and an audit log.

## Tech stack

Node.js · Express 5 · Drizzle ORM · PostgreSQL · JWT · bcrypt · Zod · Mailgun. ESM (`"type": "module"`).

## Quick start

```bash
npm install
cp .env.example .env      # then fill in the values
npm run db:migrate        # apply migrations to your database
npm run dev               # start the API on http://localhost:3000
```

## Scripts

| Script | Description |
| ------ | ----------- |
| `npm run dev` / `npm start` | Start the API on `PORT` (default 3000). No watch/reload. |
| `npm run db:generate` | Generate a new SQL migration from changes in `src/db/schema/`. |
| `npm run db:migrate` | Apply pending migrations (`src/db/migrate.js`). |
| `npm run studio` | Open Drizzle Studio to inspect data. |

There is no test runner yet — `npm test` intentionally exits 1.

## Architecture

The code is layered. Each request flows **route → middleware → controller → service → repository**, with errors handled centrally.

- **Controllers** (`src/controllers/`) are thin — one file per feature (`authController.js`, `workspaceController.js`, `invitationController.js`). They parse/validate input, call a service, and send the success response. They contain no `try/catch` and no direct DB access.
- **Services** (`src/services/`) hold the business logic (`authService`, `workspaceService`, `memberService`, `invitationService`, plus `auditLog` and `emailService`). They return data or throw a typed error; they never touch `res`.
- **Repositories** (`src/repositories/`) own the Drizzle queries (`userRepo`, `workspaceRepo`, `workspaceMemberRepo`, `invitationRepo`), so the common lookups live in one place.
- **Error handling is centralized.** Controllers throw (a `ZodError` from `schema.parse()`, or a typed `AppError` from `src/utils/errors.js`); Express 5 forwards the rejected promise to `src/middlewares/errorHandler.js`, which returns `{ success, message, errors? }` with the right status code. Add a new failure case by throwing a typed error in the service, not by writing to `res`.

### Layout
```
src/
├── config/         # db pool (client.js)
├── controllers/    # authController, workspaceController, invitationController
├── services/       # authService, workspaceService, memberService, invitationService, auditLog, emailService
├── repositories/   # userRepo, workspaceRepo, workspaceMemberRepo, invitationRepo
├── middlewares/    # auth, owner, ownerOrAdmin, admin, errorHandler
├── routes/         # auth.js, workspace.js, invitation.js, index.js (aggregator)
├── validators/     # authValidation.js, workspaceValidation.js (Zod)
├── templates/      # email.js (HTML)
├── utils/          # cryptoUtils.js, pagination.js, errors.js (typed AppError classes)
├── db/
│   ├── schema/     # one file per table + index.js barrel
│   ├── migrate.js
│   └── migrations/
├── app.js          # Express app (cors, json, router, errorHandler) — exported
└── server.js       # imports app, reads PORT, listen()
```

### Import aliases
Use the subpath aliases from `package.json` `imports` instead of relative paths (always include the `.js` extension):

`#controllers/*` · `#routes/*` · `#middlewares/*` · `#config/*` · `#services/*` · `#repositories/*` · `#utils/*` · `#validators/*` · `#templates/*` · `#db/*`

## Database

The schema lives in `src/db/schema/` — one file per table (`user`, `workspace`, `workspaceMember`, `invitation`, `auditLog`), aggregated by `src/db/schema/index.js` (import via `#db/schema/index.js`). All primary keys are UUIDs. Roles are a pg enum (`admin`, `owner`, `editor`, `viewer`); the workspace creator is inserted as `owner`, and members default to `viewer`.

Edit a table → `npm run db:generate` → `npm run db:migrate`. Do not hand-edit files in `src/db/migrations/`.

## Environment

Copy `.env.example` to `.env` and fill in:

| Variable | Purpose |
| -------- | ------- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Signing secret for JWTs |
| `PORT` | API port (default 3000) |
| `MAILGUN_API_KEY` | Mailgun API key for outbound email |
| `MAILGUN_DOMAIN` | Mailgun sending domain |
| `BASE_URL` | App base URL used to build email links |
| `CORS_ORIGINS` | Comma-separated allowed origins (default `http://localhost:5173`) |

Note: the Mailgun client is created at module load, so the server won't boot without `MAILGUN_API_KEY`. For a local smoke test without email, set a dummy value.

## API

All routes are mounted under `/api/v1`. Protected routes expect an `Authorization: Bearer <token>` header. See the [root README](../README.md#api-overview) for the full endpoint table.

- `/api/v1/auth` — signup, login, forget/reset password, email verification, profile, change-password.
- `/api/v1/workspace` — workspace CRUD, members, role changes, ownership transfer, leave, activity.
- `/api/v1/workspace-invitation` — details, accept, revoke, create, status.

## Notes

- Two lockfiles exist (`package-lock.json` and `pnpm-lock.yaml`) — pick one package manager and remove the other.
- No automated tests yet; verify changes by booting the API and exercising the affected flow.
