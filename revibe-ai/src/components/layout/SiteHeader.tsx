import Link from "next/link";

import { Logo } from "@/components/brand/Logo";
import { buttonStyles } from "@/components/ui/Button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          aria-label="Revibe AI home"
          className="shrink-0 rounded-xl px-2 py-1.5 ring-1 ring-transparent transition-colors hover:bg-muted/70 hover:ring-border"
        >
          <Logo />
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/profile"
            className={buttonStyles({
              variant: "ghost",
              className:
                "hidden text-foreground/80 hover:text-foreground hover:bg-muted/80 sm:inline-flex",
            })}
          >
            Profile
          </Link>
          <Link
            href="/community"
            className={buttonStyles({
              variant: "ghost",
              className:
                "hidden text-foreground/80 hover:text-foreground hover:bg-muted/80 sm:inline-flex",
            })}
          >
            Community
          </Link>
          <Link
            href="/upload"
            className={buttonStyles({
              variant: "primary",
              className: "shadow-soft-sm",
            })}
          >
            Upload
          </Link>
        </nav>
      </div>
    </header>
  );
}
