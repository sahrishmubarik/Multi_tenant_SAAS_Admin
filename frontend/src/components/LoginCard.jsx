import { useState } from "react";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";

import {
  emailSchema,
  passwordSchema,
  loginSchema,
  // forgotPasswordSchema,
} from "@/validations/validation.js";

export default function LoginCard() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [Error, setError] = useState("");
  const [errors, setErrors] = useState("");
  const [toast, setToast] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /* =========================
     HANDLE INPUT CHANGE
  ========================= */

  function handleChange(event) {
    event.preventDefault();
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    /* =========================
       EMAIL FIELD VALIDATION
    ========================= */
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

    /* =========================
       PASSWORD FIELD VALIDATION
    ========================= */
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
    }

    // Clear old messages
    setError("");
    setMessage("");
  }

  /* =========================
     LOGIN
  ========================= */

  async function handleSubmit(event) {
    event.preventDefault();

    const result = loginSchema.safeParse(formData);

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

    setError("");
    setMessage("");
    setToast("");

    setLoading(true);

    try {
      const data = await api.post("/auth/login", result.data, { auth: false });

      /* =========================
         LOGIN SUCCESS
      ========================= */

      localStorage.setItem("token", data.token);

      setFormData({
        email: "",
        password: "",
      });

      // Show success toast
      setToast("Login successful!");

      /*
        Wait 1 second so the user can see
        the success toast before redirecting.
      */
      const invitationToken = sessionStorage.getItem("invitationToken");

      if (invitationToken) {
        navigate(
          `/accept-invitation?token=${encodeURIComponent(invitationToken)}`,
        );
        return;
      }

      navigate("/dashboard");
      setTimeout(() => {
        navigate("/dashboard", {
          replace: true,
        });
      }, 2000);
    } catch (error) {
      if (error.errors) {
        setError(Object.values(error.errors).flat().join(" "));
      } else {
        setError(error.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex items-center bg-[#E5EEE4] px-6 mt-4">
      {/* =========================
          SUCCESS TOAST
      ========================= */}

      {toast && (
        <div
          className="
            fixed
            right-6
            top-6
            z-50
            rounded-lg
            border
            border-[var(--color-success-border)]
            bg-[var(--color-success-bg)]
            px-5
            py-3
            text-sm
            font-medium
            text-[var(--color-success)]
            shadow-lg
          "
        >
          {toast}
        </div>
      )}

      <div
        className="
          container-shadow
          w-[370px]
          rounded-xl
          border border-[var(--color-border)]
          bg-white
          p-6
          sm:p-8
        "
      >
        {/* =========================
            HEADING
        ========================= */}

        <div className="mb-7 text-center">
          <p className="mb-1 text-sm font-medium text-[var(--color-primary)]">
            Welcome back
          </p>

          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Sign in to RoleBase
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
            Pick up where you left off.
          </p>
        </div>

        {/* =========================
            FORM
        ========================= */}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* =========================
              EMAIL
          ========================= */}

          <div>
            <label
              htmlFor="email"
              className="
                mb-2
                block
                text-sm
                font-medium
                text-[var(--color-text-primary)]
              "
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="
                h-10
                w-full
                rounded-lg
                border
                border-[var(--color-border)]
                bg-white
                px-3
                text-sm
                text-[var(--color-text-primary)]
                outline-none
                transition
                placeholder:text-[var(--color-text-muted)]
                focus:border-[var(--color-primary)]
                focus:ring-2
                focus:ring-[var(--color-primary-light)]
              "
            />
            {errors.email && (
              <p
                className="
                  mt-1
                  text-sm
                  text-[var(--color-danger)]
                "
              >
                {errors.email}
              </p>
            )}
          </div>

          {/* =========================
              PASSWORD
          ========================= */}

          <div>
            <label
              htmlFor="password"
              className="
                mb-2
                block
                text-sm
                font-medium
                text-[var(--color-text-primary)]
              "
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="
                  h-10
                  w-full
                  rounded-lg
                  border
                  border-[var(--color-border)]
                  bg-white
                  px-3
                  pr-12
                  text-sm
                  text-[var(--color-text-primary)]
                  outline-none
                  transition
                  placeholder:text-[var(--color-text-muted)]
                  focus:border-[var(--color-primary)]
                  focus:ring-2
                  focus:ring-[var(--color-primary-light)]
                "
              />

              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
                className="
                  absolute
                  cursor-pointer
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-sm
                  text-[var(--color-text-secondary)]
                  transition-colors
                  hover:text-[var(--color-primary)]
                "
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
            {errors.password && (
              <p
                className="
                  mt-1
                  text-sm
                  text-[var(--color-danger)]
                "
              >
                {errors.password}
              </p>
            )}
          </div>

          {/* =========================
              FORGOT PASSWORD
          ========================= */}

          <div className="text-right">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="
    cursor-pointer
    text-sm
    text-[var(--color-primary)]
    transition-colors
    hover:text-[var(--color-primary-hover)]
    hover:underline
  "
            >
              Forgot password?
            </button>
            {/* <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
              className="
                cursor-pointer
                text-sm
                text-[var(--color-primary)]
                transition-colors
                hover:text-[var(--color-primary-hover)]
                hover:underline
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {loading ? "Sending..." : "Forgot?"}
            </button> */}
          </div>

          {/* =========================
              LOGIN BUTTON
          ========================= */}
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
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
          {/* =========================
              ERROR / SUCCESS MESSAGE
          ========================= */}

          {(Error || message) && (
            <p
              className={`text-center text-sm ${
                Error
                  ? "text-[var(--color-danger)]"
                  : "text-[var(--color-success)]"
              }`}
            >
              {Error || message}
            </p>
          )}

          {/* =========================
              SIGNUP
          ========================= */}

          <p
            className="
              text-center
              text-sm
              text-[var(--color-text-secondary)]
            "
          >
            Don't have an account?{" "}
            <a
              href="/signup"
              className="
                font-semibold
                text-[var(--color-primary)]
                hover:text-[var(--color-primary-hover)]
                hover:underline
              "
            >
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
