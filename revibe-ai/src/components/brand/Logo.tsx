export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-border">
        <span className="text-sm font-semibold text-primary">R</span>
      </div>
      <span className="font-semibold tracking-tight text-foreground">
        Revibe <span className="text-primary">AI</span>
      </span>
    </div>
  );
}
