/**
 * Invitation business logic (create, accept, revoke, details, status).
 * Controllers stay thin and delegate here; functions throw typed errors (#utils/errors.js).
 */
import { invitationRepo } from "#repositories/invitationRepo.js";
import { workspaceRepo } from "#repositories/workspaceRepo.js";
import { workspaceMemberRepo } from "#repositories/workspaceMemberRepo.js";
import { userRepo } from "#repositories/userRepo.js";
import { generateSecureToken, hashToken } from "#utils/cryptoUtils.js";
import { sendEmailNotification } from "#services/emailService.js";
import { invitationEmail } from "#templates/email.js";
import { createAuditLog } from "#services/auditLog.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "#utils/errors.js";

const INVITE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const ALLOWED_STATUSES = ["PENDING", "ACCEPTED", "REVOKED"];

export async function createInvitation(invitedBy, workspaceId, email) {
  if (!email) {
    throw new BadRequestError("Email is required");
  }
  if (!workspaceId) {
    throw new BadRequestError("Workspace ID is required");
  }

  const existingWorkspace = await workspaceRepo.findById(workspaceId);
  if (!existingWorkspace) {
    throw new NotFoundError("Workspace not found");
  }

  const existingUser = await userRepo.findByEmail(email);
  if (existingUser) {
    const existingMember = await workspaceMemberRepo.findByUserAndWorkspace(
      existingUser.id,
      workspaceId,
    );
    if (existingMember) {
      throw new BadRequestError(
        "This user is already a member of this workspace",
      );
    }
  }

  const pending = await invitationRepo.findPending(email, workspaceId);
  if (pending) {
    throw new BadRequestError("An invitation is already pending for this email");
  }

  const token = generateSecureToken();
  const hashedToken = hashToken(token);
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS);

  await invitationRepo.create({
    workspaceId,
    email,
    invitedBy,
    token: hashedToken,
    status: "PENDING",
    expiresAt,
  });

  const html = invitationEmail(token, existingWorkspace.workspaceName);
  await sendEmailNotification(
    email,
    `Invitation to join ${existingWorkspace.workspaceName}`,
    html,
  );

  const performingUser = await userRepo.findById(invitedBy);
  await createAuditLog({
    performedBy: invitedBy,
    action: "Send invitation",
    affectedUser: null,
    message: `${performingUser.name} sent invitation to ${email}.`,
  });
}

export async function acceptInvitation(userId, token) {
  if (!token) {
    throw new BadRequestError("Invitation token is required");
  }

  const invitation = await invitationRepo.findByToken(hashToken(token));
  if (!invitation) {
    throw new NotFoundError("Invalid invitation token");
  }
  if (invitation.revoke === true || invitation.status === "REVOKED") {
    throw new BadRequestError("This invitation has been revoked.");
  }
  if (invitation.status !== "PENDING") {
    throw new BadRequestError("This invitation is no longer valid.");
  }
  if (new Date() > invitation.expiresAt) {
    throw new BadRequestError("This invitation has expired.");
  }

  const user = await userRepo.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found.");
  }
  if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    throw new ForbiddenError(
      "This invitation was sent to a different email address.",
    );
  }

  const existingMember = await workspaceMemberRepo.findByUserAndWorkspace(
    userId,
    invitation.workspaceId,
  );
  if (existingMember) {
    throw new BadRequestError("You are already a member of this workspace.");
  }

  await workspaceMemberRepo.create({
    memberName: user.name,
    userId,
    workspaceId: invitation.workspaceId,
    role: "viewer",
    assignedBy: invitation.invitedBy,
  });
  await invitationRepo.updateStatus(invitation.id, "ACCEPTED");

  return { workspaceId: invitation.workspaceId, role: "viewer" };
}

export async function revokeInvitation(performedById, invitationId) {
  if (!invitationId) {
    throw new BadRequestError("Invitation ID is required to revoke");
  }

  const updated = await invitationRepo.revoke(invitationId);
  if (!updated) {
    throw new NotFoundError("Invitation not found or could not be updated");
  }

  const performedUser = await userRepo.findById(performedById);
  await createAuditLog({
    performedBy: performedById,
    action: "Revoke invitation",
    affectedUser: null,
    message: `${performedUser.name} revoked an invitation.`,
  });

  return { id: updated.id, status: updated.status };
}

export async function getInvitationDetails(token) {
  if (!token) {
    throw new BadRequestError("Invitation token is required");
  }

  const invitation = await invitationRepo.findByTokenWithWorkspace(
    hashToken(token),
  );
  if (!invitation) {
    throw new NotFoundError("Invalid invitation token");
  }
  if (invitation.revoke === true || invitation.status === "REVOKED") {
    throw new BadRequestError("This invitation has been revoked");
  }
  if (invitation.status !== "PENDING") {
    throw new BadRequestError("This invitation is no longer valid");
  }
  if (new Date() > invitation.expiresAt) {
    throw new BadRequestError("This invitation has expired");
  }

  const existingUser = await userRepo.findByEmail(invitation.email);

  return {
    invitation: {
      id: invitation.id,
      email: invitation.email,
      workspaceId: invitation.workspaceId,
      workspaceName: invitation.workspaceName,
      expiresAt: invitation.expiresAt,
    },
    userExists: !!existingUser,
  };
}

export async function checkInvitationStatus(workspaceId, rawStatus) {
  const status = rawStatus?.toUpperCase();

  if (!workspaceId) {
    throw new BadRequestError("Workspace ID is required");
  }
  if (!status) {
    throw new BadRequestError("Status field is required");
  }
  if (!ALLOWED_STATUSES.includes(status)) {
    throw new BadRequestError(
      `Invalid status. You can only choose from: ${ALLOWED_STATUSES.join(", ")}`,
    );
  }

  return invitationRepo.listByWorkspaceAndStatus(workspaceId, status);
}
