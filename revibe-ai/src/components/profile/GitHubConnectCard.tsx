"use client";

import { useEffect, useMemo, useState } from "react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { buildApiUrl, type GitHubPublicRepo } from "@/lib/api";

type OAuthGitHubData = {
  username: string;
  name: string | null;
  avatarUrl: string | null;
  profileUrl: string;
  repos: GitHubPublicRepo[];
};

type InitialGitHubState = {
  githubData: OAuthGitHubData | null;
  linkedRepoIds: number[];
  error: string | null;
  notice: string | null;
  hadOAuthParams: boolean;
};

const LINKED_REPOS_STORAGE_KEY = "revibe.github.linkedRepoIdsByUsername";
const CONNECTED_GITHUB_STORAGE_KEY = "revibe.github.connectedProfile";

function readLinkedRepoMap(): Record<string, number[]> {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(LINKED_REPOS_STORAGE_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as Record<string, number[]>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeLinkedRepoMap(value: Record<string, number[]>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LINKED_REPOS_STORAGE_KEY, JSON.stringify(value));
}

function readPersistedGitHubData(): OAuthGitHubData | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(CONNECTED_GITHUB_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as OAuthGitHubData;
    if (!parsed?.username || !Array.isArray(parsed?.repos)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writePersistedGitHubData(value: OAuthGitHubData | null) {
  if (typeof window === "undefined") return;
  if (!value) {
    window.localStorage.removeItem(CONNECTED_GITHUB_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(CONNECTED_GITHUB_STORAGE_KEY, JSON.stringify(value));
}

function decodeOAuthPayload(encoded: string): OAuthGitHubData {
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const json = window.atob(padded);
  return JSON.parse(json) as OAuthGitHubData;
}

function deriveInitialState(): InitialGitHubState {
  if (typeof window === "undefined") {
    return {
      githubData: null,
      linkedRepoIds: [],
      error: null,
      notice: null,
      hadOAuthParams: false,
    };
  }

  const url = new URL(window.location.href);
  const oauthStatus = url.searchParams.get("github_oauth");
  const oauthError = url.searchParams.get("github_error");
  const oauthData = url.searchParams.get("github_data");

  if (oauthStatus === "success" && oauthData) {
    try {
      const decoded = decodeOAuthPayload(oauthData);
      const persisted = readLinkedRepoMap()[decoded.username] ?? [];
      const validPersisted = persisted.filter((repoId) =>
        decoded.repos.some((repo) => repo.id === repoId)
      );

      return {
        githubData: decoded,
        linkedRepoIds: validPersisted,
        error: null,
        notice: `Connected as @${decoded.username}`,
        hadOAuthParams: true,
      };
    } catch {
      return {
        githubData: null,
        linkedRepoIds: [],
        error: "GitHub callback data could not be parsed. Please reconnect.",
        notice: null,
        hadOAuthParams: true,
      };
    }
  }

  if (oauthStatus === "error") {
    return {
      githubData: null,
      linkedRepoIds: [],
      error: oauthError || "GitHub authentication failed. Please try again.",
      notice: null,
      hadOAuthParams: true,
    };
  }

  const persistedProfile = readPersistedGitHubData();
  if (persistedProfile) {
    const linked = (readLinkedRepoMap()[persistedProfile.username] ?? []).filter((repoId) =>
      persistedProfile.repos.some((repo) => repo.id === repoId)
    );

    return {
      githubData: persistedProfile,
      linkedRepoIds: linked,
      error: null,
      notice: `Connected as @${persistedProfile.username}`,
      hadOAuthParams: false,
    };
  }

  return {
    githubData: null,
    linkedRepoIds: [],
    error: null,
    notice: null,
    hadOAuthParams: false,
  };
}

export function GitHubConnectCard() {
  const [initialState] = useState<InitialGitHubState>(deriveInitialState);
  const [githubData, setGithubData] = useState<OAuthGitHubData | null>(
    initialState.githubData
  );
  const [linkedRepoIds, setLinkedRepoIds] = useState<number[]>(initialState.linkedRepoIds);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(initialState.error);
  const [notice, setNotice] = useState<string | null>(initialState.notice);

  const linkedRepos = useMemo(() => {
    if (!githubData) return [];
    return githubData.repos.filter((repo) => linkedRepoIds.includes(repo.id));
  }, [githubData, linkedRepoIds]);

  useEffect(() => {
    if (!githubData?.username) return;
    const map = readLinkedRepoMap();
    map[githubData.username] = linkedRepoIds;
    writeLinkedRepoMap(map);
  }, [githubData, linkedRepoIds]);

  useEffect(() => {
    writePersistedGitHubData(githubData);
  }, [githubData]);

  useEffect(() => {
    if (!initialState.hadOAuthParams || typeof window === "undefined") return;

    const url = new URL(window.location.href);
    url.searchParams.delete("github_oauth");
    url.searchParams.delete("github_error");
    url.searchParams.delete("github_data");
    window.history.replaceState({}, "", url.toString());
  }, [initialState.hadOAuthParams]);

  function startOAuthFlow() {
    if (typeof window === "undefined") return;
    setIsRedirecting(true);
    setError(null);
    setNotice(null);

    const returnTo = `${window.location.origin}/profile`;
    const authUrl = buildApiUrl(`/api/github/auth?redirect=${encodeURIComponent(returnTo)}`);
    window.location.href = authUrl;
  }

  function disconnectGithub() {
    setGithubData(null);
    setLinkedRepoIds([]);
    setNotice("GitHub disconnected.");
    setError(null);
    writePersistedGitHubData(null);
  }

  function toggleLinkedRepo(repoId: number) {
    setLinkedRepoIds((prev) =>
      prev.includes(repoId) ? prev.filter((id) => id !== repoId) : [...prev, repoId]
    );
  }

  return (
    <Card className="p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">GitHub Connection</h2>
          <p className="mt-1 text-sm leading-6 text-foreground/70">
            Connect your GitHub account securely. We’ll show selected public projects
            on your Revibe AI profile.
          </p>
        </div>
        <StatusBadge
          label={githubData ? "Connected" : "Not connected"}
          variant={githubData ? "low" : "neutral"}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button onClick={startOAuthFlow} disabled={isRedirecting}>
          {isRedirecting
            ? "Redirecting to GitHub..."
            : githubData
            ? "Reconnect GitHub"
            : "Connect GitHub"}
        </Button>
        {githubData ? (
          <Button variant="outline" onClick={disconnectGithub}>
            Disconnect GitHub
          </Button>
        ) : null}
        <p className="text-sm text-foreground/70">
          OAuth flow only uses public GitHub account data.
        </p>
      </div>

      {notice ? (
        <p className="mt-3 text-sm text-foreground/70" aria-live="polite">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 text-sm text-rose-700" role="alert">
          {error}
        </p>
      ) : null}

      {!githubData ? (
        <div className="mt-4 rounded-2xl bg-muted/60 p-4 ring-1 ring-border">
          <p className="text-sm text-foreground/70">
            Connect GitHub to preview your public profile and choose featured repositories.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-4">
          <Card className="rounded-2xl p-5">
            <div className="flex items-start gap-4">
              {githubData.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- External avatar URL from GitHub OAuth profile response
                <img
                  src={githubData.avatarUrl}
                  alt={`${githubData.username} avatar`}
                  className="h-14 w-14 rounded-full ring-1 ring-border object-cover"
                />
              ) : (
                <div className="h-14 w-14 rounded-full bg-muted ring-1 ring-border" />
              )}
              <div className="min-w-0">
                <p className="text-base font-semibold">{githubData.name || githubData.username}</p>
                <p className="text-sm text-foreground/70">@{githubData.username}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge label={`${githubData.repos.length} public repos`} />
                </div>
                <a
                  href={githubData.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
                >
                  View GitHub profile
                </a>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">Featured GitHub Projects</h3>
              <span className="text-xs text-foreground/60">{linkedRepos.length} linked</span>
            </div>
            {linkedRepos.length > 0 ? (
              <div className="mt-3 grid gap-3">
                {linkedRepos.map((repo) => (
                  <div key={repo.id} className="rounded-xl bg-muted/50 p-4 ring-1 ring-border">
                    <div className="flex items-center justify-between gap-2">
                      <a
                        href={repo.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-foreground hover:text-primary hover:underline"
                      >
                        {repo.name}
                      </a>
                      <Button variant="outline" size="sm" onClick={() => toggleLinkedRepo(repo.id)}>
                        Remove
                      </Button>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-foreground/70">
                      {repo.description || "No description provided."}
                    </p>
                    <p className="mt-2 text-xs text-foreground/60">
                      {repo.language || "Language not specified"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-foreground/70">
                No linked projects yet. Add repositories below to feature them on your profile.
              </p>
            )}
          </Card>

          <Card className="rounded-2xl p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">Public repositories</h3>
              <span className="text-xs text-foreground/60">Showing {githubData.repos.length}</span>
            </div>
            {githubData.repos.length > 0 ? (
              <div className="mt-3 grid gap-3">
                {githubData.repos.map((repo) => (
                  <div key={repo.id} className="rounded-xl bg-muted/50 p-4 ring-1 ring-border">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <a
                        href={repo.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-foreground hover:text-primary hover:underline"
                      >
                        {repo.name}
                      </a>
                      <div className="flex items-center gap-2 text-xs text-foreground/60">
                        <span>{repo.stars} stars</span>
                        <span>•</span>
                        <span>{repo.forks} forks</span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-foreground/70">
                      {repo.description || "No description provided."}
                    </p>
                    <p className="mt-2 text-xs text-foreground/60">
                      {repo.language || "Language not specified"}
                    </p>
                    <div className="mt-3">
                      <Button
                        variant={linkedRepoIds.includes(repo.id) ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => toggleLinkedRepo(repo.id)}
                      >
                        {linkedRepoIds.includes(repo.id) ? "Linked" : "Add to linked projects"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-foreground/70">
                No public repositories found for this account.
              </p>
            )}
          </Card>
        </div>
      )}
    </Card>
  );
}
