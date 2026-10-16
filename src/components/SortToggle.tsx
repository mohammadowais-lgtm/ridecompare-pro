import { cn } from "@/lib/utils";

export type SortKey = "price" | "pickup";

export function SortToggle({ value, onChange }: { value: SortKey; onChange: (v: SortKey) => void }) {
  const opts: { id: SortKey; label: string }[] = [
    { id: "price", label: "Price" },
    { id: "pickup", label: "Pickup" },
  ];
  return (
    <div role="radiogroup" aria-label="Sort by" className="inline-flex rounded-md border border-border bg-card p-0.5">
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "focus-ring h-7 rounded-[6px] px-2.5 text-xs font-medium transition-colors",
            value === o.id ? "bg-foreground text-card" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
