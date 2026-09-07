// Shared API client for the backend (proxied to the API under /api/v1 in dev).
// Handles JSON, the Authorization header, error normalization, and 401 -> logout.

const BASE_URL = "/api/v1";

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors; // field errors from the backend, when present
  }
}

function getToken() {
  return localStorage.getItem("token");
}

async function request(
  path,
  { method = "GET", body, auth = true, headers = {}, skipAuthRedirect = false } = {},
) {
  const options = { method, headers: { ...headers } };

  if (body !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  // Only send the token for authenticated requests.
  const token = auth ? getToken() : null;
  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, options);

  // An expired/invalid token on an authenticated request -> clear it and send the user to login.
  // Callers that handle 401 themselves can opt out with skipAuthRedirect.
  if (response.status === 401 && token && !skipAuthRedirect) {
    localStorage.removeItem("token");
    if (window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
    throw new ApiError("Your session has expired. Please log in again.", 401);
  }

  // Parse the body (some responses have none).
  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    const message =
      data?.message ||
      (data?.errors && Object.values(data.errors).flat().join(" ")) ||
      "Something went wrong. Please try again.";
    throw new ApiError(message, response.status, data?.errors);
  }

  return data;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  patch: (path, body, opts) => request(path, { ...opts, method: "PATCH", body }),
  delete: (path, body, opts) => request(path, { ...opts, method: "DELETE", body }),
};
