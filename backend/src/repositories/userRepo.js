/**
 * Data access for the `users` table.
 * Centralizes the queries that were previously duplicated across many controllers.
 */
import { db } from "#config/client.js";
import { users } from "#db/schema/index.js";
import { eq } from "drizzle-orm";

export const userRepo = {
  async findByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  },

  async findById(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  },

  async findByResetToken(hashedToken) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.resetToken, hashedToken));
    return user;
  },

  async create({ name, email, password }) {
    const [user] = await db
      .insert(users)
      .values({ name, email, password })
      .returning({ id: users.id, email: users.email, name: users.name });
    return user;
  },

  async updateById(id, values) {
    await db.update(users).set(values).where(eq(users.id, id));
  },
};
