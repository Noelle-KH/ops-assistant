import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  allowedRoles?: string[];
}

const TIMEOUT_DURATION = 60 * 60 * 1000; // 60 minutes in milliseconds

export function AuthGuard({ children, requireAdmin = false, allowedRoles }: AuthGuardProps) {
  const token = sessionStorage.getItem("user_token");
  const role = sessionStorage.getItem("user_role");
  const lastActivity = sessionStorage.getItem("last_activity");
  const location = useLocation();
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!token) return;

    const checkTimeout = () => {
      const now = Date.now();
      const lastAction = parseInt(lastActivity || "0", 10);

      if (lastAction && now - lastAction > TIMEOUT_DURATION) {
        sessionStorage.removeItem("user_token");
        sessionStorage.removeItem("user_role");
        sessionStorage.removeItem("user_name");
        sessionStorage.removeItem("last_activity");
        setIsExpired(true);
        toast.error("Session 已過期，請重新登入");
      }
    };

    // Initial check
    checkTimeout();

    // Update last activity on any user interaction
    const updateActivity = () => {
      sessionStorage.setItem("last_activity", Date.now().toString());
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach(event => window.addEventListener(event, updateActivity));

    // Also check every minute
    const interval = setInterval(checkTimeout, 60000);

    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity));
      clearInterval(interval);
    };
  }, [token, lastActivity]);

  if (!token || isExpired) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check legacy requireAdmin
  if (requireAdmin && role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Check granular allowedRoles
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

