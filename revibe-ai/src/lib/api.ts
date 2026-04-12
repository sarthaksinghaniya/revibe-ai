const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, "");

export const buildApiUrl = (path: string): string => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const apiFetch = async (
  path: string,
  init?: RequestInit
): Promise<Response> => {
  return fetch(buildApiUrl(path), init);
};

export const apiGetJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await apiFetch(path, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
};

export type HealthResponse = {
  success: boolean;
  data: {
    status: string;
    time: string;
  };
};

export const getHealth = (): Promise<HealthResponse> => {
  return apiGetJson<HealthResponse>("/api/health");
};

export const logApiBaseUrl = (): void => {
  console.log("[api] NEXT_PUBLIC_API_BASE_URL:", API_BASE_URL || "(not set)");
};
