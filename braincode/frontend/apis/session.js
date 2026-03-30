const ACCESS_TOKEN_KEY = "accessToken";
const USER_EMAIL_KEY = "userEmail";
const LOGGED_IN_KEY = "isLoggedIn";

function hasStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getAccessToken() {
  if (!hasStorage()) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token) {
  if (!hasStorage()) return;

  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(LOGGED_IN_KEY, "true");
    return;
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(LOGGED_IN_KEY);
}

export function setAuthSession(authResponse) {
  if (!hasStorage() || !authResponse?.token) return;

  setAccessToken(authResponse.token);

  if (authResponse.email) {
    localStorage.setItem(USER_EMAIL_KEY, authResponse.email);
  } else {
    localStorage.removeItem(USER_EMAIL_KEY);
  }
}

export function clearAuthSession() {
  if (!hasStorage()) return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
  localStorage.removeItem(LOGGED_IN_KEY);
}
