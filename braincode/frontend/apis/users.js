import { request } from "./client";

export function getMe() {
  return request("/api/users/me");
}

export function updateMe(payload) {
  return request("/api/users/me", {
    method: "PUT",
    body: payload,
  });
}
