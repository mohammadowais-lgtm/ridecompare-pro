import { motion } from "framer-motion";
import type { VehicleType } from "@/lib/fare-engine";
import { cn } from "@/lib/utils";

export type VehicleFilter = "all" | VehicleType;

const TABS: { id: VehicleFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "bike", label: "Bike" },
  { id: "auto", label: "Auto" },
  { id: "car", label: "Car" },
];

export function VehicleTabs({
  value,
  counts,
  onChange,
}: {
  value: VehicleFilter;
  counts: Record<VehicleFilter, number>;
  onChange: (v: VehicleFilter) => void;
}) {
  return (
    <div role="tablist" aria-label="Vehicle type" className="flex gap-6 border-b border-border">
      {TABS.map((t) => {
        const selected = value === t.id;
        return (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={selected}
            onClick={() => onChange(t.id)}
            className={cn(
              "focus-ring relative -mb-px flex items-center gap-1.5 rounded-t-sm pb-3 text-sm font-medium transition-colors",
              selected ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            <span className={cn("tabular text-xs", selected ? "text-primary" : "text-faint")}>{counts[t.id]}</span>
            {selected && <motion.span layoutId="vehicle-tab" className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />}
          </button>
        );
      })}
    </div>
  );
}
