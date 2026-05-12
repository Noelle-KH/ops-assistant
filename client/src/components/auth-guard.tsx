import { Navigate, useLocation } from "react-router-dom";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const token = localStorage.getItem("user_token");
  const role = localStorage.getItem("user_role");
  const location = useLocation();

  if (!token) {
    // Redirect to login page but save the current location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && role !== "admin") {
    // If admin is required but user is not admin, redirect to home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
