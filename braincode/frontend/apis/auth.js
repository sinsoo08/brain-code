import { request, refreshSession } from "./client";
import { clearAuthSession, setAuthSession } from "./session";

export async function login(payload) {
  const data = await request("/api/auth/login", {
    method: "POST",
    auth: false,
    retryOn401: false,
    body: payload,
  });

  setAuthSession(data);
  return data;
}

export async function signup(payload) {
  const data = await request("/api/auth/signup", {
    method: "POST",
    auth: false,
    retryOn401: false,
    body: payload,
  });

  setAuthSession(data);
  return data;
}

export async function refreshAuthSession() {
  return refreshSession();
}

export async function logout() {
  try {
    await request("/api/auth/logout", {
      method: "POST",
      retryOn401: false,
    });
  } finally {
    clearAuthSession();
  }
}
