
import { db } from "#config/client.js";
import { auditLog, workspaceMembers } from "#drizzle/schema.js";
import { eq, and, desc } from "drizzle-orm";
import { paginateQuery } from "../utils/pagination.js";

export const getActivity = async (req, res) => {
  const { workspaceId } = req.params; // E.g., Selected workspace ID from frontend
  const userId = req.user.id;
  const { page, limit } = req.query;

  try {
    if (!workspaceId) {
      return res.status(400).json({
        message: "Workspace ID is required",
      });
    }

    // 1. Get current user's membership to check permissions
    const [member] = await db
      .select({
        role: workspaceMembers.role,
      })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId),
        ),
      );

    if (!member) {
      return res.status(403).json({
        message: "You are not a member of this workspace",
      });
    }

    // 2. JOIN auditLog with workspaceMembers using the 'performedBy' field [1]
    let baseQuery = db
      .select({
        id: auditLog.id,
        performedBy: auditLog.performedBy,
        action: auditLog.action,
        affectedUser: auditLog.affectedUser,
        message: auditLog.message,
        createdAt: auditLog.createdAt,
      })
      .from(auditLog)
      .leftJoin(
        workspaceMembers,
        eq(auditLog.performedBy, workspaceMembers.userId), // Matches log performer to their workspace context [1]
      );

    // 3. APPLY FILTERING BASED ON CURRENT ROLE
    if (member.role === "owner" || member.role === "admin") {
      // Owners & Admins see ALL logs from users who belong to this selected workspace
      baseQuery = baseQuery.where(
        eq(workspaceMembers.workspaceId, workspaceId),
      );
    } else {
      // Editors & Viewers can ONLY see their own activity inside this workspace
      baseQuery = baseQuery.where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(auditLog.performedBy, userId),
        ),
      );
    }

    // 4. ORDER BY AND INJECT PAGINATION LIMITS
    const query = baseQuery.orderBy(desc(auditLog.createdAt)).$dynamic(); // Feeds cleanly into pagination utility

    const paginationResult = await paginateQuery(query, { page, limit });

    return res.status(200).json({
      activities: paginationResult.data,
      meta: paginationResult.meta,
    });
  } catch (error) {
    console.error("Get activity error:", error);
    return res.status(500).json({
      message: "Failed to fetch activity",
    });
  }
};

// // import { db } from "#config/client.js";
// // import {
// //   auditLog,
// //   workspaceMembers,
// // } from "#drizzle/schema.js";
// // import { eq, and, desc } from "drizzle-orm";
// // import { paginateQuery } from '../utils/pagination.js'; // Ensure correct extension (.js)

// // export const getActivity = async (req, res) => {
// //   const { workspaceId } = req.params;
// //   const userId = req.user.id;

// //   // 1. EXTRACT query variables from the incoming HTTP request
// //   const { page, limit } = req.query;
// // // Make sure you send them unchanged directly to the helper
// // try{
// //     if (!workspaceId) {
// //       return res.status(400).json({
// //         message: "Workspace ID is required",
// //       });
// //     }

// //     // Get current user's membership
// //     const [member] = await db
// //       .select({
// //         role: workspaceMembers.role,
// //       })
// //       .from(workspaceMembers)
// //       .where(
// //         and(
// //           eq(workspaceMembers.workspaceId, workspaceId),
// //           eq(workspaceMembers.userId, userId)
// //         )
// //       );

// //     if (!member) {
// //       return res.status(403).json({
// //         message: "You are not a member of this workspace",
// //       });
// //     }

// //     // TODO:
// //     // owner/admin -> all workspace activity
// //     // editor/viewer -> only their own activity

// //     // 2. CONVERT to a dynamic query statement using .$dynamic()
// //     const query = db
// //       .select({
// //         id: auditLog.id,
// //         performedBy: auditLog.performedBy,
// //         action: auditLog.action,
// //         affectedUser: auditLog.affectedUser,
// //         message: auditLog.message,
// //         createdAt: auditLog.createdAt,
// //       })
// //       .from(auditLog)
// //       // Tip: You will likely want to filter logs by workspace here using .where(eq(auditLog.workspaceId, workspaceId))
// //       .orderBy(desc(auditLog.createdAt))
// //       .$dynamic();

// //     // 3. EXECUTE dynamic query wrapper via your reusable utils engine
// //     const paginationResult = await paginateQuery(query, { page, limit });

// //     // 4. RETURN responses back matching your frontend's payload expectations
// //     return res.status(200).json({
// //       activities: paginationResult.data, // This limits records to exactly 10!
// //       meta: paginationResult.meta,       // Sends metadata to the frontend UI
// //     });

// //   } catch (error) {
// //     console.error("Get activity error:", error);

// //     return res.status(500).json({
// //       message: "Failed to fetch activity",
// //     });
// //   }
// // };

// // import { db } from "#config/client.js";
// // import {
// //   auditLog,
// //   workspaceMembers,
// // } from "#drizzle/schema.js";
// // import { eq, and, desc } from "drizzle-orm";
// // import { paginateQuery } from '../utils/pagination';
// // export const getActivity = async (req, res) => {
// //   const { workspaceId } = req.params;
// //   const userId = req.user.id;

// //   try {
// //     if (!workspaceId) {
// //       return res.status(400).json({
// //         message: "Workspace ID is required",
// //       });
// //     }

// //     // Get current user's membership
// //     const [member] = await db
// //       .select({
// //         role: workspaceMembers.role,
// //       })
// //       .from(workspaceMembers)
// //       .where(
// //         and(
// //           eq(workspaceMembers.workspaceId, workspaceId),
// //           eq(workspaceMembers.userId, userId)
// //         )
// //       );

// //     if (!member) {
// //       return res.status(403).json({
// //         message: "You are not a member of this workspace",
// //       });
// //     }

// //     // TODO:
// //     // owner/admin -> all workspace activity
// //     // editor/viewer -> only their own activity

// //     // For now:
// //     const activities = await db
// //       .select({
// //         id: auditLog.id,
// //         performedBy: auditLog.performedBy,
// //         action: auditLog.action,
// //         affectedUser: auditLog.affectedUser,
// //         message: auditLog.message,
// //         createdAt: auditLog.createdAt,
// //       })
// //       .from(auditLog)
// //       .orderBy(desc(auditLog.createdAt));

// //     return res.status(200).json({
// //       activities,
// //     });
// //   } catch (error) {
// //     console.error("Get activity error:", error);

// //     return res.status(500).json({
// //       message: "Failed to fetch activity",
// //     });
// //   }
// // };
