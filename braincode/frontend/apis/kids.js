import { request } from "./client";

export function saveKidInfo(payload) {
  return request("/api/kids", {
    method: "POST",
    body: payload,
  });
}
