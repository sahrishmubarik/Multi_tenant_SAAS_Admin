import { useEffect, useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { workspaceNameSchema } from "@/validations/validation.js";
import { replace, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import Toast from "@/components/ui/Toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function MyWorkspace() {
  const { selectedWorkspace, setSelectedWorkspace, removeWorkspace } =
    useWorkspace();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    workspaceName: "",
  });
  const [toast, setToast] = useState("");
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const [admins, setAdmins] = useState([]);
  const [newOwnerId, setNewOwnerId] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

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

      try {
        const data = await api.get(
          `/workspace/${selectedWorkspace.workspaceId}/members`,
        );

        const adminMembers = data.member?.filter(
          (member) => member.role === "admin",
        );

        setAdmins(adminMembers || []);
      } catch (error) {
        console.error("Get admins error:", error);

        setMessage(error.message || "Failed to load workspace admins.");
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

    if (name === "name") {
      const result = workspaceNameSchema.safeParse(value);

      if (!result.success) {
        setMessage((previous) => ({
          ...previous,
          name: result.error.issues[0].message,
        }));
      } else {
        setMessage((previous) => ({
          ...previous,
          name: "",
        }));
      }

      setMessageType("error");
    }

    // Remove previous message when user starts typing again
    setMessage("");
    setMessageType("");
  }

  /* update workspace name */
  async function handleSubmit(event) {
    event.preventDefault();

    const result = workspaceNameSchema.safeParse(formData);

    if (!result.success) {
      const errorMessages = result.error.issues.map((issue) => issue.message);

      setMessage(errorMessages.join(" "));
      return;
    }

    if (selectedWorkspace?.role !== "owner") {
      return;
    }

    const workspaceId = selectedWorkspace?.workspaceId;

    if (!workspaceId) {
      setMessage("Workspace not found.");
      setMessageType("error");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const data = await api.patch(`/workspace/${workspaceId}`, {
        workspaceName: formData.workspaceName,
      });

      setMessage(data.message || "Workspace name changed successfully.");
      setToast("Update Workspace Name!");
      setTimeout(() => {
        setToast("");
      }, 1000);
      setMessageType("success");

      setSelectedWorkspace((previous) => ({
        ...previous,
        workspaceName: formData.workspaceName,
      }));
    } catch (error) {
      console.log("Update workspace error:", error);

      setMessage(error.message || "Something went wrong.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  /* TRANSFER OWNERSHIP */

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

    setTransferring(true);
    setMessage("");

    try {
      const data = await api.post(
        `/workspace/transfer-ownership/${selectedWorkspace.workspaceId}`,
        { newOwnerId },
      );

      setMessage(data.message || "Ownership transferred successfully.");

      setMessageType("success");
      setToast("Ownership transferred successfully.");
      setTimeout(() => {
        setToast("");
      }, 1000);
      setSelectedWorkspace((previous) => ({
        ...previous,
        role: "admin",
      }));

      setNewOwnerId("");
      setAdmins([]);
      setShowTransferModal(false);
    } catch (error) {
      console.error("Transfer ownership error:", error);

      setMessage(error.message || "Something went wrong.");
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

    setDeleting(true);
    setMessage("");

    try {
      const data = await api.delete("/workspace", {
        workspaceId: selectedWorkspace.workspaceId,
      });

      setMessage(data.message || "Workspace deleted successfully.");
      setToast("Workspace deleted successfully.");

      setTimeout(() => {
        setToast("");
        navigate("/dashboard", {
          replace: true,
        });
      }, 1000);

      setMessageType("success");

      removeWorkspace(selectedWorkspace.workspaceId);

      setFormData({
        workspaceName: "",
      });
    } catch (error) {
      console.log("Delete workspace error:", error);

      setMessage(error.message || "Something went wrong.");
      setMessageType("error");
    } finally {
      setDeleting(false);
    }
  }

  /* =================================================
     LEAVE WORKSPACE
  ================================================= */

  function handleLeaveWorkspace() {
    if (selectedWorkspace?.role === "owner") {
      setMessage("Workspace owner cannot leave. Transfer ownership first.");
      setMessageType("error");
      return;
    }

    setShowLeaveModal(true);
  }

  /* Confirm leave workspace */

  async function confirmLeaveWorkspace() {
    const workspaceId = selectedWorkspace?.workspaceId;

    if (!workspaceId) {
      setMessage("Workspace not found.");
      setMessageType("error");
      setShowLeaveModal(false);
      return;
    }

    try {
      const data = await api.delete(`/workspace/leave/${workspaceId}`);

      setMessage(data.message || "You have left the workspace successfully.");

      setMessageType("success");
      setToast("Leave workspace successfully!");
      setShowLeaveModal(false);

      // Remove workspace from WorkspaceContext
      removeWorkspace(workspaceId);

      setFormData({
        workspaceName: "",
      });
      setTimeout(() => {
        setToast("");
        navigate("/dashboard", { replace: true });
      }, 1000);
    } catch (error) {
      console.error("Leave workspace error:", error);

      setMessage(error.message || "Something went wrong.");
      setMessageType("error");
    }
  }


  /* =================================================
     NO WORKSPACE
  ================================================= */

  if (!selectedWorkspace) {
    return (
      <main className="min-h-screen bg-[#f4f7f4] px-6 py-10">
        <div className="mx-auto max-w-[825px]">
          <div className="rounded-[18px] border border-[#dededc] bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-[#17181a]">
              No workspace selected
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#66686d]">
              You have left the workspace successfully. Select another workspace
              from the sidebar or create a new one.
            </p>

            {message && (
              <p className="mt-4 text-sm text-green-600">{message}</p>
            )}
          </div>
        </div>
      </main>
    );
  }

  const isOwner = selectedWorkspace.role === "owner";

  return (
    <main className="bg-[#E5EEE4]">
      <div className="min-h-screen bg-[#f4f7f4] px-6 py-10 sm:px-8">
        <div className="mx-auto w-full max-w-[825px]">
          {/* =================================================
              Workspace Header
          ================================================= */}

          <div className="border-b border-[#e5e5e5] pb-7">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-[#6f7177]">
              WORKSPACE
            </p>

            <h1 className="mt-2 text-[22px] font-semibold leading-tight text-[#17181a]">
              {selectedWorkspace.workspaceName}
            </h1>

            <p className="mt-2 max-w-[620px] text-[14px] leading-5 text-[#5f6268]">
              Settings for this workspace. URL slug: dev. One brand per
              workspace. Got multiple brands? Create a new workspace from the
              sidebar switcher.
            </p>
          </div>

          {/* =================================================
              Message
          ================================================= */}

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
              {/* =================================================
                  Update Workspace
              ================================================= */}

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
                      {/* <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                      {saving ? (
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
               >
           
                Saving...

              </span>
            ) : (
              "Save"
            )}

          </button> */}

                      <button
                        type="submit"
                        disabled={saving}
                        className="
              btn-primary
              px-4
              py-2
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
                      >
                        {saving ? (
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
                            Saving...
                          </span>
                        ) : (
                          "  Save  "
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* =================================================
                  Transfer Ownership
              ================================================= */}

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
                    <option value="" className="hover:cursor-pointer">
                      Select an admin
                    </option>

                    {admins.map((admin) => (
                      <option
                        className="hover:cursor-pointer"
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
                        hover:cursor-pointer
                      "
                    >
                      Transfer ownership
                    </button>
                  </div>
                </form>
              </div>

              {/* =================================================
                  Transfer Ownership Modal
              ================================================= */}

              {showTransferModal && (
                <ConfirmDialog
                  title="Transfer ownership?"
                  confirmLabel="Yes, transfer ownership"
                  loadingLabel="Transferring..."
                  loading={transferring}
                  onCancel={() => setShowTransferModal(false)}
                  onConfirm={handleTransferOwnership}
                >
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Are you sure you want to transfer ownership of this
                    workspace?
                  </p>

                  <p className="mt-3 text-sm leading-6 text-[#252629]">
                    The selected admin will become the new owner, and you will
                    become an admin.
                  </p>
                </ConfirmDialog>
              )}

              {/* =================================================
                  Delete Workspace
              ================================================= */}

              <div className=" mt-6 overflow-hidden rounded-[18px] border border-red-200 bg-white container-shadow py-4">
                <div className="flex justify-between">
                  <div className="border-b border-red-100 px-5 py-4">
                    <h2 className="text-[15px] font-semibold text-red-700">
                      Delete workspace
                    </h2>

                    <p className="mt-1 text-[13px] text-[#66686d]">
                      Permanently delete this workspace and its data.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    disabled={deleting}
                    className="
                    m-5
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

              {/* =================================================
                  Delete Workspace Modal
              ================================================= */}

              {showDeleteModal && (
                <ConfirmDialog
                  title="Delete workspace?"
                  confirmLabel="Delete"
                  loadingLabel="Deleting..."
                  loading={deleting}
                  onCancel={() => setShowDeleteModal(false)}
                  onConfirm={handleDeleteWorkspace}
                >
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Are you sure you want to delete this workspace?
                  </p>
                </ConfirmDialog>
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
                      cursor-pointer
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

                  {/* =================================================
                      Leave Workspace Confirmation Modal
                  ================================================= */}

                  {showLeaveModal && (
                    <ConfirmDialog
                      title="Leave workspace?"
                      confirmLabel="Yes, leave workspace"
                      onCancel={() => setShowLeaveModal(false)}
                      onConfirm={confirmLeaveWorkspace}
                    >
                      <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                        Are you sure you want to leave this workspace?
                      </p>

                      <p className="mt-3 text-sm leading-6 text-[#252629]">
                        You will lose access to this workspace and will need
                        another invitation to join again.
                      </p>
                    </ConfirmDialog>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Toast message={toast} />
    </main>
  );
}
