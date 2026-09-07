# Backend Refactoring Notes

This document records the problems the backend had, and how each was resolved. It covers the folder structure, file names, and the architectural changes made under `backend/`.

The refactor was **structure and organization only** — API behavior was preserved. Every endpoint keeps its route, status codes, and success response shape. Error responses were standardized to `{ success, message, errors? }` (which the frontend already reads).

---

## 1. Non-standard folder & file names

### Problem
- The database layer folder was named `drizzle/` (tool name, not a role).
- The middleware folder was singular: `middleware/`.
- The route aggregator was `routes/route.js` (should be `index.js`).
- A "controller" that only writes audit logs (`controllers/auditLogs.js`) lived with the HTTP controllers even though it is a service.
- Inconsistent controller filenames: `change-password.js` (kebab-case) and `workSpaceMember.js` (mixed-case) among otherwise camelCase files.

### Fix — renamed/moved
| Before | After |
| ------ | ----- |
| `src/drizzle/` | `src/db/` |
| `src/middleware/` | `src/middlewares/` |
| `src/routes/route.js` | `src/routes/index.js` |
| `src/controllers/auditLogs.js` | `src/services/auditLog.js` |
| `src/controllers/change-password.js` | `src/controllers/changePassword.js` |
| `src/controllers/workSpaceMember.js` | `src/controllers/workspaceMember.js` |

All moves used `git mv` so history is preserved. The `package.json` subpath-import map, `drizzle.config.js`, and `db:migrate` script were updated to match.

---

## 2. Entry point mixed app config with server startup

### Problem
`server.js` created the Express app, configured CORS/JSON, mounted the router, **and** called `listen()` — all in one file. It also imported `dotenv` twice and hard-coded a personal ngrok URL in the CORS allow-list.

### Fix
- Split into `src/app.js` (builds and **exports** the configured Express app) and `src/server.js` (imports the app, reads `PORT`, calls `listen()`).
- Removed the duplicate `dotenv` import.
- CORS origins now come from a `CORS_ORIGINS` env var (comma-separated), defaulting to `http://localhost:5173`.

---

## 3. Fat controllers with duplicated logic and repetitive error handling

### Problem
All ~23 controllers inlined everything: validation, Drizzle queries, business rules, audit logging, response shaping, and a `try/catch` that returned a 500. The same queries were copy-pasted widely — "find user by email/id" in ~18 files, "find membership/role" in ~13 — and every controller repeated the same error boilerplate.

### Fix — layered architecture (controller → service → repository)
Introduced a standard layered structure:
- **Controllers** became thin: parse/validate input, call a service, send the success response. No `try/catch`, no direct DB access.
- **Services** (`src/services/`) hold the business logic and throw **typed errors**. New files: `authService.js`, `workspaceService.js`, `memberService.js`, `invitationService.js`.
- **Repositories** (`src/repositories/`) own the Drizzle queries, so the repeated lookups live in one place. New files: `userRepo.js`, `workspaceRepo.js`, `workspaceMemberRepo.js`, `invitationRepo.js`.
- The `owner` / `ownerOrAdmin` middlewares now use `workspaceMemberRepo` instead of re-writing the membership query.

### Fix — centralized error handling
- Added typed error classes in `src/utils/errors.js`: `AppError` + `BadRequestError` (400), `UnauthorizedError` (401), `ForbiddenError` (403), `NotFoundError` (404), `ConflictError` (409).
- Added `src/middlewares/errorHandler.js`, registered last in `app.js`. It maps a `ZodError` → 400, an `AppError` → its status, and anything else → 500, always as `{ success, message, errors? }`.
- Because Express 5 auto-forwards a rejected promise from an async handler to the error middleware, controllers no longer need `try/catch`. Validation uses `schema.parse()` (throws → central handler) instead of `safeParse` + hand-formatting.

### Result
Business logic moved out of the controllers into 6 services and 4 repositories, and every `res.status(500)` / `try/catch` was removed from the controllers.

---

## 4. Too many one-function controller files

### Problem
The `controllers/` folder held ~23 files, one per action (`login.js`-style granularity), which was noisy and didn't mirror the feature/service split.

### Fix — one controller file per feature
Consolidated the thin controllers into three files that match the routers and services:

| Feature | Controller file | Handlers |
| ------- | --------------- | -------- |
| Auth | `authController.js` | signup, login, forgetPassword, resetPassword, emailVerification, verifyEmail, profileController, changePassword |
| Workspace | `workspaceController.js` | workspaceCreate, getMyWorkspace, updateWorkspace, deleteWorkspace, transferWorkspaceOwnership, leaveWorkspace, getActivity, workSpaceMembers, getWorkspaceMembers, changeRole, getMemberOnBaseOfRole, deleteMember |
| Invitation | `invitationController.js` | createInvitation, acceptInvitation, revokeInvitation, getInvitationDetails, checkInvitationStatus |

Export names were kept identical, so only the route imports changed; the 23 old files were removed.

**Impact:** `controllers/` went from ~23 files (~2,450 lines) to **3 files (~310 lines)**.

---

## 5. Entire schema in one file

### Problem
Every table lived in a single `src/db/schema.js`.

### Fix — one file per table + barrel
- Created `src/db/schema/` with one file per table: `user.js`, `workspace.js`, `workspaceMember.js` (also holds `roleEnum`), `invitation.js`, `auditLog.js`.
- `src/db/schema/index.js` is the barrel that re-exports all tables — the single module everything imports (`import { users } from "#db/schema/index.js"`).
- Cross-table foreign-key references use the `#` alias (e.g. `workspace.js` imports `users` from `#db/schema/user.js`), consistent with the rest of the codebase.
- Table definitions are byte-for-byte identical, so `drizzle-kit generate` reports **no schema changes** — no new migration was created.

---

## 6. Misleading validator file name

### Problem
`validators/authValidation.js` also contained `workspaceNameValidation`, so the name no longer matched its contents. It also had a dead `import ... from "pg/lib/defaults"`.

### Fix — split by domain
- `validators/authValidation.js` now holds auth-only schemas (email/password bases, `withConfirmPassword`, login/signup/changePassword/verifiedEmail) — the name is accurate again.
- `validators/workspaceValidation.js` holds `workspaceNameValidation`.
- The dead `pg/lib/defaults` import was removed. Only `workspaceController.js` needed its import repointed.

---

## Bugs fixed along the way

These were pre-existing defects surfaced and fixed while moving logic into services.

| File / area | Bug | Fix |
| ----------- | --- | --- |
| add member (`workspaceMember`) | Called `createAuditLog` **without importing it** and referenced an undefined `member.userId` — the endpoint crashed. | Import the service and use the resolved `user.id`. |
| signup audit | Logged `undefined created account` because the insert didn't return `name`. | `userRepo.create` returns `name`. |
| delete member audit | Logged `undefined` for the member name (column not selected). | Repo selects `memberName`. |
| delete workspace audit | Action mislabeled `"Role Update"`. | Corrected to `"Delete workspace"`. |
| revoke invitation audit | Action `"Role Update"` and message `"…accepted invitation"`. | Corrected to `"Revoke invitation"` / `"…revoked an invitation."`. |
| forget / reset / verify responses | Returned `{ error }`, but the frontend reads `{ message }`, so messages never displayed. | Central handler returns `{ success, message, errors? }`. |

---

## Before → After (backend/src)

**Before**
```
src/
├── config/client.js
├── controllers/        # ~23 fat, per-action files (incl. auditLogs.js)
├── middleware/         # admin, auth, owner, ownerOrAdmin
├── drizzle/            # schema.js, migrate.js, migrations/
├── routes/             # auth, workspace, invitation, route.js
├── services/           # emailService.js
├── templates/          # email.js
├── utils/              # cryptoUtils.js, pagination.js
├── validators/         # authValidation.js
└── server.js           # app config + listen (mixed)
```

**After**
```
src/
├── config/client.js
├── controllers/        # authController, workspaceController, invitationController (thin)
├── services/           # authService, workspaceService, memberService, invitationService, auditLog, emailService
├── repositories/       # userRepo, workspaceRepo, workspaceMemberRepo, invitationRepo
├── middlewares/        # auth, owner, ownerOrAdmin, admin, errorHandler
├── routes/             # auth, workspace, invitation, index.js
├── validators/         # authValidation, workspaceValidation
├── templates/          # email
├── utils/              # cryptoUtils, pagination, errors
├── db/
│   ├── schema/         # user, workspace, workspaceMember, invitation, auditLog, index.js
│   ├── migrate.js
│   └── migrations/
├── app.js              # Express app (exported)
└── server.js           # listen only
```

### Import aliases (`package.json` `imports`)
`#controllers/*` · `#routes/*` · `#middlewares/*` · `#config/*` · `#services/*` · `#repositories/*` · `#utils/*` · `#validators/*` · `#templates/*` · `#db/*`

(`#middleware/*` → `#middlewares/*` and `#drizzle/*` → `#db/*` were renamed; `#repositories/*` was added.)

---

## Verification

Each step was verified without needing a live database:
- Full router import graph resolves (`import('#routes/index.js')`).
- Server boots (`Server running on port …`) with a dummy `MAILGUN_API_KEY`.
- Validation/authorization paths return the right codes through the central handler — e.g. `POST /auth/login {}` → 400, missing token → 401, wrong role / not-a-member → 403.
- `drizzle-kit generate` reports no schema changes, and a from-scratch generate emits all foreign keys — proving the schema split is definition-identical and the `#` imports resolve in drizzle-kit.

DB-backed happy paths (2xx and DB-dependent 404/409) still need a local PostgreSQL + `.env` to exercise end to end.

---

## Known remaining items (not addressed here)

- `src/middlewares/admin.js` casts `workspaceId` with `Number()` although IDs are UUID strings, so it always rejects. It is currently unused.
- The Mailgun client is created at module load, so the server won't boot without `MAILGUN_API_KEY` (use a dummy value for local smoke tests). Lazy-initializing it would remove that coupling.
- Two lockfiles exist (`package-lock.json` and `pnpm-lock.yaml`) — pick one package manager.
- No automated test suite yet.
