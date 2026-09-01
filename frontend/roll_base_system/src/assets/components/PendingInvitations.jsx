
import { useEffect, useState } from "react";

function ConfirmRevokeModal({
  invitation,
  loading,
  onClose,
  onConfirm,
}) {
  if (!invitation) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

      <div className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-xl">

        {/* Heading */}
        <h2 className="text-[17px] font-semibold text-[#17181a]">
          Revoke invitation?
        </h2>

        {/* Description */}
        <p className="mt-2 text-[13px] leading-5 text-[#66686d]">
          Are you sure you want to revoke the invitation sent to{" "}
          <span className="font-medium text-[#252629]">
            {invitation.email}
          </span>
          ?
        </p>

        <p className="mt-2 text-[12px] text-[#8a8c91]">
          This action cannot be undone.
        </p>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-2">

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="
              rounded-[8px]
              border
              border-[var(--color-border)]
              bg-white
              px-4
              py-2
              text-[12px]
              font-medium
              text-[var(--color-text-secondary)]
              transition
              hover:bg-[var(--color-surface-alt)]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="
              rounded-[8px]
              bg-[var(--color-danger)]
              px-4
              py-2
              text-[12px]
              font-medium
              text-white
              transition
              hover:opacity-90
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading ? "Revoking..." : "Revoke"}
          </button>

        </div>
      </div>
    </div>
  );
}

export default function PendingInvitations({
  workspaceId,
}) {
  const [invitations, setInvitations] = useState([]);

  const [status, setStatus] = useState("PENDING");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [revokingId, setRevokingId] = useState(null);

  /*
   * Invitation that is waiting for confirmation.
   */
  const [selectedInvitation, setSelectedInvitation] =
    useState(null);

  /* =====================================================
     FETCH INVITATIONS
     ===================================================== */

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
          data.message ||
            "Failed to fetch invitations"
        );
      }

      console.log(
        "Invitation API response:",
        data
      );

      setInvitations(
        data.invitations || []
      );
    } catch (error) {
      console.error(
        "Invitation status error:",
        error
      );

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     REVOKE INVITATION
     ===================================================== */

  async function cancelInvitation(
    invitationId
  ) {
    const authToken =
      localStorage.getItem("token");

    try {
      if (!authToken) {
        setError(
          "Authorization token is required."
        );
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
          data.message ||
            "Failed to revoke invitation"
        );
      }

      /*
       * Remove from current list.
       */
      setInvitations((previous) =>
        previous.filter(
          (invitation) =>
            invitation.id !== invitationId
        )
      );

      /*
       * Close confirmation modal.
       */
      setSelectedInvitation(null);
    } catch (error) {
      console.error(
        "Revoke invitation error:",
        error
      );

      setError(error.message);
    } finally {
      setRevokingId(null);
    }
  }

  /* =====================================================
     STATUS CHANGE
     ===================================================== */

  function handleStatusChange(event) {
    setStatus(event.target.value);
  }

  /* =====================================================
     FETCH WHEN:
     - workspace changes
     - status changes
     ===================================================== */

  useEffect(() => {
    fetchInvitations();
  }, [workspaceId, status]);

  /* =====================================================
     TITLE
     ===================================================== */

  const getTitle = () => {
    if (status === "PENDING") {
      return "Pending invitations";
    }

    if (status === "ACCEPTED") {
      return "Accepted invitations";
    }

    return "Revoked invitations";
  };

  /* =====================================================
     DESCRIPTION
     ===================================================== */

  const getDescription = () => {
    if (status === "PENDING") {
      return "Invitations that are waiting for the recipient to accept.";
    }

    if (status === "ACCEPTED") {
      return "People who accepted an invitation to this workspace.";
    }

    return "Invitations that have been revoked.";
  };

  /* =====================================================
     EMPTY MESSAGE
     ===================================================== */

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
    <>
      <div className="mt-6 overflow-hidden rounded-[18px] border border-[#dededc] bg-white container-shadow">

        {/* =================================================
            HEADER
           ================================================= */}

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

            {/* STATUS DROPDOWN */}
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
                onChange={handleStatusChange}
                className="
                  rounded-[8px]
                  border
                  border-[#dededc]
                  bg-white
                  px-3
                  py-2
                  text-[12px]
                  font-medium
                  text-[#252629]
                  outline-none
                  focus:border-[var(--color-primary)]
                  focus:ring-2
                  focus:ring-[var(--color-primary-light)]
                "
              >
                <option value="PENDING">
                  Pending
                </option>

                <option value="ACCEPTED">
                  Accepted
                </option>

                <option value="REVOKED">
                  Revoked
                </option>
              </select>
            </div>

          </div>
        </div>

        {/* =================================================
            CONTENT
           ================================================= */}

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
          {!loading &&
            !error &&
            invitations.length === 0 && (
              <p className="text-[13px] text-[#77797e]">
                {getEmptyMessage()}
              </p>
            )}

          {/* Invitations */}
          {!loading &&
            !error &&
            invitations.length > 0 && (
              <div className="space-y-3">

                {invitations.map(
                  (invitation) => (
                    <div
                      key={invitation.id}
                      className="
                        flex
                        flex-col
                        gap-3
                        rounded-[10px]
                        border
                        border-[#e5e5e2]
                        px-4
                        py-3
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                      "
                    >

                      {/* EMAIL + STATUS */}
                      <div>

                        <p className="text-[13px] font-medium text-[#252629]">
                          {invitation.email}
                        </p>

                        <p className="mt-1 text-[12px] text-[#77797e]">
                          {invitation.status}
                        </p>

                      </div>

                      {/* PENDING ACTION */}
                      {status === "PENDING" && (
                        <button
                          type="button"
                          title="Revoke invitation"
                          disabled={
                            revokingId ===
                            invitation.id
                          }
                          onClick={() =>
                            setSelectedInvitation(
                              invitation
                            )
                          }
                          className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-[8px]
                            bg-white
                            text-[#77797e]
                            transition
                            hover:bg-red-50
                            hover:text-red-500
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                        >
                          {revokingId ===
                          invitation.id ? (
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
                  )
                )}

              </div>
            )}

        </div>
      </div>

      {/* =====================================================
          REVOKE CONFIRMATION MODAL
         ===================================================== */}

      <ConfirmRevokeModal
        invitation={selectedInvitation}
        loading={
          selectedInvitation
            ? revokingId ===
              selectedInvitation.id
            : false
        }
        onClose={() =>
          setSelectedInvitation(null)
        }
        onConfirm={() => {
          if (selectedInvitation) {
            cancelInvitation(
              selectedInvitation.id
            );
          }
        }}
      />
    </>
  );
}




// import { useEffect, useState } from "react";

// export default function PendingInvitations({ workspaceId }) {
//   const [invitations, setInvitations] = useState([]);
//   const [status, setStatus] = useState("PENDING");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [revokingId, setRevokingId] = useState(null);

//   const fetchInvitations = async () => {
//     if (!workspaceId) {
//       setError("No workspace selected.");
//       setLoading(false);
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");

//       const authToken = localStorage.getItem("token");

//       if (!authToken) {
//         setError("Authorization token is required.");
//         setLoading(false);
//         return;
//       }

//       const response = await fetch(
//         `/api/v1/workspace-invitation/status/${workspaceId}?status=${status}`,
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(
//           data.message || "Failed to fetch invitations"
//         );
//       }

//       console.log("API RESPONSE:", data);
//       console.log("INVITATIONS:", data.invitations);

//       setInvitations(data.invitations || []);
//     } catch (error) {
//       console.error("Invitation status error:", error);
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   async function cancelInvitation(invitationId) {
//     const authToken = localStorage.getItem("token");

//     try {
//       if (!authToken) {
//         setError("Authorization token is required.");
//         return;
//       }

//       setRevokingId(invitationId);
//       setError("");

//       const response = await fetch(
//         "/api/v1/workspace-invitation/revoke",
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             invitationId,
//           }),
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(
//           data.message || "Failed to revoke invitation"
//         );
//       }

//       // Remove revoked invitation from Pending list
//       setInvitations((prev) =>
//         prev.filter(
//           (invitation) => invitation.id !== invitationId
//         )
//       );
//     } catch (error) {
//       console.error("Revoke invitation error:", error);
//       setError(error.message);
//     } finally {
//       setRevokingId(null);
//     }
//   }

//   useEffect(() => {
//     fetchInvitations();
//   }, [workspaceId, status]);

//   const getTitle = () => {
//     if (status === "PENDING") {
//       return "Pending invitations";
//     }

//     if (status === "ACCEPTED") {
//       return "Accepted invitations";
//     }

//     return "Revoked invitations";
//   };

//   const getDescription = () => {
//     if (status === "PENDING") {
//       return "Invitations that are waiting for the recipient to accept.";
//     }

//     if (status === "ACCEPTED") {
//       return "People who accepted an invitation to this workspace.";
//     }

//     return "Invitations that have been revoked.";
//   };

//   const getEmptyMessage = () => {
//     if (status === "PENDING") {
//       return "No pending invitations.";
//     }

//     if (status === "ACCEPTED") {
//       return "No accepted invitations.";
//     }

//     return "No revoked invitations.";
//   };

//   return (
//     <div className="mt-6 overflow-hidden rounded-[18px] border border-[#dededc] bg-white container-shadow">

//       {/* Header */}
//       <div className="border-b border-[#e7e7e5] px-5 py-4">
//         <div className="flex items-center justify-between gap-4">

//           <div>
//             <h2 className="text-[15px] font-semibold text-[#17181a]">
//               {getTitle()}
//             </h2>

//             <p className="mt-1 text-[13px] text-[#66686d]">
//               {getDescription()}
//             </p>
//           </div>

//           {/* Status dropdown */}
//           <div>
//             <label
//               htmlFor="invitation-status"
//               className="sr-only"
//             >
//               Check invitation status
//             </label>

//             <select
//               id="invitation-status"
//               value={status}
//               onChange={(e) => setStatus(e.target.value)}
//               className="rounded-[8px] border border-[#dededc] bg-white px-3 py-2 text-[12px] font-medium text-[#252629] outline-none focus:border-[var(--color-primary)]"
//             >
//               <option value="PENDING">Pending</option>
//               <option value="ACCEPTED">Accepted</option>
//               <option value="REVOKED">Revoked</option>
//             </select>
//           </div>

//         </div>
//       </div>

//       {/* Content */}
//       <div className="px-5 py-5">

//         {/* Loading */}
//         {loading && (
//           <p className="text-[13px] text-[#77797e]">
//             Loading invitations...
//           </p>
//         )}

//         {/* Error */}
//         {error && (
//           <div className="rounded-[8px] bg-[var(--color-danger-bg)] px-3 py-2 text-[12px] text-[var(--color-danger)]">
//             {error}
//           </div>
//         )}

//         {/* Empty */}
//         {!loading && !error && invitations.length === 0 && (
//           <p className="text-[13px] text-[#77797e]">
//             {getEmptyMessage()}
//           </p>
//         )}

//         {/* Invitations */}
//         {!loading && !error && invitations.length > 0 && (
//           <div className="space-y-3">

//             {invitations.map((invitation) => (
//               <div
//                 key={invitation.id}
//                 className="flex flex-col gap-3 rounded-[10px] border border-[#e5e5e2] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
//               >

//                 {/* Email + status */}
//                 <div>
//                   <p className="text-[13px] font-medium text-[#252629]">
//                     {invitation.email}
//                   </p>

//                   <p className="mt-1 text-[12px] text-[#77797e]">
//                     {invitation.status}
//                   </p>
//                 </div>

//                 {/* Pending action */}
//                 {status === "PENDING" && (
//                   <button
//                     type="button"
//                     title="Revoke invitation"
//                     disabled={revokingId === invitation.id}
//                     onClick={() =>
//                       cancelInvitation(invitation.id)
//                     }
//                     className={`flex h-8 w-8 items-center justify-center rounded-[8px] text-2xl transition ${
//                       revokingId === invitation.id
//                         ? "cursor-not-allowed text-red-300 text-2xl"
//                         : " bg-white text-[#77797e] hover:bg-red-50 hover:text-red-500 text-2xl"
//                     }`}
//                   >
//                     {revokingId === invitation.id ? (
//                       <span className="text-[11px]">
//                         ...
//                       </span>
//                     ) : (
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         viewBox="0 0 24 24"
//                         fill="none"
//                         stroke="currentColor"
//                         strokeWidth="1.8"
//                         className="h-5 w-5"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           d="M6 7h12M9 7V5h6v2m-8 0 1 12h6l1-12M10 11v5m4-5v5"
//                         />
//                       </svg>
//                     )}
//                   </button>
//                 )}

//               </div>
//             ))}

//           </div>
//         )}
//       </div>
//     </div>
//   );
// }