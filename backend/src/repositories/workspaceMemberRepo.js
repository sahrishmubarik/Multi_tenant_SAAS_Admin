/**
 * Data access for the `workspace_members` table.
 * The membership/role lookup here was previously duplicated across ~13 controllers
 * and the owner / ownerOrAdmin middlewares.
 */
import { db } from "#config/client.js";
import { workspaceMembers, users } from "#db/schema/index.js";
import { and, eq } from "drizzle-orm";

export const workspaceMemberRepo = {
  // The caller's membership row (incl. role) in a workspace, or undefined.
  async findByUserAndWorkspace(userId, workspaceId) {
    const [row] = await db
      .select({
        id: workspaceMembers.id,
        userId: workspaceMembers.userId,
        workspaceId: workspaceMembers.workspaceId,
        role: workspaceMembers.role,
      })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.userId, userId),
          eq(workspaceMembers.workspaceId, workspaceId),
        ),
      );
    return row;
  },

  async findById(memberId) {
    const [row] = await db
      .select({
        memberId: workspaceMembers.id,
        userId: workspaceMembers.userId,
        workspaceId: workspaceMembers.workspaceId,
        role: workspaceMembers.role,
        memberName: workspaceMembers.memberName,
      })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.id, memberId));
    return row;
  },

  async findByIdAndWorkspace(memberId, workspaceId) {
    const [row] = await db
      .select({
        id: workspaceMembers.id,
        role: workspaceMembers.role,
        userId: workspaceMembers.userId,
        memberName: workspaceMembers.memberName,
      })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.id, memberId),
          eq(workspaceMembers.workspaceId, workspaceId),
        ),
      );
    return row;
  },

  async create(values) {
    await db.insert(workspaceMembers).values(values);
  },

  async updateRole(memberId, role) {
    const [row] = await db
      .update(workspaceMembers)
      .set({ role })
      .where(eq(workspaceMembers.id, memberId))
      .returning({
        memberId: workspaceMembers.id,
        workspaceId: workspaceMembers.workspaceId,
        role: workspaceMembers.role,
      });
    return row;
  },

  // Members of a workspace, optionally narrowed by member id and/or role.
  async listMembers({ workspaceId, memberId, role }) {
    const conditions = [eq(workspaceMembers.workspaceId, workspaceId)];
    if (memberId) conditions.push(eq(workspaceMembers.id, memberId));
    if (role) conditions.push(eq(workspaceMembers.role, role));

    return db
      .select({
        memberId: workspaceMembers.id,
        username: workspaceMembers.memberName,
        user_id: workspaceMembers.userId,
        email: users.email,
        role: workspaceMembers.role,
        createAt: workspaceMembers.createdAt,
      })
      .from(workspaceMembers)
      .leftJoin(users, eq(workspaceMembers.userId, users.id))
      .where(and(...conditions));
  },

  async listByRole(workspaceId, role) {
    return db
      .select({
        memberId: workspaceMembers.id,
        username: workspaceMembers.memberName,
        user_id: workspaceMembers.userId,
        role: workspaceMembers.role,
        createAt: workspaceMembers.createdAt,
      })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.role, role),
        ),
      );
  },
};
