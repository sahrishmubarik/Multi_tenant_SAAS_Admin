import { db } from "#config/client.js";
import { invitations } from "#drizzle/schema.js";
import { eq, and } from "drizzle-orm";
export async function checkInvitationStatus(req, res) {
  const { workspaceId } = req.params;
  const { status: rawStatus } = req.query;

  const status = rawStatus?.toUpperCase();

  try {
    if (!workspaceId) {
      return res.status(400).json({
        message: "Workspace ID is required",
      });
    }

    if (!status) {
      return res.status(400).json({
        message: "Status field is required",
      });
    }

    const allowedStatus = ["PENDING", "ACCEPTED", "REVOKED"];
    console.log(status);
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. You can only choose from: ${allowedStatus.join(", ")}`,
      });
    }

    const checkStatus = await db
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
          eq(invitations.status, status)
        )
      );
      console.log(checkStatus);
    return res.status(200).json({
      message: "Status fetched successfully",
      count: checkStatus.length,
      member: checkStatus,
    });
  } catch (error) {
    console.log("Don't fetch invitation status:", error);

    return res.status(500).json({
      message: "Failed to fetch invitation status.",
      error: error.message,
    });
  }
}