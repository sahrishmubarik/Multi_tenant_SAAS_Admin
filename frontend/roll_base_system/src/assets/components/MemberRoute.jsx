import { Navigate, Outlet } from "react-router-dom";
import { useWorkspace } from "../context/WorkspaceContext";

export default function MemberRoute() {
  const { selectedWorkspace } = useWorkspace();

  const role = selectedWorkspace?.role;

  const canAccessMembers =
    role === "owner" ||
    role === "admin";

  if (!canAccessMembers) {
    return <Navigate to="/dashboard/workspace" replace />;
  }

  return <Outlet />;
}