import { useState } from "react";

export default function ChangeRoleModal({
  member,
  onClose,
  onSuccess,
}) {
  const [role, setRole] = useState(member.role);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChangeRole = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:3000/api/v1/workspace/member/role/${member.memberId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            role,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update role");
      }

      onSuccess();
    } catch (error) {
      console.error("Change role error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-[420px] overflow-hidden rounded-[18px] border border-[#dededc] bg-white container-shadow">
        <div className="border-b border-[#e7e7e5] px-5 py-4">
          <h2 className="text-[15px] font-semibold text-[#17181a]">
            Change member role
          </h2>

          <p className="mt-1 text-[13px] text-[#66686d]">
            Update the role assigned to {member.username}.
          </p>
        </div>

        <div className="px-5 py-5">
          <label className="mb-2 block text-[13px] font-medium text-[#252629]">
            Role
          </label>

          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="h-10 w-full rounded-[9px] border border-[#dfdfdb] bg-white px-3 text-[14px] text-[#252629] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
          >
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>

          {error && (
            <p className="mt-3 rounded-[8px] bg-[var(--color-danger-bg)] px-3 py-2 text-[12px] text-[var(--color-danger)]">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-[#e7e7e5] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-[8px] border border-[#dededc] bg-white px-4 py-2 text-[13px] font-medium text-[#252629] transition hover:bg-[#f7f7f5]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleChangeRole}
            disabled={loading || role === member.role}
            className="btn-primary px-4 py-2 text-[13px]"
          >
            {loading ? "Updating..." : "Update role"}
          </button>
        </div>
      </div>
    </div>
  );
}