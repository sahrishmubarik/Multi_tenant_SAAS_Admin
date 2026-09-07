import { useState } from "react";
import { emailSchema, invitationSchema } from "@/validations/validation.js";
import { api } from "@/services/api";

export default function InviteMemberCard({
  workspaceId,
  onInvitationSent,
  onShowToast,
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Field-level validation errors
  const [errors, setErrors] = useState({});

  /* =========================
     HANDLE INPUT CHANGE
  ========================= */

  function handleChange(event) {
    const { value } = event.target;

    // Email is a string, so store the value directly
    setEmail(value);

    /* =========================
       EMAIL FIELD VALIDATION
    ========================= */

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

    // Clear old backend messages
    setError("");
    setMessage("");
  }

  /* =========================
     SEND INVITATION
  ========================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    /* =========================
       VALIDATE FORM
    ========================= */

    const result = invitationSchema.safeParse({
      email,
    });

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

    setLoading(true);
    setMessage("");
    setError("");

    try {
      await api.post(`/workspace-invitation/${workspaceId}`, {
        email: result.data.email,
      });

      /* =========================
         SUCCESS
      ========================= */

      setMessage("Invitation sent successfully.");

      setEmail("");

      setErrors({
        email: "",
      });
      setTimeout(() => {
        setMessage("");
      }, 2000);
      onShowToast("Member invited successfully!");
      onInvitationSent();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 overflow-hidden rounded-[18px] border border-[#dededc] bg-white container-shadow">
      {/* =========================
          HEADER
      ========================= */}

      <div className="border-b border-[#e7e7e5] px-5 py-4">
        <h2 className="text-[15px] font-semibold text-[#17181a]">
          Invite someone
        </h2>

        <p className="mt-1 text-[13px] text-[#66686d]">
          Send an invitation to someone who does not have access yet.
        </p>
      </div>

      {/* =========================
          FORM
      ========================= */}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label
            htmlFor="email"
            className="mb-2 block text-[13px] font-medium text-[#252629]"
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            placeholder="member@example.com"
            className="
              h-10
              w-full
              rounded-[9px]
              border
              border-[#dfdfdb]
              bg-white
              px-3
              text-[14px]
              text-[#252629]
              outline-none
              transition
              placeholder:text-[#aaa]
              focus:border-[var(--color-primary)]
              focus:ring-2
              focus:ring-[var(--color-primary-light)]
            "
          />

          {/* =========================
              EMAIL VALIDATION ERROR
          ========================= */}

          {errors.email && (
            <p
              className="
                mt-1
                text-sm
                text-[var(--color-danger)]
                mb-7
              "
            >
              {errors.email}
            </p>
          )}
        </div>

        {/* =========================
            SEND INVITATION BUTTON
        ========================= */}

        <button
          type="submit"
          disabled={loading}
          className="
            btn-primary
            px-5
            text-[13px]
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
              Sending invitation...
            </span>
          ) : (
            "Send invitation"
          )}
        </button>
      </form>

      {/* =========================
          ERROR / SUCCESS MESSAGE
      ========================= */}

      {(error || message) && (
        <div className="px-5 pb-5">
          {error && (
            <div
              className="
                rounded-[8px]
                bg-[var(--color-danger-bg)]
                px-3
                py-2
                text-[12px]
                text-[var(--color-danger)]
              "
            >
              {error}
            </div>
          )}

          {message && (
            <div
              className="
                rounded-[8px]
                bg-[var(--color-success-bg)]
                px-3
                py-2
                text-[12px]
                text-[var(--color-success)]
              "
            >
              {message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
