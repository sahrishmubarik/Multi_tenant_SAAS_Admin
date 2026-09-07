import { useState } from "react";
import DeleteMemberModal from "@/components/DeleteMemberModal";
import MemberRow from "@/components/members/MemberRow";
import { api } from "@/services/api";

export default function MembersList({
  members = [],
  loading = false,
  workspaceId,
  roleFilter = "all",
  onRoleFilterChange,
  onMemberChanged,
  onShowToast,
}) {
  const [deleteMember, setDeleteMember] = useState(null);

  // Which member is currently being updated
  const [updatingMemberId, setUpdatingMemberId] = useState(null);

  // Error from update role API
  const [roleError, setRoleError] = useState("");

  /*
   * UPDATE MEMBER ROLE
   *
   * This runs directly when the role dropdown
   * inside a member row is changed.
   */
  async function handleRoleChange(member, newRole) {
    // Don't allow owner role to be changed
    if (member.role === "owner") {
      return;
    }

    // If user selects the same role, do nothing
    if (member.role === newRole) {
      return;
    }

    try {
      setRoleError("");
      setUpdatingMemberId(member.memberId);

      await api.patch(
        `/workspace/${workspaceId}/members/${member.memberId}/role`,
        { role: newRole },
      );

      // SUCCESS
      onShowToast("Member role updated successfully!");
      onMemberChanged();
    } catch (error) {
      console.error("Update member role error:", error);

      setRoleError(error.message);
    } finally {
      setUpdatingMemberId(null);
    }
  }

  /*
   * DELETE SUCCESS
   */
  function handleDeleteSuccess() {
    setDeleteMember(null);

    /*
     * Refresh members from backend
     * using currently selected role.
     */
    onMemberChanged();
  }

  /*
   * ROLE FILTER CHANGE
   *
   * We DON'T filter members here.
   * Parent re-fetches based on the selected role.
   */
  function handleFilterChange(event) {
    const role = event.target.value;

    onRoleFilterChange(role);
  }

  return (
    <>
      <div className="mt-6 overflow-hidden rounded-[18px] border border-[#dededc] bg-white container-shadow">
        {/* HEADER */}
        <div className="border-b border-[#e7e7e5] px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[15px] font-semibold text-[#17181a]">
                Members
              </h2>

              <p className="mt-1 text-[13px] text-[#66686d]">
                People who currently have access to this workspace.
              </p>
            </div>

            {/* TOP ROLE FILTER */}
            <div className="flex items-center gap-2">
              <label htmlFor="member-role-filter" className="sr-only">
                Filter members by role
              </label>

              <select
                id="member-role-filter"
                value={roleFilter}
                onChange={handleFilterChange}
                disabled={loading}
                className="
                  rounded-[8px]
                  border
                  border-[#dededc]
                  bg-white
                  cursor-pointer
                  px-3
                  py-2
                  text-[12px]
                  font-medium
                  text-[#252629]
                  outline-none
                  focus:border-[var(--color-primary)]
                  focus:ring-2
                  focus:ring-[var(--color-primary-light)]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                <option value="all">All</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>

              {!loading && (
                <span className="rounded-full bg-[var(--color-surface-alt)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-secondary)]">
                  {members.length} {members.length === 1 ? "member" : "members"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ROLE UPDATE ERROR */}
        {roleError && (
          <div className="mx-5 mt-4 rounded-[8px] bg-[var(--color-danger-bg)] px-3 py-2 text-[12px] text-[var(--color-danger)]">
            {roleError}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="px-5 py-10 text-center text-[13px] text-[#7a7d84]">
            Loading members...
          </div>
        )}

        {/* NO MEMBERS */}
        {!loading && members.length === 0 && (
          <div className="px-5 py-10 text-center">
            <p className="text-[14px] font-medium text-[#252629]">
              No members found
            </p>

            <p className="mt-1 text-[12px] text-[#7a7d84]">
              {roleFilter === "all"
                ? "Add a member or send an invitation to get started."
                : `No ${roleFilter} members found.`}
            </p>
          </div>
        )}

        {/* MEMBERS TABLE */}
        {!loading && members.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className="border-b border-[#e7e7e5] bg-[#fafafa]">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7a7d84]">
                    Member
                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7a7d84]">
                    Role
                  </th>

                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7a7d84]">
                    Joined
                  </th>

                  <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7a7d84]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {members.map((member) => (
                  <MemberRow
                    key={member.memberId}
                    member={member}
                    isUpdating={updatingMemberId === member.memberId}
                    onRoleChange={handleRoleChange}
                    onDelete={setDeleteMember}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteMember && (
        <DeleteMemberModal
          onShowToast={onShowToast}
          member={deleteMember}
          workspaceId={workspaceId}
          onClose={() => setDeleteMember(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}
