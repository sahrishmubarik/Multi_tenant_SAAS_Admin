/**
 * Aggregates all table definitions into a single module.
 * Import schema from here, e.g. `import { users } from "#db/schema/index.js"`.
 */
export * from "#db/schema/user.js";
export * from "#db/schema/workspace.js";
export * from "#db/schema/workspaceMember.js";
export * from "#db/schema/invitation.js";
export * from "#db/schema/auditLog.js";
