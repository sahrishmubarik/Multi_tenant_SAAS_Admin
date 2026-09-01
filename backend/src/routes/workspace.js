import express from "express";

import { authMiddleware } from "#middleware/auth.js";
import { ownerMiddleware } from "#middleware/owner.js";
import { ownerOrAdminMiddleware } from "#middleware/ownerOrAdmin.js";
import {  workSpaceMembers } from "#controllers/workSpaceMember.js"
import { workspaceCreate } from "#controllers/workspace.js";
import { deleteMember } from "#controllers/deleteMembers.js";
import { changeRole } from "#controllers/changeRole.js";
import { leaveWorkspace } from "#controllers/leaveWorkspace.js";
import { getMyWorkspace } from "#controllers/getMyWorkspace.js";
import { getWorkspaceMembers } from "#controllers/getWorkspaceMembers.js";
import { getMemberOnBaseOfRole } from "#controllers/onBaseOfRole.js";

import { deleteWorkspace } from "#controllers/deleteWorkspace.js";
import { updateWorkspace } from "#controllers/updateWorkspace.js";
import { transferWorkspaceOwnership } from "#controllers/ownershipTransfer.js";
import { getActivity } from "#controllers/getActivity.js";
const workspace = express.Router();

// All workspace routes require authentication.

  

workspace.post("/",authMiddleware, workspaceCreate);
workspace.get("/my-workspaces",authMiddleware, getMyWorkspace);
workspace.patch("/update/:workspaceId",authMiddleware, ownerMiddleware, updateWorkspace);

workspace.delete("/",authMiddleware, ownerMiddleware, deleteWorkspace);
/* member delete itself from the workspace */
workspace.delete("/leave/:workspaceId",authMiddleware,leaveWorkspace);
workspace.post("/transfer-ownership/:workspaceId",authMiddleware, ownerMiddleware,transferWorkspaceOwnership,);
workspace.post( "/member", authMiddleware, ownerOrAdminMiddleware, workSpaceMembers);
//One GET endpoint with optional filters.

//   /members
//   /members?workspaceId=123
//   /members?workspaceId=123&memberId=456
//   /members?workspaceId=123&role=admin

workspace.get( "/:workspaceId/members",authMiddleware,getWorkspaceMembers);
workspace.patch("/:workspaceId/members/:memberId/role",authMiddleware, ownerOrAdminMiddleware, changeRole);
workspace.get("/:workspaceId/members/:memberId",authMiddleware,ownerOrAdminMiddleware,getWorkspaceMembers);
workspace.get("/:workspaceId/members/role/:role",authMiddleware,ownerOrAdminMiddleware,getMemberOnBaseOfRole);
workspace.delete("/member/:memberId", authMiddleware, ownerOrAdminMiddleware, deleteMember);

workspace.get("/activity/:workspaceId", authMiddleware, getActivity);

export default workspace;
