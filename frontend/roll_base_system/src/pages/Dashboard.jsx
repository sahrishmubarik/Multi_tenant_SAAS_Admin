import { useState } from "react";
import { Outlet } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars} from "@fortawesome/free-solid-svg-icons";

import Sidebar from "../assets/components/Sidebar";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">

      {/* Mobile Header */}
      <header
        className="
          flex h-14 items-center
          border-b border-[var(--color-border)]
          bg-white px-4
          md:hidden
        "
      >
        <button
          type="button"
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="
            flex h-9 w-9 items-center justify-center
            rounded-lg
            text-[var(--color-text-secondary)]
            hover:bg-[var(--color-surface-alt)]
          "
        >
          <FontAwesomeIcon
            icon={sidebarOpen ? faXmark : faBars}
          />
        </button>

        <span className="ml-3 text-[16px] font-semibold">
          RoleBase
        </span>
      </header>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="
            fixed inset-0 z-40
            bg-black/30
            md:hidden
          "
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <main
        className="
          min-h-screen
          min-w-0
          overflow-y-auto
          md:ml-64
        "
      >
        <Outlet />
      </main>

    </div>
  );
}

// import { Outlet } from "react-router-dom";
// import Sidebar from "../assets/components/Sidebar";

// export default function DashboardPage() {
//   return (
//     <div className="min-h-screen bg-[var(--color-bg)]">

//       <Sidebar />

//       <main
//         className="
//           min-h-screen
//           min-w-0
//           overflow-y-auto
//           md:ml-64
//         "
//       >
//         <Outlet />
//       </main>

//     </div>
//   );
// }