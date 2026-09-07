import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

/* Audit log table */
export const auditLog = pgTable("auditLog", {
  id: uuid("id").defaultRandom().primaryKey(),
  performedBy: uuid("performed_by").notNull(),
  // What action was performed
  action: varchar("action", { length: 100 }).notNull(),
  // Whom / what was affected
  affectedUser: uuid("affected_user"),
  message: text("message").notNull(),
  // When the action happened
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
