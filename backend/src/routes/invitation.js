import express from "express";
import {getInvitationDetails } from "#controllers/checkInvitation.js";

import { ownerOrAdminMiddleware } from "#middleware/ownerOrAdmin.js";
import { ownerMiddleware } from "#middleware/owner.js";
import { authMiddleware } from "#middleware/auth.js";

import { createInvitation } from "#controllers/invitation.js";
import {
  acceptInvitation,
  revokeInvitation,
} from "#controllers/acceptInvitation.js";

import { checkInvitationStatus } from "#controllers/checkStatus.js";

const invitation = express.Router();






invitation.get("/details",getInvitationDetails);


// LOGGED-IN USER
// User invitation accept 
invitation.post("/accept",authMiddleware, acceptInvitation);


// Admin/Owner
invitation.post( "/revoke", authMiddleware, revokeInvitation);
// Admin/Owner
invitation.post( "/:workspaceId", authMiddleware,ownerOrAdminMiddleware, createInvitation);

// Owner
invitation.get( "/status/:workspaceId",authMiddleware, ownerMiddleware, checkInvitationStatus);

export default invitation;