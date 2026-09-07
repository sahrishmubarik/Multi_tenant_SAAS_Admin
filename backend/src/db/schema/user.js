import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";

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

    // Password reset columns
    resetToken: varchar("reset_token", { length: 255 }).default(null),
    tokenExpiresAt: timestamp("token_expires_at"),
    isTokenUsed: boolean("is_token_used").default(false),

    isEmailVerified: boolean("is_email_verified").default(false),
  },
  (table) => {
    return {
      emailUniqueIdx: uniqueIndex("users_email_unique_idx").on(table.email),
    };
  },
);
