
import { db } from "#config/client.js";
import { workspaceMembers, users } from "#drizzle/schema.js";
import { eq, and } from "drizzle-orm";

export async function workSpaceMembers(req, res) {
  const { memberName, email, role, workspaceId } = req.body;

  try {
    // Basic validation
    if (!memberName || !email || !role || !workspaceId) {
      return res.status(400).json({
        message: "Member name, email, role and workspace ID are required",
      });
    }

    // Allowed roles
    const allowedRoles = ["admin", "editor", "viewer"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: `Invalid role. Choose from: ${allowedRoles.join(", ")}`,
      });
    }

    // Check whether user already has an account
    const [user] = await db
      .select({
        id: users.id,
      })
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      return res.status(404).json({
        message: "User not found. Ask the user to sign up first.",
      });
    }

    // Check if user is already a member of this workspace
    const [existingMember] = await db
      .select({
        id: workspaceMembers.id,
      })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.userId, user.id),
          eq(workspaceMembers.workspaceId, workspaceId),
        ),
      );

    if (existingMember) {
      return res.status(409).json({
        message: "This user is already a member of this workspace.",
      });
    }

    // Add member
    await db.insert(workspaceMembers).values({
      memberName,
      userId: user.id,
      workspaceId,
      role,
      assignedBy: req.user.id,
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
  message: `${performedUser.name} add new member  ${memberName} and has assigned a ${role} in workspace .`,
});

    return res.status(201).json({
      success: true,
      message: `${memberName} has been assigned the ${role} role in the workspace.`,
      audit:auditResult
    });
  } catch (error) {
    console.error("Workspace Member Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}