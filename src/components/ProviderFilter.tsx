import { motion } from "framer-motion";
import { PROVIDER_NAMES, type FareOption, type Provider } from "@/lib/fare-engine";
import { cn } from "@/lib/utils";
import { ProviderLogo } from "./ProviderLogo";

export type ProviderFilterValue = "all" | Provider;
const ORDER: Provider[] = ["uber", "ola", "rapido", "nammayatri"];

export function ProviderFilter({
  value,
  fares,
  onChange,
}: {
  value: ProviderFilterValue;
  fares: FareOption[];
  onChange: (v: ProviderFilterValue) => void;
}) {
  const items: { id: ProviderFilterValue; label: string; count: number }[] = [
    { id: "all", label: "All providers", count: fares.length },
    ...ORDER.map((p) => ({ id: p, label: PROVIDER_NAMES[p], count: fares.filter((f) => f.provider === p).length })),
  ];
  return (
    <div role="radiogroup" aria-label="Filter by provider" className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
      {items.map((it) => {
        const active = value === it.id;
        return (
          <button
            key={it.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(it.id)}
            className={cn(
              "focus-ring relative inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors",
              active ? "border-foreground text-card" : "border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground",
            )}
          >
            {active && (
              <motion.span layoutId="provider-chip" className="absolute inset-0 rounded-[7px] bg-foreground" transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} />
            )}
            <span className="relative inline-flex items-center gap-1.5">
              {it.id !== "all" && <ProviderLogo provider={it.id} size={16} />}
              {it.label}
              <span className={cn("tabular", active ? "text-card/70" : "text-faint")}>{it.count}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
