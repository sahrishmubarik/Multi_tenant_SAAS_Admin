import { db } from "#config/client.js";
import {
  auditLog,
  workspaceMembers,
} from "#drizzle/schema.js";
import { eq, and, desc } from "drizzle-orm";

export const getActivity = async (req, res) => {
  const { workspaceId } = req.params;
  const userId = req.user.id;

  try {
    if (!workspaceId) {
      return res.status(400).json({
        message: "Workspace ID is required",
      });
    }

    // Get current user's membership
    const [member] = await db
      .select({
        role: workspaceMembers.role,
      })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId)
        )
      );

    if (!member) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    // TODO:
    // owner/admin -> all workspace activity
    // editor/viewer -> only their own activity

    // For now:
    const activities = await db
      .select({
        id: auditLog.id,
        performedBy: auditLog.performedBy,
        action: auditLog.action,
        affectedUser: auditLog.affectedUser,
        message: auditLog.message,
        createdAt: auditLog.createdAt,
      })
      .from(auditLog)
      .orderBy(desc(auditLog.createdAt));

    return res.status(200).json({
      activities,
    });
  } catch (error) {
    console.error("Get activity error:", error);

    return res.status(500).json({
      message: "Failed to fetch activity",
    });
  }
};