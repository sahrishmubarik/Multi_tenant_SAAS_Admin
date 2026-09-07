import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import Toast from "@/components/ui/Toast";
import TextField from "@/components/ui/TextField";
import PasswordField from "@/components/ui/PasswordField";

import {
  nameSchema,
  emailSchema,
  passwordSchema,
  signupSchema,
} from "@/validations/validation.js";

export default function SignupCard() {
  const defaultFormValue = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const [formData, setFormData] = useState(defaultFormValue);

  const [errors, setErrors] = useState({});

  const [message, setMessage] = useState("");

  const [toast, setToast] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /* =========================
     HANDLE INPUT CHANGE
  ========================= */

  function handleChange(event) {
    const { name, value } = event.target;

    const updatedFormData = {
      ...formData,
      [name]: value,
    };

    setFormData(updatedFormData);

    // Clear backend message when user starts typing
    setMessage("");

    /* NAME VALIDATION */
    if (name === "name") {
      const result = nameSchema.safeParse(value);

      if (!result.success) {
        setErrors((previous) => ({
          ...previous,
          name: result.error.issues[0].message,
        }));
      } else {
        setErrors((previous) => ({
          ...previous,
          name: "",
        }));
      }
    }

    /* EMAIL VALIDATION */
    if (name === "email") {
      const result = emailSchema.safeParse(value);

      if (!result.success) {
        setErrors((previous) => ({
          ...previous,
          email: result.error.issues[0].message,
        }));
      } else {
        setErrors((previous) => ({
          ...previous,
          email: "",
        }));
      }
    }

    /* PASSWORD VALIDATION */
    if (name === "password") {
      const result = passwordSchema.safeParse(value);

      if (!result.success) {
        setErrors((previous) => ({
          ...previous,
          password: result.error.issues[0].message,
        }));
      } else {
        setErrors((previous) => ({
          ...previous,
          password: "",
        }));
      }

      // Password changed, so confirm password needs to be re-checked.
      if (updatedFormData.confirmPassword) {
        const confirmResult = signupSchema.safeParse(updatedFormData);

        const confirmError = confirmResult.error?.issues.find(
          (issue) => issue.path[0] === "confirmPassword",
        );

        setErrors((previous) => ({
          ...previous,
          confirmPassword: confirmError ? confirmError.message : "",
        }));
      }
    }

    /* CONFIRM PASSWORD VALIDATION */
    if (name === "confirmPassword") {
      const result = signupSchema.safeParse(updatedFormData);

      if (!result.success) {
        const confirmError = result.error.issues.find(
          (issue) => issue.path[0] === "confirmPassword",
        );

        if (confirmError) {
          setErrors((previous) => ({
            ...previous,
            confirmPassword: confirmError.message,
          }));
        }
      } else {
        setErrors((previous) => ({
          ...previous,
          confirmPassword: "",
        }));
      }
    }
  }

  /* =========================
     SIGNUP
  ========================= */

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setToast("");

    const result = signupSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = {};

      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];

        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });

      setErrors(fieldErrors);

      return;
    }

    setErrors({});
    setLoading(true);

    try {
      // Create account
      await api.post("/auth/signup", result.data, { auth: false });

      // Send verification email (best-effort)
      try {
        await api.post(
          "/auth/email-verification-token",
          { email: result.data.email },
          { auth: false },
        );
      } catch (verificationError) {
        setMessage(
          verificationError.message ||
            "Account created, but verification email could not be sent.",
        );

        return;
      }

      // Complete success
      setFormData(defaultFormValue);

      setErrors({});

      setToast("Account created! Verification email sent.");

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1000);
    } catch (error) {
      if (error.errors) {
        setMessage(Object.values(error.errors).flat().join(" "));
      } else {
        setMessage(error.message || "Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="
        relative
        flex
        items-center
        justify-center
        bg-[#E5EEE4]
        px-4
        py-8
      "
    >
      <Toast message={toast} />

      <div
        className="
          container-shadow
          w-[400px]
          rounded-xl
          border
          border-[var(--color-border)]
          bg-white
          p-6
          sm:p-8
        "
      >
        {/* HEADING */}
        <div className="mb-7 text-center">
          <p className="mb-1 text-sm font-medium text-[var(--color-primary)]">
            Get started
          </p>

          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Create Account
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
            Create your account and get started with RoleBase.
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <TextField
            id="name"
            name="name"
            label="Name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            error={errors.name}
          />

          <TextField
            id="email"
            name="email"
            type="email"
            label="Email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            error={errors.email}
          />

          <PasswordField
            id="password"
            name="password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            error={errors.password}
          />

          <PasswordField
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            error={errors.confirmPassword}
          />

          {/* SIGNUP BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="
              btn-primary
              w-full
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span
                  className="
                    h-4
                    w-4
                    animate-spin
                    rounded-full
                    border-2
                    border-white
                    border-t-transparent
                  "
                />
                Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>

          {/* BACKEND ERROR */}
          {message && (
            <p className="text-center text-sm text-[var(--color-danger)]">
              {message}
            </p>
          )}

          {/* LOGIN */}
          <p className="text-center text-sm text-[var(--color-text-secondary)]">
            Already have an account?{" "}
            <a
              href="/login"
              className="
                font-semibold
                text-[var(--color-primary)]
                hover:text-[var(--color-primary-hover)]
                hover:underline
              "
            >
              Login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
