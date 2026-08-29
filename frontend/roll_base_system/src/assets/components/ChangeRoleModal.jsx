import { useState } from "react";

export default function ChangeRoleModal({
  member,
  onClose,
  onSuccess,
  workspaceId,
}) {
  const [role, setRole] = useState(member.role);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRoleChange = async (event) => {
    const newRole = event.target.value;
    setRole(newRole);

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `/api/v1/workspace/member/role/${member.memberId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            workspaceId,
            role: newRole,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update role"
        );
      }

      onSuccess();
    } catch (error) {
      setError(error.message);

      // agar API fail ho to previous role wapas
      setRole(member.role);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-md rounded-[18px] bg-white p-6 shadow-xl">
        <h2 className="text-[16px] font-semibold text-[#17181a]">
          Change member role
        </h2>

        <p className="mt-1 text-[13px] text-[#66686d]">
          Update the role for {member.username}.
        </p>

        <div className="mt-5">
          <label className="mb-2 block text-[13px] font-medium text-[#252629]">
            Role
          </label>

          <select
            value={role}
            onChange={handleRoleChange}
            disabled={loading}
            className="h-10 w-full rounded-[9px] border border-[#dfdfdb] bg-white px-3 text-[14px] text-[#252629] outline-none focus:border-[var(--color-primary)]"
          >
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>

        {error && (
          <div className="mt-4 rounded-[8px] bg-[var(--color-danger-bg)] px-3 py-2 text-[12px] text-[var(--color-danger)]">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-[8px] border border-[var(--color-border)] bg-white px-4 py-2 text-[12px] font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}