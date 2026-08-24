import { db } from "#config/client.js";
import { workspace, workspaceMembers } from "#drizzle/schema.js";
import { eq, and } from "drizzle-orm";

export async function getMemberOnBaseOfRole(req, res) {
  const userId = req.user.id;
  const { workspaceId } = req.params;
  const role = req.params.role;

  try {
    if (!role) {
      return res.status(400).json({
        message: "Role is required for update role.",
      });
    }
    // your array of allowed roles
    const allowedRoles = ["admin", "editor", "viewer"];

    //  Check if the input role is NOT included in the array
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: `Invalid role assigned. You can only choose from: ${allowedRoles.join(", ")}`,
      });
    }
    const getThatRoleMember = await db
      .select({
        memberId: workspaceMembers.id,
        username: workspaceMembers.memberName,
        user_id: workspaceMembers.userId,
        role: workspaceMembers.role,
        createAt: workspaceMembers.createdAt,
      })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.role, role),
        ),
      );
    return res.status(200).json({
      message: "Workspaces fetched successfully",
      count: getThatRoleMember.length,
      member: getThatRoleMember,
    });
  } catch (error) {
    console.log("Get member error:", error);
    return res.status(500).json({
      message: "Failed to fetch members.",
      error: error.message,
    });
  }
}
