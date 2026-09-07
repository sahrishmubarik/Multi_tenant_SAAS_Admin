/**
 * Data access for the `invitations` table.
 */
import { db } from "#config/client.js";
import { invitations, workspace } from "#db/schema/index.js";
import { and, eq } from "drizzle-orm";

export const invitationRepo = {
  async findByToken(hashedToken) {
    const [row] = await db
      .select()
      .from(invitations)
      .where(eq(invitations.token, hashedToken));
    return row;
  },

  async findByTokenWithWorkspace(hashedToken) {
    const [row] = await db
      .select({
        id: invitations.id,
        email: invitations.email,
        status: invitations.status,
        expiresAt: invitations.expiresAt,
        revoke: invitations.revoke,
        workspaceId: invitations.workspaceId,
        workspaceName: workspace.workspaceName,
      })
      .from(invitations)
      .innerJoin(workspace, eq(invitations.workspaceId, workspace.id))
      .where(eq(invitations.token, hashedToken));
    return row;
  },

  async findPending(email, workspaceId) {
    const [row] = await db
      .select({ id: invitations.id, status: invitations.status })
      .from(invitations)
      .where(
        and(
          eq(invitations.email, email),
          eq(invitations.workspaceId, workspaceId),
          eq(invitations.status, "PENDING"),
        ),
      );
    return row;
  },

  async create(values) {
    const [row] = await db.insert(invitations).values(values).returning();
    return row;
  },

  async updateStatus(id, status) {
    await db.update(invitations).set({ status }).where(eq(invitations.id, id));
  },

  async revoke(id) {
    const [row] = await db
      .update(invitations)
      .set({ revoke: true, status: "REVOKED" })
      .where(eq(invitations.id, id))
      .returning();
    return row;
  },

  async listByWorkspaceAndStatus(workspaceId, status) {
    return db
      .select({
        id: invitations.id,
        workspaceId: invitations.workspaceId,
        email: invitations.email,
        status: invitations.status,
      })
      .from(invitations)
      .where(
        and(
          eq(invitations.workspaceId, workspaceId),
          eq(invitations.status, status),
        ),
      );
  },
};
