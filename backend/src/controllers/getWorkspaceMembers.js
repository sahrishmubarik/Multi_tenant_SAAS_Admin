
import { db } from "#config/client.js";
import { users, workspaceMembers } from "#drizzle/schema.js";
import { eq, and } from "drizzle-orm";

export async function getWorkspaceMembers(req, res) {
  const userId = req.user.id;
  const workspaceId = req.params.workspaceId;
  const targetMemberId = req.params.memberId;
  const role = req.query.role;

  console.log("Get workspace members through it.");

  try {
    const userRoleOnWorkspace = await db
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

    if (userRoleOnWorkspace.length === 0) {
      return res.status(403).json({
        message: "Access denied. You are not a member of this workspace.",
      });
    }

    const userRole = userRoleOnWorkspace[0].role;

    let queryCondition;

    if (userRole === "owner" || userRole === "admin") {
      if (targetMemberId) {
        queryCondition = and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.id, targetMemberId),
          ...(role ? [eq(workspaceMembers.role, role)] : []),
        );
      } else {
        queryCondition = and(
          eq(workspaceMembers.workspaceId, workspaceId),
          ...(role ? [eq(workspaceMembers.role, role)] : []),
        );
      }
    } else {
      return res.status(403).json({
        message: "You do not have permission to manage workspace members.",
      });
    }

    const getWorkspaceMember = await db
      .select({
        memberId: workspaceMembers.id,
        username: workspaceMembers.memberName,
        user_id: workspaceMembers.userId,
        email: users.email,
        role: workspaceMembers.role,
        createAt: workspaceMembers.createdAt,
      })
      .from(workspaceMembers)
      .leftJoin(
        users,
        eq(workspaceMembers.userId, users.id)
      )
      .where(queryCondition);

    return res.status(200).json({
      message: "Workspace members fetched successfully",
      count: getWorkspaceMember.length,
      member: getWorkspaceMember,
    });
  } catch (error) {
    console.log("Get Workspace Member Error:", error);

    return res.status(500).json({
      message: "Failed to fetch workspace members",
      error: error.message,
    });
  }
}




// import { db } from "#config/client.js";
// import { users, workspaceMembers } from "#drizzle/schema.js";
// import { eq, and } from "drizzle-orm";

// export async function getWorkspaceMembers(req, res) {
//   const userId = req.user.id;
//   const workspaceId = req.params.workspaceId;
//   const targetMemberId = req.params.memberId;
//   console.log("Get workspace members through it.")
//   try {
//     const userRoleOnWorkspace = await db
//       .select({
//         role: workspaceMembers.role,
//       })
//       .from(workspaceMembers)
//       .where(
//         and(
//           eq(workspaceMembers.workspaceId, workspaceId),
//           eq(workspaceMembers.userId, userId),
//         ),
//       );

//     if (userRoleOnWorkspace.length === 0) {
//       return res.status(403).json({
//         message: "Access denied. You are not a member of this workspace.",
//       });
//     }

//     const userRole = userRoleOnWorkspace[0].role;

//     let queryCondition;

//     if (userRole === "owner" || userRole === "admin") {
//       if (targetMemberId) {
//         queryCondition = and(
//           eq(workspaceMembers.workspaceId, workspaceId),
//           eq(workspaceMembers.id, targetMemberId),
//         );
//       } else {
//         queryCondition = eq(workspaceMembers.workspaceId, workspaceId);
//       }
//     } else {
//       return res.status(403).json({
//         message: "You do not have permission to manage workspace members.",
//       });
//     }
//      const getWorkspaceMember = await db
//   .select({
//     memberId: workspaceMembers.id,
//     username: workspaceMembers.memberName,
//     user_id: workspaceMembers.userId,
//     email: users.email,
//     role: workspaceMembers.role,
//     createAt: workspaceMembers.createdAt,
//   })
//   .from(workspaceMembers)
//   .leftJoin(
//     users,
//     eq(workspaceMembers.userId, users.id)
//   )
//   .where(queryCondition);
//     return res.status(200).json({
//       message: "Workspace members fetched successfully",
//       count: getWorkspaceMember.length,
//       member: getWorkspaceMember,
//     });
//   } catch (error) {
//     console.log("Get Workspace Member Error:", error);

//     return res.status(500).json({
//       message: "Failed to fetch workspace members",
//       error: error.message,
//     });
//   }
// }