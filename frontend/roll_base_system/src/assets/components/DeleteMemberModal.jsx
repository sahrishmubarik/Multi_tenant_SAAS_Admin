import { useState } from "react";

export default function DeleteMemberModal({
  member,
  workspaceId,
  onClose,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `/api/v1/workspace/member/${member.memberId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            workspaceId,
            email: member.email,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete member");
      }

      onSuccess();
    } catch (error) {
      console.error("Delete member error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-[420px] overflow-hidden rounded-[18px] border border-[#dededc] bg-white container-shadow">
        <div className="px-5 py-5">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-danger-bg)] text-[var(--color-danger)]">
            !
          </div>

          <h2 className="text-[16px] font-semibold text-[#17181a]">
            Remove member?
          </h2>

          <p className="mt-2 text-[13px] leading-5 text-[#66686d]">
            Are you sure you want to remove{" "}
            <span className="font-medium text-[#252629]">
              {member.username}
            </span>{" "}
            from this workspace? They will no longer have access.
          </p>

          {error && (
            <p className="mt-4 rounded-[8px] bg-[var(--color-danger-bg)] px-3 py-2 text-[12px] text-[var(--color-danger)]">
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
            onClick={handleDelete}
            disabled={loading}
            className="rounded-[8px] bg-[var(--color-danger)] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-red-700"
          >
            {loading ? "Removing..." : "Remove member"}
          </button>
        </div>
      </div>
    </div>
  );
}