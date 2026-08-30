import { useState } from "react";
// Import the core React component
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSearchParams, useNavigate } from "react-router-dom";
import AuthHeader from "../assets/components/AuthHeader";
import { resetPasswordSchema } from "../validations/validation"
export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");

    /* ZOD VALIDATION */
    
        const result = resetPasswordSchema.safeParse(formData);
    
        if (!result.success) {
          const errorMessages = result.error.issues.map(
            (issue) => issue.message
          );
    
          setMessage(errorMessages.join(" "));
          return;
        }
    if (!token) {
      setMessage("Password reset token is required.");
      return;
    }

    if (!formData.password || !formData.confirmPassword) {
      setMessage("Please fill in both password fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
         `/api/v1/auth/reset-password?token=${encodeURIComponent(token)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            new_password: formData.password,
            confirm_password: formData.confirmPassword,
          }),
        },
      );

      // const data = await response.json();

      // console.log("Reset password response:", JSON.stringify(data, null, 2));

      // console.log("Status:", response.status);
      const text = await response.text();

console.log("Status:", response.status);
console.log("Response body:", text);

      if (!response.ok) {
        console.log("Reset password response:", text);
        console.log("Status:", response.status);

        setMessage(text.message || `Reset failed (${response.status})`);
        return;
      }

      setMessage("Password reset successfully!");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (error) {
      console.log("Reset password error:", error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
       
     <>
         <div className="min-h-screen bg-[#E5EEE4]">
      <AuthHeader />
    
      <main className="flex justify-center pt-8">
      
    <div className="flex items-center justify-center bg-[#E5EEE4] px-4 py-8">
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
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Reset Password
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
            Create a new password for your account.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          /* New Password */
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
            >
              New Password
            </label>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter new password"
                className="
                  h-10 w-full
                  rounded-lg
                  border border-[var(--color-border)]
                  bg-white
                  px-3 pr-16
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
                  absolute right-3 top-1/2
                  -translate-y-1/2
                  text-xs font-semibold
                  text-[var(--color-text-secondary)]
                transition-colors
                hover:text-[var(--color-primary)]
                "
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
            >
              Confirm Password
            </label>

            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                className="
                  h-10 w-full
                  rounded-lg
                  border border-[var(--color-border)]
                  bg-white
                  px-3 pr-16
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
                onClick={() => setShowConfirmPassword((previous) => !previous)}
                className="
                  absolute right-3 top-1/2
                  -translate-y-1/2
                  text-xs font-semibold
                  text-[var(--color-text-secondary)]
                transition-colors
                hover:text-[var(--color-primary)]
                "
              >
                <FontAwesomeIcon
                  icon={showConfirmPassword ? faEyeSlash : faEye}
                />
              </button>
            </div>
          </div>

          {/* Message */}
          {message && (
            <p
              className="
                rounded-lg
                bg-[var(--color-danger-bg)]
                px-3 py-2
                text-center text-sm
                text-[var(--color-danger)]
              "
            >
              {message}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {/* Login */}
        <div className="mt-6 text-center">
          <a
            href="/login"
            className="
              text-sm font-medium
              text-[var(--color-primary)]
              transition-colors
              hover:text-[var(--color-primary-hover)]
            "
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
      </main>
    </div>
    </>
  );
}
