/**
 * Workspace member business logic (add, list, change role, list by role, delete).
 * Controllers stay thin and delegate here; functions throw typed errors (#utils/errors.js).
 */
import { db } from "#config/client.js";
import { workspaceMembers, invitations } from "#db/schema/index.js";
import { and, eq } from "drizzle-orm";
import { workspaceMemberRepo } from "#repositories/workspaceMemberRepo.js";
import { userRepo } from "#repositories/userRepo.js";
import { createAuditLog } from "#services/auditLog.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from "#utils/errors.js";

const ASSIGNABLE_ROLES = ["admin", "editor", "viewer"];

export async function addMember(assignedById, { memberName, email, role, workspaceId }) {
  if (!memberName || !email || !role || !workspaceId) {
    throw new BadRequestError(
      "Member name, email, role and workspace ID are required",
    );
  }
  if (!ASSIGNABLE_ROLES.includes(role)) {
    throw new BadRequestError(
      `Invalid role. Choose from: ${ASSIGNABLE_ROLES.join(", ")}`,
    );
  }

  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw new NotFoundError("User not found. Ask the user to sign up first.");
  }

  const existingMember = await workspaceMemberRepo.findByUserAndWorkspace(
    user.id,
    workspaceId,
  );
  if (existingMember) {
    throw new ConflictError("This user is already a member of this workspace.");
  }

  await workspaceMemberRepo.create({
    memberName,
    userId: user.id,
    workspaceId,
    role,
    assignedBy: assignedById,
  });

  const performedUser = await userRepo.findById(assignedById);
  await createAuditLog({
    performedBy: assignedById,
    action: "Add member",
    affectedUser: user.id,
    message: `${performedUser.name} added new member ${memberName} and assigned the ${role} role in the workspace.`,
  });
}

export async function getWorkspaceMembers(userId, { workspaceId, memberId, role }) {
  const membership = await workspaceMemberRepo.findByUserAndWorkspace(
    userId,
    workspaceId,
  );
  if (!membership) {
    throw new ForbiddenError(
      "Access denied. You are not a member of this workspace.",
    );
  }

  if (membership.role !== "owner" && membership.role !== "admin") {
    throw new ForbiddenError(
      "You do not have permission to manage workspace members.",
    );
  }

  return workspaceMemberRepo.listMembers({ workspaceId, memberId, role });
}

export async function changeRole(userId, memberId, role) {
  if (!memberId) {
    throw new BadRequestError("Member ID is required");
  }
  if (!role) {
    throw new BadRequestError("Role is required for update role.");
  }
  if (!ASSIGNABLE_ROLES.includes(role)) {
    throw new BadRequestError(
      `Invalid role assigned. You can only choose from: ${ASSIGNABLE_ROLES.join(", ")}`,
    );
  }

  const target = await workspaceMemberRepo.findById(memberId);
  if (!target) {
    throw new NotFoundError("Workspace member is not found");
  }
  if (target.userId === userId) {
    throw new ForbiddenError("You cannot change your own role");
  }

  const updated = await workspaceMemberRepo.updateRole(memberId, role);

  const performedUser = await userRepo.findById(userId);
  await createAuditLog({
    performedBy: userId,
    action: "Role Update",
    affectedUser: memberId,
    message: `${performedUser.name} changed the role of ${target.memberName}.`,
  });

  return updated;
}

export async function getMembersByRole(workspaceId, role) {
  if (!role) {
    throw new BadRequestError("Role is required for update role.");
  }
  const allowedRoles = ["admin", "editor", "viewer", "owner"];
  if (!allowedRoles.includes(role)) {
    throw new BadRequestError(
      `Invalid role assigned. You can only choose from: ${allowedRoles.join(", ")}`,
    );
  }

  return workspaceMemberRepo.listByRole(workspaceId, role);
}

export async function deleteMember(performedById, memberId, { workspaceId, email }) {
  if (!memberId || !workspaceId || !email) {
    throw new BadRequestError(
      "Member ID, Workspace ID, and email are required",
    );
  }

  const member = await workspaceMemberRepo.findByIdAndWorkspace(
    memberId,
    workspaceId,
  );
  if (!member) {
    throw new NotFoundError("Member does not exist in this workspace.");
  }
  if (member.role === "owner") {
    throw new ForbiddenError("Workspace owner cannot be removed");
  }

  await db.transaction(async (tx) => {
    await tx
      .delete(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.userId, member.userId),
          eq(workspaceMembers.workspaceId, workspaceId),
        ),
      );
    await tx
      .delete(invitations)
      .where(
        and(
          eq(invitations.email, email),
          eq(invitations.workspaceId, workspaceId),
        ),
      );
  });

  const performedUser = await userRepo.findById(performedById);
  await createAuditLog({
    performedBy: performedById,
    action: "Delete member",
    affectedUser: member.userId,
    message: `${performedUser.name} removed ${member.memberName} from the workspace.`,
  });
}
