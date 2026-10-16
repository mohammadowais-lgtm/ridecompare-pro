import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpDown, LocateFixed } from "lucide-react";
import { Card } from "./ui-kit";
import { searchPlaces, type Place } from "@/lib/places";
import { cn } from "@/lib/utils";

export interface RoutePlace {
  name: string;
  lat: number;
  lng: number;
}

interface Props {
  pickup: RoutePlace | null;
  drop: RoutePlace | null;
  onPickup: (p: RoutePlace | null) => void;
  onDrop: (p: RoutePlace | null) => void;
  onSwap: () => void;
  onUseCurrent: () => void;
  locating: boolean;
  locationMessage: string | null;
}

export function RouteCard({ pickup, drop, onPickup, onDrop, onSwap, onUseCurrent, locating, locationMessage }: Props) {
  return (
    <Card className="relative">
      <div className="relative">
        <span aria-hidden className="absolute left-[23px] top-[34px] bottom-[34px] w-px bg-border-strong" />
        <PlaceRow
          label="Pickup"
          dot="pickup"
          value={pickup}
          onChange={onPickup}
          action={
            <button
              type="button"
              onClick={onUseCurrent}
              disabled={locating}
              className="focus-ring inline-flex items-center gap-1 rounded-sm text-xs font-medium text-primary hover:text-primary-hover disabled:opacity-60"
            >
              <LocateFixed className="h-3.5 w-3.5" aria-hidden />
              {locating ? "Locating" : "Use current location"}
            </button>
          }
        />
        <div className="ml-12 mr-14 h-px bg-border" />
        <PlaceRow label="Drop-off" dot="drop" value={drop} onChange={onDrop} />
      </div>
      <button
        type="button"
        onClick={onSwap}
        aria-label="Swap pickup and drop-off"
        className="focus-ring absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md border border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground"
      >
        <ArrowUpDown className="h-4 w-4" aria-hidden />
      </button>
      {locationMessage && (
        <p role="status" className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
          {locationMessage}
        </p>
      )}
    </Card>
  );
}

function PlaceRow({
  label,
  dot,
  value,
  onChange,
  action,
}: {
  label: string;
  dot: "pickup" | "drop";
  value: RoutePlace | null;
  onChange: (p: RoutePlace | null) => void;
  action?: React.ReactNode;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const [text, setText] = useState(value?.name ?? "");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => setText(value?.name ?? ""), [value]);

  useEffect(() => {
    const t = setTimeout(() => setQuery(text), 180);
    return () => clearTimeout(t);
  }, [text]);

  const results: Place[] = searchPlaces(query === value?.name ? "" : query);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) {
        setOpen(false);
        setText(value?.name ?? "");
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [value]);

  const choose = (p: Place) => {
    onChange({ name: p.name, lat: p.lat, lng: p.lng });
    setOpen(false);
  };

  return (
    <div ref={wrap} className="relative flex items-start gap-3 py-3 pl-4 pr-14">
      <span
        aria-hidden
        className={cn(
          "mt-[18px] h-2.5 w-2.5 shrink-0",
          dot === "pickup" ? "rounded-full border-2 border-primary bg-card" : "rounded-[2px] bg-foreground",
        )}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor={id} className="text-xs font-medium text-faint">
            {label}
          </label>
          {action}
        </div>
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder={dot === "pickup" ? "Where from?" : "Where to?"}
          value={text}
          onFocus={(e) => {
            setOpen(true);
            e.currentTarget.select();
          }}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActive((a) => Math.min(a + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter" && open && results[active]) {
              e.preventDefault();
              choose(results[active]);
            } else if (e.key === "Escape") {
              setOpen(false);
              setText(value?.name ?? "");
            }
          }}
          className="mt-0.5 w-full truncate rounded-sm bg-transparent text-[15px] font-medium text-foreground outline-none placeholder:font-normal placeholder:text-faint"
        />
      </div>
      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.ul
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute left-3 right-3 top-full z-20 -mt-1 max-h-72 overflow-auto rounded-lg border border-border bg-card p-1 shadow-[0_12px_32px_-16px_color-mix(in_oklab,var(--foreground)_30%,transparent)]"
          >
            {results.map((p, i) => (
              <li
                key={p.id}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(p)}
                className={cn("cursor-pointer rounded-md px-3 py-2", i === active && "bg-muted")}
              >
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.area}</p>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
