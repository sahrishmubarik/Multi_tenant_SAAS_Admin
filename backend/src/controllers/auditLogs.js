
import { db } from "#config/client.js";
import { auditLog } from "#drizzle/schema.js";

export const createAuditLog = async ({
   workspaceId,
  performedBy,
  action,
  affectedUser,
  message,
}) => {
  try {
    const [result] = await db
      .insert(auditLog)
      .values({
         workspaceId,
        performedBy,
        action,
        affectedUser,
        message,
      })
      .returning();

    console.log("Audit log inserted:", result);

    return result;
  } catch (error) {
    console.error("Audit log error:", error);
    throw error;
  }
};