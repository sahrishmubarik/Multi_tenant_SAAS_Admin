/* both delete action preform  */
import { db } from "#config/client.js";
import { workspaceMembers } from "#drizzle/schema.js";
import { and, eq, inArray } from "drizzle-orm";

export async function ownerOrAdminMiddleware(req, res, next) {
  try {
    const userId = req.user.id;
    const workspaceId =
      req.params.workspaceId || req.body.workspaceId || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({
        message: "Workspace ID is required",
      });
    }

    const user = await db
      .select({
        role: workspaceMembers.role,
      })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.userId, userId),
          eq(workspaceMembers.workspaceId, workspaceId),
          inArray(workspaceMembers.role, ["owner", "admin"]),
        ),
      );

    if (user.length === 0) {
      return res.status(403).json({
        message:
          "Access denied. Only workspace owner or admin can perform this action.",
      });
    }

    next();
  } catch (error) {
    console.log("Owner/Admin Middleware Error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
