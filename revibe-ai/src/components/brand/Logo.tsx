export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-7 w-7 rounded-lg bg-primary/10 ring-1 ring-border grid place-items-center">
        <span className="text-sm font-semibold text-primary">R</span>
      </div>
      <span className="font-semibold tracking-tight text-foreground">
        Revibe <span className="text-primary">AI</span>
      </span>
    </div>
  );
}
