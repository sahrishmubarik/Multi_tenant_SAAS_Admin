import { db } from "#config/client.js";

import {
  users,
  workspaceMembers,
  invitations,
  auditLog,
} from "#drizzle/schema.js";

import { and, eq } from "drizzle-orm";

export async function leaveWorkspace(req, res) {
  try {
    const userId = req.user.id;
    const { workspaceId } = req.params;

    // Check workspaceId
    if (!workspaceId) {
      return res.status(400).json({
        message: "Workspace ID is required.",
      });
    }

    // Find current user's membership
    const member = await db
      .select({
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
      )
      .limit(1);

    // User is not a member
    if (member.length === 0) {
      return res.status(404).json({
        message: "You are not a member of this workspace.",
      });
    }

    // Owner cannot leave
    if (member[0].role === "owner") {
      return res.status(403).json({
        message:
          "Workspace owner cannot leave the workspace. Transfer ownership first.",
      });
    }

    // Get user's email
    // We need email because invitations table stores email,
    // not userId.
    const user = await db
      .select({
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const userEmail = user[0].email;

    // Perform all leave operations in one transaction
    await db.transaction(async (tx) => {
      //  Delete member from workspace_members
      await tx
        .delete(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.userId, userId),
            eq(workspaceMembers.workspaceId, workspaceId),
          ),
        );

      // Delete user's invitation from this workspace
      await tx
        .delete(invitations)
        .where(
          and(
            eq(invitations.workspaceId, workspaceId),
            eq(invitations.email, userEmail),
          ),
        );

      //  Add audit log
      await tx.insert(auditLog).values({
        performedBy: userId,
        action: "Leave workspace",
        affectedUser: userId,
      });
    });

      const [performedUser] = await db
      .select({
        name: users.name,
      })
      .from(users)
      .where(eq(users.id, req.user.id));
             // Create audit log ONLY after successful update
  
    /* audit log activity */
  const auditResult= await createAuditLog({
  performedBy: req.user.id,
  action: "Role Update",
  affectedUser: member.userId,
  message: `${performedUser.name} leaved workspace.`,
});

    return res.status(200).json({
      message: "You have left the workspace successfully.",
      // audit: auditResult,
    });
  } catch (error) {
    console.error("Leave workspace error:", error);

    return res.status(500).json({
      message: "Failed to leave workspace.",
      error: error.message,
    });
  }
}
