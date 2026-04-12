"use client";

import { useEffect, useMemo, useState } from "react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getGitHubPublicData, type GitHubPublicData } from "@/lib/api";

function normalizeGitHubUsername(value: string) {
  return value.trim().replace(/^@+/, "");
}

const LINKED_REPOS_STORAGE_KEY = "revibe.github.linkedRepoIdsByUsername";

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

export function GitHubConnectCard() {
  const [usernameInput, setUsernameInput] = useState("");
  const [connectedUsername, setConnectedUsername] = useState<string | null>(null);
  const [githubData, setGithubData] = useState<GitHubPublicData | null>(null);
  const [linkedRepoIds, setLinkedRepoIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedInput = useMemo(
    () => normalizeGitHubUsername(usernameInput),
    [usernameInput]
  );

  const canSave = normalizedInput.length >= 2;
  const linkedRepos = useMemo(() => {
    if (!githubData) return [];
    return githubData.repos.filter((repo) => linkedRepoIds.includes(repo.id));
  }, [githubData, linkedRepoIds]);

  useEffect(() => {
    if (!connectedUsername) return;
    const map = readLinkedRepoMap();
    map[connectedUsername] = linkedRepoIds;
    writeLinkedRepoMap(map);
  }, [connectedUsername, linkedRepoIds]);

  async function onSave() {
    if (!canSave) {
      setError("Please enter a valid GitHub username (at least 2 characters).");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getGitHubPublicData(normalizedInput);
      const username = response.data.profile.username;
      const validPersisted = (readLinkedRepoMap()[username] ?? []).filter((repoId) =>
        response.data.repos.some((repo) => repo.id === repoId)
      );

      setConnectedUsername(username);
      setGithubData(response.data);
      setLinkedRepoIds(validPersisted);
    } catch (fetchError) {
      setGithubData(null);
      setConnectedUsername(null);
      setLinkedRepoIds([]);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Could not fetch GitHub profile right now."
      );
    } finally {
      setIsLoading(false);
    }
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
            Add your public GitHub username. We’ll use this later to showcase
            selected public projects on your Revibe AI profile.
          </p>
        </div>
        <StatusBadge
          label={connectedUsername ? "Connected" : "Not connected"}
          variant={connectedUsername ? "low" : "neutral"}
        />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="grid gap-2">
          <span className="text-sm font-medium">GitHub username</span>
          <input
            value={usernameInput}
            onChange={(e) => {
              setUsernameInput(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. octocat"
            autoComplete="off"
            spellCheck={false}
            className="h-11 rounded-full bg-card px-4 text-sm ring-1 ring-border outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <Button onClick={onSave} disabled={!canSave || isLoading}>
          {isLoading ? "Connecting..." : connectedUsername ? "Update" : "Connect"}
        </Button>
      </div>

      {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}

      <div className="mt-4 rounded-2xl bg-muted/60 p-4 ring-1 ring-border">
        {connectedUsername ? (
          <p className="text-sm text-foreground/80">
            Connected as{" "}
            <span className="font-semibold text-foreground">@{connectedUsername}</span>
          </p>
        ) : (
          <p className="text-sm text-foreground/70">
            Connect your username to preview how your developer identity will
            appear on your profile.
          </p>
        )}
      </div>

      {isLoading ? (
        <Card className="mt-4 rounded-2xl bg-muted/40 p-4 ring-1 ring-border">
          <p className="text-sm text-foreground/70">Fetching public GitHub profile...</p>
        </Card>
      ) : null}

      {githubData ? (
        <div className="mt-4 grid gap-4">
          <Card className="rounded-2xl p-5">
            <div className="flex items-start gap-4">
              {githubData.profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- External avatar URL from GitHub public API
                <img
                  src={githubData.profile.avatarUrl}
                  alt={`${githubData.profile.username} avatar`}
                  className="h-14 w-14 rounded-full ring-1 ring-border object-cover"
                />
              ) : (
                <div className="h-14 w-14 rounded-full bg-muted ring-1 ring-border" />
              )}
              <div className="min-w-0">
                <p className="text-base font-semibold">
                  {githubData.profile.name || githubData.profile.username}
                </p>
                <p className="text-sm text-foreground/70">@{githubData.profile.username}</p>
                <p className="mt-2 text-sm leading-6 text-foreground/75">
                  {githubData.profile.bio || "No public bio available."}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge label={`${githubData.profile.followers} followers`} />
                  <StatusBadge label={`${githubData.profile.following} following`} />
                  <StatusBadge label={`${githubData.profile.publicRepos} public repos`} />
                </div>
                <a
                  href={githubData.profile.profileUrl}
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
              <span className="text-xs text-foreground/60">
                Showing {githubData.repos.length}
              </span>
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
      ) : null}
    </Card>
  );
}
