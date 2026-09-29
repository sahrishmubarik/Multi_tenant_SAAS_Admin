# Multi-Tenant SaaS Admin — RoleBase

A full-stack multi-tenant SaaS administration platform with role-based access control (RBAC).

RoleBase allows users to create and manage workspaces, invite team members, assign roles, control access, and track sensitive workspace activity through an audit trail.

The project is built with a layered backend architecture and a React-based frontend application.

---

## Features

### Authentication

- User signup and login
- JWT-based authentication
- Password hashing with bcrypt
- Email verification
- Forgot password
- Reset password
- Change password
- Current user profile
- Authentication middleware
- Protected frontend routes

### Multi-Tenant Workspaces

- Create workspaces
- View user's workspaces
- Rename workspaces
- Delete workspaces
- Leave a workspace
- Transfer workspace ownership
- Workspace-level access control

### Members & RBAC

Role-based access control with four workspace roles:

- `owner`
- `admin`
- `editor`
- `viewer`

Supported member operations:

- Add members
- Invite members by email
- View workspace members
- Filter members by role
- Change member roles
- Remove members
- Protect sensitive operations based on user role

### Invitations

- Create workspace invitations
- Send invitations through email
- Check invitation details
- Accept invitations
- Revoke invitations
- View invitation status

### Audit Log & Activity

Sensitive workspace mutations are recorded in an audit trail.

Workspace activity can be viewed through the activity API to track important actions performed by members.

### Transactional Email

Mailgun is used for transactional email functionality including:

- Workspace invitations
- Email verification
- Password reset links

---

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Backend | Node.js, Express 5, Drizzle ORM, PostgreSQL |
| Authentication | JWT, bcrypt |
| Validation | Zod |
| Email | Mailgun |
| Frontend | React 19, Vite |
| Routing | React Router 7 |
| Styling | Tailwind CSS 4 |
| Icons | FontAwesome |
| Database | PostgreSQL |
| ORM | Drizzle ORM |

---

## Architecture

The backend follows a layered architecture:

```text
Request
   ↓
Route
   ↓
Middleware
   ↓
Controller
   ↓
Service / Business Logic
   ↓
Repository / Data Access
   ↓
Drizzle ORM
   ↓
PostgreSQL
