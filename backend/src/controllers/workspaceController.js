import { workspaceNameValidation } from "#validators/workspaceValidation.js";
import {
  createWorkspace,
  getMyWorkspaces,
  updateWorkspace as updateWorkspaceService,
  deleteWorkspace as deleteWorkspaceService,
  transferOwnership,
  leaveWorkspace as leaveWorkspaceService,
  getActivity as getActivityService,
} from "#services/workspaceService.js";
import {
  addMember,
  getWorkspaceMembers as getWorkspaceMembersService,
  changeRole as changeRoleService,
  getMembersByRole,
  deleteMember as deleteMemberService,
} from "#services/memberService.js";

/* ---------- Workspace ---------- */

export async function workspaceCreate(req, res) {
  const { workspaceName } = workspaceNameValidation.parse(req.body);
  const newWorkspace = await createWorkspace(req.user.id, workspaceName);

  res.status(201).json({
    success: true,
    message: `${workspaceName} Workspace is successfully created`,
    workspaceId: newWorkspace.id,
    role: "owner",
    workspace: newWorkspace,
  });
}

export async function getMyWorkspace(req, res) {
  const workspaces = await getMyWorkspaces(req.user.id);

  res.status(200).json({
    message: "Workspaces fetched successfully",
    count: workspaces.length,
    workspaces,
  });
}

export async function updateWorkspace(req, res) {
  const { workspaceId } = req.params;
  const { workspaceName } = req.body;

  await updateWorkspaceService(req.user.id, workspaceId, workspaceName);

  res.status(200).json({
    message: `Workspace name updated to ${workspaceName} successfully`,
  });
}

export async function deleteWorkspace(req, res) {
  await deleteWorkspaceService(req.user.id, req.body.workspaceId);

  res.status(200).json({
    success: true,
    message: "Workspace deleted successfully",
  });
}

export const transferWorkspaceOwnership = async (req, res) => {
  const data = await transferOwnership(
    req.user.id,
    req.params.workspaceId,
    req.body.newOwnerId,
  );

  res.status(200).json({
    success: true,
    message: "Workspace ownership transferred successfully",
    data,
  });
};

export async function leaveWorkspace(req, res) {
  await leaveWorkspaceService(req.user.id, req.params.workspaceId);

  res.status(200).json({
    message: "You have left the workspace successfully.",
  });
}

export const getActivity = async (req, res) => {
  const { page, limit } = req.query;

  const result = await getActivityService(req.user.id, req.params.workspaceId, {
    page,
    limit,
  });

  res.status(200).json({
    activities: result.data,
    meta: result.meta,
  });
};

/* ---------- Members ---------- */

export async function workSpaceMembers(req, res) {
  const { memberName, email, role, workspaceId } = req.body;

  await addMember(req.user.id, { memberName, email, role, workspaceId });

  res.status(201).json({
    success: true,
    message: `${memberName} has been assigned the ${role} role in the workspace.`,
  });
}

export async function getWorkspaceMembers(req, res) {
  const members = await getWorkspaceMembersService(req.user.id, {
    workspaceId: req.params.workspaceId,
    memberId: req.params.memberId,
    role: req.query.role,
  });

  res.status(200).json({
    message: "Workspace members fetched successfully",
    count: members.length,
    member: members,
  });
}

export async function changeRole(req, res) {
  const member = await changeRoleService(
    req.user.id,
    req.params.memberId,
    req.body.role,
  );

  res.status(200).json({
    message: "Member role updated successfully",
    member,
  });
}

export async function getMemberOnBaseOfRole(req, res) {
  const members = await getMembersByRole(req.params.workspaceId, req.params.role);

  res.status(200).json({
    message: "Workspaces fetched successfully",
    count: members.length,
    member: members,
  });
}

export async function deleteMember(req, res) {
  await deleteMemberService(req.user.id, req.params.memberId, {
    workspaceId: req.body.workspaceId,
    email: req.body.email,
  });

  res.status(200).json({
    message: "Workspace member removed successfully",
  });
}
