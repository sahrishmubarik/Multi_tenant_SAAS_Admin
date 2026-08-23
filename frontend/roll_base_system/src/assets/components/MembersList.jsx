import { useState } from "react";
import ChangeRoleModal from "./ChangeRoleModal";
import DeleteMemberModal from "./DeleteMemberModal";

function RoleBadge({ role }) {
  const roleStyles = {
    owner:
      "bg-[var(--color-role-owner-bg)] text-[var(--color-role-owner)]",
    admin:
      "bg-[var(--color-role-admin-bg)] text-[var(--color-role-admin)]",
    editor:
      "bg-[var(--color-role-editor-bg)] text-[var(--color-role-editor)]",
    viewer:
      "bg-[var(--color-role-member-bg)] text-[var(--color-role-member)]",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
        roleStyles[role] ||
        "bg-[var(--color-inherited-bg)] text-[var(--color-inherited)]"
      }`}
    >
      {role?.charAt(0).toUpperCase() + role?.slice(1)}
    </span>
  );
}

export default function MembersList({
  members,
  loading,
  workspaceId,
  onMemberChanged,
}) {
  const [selectedMember, setSelectedMember] = useState(null);
  const [deleteMember, setDeleteMember] = useState(null);

  return (
    <>
      <div className="mt-6 overflow-hidden rounded-[18px] border border-[#dededc] bg-white container-shadow">
        {/* Header */}
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

            {!loading && (
              <span className="rounded-full bg-[var(--color-surface-alt)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-secondary)]">
                {members.length}{" "}
                {members.length === 1 ? "member" : "members"}
              </span>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="px-5 py-10 text-center text-[13px] text-[#7a7d84]">
            Loading members...
          </div>
        )}

        {/* Empty */}
        {!loading && members.length === 0 && (
          <div className="px-5 py-10 text-center">
            <p className="text-[14px] font-medium text-[#252629]">
              No members found
            </p>

            <p className="mt-1 text-[12px] text-[#7a7d84]">
              Add a member or send an invitation to get started.
            </p>
          </div>
        )}

        {/* Desktop table */}
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
                  <tr
                    key={member.memberId}
                    className="border-b border-[#eeeeec] last:border-b-0"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[12px] font-semibold text-[var(--color-primary-text)]">
                          {member.username?.charAt(0)?.toUpperCase() || "U"}
                        </div>

                        <div>
                          <p className="text-[13px] font-medium text-[#252629]">
                            {member.username}
                          </p>

                          <p className="mt-0.5 text-[11px] text-[#8a8c91]">
                            {member.user_id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <RoleBadge role={member.role} />
                    </td>

                    <td className="px-5 py-4 text-[12px] text-[#7a7d84]">
                      {member.createAt
                        ? new Date(member.createAt).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="px-5 py-4">
                      {member.role === "owner" ? (
                        <div className="text-right text-[12px] text-[#9a9ca1]">
                          Owner
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedMember(member)}
                            className="rounded-[8px] border border-[var(--color-border)] bg-white px-3 py-1.5 text-[12px] font-medium text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                          >
                            Edit role
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteMember(member)}
                            className="rounded-[8px] border border-[var(--color-danger-border)] bg-white px-3 py-1.5 text-[12px] font-medium text-[var(--color-danger)] transition hover:bg-[var(--color-danger-bg)]"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Change role */}
      {selectedMember && (
        <ChangeRoleModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onSuccess={() => {
            setSelectedMember(null);
            onMemberChanged();
          }}
        />
      )}

      {/* Delete */}
      {deleteMember && (
        <DeleteMemberModal
          member={deleteMember}
          workspaceId={workspaceId}
          onClose={() => setDeleteMember(null)}
          onSuccess={() => {
            setDeleteMember(null);
            onMemberChanged();
          }}
        />
      )}
    </>
  );
}