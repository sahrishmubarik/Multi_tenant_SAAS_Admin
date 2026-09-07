import RoleBadge from "@/components/members/RoleBadge";

// A single row in the members table.
// Owners are read-only; other members get a role dropdown and a delete button.
export default function MemberRow({ member, isUpdating, onRoleChange, onDelete }) {
  return (
    <tr className="border-b border-[#eeeeec] last:border-b-0">
      {/* MEMBER */}
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

      {/* ROLE */}
      <td className="px-5 py-4">
        {member.role === "owner" ? (
          <RoleBadge role={member.role} />
        ) : (
          <select
            value={member.role}
            disabled={isUpdating}
            onChange={(event) => onRoleChange(member, event.target.value)}
            className="
              rounded-[8px]
              border
              border-[#dededc]
              bg-white
              cursor-pointer
              px-3
              py-1.5
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
            <option value="admin" className="cursor-pointer">
              Admin
            </option>

            <option value="editor" className="cursor-pointer">
              Editor
            </option>

            <option value="viewer" className="cursor-pointer">
              Viewer
            </option>
          </select>
        )}
      </td>

      {/* JOINED */}
      <td className="px-5 py-4 text-[12px] text-[#7a7d84]">
        {member.createAt
          ? new Date(member.createAt).toLocaleDateString().replaceAll("/", "-")
          : "—"}
      </td>

      {/* DELETE */}
      <td className="px-5 py-4">
        {member.role === "owner" ? (
          <div className="text-right text-[12px] text-[#9a9ca1]">Owner</div>
        ) : (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onDelete(member)}
              className="
                rounded-[8px]
                border
                border-[var(--color-danger-border)]
                bg-white
                px-3
                py-1.5
                text-[12px]
                font-medium
                text-[var(--color-danger)]
                transition
                hover:bg-[var(--color-danger-bg)]
              "
            >
              Delete
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
