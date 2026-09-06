import { db } from "#config/client.js";
import { users } from "#drizzle/schema.js";
import { eq } from "drizzle-orm";
export async function profileController(req, res) {
  const userId = req.user.id;
  try {
    const user = await db
      .select({
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user.length === 0) {
      res.status(404).json({
        message: "User not found:",
      });
    }
    return res.status(200).json({
      user: user[0],
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
}
