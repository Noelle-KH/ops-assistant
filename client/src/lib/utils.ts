import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("user_token");
  
  const headers = {
    ...options.headers,
    "Authorization": token ? `Bearer ${token}` : "",
  } as Record<string, string>;

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_name");
    localStorage.removeItem("last_activity");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  return response;
}
