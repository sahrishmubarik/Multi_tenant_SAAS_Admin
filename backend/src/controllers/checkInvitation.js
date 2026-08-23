
import { db } from "#config/client.js";
import { invitations, users } from "#drizzle/schema.js";
import { eq } from "drizzle-orm";
import { hashToken } from "#utils/cryptoUtils.js";

export const getInvitationDetails = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Invitation token is required",
      });
    }

    const hashedToken = hashToken(token);

    const [invitation] = await db
      .select({
        id: invitations.id,
        email: invitations.email,
        workspaceId: invitations.workspaceId,
        status: invitations.status,
        expiresAt: invitations.expiresAt,
      })
      .from(invitations)
      .where(eq(invitations.token, hashedToken));

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invalid invitation",
      });
    }

    if (invitation.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Invitation is no longer pending",
      });
    }

    if (new Date() > invitation.expiresAt) {
      return res.status(400).json({
        success: false,
        message: "Invitation has expired",
      });
    }

    const [existingUser] = await db
      .select({
        id: users.id,
      })
      .from(users)
      .where(eq(users.email, invitation.email));

    return res.status(200).json({
      success: true,
      userExists: !!existingUser,
      email: invitation.email,
      workspaceId: invitation.workspaceId,
    });

  } catch (error) {
    console.error("Invitation details error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get invitation details",
    });
  }
};