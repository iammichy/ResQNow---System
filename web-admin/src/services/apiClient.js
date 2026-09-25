const API_BASE_URL = "http://127.0.0.1:8000/api";

export async function apiFetch(endpoint, options = {}) {
  const token =
  localStorage.getItem("resqnow_token") ||
  sessionStorage.getItem("resqnow_token");

  const headers = {
    Accept: "application/json",
    ...options.headers,
  };

  // Attach Sanctum token when available
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle authentication failure
  if (response.status === 401) {
    throw new Error("Unauthenticated. Please log in again.");
  }

  // Handle authorization failure
  if (response.status === 403) {
    throw new Error("You are not authorized to perform this action.");
  }

  return response;
}
