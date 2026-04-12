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

export const apiPostJson = async <TResponse>(
  path: string,
  body: unknown,
  init?: RequestInit
): Promise<TResponse> => {
  const response = await apiFetch(path, {
    method: "POST",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as TResponse;
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

export type AnalyzeRequest = {
  itemName: string;
  notes?: string;
};

export type AnalyzeIdea = {
  id: string;
  title: string;
  difficulty: string;
  estimatedCost: string;
  description: string;
};

export type AnalyzeResponse = {
  success: boolean;
  data: {
    material: string;
    confidence: number;
    risk: string;
    sustainabilityScore: number;
    ideas: AnalyzeIdea[];
    steps: string[];
  };
};

export const analyzeItem = (payload: AnalyzeRequest): Promise<AnalyzeResponse> => {
  return apiPostJson<AnalyzeResponse>("/api/analyze", payload);
};

export type CommunityPost = {
  id: string;
  userName: string;
  avatarInitials: string;
  imageSrc: string;
  caption: string;
  likes: number;
  comments: number;
  progressPct: number;
  createdAt: string;
};

export type GetPostsResponse = {
  success: boolean;
  data: CommunityPost[];
};

export const getPosts = (): Promise<GetPostsResponse> => {
  return apiGetJson<GetPostsResponse>("/api/posts");
};

export type CreatePostRequest = {
  userName: string;
  caption: string;
  imageSrc?: string;
  progressPct?: number;
};

export type CreatePostResponse = {
  success: boolean;
  data: CommunityPost;
};

export const createPost = (
  payload: CreatePostRequest
): Promise<CreatePostResponse> => {
  return apiPostJson<CreatePostResponse>("/api/posts", payload);
};

export type GitHubPublicProfile = {
  username: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  followers: number;
  following: number;
  publicRepos: number;
  profileUrl: string;
};

export type GitHubPublicRepo = {
  id: number;
  name: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  repoUrl: string;
  updatedAt: string;
};

export type GitHubPublicData = {
  profile: GitHubPublicProfile;
  repos: GitHubPublicRepo[];
};

export type GitHubPublicResponse = {
  success: boolean;
  data: GitHubPublicData;
};

export const getGitHubPublicData = async (
  username: string
): Promise<GitHubPublicResponse> => {
  const response = await apiFetch(`/api/github/${encodeURIComponent(username)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof payload?.error?.message === "string"
        ? payload.error.message
        : `Request failed: ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  return payload as GitHubPublicResponse;
};

export const logApiBaseUrl = (): void => {
  console.log("[api] NEXT_PUBLIC_API_BASE_URL:", API_BASE_URL || "(not set)");
};
