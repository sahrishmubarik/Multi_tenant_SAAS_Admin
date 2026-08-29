import { db } from '#config/client.js';
import {users, workspaceMembers, invitations } from '#drizzle/schema.js';
import { and, eq } from 'drizzle-orm';
import { createAuditLog } from '#controllers/auditLogs.js';

export async function deleteMember(req, res) {
  const memberId = req.params.memberId;
  const { workspaceId, email } = req.body;

  if (!memberId || !workspaceId || !email) {
    return res.status(400).json({
      message: "Member ID, Workspace ID, and email are required"
    });
  }

  try {
    /* Check if member exists in the workspace */
    const [member] = await db
      .select({
        id: workspaceMembers.id,
        role: workspaceMembers.role,
        userId: workspaceMembers.userId // Fetching userId to use for deletion
      })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.id, memberId),
          eq(workspaceMembers.workspaceId, workspaceId)
        )
      );

    if (!member) {
      return res.status(404).json({
        message: "Member does not exist in this workspace."
      });
    }

    /*  Owner cannot be deleted */
    if (member.role === "owner") {
      return res.status(403).json({
        message: "Workspace owner cannot be removed"
      });
    }
    await db.transaction(async (tx) => {
      
      // Delete from workspace member table using the exact user ID
      await tx
        .delete(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.userId, member.userId),
            eq(workspaceMembers.workspaceId, workspaceId)
          )
        );

      // Delete from invitations table matching email and workspace
      await tx
        .delete(invitations)
        .where(
          and(
            eq(invitations.email, email),
            eq(invitations.workspaceId, workspaceId)
          )
        );
    });
   const [performedUser] = await db
  .select({
    name: users.name,
  })
  .from(users)
  .where(eq(users.id, req.user.id));

const auditResult = await createAuditLog({
  performedBy: req.user.id,
  action: "Delete member",
  affectedUser: member.userId,
  message: `${performedUser.name} removed ${member.memberName} from the workspace.`,
});
    console.log("Member successfully deleted from both tables!");

    return res.status(200).json({
      message: "Workspace member removed successfully",
      // audit: auditResult,
    });

  } catch (error) {
    console.log("Delete Workspace Member Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
}
