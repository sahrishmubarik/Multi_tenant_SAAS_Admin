import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faBuilding,
  faUsers,
  faClockRotateLeft,
  faPlus,
  faRightFromBracket,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

export default function Sidebar() {
  const navigate = useNavigate();

  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  const [workspaceLoading, setWorkspaceLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("workspaceId");

    navigate("/login", { replace: true });
  };

  /* =========================================
     GET USER WORKSPACES
  ========================================= */

  useEffect(() => {
    async function getWorkspaces() {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(
          "http://localhost:3000/api/v1/workspace/my-workspaces",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(
            data.message || "Failed to fetch workspaces"
          );
          return;
        }

        const workspaceList = data.workspaces || [];

        setWorkspaces(workspaceList);

        if (workspaceList.length === 0) {
          localStorage.removeItem("workspaceId");
          setSelectedWorkspace(null);
          return;
        }

        /* =========================================
           GET PREVIOUSLY SELECTED WORKSPACE
        ========================================= */

        const savedWorkspaceId =
          localStorage.getItem("workspaceId");

        const savedWorkspace = workspaceList.find(
          (workspace) =>
            workspace.workspaceId === savedWorkspaceId
        );

        /* =========================================
           IF SAVED WORKSPACE EXISTS
        ========================================= */

        if (savedWorkspace) {
          setSelectedWorkspace(savedWorkspace);
        } else {
          /* =========================================
             OTHERWISE SELECT FIRST WORKSPACE
          ========================================= */

          const firstWorkspace = workspaceList[0];

          setSelectedWorkspace(firstWorkspace);

          localStorage.setItem(
            "workspaceId",
            firstWorkspace.workspaceId
          );
        }
      } catch (error) {
        console.error(
          "Get workspaces error:",
          error
        );
      } finally {
        setWorkspaceLoading(false);
      }
    }

    getWorkspaces();
  }, []);

  /* =========================================
     SELECT WORKSPACE
  ========================================= */

  function handleWorkspaceSelect(workspace) {
    setSelectedWorkspace(workspace);

    localStorage.setItem(
      "workspaceId",
      workspace.workspaceId
    );

    setWorkspaceOpen(false);

    /*
     * Reload current page so Members,
     * Workspace etc. use the new workspace.
     */
    window.location.reload();
  }

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-[9px] px-3 py-2.5 text-[13px] font-medium transition ${
      isActive
        ? "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)]"
    }`;

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-white">

      {/* Logo */}

      <div className="px-5 py-5">
        <div className="flex items-center gap-2">
          <div
            className="
              flex h-9 w-9
              items-center justify-center
              rounded-[9px]
              bg-[var(--color-primary)]
              text-[12px]
              font-semibold
              text-white
            "
          >
            RB
          </div>

          <span className="text-[17px] font-semibold text-[var(--color-text-primary)]">
            RoleBase
          </span>
        </div>
      </div>

      {/* =========================================
          WORKSPACE SELECTOR
      ========================================= */}

      <div className="relative px-4">

        <button
          type="button"
          onClick={() =>
            setWorkspaceOpen((previous) => !previous)
          }
          className="
            flex w-full
            items-center justify-between
            rounded-[9px]
            border border-[var(--color-border)]
            bg-white
            px-3 py-2.5
            text-left
            transition
            hover:bg-[var(--color-surface-alt)]
          "
        >

          <div className="flex min-w-0 items-center gap-2">

            <div
              className="
                flex h-7 w-7 shrink-0
                items-center justify-center
                rounded-[7px]
                bg-[var(--color-primary-light)]
                text-[10px]
                font-semibold
                text-[var(--color-primary)]
              "
            >
              WS
            </div>

            <span className="max-w-[150px] truncate text-[13px] font-medium text-[var(--color-text-primary)]">
              {workspaceLoading
                ? "Loading..."
                : selectedWorkspace?.workspaceName ||
                  "Select workspace"}
            </span>

          </div>

          <FontAwesomeIcon
            icon={faChevronDown}
            className="ml-2 text-[11px] text-[var(--color-text-muted)]"
          />

        </button>

        {/* =========================================
            WORKSPACE DROPDOWN
        ========================================= */}

        {workspaceOpen && (
          <div
            className="
              absolute
              left-4
              right-4
              top-[52px]
              z-50
              overflow-hidden
              rounded-[10px]
              border
              border-[var(--color-border)]
              bg-white
              shadow-lg
            "
          >

            {workspaces.length === 0 ? (
              <div className="px-3 py-3 text-[12px] text-[var(--color-text-muted)]">
                No workspaces found.
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto">

                {workspaces.map((workspace) => (
                  <button
                    key={workspace.workspaceId}
                    type="button"
                    onClick={() =>
                      handleWorkspaceSelect(workspace)
                    }
                    className={`
                      flex
                      w-full
                      items-center
                      gap-2
                      px-3
                      py-2.5
                      text-left
                      transition
                      hover:bg-[var(--color-surface-alt)]
                      ${
                        selectedWorkspace?.workspaceId ===
                        workspace.workspaceId
                          ? "bg-[var(--color-primary-light)]"
                          : ""
                      }
                    `}
                  >

                    <div
                      className="
                        flex
                        h-7
                        w-7
                        shrink-0
                        items-center
                        justify-center
                        rounded-[7px]
                        bg-[var(--color-primary-light)]
                        text-[10px]
                        font-semibold
                        text-[var(--color-primary)]
                      "
                    >
                      WS
                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-[13px] font-medium text-[var(--color-text-primary)]">
                        {workspace.workspaceName}
                      </p>

                      <p className="text-[11px] text-[var(--color-text-muted)]">
                        {workspace.role}
                      </p>

                    </div>

                  </button>
                ))}

              </div>
            )}

          </div>
        )}

        {/* Create workspace */}

        <button
          type="button"
          onClick={() =>
            navigate("/dashboard/create-workspace")
          }
          className="
            mt-2
            flex w-full
            items-center gap-3
            rounded-[9px]
            px-3 py-2.5
            text-[13px]
            font-medium
            text-[var(--color-text-secondary)]
            transition
            hover:bg-[var(--color-primary-light)]
            hover:text-[var(--color-primary)]
          "
        >
          <FontAwesomeIcon
            icon={faPlus}
            className="w-4 text-[12px]"
          />

          Create workspace
        </button>

      </div>

      {/* Navigation */}

      <div className="mt-7 px-4">

        <p
          className="
            mb-2 px-3
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.16em]
            text-[var(--color-text-muted)]
          "
        >
          Settings
        </p>

        <nav className="space-y-1">

          <NavLink
            to="/dashboard/profile"
            className={navLinkClass}
          >
            <FontAwesomeIcon
              icon={faUser}
              className="w-4 text-[12px]"
            />
            Profile
          </NavLink>

          <NavLink
            to="/dashboard/workspace"
            className={navLinkClass}
          >
            <FontAwesomeIcon
              icon={faBuilding}
              className="w-4 text-[12px]"
            />
            Workspace
          </NavLink>

          <NavLink
            to="/dashboard/members"
            className={navLinkClass}
          >
            <FontAwesomeIcon
              icon={faUsers}
              className="w-4 text-[12px]"
            />
            Members
          </NavLink>

        </nav>

        {/* Activity */}

        <p
          className="
            mb-2 mt-7 px-3
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.16em]
            text-[var(--color-text-muted)]
          "
        >
          Activity
        </p>

        <NavLink
          to="/dashboard/activity"
          className={navLinkClass}
        >
          <FontAwesomeIcon
            icon={faClockRotateLeft}
            className="w-4 text-[12px]"
          />

          Activity
        </NavLink>

      </div>

      {/* Bottom */}

      <div className="mt-auto border-t border-[var(--color-border)] p-4">

        <button
          type="button"
          onClick={handleLogout}
          className="
            flex w-full
            items-center gap-3
            rounded-[9px]
            px-3 py-2.5
            text-[13px]
            font-medium
            text-[var(--color-text-secondary)]
            transition
            hover:bg-[var(--color-danger-bg)]
            hover:text-[var(--color-danger)]
          "
        >

          <FontAwesomeIcon
            icon={faRightFromBracket}
            className="w-4 text-[12px]"
          />

          Sign out

        </button>

      </div>

    </aside>
  );
}