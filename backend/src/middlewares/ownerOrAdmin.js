import { workspaceMemberRepo } from "#repositories/workspaceMemberRepo.js";

export async function ownerOrAdminMiddleware(req, res, next) {
  try {
    const workspaceId =
      req.params.workspaceId || req.body.workspaceId || req.query.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({
        message: "Workspace ID is required",
      });
    }

    const membership = await workspaceMemberRepo.findByUserAndWorkspace(
      req.user.id,
      workspaceId,
    );

    if (!membership || !["owner", "admin"].includes(membership.role)) {
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
