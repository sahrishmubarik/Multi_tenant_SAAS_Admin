import { useState } from "react";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

import {
  loginSchema,
  forgotPasswordSchema,
} from "../../validations/validation.js";

export default function LoginCard() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [Error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /* =========================
     HANDLE INPUT CHANGE
  ========================= */

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setMessage("");
  }

  /* =========================
     LOGIN
  ========================= */

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    /* ZOD VALIDATION */

    const result = loginSchema.safeParse(formData);
    console.log(result)
    if (!result.success) {
      const errorMessages = result.error.issues.map(
        (issue) => issue.message
      );

      setError(errorMessages.join(" "));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result.data),
      });

      const data = await response.json();
      console.log("Response status:", response.status);
      console.log("Response body:", data);
      if (!response.ok) {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();

          setError(errorMessages.join(" "));
        } else if (data.message) {
          setError(data.message);
        } else {
          setError("Login failed. Please try again.");
        }

        return;
      }

      /* Save JWT */

      localStorage.setItem("token", data.token);

      setMessage("Login successful!");

      setFormData({
        email: "",
        password: "",
      });

      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Login error:", {error});

      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* =========================
     FORGOT PASSWORD
  ========================= */

  async function handleForgotPassword(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    /* Validate only email */

    const result = forgotPasswordSchema.safeParse({
      email: formData.email,
    });

    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/v1/auth/forget-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(result.data),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Something went wrong."
        );
        return;
      }

      setMessage("Reset link sent to your email!");
    } catch (error) {
      console.error("Forgot password error:", {error});

      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center bg-[#E5EEE4] px-6 mt-4">
      <div
        className="
          container-shadow
          w-full max-w-md
          rounded-xl
          border border-[var(--color-border)]
          bg-white
          p-6
          sm:p-8
        "
      >

        {/* Heading */}

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

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* Email */}

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
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
                h-10 w-full
                rounded-lg
                border border-[var(--color-border)]
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
          </div>

          {/* Password */}

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
            >
              Password
            </label>

            <div className="relative">

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="
                  h-10 w-full
                  rounded-lg
                  border border-[var(--color-border)]
                  bg-white
                  px-3 pr-12
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
                onClick={() =>
                  setShowPassword(
                    (previous) => !previous
                  )
                }
                className="
                  absolute right-3 top-1/2
                  -translate-y-1/2
                  text-sm
                  text-[var(--color-text-secondary)]
                  transition-colors
                  hover:text-[var(--color-primary)]
                "
              >
                <FontAwesomeIcon
                  icon={
                    showPassword
                      ? faEyeSlash
                      : faEye
                  }
                />
              </button>

            </div>
          </div>

          {/* Forgot Password */}

          <div className="text-right">

            <button
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
              {loading
                ? "Sending..."
                : "Forgot?"}
            </button>

          </div>

          {/* Login Button */}

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
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

          {/* Message */}

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

          {/* Signup */}

          <p className="text-center text-sm text-[var(--color-text-secondary)]">
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