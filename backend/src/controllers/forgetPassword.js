// src/controllers/forgetPassword.js
import { db } from '#config/client.js';
import { users } from '#drizzle/schema.js';
import { eq } from 'drizzle-orm';
import { generateAndSendToken } from '#services/emailService.js';

export async function forgetPassword(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check user exist or not
        const userEmail = await db.select().from(users).where(eq(users.email, email));
        if (userEmail.length === 0) {
            return res.status(404).json({ error: "User email not found" });
        }

        // Service layer call  generate token function and email send to user
        await generateAndSendToken(email, 'RESET_PASSWORD');

        return res.status(200).json({ message: 'Password reset token sent to your email.' });

    } catch (error) {
        console.error('Error in forgetPassword:', error);
        return res.status(500).json({ error: 'Failed to send reset email.' });
    }
}
