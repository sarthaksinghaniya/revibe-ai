"use client";

import { useMemo, useState } from "react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";

function normalizeGitHubUsername(value: string) {
  return value.trim().replace(/^@+/, "");
}

export function GitHubConnectCard() {
  const [usernameInput, setUsernameInput] = useState("");
  const [connectedUsername, setConnectedUsername] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const normalizedInput = useMemo(
    () => normalizeGitHubUsername(usernameInput),
    [usernameInput]
  );

  const canSave = normalizedInput.length >= 2;

  function onSave() {
    if (!canSave) {
      setError("Please enter a valid GitHub username (at least 2 characters).");
      return;
    }

    setConnectedUsername(normalizedInput);
    setError(null);
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
            onChange={(e) => setUsernameInput(e.target.value)}
            placeholder="e.g. octocat"
            autoComplete="off"
            spellCheck={false}
            className="h-11 rounded-full bg-card px-4 text-sm ring-1 ring-border outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <Button onClick={onSave} disabled={!canSave}>
          {connectedUsername ? "Update" : "Connect"}
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
    </Card>
  );
}
