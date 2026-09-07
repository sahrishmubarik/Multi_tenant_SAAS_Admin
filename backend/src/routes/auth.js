import express from "express";

import {
  signup,
  login,
  forgetPassword,
  resetPassword,
  emailVerification,
  verifyEmail,
  profileController,
  changePassword,
} from "#controllers/authController.js";

import { authMiddleware } from "#middlewares/auth.js";

const auth = express.Router();

auth.post("/signup", signup);
auth.post("/login", login);
auth.post("/forget-password", forgetPassword);
auth.post("/reset-password", resetPassword);
auth.post("/email-verification-token", emailVerification);
auth.get("/verify-Email", verifyEmail);

auth.patch("/change-password", authMiddleware, changePassword);

auth.get("/profile", authMiddleware, profileController);

export default auth;
