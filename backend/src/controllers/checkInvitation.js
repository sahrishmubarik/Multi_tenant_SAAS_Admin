import { db } from "#config/client.js";
import {
  invitations,
  users,
  workspace,
} from "#drizzle/schema.js";
import { eq, and } from "drizzle-orm";
import { hashToken } from "#utils/cryptoUtils.js";

export const getInvitationDetails = async (req, res) => {
  const { token } = req.query;

  try {
    if (!token) {
      return res.status(400).json({
        message: "Invitation token is required",
      });
    }

    const hashedToken = hashToken(token);

    const [invitation] = await db
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
      .innerJoin(
        workspace,
        eq(invitations.workspaceId, workspace.id)
      )
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
        message: "This invitation has been revoked",
      });
    }

    if (invitation.status !== "PENDING") {
      return res.status(400).json({
        message: "This invitation is no longer valid",
      });
    }

    if (new Date() > invitation.expiresAt) {
      return res.status(400).json({
        message: "This invitation has expired",
      });
    }

    // Check whether invitation email already belongs to a user
    const [existingUser] = await db
      .select({
        id: users.id,
      })
      .from(users)
      .where(eq(users.email, invitation.email));

    return res.status(200).json({
      success: true,
      invitation: {
        id:invitation.id,
        email: invitation.email,
        workspaceId: invitation.workspaceId,
        workspaceName: invitation.workspaceName,
        expiresAt: invitation.expiresAt,
      },
      userExists: !!existingUser,
    });

  } catch (error) {
    console.error("Invitation details error:", error);

    return res.status(500).json({
      message: "Failed to load invitation",
      error: error.message,
    });
  }
};