import express from "express";

import { authMiddleware } from "#middlewares/auth.js";
import { ownerOrAdminMiddleware } from "#middlewares/ownerOrAdmin.js";
import {
  getInvitationDetails,
  acceptInvitation,
  revokeInvitation,
  createInvitation,
  checkInvitationStatus,
} from "#controllers/invitationController.js";

const invitation = express.Router();

// Public: fetch invitation details by token
invitation.get("/details", getInvitationDetails);

// Logged-in user: accept an invitation
invitation.post("/accept", authMiddleware, acceptInvitation);

// Owner/Admin: revoke an invitation
invitation.post("/revoke", authMiddleware, ownerOrAdminMiddleware, revokeInvitation);

// Owner/Admin: create an invitation
invitation.post("/:workspaceId", authMiddleware, ownerOrAdminMiddleware, createInvitation);

// Owner/Admin: list invitations by status
invitation.get("/status/:workspaceId", authMiddleware, ownerOrAdminMiddleware, checkInvitationStatus);

export default invitation;
