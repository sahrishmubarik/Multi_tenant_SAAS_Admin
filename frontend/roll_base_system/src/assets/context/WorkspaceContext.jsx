import { createContext, useContext, useState } from "react";

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  // All user's workspaces
  const [workspaces, setWorkspaces] = useState([]);

  // Currently selected workspace
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);

  // Select a workspace
  function selectWorkspace(workspace) {
    setSelectedWorkspace(workspace);

    // Remember selected workspace after page refresh/login
    if (workspace?.workspaceId) {
      localStorage.setItem("workspaceId", workspace.workspaceId);
    }
  }

  // Add newly created workspace
  function addWorkspace(workspace) {
    setWorkspaces((previousWorkspaces) => [
      ...previousWorkspaces,
      workspace,
    ]);

    // Automatically select the newly created workspace
    selectWorkspace(workspace);
  }

  // Remove workspace
  function removeWorkspace(workspaceId) {
    setWorkspaces((previousWorkspaces) =>
      previousWorkspaces.filter(
        (workspace) => workspace.workspaceId !== workspaceId
      )
    );

    // If deleted workspace was selected
    if (selectedWorkspace?.workspaceId === workspaceId) {
      setSelectedWorkspace(null);
      localStorage.removeItem("workspaceId");
    }
  }

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        selectedWorkspace,

        setWorkspaces,
        setSelectedWorkspace,

        selectWorkspace,
        addWorkspace,
        removeWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error(
      "useWorkspace must be used inside WorkspaceProvider"
    );
  }

  return context;
}