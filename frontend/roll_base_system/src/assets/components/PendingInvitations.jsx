import { useEffect, useState } from "react";

export default function PendingInvitations({ workspaceId }) {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPendingInvitations = async () => {
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
        return;
      }

      const response = await fetch(
        `/api/v1/workspace-invitation/status/${workspaceId}?status=PENDING`,
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
          data.message || "Failed to fetch pending invitations"
        );
      }

      setInvitations(data.member || []);
    } catch (error) {
      console.error("Pending invitations error:", error);
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

    // Remove revoked invitation from UI
    setInvitations((prev) =>
      prev.filter(
        (invitation) => invitation.id !== invitationId
      )
    );

  } catch (error) {
    console.log("Revoke invitation error:", error);
    setError(error.message);
  }
}

  useEffect(() => {
    fetchPendingInvitations();
  }, [workspaceId]);

  
  return (
    <div className="mt-6 overflow-hidden rounded-[18px] border border-[#dededc] bg-white container-shadow">
      <div className="border-b border-[#e7e7e5] px-5 py-4">
        <h2 className="text-[15px] font-semibold text-[#17181a]">
          Pending invitations
        </h2>

        <p className="mt-1 text-[13px] text-[#66686d]">
          Invitations that are waiting for the recipient to accept.
        </p>
      </div>

      <div className="px-5 py-5">
        {loading && (
          <p className="text-[13px] text-[#77797e]">
            Loading invitations...
          </p>
        )}

        {error && (
          <div className="rounded-[8px] bg-[var(--color-danger-bg)] px-3 py-2 text-[12px] text-[var(--color-danger)]">
            {error}
          </div>
        )}

        {!loading && !error && invitations.length === 0 && (
          <p className="text-[13px] text-[#77797e]">
            No pending invitations.
          </p>
        )}

        {!loading && invitations.length > 0 && (
          <div className="space-y-3">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex flex-col gap-3 rounded-[10px] border border-[#e5e5e2] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-[13px] font-medium text-[#252629]">
                    {invitation.email}
                  </p>

                  <p className="mt-1 text-[12px] text-[#77797e]">
                    {invitation.status}
                  </p>
                </div>
                 <div className="flex justify-end gap-2">
                     <button
                            type="button"
                          onClick={() => cancelInvitation(invitation.id)}
                            className="rounded-[8px] border border-[var(--color-border)] bg-white px-3 py-1.5 text-[12px] font-medium text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                          >Cancel invitation
                          </button>
                      <button
                            type="button"
                           
                            className= "bg-white px-3 py-1.5 text-[12px] font-medium text-[var(--color-text-secondary)] "
                          >Pending
                          </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}