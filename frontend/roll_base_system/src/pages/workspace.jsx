import { useState } from "react";
import AuthHeader from "../components/AuthHeader";
import { useNavigate } from "react-router-dom";
import { nameSchema } from "../validations/validation.js";
import { useWorkspace } from "../context/WorkspaceContext";
export default function CreateWorkspace() {
  const { addWorkspace } = useWorkspace();
  const [formData, setFormData] = useState({
    workspaceName: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [errors, setErrors] = useState("");
  const [toast, setToast] = useState("");
  const navigate = useNavigate();
  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "name") {
      const result = nameSchema.safeParse(value);

      if (!result.success) {
        setErrors((previous) => ({
          ...previous,
          name: result.error.issues[0].message,
        }));
      } else {
        setErrors((previous) => ({
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

  async function handleSubmit(event) {
    event.preventDefault();
    if (!formData.workspaceName) {
      setMessage("Workspace name is required");
      return;
    }
    setMessage("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/v1/workspace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();

          setMessage(errorMessages.join(" "));
        } else if (data.message) {
          setMessage(data.message);
        } else {
          setMessage("Failed to create workspace. Please try again.");
        }

        setMessageType("error");
        return;
      }
      console.log("CREATE WORKSPACE RESPONSE:", data);
      console.log("NEW WORKSPACE:", data.workspace);
      setMessage("Workspace created successfully!");
      setMessageType("success");
      setToast("Workspace created successfully");
      setFormData({
        workspaceName: "",
      });

      setTimeout(() => {
        const newWorkspace = {
          workspaceId: data.workspaceId,
          workspaceName: formData.workspaceName,
          role: data.role,
        };
        addWorkspace(newWorkspace);
        navigate("/dashboard", { replace: true });
      }, 1000);
    } catch (error) {
      console.error("Create workspace error:", error);

      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#E5EEE4]">
      <AuthHeader />
      <main className="flex flex-1 items-center justify-center px-6">
        {toast && (
          <div
            className="
            fixed
            right-6
            top-6
            z-50
            rounded-lg
            border
            border-[var(--color-success-border)]
            bg-[var(--color-success-bg)]
            px-5
            py-3
            text-sm
            font-medium
            text-[var(--color-success)]
            shadow-lg
          "
          >
            {toast}
          </div>
        )}

        <div className="w-full max-w-[950px]">
          {/* <main className="flex min-h-[calc(100vh-50px)] items-center justify-center ">
        <div className="flex items-center justify-center bg-[#E5EEE4] px-6 py-10 sm:px-8"> */}
          <div className="mx-auto grid w-full max-w-[950px] items-center gap-8 lg:grid-cols-[1fr_auto_1fr]">
            {/* LEFT - Create Workspace */}
            <div className="container-shadow w-full rounded-[20px] border border-[#dededc] bg-white p-6 sm:p-8">
              {/* Heading */}
              <div className="mb-7">
                <p className="mb-2 text-[11px] font-semibold tracking-[0.18em] text-[var(--color-primary)]">
                  GET STARTED
                </p>

                <h1 className="text-[24px] font-semibold leading-tight text-[#17181a]">
                  Create your workspace
                </h1>

                <p className="mt-2 text-[14px] leading-5 text-[#66686d]">
                  Set up a workspace to organize your team, projects, and access
                  permissions.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Workspace Name */}
                <div>
                  <label
                    htmlFor="workspaceName"
                    className="mb-2 block text-[13px] font-medium text-[#252629]"
                  >
                    Workspace Name
                  </label>

                  <input
                    id="workspaceName"
                    type="text"
                    name="workspaceName"
                    value={formData.workspaceName}
                    onChange={handleChange}
                    placeholder="e.g. Product Team"
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
                  placeholder:text-[#999b9f]
                  focus:border-[#aeb0b5]
                  focus:ring-2
                  focus:ring-[#eeeeec]
                "
                  />
                  {/* Message */}
                  {messageType === "error" && message && (
                    <div className="mt-1 rounded-[9px] border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-[var(--color-danger)]">
                      {message}
                    </div>
                  )}
                  {/* {message && (
                  <div
                    className={`rounded-[9px] border mt-1 px-3 py-2.5 text-[13px] ${
                      messageType === "error"
                        ? "border-red-200 bg-red-50 text-[var(--color-danger)]"
                        : "border-green-200 bg-green-50 text-green-700"
                    }`}
                  >
                    {message}
                  </div>
                )} */}
                  {/* {errors.workspaceName && (
              <p
                className="
                  mt-1
                  text-sm
                  text-[var(--color-danger)]
                "
              >
                {errors.workspaceName}
              </p>
            )} */}
                </div>

                {/* Submit Button */}
                {/* <button
                  type="submit"
                  className="
                  cursor-pointer
                w-full
                rounded-[9px]
                bg-[var(--color-primary)]
                px-4
                py-2.5
                text-[14px]
                font-medium
                text-white
                transition
                hover:opacity-90
                focus:outline-none
                focus:ring-2
                focus:ring-[var(--color-primary-light)]
              "
                >
                  Create Workspace
                </button> */}

                <button
                  type="submit"
                  disabled={loading}
                  className="
    btn-primary
    w-full
    disabled:cursor-not-allowed
    disabled:opacity-60
  "
                >
                  {loading ? (
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
                      Create Workspace...
                    </span>
                  ) : (
                    "Create Workspace"
                  )}
                </button>

                {messageType === "success" && message && (
                  <div className="mt-1 rounded-[9px] border border-green-200 bg-green-50 px-3 py-2.5 text-[13px] text-green-700">
                    {message}
                  </div>
                )}
                {/* Message
                {message && (
                  <div
                    className={`rounded-[9px] border px-3 py-2.5 text-[13px] ${
                      messageType === "error"
                        ? "border-red-200 bg-red-50 text-[var(--color-danger)]"
                        : "border-green-200 bg-green-50 text-green-700"
                    }`}
                  >
                    {message}
                  </div>
                )} */}
              </form>
            </div>

            {/* Connecting Line */}
            <div className="hidden h-[220px] w-px bg-[#eaf4e6] lg:block" />

            {/* RIGHT - Workspace Information */}
            <div className="w-full px-2 py-4 lg:px-4 ">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-[var(--color-primary)]">
                YOUR CONTROL PLANE
              </p>

              <h2 className="mt-2 text-[22px] font-semibold leading-tight text-[#17181a]">
                One workspace.
                <br />
                Everything organized.
              </h2>

              <p className="mt-3 text-[14px] leading-6 text-[#66686d]">
                Your workspace is where your team members, projects, roles, and
                permissions come together in one secure place.
              </p>

              {/* Benefits */}
              <div className="mt-6 space-y-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[12px] font-bold text-[var(--color-primary)]">
                    ✓
                  </div>

                  <div>
                    <h3 className="text-[13px] font-semibold text-[#252629]">
                      Organize your team
                    </h3>

                    <p className="mt-1 text-[12px] leading-5 text-[#7a7d84]">
                      Keep members and projects grouped in one workspace.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[12px] font-bold text-[var(--color-primary)]">
                    ✓
                  </div>

                  <div>
                    <h3 className="text-[13px] font-semibold text-[#252629]">
                      Control access
                    </h3>

                    <p className="mt-1 text-[12px] leading-5 text-[#7a7d84]">
                      Define roles and permissions for the right level of
                      access.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[12px] font-bold text-[var(--color-primary)]">
                    ✓
                  </div>

                  <div>
                    <h3 className="text-[13px] font-semibold text-[#252629]">
                      Built for growth
                    </h3>

                    <p className="mt-1 text-[12px] leading-5 text-[#7a7d84]">
                      Start simple and scale your workspace as your team grows.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
