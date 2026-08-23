import { useState } from "react";

export default function InviteMemberCard({
  workspaceId,
  onInvitationSent,
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
  `http://localhost:3000/api/v1/workspace/invitation/${workspaceId}`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      email,
    }),
  },
);

const data = await response.json();
     

      if (!response.ok) {
        throw new Error(data.message || "Failed to send invitation");
      }

      setMessage("Invitation sent successfully.");
      setEmail("");

      onInvitationSent();
    } catch (error) {
      console.error("Invitation error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 overflow-hidden rounded-[18px] border border-[#dededc] bg-white container-shadow">
      <div className="border-b border-[#e7e7e5] px-5 py-4">
        <h2 className="text-[15px] font-semibold text-[#17181a]">
          Invite someone
        </h2>

        <p className="mt-1 text-[13px] text-[#66686d]">
          Send an invitation to someone who does not have access yet.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label className="mb-2 block text-[13px] font-medium text-[#252629]">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="member@example.com"
            className="h-10 w-full rounded-[9px] border border-[#dfdfdb] bg-white px-3 text-[14px] text-[#252629] outline-none transition placeholder:text-[#aaa] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary px-5 text-[13px]"
        >
          {loading ? "Sending..." : "Send invitation"}
        </button>
      </form>

      {(error || message) && (
        <div className="px-5 pb-5">
          {error && (
            <div className="rounded-[8px] bg-[var(--color-danger-bg)] px-3 py-2 text-[12px] text-[var(--color-danger)]">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-[8px] bg-[var(--color-success-bg)] px-3 py-2 text-[12px] text-[var(--color-success)]">
              {message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}