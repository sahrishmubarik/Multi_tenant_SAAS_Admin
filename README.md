# Multi-Tenant SaaS Admin (RoleBase)

A multi-tenant SaaS admin panel with role-based access control (RBAC). Users sign up, create workspaces (tenants), invite teammates by email, assign roles, and review an audit trail of every sensitive action.

## Features

- **Authentication** — signup, login, email verification, forgot/reset password, and change password. Passwords are hashed with bcrypt; sessions use JWTs.
- **Workspaces (tenants)** — create, rename, delete, transfer ownership, and leave a workspace.
- **Members & roles** — invite by email, accept/revoke invitations, list members, filter by role, change roles, and remove members. Roles: `owner`, `admin`, `editor`, `viewer`.
- **Audit log / Activity** — every mutation is recorded and viewable per workspace.
- **Transactional email** — invitations and verification/reset links are sent via Mailgun.

## Tech stack

| Layer     | Technologies                                                                 |
| --------- | ---------------------------------------------------------------------------- |
| Backend   | Node.js, Express 5, Drizzle ORM, PostgreSQL, JWT, bcrypt, Zod, Mailgun       |
| Frontend  | React 19, Vite, React Router 7, Tailwind CSS 4, Zod, FontAwesome             |

## Repository layout

The backend follows a layered architecture — **thin controller → service (business logic) → repository (data access)** — with a central error handler. See [`backend/README.md`](./backend/README.md) for details.

```
.
├── backend/                 # REST API (Express + Drizzle + PostgreSQL)
│   ├── src/
│   │   ├── controllers/     # thin handlers — one file per feature (auth/workspace/invitation)
│   │   ├── services/        # business logic (auth/workspace/member/invitation + audit, email)
│   │   ├── repositories/    # Drizzle data access (user, workspace, member, invitation)
│   │   ├── middlewares/     # auth, role authorization, central errorHandler
│   │   ├── routes/          # auth / workspace / invitation routers + index.js
│   │   ├── validators/      # Zod schemas (authValidation, workspaceValidation)
│   │   ├── templates/       # email HTML
│   │   ├── utils/           # crypto, pagination, typed errors
│   │   ├── db/
│   │   │   ├── schema/      # one file per table + index.js barrel
│   │   │   └── migrations/  # generated SQL migrations
│   │   ├── config/          # db client
│   │   ├── app.js           # Express app (exported)
│   │   └── server.js        # http bootstrap (listen)
│   ├── .env.example
│   ├── README.md
│   └── package.json
└── frontend/                # React SPA (Vite)
    ├── src/
    │   ├── pages/           # routed pages
    │   ├── components/      # UI components
    │   ├── context/         # WorkspaceContext
    │   ├── validations/     # Zod schemas (client-side)
    │   └── services/        # api helper
    └── package.json
```

## Getting started

### Prerequisites
- Node.js 18+ and npm
- A PostgreSQL database
- A Mailgun account (for sending email)

### 1. Backend

```bash
cd backend
npm install
```

Create a `backend/.env` file:

```env
DATABASE_URL=postgres://user:password@localhost:5432/rolebase
JWT_SECRET=your-strong-secret
PORT=3000
MAILGUN_API_KEY=your-mailgun-key
MAILGUN_DOMAIN=your-mailgun-domain
BASE_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173
```

Apply the database schema, then start the API:

```bash
npm run db:migrate      # apply migrations
npm run dev             # start API on http://localhost:3000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev             # start the SPA on http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:3000`, so run the backend alongside it. Open http://localhost:5173.

## API overview

All routes are mounted under `/api/v1`. Protected routes expect an `Authorization: Bearer <token>` header.

### Auth — `/api/v1/auth`
| Method | Path                        | Description                    |
| ------ | --------------------------- | ------------------------------ |
| POST   | `/signup`                   | Create an account              |
| POST   | `/login`                    | Log in, returns a JWT          |
| POST   | `/forget-password`          | Request a password reset email |
| POST   | `/reset-password`           | Reset the password with a token|
| POST   | `/email-verification-token` | Send an email-verification link|
| GET    | `/verify-Email`             | Verify email from a token      |
| PATCH  | `/change-password`          | Change password (auth)         |
| GET    | `/profile`                  | Current user profile (auth)    |

### Workspace — `/api/v1/workspace`
| Method | Path                                    | Access        | Description               |
| ------ | --------------------------------------- | ------------- | ------------------------- |
| POST   | `/`                                     | auth          | Create a workspace        |
| GET    | `/my-workspaces`                        | auth          | List the user's workspaces|
| PATCH  | `/:workspaceId`                         | owner         | Rename a workspace        |
| DELETE | `/`                                     | owner         | Delete a workspace        |
| DELETE | `/leave/:workspaceId`                   | auth (member) | Leave a workspace         |
| POST   | `/transfer-ownership/:workspaceId`      | owner         | Transfer ownership        |
| POST   | `/member`                               | owner/admin   | Add a member              |
| GET    | `/:workspaceId/members`                 | auth          | List members              |
| PATCH  | `/:workspaceId/members/:memberId/role`  | owner/admin   | Change a member's role    |
| GET    | `/:workspaceId/members/role/:role`      | owner/admin   | List members by role      |
| DELETE | `/member/:memberId`                     | owner/admin   | Remove a member           |
| GET    | `/activity/:workspaceId`                | auth          | Workspace activity log    |

### Invitations — `/api/v1/workspace-invitation`
| Method | Path                    | Access      | Description                 |
| ------ | ----------------------- | ----------- | --------------------------- |
| GET    | `/details`              | public      | Invitation details by token |
| POST   | `/accept`               | auth        | Accept an invitation        |
| POST   | `/revoke`               | owner/admin | Revoke an invitation        |
| POST   | `/:workspaceId`         | owner/admin | Create an invitation        |
| GET    | `/status/:workspaceId`  | owner/admin | List invitation statuses    |

## Database

The schema lives in `backend/src/db/schema/` — one file per table (`user`, `workspace`, `workspaceMember`, `invitation`, `auditLog`), aggregated by `schema/index.js`. Tables: `users`, `workspaces`, `workspace_members`, `invitations`, `auditLog`. All primary keys are UUIDs.

```bash
npm run db:generate     # generate a migration after editing a table in src/db/schema/
npm run db:migrate      # apply pending migrations
npm run studio          # inspect data in Drizzle Studio
```

## Notes

- There is currently **no automated test suite**; verify changes by running both apps end to end.
- For contributor and architecture guidance, see [`CLAUDE.md`](./CLAUDE.md).
