import { db } from '#config/client.js';
import { users, workspace } from '#drizzle/schema.js';
import { eq } from 'drizzle-orm';
import { createAuditLog } from '#controllers/auditLogs.js';

export async function updateWorkspace(req, res) {
  const userId = req.user.id;
  const { workspaceId } = req.query;
  const workspaceName = req.body.workspaceName;

  try {
    // Check if workspace exists
    const workSpace = await db
      .select({
        workspaceId: workspace.id,
        workspace_name: workspace.workspaceName,
      })
      .from(workspace)
      .where(eq(workspace.id, workspaceId));

    if (workSpace.length === 0) {
      return res.status(404).json({
        message: "Workspace doesn't exist.",
      });
    }

    // Update workspace name in DB
    await db
      .update(workspace)
      .set({
        workspaceName: workspaceName,
      })
      .where(eq(workspace.id, workspaceId));

    // Get performed user's name
    const [performedUser] = await db
      .select({
        name: users.name,
      })
      .from(users)
      .where(eq(users.id, req.user.id));

    // Create audit log ONLY after successful update
    await createAuditLog({
      performedBy: userId,
      action: "Update workspace name",
      affectedUser: null,
      message: `${performedUser.name} updated the workspace name.`,
    });

    return res.status(200).json({
      message: `Workspace name updated to ${workspaceName} successfully`,
    });

  } catch (error) {
    console.log("Update workspace name Error:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
}