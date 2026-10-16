export function FareSkeleton() {
  return (
    <li aria-hidden className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
      <span className="skeleton h-10 w-10 shrink-0 rounded-md" />
      <div className="flex-1 space-y-2">
        <span className="skeleton block h-3.5 w-32" />
        <span className="skeleton block h-3 w-48 max-w-full" />
      </div>
      <div className="space-y-2">
        <span className="skeleton ml-auto block h-4 w-14" />
        <span className="skeleton block h-3 w-20" />
      </div>
    </li>
  );
}
