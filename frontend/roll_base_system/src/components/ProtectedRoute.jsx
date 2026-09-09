import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
   return children;
};

// 1. Create a dynamic fallback redirect helper
export function FallbackRedirect(){
  // Replace this with the exact same authentication logic your ProtectedRoute uses
  // (e.g., localStorage.getItem('token'), cookie check, or auth context state)
  const isAuthenticated = !!localStorage.getItem("token"); 

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  } else {
    return <Navigate to="/" replace />;
  }
};
