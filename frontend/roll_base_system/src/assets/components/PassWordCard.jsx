import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function PasswordCard() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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

    // Frontend validation
    if (
      !formData.currentPassword ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setMessage("Please fill in all password fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("New password and confirm password do not match.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:3000/api/v1/auth/change-password",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            old_password: formData.currentPassword,
            new_password: formData.password,
            confirm_password: formData.confirmPassword,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to change password.");
        return;
      }

      setMessage(data.message || "Password changed successfully.");

      setFormData({
        currentPassword: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Change password error:", error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 overflow-hidden rounded-[18px] border border-[#dededc] bg-white container-shadow">
      <div className="border-b border-[#e7e7e5] px-5 py-4">
        <h2 className="text-[15px] font-semibold text-[#17181a]">Password</h2>

        <p className="mt-1 text-[13px] text-[#66686d]">
          Update your password to keep your account secure.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 px-5 py-5">
        {/* Current Password */}
        <div>
          <label
            htmlFor="currentPassword"
            className="mb-2 block text-[13px] font-medium text-[#252629]"
          >
            Current password
          </label>

          <div className="relative">
            <input
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              type={showCurrentPassword ? "text" : "password"}
              className="
                h-10
                w-full
                rounded-[9px]
                border border-[#dfdfdb]
                px-3 pr-11
                text-[14px]
                outline-none
                transition
                focus:border-[#aeb0b5]
                focus:ring-2
                focus:ring-[#eeeeec]
              "
            />

            <button
              type="button"
              onClick={() => setShowCurrentPassword((previous) => !previous)}
              className="
                absolute right-3 top-1/2
                -translate-y-1/2
                text-[var(--color-text-secondary)]
                transition-colors
                hover:text-[var(--color-primary)]
               
               
              "
              aria-label={
                showCurrentPassword
                  ? "Hide current password"
                  : "Show current password"
              }
            >
              <FontAwesomeIcon
                icon={showCurrentPassword ? faEyeSlash : faEye}
              />
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-[13px] font-medium text-[#252629]"
          >
            New password
          </label>

          <div className="relative">
            <input
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              type={showNewPassword ? "text" : "password"}
              className="
                h-10
                w-full
                rounded-[9px]
                border border-[#dfdfdb]
                px-3 pr-11
                text-[14px]
                outline-none
                transition
                focus:border-[#aeb0b5]
                focus:ring-2
                focus:ring-[#eeeeec]
              "
            />

            <button
              type="button"
              onClick={() => setShowNewPassword((previous) => !previous)}
              className="
                absolute right-3 top-1/2
                -translate-y-1/2
                 text-[var(--color-text-secondary)]
                transition-colors
                hover:text-[var(--color-primary)]
              "
              aria-label={
                showNewPassword ? "Hide new password" : "Show new password"
              }
            >
              <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-[13px] font-medium text-[#252629]"
          >
            Confirm new password
          </label>

          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              type={showConfirmPassword ? "text" : "password"}
              className="
                h-10
                w-full
                rounded-[9px]
                border border-[#dfdfdb]
                px-3 pr-11
                text-[14px]
                outline-none
                transition
                focus:border-[#aeb0b5]
                focus:ring-2
                focus:ring-[#eeeeec]
              "
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword((previous) => !previous)}
              className="
                absolute right-3 top-1/2
                -translate-y-1/2
                 text-[var(--color-text-secondary)]
                transition-colors
                hover:text-[var(--color-primary)]
              "
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >
              <FontAwesomeIcon
                icon={showConfirmPassword ? faEyeSlash : faEye}
              />
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <p className="rounded-lg bg-[#fef2f2] px-3 py-2 text-center text-sm text-[var(--color-danger)]">
            {message}
          </p>
        )}

        {/* Submit */}
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={loading}
            className="
              btn-primary
              px-4 py-2
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading ? "Changing..." : "Change password"}
          </button>
        </div>
      </form>
    </div>
  );
}
