import { API_BASE_URL } from "../config";

/**
 * Fetch wrapper that automatically attaches the JWT token from localStorage.
 */
export async function apiFetch(path: string, options?: RequestInit) {
  const token = localStorage.getItem("token");
  
  const headers = new Headers(options?.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
}
