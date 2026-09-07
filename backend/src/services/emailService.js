import formData from "form-data";
import Mailgun from "mailgun.js";
import { db } from "#config/client.js";
import { users } from "#db/schema/index.js";
import { eq } from "drizzle-orm";
import { generateSecureToken, hashToken } from "#utils/cryptoUtils.js"; // Utils se import
import { resetPasswordEmail, verificationEmail } from "#templates/email.js";
const token = generateSecureToken();
const hashedToken = hashToken(token);
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY || "",
});

// Email sending logic
// export async function sendEmailNotification(email, subject, html) {
//   const mailOptions = {
//     from: `Auth System <mailgun@${process.env.MAILGUN_DOMAIN}>`,
//     to: [email],
//     subject: subject,
//     html: html
//   };

//   await mg.messages.create(process.env.MAILGUN_DOMAIN, mailOptions);
//   return true;
// }

export async function sendEmailNotification(email, subject, html) {
  const mailOptions = {
    from: `Auth System <mailgun@${process.env.MAILGUN_DOMAIN}>`,
    to: [email],
    subject,
    html,
  };

  const result = await mg.messages.create(
    process.env.MAILGUN_DOMAIN,
    mailOptions,
  );

  console.log("Mailgun response:", result);

  return true;
}
// Central token handling service
export const generateAndSendToken = async (email, type) => {
  const token = generateSecureToken();
  const hashedToken = hashToken(token);
  console.log(" TESTING RAW TOKEN (Use this in query params):", token);

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000 /* 15 mint */);

  const result = await db
    .update(users)
    .set({
      resetToken: hashedToken,
      tokenExpiresAt: expiresAt,
      isTokenUsed: false,
    })
    .where(eq(users.email, email))
    .returning({
      id: users.id,
      email: users.email,
      resetToken: users.resetToken,
      tokenExpiresAt: users.tokenExpiresAt,
      isTokenUsed: users.isTokenUsed,
    });

  console.log("Database updated:", result);

  let subject;
  let html;

  if (type === "RESET_PASSWORD") {
    subject = "Reset Your Password";
    html = resetPasswordEmail(token);
  } else if (type === "EMAIL_VERIFICATION") {
    subject = "Verify Your Email Address";
    html = verificationEmail(token);
  }

  await sendEmailNotification(email, subject, html);

  return true;
};
