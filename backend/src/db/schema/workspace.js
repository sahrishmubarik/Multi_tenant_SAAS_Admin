import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { users } from "#db/schema/user.js";

/* Workspace table */
export const workspace = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceName: varchar("workspace_name", { length: 50 }).notNull(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
