import { db } from "#config/client.js";
import { workspace, workspaceMembers, users } from "#drizzle/schema.js";
import { eq } from "drizzle-orm";
import { workspaceNameValidation } from "#validators/authValidation.js";
import { createAuditLog } from "#controllers/auditLogs.js";
export async function workspaceCreate(req, res) {
  const { workspaceName } = req.body;

  if (!workspaceName) {
    return res.status(400).json({
      message: "Workspace name is required",
    });
  }

  const validation = workspaceNameValidation.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: "Workspace name Validation failed",
      errors: validation.error.flatten().fieldErrors,
    });
  }

  const createdBy = req.user.id;

  try {
    const user = await db
      .select({
        id: users.id,
        name: users.name,
      })
      .from(users)
      .where(eq(users.id, createdBy));

    if (user.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const [newWorkspace] = await db
      .insert(workspace)
      .values({
        workspaceName,
        createdBy,
      })
      .returning({
        id: workspace.id,
      });

    await db.insert(workspaceMembers).values({
      memberName: user[0].name,
      userId: createdBy,
      workspaceId: newWorkspace.id,
      role: "owner",
      assignedBy: createdBy,
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
  performedBy: createdBy,
  action: "Create workspace",
  affectedUser: null,
  message: `${performedUser.name}created a workspace .`,
});

   
    return res.status(201).json({
      success: true,
      message: `${workspaceName} Workspace is successfully created`,
      workspaceId: newWorkspace.id,
      role: "owner",
      workspace: newWorkspace,
      // audit: auditResult,
    });
  } catch (error) {
    console.log("Workspace Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}