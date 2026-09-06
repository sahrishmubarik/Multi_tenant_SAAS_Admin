import { db } from "#config/client.js";
import { users } from "#drizzle/schema.js";
import { eq } from "drizzle-orm";
import { generateAndSendToken } from "#services/emailService.js"; // Service import

// Email Verification Controller
export async function emailVerification(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const userEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (userEmail.length === 0) {
      return res.status(404).json({ error: "User email not found" });
    }

    // Email verification type  service call
    await generateAndSendToken(email, "EMAIL_VERIFICATION");

    return res
      .status(200)
      .json({ message: "Verification token sent to your email." });
  } catch (error) {
    console.error("Error in emailVerification:", error);
    return res
      .status(500)
      .json({ error: "Failed to send verification email." });
  }
}
