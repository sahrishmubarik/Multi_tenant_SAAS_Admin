import { useState } from "react";

export default function AddMemberCard({
  workspaceId,
  onMemberAdded,
}) {
  const [formData, setFormData] = useState({
    memberName: "",
    email: "",
    role: "viewer",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setError("");

      const token = localStorage.getItem("token");
     
console.log("TOKEN:", token);
console.log("WORKSPACE ID:", workspaceId);
      const response = await fetch(
        "http://localhost:3000/api/v1/workspace/member",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            workspaceId,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add member");
      }

      setMessage(data.message || "Member added successfully.");

      setFormData({
        memberName: "",
        email: "",
        role: "viewer",
      });

      onMemberAdded();
    } catch (error) {
      // console.error("Add member error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 overflow-hidden rounded-[18px] border border-[#dededc] bg-white container-shadow">
      <div className="border-b border-[#e7e7e5] px-5 py-4">
        <h2 className="text-[15px] font-semibold text-[#17181a]">
          Add member
        </h2>

        <p className="mt-1 text-[13px] text-[#66686d]">
          Add an existing RoleBase user directly to this workspace.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 px-5 py-5">
        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#252629]">
            Member name
          </label>

          <input
            name="memberName"
            type="text"
            value={formData.memberName}
            onChange={handleChange}
            required
            placeholder="Enter member name"
            className="h-10 w-full rounded-[9px] border border-[#dfdfdb] bg-white px-3 text-[14px] text-[#252629] outline-none transition placeholder:text-[#aaa] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
          />
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#252629]">
            Email
          </label>

          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="member@example.com"
            className="h-10 w-full rounded-[9px] border border-[#dfdfdb] bg-white px-3 text-[14px] text-[#252629] outline-none transition placeholder:text-[#aaa] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
          />
        </div>

        <div>
          <label className="mb-2 block text-[13px] font-medium text-[#252629]">
            Role
          </label>

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="h-10 w-full rounded-[9px] border border-[#dfdfdb] bg-white px-3 text-[14px] text-[#252629] outline-none focus:border-[var(--color-primary)]"
          >
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>

        {error && (
          <div className="rounded-[8px] bg-[var(--color-danger-bg)] px-3 py-2 text-[12px] text-[var(--color-danger)]">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-[8px] bg-[var(--color-success-bg)] px-3 py-2 text-[12px] text-[var(--color-success)]">
            {message}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary min-w-[110px] px-4 text-[13px]"
          >
            {loading ? "Adding..." : "Add member"}
          </button>
        </div>
      </form>
    </div>
  );
}