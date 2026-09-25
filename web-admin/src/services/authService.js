import { apiFetch } from "./apiClient";

/**
 * Log in a user.
 */
export async function login(email, password, rememberMe = false) {
  const response = await apiFetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.message || "Login failed.");
  }

  // Store the Sanctum token based on the Remember Me option.
  const user = result.data.user;
  const token = result.data.token;

  const storage = rememberMe ? localStorage : sessionStorage;

  storage.setItem("resqnow_token", token);
  storage.setItem("resqnow_user", JSON.stringify(user));

  return {
    ...result,
    user,
    token,
  };
}

/**
 * Get the currently authenticated user.
 */
export async function getCurrentUser() {
  const response = await apiFetch("/me");

  if (!response.ok) {
    throw new Error("Failed to retrieve authenticated user.");
  }

  const result = await response.json();

  return result.data;
}

/**
 * Log out the current user.
 */
export async function logout() {
  try {
    const response = await apiFetch("/logout", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Logout failed.");
    }

    return await response.json();
  } finally {
    localStorage.removeItem("resqnow_token");
    localStorage.removeItem("resqnow_user");

    sessionStorage.removeItem("resqnow_token");
    sessionStorage.removeItem("resqnow_user");
  }
}

/**
 * Get the locally stored authentication token.
 */
export function getAuthToken() {
  return (
    localStorage.getItem("resqnow_token") ||
    sessionStorage.getItem("resqnow_token")
  );
}

/**
 * Get the locally stored user.
 */
export function getStoredUser() {
  const user =
    localStorage.getItem("resqnow_user") ||
    sessionStorage.getItem("resqnow_user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

/**
 * Check whether a user is currently logged in.
 */
export function isAuthenticated() {
  return Boolean(getAuthToken());
}