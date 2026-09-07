/**
 * Data access for the `workspaces` table.
 */
import { db } from "#config/client.js";
import { workspace, workspaceMembers } from "#db/schema/index.js";
import { and, eq } from "drizzle-orm";

export const workspaceRepo = {
  async findById(id) {
    const [row] = await db.select().from(workspace).where(eq(workspace.id, id));
    return row;
  },

  async findByIdAndOwner(id, ownerId) {
    const [row] = await db
      .select({ id: workspace.id, createdBy: workspace.createdBy })
      .from(workspace)
      .where(and(eq(workspace.id, id), eq(workspace.createdBy, ownerId)));
    return row;
  },

  // All workspaces a user belongs to, with their role in each.
  async listForUser(userId) {
    return db
      .select({
        workspaceId: workspace.id,
        workspaceName: workspace.workspaceName,
        role: workspaceMembers.role,
        createdAt: workspace.createdAt,
      })
      .from(workspaceMembers)
      .innerJoin(workspace, eq(workspaceMembers.workspaceId, workspace.id))
      .where(eq(workspaceMembers.userId, userId));
  },

  async create({ workspaceName, createdBy }) {
    const [row] = await db
      .insert(workspace)
      .values({ workspaceName, createdBy })
      .returning({ id: workspace.id });
    return row;
  },

  async updateName(id, workspaceName) {
    await db
      .update(workspace)
      .set({ workspaceName })
      .where(eq(workspace.id, id));
  },
};
