import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = sessionStorage.getItem("user_token");
  
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
    sessionStorage.removeItem("user_token");
    sessionStorage.removeItem("user_role");
    sessionStorage.removeItem("user_name");
    sessionStorage.removeItem("last_activity");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  return response;
}
