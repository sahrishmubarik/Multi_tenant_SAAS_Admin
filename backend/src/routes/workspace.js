import express from "express";

import { authMiddleware } from "#middlewares/auth.js";
import { ownerMiddleware } from "#middlewares/owner.js";
import { ownerOrAdminMiddleware } from "#middlewares/ownerOrAdmin.js";
import {
  workspaceCreate,
  getMyWorkspace,
  updateWorkspace,
  deleteWorkspace,
  leaveWorkspace,
  transferWorkspaceOwnership,
  workSpaceMembers,
  getWorkspaceMembers,
  changeRole,
  getMemberOnBaseOfRole,
  deleteMember,
  getActivity,
} from "#controllers/workspaceController.js";

const workspace = express.Router();

// All workspace routes require authentication.

workspace.post("/", authMiddleware, workspaceCreate);
workspace.get("/my-workspaces", authMiddleware, getMyWorkspace);
workspace.patch("/:workspaceId", authMiddleware, ownerMiddleware, updateWorkspace);

workspace.delete("/", authMiddleware, ownerMiddleware, deleteWorkspace);
/* member delete itself from the workspace */
workspace.delete("/leave/:workspaceId", authMiddleware, leaveWorkspace);
workspace.post("/transfer-ownership/:workspaceId", authMiddleware, ownerMiddleware, transferWorkspaceOwnership);
workspace.post("/member", authMiddleware, ownerOrAdminMiddleware, workSpaceMembers);
// One GET endpoint with optional filters.
//   /members
//   /members?workspaceId=123
//   /members?workspaceId=123&memberId=456
//   /members?workspaceId=123&role=admin

workspace.get("/:workspaceId/members", authMiddleware, getWorkspaceMembers);
workspace.patch("/:workspaceId/members/:memberId/role", authMiddleware, ownerOrAdminMiddleware, changeRole);
workspace.get("/:workspaceId/members/:memberId", authMiddleware, ownerOrAdminMiddleware, getWorkspaceMembers);
workspace.get("/:workspaceId/members/role/:role", authMiddleware, ownerOrAdminMiddleware, getMemberOnBaseOfRole);
workspace.delete("/member/:memberId", authMiddleware, ownerOrAdminMiddleware, deleteMember);

workspace.get("/activity/:workspaceId", authMiddleware, getActivity);

export default workspace;
