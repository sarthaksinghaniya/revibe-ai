import Link from "next/link";

import { Logo } from "@/components/brand/Logo";
import { buttonStyles } from "@/components/ui/Button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/75 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Revibe AI home" className="shrink-0">
          <Logo />
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/community"
            className={buttonStyles({
              variant: "ghost",
              className: "hidden sm:inline-flex",
            })}
          >
            Community
          </Link>
          <Link href="/upload" className={buttonStyles({ variant: "outline" })}>
            Upload
          </Link>
        </nav>
      </div>
    </header>
  );
}
