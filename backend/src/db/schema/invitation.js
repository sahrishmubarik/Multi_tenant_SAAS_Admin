import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { users } from "#db/schema/user.js";
import { workspace } from "#db/schema/workspace.js";

/* Invitation table */
export const invitations = pgTable(
  "invitations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspace.id),
    email: varchar("email", { length: 100 }).notNull(),
    invitedBy: uuid("invited_by")
      .notNull()
      .references(() => users.id),
    token: varchar("token", { length: 255 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("PENDING"),
    revoke: boolean("revoke").notNull().default(false),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      // Fast token lookup on invitation acceptance.
      tokenUniqueIdx: uniqueIndex("inv_token_unique_idx").on(table.token),
      // "All invites from workspace X".
      workspaceIdIdx: index("inv_workspace_id_idx").on(table.workspaceId),
      // Check pending invites when a user signs up.
      emailIdx: index("inv_email_idx").on(table.email),
      // Invite history by inviter.
      invitedByIdx: index("inv_invited_by_idx").on(table.invitedBy),
      // Active/pending filters.
      activeInvitesIdx: index("inv_active_status_idx").on(
        table.status,
        table.revoke,
      ),
    };
  },
);
