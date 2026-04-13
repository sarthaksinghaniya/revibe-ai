"use client";

import { useEffect, useMemo, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";

function toUserMessage(errorCode: string | null): string {
  if (!errorCode) return "GitHub authentication failed. Please try again.";
  if (errorCode === "AccessDenied" || errorCode === "oauth_denied") {
    return "GitHub access was denied by the user.";
  }
  return "GitHub authentication failed. Please try again.";
}

export default function GitHubConnectCard() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isConnected = status === "authenticated";

  const profileLabel = useMemo(() => {
    const user = session?.user;
    if (!user) return "";
    return user.name || user.email || "GitHub user";
  }, [session]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const url = new URL(window.location.href);
    const githubState = url.searchParams.get("github");
    const githubSuccess = url.searchParams.get("github_success");
    const githubError = url.searchParams.get("github_error");
    const authError = url.searchParams.get("error");

    queueMicrotask(() => {
      if (githubState === "connected" || githubSuccess === "1") {
        setNotice("GitHub connected successfully.");
      }
      if (githubError || authError) {
        setError(toUserMessage(githubError || authError));
      }
      setIsRedirecting(false);
    });

    if (!githubState && !githubSuccess && !githubError && !authError) return;

    url.searchParams.delete("github");
    url.searchParams.delete("github_success");
    url.searchParams.delete("github_error");
    url.searchParams.delete("github_error_message");
    url.searchParams.delete("error");
    window.history.replaceState({}, "", url.toString());
  }, [mounted]);

  async function handleConnect() {
    setIsRedirecting(true);
    setError(null);
    setNotice(null);
    await signIn("github", { callbackUrl: "/profile?github_success=1" });
  }

  async function handleDisconnect() {
    setError(null);
    setNotice("GitHub disconnected.");
    await signOut({ callbackUrl: "/profile" });
  }

  if (!mounted) {
    return (
      <Card className="p-6 sm:p-7">
        <div className="mt-4 rounded-2xl bg-muted/60 p-4 ring-1 ring-border">
          <p className="text-sm text-foreground/70">Loading GitHub connection...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">GitHub Connection</h2>
          <p className="mt-1 text-sm leading-6 text-foreground/70">
            Sign in with GitHub using NextAuth. OAuth routes are handled by Next.js
            under <code>/api/auth/*</code>.
          </p>
        </div>
        <StatusBadge
          label={isConnected ? "Connected" : "Not connected"}
          variant={isConnected ? "low" : "neutral"}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {!isConnected ? (
          <Button onClick={handleConnect} disabled={isRedirecting || status === "loading"}>
            {isRedirecting ? "Redirecting to GitHub..." : "Continue with GitHub"}
          </Button>
        ) : (
          <Button variant="outline" onClick={handleDisconnect}>
            Disconnect GitHub
          </Button>
        )}
        <p className="text-sm text-foreground/70">GitHub OAuth is handled by NextAuth.</p>
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

      {isConnected ? (
        <div className="mt-4 rounded-2xl bg-muted/60 p-4 ring-1 ring-border">
          <p className="text-sm text-foreground/80">
            Connected as <span className="font-semibold">{profileLabel}</span>.
          </p>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl bg-muted/60 p-4 ring-1 ring-border">
          <p className="text-sm text-foreground/70">
            Connect GitHub to enable authenticated profile features.
          </p>
        </div>
      )}
    </Card>
  );
}
