import { db } from "#config/client.js";
import {
  invitations,
  workspaceMembers,
  users,
} from "#drizzle/schema.js";
import { eq, and } from "drizzle-orm";
import { hashToken } from "#utils/cryptoUtils.js";
import { createAuditLog } from "#controllers/auditLogs.js";

export const acceptInvitation = async (req, res) => {
  const { token } = req.query;
  const userId = req.user.id;

  try {
    if (!token) {
      return res.status(400).json({
        message: "Invitation token is required",
      });
    }

    const hashedToken = hashToken(token);

    const [invitation] = await db
      .select()
      .from(invitations)
      .where(eq(invitations.token, hashedToken));

    if (!invitation) {
      return res.status(404).json({
        message: "Invalid invitation token",
      });
    }

    if (
      invitation.revoke === true ||
      invitation.status === "REVOKED"
    ) {
      return res.status(400).json({
        message: "This invitation has been revoked.",
      });
    }

    if (invitation.status !== "PENDING") {
      return res.status(400).json({
        message: "This invitation is no longer valid.",
      });
    }

    if (new Date() > invitation.expiresAt) {
      return res.status(400).json({
        message: "This invitation has expired.",
      });
    }

    // Get logged-in user
  const [user] = await db
  .select({
    id: users.id,
    name: users.name,
    email: users.email,
  })
  .from(users)
  .where(eq(users.id, userId));

if (!user) {
  return res.status(404).json({
    message: "User not found.",
  });
}

if (
  user.email.toLowerCase() !==
  invitation.email.toLowerCase()
) {
  return res.status(403).json({
    message:
      "This invitation was sent to a different email address.",
  });
}

const [existingMember] = await db
  .select({
    id: workspaceMembers.id,
  })
  .from(workspaceMembers)
  .where(
    and(
      eq(workspaceMembers.userId, userId),
      eq(
        workspaceMembers.workspaceId,
        invitation.workspaceId
      )
    )
  );

if (existingMember) {
  return res.status(400).json({
    message: "You are already a member of this workspace.",
  });
}

await db.insert(workspaceMembers).values({
  memberName: user.name,
  userId,
  workspaceId: invitation.workspaceId,
  role: "viewer",
  assignedBy: invitation.invitedBy,
});
    // Mark invitation accepted
    await db
      .update(invitations)
      .set({
        status: "ACCEPTED",
      })
      .where(eq(invitations.id, invitation.id));

    return res.status(200).json({
      success: true,
      message: "Invitation accepted successfully.",
      workspaceId: invitation.workspaceId,
      role: "viewer",
    });

  } catch (error) {
    console.error(
      "Accept Invitation Error:",
      error
    );

    return res.status(500).json({
      message: "Failed to accept invitation.",
      error: error.message,
    });
  }
};


/* Revoke Invitation Controller (Admin Actions) */
export const revokeInvitation = async (req, res) => {
  const { invitationId } = req.body; // Or req.params depending on route setup

  try {
    if (!invitationId) {
      return res.status(400).json({
        message: "Invitation ID is required to revoke"
      });
    }

    // Update the record: Set revoke to true AND status to 'REVOKED'
    const [updatedInvitation] = await db
      .update(invitations)
      .set({
        revoke: true,
        status: "REVOKED"
      })
      .where(eq(invitations.id, invitationId))
      .returning(); // Optional: Returns the updated row to confirm

    if (!updatedInvitation) {
      return res.status(404).json({
        message: "Invitation not found or could not be updated"
      });
    }
      const [performedUser] = await db
      .select({
        name: users.name,
      })
      .from(users)
      .where(eq(users.id, req.user.id));
             // Create audit log ONLY after successful update
  
    /* audit log activity */
  const auditLog= await createAuditLog({
  performedBy: req.user.id,
  action: "Role Update",
  affectedUser: member.userId,
  message: `${performedUser.name} accepted invitation .`,
});

    return res.status(200).json({
      message: "Invitation has been successfully revoked and invalidated.",
      invitationId: updatedInvitation.id,
      status: updatedInvitation.status,
      // audit:auditLog
    });

  } catch (error) {
    console.error("Revoke Invitation Error:", error);
    
    return res.status(500).json({
      message: "Failed to revoke invitation",
      error: error.message
    });
  }
};