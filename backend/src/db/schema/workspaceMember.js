import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { users } from "#db/schema/user.js";
import { workspace } from "#db/schema/workspace.js";

export const roleEnum = pgEnum("role", ["admin", "owner", "editor", "viewer"]);

/* Workspace member table */
export const workspaceMembers = pgTable(
  "workspace_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
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
    // Prevents duplicate membership for the same user in a workspace.
    uniqueUserWorkspace: unique("unique_user_workspace").on(
      table.userId,
      table.workspaceId,
    ),
    // Speeds up fetching all members of a workspace.
    workspaceIdIdx: index("wm_workspace_id_idx").on(table.workspaceId),
    // Speeds up filtering by who assigned the member.
    assignedByIdx: index("wm_assigned_by_idx").on(table.assignedBy),
  }),
);
