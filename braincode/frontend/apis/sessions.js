import { request } from "./client";

export function startSession(payload) {
  return request("/api/sessions/start", {
    method: "POST",
    body: payload,
  });
}

export function endSession(sessionId, payload) {
  return request(`/api/sessions/${sessionId}/end`, {
    method: "POST",
    body: payload,
  });
}

export function getHistory() {
  return request("/api/sessions/history");
}

export function getStats() {
  return request("/api/sessions/stats");
}
