import {
  createInvitation as createInvitationService,
  acceptInvitation as acceptInvitationService,
  revokeInvitation as revokeInvitationService,
  getInvitationDetails as getInvitationDetailsService,
  checkInvitationStatus as checkInvitationStatusService,
} from "#services/invitationService.js";

/* CREATE INVITATION (owner/admin) */
export const createInvitation = async (req, res) => {
  await createInvitationService(req.user.id, req.params.workspaceId, req.body.email);

  res.status(201).json({
    message: "Invitation created and email sent successfully",
  });
};

/* ACCEPT INVITATION (logged-in user) */
export const acceptInvitation = async (req, res) => {
  const { workspaceId, role } = await acceptInvitationService(
    req.user.id,
    req.query.token,
  );

  res.status(200).json({
    success: true,
    message: "Invitation accepted successfully.",
    workspaceId,
    role,
  });
};

/* REVOKE INVITATION (owner/admin) */
export const revokeInvitation = async (req, res) => {
  const updated = await revokeInvitationService(req.user.id, req.body.invitationId);

  res.status(200).json({
    message: "Invitation has been successfully revoked and invalidated.",
    invitationId: updated.id,
    status: updated.status,
  });
};

/* INVITATION DETAILS (public) */
export const getInvitationDetails = async (req, res) => {
  const { invitation, userExists } = await getInvitationDetailsService(
    req.query.token,
  );

  res.status(200).json({
    success: true,
    invitation,
    userExists,
  });
};

/* CHECK INVITATION STATUS (owner/admin) */
export async function checkInvitationStatus(req, res) {
  const invitations = await checkInvitationStatusService(
    req.params.workspaceId,
    req.query.status,
  );

  res.status(200).json({
    message: "Status fetched successfully",
    count: invitations.length,
    invitations,
  });
}
