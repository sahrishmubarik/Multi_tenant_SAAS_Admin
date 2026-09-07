import { db } from "#config/client.js";
import { workspaceMembers } from "#db/schema/index.js";
import { and, eq } from "drizzle-orm";

export async function adminMiddleware(req, res, next) {
  try {
    const userId = req.user.id;
    const workspaceId = Number(req.body.workspaceId);

    if (!Number.isInteger(workspaceId) || workspaceId <= 0) {
      return res.status(400).json({
        message: "Valid Workspace ID is required",
      });
    }

    const admin = await db
      .select({
        id: workspaceMembers.id,
        role: workspaceMembers.role,
      })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.userId, userId),
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.role, "admin"),
        ),
      );

    if (admin.length === 0) {
      return res.status(403).json({
        message: "Access denied. Only workspace admin can perform this action.",
      });
    }

    next();
  } catch (error) {
    console.log("Admin Middleware Error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
