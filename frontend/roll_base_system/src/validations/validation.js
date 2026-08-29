import { z } from "zod";

/* =========================
   REUSABLE FIELD VALIDATIONS
========================= */

export const nameSchema = z
  .string()
  .trim()
  .min(3, "Name must be at least 3 characters.")
  .max(50, "Name must not exceed 50 characters.");

export const emailSchema = z
  .string()
  .trim()
  .email("Please enter a valid email address.")
  .max(50, "Email must not exceed 50 characters.");

export const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters.")
  .regex(
    /[!@#$%^&*(),.?":{}|<>]/,
    "Password must contain at least one special character."
  );

/* =========================
   PASSWORD + CONFIRM PASSWORD
========================= */

export const passwordWithConfirmSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    }
  );

/* =========================
   LOGIN
========================= */

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});

/* =========================
   SIGNUP
========================= */

export const signupSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required."),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    }
  );

/* =========================
   WORKSPACE NAME
========================= */

export const workspaceNameSchema = z.object({
  workspaceName: nameSchema,
});

/* =========================
   FORGOT PASSWORD
========================= */

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/* =========================
   RESET / CHANGE PASSWORD
========================= */

export const resetPasswordSchema = passwordWithConfirmSchema;

export const changePasswordSchema = passwordWithConfirmSchema;

/* =========================
   INVITATION
========================= */

export const invitationSchema = z.object({
  email: emailSchema,
});