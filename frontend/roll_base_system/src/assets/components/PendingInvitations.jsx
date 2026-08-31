import { useEffect, useState } from "react";

export default function PendingInvitations({ workspaceId }) {
  const [invitations, setInvitations] = useState([]);
  const [status, setStatus] = useState("PENDING");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revokingId, setRevokingId] = useState(null);

  const fetchInvitations = async () => {
    if (!workspaceId) {
      setError("No workspace selected.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const authToken = localStorage.getItem("token");

      if (!authToken) {
        setError("Authorization token is required.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `/api/v1/workspace-invitation/status/${workspaceId}?status=${status}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch invitations"
        );
      }

      console.log("API RESPONSE:", data);
      console.log("INVITATIONS:", data.invitations);

      setInvitations(data.invitations || []);
    } catch (error) {
      console.error("Invitation status error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  async function cancelInvitation(invitationId) {
    const authToken = localStorage.getItem("token");

    try {
      if (!authToken) {
        setError("Authorization token is required.");
        return;
      }

      setRevokingId(invitationId);
      setError("");

      const response = await fetch(
        "/api/v1/workspace-invitation/revoke",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            invitationId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to revoke invitation"
        );
      }

      // Remove revoked invitation from Pending list
      setInvitations((prev) =>
        prev.filter(
          (invitation) => invitation.id !== invitationId
        )
      );
    } catch (error) {
      console.error("Revoke invitation error:", error);
      setError(error.message);
    } finally {
      setRevokingId(null);
    }
  }

  useEffect(() => {
    fetchInvitations();
  }, [workspaceId, status]);

  const getTitle = () => {
    if (status === "PENDING") {
      return "Pending invitations";
    }

    if (status === "ACCEPTED") {
      return "Accepted invitations";
    }

    return "Revoked invitations";
  };

  const getDescription = () => {
    if (status === "PENDING") {
      return "Invitations that are waiting for the recipient to accept.";
    }

    if (status === "ACCEPTED") {
      return "People who accepted an invitation to this workspace.";
    }

    return "Invitations that have been revoked.";
  };

  const getEmptyMessage = () => {
    if (status === "PENDING") {
      return "No pending invitations.";
    }

    if (status === "ACCEPTED") {
      return "No accepted invitations.";
    }

    return "No revoked invitations.";
  };

  return (
    <div className="mt-6 overflow-hidden rounded-[18px] border border-[#dededc] bg-white container-shadow">

      {/* Header */}
      <div className="border-b border-[#e7e7e5] px-5 py-4">
        <div className="flex items-center justify-between gap-4">

          <div>
            <h2 className="text-[15px] font-semibold text-[#17181a]">
              {getTitle()}
            </h2>

            <p className="mt-1 text-[13px] text-[#66686d]">
              {getDescription()}
            </p>
          </div>

          {/* Status dropdown */}
          <div>
            <label
              htmlFor="invitation-status"
              className="sr-only"
            >
              Check invitation status
            </label>

            <select
              id="invitation-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-[8px] border border-[#dededc] bg-white px-3 py-2 text-[12px] font-medium text-[#252629] outline-none focus:border-[var(--color-primary)]"
            >
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REVOKED">Revoked</option>
            </select>
          </div>

        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-5">

        {/* Loading */}
        {loading && (
          <p className="text-[13px] text-[#77797e]">
            Loading invitations...
          </p>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-[8px] bg-[var(--color-danger-bg)] px-3 py-2 text-[12px] text-[var(--color-danger)]">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && invitations.length === 0 && (
          <p className="text-[13px] text-[#77797e]">
            {getEmptyMessage()}
          </p>
        )}

        {/* Invitations */}
        {!loading && !error && invitations.length > 0 && (
          <div className="space-y-3">

            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex flex-col gap-3 rounded-[10px] border border-[#e5e5e2] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >

                {/* Email + status */}
                <div>
                  <p className="text-[13px] font-medium text-[#252629]">
                    {invitation.email}
                  </p>

                  <p className="mt-1 text-[12px] text-[#77797e]">
                    {invitation.status}
                  </p>
                </div>

                {/* Pending action */}
                {status === "PENDING" && (
                  <button
                    type="button"
                    title="Revoke invitation"
                    disabled={revokingId === invitation.id}
                    onClick={() =>
                      cancelInvitation(invitation.id)
                    }
                    className={`flex h-8 w-8 items-center justify-center rounded-[8px] text-2xl transition ${
                      revokingId === invitation.id
                        ? "cursor-not-allowed text-red-300 text-2xl"
                        : " bg-white text-[#77797e] hover:bg-red-50 hover:text-red-500 text-2xl"
                    }`}
                  >
                    {revokingId === invitation.id ? (
                      <span className="text-[11px]">
                        ...
                      </span>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 7h12M9 7V5h6v2m-8 0 1 12h6l1-12M10 11v5m4-5v5"
                        />
                      </svg>
                    )}
                  </button>
                )}

              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
}