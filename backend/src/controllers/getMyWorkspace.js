import { db } from "#config/client.js";
import { workspace, workspaceMembers } from "#drizzle/schema.js";
import { eq } from "drizzle-orm";

export async function getMyWorkspace(req, res) {
  try {
    const userId = req.user.id;

    const myWorkspaces = await db
      .select({
        workspaceId: workspace.id,
        workspaceName: workspace.workspaceName,
        role: workspaceMembers.role,
        createdAt: workspace.createdAt,
      })
      .from(workspaceMembers)
      .innerJoin(workspace, eq(workspaceMembers.workspaceId, workspace.id))
      .where(eq(workspaceMembers.userId, userId));

    return res.status(200).json({
      message: "Workspaces fetched successfully",
      count: myWorkspaces.length,
      workspaces: myWorkspaces,
    });
  } catch (error) {
    console.log("Get My Workspaces Error:", error);

    return res.status(500).json({
      message: "Failed to fetch workspaces",
      error: error.message,
    });
  }
}
