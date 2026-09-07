import { z } from "zod";

// 1. Shared constants and base validators
export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const emailSchema = z
  .string({ required_error: "Email is required" })
  .email("Invalid email format. Please enter a valid email.")
  .max(50, "Email cannot be longer than 50 characters");

export const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(50)
  .regex(
    passwordRegex,
    "At least one uppercase letter, one lowercase, one number, one special character (@$!%*?&) required",
  );

// 2. Helper: add confirm-password matching to any schema
export function withConfirmPassword(baseSchema) {
  return baseSchema
    .extend({
      confirmPassword: z.string().min(1, "Confirm password is required"),
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Passwords do not match",
          path: ["confirmPassword"],
        });
      }
    });
}

// 3. Auth validations
export const loginValidation = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signupValidation = withConfirmPassword(
  z.object({
    name: z
      .string({ required_error: "Name is required" })
      .trim()
      .min(3, "Name must be at least 3 characters.")
      .max(50, "Name cannot be longer than 50 characters.")
      .regex(
        /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/,
        "Name can contain only letters, spaces, hyphens, and apostrophes.",
      ),
    email: emailSchema,
    password: passwordSchema,
  }),
);

export const changePasswordValidation = withConfirmPassword(
  z.object({
    password: passwordSchema,
  }),
);

export const verifiedEmailValidation = z.object({
  email: emailSchema,
});
