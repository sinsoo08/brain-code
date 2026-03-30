import { clearAuthSession, getAccessToken, setAuthSession } from "./session";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(message, status, payload = null, cause = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
    this.cause = cause;
  }
}

let refreshPromise = null;

function isAbsoluteUrl(path) {
  return /^https?:\/\//i.test(path);
}

function isAuthRoute(path) {
  return typeof path === "string" && path.startsWith("/api/auth/");
}

function buildUrl(path) {
  if (isAbsoluteUrl(path)) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function normalizeBody(body, headers) {
  if (
    body == null ||
    body instanceof FormData ||
    typeof body === "string" ||
    body instanceof URLSearchParams ||
    body instanceof Blob
  ) {
    return body;
  }

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return JSON.stringify(body);
}

async function readPayload(response) {
  const contentType = response.headers.get("content-type") ?? "";
  const text = await response.text();

  if (!text) return null;

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  return text;
}

async function createApiError(response) {
  const payload = await readPayload(response).catch(() => null);
  const message =
    payload && typeof payload === "object" && "message" in payload
      ? payload.message
      : `API request failed with status ${response.status}`;

  return new ApiError(message, response.status, payload);
}

async function runFetch(url, init) {
  try {
    return await fetch(url, init);
  } catch (error) {
    throw new ApiError("서버에 연결할 수 없습니다. 백엔드 서버를 확인해주세요.", 0, null, error);
  }
}

export async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await runFetch(buildUrl("/api/auth/refresh"), {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw await createApiError(response);
      }

      const data = await readPayload(response);
      if (!data?.token) {
        throw new ApiError("토큰 갱신 응답이 올바르지 않습니다.", response.status, data);
      }

      setAuthSession(data);
      return data;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function request(path, options = {}) {
  const {
    auth = true,
    retryOn401 = auth,
    headers: initialHeaders,
    body,
    ...rest
  } = options;

  const headers = new Headers(initialHeaders ?? {});
  const normalizedBody = normalizeBody(body, headers);

  if (auth) {
    const accessToken = getAccessToken();
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  const response = await runFetch(buildUrl(path), {
    ...rest,
    headers,
    body: normalizedBody,
    credentials: "include",
  });

  if (response.status === 401 && retryOn401 && !isAuthRoute(path)) {
    try {
      await refreshSession();
      return request(path, { ...options, retryOn401: false });
    } catch (error) {
      clearAuthSession();
      throw error;
    }
  }

  if (!response.ok) {
    throw await createApiError(response);
  }

  if (response.status === 204) {
    return null;
  }

  return readPayload(response);
}
