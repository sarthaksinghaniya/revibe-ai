export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 text-sm text-foreground/70 sm:px-6">
        <p>
          © {new Date().getFullYear()} Revibe AI — e-waste upcycling made simple.
        </p>
      </div>
    </footer>
  );
}
