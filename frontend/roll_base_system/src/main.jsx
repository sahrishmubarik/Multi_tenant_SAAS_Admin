import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./App.css";
import App from './App.jsx'
import { WorkspaceProvider } from "./assets/context/WorkspaceContext";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <WorkspaceProvider>
      <App />
    </WorkspaceProvider>
  </StrictMode>
);