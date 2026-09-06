import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPasswordSchema } from "../../validations/validation.js";

export default function ForgotPasswordCard() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setToast("");

    // Validate email
    const result = forgotPasswordSchema.safeParse({
      email,
    });

    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/v1/auth/forget-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset email");
      }

      // Show success toast immediately
      setToast("Reset link sent to your email!");

      // Clear input
      setEmail("");

      // Hide toast after 2 seconds
      setTimeout(() => {
        setToast("");
      }, 2000);
    } catch (error) {
      console.error("Forgot password error:", error);

      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#E5EEE4] flex items-center justify-center px-4">
      {/* Toast */}
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

      {/* Card */}
      <div
        className="
          container-shadow
          w-full
          max-w-[420px]
          rounded-xl
          bg-white
          px-8
          py-9
        "
      >
        {/* Header */}
        <div className="mb-7 text-center">
          <h1
            className="
              text-2xl
              font-semibold
              text-[var(--color-text-primary)]
            "
          >
            Forgot Password?
          </h1>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-[var(--color-text-secondary)]
            "
          >
            Enter your email address and we will send you a password reset link.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="
              mb-5
              rounded-lg
              border
              border-[var(--color-danger-border)]
              bg-[var(--color-danger-bg)]
              px-4
              py-3
              text-sm
              text-[var(--color-danger)]
            "
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
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
              Email address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              placeholder="Enter your email"
              disabled={loading}
              className="
                w-full
                rounded-lg
                border
                border-[var(--color-border)]
                px-4
                py-3
                text-sm
                text-[var(--color-text-primary)]
                outline-none
                transition
                placeholder:text-[var(--color-text-muted)]
                focus:border-[var(--color-primary)]
                focus:ring-2
                focus:ring-[var(--color-primary-light)]
                disabled:cursor-not-allowed
                disabled:bg-[var(--color-surface-alt)]
              "
            />
          </div>

          {/* Submit */}
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
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="
              cursor-pointer
              text-sm
              font-medium
              text-[var(--color-primary)]
              transition-colors
              hover:text-[var(--color-primary-hover)]
              hover:underline
            "
          >
            Back to Login
          </button>
        </div>
      </div>
    </main>
  );
}
