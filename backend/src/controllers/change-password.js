import { db } from "#config/client.js";
import { users } from "#drizzle/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { changePasswordValidation } from "#validators/authValidation.js";
import { createAuditLog } from "#controllers/auditLogs.js";

export async function changePassword(req, res) {
  try {
    const userId = req.user.id;

    const {
      old_password,
      new_password,
      confirm_password,
    } = req.body;

    /* Apply validation to new password */
    const validation = changePasswordValidation.safeParse({
      password: new_password,
      confirmPassword: confirm_password,
    });

    /* Validation failed */
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    /* Get user from database */
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (userResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User does not exist",
      });
    }

    const user = userResult[0];

    /* Check old password */
    const oldPasswordValid = await bcrypt.compare(
      old_password,
      user.password,
    );

    if (!oldPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid old password.",
      });
    }

    /* Hash new password */
    const hashedPassword = await bcrypt.hash(new_password, 10);

    /* Update password */
    await db
      .update(users)
      .set({
        password: hashedPassword,
      })
      .where(eq(users.id, userId));

    /* Create audit log AFTER successful password update */
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

    /* Successful response */
    return res.status(200).json({
      success: true,
      message: "Password changed successfully!",
    });

  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      success: false,
      message: "Password not updated due to server error!",
      error: error.message,
    });
  }
}