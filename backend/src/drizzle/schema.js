import {
  uuid,integer,text, unique,pgTable,serial,varchar,timestamp, boolean, pgEnum, uniqueIndex,index} 
  from "drizzle-orm/pg-core";
/* User Table */
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 50 }).notNull(),
    email: varchar("email", { length: 100 }).notNull(),

    password: varchar("password", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),

    // Password Reset Columns
    resetToken: varchar("reset_token", { length: 255 }).default(null),
    tokenExpiresAt: timestamp("token_expires_at"),
    isTokenUsed: boolean("is_token_used").default(false),

    isEmailVerified: boolean("is_email_verified").default(false),
  },
  (table) => {
    return {
      // 2.  unique index apply
      emailUniqueIdx: uniqueIndex("users_email_unique_idx").on(table.email)
  

    };
  },
);

/* Work space table */
export const workspace = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceName: varchar("workspace_name", { length: 50 }).notNull(),
  //  createdBy: integer('created_by').notNull(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
/* Workspace member table */

export const roleEnum = pgEnum("role", ["admin", "owner", "editor", "viewer"]);
export const workspaceMembers = pgTable(
  "workspace_members",
  {
    id: uuid("id").defaultRandom().primaryKey(), // Automatically indexed primary key
    memberName: varchar("username", { length: 50 }).notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspace.id),
    role: roleEnum("role").notNull().default("viewer"),
    assignedBy: uuid("assigned_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    // 1. Prevents duplicate roles for the same user in a single workspace.
    // PostgreSQL automatically creates a unique index for this multi-column constraint.
    // This speeds up queries searching by userId or both (userId + workspaceId).
    uniqueUserWorkspace: unique("unique_user_workspace").on(
      table.userId,
      table.workspaceId,
    ),

    // 2. Explicit index on workspaceId.
    // Necessary because composite indexes do not optimize standalone trailing column lookups.
    // This dramatically speeds up fetching all members belonging to a specific workspace.
    workspaceIdIdx: index("wm_workspace_id_idx").on(table.workspaceId),

    // 3. Recommended index on assignedBy foreign key.
    // Accelerates queries filtering or sorting members based on who invited them.
    assignedByIdx: index("wm_assigned_by_idx").on(table.assignedBy),
  }),
);

/* Invitation table */

export const invitations = pgTable(
  "invitations",
  {
    id: uuid("id").defaultRandom().primaryKey(), // Automatically indexed primary key

    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspace.id),

    email: varchar("email", { length: 100 }).notNull(),

    invitedBy: uuid("invited_by").notNull().references(() => users.id),
    token: varchar("token", { length: 255 }).notNull(), // Removed inline .unique() to use explicit index below
   status: varchar("status", { length: 20 }).notNull().default("PENDING"),
   revoke: boolean("revoke").notNull().default(false),
 expiresAt: timestamp("expires_at").notNull(),
createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      // 1. Explicit Unique Index on token
      // Speeds up the invitation acceptance route when checking the token from the URL.
      tokenUniqueIdx: uniqueIndex("inv_token_unique_idx").on(table.token),

      // 2. Index on workspaceId foreign key
      // Speeds up dashboard queries like "Show all invites sent from Workspace X".
      workspaceIdIdx: index("inv_workspace_id_idx").on(table.workspaceId),

      // 3. Index on email
      // Speeds up queries when a new user signs up and you check for pending invites.
      emailIdx: index("inv_email_idx").on(table.email),

      // 4. Index on invitedBy foreign key
      // Helps track or show a history of invites sent by a specific team member.
      invitedByIdx: index("inv_invited_by_idx").on(table.invitedBy),

      // 5. OPTIONAL: Composite index for active/pending filters
      // Highly efficient if your backend constantly looks up valid, non-revoked pending invites.
      activeInvitesIdx: index("inv_active_status_idx").on(
        table.status,
        table.revoke,
      ),
    };
  },
);

export const auditLog=pgTable("auditLog",{
  id:uuid("id").defaultRandom().primaryKey(),
  performedBy:uuid("performed_by").notNull(),
  // What action was performed
  action: varchar("action", { length: 100 }).notNull(),
 // Whom / what was affected
  affectedUser: uuid("affected_user"),
  message: text("message").notNull(),
  // When the action happened
  createdAt: timestamp("created_at") .defaultNow() .notNull(),

});