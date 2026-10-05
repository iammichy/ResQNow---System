const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export async function apiFetch(endpoint, options = {}) {
  const token =
    localStorage.getItem("resqnow_token") ||
    sessionStorage.getItem("resqnow_token");

  const headers = {
    Accept: "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Siguraduhing may slash ang endpoint
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${baseURL}${normalizedEndpoint}`, config);

  /*
   * TOKEN-AWARE 401 CLEANUP
   *
   * A response may arrive after another login has already
   * replaced the token. Never allow an old in-flight request
   * to erase the newer authenticated session.
   */
  if (
    response.status === 401 &&
    token
  ) {
    const currentToken =
      localStorage.getItem("resqnow_token") ||
      sessionStorage.getItem("resqnow_token");

    if (currentToken === token) {
      localStorage.removeItem("resqnow_token");
      localStorage.removeItem("resqnow_user");

      sessionStorage.removeItem("resqnow_token");
      sessionStorage.removeItem("resqnow_user");
    }
  }

  return response;
}
