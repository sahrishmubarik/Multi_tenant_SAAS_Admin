import express from "express";

import { ownerOrAdminMiddleware } from "#middleware/ownerOrAdmin.js";
import { ownerMiddleware } from "#middleware/owner.js";
import { authMiddleware } from "#middleware/auth.js";

import { createInvitation } from "#controllers/invitation.js";
import {
  acceptInvitation,
  revokeInvitation,
} from "#controllers/acceptInvitation.js";

import { checkInvitationStatus } from "#controllers/checkStatus.js";
import {getInvitationDetails } from "#controllers/checkInvitation.js";

const invitation = express.Router();


// Admin/Owner
invitation.post( "/:workspaceId", ownerOrAdminMiddleware, createInvitation);



invitation.get("/details",getInvitationDetails);


// LOGGED-IN USER
// User invitation accept 
invitation.post("/accept",authMiddleware,acceptInvitation);


// Admin/Owner
invitation.post( "/revoke", authMiddleware, revokeInvitation);


// Owner
invitation.get( "/status/:workspaceId", ownerMiddleware, checkInvitationStatus);

export default invitation;