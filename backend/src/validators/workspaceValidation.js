import { z } from "zod";

export const workspaceNameValidation = z.object({
  workspaceName: z
    .string({ required_error: "Workspace name is required" })
    .trim() // Removes leading/trailing spaces
    .min(3, "Minimum length must be at least 3 characters")
    .max(50, "Workspace name cannot exceed 50 characters")
    .regex(
      /^[A-Za-z0-9']+(?: [A-Za-z0-9']+)*$/,
      "Workspace name can only contain alphanumeric characters with single spaces between words",
    ),
});
