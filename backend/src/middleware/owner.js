import { db } from '#config/client.js';
import { workspaceMembers } from '#drizzle/schema.js';
import { and, eq } from 'drizzle-orm';

export async function ownerMiddleware(req, res, next) {

  try {

    const userId = req.user.id;
   const workspaceId =req.params.workspaceId || req.body.workspaceId || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({
        message: "Workspace ID is required"
      });
    }

    const owner = await db
      .select({
        id: workspaceMembers.id,
        role: workspaceMembers.role
      })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.userId, userId),
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.role, "owner")
        )
      );

    if (owner.length === 0) {
      return res.status(403).json({
        message: "Access denied. Only workspace owner can perform this action."
      });
    }

    next();

  } catch (error) {

    console.log("Owner Middleware Error:", error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
}