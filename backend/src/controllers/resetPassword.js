import { db } from "#config/client.js";
import { users } from "#drizzle/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { hashToken } from "#utils/cryptoUtils.js";

export async function resetPassword(req, res) {
  const { token } = req.query;

  const { new_password, confirm_password } = req.body;

  // Validate input
  if (!token || !new_password || !confirm_password) {
    return res.status(400).json({
      error: "All fields are required.",
    });
  }

  if (new_password !== confirm_password) {
    return res.status(400).json({
      error: "Passwords do not match",
    });
  }

  try {
    // Hash the token received from the URL
    const hashedToken = hashToken(token);

    // Find user using hashed token
    const user = await db
      .select()
      .from(users)
      .where(eq(users.resetToken, hashedToken));

    if (user.length === 0) {
      return res.status(400).json({
        error: "Invalid or expired token",
      });
    }

    // Check token expiry
    if (!user[0].tokenExpiresAt || user[0].tokenExpiresAt < new Date()) {
      return res.status(400).json({
        error: "Invalid or expired token",
      });
    }

    // Check if token has already been used
    if (user[0].isTokenUsed) {
      return res.status(400).json({
        error: "Token has already been used",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password and invalidate token
    await db
      .update(users)
      .set({
        password: hashedPassword,
        isTokenUsed: true,
        resetToken: null,
        tokenExpiresAt: null,
      })
      .where(eq(users.id, user[0].id));

    return res.status(200).json({
      message: "Password has been successfully updated!",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
