import { motion } from "framer-motion";
import { Plane, MapPin } from "lucide-react";
import type { RoutePlace } from "./RouteCard";
import { cn } from "@/lib/utils";

const QUICK: (RoutePlace & { short: string; airport?: boolean })[] = [
  { short: "Airport", name: "Kempegowda International Airport", lat: 13.1986, lng: 77.7066, airport: true },
  { short: "Indiranagar", name: "Indiranagar 100 Feet Road", lat: 12.9719, lng: 77.6412 },
  { short: "Koramangala", name: "Koramangala 5th Block", lat: 12.9352, lng: 77.6146 },
  { short: "Whitefield", name: "ITPL, Whitefield", lat: 12.9857, lng: 77.7366 },
  { short: "Electronic City", name: "Electronic City Phase 1", lat: 12.8452, lng: 77.6602 },
];

export function QuickDestinations({ current, onPick }: { current: RoutePlace | null; onPick: (p: RoutePlace) => void }) {
  return (
    <div className="mt-3">
      <p className="text-xs font-medium text-faint">Popular destinations</p>
      <div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1">
        {QUICK.map((q, i) => {
          const active = current?.lat === q.lat && current?.lng === q.lng;
          const Icon = q.airport ? Plane : MapPin;
          return (
            <motion.button
              key={q.short}
              type="button"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.1 + i * 0.045 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onPick({ name: q.name, lat: q.lat, lng: q.lng })}
              aria-pressed={active}
              className={cn(
                "focus-ring inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors",
                active ? "border-primary bg-primary-tint text-primary" : "border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {q.short}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
