/**
 * Auth business logic. Controllers stay thin and delegate here.
 * Functions return data or throw typed errors (#utils/errors.js).
 */
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userRepo } from "#repositories/userRepo.js";
import { hashToken } from "#utils/cryptoUtils.js";
import { generateAndSendToken } from "#services/emailService.js";
import { createAuditLog } from "#services/auditLog.js";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} from "#utils/errors.js";

const SALT_ROUNDS = 10;

export async function registerUser({ name, email, password }) {
  const existing = await userRepo.findByEmail(email);
  if (existing) {
    throw new ConflictError("Email already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const newUser = await userRepo.create({ name, email, password: hashedPassword });

  await createAuditLog({
    performedBy: newUser.id,
    action: "Create Account",
    affectedUser: newUser.id,
    message: `${newUser.name} created account successfully.`,
  });

  return newUser;
}

export async function loginUser({ email, password }) {
  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new UnauthorizedError("Invalid email and password");
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "72h" },
  );

  return { token };
}

export async function requestPasswordReset(email) {
  if (!email) {
    throw new BadRequestError("Email is required");
  }

  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw new NotFoundError("User email not found");
  }

  await generateAndSendToken(email, "RESET_PASSWORD");
}

export async function resetUserPassword({ token, newPassword, confirmPassword }) {
  if (!token || !newPassword || !confirmPassword) {
    throw new BadRequestError("All fields are required.");
  }
  if (newPassword !== confirmPassword) {
    throw new BadRequestError("Passwords do not match");
  }

  const user = await userRepo.findByResetToken(hashToken(token));
  assertValidResetToken(user, "Invalid or expired token");

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await userRepo.updateById(user.id, {
    password: hashedPassword,
    isTokenUsed: true,
    resetToken: null,
    tokenExpiresAt: null,
  });
}

export async function requestEmailVerification(email) {
  if (!email) {
    throw new BadRequestError("Email is required");
  }

  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw new NotFoundError("User email not found");
  }

  await generateAndSendToken(email, "EMAIL_VERIFICATION");
}

export async function verifyUserEmail(token) {
  if (!token) {
    throw new BadRequestError("Verification token is required.");
  }

  const user = await userRepo.findByResetToken(hashToken(token));
  assertValidResetToken(user, "Invalid verification token.");

  await userRepo.updateById(user.id, {
    isEmailVerified: true,
    isTokenUsed: true,
    resetToken: null,
    tokenExpiresAt: null,
  });
}

export async function getProfile(userId) {
  const user = await userRepo.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  return { name: user.name, email: user.email };
}

export async function changeUserPassword(userId, { oldPassword, newPassword }) {
  const user = await userRepo.findById(userId);
  if (!user) {
    throw new NotFoundError("User does not exist");
  }

  const oldPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!oldPasswordValid) {
    throw new UnauthorizedError("Invalid old password.");
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await userRepo.updateById(userId, { password: hashedPassword });

  // Audit is best-effort: a logging failure must not fail the password change.
  try {
    await createAuditLog({
      performedBy: userId,
      action: "Password Change",
      affectedUser: userId,
      message: "User changed their password",
    });
  } catch (auditError) {
    console.error("Audit log error:", auditError);
  }
}

// Shared guard for the token-based flows (reset password + email verification).
function assertValidResetToken(user, notFoundMessage) {
  if (!user) {
    throw new BadRequestError(notFoundMessage);
  }
  if (!user.tokenExpiresAt || user.tokenExpiresAt < new Date()) {
    throw new BadRequestError("Invalid or expired token");
  }
  if (user.isTokenUsed) {
    throw new BadRequestError("Token has already been used");
  }
}
