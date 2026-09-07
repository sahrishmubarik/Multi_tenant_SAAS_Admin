// Colored pill showing a member's role.
export default function RoleBadge({ role }) {
  const roleStyles = {
    owner: "bg-[var(--color-role-owner-bg)] text-[var(--color-role-owner)]",
    admin: "bg-[var(--color-role-admin-bg)] text-[var(--color-role-admin)]",
    editor: "bg-[var(--color-role-editor-bg)] text-[var(--color-role-editor)]",
    viewer: "bg-[var(--color-role-member-bg)] text-[var(--color-role-member)]",
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
