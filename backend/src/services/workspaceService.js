/**
 * Workspace-level business logic (create, list, update, delete, ownership, leave, activity).
 * Controllers stay thin and delegate here; functions throw typed errors (#utils/errors.js).
 */
import { db } from "#config/client.js";
import {
  workspace,
  workspaceMembers,
  invitations,
  auditLog,
} from "#db/schema/index.js";
import { and, eq, desc } from "drizzle-orm";
import { workspaceRepo } from "#repositories/workspaceRepo.js";
import { workspaceMemberRepo } from "#repositories/workspaceMemberRepo.js";
import { userRepo } from "#repositories/userRepo.js";
import { createAuditLog } from "#services/auditLog.js";
import { paginateQuery } from "#utils/pagination.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from "#utils/errors.js";

export async function createWorkspace(userId, workspaceName) {
  const user = await userRepo.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const newWorkspace = await workspaceRepo.create({
    workspaceName,
    createdBy: userId,
  });

  await workspaceMemberRepo.create({
    memberName: user.name,
    userId,
    workspaceId: newWorkspace.id,
    role: "owner",
    assignedBy: userId,
  });

  await createAuditLog({
    performedBy: userId,
    action: "Create workspace",
    affectedUser: null,
    message: `${user.name} created a workspace.`,
  });

  return newWorkspace;
}

export async function getMyWorkspaces(userId) {
  return workspaceRepo.listForUser(userId);
}

export async function updateWorkspace(userId, workspaceId, workspaceName) {
  const existing = await workspaceRepo.findById(workspaceId);
  if (!existing) {
    throw new NotFoundError("Workspace doesn't exist.");
  }

  await workspaceRepo.updateName(workspaceId, workspaceName);

  const performedUser = await userRepo.findById(userId);
  await createAuditLog({
    performedBy: userId,
    action: "Update workspace name",
    affectedUser: null,
    message: `${performedUser.name} updated the workspace name.`,
  });
}

export async function deleteWorkspace(userId, workspaceId) {
  if (!workspaceId) {
    throw new BadRequestError("Workspace ID is required");
  }

  const owned = await workspaceRepo.findByIdAndOwner(workspaceId, userId);
  if (!owned) {
    throw new NotFoundError(
      "Workspace not found, or you do not have permission to delete it.",
    );
  }

  await db.transaction(async (tx) => {
    await tx.delete(invitations).where(eq(invitations.workspaceId, workspaceId));
    await tx
      .delete(workspaceMembers)
      .where(eq(workspaceMembers.workspaceId, workspaceId));
    await tx.delete(workspace).where(eq(workspace.id, workspaceId));
  });

  const performedUser = await userRepo.findById(userId);
  await createAuditLog({
    performedBy: userId,
    action: "Delete workspace",
    affectedUser: null,
    message: `${performedUser.name} deleted the workspace.`,
  });
}

export async function transferOwnership(currentOwnerId, workspaceId, newOwnerId) {
  if (!workspaceId || !newOwnerId) {
    throw new BadRequestError("Workspace ID and new owner ID are required");
  }
  if (currentOwnerId === newOwnerId) {
    throw new BadRequestError("You cannot transfer ownership to yourself");
  }

  await db.transaction(async (tx) => {
    const [currentWorkspace] = await tx
      .select()
      .from(workspace)
      .where(eq(workspace.id, workspaceId))
      .limit(1);
    if (!currentWorkspace) {
      throw new NotFoundError("Workspace not found");
    }
    if (currentWorkspace.createdBy !== currentOwnerId) {
      throw new ForbiddenError("Only the workspace owner can transfer ownership");
    }

    const [currentOwnerMember] = await tx
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, currentOwnerId),
          eq(workspaceMembers.role, "owner"),
        ),
      )
      .limit(1);
    if (!currentOwnerMember) {
      throw new ConflictError("Current owner membership is inconsistent");
    }

    const [newOwnerMember] = await tx
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, newOwnerId),
          eq(workspaceMembers.role, "admin"),
        ),
      )
      .limit(1);
    if (!newOwnerMember) {
      throw new BadRequestError(
        "Ownership can only be transferred to an existing workspace admin",
      );
    }

    await tx
      .update(workspaceMembers)
      .set({ role: "admin", assignedBy: currentOwnerId })
      .where(eq(workspaceMembers.id, currentOwnerMember.id));
    await tx
      .update(workspaceMembers)
      .set({ role: "owner", assignedBy: currentOwnerId })
      .where(eq(workspaceMembers.id, newOwnerMember.id));
    await tx
      .update(workspace)
      .set({ createdBy: newOwnerId })
      .where(eq(workspace.id, workspaceId));
  });

  const performedUser = await userRepo.findById(currentOwnerId);
  await createAuditLog({
    performedBy: currentOwnerId,
    action: "Transfer ownership",
    affectedUser: newOwnerId,
    message: `${performedUser.name} transferred ownership.`,
  });

  return { previousOwnerId: currentOwnerId, newOwnerId, workspaceId };
}

export async function leaveWorkspace(userId, workspaceId) {
  if (!workspaceId) {
    throw new BadRequestError("Workspace ID is required.");
  }

  const membership = await workspaceMemberRepo.findByUserAndWorkspace(
    userId,
    workspaceId,
  );
  if (!membership) {
    throw new NotFoundError("You are not a member of this workspace.");
  }
  if (membership.role === "owner") {
    throw new ForbiddenError(
      "Workspace owner cannot leave the workspace. Transfer ownership first.",
    );
  }

  const user = await userRepo.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found.");
  }

  await db.transaction(async (tx) => {
    await tx
      .delete(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.userId, userId),
          eq(workspaceMembers.workspaceId, workspaceId),
        ),
      );
    await tx
      .delete(invitations)
      .where(
        and(
          eq(invitations.workspaceId, workspaceId),
          eq(invitations.email, user.email),
        ),
      );
    await tx.insert(auditLog).values({
      performedBy: userId,
      action: "Leave workspace",
      affectedUser: userId,
      message: `${user.name} left the workspace.`,
    });
  });
}

export async function getActivity(userId, workspaceId, { page, limit }) {
  if (!workspaceId) {
    throw new BadRequestError("Workspace ID is required");
  }

  const member = await workspaceMemberRepo.findByUserAndWorkspace(
    userId,
    workspaceId,
  );
  if (!member) {
    throw new ForbiddenError("You are not a member of this workspace");
  }

  let baseQuery = db
    .select({
      id: auditLog.id,
      performedBy: auditLog.performedBy,
      action: auditLog.action,
      affectedUser: auditLog.affectedUser,
      message: auditLog.message,
      createdAt: auditLog.createdAt,
    })
    .from(auditLog)
    .leftJoin(workspaceMembers, eq(auditLog.performedBy, workspaceMembers.userId));

  if (member.role === "owner" || member.role === "admin") {
    baseQuery = baseQuery.where(eq(workspaceMembers.workspaceId, workspaceId));
  } else {
    baseQuery = baseQuery.where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(auditLog.performedBy, userId),
      ),
    );
  }

  const query = baseQuery.orderBy(desc(auditLog.createdAt)).$dynamic();
  return paginateQuery(query, { page, limit });
}
