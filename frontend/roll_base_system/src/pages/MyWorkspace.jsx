import { useEffect, useState } from "react";
import { useWorkspace } from "../assets/context/WorkspaceContext";
import { workspaceNameSchema } from  "../validations/validation.js"
export default function MyWorkspace() {
const {
  selectedWorkspace,
  setSelectedWorkspace,
  removeWorkspace,
} = useWorkspace();

  const [formData, setFormData] = useState({
    workspaceName: "",
  });
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [showTransferModal, setShowTransferModal] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [newOwnerId, setNewOwnerId] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [deleting, setDeleting] = useState(false);

/* Set current workspace name in input */
useEffect(() => {
  if (selectedWorkspace) {
    setFormData({
      workspaceName: selectedWorkspace.workspaceName || "",
    });
  } else {
    setFormData({
      workspaceName: "",
    });
  }
}, [selectedWorkspace]);
  /* get workspace */
  // useEffect(() => {
  //   async function getWorkspace() {
  //     const token = localStorage.getItem("token");

  //     try {
  //       const response = await fetch(
  //         "/api/v1/workspace/my-workspaces",
  //         {
  //           method: "GET",
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         },
  //       );

  //       const data = await response.json();

  //       if (!response.ok) {
  //         setMessage(data.message || "Failed to get workspace.");
  //         setMessageType("error");
  //         return;
  //       }
  //       const savedWorkspaceId = localStorage.getItem("workspaceId");

  //       const currentWorkspace =
  //         data.workspaces?.find(
  //           (workspace) => workspace.workspaceId === savedWorkspaceId,
  //         ) || data.workspaces?.[0];

  //       if (!currentWorkspace) {
  //         setMessage("No workspace found.");
  //         setMessageType("error");
  //         return;
  //       }

  //       localStorage.setItem("workspaceId", currentWorkspace.workspaceId);

  //       setWorkspace(currentWorkspace);

  //       setFormData({
  //         workspaceName: currentWorkspace.workspaceName,
  //       });
  //     } catch (error) {
  //       console.log("Get workspace error:", error);

  //       setMessage("Something went wrong.");
  //       setMessageType("error");
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  //   getWorkspace();
  // }, []);

  /* admin get */
  // useEffect(() => {
  //   async function getAdmins() {
  //     if (!workspace?.workspaceId) {
  //       return;
  //     }

  //     // Only owner needs transfer ownership data
  //     if (workspace.role !== "owner") {
  //       return;
  //     }

  //     const token = localStorage.getItem("token");

  //     try {
  //       const response = await fetch(
  //         `/api/v1/workspace/${workspace.workspaceId}/members`,
  //         {
  //           method: "GET",
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         },
  //       );

  //       const data = await response.json();

  //       if (!response.ok) {
  //         setMessage(data.message || "Failed to get workspace members.");
  //         setMessageType("error");
  //         return;
  //       }

  //       // Only admins can become owner
  //       const adminMembers = data.member?.filter(
  //         (member) => member.role === "admin",
  //       );
  //       console.log(adminMembers);
  //       setAdmins(adminMembers || []);
        
  //     } catch (error) {
  //       console.error("Get admins error:", error);

  //       setMessage("Failed to load workspace admins.");
  //       setMessageType("error");
  //     }
  //   }

  //   getAdmins();
  // }, [workspace]);
  useEffect(() => {
  async function getAdmins() {
    if (!selectedWorkspace?.workspaceId) {
      setAdmins([]);
      return;
    }

    if (selectedWorkspace.role !== "owner") {
      setAdmins([]);
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `/api/v1/workspace/${selectedWorkspace.workspaceId}/members`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to get workspace members."
        );
        setMessageType("error");
        return;
      }

      const adminMembers = data.member?.filter(
        (member) => member.role === "admin"
      );

      setAdmins(adminMembers || []);
    } catch (error) {
      console.error("Get admins error:", error);

      setMessage("Failed to load workspace admins.");
      setMessageType("error");
    }
  }

  getAdmins();
}, [selectedWorkspace]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setMessageType("");
  }

  /* update workspace name */
  async function handleSubmit(event) {
    event.preventDefault();
    
     const result = workspaceNameSchema.safeParse(formData);
    
        if (!result.success) {
          const errorMessages = result.error.issues.map(
            (issue) => issue.message
          );
    
          setMessage(errorMessages.join(" "));
          return;
        }
    if (selectedWorkspace?.role !== "owner") {
      return;
    }

    const token = localStorage.getItem("token");
    const workspaceId = selectedWorkspace?.workspaceId;

    if (!workspaceId) {
      setMessage("Workspace not found.");
      setMessageType("error");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/v1/workspace/update/${workspaceId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            workspaceName: formData.workspaceName,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to change workspace name.");
        setMessageType("error");
        return;
      }

      setMessage(data.message || "Workspace name changed successfully.");

      setMessageType("success");

       setSelectedWorkspace((previous) => ({
        ...previous,
        workspaceName: formData.workspaceName,
      }));
    } catch (error) {
      console.log("Update workspace error:", error);

      setMessage("Something went wrong.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }
  /* TRANSFER OWNERSHIP */
//   async function handleTransferOwnership(event) {
//     event.preventDefault();

//     if (selectedWorkspace?.role !== "owner") {
//       return;
//     }

//     if (!newOwnerId) {
//       setMessage("Please select a new owner.");
//       setMessageType("error");
//       return;
//     }

//     console.log("Before transfer:", {
//   workspaceId: selectedWorkspace.workspaceId,
//   newOwnerId,
//   admins,
// });
//     const selectedAdmin = admins.find((admin) => admin.user_Id === newOwnerId);

//     const confirmed = window.confirm(
//       `Are you sure you want to transfer ownership to ${selectedAdmin?.memberName}?`,
//     );

//     if (!confirmed) {
//       return;
//     }

//     const token = localStorage.getItem("token");

//     setTransferring(true);
//     setMessage("");

//     try {
//       const response = await fetch(
//          `/api/v1/workspace/transfer-ownership/${selectedWorkspace.workspaceId}`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({
//             newOwnerId: newOwnerId,
//           }),
//         },
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         setMessage(data.message || "Failed to transfer ownership.");
//         setMessageType("error");
//         return;
//       }

//       setMessage(data.message || "Ownership transferred successfully.");

//       setMessageType("success");

//       /*
//        * Current user is no longer owner.
//        * Backend should change old owner -> admin.
//        */
//   setSelectedWorkspace((previous) => ({
//         ...previous,
//         role: "admin",
//       }));

//       setNewOwnerId("");
//       setAdmins([]);
//     } catch (error) {
//       console.error("Transfer ownership error:", {error});

//       setMessage("Something went wrong.");
//       setMessageType("error");
//     } finally {
//       setTransferring(false);
//     }
//   }

async function handleTransferOwnership(event) {
  event.preventDefault();

  if (selectedWorkspace?.role !== "owner") {
    return;
  }

  if (!newOwnerId) {
    setMessage("Please select a new owner.");
    setMessageType("error");
    return;
  }

  const token = localStorage.getItem("token");

  setTransferring(true);
  setMessage("");

  try {
    const response = await fetch(
      `/api/v1/workspace/transfer-ownership/${selectedWorkspace.workspaceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          newOwnerId: newOwnerId,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Failed to transfer ownership.");
      setMessageType("error");
      return;
    }

    setMessage(data.message || "Ownership transferred successfully.");
    setMessageType("success");

    setSelectedWorkspace((previous) => ({
      ...previous,
      role: "admin",
    }));

    setNewOwnerId("");
    setAdmins([]);
    setShowTransferModal(false);
  } catch (error) {
    console.error("Transfer ownership error:", error);

    setMessage("Something went wrong.");
    setMessageType("error");
  } finally {
    setTransferring(false);
  }
}
  /* Delete workspace */
  async function handleDeleteWorkspace() {
    if (selectedWorkspace?.role !== "owner") {
      return;
    }

    const token = localStorage.getItem("token");

    setDeleting(true);
    setMessage("");

    try {
      const response = await fetch("/api/v1/workspace", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workspaceId: selectedWorkspace.workspaceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to delete workspace.");
        setMessageType("error");
        return;
      }

      setMessage(data.message || "Workspace deleted successfully.");

      setMessageType("success");

     removeWorkspace(selectedWorkspace.workspaceId);

setFormData({
  workspaceName: "",
});
    } catch (error) {
      console.log("Delete workspace error:", error);

      setMessage("Something went wrong.");
      setMessageType("error");
    } finally {
      setDeleting(false);
    }
  }

  /* leave workspace */
  async function handleLeaveWorkspace() {
    if (selectedWorkspace?.role === "owner") {
      setMessage("Workspace owner cannot leave. Transfer ownership first.");
      setMessageType("error");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to leave this workspace?",
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("token");
    const workspaceId = selectedWorkspace?.workspaceId;

    if (!workspaceId) {
      setMessage("Workspace not found.");
      setMessageType("error");
      return;
    }

    try {
      const response = await fetch(
        `/api/v1/workspace/leave/${workspaceId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to leave workspace.");
        setMessageType("error");
        return;
      }

      setMessage(data.message || "You have left the workspace successfully.");
      setMessageType("success");

      // Remove workspace from current page
    removeWorkspace(selectedWorkspace.workspaceId);

setFormData({
  workspaceName: "",
});
    } catch (error) {
      console.error("Leave workspace error:", error);

      setMessage("Something went wrong.");
      setMessageType("error");
    }
  }

  // if (loading) {
  //   return (
  //     <main className="min-h-screen bg-[#f4f7f4] px-6 py-10">
  //       <div className="mx-auto max-w-[825px]">
  //         <p className="text-sm text-[#66686d]">Loading workspace...</p>
  //       </div>
  //     </main>
  //   );
  // }

  /* have not workspace */
  if (!selectedWorkspace) {
    return (
      <main className="min-h-screen bg-[#f4f7f4] px-6 py-10">
        <div className="mx-auto max-w-[825px]">
          {message && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {message}
            </p>
          )}
        </div>
      </main>
    );
  }

  const isOwner = selectedWorkspace.role === "owner";
  return (
    <main className="bg-[#E5EEE4]">
      <div className="min-h-screen bg-[#f4f7f4] px-6 py-10 sm:px-8">
        <div className="mx-auto w-full max-w-[825px]">
          {/* Workspace Header */}

          <div className="border-b border-[#e5e5e5] pb-7">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-[#6f7177]">
              WORKSPACE
            </p>

            <h1 className="mt-2 text-[22px] font-semibold leading-tight text-[#17181a]">
              {setSelectedWorkspace.workspaceName}
            </h1>

            <p className="mt-2 max-w-[620px] text-[14px] leading-5 text-[#5f6268]">
              Settings for this workspace. URL slug: dev. One brand per
              workspace. Got multiple brands? Create a new workspace from the
              sidebar switcher.
            </p>
          </div>

          {/* Message */}

          {message && (
            <div
              className={`mt-5 rounded-[9px] border px-4 py-3 text-[13px] ${
                messageType === "success"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-600"
              }`}
            >
              {message}
            </div>
          )}

          {/* =================================================
              OWNER VIEW
          ================================================= */}

          {isOwner && (
            <>
              {/* Update Workspace */}

              <div className="mt-8 overflow-hidden rounded-[18px] border border-[#dededc] bg-white container-shadow">
                <form onSubmit={handleSubmit}>
                  <div className="border-b border-[#e7e7e5] px-5 py-4">
                    <h2 className="text-[15px] font-semibold text-[#17181a]">
                      Workspace name
                    </h2>

                    <p className="mt-1 text-[13px] text-[#66686d]">
                      How you appear across the app and in audit history.
                    </p>
                  </div>

                  <div className="px-5 py-5">
                    <label
                      htmlFor="workspaceName"
                      className="mb-2 block text-[13px] font-medium text-[#252629]"
                    >
                      Name
                    </label>

                    <input
                      type="text"
                      id="workspaceName"
                      name="workspaceName"
                      value={formData.workspaceName}
                      onChange={handleChange}
                      className="
                        h-10
                        w-full
                        rounded-[9px]
                        border border-[#dfdfdb]
                        bg-white
                        px-3
                        text-[14px]
                        text-[#252629]
                        outline-none
                        transition
                        focus:border-[#aeb0b5]
                        focus:ring-2
                        focus:ring-[#eeeeec]
                      "
                    />

                    <div className="flex justify-end pt-3">
                      <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Transfer Ownership */}

              <div className="mt-6 overflow-hidden rounded-[18px] border border-[#dededc] bg-white container-shadow">
                <div className="border-b border-[#e7e7e5] px-5 py-4">
                  <h2 className="text-[15px] font-semibold text-[#17181a]">
                    Transfer ownership
                  </h2>

                  <p className="mt-1 text-[13px] text-[#66686d]">
                    Transfer ownership to an existing admin of this workspace.
                  </p>
                </div>

                <form onSubmit={handleTransferOwnership} className="px-5 py-5">
                  <label
                    htmlFor="newOwner"
                    className="mb-2 block text-[13px] font-medium text-[#252629]"
                  >
                    New owner
                  </label>

                  {/* <select
                    id="newOwner"
                    value={newOwnerId}
                    // onChange={(event) => {
                    //   setNewOwnerId(event.target.value);
                    //   setMessage("");
                    // }}
                    onChange={(event) => {
  console.log("SELECT VALUE:", event.target.value);

  setNewOwnerId(event.target.value);
  setMessage("");
}}
                    className="
                      h-10
                      w-full
                      rounded-[9px]
                      border border-[#dfdfdb]
                      bg-white
                      px-3
                      text-[14px]
                      text-[#252629]
                      outline-none
                      focus:border-[#aeb0b5]
                      focus:ring-2
                      focus:ring-[#eeeeec]
                    "
                  >
                    <option value="">Select an admin</option>

                    {admins.map((admin) => (
                      <option key={admin.memberId} value={admin.user_Id}>
                        {admin.username} — Admin
                      </option>
                    ))}
 
                  </select> */}
                  <select
  id="newOwner"
  value={newOwnerId}
  onChange={(event) => {
    console.log("SELECT VALUE:", event.target.value);

    setNewOwnerId(event.target.value);
    setMessage("");
  }}
  className="
    h-10
    w-full
    cursor-pointer
    rounded-[9px]
    border border-[#dfdfdb]
    bg-white
    px-3
    text-[14px]
    text-[#252629]
    outline-none
    focus:border-[#aeb0b5]
    focus:ring-2
    focus:ring-[#eeeeec]
  "
>
  <option value="">Select an admin</option>

  {admins.map((admin) => (
    <option
      key={admin.memberId}
      value={admin.user_id}
    >
      {admin.username} — Admin
    </option>
  ))}
</select>

                  {admins.length === 0 && (
                    <p className="mt-2 text-[12px] text-[#77797e]">
                      No admin members are available for ownership transfer.
                    </p>
                  )}

                  <div className="mt-4 flex justify-end">
                    {/* <button
                      type="submit"
                      disabled={transferring || !newOwnerId}
                      className="
                        rounded-[9px]
                        border
                        border-[#d9d9d5]
                        bg-white
                        px-4
                        py-2
                        text-[13px]
                        font-medium
                        text-[#252629]
                        hover:bg-[#f7f7f5]
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >
                      {transferring ? "Transferring..." : "Transfer ownership"}
                    </button> */}
                    <button
  type="button"
  disabled={transferring || !newOwnerId}
  onClick={() => {
    if (!newOwnerId) {
      setMessage("Please select a new owner.");
      setMessageType("error");
      return;
    }

    setShowTransferModal(true);
  }}
  className="
    rounded-[9px]
    border
    border-[#d9d9d5]
    bg-white
    px-4
    py-2
    text-[13px]
    font-medium
    text-[#252629]
    hover:bg-[#f7f7f5]
    disabled:cursor-not-allowed
    disabled:opacity-60
  "
>
  Transfer ownership
</button>
                  </div>
                </form>
              </div>
              {showTransferModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div
      className="
        w-full
        max-w-md
        rounded-xl
        border
        border-[var(--color-border)]
        bg-white
        p-6
        shadow-2xl
      "
    >
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Transfer ownership?
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
          Are you sure you want to transfer ownership of this workspace?
        </p>

        <p className="mt-3 text-sm leading-6 text-[#252629]">
          The selected admin will become the new owner, and you will become an
          admin.
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setShowTransferModal(false)}
          disabled={transferring}
          className="
            h-9
            cursor-pointer
            rounded-lg
            border border-[var(--color-border)]
            bg-white
            px-4
            text-sm
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
          onClick={handleTransferOwnership}
          disabled={transferring}
          className="
            h-9
            cursor-pointer
            rounded-lg
            bg-[var(--color-danger)]
            px-4
            text-sm
            font-medium
            text-white
            transition
            hover:bg-red-700
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {transferring ? "Transferring..." : "Yes, transfer ownership"}
        </button>
      </div>
    </div>
  </div>
)}

              {/* Delete Workspace */}

              <div className="mt-6 overflow-hidden rounded-[18px] border border-red-200 bg-white container-shadow">
  <div className="border-b border-red-100 px-5 py-4">
    <h2 className="text-[15px] font-semibold text-red-700">
      Delete workspace
    </h2>

    <p className="mt-1 text-[13px] text-[#66686d]">
      Permanently delete this workspace and its data.
    </p>
  </div>

  <div className="flex items-center justify-between gap-4 px-5 py-5">
    <p className="text-[12px] text-[#77797e]">
      This action cannot be undone.
    </p>

    <button
      type="button"
      onClick={() => setShowDeleteModal(true)}
      disabled={deleting}
      className="
        cursor-pointer
        rounded-[9px]
        bg-red-600
        px-4
        py-2
        text-[13px]
        font-medium
        text-white
        transition
        hover:bg-red-700
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
    >
      Delete workspace
    </button>
  </div>
</div>

{showDeleteModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div
          className="
            w-full max-w-md
            rounded-xl
            border border-[var(--color-border)]
            bg-white
            p-6
            shadow-2xl
          "
        >
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Delete workspace?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              Are you sure you want to delete this workspace?
              This action cannot be undone.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="
                h-9
                cursor-pointer
                rounded-lg
                border border-[var(--color-border)]
                bg-white
                px-4
                text-sm
                font-medium
                text-[var(--color-text-secondary)]
                transition
                hover:bg-[var(--color-surface-alt)]
              "
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDeleteWorkspace}
              disabled={deleting}
              className="
                h-9
                cursor-pointer
                rounded-lg
                bg-[var(--color-danger)]
                px-4
                text-sm
                font-medium
                text-white
                transition
                hover:bg-red-700
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    )}

 

            </>
          )}

          {/* =================================================
              MEMBER VIEW
          ================================================= */}

          {!isOwner && (
            <div className="mt-8 overflow-hidden rounded-[18px] border border-[#dededc] bg-white container-shadow">
              <div className="px-5 py-5">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-[#6f7177]">
                  YOUR WORKSPACE
                </p>

                <h2 className="mt-2 text-[18px] font-semibold text-[#17181a]">
                  {selectedWorkspace.workspaceName}
                </h2>

                <p className="mt-2 text-[13px] leading-5 text-[#66686d]">
                  You are a member of this workspace. Only the workspace owner
                  can change workspace settings.
                </p>

                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={handleLeaveWorkspace}
                    className="
                      rounded-[9px]
                      border
                      border-red-200
                      bg-white
                      px-4
                      py-2
                      text-[13px]
                      font-medium
                      text-red-600
                      hover:bg-red-50
                    "
                  >
                    Leave workspace
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
