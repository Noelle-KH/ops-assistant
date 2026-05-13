import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const TIMEOUT_DURATION = 60 * 60 * 1000; // 60 minutes in milliseconds

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const token = localStorage.getItem("user_token");
  const role = localStorage.getItem("user_role");
  const lastActivity = localStorage.getItem("last_activity");
  const location = useLocation();
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!token) return;

    const checkTimeout = () => {
      const now = Date.now();
      const lastAction = parseInt(lastActivity || "0", 10);

      if (lastAction && now - lastAction > TIMEOUT_DURATION) {
        localStorage.removeItem("user_token");
        localStorage.removeItem("user_role");
        localStorage.removeItem("user_name");
        localStorage.removeItem("last_activity");
        setIsExpired(true);
        toast.error("Session 已過期，請重新登入");
      }
    };

    // Initial check
    checkTimeout();

    // Update last activity on any user interaction
    const updateActivity = () => {
      localStorage.setItem("last_activity", Date.now().toString());
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

  if (requireAdmin && role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

